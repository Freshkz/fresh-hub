import { useEffect, useState } from "react";
import { getCollaborators } from "../../services/collaborators";

export default function VisibleToPicker({ value = [], onChange }) {
  const [collaborators, setCollaborators] = useState([]);

  useEffect(() => {
    getCollaborators().then(setCollaborators).catch(() => setCollaborators([]));
  }, []);

  if (collaborators.length === 0) return null;

  const toggle = (email) => {
    if (value.includes(email)) onChange(value.filter((e) => e !== email));
    else onChange([...value, email]);
  };

  return (
    <div className="space-y-1.5 rounded-lg border border-border bg-surface2 px-3 py-2">
      <p className="text-xs text-muted">¿Quién más puede ver esto? (el Admin siempre puede, y vos también)</p>
      <div className="flex flex-wrap gap-2">
        {collaborators.map((c) => (
          <label
            key={c.id}
            className="flex items-center gap-1.5 text-xs bg-surface border border-border rounded-full px-2.5 py-1 cursor-pointer"
          >
            <input type="checkbox" checked={value.includes(c.email)} onChange={() => toggle(c.email)} />
            {c.display_name}
          </label>
        ))}
      </div>
    </div>
  );
}
