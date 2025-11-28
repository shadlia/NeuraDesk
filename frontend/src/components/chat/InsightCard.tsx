import { Lightbulb, TrendingUp, BookOpen, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface InsightCardProps {
  title: string;
  description: string;
  type?: "tip" | "trend" | "learning" | "insight";
  className?: string;
}

const iconMap = {
  tip: Lightbulb,
  trend: TrendingUp,
  learning: BookOpen,
  insight: Sparkles,
};

const colorMap = {
  tip: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  trend: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  learning: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  insight: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
};

export const InsightCard = ({ 
  title, 
  description, 
  type = "insight",
  className 
}: InsightCardProps) => {
  const Icon = iconMap[type];
  const colorClass = colorMap[type];

  return (
    <div
      className={cn(
        "group rounded-2xl border bg-card p-5 shadow-sm transition-all duration-300",
        "hover:shadow-md hover:border-accent/30 hover:-translate-y-0.5",
        "backdrop-blur-sm bg-gradient-to-br from-card to-card/50",
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-300",
          "group-hover:scale-110",
          colorClass
        )}>
          <Icon className="h-5 w-5" />
        </div>
        
        <div className="flex-1 space-y-2">
          <h3 className="font-heading font-semibold text-sm leading-tight">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};
