import { useEffect, useState } from "react";
import SocialLink from "../social/SocialLink";
import { getSocials } from "../../services/socials";

export default function Footer({ settings = {} }) {
  const siteName = settings.site_name || "FreshKZ";
  const [socials, setSocials] = useState([]);

  useEffect(() => {
    getSocials().then((data) => setSocials(data.filter((social) => social.enabled))).catch(() => {});
  }, []);

  return (
    <footer className="border-t border-border py-10 mt-10">
      <div className="max-w-5xl mx-auto px-6 flex items-center justify-between text-sm text-muted">
        <div>© 2026 {siteName}</div>
        <div className="flex gap-5">
          {socials.map((social) => <SocialLink key={social.id} social={social} />)}
        </div>
      </div>
    </footer>
  );
}
