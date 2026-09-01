import { supabase } from "./supabaseClient";

const configuredServices = [
  {
    id: "fresh-hub",
    name: "Fresh Hub",
    description: "Centro principal del ecosistema Fresh.",
    type: "supabase",
  },
  {
    id: "cupons",
    name: "Cupons",
    description: "Cupones, ofertas y novedades.",
    url: import.meta.env.VITE_CUPONS_STATUS_URL || "https://freshkz.github.io/Cupons/",
  },
  {
    id: "ai-stylist",
    name: "AI Stylist",
    description: "Tu aplicación de estilismo con IA.",
    url: import.meta.env.VITE_AI_STYLIST_STATUS_URL || "https://ai-stylist-v56o.onrender.com/",
  },
];

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

export async function getSystemStatus() {
  const checkedAt = new Date().toISOString();
  const services = await Promise.all(configuredServices.map(checkService));
  return { checkedAt, services };
}
