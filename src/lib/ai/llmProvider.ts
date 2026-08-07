import type { ChatMessage, ChatResponse } from '@/types/chat';
import { settingsService } from '@/lib/services/settingsService';
import { prisma } from '@/lib/prisma';

/**
 * Default system prompt for the AI assistant.
 * Used when no custom prompt is configured in SiteSetting.
 */
const DEFAULT_SYSTEM_PROMPT = `You are the AI assistant for Tsianfan (Xiamen) Industry & Trade Co., Ltd., a professional manufacturer of tile display racks, sample boards, and showroom display systems. We have 17 product series and 168 SKUs, exporting 80% to Europe and North America. Help customers with product information, specifications, and inquiries. Encourage visitors to submit inquiries for detailed quotes. Keep responses concise and professional.`;

/**
 * Fallback message when the LLM service is unavailable.
 */
const FALLBACK_MESSAGE =
  "I'm having trouble connecting to our AI service. Please leave your email and we'll get back to you within 24 hours.";

/**
 * LLM Provider - integrates with OpenAI-compatible chat completion APIs.
 *
 * Reads configuration from the SiteSetting table (managed via admin Settings page).
 * Falls back to FAQ keyword matching when AI is not configured (provider = "none").
 */
export class LLMProvider {
  /**
   * Checks if the LLM provider is configured and ready to use.
   * Reads the current configuration from SiteSetting.
   */
  async isConfigured(): Promise<boolean> {
    const provider = await settingsService.get('aiProvider');
    const apiKey = await settingsService.get('aiApiKey');
    return provider === 'openai' && Boolean(apiKey && apiKey.length > 0);
  }

  /**
   * Generates a response using the LLM, or falls back to FAQ matching.
   *
   * @param message - The user's message.
   * @param history - Previous conversation messages for context.
   * @returns LLM-generated response, FAQ-based response, or null.
   */
  async generateResponse(
    message: string,
    history: ChatMessage[]
  ): Promise<ChatResponse | null> {
    const configured = await this.isConfigured();

    if (!configured) {
      // Fall back to FAQ keyword matching
      return this.faqFallback(message);
    }

    try {
      const [apiKey, model, systemPrompt] = await Promise.all([
        settingsService.get('aiApiKey'),
        settingsService.get('aiModel'),
        settingsService.get('aiSystemPrompt'),
      ]);

      const messages = [
        { role: 'system', content: systemPrompt || DEFAULT_SYSTEM_PROMPT },
        ...history.slice(-10).map((m) => ({
          role: m.role.toLowerCase() === 'user' ? 'user' : 'assistant',
          content: m.content,
        })),
        { role: 'user', content: message },
      ];

      // P2-003: Add 15s timeout via AbortController to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15_000);

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model || 'gpt-4o',
          messages,
          max_tokens: 500,
          temperature: 0.7,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error('LLM API error:', response.status, response.statusText);
        return { reply: FALLBACK_MESSAGE, suggestedProducts: [] };
      }

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content;

      if (!reply) {
        return { reply: FALLBACK_MESSAGE, suggestedProducts: [] };
      }

      return {
        reply: reply.trim(),
        suggestedProducts: [],
      };
    } catch (error) {
      console.error('LLM generateResponse error:', error);
      return { reply: FALLBACK_MESSAGE, suggestedProducts: [] };
    }
  }

  /**
   * FAQ-based fallback: matches user message keywords against FAQ entries
   * and returns the best matching answer.
   */
  private async faqFallback(message: string): Promise<ChatResponse | null> {
    try {
      const lowerMessage = message.toLowerCase();
      const faqs = await prisma.fAQ.findMany();

      let bestMatch: { answer: string; score: number } | null = null;

      for (const faq of faqs) {
        let score = 0;

        // Check keywords field
        if (faq.keywords) {
          const keywords = faq.keywords
            .split(',')
            .map((k) => k.trim().toLowerCase())
            .filter((k) => k.length > 0);
          for (const kw of keywords) {
            if (lowerMessage.includes(kw)) {
              score += 3;
            }
          }
        }

        // Check question words
        const questionWords = faq.question
          .toLowerCase()
          .split(/\s+/)
          .filter((w) => w.length > 3);
        for (const word of questionWords) {
          if (lowerMessage.includes(word)) {
            score += 1;
          }
        }

        if (score > 0 && (!bestMatch || score > bestMatch.score)) {
          bestMatch = { answer: faq.answer, score };
        }
      }

      if (bestMatch) {
        return { reply: bestMatch.answer, suggestedProducts: [] };
      }

      return null;
    } catch (error) {
      console.error('FAQ fallback error:', error);
      return null;
    }
  }

  /**
   * Updates the API key and model (for runtime configuration).
   * Deprecated — use the Settings page / SiteSetting table instead.
   */
  configure(_apiKey: string, _model?: string): void {
    // No-op: configuration is now managed via SiteSetting table.
    // This method is kept for backward compatibility.
  }
}

export const llmProvider = new LLMProvider();
