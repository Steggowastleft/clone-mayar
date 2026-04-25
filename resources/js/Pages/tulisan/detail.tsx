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
} from "lucide-react";

import TabDetail from "./detail/detail";
import { SidebarPanel } from "./detail/components/sidebarpanel";
import DashboardLayout from "@/components/dashboard/dashboardlayout";

// ─────────────────────────────────────────────
// TYPE
// ─────────────────────────────────────────────
export type Tulisan = {
  id: number;
  nama: string;
  deskripsi: string | null;
  url: string | null;
  status: "published" | "unpublished" | "unlisted";
  tipe_tulisan: string;
  tipe_pembayaran: string | null;
  mekanisme_bayar: string | null;
  harga: number;
  tanggal_mulai_jual: string | null;
  tanggal_kadaluarsa: string | null;
  terjual: number;
  max_pembayaran: number | null;
  genre: string | null;
  author: string | null;
  bahasa: string | null;
  affiliate_enabled: boolean;
  cover: string | null;
  catatan: string | null;
  created_at: string;
};

type Props = {
  tulisan: Tulisan;
};

// ─────────────────────────────────────────────
function TabPlaceholder({ label }: { label: string }) {
  return (
    <div className="bg-white border rounded-lg p-10 text-center text-gray-400">
      Fitur <b>{label}</b> belum tersedia
    </div>
  );
}

// ─────────────────────────────────────────────
export default function TulisanDetail({ tulisan }: Props) {
  const [activeTab, setActiveTab] = useState("detail");

  const tabs = [
    { id: "transaksi", label: "TRANSAKSI", icon: <BarChart3 className="h-3 w-3" /> },
    { id: "detail", label: "DETAIL", icon: <BookOpen className="h-3 w-3" /> },
    { id: "pembeli", label: "PEMBELI", icon: <Users2 className="h-3 w-3" /> },
    { id: "rating", label: "RATING", icon: <Star className="h-3 w-3" /> },
    { id: "email", label: "EMAIL", icon: <Mail className="h-3 w-3" /> },
    { id: "pengaturan", label: "SETTING", icon: <Settings className="h-3 w-3" /> },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case "detail":
        return <TabDetail tulisan={tulisan} />;
      default:
        return <TabPlaceholder label={activeTab} />;
    }
  };

  return (
    <DashboardLayout>
      <Head title={tulisan.nama} />

      <div className="p-6">
        {/* HEADER */}
        <div className="flex justify-between mb-5">
          <div>
            <p className="text-xs text-gray-400">
              PROJEK ·{" "}
              <button
                onClick={() => router.visit("/tulisan")}
                className="hover:text-blue-600"
              >
                Tulisan
              </button>
            </p>

            <h1 className="text-xl font-bold">
              {tulisan.nama}
            </h1>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.open("/tulisan/catalog", "_blank")}>PRODUK</Button>
            <Button onClick={() => router.visit("/tulisan")}>+ BUAT</Button>
          </div>
        </div>

        {/* TAB */}
        <div className="border-b mb-5">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-4 py-2 text-xs border-b-2 flex gap-1 items-center",
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500"
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex gap-5">
          <div className="flex-1">{renderTab()}</div>

          <div className="w-64">
            <SidebarPanel tulisan={tulisan} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
