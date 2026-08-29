export default function Footer({ settings = {} }) {
  const siteName = settings.site_name || "FreshKZ";

  return (
    <footer className="border-t border-border py-10 mt-10">
      <div className="max-w-5xl mx-auto px-6 flex items-center justify-between text-sm text-muted">
        <div>© 2026 {siteName}</div>
        <div className="flex gap-5">
          <a href="#" className="hover:text-text">GitHub</a>
          <a href="#" className="hover:text-text">Discord</a>
          <a href="#" className="hover:text-text">TikTok</a>
          <a href="#" className="hover:text-text">Steam</a>
        </div>
      </div>
    </footer>
  );
}
