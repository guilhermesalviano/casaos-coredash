import { CONFIG } from "@/config/config";
import { BrapiResponse } from "@/types/services";

export async function fetchBrapiAPI(stocks: string): Promise<BrapiResponse> {
  const API_KEY = CONFIG.apis.brapiToken;

  const response = await fetch(`${CONFIG.urls.brapi}/${stocks}?token=${API_KEY}`, {
    next: { revalidate: CONFIG.updateIntervalMs }
  });
  const responseJson = await response.json();

  return responseJson;
}