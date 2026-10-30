import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mic, MicOff, X, Sparkles, Volume2, AlertCircle } from "lucide-react";
import { createSpeechRecognizer, SpeechRecognitionInstance } from "../utils/speechRecognition";
import { CharacterPersona } from "../types";
import { playClickPop, playRobotBeep, playHeroFanfare } from "../utils/audio";

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTranscript: (text: string) => void;
  character: CharacterPersona;
  soundEnabled: boolean;
}

const SAMPLE_VOICE_QUESTIONS = [
  "Why is the sky blue?",
  "How big was a T-Rex?",
  "Do fish sleep in the ocean?",
  "How do airplanes fly in the sky?",
  "Why do volcanoes erupt?",
];

export const VoiceModal: React.FC<VoiceModalProps> = ({
  isOpen,
  onClose,
  onTranscript,
  character,
  soundEnabled,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recognizerRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (recognizerRef.current) {
        recognizerRef.current.stop();
      }
      setIsListening(false);
      setTranscript("");
      setErrorMessage(null);
      return;
    }

    // Initialize speech recognition
    const recognizer = createSpeechRecognizer();
    if (!recognizer) {
      setErrorMessage("Microphone voice recognition is not supported in this browser window. You can click a sample question below!");
      return;
    }

    recognizerRef.current = recognizer;

    recognizer.onstart = () => {
      setIsListening(true);
      setErrorMessage(null);
      if (character === "robot") {
        playRobotBeep(soundEnabled);
      } else {
        playHeroFanfare(soundEnabled);
      }
    };

    recognizer.onresult = (event) => {
      let currentText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentText += event.results[i][0].transcript;
      }
      setTranscript(currentText);

      // If final, send transcript after brief pause
      const lastResult = event.results[event.results.length - 1];
      if (lastResult.isFinal && currentText.trim()) {
        setTimeout(() => {
          onTranscript(currentText.trim());
          onClose();
        }, 500);
      }
    };

    recognizer.onerror = (event) => {
      console.debug("Voice recognition error:", event.error);
      if (event.error === "not-allowed") {
        setErrorMessage("Microphone permission was denied. Please allow microphone access or choose a topic below!");
      } else {
        setErrorMessage("Could not catch that clearly. Please try speaking closer to your mic!");
      }
      setIsListening(false);
    };

    recognizer.onend = () => {
      setIsListening(false);
    };

    try {
      recognizer.start();
    } catch (err) {
      console.debug("Speech start error", err);
    }

    return () => {
      try {
        recognizer.abort();
      } catch {
        // noop
      }
    };
  }, [isOpen]);

  const handleManualSelect = (q: string) => {
    playClickPop(soundEnabled);
    onTranscript(q);
    onClose();
  };

  const handleToggleListening = () => {
    playClickPop(soundEnabled);
    if (!recognizerRef.current) return;
    if (isListening) {
      recognizerRef.current.stop();
      setIsListening(false);
    } else {
      setErrorMessage(null);
      setTranscript("");
      try {
        recognizerRef.current.start();
      } catch (err) {
        console.debug("Start failed", err);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-3xl sm:rounded-4xl shadow-2xl p-6 sm:p-8 border-4 border-amber-300 overflow-hidden text-center"
        >
          {/* Close button */}
          <button
            onClick={() => {
              playClickPop(soundEnabled);
              onClose();
            }}
            aria-label="Close voice modal"
            className="kid-btn absolute top-4 right-4 p-2.5 rounded-2xl text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Heading */}
          <div className="flex items-center justify-center gap-2 mb-1">
            <Sparkles className="w-6 h-6 text-amber-500 animate-spin" />
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-800 font-sniglet">
              {character === "robot" ? "Robot Voice Radar!" : "Hero Voice Radar!"}
            </h2>
          </div>
          <p className="text-sm font-bold text-slate-600 mb-4">
            Speak loud and clear! {character === "robot" ? "Beep-Boop" : "Captain Wonder"} is listening!
          </p>

          {/* Big Mic Button with Pulsing Waveform */}
          <div className="relative flex items-center justify-center my-6">
            {isListening && (
              <>
                <motion.div
                  animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0.1, 0.6] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  className={`absolute w-36 h-36 rounded-full ${
                    character === "robot" ? "bg-sky-400" : "bg-red-500"
                  }`}
                />
                <motion.div
                  animate={{ scale: [1, 1.25, 1], opacity: [0.8, 0.3, 0.8] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                  className={`absolute w-28 h-28 rounded-full ${
                    character === "robot" ? "bg-cyan-300" : "bg-amber-400"
                  }`}
                />
              </>
            )}

            <button
              onClick={handleToggleListening}
              className={`kid-btn relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center shadow-2xl text-white transition cursor-pointer ${
                character === "robot"
                  ? "bg-gradient-to-tr from-sky-500 to-indigo-600 ring-4 ring-sky-200 shadow-[0_6px_0_0_#0284c7]"
                  : "bg-gradient-to-tr from-red-600 to-amber-500 ring-4 ring-amber-200 shadow-[0_6px_0_0_#b91c1c]"
              }`}
            >
              {isListening ? (
                <Mic className="w-12 h-12 animate-pulse" />
              ) : (
                <MicOff className="w-12 h-12 text-white/90" />
              )}
            </button>
          </div>

          {/* Real-Time Transcript Display */}
          <div className="min-h-[72px] flex items-center justify-center p-4 rounded-3xl bg-amber-50/60 border-3 border-amber-200 mb-4">
            {transcript ? (
              <p className="text-lg sm:text-xl font-black text-slate-800 leading-snug font-sniglet">
                "{transcript}"
              </p>
            ) : isListening ? (
              <div className="flex items-center gap-2 text-indigo-700 font-extrabold text-sm sm:text-base">
                <Volume2 className="w-5 h-5 animate-bounce" />
                <span>Listening... speak anytime!</span>
              </div>
            ) : (
              <span className="text-slate-500 font-bold text-sm">
                Tap the big microphone above to speak!
              </span>
            )}
          </div>

          {/* Error / Alert notice */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 text-xs font-bold flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Quick Voice Prompt Suggestions */}
          <div className="text-left mt-3 border-t-2 border-slate-100 pt-3">
            <p className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
              Or tap a question to ask now:
            </p>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_VOICE_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleManualSelect(q)}
                  className="kid-btn px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-amber-100 hover:text-amber-950 border-2 border-slate-200 hover:border-amber-300 text-xs font-bold text-slate-800 transition cursor-pointer"
                >
                  "{q}"
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
