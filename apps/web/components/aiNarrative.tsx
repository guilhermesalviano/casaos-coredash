import { useCallback, useEffect, useRef, useState } from "react";

interface WeatherData {
  temp: number;
  condition: string;
  city: string;
  state: string;
  code: number;
}

interface AINarrativeProps {
  weather: WeatherData;
  hour: number;
}

type NarrativeState = "idle" | "loading" | "done" | "error";

export const AINarrative: React.FC<AINarrativeProps> = ({ weather, hour }) => {
  const [text, setText] = useState("");
  const [state, setState] = useState<NarrativeState>("idle");
  const abortRef = useRef<AbortController | null>(null);
  // const cacheKey = `${weather.city}-${weather.code}-${weather.temp}-${Math.floor(hour / 3)}`;
  // const cacheRef = useRef<Record<string, string>>({});

  const fetchNarrative = useCallback(async () => {
    // if (cacheRef.current[cacheKey]) {
    //   setText(cacheRef.current[cacheKey]);
    //   setState("done");
    //   return;
    // }

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setState("loading");
    setText("");

    try {
      const res = await fetch("/api/ai/narrative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weather,
          hour,
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) throw new Error("API error");

      const data = await res.json();
      const narrative = data.data || "";

      setText(narrative);
      setState("done");
      // cacheRef.current[cacheKey] = narrative;
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setState("error");
      }
    }
  }, [weather, hour]);

  useEffect(() => {
    fetchNarrative();
    return () => abortRef.current?.abort();
  }, []);

  return (
    <div
      className="rounded-xl p-3! flex flex-col gap-2 max-w-sm"
      style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div className="min-h-[2.8rem] flex items-start">
        {state === "loading" && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-white/20">Thinking</span>
            <span className="flex gap-[3px]">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="inline-block w-1 h-1 rounded-full bg-white/25"
                  style={{
                    animation: "narrativePulse 1.2s ease-in-out infinite",
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </span>            
          </div>
        )}

        {(state === "done") && text && (
          <div className="flex flex-col">
            <div>
              <span className="text-[10px] font-semibold tracking-[0.12em] text-white/30 uppercase">
                Rocky says:
              </span>
              {/* {state === "done" && text && (
                <button
                  onClick={fetchNarrative}
                  className="text-[10px] text-white/20 hover:text-white/50 transition-colors cursor-pointer"
                  title="Regenerate"
                >
                  ↺
                </button>
              )} */}
            </div>
            <p
              className="text-[12px] leading-[1.65] text-white/55 font-light"
              style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
            >
              {text.split("\n").map((line, i) => ( // replace * 
                <span key={i}>
                  {line}
                  {i < text.split("\n").length - 1 && <br />}
                </span>
              ))}
            </p>
          </div>
        )}

        {state === "error" && (
          <p className="text-[11px] text-white/25 italic">
            Sorry, Rocky is offline. &nbsp;
            <button
              onClick={fetchNarrative}
              className="underline hover:text-white/50 transition-colors cursor-pointer">
              Retry
            </button>
          </p>
        )}
      </div>

      <style>{`
        @keyframes narrativePulse {
          0%, 100% { opacity: 0.2; transform: scaleY(1); }
          50% { opacity: 0.7; transform: scaleY(1.4); }
        }
      `}</style>
    </div>
  );
};