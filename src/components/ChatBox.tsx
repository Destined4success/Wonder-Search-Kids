import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import {
  Send,
  Mic,
  Volume2,
  VolumeX,
  Bot,
  Flame,
  Sparkles,
  Lightbulb,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  Zap,
} from "lucide-react";
import { ChatMessage, CharacterPersona } from "../types";
import { CompanionAvatar } from "./CompanionAvatar";
import { playClickPop, playCelebration } from "../utils/audio";

interface ChatBoxProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onOpenVoice: () => void;
  character: CharacterPersona;
  isLoading: boolean;
  onSpeakMessage: (text: string) => void;
  onStopSpeaking: () => void;
  isSpeaking: boolean;
  soundEnabled: boolean;
  onClearChat?: () => void;
}

const QUICK_TOPICS = [
  { label: "Dinosaurs", emoji: "🦖", color: "bg-emerald-500 hover:bg-emerald-600 shadow-[0_4px_0_0_#047857]", query: "What was the biggest dinosaur that ever walked the Earth?" },
  { label: "Outer Space", emoji: "🚀", color: "bg-indigo-600 hover:bg-indigo-700 shadow-[0_4px_0_0_#3730a3]", query: "Why do planets stay in orbit around the sun?" },
  { label: "Oceans", emoji: "🐬", color: "bg-sky-500 hover:bg-sky-600 shadow-[0_4px_0_0_#0284c7]", query: "Do dolphins and whales talk to each other underwater?" },
  { label: "Volcanoes", emoji: "🌋", color: "bg-amber-500 hover:bg-amber-600 shadow-[0_4px_0_0_#b45309]", query: "Where does hot lava come from inside a volcano?" },
  { label: "Rainbows", emoji: "🌈", color: "bg-rose-500 hover:bg-rose-600 shadow-[0_4px_0_0_#be185d]", query: "How does sunlight turn rain into a colorful rainbow?" },
  { label: "Superheroes", emoji: "⚡", color: "bg-red-600 hover:bg-red-700 shadow-[0_4px_0_0_#991b1b]", query: "How does superhero armor work in comic books?" },
  { label: "Surprise Me!", emoji: "🎲", color: "bg-yellow-400 hover:bg-yellow-500 text-yellow-950 shadow-[0_4px_0_0_#ca8a04]", query: "random" },
];

export const ChatBox: React.FC<ChatBoxProps> = ({
  messages,
  onSendMessage,
  onOpenVoice,
  character,
  isLoading,
  onSpeakMessage,
  onStopSpeaking,
  isSpeaking,
  soundEnabled,
  onClearChat,
}) => {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    playClickPop(soundEnabled);
    onSendMessage(inputText.trim());
    setInputText("");
  };

  const handleQuickTopic = (topic: typeof QUICK_TOPICS[0]) => {
    playClickPop(soundEnabled);
    if (topic.query === "random") {
      const candidates = QUICK_TOPICS.filter((t) => t.query !== "random");
      const chosen = candidates[Math.floor(Math.random() * candidates.length)];
      onSendMessage(chosen.query);
    } else {
      onSendMessage(topic.query);
    }
  };

  const handleConfetti = () => {
    playCelebration(soundEnabled);
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#38bdf8", "#fbbf24", "#f43f5e", "#a855f7", "#34d399"],
    });
  };

  const isSuperman = character === "superman";

  return (
    <div className="w-full bg-white rounded-3xl sm:rounded-4xl border-4 border-amber-300/80 shadow-2xl overflow-hidden flex flex-col my-4">
      {/* 1. Header Bar: Companion Avatar + Title + Start Over Button */}
      <div
        className={`p-3 sm:p-4 text-white flex items-center justify-between transition-colors ${
          isSuperman
            ? "bg-gradient-to-r from-red-600 via-rose-600 to-amber-600"
            : "bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600"
        }`}
      >
        <div className="flex items-center gap-3">
          {/* Animated Mini Avatar */}
          <div className="shrink-0 p-1 bg-white/20 rounded-2xl backdrop-blur-xs">
            <CompanionAvatar
              character={character}
              isSpeaking={isSpeaking}
              size="sm"
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-2xl font-black tracking-tight font-sniglet">
                {isSuperman ? "Captain Wonder" : "Beep-Boop 3000"}
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/25 text-white text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Kid-Safe AI</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-white/90 font-medium">
              {isSuperman
                ? "Your heroic buddy for science and discovery!"
                : "Your friendly robot companion for big curious questions!"}
            </p>
          </div>
        </div>

        {/* Clear & Start Over Button */}
        {onClearChat && messages.length > 0 && (
          <button
            type="button"
            onClick={() => {
              playClickPop(soundEnabled);
              onClearChat();
            }}
            title="Start a new adventure"
            className="kid-btn flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-extrabold text-xs shadow-sm cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        )}
      </div>

      {/* 2. One-Tap Quick Wonder Buttons Strip (Minimal Text, Large Colorful Buttons) */}
      <div className="p-3 bg-amber-50/70 border-b-2 border-amber-200">
        <div className="flex items-center justify-between mb-1.5 px-1">
          <span className="text-xs font-extrabold text-amber-900 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Tap to Ask Instantly:</span>
          </span>
        </div>

        {/* Chunky Large Button Row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
          {QUICK_TOPICS.map((topic, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickTopic(topic)}
              className={`kid-btn shrink-0 flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm text-white cursor-pointer ${topic.color}`}
            >
              <span className="text-lg leading-none">{topic.emoji}</span>
              <span className="whitespace-nowrap">{topic.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Messages Feed Area */}
      <div className="p-4 sm:p-6 space-y-5 min-h-[300px] max-h-[460px] overflow-y-auto bg-slate-50/60">
        {/* Welcome Card if no messages yet */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
            <div className="p-4 rounded-3xl bg-white border-3 border-amber-200 shadow-md max-w-lg w-full flex flex-col items-center">
              <div className="text-4xl mb-2">👋🎈</div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 font-sniglet">
                Welcome, Young Explorer!
              </h3>
              <p className="text-sm font-semibold text-slate-600 mt-1 mb-4 leading-relaxed">
                {isSuperman
                  ? "I'm Captain Wonder! What secret of the universe are you wondering about today? Tap any topic above or tap the big Speak button!"
                  : "Beep-Boop! All my science circuits are buzzing! Tap any topic above or speak into the microphone to explore!"}
              </p>

              {/* Big Action Buttons to Start */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    playClickPop(soundEnabled);
                    onOpenVoice();
                  }}
                  className="kid-btn flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-sm shadow-[0_4px_0_0_#ca8a04] cursor-pointer"
                >
                  <Mic className="w-5 h-5" />
                  <span>Tap to Speak Voice</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickTopic(QUICK_TOPICS[0])}
                  className="kid-btn flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm shadow-[0_4px_0_0_#059669] cursor-pointer"
                >
                  <span>🦖 Ask About Dinosaurs!</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Message Stream */}
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
            >
              {/* Companion Avatar for Assistant messages */}
              {!isUser && (
                <div className="shrink-0 self-start mt-1">
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-white shadow-md ${
                      isSuperman ? "bg-red-600" : "bg-sky-500"
                    }`}
                  >
                    {isSuperman ? <Flame className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
                  </div>
                </div>
              )}

              {/* Speech Bubble */}
              <div
                className={`max-w-[88%] sm:max-w-[78%] rounded-3xl p-4 sm:p-5 shadow-md ${
                  isUser
                    ? "bg-slate-800 text-white rounded-br-none"
                    : isSuperman
                    ? "bg-white border-3 border-red-200 text-slate-800 rounded-bl-none"
                    : "bg-white border-3 border-sky-200 text-slate-800 rounded-bl-none"
                }`}
              >
                {/* User Header */}
                {isUser && (
                  <div className="text-[11px] font-black text-amber-300 uppercase tracking-wider mb-1">
                    Your Question:
                  </div>
                )}

                {/* Body Text */}
                <p className="text-base sm:text-lg font-semibold leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </p>

                {/* Assistant Interactive Controls */}
                {!isUser && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-3">
                    {/* Big Clear Read Aloud Button */}
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          playClickPop(soundEnabled);
                          if (isSpeaking) {
                            onStopSpeaking();
                          } else {
                            onSpeakMessage(msg.content);
                          }
                        }}
                        className={`kid-btn flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm cursor-pointer ${
                          isSpeaking
                            ? "bg-rose-500 text-white shadow-[0_3px_0_0_#be185d]"
                            : isSuperman
                            ? "bg-red-600 text-white shadow-[0_3px_0_0_#991b1b]"
                            : "bg-sky-600 text-white shadow-[0_3px_0_0_#0369a1]"
                        }`}
                      >
                        {isSpeaking ? (
                          <>
                            <VolumeX className="w-4 h-4 shrink-0" />
                            <span>Stop Voice</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-4 h-4 shrink-0 animate-bounce" />
                            <span>Listen to Answer 🔊</span>
                          </>
                        )}
                      </button>

                      <span className="text-[11px] font-bold text-slate-400">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {/* Fun Fact Callout Card */}
                    {msg.funFact && (
                      <div className="p-3.5 rounded-2xl bg-amber-100/80 border-2 border-amber-300 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                        <div className="flex items-start gap-2.5">
                          <div className="p-1.5 rounded-xl bg-amber-400 text-amber-950 shrink-0 mt-0.5">
                            <Lightbulb className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-[11px] font-black uppercase tracking-wider text-amber-800 block">
                              Wonder Fun Fact:
                            </span>
                            <p className="text-xs sm:text-sm font-semibold text-amber-950">
                              {msg.funFact}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleConfetti}
                          className="kid-btn shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-[0_2px_0_0_#b45309] cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Yay! 🎉</span>
                        </button>
                      </div>
                    )}

                    {/* Follow-up Questions (Large touch targets) */}
                    {msg.followUps && msg.followUps.length > 0 && (
                      <div className="mt-1">
                        <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block mb-2">
                          Keep Exploring:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {msg.followUps.map((q, qIdx) => (
                            <button
                              key={qIdx}
                              type="button"
                              onClick={() => {
                                playClickPop(soundEnabled);
                                onSendMessage(q);
                              }}
                              className={`kid-btn flex items-center gap-2 px-3.5 py-2 rounded-2xl font-bold text-xs sm:text-sm text-left cursor-pointer border-2 ${
                                isSuperman
                                  ? "bg-rose-50 hover:bg-rose-100 text-rose-950 border-rose-200"
                                  : "bg-sky-50 hover:bg-sky-100 text-sky-950 border-sky-200"
                              }`}
                            >
                              <span>{q}</span>
                              <ArrowRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* Loading Animation Bubble */}
        {isLoading && (
          <div className="flex gap-3 items-center text-slate-600">
            <div
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-white shadow-md animate-bounce ${
                isSuperman ? "bg-red-600" : "bg-sky-500"
              }`}
            >
              <Sparkles className="w-5 h-5 animate-spin" />
            </div>
            <div className="p-4 bg-white rounded-3xl border-2 border-amber-200 shadow-md flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base text-slate-800">
                {isSuperman
                  ? "Captain Wonder is zooming for answers..."
                  : "Beep-Boop is calculating your wonder..."}
              </span>
              <span className="flex gap-1">
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                <span className="w-2 h-2 bg-sky-500 rounded-full animate-pulse delay-100" />
                <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse delay-200" />
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 4. Large, Simple Bottom Chat Input Bar with Giant Action Buttons */}
      <form
        onSubmit={handleSubmit}
        className="p-3 sm:p-4 bg-white border-t-3 border-amber-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
      >
        {/* Large Text Input */}
        <div className="relative flex-1 flex items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Ask ${isSuperman ? "Captain Wonder" : "Beep-Boop"} anything...`}
            className="w-full bg-slate-100 focus:bg-white border-3 border-slate-200 focus:border-amber-400 rounded-2xl sm:rounded-3xl px-4 py-3 sm:py-3.5 text-base sm:text-lg font-bold text-slate-800 placeholder-slate-400 focus:outline-none transition shadow-inner"
          />
          {inputText && (
            <button
              type="button"
              onClick={() => setInputText("")}
              className="absolute right-3 text-xs font-black text-slate-400 hover:text-slate-600 px-2 py-1 rounded-lg"
            >
              Clear
            </button>
          )}
        </div>

        {/* Action Buttons Row: Oversized Speak & Ask Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Big Speak / Mic Button */}
          <button
            type="button"
            onClick={() => {
              playClickPop(soundEnabled);
              onOpenVoice();
            }}
            title="Speak your question out loud!"
            className="kid-btn flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 sm:py-3.5 rounded-2xl sm:rounded-3xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-sm sm:text-base shadow-[0_4px_0_0_#ca8a04] cursor-pointer"
          >
            <Mic className="w-5 h-5 shrink-0" />
            <span>Speak</span>
          </button>

          {/* Big Ask / Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className={`kid-btn flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 sm:py-3.5 rounded-2xl sm:rounded-3xl font-black text-sm sm:text-base text-white transition disabled:opacity-40 cursor-pointer ${
              isSuperman
                ? "bg-red-600 hover:bg-red-700 shadow-[0_4px_0_0_#991b1b]"
                : "bg-sky-500 hover:bg-sky-600 shadow-[0_4px_0_0_#0284c7]"
            }`}
          >
            <Send className="w-5 h-5 shrink-0" />
            <span>Ask!</span>
          </button>
        </div>
      </form>
    </div>
  );
};
