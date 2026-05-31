import DashboardLayout from "@/components/dashboard/dashboardlayout";
import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  BookOpen,
  Settings,
  Users2,
  Mail,
} from "lucide-react";

import TabDetail from "./detail/detail";
import TabTransaksi from "./detail/transaksi";
import TabAnalisis from "./detail/analisis";
import { SidebarPanel } from "./detail/components/sidebarpanel";

// ─── Types ───────────────────────────────────────────────
export type PaymentLinkData = {
  id: number;
  nama: string;
  harga: number;
  harga_coret?: number;
  deskripsi?: string;
  cover?: string;
  cover_url?: string;
  waktu_mulai_jual?: string;
  tanggal_kadaluarsa?: string;
  pesan_setelah_bayar?: string;
  maksimum_pembayaran?: number;
  redirect_url?: string;
  bisa_affiliate: boolean;
  status: "published" | "unpublished" | "unlisted";
  slug: string;
  created_at: string;
};

type Props = {
  link: PaymentLinkData;
  analisis?: any;
  transaksi?: any[];
};

// ─── Placeholder Tab ─────────────────────────────────────
function TabPlaceholder({ label }: { label: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-12 text-center">
      <p className="text-gray-400 text-sm">
        Fitur <strong>{label}</strong> akan segera tersedia
      </p>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────
export default function ShowPaymentLink({ link, analisis, transaksi = [] }: Props) {
  const [activeTab, setActiveTab] = useState<string>("detail");

  const tabs = [
    { id: "detail",    label: "DETAIL",    icon: <BookOpen className="h-3 w-3" /> },
    { id: "transaksi", label: "TRANSAKSI", icon: <BarChart3 className="h-3 w-3" /> },
    { id: "analisis",  label: "ANALISIS",  icon: <BarChart3 className="h-3 w-3" /> },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case "detail":
        return <TabDetail link={link} />;
      case "transaksi":
        return <TabTransaksi transaksi={transaksi} />;
      case "analisis":
        return <TabAnalisis produk={link} analisis={analisis} />;
      default:
        return <TabPlaceholder label={tabs.find((t) => t.id === activeTab)?.label || activeTab} />;
    }
  };

  return (
    <DashboardLayout>
      <Head title={link.nama} />
      <div className="p-6 bg-slate-50/20 min-h-screen">
        {/* Breadcrumb + Title */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-slate-450 font-semibold mb-1">
              PROJEK ·{" "}
              <button
                onClick={() => router.visit("/payment-link")}
                className="hover:text-blue-600 transition"
              >
                Link Pembayaran
              </button>
            </p>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">{link.nama}</h1>
          </div>
          <div className="flex gap-2.5">
            <Button
              variant="outline"
              className="border-gray-200 text-slate-655 hover:bg-slate-50 hover:text-slate-800 text-xs font-bold"
              onClick={() => window.open("/payment-links/catalog", "_blank")}
            >
              PRODUK
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
              onClick={() => router.visit("/semua-produk/create")}
            >
              + BUAT
            </Button>
          </div>
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
                    "px-8 py-2.5 text-xs font-bold tracking-wider transition whitespace-nowrap flex items-center gap-1.5",
                    isActive
                      ? "bg-blue-50 text-blue-600 font-extrabold border-r border-blue-200 last:border-0"
                      : "text-blue-505 hover:bg-slate-50 border-r border-blue-150 last:border-0"
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content + Sidebar */}
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0">{renderTab()}</div>
          <div className="w-full lg:w-80 shrink-0">
            <SidebarPanel link={link} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}


