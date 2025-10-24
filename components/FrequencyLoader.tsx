"use client";

import { useEffect, useState } from "react";

interface FrequencyLoaderProps {
  isVisible: boolean;
  onComplete?: () => void;
}

export default function FrequencyLoader({
  isVisible,
  onComplete,
}: FrequencyLoaderProps) {
  const [animationPhase, setAnimationPhase] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setAnimationPhase((prev) => (prev + 1) % 8);
    }, 600);

    return () => clearInterval(interval);
  }, [isVisible]);

  useEffect(() => {
    if (isVisible && onComplete) {
      // Simulate completion after 3-5 seconds
      const timer = setTimeout(() => {
        onComplete();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      {/* Status Bar */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-white flex items-center justify-between px-6 text-black">
        <span className="text-sm font-medium">9:41</span>
        <div className="flex items-center space-x-1">
          <div className="w-4 h-2 bg-black rounded-sm"></div>
          <div className="w-4 h-2 bg-black rounded-sm"></div>
          <div className="w-4 h-2 bg-black rounded-sm"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="text-center px-6">
        {/* Title */}
        <h1 className="text-4xl font-bold text-black mb-4">GPT Radio가</h1>

        {/* Subtitle */}
        <p className="text-lg text-black mb-8">
          당신의 주파수를 검색하는 중...
        </p>

        {/* Frequency Tuner */}
        <div className="relative w-80 h-8 mx-auto">
          {/* Background Grid */}
          <div className="absolute inset-0 bg-gray-200 rounded-lg overflow-hidden">
            {/* Frequency lines */}
            {Array.from({ length: 40 }, (_, i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 w-px bg-gray-400"
                style={{ left: `${(i / 39) * 100}%` }}
              />
            ))}
          </div>

          {/* Animated Red Frequency Bar */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-red-500 rounded-full transition-all duration-600 ease-in-out"
            style={{
              left: `${25 + Math.sin((animationPhase * Math.PI) / 4) * 30}%`,
              transform: `translateX(${
                Math.sin((animationPhase * Math.PI) / 2) * 15
              }px)`,
              boxShadow: "0 0 8px rgba(239, 68, 68, 0.6)",
            }}
          />
        </div>

        {/* Loading Dots */}
        <div className="flex justify-center space-x-2 mt-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-black rounded-full animate-pulse"
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: "1s",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
