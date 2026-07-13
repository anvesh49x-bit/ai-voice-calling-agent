/**
 * HumanRhythmEngine
 * Manages natural conversational rhythm with dynamic pauses, pacing, and breathing patterns
 * Phase 2: Improve human-like conversation flow
 */

class HumanRhythmEngine {
  constructor() {
    // Pause categories
    this.pauseTypes = {
      THINKING: 'thinking',      // AI considering response (300-900ms)
      PROCESSING: 'processing',  // Understanding customer input (200-400ms)
      BREATH: 'breath',          // Natural breathing pause (100-300ms)
      EMPHASIS: 'emphasis',      // Pause for effect (150-250ms)
      LISTENING: 'listening',    // Listening cue before speaking (50-150ms)
      TRANSITION: 'transition',  // Topic transition (200-500ms)
    };

    // Customer personality profiles affect rhythm
    this.customerProfiles = {
      FAST_TALKER: {
        pauseMultiplier: 0.7,    // Shorter pauses
        responseDelay: 0.8,      // Quicker responses
        description: 'Speaks quickly, impatient',
      },
      SLOW_TALKER: {
        pauseMultiplier: 1.3,    // Longer pauses
        responseDelay: 1.2,      // More processing time
        description: 'Speaks slowly, thoughtful',
      },
      MODERATE: {
        pauseMultiplier: 1.0,    // Normal pauses
        responseDelay: 1.0,      // Normal timing
        description: 'Standard pace',
      },
    };

    // Emotional states affecting rhythm
    this.emotionalRhythm = {
      ANGRY: {
        pauseMultiplier: 0.6,
        responseDelay: 0.9,
        breathingPattern: 'rapid',
        acknowledgementFrequency: 0.8, // More validating
      },
      CONFUSED: {
        pauseMultiplier: 1.4,
        responseDelay: 1.3,
        breathingPattern: 'measured',
        acknowledgementFrequency: 1.2,
      },
      EXCITED: {
        pauseMultiplier: 0.8,
        responseDelay: 0.9,
        breathingPattern: 'enthusiastic',
        acknowledgementFrequency: 0.9,
      },
      SKEPTICAL: {
        pauseMultiplier: 1.2,
        responseDelay: 1.1,
        breathingPattern: 'cautious',
        acknowledgementFrequency: 1.3,
      },
      FRIENDLY: {
        pauseMultiplier: 1.0,
        responseDelay: 1.0,
        breathingPattern: 'relaxed',
        acknowledgementFrequency: 1.0,
      },
      BUSY: {
        pauseMultiplier: 0.5,
        responseDelay: 0.7,
        breathingPattern: 'rapid',
        acknowledgementFrequency: 0.6,
      },
    };

    // Conversation stage affects pacing
    this.stageRhythm = {
      GREETING: { pauseMultiplier: 1.1, responseDelay: 1.2 },
      DISCOVERING: { pauseMultiplier: 1.0, responseDelay: 1.0 },
      EXPLAINING: { pauseMultiplier: 1.2, responseDelay: 1.1 },
      DISCUSS_PRICING: { pauseMultiplier: 1.3, responseDelay: 1.2 },
      BOOK_MEETING: { pauseMultiplier: 1.1, responseDelay: 1.0 },
      CLOSING: { pauseMultiplier: 1.0, responseDelay: 0.9 },
    };

    this.sessionRhythms = new Map(); // Track per-session rhythm patterns
  }

  /**
   * Detect customer's natural speaking pace
   */
  analyzeCustomerPace(transcript, previousTranscripts = []) {
    if (!transcript || !previousTranscripts || previousTranscripts.length === 0) {
      return this.customerProfiles.MODERATE;
    }

    // Calculate average words per second
    const recentTranscripts = previousTranscripts.slice(-5);
    const wordCounts = recentTranscripts.map(t => t.split(/\s+/).length);
    const avgWordCount = wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length;

    // Estimate speaking time - rough heuristic based on typical speech rate
    // Average: 120-150 words/minute = 2-2.5 words/second
    if (avgWordCount > 8) {
      return this.customerProfiles.FAST_TALKER;
    } else if (avgWordCount < 4) {
      return this.customerProfiles.SLOW_TALKER;
    }

    return this.customerProfiles.MODERATE;
  }

  /**
   * Calculate optimal thinking pause duration
   */
  calculateThinkingPause(inputComplexity, emotion, customerPace, stage) {
    // Base thinking time based on complexity
    let baseThinking = {
      simple: 300,      // 1-3 words
      moderate: 500,    // 4-10 words
      complex: 700,     // 11-20 words
      veryComplex: 900, // 20+ words
    }[inputComplexity] || 500;

    // Apply emotional multiplier
    const emotionalMultiplier = this.emotionalRhythm[emotion]?.pauseMultiplier || 1.0;

    // Apply customer pace multiplier
    const customerPaceMultiplier = (typeof customerPace === 'object')
      ? customerPace.pauseMultiplier
      : 1.0;

    // Apply stage multiplier
    const stageMultiplier = this.stageRhythm[stage]?.pauseMultiplier || 1.0;

    // Add some natural variation (±15%)
    const variation = (Math.random() - 0.5) * 300;

    const totalPause = Math.max(
      200,
      Math.min(
        1200,
        baseThinking * emotionalMultiplier * customerPaceMultiplier * stageMultiplier + variation
      )
    );

    return Math.round(totalPause);
  }

  /**
   * Calculate response start delay (like human thinking before speaking)
   */
  calculateResponseDelay(inputComplexity, emotion, customerPace, stage) {
    let baseDelay = {
      simple: 100,
      moderate: 200,
      complex: 300,
      veryComplex: 400,
    }[inputComplexity] || 150;

    const emotionalMultiplier = this.emotionalRhythm[emotion]?.responseDelay || 1.0;
    const customerPaceMultiplier = (typeof customerPace === 'object')
      ? customerPace.responseDelay
      : 1.0;
    const stageMultiplier = this.stageRhythm[stage]?.responseDelay || 1.0;

    const totalDelay = Math.max(
      50,
      Math.min(
        600,
        baseDelay * emotionalMultiplier * customerPaceMultiplier * stageMultiplier
      )
    );

    return Math.round(totalDelay);
  }

  /**
   * Generate natural breathing patterns in longer responses
   */
  generateBreathingPoints(responseText, emotion = 'FRIENDLY') {
    // Break text into sentences
    const sentences = responseText.match(/[^.!?]+[.!?]+/g) || [];

    if (sentences.length === 0) return responseText;

    const pattern = this.emotionalRhythm[emotion]?.breathingPattern || 'relaxed';

    // Insert micro-pauses for breathing
    let breathingText = sentences.map((sentence, idx) => {
      if (idx === sentences.length - 1) return sentence; // No pause after last sentence

      // Breathing pause duration based on pattern
      let pauseMs = 200;
      if (pattern === 'rapid') pauseMs = 100;
      if (pattern === 'measured') pauseMs = 250;
      if (pattern === 'enthusiastic') pauseMs = 150;
      if (pattern === 'cautious') pauseMs = 300;

      // Mark pause in text (will be handled by TTS)
      return sentence + ` [BREATH:${pauseMs}]`;
    }).join(' ');

    return breathingText;
  }

  /**
   * Detect if customer is being rushed/overwhelmed
   */
  detectCustomerRushState(conversationHistory = [], lastThinkingTime = 0) {
    if (conversationHistory.length < 2) return false;

    // Check if AI responses are too fast (less than 500ms thinking)
    if (lastThinkingTime < 500 && conversationHistory.length > 3) {
      return true;
    }

    // Check if customer inputs are getting shorter (sign of frustration/rushing)
    const recentCustomerInputs = conversationHistory
      .filter(entry => entry.role === 'customer')
      .slice(-5)
      .map(entry => entry.content.split(/\s+/).length);

    if (recentCustomerInputs.length >= 3) {
      const avgLength = recentCustomerInputs.reduce((a, b) => a + b) / recentCustomerInputs.length;
      if (avgLength < 3) return true; // Very short responses indicate frustration
    }

    return false;
  }

  /**
   * Adjust rhythm if customer seems rushed
   */
  getAdjustedRhythm(isCustomerRushed, baseThinkingPause, baseResponseDelay) {
    if (!isCustomerRushed) {
      return { thinking: baseThinkingPause, response: baseResponseDelay };
    }

    // When customer is rushed, be faster
    return {
      thinking: Math.max(200, baseThinkingPause * 0.6),
      response: Math.max(50, baseResponseDelay * 0.6),
    };
  }

  /**
   * Calculate optimal silence threshold for turn-taking
   */
  calculateOptimalSilenceThreshold(emotion, stage, customerPace) {
    // Base silence threshold
    let baseThreshold = 700;

    // Adjust by emotion
    const emotionalMultiplier = this.emotionalRhythm[emotion]?.pauseMultiplier || 1.0;

    // Adjust by stage
    const stageMultiplier = this.stageRhythm[stage]?.pauseMultiplier || 1.0;

    // Adjust by customer pace
    const customerPaceMultiplier = (typeof customerPace === 'object')
      ? customerPace.pauseMultiplier
      : 1.0;

    const optimal = Math.round(baseThreshold * emotionalMultiplier * stageMultiplier * customerPaceMultiplier);

    return Math.max(400, Math.min(1200, optimal));
  }

  /**
   * Generate acknowledgement pauses for listening behavior
   */
  generateAcknowledgementPause(emotion, stage) {
    const frequency = this.emotionalRhythm[emotion]?.acknowledgementFrequency || 1.0;
    const shouldAcknowledge = Math.random() < (0.4 * frequency); // 40% base frequency

    if (shouldAcknowledge) {
      return {
        type: 'listening',
        duration: 50 + Math.random() * 100,
        acknowledgement: this.getListeningCue(emotion),
      };
    }

    return null;
  }

  /**
   * Get natural listening cues
   */
  getListeningCue(emotion = 'FRIENDLY') {
    const cues = {
      ANGRY: ['I hear you,', 'I understand,', 'Got it,', 'Yes,'],
      CONFUSED: ['I see,', 'Okay,', 'Right,', 'I understand,'],
      EXCITED: ['Absolutely,', 'Great,', 'Yes,', 'That\'s great,'],
      SKEPTICAL: ['I understand,', 'Fair point,', 'Got it,', 'That makes sense,'],
      FRIENDLY: ['Right,', 'Got it,', 'I see,', 'Yeah,', 'Sure,'],
      BUSY: ['Got it,', 'Sure,', 'Understood,', 'Yes,'],
    };

    const emotionCues = cues[emotion] || cues.FRIENDLY;
    return emotionCues[Math.floor(Math.random() * emotionCues.length)];
  }

  /**
   * Store session rhythm for consistency
   */
  storeSessionRhythm(sessionId, customerProfile, emotion, stage, metrics = {}) {
    this.sessionRhythms.set(sessionId, {
      customerProfile,
      emotion,
      stage,
      thinkingPause: metrics.thinkingPause || 500,
      responseDelay: metrics.responseDelay || 200,
      silenceThreshold: metrics.silenceThreshold || 700,
      lastUpdated: Date.now(),
    });
  }

  /**
   * Retrieve stored rhythm for session
   */
  getSessionRhythm(sessionId) {
    return this.sessionRhythms.get(sessionId) || null;
  }

  /**
   * Clear old session rhythms (cleanup)
   */
  clearOldSessions(maxAgeMins = 60) {
    const now = Date.now();
    const maxAge = maxAgeMins * 60 * 1000;

    for (const [sessionId, rhythm] of this.sessionRhythms.entries()) {
      if (now - rhythm.lastUpdated > maxAge) {
        this.sessionRhythms.delete(sessionId);
      }
    }
  }

  /**
   * Get comprehensive rhythm profile
   */
  getRhythmProfile(sessionId, emotion, stage, customerPace, inputComplexity, conversationHistory) {
    return {
      sessionId,
      thinkingPause: this.calculateThinkingPause(inputComplexity, emotion, customerPace, stage),
      responseDelay: this.calculateResponseDelay(inputComplexity, emotion, customerPace, stage),
      silenceThreshold: this.calculateOptimalSilenceThreshold(emotion, stage, customerPace),
      acknowledgementPause: this.generateAcknowledgementPause(emotion, stage),
      isCustomerRushed: this.detectCustomerRushState(conversationHistory),
      breathingPattern: this.emotionalRhythm[emotion]?.breathingPattern || 'relaxed',
      timestamp: Date.now(),
    };
  }
}

export default HumanRhythmEngine;
