export default class EndpointDetector {

    constructor(config = {}) {

        this.minWords = config.minWords ?? 2;

        this.questionWords = [
            "what",
            "why",
            "when",
            "where",
            "who",
            "which",
            "how",
            "can",
            "could",
            "will",
            "would",
            "do",
            "did",
            "is",
            "are",
            "am",
            "telugu",
            "enti",
            "ela",
            "enduku",
            "eppudu",
            "ekkada"
        ];

        this.incompleteEndings = [
            "and",
            "or",
            "but",
            "because",
            "if",
            "so",
            "then",
            "like",
            "means",
            "actually",
            "basically",
            "umm",
            "uh",
            "hmm"
        ];
    }

   
    isComplete(transcript = "") {

    const text = transcript.trim();

    if (!text) {
        return false;
    }

    const normalized = text.toLowerCase();

    const words = normalized.split(/\s+/);

    if (words.length < this.minWords) {
        return false;
    }

    const lastWord = words.at(-1);

    // Customer is still connecting ideas.
    if (this.incompleteEndings.includes(lastWord)) {
        return false;
    }

    // Ends with an unfinished connector.
    if (
        /\b(and|or|but|because|if|so|then|like|means)\s*$/i.test(normalized)
    ) {
        return false;
    }

    // Trailing hesitation usually means the speaker hasn't finished.
    if (
        /(uh+|umm+|hmm+|aaa+|ah+|eh+)\s*$/i.test(normalized)
    ) {
        return false;
    }

    // Ends with comma or ellipsis.
    if (
        /[,;:]$/.test(text) ||
        /\.{2,}$/.test(text)
    ) {
        return false;
    }

    // Very short fragments are usually incomplete.
    if (
        words.length <= 3 &&
        !/[?.!]$/.test(text)
    ) {
        return false;
    }

    // Strong sentence ending.
    if (
        /[?.!]$/.test(text)
    ) {
        return true;
    }

    // Longer utterances are more likely to be complete.
    if (words.length >= 8) {
        return true;
    }

    return false;
}

    isQuestion(transcript = "") {

        const text = transcript.trim().toLowerCase();

        if (!text) {
            return false;
        }

        if (text.endsWith("?")) {
            return true;
        }

        const firstWord = text.split(/\s+/)[0];

        return this.questionWords.includes(firstWord);
    }

    confidence(transcript = "") {

        const text = transcript.trim();

        if (!text) {
            return 0;
        }

        let score = 0.5;

        if (this.isComplete(text)) {
            score += 0.3;
        }

        if (this.isQuestion(text)) {
            score += 0.1;
        }

        if (text.split(/\s+/).length > 6) {
            score += 0.1;
        }

        return Math.min(score, 1.0);
    }

}