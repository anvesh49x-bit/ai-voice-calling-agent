/**
 * Twilio media playback with barge-in support via clear events.
 */
export class TwilioPlayback {
  constructor(twilioWs, getStreamSid) {
    this.twilioWs = twilioWs;
    this.getStreamSid = getStreamSid;
    this.isSpeaking = false;
    this.spokenText = "";
    this.currentSegmentTexts = [];
    this.spokenSegmentIndex = 0;
    this.abortController = null;
  }

  get streamSid() {
    return this.getStreamSid();
  }

  clearBuffer() {
    const streamSid = this.streamSid;
    if (!streamSid || this.twilioWs.readyState !== 1) return;

    this.twilioWs.send(
      JSON.stringify({
        event: "clear",
        streamSid
      })
    );
  }

  beginSpeaking(abortController) {
    this.isSpeaking = true;
    this.abortController = abortController;
    this.spokenText = "";
    this.spokenSegmentIndex = 0;
  }

  markSegmentSpoken(text, index) {
    this.spokenText += (this.spokenText ? " " : "") + text;
    this.spokenSegmentIndex = index + 1;
  }

  endSpeaking() {
    this.isSpeaking = false;
    this.abortController = null;
  }

  abort() {
    this.abortController?.abort();
    this.clearBuffer();
    this.isSpeaking = false;
  }

  getPartialSpokenText() {
    return this.spokenText;
  }

  getResumeContext() {
    return {
      partialSpokenText: this.spokenText,
      interruptedAtSegment: this.spokenSegmentIndex
    };
  }
}
