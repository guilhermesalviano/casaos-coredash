"use client";

import { useDashboard } from "@/hooks/useDashboard";
import Card from "../card";

const RAIN_CODES = new Set([51,53,55,56,57,61,63,65,66,67,80,81,82,85,86,95,96,99]);
const isRaining = (code: number) => RAIN_CODES.has(code);

export default function WeatherCard() {
  const { weather } = useDashboard();

  if (weather.status === "idle" || weather.status === "loading") {
    return <Card className="weather-card">Carregando clima...</Card>;
  }

  if (weather.status === "error" || !weather.data) {
    return <Card className="weather-card">Erro na busca de dados, tente novamente.</Card>;
  }
  
  const w = weather.data;
  const raining = isRaining(w.code);

  return (
    <Card className={raining ? "weather-card--raining" : "weather-card"}>
      <div className="weather-main">
        <div>
          <div className="weather-city">{w.city}</div>
          <div className="weather-temp">{w.temp}°</div>
          <div className="weather-condition">{w.condition}</div>
          <div className="weather-feels">Sensação {w.feels}°C</div>
        </div>
        <div className="weather-icon-big">{w.icon}</div>
      </div>
      <div className="weather-hours">
        {w.forecast?.slice(0, 6).map((h: any) => (
          <div key={h.time} className={`weather-hour ${isRaining(h.code) ? "weather-hour--raining" : ""}`}>
            <span className="weather-hour-time">{h.time}</span>
            <span>{h.icon}</span>
            <span className="weather-hour-temp">{h.temp}°</span>
          </div>
        ))}
      </div>
    </Card>
  );
}