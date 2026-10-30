/**
 * Audio Synthesis & Speech Utility for WonderSearch Kids
 */

import { CharacterPersona } from "../types";

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

/** Play gentle click pop */
export function playClickPop(enabled = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(420, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(780, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.09);
  } catch (err) {
    console.debug("Audio play error", err);
  }
}

/** Play cute Robot Beep Boop arpeggio */
export function playRobotBeep(enabled = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const notes = [520, 680, 880, 1040];
    notes.forEach((freq, idx) => {
      const startTime = ctx.currentTime + idx * 0.07;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "square";
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.08, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.065);
    });
  } catch (err) {
    console.debug("Audio play error", err);
  }
}

/** Play heroic Superman fanfare chord */
export function playHeroFanfare(enabled = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    // Major triad chord fanfare C - E - G - C5
    const notes = [261.63, 329.63, 392.0, 523.25];
    notes.forEach((freq, idx) => {
      const startTime = ctx.currentTime + idx * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.26);
    });
  } catch (err) {
    console.debug("Audio play error", err);
  }
}

/** Play celebration chime for learning new facts */
export function playCelebration(enabled = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const freqs = [440, 554.37, 659.25, 880];
    freqs.forEach((freq, i) => {
      const t = ctx.currentTime + i * 0.06;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.3);
    });
  } catch (err) {
    console.debug("Audio play error", err);
  }
}

/** Play gentle safety shield block chime */
export function playShieldBlock(enabled = true) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch (err) {
    console.debug("Audio play error", err);
  }
}

/**
 * Text-to-Speech using browser SpeechSynthesis API
 */
let currentUtterance: SpeechSynthesisUtterance | null = null;

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
}

export function speakText(
  text: string,
  character: CharacterPersona = "robot",
  onStart?: () => void,
  onEnd?: () => void,
  onError?: () => void
): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    onError?.();
    return false;
  }

  try {
    window.speechSynthesis.cancel();

    // Clean emojis & special symbols for clean vocalization
    const cleaned = text
      .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "")
      .replace(/[*_#`~]/g, "")
      .trim();

    if (!cleaned) return false;

    const utterance = new SpeechSynthesisUtterance(cleaned);
    currentUtterance = utterance;

    // Character voice personality configuration
    if (character === "robot") {
      utterance.pitch = 1.35; // higher robotic mechanical pitch
      utterance.rate = 1.05; // snappy rhythmic robotic cadence
    } else {
      utterance.pitch = 0.92; // heroic resonant tone
      utterance.rate = 0.96; // confident, inspiring pace
    }

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      // Pick best matching English voice
      const preferred =
        character === "robot"
          ? voices.find((v) => v.name.includes("Google") || v.name.includes("Natural") || v.lang.startsWith("en"))
          : voices.find((v) => v.name.includes("Male") || v.name.includes("David") || v.lang.startsWith("en"));
      if (preferred) {
        utterance.voice = preferred;
      }
    }

    utterance.onstart = () => {
      onStart?.();
    };

    utterance.onend = () => {
      currentUtterance = null;
      onEnd?.();
    };

    utterance.onerror = (e) => {
      console.debug("Speech synthesis error", e);
      currentUtterance = null;
      onError?.();
    };

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.debug("TTS fail", err);
    onError?.();
    return false;
  }
}
