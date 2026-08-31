import { Code2, Gamepad2, Link2, MessageCircle, Music2 } from "lucide-react";

function InstagramIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

const ICONS = {
  Github: Code2,
  GitHub: Code2,
  Discord: MessageCircle,
  MessageCircle,
  Instagram: InstagramIcon,
  instagram: InstagramIcon,
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
