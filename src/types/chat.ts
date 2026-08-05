/**
 * AI Chat-related TypeScript types.
 */

export type ChatStatus = 'ACTIVE' | 'ENDED' | 'TRANSFERRED';
export type MessageRole = 'USER' | 'ASSISTANT' | 'SYSTEM';

export interface ChatMessage {
  id: number;
  sessionId: number;
  role: MessageRole;
  content: string;
  metadata: string | null;
  createdAt: string;
}

export interface ChatSession {
  id: number;
  sessionId: string;
  customerId: number | null;
  country: string | null;
  userAgent: string | null;
  status: ChatStatus;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface ChatRequest {
  sessionId: string;
  message: string;
  country?: string;
  userAgent?: string;
}

export interface ChatResponse {
  reply: string;
  suggestedProducts?: Array<{
    sku: string;
    name: string;
    url: string;
  }>;
  transferred?: boolean;
  metadata?: Record<string, unknown>;
}
