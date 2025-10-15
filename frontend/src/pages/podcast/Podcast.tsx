import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Volume2,
  Play,
  SkipBack,
  SkipForward,
  User,
  Users,
  UserPlus,
  PodcastIcon,
} from 'lucide-react';
import ChatInput from '../../components/chat/ChatInput';
import SidebarComponent from '../../components/layout/Sidebar';
import SessionList from '../../components/chat/SessionList';
import { useChatStore } from '../../stores/chat/ChatStore';

const Podcast: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [duration, setDuration] = useState(10);
  const [voiceStyle, setVoiceStyle] = useState('conversational');
  const [formatType, setFormatType] = useState('single');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    sessions,
    isSidebarOpen,
    loadSessions,
    setSidebarOpen,
    createSessionAndSendMessageStream,
    setError,
  } = useChatStore();

  useEffect(() => {
    loadSessions(true, 'podcast');
  }, [loadSessions]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    setIsLoading(true);

    try {
      // Create session and send message with podcast context
      const session = await createSessionAndSendMessageStream({
        content: inputValue,
        title: `Podcast: ${inputValue.slice(0, 50)}${
          inputValue.length > 50 ? '...' : ''
        }`,
        session_type: 'podcast',
        subject: 'podcast',
        quickAction: 'podcast',
      });

      // Clear input
      setInputValue('');

      // Navigate to the chat session
      navigate(`/chat/${session.id}`);
    } catch (error) {
      console.error('Error creating podcast session:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to create podcast',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSessionClick = (sessionId: string) => {
    navigate(`/chat/${sessionId}`);
  };

  return (
    <div className="min-h-[calc(100vh-69px)] flex flex-col">
      {/* Sidebar */}
      <SidebarComponent
        title="Chat History"
        isOpen={isSidebarOpen}
        onToggle={() => setSidebarOpen(!isSidebarOpen)}
        headerHeight={69}
      >
        <SessionList
          sessions={sessions}
          onNewChat={() => {
            setInputValue('');
            setSidebarOpen(false);
          }}
          onSessionClick={handleSessionClick}
          newChatButtonEnabled={false}
        />
      </SidebarComponent>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          {/* Media Player styled container */}
          <div className="relative bg-base-200 rounded-box shadow-xl border border-base-300 overflow-hidden max-h-[766px] select-none">
            {/* Glowing edge effect */}
            <div className="absolute inset-0 rounded-box opacity-30">
              <div className="absolute inset-0 bg-gradient-to-br from-success/10 via-transparent to-primary/10" />
            </div>

            {/* Screen bezel effect */}
            <div className="relative p-4 md:p-6">
              {/* Digital display screen */}
              <div className="relative bg-base-100 rounded-lg p-6 md:p-8 border border-base-300 shadow-inner mb-4">
                {/* Scanline effect overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-5 rounded-lg">
                  <div
                    className="h-full w-full"
                    style={{
                      backgroundImage:
                        'repeating-linear-gradient(0deg, transparent, transparent 2px, currentColor 2px, currentColor 4px)',
                    }}
                  />
                </div>

                <div className="relative z-10">
                  {/* Icon */}
                  <div className="flex justify-center mb-3">
                    <PodcastIcon className="w-16 h-16 text-success" />
                  </div>

                  <h1 className="text-2xl lg:text-3xl font-bold text-center text-base-content mb-2 tracking-tight select-text">
                    Generate Your Podcast
                  </h1>

                  <p className="text-sm text-center text-base-content/70 mb-4 max-w-xl mx-auto select-text">
                    Turn any topic into an engaging audio learning experience.
                    Perfect for learning on the go or during your commute.
                  </p>

                  {/* Mock playback controls (decorative) */}
                  <div className="flex justify-center items-center gap-4 mb-3 opacity-30">
                    <SkipBack className="w-4 h-4 text-base-content" />
                    <div className="w-10 h-10 rounded-full border-2 border-base-content/30 flex items-center justify-center">
                      <Play className="w-5 h-5 text-base-content ml-0.5" />
                    </div>
                    <SkipForward className="w-4 h-4 text-base-content" />
                  </div>

                  {/* Progress bar (decorative) */}
                  <div className="mb-2">
                    <div className="h-1 bg-base-300 rounded-full overflow-hidden">
                      <div className="h-full w-1/3 bg-success" />
                    </div>
                    <div className="flex justify-between text-xs text-base-content/50 mt-1 font-mono">
                      <span>0:00</span>
                      <span>0:00</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Control panel */}
              <div className="relative bg-base-100 rounded-lg p-4 mb-4 border border-base-300">
                {/* Scanline effect overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-5 rounded-lg">
                  <div
                    className="h-full w-full"
                    style={{
                      backgroundImage:
                        'repeating-linear-gradient(0deg, transparent, transparent 2px, currentColor 2px, currentColor 4px)',
                    }}
                  />
                </div>

                <div className="relative z-10 space-y-4">
                  {/* Duration and Voice Style */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-base-content/60 mb-1.5">
                        Duration (min)
                      </label>
                      <input
                        type="number"
                        min="5"
                        max="60"
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        className="input input-bordered w-full bg-base-100 border-base-content/20 focus:border-success/50 focus:outline-none"
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-base-content/60 mb-1.5">
                        Voice Style
                      </label>
                      <select
                        value={voiceStyle}
                        onChange={(e) => setVoiceStyle(e.target.value)}
                        className="select select-bordered w-full bg-base-100 border-base-content/20 focus:border-success/50 focus:outline-none"
                        disabled={isLoading}
                      >
                        <option value="conversational">Conversational</option>
                        <option value="professional">Professional</option>
                        <option value="enthusiastic">Enthusiastic</option>
                        <option value="calm">Calm & Relaxed</option>
                      </select>
                    </div>
                  </div>

                  {/* Format buttons - 4 in a row */}
                  <div>
                    <label className="flex items-center gap-2 text-xs font-medium text-base-content/70 mb-2 uppercase tracking-wider select-text cursor-text">
                      <Volume2 className="w-3.5 h-3.5" />
                      Podcast Format
                    </label>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                      <button
                        onClick={() => setFormatType('single')}
                        disabled={isLoading}
                        className={`py-3 px-3 rounded-lg border transition-all font-medium flex flex-col items-center gap-1.5 ${
                          formatType === 'single'
                            ? 'bg-success/20 border-success text-success shadow-[0_0_20px_rgba(34,197,94,0.3)]'
                            : 'bg-base-200 border-base-content/20 text-base-content hover:border-success/50 hover:bg-base-300'
                        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <User className="w-5 h-5" />
                        <span className="text-xs">Solo Host</span>
                      </button>
                      <button
                        onClick={() => setFormatType('single-guest')}
                        disabled={isLoading}
                        className={`py-3 px-3 rounded-lg border transition-all font-medium flex flex-col items-center gap-1.5 ${
                          formatType === 'single-guest'
                            ? 'bg-success/20 border-success text-success shadow-[0_0_20px_rgba(34,197,94,0.3)]'
                            : 'bg-base-200 border-base-content/20 text-base-content hover:border-success/50 hover:bg-base-300'
                        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <UserPlus className="w-5 h-5" />
                        <span className="text-xs">Solo + Guest</span>
                      </button>
                      <button
                        onClick={() => setFormatType('dialogue')}
                        disabled={isLoading}
                        className={`py-3 px-3 rounded-lg border transition-all font-medium flex flex-col items-center gap-1.5 ${
                          formatType === 'dialogue'
                            ? 'bg-success/20 border-success text-success shadow-[0_0_20px_rgba(34,197,94,0.3)]'
                            : 'bg-base-200 border-base-content/20 text-base-content hover:border-success/50 hover:bg-base-300'
                        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Users className="w-5 h-5" />
                        <span className="text-xs">Two Hosts</span>
                      </button>
                      <button
                        onClick={() => setFormatType('dialogue-guest')}
                        disabled={isLoading}
                        className={`py-3 px-3 rounded-lg border transition-all font-medium flex flex-col items-center gap-1.5 ${
                          formatType === 'dialogue-guest'
                            ? 'bg-success/20 border-success text-success shadow-[0_0_20px_rgba(34,197,94,0.3)]'
                            : 'bg-base-200 border-base-content/20 text-base-content hover:border-success/50 hover:bg-base-300'
                        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex items-center gap-0.5">
                          <Users className="w-4 h-4" />
                          <UserPlus className="w-4 h-4" />
                        </div>
                        <span className="text-xs">Two + Guest</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Input section */}
              <ChatInput
                value={inputValue}
                onChange={setInputValue}
                onSend={handleSend}
                placeholder="What topic should we create a podcast for?"
                disabled={isLoading}
              />

              {/* Loading Indicator */}
              {isLoading && (
                <div className="mt-4 text-center">
                  <span className="loading loading-spinner loading-md text-success"></span>
                  <p className="text-sm text-base-content/60 mt-2">
                    Creating your podcast...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Podcast;
