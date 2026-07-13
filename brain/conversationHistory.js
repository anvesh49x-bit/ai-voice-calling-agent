const conversations = new Map();

export function addConversation(
  callId,
  speaker,
  message
) {
  if (!conversations.has(callId)) {
    conversations.set(callId, []);
  }

  conversations.get(callId).push({
    speaker,
    message
  });
}

export function getConversation(
  callId
) {
  return conversations.get(callId) || [];
}

export function clearConversationHistory(
  callId
) {
  conversations.delete(callId);
}