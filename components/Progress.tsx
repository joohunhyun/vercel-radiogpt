"use client";

import { useEffect, useRef, useState } from "react";

interface ProgressProps {
  currentTime: number;
  duration: number;
  onSeek?: (time: number) => void;
  className?: string;
}

export default function Progress({
  currentTime,
  duration,
  onSeek,
  className = "",
}: ProgressProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState(currentTime);
  const progressRef = useRef<HTMLDivElement>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!progressRef.current || !onSeek) return;

    setIsDragging(true);
    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    setDragTime(Math.max(0, Math.min(duration, newTime)));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !progressRef.current) return;

    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    setDragTime(Math.max(0, Math.min(duration, newTime)));
  };

  const handleMouseUp = () => {
    if (isDragging && onSeek) {
      onSeek(dragTime);
    }
    setIsDragging(false);
  };

  useEffect(() => {
    if (!isDragging) {
      setDragTime(currentTime);
    }
  }, [currentTime, isDragging]);

  const progress =
    duration > 0 ? (isDragging ? dragTime : currentTime) / duration : 0;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Progress Bar */}
      <div
        ref={progressRef}
        className="w-full h-2 bg-gray-200 rounded-full cursor-pointer hover:h-3 transition-all"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="h-full bg-black rounded-full transition-all"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Time Display */}
      <div className="flex justify-between text-sm text-gray-500">
        <span>{formatTime(isDragging ? dragTime : currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
}
