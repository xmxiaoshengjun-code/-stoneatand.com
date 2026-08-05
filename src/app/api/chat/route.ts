import { NextRequest, NextResponse } from 'next/server';
import { chatService } from '@/lib/services/chatService';
import { chatMessageSchema } from '@/lib/validations/chat';
import { successResponse, errorResponse } from '@/types/api';

/**
 * POST /api/chat - Processes a chat message and returns AI response.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = chatMessageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        errorResponse(400, 'Invalid input', parsed.error.flatten().fieldErrors as Record<string, string[]>),
        { status: 400 }
      );
    }

    const response = await chatService.sendMessage(parsed.data);
    return NextResponse.json(successResponse(response));
  } catch (error) {
    console.error('POST /api/chat error:', error);
    return NextResponse.json(errorResponse(500, 'Failed to process chat message'), { status: 500 });
  }
}
