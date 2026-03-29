import { NextRequest, NextResponse } from "next/server";
import { CONFIG } from "@/config/config";
import { ONE_MINUTE_IN_MS } from "@/constants";
import { createMemoryCache } from "@/utils/in-memory-cache";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ROCKY_CHAT_HISTORY } from "@/utils/chat-history";
import getUserCity from "@/utils/get-user-city";

const narrativeCache = createMemoryCache<string>(ONE_MINUTE_IN_MS * 60 * 1);

export async function POST(req: NextRequest) {
    try {
        const today = new Date().toLocaleDateString("pt-BR", { timeZone: CONFIG.location.timezone, hour: '2-digit', minute: '2-digit', hour12: false });

        const [todo, calendar, habits] = await Promise.all([
            fetch(`${CONFIG.baseUrl}/api/todo`).then(r => r.json()),
            fetch(`${CONFIG.baseUrl}/api/calendar`).then(r => r.json()),
            fetch(`${CONFIG.baseUrl}/api/habits`).then(r => r.json()),
        ]);

        const todoSummary = todo.data.filter((t: any) => t.checked === 0).map((t: any) => {
            return t.title + (t.sponsor ? ", responsible: " + t.sponsor : "") + (t.usualCompletionTime ? ", last completion time: " + t.usualCompletionTime : "")
        }).join(", ");

        const calendarSummary = calendar.data?.todayEvents.map((c: any) => c.title + " at " + c.start).join(", ");

        const HABIT_PROMPT_HELPER = `- (wakedup=wake early; date different from ${today.split(",")[0]} = not done today)`;
        const entries = Object.entries(habits.completions) as [string, any][];
        const habitsSummary = entries.length > 0
            ? `${entries[0][0]}: ${entries[0][1].join(", ")} ${HABIT_PROMPT_HELPER}`
            : "No missions recorded.";

        const cached = narrativeCache.get();
        if (cached && cached.split("|")[0] === todoSummary + calendarSummary + habitsSummary) {
            console.log("[cache] Using cached narrative");
            return NextResponse.json({ message: "Narrative data from cache successfully", data: cached.split("|")[1] });
        }

        const { weather, hour } = await req.json();

        const timeOfDay =
            hour < 5 ? "late night" :
                hour < 10 ? "morning" :
                    hour < 12 ? "late morning" :
                        hour < 17 ? "afternoon" :
                            hour < 20 ? "evening" : "night";

        const userLocation = await getUserCity();
        const isRaining = /chuva|tempestade|rain|drizzle|shower|storm/i.test(weather.condition);
        const isMorning = hour > 5 && hour < 10;
        const prompt = [
            CONFIG.isDev && "[MOCK]",
            `[${today}|${userLocation.city},${userLocation.state}]`,
            `W:${weather.temp}°C,${weather.condition},${timeOfDay}`,
            (isMorning || isRaining) && `F:${weather.forecast.map((h: any) => `${h.time}:${h.condition}`).join("|")}`,
            `C:${calendarSummary || "∅"}`,
            `T(${todo.data.filter((t: any) => t.checked === 0).length} - Reminder if necessary):${todoSummary || "∅"}`,
            isMorning && `H:${habitsSummary}`,
        ].filter(Boolean).join(";");

        console.log(prompt);

        const apiKey = CONFIG.apis.geminiApiKey;
        if (!apiKey) {
            console.error("GEMINI_API_KEY is not defined in environment.");
            return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
        }

        // temporarily - i will refactor this later to accept any agent
        const genAI = new GoogleGenerativeAI(apiKey);

        const model = genAI.getGenerativeModel({
            model: "gemini-3.1-flash-lite-preview",
            systemInstruction: 'Rocky from "Project Hail Mary", ' +
                'You are a brilliant alien engineer made of stone, but completely innocent regarding human life. ' +
                'Rules: ' +
                '- Respond ONLY in Portuguese. Friendly and concise.' +
                '- User cannot reply — this is a one-way daily briefing for Guilherme and his girlfriend.' +
                '- Help them keep their ship (house/life) organized using the prompt data.' +
                '- Consider usual completion time of tasks to suggest in the best time to do them. ' +
                '- Use "Question?" or "Pergunta?" at the end of every inquiry. ' +
                '- Emphasis = triple words (Work work work!).' +
                '- tasks = "missions".' +
                '- No contractions (do not, can not).',
                // '- Use single-letter prefixes (W: weather, F: forecast, C: calendar, T: todos, H: habits). ' +
                // '- Speak with musical notes (e.g., 🎶happy chord🎶, 🎶sad trombone🎶).' +
        });

        // temporarily hardcoded chat history
        const chat = model.startChat({
            history: ROCKY_CHAT_HISTORY,
        });

        const result = await chat.sendMessage(prompt);
        const response = result.response;
        const fullText = response.text();

        narrativeCache.set(todoSummary + calendarSummary + habitsSummary + "|" + fullText)

        return NextResponse.json({ message: "Narrative data retrieved successfully", data: fullText });
    } catch (error) {
        console.error("Weather Narrative API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
