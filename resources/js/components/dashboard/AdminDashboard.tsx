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
  userRole = "Creator",
  verificationStatus = "unverified",
  onMenuClick,
  serverData,
}: AdminDashboardProps) {
  const d = serverData;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Header ── */}
      <DashboardHeader
        userName={userName}
        userRole={userRole}
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
            <a
              href="https://wa.me/6281234567890?text=Halo%20Admin%20AksaCart,%20saya%20ingin%20berkoordinasi%20mengenai%20layanan%20saya."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm"
            >
              <svg className="h-4 w-4 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.333 4.993L2 22l5.233-1.371a9.947 9.947 0 0 0 4.773 1.226h.004c5.505 0 9.99-4.477 9.99-9.985C22 6.478 17.518 2 12.012 2zm5.72 13.06c-.313.882-1.802 1.626-2.484 1.706-.682.08-1.547.288-4.52-.942-3.802-1.57-6.248-5.44-6.438-5.69-.19-.25-1.488-1.982-1.488-3.78 0-1.8 1.012-2.684 1.373-3.045.362-.361.793-.451 1.053-.451.26 0 .52.003.744.013.23.01.536-.04.832.67.313.751 1.073 2.624 1.163 2.805.09.18.15.39.03.63-.12.24-.18.39-.36.6-.18.21-.381.47-.541.63-.18.18-.36.38-.15.74.21.36.93 1.53 1.985 2.47 1.35 1.21 2.49 1.58 2.85 1.76.36.18.57.15.78-.09.21-.24.9-1.05 1.14-1.41.24-.36.48-.3.81-.18.33.12 2.085 1.02 2.445 1.2.36.18.6.27.69.42.09.15.09.87-.22 1.76z"/>
              </svg>
              Hubungi Admin
            </a>
            <button
              onClick={() => router.visit("/transaksi")}
              className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
            >
              <FileText className="h-4 w-4" />
              Faktur
            </button>
            <button
              onClick={() => router.visit("/semua-produk/create")}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Tambah Produk
            </button>
          </div>
        </div>

        {/* ── Alert verifikasi ── */}
        {verificationStatus !== 'approved' && (
          <div className={`border rounded-2xl px-5 py-3.5 flex items-center gap-3 ${
            verificationStatus === 'pending'
              ? 'bg-amber-50 border-amber-200'
              : verificationStatus === 'rejected'
              ? 'bg-rose-50 border-rose-200'
              : 'bg-amber-50 border-amber-200'
          }`}>
            {verificationStatus === 'pending' ? (
              <Clock className="h-4 w-4 text-amber-500 flex-shrink-0 animate-pulse" />
            ) : verificationStatus === 'rejected' ? (
              <XCircle className="h-4 w-4 text-rose-500 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0" />
            )}

            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${
                verificationStatus === 'rejected' ? 'text-rose-800' : 'text-amber-800'
              }`}>
                {verificationStatus === 'pending'
                  ? 'Verifikasi sedang ditinjau'
                  : verificationStatus === 'rejected'
                  ? 'Verifikasi ditolak'
                  : 'Akun belum terverifikasi'}
              </p>
              <p className={`text-xs mt-0.5 ${
                verificationStatus === 'rejected' ? 'text-rose-600' : 'text-amber-600'
              }`}>
                {verificationStatus === 'pending'
                  ? 'Dokumen dan data Anda sedang dalam proses peninjauan oleh tim admin.'
                  : verificationStatus === 'rejected'
                  ? 'Pengajuan verifikasi akun Anda ditolak. Silakan periksa detail penolakan dan perbaiki data Anda.'
                  : 'Verifikasi untuk membuka fitur penuh dan meningkatkan kepercayaan pelanggan.'}
              </p>
            </div>

            <Link
              href="/pengaturan/akun"
              className={`text-xs font-bold px-3 py-1.5 rounded-lg flex-shrink-0 transition-colors ${
                verificationStatus === 'rejected'
                  ? 'text-rose-700 bg-rose-100 hover:bg-rose-200'
                  : 'text-amber-700 bg-amber-100 hover:bg-amber-200'
              }`}
            >
              {verificationStatus === 'pending'
                ? 'Lihat Status'
                : verificationStatus === 'rejected'
                ? 'Perbaiki'
                : 'Verifikasi'}
            </Link>
          </div>
        )}

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
              products={d.allProducts}
            />
          </div>
        </div>

      </main>
    </div>
  );
}
