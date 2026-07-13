/**
 * ResponseVariation
 * Generates diverse, natural responses to reduce robotic patterns
 * Phase 2: Reduce repetitive/robotic responses
 */

class ResponseVariation {
  constructor() {
    // Response starters with different tones
    this.responseStarters = {
      FORMAL: [
        'Absolutely,',
        'Certainly,',
        'Of course,',
        'Definitely,',
        'Indeed,',
      ],
      CASUAL: [
        'Yeah,',
        'Sure,',
        'Totally,',
        'For sure,',
        'No problem,',
      ],
      THOUGHTFUL: [
        'Good question.',
        'That\'s a great point.',
        'I understand.',
        'Let me think about that.',
        'That\'s interesting.',
      ],
      ENTHUSIASTIC: [
        'That\'s awesome!',
        'Absolutely, I love that!',
        'Perfect!',
        'Great point!',
        'I\'m excited about that!',
      ],
      EMPATHETIC: [
        'I completely understand.',
        'I hear you.',
        'That makes total sense.',
        'I\'ve been there.',
        'That\'s a valid concern.',
      ],
    };

    // Response bridges (transitions between acknowledgement and main response)
    this.responseBridges = {
      CONTINUING: [
        'and what I can tell you is',
        'here\'s the thing:',
        'the reality is,',
        'what we\'ve found is,',
        'in my experience,',
      ],
      CLARIFYING: [
        'so to be clear,',
        'let me explain:',
        'what that means is,',
        'basically,',
        'here\'s what\'s happening:',
      ],
      BUILDING: [
        'on top of that,',
        'beyond that,',
        'plus,',
        'what\'s more,',
        'additionally,',
      ],
      CONTRASTING: [
        'but here\'s the interesting part:',
        'now, the challenge is,',
        'however,',
        'that said,',
        'the flip side is,',
      ],
    };

    // Response endings with variation
    this.responseEndings = {
      QUESTION: [
        'Does that make sense?',
        'Follow?',
        'Tracking with me?',
        'Sound good?',
        'Make sense?',
      ],
      OPENENDED: [
        'What do you think?',
        'How does that sound?',
        'Tell me your thoughts.',
        'What\'s your take on that?',
        'Any thoughts there?',
      ],
      AFFIRMATIVE: [
        'That\'s the approach we take.',
        'That\'s how we do it.',
        'That\'s our model.',
        'It\'s pretty straightforward.',
        'Nothing complicated there.',
      ],
      CURIOUS: [
        'Curious to hear your thoughts.',
        'Interested to know how that lands with you.',
        'Want to know what you think?',
        'How does that resonate with you?',
        'What do you think about that?',
      ],
    };

    // Filler words and hedging language (natural speech patterns)
    this.fillers = {
      THINKING: ['let me think', 'you know', 'I mean', 'kind of', 'sort of', 'basically'],
      CONNECTING: ['like', 'actually', 'essentially', 'literally', 'obviously', 'clearly'],
      SOFTENING: ['I think', 'I feel', 'it seems like', 'might be', 'could be', 'possibly'],
    };

    // Sentence variety templates
    this.sentencePatterns = {
      SIMPLE: 'We [ACTION] [OBJECT].',
      COMPLEX: 'What we do is [ACTION] [OBJECT], which means [BENEFIT].',
      NESTED: 'Because of [REASON], we [ACTION] [OBJECT] so that [BENEFIT].',
      COMPOUND: 'We [ACTION] [OBJECT], and this helps with [BENEFIT].',
      CONDITIONAL: 'If you [CUSTOMER_STATE], then we [ACTION] [OBJECT].',
    };

    // Variation patterns to track (avoid repetition)
    this.sessionVariationTracking = new Map();

    // Response categories for variety
    this.responseCategories = {
      CONCISE: { maxTokens: 100, style: 'direct' },
      MODERATE: { maxTokens: 200, style: 'balanced' },
      COMPREHENSIVE: { maxTokens: 300, style: 'detailed' },
    };
  }

  /**
   * Generate varied response starter based on emotion and style
   */
  generateStarter(emotion = 'FRIENDLY', style = null, usedStarters = []) {
    let category = 'CASUAL';
    if (emotion === 'ANGRY') category = 'EMPATHETIC';
    if (emotion === 'CONFUSED') category = 'THOUGHTFUL';
    if (emotion === 'EXCITED') category = 'ENTHUSIASTIC';
    if (emotion === 'SKEPTICAL') category = 'FORMAL';

    const starters = this.responseStarters[category];
    const available = starters.filter(s => !usedStarters.includes(s));

    return available.length > 0
      ? available[Math.floor(Math.random() * available.length)]
      : starters[Math.floor(Math.random() * starters.length)];
  }

  /**
   * Generate varied response bridge
   */
  generateBridge(bridgeType = 'CONTINUING', usedBridges = []) {
    const bridges = this.responseBridges[bridgeType];
    const available = bridges.filter(b => !usedBridges.includes(b));

    return available.length > 0
      ? available[Math.floor(Math.random() * available.length)]
      : bridges[Math.floor(Math.random() * bridges.length)];
  }

  /**
   * Generate varied response ending
   */
  generateEnding(endingType = 'OPENENDED', usedEndings = []) {
    const endings = this.responseEndings[endingType];
    const available = endings.filter(e => !usedEndings.includes(e));

    return available.length > 0
      ? available[Math.floor(Math.random() * available.length)]
      : endings[Math.floor(Math.random() * endings.length)];
  }

  /**
   * Inject natural filler words for conversational flow
   */
  injectFillers(text, intensity = 'low') {
    if (intensity === 'low') return text;

    const fillerChance = intensity === 'high' ? 0.3 : intensity === 'medium' ? 0.15 : 0.05;

    // Don't over-filler short responses
    if (text.split(/\s+/).length < 10) return text;

    let filled = text;

    // Insert fillers at natural breakpoints (after commas, periods)
    if (Math.random() < fillerChance) {
      const thinkingFiller = this.fillers.THINKING[
        Math.floor(Math.random() * this.fillers.THINKING.length)
      ];
      filled = filled.replace(/\. /, `. ${thinkingFiller}, `);
    }

    if (Math.random() < fillerChance) {
      const connectingFiller = this.fillers.CONNECTING[
        Math.floor(Math.random() * this.fillers.CONNECTING.length)
      ];
      filled = filled.replace(/,/, `, ${connectingFiller},`);
    }

    return filled;
  }

  /**
   * Apply sentence structure variation
   */
  applySentenceVariation(content, variationLevel = 'medium') {
    if (variationLevel === 'low') return content;

    // This would require more sophisticated NLP, for now just add variety
    const sentences = content.match(/[^.!?]+[.!?]+/g) || [];

    if (sentences.length <= 1) return content;

    // Randomly restructure some sentences
    return sentences.map(sentence => {
      if (Math.random() < 0.3) {
        // Apply slight variation
        return this.varySentence(sentence.trim());
      }
      return sentence;
    }).join(' ');
  }

  /**
   * Apply minor variation to a sentence
   */
  varySentence(sentence) {
    // Add some variety without changing meaning
    const variations = [
      (s) => s, // Keep original 30% of time
      (s) => s.replace(/^We/, 'What we'),
      (s) => s.replace(/^I/, 'I think that I'),
      (s) => s.replace(/is/, 'can be'),
      (s) => s.replace(/do/, 'actually do'),
    ];

    const variation = variations[Math.floor(Math.random() * variations.length)];
    return variation(sentence);
  }

  /**
   * Track used responses in session to avoid repetition
   */
  trackResponseVariation(sessionId, responseContent) {
    if (!this.sessionVariationTracking.has(sessionId)) {
      this.sessionVariationTracking.set(sessionId, {
        usedStarters: [],
        usedBridges: [],
        usedEndings: [],
        responseHistory: [],
      });
    }

    const tracking = this.sessionVariationTracking.get(sessionId);

    // Extract and track starters/bridges/endings used
    for (const starter of Object.values(this.responseStarters).flat()) {
      if (responseContent.startsWith(starter)) {
        tracking.usedStarters.push(starter);
        break;
      }
    }

    tracking.responseHistory.push({
      content: responseContent,
      timestamp: Date.now(),
    });

    // Keep only last 20 responses
    if (tracking.responseHistory.length > 20) {
      tracking.responseHistory = tracking.responseHistory.slice(-20);
      tracking.usedStarters = tracking.usedStarters.slice(-10);
    }
  }

  /**
   * Get freshly used variation elements for a session
   */
  getFreshVariationElements(sessionId) {
    const tracking = this.sessionVariationTracking.get(sessionId);
    if (!tracking) {
      return { starters: [], bridges: [], endings: [] };
    }

    // Recency bias: only avoid last 5 uses
    return {
      starters: tracking.usedStarters.slice(-5),
      bridges: tracking.usedBridges.slice(-5),
      endings: tracking.usedEndings.slice(-5),
    };
  }

  /**
   * Detect if response is too robotic
   */
  detectRoboticPatterns(text) {
    const roboticIndicators = [
      /^I am|^I\'m a/i,
      /^As an AI|^As a language model/i,
      /^I appreciate/i,
      /^Let me explain/i,
      /^Thank you for asking/i,
      /^To summarize/i,
    ];

    for (const pattern of roboticIndicators) {
      if (pattern.test(text)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Make response more natural if robotic detected
   */
  naturalizeResponse(response, emotion = 'FRIENDLY') {
    let naturalized = response;

    // Replace robotic patterns
    naturalized = naturalized.replace(/^I am |^I\'m a /i, '');
    naturalized = naturalized.replace(/^As an AI, /i, '');
    naturalized = naturalized.replace(/^Thank you for asking, /i, '');
    naturalized = naturalized.replace(/^Let me explain: /i, 'Here\'s the thing: ');

    // Add natural starter
    const starter = this.generateStarter(emotion);
    if (!naturalized.startsWith(starter)) {
      naturalized = starter + ' ' + naturalized;
    }

    return naturalized;
  }

  /**
   * Generate conversational response style
   */
  getConversationalStyle(emotion, previousResponses = [], variationLevel = 'medium') {
    return {
      starter: this.generateStarter(emotion, null, previousResponses),
      bridge: this.generateBridge('CONTINUING', previousResponses),
      ending: this.generateEnding('OPENENDED', previousResponses),
      fillerIntensity: variationLevel === 'high' ? 'medium' : 'low',
      sentenceVariation: variationLevel,
      shouldNaturalize: Math.random() < 0.3,
    };
  }

  /**
   * Get response style by category
   */
  getResponseCategory(responseLength, emotion) {
    if (responseLength < 50) return this.responseCategories.CONCISE;
    if (responseLength < 150) return this.responseCategories.MODERATE;
    return this.responseCategories.COMPREHENSIVE;
  }

  /**
   * Suggest alternative phrasings
   */
  suggestAlternativePhrasing(phrase, context = {}) {
    const alternatives = {
      'I understand': ['Got it', 'I hear you', 'That makes sense', 'Totally get it'],
      'let me help': ['Here\'s how we can help', 'What we can do is', 'We can totally help'],
      'that sounds great': ['That\'s awesome', 'Love it', 'Perfect', 'Excellent'],
      'any other questions': ['Anything else on your mind?', 'What else?', 'Got any other questions?'],
    };

    for (const [key, alts] of Object.entries(alternatives)) {
      if (phrase.toLowerCase().includes(key)) {
        return alts[Math.floor(Math.random() * alts.length)];
      }
    }

    return phrase;
  }

  /**
   * Clear old session tracking
   */
  clearOldSessions(maxAgeMins = 60) {
    const now = Date.now();
    const maxAge = maxAgeMins * 60 * 1000;

    for (const [sessionId, tracking] of this.sessionVariationTracking.entries()) {
      if (tracking.responseHistory.length > 0) {
        const lastResponseTime = tracking.responseHistory[tracking.responseHistory.length - 1].timestamp;
        if (now - lastResponseTime > maxAge) {
          this.sessionVariationTracking.delete(sessionId);
        }
      }
    }
  }
}

export default ResponseVariation;
