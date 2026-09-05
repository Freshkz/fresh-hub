export default function GuideContent({ guide }) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-border bg-surface">
      <img src={guide.image} alt={guide.title} className="h-64 w-full object-cover" />
      <div className="p-6 md:p-8">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-border bg-surface2 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
            {(guide.tags && guide.tags[0]) || "General"}
          </span>
          {(guide.categories || []).map((category) => (
            <span key={category} className="rounded-full border border-accent2/40 bg-accent2/10 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-accent2">
              {category}
            </span>
          ))}
        </div>

        <h1 className="font-display text-3xl font-semibold">{guide.title}</h1>
        <p className="mt-4 text-base leading-7 text-muted">{guide.summary}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {(guide.tags || []).slice(1).map((tag) => (
            <span key={tag} className="rounded-full border border-border bg-surface2 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-8 space-y-6">
          {guide.parts?.filter((part) => part.title).length > 1 && (
            <nav className="rounded-2xl border border-border bg-surface2 p-5">
              <h2 className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-accent2">Contenido</h2>
              <ol className="space-y-1.5">
                {guide.parts.map((part, index) =>
                  part.title ? (
                    <li key={`toc-${index}`}>
                      <a href={`#seccion-${index}`} className="text-sm text-muted hover:text-accent transition-colors">
                        {index + 1}. {part.title}
                      </a>
                    </li>
                  ) : null
                )}
              </ol>
            </nav>
          )}

          {guide.parts?.map((part, index) => (
            <section
              key={`${part.type}-${index}`}
              id={`seccion-${index}`}
              className={part.type === "image" ? "overflow-hidden rounded-2xl border border-border bg-surface2 scroll-mt-24" : part.type === "quote" ? "rounded-2xl border border-accent/30 bg-accent/10 p-5 text-base leading-8 text-text scroll-mt-24" : "rounded-2xl border border-border bg-surface2 p-5 text-sm leading-7 text-muted scroll-mt-24"}
            >
              {part.title && <h2 className="mb-3 font-display text-lg font-semibold text-text">{index + 1}. {part.title}</h2>}
              {part.type === "image" ? (
                <>
                  {part.url && <img src={part.url} alt={part.caption || part.title || guide.title} className="max-h-[620px] w-full object-contain" />}
                  {part.caption && <p className="p-4 text-sm text-muted">{part.caption}</p>}
                </>
              ) : (
                <p className="whitespace-pre-line">{part.content}</p>
              )}
            </section>
          ))}
        </div>

        {guide.links?.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-accent2">Links relacionados</h2>
            <div className="flex flex-wrap gap-3">
              {guide.links.map((link) => (
                <a key={link.label} href={link.url} target="_blank" rel="noreferrer" className="rounded-full border border-border bg-surface2 px-3 py-2 text-sm text-text hover:border-accent/45">
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}