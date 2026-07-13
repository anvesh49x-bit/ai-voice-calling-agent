/**
 * Manages turn-taking: debounce, concurrent turn prevention, and barge-in detection.
 */
export class TurnManager {
  constructor() {
    this.lastTranscript = "";
    this.latestTranscript = "";
    this.speechTimer = null;
    this.isProcessing = false;
    this.debounceMs = 650;
    this.onFinalTurn = null;
    this.onBargeIn = null;
    this.agentSpeaking = false;
  }

  setAgentSpeaking(speaking) {
    this.agentSpeaking = speaking;
  }

  handleTranscript(data, transcript) {
    const clean = transcript.trim();
    if (!clean) return;

    const isFinal = data?.is_final && data?.speech_final;
    const isInterim = !isFinal && data?.is_final === false;

    if (isInterim && this.agentSpeaking && clean.length > 4) {
      this.onBargeIn?.(clean);
      return;
    }

    if (!isFinal) return;

    this.latestTranscript = clean;

    if (this.speechTimer) clearTimeout(this.speechTimer);

    this.speechTimer = setTimeout(() => {
      if (this.latestTranscript === this.lastTranscript) return;

      if (this.isProcessing && !this.agentSpeaking) return;

      this.lastTranscript = this.latestTranscript;
      this.onFinalTurn?.(this.latestTranscript);
    }, this.debounceMs);
  }

  async runTurn(handler) {
    if (this.isProcessing && !this.agentSpeaking) return false;

    this.isProcessing = true;
    try {
      await handler();
      return true;
    } finally {
      this.isProcessing = false;
    }
  }

  clearTimer() {
    if (this.speechTimer) {
      clearTimeout(this.speechTimer);
      this.speechTimer = null;
    }
  }

  reset() {
    this.clearTimer();
    this.isProcessing = false;
    this.agentSpeaking = false;
    this.lastTranscript = "";
    this.latestTranscript = "";
  }
}
