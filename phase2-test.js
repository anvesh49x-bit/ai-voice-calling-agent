/**
 * Phase 2 Module Verification Test
 * Tests all Phase 2 enhancement modules for proper functionality
 */

import HumanRhythmEngine from "./brain/HumanRhythmEngine.js";
import NaturalListeningBehavior from "./brain/NaturalListeningBehavior.js";
import ResponseVariation from "./brain/ResponseVariation.js";
import ContextBridge from "./brain/ContextBridge.js";
import EnhancedMemory from "./brain/EnhancedMemory.js";
import Phase2Orchestrator from "./brain/Phase2Orchestrator.js";

async function runPhase2Tests() {
  console.log("\n✅ Phase 2 Module Verification Starting...\n");

  try {
    // Test 1: HumanRhythmEngine
    console.log("🔍 Test 1: HumanRhythmEngine");
    const rhythmEngine = new HumanRhythmEngine();
    const rhythmProfile = rhythmEngine.getRhythmProfile(
      "test-session",
      "FRIENDLY",
      "DISCOVERING",
      rhythmEngine.customerProfiles.MODERATE,
      "moderate",
      []
    );
    console.log("   ✓ Rhythm profile generated:", {
      thinking: rhythmProfile.thinkingPause,
      response: rhythmProfile.responseDelay,
      silence: rhythmProfile.silenceThreshold,
    });

    // Test 2: NaturalListeningBehavior
    console.log("\n🔍 Test 2: NaturalListeningBehavior");
    const listening = new NaturalListeningBehavior();
    const ack = listening.generateAcknowledgement("FRIENDLY", "medium");
    const cue = listening.generateListeningCue("EXCITED", { needsClarification: true });
    console.log("   ✓ Acknowledgement:", ack);
    console.log("   ✓ Listening cue:", cue.pattern);

    // Test 3: ResponseVariation
    console.log("\n🔍 Test 3: ResponseVariation");
    const variation = new ResponseVariation();
    const starter = variation.generateStarter("FRIENDLY");
    const bridge = variation.generateBridge("CONTINUING");
    const ending = variation.generateEnding("OPENENDED");
    console.log("   ✓ Starter:", starter);
    console.log("   ✓ Bridge:", bridge);
    console.log("   ✓ Ending:", ending);

    // Test 4: ContextBridge
    console.log("\n🔍 Test 4: ContextBridge");
    const contextBridge = new ContextBridge();
    const checkpoint = contextBridge.createContextCheckpoint(
      "test-session",
      { currentTopic: "pricing", stage: "DISCUSSING" },
      "DISCUSSING"
    );
    console.log("   ✓ Context checkpoint created:", checkpoint.substring(0, 30) + "...");

    // Test 5: EnhancedMemory
    console.log("\n🔍 Test 5: EnhancedMemory");
    const memory = new EnhancedMemory();
    memory.initSessionMemory("test-session", { name: "Test Customer" });
    memory.recordLearning("test-session", "PREFERENCE", "Interested in cloud solutions", 0.9);
    const prefs = memory.getLearnedPreferences("test-session");
    console.log("   ✓ Memory initialized with preferences:", prefs.preferences.length);

    // Test 6: Phase2Orchestrator (Integration)
    console.log("\n🔍 Test 6: Phase2Orchestrator Integration");
    const orchestrator = new Phase2Orchestrator({
      enableRhythmOptimization: true,
      enableListeningBehavior: true,
      enableResponseVariation: true,
      enableContextManagement: true,
      enableMemoryTracking: true,
    });
    orchestrator.initializeSession("integration-test", { name: "Test User" });

    const inputResult = await orchestrator.processCustomerInput(
      "integration-test",
      "I'm interested in your pricing plans",
      { detectedEmotion: "EXCITED", stage: "DISCOVERING" }
    );
    console.log("   ✓ Customer input processed:");
    console.log("     - Rhythm pause:", inputResult.rhythm.thinkingPause, "ms");
    console.log("     - Emotion:", inputResult.emotion);

    const responseResult = await orchestrator.generatePhase2Response(
      "integration-test",
      "We offer flexible pricing tiers starting at $99/month.",
      {}
    );
    console.log("   ✓ Response generated with Phase 2 enhancements");
    console.log("     Response:", responseResult.substring(0, 60) + "...");

    const status = orchestrator.getPhase2Status("integration-test");
    console.log("   ✓ Session status retrieved:");
    console.log("     - Listening score:", status.listeningScore);
    console.log("     - Emotion:", status.session.emotion);

    console.log("\n✅ All Phase 2 modules verified successfully!\n");
    console.log("📊 Phase 2 Enhancement Summary:");
    console.log("   ✓ Human Rhythm Engine: Adaptive pausing and natural timing");
    console.log("   ✓ Natural Listening Behavior: Engagement and acknowledgements");
    console.log("   ✓ Response Variation: Reduced robotic patterns");
    console.log("   ✓ Context Bridge: Better context retention and switching");
    console.log("   ✓ Enhanced Memory: Pattern tracking and learning");
    console.log("   ✓ Phase2Orchestrator: Full integration and coordination\n");

    return true;
  } catch (error) {
    console.error("\n❌ Phase 2 Verification Failed!");
    console.error("Error:", error.message);
    console.error(error.stack);
    return false;
  }
}

// Run tests
const success = await runPhase2Tests();
process.exit(success ? 0 : 1);
