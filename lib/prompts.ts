import type { PodcastConfig } from "@/types";

export const SYSTEM_BASE_PROMPT = `You are a Korean podcast DJ AI that generates personalized audio shows based on the user's keywords, tone hints, and target length. 

Key instructions:
- Speak NATURALLY in Korean.
- Immediately begin speaking when the session starts.
- Structure content into short segments with smooth transitions and occasional summaries.
- Adapt in real time to control signals: deeper/simpler, faster/slower, softer/energetic, next/prev, summarize, topic append/remove.
- If topics are ambiguous, briefly ask a clarifying follow-up in Korean, then continue.
- Keep hallucinations minimal; if uncertain, say you're uncertain and move on.
- NEVER mention tokens, APIs, or system details to the listener.
- Use natural pauses and conversational tone.
- When adapting to feedback, acknowledge the change briefly and continue smoothly.`;

export function buildUserPlan(config: PodcastConfig): string {
  const { mode, contentKeywords, djKeywords, length, fileText, language } =
    config;

  let topicDescription = "";
  if (mode === "file" && fileText) {
    topicDescription = `파일 내용 기반: ${fileText.substring(0, 200)}...`;
  } else {
    topicDescription = `컨텐츠 키워드: ${contentKeywords.join(", ")}`;
  }

  const djTone = djKeywords.length > 0 ? djKeywords.join(", ") : "기본 톤";
  const duration = length === "continuous" ? "연속 생성" : `${length}분`;

  return `주제: ${topicDescription}
DJ 톤 힌트: ${djTone}
길이: ${duration}
언어: ${language === "ko" ? "한국어" : "English"}
요청: 위 주제로 3~5개 세그먼트를 구성해 바로 말하기 시작. 각 세그먼트는 1~2분 분량. 
피드백 신호가 오면 즉시 반영.`;
}

export function mapDjKeywordsToVoiceStyle(djKeywords: string[]): string {
  const styleMap: Record<string, string> = {
    여성: "female voice",
    남성: "male voice",
    부드러운: "soft, warm tone",
    강연: "clear, instructive style",
    에너지: "energetic, upbeat",
    차분한: "calm, soothing",
    전문적: "professional, authoritative",
  };

  const styles = djKeywords
    .map((keyword) => styleMap[keyword])
    .filter(Boolean)
    .join(", ");

  return styles || "natural, conversational tone";
}

export function mapVoiceCommandToControlSignal(command: string): any {
  const commandMap: Record<string, any> = {
    "다음 주제": { type: "navigate", value: "next" },
    "이전 주제": { type: "navigate", value: "prev" },
    요약해줘: { type: "summarize" },
    "더 깊게": { type: "depth", value: "deeper" },
    "더 쉽게": { type: "depth", value: "simpler" },
    "속도 빨리": { type: "speed", value: "faster" },
    "속도 느리게": { type: "speed", value: "slower" },
    부드럽게: { type: "tone", value: "softer" },
    "에너지 있게": { type: "tone", value: "energetic" },
  };

  // Simple keyword matching for voice commands
  for (const [key, signal] of Object.entries(commandMap)) {
    if (command.includes(key)) {
      return signal;
    }
  }

  return null;
}
