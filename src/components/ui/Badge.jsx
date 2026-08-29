export default function Badge({ children, featured = false }) {
  return (
    <span
      className={`font-mono text-xs px-2 py-1 rounded-md border ${
        featured
          ? "text-accent border-accent/35 bg-accent/10"
          : "text-muted border-border"
      }`}
    >
      {children}
    </span>
  );
}
