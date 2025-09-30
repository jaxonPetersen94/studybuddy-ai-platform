import React from 'react';
import { User, Bot, Copy, ThumbsUp, ThumbsDown, RotateCcw } from 'lucide-react';
import { formatTimestamp } from '../../utils/dateUtils';

interface ChatBubbleProps {
  message: string;
  role: 'user' | 'assistant';
  timestamp?: string;
  isTyping?: boolean;
  onCopy?: () => void;
  onLike?: () => void;
  onDislike?: () => void;
  onRegenerate?: () => void;
  avatar?: string;
  userName?: string;
  botName?: string;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  role,
  timestamp,
  isTyping = false,
  onCopy,
  onLike,
  onDislike,
  onRegenerate,
  avatar,
  userName = 'You',
  botName = 'StudyBuddy',
}) => {
  const isUser = role === 'user';

  const TypingIndicator = () => (
    <div className="flex space-x-1 items-center py-2">
      <div className="flex space-x-1">
        <div
          className="w-2 h-2 bg-base-content/40 rounded-full animate-bounce"
          style={{ animationDelay: '0ms' }}
        ></div>
        <div
          className="w-2 h-2 bg-base-content/40 rounded-full animate-bounce"
          style={{ animationDelay: '150ms' }}
        ></div>
        <div
          className="w-2 h-2 bg-base-content/40 rounded-full animate-bounce"
          style={{ animationDelay: '300ms' }}
        ></div>
      </div>
      <span className="text-sm text-base-content/60 ml-2">
        {botName} is typing...
      </span>
    </div>
  );

  return (
    <div
      className={`flex gap-3 mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {/* Avatar - only show for bot messages or when not user */}
      {!isUser && (
        <div className="flex-shrink-0">
          {avatar ? (
            <img
              src={avatar}
              alt={botName}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
          )}
        </div>
      )}

      {/* Message Content */}
      <div
        className={`flex flex-col max-w-[70%] ${
          isUser ? 'items-end' : 'items-start'
        }`}
      >
        {/* Name and timestamp */}
        <div
          className={`flex items-center gap-2 mb-1 ${
            isUser ? 'flex-row-reverse' : 'flex-row'
          }`}
        >
          <span className="text-sm font-medium text-base-content/80">
            {isUser ? userName : botName}
          </span>
          {timestamp && (
            <span className="text-xs text-base-content/50">
              {formatTimestamp(timestamp)}
            </span>
          )}
        </div>

        {/* Message bubble */}
        <div
          className={`
            relative px-4 py-3 rounded-2xl max-w-full shadow-lg
            ${
              isUser
                ? 'bg-primary text-primary-content rounded-br-md'
                : 'bg-base-200 text-base-content rounded-bl-md border border-base-300'
            }
          `}
        >
          {isTyping ? (
            <TypingIndicator />
          ) : (
            <div className="prose prose-sm max-w-none">
              <p className="mb-0 whitespace-pre-wrap break-words leading-relaxed">
                {message}
              </p>
            </div>
          )}
        </div>

        {/* Action buttons - only for bot messages */}
        {!isUser && !isTyping && (
          <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {onCopy && (
              <button
                onClick={onCopy}
                className="p-1.5 rounded-lg hover:bg-base-200 transition-all tooltip tooltip-top cursor-pointer group/btn"
                data-tip="Copy message"
                aria-label="Copy message"
              >
                <Copy
                  className="w-3.5 h-3.5 text-base-content/60 transition-all group-hover/btn:text-base-content group-hover/btn:scale-110 group-hover/btn:-translate-y-0.5"
                  style={{ filter: 'drop-shadow(0 0 0 transparent)' }}
                />
              </button>
            )}
            {onLike && (
              <button
                onClick={onLike}
                className="p-1.5 rounded-lg hover:bg-base-200 transition-all tooltip tooltip-top cursor-pointer group/btn"
                data-tip="Good response"
                aria-label="Like response"
              >
                <ThumbsUp
                  className="w-3.5 h-3.5 text-base-content/60 transition-all group-hover/btn:text-success group-hover/btn:scale-110 group-hover/btn:-translate-y-0.5"
                  style={{ filter: 'drop-shadow(0 0 0 transparent)' }}
                />
              </button>
            )}
            {onDislike && (
              <button
                onClick={onDislike}
                className="p-1.5 rounded-lg hover:bg-base-200 transition-all tooltip tooltip-top cursor-pointer group/btn"
                data-tip="Poor response"
                aria-label="Dislike response"
              >
                <ThumbsDown
                  className="w-3.5 h-3.5 text-base-content/60 transition-all group-hover/btn:text-error group-hover/btn:scale-110 group-hover/btn:-translate-y-0.5"
                  style={{ filter: 'drop-shadow(0 0 0 transparent)' }}
                />
              </button>
            )}
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                className="p-1.5 rounded-lg hover:bg-base-200 transition-all tooltip tooltip-top cursor-pointer group/btn"
                data-tip="Regenerate response"
                aria-label="Regenerate response"
              >
                <RotateCcw
                  className="w-3.5 h-3.5 text-base-content/60 transition-all group-hover/btn:text-base-content group-hover/btn:scale-110 group-hover/btn:-translate-y-0.5"
                  style={{ filter: 'drop-shadow(0 0 0 transparent)' }}
                />
              </button>
            )}
          </div>
        )}
      </div>

      {/* User avatar - only show for user messages */}
      {isUser && (
        <div className="flex-shrink-0">
          {avatar ? (
            <img
              src={avatar}
              alt={userName}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center">
              <User className="w-4 h-4 text-secondary" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatBubble;
