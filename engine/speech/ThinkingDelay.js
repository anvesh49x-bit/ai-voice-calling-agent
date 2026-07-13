import { SpeakingSpeed } from "../types.js";

/**
 * Compute human-like thinking delay before the agent starts speaking.
 * Conversation quality over latency — delays are intentional.
 */
export function computeThinkingDelay(plan, complexity, messageLength) {
  let delayMs = 450;

  delayMs += complexity * 600;
  delayMs += Math.min(400, messageLength * 8);

  if (plan.sentenceLength === "long") delayMs += 350;
  if (plan.sentenceLength === "medium") delayMs += 150;

  if (plan.deEscalate) delayMs += 500;
  if (plan.allowHesitation) delayMs += 200;

  if (plan.urgency >= 0.8) delayMs *= 0.55;
  if (plan.speakingSpeed === SpeakingSpeed.FAST) delayMs *= 0.65;
  if (plan.speakingSpeed === SpeakingSpeed.SLOW) delayMs += 300;

  if (plan.resumeFromPartial) delayMs *= 0.4;

  const jitter = Math.floor(Math.random() * 280) - 80;
  delayMs += jitter;

  return Math.max(180, Math.min(3200, Math.round(delayMs)));
}

export function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });
}
