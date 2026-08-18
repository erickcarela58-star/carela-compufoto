export class DCarelaAiGatewayClient {
  constructor(options) {
    this.baseUrl = String(options.baseUrl || "").replace(/\/+$/, "");
    this.getToken = options.getToken;
    this.timeoutMs = Number(options.timeoutMs || 60000);
  }

  async invoke(request) {
    const token = await this.getToken();
    if (!token) throw new Error("ai_gateway_missing_token");

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(
        `${this.baseUrl}/functions/v1/ai-gateway`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
          signal: controller.signal,
        },
      );

      const result = await response.json();

      if (!response.ok) {
        const error = new Error(
          result.error || `ai_gateway_http_${response.status}`,
        );
        error.status = response.status;
        error.details = result;
        throw error;
      }

      return result;
    } finally {
      clearTimeout(timer);
    }
  }

  text(module, operation, messages, parameters = {}) {
    return this.invoke({ module, operation, messages, parameters });
  }

  structured(module, operation, payload, parameters = {}) {
    return this.invoke({ module, operation, payload, parameters });
  }
}
