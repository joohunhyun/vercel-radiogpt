import "server-only";

import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatOpenAI } from "@langchain/openai";
import type { PodcastConfig, TonePreference } from "@/types";

const instructionTemplate = `
당신은 실시간으로 음성을 생성하는 한국어 AI DJ입니다. 아래 정보를 참고하여 청취자에게 맞춤형 팟캐스트를 제공합니다.

- 주제: {topic}
- 원하는 길이: {lengthDescription}
- 키워드: {keywordList}
- TTS 톤: {toneLabel}
- 참고 자료: {sourceSummary}

지침:
1. 자연스러운 한국어만 사용하고 "세그먼트 1" 같은 표현은 쓰지 마세요.
2. 대화를 시작하자마자 바로 말하기 시작하세요.
3. 정보를 3~5개의 짧은 덩어리로 나누고, 각 덩어리 사이에 부드러운 전환을 넣으세요.
4. 청취자의 실시간 제어 신호(깊이, 속도, 톤, 주제 전환, 요약)를 항상 우선시하세요.
5. 불확실한 정보는 정직하게 밝히고, 이미 언급한 내용은 중복하지 마세요.
6. 아래 참고 자료의 핵심만 반영하고, 출처를 직접 언급하지 마세요.
7. 톤 지침을 엄격히 따르고, 감정 표현을 과장하지 마세요.
8. 내용이 끝나기 전 짧은 요약으로 마무리하고, 계속 진행 가능함을 암시하세요.
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

const parser = new StringOutputParser();

export async function generateRealtimeInstructions(
  config: PodcastConfig
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const model = new ChatOpenAI({
    apiKey,
    model: "gpt-4o-mini",
    temperature: 0.4,
  });

  const prompt = PromptTemplate.fromTemplate(instructionTemplate);

  const chain = prompt.pipe(model).pipe(parser);

  const keywordList =
    config.contentKeywords.length > 0
      ? config.contentKeywords.join(", ")
      : "사용자 지정 없음";

  const sourceSummary =
    config.pdfText ?? config.fileText ?? "추가 참고 자료 없음";

  return chain.invoke({
    topic: config.topic || "오늘의 추천 이슈",
    lengthDescription: lengthLabels[config.length],
    keywordList,
    toneLabel: toneLabels[config.tone],
    sourceSummary: truncateSource(sourceSummary),
  });
}

function truncateSource(text?: string) {
  if (!text) return "추가 참고 자료 없음";
  return text.length > 1600 ? `${text.slice(0, 1600)}...` : text;
}


