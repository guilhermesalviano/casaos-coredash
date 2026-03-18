"use client";

import { useEffect, useState } from "react";
import { useStatus } from "@/contexts/statusContext";
import Logo from "@/components/logo";

const LOADING_TEXTS = [
  "Loading system... beep boop!",
  "Spinning up the gears...",
  "Waking up the servers...",
  "Good things take time...",
  "Almost there...",
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

      <div className="absolute bottom-10 flex flex-col items-center">
        <div className="flex items-center gap-2 text-2xl font-black tracking-tighter text-slate-800 leading-none">
          <Logo />
        </div>
        
        {/* A subtle indicator or tagline can go here */}
        <span className="mt-1.5 text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-300">
          v1.0.0
        </span>
      </div>
    </div>
  );
}