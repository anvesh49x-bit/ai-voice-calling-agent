/**
 * Handles barge-in: stop playback, capture partial speech, queue user interruption.
 */
export class InterruptHandler {
  constructor(playback, memory, ttsAdapter) {
    this.playback = playback;
    this.memory = memory;
    this.ttsAdapter = ttsAdapter;
    this.interrupted = false;
    this.pendingUtterance = null;
  }

  handleBargeIn(interimTranscript, abortController) {
    if (!this.playback.isSpeaking) return false;

    this.interrupted = true;
    const partial = this.playback.getPartialSpokenText();

    abortController?.abort();
    this.ttsAdapter.abort();
    this.playback.abort();

    this.memory.setInterruptedContext(partial, interimTranscript);
    this.pendingUtterance = interimTranscript;

    console.log("⏸️ Barge-in detected:", interimTranscript);
    console.log("   Partial agent speech:", partial || "(none yet)");

    return true;
  }

  consumePendingUtterance() {
    const utterance = this.pendingUtterance;
    this.pendingUtterance = null;
    this.interrupted = false;
    return utterance;
  }

  wasInterrupted() {
    return this.interrupted;
  }

  clear() {
    this.interrupted = false;
    this.pendingUtterance = null;
    this.memory.clearInterruptContext();
  }
}
