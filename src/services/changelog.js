export const changelogEntries = [
  {
    version: "v1.4.2",
    date: "2026-08-31",
    title: "FreshKZ Hub visual refresh",
    summary: "Nueva capa visual premium, cards más interactivas y mejor jerarquía de contenido.",
    added: [
      "Hero con entrada premium y glow",
      "Cards reutilizables para proyectos, descargas y novedades",
      "Soporte para motion reducido en equipos con accesibilidad",
      "Mejor experiencia de hover y feedback visual",
    ],
    fixed: [
      "Ajuste de contrast y bordes en cards",
      "Corrección de estados vacíos y mensajes de carga",
    ],
    changed: [
      "Estilo visual modernizado para la home",
      "Diseño más consistente en la navegación y widgets",
    ],
  },
  {
    version: "v1.4.1",
    date: "2026-08-30",
    title: "Admin settings and routing cleanup",
    summary: "Se corrigió la capa de configuración del sitio y la navegación pública bajo GitHub Pages.",
    added: [
      "Detalle de proyectos, descargas y noticias",
      "Búsqueda y filtros para listados públicos",
      "Dashboard con métricas básicas",
    ],
    fixed: [
      "Routing de GitHub Pages corregido",
      "Links de descarga/proyectos navegables",
      "Problemas del admin al abrir rutas principales",
    ],
    changed: [
      "Se reorganizó la experiencia del panel admin",
      "Contenido de home conectado a datos reales",
    ],
  },
  {
    version: "v1.4.0",
    date: "2026-08-28",
    title: "Public Hub MVP",
    summary: "Primera versión pública del hub con contenido gestionable desde Supabase.",
    added: [
      "Home pública con proyectos y descargas",
      "CMS básico para proyectos, noticias y redes sociales",
      "Autenticación del admin con Supabase",
    ],
    fixed: [
      "Corrección del deploy de GitHub Pages",
      "Ajuste de rutas y publicación bajo /fresh-hub",
    ],
    changed: [
      "Estructura del proyecto preparada para seguir creciendo",
      "Contenido migrado a un modelo más reutilizable",
    ],
  },
];
