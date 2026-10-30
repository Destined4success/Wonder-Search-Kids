import React from "react";
import { motion } from "motion/react";
import {
  Bot,
  Flame,
  Volume2,
  VolumeX,
  Shield,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { CharacterPersona } from "../types";
import { playClickPop, playCelebration } from "../utils/audio";

interface SearchHeroProps {
  character: CharacterPersona;
  onSelectCharacter: (char: CharacterPersona) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenParental: () => void;
  onOpenOverseer: () => void;
  pendingOverseerCount: number;
}

export const SearchHero: React.FC<SearchHeroProps> = ({
  character,
  onSelectCharacter,
  soundEnabled,
  onToggleSound,
  onOpenParental,
  onOpenOverseer,
  pendingOverseerCount,
}) => {
  const isSuperman = character === "superman";

  return (
    <header className="w-full max-w-4xl flex flex-col items-center select-none">
      {/* Top Navigation Row: Logo + Character Switcher + Sound & Parent Controls */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 py-2 px-2">
        {/* Brand Wordmark (Single Element / Natural Title) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center text-3xl sm:text-4xl font-extrabold tracking-tight font-sniglet">
            <span className="text-[#4285F4]">W</span>
            <span className="text-[#EA4335]">o</span>
            <span className="text-[#FBBC05]">n</span>
            <span className="text-[#4285F4]">d</span>
            <span className="text-[#34A853]">e</span>
            <span className="text-[#EA4335]">r</span>
            <span className="text-[#4285F4] ml-1">K</span>
            <span className="text-[#FBBC05]">i</span>
            <span className="text-[#34A853]">d</span>
            <span className="text-[#EA4335]">s</span>
            <span className="text-2xl ml-1">🎈</span>
          </div>
        </div>

        {/* Center: Large, Chunky Character Switcher Buttons */}
        <div className="flex items-center gap-2 p-1.5 bg-white rounded-3xl border-3 border-amber-200 shadow-md">
          {/* Robot Button */}
          <button
            type="button"
            onClick={() => {
              playClickPop(soundEnabled);
              onSelectCharacter("robot");
            }}
            className={`kid-btn flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-sm sm:text-base cursor-pointer ${
              !isSuperman
                ? "bg-sky-500 text-white shadow-[0_4px_0_0_#0284c7]"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Bot className="w-5 h-5 shrink-0" />
            <span>Robot</span>
          </button>

          {/* Superhero Button */}
          <button
            type="button"
            onClick={() => {
              playClickPop(soundEnabled);
              onSelectCharacter("superman");
            }}
            className={`kid-btn flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-sm sm:text-base cursor-pointer ${
              isSuperman
                ? "bg-red-600 text-white shadow-[0_4px_0_0_#b91c1c]"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Flame className="w-5 h-5 shrink-0" />
            <span>Hero</span>
          </button>
        </div>

        {/* Right Utility Buttons: Sound FX & Parent Lock */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            title={soundEnabled ? "Sound Effects ON" : "Sound Effects OFF"}
            className="kid-btn p-3 rounded-2xl bg-white hover:bg-amber-50 border-3 border-amber-200 text-amber-900 shadow-[0_3px_0_0_#fcd34d] cursor-pointer flex items-center justify-center"
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5 text-indigo-600" />
            ) : (
              <VolumeX className="w-5 h-5 text-slate-400" />
            )}
          </button>

          {/* Parents PIN Button */}
          <button
            type="button"
            onClick={() => {
              playClickPop(soundEnabled);
              onOpenParental();
            }}
            title="Parental Controls (PIN: 1234)"
            className="kid-btn flex items-center gap-1.5 px-3.5 py-3 rounded-2xl bg-white hover:bg-indigo-50 border-3 border-indigo-200 text-indigo-900 font-extrabold text-xs shadow-[0_3px_0_0_#c7d2fe] cursor-pointer"
          >
            <Shield className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Parents</span>
          </button>

          {/* Overseer Admin Portal Button */}
          <button
            type="button"
            onClick={() => {
              playClickPop(soundEnabled);
              onOpenOverseer();
            }}
            title="Overseer Safety Triage (john.otolorin@gmail.com)"
            className="relative kid-btn p-3 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white shadow-[0_3px_0_0_#1e293b] cursor-pointer flex items-center justify-center"
          >
            <ShieldAlert className="w-4 h-4 text-amber-300" />
            {pendingOverseerCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-[11px] font-black flex items-center justify-center shadow-md animate-bounce">
                {pendingOverseerCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Cheerful Visual Exploration Banner with Mascot Welcome Bubble */}
      <div className="relative w-full mt-3 rounded-3xl overflow-hidden border-4 border-amber-200/90 shadow-lg bg-gradient-to-r from-amber-100 via-sky-100 to-emerald-100">
        <div className="relative h-28 sm:h-36 w-full overflow-hidden">
          <img
            src="/src/assets/images/kids_wonder_banner_1793385608013.jpg"
            alt="WonderKids landscape with friendly dinosaur, smiling planets, and rainbow"
            className="w-full h-full object-cover object-center filter saturate-110"
            referrerPolicy="no-referrer"
          />
          {/* Subtle gradient overlay to enhance text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent flex items-end p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 ${
                  isSuperman ? "bg-red-600" : "bg-sky-500"
                }`}
              >
                {isSuperman ? <Flame className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
              </div>
              <div className="text-white drop-shadow-md">
                <h1 className="text-base sm:text-xl font-extrabold tracking-tight font-sniglet text-white">
                  {isSuperman ? "Captain Wonder's Learning HQ" : "Beep-Boop's Curiosity Lab"}
                </h1>
                <p className="text-xs sm:text-sm font-semibold text-amber-200">
                  {isSuperman
                    ? "Up, up, and into wonder! Ask or speak any question below."
                    : "Beep-boop! Ask me any wonder or tap a picture to start!"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
