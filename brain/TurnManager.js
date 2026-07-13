import EndpointDetector from "./EndpointDetector.js";
import SilenceDetector from "./SilenceDetector.js";

export default class TurnManager {

    constructor(config = {}) {

        this.endpointDetector = new EndpointDetector(config.endpoint);

        this.silenceDetector = new SilenceDetector(config.silence);

        this.customerSpeaking = false;

        this.aiSpeaking = false;

        this.currentTranscript = "";

        this.lastSpeechTime = 0;

        // Phase 2: Enhanced turn management
        this.rhythmEngine = config.rhythmEngine || null;
        this.listeningBehavior = config.listeningBehavior || null;
        this.turnMetrics = new Map();
        this.currentEmotion = 'FRIENDLY';
        this.currentStage = 'DISCOVERING';
        this.sessionId = null;
    }

    /**
     * Phase 2: Set context for turn decisions
     */
    setContext(sessionId, emotion, stage) {
        this.sessionId = sessionId;
        this.currentEmotion = emotion;
        this.currentStage = stage;
    }

    /**
     * Phase 2: Update silence detector threshold based on rhythm
     */
    updateSilenceThreshold() {
        if (this.rhythmEngine && this.sessionId) {
            const customerPace = 'MODERATE'; // Would come from session
            const threshold = this.rhythmEngine.calculateOptimalSilenceThreshold(
                this.currentEmotion,
                this.currentStage,
                customerPace
            );
            this.silenceDetector.requiredSilenceMs = threshold;
        }
    }

    customerStartedSpeaking() {

        this.customerSpeaking = true;

        this.lastSpeechTime = Date.now();

        this.silenceDetector.reset();
    }

    customerTranscript(text) {

        this.currentTranscript = text;

        this.lastSpeechTime = Date.now();

        this.silenceDetector.reset();
    }

    customerStoppedSpeaking() {

        this.customerSpeaking = false;

        this.silenceDetector.start();
    }

    aiStartedSpeaking() {

        this.aiSpeaking = true;
    }

    aiStoppedSpeaking() {

        this.aiSpeaking = false;
    }

    shouldRespond() {

        if (this.customerSpeaking) {
            return false;
        }

        if (this.aiSpeaking) {
            return false;
        }

        if (!this.silenceDetector.isSatisfied()) {
            return false;
        }

        const isComplete = this.endpointDetector.isComplete(this.currentTranscript);

        // Phase 2: Track listening behavior - sometimes we wait longer to show we're listening
        if (isComplete && this.listeningBehavior && this.sessionId) {
            // Don't rush to respond - show listening
            const shouldGeneratePause = this.listeningBehavior.shouldAcknowledge(
                this.currentEmotion,
                this.currentStage
            );

            if (shouldGeneratePause) {
                // Could add a brief acknowledgement pause here
            }
        }

        return isComplete;
    }

    shouldRespond_old() {

        if (this.customerSpeaking) {

            return false;

        }

        if (this.aiSpeaking) {

            return false;

        }

        if (!this.silenceDetector.isSatisfied()) {

            return false;

        }

        return this.endpointDetector.isComplete(
            this.currentTranscript
        );
    }

    resetTurn() {

        this.currentTranscript = "";

        this.silenceDetector.reset();
    }

    getStatus() {

        return {

            customerSpeaking: this.customerSpeaking,

            aiSpeaking: this.aiSpeaking,

            transcript: this.currentTranscript,

            silenceSatisfied:
                this.silenceDetector.isSatisfied(),

            // Phase 2: Include emotion and stage
            emotion: this.currentEmotion,
            stage: this.currentStage
        };
    }

    /**
     * Phase 2: Record turn metrics for future optimization
     */
    recordTurnMetric(turnNumber, responseTime, customerSpeakingTime) {
        this.turnMetrics.set(turnNumber, {
            responseTime,
            customerSpeakingTime,
            transcript: this.currentTranscript,
            emotion: this.currentEmotion,
            stage: this.currentStage,
            timestamp: Date.now()
        });
    }

    /**
     * Phase 2: Get turn metric
     */
    getTurnMetric(turnNumber) {
        return this.turnMetrics.get(turnNumber);
    }

}