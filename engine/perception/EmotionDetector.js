import { CustomerEmotion } from "../types.js";

const EMOTION_SIGNALS = [
  {
    emotion: CustomerEmotion.ANGRY,
    patterns: [
      /\bangry\b/i,
      /\bfrustrated\b/i,
      /\bridiculous\b/i,
      /\bworst\b/i,
      /\buseless\b/i,
      /\bterrible\b/i,
      /\bunacceptable\b/i,
      /\bnot happy\b/i,
      /\bcomplain/i
    ],
    weight: 1.2
  },
  {
    emotion: CustomerEmotion.CONFUSED,
    patterns: [
      /\bdon't understand\b/i,
      /\bdont understand\b/i,
      /\bconfused\b/i,
      /\bwhat do you mean\b/i,
      /\bcan you explain\b/i,
      /\bnot clear\b/i,
      /\bhuh\b/i,
      /\bwhat\?/i
    ],
    weight: 1.0
  },
  {
    emotion: CustomerEmotion.NERVOUS,
    patterns: [
      /\bworried\b/i,
      /\bnot sure\b/i,
      /\bmaybe\b/i,
      /\bi hope\b/i,
      /\bscared\b/i,
      /\banxious\b/i
    ],
    weight: 0.9
  },
  {
    emotion: CustomerEmotion.EXCITED,
    patterns: [
      /\bexcited\b/i,
      /\bcan't wait\b/i,
      /\bawesome\b/i,
      /\blove that\b/i,
      /\bperfect\b/i,
      /\bgreat\b/i
    ],
    weight: 0.8
  },
  {
    emotion: CustomerEmotion.HAPPY,
    patterns: [
      /\bthank you\b/i,
      /\bthanks\b/i,
      /\bglad\b/i,
      /\bhappy\b/i,
      /\bsounds good\b/i
    ],
    weight: 0.7
  },
  {
    emotion: CustomerEmotion.TIRED,
    patterns: [
      /\btired\b/i,
      /\blong day\b/i,
      /\bexhausted\b/i,
      /\bcan't talk long\b/i
    ],
    weight: 1.0
  },
  {
    emotion: CustomerEmotion.BUSY,
    patterns: [
      /\bbusy\b/i,
      /\bin a hurry\b/i,
      /\bquickly\b/i,
      /\bshort on time\b/i,
      /\bmake it quick\b/i,
      /\bgot a meeting\b/i
    ],
    weight: 1.1
  },
  {
    emotion: CustomerEmotion.CURIOUS,
    patterns: [
      /\bhow does\b/i,
      /\btell me more\b/i,
      /\binterested\b/i,
      /\bcurious\b/i,
      /\bwhat about\b/i,
      /\bcan you tell me\b/i
    ],
    weight: 0.8
  },
  {
    emotion: CustomerEmotion.IMPATIENT,
    patterns: [
      /\bhow long\b/i,
      /\bstill waiting\b/i,
      /\bcome on\b/i,
      /\bhurry\b/i,
      /\balready told you\b/i,
      /\bwhy is this taking\b/i
    ],
    weight: 1.2
  }
];

/**
 * Detect customer emotional state from transcript text and optional acoustic hints.
 * Returns primary emotion, confidence, and secondary signals for speech planning.
 */
export function detectEmotion(message, priorEmotion = CustomerEmotion.NEUTRAL) {
  const scores = new Map();

  for (const { emotion, patterns, weight } of EMOTION_SIGNALS) {
    let hits = 0;
    for (const pattern of patterns) {
      if (pattern.test(message)) hits++;
    }
    if (hits > 0) {
      scores.set(emotion, hits * weight);
    }
  }

  if (message.includes("!")) {
    scores.set(
      CustomerEmotion.IMPATIENT,
      (scores.get(CustomerEmotion.IMPATIENT) || 0) + 0.5
    );
  }

  if (message.length < 8 && /\?$/.test(message.trim())) {
    scores.set(
      CustomerEmotion.CONFUSED,
      (scores.get(CustomerEmotion.CONFUSED) || 0) + 0.3
    );
  }

  if (scores.size === 0) {
    return {
      primary: priorEmotion || CustomerEmotion.NEUTRAL,
      confidence: 0.4,
      isStable: true
    };
  }

  const sorted = [...scores.entries()].sort((a, b) => b[1] - a[1]);
  const [primary, topScore] = sorted[0];
  const total = [...scores.values()].reduce((a, b) => a + b, 0);

  return {
    primary,
    confidence: Math.min(0.95, topScore / total),
    secondary: sorted[1]?.[0] ?? null,
    isStable: primary === priorEmotion
  };
}
