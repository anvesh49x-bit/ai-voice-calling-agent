import ConversationContext from "./ConversationContext.js";
import ConversationState from "./ConversationState.js";

export default class ConversationSession {

    constructor(callSid) {

        this.id = callSid;

        this.createdAt = Date.now();
        this.updatedAt = Date.now();

        this.state = new ConversationState();
        this.context = new ConversationContext();

        this.customer = {
            name: null,
            phone: null,
            language: "te-IN"
        };

        this.memory = {
            facts: [],
            preferences: [],
            requirements: [],
            confirmedRequirements: [],
            pendingQuestions: [],
            conversationSummary: ""
        };

        this.history = [];

        this.metrics = {
            customerTurns: 0,
            aiTurns: 0,
            interruptions: 0,
            totalTokens: 0
        };

        this.flags = {
            callStarted: false,
            callEnded: false,
            aiBusy: false,
            customerBusy: false
        };
    }

    touch() {
        this.updatedAt = Date.now();
    }

    addHistory(role, content) {

        this.history.push({
            role,
            content,
            timestamp: Date.now()
        });

        this.touch();
    }

    addFact(fact) {
        this.memory.facts.push(fact);
        this.touch();
    }

    addPreference(preference) {
        this.memory.preferences.push(preference);
        this.touch();
    }

    addRequirement(requirement) {
        this.memory.requirements.push(requirement);
        this.touch();
    }

    confirmRequirement(requirement) {
        this.memory.confirmedRequirements.push(requirement);
        this.touch();
    }

    addPendingQuestion(question) {
        this.memory.pendingQuestions.push(question);
        this.touch();
    }

    setSummary(summary) {
        this.memory.conversationSummary = summary;
        this.touch();
    }

    toJSON() {
        return {
            id: this.id,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            state: this.state.getCurrent(),
            context: this.context.toJSON(),
            customer: this.customer,
            memory: this.memory,
            metrics: this.metrics,
            flags: this.flags,
            history: this.history
        };
    }
}