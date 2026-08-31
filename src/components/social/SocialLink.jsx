import { Code2, Gamepad2, Link2, MessageCircle, Music2 } from "lucide-react";

const ICONS = {
  Github: Code2,
  GitHub: Code2,
  Discord: MessageCircle,
  MessageCircle,
  TikTok: Music2,
  Steam: Gamepad2,
};

export default function SocialLink({ social }) {
  const IconComponent = ICONS[social.icon] || Link2;

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
