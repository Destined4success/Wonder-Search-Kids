import React from "react";
import { motion } from "motion/react";
import { Volume2, VolumeX, Sparkles, Zap } from "lucide-react";
import { CharacterPersona } from "../types";

interface CompanionAvatarProps {
  character: CharacterPersona;
  isSpeaking: boolean;
  onToggleSpeech?: () => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const CompanionAvatar: React.FC<CompanionAvatarProps> = ({
  character,
  isSpeaking,
  onToggleSpeech,
  size = "md",
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-28 h-28 sm:w-32 sm:h-32",
    lg: "w-40 h-40 sm:w-48 sm:h-48",
  };

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      {/* Speech Glow / Aura */}
      {isSpeaking && (
        <motion.div
          animate={{ scale: [1, 1.18, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute inset-0 rounded-full blur-xl pointer-events-none ${
            character === "robot" ? "bg-cyan-400/40" : "bg-amber-400/40"
          }`}
        />
      )}

      {/* Main Avatar Container */}
      <motion.div
        animate={
          isSpeaking
            ? { y: [0, -6, 0], rotate: character === "robot" ? [0, 2, -2, 0] : [0, 1, -1, 0] }
            : { y: [0, -3, 0] }
        }
        transition={{
          duration: isSpeaking ? 1.2 : 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={`relative ${sizeClasses[size]} rounded-3xl flex items-center justify-center select-none shadow-lg cursor-pointer ${
          character === "robot"
            ? "bg-gradient-to-b from-sky-400 via-indigo-500 to-indigo-700 ring-4 ring-sky-300/60"
            : "bg-gradient-to-b from-red-500 via-blue-600 to-blue-800 ring-4 ring-amber-300/70"
        }`}
        onClick={onToggleSpeech}
        title={isSpeaking ? "Click to pause voice" : "Click to hear voice"}
      >
        {/* CHARACTER: ROBOT (Beep-Boop 3000) */}
        {character === "robot" && (
          <div className="relative w-full h-full flex flex-col items-center justify-center p-2">
            {/* Robot Antenna */}
            <div className="absolute -top-3 flex flex-col items-center">
              <motion.div
                animate={isSpeaking ? { scale: [1, 1.4, 1] } : {}}
                transition={{ duration: 0.6, repeat: Infinity }}
                className="w-3.5 h-3.5 rounded-full bg-amber-300 shadow-md ring-2 ring-white"
              />
              <div className="w-1.5 h-3 bg-slate-300 rounded-t" />
            </div>

            {/* Robot Head Frame */}
            <div className="w-4/5 h-4/5 bg-slate-900/90 rounded-2xl border-2 border-cyan-300/70 flex flex-col items-center justify-center p-2 shadow-inner">
              {/* LED Eyes */}
              <div className="flex items-center justify-between w-full px-2 mb-1.5">
                <motion.div
                  animate={
                    isSpeaking
                      ? { scaleY: [1, 0.2, 1], scaleX: [1, 1.1, 1] }
                      : { scaleY: [1, 1, 0.1, 1] }
                  }
                  transition={{
                    duration: isSpeaking ? 0.8 : 3.5,
                    repeat: Infinity,
                    times: isSpeaking ? [0, 0.5, 1] : [0, 0.9, 0.95, 1],
                  }}
                  className="w-4 h-4 rounded-full bg-cyan-300 shadow-[0_0_8px_#22d3ee] flex items-center justify-center"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </motion.div>

                {/* Processing Sensor / Gear */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="w-2.5 h-2.5 rounded-full border border-dashed border-cyan-400"
                />

                <motion.div
                  animate={
                    isSpeaking
                      ? { scaleY: [1, 0.2, 1], scaleX: [1, 1.1, 1] }
                      : { scaleY: [1, 1, 0.1, 1] }
                  }
                  transition={{
                    duration: isSpeaking ? 0.8 : 3.5,
                    repeat: Infinity,
                    times: isSpeaking ? [0, 0.5, 1] : [0, 0.9, 0.95, 1],
                  }}
                  className="w-4 h-4 rounded-full bg-cyan-300 shadow-[0_0_8px_#22d3ee] flex items-center justify-center"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </motion.div>
              </div>

              {/* Animated Robot Mouth Voice Grill */}
              <div className="w-3/4 h-3 bg-slate-950 rounded-full border border-cyan-500/40 flex items-center justify-center gap-0.5 px-1 overflow-hidden">
                {isSpeaking ? (
                  [0.3, 0.8, 1, 0.6, 0.9, 0.4].map((scale, idx) => (
                    <motion.div
                      key={idx}
                      animate={{ height: ["20%", "90%", "30%"] }}
                      transition={{
                        duration: 0.35,
                        repeat: Infinity,
                        delay: idx * 0.08,
                        ease: "easeInOut",
                      }}
                      className="w-1 bg-cyan-400 rounded-full"
                      style={{ height: `${scale * 100}%` }}
                    />
                  ))
                ) : (
                  <div className="w-full h-0.5 bg-cyan-400/60 rounded" />
                )}
              </div>
            </div>

            {/* Robot Ear Bolts */}
            <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-2 h-4 bg-amber-400 rounded-l border border-slate-700" />
            <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-2 h-4 bg-amber-400 rounded-r border border-slate-700" />
          </div>
        )}

        {/* CHARACTER: SUPERMAN / SUPERHERO (Captain Wonder) */}
        {character === "superman" && (
          <div className="relative w-full h-full flex flex-col items-center justify-center p-2 overflow-hidden">
            {/* Superhero Flowing Cape */}
            <motion.div
              animate={{ rotate: [-2, 3, -2], x: [-1, 2, -1] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-1 -right-2 w-12 h-20 bg-red-600 rounded-br-3xl transform rotate-12 opacity-80 z-0 pointer-events-none"
            />

            {/* Superhero Face / Mask */}
            <div className="relative z-10 w-4/5 h-4/5 flex flex-col items-center justify-center">
              {/* Hero Cowl / Hair swoosh */}
              <div className="absolute -top-2 flex items-center justify-center">
                <div className="w-10 h-3 bg-amber-200/90 rounded-t-full shadow-sm" />
                <motion.div
                  animate={{ y: [0, -1, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-2.5 h-3 bg-amber-300 rounded-full -ml-2 -mt-1 transform rotate-12"
                />
              </div>

              {/* Friendly Hero Eyes */}
              <div className="flex items-center justify-between w-full px-3 mb-2 mt-1">
                <motion.div
                  animate={isSpeaking ? { scale: [1, 1.15, 1] } : {}}
                  transition={{ duration: 0.6, repeat: Infinity }}
                  className="w-4 h-4 rounded-full bg-white shadow-sm flex items-center justify-center ring-2 ring-blue-900"
                >
                  <div className="w-2 h-2 rounded-full bg-blue-700" />
                </motion.div>

                {/* Hero Star Sparkle */}
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />

                <motion.div
                  animate={isSpeaking ? { scale: [1, 1.15, 1] } : {}}
                  transition={{ duration: 0.6, repeat: Infinity }}
                  className="w-4 h-4 rounded-full bg-white shadow-sm flex items-center justify-center ring-2 ring-blue-900"
                >
                  <div className="w-2 h-2 rounded-full bg-blue-700" />
                </motion.div>
              </div>

              {/* Superhero Emblem (Diamond S-Shield) */}
              <div className="w-9 h-9 bg-amber-400 rounded-lg transform rotate-45 border-2 border-red-600 flex items-center justify-center shadow-md my-0.5">
                <div className="transform -rotate-45 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-red-600 fill-red-600" />
                </div>
              </div>

              {/* Superhero Friendly Smile */}
              <div className="mt-1 flex items-center justify-center">
                {isSpeaking ? (
                  <motion.div
                    animate={{ scaleY: [0.6, 1.4, 0.6], scaleX: [1, 1.1, 1] }}
                    transition={{ duration: 0.35, repeat: Infinity }}
                    className="w-5 h-3 bg-red-800 rounded-full border border-white/80 overflow-hidden flex items-center justify-center"
                  >
                    <div className="w-3 h-1 bg-white rounded-full mt-0.5" />
                  </motion.div>
                ) : (
                  <div className="w-5 h-2 border-b-2 border-white rounded-b-full" />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Audio Speaker Status Badge */}
        <div
          className={`absolute -bottom-1 -right-1 p-1.5 rounded-full border-2 border-white shadow-md ${
            isSpeaking ? "bg-emerald-500 text-white animate-bounce" : "bg-slate-700 text-slate-200"
          }`}
        >
          {isSpeaking ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </div>
      </motion.div>

      {/* Persona Tag */}
      <span
        className={`mt-2 font-bold tracking-tight text-xs uppercase px-2.5 py-0.5 rounded-full shadow-sm ${
          character === "robot"
            ? "bg-sky-100 text-sky-800 border border-sky-300"
            : "bg-red-100 text-red-800 border border-red-300"
        }`}
      >
        {character === "robot" ? "Beep-Boop 3000" : "Captain Wonder"}
      </span>
    </div>
  );
};
