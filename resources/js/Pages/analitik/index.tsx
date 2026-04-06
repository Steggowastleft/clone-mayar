import AppLayout from "@/layouts/app-layout";
import { Head } from "@inertiajs/react";
import { TrendingUp, Users, CreditCard, ShoppingBag, ArrowUpRight, ArrowDownRight } from "lucide-react";
import Dashboard from "../dashboard";
import DashboardLayout from "@/components/dashboard/dashboardlayout";

type AnalitikProps = {
  stats?: {
    pendapatan_bulan_ini: number;
    pendapatan_bulan_lalu: number;
    transaksi_bulan_ini: number;
    transaksi_bulan_lalu: number;
    pelanggan_baru: number;
    produk_terlaris: { nama: string; terjual: number }[];
    pendapatan_per_bulan: { bulan: string; total: number }[];
  };
};

export default function AnalitikIndex({ stats }: AnalitikProps) {
  const s = stats ?? {
    pendapatan_bulan_ini: 0,
    pendapatan_bulan_lalu: 0,
    transaksi_bulan_ini: 0,
    transaksi_bulan_lalu: 0,
    pelanggan_baru: 0,
    produk_terlaris: [],
    pendapatan_per_bulan: [],
  };

  const diffPendapatan = s.pendapatan_bulan_lalu > 0
    ? ((s.pendapatan_bulan_ini - s.pendapatan_bulan_lalu) / s.pendapatan_bulan_lalu * 100).toFixed(1)
    : "0";
  const isUp = parseFloat(diffPendapatan) >= 0;

  const statCards = [
    {
      label: "Pendapatan Bulan Ini",
      value: `Rp ${s.pendapatan_bulan_ini.toLocaleString("id-ID")}`,
      change: `${isUp ? "+" : ""}${diffPendapatan}% dari bulan lalu`,
      up: isUp,
      icon: <TrendingUp className="h-5 w-5 text-emerald-600" />,
      bg: "bg-emerald-50",
    },
    {
      label: "Transaksi Bulan Ini",
      value: s.transaksi_bulan_ini,
      change: `${s.transaksi_bulan_lalu} bulan lalu`,
      up: s.transaksi_bulan_ini >= s.transaksi_bulan_lalu,
      icon: <CreditCard className="h-5 w-5 text-blue-600" />,
      bg: "bg-blue-50",
    },
    {
      label: "Pelanggan Baru",
      value: s.pelanggan_baru,
      change: "Bulan ini",
      up: true,
      icon: <Users className="h-5 w-5 text-purple-600" />,
      bg: "bg-purple-50",
    },
  ];

  const maxPendapatan = Math.max(...s.pendapatan_per_bulan.map((p) => p.total), 1);

  return (
    <DashboardLayout>
      <Head title="Analitik" />
      <div className="p-6">
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">LAPORAN</p>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Analitik</h1>

        {/* Stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {statCards.map((card) => (
            <div key={card.label} className="bg-white border border-gray-200 rounded-lg p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                  {card.icon}
                </div>
                <span className={`text-xs flex items-center gap-1 font-medium ${card.up ? "text-green-600" : "text-red-500"}`}>
                  {card.up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                  {card.change}
                </span>
              </div>
              <p className="text-xs text-gray-500">{card.label}</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-6 flex-col lg:flex-row">
          {/* Grafik pendapatan */}
          <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm p-5">
            <h2 className="font-semibold text-gray-700 mb-4">Pendapatan Per Bulan</h2>
            {s.pendapatan_per_bulan.length === 0 ? (
              <p className="text-center text-gray-400 py-12 text-sm">Belum ada data pendapatan</p>
            ) : (
              <div className="flex items-end gap-2 h-40">
                {s.pendapatan_per_bulan.map((p) => (
                  <div key={p.bulan} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-blue-500 rounded-t-sm hover:bg-blue-600 transition"
                      style={{ height: `${(p.total / maxPendapatan) * 100}%`, minHeight: "4px" }}
                      title={`Rp ${p.total.toLocaleString("id-ID")}`}
                    />
                    <span className="text-xs text-gray-400">{p.bulan}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Produk terlaris */}
          <div className="w-full lg:w-72 bg-white border border-gray-200 rounded-lg shadow-sm p-5">
            <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-gray-500" /> Produk Terlaris
            </h2>
            {s.produk_terlaris.length === 0 ? (
              <p className="text-center text-gray-400 py-8 text-sm">Belum ada data</p>
            ) : (
              <div className="space-y-3">
                {s.produk_terlaris.map((p, i) => (
                  <div key={p.nama} className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 truncate">{p.nama}</p>
                      <div className="h-1.5 bg-gray-100 rounded-full mt-1">
                        <div
                          className="h-1.5 bg-blue-500 rounded-full"
                          style={{ width: `${(p.terjual / (s.produk_terlaris[0]?.terjual || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-gray-600">{p.terjual}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
