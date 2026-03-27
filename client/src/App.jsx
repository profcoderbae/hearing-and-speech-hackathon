import React, { useState, useRef, useCallback, useEffect } from 'react';
import Header from './components/Header';
import RoomJoin from './components/RoomJoin';
import SpeakerMode from './components/SpeakerMode';
import SignerMode from './components/SignerMode';
import { useSocket } from './hooks/useSocket';
import { TextToSpeechEngine } from './utils/textToSpeech';
import { getSupportedWords } from './utils/signLanguageData';

function App() {
  const {
    connected,
    roomCode,
    messages,
    partnerActivity,
    partnerJoined,
    partnerName,
    socketId,
    createRoom,
    joinRoom,
    setRole,
    sendMessage,
    sendActivity,
  } = useSocket();

  const [userRole, setUserRole] = useState(null); // 'speaker' | 'signer' | null
  const [showRoleSelect, setShowRoleSelect] = useState(false);
  const ttsEngineRef = useRef(null);

  // Initialize TTS engine
  useEffect(() => {
    ttsEngineRef.current = new TextToSpeechEngine();
    return () => ttsEngineRef.current?.stop();
  }, []);

  const handleCreateRoom = useCallback(
    async (name) => {
      await createRoom(name);
      setShowRoleSelect(true);
    },
    [createRoom]
  );

  const handleJoinRoom = useCallback(
    async (code, name) => {
      await joinRoom(code, name);
      setShowRoleSelect(true);
    },
    [joinRoom]
  );

  const handleSelectRole = useCallback(
    async (role) => {
      await setRole(role);
      setUserRole(role);
      setShowRoleSelect(false);
    },
    [setRole]
  );

  const handleLeave = useCallback(() => {
    window.location.reload();
  }, []);

  const handleSendMessage = useCallback(
    (text, type) => {
      sendMessage(text, type);
    },
    [sendMessage]
  );

  const handleActivity = useCallback(
    (isActive, activityType) => {
      sendActivity(isActive, activityType);
    },
    [sendActivity]
  );

  // Step 1: Room Join
  if (!roomCode) {
    return (
      <RoomJoin
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        connected={connected}
      />
    );
  }

  // Step 2: Role Selection
  if (showRoleSelect || !userRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header
          roomCode={roomCode}
          connected={connected}
          partnerJoined={partnerJoined}
          partnerName={partnerName}
          onLeave={handleLeave}
        />

        <div className="max-w-lg mx-auto p-6 mt-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Mode</h2>
            <p className="text-gray-500">How would you like to communicate?</p>
          </div>

          <div className="space-y-4">
            {/* Speaker Mode */}
            <button
              onClick={() => handleSelectRole('speaker')}
              className="w-full bg-white rounded-2xl shadow-lg p-6 text-left hover:shadow-xl transition-shadow border-2 border-transparent hover:border-primary-200 group"
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl p-3 bg-primary-50 rounded-xl group-hover:scale-110 transition-transform">
                  🗣️
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    Speaker Mode
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">
                    I can hear and speak. I'll use my voice or keyboard to communicate.
                  </p>
                  <div className="flex flex-wrap gap-1">
                    <span className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full">
                      🎤 Voice Input
                    </span>
                    <span className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full">
                      ⌨️ Text Input
                    </span>
                    <span className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full">
                      🔊 Audio Output
                    </span>
                  </div>
                </div>
              </div>
            </button>

            {/* Signer Mode */}
            <button
              onClick={() => handleSelectRole('signer')}
              className="w-full bg-white rounded-2xl shadow-lg p-6 text-left hover:shadow-xl transition-shadow border-2 border-transparent hover:border-accent-200 group"
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl p-3 bg-accent-50 rounded-xl group-hover:scale-110 transition-transform">
                  🤟
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    Signer Mode
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">
                    I use sign language. I'll see signs for incoming messages and can sign or type to reply.
                  </p>
                  <div className="flex flex-wrap gap-1">
                    <span className="text-xs bg-accent-50 text-accent-700 px-2 py-0.5 rounded-full">
                      📷 Camera Sign Recognition
                    </span>
                    <span className="text-xs bg-accent-50 text-accent-700 px-2 py-0.5 rounded-full">
                      🤟 Sign Avatar Display
                    </span>
                    <span className="text-xs bg-accent-50 text-accent-700 px-2 py-0.5 rounded-full">
                      ⌨️ Quick Replies
                    </span>
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* Room Code Sharing */}
          {!partnerJoined && (
            <div className="mt-8 bg-white rounded-2xl shadow p-6 text-center">
              <p className="text-sm text-gray-500 mb-3">
                Share this code with your partner to connect:
              </p>
              <div className="text-4xl font-mono font-black text-primary-700 tracking-widest mb-3">
                {roomCode}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(roomCode);
                }}
                className="text-sm text-primary-600 hover:text-primary-800 font-medium"
              >
                📋 Copy Code
              </button>
            </div>
          )}

          {/* Supported Words Reference */}
          <div className="mt-6 bg-white/60 rounded-2xl p-4">
            <details className="group">
              <summary className="text-sm font-medium text-gray-600 cursor-pointer group-open:mb-3">
                📖 Supported ASL Word Signs ({getSupportedWords().length} words)
              </summary>
              <div className="flex flex-wrap gap-1.5">
                {getSupportedWords().map((word) => (
                  <span
                    key={word}
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                  >
                    {word}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Unknown words are shown via fingerspelling (letter by letter)
              </p>
            </details>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Communication Interface
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header
        roomCode={roomCode}
        connected={connected}
        partnerJoined={partnerJoined}
        partnerName={partnerName}
        onLeave={handleLeave}
      />

      <main className="flex-1 overflow-hidden">
        {userRole === 'speaker' ? (
          <SpeakerMode
            messages={messages}
            socketId={socketId}
            onSendMessage={handleSendMessage}
            onActivity={handleActivity}
            partnerActivity={partnerActivity}
            ttsEngine={ttsEngineRef.current}
          />
        ) : (
          <SignerMode
            messages={messages}
            socketId={socketId}
            onSendMessage={handleSendMessage}
            onActivity={handleActivity}
            partnerActivity={partnerActivity}
          />
        )}
      </main>
    </div>
  );
}

export default App;
