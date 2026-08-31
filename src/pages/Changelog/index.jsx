import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { changelogEntries } from "../../services/changelog";

export default function ChangelogPage() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-8 flex items-center justify-between gap-3">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.18em] text-accent">Changelog</div>
          <h1 className="mt-2 font-display text-3xl font-semibold">Versiones y mejoras</h1>
        </div>
        <Link to="/" className="text-sm text-muted hover:text-text">← Volver</Link>
      </div>

      <div className="space-y-6">
        {changelogEntries.map((entry, index) => (
          <motion.article
            key={entry.version}
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.24, delay: index * 0.06 }}
            className="rounded-[26px] border border-border bg-surface p-5 md:p-7"
          >
            <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-mono text-xs uppercase tracking-[0.2em] text-accent2">{entry.version}</div>
                <h2 className="mt-2 text-xl font-semibold text-text">{entry.title}</h2>
              </div>
              <span className="font-mono text-[11px] text-muted">{entry.date}</span>
            </div>

            <p className="mb-5 text-sm leading-6 text-muted">{entry.summary}</p>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <h3 className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-accent">Added</h3>
                <ul className="space-y-2 text-sm text-muted">
                  {entry.added.map((item) => <li key={item}>+ {item}</li>)}
                </ul>
              </div>
              <div>
                <h3 className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-accent2">Changed</h3>
                <ul className="space-y-2 text-sm text-muted">
                  {entry.changed.map((item) => <li key={item}>≈ {item}</li>)}
                </ul>
              </div>
              <div>
                <h3 className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-red-300">Fixed</h3>
                <ul className="space-y-2 text-sm text-muted">
                  {entry.fixed.map((item) => <li key={item}>- {item}</li>)}
                </ul>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
