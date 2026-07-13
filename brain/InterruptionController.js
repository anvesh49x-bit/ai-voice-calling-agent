export default class InterruptionController {

    constructor(config = {}) {

        this.minimumSpeechMs = config.minimumSpeechMs ?? 600;

        this.interruptionCooldownMs = config.interruptionCooldownMs ?? 1200;

        this.customerSpeaking = false;

        this.aiSpeaking = false;

        this.customerStartedAt = null;

        this.lastInterruptionAt = 0;

        // Phase 2: Emotional awareness for interruptions
        this.emotionalInterruptionPatterns = config.emotionalInterruptionPatterns || {
            ANGRY: { allowInterrupt: false, minimumSpeechMs: 1200, cooldownMs: 2000 },
            CONFUSED: { allowInterrupt: false, minimumSpeechMs: 1000, cooldownMs: 1800 },
            EXCITED: { allowInterrupt: true, minimumSpeechMs: 600, cooldownMs: 1200 },
            SKEPTICAL: { allowInterrupt: false, minimumSpeechMs: 900, cooldownMs: 1500 },
            FRIENDLY: { allowInterrupt: true, minimumSpeechMs: 600, cooldownMs: 1200 },
            BUSY: { allowInterrupt: true, minimumSpeechMs: 400, cooldownMs: 1000 },
        };

        this.currentEmotion = 'FRIENDLY';
    }

    customerStartedSpeaking() {

        this.customerSpeaking = true;

        this.customerStartedAt = Date.now();
    }

    customerStoppedSpeaking() {

        this.customerSpeaking = false;

        this.customerStartedAt = null;
    }

    aiStartedSpeaking() {

        this.aiSpeaking = true;
    }

    aiStoppedSpeaking() {

        this.aiSpeaking = false;
    }

    shouldInterruptAI() {

        if (!this.aiSpeaking) {
            return false;
        }

        if (!this.customerSpeaking) {
            return false;
        }

        // Phase 2: Check emotional pattern
        const emotionalPattern = this.emotionalInterruptionPatterns[this.currentEmotion];
        if (emotionalPattern && !emotionalPattern.allowInterrupt) {
            return false;
        }

        const now = Date.now();

        // Phase 2: Use emotion-based cooldown
        const cooldown = emotionalPattern?.cooldownMs || this.interruptionCooldownMs;
        if (now - this.lastInterruptionAt < cooldown) {
            return false;
        }

        // Phase 2: Use emotion-based minimum speech duration
        const minimumSpeech = emotionalPattern?.minimumSpeechMs || this.minimumSpeechMs;
        const customerSpeechDuration = now - this.customerStartedAt;

        if (customerSpeechDuration < minimumSpeech) {
            return false;
        }

        this.lastInterruptionAt = now;

        return true;
    }

    /**
     * Phase 2: Set customer emotion for interruption decisions
     */
    setCustomerEmotion(emotion) {
        if (this.emotionalInterruptionPatterns[emotion]) {
            this.currentEmotion = emotion;
        }
    }

    /**
     * Phase 2: Get emotion-adjusted parameters
     */
    getEmotionAdjustedParams() {
        return this.emotionalInterruptionPatterns[this.currentEmotion] || {
            allowInterrupt: true,
            minimumSpeechMs: this.minimumSpeechMs,
            cooldownMs: this.interruptionCooldownMs,
        };
    }

    shouldInterruptAI_old() {

        if (!this.aiSpeaking) {
            return false;
        }

        if (!this.customerSpeaking) {
            return false;
        }

        const now = Date.now();

        if (
            now - this.lastInterruptionAt <
            this.interruptionCooldownMs
        ) {
            return false;
        }

        const customerSpeechDuration =
            now - this.customerStartedAt;

        if (
            customerSpeechDuration <
            this.minimumSpeechMs
        ) {
            return false;
        }

        this.lastInterruptionAt = now;

        return true;
    }

    canAIStartSpeaking() {

        return !this.customerSpeaking;
    }

    reset() {

        this.customerSpeaking = false;

        this.aiSpeaking = false;

        this.customerStartedAt = null;

        this.lastInterruptionAt = 0;
    }

    getStatus() {

        return {
            customerSpeaking: this.customerSpeaking,
            aiSpeaking: this.aiSpeaking,
            lastInterruptionAt: this.lastInterruptionAt
        };
    }

}