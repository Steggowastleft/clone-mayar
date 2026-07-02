import AppLayout from "@/layouts/app-layout";
import { Head, router } from "@inertiajs/react";
import { useState, lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  BookOpen,
  Users2,
  Star,
  Mail,
  CheckSquare,
  Ticket,
  Settings,
} from "lucide-react";

// Tab components
import TabTransaksi from "./detail/transaksi";
import TabDetail from "./detail/detail";
import TabAnalisis from "./detail/analisis";

// Sidebar
import { SidebarPanel } from "./detail/components/sidebarpanel";
import DashboardLayout from "@/components/dashboard/dashboardlayout";

const TabRating = lazy(() => import("../bootcamps/detail/rating"));

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
export type EventData = {
  id: number;
  name: string;
  status: "published" | "unpublished" | "unlisted";
  date: string;
  tipe: "online" | "offline";
  lokasi?: string;
  lokasi_map?: string;
  deskripsi?: string;
  instruksi?: string;
  syarat_ketentuan?: string;
  cover?: string;
  cover_url?: string;
  waktu_mulai?: string;
  waktu_selesai?: string;
  waktu_mulai_jual?: string;
  tanggal_tutup_daftar?: string;
  max_tiket_per_transaksi?: number;
  redirect_url?: string;
  bisa_affiliate?: boolean;
  participants: number;
};

export type PembicaraItem = {
  id: number;
  nama: string;
  pekerjaan: string;
  profil: string;
  foto_url?: string;
};

type Props = {
  event: EventData;
  pesertaList?: any[];
  ratings?: any[];
  tiketList?: any[];
  pembicaraList?: PembicaraItem[];
  analisis?: any;
  transaksi?: any[];
};

// ─────────────────────────────────────────────
// Placeholder tab
// ─────────────────────────────────────────────
function TabPlaceholder({ label }: { label: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-12 text-center">
      <p className="text-gray-400 text-sm">
        Fitur <strong>{label}</strong> akan segera tersedia
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
export default function EventDetail({
  event,
  pesertaList = [],
  ratings = [],
  tiketList = [],
  pembicaraList = [],
  analisis,
  transaksi = [],
}: Props) {
  const [activeTab, setActiveTab] = useState<string>("detail");

  const tabs = [
    {
      id: "detail",
      label: "DETAIL",
      icon: <BookOpen className="h-3 w-3" />,
    },
    {
      id: "transaksi",
      label: "TRANSAKSI",
      icon: <BarChart3 className="h-3 w-3" />,
    },
    {
      id: "analisis",
      label: "ANALISIS",
      icon: <BarChart3 className="h-3 w-3" />,
    },
    {
      id: "rating",
      label: "RATING",
      icon: <Star className="h-3 w-3" />,
    },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case "detail":
        return <TabDetail event={event} pembicaraList={pembicaraList} />;
      case "transaksi":
        return <TabTransaksi transaksi={transaksi} />;
      case "analisis":
        return <TabAnalisis produk={event} analisis={analisis} />;
      case "rating":
        return (
          <Suspense fallback={<div className="p-6 text-gray-400">Loading rating...</div>}>
            <TabRating ratings={ratings} />
          </Suspense>
        );
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
      <Head title={event.name} />

      <div className="p-6 bg-slate-50/20 min-h-screen">
        {/* Breadcrumb + Title */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-slate-450 font-semibold mb-1">
              PROJEK ·{" "}
              <button
                onClick={() => router.visit("/event")}
                className="hover:text-blue-600 transition"
              >
                Event & Acara
              </button>
            </p>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              {event.name}
            </h1>
          </div>
          <div className="flex gap-2.5">
            <Button
              variant="outline"
              className="border-gray-200 text-slate-655 hover:bg-slate-50 hover:text-slate-800 text-xs font-bold"
              onClick={() => window.open("/events/catalog", "_blank")}
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
            <SidebarPanel event={event} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
