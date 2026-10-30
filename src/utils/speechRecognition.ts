/**
 * Web Speech Recognition helper for Voice Search
 */

export interface SpeechRecognitionResultEvent {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: {
        transcript: string;
        confidence: number;
      };
    };
  };
}

export interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(
    (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition
  );
}

export function createSpeechRecognizer(): SpeechRecognitionInstance | null {
  if (typeof window === "undefined") return null;

  const SpeechRecognitionConstructor =
    (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance }).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).webkitSpeechRecognition;

  if (!SpeechRecognitionConstructor) return null;

  try {
    const recognizer = new SpeechRecognitionConstructor();
    recognizer.continuous = false;
    recognizer.interimResults = true;
    recognizer.lang = "en-US";
    return recognizer;
  } catch (err) {
    console.debug("Failed to instantiate speech recognition:", err);
    return null;
  }
}
