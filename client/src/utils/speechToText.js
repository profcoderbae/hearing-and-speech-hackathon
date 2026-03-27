/**
 * Speech-to-Text utility using Web Speech API
 */

export class SpeechRecognizer {
  constructor() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      this.supported = false;
      console.warn('Speech Recognition not supported in this browser');
      return;
    }

    this.supported = true;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 1;

    this.isListening = false;
    this.onResult = null;
    this.onInterim = null;
    this.onStart = null;
    this.onEnd = null;
    this.onError = null;

    this._setupEvents();
  }

  _setupEvents() {
    if (!this.supported) return;

    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript && this.onResult) {
        this.onResult(finalTranscript.trim());
      }
      if (interimTranscript && this.onInterim) {
        this.onInterim(interimTranscript.trim());
      }
    };

    this.recognition.onstart = () => {
      this.isListening = true;
      if (this.onStart) this.onStart();
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.onEnd) this.onEnd();
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error !== 'no-speech' && this.onError) {
        this.onError(event.error);
      }
    };
  }

  start() {
    if (!this.supported) return false;
    try {
      this.recognition.start();
      return true;
    } catch (e) {
      console.error('Failed to start speech recognition:', e);
      return false;
    }
  }

  stop() {
    if (!this.supported) return;
    try {
      this.recognition.stop();
    } catch (e) {
      // ignore
    }
  }
}

/**
 * Check if speech recognition is supported
 */
export function isSpeechRecognitionSupported() {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}
