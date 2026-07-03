"use client";

import { useEffect, useState } from "react";
import { useStatus } from "@/contexts/statusContext";
import Image from "next/image";

const GIFS = [
  "/gifs/adventure-time1.gif",
  "/gifs/stitch1.gif",
  "/gifs/adventure-time2.gif",
  "/gifs/stitch-2.gif",
  "/gifs/lula-molusco.gif",
];

const FADE_DURATION = 400;
const MIN_DISPLAY = 1200;

export default function Loading() {
  const { anyLoading } = useStatus();
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);
  const [gif, setGif] = useState<string | null>(null);

  useEffect(() => {
    setGif(GIFS[Math.floor(Math.random() * GIFS.length)]);
  }, []);

  useEffect(() => {
    if (anyLoading) return;
    const t = setTimeout(() => {
      setExiting(true);
      setTimeout(() => setVisible(false), FADE_DURATION);
    }, MIN_DISPLAY);
    return () => clearTimeout(t);
  }, [anyLoading]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-100 flex flex-col items-center justify-center gap-4"
      style={{
        background: "var(--background)",
        opacity: exiting ? 0 : 1,
        transition: exiting ? `opacity ${FADE_DURATION}ms ease` : "none",
        pointerEvents: exiting ? "none" : "all",
      }}
    >
      {gif && <Image src={gif} alt="loading" width={200} height={200} unoptimized />}
    </div>
  );
}