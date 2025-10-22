import React, { useRef } from 'react';
import ChatInput from '../chat/ChatInput';

interface QuestionTypeConfig {
  enabled: boolean;
  value: number;
}

interface QuestionTypes {
  multipleChoice: QuestionTypeConfig;
  trueFalse: QuestionTypeConfig;
  shortAnswer: QuestionTypeConfig;
}

interface QuizFormProps {
  inputValue: string;
  questionCount: number;
  difficulty: string;
  isPercentage: boolean;
  questionTypes: QuestionTypes;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onQuestionCountChange: (count: number) => void;
  onDifficultyChange: (difficulty: string) => void;
  onToggleValueType: () => void;
  onToggleQuestionType: (type: keyof QuestionTypes) => void;
  onUpdateQuestionTypeValue: (type: keyof QuestionTypes, value: number) => void;
  onSend: () => void;
}

const QuizForm: React.FC<QuizFormProps> = ({
  inputValue,
  questionCount,
  difficulty,
  isPercentage,
  questionTypes,
  isLoading,
  onInputChange,
  onQuestionCountChange,
  onDifficultyChange,
  onToggleValueType,
  onToggleQuestionType,
  onUpdateQuestionTypeValue,
  onSend,
}) => {
  const mouseDownTargetRef = useRef<EventTarget | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    mouseDownTargetRef.current = e.target;
  };

  const handleClick = (type: keyof QuestionTypes, e: React.MouseEvent) => {
    // Only toggle if the mousedown happened on the same element (not from an input)
    const mouseDownTarget = mouseDownTargetRef.current as HTMLElement;
    const isFromInput =
      mouseDownTarget?.tagName === 'INPUT' &&
      (mouseDownTarget as HTMLInputElement).type === 'number';

    if (!isFromInput && !isLoading) {
      onToggleQuestionType(type);
    }

    mouseDownTargetRef.current = null;
  };

  return (
    <>
      {/* Title */}
      <h1 className="text-3xl lg:text-4xl font-bold text-center text-base-content mb-2 tracking-tight flex-shrink-0 select-text">
        Create Your Quiz
      </h1>

      {/* Description */}
      <p className="text-base text-center text-base-content/70 mb-0 max-w-md mx-auto flex-shrink-0 select-text">
        Set your preferences below and enter a topic to generate a personalized
        quiz.
      </p>

      {/* Spacer */}
      <div className="flex-grow select-none" />

      {/* Configuration Section */}
      <div className="bg-base-100/30 backdrop-blur-sm rounded-lg p-5 mb-0 space-y-4 flex-shrink-0 border border-base-content/5">
        <div className="grid grid-cols-2 gap-3">
          {/* Number of Questions */}
          <div>
            <label className="block text-xs font-medium text-base-content/60 mb-1.5">
              <span className="select-text cursor-text">
                Number of Questions
              </span>
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={questionCount}
              onChange={(e) => onQuestionCountChange(Number(e.target.value))}
              className="input input-bordered input-sm w-full bg-base-100 border-base-content/10 focus:border-primary/50 focus:outline-none"
              disabled={isLoading}
            />
          </div>

          {/* Difficulty Level */}
          <div>
            <label className="block text-xs font-medium text-base-content/60 mb-1.5">
              <span className="select-text cursor-text">Difficulty Level</span>
            </label>
            <select
              value={difficulty}
              onChange={(e) => onDifficultyChange(e.target.value)}
              className="select select-bordered select-sm w-full bg-base-100 border-base-content/10 focus:border-primary/50 focus:outline-none"
              disabled={isLoading}
            >
              <option>Kindergarten</option>
              <option>1st Grade</option>
              <option>2nd Grade</option>
              <option>3rd Grade</option>
              <option>4th Grade</option>
              <option>5th Grade</option>
              <option>6th Grade</option>
              <option>7th Grade</option>
              <option>8th Grade</option>
              <option>Freshman (9th)</option>
              <option>Sophomore (10th)</option>
              <option>Junior (11th)</option>
              <option>Senior (12th)</option>
              <option>Undergraduate</option>
              <option>Graduate</option>
            </select>
          </div>
        </div>

        {/* Question Types */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-base-content/60">
              <span className="select-text cursor-text">Question Types</span>
            </label>
            <button
              onClick={onToggleValueType}
              className="btn btn-xs btn-ghost min-h-0 h-6 px-2 text-xs hover:bg-base-content/10"
              disabled={isLoading}
            >
              {isPercentage ? 'Percentage' : 'Count'}
            </button>
          </div>
          <div className="space-y-2">
            {/* Multiple Choice */}
            <div
              onMouseDown={handleMouseDown}
              onClick={(e) => handleClick('multipleChoice', e)}
              className={`flex items-center gap-3 p-2.5 rounded-lg bg-base-100/40 border border-base-content/5 transition-all hover:bg-base-100/60 hover:border-base-content/10 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              } select-none`}
            >
              <input
                type="checkbox"
                checked={questionTypes.multipleChoice.enabled}
                onChange={() => {}}
                className="checkbox checkbox-sm checkbox-primary pointer-events-none flex-shrink-0"
              />
              <span className="text-sm flex-1 text-base-content">
                Multiple Choice
              </span>
              <div className="flex items-center justify-end gap-2 w-[5.5rem] h-7">
                {questionTypes.multipleChoice.enabled && (
                  <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={questionTypes.multipleChoice.value}
                      onChange={(e) =>
                        onUpdateQuestionTypeValue(
                          'multipleChoice',
                          Number(e.target.value),
                        )
                      }
                      className="input input-bordered input-sm w-16 h-7 bg-base-100 border-base-content/20 text-center focus:border-primary focus:outline-none tabular-nums px-2 py-0"
                      disabled={isLoading}
                    />
                    <span className="text-sm text-base-content/50 font-medium w-4">
                      {isPercentage ? '%' : '#'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* True/False */}
            <div
              onMouseDown={handleMouseDown}
              onClick={(e) => handleClick('trueFalse', e)}
              className={`flex items-center gap-3 p-2.5 rounded-lg bg-base-100/40 border border-base-content/5 transition-all hover:bg-base-100/60 hover:border-base-content/10 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              } select-none`}
            >
              <input
                type="checkbox"
                checked={questionTypes.trueFalse.enabled}
                onChange={() => {}}
                className="checkbox checkbox-sm checkbox-primary pointer-events-none flex-shrink-0"
              />
              <span className="text-sm flex-1 text-base-content">
                True/False
              </span>
              <div className="flex items-center justify-end gap-2 w-[5.5rem] h-7">
                {questionTypes.trueFalse.enabled && (
                  <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={questionTypes.trueFalse.value}
                      onChange={(e) =>
                        onUpdateQuestionTypeValue(
                          'trueFalse',
                          Number(e.target.value),
                        )
                      }
                      className="input input-bordered input-sm w-16 h-7 bg-base-100 border-base-content/20 text-center focus:border-primary focus:outline-none tabular-nums px-2 py-0"
                      disabled={isLoading}
                    />
                    <span className="text-sm text-base-content/50 font-medium w-4">
                      {isPercentage ? '%' : '#'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Short Answer */}
            <div
              onMouseDown={handleMouseDown}
              onClick={(e) => handleClick('shortAnswer', e)}
              className={`flex items-center gap-3 p-2.5 rounded-lg bg-base-100/40 border border-base-content/5 transition-all hover:bg-base-100/60 hover:border-base-content/10 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              } select-none`}
            >
              <input
                type="checkbox"
                checked={questionTypes.shortAnswer.enabled}
                onChange={() => {}}
                className="checkbox checkbox-sm checkbox-primary pointer-events-none flex-shrink-0"
              />
              <span className="text-sm flex-1 text-base-content">
                Short Answer
              </span>
              <div className="flex items-center justify-end gap-2 w-[5.5rem] h-7">
                {questionTypes.shortAnswer.enabled && (
                  <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={questionTypes.shortAnswer.value}
                      onChange={(e) =>
                        onUpdateQuestionTypeValue(
                          'shortAnswer',
                          Number(e.target.value),
                        )
                      }
                      className="input input-bordered input-sm w-16 h-7 bg-base-100 border-base-content/20 text-center focus:border-primary focus:outline-none tabular-nums px-2 py-0"
                      disabled={isLoading}
                    />
                    <span className="text-sm text-base-content/50 font-medium w-4">
                      {isPercentage ? '%' : '#'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-grow select-none" />

      {/* Chat Input - stays at bottom */}
      <div className="flex-shrink-0">
        <ChatInput
          value={inputValue}
          onChange={onInputChange}
          onSend={onSend}
          placeholder="What topic should we create a quiz for?"
          disabled={isLoading}
        />
      </div>
    </>
  );
};

export default QuizForm;
