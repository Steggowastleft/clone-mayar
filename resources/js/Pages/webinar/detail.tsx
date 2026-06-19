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
import TabPeserta, { type PesertaItem } from "./detail/peserta";
import TabRating, { type RatingItem } from "./detail/rating";

import { SidebarPanel } from "./detail/components/sidebarpanel";
import DashboardLayout from "@/components/dashboard/dashboardlayout";

// ─────────────────────────────────────────────
// TYPE (FIXED SESUAI DB)
// ─────────────────────────────────────────────
export type Webinar = {
  id: number;
  nama: string;
  deskripsi: string | null;
  url: string | null;

  status: "published" | "unpublished" | "unlisted";

  peserta: number;
  max_peserta: number | null;

  tanggal_mulai: string | null;
  tanggal_selesai: string | null;

  harga: number;
  harga_coret: number | null;
  created_at?: string | null;

  pembicaras?: {
    id: number;
    nama: string;
    pekerjaan: string;
    profil: string;
    foto_url: string | null;
  }[];
};

type Props = {
  webinar: Webinar;
  pesertaList?: PesertaItem[];
  ratings?: RatingItem[];
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
export default function WebinarDetail({
  webinar,
  pesertaList = [],
  ratings = [],
}: Props) {
  const [activeTab, setActiveTab] = useState("detail");

  const tabs = [
    { id: "transaksi", label: "TRANSAKSI", icon: <BarChart3 className="h-3 w-3" /> },
    { id: "detail", label: "DETAIL", icon: <BookOpen className="h-3 w-3" /> },
    { id: "peserta", label: "PESERTA", icon: <Users2 className="h-3 w-3" /> },
    { id: "rating", label: "RATING", icon: <Star className="h-3 w-3" /> },
    { id: "email", label: "EMAIL", icon: <Mail className="h-3 w-3" /> },
    { id: "pengaturan", label: "SETTING", icon: <Settings className="h-3 w-3" /> },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case "transaksi":
        return <TabTransaksi />;

      case "detail":
        return <TabDetail webinar={webinar} />;

      case "peserta":
        return (
          <TabPeserta
            webinarId={webinar.id}
            pesertaList={pesertaList}
          />
        );

      case "rating":
        return <TabRating ratings={ratings} />;

      default:
        return <TabPlaceholder label={activeTab} />;
    }
  };

  return (
    <DashboardLayout>
      <Head title={webinar.nama} />

      <div className="p-6 bg-slate-50/20 min-h-screen">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-slate-450 font-semibold mb-1">
              PROJEK ·{" "}
              <button
                onClick={() => router.visit("/webinar")}
                className="hover:text-blue-600 transition"
              >
                Webinar
              </button>
            </p>

            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              {webinar.nama}
            </h1>
          </div>

          <div className="flex gap-2.5">
            <Button
              variant="outline"
              onClick={() => window.open("/webinars/catalog", "_blank")}
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
                      : "text-blue-500 hover:bg-slate-50 border-r border-blue-150 last:border-0"
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
            <SidebarPanel webinar={webinar} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}