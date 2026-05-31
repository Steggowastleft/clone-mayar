import React from "react";
import { Info } from "lucide-react";

interface SummaryCardProps {
  title: string;
  value: string | number;
  trendText?: string;
  trendType?: "success" | "danger" | "info" | "warning";
  isLoading?: boolean;
  isHighlight?: boolean;
  icon?: React.ReactNode;
  color?: string;
}

export function SummaryCard({
  title,
  value,
  trendText,
  trendType = "info",
  isLoading = false,
  isHighlight = false,
}: SummaryCardProps) {
  const trendStyles = {
    success: "text-emerald-600 bg-emerald-50 border-emerald-100",
    danger: "text-red-500 bg-red-50 border-red-100",
    info: "text-blue-600 bg-blue-50 border-blue-100",
    warning: "text-amber-600 bg-amber-50 border-amber-100",
  };

  return (
    <div
      className={`border rounded-2xl p-5 transition-all duration-200 flex flex-col justify-between h-[125px] ${
        isHighlight
          ? "bg-blue-50/70 border-blue-200"
          : "bg-white border-slate-200"
      }`}
    >
      {/* Top row: Title and Info Icon */}
      <div className="flex items-center justify-between">
        <span
          className={`text-sm font-medium ${
            isHighlight ? "text-slate-600" : "text-slate-500"
          }`}
        >
          {title}
        </span>
        <Info
          className={`h-4 w-4 cursor-pointer shrink-0 ${
            isHighlight ? "text-blue-500" : "text-slate-300 hover:text-slate-400"
          }`}
        />
      </div>

      {/* Value */}
      <div className="flex-1 flex flex-col justify-end mt-1">
        {isLoading ? (
          <div className="h-8 w-24 bg-slate-100 rounded-lg animate-pulse" />
        ) : (
          <p
            className={`text-2xl font-bold tracking-tight ${
              isHighlight ? "text-slate-800" : "text-slate-900"
            }`}
          >
            {value}
          </p>
        )}
      </div>

      {/* Trend Badge */}
      {!isLoading && trendText && (
        <div className="mt-1.5 flex">
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg border ${trendStyles[trendType]}`}
          >
            {trendText}
          </span>
        </div>
      )}
    </div>
  );
}
