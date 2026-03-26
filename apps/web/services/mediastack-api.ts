import { CONFIG } from "@/config/config";
import { NewsResponse } from "@/types/services";

export async function fetchMediastackAPI(): Promise<NewsResponse> {
  const API_KEY = CONFIG.apis.newsApiKey;

  const response = await fetch(`${CONFIG.urls.mediastack}?access_key=${API_KEY}&countries=br,us&categories=business,technology,science,health&limit=5`, {
    next: { revalidate: 1 * 60 * 60 },
  });

  if (!response.ok) {
    throw new Error("Falha ao buscar dados da API externa 'Mediastack'");
  }

  const responseJson = await response.json();

  return responseJson;
}