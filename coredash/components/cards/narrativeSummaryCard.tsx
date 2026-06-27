"use client";

import { useCallback, useRef, useState } from "react";
import { useDashboard } from "@/hooks/useDashboard";
import Card from "@/components/card";

type State = "idle" | "loading" | "streaming" | "done" | "error";

function SparkleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}

function TypingDots() {
  return (
    <span style={{ display: "inline-flex", gap: 3, alignItems: "center" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "var(--muted)",
            display: "inline-block",
            animation: "narrativeDot 1.2s ease-in-out infinite",
            animationDelay: `${i * 0.18}s`,
          }}
        />
      ))}
    </span>
  );
}

export default function NarrativeSummaryCard() {
  const [state, setState] = useState<State>("idle");
  const [text, setText] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const { weather } = useDashboard();

  const fetchNarrative = useCallback(async () => {
    if (!weather.data) return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setState("loading");
    setText("");

    try {
      const res = await fetch("/api/ai/narrative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weather: weather.data, hour: new Date().getHours() }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) throw new Error("API error");
      if (!res.body) throw new Error("No response body");

      setState("streaming");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        for (const line of decoder.decode(value, { stream: true }).split("\n")) {
          if (!line.trim()) continue;
          try {
            const json = JSON.parse(line);
            const chunk = json.response ?? json.choices?.[0]?.delta?.content ?? "";
            if (chunk) setText((prev) => prev + chunk);
          } catch { /* incomplete chunk */ }
        }
      }

      setState("done");
    } catch (err: unknown) {
      if (!(err instanceof DOMException && err.name === "AbortError")) setState("error");
    }
  }, [weather.data]);

  const isActive = state === "loading" || state === "streaming" || state === "done";

  return (
    <Card>
      <style>{`
        @keyframes narrativeDot {
          0%, 100% { opacity: 0.25; transform: translateY(0); }
          50% { opacity: 0.8; transform: translateY(-3px); }
        }
        @keyframes narrativeFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes narrativeCursor {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: isActive ? "auto" : 120,
          gap: 12,
        }}
      >
        {/* Header — only shown when active */}
        {isActive && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              animation: "narrativeFadeIn 0.25s ease-out",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <SparkleIcon size={13} />
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)" }}>
                Rocky
              </span>
            </div>

            {state === "done" && (
              <button
                onClick={fetchNarrative}
                title="Regenerate"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--muted)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 11,
                  padding: "2px 4px",
                  borderRadius: 6,
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--foreground)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
              >
                <RefreshIcon />
              </button>
            )}
          </div>
        )}

        {/* Idle state — centered trigger button */}
        {state === "idle" && (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 80,
            }}
          >
            <button
              onClick={fetchNarrative}
              disabled={!weather.data}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 18px",
                borderRadius: 10,
                border: "1px solid var(--border)",
                background: "none",
                color: "var(--muted)",
                fontSize: 13,
                fontWeight: 500,
                cursor: weather.data ? "pointer" : "not-allowed",
                fontFamily: "inherit",
                transition: "border-color 0.2s, color 0.2s, background 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--border-hover)";
                e.currentTarget.style.color = "var(--foreground)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.color = "var(--muted)";
              }}
            >
              <SparkleIcon size={15} />
              Daily briefing
            </button>
          </div>
        )}

        {/* Loading */}
        {state === "loading" && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>Thinking</span>
            <TypingDots />
          </div>
        )}

        {/* Streaming / Done */}
        {(state === "streaming" || state === "done") && (
          <p
            style={{
              fontSize: 13,
              lineHeight: 1.65,
              color: "var(--foreground)",
              whiteSpace: "pre-wrap",
              margin: 0,
              animation: "narrativeFadeIn 0.2s ease-out",
              fontFamily: "'DM Sans', system-ui, sans-serif",
            }}
          >
            {text.split("\n").map((line, i, arr) => (
              <span key={i}>
                {line}
                {i < arr.length - 1 && <br />}
              </span>
            ))}
            {state === "streaming" && (
              <span
                style={{
                  display: "inline-block",
                  width: 1,
                  height: "0.85em",
                  background: "var(--muted)",
                  marginLeft: 2,
                  verticalAlign: "middle",
                  animation: "narrativeCursor 0.8s step-end infinite",
                }}
              />
            )}
          </p>
        )}

        {/* Error */}
        {state === "error" && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: "var(--muted)", fontStyle: "italic" }}>
              Rocky is offline.
            </span>
            <button
              onClick={fetchNarrative}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                color: "var(--muted)",
                textDecoration: "underline",
                fontFamily: "inherit",
                padding: 0,
              }}
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}
