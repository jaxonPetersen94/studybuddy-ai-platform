import React from 'react';

interface SubjectCardProps {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  isSelected: boolean;
  onClick: (id: string) => void;
}

const SubjectCard: React.FC<SubjectCardProps> = ({
  id,
  name,
  icon,
  color,
  description,
  isSelected,
  onClick,
}) => {
  return (
    <button
      onClick={() => onClick(id)}
      className={`p-4 rounded-xl border-2 transition-all hover:scale-105 cursor-pointer ${
        isSelected
          ? 'border-primary bg-primary/10 shadow-lg'
          : 'border-base-300/50 bg-base-100/50 hover:border-primary/50'
      }`}
    >
      <div className={`${color} mb-1.5 flex justify-center`}>{icon}</div>
      <div className="font-mono text-xs text-base-content font-semibold mb-1.5">
        {name}
      </div>
      <div className="text-xs text-base-content/60 leading-tight">
        {description}
      </div>
    </button>
  );
};

export default SubjectCard;
