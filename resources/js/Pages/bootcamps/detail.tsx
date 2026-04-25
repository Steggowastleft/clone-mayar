import { Head, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  BookOpen,
  Clock,
  Users2,
  Mail,
  Star,
} from "lucide-react";

import DashboardLayout from "@/components/dashboard/dashboardlayout";

// Tabs (lu bisa bikin file terpisah nanti)
import TabTransaksi from "./detail/transaksi";
import TabDetail from "./detail/detail";
import TabPeserta from "./detail/peserta";
import TabRating from "./detail/rating";
// TAB ENGINE (controller utama)
import TabBootcampDetail from "./detail/tab-detail";

// types dari tab biar props tetap aman
import type { SubmissionItem, AssignmentOption } from "./detail/grade";
import type { Assignment } from "./detail/assignment";
import type { PesertaItem } from "./detail/peserta";
import type { RatingItem } from "./detail/rating";
import type { PembayaranItem } from "./detail/pembayaran";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
type Webinar = {

type Bootcamp = {
  id: number;
  nama: string;
  status: "published" | "unpublished" | "unlisted";
  deskripsi?: string;
  harga?: number;
  url?: string;
  tanggal_mulai?: string;
  tanggal_selesai?: string;
  cover_url?: string;

  peserta?: number;
  max_peserta?: number;
};

type Props = {
  webinar: Webinar;
  pesertaList?: any[];
  ratings?: any[];
};

// ─────────────────────────────────────────────
// PLACEHOLDER
// ─────────────────────────────────────────────
function TabPlaceholder({ label }: { label: string }) {
  return (
    <div className="bg-white border rounded-lg p-10 text-center text-gray-400 text-sm">
      Fitur <b>{label}</b> belum tersedia
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN
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
    { id: "sesi", label: "SESI", icon: <Clock className="h-3 w-3" /> },
    { id: "peserta", label: "PESERTA", icon: <Users2 className="h-3 w-3" /> },
    { id: "rating", label: "RATING", icon: <Star className="h-3 w-3" /> },
    { id: "email", label: "EMAIL", icon: <Mail className="h-3 w-3" /> },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case "transaksi":
        return <TabTransaksi />;
      case "detail":
        return <TabDetail webinar={webinar} />;
      case "peserta":
        return <TabPeserta webinarId={webinar.id} pesertaList={pesertaList} />;
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
=======
};

type Props = {
  bootcamp: Bootcamp;
  sesiList?: any[];
  babList?: any[];
  assignments?: AssignmentOption[];
  submissions?: SubmissionItem[];
  assignmentList?: Assignment[];
  pesertaList?: PesertaItem[];
  ratings?: RatingItem[];
  pembayaranList?: PembayaranItem[];
};


export default function BootcampDetail(props: Props) {
  const { bootcamp } = props;
  console.log("PAGE PROPS:", props);

  return (
    <AppLayout>
      <Head title={bootcamp?.name || "Bootcamp Detail"} />

      <div className="p-6">
        {/* Header */}
>>>>>>> 6154584d0dddd0c40e81c62fb0a0fb6b066cc378
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs text-gray-400 mb-1">
              PROJEK ·{" "}
              <button
                onClick={() => router.visit("/webinars")}
                className="hover:text-blue-600"
              >
                Webinar
              </button>
            </p>

            <h1 className="text-xl font-bold text-gray-800">
              {webinar.nama}
=======

            <h1 className="text-xl font-bold text-gray-800">
              {bootcamp?.name}
    
            </h1>
          </div>

          <div className="flex gap-2">

            <Button variant="outline">PRODUK</Button>
            <Button className="bg-blue-600 text-white">+ BUAT</Button>
          </div>
        </div>

        {/* TAB */}
        <div className="border-b mb-5 overflow-x-auto">
          <div className="flex min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-4 py-2 text-xs font-semibold border-b-2 flex items-center gap-1",
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

          {/* FIX: sidebar harus sticky + width konsisten */}
          <div className="w-64 shrink-0">
            <SidebarPanel webinar={webinar} />
          </div>
        </div>
=======
            <Button
              variant="outline"
              className="border-blue-500 text-blue-600 hover:bg-blue-50 text-sm"
              onClick={() => window.open(`/bootcamp/${bootcamp.id}`, "_blank")}
            >
              PRODUK
            </Button>

            <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm">
              + BUAT
            </Button>
          </div>
        </div>

  

        {/* TAB SYSTEM - hanya render sekali */}
        <TabBootcampDetail {...props} />
      </div>
    </DashboardLayout>
  );
}