/**
 * Phase2Orchestrator
 * Integrates all Phase 2 enhancement modules into the conversation flow
 * Phase 2: Coordinates improved human conversation quality
 */

import HumanRhythmEngine from "../brain/HumanRhythmEngine.js";
import NaturalListeningBehavior from "../brain/NaturalListeningBehavior.js";
import ResponseVariation from "../brain/ResponseVariation.js";
import ContextBridge from "../brain/ContextBridge.js";
import EnhancedMemory from "../brain/EnhancedMemory.js";

export class Phase2Orchestrator {
  constructor(config = {}) {
    // Initialize all Phase 2 modules
    this.rhythmEngine = new HumanRhythmEngine();
    this.listeningBehavior = new NaturalListeningBehavior();
    this.responseVariation = new ResponseVariation();
    this.contextBridge = new ContextBridge();
    this.enhancedMemory = new EnhancedMemory();

    this.sessionPhase2Data = new Map();

    this.config = {
      enableRhythmOptimization: config.enableRhythmOptimization !== false,
      enableListeningBehavior: config.enableListeningBehavior !== false,
      enableResponseVariation: config.enableResponseVariation !== false,
      enableContextManagement: config.enableContextManagement !== false,
      enableMemoryTracking: config.enableMemoryTracking !== false,
      ...config,
    };
  }

  /**
   * Initialize Phase 2 for a new session
   */
  initializeSession(sessionId, customerProfile = {}) {
    const phase2Session = {
      sessionId,
      customerProfile,
      initialized: Date.now(),
      rhythm: this.rhythmEngine.getRhythmProfile(
        sessionId,
        'FRIENDLY',
        'GREETING',
        'MODERATE',
        'simple',
        []
      ),
      emotion: 'FRIENDLY',
      stage: 'GREETING',
      previousResponses: [],
      conversationHistory: [],
      contextStack: [],
    };

    this.sessionPhase2Data.set(sessionId, phase2Session);
    this.enhancedMemory.initSessionMemory(sessionId, customerProfile);

    return phase2Session;
  }

  /**
   * Process customer input with Phase 2 enhancements
   */
  async processCustomerInput(sessionId, transcript, currentContext) {
    const session = this.sessionPhase2Data.get(sessionId);
    if (!session) return null;

    // Update session context
    session.emotion = currentContext.detectedEmotion || session.emotion;
    session.stage = currentContext.stage || session.stage;
    session.conversationHistory.push({
      role: 'customer',
      content: transcript,
      timestamp: Date.now(),
    });

    // Phase 2: Detect context boundaries
    if (session.contextStack.length > 0) {
      const boundary = this.contextBridge.detectContextBoundary(
        sessionId,
        transcript,
        session.contextStack[session.contextStack.length - 1],
        currentContext
      );

      if (boundary.detected) {
        console.log('[Phase2] Context boundary detected:', boundary.type);
      }
    }

    // Phase 2: Record learnings
    this.recordCustomerLearnings(sessionId, transcript, currentContext);

    // Phase 2: Update rhythm based on input
    const inputComplexity = this.analyzeInputComplexity(transcript);
    const customerPace = this.rhythmEngine.analyzeCustomerPace(
      transcript,
      session.conversationHistory.map(c => c.content).slice(-10)
    );

    session.rhythm = this.rhythmEngine.getRhythmProfile(
      sessionId,
      session.emotion,
      session.stage,
      customerPace,
      inputComplexity,
      session.conversationHistory
    );

    return {
      rhythm: session.rhythm,
      emotion: session.emotion,
      stage: session.stage,
      learnings: this.enhancedMemory.getLearnedPreferences(sessionId),
    };
  }

  /**
   * Generate response with Phase 2 enhancements
   */
  async generatePhase2Response(sessionId, baseResponse, context = {}) {
    const session = this.sessionPhase2Data.get(sessionId);
    if (!session) return baseResponse;

    let response = baseResponse;

    // Phase 2: Check if response is robotic
    if (this.config.enableResponseVariation) {
      if (this.responseVariation.detectRoboticPatterns(response)) {
        response = this.responseVariation.naturalizeResponse(response, session.emotion);
      }

      // Track response for variation
      this.responseVariation.trackResponseVariation(sessionId, response);
    }

    // Phase 2: Add natural listening cues if appropriate
    if (this.config.enableListeningBehavior) {
      const shouldAcknowledge = this.listeningBehavior.shouldAcknowledge(
        session.emotion,
        session.stage,
        session.conversationHistory.length % 3
      );

      if (shouldAcknowledge && !response.startsWith('I ')) {
        const acknowledgement = this.listeningBehavior.generateAcknowledgement(
          session.emotion,
          'medium'
        );
        response = acknowledgement + ' ' + response;
      }
    }

    // Phase 2: Apply breathing patterns for longer responses
    if (this.config.enableRhythmOptimization && response.length > 200) {
      response = this.rhythmEngine.generateBreathingPoints(response, session.emotion);
    }

    // Store in conversation history
    session.conversationHistory.push({
      role: 'assistant',
      content: response,
      timestamp: Date.now(),
    });
    session.previousResponses.push(response);

    return response;
  }

  /**
   * Get optimal pause duration before response
   */
  getOptimalPauseDuration(sessionId) {
    const session = this.sessionPhase2Data.get(sessionId);
    if (!session) return 500;

    return session.rhythm.thinkingPause;
  }

  /**
   * Get optimal response start delay
   */
  getResponseStartDelay(sessionId) {
    const session = this.sessionPhase2Data.get(sessionId);
    if (!session) return 200;

    return session.rhythm.responseDelay;
  }

  /**
   * Get optimal silence threshold for turn-taking
   */
  getOptimalSilenceThreshold(sessionId) {
    const session = this.sessionPhase2Data.get(sessionId);
    if (!session) return 700;

    return session.rhythm.silenceThreshold;
  }

  /**
   * Record customer learnings from interaction
   */
  recordCustomerLearnings(sessionId, transcript, context) {
    if (!this.config.enableMemoryTracking) return;

    // Extract learnings
    if (/price|cost|budget|expensive/i.test(transcript)) {
      this.enhancedMemory.recordLearning(sessionId, 'BUDGET', transcript, 0.7);
    }

    if (/when|timeline|soon|schedule/i.test(transcript)) {
      this.enhancedMemory.recordLearning(sessionId, 'TIMELINE', transcript, 0.7);
    }

    if (/need|must|require|important/i.test(transcript)) {
      this.enhancedMemory.recordLearning(sessionId, 'MOTIVATION', transcript, 0.8);
    }

    // Record interaction
    this.enhancedMemory.recordInteraction(sessionId, '', transcript, 'neutral');
  }

  /**
   * Handle interruption with Phase 2 awareness
   */
  handleInterruption(sessionId, emotion) {
    const session = this.sessionPhase2Data.get(sessionId);
    if (!session) return;

    session.emotion = emotion;

    // Record emotion shift
    this.enhancedMemory.recordEmotionShift(sessionId, emotion, 0.8, 'interruption');

    // Update listening stance
    const stance = this.listeningBehavior.getListeningStance(emotion, session.stage);
    console.log('[Phase2] Listening stance updated:', stance);
  }

  /**
   * Update conversation stage
   */
  updateStage(sessionId, newStage) {
    const session = this.sessionPhase2Data.get(sessionId);
    if (!session) return;

    const previousStage = session.stage;
    session.stage = newStage;

    // Create context checkpoint on stage change
    if (this.config.enableContextManagement) {
      this.contextBridge.createContextCheckpoint(
        sessionId,
        {
          currentTopic: previousStage,
          stage: newStage,
          ...session,
        },
        newStage,
        'STAGE_TRANSITION'
      );
    }

    console.log(`[Phase2] Stage updated: ${previousStage} -> ${newStage}`);
  }

  /**
   * Analyze input complexity
   */
  analyzeInputComplexity(transcript) {
    const words = transcript.split(/\s+/).length;
    if (words <= 3) return 'simple';
    if (words <= 10) return 'moderate';
    if (words <= 20) return 'complex';
    return 'veryComplex';
  }

  /**
   * Get session summary for end of call
   */
  getSessionSummary(sessionId) {
    const session = this.sessionPhase2Data.get(sessionId);
    const memorySummary = this.enhancedMemory.getConversationSummary(sessionId);
    const listeningBalance = this.listeningBehavior.getConversationBalance(sessionId);

    return {
      sessionId,
      duration: Date.now() - session.initialized,
      emotion: session.emotion,
      stage: session.stage,
      turnCount: session.conversationHistory.length,
      memorySummary,
      listeningBalance,
      responseVariationCount: session.previousResponses.length,
    };
  }

  /**
   * Clean up old sessions
   */
  clearOldSessions(maxAgeMins = 60) {
    const now = Date.now();
    const maxAge = maxAgeMins * 60 * 1000;

    for (const [sessionId, session] of this.sessionPhase2Data.entries()) {
      if (now - session.initialized > maxAge) {
        this.sessionPhase2Data.delete(sessionId);
      }
    }

    // Clean up module-level session data
    this.rhythmEngine.clearOldSessions(maxAgeMins);
    this.listeningBehavior.clearOldSessions(maxAgeMins);
    this.responseVariation.clearOldSessions(maxAgeMins);
    this.contextBridge.clearOldSessions(maxAgeMins);
    this.enhancedMemory.clearOldSessions(maxAgeMins);
  }

  /**
   * Get full Phase 2 status for debugging
   */
  getPhase2Status(sessionId) {
    const session = this.sessionPhase2Data.get(sessionId);
    if (!session) return null;

    return {
      session,
      rhythmProfile: session.rhythm,
      listeningScore: this.listeningBehavior.getListeningScore(sessionId),
      emotionTrend: this.enhancedMemory.getEmotionTrend(sessionId),
      memoryPreferences: this.enhancedMemory.getLearnedPreferences(sessionId),
      contextSummary: this.contextBridge.buildContextSummary(sessionId),
    };
  }
}

export default Phase2Orchestrator;
