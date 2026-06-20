import assert from "node:assert/strict";
import { createGameAudio } from "../src/audio.js";

function createStorage(seed = {}) {
  const values = new Map(Object.entries(seed));
  return {
    getItem: (key) => values.get(key) || null,
    setItem: (key, value) => values.set(key, value),
    values,
  };
}

function createAudioContextStub(events) {
  return class AudioContextStub {
    constructor() {
      this.currentTime = 0;
      this.destination = {};
      this.state = "running";
    }

    createOscillator() {
      return {
        type: "sine",
        frequency: {
          setValueAtTime: (frequency, time) => events.push(["frequency", frequency, time]),
        },
        connect: () => events.push(["osc-connect"]),
        start: (time) => events.push(["start", time]),
        stop: (time) => events.push(["stop", time]),
      };
    }

    createGain() {
      return {
        gain: {
          setValueAtTime: (gain, time) => events.push(["gain", gain, time]),
          exponentialRampToValueAtTime: (gain, time) => events.push(["ramp", gain, time]),
        },
        connect: () => events.push(["gain-connect"]),
      };
    }
  };
}

const events = [];
const storage = createStorage();
const audio = createGameAudio({
  storage,
  AudioContextCtor: createAudioContextStub(events),
  now: () => 1000,
});

assert.equal(audio.isMuted(), false);
assert.equal(audio.play("complete"), true);
assert.ok(events.some((event) => event[0] === "frequency" && event[1] === 659.25));

assert.equal(audio.toggle(), true);
assert.equal(storage.values.get("signal-garden:sound-muted"), "1");
assert.equal(audio.play("blocked"), false);
const eventCount = events.length;

assert.equal(audio.toggle(), false);
assert.equal(storage.values.get("signal-garden:sound-muted"), "0");
assert.ok(events.length > eventCount);
assert.equal(audio.wasUnlockedRecently(), true);

const mutedStorage = createStorage({ "signal-garden:sound-muted": "1" });
const mutedAudio = createGameAudio({
  storage: mutedStorage,
  AudioContextCtor: createAudioContextStub([]),
});
assert.equal(mutedAudio.isMuted(), true);

console.log("signal garden audio tests passed");
