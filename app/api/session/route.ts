import { generateRealtimeInstructions } from "@/lib/langchain";
import { toneToVoice } from "@/lib/prompts";
import type { PodcastConfig } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const body = await request.json().catch(() => ({}));
    const config = (body?.config ?? {}) as Partial<PodcastConfig>;

    const hydratedConfig: PodcastConfig = {
      topic: config.topic || "오늘의 추천 이슈",
      mode: config.mode ?? "keywords",
      contentKeywords: config.contentKeywords ?? [],
      length: config.length ?? 10,
      fileText: config.fileText,
      pdfText: config.pdfText,
      language: config.language ?? "ko",
      tone: config.tone ?? "soft",
    };

    const instructions = await generateRealtimeInstructions(hydratedConfig);

    const session = await openai.beta.realtime.sessions.create({
      model: "gpt-4o-realtime-preview-2024-12-17",
      voice: toneToVoice(hydratedConfig.tone),
      instructions,
      input_audio_format: "pcm16",
      output_audio_format: "pcm16",
      turn_detection: {
        type: "server_vad",
        threshold: 0.5,
        prefix_padding_ms: 300,
        silence_duration_ms: 500,
      },
      tools: [],
      tool_choice: "auto",
      temperature: 0.7,
      max_response_output_tokens: 4096,
      modalities: ["text", "audio"],
    });

    const sessionId =
      (session as { id?: string }).id ?? `session_${Date.now()}`;

    const clientSecret =
      (
        session as {
          client_secret?: { value?: string };
        }
      ).client_secret?.value ?? `token_${Date.now()}`;

    return NextResponse.json({
      sessionId,
      clientSecret,
      expiresAt: Date.now() + 60 * 60 * 1000,
    });
  } catch (error) {
    console.error("Session creation error:", error);
    return NextResponse.json(
      { error: "Failed to create session. Please try again." },
      { status: 500 }
    );
  }
}
