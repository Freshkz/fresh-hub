import { useEffect, useState } from "react";
import { DEFAULT_SETTINGS, getSettings } from "../services/settings";

export default function useSiteSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    let active = true;

    getSettings()
      .then((data) => {
        if (active) setSettings(data);
      })
      .catch(() => {
        if (active) setSettings(DEFAULT_SETTINGS);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--site-accent", settings.primary_color || DEFAULT_SETTINGS.primary_color);
    root.style.setProperty("--site-accent-2", settings.secondary_color || DEFAULT_SETTINGS.secondary_color);

    document.title = settings.meta_title || "FreshKZ Hub";

    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = settings.meta_description || "";

    const socialTags = [
      ["property", "og:title", settings.meta_title || "Fresh Hub"],
      ["property", "og:description", settings.meta_description || ""],
      ["property", "og:image", settings.og_image_url || settings.avatar_url || "/favicon.svg"],
      ["name", "twitter:title", settings.meta_title || "Fresh Hub"],
      ["name", "twitter:description", settings.meta_description || ""],
      ["name", "twitter:image", settings.og_image_url || settings.avatar_url || "/favicon.svg"],
    ];
    socialTags.forEach(([attribute, key, content]) => {
      let tag = document.querySelector(`meta[${attribute}="${key}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(attribute, key);
        document.head.appendChild(tag);
      }
      tag.content = content;
    });

    let favicon = document.querySelector('link[rel="icon"]');
    if (!favicon) {
      favicon = document.createElement("link");
      favicon.rel = "icon";
      document.head.appendChild(favicon);
    }
    if (settings.favicon_url) {
      favicon.href = settings.favicon_url;
    }
  }, [settings]);

  return settings;
}
