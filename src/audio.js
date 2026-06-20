const STORAGE_KEY = "signal-garden:sound-muted";

const PATTERNS = {
  complete: [
    { frequency: 392, start: 0, duration: 0.1, gain: 0.055 },
    { frequency: 523.25, start: 0.08, duration: 0.12, gain: 0.06 },
    { frequency: 659.25, start: 0.18, duration: 0.16, gain: 0.052 },
  ],
  blocked: [
    { frequency: 196, start: 0, duration: 0.16, gain: 0.05 },
    { frequency: 146.83, start: 0.1, duration: 0.18, gain: 0.045 },
  ],
  replay: [
    { frequency: 329.63, start: 0, duration: 0.07, gain: 0.04 },
    { frequency: 440, start: 0.06, duration: 0.07, gain: 0.04 },
    { frequency: 587.33, start: 0.12, duration: 0.09, gain: 0.035 },
  ],
  toggle: [{ frequency: 523.25, start: 0, duration: 0.08, gain: 0.035 }],
};

function readMuted(storage) {
  try {
    return storage?.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function writeMuted(storage, muted) {
  try {
    storage?.setItem(STORAGE_KEY, muted ? "1" : "0");
  } catch {
    // Ignore private-mode storage failures; the toggle still works for this session.
  }
}

export function createGameAudio({
  storage = globalThis.window?.localStorage,
  AudioContextCtor = globalThis.window?.AudioContext || globalThis.window?.webkitAudioContext,
  now = () => Date.now(),
} = {}) {
  let muted = readMuted(storage);
  let context = null;
  let unlockedAt = 0;

  function getContext() {
    if (muted || !AudioContextCtor) {
      return null;
    }
    if (!context) {
      context = new AudioContextCtor();
    }
    if (context.state === "suspended" && typeof context.resume === "function") {
      const resumed = context.resume();
      if (resumed && typeof resumed.catch === "function") {
        resumed.catch(() => {});
      }
    }
    unlockedAt = now();
    return context;
  }

  function play(name) {
    if (muted) {
      return false;
    }
    const pattern = PATTERNS[name];
    const audioContext = getContext();
    if (!pattern || !audioContext) {
      return false;
    }
    const base = audioContext.currentTime || 0;
    for (const note of pattern) {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(note.frequency, base + note.start);
      gain.gain.setValueAtTime(0.0001, base + note.start);
      gain.gain.exponentialRampToValueAtTime(note.gain, base + note.start + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.0001, base + note.start + note.duration);
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start(base + note.start);
      oscillator.stop(base + note.start + note.duration + 0.02);
    }
    return true;
  }

  function setMuted(nextMuted) {
    muted = Boolean(nextMuted);
    writeMuted(storage, muted);
    if (!muted) {
      getContext();
      play("toggle");
    }
    return muted;
  }

  return {
    isMuted: () => muted,
    setMuted,
    toggle: () => setMuted(!muted),
    play,
    wasUnlockedRecently: () => now() - unlockedAt < 500,
  };
}
