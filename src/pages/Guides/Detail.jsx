import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchGuideBySlug } from "../../services/guides";
import GuideContent from "../../components/guides/GuideContent";
import PrivateGate from "../../components/ui/PrivateGate";
import { useAuth } from "../../hooks/useAuth";
import useSiteSettings from "../../hooks/useSiteSettings";

export default function GuideDetailPage() {
  const { slug } = useParams();
  const { session } = useAuth();
  const settings = useSiteSettings();
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchGuideBySlug(slug).then(setGuide).finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <div className="mx-auto max-w-3xl px-6 py-16 text-sm text-muted">Cargando guía...</div>;
  }
  if (!guide) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link to="/guides" className="text-sm text-muted hover:text-text">← Volver a guías</Link>
        <p className="mt-4 text-sm text-muted">No encontramos esta guía.</p>
      </div>
    );
  }

  if (guide.is_private && !session) {
    return <PrivateGate backTo="/guides" backLabel="← Volver a guías" lockIcon={settings.private_lock_guides} />;
  }

  return (
    <article className="mx-auto max-w-4xl px-6 py-16">
      <Link to="/guides" className="text-sm text-muted hover:text-text">← Volver a guías</Link>
      <div className="mt-6">
        <GuideContent guide={guide} />
      </div>
    </article>
  );
}