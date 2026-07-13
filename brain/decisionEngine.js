export function decideNextAction(state) {
  switch (state.currentIntent) {
    case "GREETING":
      return "GREET_CUSTOMER";

    case "IDENTITY":
      return "INTRODUCE_YOURSELF";

    case "COMPANY_INFO":
      return "INTRODUCE_COMPANY";

    case "SERVICE_INQUIRY":
      return "EXPLAIN_SERVICE";

    case "PRICING":
      return "DISCUSS_PRICING";

    case "DEMO_REQUEST":
      return "BOOK_DEMO";

    case "CLOSING":
      return "END_CONVERSATION";

    default:
      return "CONTINUE_CONVERSATION";
  }
}