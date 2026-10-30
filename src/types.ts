export type CharacterPersona = "robot" | "superman";

export type AgeGroup = "early" | "explorer" | "preteen";

export interface AnswerResponse {
  isBlocked: boolean;
  incidentReported?: boolean;
  incidentId?: string;
  character: CharacterPersona;
  greeting: string;
  answer: string;
  funFact: string;
  followUps: string[];
  instant?: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  character?: CharacterPersona;
  funFact?: string;
  followUps?: string[];
  isBlocked?: boolean;
}

export interface SafetyIncident {
  id: string;
  timestamp: string;
  query: string;
  source: "voice" | "text";
  detectedCategory: string;
  severity: "critical" | "high" | "moderate";
  character: CharacterPersona;
  overseerReviewed: boolean;
  visibleToParent: boolean;
  overseerNotes?: string;
  actionTaken?: "pending" | "released_to_parent" | "dismissed_safe" | "urgent_notified";
  childAgeGroup: string;
}

export interface ParentalSettings {
  pin: string;
  dailyTimeLimitMinutes: number;
  bedtimeLock: boolean;
  bedtimeStart: string;
  bedtimeEnd: string;
  safeSearchLevel: "strict" | "moderate";
  ageGroup: AgeGroup;
  blockedKeywords: string[];
  soundEffects: boolean;
  ttsAutoPlay: boolean;
  allowVoice: boolean;
  parentEmail: string;
  overseerEmail: string;
  requireOverseerFirst: boolean;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: string;
  character: CharacterPersona;
  isBlocked: boolean;
}
