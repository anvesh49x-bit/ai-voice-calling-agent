const BANNED_PHRASES = [
  [/I understand your concern\.?/gi, "I hear you."],
  [/I appreciate your patience\.?/gi, "Thanks for waiting."],
  [/Certainly\.?/gi, "Sure."],
  [/I'd be happy to assist\.?/gi, "I can help with that."],
  [/I would be happy to assist\.?/gi, "I can help with that."],
  [/Happy to help\.?/gi, "No problem."],
  [/As an AI[^.]*\.?/gi, ""],
  [/As a language model[^.]*\.?/gi, ""],
  [/Please provide[^.]*\.?/gi, "Can you share that?"],
  [/Thank you for reaching out\.?/gi, "Thanks for calling."],
  [/Is there anything else I can help you with\??/gi, "Anything else?"],
  [/How may I assist you\??/gi, "What can I help with?"],
  [/Wonderful\.?/gi, "Nice."],
  [/Fantastic\.?/gi, "Great."],
  [/Excellent\.?/gi, "Good."],
  [/Kindly\.?/gi, ""],
  [/At your earliest convenience\.?/gi, "when you get a chance"]
];

export function removeAIPatterns(text) {
  let result = text;
  for (const [pattern, replacement] of BANNED_PHRASES) {
    result = result.replace(pattern, replacement);
  }
  return result.replace(/\s{2,}/g, " ").trim();
}

export function dedupeRecentPhrases(text, recentPhrases = []) {
  const normalized = text.toLowerCase().trim();
  for (const prior of recentPhrases) {
    if (prior.toLowerCase().trim() === normalized) {
      return varyResponse(text);
    }
  }
  return text;
}

function varyResponse(text) {
  const swaps = [
    ["Sure.", "Okay."],
    ["Got it.", "Right."],
    ["I see.", "Makes sense."],
    ["No problem.", "Alright."]
  ];
  for (const [from, to] of swaps) {
    if (text.includes(from)) return text.replace(from, to);
  }
  return text.endsWith(".") ? text.replace(/\.$/, "...") : text;
}
