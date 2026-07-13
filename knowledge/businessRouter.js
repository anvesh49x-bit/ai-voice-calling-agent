import { COMPANY } from "../knowledge/companyProfile.js";

export function getBusinessReply(message, state) {

  const text = message.toLowerCase();

  // ---------------- Greetings ----------------

  if (
    text === "hello" ||
    text === "hi" ||
    text === "hey"
  ) {

    return `Thank you for calling ${COMPANY.name}. This is Rahul speaking. How can I help you today?`;

  }

  // ---------------- Wait ----------------

  if (
    text.includes("wait") ||
    text.includes("hold on") ||
    text.includes("one second")
  ) {

    return "Sure, take your time. I'll be here.";

  }

  // ---------------- Presence ----------------

  if (
    text.includes("are you there") ||
    text === "hello?" ||
    text === "hello"
  ) {

    return "Yes, I'm here.";

  }

  // ---------------- Company ----------------

  if (
    text.includes("where are you located")
  ) {

    return `${COMPANY.name} is based in ${COMPANY.location}.`;

  }

  if (
    text.includes("where is your office")
  ) {

    return `Our office is in ${COMPANY.location}.`;

  }

  if (
    text.includes("what do you do") ||
    text.includes("services")
  ) {

    return `We provide ${COMPANY.services.join(", ")}.`;

  }

  if (
    text.includes("who founded")
  ) {

    return `${COMPANY.name} was founded by ${COMPANY.founder}.`;

  }

  if (
    text.includes("tell me about your company")
  ) {

    return COMPANY.about;

  }

  // ---------------- Pricing ----------------

  if (
    text.includes("price") ||
    text.includes("cost") ||
    text.includes("budget")
  ) {

    switch (state.requirement) {

      case "Website":
        return COMPANY.pricing.website;

      case "Mobile App":
        return COMPANY.pricing.mobileApp;

      case "CRM Software":
        return COMPANY.pricing.crm;

      case "ERP Software":
        return COMPANY.pricing.erp;

      case "AI Voice Employee":
        return COMPANY.pricing.aiCalling;

    }

  }

  return null;

}