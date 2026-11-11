/**
 * Google Gemini API Client
 * Uses the official Google Gen AI SDK with configurable model, token metrics, and error handling.
 */

export interface GeminiGenerateOptions {
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
  responseMimeType?: string;
}

export interface GeminiResponsePayload {
  text: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  model: string;
}

export class GeminiService {
  static getApiKey(): string {
    const key = Deno.env.get('GEMINI_API_KEY');
    if (!key || key.trim() === '') {
      throw new Error(
        'GEMINI_API_KEY is not configured in Supabase Edge Function secrets. Please add it via Supabase Dashboard or CLI.'
      );
    }
    return key.trim();
  }

  static getModel(): string {
    return Deno.env.get('GEMINI_MODEL') || 'gemini-3.5-flash-lite';
  }

  /**
   * Generates text or JSON via Gemini API.
   * Leverages robust REST endpoint with timeout protection.
   */
  static async generate(
    prompt: string,
    options: GeminiGenerateOptions = {}
  ): Promise<GeminiResponsePayload> {
    const apiKey = this.getApiKey();
    const model = this.getModel();
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const body: Record<string, unknown> = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: options.temperature ?? 0.4,
        maxOutputTokens: options.maxOutputTokens ?? 2048,
        responseMimeType: options.responseMimeType || 'text/plain',
      },
    };

    if (options.systemInstruction) {
      body.systemInstruction = {
        parts: [{ text: options.systemInstruction }],
      };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000); // 35 second timeout

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 429) {
          throw new Error('Gemini API quota exceeded or rate limit reached. Please retry in a few moments.');
        }
        if (response.status === 400 || response.status === 403) {
          throw new Error(`Gemini API authorization or parameter error: ${response.status}`);
        }
        throw new Error(`Gemini API returned HTTP ${response.status}: ${errorText.slice(0, 200)}`);
      }

      const result = await response.json();
      const candidate = result.candidates?.[0];
      const text = candidate?.content?.parts?.[0]?.text || '';

      const usageMetadata = result.usageMetadata || {};
      const promptTokens = usageMetadata.promptTokenCount || Math.ceil(prompt.length / 4);
      const completionTokens = usageMetadata.candidatesTokenCount || Math.ceil(text.length / 4);
      const totalTokens = promptTokens + completionTokens;

      return {
        text,
        promptTokens,
        completionTokens,
        totalTokens,
        model,
      };
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      if (err instanceof Error && err.name === 'AbortError') {
        throw new Error('Gemini API request timed out after 35 seconds.');
      }
      throw err;
    }
  }
}
