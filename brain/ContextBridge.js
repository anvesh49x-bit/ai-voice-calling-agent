/**
 * ContextBridge
 * Manages conversation context boundaries and restoration
 * Phase 2: Better context retention and switching
 */

class ContextBridge {
  constructor() {
    this.contextStacks = new Map();      // Per-session context stacks
    this.contextSnapshots = new Map();   // Store context checkpoints
    this.contextBoundaries = new Map();  // Track topic/context changes
    this.contextImportance = new Map();  // Track what matters to customer
  }

  /**
   * Create context checkpoint (for context switching/restoration)
   */
  createContextCheckpoint(sessionId, contextData, stage, reason = 'manual') {
    if (!this.contextSnapshots.has(sessionId)) {
      this.contextSnapshots.set(sessionId, []);
    }

    const snapshot = {
      id: `${sessionId}-${Date.now()}`,
      stage,
      reason,
      context: {
        currentTopic: contextData.currentTopic,
        currentObjective: contextData.currentObjective,
        detectedEmotion: contextData.detectedEmotion,
        customerProfile: contextData.customerProfile,
        requirements: contextData.requirements || [],
        facts: contextData.facts || [],
        objections: contextData.objections || [],
        agreements: contextData.agreements || [],
      },
      metadata: {
        turnNumber: contextData.turnNumber,
        timestamp: Date.now(),
        conversationLength: contextData.conversationLength,
      },
    };

    const snapshots = this.contextSnapshots.get(sessionId);
    snapshots.push(snapshot);

    // Keep only last 10 snapshots per session
    if (snapshots.length > 10) {
      snapshots.shift();
    }

    return snapshot.id;
  }

  /**
   * Detect context boundary (when conversation shifts topics)
   */
  detectContextBoundary(sessionId, newInput, previousContext, currentContext) {
    const boundary = {
      detected: false,
      fromTopic: previousContext?.currentTopic,
      toTopic: currentContext?.currentTopic,
      type: null,
      severity: 'low',
      reason: null,
    };

    // Type 1: Explicit topic switch (customer changes subject)
    if (previousContext?.currentTopic !== currentContext?.currentTopic) {
      boundary.detected = true;
      boundary.type = 'TOPIC_SWITCH';
      boundary.severity = 'medium';
      boundary.reason = `Topic changed from ${previousContext.currentTopic} to ${currentContext.currentTopic}`;
    }

    // Type 2: Interruption/Return pattern (customer interrupts then returns)
    if (this.isReturnFromInterruption(sessionId, newInput)) {
      boundary.detected = true;
      boundary.type = 'RETURN_FROM_INTERRUPTION';
      boundary.severity = 'high';
      boundary.reason = 'Customer returned from interruption/tangent';
    }

    // Type 3: Objection raised (sentiment shift)
    if (this.containsObjection(newInput)) {
      boundary.detected = true;
      boundary.type = 'OBJECTION_RAISED';
      boundary.severity = 'high';
      boundary.reason = 'Objection detected - context boundary';
    }

    // Type 4: Stage transition
    if (previousContext?.stage !== currentContext?.stage) {
      boundary.detected = true;
      boundary.type = 'STAGE_TRANSITION';
      boundary.severity = 'medium';
      boundary.reason = `Stage changed from ${previousContext.stage} to ${currentContext.stage}`;
    }

    if (boundary.detected) {
      this.recordContextBoundary(sessionId, boundary);
    }

    return boundary;
  }

  /**
   * Restore context from checkpoint
   */
  restoreContextCheckpoint(sessionId, snapshotId) {
    const snapshots = this.contextSnapshots.get(sessionId);
    if (!snapshots) return null;

    const snapshot = snapshots.find(s => s.id === snapshotId);
    if (!snapshot) return null;

    return {
      ...snapshot.context,
      restoredAt: Date.now(),
      restoredFrom: snapshot.reason,
    };
  }

  /**
   * Get context before boundary
   */
  getContextBeforeBoundary(sessionId, boundaryType = null) {
    const snapshots = this.contextSnapshots.get(sessionId);
    if (!snapshots || snapshots.length < 2) return null;

    // Return second-to-last context snapshot
    return snapshots[snapshots.length - 2];
  }

  /**
   * Handle context switch (topic change)
   */
  handleContextSwitch(sessionId, fromContext, toContext, switchData = {}) {
    // Create checkpoint before switching
    this.createContextCheckpoint(
      sessionId,
      fromContext,
      fromContext.stage,
      'BEFORE_CONTEXT_SWITCH'
    );

    // Store what we need to remember from previous context
    const bridgeData = {
      sessionId,
      fromTopic: fromContext.currentTopic,
      toTopic: toContext.currentTopic,
      itemsToRemember: {
        requirements: fromContext.requirements || [],
        agreements: fromContext.agreements || [],
        objections: fromContext.objections || [],
        facts: fromContext.facts || [],
      },
      switchReason: switchData.reason || 'customer_initiated',
      switchTime: Date.now(),
      shouldReturnLater: this.determineIfShouldReturn(fromContext),
    };

    // Store bridge for later restoration
    if (!this.contextStacks.has(sessionId)) {
      this.contextStacks.set(sessionId, []);
    }
    this.contextStacks.get(sessionId).push(bridgeData);

    return bridgeData;
  }

  /**
   * Plan return to previous context
   */
  planContextReturn(sessionId, targetTopic = null) {
    const stack = this.contextStacks.get(sessionId);
    if (!stack || stack.length === 0) return null;

    // Find the bridge point to return to
    const bridgePoint = targetTopic
      ? stack.find(b => b.fromTopic === targetTopic)
      : stack[stack.length - 1];

    if (!bridgePoint) return null;

    // Create return transition
    const returnPlan = {
      action: 'RETURN_TO_CONTEXT',
      fromTopic: bridgePoint.toTopic,
      toTopic: bridgePoint.fromTopic,
      itemsToRecover: bridgePoint.itemsToRemember,
      transitionPhrase: this.generateContextTransition(
        bridgePoint.toTopic,
        bridgePoint.fromTopic
      ),
      timeAway: Date.now() - bridgePoint.switchTime,
    };

    return returnPlan;
  }

  /**
   * Generate natural transition phrase for context return
   */
  generateContextTransition(fromTopic, toTopic) {
    const transitions = {
      pricing_timeline: [
        'Now, getting back to the pricing side,',
        'Coming back to that budget question,',
        'So on the pricing front,',
      ],
      timeline_pricing: [
        'Okay, so on the timeline piece,',
        'Going back to when you\'d want to start,',
        'Returning to your timeline,',
      ],
      objection_benefit: [
        'But actually, here\'s why that concern is addressable:',
        'What\'s interesting is, we\'ve solved that:',
        'That\'s valid, but here\'s the thing:',
      ],
      default: [
        'Now, where were we?',
        'So going back to that,',
        'On that note,',
        'Circling back to what we were discussing,',
      ],
    };

    const key = `${fromTopic}_${toTopic}`;
    const phrases = transitions[key] || transitions.default;
    return phrases[Math.floor(Math.random() * phrases.length)];
  }

  /**
   * Record context boundary for analysis
   */
  recordContextBoundary(sessionId, boundary) {
    if (!this.contextBoundaries.has(sessionId)) {
      this.contextBoundaries.set(sessionId, []);
    }

    this.contextBoundaries.get(sessionId).push({
      ...boundary,
      recordedAt: Date.now(),
    });
  }

  /**
   * Track customer interests/importance for context
   */
  trackContextImportance(sessionId, topics = {}) {
    if (!this.contextImportance.has(sessionId)) {
      this.contextImportance.set(sessionId, {});
    }

    const importance = this.contextImportance.get(sessionId);
    for (const [topic, score] of Object.entries(topics)) {
      importance[topic] = (importance[topic] || 0) + score;
    }
  }

  /**
   * Get most important topics in conversation
   */
  getImportantTopics(sessionId, limit = 5) {
    const importance = this.contextImportance.get(sessionId);
    if (!importance) return [];

    return Object.entries(importance)
      .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
      .slice(0, limit)
      .map(([topic]) => topic);
  }

  /**
   * Determine if we should return to previous context
   */
  determineIfShouldReturn(context) {
    // Only return if there were unresolved requirements/agreements
    const hasUnresolvedItems = (context.requirements && context.requirements.length > 0)
      || (context.agreements && context.agreements.length > 0)
      || (context.objections && context.objections.length > 0);

    return hasUnresolvedItems;
  }

  /**
   * Check if customer is returning from interruption
   */
  isReturnFromInterruption(sessionId, newInput) {
    const boundaries = this.contextBoundaries.get(sessionId) || [];

    // Check if there was a recent topic switch and now we're back
    if (boundaries.length < 2) return false;

    const recentBoundaries = boundaries.slice(-2);
    return recentBoundaries[0].type === 'TOPIC_SWITCH'
      && recentBoundaries.some(b => b.type === 'TOPIC_SWITCH');
  }

  /**
   * Check if input contains objection
   */
  containsObjection(text) {
    const objectionPatterns = [
      /too\s+expensive|costly|expensive|price|budget/i,
      /not\s+interested|don\'t think|no way|unlikely/i,
      /already\s+using|we have|we\'re using/i,
      /need to think|let me think|consider|think about/i,
      /concerned|worried|hesitant|skeptical/i,
    ];

    return objectionPatterns.some(pattern => pattern.test(text));
  }

  /**
   * Build context summary for AI prompt injection
   */
  buildContextSummary(sessionId) {
    const snapshots = this.contextSnapshots.get(sessionId) || [];
    const importance = this.contextImportance.get(sessionId) || {};
    const boundaries = this.contextBoundaries.get(sessionId) || [];

    if (snapshots.length === 0) return null;

    const latestSnapshot = snapshots[snapshots.length - 1];

    return {
      currentContext: latestSnapshot.context,
      importantTopics: Object.entries(importance)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([topic]) => topic),
      contextHistory: snapshots.map(s => ({
        topic: s.context.currentTopic,
        stage: s.stage,
        time: s.metadata.timestamp,
      })),
      recentBoundaries: boundaries.slice(-3).map(b => ({
        type: b.type,
        severity: b.severity,
        reason: b.reason,
      })),
      totalContextSwitches: boundaries.filter(b => b.type === 'TOPIC_SWITCH').length,
    };
  }

  /**
   * Get context recommendations for next turn
   */
  getContextRecommendations(sessionId) {
    const contextSummary = this.buildContextSummary(sessionId);
    if (!contextSummary) return null;

    const stack = this.contextStacks.get(sessionId) || [];
    const importantTopics = contextSummary.importantTopics;

    return {
      shouldMaintainCurrentContext: true,
      shouldPlanReturn: stack.length > 0 && stack[stack.length - 1].shouldReturnLater,
      topicsToCircleBackTo: importantTopics.slice(1), // Skip current topic
      contextConfidence: Math.min(100, (stack.length + 1) * 20), // Increases with context depth
      suggestedNextTopic: stack.length > 0 ? 'return_to_previous' : 'continue_current',
    };
  }

  /**
   * Clear old session data
   */
  clearOldSessions(maxAgeMins = 60) {
    const now = Date.now();
    const maxAge = maxAgeMins * 60 * 1000;

    for (const sessionId of this.contextSnapshots.keys()) {
      const snapshots = this.contextSnapshots.get(sessionId);
      if (snapshots && snapshots.length > 0) {
        const lastTime = snapshots[snapshots.length - 1].metadata.timestamp;
        if (now - lastTime > maxAge) {
          this.contextSnapshots.delete(sessionId);
          this.contextStacks.delete(sessionId);
          this.contextBoundaries.delete(sessionId);
          this.contextImportance.delete(sessionId);
        }
      }
    }
  }
}

export default ContextBridge;
