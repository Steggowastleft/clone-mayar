import DashboardLayout from "@/components/dashboard/dashboardlayout";
import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  BookOpen,
  Users2,
  Star,
  Mail,
  Settings,
  Package,
} from "lucide-react";

import TabTransaksi from "./detail/transaksi";
import TabDetail from "./detail/detail";
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
  redirect_url: string | null;
  cover_url: string | null;
  waktu_mulai_jual: string | null;
  tanggal_kadaluarsa: string | null;
  catatan: string | null;
  max_pembayaran: number | null;
  bisa_affiliate: boolean;
  total_penjualan: number;
  created_at: string;
};

type Props = {
  produk: ProdukDigitalData;
};

// ─── Placeholder tab ─────────────────────────────────────────────────

function TabPlaceholder({ label }: { label: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-12 text-center">
      <p className="text-gray-400 text-sm">
        Fitur <strong>{label}</strong> akan segera tersedia
      </p>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────

export default function ProdukDigitalShow({ produk }: Props) {
  const [activeTab, setActiveTab] = useState<string>("detail");

  const tabs = [
    {
      id: "transaksi",
      label: "TRANSAKSI",
      icon: <BarChart3 className="h-3 w-3" />,
    },
    {
      id: "detail",
      label: "DETAIL",
      icon: <BookOpen className="h-3 w-3" />,
    },
    {
      id: "pembeli",
      label: "PEMBELI",
      icon: <Users2 className="h-3 w-3" />,
    },
    {
      id: "rating",
      label: "RATING",
      icon: <Star className="h-3 w-3" />,
    },
    {
      id: "email",
      label: "EMAIL",
      icon: <Mail className="h-3 w-3" />,
    },
    {
      id: "pengaturan",
      label: "PENGATURAN",
      icon: <Settings className="h-3 w-3" />,
    },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case "transaksi":
        return <TabTransaksi />;
      case "detail":
        return <TabDetail produk={produk} />;
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
      <div className="p-6">
        {/* Breadcrumb + Title */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs text-gray-400 mb-1">
              PROJEK ·{" "}
              <button
                onClick={() => router.visit("/produk-digital")}
                className="hover:text-blue-600 transition"
              >
                Produk Digital
              </button>
            </p>
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Package className="h-5 w-5 text-purple-500" />
              {produk.nama}
            </h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-blue-500 text-blue-600 hover:bg-blue-50 text-sm"
            >
              PRODUK
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
              onClick={() => router.visit("/produk-digital")}
            >
              + BUAT
            </Button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="border-b border-gray-200 mb-5 overflow-x-auto">
          <div className="flex gap-0 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-4 py-2.5 text-xs font-semibold tracking-wide border-b-2 transition whitespace-nowrap flex items-center gap-1.5",
                  activeTab === tab.id
                    ? "border-purple-600 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content + Sidebar */}
        <div className="flex gap-5">
          <div className="flex-1 min-w-0">{renderTab()}</div>
          <div className="w-64 shrink-0">
            <SidebarPanel produk={produk} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}