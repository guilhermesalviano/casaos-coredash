"use client";

import { useEffect, useRef, useState } from "react";
import SectionTitle from "../sectionTitle";
import Card from "../card";
import { useStatus } from "@/contexts/statusContext";
import { memo } from "react";

const NewsCard = memo(function NewsCard() {
  const [news, setNews] = useState<any>(null);
  const { reportStatus } = useStatus();
  const lastFetchRef = useRef<number>(0);
  
  useEffect(() => {
    const now = Date.now();
    if (now - lastFetchRef.current < 1000) return;
    lastFetchRef.current = now;

    const fetchNews = () => {
      fetch("/api/news")
        .then((res) => {
          if (!res.ok) throw new Error(`Erro do servidor: ${res.status}`);
          return res.json();
        })
        .then((data) => {
          setNews(data.data);
          reportStatus("news", "success");
        }).catch(() => {
          reportStatus("news", "error");
        });
    }

    fetchNews();
    const interval = setInterval(fetchNews, 1200000); // 1200000 = 20 min = 2 * 10 * 60 * 1000 milisseconds

    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <SectionTitle>📰 Últimas Notícias</SectionTitle>
      <div className="news-list">
        {news?.map((n: any) => (
          <div key={n.id} className="news-item cursor-pointer" onClick={() => window.open(n.url, "_blank")}>
            <span className="news-tag">{n.tag}</span>
            <div>
              <div className="news-title">{n.title}</div>
              <div className="news-source">{n.source}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
})

export default NewsCard;