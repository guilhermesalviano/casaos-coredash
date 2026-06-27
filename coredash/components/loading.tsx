"use client";

import { useEffect, useState } from "react";
import { useStatus } from "@/contexts/statusContext";
import { LOADING_TEXTS } from "@/constants";
import { randomInRange } from "@/utils/random";
import Logo from "@/components/logo";

export default function Loading() {
  const { anyLoading } = useStatus();

  const [textIndex, setTextIndex] = useState<number | null>(null);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    setTextIndex(randomInRange(0, 5));

    if (!anyLoading) return;

    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setTextIndex(randomInRange(0, 5));
        setFade(true);
      }, 300);
    }, 2500);

    return () => clearInterval(interval);
  }, [anyLoading]);

  if (!anyLoading) return null;

  return (
    <div
      className="fixed flex flex-col gap-6 items-center justify-center w-full h-full z-100"
      style={{
        opacity: fade ? 1 : 0,
        transition: "opacity 0.3s ease-in-out",
        backgroundColor: "var(--background)",
      }}
    >
      <div className="relative flex items-center justify-center">
        <div className="w-14 h-14 rounded-full border-4 border-gray-200" />
        <div className="absolute w-14 h-14 rounded-full border-4 border-transparent border-t-cyan-500 animate-spin" />
      </div>
      {(textIndex !== null &&
        <p
          className="text-sm text-slate-400 animate-appear"
          style={{ opacity: fade ? 1 : 0 }}
        >
          {LOADING_TEXTS[textIndex]}
        </p>
      )}

      <div className="absolute bottom-10 flex flex-col items-center">
        <div className="flex items-center gap-2 text-2xl font-black tracking-tighter text-slate-800 leading-none">
          <Logo />
        </div>

        <span className="mt-1.5 text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-300">
          v1.0.0
        </span>
      </div>
    </div>
  );
}