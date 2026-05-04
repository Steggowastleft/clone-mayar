import DashboardLayout from "@/components/dashboard/dashboardlayout";
import AppLayout from "@/layouts/app-layout";
import { Head, router } from "@inertiajs/react";
import {
  CreditCard, Package, Users, TrendingUp, ArrowUpRight,
  GraduationCap, ShoppingBag, BarChart3,
} from "lucide-react";

type DashboardProps = {
  stats?: {
    total_transaksi: number;
    total_pendapatan: number;
    total_pelanggan: number;
    total_produk: number;
  };
  recent_transaksi?: {
    id: number;
    nama: string;
    produk: string;
    jumlah: number;
    status: string;
    tanggal: string;
  }[];
};

export default function Dashboard({ stats, recent_transaksi = [] }: DashboardProps) {
  const s = stats ?? {
    total_transaksi: 0,
    total_pendapatan: 0,
    total_pelanggan: 0,
    total_produk: 0,
  };

  const statCards = [
    {
      label: "Total Transaksi",
      value: s.total_transaksi,
      icon: <CreditCard className="h-5 w-5 text-blue-600" />,
      bg: "bg-blue-50",
      href: "/transaksi",
    },
    {
      label: "Total Pendapatan",
      value: `Rp ${s.total_pendapatan.toLocaleString("id-ID")}`,
      icon: <TrendingUp className="h-5 w-5 text-emerald-600" />,
      bg: "bg-emerald-50",
      href: "/analitik",
    },
    {
      label: "Total Pelanggan",
      value: s.total_pelanggan,
      icon: <Users className="h-5 w-5 text-purple-600" />,
      bg: "bg-purple-50",
      href: "/pelanggan",
    },
    {
      label: "Total Produk",
      value: s.total_produk,
      icon: <Package className="h-5 w-5 text-orange-600" />,
      bg: "bg-orange-50",
      href: "/bootcamps",
    },
  ];

  const menuShortcuts = [
    { label: "Bootcamp", icon: <GraduationCap className="h-6 w-6 text-blue-600" />, href: "/bootcamps" },
    { label: "Produk Digital", icon: <ShoppingBag className="h-6 w-6 text-indigo-600" />, href: "/produk-digital" },
    { label: "Transaksi", icon: <CreditCard className="h-6 w-6 text-green-600" />, href: "/transaksi" },
    { label: "Pelanggan", icon: <Users className="h-6 w-6 text-purple-600" />, href: "/pelanggan" },
    { label: "Analitik", icon: <BarChart3 className="h-6 w-6 text-orange-600" />, href: "/analitik" },
  ];

  const statusBadge = (status: string) => {
    switch (status) {
      case "sukses": return "bg-green-100 text-green-700";
      case "pending": return "bg-yellow-100 text-yellow-700";
      case "gagal": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <DashboardLayout>
      <Head title="Dashboard" />
      <div className="p-6">
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">RINGKASAN</p>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card) => (
            <button
              key={card.label}
              onClick={() => router.visit(card.href)}
              className="bg-white border border-gray-200 rounded-lg p-4 flex items-start gap-3 hover:shadow-md hover:border-blue-200 transition text-left"
            >
              <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center shrink-0`}>
                {card.icon}
              </div>
              <div>
                <p className="text-xs text-gray-500">{card.label}</p>
                <p className="text-lg font-bold text-gray-800 mt-0.5">{card.value}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="flex gap-6 flex-col lg:flex-row">
          {/* Transaksi terbaru */}
          <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-700">Transaksi Terbaru</h2>
              <button
                onClick={() => router.visit("/transaksi")}
                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
              >
                Lihat semua <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>
            <div className="p-4">
              {recent_transaksi.length === 0 ? (
                <p className="text-center text-gray-400 py-8 text-sm">Belum ada transaksi</p>
              ) : (
                <div className="space-y-3">
                  {recent_transaksi.map((t) => (
                    <div key={t.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{t.nama}</p>
                        <p className="text-xs text-gray-500">{t.produk} · {t.tanggal}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-700">
                          Rp {t.jumlah.toLocaleString("id-ID")}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge(t.status)}`}>
                          {t.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Shortcut menu */}
          <div className="w-full lg:w-56 shrink-0 bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <h2 className="font-semibold text-gray-700 mb-3 text-sm">Menu Cepat</h2>
            <div className="space-y-2">
              {menuShortcuts.map((m) => (
                <button
                  key={m.label}
                  onClick={() => router.visit(m.href)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 hover:border-blue-200 transition text-left"
                >
                  {m.icon}
                  <span className="text-sm text-gray-700 font-medium">{m.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
