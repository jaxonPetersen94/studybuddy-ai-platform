import React, { useState } from 'react';
import {
  Presentation as PresentationIcon,
  Layout,
  Palette,
} from 'lucide-react';
import ChatInput from '../../components/chat/ChatInput';

const Presentation: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [slideCount, setSlideCount] = useState(10);
  const [presentationStyle, setPresentationStyle] = useState('professional');

  const handleSend = () => {
    console.log('Presentation request sent:', inputValue);
    setInputValue('');
  };

  return (
    <div className="min-h-[calc(100vh-69px)] flex items-center justify-center p-6">
      {/* Main Presentation Card */}
      <div className="w-full max-w-2xl">
        <div className="bg-base-200 rounded-box shadow-xl p-8 md:p-12 border border-base-300">
          {/* Icon Header */}
          <div className="flex justify-center mb-4">
            <PresentationIcon className="w-16 h-16 text-info" />
          </div>

          {/* Title */}
          <h1 className="text-3xl lg:text-4xl font-bold text-center text-base-content mb-3 tracking-tight">
            Generate Your Presentation
          </h1>

          {/* Description */}
          <p className="text-base text-center text-base-content/70 mb-8 max-w-xl mx-auto">
            Create professional slide decks in seconds. Perfect for meetings,
            lectures, or any presentation needs.
          </p>

          {/* Configuration Section */}
          <div className="bg-base-100 rounded-lg p-6 mb-6 space-y-5">
            {/* Slide Count and Style */}
            <div className="grid grid-cols-2 gap-4">
              {/* Number of Slides */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-base-content/70 mb-2">
                  <Layout className="w-4 h-4" />
                  Number of Slides
                </label>
                <input
                  type="number"
                  min="3"
                  max="50"
                  value={slideCount}
                  onChange={(e) => setSlideCount(Number(e.target.value))}
                  className="input input-bordered w-full bg-base-100 border-base-content/20 focus:border-accent/50 focus:outline-none"
                />
              </div>

              {/* Presentation Style */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-base-content/70 mb-2">
                  <Palette className="w-4 h-4" />
                  Presentation Style
                </label>
                <select
                  value={presentationStyle}
                  onChange={(e) => setPresentationStyle(e.target.value)}
                  className="select select-bordered w-full bg-base-100 border-base-content/20 focus:border-accent/50 focus:outline-none"
                >
                  <option value="professional">Professional</option>
                  <option value="creative">Creative</option>
                  <option value="minimal">Minimal</option>
                  <option value="academic">Academic</option>
                </select>
              </div>
            </div>
          </div>

          {/* Input Section */}
          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSend={handleSend}
            placeholder="e.g., Marketing Strategy 2025, Climate Change Overview, Introduction to Python..."
          />
        </div>
      </div>
    </div>
  );
};

export default Presentation;
