"use client";

import { useStatus } from "@/contexts/statusContext";
import { useEffect, useState } from "react";

const LOADING_TEXTS = [
  // "Brewing your dashboard...",
  // "Fetching the good stuff...",
  "Almost there...",
  // "Counting your streaks...",
  "Waking up the servers...",
  "Good things take time...",
  "Hang tight...",
];

export default function Loading() {
  const { anyLoading } = useStatus();
  const [textIndex, setTextIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    if (!anyLoading) return;

    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setTextIndex(i => (i + 1) % LOADING_TEXTS.length);
        setFade(true);
      }, 300);
    }, 2500);

    return () => clearInterval(interval);
  }, [anyLoading]);

  if (!anyLoading) return;

  return (
    <div className="fixed flex flex-col gap-6 items-center justify-center bg-white w-full h-full z-100">
      <div className="relative flex items-center justify-center">
        <div className="w-14 h-14 rounded-full border-4 border-gray-200" />
        <div className="absolute w-14 h-14 rounded-full border-4 border-transparent border-t-cyan-500 animate-spin" />
      </div>
      <p
        className="text-sm text-slate-400 transition-opacity duration-300"
        style={{ opacity: fade ? 1 : 0 }}
      >
        {LOADING_TEXTS[textIndex]}
      </p>
    </div>
  );
}