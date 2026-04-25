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
export default function ShowPaymentLink({ link }: Props) {
  const [activeTab, setActiveTab] = useState<string>("detail");

  const tabs = [
    { id: "transaksi", label: "TRANSAKSI", icon: <BarChart3 className="h-3 w-3" /> },
    { id: "detail",    label: "DETAIL",    icon: <BookOpen className="h-3 w-3" /> },
    { id: "pembeli",   label: "PEMBELI",   icon: <Users2 className="h-3 w-3" /> },
    { id: "email",     label: "EMAIL",     icon: <Mail className="h-3 w-3" /> },
    { id: "pengaturan",label: "PENGATURAN",icon: <Settings className="h-3 w-3" /> },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case "transaksi":
        return <TabTransaksi />;
      case "detail":
        return <TabDetail link={link} />;
      default:
        return <TabPlaceholder label={tabs.find((t) => t.id === activeTab)?.label || activeTab} />;
    }
  };

  return (
    <DashboardLayout>
      <Head title={link.nama} />
      <div className="p-6">
        {/* Breadcrumb + Title */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs text-gray-400 mb-1">
              PROJEK ·{" "}
              <button
                onClick={() => router.visit("/payment-link")}
                className="hover:text-blue-600 transition"
              >
                Link Pembayaran
              </button>
            </p>
            <h1 className="text-xl font-bold text-gray-800">{link.nama}</h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-blue-500 text-blue-600 hover:bg-blue-50 text-sm"
            >
              PRODUK
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm">
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
                    ? "border-blue-600 text-blue-600"
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
            <SidebarPanel link={link} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
