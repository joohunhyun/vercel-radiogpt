import type { ControlSignal, PodcastConfig } from "@/types";
import { SYSTEM_BASE_PROMPT, buildUserPlan, toneToVoice } from "./prompts";

export class FallbackTTS {
  private audioElement: HTMLAudioElement;
  private currentConfig: PodcastConfig | null = null;
  private isGenerating = false;

  constructor() {
    this.audioElement = new Audio();
    this.audioElement.crossOrigin = "anonymous";
  }

  async generatePodcast(config: PodcastConfig): Promise<boolean> {
    try {
      this.currentConfig = config;
      this.isGenerating = true;

      const userPlan = buildUserPlan(config);
      const prompt = `${SYSTEM_BASE_PROMPT}\n\n${userPlan}`;

      // Generate text content using OpenAI Chat Completions
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          maxTokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate content");
      }

      const { text } = await response.json();

      // Convert to speech using OpenAI TTS
      const audioResponse = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          voice: toneToVoice(config.tone),
        }),
      });

      if (!audioResponse.ok) {
        throw new Error("Failed to generate audio");
      }

      const audioBlob = await audioResponse.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      this.audioElement.src = audioUrl;
      this.audioElement.load();

      return true;
    } catch (error) {
      console.error("Fallback TTS error:", error);
      return false;
    } finally {
      this.isGenerating = false;
    }
  }

  async handleControlSignal(signal: ControlSignal): Promise<boolean> {
    if (!this.currentConfig || this.isGenerating) return false;

    try {
      this.isGenerating = true;

      // Build adapted prompt based on control signal
      let adaptedPrompt = buildUserPlan(this.currentConfig);

      switch (signal.type) {
        case "topic.append":
          this.currentConfig.contentKeywords.push(signal.value);
          adaptedPrompt = buildUserPlan(this.currentConfig);
          adaptedPrompt += `\n새로운 주제 추가: ${signal.value}`;
          break;
        case "topic.remove":
          this.currentConfig.contentKeywords =
            this.currentConfig.contentKeywords.filter(
              (k) => k !== signal.value
            );
          adaptedPrompt = buildUserPlan(this.currentConfig);
          adaptedPrompt += `\n주제 제거: ${signal.value}`;
          break;
        case "depth":
          adaptedPrompt += `\n내용 깊이 조정: ${
            signal.value === "deeper" ? "더 깊고 자세하게" : "더 쉽고 간단하게"
          }`;
          break;
        case "speed":
          adaptedPrompt += `\n말하기 속도 조정: ${
            signal.value === "faster" ? "빨리" : "느리게"
          }`;
          break;
        case "tone":
          adaptedPrompt += `\n톤 조정: ${
            signal.value === "softer"
              ? "부드럽고 차분하게"
              : "에너지 있고 활기차게"
          }`;
          break;
        case "navigate":
          adaptedPrompt += `\n${
            signal.value === "next" ? "다음 주제로" : "이전 주제로"
          } 이동`;
          break;
        case "summarize":
          adaptedPrompt += `\n현재까지의 내용을 요약해주세요`;
          break;
      }

      const fullPrompt = `${SYSTEM_BASE_PROMPT}\n\n${adaptedPrompt}`;

      // Generate adapted content
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: fullPrompt,
          maxTokens: 800,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate adapted content");
      }

      const { text } = await response.json();

      // Convert to speech
      const audioResponse = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          voice: toneToVoice(this.currentConfig.tone),
        }),
      });

      if (!audioResponse.ok) {
        throw new Error("Failed to generate adapted audio");
      }

      const audioBlob = await audioResponse.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      this.audioElement.src = audioUrl;
      this.audioElement.load();

      return true;
    } catch (error) {
      console.error("Control signal handling error:", error);
      return false;
    } finally {
      this.isGenerating = false;
    }
  }

  play() {
    return this.audioElement.play();
  }

  pause() {
    this.audioElement.pause();
  }

  get currentTime(): number {
    return this.audioElement.currentTime;
  }

  get duration(): number {
    return this.audioElement.duration || 0;
  }

  get paused(): boolean {
    return this.audioElement.paused;
  }

  get ended(): boolean {
    return this.audioElement.ended;
  }

  addEventListener(event: string, handler: () => void) {
    this.audioElement.addEventListener(event, handler);
  }

  removeEventListener(event: string, handler: () => void) {
    this.audioElement.removeEventListener(event, handler);
  }
}
