import { DCarelaAiGatewayClient } from "./ai-gateway-client.js";

export class DCarelaCrmAi {
  constructor(options) {
    this.gateway = new DCarelaAiGatewayClient(options);
  }

  draftReply(messages, context = {}) {
    return this.gateway.invoke({
      module: "crm",
      operation: "reply_draft",
      messages,
      payload: { context },
      parameters: {
        temperature: 0.3,
        max_tokens: 900,
      },
    });
  }

  summarizeConversation(messages) {
    return this.gateway.invoke({
      module: "crm",
      operation: "conversation_summary",
      messages,
      parameters: {
        temperature: 0.1,
        max_tokens: 700,
      },
    });
  }

  classifyLead(payload) {
    return this.gateway.invoke({
      module: "crm",
      operation: "lead_classification",
      payload,
      parameters: {
        temperature: 0,
        max_tokens: 500,
      },
    });
  }

  campaignCopy(payload) {
    return this.gateway.invoke({
      module: "content",
      operation: "campaign_copy",
      payload,
      parameters: {
        temperature: 0.7,
        max_tokens: 1200,
      },
    });
  }

  photoCaption(payload) {
    return this.gateway.invoke({
      module: "photo",
      operation: "social_caption",
      payload,
      parameters: {
        temperature: 0.8,
        max_tokens: 600,
      },
    });
  }
}
