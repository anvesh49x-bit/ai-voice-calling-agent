export function updateConversationFlow(state) {

  // Greeting
  if (state.currentIntent === "GREETING") {
    state.conversationStage = "INTRODUCTION";
  }

  // Customer asking who we are
  else if (state.currentIntent === "IDENTITY") {
    state.conversationStage = "INTRODUCTION";
  }

  // Asking about company
  else if (state.currentIntent === "COMPANY_INFO") {
    state.conversationStage = "DISCOVERY";
  }

  // Interested in services
  else if (state.currentIntent === "SERVICE_INQUIRY") {
    state.conversationStage = "DISCOVERY";
  }

  // Asking price
  else if (state.currentIntent === "PRICING") {
    state.conversationStage = "QUALIFICATION";
  }

  // Wants demo
  else if (state.currentIntent === "DEMO_REQUEST") {
    state.conversationStage = "HOT_LEAD";
  }

  // Ending call
  else if (state.currentIntent === "CLOSING") {
    state.conversationStage = "CLOSING";
  }

  return state;
}