import React, { useState, useEffect, useRef } from 'react';
import { textToSignSequence, ASL_ALPHABET } from '../utils/signLanguageData';

/**
 * SignLanguageAvatar - Animated character that displays ASL signs
 * Takes text input and displays it as a sequence of sign language gestures
 */
export default function SignLanguageAvatar({ text, autoPlay = true, onComplete }) {
  const [currentSign, setCurrentSign] = useState(null);
  const [signIndex, setSignIndex] = useState(-1);
  const [sequence, setSequence] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const timeoutRef = useRef(null);
  const sequenceRef = useRef([]);

  // Generate sign sequence when text changes
  useEffect(() => {
    if (text) {
      const newSequence = textToSignSequence(text);
      setSequence(newSequence);
      sequenceRef.current = newSequence;
      setDisplayText(text);
      if (autoPlay && newSequence.length > 0) {
        playSequence(newSequence);
      }
    }
  }, [text, autoPlay]);

  const playSequence = (seq) => {
    if (!seq || seq.length === 0) return;
    setIsPlaying(true);
    setSignIndex(0);
    playSign(seq, 0);
  };

  const playSign = (seq, index) => {
    if (index >= seq.length) {
      setIsPlaying(false);
      setSignIndex(-1);
      setCurrentSign(null);
      if (onComplete) onComplete();
      return;
    }

    const sign = seq[index];
    setCurrentSign(sign);
    setSignIndex(index);

    timeoutRef.current = setTimeout(() => {
      playSign(seq, index + 1);
    }, sign.duration || 600);
  };

  const handleReplay = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    playSequence(sequence);
  };

  const handleStop = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsPlaying(false);
    setCurrentSign(null);
    setSignIndex(-1);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className="sign-avatar-container bg-gradient-to-b from-blue-50 to-white rounded-2xl p-6 border border-blue-100">
      {/* Avatar Figure */}
      <div className="flex flex-col items-center">
        {/* Character Body */}
        <div className="relative mb-4">
          {/* Head */}
          <div className="w-20 h-20 bg-amber-200 rounded-full mx-auto flex items-center justify-center relative">
            {/* Face */}
            <div className="flex items-center gap-2 -mt-1">
              <div className="w-2.5 h-2.5 bg-gray-800 rounded-full" />
              <div className="w-2.5 h-2.5 bg-gray-800 rounded-full" />
            </div>
            <div className="absolute bottom-3 w-4 h-2 bg-amber-300 rounded-full" />
            {/* Smile */}
            <div className="absolute bottom-2 w-6 h-3 border-b-2 border-gray-700 rounded-b-full" />
          </div>

          {/* Body */}
          <div className="w-24 h-16 bg-primary-500 rounded-t-lg mx-auto -mt-2 relative">
            {/* Shoulders */}
            <div className="absolute -left-4 top-0 w-8 h-4 bg-primary-500 rounded-l-lg" />
            <div className="absolute -right-4 top-0 w-8 h-4 bg-primary-500 rounded-r-lg" />
          </div>
        </div>

        {/* Hands / Sign Display */}
        <div className="min-h-[160px] flex flex-col items-center justify-center">
          {currentSign ? (
            <div className="text-center animate-sign-hand" key={signIndex}>
              {/* Large gesture emoji */}
              <div className="text-8xl mb-3 drop-shadow-lg">
                {currentSign.gesture}
              </div>

              {/* Current letter or word */}
              <div className="bg-white shadow-md rounded-xl px-6 py-3 mb-2">
                {currentSign.type === 'letter' ? (
                  <span className="text-3xl font-bold text-primary-700">
                    {currentSign.letter}
                  </span>
                ) : currentSign.type === 'word' ? (
                  <span className="text-xl font-semibold text-accent-700">
                    {currentSign.word}
                  </span>
                ) : (
                  <span className="text-gray-400">·</span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-gray-400 max-w-[200px]">
                {currentSign.description}
              </p>
            </div>
          ) : (
            <div className="text-center text-gray-400">
              <div className="text-6xl mb-3 opacity-30">🤲</div>
              <p className="text-sm">Waiting for message...</p>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {isPlaying && sequence.length > 0 && (
          <div className="w-full mt-4">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>
                Sign {signIndex + 1} of {sequence.length}
              </span>
              <span>{currentSign?.type === 'letter' ? 'Fingerspelling' : 'Word Sign'}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-primary-500 h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: `${((signIndex + 1) / sequence.length) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Message Display */}
        {displayText && (
          <div className="mt-4 px-4 py-2 bg-gray-100 rounded-xl text-center">
            <p className="text-xs text-gray-400 mb-1">Message:</p>
            <p className="text-sm font-medium text-gray-700">&quot;{displayText}&quot;</p>
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-2 mt-4">
          {sequence.length > 0 && (
            <>
              <button
                onClick={handleReplay}
                className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg text-sm font-medium hover:bg-primary-200 transition-colors flex items-center gap-1"
              >
                🔄 Replay
              </button>
              {isPlaying && (
                <button
                  onClick={handleStop}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors flex items-center gap-1"
                >
                  ⏹ Stop
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
