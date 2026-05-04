import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: number;
  isLoading?: boolean;
  color?: "blue" | "green" | "amber" | "purple";
}

const colorMap = {
  blue:   { bg: "bg-blue-50",   text: "text-blue-600",   ring: "ring-blue-100" },
  green:  { bg: "bg-emerald-50", text: "text-emerald-600", ring: "ring-emerald-100" },
  amber:  { bg: "bg-amber-50",  text: "text-amber-600",  ring: "ring-amber-100" },
  purple: { bg: "bg-violet-50", text: "text-violet-600", ring: "ring-violet-100" },
};

export function SummaryCard({
  title,
  value,
  icon,
  trend,
  isLoading = false,
  color = "blue",
}: SummaryCardProps) {
  const c = colorMap[color];

  const TrendIcon =
    trend === undefined || trend === null
      ? null
      : trend > 0
      ? TrendingUp
      : trend < 0
      ? TrendingDown
      : Minus;

  const trendColor =
    trend === undefined || trend === null
      ? ""
      : trend > 0
      ? "text-emerald-600 bg-emerald-50"
      : trend < 0
      ? "text-red-500 bg-red-50"
      : "text-slate-500 bg-slate-100";

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-all duration-200 group">
      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{title}</p>
        {icon && (
          <div className={`p-2 rounded-xl ring-4 ${c.bg} ${c.text} ${c.ring} group-hover:scale-110 transition-transform duration-200`}>
            {icon}
          </div>
        )}
      </div>

      {/* Value */}
      {isLoading ? (
        <div className="h-7 w-28 bg-slate-100 rounded-lg animate-pulse mb-3" />
      ) : (
        <p className="text-2xl font-bold text-slate-900 tracking-tight mb-3">
          {value || "—"}
        </p>
      )}

      {/* Trend */}
      {trend !== undefined && trend !== null && TrendIcon && (
        <div className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${trendColor}`}>
          <TrendIcon className="h-3 w-3" />
          {Math.abs(trend)}% dari periode lalu
        </div>
      )}
    </div>
  );
}
