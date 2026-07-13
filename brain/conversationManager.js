export function createConversationState() {
  return {
    greetingDone: false,

    customerName: null,

    language: "unknown",

    currentIntent: null,

    previousIntent: null,

    conversationStage: "GREETING",

    askedAboutCompany: false,

    askedPricing: false,

    askedServices: false,

    requestedDemo: false,

    leadScore: 0
  };
}

export function updateConversationState(state, intent) {
  state.previousIntent = state.currentIntent;
  state.currentIntent = intent;

  switch (intent) {
    case "GREETING":
      state.greetingDone = true;
      state.conversationStage = "INTRODUCTION";
      break;

    case "IDENTITY":
      state.conversationStage = "INTRODUCTION";
      break;

    case "COMPANY_INFO":
      state.askedAboutCompany = true;
      state.conversationStage = "DISCOVERY";
      break;

    case "SERVICE_INQUIRY":
      state.askedServices = true;
      state.conversationStage = "DISCOVERY";
      state.leadScore += 10;
      break;

    case "PRICING":
      state.askedPricing = true;
      state.conversationStage = "QUALIFICATION";
      state.leadScore += 25;
      break;

    case "DEMO_REQUEST":
      state.requestedDemo = true;
      state.conversationStage = "HOT_LEAD";
      state.leadScore += 50;
      break;

    case "CLOSING":
      state.conversationStage = "CLOSING";
      break;
  }

  return state;
}