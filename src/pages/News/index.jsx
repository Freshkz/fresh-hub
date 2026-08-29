import { useEffect, useState } from "react";
import NewsItem from "../../components/news/NewsItem";
import { getNews } from "../../services/news";

export default function News() {
  const [news, setNews] = useState([]);

  useEffect(() => {
    getNews().then((data) => setNews(data.filter((n) => n.published))).catch(() => {});
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="font-display text-2xl font-semibold mb-8">Novedades</h1>
      <div className="bg-surface border border-border rounded-2xl px-5">
        {news.map((n) => <NewsItem key={n.id} item={n} />)}
      </div>
    </div>
  );
}
