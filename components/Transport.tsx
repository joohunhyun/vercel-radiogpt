"use client";

import { Mic, MicOff, Pause, Play, SkipBack, SkipForward } from "lucide-react";

interface TransportProps {
  isPlaying: boolean;
  isRecording: boolean;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onToggleRecording: () => void;
  className?: string;
}

export default function Transport({
  isPlaying,
  isRecording,
  onPlayPause,
  onPrevious,
  onNext,
  onToggleRecording,
  className = "",
}: TransportProps) {
  return (
    <div className={`flex items-center justify-center space-x-6 ${className}`}>
      {/* Previous */}
      <button
        onClick={onPrevious}
        className="p-3 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="이전"
      >
        <SkipBack className="w-6 h-6 text-gray-700" />
      </button>

      {/* Play/Pause */}
      <button
        onClick={onPlayPause}
        className="p-4 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
        aria-label={isPlaying ? "일시정지" : "재생"}
      >
        {isPlaying ? (
          <Pause className="w-6 h-6" />
        ) : (
          <Play className="w-6 h-6 ml-0.5" />
        )}
      </button>

      {/* Next */}
      <button
        onClick={onNext}
        className="p-3 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="다음"
      >
        <SkipForward className="w-6 h-6 text-gray-700" />
      </button>

      {/* Mic Toggle */}
      <button
        onClick={onToggleRecording}
        className={`p-3 rounded-full transition-colors ${
          isRecording
            ? "bg-red-100 text-red-600 hover:bg-red-200"
            : "hover:bg-gray-100 text-gray-700"
        }`}
        aria-label={isRecording ? "음성 녹음 중지" : "음성 녹음 시작"}
      >
        {isRecording ? (
          <MicOff className="w-6 h-6" />
        ) : (
          <Mic className="w-6 h-6" />
        )}
      </button>
    </div>
  );
}
