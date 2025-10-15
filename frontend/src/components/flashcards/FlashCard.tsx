import React from 'react';

interface FlashCardProps {
  front?: string;
  back?: string;
  isFlipped?: boolean;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
  showLinedBackground?: boolean;
}

const LinedPaperBackground: React.FC = () => (
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
);

interface CardFaceProps {
  content?: string;
  isBack?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  showLinedBackground?: boolean;
}

const CardFace: React.FC<CardFaceProps> = ({
  content,
  isBack = false,
  onClick,
  children,
  showLinedBackground = false,
}) => (
  <div
    className="absolute inset-0 bg-base-200 min-h-[436px] rounded-box shadow-2xl p-8 border border-base-300"
    style={{
      backfaceVisibility: 'hidden',
      WebkitBackfaceVisibility: 'hidden',
      transform: isBack ? 'rotateY(180deg)' : undefined,
    }}
    onClick={onClick}
  >
    {(isBack || showLinedBackground) && <LinedPaperBackground />}
    <div className="relative z-10 flex items-center justify-center text-center h-full">
      {children ? (
        <div className="flex flex-col h-full justify-between">{children}</div>
      ) : (
        <p className="text-xl md:text-2xl text-base-content">{content}</p>
      )}
    </div>
  </div>
);

const FlashCard: React.FC<FlashCardProps> = ({
  front,
  back,
  isFlipped = false,
  onClick,
  className = '',
  children,
  showLinedBackground = false,
}) => (
  <div
    className={`relative w-full min-h-[436px] select-none ${className}`}
    style={{ perspective: '1000px' }}
  >
    <div
      className={`relative w-full h-full transition-transform duration-600 ease-in-out ${
        onClick ? 'cursor-pointer' : ''
      }`}
      style={{
        transformStyle: 'preserve-3d',
        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
      }}
      onClick={onClick}
    >
      {/* Front face */}
      <CardFace
        content={front}
        onClick={onClick}
        showLinedBackground={showLinedBackground}
      >
        {children}
      </CardFace>
      {/* Back face */}
      <CardFace
        content={back}
        isBack
        onClick={onClick}
        showLinedBackground={showLinedBackground}
      >
        {children}
      </CardFace>
    </div>
  </div>
);

export default FlashCard;
