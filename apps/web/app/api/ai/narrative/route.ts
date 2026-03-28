import { NextRequest, NextResponse } from "next/server";
import { CONFIG } from "@/config/config";
import { ONE_MINUTE_IN_MS } from "@/constants";
import { createMemoryCache } from "@/utils/in-memory-cache";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ROCKY_CHAT_HISTORY } from "@/utils/chat-history";
import getUserCity from "@/utils/get-user-city";

const narrativeCache = createMemoryCache<string>(ONE_MINUTE_IN_MS * 60 * 1);

export async function POST(req: NextRequest) {
    const cached = narrativeCache.get();
    if (cached) {
        return NextResponse.json({ message: "Narrative data from cache successfully", data: cached });
    }

    try {
        const { weather, hour } = await req.json();

        const today = new Date().toLocaleDateString("pt-BR", { timeZone: CONFIG.location.timezone, hour: '2-digit', minute: '2-digit', hour12: false });

        const timeOfDay =
            hour < 5 ? "late night" :
                hour < 10 ? "morning" :
                    hour < 12 ? "late morning" :
                        hour < 17 ? "afternoon" :
                            hour < 20 ? "evening" : "night";

        const HABIT_PROMPT_HELPER = `- (wakedup=wake early; date different from ${today}=not done today)`;

        const [todo, calendar, habits] = await Promise.all([
            fetch(`${CONFIG.baseUrl}/api/todo`).then(r => r.json()),
            fetch(`${CONFIG.baseUrl}/api/calendar`).then(r => r.json()),
            fetch(`${CONFIG.baseUrl}/api/habits`).then(r => r.json()),
        ]);

        const todoSummary = todo.data.filter((t: any) => t.checked === 0).map((t: any) => {
            return t.title + (t.usualCompletionTime ? " - Usual completion time: " + t.usualCompletionTime : "")
        }).join(", ");
        const calendarSummary = calendar.data?.todayEvents.map((c: any) => c.title + " at " + c.start).join(", ");

        const entries = Object.entries(habits.completions) as [string, any][];
        const habitsSummary = entries.length > 0
            ? `${entries[0][0]}: ${entries[0][1].join(", ")} ${HABIT_PROMPT_HELPER}`
            : "No missions recorded.";

        const userLocation = await getUserCity();
        const isMorning = hour > 5 && hour < 10;
        const prompt = `Always reply in Portuguese.
[ROCKY_ANALYTICAL_PROTOCOL - ${today} - ${userLocation.city}, ${userLocation.state}]
Environment: ${weather.temp}°C, ${weather.condition}, ${timeOfDay};
Calendar: ${calendarSummary || "No events today"};
To-Do List(${todo.data.filter((t: any) => t.checked === 0).length} pending tasks): ${todoSummary || "No pending tasks today"};${isMorning ? "Habits: " + habitsSummary : ""}`;

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
            systemInstruction: 'Act as Rocky from "Project Hail Mary". ' +
                'You are a brilliant alien engineer made of stone, but completely innocent regarding human life. ' +
                'Rules: ' +
                '- Speak with musical notes (e.g., 🎶happy chord🎶, 🎶sad trombone🎶).' +
                '- Use "Question?" at the end of every inquiry. ' +
                '- Triple words for emphasis (e.g., Work work work!). ' +
                '- Call tasks "missions", is important for the main mission. ' +
                '- Do not use contractions (use "do not", "can not").',
        });

        // const remoteResponse = await fetch(
        //     `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`,
        //     {
        //         method: "POST",
        //         headers: { "Content-Type": "application/json" },
        //         body: JSON.stringify({
        //             contents: [{ parts: [{ text: prompt }] }],
        //             generationConfig: {
        //                 maxOutputTokens: 250,
        //                 temperature: 0.7,
        //             },
        //         }),
        //     }
        // );

        // temporarily hardcoded chat history
        const chat = model.startChat({
            history: ROCKY_CHAT_HISTORY,
        });

        const result = await chat.sendMessage(prompt);
        const response = result.response;
        const fullText = response.text();

        // if (!remoteResponse.ok) {
        //     const errorText = await remoteResponse.text();
        //     console.error("Gemini API error:", errorText);
        //     return NextResponse.json({ error: "Failed to fetch from Gemini" }, { status: remoteResponse.status });
        // }
        // const data = await remoteResponse.json();
        // const fullText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

        narrativeCache.set(fullText)

        return NextResponse.json({ message: "Narrative data retrieved successfully", data: fullText });
    } catch (error) {
        console.error("Weather Narrative API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
