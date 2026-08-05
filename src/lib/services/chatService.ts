import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';
import { chatEngine } from '@/lib/ai/chatEngine';
import type { ChatSession, ChatMessage, ChatRequest, ChatResponse } from '@/types/chat';

/**
 * Chat Service - manages AI chat sessions and messages.
 * V1.0 uses rule-based engine; LLM provider is reserved for V2.0.
 */
export class ChatService {
  /**
   * Processes an incoming chat message and returns a response.
   * Creates or retrieves the session, stores messages, and generates a reply.
   */
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    // Find or create session
    let session = await prisma.chatSession.findUnique({
      where: { sessionId: request.sessionId },
    });

    if (!session) {
      session = await prisma.chatSession.create({
        data: {
          sessionId: request.sessionId,
          country: request.country || null,
          userAgent: request.userAgent || null,
          status: 'ACTIVE',
        },
      });
    }

    // Store user message
    await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role: 'USER',
        content: request.message,
      },
    });

    // Get conversation history for context
    const history = await prisma.chatMessage.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: 'asc' },
      take: 20,
    });

    // Generate response using the rule-based engine
    const response = await chatEngine.processMessage(request.message, history as unknown as ChatMessage[]);

    // Store assistant response
    await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role: 'ASSISTANT',
        content: response.reply,
        metadata: response.suggestedProducts ? JSON.stringify(response.suggestedProducts) : null,
      },
    });

    return response;
  }

  /**
   * Fetches chat session history with messages.
   */
  async getSessionHistory(sessionId: string): Promise<ChatSession | null> {
    const session = await prisma.chatSession.findUnique({
      where: { sessionId },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });
    return session as unknown as ChatSession | null;
  }

  /**
   * Generates a unique session ID for new chat sessions.
   */
  generateSessionId(): string {
    return nanoid(32);
  }

  /**
   * Fetches recent chat sessions for admin dashboard.
   */
  async getRecentSessions(limit = 10) {
    return prisma.chatSession.findMany({
      take: limit,
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
  }
}

export const chatService = new ChatService();
