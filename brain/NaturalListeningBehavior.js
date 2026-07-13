/**
 * NaturalListeningBehavior
 * Implements realistic listening patterns, acknowledgements, and feedback
 * Phase 2: Improve listening behavior and natural acknowledgements
 */

class NaturalListeningBehavior {
  constructor() {
    // Listening signals that show engagement
    this.listeningCues = {
      AFFIRMATIVE: ['yes', 'yeah', 'absolutely', 'definitely', 'of course', 'for sure', 'totally', 'exactly'],
      UNDERSTANDING: ['I see', 'I understand', 'got it', 'that makes sense', 'right', 'okay', 'I hear you'],
      EMPATHY: ['I understand', 'that\'s tough', 'that\'s great', 'I appreciate that', 'thanks for sharing', 'I hear you'],
      ENCOURAGEMENT: ['tell me more', 'go ahead', 'I\'m listening', 'continue', 'please elaborate'],
      VALIDATION: ['that\'s valid', 'fair point', 'good point', 'that makes sense', 'understood'],
      CURIOSITY: ['interesting', 'tell me more', 'how so?', 'what do you mean?', 'can you elaborate?'],
    };

    // Acknowledgement patterns - short responses that show listening
    this.acknowledgementPatterns = [
      'Mm-hmm, [CONTINUE]',
      'I see, [CONTINUE]',
      'Got it, [CONTINUE]',
      'Right, [CONTINUE]',
      'Absolutely, [CONTINUE]',
      'That makes sense, [CONTINUE]',
      'Understood, [CONTINUE]',
      'Yes, [CONTINUE]',
      'Okay, [CONTINUE]',
    ];

    // Listening behavior templates
    this.listeningBehaviors = {
      CLARIFYING: {
        pattern: 'So if I understand correctly, [SUMMARY]. Is that right?',
        confidence: 0.8,
        frequency: 'medium', // When to use
      },
      SUMMARIZING: {
        pattern: 'Let me make sure I\'ve got this: [SUMMARY]. Is that accurate?',
        confidence: 0.9,
        frequency: 'medium',
      },
      REFLECTING: {
        pattern: 'It sounds like [EMOTION_REFLECTION]. Is that what you\'re saying?',
        confidence: 0.7,
        frequency: 'low',
      },
      PROBING: {
        pattern: 'Tell me more about [KEY_POINT]. What\'s the situation there?',
        confidence: 0.85,
        frequency: 'high',
      },
      VALIDATING: {
        pattern: 'That\'s a [ADJECTIVE] point. I can see why that matters to you.',
        confidence: 0.9,
        frequency: 'medium',
      },
    };

    // Backchannel feedback (sounds customers make to keep conversation going)
    this.backchannels = {
      ENGAGED: ['mm-hmm', 'uh-huh', 'yeah', 'gotcha'],
      THOUGHTFUL: ['I see', 'interesting', 'okay', 'right'],
      SURPRISED: ['oh', 'wow', 'interesting', 'really?'],
      CONCERNED: ['hmm', 'I see', 'okay', 'that\'s...'],
    };

    // Question types that show active listening
    this.activeListeningQuestions = {
      CLARIFYING: ['What do you mean by that?', 'Can you expand on that?', 'Help me understand that better'],
      OPEN: ['Tell me more about that', 'What\'s your thinking there?', 'How does that work?'],
      CLOSED: ['So you\'re saying...?', 'Is that right?', 'Does that cover it?'],
      REFLECTING: ['How did that make you feel?', 'What\'s your take on that?', 'Where does that leave you?'],
    };

    // Listening patterns by emotion
    this.emotionalListeningPatterns = {
      ANGRY: {
        frequency: 'high',        // More acknowledgements
        patience: 'high',         // Let them talk more
        validation: 'high',       // Validate feelings
        interruption: 'low',      // Don't interrupt
      },
      CONFUSED: {
        frequency: 'high',
        patience: 'high',
        validation: 'medium',
        interruption: 'low',
      },
      EXCITED: {
        frequency: 'medium',
        patience: 'medium',
        validation: 'high',
        interruption: 'medium',
      },
      SKEPTICAL: {
        frequency: 'medium',
        patience: 'high',
        validation: 'high',
        interruption: 'low',
      },
      FRIENDLY: {
        frequency: 'medium',
        patience: 'medium',
        validation: 'medium',
        interruption: 'medium',
      },
      BUSY: {
        frequency: 'low',
        patience: 'low',
        validation: 'low',
        interruption: 'high',
      },
    };

    this.sessionListeningMetrics = new Map();
  }

  /**
   * Generate contextual listening cue based on emotion and stage
   */
  generateListeningCue(emotion = 'FRIENDLY', context = {}) {
    const patterns = this.listeningBehaviors;

    // Choose appropriate pattern
    let pattern = 'PROBING';
    if (context.needsClarification) pattern = 'CLARIFYING';
    if (context.shouldSummarize) pattern = 'SUMMARIZING';
    if (context.shouldValidate) pattern = 'VALIDATING';
    if (context.shouldReflect) pattern = 'REFLECTING';

    return patterns[pattern] || patterns.PROBING;
  }

  /**
   * Generate acknowledgement that shows listening
   */
  generateAcknowledgement(emotion = 'FRIENDLY', responseLength = 'medium') {
    // Select cue category based on emotion
    let category = 'UNDERSTANDING';
    if (emotion === 'ANGRY') category = 'EMPATHY';
    if (emotion === 'EXCITED') category = 'VALIDATION';
    if (emotion === 'CONFUSED') category = 'UNDERSTANDING';
    if (emotion === 'SKEPTICAL') category = 'VALIDATION';

    const cues = this.listeningCues[category];
    const selectedCue = cues[Math.floor(Math.random() * cues.length)];

    // For medium/long responses, return just the cue
    if (responseLength === 'short') {
      return selectedCue + '.';
    }

    return selectedCue + ', ';
  }

  /**
   * Determine if AI should acknowledge before responding
   */
  shouldAcknowledge(emotion, stage, turnsSinceLastAck = 0) {
    const pattern = this.emotionalListeningPatterns[emotion];
    if (!pattern) return false;

    // Convert frequency to probability
    const frequencies = { high: 0.7, medium: 0.4, low: 0.15 };
    const probability = frequencies[pattern.frequency] || 0.4;

    // Don't acknowledge every turn (that's too much)
    if (turnsSinceLastAck < 2) return false;

    return Math.random() < probability;
  }

  /**
   * Generate active listening question to encourage customer input
   */
  generateActiveListeningQuestion(questionType = 'CLARIFYING', topic = null) {
    const questions = this.activeListeningQuestions[questionType];
    if (!questions || questions.length === 0) {
      return this.activeListeningQuestions.CLARIFYING[0];
    }

    const selectedQuestion = questions[Math.floor(Math.random() * questions.length)];

    // If topic provided, personalize
    if (topic && selectedQuestion.includes('[TOPIC]')) {
      return selectedQuestion.replace('[TOPIC]', topic);
    }

    return selectedQuestion;
  }

  /**
   * Generate listening pattern response (shows attention)
   */
  generateListeningResponse(emotion, customerSaid, context = {}) {
    // Extract key entities from what customer said
    const keyWords = this.extractKeyWords(customerSaid);

    // Build response showing understanding
    let response = this.generateAcknowledgement(emotion, 'short');

    // Add reflection of emotion if detected
    if (context.detectedEmotion) {
      response += this.generateEmotionalReflection(context.detectedEmotion) + ' ';
    }

    // Add clarifying question about key point
    if (keyWords.length > 0) {
      response += this.generateActiveListeningQuestion('CLARIFYING', keyWords[0]);
    }

    return response;
  }

  /**
   * Generate emotional reflection
   */
  generateEmotionalReflection(emotion) {
    const reflections = {
      ANGRY: [
        'It sounds like you\'re frustrated',
        'I can hear the frustration',
        'That\'s clearly important to you',
      ],
      CONFUSED: [
        'It sounds like that\'s unclear',
        'I understand it\'s confusing',
        'That makes sense to be unsure about',
      ],
      EXCITED: [
        'I can hear the excitement',
        'That\'s exciting',
        'You sound really interested',
      ],
      SKEPTICAL: [
        'I understand the hesitation',
        'That\'s a fair concern',
        'I hear your skepticism',
      ],
      HAPPY: [
        'That\'s wonderful',
        'I\'m glad to hear that',
        'That sounds great',
      ],
    };

    const reflectionList = reflections[emotion] || reflections.HAPPY;
    return reflectionList[Math.floor(Math.random() * reflectionList.length)];
  }

  /**
   * Extract key words/topics from customer input
   */
  extractKeyWords(text) {
    if (!text) return [];

    // Remove common words
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'is', 'are', 'was', 'were', 'be', 'have', 'has', 'do', 'does', 'did',
      'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'
    ]);

    const words = text.toLowerCase().split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word));

    return words.slice(0, 3); // Return top 3 keywords
  }

  /**
   * Generate backchannel feedback (mm-hmm, yeah, etc.)
   */
  generateBackchannel(emotion = 'FRIENDLY', customerSentiment = null) {
    let category = 'THOUGHTFUL';
    if (emotion === 'EXCITED') category = 'SURPRISED';
    if (emotion === 'ANGRY') category = 'CONCERNED';
    if (emotion === 'SKEPTICAL') category = 'CONCERNED';

    const channels = this.backchannels[category];
    return channels[Math.floor(Math.random() * channels.length)];
  }

  /**
   * Determine listening stance (how much to let customer speak)
   */
  getListeningStance(emotion, stage) {
    const pattern = this.emotionalListeningPatterns[emotion];
    if (!pattern) {
      return { patience: 'medium', interruption: 'medium', validation: 'medium' };
    }

    return {
      patience: pattern.patience,
      interruption: pattern.interruption,
      validation: pattern.validation,
    };
  }

  /**
   * Track listening effectiveness metrics
   */
  recordListeningMetric(sessionId, metric = {}) {
    if (!this.sessionListeningMetrics.has(sessionId)) {
      this.sessionListeningMetrics.set(sessionId, {
        acknowledgementsUsed: 0,
        clarifyingQuestionsAsked: 0,
        emotionalReflectionsUsed: 0,
        activeListeningResponses: 0,
        customerSpeakingTime: 0,
        aiSpeakingTime: 0,
        turnsTaken: 0,
      });
    }

    const metrics = this.sessionListeningMetrics.get(sessionId);
    Object.assign(metrics, metric);
    metrics.timestamp = Date.now();
  }

  /**
   * Get listening effectiveness score
   */
   getListeningScore(sessionId) {
    const metrics = this.sessionListeningMetrics.get(sessionId);
    if (!metrics) return 0;

    // Score based on listening behaviors used
    const acknowledgementsScore = Math.min(metrics.acknowledgementsUsed * 10, 25);
    const questionsScore = Math.min(metrics.clarifyingQuestionsAsked * 15, 25);
    const reflectionScore = Math.min(metrics.emotionalReflectionsUsed * 20, 25);
    const engagementScore = metrics.aiSpeakingTime > 0 
      ? Math.min((metrics.customerSpeakingTime / metrics.aiSpeakingTime) * 20, 25)
      : 0;

    return Math.round((acknowledgementsScore + questionsScore + reflectionScore + engagementScore) / 4);
  }

  /**
   * Generate silence fill (what AI does during pauses)
   */
  generateSilenceFill(conversationState = {}) {
    // Show we're still listening
    if (Math.random() < 0.5) {
      return this.generateBackchannel(conversationState.emotion);
    }

    return null; // Sometimes just silence is good
  }

  /**
   * Get conversation balance analysis
   */
  getConversationBalance(sessionId) {
    const metrics = this.sessionListeningMetrics.get(sessionId);
    if (!metrics) return null;

    const aiTalkPercentage = metrics.aiSpeakingTime + metrics.customerSpeakingTime > 0
      ? (metrics.aiSpeakingTime / (metrics.aiSpeakingTime + metrics.customerSpeakingTime)) * 100
      : 50;

    return {
      aiTalkPercentage: Math.round(aiTalkPercentage),
      customerTalkPercentage: Math.round(100 - aiTalkPercentage),
      listeningScore: this.getListeningScore(sessionId),
      isBalanced: aiTalkPercentage < 60, // AI should talk less than 60%
    };
  }

  /**
   * Clear old session data
   */
  clearOldSessions(maxAgeMins = 60) {
    const now = Date.now();
    const maxAge = maxAgeMins * 60 * 1000;

    for (const [sessionId, metrics] of this.sessionListeningMetrics.entries()) {
      if (now - (metrics.timestamp || 0) > maxAge) {
        this.sessionListeningMetrics.delete(sessionId);
      }
    }
  }
}

export default NaturalListeningBehavior;
