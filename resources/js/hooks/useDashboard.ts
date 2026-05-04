import { useState, useEffect } from "react";

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

export interface DashboardData {
  balance: number;
  totalRevenue: number;
  totalTransactions: number;
  pendingPayment: number;
  chartData: ChartDataPoint[];
  products: Product[];
  transactions: Transaction[];
  reviews: Review[];
}

interface UseDashboardOptions {
  refreshInterval?: number; // in ms
  timeRange?: "7" | "30" | "90";
}

/**
 * Custom hook untuk fetch dashboard data dari API
 * 
 * @param options - Optional configuration
 * @returns { data, isLoading, error, refetch }
 * 
 * @example
 * const { data, isLoading, error } = useDashboard();
 * 
 * @example
 * const { data, isLoading, refetch } = useDashboard({ 
 *   refreshInterval: 30000,
 *   timeRange: "30"
 * });
 */
export function useDashboard(options: UseDashboardOptions = {}) {
  const { refreshInterval, timeRange = "7" } = options;
  
  const [data, setData] = useState<DashboardData>({
    balance: 0,
    totalRevenue: 0,
    totalTransactions: 0,
    pendingPayment: 0,
    chartData: [],
    products: [],
    transactions: [],
    reviews: [],
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Replace dengan API endpoint yang sebenarnya
      // Contoh: /api/dashboard?timeRange=7
      const response = await fetch(`/api/dashboard?timeRange=${timeRange}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: DashboardData = await response.json();
      setData(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setError(errorMessage);
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Setup auto-refresh jika diperlukan
    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [timeRange, refreshInterval]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}

/**
 * Formatter untuk mata uang Rupiah
 * 
 * @example
 * formatCurrency(1000000) // "Rp. 1.000.000"
 */
export function formatCurrency(value: number, withPrefix = true): string {
  if (value === 0 || !value) return "-";
  
  const formatted = value.toLocaleString("id-ID");
  return withPrefix ? `Rp. ${formatted}` : formatted;
}

/**
 * Formatter untuk jumlah dengan K/M suffix
 * 
 * @example
 * formatCompact(1000000) // "1M"
 * formatCompact(50000) // "50K"
 */
export function formatCompact(value: number): string {
  if (value === 0 || !value) return "-";
  
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + "M";
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(1) + "K";
  }
  return value.toString();
}

/**
 * Formatter untuk persentase trend
 * 
 * @example
 * formatTrend(12) // "↑ 12%"
 * formatTrend(-5) // "↓ 5%"
 */
export function formatTrend(value: number): string {
  if (value === 0) return "→ 0%";
  return `${value > 0 ? "↑" : "↓"} ${Math.abs(value)}%`;
}

/**
 * Formatter untuk date dalam format Indonesia
 * 
 * @example
 * formatDateIndonesia("2024-01-15") // "15 Jan 2024"
 */
export function formatDateIndonesia(date: string): string {
  try {
    const d = new Date(date);
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return date;
  }
}

/**
 * Generate mock data untuk development
 * Hapus di production
 */
export function generateMockDashboardData(): DashboardData {
  return {
    balance: 5000000,
    totalRevenue: 25000000,
    totalTransactions: 142,
    pendingPayment: 3500000,
    chartData: [
      { date: "1", pendapatan: 800000, transaksi: 12 },
      { date: "2", pendapatan: 1200000, transaksi: 18 },
      { date: "3", pendapatan: 950000, transaksi: 14 },
      { date: "4", pendapatan: 1500000, transaksi: 22 },
      { date: "5", pendapatan: 2000000, transaksi: 28 },
      { date: "6", pendapatan: 1800000, transaksi: 25 },
      { date: "7", pendapatan: 1100000, transaksi: 16 },
    ],
    products: [
      {
        id: 1,
        name: "Kelas Web Development",
        sold: 234,
        revenue: 70200000,
        rating: 4.8,
      },
      {
        id: 2,
        name: "E-Book Marketing Digital",
        sold: 156,
        revenue: 39000000,
        rating: 4.5,
      },
      {
        id: 3,
        name: "Workshop Bootstrap 5",
        sold: 89,
        revenue: 26700000,
        rating: 4.6,
      },
      {
        id: 4,
        name: "Bundling React & Node.js",
        sold: 45,
        revenue: 22500000,
        rating: 4.9,
      },
    ],
    transactions: [
      {
        id: 1,
        type: "income",
        title: "Penjualan Kelas Web Dev",
        amount: 299000,
        date: "Hari ini, 14:30",
      },
      {
        id: 2,
        type: "income",
        title: "Penjualan E-Book Marketing",
        amount: 250000,
        date: "Hari ini, 12:15",
      },
      {
        id: 3,
        type: "refund",
        title: "Refund Peserta",
        amount: 150000,
        date: "Kemarin, 09:45",
      },
    ],
    reviews: [
      {
        id: 1,
        productName: "Kelas Web Development",
        reviewer: "Budi Santoso",
        rating: 5,
        comment: "Sangat bagus, penjelasan mudah dipahami dan mentor responsif",
        date: "2 hari lalu",
      },
      {
        id: 2,
        productName: "E-Book Marketing Digital",
        reviewer: "Siti Nurhaliza",
        rating: 4,
        comment: "Konten lengkap, tapi ada beberapa bagian yang bisa lebih detail",
        date: "3 hari lalu",
      },
      {
        id: 3,
        productName: "Workshop Bootstrap 5",
        reviewer: "Ahmad Ridho",
        rating: 5,
        comment: "Workshop interaktif, saya langsung bisa praktik dan apply di project saya",
        date: "1 minggu lalu",
      },
    ],
  };
}
