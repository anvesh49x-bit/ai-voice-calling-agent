export function detectIntent(message) {

  const text = message.toLowerCase();

  if (
    text.includes("hello") ||
    text.includes("hi") ||
    text.includes("hey")
  ) {
    return "GREETING";
  }

  if (
    text.includes("who are you") ||
    text.includes("your name")
  ) {
    return "IDENTITY";
  }

  if (
    text.includes("company") ||
    text.includes("about arvex") ||
    text.includes("about rx")
  ) {
    return "COMPANY_INFO";
  }

  if (
    text.includes("website") ||
    text.includes("mobile app") ||
    text.includes("application") ||
    text.includes("software") ||
    text.includes("ai")
  ) {
    return "SERVICE_INQUIRY";
  }

  if (
    text.includes("price") ||
    text.includes("cost") ||
    text.includes("quotation")
  ) {
    return "PRICING";
  }

  if (
    text.includes("demo") ||
    text.includes("meeting")
  ) {
    return "DEMO_REQUEST";
  }

  if (
    text.includes("thank") ||
    text.includes("bye")
  ) {
    return "CLOSING";
  }

  return "GENERAL";
}