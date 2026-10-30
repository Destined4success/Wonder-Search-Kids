import React, { useState } from "react";
import { motion } from "motion/react";
import confetti from "canvas-confetti";
import {
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Bot,
  Flame,
} from "lucide-react";
import { AnswerResponse, CharacterPersona } from "../types";
import { CompanionAvatar } from "./CompanionAvatar";
import { playClickPop, playCelebration } from "../utils/audio";

interface AnswerCardProps {
  answerData: AnswerResponse;
  currentQuery: string;
  isSpeaking: boolean;
  onToggleSpeech: () => void;
  onSelectFollowUp: (q: string) => void;
  soundEnabled: boolean;
  onSwitchCharacter: (char: CharacterPersona) => void;
}

export const AnswerCard: React.FC<AnswerCardProps> = ({
  answerData,
  currentQuery,
  isSpeaking,
  onToggleSpeech,
  onSelectFollowUp,
  soundEnabled,
  onSwitchCharacter,
}) => {
  const [funFactCelebrated, setFunFactCelebrated] = useState(false);

  const handleConfetti = () => {
    playCelebration(soundEnabled);
    setFunFactCelebrated(true);
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.7 },
      colors: ["#38bdf8", "#fbbf24", "#f43f5e", "#a855f7", "#34d399"],
    });
    setTimeout(() => setFunFactCelebrated(false), 2500);
  };

  const isSuperman = answerData.character === "superman";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`relative w-full rounded-3xl p-5 sm:p-8 shadow-xl border-4 transition-all ${
        answerData.isBlocked
          ? "bg-amber-50/90 border-amber-300 text-amber-950"
          : isSuperman
          ? "bg-gradient-to-b from-white via-red-50/20 to-blue-50/40 border-red-300 text-slate-800"
          : "bg-gradient-to-b from-white via-sky-50/30 to-indigo-50/40 border-sky-300 text-slate-800"
      }`}
    >
      {/* Top Bar with Companion Switcher & Safe Search Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          {answerData.isBlocked ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-200/70 text-amber-900 font-bold text-xs">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
              Safety Guidance Active
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Child-Safe AI Verified
            </span>
          )}

          {answerData.instant && (
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px]">
              <Zap className="w-3 h-3 text-amber-600 fill-amber-500" />
              Super-Fast 0.01s Answer
            </span>
          )}
        </div>

        {/* Companion Toggle Pill */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            onClick={() => {
              playClickPop(soundEnabled);
              onSwitchCharacter("robot");
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition ${
              !isSuperman
                ? "bg-sky-500 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Robot</span>
          </button>
          <button
            onClick={() => {
              playClickPop(soundEnabled);
              onSwitchCharacter("superman");
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition ${
              isSuperman
                ? "bg-red-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Superman</span>
          </button>
        </div>
      </div>

      {/* Main Avatar & Answer Content Area */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Animated Companion Avatar */}
        <div className="shrink-0 flex flex-col items-center">
          <CompanionAvatar
            character={answerData.character}
            isSpeaking={isSpeaking}
            onToggleSpeech={onToggleSpeech}
            size="md"
          />

          {/* Voice Read Aloud Button */}
          <button
            onClick={onToggleSpeech}
            className={`mt-3 flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-xs shadow-md transition transform active:scale-95 ${
              isSpeaking
                ? "bg-rose-500 hover:bg-rose-600 text-white ring-2 ring-rose-200"
                : isSuperman
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-sky-600 hover:bg-sky-700 text-white"
            }`}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-4 h-4" />
                <span>Pause Voice</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 animate-bounce" />
                <span>Hear Voice!</span>
              </>
            )}
          </button>
        </div>

        {/* Speech Bubble / Answer Box */}
        <div className="flex-1 w-full text-left">
          {/* In-character Greeting */}
          <div
            className={`inline-block px-3.5 py-1 rounded-full font-black text-xs uppercase tracking-wider mb-2.5 ${
              isSuperman
                ? "bg-red-100 text-red-800 border border-red-200"
                : "bg-sky-100 text-sky-800 border border-sky-200"
            }`}
          >
            {answerData.greeting}
          </div>

          {/* Question Recap */}
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug mb-3">
            {currentQuery}
          </h2>

          {/* Answer Text */}
          <div className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed space-y-3">
            <p>{answerData.answer}</p>
          </div>

          {/* Fun Fact Callout Box with Confetti */}
          {answerData.funFact && (
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="mt-6 p-4 rounded-2xl bg-amber-100/70 border-2 border-amber-300 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-400 text-amber-950 shrink-0">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-amber-800">
                    Wonder Fun Fact!
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-amber-950 mt-0.5">
                    {answerData.funFact}
                  </p>
                </div>
              </div>

              <button
                onClick={handleConfetti}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow transition active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{funFactCelebrated ? "Awesome!" : "Love this!"}</span>
              </button>
            </motion.div>
          )}

          {/* Keep Wondering / Follow-up Questions */}
          {answerData.followUps && answerData.followUps.length > 0 && (
            <div className="mt-6 pt-4 border-t border-slate-200/80">
              <span className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                Keep Exploring! Tap any question:
              </span>
              <div className="flex flex-wrap gap-2">
                {answerData.followUps.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      playClickPop(soundEnabled);
                      onSelectFollowUp(q);
                    }}
                    className={`group flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition border ${
                      isSuperman
                        ? "bg-white hover:bg-red-50 text-red-900 border-red-200 hover:border-red-400"
                        : "bg-white hover:bg-sky-50 text-sky-900 border-sky-200 hover:border-sky-400"
                    } shadow-sm`}
                  >
                    <span>{q}</span>
                    <ArrowRight className="w-3 h-3 transition transform group-hover:translate-x-0.5 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
