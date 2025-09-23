export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'study' | 'practice' | 'create' | 'analyze';
  prompt: string;
}

export interface Subject {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}
