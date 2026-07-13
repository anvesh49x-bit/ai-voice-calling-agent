const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const ONES = [
  "", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
  "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
  "seventeen", "eighteen", "nineteen"
];

const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

function numberToWords(n) {
  n = Math.floor(Number(n));
  if (!Number.isFinite(n)) return String(n);
  if (n < 20) return ONES[n];
  if (n < 100) {
    const t = Math.floor(n / 10);
    const o = n % 10;
    return o ? `${TENS[t]} ${ONES[o]}` : TENS[t];
  }
  if (n < 1000) {
    const h = Math.floor(n / 100);
    const rest = n % 100;
    return rest ? `${ONES[h]} hundred ${numberToWords(rest)}` : `${ONES[h]} hundred`;
  }
  if (n < 1000000) {
    const th = Math.floor(n / 1000);
    const rest = n % 1000;
    return rest ? `${numberToWords(th)} thousand ${numberToWords(rest)}` : `${numberToWords(th)} thousand`;
  }
  return String(n);
}

function normalizeCurrency(text) {
  return text
    .replace(/\$\s?([\d,]+(?:\.\d{2})?)/g, (_, amt) => {
      const num = parseFloat(amt.replace(/,/g, ""));
      return `${numberToWords(num)} dollars`;
    })
    .replace(/₹\s?([\d,]+)/g, (_, amt) => {
      const num = parseInt(amt.replace(/,/g, ""), 10);
      return `${numberToWords(num)} rupees`;
    })
    .replace(/(\d+)\s*(?:k|K)\b/g, (_, n) => `${numberToWords(parseInt(n, 10) * 1000)}`);
}

function normalizeDates(text) {
  return text
    .replace(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/g, (_, d, m, y) => {
      const day = numberToWords(parseInt(d, 10));
      const month = MONTHS[parseInt(m, 10) - 1] || m;
      return y ? `${month} ${day}, ${y}` : `${month} ${day}`;
    })
    .replace(/\b(\d{1,2})-(\d{1,2})-(\d{2,4})\b/g, (_, d, m, y) => {
      const day = numberToWords(parseInt(d, 10));
      const month = MONTHS[parseInt(m, 10) - 1] || m;
      return `${month} ${day}, ${y}`;
    });
}

function normalizePhones(text) {
  return text.replace(/\+?(\d[\d\s-]{8,}\d)/g, (match) => {
    const digits = match.replace(/\D/g, "");
    return digits.split("").join(" ");
  });
}

function normalizeAbbreviations(text) {
  return text
    .replace(/\bDr\.\s/gi, "Doctor ")
    .replace(/\bMr\.\s/gi, "Mister ")
    .replace(/\bMrs\.\s/gi, "Missus ")
    .replace(/\betc\.\b/gi, "and so on")
    .replace(/\be\.g\.\b/gi, "for example")
    .replace(/\bi\.e\.\b/gi, "that is")
    .replace(/\bASAP\b/gi, "as soon as possible")
    .replace(/\bAPI\b/g, "A P I")
    .replace(/\bURL\b/gi, "U R L")
    .replace(/\bwww\./gi, "w w w dot ")
    .replace(/https?:\/\//gi, "");
}

function normalizeSymbols(text) {
  return text
    .replace(/&/g, " and ")
    .replace(/@/g, " at ")
    .replace(/#/g, " number ")
    .replace(/%/g, " percent ")
    .replace(/\.\.\./g, "... ");
}

function addProsodyPunctuation(text, metadata) {
  let result = text;
  if (metadata?.stress) {
    const word = metadata.stress;
    const re = new RegExp(`\\b${word}\\b`, "i");
    if (re.test(result)) {
      result = result.replace(re, `${word},`);
    }
  }
  if (metadata?.speed === "slow") {
    result = result.replace(/,\s*/g, ", ... ");
  }
  return result;
}

export function optimizeForSpeech(segments, voiceMetadata) {
  return segments.map((segment, index) => {
    let text = segment.text;
    text = normalizeSymbols(text);
    text = normalizeAbbreviations(text);
    text = normalizeCurrency(text);
    text = normalizeDates(text);
    text = normalizePhones(text);
    text = addProsodyPunctuation(text, {
      stress: segment.stress || voiceMetadata?.emphasis,
      speed: voiceMetadata?.speed
    });

    return {
      ...segment,
      text: text.replace(/\s{2,}/g, " ").trim(),
      pause_ms: segment.pause_ms || inferPause(segment, index, voiceMetadata)
    };
  });
}

function inferPause(segment, index, metadata) {
  if (segment.text.endsWith("...")) return 400;
  if (segment.text.includes("Actually")) return 350;
  if (metadata?.speed === "slow") return 280;
  if (index > 0) return 180;
  return 120;
}
