import React from 'react';

interface QuizPaperProps {
  children: React.ReactNode;
}

const QuizPaper: React.FC<QuizPaperProps> = ({ children }) => {
  return (
    <div className="w-full max-w-xl">
      <div
        className="relative bg-base-200 rounded-lg shadow-2xl p-8 md:p-12 border border-base-300 flex flex-col"
        style={{ aspectRatio: '8.5 / 11' }}
      >
        {/* Wide Ruled Paper Lines */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          {/* Vertical margin line (red line on left) */}
          <div className="absolute top-0 bottom-0 w-px bg-red-400 left-6" />
          {/* Horizontal ruled lines - starting from line 3 to leave space at top */}
          {[...Array(18)].map((_, i) => (
            <div
              key={i}
              className="absolute left-0 right-0 h-px bg-primary/30"
              style={{ top: `${(i + 3) * 5}%` }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full">{children}</div>
      </div>
    </div>
  );
};

export default QuizPaper;
