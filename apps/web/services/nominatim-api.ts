import { CONFIG } from "@/config/config";
import { LocationResponse, NominatimProps } from "@/types/services";

export async function fetchNominatimAPI({latitude, longitude}: NominatimProps): Promise<LocationResponse> {
  const response = await fetch(`${CONFIG.urls.nominatim}?format=jsonv2&lat=${latitude}&lon=${longitude}`, {
    headers: {
      'User-Agent': 'CoreDash/1.0',
    },
    next: { revalidate: CONFIG.updateIntervalMs },
  });

  if (!response.ok) {
    console.log(response);
    throw new Error("Falha ao buscar dados da API externa 'Nominatim'");
  }

  const responseJson = await response.json();

  return responseJson;
}