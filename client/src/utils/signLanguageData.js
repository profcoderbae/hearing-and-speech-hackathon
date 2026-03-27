/**
 * ASL Sign Language Data
 * Maps words and letters to sign representations for the avatar
 */

// ASL Fingerspelling - hand shapes for each letter
// Each letter maps to an SVG path description and descriptive text
export const ASL_ALPHABET = {
  A: { emoji: '✊', description: 'Fist with thumb to the side', fingers: [0, 0, 0, 0, 1] },
  B: { emoji: '🖐', description: 'Flat hand, fingers together, thumb tucked', fingers: [1, 1, 1, 1, 0] },
  C: { emoji: '🤏', description: 'Curved hand like holding a cup', fingers: [0.5, 0.5, 0.5, 0.5, 0.5] },
  D: { emoji: '☝️', description: 'Index finger up, others touch thumb', fingers: [1, 0, 0, 0, 0] },
  E: { emoji: '✊', description: 'Fingers curled, thumb tucked under', fingers: [0, 0, 0, 0, 0] },
  F: { emoji: '👌', description: 'Thumb and index touch, others up', fingers: [0, 1, 1, 1, 0] },
  G: { emoji: '👈', description: 'Index and thumb pointing sideways', fingers: [1, 0, 0, 0, 1] },
  H: { emoji: '🤞', description: 'Index and middle finger sideways', fingers: [1, 1, 0, 0, 0] },
  I: { emoji: '🤙', description: 'Pinky up, others closed', fingers: [0, 0, 0, 1, 0] },
  J: { emoji: '🤙', description: 'Pinky up with J motion', fingers: [0, 0, 0, 1, 0] },
  K: { emoji: '✌️', description: 'Index and middle up, thumb between', fingers: [1, 1, 0, 0, 1] },
  L: { emoji: '🤟', description: 'L shape - index up, thumb out', fingers: [1, 0, 0, 0, 1] },
  M: { emoji: '✊', description: 'Thumb under three fingers', fingers: [0, 0, 0, 0, 0] },
  N: { emoji: '✊', description: 'Thumb under two fingers', fingers: [0, 0, 0, 0, 0] },
  O: { emoji: '👌', description: 'All fingers touch thumb in O shape', fingers: [0.5, 0.5, 0.5, 0.5, 0.5] },
  P: { emoji: '👇', description: 'Like K but pointing down', fingers: [1, 1, 0, 0, 1] },
  Q: { emoji: '👇', description: 'Like G but pointing down', fingers: [1, 0, 0, 0, 1] },
  R: { emoji: '🤞', description: 'Crossed index and middle', fingers: [1, 1, 0, 0, 0] },
  S: { emoji: '✊', description: 'Fist with thumb over fingers', fingers: [0, 0, 0, 0, 0] },
  T: { emoji: '✊', description: 'Thumb between index and middle', fingers: [0, 0, 0, 0, 0] },
  U: { emoji: '✌️', description: 'Index and middle together, pointing up', fingers: [1, 1, 0, 0, 0] },
  V: { emoji: '✌️', description: 'Index and middle spread apart', fingers: [1, 1, 0, 0, 0] },
  W: { emoji: '🤟', description: 'Three middle fingers up', fingers: [1, 1, 1, 0, 0] },
  X: { emoji: '☝️', description: 'Index finger hooked', fingers: [0.5, 0, 0, 0, 0] },
  Y: { emoji: '🤙', description: 'Thumb and pinky out', fingers: [0, 0, 0, 1, 1] },
  Z: { emoji: '☝️', description: 'Index finger draws Z in air', fingers: [1, 0, 0, 0, 0] },
};

// Common ASL words/phrases with sign descriptions
export const ASL_WORDS = {
  hello: {
    signs: [{ gesture: '👋', description: 'Wave hand near forehead', duration: 1200 }],
  },
  hi: {
    signs: [{ gesture: '👋', description: 'Wave hand', duration: 800 }],
  },
  goodbye: {
    signs: [{ gesture: '👋', description: 'Open-close hand wave', duration: 1200 }],
  },
  bye: {
    signs: [{ gesture: '👋', description: 'Wave goodbye', duration: 800 }],
  },
  yes: {
    signs: [{ gesture: '✊', description: 'Fist nods up and down', duration: 800 }],
  },
  no: {
    signs: [
      { gesture: '✌️', description: 'Index and middle finger snap to thumb', duration: 800 },
    ],
  },
  please: {
    signs: [{ gesture: '🖐', description: 'Flat hand circles on chest', duration: 1000 }],
  },
  'thank you': {
    signs: [{ gesture: '🖐', description: 'Flat hand from chin forward', duration: 1000 }],
  },
  thanks: {
    signs: [{ gesture: '🖐', description: 'Flat hand from chin forward', duration: 800 }],
  },
  sorry: {
    signs: [{ gesture: '✊', description: 'Fist circles on chest', duration: 1000 }],
  },
  help: {
    signs: [
      { gesture: '👍', description: 'Thumbs up on flat palm, lift together', duration: 1000 },
    ],
  },
  'i love you': {
    signs: [{ gesture: '🤟', description: 'ILY handshape - pinky, index, thumb extended', duration: 1200 }],
  },
  love: {
    signs: [{ gesture: '🤗', description: 'Cross arms over chest', duration: 1000 }],
  },
  friend: {
    signs: [
      { gesture: '☝️', description: 'Hook index fingers together, flip', duration: 1200 },
    ],
  },
  name: {
    signs: [
      { gesture: '✌️', description: 'Two fingers tap on other two fingers', duration: 1000 },
    ],
  },
  what: {
    signs: [{ gesture: '🖐', description: 'Palms up, shake side to side', duration: 800 }],
  },
  where: {
    signs: [{ gesture: '☝️', description: 'Index finger waves side to side', duration: 800 }],
  },
  when: {
    signs: [
      { gesture: '☝️', description: 'Index finger circles then touches other index', duration: 1000 },
    ],
  },
  why: {
    signs: [
      { gesture: '🖐', description: 'Touch forehead, pull away into Y shape', duration: 1000 },
    ],
  },
  how: {
    signs: [
      { gesture: '✊', description: 'Knuckles together, roll forward, palms up', duration: 1000 },
    ],
  },
  good: {
    signs: [
      { gesture: '🖐', description: 'Flat hand from chin outward', duration: 800 },
    ],
  },
  bad: {
    signs: [
      { gesture: '🖐', description: 'Flat hand from chin downward', duration: 800 },
    ],
  },
  you: {
    signs: [{ gesture: '☝️', description: 'Point index finger forward', duration: 600 }],
  },
  me: {
    signs: [{ gesture: '☝️', description: 'Point to self', duration: 600 }],
  },
  i: {
    signs: [{ gesture: '☝️', description: 'Point to self (chest)', duration: 500 }],
  },
  we: {
    signs: [
      { gesture: '☝️', description: 'Point between self and others', duration: 800 },
    ],
  },
  understand: {
    signs: [
      { gesture: '☝️', description: 'Index finger flicks up near forehead', duration: 1000 },
    ],
  },
  "don't understand": {
    signs: [
      { gesture: '☝️', description: 'Finger at forehead, then wave no', duration: 1200 },
    ],
  },
  eat: {
    signs: [{ gesture: '🤏', description: 'Bunched fingers tap mouth', duration: 800 }],
  },
  drink: {
    signs: [{ gesture: '🤏', description: 'C-hand tips to mouth', duration: 800 }],
  },
  water: {
    signs: [
      { gesture: '✌️', description: 'W handshape taps chin', duration: 800 },
    ],
  },
  happy: {
    signs: [
      { gesture: '🖐', description: 'Flat hand brushes up on chest repeatedly', duration: 1000 },
    ],
  },
  sad: {
    signs: [
      { gesture: '🖐', description: 'Open hands slide down face', duration: 1000 },
    ],
  },
  want: {
    signs: [
      { gesture: '🖐', description: 'Clawed hands pull toward body', duration: 800 },
    ],
  },
  need: {
    signs: [
      { gesture: '☝️', description: 'X handshape bends downward', duration: 800 },
    ],
  },
  can: {
    signs: [{ gesture: '✊', description: 'Both fists move down together', duration: 800 }],
  },
  go: {
    signs: [
      { gesture: '☝️', description: 'Both index fingers point and arc forward', duration: 800 },
    ],
  },
  come: {
    signs: [
      { gesture: '☝️', description: 'Index fingers beckon toward self', duration: 800 },
    ],
  },
  home: {
    signs: [
      { gesture: '🤏', description: 'Bunched fingers touch cheek then jaw', duration: 1000 },
    ],
  },
  work: {
    signs: [
      { gesture: '✊', description: 'Fist taps other fist wrist', duration: 1000 },
    ],
  },
  school: {
    signs: [
      { gesture: '🖐', description: 'Clap hands twice', duration: 800 },
    ],
  },
  doctor: {
    signs: [
      { gesture: '🖐', description: 'D hand taps wrist pulse', duration: 1000 },
    ],
  },
  more: {
    signs: [
      { gesture: '🤏', description: 'Bunched fingertips tap together', duration: 800 },
    ],
  },
  again: {
    signs: [
      { gesture: '🖐', description: 'Curved hand arcs into flat palm', duration: 800 },
    ],
  },
};

/**
 * Convert text to a sequence of sign representations
 * Tries word-level signs first, falls back to fingerspelling
 */
export function textToSignSequence(text) {
  if (!text) return [];

  const lower = text.toLowerCase().trim();
  const sequence = [];

  // Check for multi-word phrases first
  for (const phrase of Object.keys(ASL_WORDS).sort((a, b) => b.length - a.length)) {
    if (lower === phrase) {
      return ASL_WORDS[phrase].signs.map((sign) => ({
        type: 'word',
        word: phrase,
        ...sign,
      }));
    }
  }

  // Split into words and process each
  const words = lower.split(/\s+/);

  for (const word of words) {
    // Check for known word sign
    if (ASL_WORDS[word]) {
      ASL_WORDS[word].signs.forEach((sign) => {
        sequence.push({
          type: 'word',
          word,
          ...sign,
        });
      });
    } else {
      // Fingerspell unknown words
      const cleanWord = word.replace(/[^a-z]/g, '');
      for (const letter of cleanWord) {
        const upper = letter.toUpperCase();
        if (ASL_ALPHABET[upper]) {
          sequence.push({
            type: 'letter',
            letter: upper,
            gesture: ASL_ALPHABET[upper].emoji,
            description: ASL_ALPHABET[upper].description,
            duration: 600,
          });
        }
      }
      // Add a small pause between words
      if (cleanWord.length > 0) {
        sequence.push({ type: 'pause', duration: 400 });
      }
    }
  }

  return sequence;
}

/**
 * Get the list of supported ASL words for reference
 */
export function getSupportedWords() {
  return Object.keys(ASL_WORDS).sort();
}
