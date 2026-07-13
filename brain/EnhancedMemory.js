/**
 * EnhancedMemory
 * Advanced memory system with pattern tracking and learning
 * Phase 2: Better memory and pattern retention
 */

class EnhancedMemory {
  constructor() {
    this.sessionMemories = new Map();      // Per-session memory stores
    this.patternDatabase = new Map();       // Track conversation patterns
    this.customerLearnings = new Map();     // What we learned about this customer
    this.objectionPatterns = new Map();     // Track objection handling patterns
  }

  /**
   * Initialize session memory with learning capabilities
   */
  initSessionMemory(sessionId, customerProfile = {}) {
    const memory = {
      sessionId,
      customerProfile,
      learnings: {
        preferences: new Set(),
        concerns: new Set(),
        motivations: new Set(),
        communication_style: null,
        decision_process: null,
        timeline_indicators: [],
        budget_indicators: [],
      },
      patterns: {
        objectionSequence: [],
        questionTypes: [],
        emotionTrajectory: [],
        responseTiming: [],
      },
      interactions: {
        questionsAsked: [],
        answersGiven: [],
        agreeementsReached: [],
        disagreementsHandled: [],
      },
      metadata: {
        createdAt: Date.now(),
        turnCount: 0,
        topicsDiscussed: [],
      },
    };

    this.sessionMemories.set(sessionId, memory);
    return memory;
  }

  /**
   * Record customer learning
   */
  recordLearning(sessionId, learningType, content, confidence = 0.8) {
    const memory = this.sessionMemories.get(sessionId);
    if (!memory) return null;

    // Categorize learning
    switch (learningType) {
      case 'PREFERENCE':
        memory.learnings.preferences.add({
          content,
          confidence,
          timestamp: Date.now(),
        });
        break;

      case 'CONCERN':
        memory.learnings.concerns.add({
          content,
          confidence,
          timestamp: Date.now(),
        });
        break;

      case 'MOTIVATION':
        memory.learnings.motivations.add({
          content,
          confidence,
          timestamp: Date.now(),
        });
        break;

      case 'COMMUNICATION_STYLE':
        memory.learnings.communication_style = {
          style: content,
          confidence,
          timestamp: Date.now(),
        };
        break;

      case 'DECISION_PROCESS':
        memory.learnings.decision_process = {
          process: content,
          confidence,
          timestamp: Date.now(),
        };
        break;

      case 'TIMELINE':
        memory.learnings.timeline_indicators.push({
          indicator: content,
          confidence,
          timestamp: Date.now(),
        });
        break;

      case 'BUDGET':
        memory.learnings.budget_indicators.push({
          indicator: content,
          confidence,
          timestamp: Date.now(),
        });
        break;
    }

    return true;
  }

  /**
   * Record objection and resolution pattern
   */
  recordObjection(sessionId, objectionType, handling, resolved, resolution = null) {
    const memory = this.sessionMemories.get(sessionId);
    if (!memory) return null;

    const objectionRecord = {
      type: objectionType,
      handling,
      resolved,
      resolution,
      timestamp: Date.now(),
    };

    memory.patterns.objectionSequence.push(objectionRecord);

    // Track patterns for future calls
    if (!this.objectionPatterns.has(objectionType)) {
      this.objectionPatterns.set(objectionType, {
        count: 0,
        resolutions: [],
        successRate: 0,
      });
    }

    const pattern = this.objectionPatterns.get(objectionType);
    pattern.count++;
    if (resolved) {
      pattern.resolutions.push(resolution);
      pattern.successRate = (pattern.resolutions.length / pattern.count);
    }

    return objectionRecord;
  }

  /**
   * Track emotion trajectory
   */
  recordEmotionShift(sessionId, emotion, intensity = 0.5, context = '') {
    const memory = this.sessionMemories.get(sessionId);
    if (!memory) return null;

    memory.patterns.emotionTrajectory.push({
      emotion,
      intensity,
      context,
      timestamp: Date.now(),
      turnNumber: memory.metadata.turnCount,
    });

    return true;
  }

  /**
   * Detect emotional trends
   */
  getEmotionTrend(sessionId) {
    const memory = this.sessionMemories.get(sessionId);
    if (!memory || memory.patterns.emotionTrajectory.length < 2) return null;

    const recent = memory.patterns.emotionTrajectory.slice(-5);
    const firstEmotion = recent[0].emotion;
    const lastEmotion = recent[recent.length - 1].emotion;

    // Calculate trend
    const intensities = recent.map(e => e.intensity);
    const avgIntensity = intensities.reduce((a, b) => a + b) / intensities.length;
    const intensityTrend = intensities[intensities.length - 1] > intensities[0] ? 'increasing' : 'decreasing';

    return {
      startEmotion: firstEmotion,
      endEmotion: lastEmotion,
      emotionChanged: firstEmotion !== lastEmotion,
      currentIntensity: intensities[intensities.length - 1],
      averageIntensity: avgIntensity,
      trend: intensityTrend,
      turnsCovered: recent.length,
    };
  }

  /**
   * Get learned preferences for personalization
   */
  getLearnedPreferences(sessionId) {
    const memory = this.sessionMemories.get(sessionId);
    if (!memory) return {};

    return {
      preferences: Array.from(memory.learnings.preferences),
      concerns: Array.from(memory.learnings.concerns),
      motivations: Array.from(memory.learnings.motivations),
      communicationStyle: memory.learnings.communication_style,
      decisionProcess: memory.learnings.decision_process,
    };
  }

  /**
   * Get best objection handling strategy for this customer type
   */
  getBestObjectionStrategy(sessionId, objectionType) {
    const pattern = this.objectionPatterns.get(objectionType);
    if (!pattern || pattern.resolutions.length === 0) {
      return null;
    }

    // Return most successful resolution
    const resolution = pattern.resolutions[Math.floor(Math.random() * pattern.resolutions.length)];
    return {
      strategy: resolution,
      successRate: pattern.successRate,
      attemptCount: pattern.count,
    };
  }

  /**
   * Record question-answer pair for pattern learning
   */
  recordInteraction(sessionId, questionAsked, answerGiven, customerReaction = 'neutral') {
    const memory = this.sessionMemories.get(sessionId);
    if (!memory) return null;

    memory.interactions.questionsAsked.push({
      question: questionAsked,
      timestamp: Date.now(),
    });

    memory.interactions.answersGiven.push({
      answer: answerGiven,
      reaction: customerReaction,
      timestamp: Date.now(),
    });

    // Learn from reaction
    if (customerReaction === 'positive' || customerReaction === 'agreement') {
      memory.interactions.agreeementsReached.push({
        topic: this.extractTopic(questionAsked),
        timestamp: Date.now(),
      });
    } else if (customerReaction === 'negative' || customerReaction === 'objection') {
      memory.interactions.disagreementsHandled.push({
        topic: this.extractTopic(questionAsked),
        objection: answerGiven,
        timestamp: Date.now(),
      });
    }

    return true;
  }

  /**
   * Extract topic from question
   */
  extractTopic(text) {
    const topicPatterns = {
      pricing: /price|cost|budget|fee|expensive/i,
      timeline: /when|timeline|soon|schedule|time/i,
      features: /feature|capability|function|can.*do/i,
      integration: /integrate|integrate|api|connect|sync/i,
      support: /support|help|training|documentation/i,
      competitors: /compare|competitor|alternative|similar/i,
    };

    for (const [topic, pattern] of Object.entries(topicPatterns)) {
      if (pattern.test(text)) return topic;
    }

    return 'general';
  }

  /**
   * Get conversation summary for memory
   */
  getConversationSummary(sessionId) {
    const memory = this.sessionMemories.get(sessionId);
    if (!memory) return null;

    return {
      sessionId,
      customerProfile: memory.customerProfile,
      turnCount: memory.metadata.turnCount,
      topicsDiscussed: memory.metadata.topicsDiscussed,
      keyLearnings: {
        preferences: Array.from(memory.learnings.preferences).map(p => p.content),
        concerns: Array.from(memory.learnings.concerns).map(c => c.content),
        motivations: Array.from(memory.learnings.motivations).map(m => m.content),
      },
      objectionsSummary: memory.patterns.objectionSequence.map(o => ({
        type: o.type,
        resolved: o.resolved,
      })),
      emotionSummary: this.getEmotionTrend(sessionId),
      questionsAsked: memory.interactions.questionsAsked.length,
      agreementsReached: memory.interactions.agreeementsReached.length,
    };
  }

  /**
   * Generate memory recap for next interaction
   */
  generateMemoryRecap(sessionId) {
    const memory = this.sessionMemories.get(sessionId);
    if (!memory) return null;

    const preferences = Array.from(memory.learnings.preferences);
    const concerns = Array.from(memory.learnings.concerns);

    let recap = `Based on our conversation:\n`;

    if (preferences.length > 0) {
      recap += `• Interested in: ${preferences.map(p => p.content).join(', ')}\n`;
    }

    if (concerns.length > 0) {
      recap += `• Concerned about: ${concerns.map(c => c.content).join(', ')}\n`;
    }

    if (memory.learnings.timeline_indicators.length > 0) {
      recap += `• Timeline: ${memory.learnings.timeline_indicators[0].indicator}\n`;
    }

    if (memory.learnings.budget_indicators.length > 0) {
      recap += `• Budget: ${memory.learnings.budget_indicators[0].indicator}\n`;
    }

    return recap;
  }

  /**
   * Predict next customer concern based on patterns
   */
  predictNextConcern(sessionId) {
    const memory = this.sessionMemories.get(sessionId);
    if (!memory) return null;

    // Look at objection sequence
    const unresolved = memory.patterns.objectionSequence.filter(o => !o.resolved);

    if (unresolved.length === 0) {
      // Common follow-up concerns after main ones
      const mainConcerns = memory.patterns.objectionSequence.map(o => o.type);
      if (mainConcerns.includes('PRICE')) return 'IMPLEMENTATION';
      if (mainConcerns.includes('TIMELINE')) return 'RESOURCES';
      return 'INTEGRATION';
    }

    // Return most recent unresolved
    return unresolved[unresolved.length - 1].type;
  }

  /**
   * Track turn metrics for response timing optimization
   */
  recordTurnMetric(sessionId, turnNumber, responseTime, customerSpeakingTime) {
    const memory = this.sessionMemories.get(sessionId);
    if (!memory) return null;

    memory.patterns.responseTiming.push({
      turn: turnNumber,
      aiResponseTime: responseTime,
      customerSpeakingTime,
      timestamp: Date.now(),
    });

    memory.metadata.turnCount = Math.max(memory.metadata.turnCount, turnNumber);

    return true;
  }

  /**
   * Get optimal response timing for this customer
   */
  getOptimalResponseTiming(sessionId) {
    const memory = this.sessionMemories.get(sessionId);
    if (!memory || memory.patterns.responseTiming.length === 0) {
      return { thinkTime: 500, responseDelay: 200 };
    }

    const timings = memory.patterns.responseTiming.slice(-10);
    const avgThinkTime = timings.reduce((sum, t) => sum + t.aiResponseTime, 0) / timings.length;

    return {
      thinkTime: Math.round(avgThinkTime),
      responseDelay: Math.round(avgThinkTime * 0.4),
      basedOnTurns: timings.length,
    };
  }

  /**
   * Get session memory
   */
  getSessionMemory(sessionId) {
    return this.sessionMemories.get(sessionId);
  }

  /**
   * Clear old session memories
   */
  clearOldSessions(maxAgeMins = 60) {
    const now = Date.now();
    const maxAge = maxAgeMins * 60 * 1000;

    for (const [sessionId, memory] of this.sessionMemories.entries()) {
      if (now - memory.metadata.createdAt > maxAge) {
        this.sessionMemories.delete(sessionId);
      }
    }
  }

  /**
   * Export memory for external storage/CRM
   */
  exportMemory(sessionId) {
    const memory = this.getSessionMemory(sessionId);
    if (!memory) return null;

    return {
      sessionId,
      timestamp: Date.now(),
      summary: this.getConversationSummary(sessionId),
      fullMemory: JSON.stringify(memory, (key, value) => {
        if (value instanceof Set) {
          return Array.from(value);
        }
        return value;
      }),
    };
  }
}

export default EnhancedMemory;
