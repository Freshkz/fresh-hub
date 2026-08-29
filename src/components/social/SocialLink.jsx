import * as Icons from "lucide-react";
import { Link2 } from "lucide-react";

export default function SocialLink({ social }) {
  // Buscamos el componente de ícono por el nombre guardado en la base de datos.
  // Si no existe ese nombre en la librería, usamos un ícono genérico (Link2) para no romper nada.
  const IconComponent = Icons[social.icon] || Link2;

  return (
    <a
      href={social.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 text-sm text-muted hover:text-text transition-colors"
    >
      <IconComponent size={18} />
      {social.name}
    </a>
  );
}
