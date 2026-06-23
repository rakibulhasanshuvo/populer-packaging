"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  changeDescription?: string;
  colorTheme?: "cyan" | "indigo" | "green" | "red";
}

export default function MetricCard({
  title,
  value,
  changeDescription = "Live database sync",
  colorTheme = "cyan",
}: MetricCardProps) {
  const themes = {
    cyan: {
      text: "text-cyan-neon",
      bg: "bg-cyan-neon/10 border-cyan-neon/20",
    },
    indigo: {
      text: "text-indigo-electric",
      bg: "bg-indigo-electric/10 border-indigo-electric/20",
    },
    green: {
      text: "text-system-green",
      bg: "bg-system-green/10 border-system-green/20",
    },
    red: {
      text: "text-system-red",
      bg: "bg-system-red/10 border-system-red/20",
    },
  };

  const currentTheme = themes[colorTheme] || themes.cyan;

  return (
    <div className="bg-card-surface p-4 rounded-apple-xl border border-white/8 flex flex-col h-[120px] relative overflow-hidden group justify-between">
      <div>
        <span className="text-[10px] uppercase font-bold text-typography-secondary tracking-wider">
          {title}
        </span>
        <div className="text-2xl font-bold tracking-tight mt-1 group-hover:scale-[1.02] origin-left transition-transform text-typography-primary">
          {value}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <div className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full border", currentTheme.bg, currentTheme.text)}>
          {changeDescription}
        </div>
      </div>
    </div>
  );
}
