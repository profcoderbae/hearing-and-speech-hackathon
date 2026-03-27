/**
 * Text-to-Speech utility using Web Speech Synthesis API
 */

export class TextToSpeechEngine {
  constructor() {
    this.synth = window.speechSynthesis;
    this.supported = !!this.synth;
    this.isSpeaking = false;
    this.voice = null;
    this._loadVoices();
  }

  _loadVoices() {
    if (!this.supported) return;

    const setVoice = () => {
      const voices = this.synth.getVoices();
      // Prefer a natural English voice
      this.voice =
        voices.find((v) => v.name.includes('Google') && v.lang.startsWith('en')) ||
        voices.find((v) => v.lang.startsWith('en-US')) ||
        voices.find((v) => v.lang.startsWith('en')) ||
        voices[0];
    };

    setVoice();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = setVoice;
    }
  }

  /**
   * Speak the given text aloud
   */
  speak(text, options = {}) {
    if (!this.supported || !text) return;

    // Cancel any ongoing speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = this.voice;
    utterance.rate = options.rate || 0.95;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (options.onStart) options.onStart();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      if (options.onEnd) options.onEnd();
    };

    utterance.onerror = (event) => {
      this.isSpeaking = false;
      console.error('TTS Error:', event.error);
      if (options.onError) options.onError(event.error);
    };

    this.synth.speak(utterance);
  }

  stop() {
    if (this.supported) {
      this.synth.cancel();
      this.isSpeaking = false;
    }
  }
}

export function isTextToSpeechSupported() {
  return !!window.speechSynthesis;
}
