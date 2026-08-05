import { z } from 'zod';

/**
 * Zod validation schema for chat message.
 */
export const chatMessageSchema = z.object({
  sessionId: z.string().min(8, 'Session ID is required'),
  message: z.string().min(1, 'Message cannot be empty').max(2000, 'Message too long'),
  country: z.string().max(100).optional(),
  userAgent: z.string().max(500).optional(),
});

export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
