import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useState } from "react";
import { TrendingUp } from "lucide-react";

interface ChartDataPoint {
  date: string;
  pendapatan: number;
  transaksi: number;
}

interface ChartCardProps {
  title: string;
  data?: ChartDataPoint[];
  isLoading?: boolean;
  onRangeChange?: (range: "7" | "30" | "90") => void;
}

const formatRupiah = (value: number) => {
  if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)}jt`;
  if (value >= 1_000) return `Rp ${(value / 1_000).toFixed(0)}rb`;
  return `Rp ${value}`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-xs min-w-[160px]">
      <p className="font-semibold text-slate-700 mb-2">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center justify-between gap-4 mb-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-slate-500">{entry.name}</span>
          </div>
          <span className="font-semibold text-slate-800">
            {entry.dataKey === "pendapatan"
              ? `Rp ${entry.value.toLocaleString("id-ID")}`
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export function ChartCard({ title, data = [], isLoading = false, onRangeChange }: ChartCardProps) {
  const [range, setRange] = useState<"7" | "30" | "90">("30");

  const handleRangeChange = (r: "7" | "30" | "90") => {
    setRange(r);
    onRangeChange?.(r);
  };

  const totalPendapatan = data.reduce((s, d) => s + d.pendapatan, 0);
  const totalTrx = data.reduce((s, d) => s + d.transaksi, 0);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 flex items-start justify-between border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-800">{title}</h3>
          </div>
          <p className="text-xs text-slate-400">Performa pendapatan & transaksi</p>
        </div>
        {/* Range Tabs */}
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
          {(["7", "30", "90"] as const).map((r) => (
            <button
              key={r}
              onClick={() => handleRangeChange(r)}
              className={`text-xs px-3 py-1 rounded-md font-medium transition-all ${
                range === r
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {r}h
            </button>
          ))}
        </div>
      </div>

      {/* Summary mini-stats */}
      <div className="px-6 py-3 flex gap-6 border-b border-slate-100 bg-slate-50/50">
        <div>
          <p className="text-[11px] text-slate-400 uppercase tracking-wide">Total Pendapatan</p>
          <p className="text-sm font-bold text-slate-800 mt-0.5">
            Rp {totalPendapatan.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="w-px bg-slate-200" />
        <div>
          <p className="text-[11px] text-slate-400 uppercase tracking-wide">Total Transaksi</p>
          <p className="text-sm font-bold text-slate-800 mt-0.5">{totalTrx}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="px-2 py-4">
        {isLoading ? (
          <div className="h-56 bg-slate-100 rounded-xl animate-pulse mx-4" />
        ) : data.length === 0 ? (
          <div className="h-56 flex flex-col items-center justify-center text-slate-400 gap-2">
            <TrendingUp className="h-10 w-10 text-slate-200" />
            <p className="text-sm">Belum ada data untuk periode ini</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradPendapatan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradTransaksi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                dy={4}
              />
              <YAxis
                yAxisId="pendapatan"
                tickFormatter={formatRupiah}
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                width={60}
              />
              <YAxis
                yAxisId="transaksi"
                orientation="right"
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                width={30}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                iconSize={6}
                formatter={(val) => (
                  <span className="text-xs text-slate-500 ml-0.5">{val}</span>
                )}
              />
              <Area
                yAxisId="pendapatan"
                type="monotone"
                dataKey="pendapatan"
                name="Pendapatan"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#gradPendapatan)"
                dot={false}
                activeDot={{ r: 4, fill: "#3b82f6" }}
              />
              <Area
                yAxisId="transaksi"
                type="monotone"
                dataKey="transaksi"
                name="Transaksi"
                stroke="#f59e0b"
                strokeWidth={2}
                fill="url(#gradTransaksi)"
                dot={false}
                activeDot={{ r: 4, fill: "#f59e0b" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
