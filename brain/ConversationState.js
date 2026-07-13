export const STATES = Object.freeze({
    IDLE: "IDLE",

    GREETING: "GREETING",

    DISCOVERY: "DISCOVERY",

    UNDERSTANDING: "UNDERSTANDING",

    CLARIFYING: "CLARIFYING",

    RECOMMENDING: "RECOMMENDING",

    OBJECTION_HANDLING: "OBJECTION_HANDLING",

    COLLECTING_DETAILS: "COLLECTING_DETAILS",

    CONFIRMING: "CONFIRMING",

    SCHEDULING: "SCHEDULING",

    CLOSING: "CLOSING",

    COMPLETED: "COMPLETED"
});

const ALLOWED_TRANSITIONS = {
    [STATES.IDLE]: [
        STATES.GREETING
    ],

    [STATES.GREETING]: [
        STATES.DISCOVERY,
        STATES.CLOSING
    ],

    [STATES.DISCOVERY]: [
        STATES.UNDERSTANDING,
        STATES.CLARIFYING,
        STATES.CLOSING
    ],

    [STATES.UNDERSTANDING]: [
        STATES.RECOMMENDING,
        STATES.COLLECTING_DETAILS,
        STATES.CLARIFYING,
        STATES.CLOSING
    ],

    [STATES.CLARIFYING]: [
        STATES.UNDERSTANDING,
        STATES.RECOMMENDING,
        STATES.COLLECTING_DETAILS
    ],

    [STATES.RECOMMENDING]: [
        STATES.OBJECTION_HANDLING,
        STATES.CONFIRMING,
        STATES.COLLECTING_DETAILS,
        STATES.CLOSING
    ],

    [STATES.OBJECTION_HANDLING]: [
        STATES.RECOMMENDING,
        STATES.CONFIRMING,
        STATES.CLOSING
    ],

    [STATES.COLLECTING_DETAILS]: [
        STATES.CONFIRMING,
        STATES.SCHEDULING,
        STATES.CLOSING
    ],

    [STATES.CONFIRMING]: [
        STATES.SCHEDULING,
        STATES.CLOSING
    ],

    [STATES.SCHEDULING]: [
        STATES.CLOSING
    ],

    [STATES.CLOSING]: [
        STATES.COMPLETED
    ],

    [STATES.COMPLETED]: []
};

export default class ConversationState {

    constructor() {
        this.current = STATES.IDLE;
        this.previous = null;
    }

    getCurrent() {
        return this.current;
    }

    getPrevious() {
        return this.previous;
    }

    canTransition(nextState) {
        return ALLOWED_TRANSITIONS[this.current]?.includes(nextState) ?? false;
    }

    transition(nextState) {

        if (!this.canTransition(nextState)) {
            return false;
        }

        this.previous = this.current;
        this.current = nextState;

        return true;
    }

    force(nextState) {
        this.previous = this.current;
        this.current = nextState;
    }

    reset() {
        this.previous = null;
        this.current = STATES.IDLE;
    }
}