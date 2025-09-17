import React from 'react';
import { GraduationCap } from 'lucide-react';

interface AuthHeaderProps {
  title?: string;
  subtitle?: string;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({
  title = 'StudyBuddy AI',
  subtitle = '// Intelligent Learning Platform',
}) => {
  return (
    <div className="text-center mb-8">
      <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-base-200 border-2 border-primary/30 rounded-box relative">
        <GraduationCap size={40} className="text-primary" />
        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-box blur opacity-20"></div>
      </div>
      <h1 className="text-3xl font-bold text-base-content mb-2 tracking-tight">
        {title}
      </h1>
      <p className="text-base-content/60 text-sm font-mono">{subtitle}</p>
    </div>
  );
};

export default AuthHeader;
