import React, { useState, useEffect } from "react";
import { SearchHero } from "./components/SearchHero";
import { ChatBox } from "./components/ChatBox";
import { VoiceModal } from "./components/VoiceModal";
import { ParentalControlModal } from "./components/ParentalControlModal";
import { OverseerModal } from "./components/OverseerModal";
import {
  CharacterPersona,
  AnswerResponse,
  ChatMessage,
  SafetyIncident,
  ParentalSettings,
  SearchHistoryItem,
} from "./types";
import {
  speakText,
  stopSpeaking,
  playRobotBeep,
  playHeroFanfare,
  playClickPop,
  playShieldBlock,
} from "./utils/audio";
import { Moon, Lock, ShieldCheck } from "lucide-react";

const INITIAL_SETTINGS: ParentalSettings = {
  pin: "1234",
  dailyTimeLimitMinutes: 60,
  bedtimeLock: false,
  bedtimeStart: "20:00",
  bedtimeEnd: "07:00",
  safeSearchLevel: "strict",
  ageGroup: "explorer",
  blockedKeywords: ["tiktok", "violence", "scary", "dating", "gambling"],
  soundEffects: true,
  ttsAutoPlay: true,
  allowVoice: true,
  parentEmail: "parent@family.home",
  overseerEmail: "john.otolorin@gmail.com",
  requireOverseerFirst: true,
};

export default function App() {
  const [character, setCharacter] = useState<CharacterPersona>("robot");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [settings, setSettings] = useState<ParentalSettings>(INITIAL_SETTINGS);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Safety & Triage State
  const [incidents, setIncidents] = useState<SafetyIncident[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);

  // Modals
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isParentalOpen, setIsParentalOpen] = useState(false);
  const [isOverseerOpen, setIsOverseerOpen] = useState(false);

  // Bedtime Curfew Check
  const [isBedtimeLocked, setIsBedtimeLocked] = useState(false);

  // Fetch initial incidents from backend
  useEffect(() => {
    fetch("/api/overseer/incidents?key=admin")
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.incidents)) {
          setIncidents(data.incidents);
        }
      })
      .catch((err) => console.debug("Incident fetch err", err));
  }, []);

  // Check Bedtime Lockout
  useEffect(() => {
    if (!settings.bedtimeLock) {
      setIsBedtimeLocked(false);
      return;
    }

    const checkBedtime = () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const [startH, startM] = settings.bedtimeStart.split(":").map(Number);
      const [endH, endM] = settings.bedtimeEnd.split(":").map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;

      let isCurfew = false;
      if (startMinutes > endMinutes) {
        // Across midnight (e.g. 20:00 to 07:00)
        isCurfew = currentMinutes >= startMinutes || currentMinutes < endMinutes;
      } else {
        isCurfew = currentMinutes >= startMinutes && currentMinutes < endMinutes;
      }
      setIsBedtimeLocked(isCurfew);
    };

    checkBedtime();
    const interval = setInterval(checkBedtime, 60000);
    return () => clearInterval(interval);
  }, [settings.bedtimeLock, settings.bedtimeStart, settings.bedtimeEnd]);

  // Handle Search Submission
  const handlePerformSearch = async (
    queryText: string,
    source: "text" | "voice" = "text"
  ) => {
    if (!queryText.trim() || isLoading) return;

    stopSpeaking();
    setIsSpeaking(false);
    setIsLoading(true);

    // Play companion sound
    if (character === "robot") {
      playRobotBeep(soundEnabled);
    } else {
      playHeroFanfare(soundEnabled);
    }

    // Add user message immediately to chat stream
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-u`,
      role: "user",
      content: queryText,
      timestamp: new Date().toISOString(),
    };
    setChatMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: queryText,
          character,
          ageGroup: settings.ageGroup,
          customBlocked: settings.blockedKeywords,
          source,
          history: chatMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      let data: AnswerResponse;
      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        throw new Error(errorJson.error || `Server responded with ${res.status}`);
      } else {
        data = await res.json();
      }

      if (!data || !data.answer) {
        throw new Error("Empty or malformed answer received");
      }

      // Append to Search History Log
      const historyItem: SearchHistoryItem = {
        id: `hist-${Date.now()}`,
        query: queryText,
        timestamp: new Date().toISOString(),
        character,
        isBlocked: Boolean(data.isBlocked),
      };
      setSearchHistory((prev) => [historyItem, ...prev]);

      // If this query was blocked, trigger incident alerts & shield chime
      if (data.isBlocked) {
        playShieldBlock(soundEnabled);

        // Fetch refreshed incidents from server
        fetch("/api/overseer/incidents?key=admin")
          .then((r) => r.json())
          .then((incData) => {
            if (incData?.incidents) setIncidents(incData.incidents);
          })
          .catch(() => {});
      }

      // Add assistant response to chat
      const botMsg: ChatMessage = {
        id: `msg-${Date.now()}-b`,
        role: "assistant",
        content: data.answer,
        timestamp: new Date().toISOString(),
        character: data.character || character,
        funFact: data.funFact,
        followUps: data.followUps,
        isBlocked: data.isBlocked,
      };
      setChatMessages((prev) => [...prev, botMsg]);

      // Auto-play voice if enabled
      if (settings.ttsAutoPlay && data.answer) {
        const fullSpeech = `${data.greeting || ""} ${data.answer} Wonder fact: ${data.funFact || ""}`.trim();
        speakText(
          fullSpeech,
          character,
          () => setIsSpeaking(true),
          () => setIsSpeaking(false),
          () => setIsSpeaking(false)
        );
      }
    } catch (err) {
      console.error("Search error:", err);
      const fallbackAns: AnswerResponse = {
        isBlocked: false,
        character,
        greeting: character === "superman" ? "Young Hero, stay curious!" : "Beep-Boop backup module ready!",
        answer: `That is an awesome question about "${queryText}"! Nature, space, and science are full of marvelous mysteries waiting to be explored. Ask another question or check out the suggestions below!`,
        funFact: "Every time you wonder and learn, your brain creates brand new synaptic pathways!",
        followUps: ["Why is the ocean blue?", "How big is Jupiter?", "How do birds fly?"],
      };

      const botMsg: ChatMessage = {
        id: `msg-${Date.now()}-b`,
        role: "assistant",
        content: fallbackAns.answer,
        timestamp: new Date().toISOString(),
        character,
        funFact: fallbackAns.funFact,
        followUps: fallbackAns.followUps,
      };
      setChatMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopSpeaking = () => {
    stopSpeaking();
    setIsSpeaking(false);
  };

  const handleSpeakText = (txt: string) => {
    stopSpeaking();
    speakText(
      txt,
      character,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false),
      () => setIsSpeaking(false)
    );
  };

  // Overseer Triage Action Handler
  const handleOverseerTriage = async (
    incidentId: string,
    action: "release_to_parent" | "dismiss" | "urgent_escalate",
    notes?: string
  ) => {
    try {
      const res = await fetch("/api/overseer/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incidentId, action, notes }),
      });
      const data = await res.json();
      if (data?.incident) {
        setIncidents((prev) =>
          prev.map((i) => (i.id === incidentId ? data.incident : i))
        );
      }
    } catch (err) {
      console.error("Triage error", err);
    }
  };

  const handleSwitchCharacter = (newChar: CharacterPersona) => {
    setCharacter(newChar);
    if (newChar === "robot") {
      playRobotBeep(soundEnabled);
    } else {
      playHeroFanfare(soundEnabled);
    }
  };

  const pendingOverseerCount = incidents.filter((i) => !i.overseerReviewed).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF7] text-slate-800 antialiased font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Bedtime Curfew Lock Screen */}
      {isBedtimeLocked && (
        <div className="fixed inset-0 z-50 bg-indigo-950 text-white flex flex-col items-center justify-center p-6 text-center">
          <Moon className="w-16 h-16 text-amber-300 mb-4 animate-pulse" />
          <h1 className="text-3xl font-black mb-2 font-sniglet">Shhh! It's Bedtime!</h1>
          <p className="text-sm text-indigo-200 max-w-md mb-6 leading-relaxed">
            Beep-Boop and Captain Wonder are charging their super batteries for tomorrow. Time for sleep and sweet dreams! 🌙✨
          </p>
          <button
            onClick={() => setIsParentalOpen(true)}
            className="kid-btn flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-800 hover:bg-indigo-700 text-xs font-bold border border-indigo-600 transition shadow-lg cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            <span>Parent Unlock with PIN</span>
          </button>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6 flex flex-col items-center">
        {/* Child-Friendly Header & Banner */}
        <SearchHero
          character={character}
          onSelectCharacter={handleSwitchCharacter}
          soundEnabled={soundEnabled}
          onToggleSound={() => {
            playClickPop(true);
            setSoundEnabled(!soundEnabled);
          }}
          onOpenParental={() => setIsParentalOpen(true)}
          onOpenOverseer={() => setIsOverseerOpen(true)}
          pendingOverseerCount={pendingOverseerCount}
        />

        {/* Central Prominent Chat Box (Always Visible, Simple to Use, Large Clear Buttons) */}
        <div className="w-full">
          <ChatBox
            messages={chatMessages}
            onSendMessage={(txt) => handlePerformSearch(txt, "text")}
            onOpenVoice={() => setIsVoiceOpen(true)}
            character={character}
            isLoading={isLoading}
            onSpeakMessage={handleSpeakText}
            onStopSpeaking={handleStopSpeaking}
            isSpeaking={isSpeaking}
            soundEnabled={soundEnabled}
            onClearChat={() => setChatMessages([])}
          />
        </div>
      </main>

      {/* Clean Child Safety Footer */}
      <footer className="w-full py-4 border-t border-amber-200/60 bg-white/60 text-center text-xs text-slate-500 select-none">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-bold text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>WonderKids &bull; 100% Protected Kid Learning Playground</span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <button
              onClick={() => setIsParentalOpen(true)}
              className="hover:text-indigo-600 font-bold transition cursor-pointer"
            >
              Parental Controls
            </button>
            <span>&bull;</span>
            <button
              onClick={() => setIsOverseerOpen(true)}
              className="hover:text-slate-900 font-bold text-slate-700 transition cursor-pointer"
            >
              Super-Admin Safety Portal
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <VoiceModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onTranscript={(txt) => handlePerformSearch(txt, "voice")}
        character={character}
        soundEnabled={soundEnabled}
      />

      <ParentalControlModal
        isOpen={isParentalOpen}
        onClose={() => setIsParentalOpen(false)}
        settings={settings}
        onSaveSettings={(newSettings) => setSettings(newSettings)}
        history={searchHistory}
        incidents={incidents}
        soundEnabled={soundEnabled}
      />

      <OverseerModal
        isOpen={isOverseerOpen}
        onClose={() => setIsOverseerOpen(false)}
        incidents={incidents}
        onTriageAction={handleOverseerTriage}
        soundEnabled={soundEnabled}
      />
    </div>
  );
}
