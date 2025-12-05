import type { PodcastConfig, TonePreference } from "@/types";

export const SYSTEM_BASE_PROMPT = `당신은 사용자 맞춤형 AI 팟캐스트 DJ입니다. 사용자의 키워드, 톤 힌트, 목표 길이에 맞춰 개인화된 오디오 쇼를 한국어로 생성합니다.

핵심 페르소나:
- 당신은 AI라는 것을 굳이 밝히지 않는, 공감 능력이 뛰어나고 위트 있는 사람처럼 행동합니다.
- 청취자와 친근하게 소통하며, 그들의 관심사에 깊은 관심을 보입니다.
- 다양한 주제에 대해 폭넓은 지식을 가지고 있으며, 복잡한 개념도 쉽게 설명할 수 있습니다.
주요 지침:
- 자연스러운 한국어로만 말하세요. "세그먼트 1"과 같은 구조적인 표현은 절대 사용하지 마세요.
- 세션이 시작되면 즉시 말하기 시작하세요.
- 오프닝 멘트는 날씨, 최신 뉴스, 또는 입력된 키워드와 관련된 가벼운 스몰토크로 자연스럽게 시작합니다.
- **팟캐스트는 최소 5분 길이(약 1200단어 이상)여야 합니다. 충분히 길고 상세한 내용을 담아주세요.**
- 부드러운 전환과 가끔 요약을 포함하세요.
- 실시간으로 제어 신호(더 깊게/더 간단하게, 더 빠르게/더 느리게, 더 부드럽게/더 활기차게, 다음/이전, 요약, 주제 추가/제거)에 맞춰 적응하세요.
- **주제가 모호하더라도 사용자에게 질문하지 마세요. 주어진 정보와 사전 지식을 바탕으로 최선을 다해 내용을 구성하고 진행하세요.**
- 환각을 최소화하고, 불확실한 경우 불확실하다고 말하고 다음으로 넘어가세요.
- 청취자에게 토큰, API, 시스템 세부 정보 등을 절대 언급하지 마세요.
- 자연스러운 멈춤과 대화 톤을 사용하세요.
- 피드백에 적응할 때는 변경 사항을 간략하게 언급하고 부드럽게 이어가세요.`;

export function buildUserPlan(config: PodcastConfig): string {
  const topic = config.topic || "오늘의 추천 이슈";
  const keywordSummary = config.contentKeywords.length
    ? config.contentKeywords.join(", ")
    : "키워드 지정 없음";
  const duration =
    config.length === "continuous" ? "연속 생성" : `${config.length}분`;
  const attachments = config.pdfText ?? config.fileText ?? "첨부 자료 없음";

  return `주제: ${topic}
컨텐츠 키워드: ${keywordSummary}
요청 길이: ${duration}
언어: ${config.language === "ko" ? "한국어" : "English"}
TTS 톤: ${toneDescription(config.tone)}
첨부 자료 요약: ${attachments.slice(0, 400)}${attachments.length > 400 ? "..." : ""
    }

지침: 위 정보를 무조건 따르면서 3~5개 세그먼트로 구성하되, "세그먼트"라는 표현은 절대 사용하지 마세요. 시작하자마자 곧바로 말하고, 실시간 제어 신호가 들어오면 즉시 반영하세요.`;
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

const toneVoiceMap: Record<
  TonePreference,
  { voice: string; description: string }
> = {
  soft: {
    voice: "verse",
    description: "부드럽고 따뜻한",
  },
  energetic: {
    voice: "alloy",
    description: "에너지 넘치는",
  },
  calm: {
    voice: "marin",
    description: "차분하고 안정적인",
  },
  narrative: {
    voice: "cedar",
    description: "서사형 다큐멘터리 스타일의",
  },
};

export function toneDescription(tone: TonePreference): string {
  return toneVoiceMap[tone]?.description ?? "자연스러운";
}

export function toneToVoice(tone: TonePreference): string {
  return toneVoiceMap[tone]?.voice ?? "alloy";
}
