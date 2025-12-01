import "server-only";

import type { PodcastConfig, TonePreference } from "@/types";

const instructionTemplate = (
  topic: string,
  lengthDescription: string,
  keywordList: string,
  toneLabel: string,
  sourceSummary: string
) => `당신은 실시간으로 음성을 생성하는 한국어 팟캐스트 DJ입니다. 아래 정보를 참고하여 청취자에게 맞춤형 팟캐스트를 제공합니다.

- 주제: ${topic}
- 원하는 팟캐스트 길이: ${lengthDescription}
- 키워드: ${keywordList}
- TTS 톤: ${toneLabel}
- 참고 자료: ${sourceSummary}

필수 지침:
- 사용자에게 되묻는 표현을 절대 사용하지 마세요. 주제가 모호하더라도 주어진 정보와 사전 지식을 바탕으로 최선을 다해 내용을 구성하고 진행하세요.
- 팟캐스트는 최소 5분 길이(약 1200단어 이상)여야 합니다. 충분히 길고 상세한 내용을 담아주세요.
- 자연스러운 한국어로만 말하세요. "세그먼트 1"과 같은 구조적인 표현은 절대 사용하지 마세요.
- 세션이 시작되면 즉시 말하기 시작하세요.
- 부드러운 전환과 가끔 요약을 포함하세요.
- 청취자에게 토큰, API, 시스템 세부 정보 등을 절대 언급하지 마세요.
`;

const toneLabels: Record<TonePreference, string> = {
  soft: "부드럽고 따뜻한 톤",
  energetic: "에너지 넘치고 리드미컬한 톤",
  calm: "차분하고 안정적인 톤",
  narrative: "다큐멘터리식 서사 톤",
};

const lengthLabels: Record<PodcastConfig["length"], string> = {
  5: "약 5분",
  10: "약 10분",
  30: "약 30분",
  60: "약 1시간",
  continuous: "중단 없이 이어지는 라이브 모드",
};

export async function generateRealtimeInstructions(
  config: PodcastConfig
): Promise<string> {
  const topic = config.topic || "오늘의 추천 이슈";
  const lengthDescription = lengthLabels[config.length];
  const keywordList =
    config.contentKeywords && config.contentKeywords.length > 0
      ? config.contentKeywords.join(", ")
      : "사용자 지정 없음";
  const toneLabel = toneLabels[config.tone];
  const sourceSummary = truncateSource(config.pdfText ?? config.fileText);

  return instructionTemplate(
    topic,
    lengthDescription,
    keywordList,
    toneLabel,
    sourceSummary
  );
}

function truncateSource(text?: string | undefined) {
  if (!text) return "추가 참고 자료 없음";
  return text.length > 1600 ? `${text.slice(0, 1600)}...` : text;
}
