import { getSettings } from "./settings";

/**
 * Envia una notificación a Discord a través de un Webhook configurado.
 * @param {Object} payload
 * @param {string} payload.title - Título del embed
 * @param {string} [payload.description] - Descripción o resumen del contenido
 * @param {string} [payload.url] - Link directo al contenido en el Hub
 * @param {string} [payload.imageUrl] - Imagen en miniatura
 * @param {number} [payload.color] - Color decimal del borde (default: morado 0x7C5CFF)
 * @param {string} [payload.type] - Tipo de contenido ("Proyecto", "Descarga", "Novedad", "Guía")
 * @param {string} [payload.author] - Nombre del autor o creador
 */
export async function sendDiscordNotification({
  title,
  description = "",
  url = "",
  imageUrl = "",
  color = 0x7C5CFF,
  type = "Publicación",
  author = "",
}) {
  try {
    const settings = await getSettings().catch(() => ({}));
    const webhookUrl =
      settings?.discord_webhook_url || import.meta.env.VITE_DISCORD_WEBHOOK_URL;

    if (!webhookUrl || !webhookUrl.startsWith("http")) {
      console.log("Discord Webhook no configurado o no válido.");
      return false;
    }

    const embed = {
      title: `📌 Nuevo ${type}: ${title}`,
      description: description.length > 300 ? description.substring(0, 300) + "..." : description,
      color: color,
      timestamp: new Date().toISOString(),
      footer: {
        text: "FreshKZ Hub",
      },
    };

    if (url) embed.url = url;
    if (imageUrl) embed.image = { url: imageUrl };
    if (author) embed.author = { name: author };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [embed],
      }),
    });

    return response.ok;
  } catch (err) {
    console.warn("No se pudo enviar la notificación a Discord:", err.message);
    return false;
  }
}
