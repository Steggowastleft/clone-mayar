import DashboardLayout from "@/components/dashboard/dashboardlayout";
import { Head, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  BookOpen,
  Users2,
  Star,
  Mail,
  Settings,
  ChevronDown,
  Edit,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import TabDetail from "./detail/detail";
import TabPeserta from "./detail/peserta";
import TabTransaksi from "./detail/transaksi";
import TabRating from "./detail/rating";
import TabTiket from "./detail/tiket";

type BundlingItem = {
  id: number;
  nama: string;
  tipe: string;
  harga: number;
  cover?: string;
};

export type Bundling = {
  id: number;
  nama: string;
  harga: number;
  harga_coret?: number;
  deskripsi?: string;
  cover_url?: string;
  tipe_pembayaran: string;
  tanggal_kadaluarsa?: string;
  pesan_setelah_bayar?: string;
  maksimal_pembayaran?: number;
  redirect_url?: string;
  bisa_affiliate: boolean;
  status: "published" | "unpublished";
  jumlah_terjual: number;
  items: BundlingItem[];
  registrasi_count: number;
  peserta_list?: any[];
  transaksi_list?: any[];
};

type ShowProps = {
  bundling: Bundling;
};

function TabPlaceholder({ label }: { label: string }) {
  return (
    <div className="bg-white border rounded-lg p-10 text-center text-gray-400">
      Fitur <b>{label}</b> belum tersedia
    </div>
  );
}

export default function Show({ bundling }: ShowProps) {
  const [activeTab, setActiveTab] = useState("detail");
  const [statusOpen, setStatusOpen] = useState(false);

  const tabs = [
    { id: "transaksi", label: "TRANSAKSI", icon: <BarChart3 className="h-3 w-3" /> },
    { id: "detail", label: "DETAIL", icon: <BookOpen className="h-3 w-3" /> },
    { id: "peserta", label: "PESERTA", icon: <Users2 className="h-3 w-3" /> },
    { id: "rating", label: "RATING", icon: <Star className="h-3 w-3" /> },
    { id: "tiket", label: "TIKET", icon: <Mail className="h-3 w-3" /> },
    { id: "pengaturan", label: "SETTING", icon: <Settings className="h-3 w-3" /> },
  ];

  const handleDelete = () => {
    if (confirm("Apakah Anda yakin ingin menghapus bundling ini?")) {
      router.delete(`/bundling/${bundling.id}`, {
        onSuccess: () => {
          toast.success("Bundling berhasil dihapus");
          router.visit("/bundling");
        },
      });
    }
  };

  const handleStatusChange = (status: string) => {
    router.patch(
      `/bundling/${bundling.id}/status`,
      { status },
      {
        onSuccess: () => {
          toast.success("Status berhasil diubah");
          setStatusOpen(false);
        },
      }
    );
  };

  const renderTab = () => {
    switch (activeTab) {
      case "detail":
        return <TabDetail bundling={bundling} />;
      case "peserta":
        return <TabPeserta bundlingId={bundling.id} pesertaList={bundling.peserta_list ?? []} />;
      case "transaksi":
        return <TabTransaksi bundlingId={bundling.id} transaksiList={bundling.transaksi_list ?? []} />;
      case "rating":
        return <TabRating bundlingId={bundling.id} />;
      case "tiket":
        return <TabTiket bundlingId={bundling.id} />;
      default:
        return <TabPlaceholder label={activeTab} />;
    }
  };

  return (
    <DashboardLayout>
      <Head title={bundling.nama} />

      <div className="p-6">
        {/* HEADER */}
        <div className="flex justify-between mb-5">
          <div>
            <p className="text-xs text-gray-400">
              PROJEK ·{" "}
              <button
                onClick={() => router.visit("/bundling")}
                className="hover:text-blue-600 transition-colors"
              >
                Bundling
              </button>
            </p>
            <h1 className="text-xl font-bold text-gray-800">{bundling.nama}</h1>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => window.open("/bundling/catalog", "_blank")}
              className="text-xs font-bold"
            >
              PRODUK
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
              onClick={() => router.visit("/bundling")}
            >
              + BUAT
            </Button>
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div className="border-b mb-5">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-4 py-2 text-xs border-b-2 flex gap-1 items-center font-bold transition-all",
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0">{renderTab()}</div>

          {/* SIDEBAR PANEL */}
          <div className="w-full lg:w-64 shrink-0 space-y-4">
            <div className="bg-white border rounded-lg p-3 space-y-2 shadow-sm">
              {/* STATUS DROPDOWN */}
              <div className="relative">
                <button
                  onClick={() => setStatusOpen((v) => !v)}
                  className={cn(
                    "w-full py-2.5 text-white font-black text-xs rounded-md flex items-center justify-center gap-2 transition-all",
                    bundling.status === "published"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-yellow-500 hover:bg-yellow-600"
                  )}
                >
                  {bundling.status?.toUpperCase() || "UNKNOWN"}
                  <ChevronDown className={cn("h-4 w-4", statusOpen && "rotate-180 transition-transform")} />
                </button>

                {statusOpen && (
                  <div className="absolute w-full bg-white border mt-1 rounded-md shadow-xl z-50 overflow-hidden">
                    {[
                      { value: "published", label: "Published" },
                      { value: "unpublished", label: "Unpublished" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleStatusChange(opt.value)}
                        className="w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-gray-50 transition-colors border-b last:border-b-0"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <button
                onClick={() => router.visit(`/bundling/${bundling.id}/edit`)}
                className="w-full border border-gray-200 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50 rounded-md flex gap-2 justify-center items-center transition-all"
              >
                <Edit className="h-3.5 w-3.5" /> EDIT
              </button>

              <button
                onClick={handleDelete}
                className="w-full border border-red-100 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-md flex gap-2 justify-center items-center transition-all"
              >
                <Trash2 className="h-3.5 w-3.5" /> HAPUS
              </button>
            </div>

            {/* QUICK STATS */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                Penjualan
              </p>
              <p className="text-2xl font-black text-gray-900 mt-1">
                {bundling.jumlah_terjual}
              </p>
              <p className="text-[10px] text-gray-500 font-bold">paket terjual</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                Item Bundling
              </p>
              <p className="text-2xl font-black text-gray-900 mt-1">
                {bundling.items.length}
              </p>
              <p className="text-[10px] text-gray-500 font-bold">produk tergabung</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
