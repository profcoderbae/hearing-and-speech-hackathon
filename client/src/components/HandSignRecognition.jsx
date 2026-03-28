import React, { useRef, useEffect, useState, useCallback } from 'react';
import { classifyHandGesture, GestureBuffer } from '../utils/handGestureClassifier';

/**
 * HandSignRecognition - Camera feed with MediaPipe hand detection
 * Captures sign language gestures and converts them to text
 */
export default function HandSignRecognition({ onTextReady, isActive }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const handsRef = useRef(null);
  const cameraRef = useRef(null);
  const gestureBufferRef = useRef(new GestureBuffer(10));
  const recognizedLettersRef = useRef([]);
  const lastLetterTimeRef = useRef(0);
  const holdStartRef = useRef(null);
  const currentHeldLetterRef = useRef(null);

  const [cameraStarted, setCameraStarted] = useState(false);
  const [currentGesture, setCurrentGesture] = useState(null);
  const [recognizedText, setRecognizedText] = useState('');
  const [currentLetter, setCurrentLetter] = useState('');
  const [holdProgress, setHoldProgress] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const HOLD_DURATION = 1200; // ms to hold a sign to register it

  // Initialize MediaPipe Hands
  const initHands = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Dynamically import MediaPipe
      const handsModule = await import('@mediapipe/hands');
      const Hands = handsModule.Hands;
      const HAND_CONNECTIONS = handsModule.HAND_CONNECTIONS;
      const { Camera } = await import('@mediapipe/camera_utils');
      const { drawConnectors, drawLandmarks } = await import('@mediapipe/drawing_utils');

      const hands = new Hands({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        },
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.5,
      });

      hands.onResults((results) => {
        try {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          // Draw camera feed
          ctx.save();
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];

            // Draw hand landmarks
            drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {
              color: '#22c55e',
              lineWidth: 3,
            });
            drawLandmarks(ctx, landmarks, {
              color: '#3b82f6',
              lineWidth: 1,
              radius: 4,
            });

            // Classify gesture
            const classification = classifyHandGesture(landmarks);
            const stable = gestureBufferRef.current.add(classification);

            if (stable && stable.letter !== '?') {
              setCurrentGesture(stable);
              handleStableGesture(stable.letter);
            } else {
              setCurrentGesture(null);
              resetHold();
            }
          } else {
            setCurrentGesture(null);
            resetHold();
          }

          ctx.restore();
        } catch (err) {
          console.error('Error in hand detection results:', err);
        }
      });

      handsRef.current = hands;

      // Start camera
      if (videoRef.current) {
        const camera = new Camera(videoRef.current, {
          onFrame: async () => {
            try {
              if (handsRef.current && videoRef.current) {
                await handsRef.current.send({ image: videoRef.current });
              }
            } catch (err) {
              console.error('Error processing camera frame:', err);
            }
          },
          width: 640,
          height: 480,
        });

        cameraRef.current = camera;
        await camera.start();
        setCameraStarted(true);
      }
    } catch (err) {
      console.error('Failed to init hand tracking:', err);
      setError('Failed to start camera. Please allow camera access and try again.');
    }

    setLoading(false);
  }, []);

  const handleStableGesture = useCallback((letter) => {
    const now = Date.now();

    if (currentHeldLetterRef.current === letter) {
      // Still holding the same letter
      const elapsed = now - holdStartRef.current;
      const progress = Math.min(elapsed / HOLD_DURATION, 1);
      setHoldProgress(progress);
      setCurrentLetter(letter);

      if (elapsed >= HOLD_DURATION && now - lastLetterTimeRef.current > HOLD_DURATION) {
        // Letter confirmed!
        recognizedLettersRef.current.push(letter);
        const text = recognizedLettersRef.current.join('');
        setRecognizedText(text);
        lastLetterTimeRef.current = now;
        holdStartRef.current = now; // Reset for continuous hold
        setHoldProgress(0);
      }
    } else {
      // New letter detected
      currentHeldLetterRef.current = letter;
      holdStartRef.current = now;
      setHoldProgress(0);
      setCurrentLetter(letter);
    }
  }, []);

  const resetHold = () => {
    currentHeldLetterRef.current = null;
    holdStartRef.current = null;
    setHoldProgress(0);
    setCurrentLetter('');
  };

  const handleAddSpace = () => {
    recognizedLettersRef.current.push(' ');
    setRecognizedText(recognizedLettersRef.current.join(''));
  };

  const handleBackspace = () => {
    recognizedLettersRef.current.pop();
    setRecognizedText(recognizedLettersRef.current.join(''));
  };

  const handleClear = () => {
    recognizedLettersRef.current = [];
    setRecognizedText('');
  };

  const handleSend = () => {
    const text = recognizedText.trim();
    if (text && onTextReady) {
      onTextReady(text);
      handleClear();
    }
  };

  const stopCamera = () => {
    if (cameraRef.current) {
      cameraRef.current.stop();
    }
    setCameraStarted(false);
  };

  useEffect(() => {
    // Update hold progress animation
    let animFrame;
    const updateProgress = () => {
      if (currentHeldLetterRef.current && holdStartRef.current) {
        const elapsed = Date.now() - holdStartRef.current;
        setHoldProgress(Math.min(elapsed / HOLD_DURATION, 1));
      }
      animFrame = requestAnimationFrame(updateProgress);
    };
    animFrame = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(animFrame);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
      if (handsRef.current) {
        handsRef.current.close();
      }
    };
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Camera View */}
      <div className="relative bg-gray-900 aspect-video">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover opacity-0"
          playsInline
        />
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className="w-full h-full object-cover"
        />

        {/* Overlay */}
        <div className="camera-overlay" />

        {/* Current Detection Display */}
        {cameraStarted && (
          <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
            {/* Current Letter */}
            <div className="bg-black/50 backdrop-blur-sm rounded-xl px-4 py-2 text-white">
              {currentGesture ? (
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-green-400">
                    {currentGesture.letter}
                  </span>
                  <div>
                    <div className="text-xs text-gray-300">
                      {currentGesture.gesture.replace('_', ' ')}
                    </div>
                    <div className="text-xs text-gray-400">
                      {Math.round(currentGesture.confidence * 100)}% confident
                    </div>
                  </div>
                </div>
              ) : (
                <span className="text-sm text-gray-400">Show a sign...</span>
              )}
            </div>

            {/* Recording indicator */}
            <div className="bg-red-500 rounded-full px-3 py-1 flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-white text-xs font-medium">LIVE</span>
            </div>
          </div>
        )}

        {/* Hold Progress Ring */}
        {holdProgress > 0 && currentLetter && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <div className="relative w-16 h-16">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="15.91"
                  fill="rgba(0,0,0,0.5)"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="2"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.91"
                  fill="none"
                  stroke={holdProgress >= 1 ? '#22c55e' : '#3b82f6'}
                  strokeWidth="2.5"
                  strokeDasharray={`${holdProgress * 100} 100`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-white text-lg font-bold">
                {currentLetter}
              </span>
            </div>
          </div>
        )}

        {/* Start Camera Button */}
        {!cameraStarted && !loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <button
              onClick={initHands}
              className="gradient-accent text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:opacity-90 transition-opacity flex items-center gap-3"
            >
              <span className="text-2xl">📷</span>
              Start Camera
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center text-white">
              <svg className="animate-spin h-12 w-12 mx-auto mb-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-sm">Loading hand tracking model...</p>
              <p className="text-xs text-gray-400 mt-1">This may take a moment</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 p-4">
            <div className="text-center">
              <div className="text-4xl mb-3">⚠️</div>
              <p className="text-red-400 text-sm mb-4">{error}</p>
              <button
                onClick={initHands}
                className="bg-primary-600 text-white px-6 py-2 rounded-xl text-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Recognized Text */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Recognized Signs:</span>
          <div className="flex gap-1">
            <button
              onClick={handleAddSpace}
              className="px-2 py-1 bg-gray-100 rounded text-xs hover:bg-gray-200"
              title="Add space"
            >
              Space
            </button>
            <button
              onClick={handleBackspace}
              className="px-2 py-1 bg-gray-100 rounded text-xs hover:bg-gray-200"
              title="Backspace"
            >
              ⌫
            </button>
            <button
              onClick={handleClear}
              className="px-2 py-1 bg-red-50 text-red-600 rounded text-xs hover:bg-red-100"
              title="Clear all"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-3 min-h-[50px] mb-3 font-mono text-lg">
          {recognizedText || (
            <span className="text-gray-300">Signs will appear here...</span>
          )}
          <span className="inline-block w-0.5 h-5 bg-primary-500 animate-pulse ml-0.5" />
        </div>

        <button
          onClick={handleSend}
          disabled={!recognizedText.trim()}
          className="w-full gradient-accent text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <span>📤</span>
          Send Message
        </button>

        {/* Quick text input as fallback */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-400 mb-2">Or type a message directly:</p>
          <QuickTextInput onSend={onTextReady} />
        </div>
      </div>
    </div>
  );
}

function QuickTextInput({ onSend }) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim() && onSend) {
      onSend(text.trim());
      setText('');
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        placeholder="Type your message..."
        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500 focus:border-transparent outline-none"
      />
      <button
        onClick={handleSend}
        disabled={!text.trim()}
        className="px-4 py-2 bg-accent-600 text-white rounded-lg text-sm font-medium hover:bg-accent-700 disabled:opacity-50 transition-colors"
      >
        Send
      </button>
    </div>
  );
}
