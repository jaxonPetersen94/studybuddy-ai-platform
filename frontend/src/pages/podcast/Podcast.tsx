import React, { useState } from 'react';
import {
  Radio,
  Mic,
  Volume2,
  Clock,
  Play,
  Pause,
  SkipBack,
  SkipForward,
} from 'lucide-react';
import ChatInput from '../../components/chat/ChatInput';

// ChatInput is imported from components

const Podcast: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [duration, setDuration] = useState(10);
  const [voiceStyle, setVoiceStyle] = useState('conversational');
  const [hostCount, setHostCount] = useState('single');

  const handleSend = () => {
    console.log('Podcast request sent:', inputValue);
    setInputValue('');
  };

  return (
    <div className="min-h-[calc(100vh-69px)] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Media Player styled container */}
        <div className="relative bg-base-200 rounded-box shadow-xl border border-base-300 overflow-hidden max-h-[766px]">
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
                {/* Icon without glow */}
                <div className="flex justify-center mb-3">
                  <Radio className="w-16 h-16 text-success" />
                </div>

                <h1 className="text-2xl lg:text-3xl font-bold text-center text-base-content mb-2 tracking-tight">
                  Generate Your Podcast
                </h1>

                <p className="text-sm text-center text-base-content/70 mb-4 max-w-xl mx-auto">
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
                    <label className="flex items-center gap-2 text-xs font-medium text-base-content/70 mb-2 uppercase tracking-wider">
                      <Clock className="w-3.5 h-3.5" />
                      Duration (min)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="60"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="input input-bordered w-full bg-base-100 border-base-content/20 focus:border-success/50 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-xs font-medium text-base-content/70 mb-2 uppercase tracking-wider">
                      <Mic className="w-3.5 h-3.5" />
                      Voice Style
                    </label>
                    <select
                      value={voiceStyle}
                      onChange={(e) => setVoiceStyle(e.target.value)}
                      className="select select-bordered w-full bg-base-100 border-base-content/20 focus:border-success/50 focus:outline-none"
                    >
                      <option value="conversational">Conversational</option>
                      <option value="professional">Professional</option>
                      <option value="enthusiastic">Enthusiastic</option>
                      <option value="calm">Calm & Relaxed</option>
                    </select>
                  </div>
                </div>

                {/* Format buttons */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-medium text-base-content/70 mb-2 uppercase tracking-wider">
                    <Volume2 className="w-3.5 h-3.5" />
                    Podcast Format
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setHostCount('single')}
                      className={`flex-1 py-3 px-4 rounded-lg border transition-all font-medium ${
                        hostCount === 'single'
                          ? 'bg-success/20 border-success text-success shadow-[0_0_20px_rgba(34,197,94,0.3)]'
                          : 'bg-base-200 border-base-content/20 text-base-content hover:border-success/50 hover:bg-base-300'
                      }`}
                    >
                      Solo Host
                    </button>
                    <button
                      onClick={() => setHostCount('dialogue')}
                      className={`flex-1 py-3 px-4 rounded-lg border transition-all font-medium ${
                        hostCount === 'dialogue'
                          ? 'bg-success/20 border-success text-success shadow-[0_0_20px_rgba(34,197,94,0.3)]'
                          : 'bg-base-200 border-base-content/20 text-base-content hover:border-success/50 hover:bg-base-300'
                      }`}
                    >
                      Two Hosts
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
              placeholder="e.g., The Solar System, World War II, Photosynthesis..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Podcast;
