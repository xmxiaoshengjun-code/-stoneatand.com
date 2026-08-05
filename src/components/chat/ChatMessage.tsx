import Link from 'next/link';
import { cn } from '@/lib/utils';
import { safeJsonParse } from '@/lib/utils';
import type { ChatMessage as ChatMessageType } from '@/types/chat';

export function ChatMessage({ message }: { message: ChatMessageType }) {
  const isUser = message.role === 'USER';
  const suggestedProducts = !isUser && message.metadata
    ? safeJsonParse<Array<{ sku: string; name: string; url: string }>>(message.metadata, [])
    : [];

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[80%] rounded-lg px-3 py-2 text-sm',
          isUser
            ? 'bg-brand-400 text-white'
            : 'bg-gray-100 text-gray-800'
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>

        {/* Suggested products */}
        {suggestedProducts.length > 0 && (
          <div className="mt-3 space-y-2 border-t border-gray-200 pt-3">
            {suggestedProducts.map((p) => (
              <Link
                key={p.sku}
                href={p.url}
                className="flex items-center gap-2 rounded-md bg-white px-2 py-1.5 text-xs text-gray-700 hover:bg-brand-50"
              >
                <span className="font-mono font-semibold text-brand-400">{p.sku}</span>
                <span className="line-clamp-1">{p.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
