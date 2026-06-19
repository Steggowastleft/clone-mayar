import { useState, lazy, Suspense, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  BookOpen,
  Clock,
  CheckSquare,
  Award,
  Users2,
  Mail,
  Star,
  CreditCard,
} from "lucide-react";

// Lazy tabs
const TabTransaksi = lazy(() => import("./transaksi"));
const TabDetail = lazy(() => import("./detail"));
const TabSesiMeeting = lazy(() => import("./sesi-meeting"));
const TabModul = lazy(() => import("./modul"));
const TabGrade = lazy(() => import("./grade"));
const TabAssignment = lazy(() => import("./assignment"));
const TabPeserta = lazy(() => import("./peserta"));
const TabRating = lazy(() => import("./rating"));
const TabPembayaran = lazy(() => import("./pembayaran"));
const TabEmail = lazy(() => import("./email"));

// FIX IMPORT SIDEBAR PANEL (INI YANG KRUSIAL)
import { SidebarPanel } from "./components/sidebarpanel";

type Props = {
  bootcamp: any;
  sesiList?: any[];
  babList?: any[];
  assignments?: any[];
  submissions?: any[];
  assignmentList?: any[];
  pesertaList?: any[];
  ratings?: any[];
  pembayaranList?: any[];
};

export default function TabBootcampDetail({
  bootcamp,
  sesiList = [],
  babList = [],
  assignments = [],
  submissions = [],
  assignmentList = [],
  pesertaList = [],
  ratings = [],
  pembayaranList = [],
}: Props) {
  const [activeTab, setActiveTab] = useState("detail");
console.log("TAB ENGINE PROPS:", {
  sesiList,
  babList,
  assignmentList,
  pesertaList,
  ratings,
  pembayaranList,
});
  const tabs = useMemo(
    () => [
      { id: "transaksi", label: "TRANSAKSI", icon: <BarChart3 className="h-3 w-3" /> },
      { id: "pembayaran", label: "PEMBAYARAN", icon: <CreditCard className="h-3 w-3" /> },
      { id: "detail", label: "DETAIL", icon: <BookOpen className="h-3 w-3" /> },
      { id: "sesi", label: "SESI MEETING", icon: <Clock className="h-3 w-3" /> },
      { id: "modul", label: "MODUL", icon: <BookOpen className="h-3 w-3" /> },
      { id: "assignment", label: "TUGAS/UJIAN", icon: <CheckSquare className="h-3 w-3" /> },
      { id: "grade", label: "GRADE & SUBMISSION", icon: <Award className="h-3 w-3" /> },
      { id: "peserta", label: "PESERTA", icon: <Users2 className="h-3 w-3" /> },
      { id: "rating", label: "RATING", icon: <Star className="h-3 w-3" /> },
      { id: "email", label: "EMAIL", icon: <Mail className="h-3 w-3" /> },
    ],
    []
  );

  const renderTab = () => {
    switch (activeTab) {
      case "transaksi":
        return (
    <TabTransaksi
      pesertaList={pesertaList}
      bootcamp={bootcamp}
    />
  );

      case "detail":
        return <TabDetail bootcamp={bootcamp} />;

      case "sesi":
        return (
          <TabSesiMeeting
            bootcampId={bootcamp.id}
            initialSesiList={sesiList}
          />
        );

      case "modul":
        return (
          <TabModul bootcampId={bootcamp.id} initialBabList={babList} />
        );

      case "assignment":
        return (
          <TabAssignment
            bootcampId={bootcamp.id}
            initialAssignmentList={assignmentList}
          />
        );

      case "grade":
        return (
          <TabGrade
            bootcampId={bootcamp.id}
            assignments={assignments}
            submissions={submissions}
          />
        );

      case "peserta":
        return (
          <TabPeserta bootcampId={bootcamp.id} pesertaList={pesertaList} />
        );

      case "rating":
        return <TabRating ratings={ratings} />;

      case "pembayaran":
        return (
          <TabPembayaran
            bootcampId={bootcamp.id}
            pembayaranList={pembayaranList}
          />
        );

      case "email":
        return (
    <TabEmail
      pesertaList={pesertaList}
    />
  );
    }
  };

  return (
    <div className="space-y-6">
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
        {/* KONTEN */}
        <div className="flex-1 min-w-0">
          <Suspense
            fallback={
              <div className="p-10 text-center text-gray-500">
                Memuat tab...
              </div>
            }
          >
            <div className="min-h-[200px]">
              {renderTab()}
            </div>
          </Suspense>
        </div>

        {/* SIDEBAR */}
        <div className="w-full lg:w-80 shrink-0">
          <SidebarPanel bootcamp={bootcamp} />
        </div>
      </div>
    </div>
  );
}