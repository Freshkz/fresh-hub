import { useEffect, useState } from "react";
import DownloadCard from "../../components/downloads/DownloadCard";
import { getDownloads } from "../../services/downloads";

export default function Downloads() {
  const [downloads, setDownloads] = useState([]);

  useEffect(() => {
    getDownloads().then(setDownloads).catch(() => {});
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="font-display text-2xl font-semibold mb-8">Descargas</h1>
      <div className="grid md:grid-cols-3 gap-4">
        {downloads.map((d) => <DownloadCard key={d.id} item={d} />)}
      </div>
    </div>
  );
}
