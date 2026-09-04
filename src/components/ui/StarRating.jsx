import { useState } from "react";

export default function StarRating({ ratingSum = 0, ratingCount = 0, onRate, interactive = true }) {
  const [hoverRating, setHoverRating] = useState(0);
  const [userVoted, setUserVoted] = useState(false);

  const average = ratingCount > 0 ? (ratingSum / ratingCount).toFixed(1) : 0;
  const currentRating = Math.round(average);

  const handleStarClick = (score) => {
    if (!interactive || userVoted || !onRate) return;
    setUserVoted(true);
    onRate(score);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= (hoverRating || currentRating);
          return (
            <button
              key={star}
              type="button"
              disabled={!interactive || userVoted}
              onMouseEnter={() => interactive && !userVoted && setHoverRating(star)}
              onMouseLeave={() => interactive && !userVoted && setHoverRating(0)}
              onClick={() => handleStarClick(star)}
              className={`text-base transition-transform ${
                interactive && !userVoted ? "cursor-pointer hover:scale-125" : "cursor-default"
              } ${isFilled ? "text-amber-400" : "text-border"}`}
              title={`${star} estrella${star > 1 ? "s" : ""}`}
            >
              ★
            </button>
          );
        })}
      </div>
      <span className="text-xs font-mono text-muted">
        {average > 0 ? `${average} (${ratingCount})` : "Sin votos"}
      </span>
      {userVoted && <span className="text-[10px] text-emerald-400 font-medium ml-1">¡Gracias!</span>}
    </div>
  );
}
