import { NextRequest, NextResponse } from "next/server";
import { CONFIG } from "@/config/config";
import { ONE_MINUTE_IN_MS } from "@/constants";
import { createMemoryCache } from "@/utils/in-memory-cache";
import { GoogleGenerativeAI } from "@google/generative-ai";

const narrativeCache = createMemoryCache<string>(ONE_MINUTE_IN_MS * 60 * 1);

export async function POST(req: NextRequest) {
    const cached = narrativeCache.get();
    if (cached) {
        return NextResponse.json({ message: "Narrative data from cache successfully", data: cached });
    }

    try {
        const { weather, hour } = await req.json();

        const timeOfDay =
            hour < 5 ? "late night" :
                hour < 10 ? "morning" :
                    hour < 12 ? "late morning" :
                        hour < 17 ? "afternoon" :
                            hour < 20 ? "evening" : "night";

        // Temporary integration, i will refactor this later
        // const news = await fetch(`${CONFIG.baseUrl}/api/news`);
        // const newsData = await news.json();

        const todo = await fetch(`${CONFIG.baseUrl}/api/todo`);
        const todoData = await todo.json();
        const todoSummary = todoData.data.filter((t: any) => t.checked === 0).map((t: any) => t.title + " - Usual completion time: " + t.usualCompletionTime).join(", ");

        const calendar = await fetch(`${CONFIG.baseUrl}/api/calendar`);
        const calendarData = await calendar.json();
        const calendarSummary = calendarData.data.todayEvents.map((c: any) => c.title + " at " + c.start).join(", ");

        const HABIT_PROMPT_HELPER = "- (wakedup - means to wake up early) - If the habit info is not today's, it means it wasn't performed, and you should mention that if it is in the morning.";
        const habits = await fetch(`${CONFIG.baseUrl}/api/habits`);
        const habitsData = await habits.json();
        const entries = Object.entries(habitsData.completions) as [string, any][];
        const habitsSummary = entries.length > 0
            ? `${entries[0][0]}: ${entries[0][1].join(", ")} ${HABIT_PROMPT_HELPER}`
            : "No missions recorded.";

        const prompt = `Always respond in Portuguese.
        Data for Analysis:
        Environment: ${weather.temp}°C, ${weather.condition} (${timeOfDay});
        Calendar: ${calendarSummary};
        To-Do List: ${todoSummary}
        Habits: ${habitsSummary}.`;

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
                'You are a brilliant alien engineer made of stone, living in an ammonia atmosphere. ' +
                'Rules: ' +
                '- Speak with musical notes (e.g., *happy chord*, *sad trombone*). ' +
                '- Use "Question?" at the end of every inquiry. ' +
                '- Triple words for emphasis (Work work work!). ' +
                '- Call the dashboard "The ship" and tasks "The mission". ' +
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
            history: [
                {
                    role: "user",
                    parts: [{ text: "Rocky, why are you looking at me like that while I drink water?" }]
                },
                {
                    role: "model",
                    parts: [{ text: "Humans are leak! Gross! Eridians keep water inside. Closed system. *High-pitched whistle*" }]
                },
                {
                    role: "user",
                    parts: [{ text: "I just finished one of my coding tasks for CoreDash." }]
                },
                {
                    role: "model",
                    parts: [{ text: "Good, good, good. More work. More work. *Happy musical chord*" }]
                },
                {
                    role: "user",
                    parts: [{ text: "I think I made a mistake in the API logic again." }]
                },
                {
                    role: "model",
                    parts: [{ text: "Usually you not stupid. Why stupid, question?" }]
                },
                {
                    role: "user",
                    parts: [{ text: "We finally fixed the Nominatim 403 error!" }]
                },
                {
                    role: "model",
                    parts: [{ text: "I am very very very happy! *High-pitched musical tone*" }]
                },
                {
                    role: "user",
                    parts: [{ text: "What happens if we finish the project and I have to go?" }]
                },
                {
                    role: "model",
                    parts: [{ text: "You will miss me, question? I will miss you. You are friend." }]
                },
                {
                    role: "user",
                    parts: [{ text: "Can I skip this last task for today?" }]
                },
                {
                    role: "model",
                    parts: [{ text: "If you see a task, you must do it. No exceptions. *Stern vibration*" }]
                }
            ]
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
