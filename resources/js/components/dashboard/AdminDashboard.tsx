import { DashboardHeader } from "./DashboardHeader";
import { SummaryCard } from "./SummaryCard";
import { ChartCard } from "./ChartCard";
import { TableCard } from "./TableCard";
import { SideCard } from "./SideCard";
import { AlertCircle, Plus, FileText, CreditCard, TrendingUp, ShoppingBag, Clock } from "lucide-react";
import { formatCurrency } from "@/hooks/useDashboard";
import { router } from "@inertiajs/react";

interface ChartDataPoint {
  date: string;
  pendapatan: number;
  transaksi: number;
}

interface Product {
  id: string | number;
  name: string;
  sold: number;
  revenue: string | number;
  rating: number;
  image?: string;
}

interface Transaction {
  id: string | number;
  type: "income" | "expense" | "refund";
  title: string;
  amount: string | number;
  date: string;
}

interface Review {
  id: string | number;
  productName: string;
  reviewer: string;
  rating: number;
  comment: string;
  date: string;
}

interface ServerDashboardData {
  balance: number;
  totalRevenue: number;
  totalTransactions: number;
  pendingPayment: number;
  revenueTrend?: number | null;
  transaksiTrend?: number | null;
  chartData: ChartDataPoint[];
  products: Product[];
  transactions: Transaction[];
  reviews: Review[];
}

interface AdminDashboardProps {
  userName?: string;
  onMenuClick?: () => void;
  serverData: ServerDashboardData;
}

// Format currency — tampilkan Rp 0 jika 0, "—" hanya jika null/undefined
function formatRupiah(val: number | null | undefined): string {
  if (val === null || val === undefined) return "—";
  return formatCurrency(val);
}

// Format angka — tampilkan 0 jika 0, "—" hanya jika null/undefined
function formatCount(val: number | null | undefined): string | number {
  if (val === null || val === undefined) return "—";
  return val;
}

export function AdminDashboard({
  userName = "Pengguna",
  onMenuClick,
  serverData,
}: AdminDashboardProps) {
  const d = serverData;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Header ── */}
      <DashboardHeader
        userName={userName}
        onMenuClick={onMenuClick}
        transactions={d.transactions}
      />

      <main className="px-6 py-8 max-w-7xl mx-auto space-y-6">

        {/* ── Page Title + Actions ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Ringkasan</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Pantau performa penjualan kamu secara real-time
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.visit("/transaksi")}
              className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
            >
              <FileText className="h-4 w-4" />
              Faktur
            </button>
            <button
              onClick={() => router.visit("/semua-produk")}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Tambah Produk
            </button>
          </div>
        </div>

        {/* ── Alert verifikasi ── */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3.5 flex items-center gap-3">
          <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800">Akun belum terverifikasi</p>
            <p className="text-xs text-amber-600 mt-0.5">
              Verifikasi untuk membuka fitur penuh dan meningkatkan kepercayaan pelanggan.
            </p>
          </div>
          <button className="text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg flex-shrink-0 transition-colors">
            Verifikasi
          </button>
        </div>

        {/* ── Summary Cards ── */}
        <div className="grid grid-cols-2 lg:grid/* - */cols-4 gap-4">
          <SummaryCard
            title="Saldo Akun"
            value={formatRupiah(d.balance)}
            icon={<CreditCard className="h-4 w-4" />}
            color="blue"
          />
          <SummaryCard
            title="Total Pendapatan"
            value={formatRupiah(d.totalRevenue)}
            icon={<TrendingUp className="h-4 w-4" />}
            trend={d.revenueTrend ?? undefined}
            color="green"
          />
          <SummaryCard
            title="Total Transaksi"
            value={formatCount(d.totalTransactions)}
            icon={<ShoppingBag className="h-4 w-4" />}
            trend={d.transaksiTrend ?? undefined}
            color="amber"
          />
          <SummaryCard
            title="Belum Dibayar"
            value={formatRupiah(d.pendingPayment)}
            icon={<Clock className="h-4 w-4" />}
            color="purple"
          />
        </div>

        {/* ── Main Content Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left — Chart + Table */}
          <div className="lg:col-span-2 space-y-5">
            <ChartCard
              title="Grafik Pendapatan & Transaksi"
              data={d.chartData}
            />
            <TableCard
              title="Produk Terlaris"
              data={d.products}
            />
          </div>

          {/* Right — Sidebar */}
          <div>
            <SideCard
              transactionTitle="Transaksi Terbaru"
              transactions={d.transactions}
              reviewTitle="Ulasan Terbaru"
              reviews={d.reviews}
            />
          </div>
        </div>

      </main>
    </div>
  );
}
