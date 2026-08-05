import { prisma } from '@/lib/prisma';
import type { ChatMessage, ChatResponse } from '@/types/chat';
import { ruleEngine } from './rules';
import { llmProvider } from './llmProvider';

/**
 * AI Chat Engine - V1.0 rule-based + product DB retrieval.
 * Routes messages through rules first, falls back to LLM if configured (V2.0).
 */
export class ChatEngine {
  /**
   * Processes an incoming user message and generates a response.
   *
   * Flow:
   * 1. Check rule-based keyword matching (FAQ, product lookup, etc.)
   * 2. If no rule matches, try LLM provider (if API key configured)
   * 3. Default fallback response
   */
  async processMessage(message: string, history: ChatMessage[]): Promise<ChatResponse> {
    const lowerMessage = message.toLowerCase().trim();

    // 1. Try rule-based engine first
    const ruleResponse = await ruleEngine.match(lowerMessage, message);
    if (ruleResponse) {
      return ruleResponse;
    }

    // 2. Try LLM provider if configured (reads from SiteSetting)
    const configured = await llmProvider.isConfigured();
    if (configured) {
      const llmResponse = await llmProvider.generateResponse(message, history);
      if (llmResponse) {
        return llmResponse;
      }
    } else {
      // Even if not "configured" for OpenAI, try FAQ fallback
      const faqResponse = await llmProvider.generateResponse(message, history);
      if (faqResponse) {
        return faqResponse;
      }
    }

    // 3. Default fallback
    return {
      reply: "I'd be happy to help! Could you provide more details about what you're looking for? You can ask about our product series, tile specifications, shipping, or request a quote. You can also use our Spec Finder tool to find the perfect display rack for your tiles.",
      suggestedProducts: [],
    };
  }
}

export const chatEngine = new ChatEngine();
