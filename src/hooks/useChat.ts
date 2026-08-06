'use client';

import { useState, useCallback, useRef } from 'react';
import type { ChatMessage } from '@/types/chat';
import { useTracking } from '@/hooks/useTracking';

interface UseChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  sessionId: string;
  sendMessage: (content: string) => Promise<void>;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

/**
 * Hook for managing AI chat widget state and message sending.
 * Generates a persistent session ID per browser session.
 * Tracks chat_start event on the first user message.
 */
export function useChat(): UseChatReturn {
  const { trackChatStart } = useTracking();
  const hasTrackedStartRef = useRef(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 0,
      sessionId: 0,
      role: 'ASSISTANT',
      content: "Hello! I'm TSIANFAN's AI assistant. How can I help you today? Ask about our products, find a rack for your tiles, or request a quote.",
      metadata: null,
      createdAt: new Date().toISOString(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpenState] = useState(false);

  const sessionIdRef = useRef<string>(
    typeof window !== 'undefined'
      ? sessionStorage.getItem('chat_session_id') || generateSessionId()
      : ''
  );

  if (typeof window !== 'undefined' && !sessionStorage.getItem('chat_session_id')) {
    sessionStorage.setItem('chat_session_id', sessionIdRef.current);
  }

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // Track chat_start only on the first user message
    if (!hasTrackedStartRef.current) {
      hasTrackedStartRef.current = true;
      trackChatStart();
    }

    const userMessage: ChatMessage = {
      id: Date.now(),
      sessionId: 0,
      role: 'USER',
      content,
      metadata: null,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          message: content,
        }),
      });

      const data = await res.json();

      if (data.code === 200) {
        const assistantMessage: ChatMessage = {
          id: Date.now() + 1,
          sessionId: 0,
          role: 'ASSISTANT',
          content: data.data.reply,
          metadata: data.data.suggestedProducts ? JSON.stringify(data.data.suggestedProducts) : null,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch {
      const errorMessage: ChatMessage = {
        id: Date.now() + 1,
        sessionId: 0,
        role: 'ASSISTANT',
        content: "I apologize, I'm having trouble responding right now. Please try again or contact us directly at web@tsianfan.com.",
        metadata: null,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [trackChatStart]);

  return {
    messages,
    isLoading,
    sessionId: sessionIdRef.current,
    sendMessage,
    isOpen,
    setIsOpen: setIsOpenState,
  };
}

function generateSessionId(): string {
  return `chat_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}
