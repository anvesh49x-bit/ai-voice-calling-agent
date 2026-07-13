export default class SilenceDetector {

    constructor(config = {}) {

        this.requiredSilenceMs = config.requiredSilenceMs ?? 700;

        this.startedAt = null;
    }

    start() {

        if (!this.startedAt) {
            this.startedAt = Date.now();
        }

    }

    reset() {

        this.startedAt = null;

    }

    elapsed() {

        if (!this.startedAt) {
            return 0;
        }

        return Date.now() - this.startedAt;

    }

    isSatisfied() {

        if (!this.startedAt) {
            return false;
        }

        return this.elapsed() >= this.requiredSilenceMs;

    }

    remaining() {

        return Math.max(
            0,
            this.requiredSilenceMs - this.elapsed()
        );

    }

    getStatus() {

        return {
            startedAt: this.startedAt,
            elapsed: this.elapsed(),
            remaining: this.remaining(),
            satisfied: this.isSatisfied()
        };

    }

}