export function updateCustomerProfile(state, message) {

  const text = message.toLowerCase();

  state.language =
    /[అ-హ]/.test(message)
      ? "Telugu"
      : "English";

  const patterns = [

    /my name is (.+)/i,

    /this is (.+)/i,

    /i am (.+)/i,

    /i'm (.+)/i
  ];

  for (const pattern of patterns) {

    const match = message.match(pattern);

    if (match) {
state.customerName = match[1]
  .trim()
  .replace(/[.,!?]+$/, "");
     
      break;
    }
  }

  if (
    text.includes("hospital")
  ) {

    state.industry = "Healthcare";

    state.businessOwner = true;

    state.leadScore += 30;
  }

  if (
    text.includes("restaurant")
  ) {

    state.industry = "Restaurant";

    state.businessOwner = true;

    state.leadScore += 30;
  }

  if (
    text.includes("website")
  ) {

    state.requirement = "Website";

    state.leadScore += 20;
  }

  return state;
}