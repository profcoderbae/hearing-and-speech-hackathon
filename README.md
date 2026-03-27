# 🤟 SignBridge — Communication Without Barriers

A real-time web application that bridges communication between **deaf/hard-of-hearing** users (who use sign language) and **hearing** users (who speak/type). Two users connect from separate devices using a room code.

## How It Works

### 🗣️ Hearing Person → 🤟 Deaf Person
1. Hearing user **speaks** into their microphone (or types)
2. Speech is converted to **text** via Web Speech API
3. Text is sent to the deaf user's device in real-time
4. An **animated avatar** displays the message in **ASL sign language**

### 🤟 Deaf Person → 🗣️ Hearing Person
1. Deaf user **signs** in front of their camera (or uses quick replies/typing)
2. **MediaPipe Hands** tracks hand landmarks in real-time
3. A gesture classifier identifies **ASL alphabet letters**
4. Recognized text is sent to the hearing user's device
5. Message is **read aloud** via Text-to-Speech

## Features

- ⚡ **Real-time communication** via Socket.io
- 🎤 **Speech-to-Text** (Web Speech API)
- 🔊 **Text-to-Speech** for reply audio
- 🤟 **Animated sign language avatar** (50+ ASL words + full fingerspelling)
- 📷 **Camera-based hand tracking** (MediaPipe Hands)
- 🏠 **Room system** — connect with a 6-digit code
- 📱 **Mobile-friendly** responsive design
- 💬 **Quick reply buttons** for common phrases
- 🎨 Beautiful, accessible UI

## Quick Start

### Prerequisites
- **Node.js** 18+ installed
- **Chrome** (recommended for Speech Recognition support)

### 1. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Start the Server

```bash
cd server
npm run dev
```

Server runs on `http://localhost:3001`

### 3. Start the Client

```bash
cd client
npm run dev
```

Client runs on `http://localhost:5173`

### 4. Connect Two Devices

1. Open `http://localhost:5173` on **Device A** (or two browser tabs)
2. Enter your name and **Create a Room**
3. Share the 6-digit room code
4. On **Device B**, open the same URL, enter name, and **Join Room**
5. One user selects **Speaker Mode**, the other selects **Signer Mode**
6. Start communicating! 🎉

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TailwindCSS |
| Backend | Express.js, Socket.io |
| Speech → Text | Web Speech API |
| Text → Speech | Web Speech Synthesis API |
| Hand Tracking | MediaPipe Hands |
| Sign Classification | Custom landmark classifier |
| Sign Display | Animated emoji avatar with ASL data |

## Project Structure

```
├── ARCHITECTURE.md          # Detailed technical architecture
├── README.md                # This file
├── server/
│   ├── package.json
│   └── index.js             # Express + Socket.io server
├── client/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── index.html
│   └── src/
│       ├── App.jsx                         # Main app component
│       ├── main.jsx                        # Entry point
│       ├── index.css                       # Global styles
│       ├── components/
│       │   ├── Header.jsx                  # App header with room info
│       │   ├── RoomJoin.jsx                # Room creation/joining
│       │   ├── SpeakerMode.jsx             # Hearing user interface
│       │   ├── SignerMode.jsx              # Deaf user interface
│       │   ├── SignLanguageAvatar.jsx       # Animated sign language display
│       │   ├── HandSignRecognition.jsx      # Camera-based sign detection
│       │   └── MessageHistory.jsx          # Chat message display
│       ├── utils/
│       │   ├── socket.js                   # Socket.io client
│       │   ├── speechToText.js             # STT wrapper
│       │   ├── textToSpeech.js             # TTS wrapper
│       │   ├── signLanguageData.js         # ASL word & alphabet data
│       │   └── handGestureClassifier.js    # Hand pose classification
│       └── hooks/
│           └── useSocket.js                # Socket connection hook
```

## ASL Support

### Word-Level Signs (50+ words)
The avatar can display full word signs for common vocabulary including: hello, goodbye, yes, no, please, thank you, sorry, help, love, friend, happy, sad, and many more.

### Fingerspelling
Any word not in the dictionary is automatically **fingerspelled** letter by letter using ASL alphabet hand shapes.

### Sign Recognition
The camera can currently recognize these hand gestures:
- ASL letters: A, B, D, F, I, K, L, O, S, V, W, Y
- Special: ILY (I Love You sign) 🤟
- More letters can be added by expanding the classifier

## Browser Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Core App | ✅ | ✅ | ✅ | ✅ |
| Speech Recognition | ✅ | ❌ | ❌ | ✅ |
| Text-to-Speech | ✅ | ✅ | ✅ | ✅ |
| Camera/Hand Tracking | ✅ | ✅ | ⚠️ | ✅ |

**Recommended: Use Google Chrome for the best experience.**

## Future Improvements

- 🧠 ML-powered full sentence ASL recognition
- 🎭 3D avatar with facial expressions and body language
- 🌍 Support for multiple sign languages (BSL, LSF, etc.)
- 📹 WebRTC video calling alongside sign translation
- 🗄️ Conversation history and translation logs
- 🔒 End-to-end encryption
- 📱 Native mobile apps (React Native)

## License

MIT — Built for accessibility and inclusion 💙
