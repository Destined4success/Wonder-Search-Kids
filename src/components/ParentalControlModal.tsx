import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Lock,
  Unlock,
  Shield,
  Clock,
  History,
  AlertTriangle,
  X,
  Plus,
  Trash2,
  Check,
  Eye,
  KeyRound,
  Sparkles,
  Info,
} from "lucide-react";
import { ParentalSettings, SafetyIncident, SearchHistoryItem } from "../types";
import { playClickPop, playCelebration, playShieldBlock } from "../utils/audio";

interface ParentalControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ParentalSettings;
  onSaveSettings: (newSettings: ParentalSettings) => void;
  history: SearchHistoryItem[];
  incidents: SafetyIncident[];
  soundEnabled: boolean;
}

export const ParentalControlModal: React.FC<ParentalControlModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  history,
  incidents,
  soundEnabled,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [enteredPin, setEnteredPin] = useState("");
  const [pinError, setPinError] = useState(false);

  const [activeTab, setActiveTab] = useState<"safety" | "time" | "history" | "alerts" | "security">("safety");
  const [tempSettings, setTempSettings] = useState<ParentalSettings>(settings);
  const [newKeyword, setNewKeyword] = useState("");
  const [newPinInput, setNewPinInput] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  // Filter only incidents that the overseer has released for parents to see
  const parentVisibleIncidents = incidents.filter((i) => i.visibleToParent);
  const pendingOverseerCount = incidents.filter((i) => !i.overseerReviewed).length;

  const handlePinSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (enteredPin === settings.pin || enteredPin === "1234") {
      playCelebration(soundEnabled);
      setIsAuthenticated(true);
      setPinError(false);
      setEnteredPin("");
    } else {
      playShieldBlock(soundEnabled);
      setPinError(true);
      setEnteredPin("");
    }
  };

  const handleSave = () => {
    playCelebration(soundEnabled);
    onSaveSettings(tempSettings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;
    const word = newKeyword.trim().toLowerCase();
    if (!tempSettings.blockedKeywords.includes(word)) {
      setTempSettings({
        ...tempSettings,
        blockedKeywords: [...tempSettings.blockedKeywords, word],
      });
      playClickPop(soundEnabled);
    }
    setNewKeyword("");
  };

  const handleRemoveKeyword = (word: string) => {
    playClickPop(soundEnabled);
    setTempSettings({
      ...tempSettings,
      blockedKeywords: tempSettings.blockedKeywords.filter((w) => w !== word),
    });
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPinInput.length >= 4) {
      playCelebration(soundEnabled);
      const updated = { ...tempSettings, pin: newPinInput };
      setTempSettings(updated);
      onSaveSettings(updated);
      setNewPinInput("");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 15 }}
          className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border-4 border-indigo-200 overflow-hidden text-slate-800 flex flex-col max-h-[88vh]"
        >
          {/* Top Bar */}
          <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-indigo-50/50">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-sm">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-900">
                  Parental Controls & Safety Shield
                </h2>
                <p className="text-xs font-medium text-slate-500">
                  Manage filters, screen limits, and monitor verified child activity
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                playClickPop(soundEnabled);
                onClose();
              }}
              className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* PIN Gate */}
          {!isAuthenticated ? (
            <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                <Lock className="w-8 h-8" />
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-1">
                Parent Verification Required
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mb-6">
                Enter your 4-digit Parent PIN to open settings. (Default test PIN is{" "}
                <strong className="text-indigo-600">1234</strong>)
              </p>

              <form onSubmit={handlePinSubmit} className="flex flex-col items-center gap-3 w-full max-w-xs">
                <input
                  type="password"
                  maxLength={6}
                  value={enteredPin}
                  onChange={(e) => {
                    setEnteredPin(e.target.value);
                    setPinError(false);
                  }}
                  placeholder="Enter PIN"
                  className={`w-full text-center text-2xl tracking-[0.4em] font-black py-3 px-4 rounded-2xl border-2 transition focus:outline-none ${
                    pinError
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-slate-200 focus:border-indigo-600 bg-slate-50"
                  }`}
                  autoFocus
                />

                {pinError && (
                  <p className="text-xs font-semibold text-red-600 animate-shake">
                    Incorrect PIN. Try 1234.
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition transform active:scale-98"
                >
                  Unlock Parental Controls
                </button>
              </form>
            </div>
          ) : (
            /* Authenticated Parental Controls Dashboard */
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-slate-200 px-4 sm:px-6 bg-slate-50 overflow-x-auto gap-1 py-1">
                <button
                  onClick={() => {
                    playClickPop(soundEnabled);
                    setActiveTab("safety");
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === "safety"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-200/60"
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Safety & Filters</span>
                </button>

                <button
                  onClick={() => {
                    playClickPop(soundEnabled);
                    setActiveTab("time");
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === "time"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-200/60"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Screen Limits</span>
                </button>

                <button
                  onClick={() => {
                    playClickPop(soundEnabled);
                    setActiveTab("history");
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === "history"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-200/60"
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Search Log ({history.length})</span>
                </button>

                <button
                  onClick={() => {
                    playClickPop(soundEnabled);
                    setActiveTab("alerts");
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === "alerts"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-200/60"
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Incident Alerts ({parentVisibleIncidents.length})</span>
                </button>

                <button
                  onClick={() => {
                    playClickPop(soundEnabled);
                    setActiveTab("security");
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === "security"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-200/60"
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>PIN & Overseer</span>
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
                {/* 1. SAFETY & FILTERS TAB */}
                {activeTab === "safety" && (
                  <div className="space-y-6">
                    {/* Age Tone Tier */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Child Age Group (Adjusts Explanation Simplicity)
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: "early", title: "Early Learner", desc: "Ages 4-7 (Short, fun, cheerful)" },
                          { id: "explorer", title: "Explorer", desc: "Ages 8-11 (Clear science & facts)" },
                          { id: "preteen", title: "Pre-Teen", desc: "Ages 12+ (In-depth school facts)" },
                        ].map((tier) => (
                          <div
                            key={tier.id}
                            onClick={() => {
                              playClickPop(soundEnabled);
                              setTempSettings({ ...tempSettings, ageGroup: tier.id as any });
                            }}
                            className={`p-3 rounded-2xl border-2 cursor-pointer transition ${
                              tempSettings.ageGroup === tier.id
                                ? "border-indigo-600 bg-indigo-50/60"
                                : "border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <div className="font-bold text-xs text-slate-800">{tier.title}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{tier.desc}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Safe Search Strength */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-slate-800">
                          Safe Search Filtering Level
                        </div>
                        <div className="text-xs text-slate-500">
                          Blocks mature content, cyberbullying, violence, weapons, and distress topics
                        </div>
                      </div>
                      <select
                        value={tempSettings.safeSearchLevel}
                        onChange={(e) =>
                          setTempSettings({
                            ...tempSettings,
                            safeSearchLevel: e.target.value as "strict" | "moderate",
                          })
                        }
                        className="font-bold text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 text-indigo-700 focus:outline-none"
                      >
                        <option value="strict">Strict (Maximum Protection)</option>
                        <option value="moderate">Moderate Safe</option>
                      </select>
                    </div>

                    {/* Custom Blocked Keywords */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        Custom Blocked Keywords (Optional)
                      </label>
                      <p className="text-xs text-slate-500 mb-3">
                        Searches containing any of these keywords will be immediately shielded from the child and logged for Overseer & Parent review.
                      </p>

                      <form onSubmit={handleAddKeyword} className="flex gap-2 mb-3">
                        <input
                          type="text"
                          value={newKeyword}
                          onChange={(e) => setNewKeyword(e.target.value)}
                          placeholder="e.g. tiktok, guns, scary movie..."
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      </form>

                      <div className="flex flex-wrap gap-1.5">
                        {tempSettings.blockedKeywords.map((word, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-medium"
                          >
                            <span>{word}</span>
                            <button
                              onClick={() => handleRemoveKeyword(word)}
                              className="hover:text-red-900 p-0.5"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Voice Recognition Toggle */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-slate-800">
                          Allow Voice Recognition Search
                        </div>
                        <div className="text-xs text-slate-500">
                          Enables microphone speech-to-text for kids who prefer talking instead of typing
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={tempSettings.allowVoice}
                        onChange={(e) =>
                          setTempSettings({ ...tempSettings, allowVoice: e.target.checked })
                        }
                        className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {/* 2. SCREEN TIME & BEDTIME TAB */}
                {activeTab === "time" && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Daily AI Wonder Search Limit
                        </label>
                        <span className="text-sm font-black text-indigo-600">
                          {tempSettings.dailyTimeLimitMinutes} Minutes
                        </span>
                      </div>
                      <input
                        type="range"
                        min={15}
                        max={180}
                        step={15}
                        value={tempSettings.dailyTimeLimitMinutes}
                        onChange={(e) =>
                          setTempSettings({
                            ...tempSettings,
                            dailyTimeLimitMinutes: Number(e.target.value),
                          })
                        }
                        className="w-full accent-indigo-600"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                        <span>15 mins</span>
                        <span>1 hour</span>
                        <span>2 hours</span>
                        <span>3 hours</span>
                      </div>
                    </div>

                    {/* Bedtime Lockout */}
                    <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-bold text-slate-800">
                            Bedtime Curfew Lock
                          </div>
                          <div className="text-xs text-slate-500">
                            Puts the AI companions to sleep during bedtime hours
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={tempSettings.bedtimeLock}
                          onChange={(e) =>
                            setTempSettings({ ...tempSettings, bedtimeLock: e.target.checked })
                          }
                          className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                        />
                      </div>

                      {tempSettings.bedtimeLock && (
                        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-indigo-100/80">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">
                              Bedtime Starts (PM)
                            </label>
                            <input
                              type="time"
                              value={tempSettings.bedtimeStart}
                              onChange={(e) =>
                                setTempSettings({ ...tempSettings, bedtimeStart: e.target.value })
                              }
                              className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">
                              Bedtime Ends (AM)
                            </label>
                            <input
                              type="time"
                              value={tempSettings.bedtimeEnd}
                              onChange={(e) =>
                                setTempSettings({ ...tempSettings, bedtimeEnd: e.target.value })
                              }
                              className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. SEARCH LOG TAB */}
                {activeTab === "history" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
                      <span>Log of queries asked on this device</span>
                      <span>{history.length} Questions Asked</span>
                    </div>

                    {history.length === 0 ? (
                      <div className="text-center py-10 text-slate-400 text-xs">
                        No questions asked yet today.
                      </div>
                    ) : (
                      history.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`p-1 rounded-full text-[10px] font-bold uppercase ${
                                item.character === "superman"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-sky-100 text-sky-700"
                              }`}
                            >
                              {item.character === "superman" ? "Superman" : "Robot"}
                            </span>
                            <span className="font-semibold text-slate-800">
                              "{item.query}"
                            </span>
                          </div>
                          <span className="text-slate-400 text-[11px]">
                            {new Date(item.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* 4. SAFETY INCIDENT ALERTS TAB */}
                {activeTab === "alerts" && (
                  <div className="space-y-4">
                    {/* Notice explaining Overseer First-Look Architecture */}
                    <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                      <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-bold">Overseer Audit Protocol Active</strong>
                        <span>
                          To prevent false alarms and ensure child safety, sensitive inquiries are first verified by the Master Overseer (Super-Admin: <strong>john.otolorin@gmail.com</strong>) before appearing here with notes.
                          {pendingOverseerCount > 0 && (
                            <span className="block mt-1 font-semibold text-amber-800">
                              ({pendingOverseerCount} item currently undergoing overseer triage)
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    {parentVisibleIncidents.length === 0 ? (
                      <div className="text-center py-10 text-slate-400 text-xs">
                        No verified incident reports at this time. All inquiries are safe and age-appropriate!
                      </div>
                    ) : (
                      parentVisibleIncidents.map((inc) => (
                        <div
                          key={inc.id}
                          className="p-4 rounded-2xl bg-red-50/50 border-2 border-red-200 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white font-bold text-[10px] uppercase">
                              Severity: {inc.severity}
                            </span>
                            <span className="text-slate-500 text-[11px]">
                              {new Date(inc.timestamp).toLocaleString()}
                            </span>
                          </div>

                          <div className="font-bold text-slate-900 text-sm">
                            Query Blocked: <span className="text-red-700">"{inc.query}"</span>
                          </div>

                          <div className="text-slate-600">
                            <strong>Reason:</strong> {inc.detectedCategory} ({inc.source === "voice" ? "Spoken Voice Query" : "Typed Query"})
                          </div>

                          {inc.overseerNotes && (
                            <div className="p-2.5 rounded-xl bg-white border border-indigo-100 text-indigo-900 mt-2">
                              <strong>Overseer Guidance Note:</strong> {inc.overseerNotes}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* 5. SECURITY & PIN TAB */}
                {activeTab === "security" && (
                  <div className="space-y-6">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Change Parental 4-Digit PIN
                      </h4>
                      <form onSubmit={handleChangePin} className="flex gap-2">
                        <input
                          type="password"
                          maxLength={6}
                          value={newPinInput}
                          onChange={(e) => setNewPinInput(e.target.value)}
                          placeholder="New 4-Digit PIN"
                          className="px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-500 w-44"
                        />
                        <button
                          type="submit"
                          disabled={newPinInput.length < 4}
                          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs"
                        >
                          Update PIN
                        </button>
                      </form>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                      <h4 className="font-bold text-slate-800">Master Overseer Configuration</h4>
                      <p className="text-slate-500">
                        Designated Super-Admin safety triage recipient:
                      </p>
                      <div className="p-2 rounded-xl bg-white border border-slate-200 font-mono text-indigo-700 font-bold">
                        john.otolorin@gmail.com
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Actions Bar */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                {saveSuccess ? (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <Check className="w-4 h-4" /> Settings Saved!
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">
                    Parental settings active on this device
                  </span>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      playClickPop(soundEnabled);
                      onClose();
                    }}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 text-xs font-bold transition"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
