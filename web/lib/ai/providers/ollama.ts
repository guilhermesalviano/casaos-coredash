import { AI, EXTERNAL_SERVICES } from "@/config/config";
import { Ollama } from "ollama";

interface OllamaProviderProps {
  prompt: string;
  systemInstruction?: string;
  history?: any[];
}

const ollama = new Ollama({ host: EXTERNAL_SERVICES.ollama });

export default async function OllamaProvider({
  prompt,
  systemInstruction,
  history = [],
}: OllamaProviderProps): Promise<{
  stream: AsyncIterable<any> | null;
  error?: string;
}> {
  try {
    const stream = await ollama.chat({
      model: AI.model,
      messages: [
        ...(systemInstruction ? [{ role: "system" as const, content: systemInstruction }] : []),
        ...history,
        { role: "user" as const, content: prompt },
      ],
      stream: true,
      think: false,
    });

    return { stream };
  } catch (err: any) {
    if (err.name === "AbortError") {
      return { stream: null, error: "Ollama request timed out" };
    }
    return { stream: null, error: `fetch failed: ${err.message}` };
  }
}