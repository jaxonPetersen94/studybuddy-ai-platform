import React from 'react';

interface FlashCardProps {
  front?: string;
  back?: string;
  isFlipped?: boolean;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

const FlashCard: React.FC<FlashCardProps> = ({
  front,
  back,
  isFlipped = false,
  onClick,
  className = '',
  children,
}) => {
  return (
    <div
      className={`flex relative bg-base-200 min-h-[436px] rounded-box shadow-2xl p-8 md:p-12 border border-base-300 ${
        onClick ? 'cursor-pointer transition-transform hover:scale-[1.02]' : ''
      } ${className}`}
      onClick={onClick}
    >
      {/* Lined paper background */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div
          className="absolute left-0 right-0 h-px bg-pink-400"
          style={{ top: '16.66%' }}
        />
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute left-0 right-0 h-px bg-primary/20"
            style={{ top: `${(i + 3) * 8.33}%` }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-1 items-center justify-center text-center">
        {children ? (
          <div className="flex flex-col">{children}</div>
        ) : (
          <p className="text-xl md:text-2xl text-base-content">
            {isFlipped ? back : front}
          </p>
        )}
      </div>
    </div>
  );
};

export default FlashCard;
