import AppLayout from "@/layouts/app-layout";
import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  BarChart3, BookOpen, Clock, CheckSquare, Award,
  Users2, Mail, Puzzle, Route, Handshake, Star,
} from "lucide-react";

// Tab components
import TabTransaksi  from "./detail/transaksi";
import TabDetail     from "./detail/detail";
import TabSesiMeeting from "./detail/sesi-meeting";
import TabModul      from "./detail/modul";
import TabGrade, { type SubmissionItem, type AssignmentOption } from "./detail/grade";
import TabAssignment, { type Assignment } from "./detail/assignment";
import TabPeserta, { type PesertaItem } from "./detail/peserta";
import TabRating, { type RatingItem } from "./detail/rating";

// Sidebar
import { SidebarPanel } from "./detail/components/sidebarpanel";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type Bootcamp = {
  id: number;
  name: string;
  batch: string;
  status: "published" | "unpublished" | "unlisted";
  date: string;
  participants: number;
  kategori?: string;
  harga?: number;
  deskripsi?: string;
  instruksi?: string;
  syarat_ketentuan?: string;
  cover?: string;
  cover_url?: string;
  tanggal_mulai_jual?: string;
  tanggal_tutup_daftar?: string;
  tanggal_mulai_pembelajaran?: string;
  tanggal_batas_pembelajaran?: string;
};

type Props = {
  bootcamp: Bootcamp;
  sesiList?: any[];
  babList?:  any[];
  assignments?: AssignmentOption[];
  submissions?: SubmissionItem[];
  assignmentList?: Assignment[];
  pesertaList?: PesertaItem[];
  ratings?: RatingItem[];
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
export default function BootcampDetail({ bootcamp, sesiList = [], babList = [], assignments = [], submissions = [], assignmentList = [], pesertaList = [], ratings = [] }: Props) {
  const [activeTab, setActiveTab] = useState<string>("detail");

  const tabs = [
    { id: "transaksi",  label: "TRANSAKSI",         icon: <BarChart3 className="h-3 w-3" /> },
    { id: "detail",     label: "DETAIL",             icon: <BookOpen className="h-3 w-3" /> },
    { id: "sesi",       label: "SESI MEETING",       icon: <Clock className="h-3 w-3" /> },
    { id: "modul",      label: "MODUL",              icon: <BookOpen className="h-3 w-3" /> },
    { id: "assignment", label: "ASSIGNMENT",         icon: <CheckSquare className="h-3 w-3" /> },
    { id: "grade",      label: "GRADE & SUBMISSION", icon: <Award className="h-3 w-3" /> },
    { id: "peserta",    label: "PESERTA",            icon: <Users2 className="h-3 w-3" /> },
    { id: "rating",     label: "RATING",             icon: <Star   className="h-3 w-3" /> },
    { id: "email",      label: "EMAIL",              icon: <Mail className="h-3 w-3" /> },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case "transaksi": return <TabTransaksi />;
      case "detail":    return <TabDetail bootcamp={bootcamp} />;
      case "sesi":      return <TabSesiMeeting bootcampId={bootcamp.id} initialSesiList={sesiList} />;
      case "modul":     return <TabModul bootcampId={bootcamp.id} initialBabList={babList} />;
      case "assignment": return <TabAssignment bootcampId={bootcamp.id} initialAssignmentList={assignmentList} />;
      case "peserta":    return <TabPeserta bootcampId={bootcamp.id} pesertaList={pesertaList} />;
      case "rating":     return <TabRating ratings={ratings} />;
      case "grade":     return <TabGrade bootcampId={bootcamp.id} assignments={assignments} submissions={submissions} />;
      default:          return <TabPlaceholder label={tabs.find((t) => t.id === activeTab)?.label || activeTab} />;
    }
  };

  return (
    <AppLayout>
      <Head title={bootcamp.name} />
      <div className="p-6">
        {/* Breadcrumb + Title */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs text-gray-400 mb-1">
              PROJEK ·{" "}
              <button
                onClick={() => router.visit("/bootcamps")}
                className="hover:text-blue-600 transition"
              >
                Kelas Cohort / Bootcamp
              </button>
            </p>
            <h1 className="text-xl font-bold text-gray-800">{bootcamp.name}</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-blue-500 text-blue-600 hover:bg-blue-50 text-sm">
              PRODUK
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm">+ BUAT</Button>
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
            <SidebarPanel bootcamp={bootcamp} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}