import { getSettings } from "./settings";

const TYPE_DEFAULTS = {
  "Proyecto": { emoji: "🧩", color: 0x7C5CFF, webhookKey: "discord_webhook_url_projects" },
  "Descarga": { emoji: "📥", color: 0x33E6B0, webhookKey: "discord_webhook_url_downloads" },
  "Novedad": { emoji: "📰", color: 0x5865F2, webhookKey: "discord_webhook_url_news" },
  "Guía": { emoji: "📖", color: 0xFFB020, webhookKey: "discord_webhook_url_guides" },
  "Publicación": { emoji: "📌", color: 0x7C5CFF, webhookKey: null },
};

/**
 * Envia una notificación a Discord a través de un Webhook configurado.
 * @param {Object} payload
 * @param {string} payload.title - Título del embed
 * @param {string} [payload.description] - Descripción o resumen del contenido
 * @param {string} [payload.url] - Link directo al contenido en el Hub
 * @param {string} [payload.imageUrl] - Imagen grande (miniatura del contenido)
 * @param {string} [payload.thumbnailUrl] - Ícono chico en la esquina del embed (por defecto, el avatar del sitio)
 * @param {number} [payload.color] - Color decimal del borde (si no se pasa, usa el default de "type")
 * @param {string} [payload.type] - Tipo de contenido ("Proyecto", "Descarga", "Novedad", "Guía")
 * @param {string} [payload.authorName] - Nombre de quien lo creó
 * @param {string} [payload.authorAvatarUrl] - Avatar de quien lo creó
 * @param {Array<{name: string, value: string, inline?: boolean}>} [payload.fields] - Datos extra en formato tabla (versión, tamaño, tecnologías, etc.)
 */
export async function sendDiscordNotification({
  title,
  description = "",
  url = "",
  imageUrl = "",
  thumbnailUrl = "",
  color,
  type = "Publicación",
  authorName = "",
  authorAvatarUrl = "",
  fields = [],
}) {
  try {
    const settings = await getSettings().catch(() => ({}));
    const typeDefaults = TYPE_DEFAULTS[type] || TYPE_DEFAULTS["Publicación"];

    // Prioridad: webhook específico de la sección > webhook general > variable de entorno
    const webhookUrl =
      (typeDefaults.webhookKey && settings?.[typeDefaults.webhookKey]) ||
      settings?.discord_webhook_url ||
      import.meta.env.VITE_DISCORD_WEBHOOK_URL;

    if (!webhookUrl || !webhookUrl.startsWith("http")) {
      console.log("Discord Webhook no configurado o no válido.");
      return false;
    }

    const embed = {
      title: `${typeDefaults.emoji} Nuevo ${type}: ${title}`,
      description: description.length > 300 ? description.substring(0, 300) + "..." : description,
      color: color ?? typeDefaults.color,
      timestamp: new Date().toISOString(),
      footer: {
        text: settings?.site_name || "FreshKZ Hub",
        icon_url: settings?.avatar_url || undefined,
      },
    };

    if (url) embed.url = url;
    if (imageUrl) embed.image = { url: imageUrl };
    if (thumbnailUrl || settings?.avatar_url) {
      embed.thumbnail = { url: thumbnailUrl || settings.avatar_url };
    }
    if (authorName) {
      embed.author = { name: authorName, icon_url: authorAvatarUrl || undefined };
    }
    if (fields.length > 0) {
      embed.fields = fields.filter((f) => f.value).slice(0, 25);
    }

    const basePayload = { embeds: [embed] };

    let response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(basePayload),
    });

    // Si el Webhook apunta a un canal de Foro, Discord rechaza el mensaje y
    // pide un "thread_name" para crear el post. Reintentamos automáticamente
    // usando el título como nombre del nuevo post del foro.
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const needsThreadName = JSON.stringify(errorBody).toLowerCase().includes("thread_name");

      if (needsThreadName) {
        const threadName = title.length > 90 ? `${title.slice(0, 87)}...` : title;
        response = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...basePayload, thread_name: threadName }),
        });
      }
    }

    return response.ok;
  } catch (err) {
    console.warn("No se pudo enviar la notificación a Discord:", err.message);
    return false;
  }
}
