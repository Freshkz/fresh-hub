import { useState } from "react";

/**
 * Estrellas de una descarga. Con `onRate` se puede votar (y cambiar el voto);
 * `userScore` es el voto que ya dio el usuario (0 = todavía no votó).
 * `onRate` puede ser async: mientras guarda, las estrellas quedan bloqueadas.
 */
export default function StarRating({ ratingSum = 0, ratingCount = 0, userScore = 0, onRate, interactive = true }) {
  const [hoverRating, setHoverRating] = useState(0);
  const [saving, setSaving] = useState(false);

  const canRate = interactive && Boolean(onRate) && !saving;
  const average = ratingCount > 0 ? ratingSum / ratingCount : 0;
  const shownRating = hoverRating || userScore || Math.round(average);

  const handleStarClick = async (score) => {
    if (!canRate || score === userScore) return;
    setSaving(true);
    try {
      await onRate(score);
    } finally {
      setSaving(false);
      setHoverRating(0);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!canRate}
            onMouseEnter={() => canRate && setHoverRating(star)}
            onClick={() => handleStarClick(star)}
            className={`text-base transition-transform ${canRate ? "cursor-pointer hover:scale-125" : "cursor-default"} ${
              star <= shownRating ? "text-amber-400" : "text-border"
            }`}
            title={`${star} estrella${star > 1 ? "s" : ""}`}
          >
            ★
          </button>
        ))}
      </div>
      <span className="text-xs font-mono text-muted">
        {average > 0 ? `${average.toFixed(1)} (${ratingCount})` : "Sin votos"}
      </span>
      {interactive && userScore > 0 && (
        <span className="text-[10px] text-emerald-400 font-medium ml-1">
          {saving ? "Guardando..." : `Tu voto: ${userScore}★`}
        </span>
      )}
    </div>
  );
}
