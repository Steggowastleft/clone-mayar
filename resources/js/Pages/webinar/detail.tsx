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

      <div className="p-6">
        {/* HEADER */}
        <div className="flex justify-between mb-5">
          <div>
            <p className="text-xs text-gray-400">
              PROJEK ·{" "}
              <button
                onClick={() => router.visit("/webinar")}
                className="hover:text-blue-600"
              >
                Webinar
              </button>
            </p>

            <h1 className="text-xl font-bold">
              {webinar.nama}
            </h1>
          </div>

          <div className="flex gap-2">
            <Button variant="outline">PRODUK</Button>
            <Button>+ BUAT</Button>
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
            <SidebarPanel webinar={webinar} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}