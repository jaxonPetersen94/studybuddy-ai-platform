import React, { useState, useEffect } from 'react';
import {
  Brain,
  BookOpen,
  Target,
  TrendingUp,
  Clock,
  Zap,
  Award,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  MessageSquare,
  BarChart3,
  PlusCircle,
  Terminal,
  Globe,
  Database,
  Code,
  Lightbulb,
} from 'lucide-react';

interface StudySession {
  id: string;
  subject: string;
  duration: number;
  completed: boolean;
  score?: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  earned: boolean;
  progress: number;
}

const Dashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [studyTimer, setStudyTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('JavaScript');

  // Mock data
  const recentSessions: StudySession[] = [
    {
      id: '1',
      subject: 'React Hooks',
      duration: 45,
      completed: true,
      score: 92,
    },
    {
      id: '2',
      subject: 'TypeScript',
      duration: 60,
      completed: true,
      score: 88,
    },
    { id: '3', subject: 'Node.js APIs', duration: 30, completed: false },
    {
      id: '4',
      subject: 'Database Design',
      duration: 75,
      completed: true,
      score: 95,
    },
  ];

  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'Code_Master',
      description: 'Complete 10 coding sessions',
      icon: <Code className="w-4 h-4" />,
      earned: true,
      progress: 100,
    },
    {
      id: '2',
      title: 'Study_Streak',
      description: '7 days consecutive learning',
      icon: <Zap className="w-4 h-4" />,
      earned: true,
      progress: 100,
    },
    {
      id: '3',
      title: 'Knowledge_Seeker',
      description: 'Explore 5 different subjects',
      icon: <Brain className="w-4 h-4" />,
      earned: false,
      progress: 80,
    },
  ];

  const subjects = [
    { name: 'JavaScript', progress: 85, icon: <Code className="w-4 h-4" /> },
    { name: 'React', progress: 92, icon: <Database className="w-4 h-4" /> },
    {
      name: 'TypeScript',
      progress: 78,
      icon: <Terminal className="w-4 h-4" />,
    },
    { name: 'Node.js', progress: 65, icon: <Globe className="w-4 h-4" /> },
  ];

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      if (isTimerRunning) {
        setStudyTimer((prev) => prev + 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerRunning]);

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    setStudyTimer(0);
    setIsTimerRunning(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Main Content */}
      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Study Timer */}
          <div className="card bg-base-200/80 backdrop-blur-xl border border-base-300/50 shadow-lg">
            <div className="card-body p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-mono text-xs uppercase tracking-wide text-base-content/60">
                  Active_Session
                </h3>
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <div className="text-2xl font-bold font-mono text-primary mb-4">
                {formatTime(studyTimer)}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={toggleTimer}
                  className="btn btn-primary btn-sm flex-1 font-mono text-xs"
                >
                  {isTimerRunning ? (
                    <Pause className="w-3 h-3" />
                  ) : (
                    <Play className="w-3 h-3" />
                  )}
                  {isTimerRunning ? 'PAUSE' : 'START'}
                </button>
                <button
                  onClick={resetTimer}
                  className="btn btn-outline btn-sm font-mono text-xs"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Weekly Progress */}
          <div className="card bg-base-200/80 backdrop-blur-xl border border-base-300/50 shadow-lg">
            <div className="card-body p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-mono text-xs uppercase tracking-wide text-base-content/60">
                  Weekly_Progress
                </h3>
                <TrendingUp className="w-4 h-4 text-success" />
              </div>
              <div className="text-2xl font-bold text-success mb-2">18.5</div>
              <div className="text-xs text-base-content/60 font-mono">
                HOURS_STUDIED
              </div>
              <div className="progress progress-success w-full h-2 mt-3">
                <div className="progress-value" style={{ width: '74%' }}></div>
              </div>
            </div>
          </div>

          {/* Streak */}
          <div className="card bg-base-200/80 backdrop-blur-xl border border-base-300/50 shadow-lg">
            <div className="card-body p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-mono text-xs uppercase tracking-wide text-base-content/60">
                  Current_Streak
                </h3>
                <Zap className="w-4 h-4 text-warning" />
              </div>
              <div className="text-2xl font-bold text-warning mb-2">12</div>
              <div className="text-xs text-base-content/60 font-mono">
                DAYS_CONSECUTIVE
              </div>
            </div>
          </div>

          {/* Average Score */}
          <div className="card bg-base-200/80 backdrop-blur-xl border border-base-300/50 shadow-lg">
            <div className="card-body p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-mono text-xs uppercase tracking-wide text-base-content/60">
                  Avg_Score
                </h3>
                <Award className="w-4 h-4 text-secondary" />
              </div>
              <div className="text-2xl font-bold text-secondary mb-2">
                91.7%
              </div>
              <div className="text-xs text-base-content/60 font-mono">
                QUIZ_ACCURACY
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Studies */}
            <div className="card bg-base-200/80 backdrop-blur-xl border border-base-300/50 shadow-lg">
              <div className="bg-base-300/30 border-b border-base-300/50 px-6 py-4 flex items-center justify-between">
                <h2 className="font-mono text-sm uppercase tracking-wide text-base-content">
                  Active_Studies
                </h2>
                <button className="btn btn-primary btn-sm font-mono text-xs">
                  <PlusCircle className="w-3 h-3" />
                  NEW_SESSION
                </button>
              </div>
              <div className="card-body p-6">
                <div className="space-y-4">
                  {subjects.map((subject, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-base-300/30 rounded-box border border-base-300/50 hover:bg-base-300/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedSubject(subject.name)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-primary">{subject.icon}</div>
                        <div>
                          <div className="font-mono text-sm text-base-content">
                            {subject.name}
                          </div>
                          <div className="text-xs text-base-content/60 font-mono">
                            {subject.progress}% COMPLETE
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-24">
                          <div className="progress progress-primary w-full h-2">
                            <div
                              className="progress-value"
                              style={{ width: `${subject.progress}%` }}
                            ></div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-base-content/40" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Sessions */}
            <div className="card bg-base-200/80 backdrop-blur-xl border border-base-300/50 shadow-lg">
              <div className="bg-base-300/30 border-b border-base-300/50 px-6 py-4">
                <h2 className="font-mono text-sm uppercase tracking-wide text-base-content">
                  Recent_Sessions
                </h2>
              </div>
              <div className="card-body p-6">
                <div className="space-y-3">
                  {recentSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-3 bg-base-300/20 rounded-box border border-base-300/30"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            session.completed ? 'bg-success' : 'bg-warning'
                          }`}
                        ></div>
                        <div>
                          <div className="font-mono text-sm text-base-content">
                            {session.subject}
                          </div>
                          <div className="text-xs text-base-content/60 font-mono">
                            {session.duration}MIN
                          </div>
                        </div>
                      </div>
                      {session.score && (
                        <div className="text-right">
                          <div className="font-mono text-sm text-success">
                            {session.score}%
                          </div>
                          <div className="text-xs text-base-content/60 font-mono">
                            SCORE
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* AI Assistant */}
            <div className="card bg-base-200/80 backdrop-blur-xl border border-base-300/50 shadow-lg">
              <div className="bg-base-300/30 border-b border-base-300/50 px-6 py-4">
                <h2 className="font-mono text-sm uppercase tracking-wide text-base-content">
                  AI_Assistant
                </h2>
              </div>
              <div className="card-body p-6">
                <div className="space-y-4">
                  <div className="bg-base-300/30 rounded-box p-3 border border-base-300/50">
                    <div className="flex items-start space-x-3">
                      <Brain className="w-4 h-4 text-primary mt-1" />
                      <div>
                        <div className="text-xs font-mono text-base-content/60 mb-1">
                          AI_SUGGESTION
                        </div>
                        <div className="text-sm text-base-content font-mono">
                          Based on your progress, I recommend focusing on
                          advanced React patterns today.
                        </div>
                      </div>
                    </div>
                  </div>
                  <button className="btn btn-primary btn-block font-mono text-xs">
                    <MessageSquare className="w-3 h-3" />
                    START_CHAT
                  </button>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="card bg-base-200/80 backdrop-blur-xl border border-base-300/50 shadow-lg">
              <div className="bg-base-300/30 border-b border-base-300/50 px-6 py-4">
                <h2 className="font-mono text-sm uppercase tracking-wide text-base-content">
                  Achievements
                </h2>
              </div>
              <div className="card-body p-6">
                <div className="space-y-3">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`p-3 rounded-box border ${
                        achievement.earned
                          ? 'bg-primary/10 border-primary/30'
                          : 'bg-base-300/20 border-base-300/30'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={`${
                            achievement.earned
                              ? 'text-primary'
                              : 'text-base-content/40'
                          }`}
                        >
                          {achievement.icon}
                        </div>
                        <div className="flex-1">
                          <div
                            className={`font-mono text-sm ${
                              achievement.earned
                                ? 'text-primary'
                                : 'text-base-content/60'
                            }`}
                          >
                            {achievement.title}
                          </div>
                          <div className="text-xs text-base-content/60 font-mono mb-2">
                            {achievement.description}
                          </div>
                          {!achievement.earned && (
                            <div className="progress progress-primary w-full h-1">
                              <div
                                className="progress-value"
                                style={{ width: `${achievement.progress}%` }}
                              ></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card bg-base-200/80 backdrop-blur-xl border border-base-300/50 shadow-lg">
              <div className="bg-base-300/30 border-b border-base-300/50 px-6 py-4">
                <h2 className="font-mono text-sm uppercase tracking-wide text-base-content">
                  Quick_Actions
                </h2>
              </div>
              <div className="card-body p-6">
                <div className="grid grid-cols-2 gap-3">
                  <button className="btn btn-outline btn-sm font-mono text-xs">
                    <BookOpen className="w-3 h-3" />
                    STUDY
                  </button>
                  <button className="btn btn-outline btn-sm font-mono text-xs">
                    <Target className="w-3 h-3" />
                    QUIZ
                  </button>
                  <button className="btn btn-outline btn-sm font-mono text-xs">
                    <BarChart3 className="w-3 h-3" />
                    STATS
                  </button>
                  <button className="btn btn-outline btn-sm font-mono text-xs">
                    <Lightbulb className="w-3 h-3" />
                    HELP
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
