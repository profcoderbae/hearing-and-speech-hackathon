import React from 'react';

export default function Header({ roomCode, connected, partnerJoined, partnerName, onLeave }) {
  return (
    <header className="gradient-primary text-white shadow-lg">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="text-3xl">🤟</div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">SignBridge</h1>
            <p className="text-xs text-blue-200">Communication Without Barriers</p>
          </div>
        </div>

        {/* Room Info */}
        {roomCode && (
          <div className="flex items-center gap-4">
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  connected ? 'bg-green-400' : 'bg-red-400'
                }`}
              />
              <span className="text-sm text-blue-100">
                {connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            {/* Room Code Badge */}
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1.5">
              <span className="text-xs text-blue-200">Room</span>
              <span className="block text-lg font-mono font-bold tracking-wider">
                {roomCode}
              </span>
            </div>

            {/* Partner Status */}
            <div className="text-right">
              {partnerJoined ? (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-sm">{partnerName}</span>
                </div>
              ) : (
                <span className="text-sm text-blue-200">Waiting for partner...</span>
              )}
            </div>

            {/* Leave Button */}
            <button
              onClick={onLeave}
              className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors"
            >
              Leave
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
