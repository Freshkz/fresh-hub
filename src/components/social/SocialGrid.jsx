import { useEffect, useState } from "react";
import SocialLink from "./SocialLink";
import { getSocials } from "../../services/socials";

export default function SocialGrid() {
  const [socials, setSocials] = useState([]);

  useEffect(() => {
    getSocials().then((data) => setSocials(data.filter((s) => s.enabled))).catch(() => {});
  }, []);

  if (socials.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-5 justify-center">
      {socials.map((s) => (
        <SocialLink key={s.id} social={s} />
      ))}
    </div>
  );
}
