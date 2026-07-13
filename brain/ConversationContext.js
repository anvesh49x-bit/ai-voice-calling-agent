export default class ConversationContext {

    constructor() {
        this.reset();
    }

    reset() {
        this.currentSpeaker = "none";

        this.customerSpeaking = false;
        this.aiSpeaking = false;
        this.aiThinking = false;

        this.responsePending = false;

        this.currentTopic = null;
        this.currentObjective = null;

        this.lastTranscript = "";
        this.lastAiResponse = "";

        this.lastIntent = null;
        this.lastEmotion = null;

        this.silenceStartedAt = null;
        this.customerStartedSpeakingAt = null;
        this.aiStartedSpeakingAt = null;

        this.interruptionCount = 0;
        this.turnNumber = 0;

        this.metadata = {};
    }

    customerStartedSpeaking() {
        this.currentSpeaker = "customer";
        this.customerSpeaking = true;
        this.customerStartedSpeakingAt = Date.now();
    }

    customerStoppedSpeaking() {
        this.customerSpeaking = false;
        this.silenceStartedAt = Date.now();
    }

    aiStartedSpeaking() {
        this.currentSpeaker = "ai";
        this.aiSpeaking = true;
        this.aiThinking = false;
        this.aiStartedSpeakingAt = Date.now();
    }

    aiStoppedSpeaking() {
        this.aiSpeaking = false;
        this.currentSpeaker = "none";
    }

    startThinking() {
        this.aiThinking = true;
    }

    stopThinking() {
        this.aiThinking = false;
    }

    setTranscript(text) {
        this.lastTranscript = text;
    }

    setAiResponse(text) {
        this.lastAiResponse = text;
    }

    setIntent(intent) {
        this.lastIntent = intent;
    }

    setEmotion(emotion) {
        this.lastEmotion = emotion;
    }

    setTopic(topic) {
        this.currentTopic = topic;
    }

    setObjective(objective) {
        this.currentObjective = objective;
    }

    nextTurn() {
        this.turnNumber += 1;
    }

    incrementInterruptions() {
        this.interruptionCount += 1;
    }

    toJSON() {
        return {
            currentSpeaker: this.currentSpeaker,
            customerSpeaking: this.customerSpeaking,
            aiSpeaking: this.aiSpeaking,
            aiThinking: this.aiThinking,
            responsePending: this.responsePending,
            currentTopic: this.currentTopic,
            currentObjective: this.currentObjective,
            lastTranscript: this.lastTranscript,
            lastAiResponse: this.lastAiResponse,
            lastIntent: this.lastIntent,
            lastEmotion: this.lastEmotion,
            silenceStartedAt: this.silenceStartedAt,
            customerStartedSpeakingAt: this.customerStartedSpeakingAt,
            aiStartedSpeakingAt: this.aiStartedSpeakingAt,
            interruptionCount: this.interruptionCount,
            turnNumber: this.turnNumber,
            metadata: this.metadata
        };
    }
}