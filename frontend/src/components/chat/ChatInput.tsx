import React, { useRef, useEffect, useCallback } from 'react';
import { Send, Mic, Camera, Paperclip } from 'lucide-react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onFileUpload?: () => void;
  onVoiceInput?: () => void;
  onCameraInput?: () => void;
  placeholder?: string;
  isTyping?: boolean;
  disabled?: boolean;
  maxHeight?: number;
}

const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  onFileUpload,
  onVoiceInput,
  onCameraInput,
  placeholder = 'Ask me anything, upload a file, or describe what you want to learn...',
  isTyping = false,
  disabled = false,
  maxHeight = 120,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    const { scrollHeight } = textarea;

    const lineHeight = 20;
    const newHeight = Math.min(Math.max(scrollHeight, lineHeight), maxHeight);

    textarea.style.height = `${newHeight}px`;
  }, [maxHeight]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [value, adjustTextareaHeight]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    },
    [onChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey && !disabled) {
        e.preventDefault();
        if (value.trim()) {
          onSend();
        }
      }
    },
    [onSend, disabled, value],
  );

  const handleSend = useCallback(() => {
    if (value.trim() && !disabled) {
      onSend();
    }
  }, [onSend, value, disabled]);

  const handleContainerClick = useCallback(() => {
    if (!disabled && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  const canSend = value.trim() && !disabled;

  return (
    <div className="w-full max-w-3xl mb-8 mx-auto select-none cursor-text">
      <div className="relative select-none">
        <div
          className="p-4 bg-base-100/80 backdrop-blur-sm rounded-2xl border border-base-300/50 shadow-lg select-none"
          onClick={handleContainerClick}
        >
          {/* Text input */}
          <div className="w-full mb-2">
            <div className="flex w-full">
              <textarea
                ref={textareaRef}
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled}
                aria-label="Chat message input"
                rows={1}
                className="w-full resize-none border-0 bg-transparent text-base-content placeholder-base-content/50 focus:outline-none leading-5"
                style={{
                  height: '20px',
                  minHeight: '20px',
                  maxHeight: `${maxHeight}px`,
                  overflow: 'hidden',
                }}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 select-none">
            {onFileUpload && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFileUpload();
                }}
                disabled={disabled}
                className="btn btn-ghost btn-sm btn-circle hover:bg-base-200 disabled:cursor-default"
                title="Attach file"
                aria-label="Attach file"
              >
                <Paperclip className="w-4 h-4" />
              </button>
            )}

            {onVoiceInput && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onVoiceInput();
                }}
                disabled={disabled}
                className="btn btn-ghost btn-sm btn-circle hover:bg-base-200"
                title="Voice input"
                aria-label="Voice input"
              >
                <Mic className="w-4 h-4" />
              </button>
            )}

            {onCameraInput && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCameraInput();
                }}
                disabled={disabled}
                className="btn btn-ghost btn-sm btn-circle hover:bg-base-200"
                title="Camera"
                aria-label="Camera input"
              >
                <Camera className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSend();
              }}
              disabled={!canSend}
              className="btn btn-primary btn-sm btn-circle disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 transition-transform duration-200 ease-out"
              title="Send message"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Typing indicator */}
        {isTyping && (
          <div
            className="absolute -bottom-8 left-4 flex items-center gap-3 text-sm text-base-content/60 select-none"
            role="status"
            aria-label="AI is thinking"
          >
            <div className="flex gap-1" aria-hidden="true">
              {[0, 0.1, 0.2].map((delay, index) => (
                <div
                  key={index}
                  className="w-2 h-2 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: `${delay}s` }}
                />
              ))}
            </div>
            <span className="font-mono text-xs">AI is thinking...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInput;
