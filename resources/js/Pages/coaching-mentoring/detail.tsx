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

import DetailTab from "./detail/detail";
import TransaksiTab from "./detail/transaksi";
import PesertaTab from "./detail/peserta";
import RatingTab from "./detail/rating";

import { SidebarPanel } from "./detail/components/sidebarpanel";
import DashboardLayout from "@/components/dashboard/dashboardlayout";

// ✅ TYPE (PASTIKAN INI YANG PALING LENGKAP)
export type CoachingMentoring = {
  id: number;
  nama: string;
  deskripsi: string;
  booking_url: string;
  tipe_pembayaran: "berbayar" | "gratis";
  harga: number | null;
  harga_coret: number | null;
  cover: string | null;
  waktu_mulai_jual: string | null;
  tanggal_kadaluarsa: string | null;
  max_pembayaran: number | null;
  instruksi: string | null;
  syarat_ketentuan: string | null;
  bisa_affiliate: boolean;
  status: "published" | "unpublished" | "unlisted";
  total_penjualan: number;
  user_id: number;
  created_at: string;
  updated_at: string;
};

type Props = {
  coaching: CoachingMentoring;
};

export default function CoachingMentoringDetail({ coaching }: Props) {
  const [activeTab, setActiveTab] = useState("detail");

  // ✅ FIX: langsung assign, jangan function initializer
  const [coachingData, setCoachingData] = useState<CoachingMentoring>(coaching);

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
        return <TransaksiTab coachingId={coachingData.id} />;

      case "detail":
        return (
          <DetailTab
            coaching={coachingData}
            // ✅ FORCE TYPE BIAR TS DIAM
            onUpdate={(updated) =>
              setCoachingData(updated as CoachingMentoring)
            }
          />
        );

      case "peserta":
        return (
          <PesertaTab
            coachingId={coachingData.id}
            pesertaList={[]}
          />
        );

      case "rating":
        return (
          <RatingTab
            coachingId={coachingData.id}
            ratings={[]}
          />
        );

      default:
        return (
          <div className="bg-white border rounded-lg p-10 text-center text-gray-400">
            Fitur <b>{activeTab}</b> belum tersedia
          </div>
        );
    }
  };

  return (
    <DashboardLayout>
      <Head title={coachingData.nama} />

      <div className="p-6">
        {/* HEADER */}
        <div className="flex justify-between mb-5">
          <div>
            <p className="text-xs text-gray-400">
              PROJEK ·{" "}
              <button
                onClick={() => router.visit("/coaching-mentoring")}
                className="hover:text-blue-600"
              >
                Coaching & Mentoring
              </button>
            </p>

            <h1 className="text-xl font-bold">{coachingData.nama}</h1>
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
            <SidebarPanel
              coaching={coachingData}
              // ✅ FIX UTAMA DI SINI JUGA
              onUpdate={(updated) =>
                setCoachingData(updated as CoachingMentoring)
              }
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}