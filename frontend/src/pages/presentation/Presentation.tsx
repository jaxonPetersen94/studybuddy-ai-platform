import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clapperboard, Video, Volume2 } from 'lucide-react';
import ChatInput from '../../components/chat/ChatInput';
import SidebarComponent from '../../components/layout/Sidebar';
import SessionList from '../../components/chat/SessionList';
import { useChatStore } from '../../stores/chat/ChatStore';

const Presentation: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [slideCount, setSlideCount] = useState(10);
  const [secondsPerSlide, setSecondsPerSlide] = useState(30);
  const [presentationStyle, setPresentationStyle] = useState('professional');
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
    loadSessions(true, 'presentation');
  }, [loadSessions]);

  const totalDuration = slideCount * secondsPerSlide;
  const minutes = Math.floor(totalDuration / 60);
  const seconds = totalDuration % 60;

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    setIsLoading(true);

    try {
      // Create session and send message with presentation context
      const session = await createSessionAndSendMessageStream({
        content: inputValue,
        title: `Presentation: ${inputValue.slice(0, 50)}${
          inputValue.length > 50 ? '...' : ''
        }`,
        session_type: 'presentation',
        subject: 'presentation',
        quickAction: 'presentation',
      });

      // Clear input
      setInputValue('');

      // Navigate to the chat session
      navigate(`/chat/${session.id}`);
    } catch (error) {
      console.error('Error creating presentation session:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to create presentation',
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
        <div className="w-full max-w-3xl">
          {/* Video Presentation styled container */}
          <div className="relative bg-base-200 rounded-box shadow-2xl border border-base-300 overflow-hidden select-none">
            {/* Vignette effect */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
              <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-base-300" />
            </div>

            {/* Screen bezel */}
            <div className="relative p-4 md:p-6">
              {/* Main projection screen */}
              <div className="relative bg-base-100 rounded-lg p-6 md:p-10 border border-base-300 shadow-inner mb-4">
                {/* Subtle grid pattern overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-5 rounded-lg">
                  <div
                    className="h-full w-full"
                    style={{
                      backgroundImage:
                        'linear-gradient(0deg, transparent 24%, currentColor 25%, currentColor 26%, transparent 27%, transparent 74%, currentColor 75%, currentColor 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, currentColor 25%, currentColor 26%, transparent 27%, transparent 74%, currentColor 75%, currentColor 76%, transparent 77%, transparent)',
                      backgroundSize: '50px 50px',
                    }}
                  />
                </div>

                <div className="relative z-10">
                  {/* Icon with video and monitor frame */}
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <Clapperboard className="w-16 h-16 text-error" />
                    </div>
                  </div>

                  <h1 className="text-3xl lg:text-4xl font-bold text-center text-base-content mb-3 tracking-tight select-text">
                    Generate Video Presentation
                  </h1>

                  <p className="text-sm text-center text-base-content/70 mb-6 max-w-xl mx-auto select-text">
                    Create an automated video slideshow with AI voiceover
                    narration. Each slide displays for your chosen duration
                    while the audio plays.
                  </p>

                  {/* Decorative slide previews with animation indicator */}
                  <div className="flex justify-center gap-2 mb-4 opacity-30">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-12 h-8 rounded border border-base-content/30 bg-base-200 transition-all ${
                          i === 0 ? 'ring-2 ring-info/50 opacity-100' : ''
                        }`}
                      >
                        <div className="h-2 bg-base-content/20 rounded-t flex items-center justify-center">
                          {i === 0 && <Volume2 className="w-2 h-2 text-info" />}
                        </div>
                        <div className="p-1 space-y-0.5">
                          <div className="h-0.5 bg-base-content/20 w-3/4" />
                          <div className="h-0.5 bg-base-content/20 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total duration display */}
                  <div className="flex justify-center items-center gap-2">
                    <Video className="w-4 h-4 text-error" />
                    <span className="text-sm font-mono text-base-content/70 select-text">
                      Total Duration: {minutes}:
                      {seconds.toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Control panel */}
              <div className="relative bg-base-100 rounded-lg p-4 mb-4 border border-base-300">
                {/* Subtle grid overlay */}
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
                  {/* All three config options in one row */}
                  <div className="grid grid-cols-3 gap-4">
                    {/* Number of Slides */}
                    <div>
                      <label className="block text-xs font-medium text-base-content/60 mb-1.5">
                        Number of Slides
                      </label>
                      <input
                        type="number"
                        min="3"
                        max="50"
                        value={slideCount}
                        onChange={(e) => setSlideCount(Number(e.target.value))}
                        className="input input-bordered w-full bg-base-100 border-base-content/20 focus:border-info/50 focus:outline-none"
                        disabled={isLoading}
                      />
                    </div>

                    {/* Seconds per Slide */}
                    <div>
                      <label className="block text-xs font-medium text-base-content/60 mb-1.5">
                        Seconds per Slide
                      </label>
                      <input
                        type="number"
                        min="10"
                        max="120"
                        value={secondsPerSlide}
                        onChange={(e) =>
                          setSecondsPerSlide(Number(e.target.value))
                        }
                        className="input input-bordered w-full bg-base-100 border-base-content/20 focus:border-info/50 focus:outline-none"
                        disabled={isLoading}
                      />
                    </div>

                    {/* Style */}
                    <div>
                      <label className="block text-xs font-medium text-base-content/60 mb-1.5">
                        Style
                      </label>
                      <select
                        value={presentationStyle}
                        onChange={(e) => setPresentationStyle(e.target.value)}
                        className="select select-bordered w-full bg-base-100 border-base-content/20 focus:border-info/50 focus:outline-none"
                        disabled={isLoading}
                      >
                        <option value="professional">Professional</option>
                        <option value="creative">Creative</option>
                        <option value="minimal">Minimal</option>
                        <option value="academic">Academic</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Input section */}
              <ChatInput
                value={inputValue}
                onChange={setInputValue}
                onSend={handleSend}
                placeholder="What topic should we create a video presentation for?"
                disabled={isLoading}
              />

              {/* Loading Indicator */}
              {isLoading && (
                <div className="mt-4 text-center">
                  <span className="loading loading-spinner loading-md text-error"></span>
                  <p className="text-sm text-base-content/60 mt-2">
                    Creating your presentation...
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

export default Presentation;
