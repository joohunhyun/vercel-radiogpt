export type PodcastConfig = {
  mode: "keywords" | "file";
  contentKeywords: string[];
  djKeywords: string[];
  length: 5 | 10 | 30 | 60 | "continuous";
  fileText?: string;
  language: "ko" | "en";
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
  token: string;
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
