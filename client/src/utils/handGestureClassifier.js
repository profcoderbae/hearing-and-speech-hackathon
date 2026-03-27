/**
 * Hand gesture classifier using MediaPipe hand landmarks
 * Classifies basic ASL alphabet signs from hand landmark positions
 */

// Landmark indices (MediaPipe Hands)
const WRIST = 0;
const THUMB_TIP = 4;
const INDEX_TIP = 8;
const MIDDLE_TIP = 12;
const RING_TIP = 16;
const PINKY_TIP = 20;
const THUMB_MCP = 2;
const INDEX_MCP = 5;
const MIDDLE_MCP = 9;
const RING_MCP = 13;
const PINKY_MCP = 17;
const INDEX_PIP = 6;
const MIDDLE_PIP = 10;
const RING_PIP = 14;
const PINKY_PIP = 18;

function distance(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + ((a.z || 0) - (b.z || 0)) ** 2);
}

function isFingerExtended(landmarks, tipIdx, pipIdx, mcpIdx) {
  const tip = landmarks[tipIdx];
  const pip = landmarks[pipIdx];
  const mcp = landmarks[mcpIdx];
  // Finger is extended if tip is further from wrist than pip
  const tipDist = distance(tip, landmarks[WRIST]);
  const pipDist = distance(pip, landmarks[WRIST]);
  return tipDist > pipDist * 1.05;
}

function isThumbExtended(landmarks) {
  const thumbTip = landmarks[THUMB_TIP];
  const thumbMcp = landmarks[THUMB_MCP];
  const indexMcp = landmarks[INDEX_MCP];
  // Thumb is extended if tip is far from index MCP
  return distance(thumbTip, indexMcp) > distance(thumbMcp, indexMcp) * 1.2;
}

/**
 * Classify hand landmarks into ASL letter or gesture
 * Returns { letter, confidence, gesture }
 */
export function classifyHandGesture(landmarks) {
  if (!landmarks || landmarks.length < 21) return null;

  const indexExtended = isFingerExtended(landmarks, INDEX_TIP, INDEX_PIP, INDEX_MCP);
  const middleExtended = isFingerExtended(landmarks, MIDDLE_TIP, MIDDLE_PIP, MIDDLE_MCP);
  const ringExtended = isFingerExtended(landmarks, RING_TIP, RING_PIP, RING_MCP);
  const pinkyExtended = isFingerExtended(landmarks, PINKY_TIP, PINKY_PIP, PINKY_MCP);
  const thumbExtended = isThumbExtended(landmarks);

  const extendedCount = [indexExtended, middleExtended, ringExtended, pinkyExtended, thumbExtended]
    .filter(Boolean).length;

  // Pattern matching for common gestures
  // All fingers extended = B or open hand
  if (indexExtended && middleExtended && ringExtended && pinkyExtended && !thumbExtended) {
    return { letter: 'B', confidence: 0.7, gesture: 'flat_hand' };
  }

  // Fist = A or S
  if (extendedCount === 0) {
    return { letter: 'S', confidence: 0.5, gesture: 'fist' };
  }
  if (extendedCount === 0 && thumbExtended) {
    return { letter: 'A', confidence: 0.5, gesture: 'fist_thumb' };
  }

  // Only index = D or pointing
  if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
    if (thumbExtended) {
      return { letter: 'L', confidence: 0.6, gesture: 'l_shape' };
    }
    return { letter: 'D', confidence: 0.6, gesture: 'point' };
  }

  // V shape / peace sign
  if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
    if (thumbExtended) {
      return { letter: 'K', confidence: 0.5, gesture: 'v_thumb' };
    }
    return { letter: 'V', confidence: 0.7, gesture: 'peace' };
  }

  // W - three fingers
  if (indexExtended && middleExtended && ringExtended && !pinkyExtended) {
    return { letter: 'W', confidence: 0.7, gesture: 'three_fingers' };
  }

  // Y - thumb and pinky
  if (!indexExtended && !middleExtended && !ringExtended && pinkyExtended && thumbExtended) {
    return { letter: 'Y', confidence: 0.7, gesture: 'y_shape' };
  }

  // I Love You - index, pinky, thumb
  if (indexExtended && !middleExtended && !ringExtended && pinkyExtended && thumbExtended) {
    return { letter: 'ILY', confidence: 0.7, gesture: 'i_love_you' };
  }

  // I - only pinky
  if (!indexExtended && !middleExtended && !ringExtended && pinkyExtended && !thumbExtended) {
    return { letter: 'I', confidence: 0.6, gesture: 'pinky' };
  }

  // Thumbs up
  if (!indexExtended && !middleExtended && !ringExtended && !pinkyExtended && thumbExtended) {
    return { letter: 'A', confidence: 0.5, gesture: 'thumbs_up' };
  }

  // Open hand with all fingers
  if (extendedCount >= 4 && thumbExtended) {
    return { letter: 'B', confidence: 0.4, gesture: 'open_hand' };
  }

  // Check for O shape (all fingertips close together)
  const tipDistances = [
    distance(landmarks[THUMB_TIP], landmarks[INDEX_TIP]),
    distance(landmarks[INDEX_TIP], landmarks[MIDDLE_TIP]),
  ];
  if (tipDistances.every((d) => d < 0.08)) {
    return { letter: 'O', confidence: 0.5, gesture: 'o_shape' };
  }

  // F shape - thumb and index touching, others extended
  if (middleExtended && ringExtended && pinkyExtended) {
    const thumbIndexDist = distance(landmarks[THUMB_TIP], landmarks[INDEX_TIP]);
    if (thumbIndexDist < 0.06) {
      return { letter: 'F', confidence: 0.6, gesture: 'f_shape' };
    }
  }

  return { letter: '?', confidence: 0.2, gesture: 'unknown' };
}

/**
 * Smooth classifications over time for stability
 */
export class GestureBuffer {
  constructor(bufferSize = 8) {
    this.buffer = [];
    this.bufferSize = bufferSize;
  }

  add(classification) {
    if (!classification) return null;
    this.buffer.push(classification);
    if (this.buffer.length > this.bufferSize) {
      this.buffer.shift();
    }
    return this.getMostFrequent();
  }

  getMostFrequent() {
    if (this.buffer.length < 3) return null;

    const counts = {};
    for (const cls of this.buffer) {
      const key = cls.letter;
      counts[key] = (counts[key] || 0) + 1;
    }

    let maxCount = 0;
    let maxLetter = null;
    for (const [letter, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        maxLetter = letter;
      }
    }

    // Need at least 60% agreement
    if (maxCount / this.buffer.length >= 0.6) {
      return { letter: maxLetter, confidence: maxCount / this.buffer.length };
    }
    return null;
  }

  clear() {
    this.buffer = [];
  }
}
