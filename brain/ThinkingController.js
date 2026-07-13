export default class ThinkingController {

    constructor(config = {}) {

        this.minimumThinkingMs = config.minimumThinkingMs ?? 300;

        this.maximumThinkingMs = config.maximumThinkingMs ?? 1200;

        this.active = false;

        this.startedAt = null;

        // Phase 2: Integration with HumanRhythmEngine
        this.rhythmEngine = config.rhythmEngine || null;

        this.emotionalMultipliers = config.emotionalMultipliers || {};

        this.sessionConfigs = new Map();
    }

    start() {

        this.active = true;

        this.startedAt = Date.now();
    }

    stop() {

        this.active = false;

        this.startedAt = null;
    }

    isThinking() {

        return this.active;
    }

    elapsed() {

        if (!this.startedAt) {
            return 0;
        }

        return Date.now() - this.startedAt;
    }

    shouldWait() {

        if (!this.active) {
            return false;
        }

        return this.elapsed() < this.minimumThinkingMs;
    }

    isTimeout() {

        if (!this.active) {
            return false;
        }

        return this.elapsed() >= this.maximumThinkingMs;
    }

    getThinkingDelay(transcript = "", emotion = null, stage = null, sessionId = null) {

        // Phase 2: Use rhythm engine if available
        if (this.rhythmEngine && emotion && stage && sessionId) {
            const inputComplexity = this.analyzeInputComplexity(transcript);
            const customerPace = this.sessionConfigs.get(sessionId)?.pace || 'MODERATE';

            return this.rhythmEngine.calculateThinkingPause(
                inputComplexity,
                emotion,
                customerPace,
                stage
            );
        }

        // Fallback to original logic
        const words = transcript.trim().split(/\s+/).filter(Boolean).length;

        let delay = 500;

        if (words <= 3) {
            delay = 300;
        } else if (words <= 10) {
            delay = 500;
        } else if (words <= 20) {
            delay = 700;
        } else {
            delay = 900;
        }

        // Apply emotional multiplier if available
        if (emotion && this.emotionalMultipliers[emotion]) {
            delay *= this.emotionalMultipliers[emotion];
        }

        return Math.round(delay);
    }

    /**
     * Phase 2: Analyze input complexity
     */
    analyzeInputComplexity(transcript) {
        const words = transcript.trim().split(/\s+/).filter(Boolean).length;

        if (words <= 3) return 'simple';
        if (words <= 10) return 'moderate';
        if (words <= 20) return 'complex';
        return 'veryComplex';
    }

    /**
     * Phase 2: Store session configuration for adaptive timing
     */
    setSessionConfig(sessionId, config) {
        this.sessionConfigs.set(sessionId, config);
    }

    /**
     * Phase 2: Get session configuration
     */
    getSessionConfig(sessionId) {
        return this.sessionConfigs.get(sessionId);
    }

    getThinkingDelay_old(transcript = "") {

        const words = transcript.trim().split(/\s+/).filter(Boolean).length;

        if (words <= 3) {
            return 300;
        }

        if (words <= 10) {
            return 500;
        }

        if (words <= 20) {
            return 700;
        }

        return 900;
    }

    async wait(transcript = "", emotion = null, stage = null, sessionId = null) {

        const delay = this.getThinkingDelay(transcript, emotion, stage, sessionId);

        this.start();

        await new Promise(resolve => setTimeout(resolve, delay));

        this.stop();

        return delay;
    }

    getStatus() {

        return {
            active: this.active,
            elapsed: this.elapsed(),
            minimumThinkingMs: this.minimumThinkingMs,
            maximumThinkingMs: this.maximumThinkingMs
        };
    }

}