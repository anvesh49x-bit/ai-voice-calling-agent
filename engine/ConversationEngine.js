import { MemoryStore } from "./cognition/MemoryStore.js";
import { planSpeech } from "./cognition/SpeechPlanner.js";
import { ResponseGenerator } from "./cognition/ResponseGenerator.js";
import { removeAIPatterns, dedupeRecentPhrases } from "./speech/AntiAIPatterns.js";
import { maybePrependFiller } from "./speech/FillerController.js";
import { optimizeForSpeech } from "./speech/SpeechOptimizer.js";
import { computeThinkingDelay, wait } from "./speech/ThinkingDelay.js";
import { buildVoiceMetadata } from "./speech/VoiceMetadata.js";
import { CartesiaAdapter } from "./output/CartesiaAdapter.js";
import { TwilioPlayback } from "./output/TwilioPlayback.js";
import { TurnManager } from "./TurnManager.js";
import { InterruptHandler } from "./interrupt/InterruptHandler.js";

/**
 * Human conversation engine — orchestrates the full pipeline:
 * Intent → Emotion → Memory → Speech Plan → Generate → Optimize → Delay → TTS
 */
export class ConversationEngine {
  constructor(twilioWs, getStreamSid, callId) {
    this.callId = callId;
    this.twilioWs = twilioWs;
    this.memory = new MemoryStore(callId);
    this.generator = new ResponseGenerator(callId);
    this.playback = new TwilioPlayback(twilioWs, getStreamSid);
    this.tts = new CartesiaAdapter();
    this.turnManager = new TurnManager();
    this.interruptHandler = new InterruptHandler(this.playback, this.memory, this.tts);
    this.currentAbort = null;
    this.greetingSent = false;

    this.turnManager.onFinalTurn = (text) => this.processTurn(text);
    this.turnManager.onBargeIn = (text) => {
      this.interruptHandler.handleBargeIn(text, this.currentAbort);
      this.turnManager.setAgentSpeaking(false);
    };
  }

  handleDeepgramMessage(data) {
    const transcript = data?.channel?.alternatives?.[0]?.transcript;
    if (!transcript) return;
    this.turnManager.handleTranscript(data, transcript);
  }

  async onCallStart() {
    if (this.greetingSent) return;
    this.greetingSent = true;

    await this.deliverProactiveGreeting();
  }

  async deliverProactiveGreeting() {
    const plan = planSpeech({
      stage: "GREETING",
      intent: "GREETING",
      action: "GREET_CUSTOMER",
      emotion: { primary: "neutral" },
      complexity: 0.2,
      leadScore: 0,
      language: "English",
      recentAcknowledgements: []
    });

    const segments = optimizeForSpeech(
      [{ text: "Hello, Arvex Technologies, this is Priya.", pause_ms: 200, stress: "Priya" }],
      buildVoiceMetadata(plan, [], null)
    );

    await this.speakSegments(segments, plan, "Hello, Arvex Technologies, this is Priya.");
  }

  async processTurn(userMessage) {
    await this.turnManager.runTurn(async () => {
      const pending = this.interruptHandler.consumePendingUtterance();
      const message = pending || userMessage;

      console.log("\n🗣️ USER:", message);

      const turnState = this.memory.processUserTurn(message);
      console.log("\n🧠 TURN STATE:", {
        intent: turnState.intent,
        emotion: turnState.customerEmotion,
        stage: turnState.conversationStage,
        action: turnState.action
      });

      const context = this.memory.getContextForGeneration();
      const speechPlan = planSpeech({
        stage: turnState.conversationStage,
        intent: turnState.intent,
        action: turnState.action,
        emotion: turnState.emotion,
        complexity: turnState.complexity,
        leadScore: turnState.leadScore,
        language: turnState.language,
        interruptedContext: context.interruptedContext,
        partialSpokenText: context.partialSpokenText,
        recentAcknowledgements: turnState.acknowledgementsUsed?.slice(-3) ?? []
      });

      // Production mode: keep only a tiny natural thinking pause
const delayMs = Math.min(
  computeThinkingDelay(
    speechPlan,
    turnState.complexity,
    message.length
  ),
  250
);

this.currentAbort = new AbortController();

try {
  if (delayMs > 0) {
    await wait(delayMs, this.currentAbort.signal);
  }
} catch {
  return;
}

      let generated;
      try {
        generated = await this.generator.generate(message, context, speechPlan);
      } catch (error) {
        console.error("❌ Generation error:", error.message);
        generated = {
          fullText: "Sorry, one moment... can you say that again?",
          segments: [{ text: "Sorry, one moment... can you say that again?", pause_ms: 0 }]
        };
      }

      if (this.currentAbort?.signal?.aborted) return;
      if (!this.memory.state) return;

      let fullText = removeAIPatterns(generated.fullText);
      fullText = dedupeRecentPhrases(fullText, this.memory.state.lastAgentPhrases);

      const fillerResult = maybePrependFiller(fullText, speechPlan, this.memory.state);
      fullText = fillerResult.text;

      let segments = generated.segments;
      if (fillerResult.used && segments.length) {
        segments = [
          { text: fillerResult.text, pause_ms: segments[0]?.pause_ms ?? 0, stress: null },
          ...segments.slice(1)
        ];
      } else {
        segments = segments.map((s, i) =>
          i === 0 ? { ...s, text: fullText.split(/(?<=[.!?])\s+/)[0] || fullText } : s
        );
        if (segments.length === 1) segments[0].text = fullText;
      }

      const voiceMetadata = buildVoiceMetadata(
        speechPlan,
        segments,
        context.customerName
      );

      segments = optimizeForSpeech(segments, voiceMetadata);

      console.log("\n🤖 AGENT:", fullText);
      console.log("🎭 SPEECH PLAN:", {
        tone: speechPlan.tone,
        speed: speechPlan.speakingSpeed,
        empathy: speechPlan.empathyLevel
      });

      await this.speakSegments(segments, speechPlan, fullText, fillerResult.used);

      this.interruptHandler.clear();
    });
  }

  async speakSegments(segments, speechPlan, fullText, acknowledgement = null) {
    const streamSid = this.playback.streamSid;
    if (!streamSid) {
      console.log("❌ No Stream SID for playback");
      return;
    }

    this.currentAbort = new AbortController();
    this.playback.beginSpeaking(this.currentAbort);
    this.turnManager.setAgentSpeaking(true);

    const voiceMetadata = buildVoiceMetadata(
      speechPlan,
      segments,
      this.memory.state.customerName
    );

    try {
      for (let i = 0; i < segments.length; i++) {
        if (this.currentAbort?.signal?.aborted) break;

        const segment = segments[i];
        await this.tts.speakSegment(
          this.twilioWs,
          streamSid,
          segment,
          voiceMetadata,
          this.currentAbort.signal
        );

        this.playback.markSegmentSpoken(segment.text, i);

        const pauseMs = segment.pause_ms ?? 0;
        if (pauseMs > 0 && !this.currentAbort?.signal?.aborted) {
          await wait(pauseMs, this.currentAbort.signal);
        }
      }

      if (!this.currentAbort?.signal?.aborted && this.memory.state) {
        this.memory.recordAgentSpeech(fullText, { acknowledgement });
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("❌ Playback error:");
console.error(error);
console.error(error.stack);
      }
    } finally {
      this.playback.endSpeaking();
      this.turnManager.setAgentSpeaking(false);
    }
  }

  cleanup() {
    this.currentAbort?.abort();
    this.turnManager.reset();
    this.tts.close();
    ResponseGenerator.clearSession(this.callId);
    const { state, transcript } = MemoryStore.endSession(this.callId);
    this.logCallSummary(state, transcript);
  }

  logCallSummary(state, transcript) {
    console.log("\n=========================================");
    console.log("📞 CALL TRANSCRIPT");
    console.log("=========================================\n");

    for (const chat of transcript) {
      console.log(`${chat.speaker}: ${chat.message}\n`);
    }

    console.log("=========================================");
    console.log("📋 LEAD SUMMARY");
    console.log("=========================================\n");
    console.log(`Name        : ${state?.customerName || "Unknown"}`);
    console.log(`Industry    : ${state?.industry || "Unknown"}`);
    console.log(`Requirement : ${state?.requirement || "Unknown"}`);
    console.log(`Language    : ${state?.language || "Unknown"}`);
    console.log(`Lead Score  : ${state?.leadScore || 0}`);
    console.log(`Status      : ${(state?.leadScore ?? 0) >= 70 ? "Interested" : "Needs Follow-up"}`);
    console.log("\n=========================================\n");
  }
}
