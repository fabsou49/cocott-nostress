"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface StarRatingProps {
  value: number;
  max?: number;
  interactive?: boolean;
  onChange?: (value: number) => void;
  size?: "sm" | "md" | "lg";
}

export function StarRating({
  value,
  max = 5,
  interactive = false,
  onChange,
  size = "md",
}: StarRatingProps) {
  const sizeClasses = {
    sm: "w-3.5 h-3.5",
    md: "w-5 h-5",
    lg: "w-7 h-7",
  };

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type={interactive ? "button" : undefined}
          onClick={interactive && onChange ? () => onChange(star) : undefined}
          className={cn(
            "transition-transform",
            interactive && "cursor-pointer hover:scale-110",
            !interactive && "cursor-default"
          )}
          disabled={!interactive}
        >
          <Star
            className={cn(
              sizeClasses[size],
              star <= value ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"
            )}
          />
        </button>
      ))}
      {value > 0 && (
        <span className="ml-1 text-sm text-gray-600">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}
