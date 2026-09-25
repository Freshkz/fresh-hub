import { supabase } from "./supabaseClient";

// "Cards tapadas": contenido exclusivo que el usuario no puede ver. La base solo
// manda título, imagen, categoría y fecha (ver supabase/private-teasers-migration.sql);
// la card se dibuja borrosa con el candado (PrivateLock) y no se puede abrir.
async function fetchPrivateTeasers(contentType) {
  const { data, error } = await supabase.rpc("private_teasers", { content_type: contentType });
  if (error) {
    // Si falla, el listado normal se muestra igual: las cards tapadas son un extra.
    console.warn(`No se pudieron cargar las cards privadas de ${contentType}:`, error.message);
    return [];
  }
  return data || [];
}

/**
 * Suma las cards tapadas a un listado ya cargado y reordena por fecha.
 * @param {Array} items - Filas que el usuario sí puede ver
 * @param {"downloads"|"projects"|"news"|"guides"} contentType
 * @param {(teaser) => Object} toItem - Adapta la fila mínima a la forma que espera la card
 * @param {string} dateKey - Campo de fecha por el que se ordena el listado
 */
export async function withPrivateTeasers(items, contentType, toItem, dateKey) {
  const teasers = await fetchPrivateTeasers(contentType);
  if (teasers.length === 0) return items;

  const teaserItems = teasers.map((teaser) => ({
    ...toItem(teaser),
    is_private: true,
    is_teaser: true,
    visible_to: [],
  }));
  return [...items, ...teaserItems].sort((a, b) => new Date(b[dateKey] || 0) - new Date(a[dateKey] || 0));
}
