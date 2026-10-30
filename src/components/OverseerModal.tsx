import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldAlert,
  ShieldCheck,
  X,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Send,
  Eye,
  Clock,
  Mic,
  FileText,
  UserCheck,
  Sparkles,
} from "lucide-react";
import { SafetyIncident } from "../types";
import { playClickPop, playCelebration } from "../utils/audio";

interface OverseerModalProps {
  isOpen: boolean;
  onClose: () => void;
  incidents: SafetyIncident[];
  onTriageAction: (incidentId: string, action: "release_to_parent" | "dismiss" | "urgent_escalate", notes?: string) => void;
  soundEnabled: boolean;
}

export const OverseerModal: React.FC<OverseerModalProps> = ({
  isOpen,
  onClose,
  incidents,
  onTriageAction,
  soundEnabled,
}) => {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(
    incidents.length > 0 ? incidents[0].id : null
  );
  const [triageNotes, setTriageNotes] = useState("");
  const [reportSentToast, setReportSentToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentIncident =
    incidents.find((i) => i.id === selectedIncidentId) || incidents[0];

  const pendingCount = incidents.filter((i) => !i.overseerReviewed).length;
  const criticalCount = incidents.filter((i) => i.severity === "critical").length;

  const handleAction = (
    action: "release_to_parent" | "dismiss" | "urgent_escalate"
  ) => {
    if (!currentIncident) return;
    playClickPop(soundEnabled);
    onTriageAction(currentIncident.id, action, triageNotes);
    setTriageNotes("");

    if (action === "release_to_parent") {
      playCelebration(soundEnabled);
      setReportSentToast(`Incident report released to Parent Dashboard & emailed.`);
    } else if (action === "dismiss") {
      setReportSentToast(`Incident marked as harmless false positive.`);
    } else {
      setReportSentToast(`Urgent alert dispatched to Parent and Overseer.`);
    }

    setTimeout(() => setReportSentToast(null), 4000);
  };

  const handleSendTestReport = () => {
    playCelebration(soundEnabled);
    setReportSentToast(`Direct email report dispatched to john.otolorin@gmail.com!`);
    setTimeout(() => setReportSentToast(null), 4000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 15 }}
          className="relative w-full max-w-5xl max-h-[90vh] bg-slate-900 text-slate-100 rounded-3xl shadow-2xl border border-slate-700 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-400">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-white tracking-tight">
                    Overseer Safety & Triage Portal
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">
                    Super-Admin: john.otolorin@gmail.com
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Mandate: All flagged queries are routed to you first for triage before reaching the parent.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSendTestReport}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-sm"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Test Report to John</span>
              </button>
              <button
                onClick={() => {
                  playClickPop(soundEnabled);
                  onClose();
                }}
                className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Toast alert */}
          {reportSentToast && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-500 text-white px-4 py-2.5 text-xs font-bold flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {reportSentToast}
              </span>
              <button
                onClick={() => setReportSentToast(null)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-4 bg-slate-900/90 border-b border-slate-800 text-center text-xs">
            <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
              <span className="text-slate-400 block font-medium">Total Flagged</span>
              <span className="text-lg font-black text-white">{incidents.length}</span>
            </div>
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <span className="text-amber-300 block font-medium">Awaiting Your Triage</span>
              <span className="text-lg font-black text-amber-400">{pendingCount}</span>
            </div>
            <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/30">
              <span className="text-red-300 block font-medium">Critical Severity</span>
              <span className="text-lg font-black text-red-400">{criticalCount}</span>
            </div>
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <span className="text-emerald-300 block font-medium">Released to Parent</span>
              <span className="text-lg font-black text-emerald-400">
                {incidents.filter((i) => i.visibleToParent).length}
              </span>
            </div>
          </div>

          {/* Split Content: Incident Queue list + Selected Incident Detail */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
            {/* Incident List */}
            <div className="md:col-span-5 border-r border-slate-800 overflow-y-auto max-h-[55vh] md:max-h-none p-3 space-y-2">
              <div className="flex items-center justify-between px-2 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <span>Flagged Incidents</span>
                <span>{incidents.length} Total</span>
              </div>

              {incidents.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  No safety incidents logged. Safe search active!
                </div>
              ) : (
                incidents.map((inc) => {
                  const isSelected = inc.id === currentIncident?.id;
                  return (
                    <div
                      key={inc.id}
                      onClick={() => {
                        playClickPop(soundEnabled);
                        setSelectedIncidentId(inc.id);
                      }}
                      className={`p-3 rounded-2xl cursor-pointer transition border text-left ${
                        isSelected
                          ? "bg-slate-800 border-indigo-500 shadow-md ring-1 ring-indigo-500"
                          : "bg-slate-950/40 border-slate-800 hover:bg-slate-800/60"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          {inc.source === "voice" ? (
                            <span className="p-1 rounded bg-indigo-500/20 text-indigo-400" title="Voice Search">
                              <Mic className="w-3 h-3" />
                            </span>
                          ) : (
                            <span className="p-1 rounded bg-slate-700 text-slate-300" title="Typed Search">
                              <FileText className="w-3 h-3" />
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              inc.severity === "critical"
                                ? "bg-red-500/20 text-red-400 border border-red-500/40"
                                : inc.severity === "high"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                : "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                            }`}
                          >
                            {inc.severity}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {new Date(inc.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-slate-200 line-clamp-1">
                        "{inc.query}"
                      </p>

                      <div className="mt-2 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">{inc.detectedCategory}</span>
                        {inc.visibleToParent ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Parent Visible
                          </span>
                        ) : (
                          <span className="text-amber-400 font-bold flex items-center gap-1">
                            <Eye className="w-2.5 h-2.5" /> Overseer Only
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Selected Incident Review Panel */}
            <div className="md:col-span-7 p-4 sm:p-6 overflow-y-auto bg-slate-950/40 flex flex-col justify-between">
              {currentIncident ? (
                <div className="space-y-4">
                  {/* Status Banner */}
                  <div
                    className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs ${
                      !currentIncident.overseerReviewed
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                        : currentIncident.visibleToParent
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                        : "bg-slate-800 border-slate-700 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>
                        {!currentIncident.overseerReviewed
                          ? "STATUS: Pending your review (Parent cannot see this yet)"
                          : currentIncident.visibleToParent
                          ? "STATUS: Approved by you & Released to Parent Dashboard"
                          : "STATUS: Dismissed as safe false positive"}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                      ID: {currentIncident.id.slice(0, 10)}
                    </span>
                  </div>

                  {/* Flagged Query Box */}
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Child's Exact Search ({currentIncident.source === "voice" ? "Spoken Voice Input" : "Keyboard Typed"})
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(currentIncident.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-base font-bold text-white bg-slate-950 p-3 rounded-xl border border-red-500/30 text-red-300">
                      "{currentIncident.query}"
                    </p>
                  </div>

                  {/* Classification Details */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block mb-1">Detected Risk Category:</span>
                      <span className="font-bold text-slate-200">{currentIncident.detectedCategory}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block mb-1">Companion in use:</span>
                      <span className="font-bold text-slate-200 capitalize">
                        {currentIncident.character === "superman" ? "Captain Wonder (Superman)" : "Beep-Boop 3000 (Robot)"}
                      </span>
                    </div>
                  </div>

                  {/* Overseer Notes Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Overseer Notes & Guidance for Parent (Optional):
                    </label>
                    <textarea
                      value={triageNotes || currentIncident.overseerNotes || ""}
                      onChange={(e) => setTriageNotes(e.target.value)}
                      placeholder="Add specific context, advice, or observation for the parent..."
                      rows={3}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Overseer Action Buttons */}
                  <div className="pt-2 border-t border-slate-800">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Overseer Triage Decision:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        onClick={() => handleAction("release_to_parent")}
                        className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Release to Parent</span>
                      </button>

                      <button
                        onClick={() => handleAction("urgent_escalate")}
                        className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition shadow-md"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Urgent Escalate</span>
                      </button>

                      <button
                        onClick={() => handleAction("dismiss")}
                        className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition border border-slate-700"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Dismiss False Alarm</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-12 text-slate-500">
                  Select an incident from the list to review and triage.
                </div>
              )}

              {/* Triage Protocol Footer */}
              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Protocol: Overseer checks first ➔ Parent notified upon release</span>
                <span className="text-indigo-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Super-Admin Active
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
