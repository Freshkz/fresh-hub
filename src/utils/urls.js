// Solo links http/https: evita que un valor guardado tipo "javascript:..." se
// convierta en un link clickeable.
export function isSafeExternalUrl(url) {
  return typeof url === "string" && /^https?:\/\//i.test(url.trim());
}
