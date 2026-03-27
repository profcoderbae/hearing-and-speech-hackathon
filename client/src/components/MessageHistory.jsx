import React, { useRef, useEffect } from 'react';

export default function MessageHistory({ messages, socketId }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        <div className="text-center">
          <div className="text-4xl mb-2">💬</div>
          <p>Messages will appear here</p>
          <p className="text-xs mt-1">Start a conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((msg) => {
        const isMine = msg.senderId === socketId;
        return (
          <div
            key={msg.id}
            className={`flex ${isMine ? 'justify-end' : 'justify-start'} animate-slide-up`}
          >
            <div
              className={`max-w-[80%] px-4 py-2.5 ${
                isMine ? 'message-bubble-sent' : 'message-bubble-received'
              }`}
            >
              {/* Sender Info */}
              <div
                className={`text-xs mb-1 ${
                  isMine ? 'text-blue-200' : 'text-gray-400'
                }`}
              >
                {isMine ? 'You' : msg.senderName}
                {' · '}
                {msg.type === 'speech' ? '🗣️ Speech' : '🤟 Sign'}
              </div>

              {/* Message Text */}
              <p className="text-sm leading-relaxed">{msg.text}</p>

              {/* Timestamp */}
              <div
                className={`text-xs mt-1 ${
                  isMine ? 'text-blue-200' : 'text-gray-300'
                }`}
              >
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
