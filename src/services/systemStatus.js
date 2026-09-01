import { supabase } from "./supabaseClient";

const defaultServices = [
  {
    id: "fresh-hub",
    name: "Fresh Hub",
    description: "Centro principal del ecosistema Fresh.",
    type: "supabase",
    href: "/",
    thumbnail: "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: "cupons",
    name: "Cupons",
    description: "Cupones, ofertas y novedades.",
    url: import.meta.env.VITE_CUPONS_STATUS_URL || "https://freshkz.github.io/Cupons/",
    href: import.meta.env.VITE_CUPONS_STATUS_URL || "https://freshkz.github.io/Cupons/",
    thumbnail: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: "ai-stylist",
    name: "AI Stylist",
    description: "Tu aplicación de estilismo con IA.",
    url: import.meta.env.VITE_AI_STYLIST_STATUS_URL || "https://ai-stylist-v56o.onrender.com/",
    href: import.meta.env.VITE_AI_STYLIST_STATUS_URL || "https://ai-stylist-v56o.onrender.com/",
    thumbnail: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=700&q=80",
  },
];

function getConfiguredServices(settings = {}) {
  const thumbnailKeys = {
    "fresh-hub": "ecosystem_fresh_thumbnail",
    cupons: "ecosystem_cupons_thumbnail",
    "ai-stylist": "ecosystem_ai_stylist_thumbnail",
  };
  return defaultServices.map((service) => ({
    ...service,
    thumbnail: settings[thumbnailKeys[service.id]] || service.thumbnail,
  }));
}

function timeoutSignal(ms) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, cleanup: () => window.clearTimeout(timer) };
}

async function checkService(service) {
  if (service.type === "supabase") {
    const { error } = await supabase.from("projects").select("id").limit(1);
    return { ...service, status: error ? "degraded" : "online", detail: error ? "Base de datos con problemas" : "Operativo" };
  }

  if (!service.url) {
    return { ...service, status: "pending", detail: "URL pendiente de configurar" };
  }

  const { signal, cleanup } = timeoutSignal(7000);
  try {
    await fetch(service.url, { method: "HEAD", mode: "no-cors", signal });
    return { ...service, status: "online", detail: "Sitio accesible" };
  } catch {
    return { ...service, status: "offline", detail: "No responde en este momento" };
  } finally {
    cleanup();
  }
}

export async function getSystemStatus(settings = {}) {
  const checkedAt = new Date().toISOString();
  const services = await Promise.all(getConfiguredServices(settings).map(checkService));
  return { checkedAt, services };
}
