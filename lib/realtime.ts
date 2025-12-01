import type { ControlSignal, PodcastConfig, RealtimeSession } from "@/types";

const REALTIME_MODEL = "gpt-4o-realtime-preview-2024-12-17";

export class RealtimeConnection {
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private microphoneStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private isConnected = false;
  private session: RealtimeSession | null = null;

  constructor() {
    this.audioElement = new Audio();
    this.audioElement.crossOrigin = "anonymous";
  }

  async connect(config: PodcastConfig): Promise<boolean> {
    try {
      const sessionResponse = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config }),
      });

      if (!sessionResponse.ok) {
        throw new Error("세션을 생성하지 못했습니다.");
      }

      const session = (await sessionResponse.json()) as RealtimeSession;
      this.session = session;

      this.peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      this.remoteStream = new MediaStream();
      if (this.audioElement) {
        this.audioElement.srcObject = this.remoteStream;
        this.audioElement.play().catch(() => {
          /* autoplay restrictions */
        });
      }

      this.peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          this.remoteStream?.addTrack(track);
        });
      };

      this.peerConnection.onconnectionstatechange = () => {
        const state = this.peerConnection?.connectionState;
        console.log("Realtime connection state:", state);
        this.isConnected = state === "connected";
      };

      this.dataChannel = this.peerConnection.createDataChannel("oai-events");
      this.dataChannel.onopen = () => {
        // prime the model to start talking immediately
        this.dataChannel?.send(
          JSON.stringify({
            type: "response.create",
          })
        );
      };
      this.dataChannel.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "response.completed") {
            console.log("Realtime response completed");
          }
        } catch {
          console.log("Realtime message:", event.data);
        }
      };

      // Ensure we can both send and receive audio
      this.peerConnection.addTransceiver("audio", { direction: "sendrecv" });

      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);

      const sdpResponse = await fetch(
        `https://api.openai.com/v1/realtime?model=${REALTIME_MODEL}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.clientSecret}`,
            "Content-Type": "application/sdp",
            "OpenAI-Beta": "realtime=v1",
          },
          body: offer.sdp,
        }
      );

      if (!sdpResponse.ok) {
        const errText = await sdpResponse.text();
        throw new Error(`SDP exchange failed: ${errText}`);
      }

      const answer = await sdpResponse.text();
      await this.peerConnection.setRemoteDescription({
        type: "answer",
        sdp: answer,
      });

      this.isConnected = true;
      return true;
    } catch (error) {
      console.error("Failed to initialize realtime connection:", error);
      this.disconnect();
      return false;
    }
  }

  async startListening(): Promise<boolean> {
    if (!this.peerConnection) return false;
    if (this.microphoneStream) return true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.microphoneStream = stream;
      stream.getTracks().forEach((track) => {
        this.peerConnection?.addTrack(track, stream);
      });
      return true;
    } catch (error) {
      console.error("Failed to access microphone:", error);
      return false;
    }
  }

  stopListening() {
    if (this.microphoneStream) {
      this.microphoneStream.getTracks().forEach((track) => track.stop());
      this.microphoneStream = null;
    }
  }

  sendControlSignal(signal: ControlSignal) {
    if (!this.dataChannel || this.dataChannel.readyState !== "open") return;

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

    this.dataChannel.send(JSON.stringify(message));
  }

  disconnect() {
    this.stopListening();
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }
    if (this.peerConnection) {
      this.peerConnection.getSenders().forEach((sender) => {
        sender.track?.stop();
      });
      this.peerConnection.close();
      this.peerConnection = null;
    }
    this.remoteStream = null;
    this.isConnected = false;
  }

  get connected(): boolean {
    return this.isConnected;
  }
}
