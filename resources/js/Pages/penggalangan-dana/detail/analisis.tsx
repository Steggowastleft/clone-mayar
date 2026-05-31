import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { TrendingUp, DollarSign, ShoppingCart, Clock, Eye, CheckCircle } from "lucide-react";

type Props = {
  produk: any;
  analisis: any;
};

export default function TabAnalisis({ produk, analisis }: Props) {
  // Custom Formatter for Rupiah on Y-axis
  const formatRupiah = (value: number) => {
    if (value >= 1000000) {
      return `Rp ${(value / 1000000).toFixed(1)}jt`;
    }
    if (value >= 1000) {
      return `Rp ${(value / 1000).toFixed(0)}rb`;
    }
    return `Rp ${value.toLocaleString("id-ID")}`;
  };

  const formatRupiahFull = (value: number) => {
    return `Rp ${value.toLocaleString("id-ID")}`;
  };

  const growthSign = (analisis?.growth_percent ?? 0) >= 0 ? "+" : "";
  const growthColor = (analisis?.growth_percent ?? 0) >= 0 ? "text-emerald-600" : "text-rose-600";

  // Conversion rate from checkout to sukses
  const conversionRate = (analisis?.checkout_count ?? 0) > 0
    ? Math.round(((analisis?.transaksi_sukses ?? 0) / analisis.checkout_count) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Premium Insight Banner */}
      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-200/50 rounded-2xl p-5 flex items-start gap-4">
        <div className="p-3 bg-purple-500 text-white rounded-xl shadow-sm shrink-0">
          <TrendingUp className="h-5 w-5" />
        </div>
        <div>
          <h4 className="font-bold text-gray-800 text-sm md:text-base">Ringkasan Analisis</h4>
          {(analisis?.total_transaksi ?? 0) > 0 ? (
            <p className="text-sm text-gray-600 mt-0.5">
              Projek <strong className="text-purple-700 font-semibold">{produk?.nama || produk?.name}</strong> memiliki{" "}
              <span className="font-bold text-slate-800">{analisis.total_transaksi}</span> total transaksi
              dengan pendapatan <span className="font-bold text-emerald-600">{formatRupiahFull(analisis.nominal_transaksi)}</span>.
              {analisis.growth_percent !== 0 && (
                <> Pertumbuhan minggu ini <span className={`font-bold ${growthColor}`}>{growthSign}{analisis.growth_percent}%</span>.</>
              )}
              {analisis.busiest_day !== "-" && (
                <> Hari paling ramai: <strong className="text-slate-800 font-semibold">{analisis.busiest_day}</strong>.</>
              )}
            </p>
          ) : (
            <p className="text-sm text-gray-500 mt-0.5">
              Belum ada transaksi untuk projek <strong>{produk?.nama || produk?.name}</strong>. Data analisis akan muncul setelah ada transaksi masuk.
            </p>
          )}
        </div>
      </div>

      {/* Row 1: Omzet & Pendapatan */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Omzet dan Pendapatan</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Total Transaksi */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Total Jumlah Transaksi</p>
              <h4 className="text-2xl font-bold text-gray-800 mt-1">{analisis?.total_transaksi ?? 0}</h4>
              <p className="text-xs text-gray-400 mt-0.5">
                {analisis?.transaksi_sukses ?? 0} sukses · {analisis?.transaksi_gagal ?? 0} gagal
              </p>
            </div>
          </div>

          {/* Card 2: Nominal */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Nominal Transaksi</p>
              <h4 className="text-2xl font-extrabold text-gray-800 mt-1">{formatRupiahFull(analisis?.nominal_transaksi ?? 0)}</h4>
              {analisis?.growth_percent !== 0 && (
                <p className={`text-xs font-semibold mt-0.5 ${growthColor}`}>
                  {growthSign}{analisis?.growth_percent ?? 0}% vs minggu lalu
                </p>
              )}
            </div>
          </div>

          {/* Card 3: Pending */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">Menunggu Pembayaran</p>
              <h4 className="text-2xl font-bold text-gray-800 mt-1">{analisis?.transaksi_pending ?? 0}</h4>
              <p className="text-xs text-gray-400 mt-0.5">Siklus konfirmasi 24 jam</p>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Alur Penjualan / Conversion Funnel */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Alur Penjualan (Funnel)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Funnel 1: Page Views */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-slate-50 text-slate-600 rounded-lg">
                <Eye className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-slate-400">Tahap 1</span>
            </div>
            <div className="mt-4">
              <p className="text-xs text-gray-400 font-medium">Total Pembeli Terdaftar</p>
              <h4 className="text-2xl font-extrabold text-gray-800 mt-1">{analisis?.checkout_count ?? 0}</h4>
              <p className="text-xs text-slate-500 mt-1">Peserta yang mendaftar ke projek ini</p>
            </div>
          </div>

          {/* Funnel 2: Checkout */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-amber-50/70 text-amber-600 rounded-lg">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-amber-500">
                {(analisis?.total_transaksi ?? 0) > 0 ? `${Math.round(((analisis?.total_transaksi ?? 0) / Math.max(analisis?.checkout_count ?? 1, 1)) * 100)}%` : "0%"} Checkout
              </span>
            </div>
            <div className="mt-4">
              <p className="text-xs text-gray-400 font-medium">Selesai Checkout</p>
              <h4 className="text-2xl font-extrabold text-gray-800 mt-1">{analisis?.total_transaksi ?? 0}</h4>
              <p className="text-xs text-slate-500 mt-1">Mengisi data & menekan tombol bayar</p>
            </div>
          </div>

          {/* Funnel 3: Success */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
                <CheckCircle className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-emerald-600">
                {conversionRate}% Rasio Bayar
              </span>
            </div>
            <div className="mt-4">
              <p className="text-xs text-gray-400 font-medium">Transaksi Sukses</p>
              <h4 className="text-2xl font-extrabold text-gray-800 mt-1">{analisis?.transaksi_sukses ?? 0}</h4>
              <p className="text-xs text-emerald-600 font-semibold mt-1">Pembayaran terverifikasi lunas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Double Axis Charts */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h3 className="font-bold text-gray-800 text-base">Grafik Transaksi (7 Hari Terakhir)</h3>
            <p className="text-xs text-gray-400 mt-0.5">Analisis histori pendapatan dan jumlah transaksi harian</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 bg-blue-500 rounded"></span>
              <span className="text-gray-600">Total Pendapatan (Bar)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-0.5 bg-amber-500 inline-block relative bottom-0.5"></span>
              <span className="text-gray-600">Total Transaksi (Line)</span>
            </div>
          </div>
        </div>

        {analisis?.chart_data && analisis.chart_data.length > 0 && (analisis?.total_transaksi ?? 0) > 0 ? (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={analisis.chart_data}
                margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#64748B", fontSize: 12, fontWeight: 500 }}
                />
                <YAxis
                  yAxisId="left"
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatRupiah}
                  tick={{ fill: "#64748B", fontSize: 11 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${val} trx`}
                  tick={{ fill: "#64748B", fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                  }}
                  formatter={(value: any, name: any) => {
                    if (name === "Pendapatan") return [formatRupiahFull(value), "Pendapatan"];
                    return [`${value} Transaksi`, "Transaksi"];
                  }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="Pendapatan"
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="Transaksi"
                  stroke="#F59E0B"
                  strokeWidth={3}
                  dot={{ stroke: "#F59E0B", strokeWidth: 2, r: 4, fill: "#FFFFFF" }}
                  activeDot={{ r: 6 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 w-full flex items-center justify-center">
            <div className="text-center">
              <div className="p-4 bg-gray-50 rounded-full inline-block mb-3">
                <TrendingUp className="h-8 w-8 text-gray-300" />
              </div>
              <p className="text-sm text-gray-400">Belum ada data transaksi untuk ditampilkan</p>
              <p className="text-xs text-gray-300 mt-1">Grafik akan muncul setelah ada transaksi masuk</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
