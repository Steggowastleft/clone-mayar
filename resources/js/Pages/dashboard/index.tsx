import DashboardLayout from "@/components/dashboard/dashboardlayout";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { Head } from "@inertiajs/react";

// ─── Types ───────────────────────────────────────────────────────────

interface ChartDataPoint {
  date: string;
  pendapatan: number;
  transaksi: number;
}

interface Product {
  id: string | number;
  name: string;
  sold: number;
  revenue: number;
  rating: number;
  image?: string;
}

interface Transaction {
  id: string | number;
  type: "income" | "expense" | "refund";
  title: string;
  amount: number;
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

interface DashboardData {
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

type DashboardProps = {
  dashboardData: DashboardData;
  user?: {
    name: string;
  };
};

// ─── Empty fallback ────────────────────────────────────────────────

const EMPTY_DATA: DashboardData = {
  balance: 0,
  totalRevenue: 0,
  totalTransactions: 0,
  pendingPayment: 0,
  chartData: [],
  products: [],
  transactions: [],
  reviews: [],
};

// ─── Main Component ────────────────────────────────────────────────

export default function Dashboard({ user, dashboardData }: DashboardProps) {
  const userName = user?.name || "Pengguna";
  const safeData = dashboardData ?? EMPTY_DATA;

  return (
    <DashboardLayout title="Dashboard">
      <Head title="Dashboard" />
      <AdminDashboard
        userName={userName}
        serverData={safeData}
      />
    </DashboardLayout>
  );
}
