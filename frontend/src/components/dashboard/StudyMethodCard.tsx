import React from 'react';

interface StudyMethodCardProps {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  onClick: (methodId: string) => void;
}

const StudyMethodCard: React.FC<StudyMethodCardProps> = ({
  id,
  name,
  icon,
  color,
  description,
  onClick,
}) => {
  return (
    <button
      onClick={() => onClick(id)}
      className="group relative bg-gradient-to-br from-base-200/90 via-base-200/70 to-base-200/90 backdrop-blur-sm rounded-box p-8 transition-all duration-500 hover:scale-110 hover:-rotate-1 border border-base-300/40 hover:border-primary/50 overflow-hidden cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5),0_8px_24px_rgba(0,0,0,0.4)]"
    >
      {/* Subtle base glow for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-secondary/3 opacity-100" />

      {/* Animated gradient background - theme colors */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-secondary/0 to-accent/0 opacity-0 group-hover:opacity-15 transition-opacity duration-500" />

      {/* Radial glow effect - primary color */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.08),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Animated corner accents - brand colors */}
      <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-primary/0 group-hover:border-primary transition-all duration-500 rounded-tl-box" />
      <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-secondary/0 group-hover:border-secondary transition-all duration-500 delay-75 rounded-tr-box" />
      <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-accent/0 group-hover:border-accent transition-all duration-500 delay-150 rounded-bl-box" />
      <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-primary/0 group-hover:border-primary transition-all duration-500 delay-100 rounded-br-box" />

      {/* Multiple scan line effects - cyber theme */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/10 to-transparent translate-y-[-200%] group-hover:translate-y-[200%] transition-transform duration-1500" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-secondary/5 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-2000" />

      {/* Particle effects - theme colors */}
      <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-primary rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping" />
      <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-secondary rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping animation-delay-150" />
      <div className="absolute bottom-1/3 right-1/4 w-1 h-1 bg-accent rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping animation-delay-300" />

      <div className="relative flex flex-col items-center text-center space-y-4 z-10">
        {/* Icon with enhanced glow */}
        <div className="relative">
          <div
            className={`absolute inset-0 ${color} blur-2xl opacity-0 group-hover:opacity-70 transition-all duration-500 scale-150`}
          >
            {icon}
          </div>
          <div
            className={`${color} transition-all duration-500 group-hover:scale-125 group-hover:rotate-12 group-hover:drop-shadow-[0_0_20px_rgba(34,211,238,0.8)]`}
          >
            {icon}
          </div>
        </div>

        <div className="transition-all duration-300 group-hover:translate-y-1">
          <h3 className="font-bold text-base-content text-xl mb-2 tracking-wide group-hover:text-primary transition-colors duration-300 group-hover:drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
            {name}
          </h3>
          <p className="text-xs text-base-content/60 font-mono uppercase tracking-widest group-hover:text-primary/80 transition-colors duration-300">
            {description}
          </p>
        </div>

        {/* Hover indicator - brand gradient */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary via-secondary to-accent group-hover:w-3/4 transition-all duration-500 rounded-full" />
      </div>
    </button>
  );
};

export default StudyMethodCard;
