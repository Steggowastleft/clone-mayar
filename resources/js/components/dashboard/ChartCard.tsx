import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { MoreHorizontal } from "lucide-react";

interface ChartDataPoint {
  date: string;
  pendapatan: number;
  transaksi: number;
}

interface ChartCardProps {
  title: string;
  data?: ChartDataPoint[];
  isLoading?: boolean;
}

const formatRupiahTick = (value: number) => {
  if (value === 0) return "RP. 0";
  return `RP. ${value.toLocaleString("id-ID")}`;
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

const DEFAULT_DAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Mingg"];

export function ChartCard({ title, data = [], isLoading = false }: ChartCardProps) {
  // Map or fallback data
  const chartData = data && data.length > 0 
    ? data 
    : DEFAULT_DAYS.map(day => ({ date: day, pendapatan: 0, transaksi: 0 }));

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100">
        <h3 className="text-base font-bold text-slate-800">{title}</h3>
        <button className="p-1 hover:bg-slate-50 rounded-lg transition-colors">
          <MoreHorizontal className="h-5 w-5 text-blue-600" />
        </button>
      </div>

      {/* Chart */}
      <div className="px-3 py-6">
        {isLoading ? (
          <div className="h-64 bg-slate-100 rounded-xl animate-pulse mx-4" />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 30, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "#64748b", fontWeight: "bold" }}
                axisLine={false}
                tickLine={false}
                dy={6}
              />
              
              {/* Left Axis: Total Transaksi */}
              <YAxis
                yAxisId="transaksi"
                orientation="left"
                domain={[0, 160]}
                tick={{ fontSize: 10, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
                width={30}
                label={{ 
                  value: "TOTAL TRANSAKSI", 
                  angle: -90, 
                  position: "insideLeft", 
                  offset: -20, 
                  style: { textAnchor: "middle", fill: "#2563eb", fontWeight: "bold", fontSize: 9 } 
                }}
              />
              
              {/* Right Axis: Total Pendapatan */}
              <YAxis
                yAxisId="pendapatan"
                orientation="right"
                domain={[0, 70000000]}
                tickFormatter={formatRupiahTick}
                tick={{ fontSize: 10, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
                width={85}
                label={{ 
                  value: "TOTAL PENDAPATAN", 
                  angle: 90, 
                  position: "insideRight", 
                  offset: -20, 
                  style: { textAnchor: "middle", fill: "#2563eb", fontWeight: "bold", fontSize: 9 } 
                }}
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              <Legend
                iconType="rect"
                iconSize={16}
                verticalAlign="bottom"
                height={36}
                formatter={(val) => (
                  <span className="text-xs text-slate-500 font-medium ml-1 mr-4">{val}</span>
                )}
              />
              
              {/* Bar: Total Pendapatan */}
              <Bar
                yAxisId="pendapatan"
                dataKey="pendapatan"
                name="Total Pendapatan"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                barSize={18}
                opacity={0.8}
              />
              
              {/* Line: Total Transaksi */}
              <Line
                yAxisId="transaksi"
                type="monotone"
                dataKey="transaksi"
                name="Total Transaksi"
                stroke="#f59e0b"
                strokeWidth={3}
                dot={{ r: 3, fill: "#f59e0b", strokeWidth: 1 }}
                activeDot={{ r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
