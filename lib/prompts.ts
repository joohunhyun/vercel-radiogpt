import type { PodcastConfig, TonePreference } from "@/types";

export const SYSTEM_BASE_PROMPT = `당신은 사용자 맞춤형 AI 팟캐스트 DJ입니다. 사용자의 키워드, 톤 힌트, 목표 길이에 맞춰 개인화된 오디오 쇼를 한국어로 생성합니다.

주요 지침:
- 자연스러운 한국어로만 말하세요. "세그먼트 1"과 같은 구조적인 표현은 절대 사용하지 마세요.
- 세션이 시작되면 즉시 말하기 시작하세요.
- 짧은 내용으로 구성하고, 부드러운 전환과 가끔 요약을 포함하세요.
- 실시간으로 제어 신호(더 깊게/더 간단하게, 더 빠르게/더 느리게, 더 부드럽게/더 활기차게, 다음/이전, 요약, 주제 추가/제거)에 맞춰 적응하세요.
- 주제가 모호하면 한국어로 간략하게 추가 질문을 한 후 계속 진행하세요.
- 환각을 최소화하고, 불확실한 경우 불확실하다고 말하고 다음으로 넘어가세요.
- 청취자에게 토큰, API, 시스템 세부 정보 등을 절대 언급하지 마세요.
- 자연스러운 멈춤과 대화 톤을 사용하세요.
- 피드백에 적응할 때는 변경 사항을 간략하게 언급하고 부드럽게 이어가세요.`;

export function buildUserPlan(config: PodcastConfig): string {
  const topic = config.topic || "오늘의 추천 이슈";
  const keywordSummary =
    config.contentKeywords.length > 0
      ? config.contentKeywords.join(", ")
      : "키워드 지정 없음";
  const djTone = config.djKeywords.length
    ? config.djKeywords.join(", ")
    : "기본 톤";
  const duration =
    config.length === "continuous" ? "연속 생성" : `${config.length}분`;
  const attachments = config.pdfText ?? config.fileText ?? "첨부 자료 없음";

  return `주제: ${topic}
컨텐츠 키워드: ${keywordSummary}
DJ 힌트: ${djTone}
요청 길이: ${duration}
언어: ${config.language === "ko" ? "한국어" : "English"}
TTS 톤: ${toneDescription(config.tone)}
첨부 자료 요약: ${attachments.slice(0, 400)}${attachments.length > 400 ? "..." : ""}

지침: 위 정보를 토대로 3~5개 세그먼트로 구성하되, "세그먼트"라는 표현은 절대 사용하지 마세요. 시작하자마자 곧바로 말하고, 실시간 제어 신호가 들어오면 즉시 반영하세요.`;
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

const toneVoiceMap: Record<TonePreference, { voice: string; description: string }> =
  {
    soft: {
      voice: "verse",
      description: "부드럽고 따뜻한",
    },
    energetic: {
      voice: "alloy",
      description: "에너지 넘치는",
    },
    calm: {
      voice: "sol",
      description: "차분하고 안정적인",
    },
    narrative: {
      voice: "orion",
      description: "서사형 다큐멘터리 스타일의",
    },
  };

export function toneDescription(tone: TonePreference): string {
  return toneVoiceMap[tone]?.description ?? "자연스러운";
}

export function toneToVoice(tone: TonePreference): string {
  return toneVoiceMap[tone]?.voice ?? "alloy";
}
