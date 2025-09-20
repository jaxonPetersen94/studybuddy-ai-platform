import React from 'react';

interface PillButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

const PillButton: React.FC<PillButtonProps> = ({
  icon,
  label,
  onClick,
  className = '',
  disabled = false,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center space-x-2 px-3 py-2 rounded-full bg-base-200/60 border border-base-300/40 hover:border-primary/60 hover:bg-primary/10 transition-all text-sm group hover:scale-105 hover:shadow-sm disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none ${className}`}
    >
      <div className="text-primary/80 group-hover:text-primary transition-colors flex-shrink-0">
        {icon}
      </div>
      <span className="font-mono text-xs font-medium text-base-content/80 group-hover:text-base-content transition-colors whitespace-nowrap select-none">
        {label}
      </span>
    </button>
  );
};

export default PillButton;
