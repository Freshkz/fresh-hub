import { supabase } from "./supabaseClient";

export const guideCategories = ["Minecraft", "CS2", "Stardew Valley", , "Roblox", "Invincible: Guarding the Globe ", "General"];

export const guidesSeed = [
  {
    id: "guide-minecraft-1",
    title: "Guía rápida de farm y recursos",
    slug: "guia-rapida-farm-recursos",
    game: "Minecraft",
    summary: "Farm eficiente, minas, auto-colección y rutas de materiales clave.",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=900&q=80",
    tags: ["Minecraft", "Recursos", "Farm"],
    published: true,
    createdAt: "2026-08-30T12:00:00.000Z",
    links: [
      { label: "Video guía", url: "https://www.youtube.com/" },
      { label: "Modpack recomendado", url: "https://modrinth.com/" },
    ],
    parts: [
      { type: "text", content: "Empieza con una ruta corta de madera, piedra y carbón para llegar al midgame rápido." },
      { type: "text", content: "Usa una mina vertical con lava y lava bucket solo si ya tenés suficientes herramientas." },
      { type: "text", content: "Farm de 2x2 de cultivo en torno a una granja central si querés sostener recursos sostenidamente." },
    ],
  },
  {
    id: "guide-cs2-1",
    title: "Configuración de crosshair y movimiento",
    slug: "configuracion-crosshair-movimiento",
    game: "CS2",
    summary: "Ajustes simples que mejoran la precisión y la comodidad en partidas competitivas.",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=900&q=80",
    tags: ["CS2", "Aiming", "Configuración"],
    published: true,
    createdAt: "2026-08-27T11:00:00.000Z",
    links: [
      { label: "Guía de rendimiento", url: "https://www.youtube.com/" },
      { label: "Tienda de configs", url: "https://www.google.com/" },
    ],
    parts: [
      { type: "text", content: "Usá un crosshair limpio, de tamaño medio y sin demasiada sombra para no distraer la vista." },
      { type: "text", content: "Ajustá sensibilidad en base a tu preferencia, pero manteniendo un mínimo de estabilidad en flicks." },
      { type: "text", content: "El movimiento debe ser consistente: pegs, strafes y angulo de la cámara controlados, no improvisados." },
    ],
  },
  {
    id: "guide-stardew-1",
    title: "Primer año en Stardew Valley",
    slug: "primer-ano-stardew-valley",
    game: "Stardew Valley",
    summary: "Todo lo importante para crecer bien tu granja y no perder tiempo de valor.",
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=80",
    tags: ["Stardew Valley", "Granjas", "Guía"],
    published: true,
    createdAt: "2026-08-24T09:00:00.000Z",
    links: [
      { label: "Wiki de recursos", url: "https://stardewvalleywiki.com/" },
      { label: "Guía de calendario", url: "https://stardewvalleywiki.com/Calendar" },
    ],
    parts: [
      { type: "text", content: "Priorizá semillas, madera y un par de animales en el primer mes para sostener tu economía." },
      { type: "text", content: "La granja debe abrirse con espacio para huerto, riego y una zona de cultivo central eficiente." },
      { type: "text", content: "No te olvides de las minas y de los cofres para la progresión a partir del segundo tramo del año." },
    ],
  },
];

const STORAGE_KEY = "freshkz-guides-local";

function normalizeGuide(raw = {}) {
  return {
    id: raw.id || `${raw.slug || raw.title || "guide"}-${Date.now()}`,
    slug: raw.slug || (raw.title || "guia").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    title: raw.title || "Nueva guía",
    summary: raw.summary || "",
    game: raw.game || "General",
    image: raw.image || raw.image_url || "",
    tags: Array.isArray(raw.tags) ? raw.tags : typeof raw.tags === "string" ? raw.tags.split(",").map((tag) => tag.trim()).filter(Boolean) : [],
    links: Array.isArray(raw.links) ? raw.links : [],
    parts: Array.isArray(raw.parts) ? raw.parts : (raw.content ? [{ type: "text", content: raw.content }] : []),
    published: raw.published !== false,
    featured: Boolean(raw.featured),
    createdAt: raw.createdAt || raw.created_at || new Date().toISOString(),
  };
}

function readLocalGuides() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return guidesSeed.map(normalizeGuide);
    return JSON.parse(raw).map(normalizeGuide);
  } catch {
    return guidesSeed.map(normalizeGuide);
  }
}

function writeLocalGuides(list) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore storage errors
  }
}

function sortGuides(list) {
  return [...list].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

export function getGuides() {
  return sortGuides(readLocalGuides().filter((guide) => guide.published !== false));
}

export async function fetchGuides({ includeDrafts = false } = {}) {
  try {
    const { data, error } = await supabase.from("guides").select("*").order("created_at", { ascending: false });
    if (!error && Array.isArray(data)) {
      const normalized = data.map(normalizeGuide).filter((item) => includeDrafts || item.published !== false);
      writeLocalGuides(normalized);
      return sortGuides(normalized);
    }
  } catch {
    // fallback to local storage / seed below
  }

  const localGuides = readLocalGuides();
  return sortGuides(includeDrafts ? localGuides : localGuides.filter((guide) => guide.published !== false));
}

export function getGuideBySlug(slug) {
  return getGuides().find((guide) => guide.slug === slug) || null;
}

export async function fetchGuideBySlug(slug) {
  const list = await fetchGuides();
  return list.find((guide) => guide.slug === slug) || null;
}

export async function createGuide(payload) {
  const normalized = normalizeGuide(payload);
  try {
    const { data, error } = await supabase.from("guides").insert({
      slug: normalized.slug,
      title: normalized.title,
      summary: normalized.summary,
      game: normalized.game,
      image_url: normalized.image,
      tags: normalized.tags,
      links: normalized.links,
      parts: normalized.parts,
      created_at: normalized.createdAt,
      published: normalized.published,
      featured: normalized.featured,
    }).select().single();
    if (!error && data) {
      const saved = normalizeGuide(data);
      writeLocalGuides(sortGuides([saved, ...readLocalGuides().filter((guide) => guide.id !== saved.id)]));
      return saved;
    }
  } catch {
    // fallback
  }

  const list = readLocalGuides();
  const updated = sortGuides([normalizeGuide(payload), ...list]);
  writeLocalGuides(updated);
  return normalizeGuide(payload);
}

export async function updateGuide(id, payload) {
  const normalized = normalizeGuide({ ...payload, id });
  try {
    const { data, error } = await supabase.from("guides").update({
      slug: normalized.slug,
      title: normalized.title,
      summary: normalized.summary,
      game: normalized.game,
      image_url: normalized.image,
      tags: normalized.tags,
      links: normalized.links,
      parts: normalized.parts,
      created_at: normalized.createdAt,
      published: normalized.published,
      featured: normalized.featured,
    }).eq("id", id).select().single();
    if (!error && data) {
      const saved = normalizeGuide(data);
      writeLocalGuides(sortGuides(readLocalGuides().map((guide) => (guide.id === id ? saved : guide))));
      return saved;
    }
  } catch {
    // fallback
  }

  const list = readLocalGuides().map((guide) => (guide.id === id ? normalizeGuide({ ...guide, ...payload, id }) : guide));
  writeLocalGuides(sortGuides(list));
  return normalizeGuide({ ...payload, id });
}

export async function deleteGuide(id) {
  try {
    const { error } = await supabase.from("guides").delete().eq("id", id);
    if (!error) {
      writeLocalGuides(readLocalGuides().filter((guide) => guide.id !== id));
      return;
    }
  } catch {
    // fallback
  }

  const list = readLocalGuides().filter((guide) => guide.id !== id);
  writeLocalGuides(sortGuides(list));
}
