/**
 * ============================================================================
 * CallStateManager.js
 * ============================================================================
 * Tier 1 Fix 1.1: Shared conversation state across all modules
 *
 * Problem: Each module (localReplies, openai, deepgram, etc) independently
 * tracks state, leading to contradictions (e.g., greeting fires twice because
 * greetedCalls exists only in localReplies, never consulted by openai).
 *
 * Solution: Single source of truth for conversation metadata.
 *
 * Tracks:
 * - greetedCalls: has greeting been sent for this call?
 * - currentEmotion: what emotion are we detecting?
 * - currentStage: what conversation stage (GREETING, DISCOVERING, etc)?
 * - lastTopic: what was the last topic discussed?
 * - stateHistory: log of state transitions for recovery
 * ============================================================================
 */

class CallStateManager {
  constructor() {
    // Map<callId, callState>
    this.states = new Map();
  }

  /**
   * Get or create state for a call
   */
  getOrCreateState(callId) {
    if (!this.states.has(callId)) {
      this.states.set(callId, {
        callId,
        greetedCalls: new Set(),
        currentEmotion: 'NEUTRAL',
        currentStage: 'GREETING',
        lastTopic: null,
        stateHistory: [],
        createdAt: Date.now(),
        lastUpdated: Date.now(),
      });
    }
    return this.states.get(callId);
  }

  /**
   * Mark call as greeted
   */
  markGreeted(callId) {
    const state = this.getOrCreateState(callId);
    state.greetedCalls.add(callId);
    state.lastUpdated = Date.now();
    this._logStateChange(callId, 'MARK_GREETED');
  }

  /**
   * Check if call has been greeted
   */
  isGreeted(callId) {
    const state = this.getOrCreateState(callId);
    return state.greetedCalls.has(callId);
  }

  /**
   * Set current emotion
   */
  setEmotion(callId, emotion) {
    const state = this.getOrCreateState(callId);
    if (emotion && emotion !== state.currentEmotion) {
      state.currentEmotion = emotion;
      state.lastUpdated = Date.now();
      this._logStateChange(callId, `EMOTION:${emotion}`);
    }
  }

  /**
   * Get current emotion
   */
  getEmotion(callId) {
    const state = this.getOrCreateState(callId);
    return state.currentEmotion;
  }

  /**
   * Set conversation stage
   */
  setStage(callId, stage) {
    const state = this.getOrCreateState(callId);
    if (stage && stage !== state.currentStage) {
      state.currentStage = stage;
      state.lastUpdated = Date.now();
      this._logStateChange(callId, `STAGE:${stage}`);
    }
  }

  /**
   * Get conversation stage
   */
  getStage(callId) {
    const state = this.getOrCreateState(callId);
    return state.currentStage;
  }

  /**
   * Set last discussed topic
   */
  setLastTopic(callId, topic) {
    const state = this.getOrCreateState(callId);
    if (topic && topic !== state.lastTopic) {
      state.lastTopic = topic;
      state.lastUpdated = Date.now();
      this._logStateChange(callId, `TOPIC:${topic}`);
    }
  }

  /**
   * Get last discussed topic
   */
  getLastTopic(callId) {
    const state = this.getOrCreateState(callId);
    return state.lastTopic;
  }

  /**
   * Clean up state for ended call
   */
  clearState(callId) {
    this.states.delete(callId);
  }

  /**
   * Internal: log state transitions for debugging
   */
  _logStateChange(callId, change) {
    const state = this.states.get(callId);
    if (state && state.stateHistory) {
      state.stateHistory.push({
        timestamp: Date.now(),
        change,
      });
      // Keep history lean (last 50 changes)
      if (state.stateHistory.length > 50) {
        state.stateHistory = state.stateHistory.slice(-50);
      }
    }
  }

  /**
   * Get full state for debugging
   */
  getFullState(callId) {
    return this.getOrCreateState(callId);
  }
}

// Singleton instance
const callStateManager = new CallStateManager();

export default callStateManager;
