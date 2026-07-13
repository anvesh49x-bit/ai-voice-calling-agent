import { Intent } from "../types.js";

const INTENT_RULES = [
  {
    intent: Intent.GREETING,
    patterns: [/\bhello\b/i, /\bhi\b/i, /\bhey\b/i, /\bgood (morning|afternoon|evening)\b/i]
  },
  {
    intent: Intent.IDENTITY,
    patterns: [/\bwho are you\b/i, /\byour name\b/i, /\bwho am i speaking\b/i]
  },
  {
    intent: Intent.COMPANY_INFO,
    patterns: [/\bcompany\b/i, /\babout arvex\b/i, /\babout rx\b/i, /\bwho is arvex\b/i]
  },
  {
    intent: Intent.SERVICE_INQUIRY,
    patterns: [
      /\bwebsite\b/i,
      /\bmobile app\b/i,
      /\bapplication\b/i,
      /\bsoftware\b/i,
      /\bai voice\b/i,
      /\bautomation\b/i,
      /\berp\b/i
    ]
  },
  {
    intent: Intent.PRICING,
    patterns: [/\bprice\b/i, /\bcost\b/i, /\bquotation\b/i, /\bhow much\b/i, /\bbudget\b/i]
  },
  {
    intent: Intent.DEMO_REQUEST,
    patterns: [/\bdemo\b/i, /\bmeeting\b/i, /\bschedule\b/i, /\bappointment\b/i, /\bcall back\b/i]
  },
  {
    intent: Intent.CLOSING,
    patterns: [/\bthank\b/i, /\bbye\b/i, /\bgoodbye\b/i, /\bthat's all\b/i, /\bthats all\b/i]
  },
  {
    intent: Intent.CLARIFICATION,
    patterns: [/\bwhat do you mean\b/i, /\bcan you repeat\b/i, /\bsay that again\b/i, /\bwhich one\b/i]
  },
  {
    intent: Intent.COMPLAINT,
    patterns: [/\bcomplain\b/i, /\bnot working\b/i, /\bbroken\b/i, /\bissue\b/i, /\bproblem\b/i]
  }
];

export function classifyIntent(message) {
  const text = message.toLowerCase();

  for (const { intent, patterns } of INTENT_RULES) {
    if (patterns.some((p) => p.test(text))) {
      return intent;
    }
  }

  return Intent.GENERAL;
}

export function decideAction(intent, state) {
  switch (intent) {
    case Intent.GREETING:
      return state.greetingDone ? "CONTINUE_CONVERSATION" : "GREET_CUSTOMER";
    case Intent.IDENTITY:
      return "INTRODUCE_YOURSELF";
    case Intent.COMPANY_INFO:
      return "INTRODUCE_COMPANY";
    case Intent.SERVICE_INQUIRY:
      return "EXPLAIN_SERVICE";
    case Intent.PRICING:
      return "DISCUSS_PRICING";
    case Intent.DEMO_REQUEST:
      return "BOOK_DEMO";
    case Intent.CLOSING:
      return "END_CONVERSATION";
    case Intent.CLARIFICATION:
      return "CLARIFY";
    case Intent.COMPLAINT:
      return "DE_ESCALATE";
    default:
      return "CONTINUE_CONVERSATION";
  }
}
