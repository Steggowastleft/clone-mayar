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
import TabPeserta from "./detail/peserta";
import TabRating from "./detail/rating";

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
}: Props) {
  const [activeTab, setActiveTab] = useState("detail");

  const pembeliLabel =
    produk.tipe === "qurban" ? "PEMESAN" : "DONATUR";

  const tabs = [
    { id: "transaksi", label: "TRANSAKSI", icon: <BarChart3 className="h-3 w-3" /> },
    { id: "detail", label: "DETAIL", icon: <BookOpen className="h-3 w-3" /> },
    { id: "peserta", label: pembeliLabel, icon: <Users2 className="h-3 w-3" /> },
    { id: "rating", label: "RATING", icon: <Star className="h-3 w-3" /> },
    { id: "email", label: "EMAIL", icon: <Mail className="h-3 w-3" /> },
    { id: "pengaturan", label: "SETTING", icon: <Settings className="h-3 w-3" /> },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case "transaksi":
        return <TabTransaksi />;
      case "detail":
        return <TabDetail produk={produk} />;
      case "peserta":
        return <TabPeserta produkId={produk.id} pesertaList={pesertaList} />;
      case "rating":
        return <TabRating ratings={ratings} />;
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

      <div className="p-6">
        <div className="flex justify-between mb-5">
          <div>
            <p className="text-xs text-gray-400">
              PROJEK ·{" "}
              <button
                onClick={() => router.visit("/penggalangan-dana")}
                className="hover:text-blue-600"
              >
                Penggalangan Dana
              </button>
            </p>
            <h1 className="text-xl font-bold">
              {produk.nama}{" "}
              <span className="text-sm text-gray-400 font-normal">
                ({getTipeLabel()})
              </span>
            </h1>
          </div>

          <div className="flex gap-2">
            <Button variant="outline">PRODUK</Button>
            <Button>+ BUAT</Button>
          </div>
        </div>

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

        <div className="flex gap-5">
          <div className="flex-1">{renderTab()}</div>
          <div className="w-64">
            <SidebarPanel produk={produk} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}