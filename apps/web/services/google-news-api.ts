import { CONFIG } from "@/config/config";
import { SerpApiGoogleNewsResponse } from "@/types/services";

export async function fetchGoogleNewsAPI(): Promise<SerpApiGoogleNewsResponse> {
  const SERPAPI_KEY = CONFIG.apis.serpApiKey;
 
  const response = await fetch(
    `${CONFIG.urls.serpApi}?engine=google_news_light&api_key=${SERPAPI_KEY}&q=breaking+news+world`,
    { next: { revalidate: 1 * 60 * 60 } }
  );

  if (!response.ok) {
    throw new Error("Falha ao buscar dados da API externa 'serpapi'");
  }

  const responseJson = await response.json();

  return responseJson;
}