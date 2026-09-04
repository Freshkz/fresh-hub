import { useEffect, useState } from "react";

export default function DiscordWidget({ serverId, discordUrl }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(serverId));

  useEffect(() => {
    if (!serverId) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    fetch(`https://discord.com/api/guilds/${serverId}/widget.json`)
      .then((res) => {
        if (!res.ok) throw new Error("Widget no disponible o deshabilitado en Discord");
        return res.json();
      })
      .then((json) => {
        if (isMounted) setData(json);
      })
      .catch((err) => {
        console.warn("No se pudieron cargar datos del widget de Discord:", err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [serverId]);

  const inviteUrl = data?.instant_invite || discordUrl || "#";
  const membersList = data?.members || [];

  const prettyCount = membersList.filter(
    (m) => !m.bot && !/cute helper/i.test(m.username || "")
  ).length;

  const helperCount = membersList.filter(
    (m) => m.bot || /cute helper/i.test(m.username || "") || /bot/i.test(m.status || "")
  ).length;

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 transition-all hover:border-accent/30 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#5865F2]/10 border border-[#5865F2]/20 flex items-center justify-center shrink-0 text-[#5865F2]">
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-accent uppercase tracking-wider mb-1">
              <span>Comunidad Discord</span>
              {data?.presence_count !== undefined && (
                <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] font-medium lowercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {data.presence_count} online
                </span>
              )}
              {membersList.length > 0 && (
                <>
                  <span className="bg-[#5865F2]/10 text-[#5865F2] border border-[#5865F2]/20 px-2 py-0.5 rounded-full text-[10px] font-medium">
                    🌸 {prettyCount > 0 ? prettyCount : membersList.length} Pretty Members
                  </span>
                  {helperCount > 0 && (
                    <span className="bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded-full text-[10px] font-medium">
                      🎀 {helperCount} Cute Helpers
                    </span>
                  )}
                </>
              )}
            </div>
            <h3 className="font-display text-lg font-semibold text-text">
              {data?.name || "Unite a nuestro servidor de Discord"}
            </h3>
            <p className="text-sm text-muted mt-0.5">
              Charlas, lanzamientos, soporte y comunidad en tiempo real.
            </p>
          </div>
        </div>
        <a
          href={inviteUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shrink-0 shadow-lg shadow-[#5865F2]/20"
        >
          <span>Entrar al Discord</span>
          <span>→</span>
        </a>
      </div>
    </div>
  );
}
