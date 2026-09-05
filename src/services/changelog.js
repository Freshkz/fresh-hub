export const changelogEntries = [


    {
    version: "v1.5.0",
    date: "2026-09-05",
    title: "App instalable (PWA) y mejoras de mobile",
    summary: "El hub ahora se puede instalar como app en el celular, se agregó navegación mobile completa, y se extendió la vista previa del Admin a Proyectos y Descargas.",
    added: [
      "Soporte PWA: el sitio se puede instalar en el celular o la compu como una app, con ícono propio y funcionamiento offline básico",
      "Menú de navegación mobile (antes los links de Descargas, Proyectos, Novedades, etc. no se podían abrir en celular)",
      "Vista previa (miniatura y página completa) agregada a Projects Admin y Downloads Admin, igual que ya tenía Guides",
    ],
    fixed: [
      "Bug de PWA en iOS que impedía tocar el navbar (Dashboard/Admin) al quedar tapado por la barra de estado del sistema",
      "Columna de vista previa en Guides Admin ocupaba demasiado espacio; se redujo su tamaño",
    ],
    changed: [
      "Botones y miniaturas de la vista previa en Admin ahora son más compactos en todas las secciones",
    ],
  },
  
  {
    version: "v1.4.3",
    date: "2026-09-04",
    title: "Subida de archivos grandes a R2 y fixes de Admin",
    summary: "Migración completa a subida directa a Cloudflare R2 con URLs prefirmadas, sin límite de tamaño del proxy, más varias correcciones en el panel de Admin.",
    added: [
      "Subida de archivos a R2 vía URLs prefirmadas (sin límite de 100/200 MB del proxy de Cloudflare)",
      "Worker de Cloudflare con endpoint /presign para firmar subidas directas a R2",
      "Modal de confirmación estilizado para eliminar descargas, reemplazando el cartel nativo del navegador",
    ],
    fixed: [
      "Eliminación de archivos en R2 ya no falla en silencio: ahora muestra el motivo exacto si algo sale mal",
      "Se corrigió un conflicto de nombres que hacía que /admin/dashboard mostrara el panel de Downloads",
      "El botón de crear descarga ya no se puede tocar mientras el archivo todavía se está subiendo",
    ],
    changed: [
      "CORS configurado en el bucket de R2 para permitir subidas directas desde el navegador",
    ],
  },


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
