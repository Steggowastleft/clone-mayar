import { DashboardHeader } from "./DashboardHeader";
import { SummaryCard } from "./SummaryCard";
import { ChartCard } from "./ChartCard";
import { TableCard } from "./TableCard";
import { SideCard } from "./SideCard";
import { AlertCircle, Plus, FileText, CreditCard, TrendingUp, ShoppingBag, Clock, XCircle } from "lucide-react";
import { formatCurrency } from "@/hooks/useDashboard";
import { Link, router } from "@inertiajs/react";

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
  buyerName: string;
  actionText: string;
  avatar?: string;
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
  pendingPaymentCount?: number;
  balanceTrend?: number | null;
  revenueTrend?: number | null;
  transaksiTrend?: number | null;
  transactionsToday?: number;
  pendingPaymentsToday?: number;
  chartData: ChartDataPoint[];
  products: Product[];
  allProducts: any[];
  transactions: Transaction[];
  reviews: Review[];
}

interface AdminDashboardProps {
  userName?: string;
  userRole?: string;
  verificationStatus?: 'unverified' | 'pending' | 'approved' | 'rejected';
  onMenuClick?: () => void;
  serverData: ServerDashboardData;
}

export function AdminDashboard({
  userName = "Pengguna",
  userRole = "Creator",
  verificationStatus = "unverified",
  onMenuClick,
  serverData,
}: AdminDashboardProps) {
  const d = serverData;

  // Formatting values exactly like the screenshot
  const balanceValue = d.balance > 0 ? ("Rp. " + d.balance.toLocaleString("id-ID")) : "Rp. -";
  
  // Saldo Akun Trend
  let balanceTrendText = "0% Dari bulan kemarin";
  let balanceTrendType: "success" | "danger" | "info" | "warning" = "success";
  if (d.balanceTrend !== undefined && d.balanceTrend !== null) {
    const prefix = d.balanceTrend > 0 ? "+" : "";
    balanceTrendText = `${prefix}${d.balanceTrend}% Dari bulan kemarin`;
    balanceTrendType = d.balanceTrend >= 0 ? "success" : "danger";
  }

  // Total Pendapatan Trend
  let revenueValue = d.totalRevenue > 0 ? ("Rp. " + d.totalRevenue.toLocaleString("id-ID")) : "Rp. -";
  let revenueTrendText = "0% Dari bulan kemarin";
  let revenueTrendType: "success" | "danger" | "info" | "warning" = "success";
  if (d.revenueTrend !== undefined && d.revenueTrend !== null) {
    const prefix = d.revenueTrend > 0 ? "+" : "";
    revenueTrendText = `${prefix}${d.revenueTrend}% Dari bulan kemarin`;
    revenueTrendType = d.revenueTrend >= 0 ? "success" : "danger";
  }

  // Total Transaksi Today
  const transactionValue = d.totalTransactions > 0 ? d.totalTransactions.toLocaleString("id-ID") : "-";
  const trxToday = d.transactionsToday !== undefined ? d.transactionsToday : 0;
  const prefixTrx = trxToday > 0 ? "+" : "";
  const transactionTrendText = `${prefixTrx}${trxToday} Transaksi hari ini`;
  const transactionTrendType = "info";

  // Belum Dibayar Today
  const pendingCount = d.pendingPaymentCount !== undefined ? d.pendingPaymentCount : 0;
  const pendingValue = pendingCount > 0 ? pendingCount.toLocaleString("id-ID") : "-";
  const pendingToday = d.pendingPaymentsToday !== undefined ? d.pendingPaymentsToday : 0;
  const prefixPend = pendingToday > 0 ? "+" : "";
  const pendingTrendText = `${prefixPend}${pendingToday} Pesanan belum dibayar hari ini`;
  const pendingTrendType = "warning";

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* ── Header ── */}
      <DashboardHeader
        userName={userName}
        userRole={userRole}
        onMenuClick={onMenuClick}
        transactions={d.transactions}
      />

      <main className="px-6 py-8 max-w-7xl mx-auto space-y-6">

        {/* ── Page Title + Actions ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Menu Utama</h1>
            <p className="text-sm text-slate-500 mt-1">
              Kelola penjualan, pantau performa, dan tingkatkan pendapatan bisnismu dengan mudah.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => router.visit("/semua-produk/create")}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Tambah Produk
            </button>
            <button
              onClick={() => router.visit("/faktur-pembayaran")}
              className="flex items-center gap-1 text-blue-600 font-bold text-sm hover:underline"
            >
              Faktur Pembayaran
              <span className="text-lg leading-none">&rarr;</span>
            </button>
          </div>
        </div>

        {/* ── Alert verifikasi ── */}
        {verificationStatus !== 'approved' && (
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl px-5 py-3.5 flex items-center gap-3">
            <span className="text-blue-500 font-extrabold text-base leading-none">ⓘ</span>
            <p className="text-sm font-semibold text-slate-700">
              Akun kamu belum terverifikasi!
            </p>
          </div>
        )}

        {/* ── Summary Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            title="Saldo Akun"
            value={balanceValue}
            trendText={balanceTrendText}
            trendType={balanceTrendType}
            isHighlight={true}
          />
          <SummaryCard
            title="Total Pendapatan"
            value={revenueValue}
            trendText={revenueTrendText}
            trendType={revenueTrendType}
          />
          <SummaryCard
            title="Total Transaksi"
            value={transactionValue}
            trendText={transactionTrendText}
            trendType={transactionTrendType}
          />
          <SummaryCard
            title="Belum Dibayar"
            value={pendingValue}
            trendText={pendingTrendText}
            trendType={pendingTrendType}
          />
        </div>

        {/* ── Main Content Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left — Chart + Table */}
          <div className="lg:col-span-2 space-y-5">
            <ChartCard
              title="Grafik Transaksi"
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
              reviewTitle="Penilaian dan Ulasan"
              reviews={d.reviews}
            />
          </div>
        </div>

      </main>
    </div>
  );
}
