export type TonePreference = "soft" | "energetic" | "calm" | "narrative";

export type PodcastConfig = {
  topic: string;
  mode: "keywords" | "file" | "pdf";
  contentKeywords: string[];
  length: 5 | 10 | 30 | 60 | "continuous";
  fileText?: string;
  pdfText?: string;
  language: "ko" | "en";
  tone: TonePreference;
};

export type ControlSignal =
  | { type: "topic.append"; value: string }
  | { type: "topic.remove"; value: string }
  | { type: "depth"; value: "deeper" | "simpler" }
  | { type: "speed"; value: "faster" | "slower" }
  | { type: "tone"; value: "softer" | "energetic" }
  | { type: "navigate"; value: "next" | "prev" }
  | { type: "summarize" };

export type RealtimeSession = {
  sessionId: string;
  clientSecret: string;
  expiresAt: number;
};

export type AudioState = {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isRecording: boolean;
  isRealtimeMode: boolean;
};

export type VoiceCommand = {
  text: string;
  confidence: number;
  timestamp: number;
};
