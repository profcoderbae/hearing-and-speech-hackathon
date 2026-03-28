import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SpeechRecognizer, isSpeechRecognitionSupported } from '../utils/speechToText';
import SignLanguageAvatar from './SignLanguageAvatar';
import MessageHistory from './MessageHistory';

/**
 * SpeakerMode - Interface for the hearing user
 * Provides speech-to-text and text input to send messages
 * Received messages from the deaf user are shown as text + read aloud via TTS
 */
export default function SpeakerMode({
  messages,
  socketId,
  onSendMessage,
  onActivity,
  partnerActivity,
  ttsEngine,
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [textInput, setTextInput] = useState('');
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [lastSentText, setLastSentText] = useState('');
  const [showSignPreview, setShowSignPreview] = useState(true);
  const recognizerRef = useRef(null);
  const prevMessageCountRef = useRef(messages.length);

  // Initialize speech recognizer
  useEffect(() => {
    if (isSpeechRecognitionSupported()) {
      const recognizer = new SpeechRecognizer();
      recognizer.onResult = (text) => {
        setInterimText('');
        if (text) {
          onSendMessage(text, 'speech');
          onActivity(false, 'speaking');
        }
      };
      recognizer.onInterim = (text) => {
        setInterimText(text);
        onActivity(true, 'speaking');
      };
      recognizer.onStart = () => setIsRecording(true);
      recognizer.onEnd = () => {
        setIsRecording(false);
        setInterimText('');
        onActivity(false, 'speaking');
      };
      recognizer.onError = (err) => {
        console.error('STT error:', err);
        setIsRecording(false);
      };
      recognizerRef.current = recognizer;
    }

    return () => {
      recognizerRef.current?.stop();
    };
  }, [onSendMessage, onActivity]);

  // Track last sent message for sign preview
  useEffect(() => {
    if (messages.length > prevMessageCountRef.current) {
      const newMessages = messages.slice(prevMessageCountRef.current);
      for (const msg of newMessages) {
        if (msg.senderId === socketId && msg.type === 'speech') {
          setLastSentText(msg.text);
        }
      }
    }
    prevMessageCountRef.current = messages.length;
  }, [messages, socketId]);

  // Auto-speak partner messages (from sign language → text)
  useEffect(() => {
    if (autoSpeak && ttsEngine && messages.length > 0) {
      // Find last partner message
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && lastMsg.senderId !== socketId && lastMsg.type === 'sign') {
        ttsEngine.speak(lastMsg.text);
      }
    }
  }, [messages.length, autoSpeak, ttsEngine, socketId]);

  const toggleRecording = () => {
    if (isRecording) {
      recognizerRef.current?.stop();
    } else {
      recognizerRef.current?.start();
    }
  };

  const handleTextSend = () => {
    if (textInput.trim()) {
      onSendMessage(textInput.trim(), 'speech');
      setTextInput('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🗣️</span>
          <div>
            <h2 className="font-semibold text-gray-800">Speaker Mode</h2>
            <p className="text-xs text-gray-400">Speak or type — your partner sees signs</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={autoSpeak}
              onChange={(e) => setAutoSpeak(e.target.checked)}
              className="rounded text-primary-600 focus:ring-primary-500"
            />
            🔊 Auto-speak replies
          </label>
        </div>
      </div>

      {/* Partner Activity */}
      {partnerActivity?.isActive && (
        <div className="bg-accent-50 px-4 py-2 text-sm text-accent-700 flex items-center gap-2 animate-fade-in">
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 bg-accent-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 bg-accent-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 bg-accent-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          {partnerActivity.name} is {partnerActivity.activityType}...
        </div>
      )}

      {/* Sign Language Preview - shows what your message looks like as signs */}
      {showSignPreview && lastSentText && (
        <div className="px-4 pt-3 bg-purple-50 border-b border-purple-100">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-purple-600 font-medium">🤟 Your partner sees this as signs:</span>
            <button
              onClick={() => setLastSentText('')}
              className="text-xs text-purple-400 hover:text-purple-600"
            >
              ✕ Close
            </button>
          </div>
          <SignLanguageAvatar
            text={lastSentText}
            autoPlay={true}
            onComplete={() => {}}
          />
        </div>
      )}

      {/* Messages */}
      <MessageHistory messages={messages} socketId={socketId} />

      {/* Interim Text */}
      {interimText && (
        <div className="px-4 py-2 bg-blue-50 text-primary-700 text-sm italic animate-fade-in">
          <span className="text-xs text-primary-400 mr-2">Listening:</span>
          {interimText}
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100">
        {/* Speech Recognition */}
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={toggleRecording}
            disabled={!isSpeechRecognitionSupported()}
            className={`flex-shrink-0 w-14 h-14 rounded-full font-medium transition-all flex items-center justify-center ${
              isRecording
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse-glow'
                : 'bg-primary-600 text-white hover:bg-primary-700 shadow-md'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isRecording ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            )}
          </button>
          <div className="flex-1">
            {isRecording ? (
              <div className="text-sm text-red-600 font-medium">
                🔴 Recording... Speak now
                <div className="text-xs text-gray-400 mt-0.5">
                  Speech will be automatically converted and sent
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                Tap to start speaking
                {!isSpeechRecognitionSupported() && (
                  <div className="text-xs text-yellow-600 mt-0.5">
                    ⚠️ Speech recognition not supported in this browser. Use Chrome for best results.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Text Input Fallback */}
        <div className="flex gap-2">
          <input
            type="text"
            value={textInput}
            onChange={(e) => {
              setTextInput(e.target.value);
              onActivity(true, 'typing');
            }}
            onBlur={() => onActivity(false, 'typing')}
            onKeyDown={(e) => e.key === 'Enter' && handleTextSend()}
            placeholder="Or type a message..."
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
          />
          <button
            onClick={handleTextSend}
            disabled={!textInput.trim()}
            className="px-6 py-3 gradient-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
