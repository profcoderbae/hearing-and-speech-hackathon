import React, { useState, useEffect, useRef } from 'react';
import SignLanguageAvatar from './SignLanguageAvatar';
import HandSignRecognition from './HandSignRecognition';
import MessageHistory from './MessageHistory';

/**
 * SignerMode - Interface for the deaf/hard-of-hearing user
 * Shows incoming messages as sign language animations
 * Provides camera-based sign recognition + text input for outgoing messages
 */
export default function SignerMode({
  messages,
  socketId,
  onSendMessage,
  onActivity,
  partnerActivity,
}) {
  const [currentSignText, setCurrentSignText] = useState('');
  const [view, setView] = useState('chat'); // 'chat', 'camera'
  const [signQueue, setSignQueue] = useState([]);
  const prevMessageCountRef = useRef(messages.length);

  // Auto-display new partner messages as signs
  useEffect(() => {
    if (messages.length > prevMessageCountRef.current) {
      const newMessages = messages.slice(prevMessageCountRef.current);
      for (const msg of newMessages) {
        if (msg.senderId !== socketId && msg.type === 'speech') {
          setSignQueue((prev) => [...prev, msg.text]);
        }
      }
    }
    prevMessageCountRef.current = messages.length;
  }, [messages, socketId]);

  // Process sign queue
  useEffect(() => {
    if (signQueue.length > 0 && !currentSignText) {
      setCurrentSignText(signQueue[0]);
      setSignQueue((prev) => prev.slice(1));
    }
  }, [signQueue, currentSignText]);

  const handleSignComplete = () => {
    // Clear the current sign text; the useEffect will pick the next queued item
    setCurrentSignText('');
  };

  const handleSendFromCamera = (text) => {
    onSendMessage(text, 'sign');
    onActivity(false, 'signing');
  };

  const handleSendText = (text) => {
    onSendMessage(text, 'sign');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🤟</span>
          <div>
            <h2 className="font-semibold text-gray-800">Signer Mode</h2>
            <p className="text-xs text-gray-400">
              See signs for incoming messages — sign or type to reply
            </p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => setView('chat')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              view === 'chat'
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            💬 Chat
          </button>
          <button
            onClick={() => setView('camera')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              view === 'camera'
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📷 Camera
          </button>
        </div>
      </div>

      {/* Partner Activity */}
      {partnerActivity?.isActive && (
        <div className="bg-blue-50 px-4 py-2 text-sm text-primary-700 flex items-center gap-2 animate-fade-in">
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          {partnerActivity.name} is {partnerActivity.activityType}...
        </div>
      )}

      {/* Sign Queue Indicator */}
      {signQueue.length > 0 && (
        <div className="bg-yellow-50 px-4 py-1.5 text-xs text-yellow-700 text-center">
          📨 {signQueue.length} more message{signQueue.length > 1 ? 's' : ''} waiting to be shown
        </div>
      )}

      {/* Sign Language Avatar - always visible when playing */}
      {currentSignText && (
        <div className="px-4 pt-4 bg-blue-50 border-b border-blue-100">
          <SignLanguageAvatar
            text={currentSignText}
            autoPlay={true}
            onComplete={handleSignComplete}
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {view === 'chat' ? (
          <>
            {/* Messages */}
            <MessageHistory messages={messages} socketId={socketId} />

            {/* Quick Reply Input */}
            <div className="p-4 bg-white border-t border-gray-100">
              <QuickReplyInput onSend={handleSendText} onActivity={onActivity} />
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto p-4">
            <HandSignRecognition
              onTextReady={handleSendFromCamera}
              isActive={view === 'camera'}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function QuickReplyInput({ onSend, onActivity }) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim()) {
      onSend(text.trim());
      setText('');
    }
  };

  // Quick reply buttons
  const quickReplies = ['Yes', 'No', 'Hello', 'Thank you', 'Please', 'Help', 'I understand', "I don't understand"];

  return (
    <div>
      {/* Quick Reply Buttons */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {quickReplies.map((reply) => (
          <button
            key={reply}
            onClick={() => onSend(reply)}
            className="px-3 py-1.5 bg-accent-50 text-accent-700 rounded-full text-xs font-medium hover:bg-accent-100 transition-colors"
          >
            {reply}
          </button>
        ))}
      </div>

      {/* Text Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            onActivity(true, 'typing');
          }}
          onBlur={() => onActivity(false, 'typing')}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-transparent outline-none transition-all"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="px-6 py-3 gradient-accent text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
