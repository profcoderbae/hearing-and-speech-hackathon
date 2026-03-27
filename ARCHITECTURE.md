# SignBridge — Architecture Document

## Overview
SignBridge is a real-time communication bridge between deaf/hard-of-hearing users (who use sign language) and hearing users (who speak/type). Two users connect via a shared room code from separate devices.

## Communication Flows

### Flow 1: Hearing Person → Deaf Person
```
[Hearing User]              [Server]              [Deaf User]
     |                         |                       |
     | Speaks into mic         |                       |
     | (Web Speech API STT)    |                       |
     |   → Text generated      |                       |
     |  ────── text ─────────> |                       |
     |                         | ────── text ────────> |
     |                         |                       | Text → Sign Language
     |                         |                       | Avatar animates ASL
     |                         |                       | (fingerspelling + word signs)
```

### Flow 2: Deaf Person → Hearing Person
```
[Deaf User]                 [Server]              [Hearing User]
     |                         |                       |
     | Signs via camera        |                       |
     | (MediaPipe Hands)       |                       |
     | ML classifies gesture   |                       |
     |   → Text generated      |                       |
     |  ────── text ─────────> |                       |
     |                         | ────── text ────────> |
     |                         |                       | Text displayed
     |                         |                       | Text → Speech (TTS)
     |                         |                       | Audio plays aloud
```

## Technical Architecture

### Frontend (React + Vite)
```
client/
├── src/
│   ├── App.jsx                  # Main app with routing
│   ├── main.jsx                 # Entry point
│   ├── index.css                # Tailwind + custom styles
│   ├── components/
│   │   ├── RoomJoin.jsx         # Room creation/joining UI
│   │   ├── SpeakerMode.jsx      # Hearing user interface
│   │   ├── SignerMode.jsx        # Deaf user interface
│   │   ├── SignLanguageAvatar.jsx # Animated avatar for sign display
│   │   ├── HandSignRecognition.jsx # Camera + ML sign recognition
│   │   ├── MessageHistory.jsx   # Chat/message history display
│   │   └── Header.jsx           # App header
│   ├── utils/
│   │   ├── speechToText.js      # Web Speech API wrapper
│   │   ├── textToSpeech.js      # Speech Synthesis wrapper
│   │   ├── signLanguageData.js  # ASL sign mappings & animation data
│   │   ├── handGestureClassifier.js # ML gesture classification
│   │   └── socket.js            # Socket.io client setup
│   └── hooks/
│       └── useSocket.js         # Socket connection hook
```

### Backend (Express + Socket.io)
```
server/
├── index.js                     # Express server + Socket.io
└── package.json
```

### Key Technologies
| Component | Technology | Purpose |
|-----------|-----------|---------|
| Frontend Framework | React 18 + Vite | Fast SPA with HMR |
| Styling | TailwindCSS | Responsive mobile-first UI |
| Real-time Comm | Socket.io | WebSocket rooms for device pairing |
| Speech → Text | Web Speech API | Browser-native speech recognition |
| Text → Speech | Web Speech Synthesis API | Browser-native text-to-speech |
| Hand Detection | MediaPipe Hands | Real-time hand landmark tracking |
| Sign Recognition | TensorFlow.js | Classify hand poses into ASL letters |
| Sign Display | CSS/JS Animated Avatar | Shows sign language animations |
| Backend | Express.js | API + Socket.io signaling server |

## ASL Recognition Approach

### Phase 1 (MVP — This Build)
- **Fingerspelling recognition**: Detect ASL alphabet (A-Z) using hand landmarks
- **Common phrases**: Pre-trained gestures for frequent phrases (hello, thank you, yes, no, etc.)
- **MediaPipe Hands** provides 21 hand landmarks → fed into a simple classifier

### Phase 2 (Future)
- Full ASL word/sentence recognition using video sequence models
- Integration with professional sign language APIs
- Custom model training with larger datasets

## Sign Language Display Approach

### Phase 1 (MVP — This Build)
- Animated hand illustrations for ASL fingerspelling
- Word-level sign animations for common vocabulary (~50 words)
- Smooth transitions between signs

### Phase 2 (Future)
- 3D avatar using Three.js or similar
- Full body animation for grammatical features (facial expressions, body movement)
- Support for multiple sign languages (BSL, LSF, etc.)

## Deployment
- Frontend: Vercel / Netlify (static hosting)
- Backend: Railway / Render / Fly.io
- Both can run locally for development

## Room-Based Communication
1. User A creates a room → gets a 6-digit code
2. User B joins with the code
3. User A selects "Speaker Mode", User B selects "Signer Mode" (or vice versa)
4. Messages flow in real-time via Socket.io
