import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "edge";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    // For prototype, we'll use a mock session since Realtime API might not be available
    // In production, you would use the actual Realtime API
    const mockSession = {
      id: `session_${Date.now()}`,
      client_secret: `token_${Date.now()}`,
    };

    // Try to create a real session, but fallback to mock if it fails
    let session;
    try {
      session = await openai.beta.realtime.sessions.create({
        model: "gpt-4o-realtime-preview-2024-10-01",
        voice: "alloy",
        instructions:
          "You are a Korean podcast DJ. Respond naturally in Korean.",
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
        temperature: 0.8,
        max_response_output_tokens: 4096,
        modalities: ["text", "audio"],
      });
    } catch (realtimeError) {
      console.log("Realtime API not available, using fallback mode");
      session = mockSession;
    }

    return NextResponse.json({
      sessionId: (session as any).id || "session-id",
      token: session.client_secret,
      expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour
    });
  } catch (error) {
    console.error("Session creation error:", error);
    return NextResponse.json(
      { error: "Failed to create session. Please try again." },
      { status: 500 }
    );
  }
}
