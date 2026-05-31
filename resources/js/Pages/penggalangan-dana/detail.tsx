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

import TabTransaksi from "./detail/transaksi";
import TabDetail from "./detail/detail";
import TabAnalisis from "./detail/analisis";

import { SidebarPanel } from "./detail/components/sidebarpanel";
import DashboardLayout from "@/components/dashboard/dashboardlayout";

export type PenggalanganDana = {
  id: number;
  tipe: "donasi" | "qurban" | "wakaf";
  nama: string;
  deskripsi: string | null;
  kategori: string | null;
  jenis_hewan: string | null;
  status: "published" | "unpublished" | "unlisted";
  pembeli: number;
  terkumpul: number;
  tanggal_mulai_jual: string | null;
  tanggal_tutup: string | null;
  harga: number;
  harga_coret: number | null;
  minimal_donasi: number | null;
  stok: number | null;
  tujuan: string | null;
  penerima_manfaat: string | null;
  rincian_penggunaan: string | null;
  catatan: string | null;
  redirect_url: string | null;
  tampilkan_target: boolean;
  tampilkan_pencairan: boolean;
  affiliate_enabled: boolean;
  cover: string | null;
  cover_url: string | null;
  created_at?: string | null;
};

type Props = {
  produk: PenggalanganDana;
  pesertaList?: any[];
  ratings?: any[];
  analisis?: any;
  transaksi?: any[];
};

function TabPlaceholder({ label }: { label: string }) {
  return (
    <div className="bg-white border rounded-lg p-10 text-center text-gray-400">
      Fitur <b>{label}</b> belum tersedia
    </div>
  );
}

export default function PenggalanganDanaDetail({
  produk,
  pesertaList = [],
  ratings = [],
  analisis,
  transaksi = [],
}: Props) {
  const [activeTab, setActiveTab] = useState("detail");

  const tabs = [
    { id: "detail", label: "DETAIL", icon: <BookOpen className="h-3 w-3" /> },
    { id: "transaksi", label: "TRANSAKSI", icon: <BarChart3 className="h-3 w-3" /> },
    { id: "analisis", label: "ANALISIS", icon: <BarChart3 className="h-3 w-3" /> },
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
        return <TabPlaceholder label={activeTab} />;
    }
  };

  const getTipeLabel = () => {
    switch (produk.tipe) {
      case "donasi": return "Donasi";
      case "qurban": return "Qurban";
      case "wakaf": return "Wakaf";
    }
  };

  return (
    <DashboardLayout>
      <Head title={produk.nama} />

      <div className="p-6 bg-slate-50/20 min-h-screen">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-slate-450 font-semibold mb-1">
              PROJEK ·{" "}
              <button
                onClick={() => router.visit("/penggalangan-dana")}
                className="hover:text-blue-600 transition"
              >
                Penggalangan Dana
              </button>
            </p>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              {produk.nama}{" "}
              <span className="text-sm text-slate-400 font-normal">
                ({getTipeLabel()})
              </span>
            </h1>
          </div>

          <div className="flex gap-2.5">
            <Button
              variant="outline"
              onClick={() => window.open("/penggalangan-dana/catalog", "_blank")}
              className="border-gray-200 text-slate-655 hover:bg-slate-50 hover:text-slate-800 text-xs font-bold"
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

        {/* TAB NAVIGATION */}
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

        {/* CONTENT + SIDEBAR */}
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0">{renderTab()}</div>
          <div className="w-full lg:w-80 shrink-0">
            <SidebarPanel produk={produk} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
