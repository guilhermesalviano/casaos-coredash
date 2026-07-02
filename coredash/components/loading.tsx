"use client";

import { useEffect, useState } from "react";
import { useStatus } from "@/contexts/statusContext";
import Logo from "@/components/logo";

// Layer timing: (transition-duration + delay) determines render order
// L1: 900+0=900ms  L2: 1000+350=1350ms  L3: 1050+700=1750ms  L4: 1100+1100=2200ms
const UNMOUNT_DELAY = 2450;

export default function Loading() {
  const { anyLoading } = useStatus();
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (anyLoading) return;
    setExiting(true);
    const t = setTimeout(() => setVisible(false), UNMOUNT_DELAY);
    return () => clearTimeout(t);
  }, [anyLoading]);

  if (!visible) return null;

  const wipe = (duration: number, delay: number, easing: string) =>
    exiting ? `transform ${duration}ms ${easing} ${delay}ms` : "none";

  const panel = (extras?: React.CSSProperties): React.CSSProperties => ({
    position: "absolute",
    inset: 0,
    transform: exiting ? "translateY(-105%)" : "translateY(0)",
    willChange: exiting ? "transform" : "auto",
    ...extras,
  });

  return (
    <>
      <style>{`
        @keyframes loading-enter {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes loading-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.45; }
        }
        @keyframes loading-scan {
          0%   { transform: translateY(-100%); opacity: 0; }
          10%  { opacity: 0.06; }
          90%  { opacity: 0.06; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
      `}</style>

      <div
        className="fixed inset-0 z-100 overflow-hidden"
        style={{ pointerEvents: exiting ? "none" : "all" }}
      >
        {/* Layer 1 — deepest, fastest exit */}
        <div
          style={panel({
            background: "var(--background)",
            boxShadow: "inset 0 -2px 0 0 var(--accent)",
            transition: wipe(900, 0, "cubic-bezier(0.9,0,0.1,1)"),
          })}
        />

        {/* Layer 2 — medium exit */}
        <div
          style={panel({
            background: "var(--surface)",
            boxShadow: "inset 0 -2px 0 0 var(--accent)",
            transition: wipe(1000, 350, "cubic-bezier(0.84,0,0.16,1)"),
          })}
        />

        {/* Layer 3 — slower exit */}
        <div
          style={panel({
            background: "var(--background)",
            boxShadow: "inset 0 -2px 0 0 var(--accent)",
            transition: wipe(1050, 700, "cubic-bezier(0.78,0,0.22,1)"),
          })}
        />

        {/* Layer 4 — Logo, slowest exit */}
        <div
          style={panel({
            background: "var(--surface)",
            transition: wipe(1100, 1100, "cubic-bezier(0.72,0,0.28,1)"),
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          })}
        >
          {/* Horizontal scan line — ambient FX while loading */}
          {!exiting && (
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                overflow: "hidden",
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  height: 80,
                  background: "linear-gradient(to bottom, transparent, var(--accent), transparent)",
                  animation: "loading-scan 3.5s ease-in-out infinite",
                }}
              />
            </div>
          )}

          <div
            style={{
              animation: exiting
                ? "none"
                : "loading-enter 0.55s cubic-bezier(0.34,1.56,0.64,1) 0.25s both, loading-pulse 2.4s ease-in-out 1.2s infinite",
              position: "relative",
              zIndex: 1,
            }}
          >
            <Logo />
          </div>

          <span
            style={{
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              fontWeight: 600,
              color: "var(--muted)",
              animation: exiting ? "none" : "loading-enter 0.5s ease-out 0.5s both",
              position: "relative",
              zIndex: 1,
            }}
          >
            v1.0.0
          </span>
        </div>
      </div>
    </>
  );
}