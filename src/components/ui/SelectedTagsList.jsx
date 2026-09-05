export default function SelectedTagsList({ tags = [], onRemove }) {
  if (!tags.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5 rounded-xl border border-border bg-surface p-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/20 px-2.5 py-1 text-xs font-semibold text-accent"
        >
          <span>{tag}</span>
          <button type="button" onClick={() => onRemove(tag)} className="hover:text-white transition-colors">
            ✕
          </button>
        </span>
      ))}
    </div>
  );
}