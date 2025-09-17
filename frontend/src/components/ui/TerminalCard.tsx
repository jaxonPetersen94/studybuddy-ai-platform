import React from 'react';

interface TerminalCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const TerminalCard: React.FC<TerminalCardProps> = ({
  title = 'terminal',
  children,
  className = '',
}) => {
  return (
    <div
      className={`card bg-base-200/80 backdrop-blur-xl border border-base-300/50 shadow-2xl ${className}`}
    >
      <div className="relative bg-base-300/30 border-b border-base-300/50 px-4 py-3 flex items-center rounded-t-box min-h-[3rem]">
        <div className="flex space-x-2 select-none z-10">
          <div className="w-3 h-3 rounded-full bg-error/80"></div>
          <div className="w-3 h-3 rounded-full bg-warning/80"></div>
          <div className="w-3 h-3 rounded-full bg-success/80"></div>
        </div>
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <span className="text-base-content/60 text-xs font-mono whitespace-nowrap">
            {title}
          </span>
        </div>
      </div>

      <div className="card-body">{children}</div>
    </div>
  );
};

export default TerminalCard;
