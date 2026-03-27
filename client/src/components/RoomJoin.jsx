import React, { useState } from 'react';

export default function RoomJoin({ onCreateRoom, onJoinRoom, connected }) {
  const [name, setName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [mode, setMode] = useState('choose'); // 'choose', 'create', 'join'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onCreateRoom(name.trim());
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleJoin = async () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!joinCode.trim()) {
      setError('Please enter the room code');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onJoinRoom(joinCode.trim(), name.trim());
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="w-full max-w-md">
        {/* Hero Section */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="text-6xl mb-4">🤟</div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Sign<span className="text-primary-600">Bridge</span>
          </h1>
          <p className="text-gray-500 text-lg">Communication Without Barriers</p>
          <p className="text-gray-400 text-sm mt-2">
            Bridge the gap between sign language and speech in real-time
          </p>
        </div>

        {/* Connection Status */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div
            className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}
          />
          <span className="text-sm text-gray-500">
            {connected ? 'Connected to server' : 'Connecting...'}
          </span>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 animate-slide-up">
          {/* Name Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-lg"
              maxLength={30}
            />
          </div>

          {mode === 'choose' && (
            <div className="space-y-3">
              <button
                onClick={() => setMode('create')}
                disabled={!connected}
                className="w-full gradient-primary text-white py-4 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-3"
              >
                <span className="text-2xl">🏠</span>
                Create a Room
              </button>
              <button
                onClick={() => setMode('join')}
                disabled={!connected}
                className="w-full bg-gray-100 text-gray-800 py-4 rounded-xl font-semibold text-lg hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-3"
              >
                <span className="text-2xl">🔗</span>
                Join a Room
              </button>
            </div>
          )}

          {mode === 'create' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500 text-center">
                Create a room and share the code with your partner
              </p>
              <button
                onClick={handleCreate}
                disabled={loading || !connected}
                className="w-full gradient-primary text-white py-4 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating...
                  </span>
                ) : (
                  'Create Room'
                )}
              </button>
              <button
                onClick={() => setMode('choose')}
                className="w-full text-gray-500 py-2 text-sm hover:text-gray-700"
              >
                ← Back
              </button>
            </div>
          )}

          {mode === 'join' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room Code
                </label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Enter 6-digit code"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-center text-2xl font-mono tracking-widest uppercase"
                  maxLength={6}
                />
              </div>
              <button
                onClick={handleJoin}
                disabled={loading || !connected}
                className="w-full gradient-accent text-white py-4 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? 'Joining...' : 'Join Room'}
              </button>
              <button
                onClick={() => setMode('choose')}
                className="w-full text-gray-500 py-2 text-sm hover:text-gray-700"
              >
                ← Back
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
              {error}
            </div>
          )}
        </div>

        {/* Feature Cards */}
        <div className="mt-8 grid grid-cols-2 gap-3">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-2xl mb-1">🗣️</div>
            <p className="text-xs text-gray-600">Speech to Sign Language</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-2xl mb-1">🤟</div>
            <p className="text-xs text-gray-600">Sign Language to Speech</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-2xl mb-1">⚡</div>
            <p className="text-xs text-gray-600">Real-time Translation</p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-2xl mb-1">📱</div>
            <p className="text-xs text-gray-600">Works on Any Device</p>
          </div>
        </div>
      </div>
    </div>
  );
}
