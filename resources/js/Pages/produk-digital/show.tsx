import DashboardLayout from "@/components/dashboard/dashboardlayout";
import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  BookOpen,
  Package,
  TrendingUp,
} from "lucide-react";

import TabTransaksi from "./detail/transaksi";
import TabDetail from "./detail/detail";
import TabAnalisis from "./detail/analisis";
import { SidebarPanel } from "./detail/components/sidebarpanel";

// ─── Types ───────────────────────────────────────────────────────────

export type ProdukDigitalData = {
  id: number;
  nama: string;
  slug: string;
  status: "published" | "unpublished" | "unlisted";
  tipe_pembayaran: "berbayar" | "gratis";
  kategori?: "e-book" | "novel" | "komik" | "template" | "tulisan" | "video";
  harga: number;
  harga_coret: number | null;
  deskripsi: string;
  sumber_file: "upload" | "file_lama" | "link";
  file_url: string | null;
  file_lama_id: string | null;
  redirect_url: string | null;
  cover_url: string | null;
  waktu_mulai_jual: string | null;
  tanggal_kadaluarsa: string | null;
  catatan: string | null;
  max_pembayaran: number | null;
  bisa_affiliate: boolean;
  total_penjualan: number;
  created_at: string;

  // Specific fields
  author?: string | null;
  isbn?: string | null;
  format?: string | null;
  bahasa?: string | null;
  jumlah_halaman?: number | null;
  bisa_didownload?: boolean;
  tipe_tulisan?: string | null;
  mekanisme_bayar?: string | null;
  genre?: string | null;
  transkrip?: string | null;
  pembicara?: string | null;
  durasi?: string | null;
  artis?: string | null;
  kategori_produk?: string | null;
  tipe_pembaca?: string | null;
};

export type AnalisisData = {
  total_transaksi: number;
  transaksi_sukses: number;
  transaksi_pending: number;
  transaksi_gagal: number;
  nominal_transaksi: number;
  checkout_count: number;
  chart_data: { day: string; date: string; Pendapatan: number; Transaksi: number }[];
  growth_percent: number;
  busiest_day: string;
};

type Props = {
  produk: ProdukDigitalData;
  oldFiles: any[];
  analisis: AnalisisData;
  transaksi: any[];
};

// ─── Placeholder tab ─────────────────────────────────────────────────

function TabPlaceholder({ label }: { label: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-12 text-center">
      <p className="text-gray-450 text-sm">
        Fitur <strong>{label}</strong> akan segera tersedia
      </p>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────

export default function ProdukDigitalShow({ produk, oldFiles, analisis, transaksi }: Props) {
  const [activeTab, setActiveTab] = useState<string>("detail");

  const tabs = [
    {
      id: "detail",
      label: "DETAIL",
    },
    {
      id: "transaksi",
      label: "TRANSAKSI",
    },
    {
      id: "analisis",
      label: "ANALISIS",
    },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case "detail":
        return <TabDetail produk={produk} />;
      case "transaksi":
        return <TabTransaksi transaksi={transaksi} />;
      case "analisis":
        return <TabAnalisis produk={produk} analisis={analisis} />;
      default:
        return (
          <TabPlaceholder
            label={tabs.find((t) => t.id === activeTab)?.label || activeTab}
          />
        );
    }
  };

  return (
    <DashboardLayout>
      <Head title={produk.nama} />
      <div className="p-6 bg-slate-50/20 min-h-screen">
        {/* Breadcrumb + Title */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-slate-400 font-semibold mb-1">
              Produk Digital
            </p>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              {produk.nama}
            </h1>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center gap-1.5"
            onClick={() => router.visit("/produk-digital")}
          >
            + Tambah Produk
          </Button>
        </div>

        {/* Tab Bar */}
        <div className="flex mb-6 overflow-x-auto">
          <div className="flex border border-blue-200 rounded-lg overflow-hidden bg-white shadow-sm">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "px-8 py-2.5 text-xs font-bold tracking-wider transition whitespace-nowrap",
                    isActive
                      ? "bg-blue-50 text-blue-600 font-extrabold border-r border-blue-200 last:border-0"
                      : "text-blue-500 hover:bg-slate-50 border-r border-blue-150 last:border-0"
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content + Sidebar */}
        <div className="flex gap-6">
          <div className="flex-1 min-w-0">{renderTab()}</div>
          <div className="w-80 shrink-0">
            <SidebarPanel produk={produk} oldFiles={oldFiles} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}