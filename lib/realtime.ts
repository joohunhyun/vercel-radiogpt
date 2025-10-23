import type { ControlSignal, RealtimeSession } from "@/types";

export class RealtimeConnection {
  private ws: WebSocket | null = null;
  private peerConnection: RTCPeerConnection | null = null;
  private audioContext: AudioContext | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private isConnected = false;
  private session: RealtimeSession | null = null;

  constructor() {
    this.audioElement = new Audio();
    this.audioElement.crossOrigin = "anonymous";
  }

  async connect(session: RealtimeSession): Promise<boolean> {
    try {
      this.session = session;

      // Create WebSocket connection
      this.ws = new WebSocket(
        `wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01&client_secret=${session.token}`
      );

      this.ws.onopen = () => {
        console.log("Realtime WebSocket connected");
        this.isConnected = true;
      };

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleRealtimeMessage(data);
      };

      this.ws.onerror = (error) => {
        console.error("Realtime WebSocket error:", error);
        this.isConnected = false;
      };

      this.ws.onclose = () => {
        console.log("Realtime WebSocket closed");
        this.isConnected = false;
      };

      // Set up audio context
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();

      return true;
    } catch (error) {
      console.error("Failed to connect to Realtime API:", error);
      return false;
    }
  }

  private handleRealtimeMessage(data: any) {
    switch (data.type) {
      case "response.audio.delta":
        this.playAudioChunk(data.delta);
        break;
      case "response.done":
        console.log("Response completed");
        break;
      case "error":
        console.error("Realtime error:", data.error);
        break;
    }
  }

  private async playAudioChunk(audioData: string) {
    if (!this.audioContext || !this.audioElement) return;

    try {
      // Convert base64 audio to ArrayBuffer
      const binaryString = atob(audioData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Create audio buffer and play
      const audioBuffer = await this.audioContext.decodeAudioData(bytes.buffer);
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      source.start();
    } catch (error) {
      console.error("Audio playback error:", error);
    }
  }

  async startListening(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      if (this.ws && this.isConnected) {
        // Send audio data to Realtime API
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = (event) => {
          if (this.ws && this.isConnected) {
            const reader = new FileReader();
            reader.onload = () => {
              const arrayBuffer = reader.result as ArrayBuffer;
              const uint8Array = new Uint8Array(arrayBuffer);
              const base64 = btoa(
                String.fromCharCode.apply(null, Array.from(uint8Array))
              );
              this.ws!.send(
                JSON.stringify({
                  type: "input_audio_buffer.append",
                  audio: base64,
                })
              );
            };
            reader.readAsArrayBuffer(event.data);
          }
        };
        mediaRecorder.start(100); // Send audio every 100ms
      }

      return true;
    } catch (error) {
      console.error("Failed to start listening:", error);
      return false;
    }
  }

  sendControlSignal(signal: ControlSignal) {
    if (!this.ws || !this.isConnected) return;

    let message: any = {};

    switch (signal.type) {
      case "topic.append":
        message = {
          type: "conversation.item.create",
          item: {
            type: "message",
            role: "user",
            content: [
              { type: "input_text", text: `새로운 주제 추가: ${signal.value}` },
            ],
          },
        };
        break;
      case "topic.remove":
        message = {
          type: "conversation.item.create",
          item: {
            type: "message",
            role: "user",
            content: [
              { type: "input_text", text: `주제 제거: ${signal.value}` },
            ],
          },
        };
        break;
      case "depth":
        message = {
          type: "conversation.item.create",
          item: {
            type: "message",
            role: "user",
            content: [
              {
                type: "input_text",
                text: `내용 깊이 조정: ${
                  signal.value === "deeper" ? "더 깊게" : "더 쉽게"
                }`,
              },
            ],
          },
        };
        break;
      case "speed":
        message = {
          type: "conversation.item.create",
          item: {
            type: "message",
            role: "user",
            content: [
              {
                type: "input_text",
                text: `속도 조정: ${
                  signal.value === "faster" ? "빨리" : "느리게"
                }`,
              },
            ],
          },
        };
        break;
      case "tone":
        message = {
          type: "conversation.item.create",
          item: {
            type: "message",
            role: "user",
            content: [
              {
                type: "input_text",
                text: `톤 조정: ${
                  signal.value === "softer" ? "부드럽게" : "에너지 있게"
                }`,
              },
            ],
          },
        };
        break;
      case "navigate":
        message = {
          type: "conversation.item.create",
          item: {
            type: "message",
            role: "user",
            content: [
              {
                type: "input_text",
                text: signal.value === "next" ? "다음 주제" : "이전 주제",
              },
            ],
          },
        };
        break;
      case "summarize":
        message = {
          type: "conversation.item.create",
          item: {
            type: "message",
            role: "user",
            content: [{ type: "input_text", text: "요약해줘" }],
          },
        };
        break;
    }

    this.ws.send(JSON.stringify(message));
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.isConnected = false;
  }

  get connected(): boolean {
    return this.isConnected;
  }
}
