import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface SkillBadgeProps {
  skill: string;
  variant?: "default" | "selected" | "match";
  onRemove?: () => void;
  onClick?: () => void;
  className?: string;
}

export function SkillBadge({
  skill,
  variant = "default",
  onRemove,
  onClick,
  className,
}: SkillBadgeProps) {
  return (
    <span
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium transition-all",
        variant === "default" && "bg-secondary text-secondary-foreground",
        variant === "selected" && "bg-primary text-primary-foreground",
        variant === "match" && "bg-success/15 text-success ring-1 ring-success/30",
        onClick && "cursor-pointer hover:opacity-80",
        className
      )}
    >
      {skill}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 rounded-full p-0.5 hover:bg-primary-foreground/20"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}
