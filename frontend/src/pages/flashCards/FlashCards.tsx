import React, { useState } from 'react';
import { SquareStack } from 'lucide-react';
import ChatInput from '../../components/chat/ChatInput';

const FlashCards = () => {
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    console.log('Message sent:', inputValue);
    setInputValue('');
  };

  return (
    <div className="min-h-[calc(100vh-69px)] flex items-center justify-center p-6 select-none">
      {/* Centered Flash Card */}
      <div className="w-full max-w-2xl">
        <div className="relative bg-base-200 rounded-box shadow-2xl p-8 md:p-12 border border-base-300">
          {/* Horizontal Lines Pattern */}
          <div className="absolute inset-0 pointer-events-none opacity-30">
            {/* Top pink line */}
            <div
              className="absolute left-0 right-0 h-px bg-pink-400"
              style={{ top: '16.66%' }}
            />
            {/* Remaining lines */}
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="absolute left-0 right-0 h-px bg-primary/20"
                style={{ top: `${(i + 3) * 8.33}%` }}
              />
            ))}
          </div>

          {/* Original Content */}
          <div className="relative z-10">
            {/* Icon Header */}
            <div className="flex justify-center mb-4">
              <SquareStack className="w-16 h-16 text-secondary" />
            </div>

            {/* Title */}
            <h1 className="text-3xl lg:text-4xl font-bold text-center text-base-content mb-3 tracking-tight select-text">
              Create Your Flash Cards
            </h1>

            {/* Description */}
            <p className="text-base text-center text-base-content/70 mb-8 max-w-2xl mx-auto select-text">
              Describe what you'd like to study and we'll generate personalized
              flashcards powered by AI. Perfect for memorization and quick
              review sessions.
            </p>

            {/* Chat Input */}
            <ChatInput
              value={inputValue}
              onChange={setInputValue}
              onSend={handleSend}
              placeholder="What topic should we create flash cards for?"
              disabled={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashCards;
