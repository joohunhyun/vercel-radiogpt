"use client";

import FrequencyLoader from "@/components/FrequencyLoader";
import Progress from "@/components/Progress";
import Transport from "@/components/Transport";
import { FallbackTTS } from "@/lib/fallback";
import { mapVoiceCommandToControlSignal } from "@/lib/prompts";
import { RealtimeConnection } from "@/lib/realtime";
import type { AudioState, ControlSignal, PodcastConfig } from "@/types";
import { Home, Library, Menu, Radio, Settings, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const toneLabels: Record<PodcastConfig["tone"], string> = {
  soft: "부드러운 톤",
  energetic: "에너지 톤",
  calm: "차분한 톤",
  narrative: "서사형 톤",
};

export default function PlayerPage() {
  const router = useRouter();
  const realtimeRef = useRef<RealtimeConnection | null>(null);
  const fallbackRef = useRef<FallbackTTS | null>(null);
  const [config, setConfig] = useState<PodcastConfig | null>(null);
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    currentTime: 0,
    duration: 240, // 4 minutes placeholder
    isRecording: false,
    isRealtimeMode: false,
  });
  const [activeKeywords, setActiveKeywords] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFrequencyLoader, setShowFrequencyLoader] = useState(false);

  const persistConfig = (nextConfig: PodcastConfig) => {
    localStorage.setItem("podcast.config", JSON.stringify(nextConfig));
    return nextConfig;
  };

  const updateConfigState = (
    updater: (prev: PodcastConfig) => PodcastConfig
  ) => {
    setConfig((prev) => {
      if (!prev) return prev;
      const next = updater(prev);
      persistConfig(next);
      return next;
    });
  };

  useEffect(() => {
    const savedConfig = localStorage.getItem("podcast.config");
    if (!savedConfig) {
      console.log("No podcast config found, redirecting to create page");
      router.push("/create");
      return;
    }

    const parsed = JSON.parse(savedConfig) as Partial<PodcastConfig>;
    const hydrated: PodcastConfig = {
      topic: parsed.topic || "오늘의 추천 이슈",
      mode: parsed.mode ?? "keywords",
      contentKeywords: parsed.contentKeywords ?? [],
      length: parsed.length ?? 10,
      fileText: parsed.fileText,
      pdfText: parsed.pdfText,
      language: parsed.language ?? "ko",
      tone: parsed.tone ?? "soft",
    };
    console.log("Loaded podcast config:", hydrated);
    setConfig(hydrated);
    persistConfig(hydrated);
    setActiveKeywords(hydrated.contentKeywords);

    initializeAudio(hydrated);
    return () => {
      realtimeRef.current?.disconnect();
      fallbackRef.current?.pause();
    };
  }, [router]);

  const initializeAudio = async (currentConfig?: PodcastConfig) => {
    try {
      setIsLoading(true);

      const activeConfig = currentConfig ?? config;

      if (activeConfig) {
        realtimeRef.current = new RealtimeConnection();
        const connected = await realtimeRef.current.connect(activeConfig);
        if (connected) {
          setAudioState((prev) => ({ ...prev, isRealtimeMode: true }));
          console.log("Realtime audio initialized");
          return;
        }
      }

      console.log("Falling back to TTS system...");

      fallbackRef.current = new FallbackTTS();
      setAudioState((prev) => ({ ...prev, isRealtimeMode: false }));
    } catch (error) {
      console.error("Audio initialization error:", error);
      const msg = "오디오 시스템 초기화에 실패했습니다.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayPause = async () => {
    if (!config) return;

    try {
      console.log("Play/pause clicked, current state:", audioState.isPlaying);

      if (audioState.isRealtimeMode && realtimeRef.current) {
        if (audioState.isPlaying) {
          realtimeRef.current.stopListening();
          setAudioState((prev) => ({
            ...prev,
            isPlaying: false,
            isRecording: false,
          }));
        } else {
          const success = await realtimeRef.current.startListening();
          if (!success) {
            const msg = "마이크를 사용할 수 없습니다.";
            setError(msg);
            toast.error(msg);
            return;
          }

          // Save to history
          fetch("/api/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              topic: config.topic,
            }),
          }).catch(console.error);

          setAudioState((prev) => ({
            ...prev,
            isPlaying: true,
            isRecording: true,
          }));
        }
        return;
      }

      if (fallbackRef.current) {
        // Fallback mode
        if (audioState.isPlaying) {
          console.log("Pausing audio...");
          fallbackRef.current.pause();
          setAudioState((prev) => ({ ...prev, isPlaying: false }));
        } else {
          console.log("Starting audio...");
          if (
            fallbackRef.current.ended ||
            fallbackRef.current.currentTime === 0
          ) {
            console.log("Generating new podcast...");
            setShowFrequencyLoader(true);

            const success = await fallbackRef.current.generatePodcast(config);
            if (!success) {
              const msg = "팟캐스트 생성에 실패했습니다.";
              setError(msg);
              toast.error(msg);
              setShowFrequencyLoader(false);
              return;
            }
          }
          await fallbackRef.current.play();
          setAudioState((prev) => ({ ...prev, isPlaying: true }));
          setShowFrequencyLoader(false);
          console.log("Audio started successfully");
        }
      } else {
        const msg = "오디오 시스템이 초기화되지 않았습니다.";
        setError(msg);
        toast.error(msg);
      }
    } catch (error) {
      console.error("Play/pause error:", error);
      const msg = "재생 중 오류가 발생했습니다: " +
        (error instanceof Error ? error.message : String(error));
      setError(msg);
      toast.error(msg);
    }
  };

  const handlePrevious = () => {
    sendControlSignal({ type: "navigate", value: "prev" });
  };

  const handleNext = () => {
    sendControlSignal({ type: "navigate", value: "next" });
  };

  const handleToggleRecording = () => {
    handlePlayPause();
  };

  const sendControlSignal = async (signal: ControlSignal) => {
    try {
      if (audioState.isRealtimeMode && realtimeRef.current) {
        realtimeRef.current.sendControlSignal(signal);
      } else if (fallbackRef.current) {
        await fallbackRef.current.handleControlSignal(signal);
      }
    } catch (error) {
      console.error("Control signal error:", error);
    }
  };

  const handleKeywordRemove = (keyword: string) => {
    setActiveKeywords((prev) => prev.filter((k) => k !== keyword));
    updateConfigState((prev) => ({
      ...prev,
      contentKeywords: prev.contentKeywords.filter((k) => k !== keyword),
    }));
    sendControlSignal({ type: "topic.remove", value: keyword });
  };

  const handleVoiceCommand = (command: string) => {
    const signal = mapVoiceCommandToControlSignal(command);
    if (signal) {
      sendControlSignal(signal);
    }
  };

  // Update audio state from audio element
  useEffect(() => {
    if (fallbackRef.current) {
      const updateTime = () => {
        setAudioState((prev) => ({
          ...prev,
          currentTime: fallbackRef.current?.currentTime || 0,
          duration: fallbackRef.current?.duration || 0,
        }));
      };

      fallbackRef.current.addEventListener("timeupdate", updateTime);
      fallbackRef.current.addEventListener("ended", () => {
        setAudioState((prev) => ({ ...prev, isPlaying: false }));
      });

      return () => {
        fallbackRef.current?.removeEventListener("timeupdate", updateTime);
        fallbackRef.current?.removeEventListener("ended", () => { });
      };
    }
  }, [audioState.isRealtimeMode]);

  if (!config) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">설정을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Frequency Loader */}
      <FrequencyLoader
        isVisible={showFrequencyLoader}
        onComplete={() => setShowFrequencyLoader(false)}
      />

      {/* Header */}
      <div className="px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">AI 팟캐스트</h1>
          <button
            onClick={() => router.push("/create")}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Hero Card */}
        <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-8 mb-8 shadow-lg">
          <div className="w-32 h-32 bg-gray-300 rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <Radio className="w-16 h-16 text-gray-500" />
          </div>
          <h2 className="text-xl font-semibold text-center text-gray-900 mb-2">
            {config.topic}
          </h2>
          <div className="text-sm text-gray-600 text-center space-y-1">
            <p>길이: {formatLength(config.length)}</p>
            <p>TTS 톤: {toneLabel(config.tone)}</p>
            {config.contentKeywords.length > 0 && (
              <p>{config.contentKeywords.join(", ")}</p>
            )}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="px-6 mb-8">
        <Progress
          currentTime={audioState.currentTime}
          duration={audioState.duration}
          className="mb-6"
        />
      </div>

      {/* Transport Controls */}
      <div className="px-6 mb-8">
        <Transport
          isPlaying={audioState.isPlaying}
          isRecording={audioState.isRecording}
          onPlayPause={handlePlayPause}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onToggleRecording={handleToggleRecording}
        />
      </div>

      {/* Active Keywords */}
      <div className="px-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          활성 키워드
        </h3>
        <div className="flex flex-wrap gap-2">
          {activeKeywords.map((keyword, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
            >
              {keyword}
              <button
                onClick={() => handleKeywordRemove(keyword)}
                className="hover:bg-gray-200 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="px-6 mb-8">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() =>
              sendControlSignal({ type: "depth", value: "deeper" })
            }
            className="py-3 px-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
          >
            더 깊게
          </button>
          <button
            onClick={() =>
              sendControlSignal({ type: "depth", value: "simpler" })
            }
            className="py-3 px-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
          >
            더 쉽게
          </button>
          <button
            onClick={() =>
              sendControlSignal({ type: "speed", value: "faster" })
            }
            className="py-3 px-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
          >
            속도 ↑
          </button>
          <button
            onClick={() =>
              sendControlSignal({ type: "speed", value: "slower" })
            }
            className="py-3 px-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
          >
            속도 ↓
          </button>
          <button
            onClick={() => sendControlSignal({ type: "tone", value: "softer" })}
            className="py-3 px-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
          >
            톤: 부드럽게
          </button>
          <button
            onClick={() =>
              sendControlSignal({ type: "tone", value: "energetic" })
            }
            className="py-3 px-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
          >
            톤: 에너지 있게
          </button>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="px-6 mb-8">
        {!audioState.isRealtimeMode && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
            <p className="text-yellow-800 text-sm">
              실시간 모드 이용 불가 — 재생성 모드로 동작 중
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="flex items-center justify-around py-4">
          <button
            onClick={() => router.push("/create")}
            className="p-2 text-gray-400 hover:text-black transition-colors"
          >
            <Home className="w-6 h-6" />
          </button>
          <button className="p-2 text-black">
            <Radio className="w-6 h-6" />
          </button>
          <button className="p-2 text-gray-400">
            <Settings className="w-6 h-6" />
          </button>
          <button
            onClick={() => router.push("/history")}
            className="p-2 text-gray-400 hover:text-black transition-colors"
          >
            <Library className="w-6 h-6" />
          </button>
          <button className="p-2 text-gray-400">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}

function toneLabel(tone: PodcastConfig["tone"]) {
  return toneLabels[tone] ?? "기본 톤";
}

function formatLength(length: PodcastConfig["length"]) {
  switch (length) {
    case 5:
      return "약 5분";
    case 10:
      return "약 10분";
    case 30:
      return "약 30분";
    case 60:
      return "약 1시간";
    default:
      return "연속 생성";
  }
}
