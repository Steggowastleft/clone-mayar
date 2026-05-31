import { useState, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Link } from "@inertiajs/react";
import axios from "axios";
import {
  BookOpen,
  CheckSquare,
  Award,
  Mail,
  BarChart3,
  CalendarCheck,
  Medal,
  User,
  Video,
} from "lucide-react";

import { SidebarPanel } from "../components/sidebarpanel";
import TabDetail from "./tab-detail";
import TabAssignment from "./tab-assignment";
import TabGrade from "./tab-grade";
import TabEmail from "./tab-email";
import TabTransaksi from "./tab-transaksi";
import TabSection from "./tab-section";
import TabInstructor from "./tab-instructor";
import TabMeeting from "./tab-meeting";

// ================================================================
const SESI_CFG = {
  awal: { icon: "🌅", label: "Awal", color: "from-emerald-500 to-teal-500" },
  tengah: { icon: "☀️", label: "Tengah", color: "from-amber-500 to-orange-500" },
  akhir: { icon: "🌙", label: "Akhir", color: "from-violet-500 to-purple-500" },
};

function PresensiTab({ kelas, isOwner }: { kelas: any; isOwner: boolean }) {
  if (isOwner) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-500 mb-2">
          Buka dan tutup sesi presensi. Peserta hanya bisa upload bukti saat sesi aktif.
        </p>

        {(["awal", "tengah", "akhir"] as const).map((tipe) => {
          const sesi = kelas.sesi?.find((s: any) => s.tipe === tipe);
          const cfg = SESI_CFG[tipe];
          return (
            <div
              key={tipe}
              className="flex items-center justify-between bg-gray-50 rounded-xl p-4 border border-gray-200"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cfg.color} flex items-center justify-center text-lg`}>
                  {cfg.icon}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{cfg.label}</p>
                  <p className="text-xs text-gray-400">
                    {sesi?.is_aktif ? "🔴 Sesi terbuka" : "Tertutup"}
                  </p>
                </div>
              </div>

              {sesi && (
                <Link
                  href={`/kelas-online/sesi/${sesi.id}/attendance/manage`}
                  className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-white transition-colors"
                >
                  Kelola →
                </Link>
              )}
            </div>
          );
        })}

        <div className="pt-4 border-t border-gray-100">
          <Link
            href={`/kelas-online/${kelas.id}/sertifikat/manage`}
            className="text-sm text-indigo-600 font-medium hover:underline"
          >
            → Kelola semua sertifikat peserta
          </Link>
        </div>
      </div>
    );
  }

  // Peserta view
  const sesiAktif = kelas.sesi?.find((s: any) => s.is_aktif);

  return (
    <div className="space-y-4">
      {sesiAktif ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <p className="font-semibold text-emerald-700">🔴 Sesi presensi sedang berlangsung!</p>
          <p className="text-sm text-emerald-600 mt-1">{sesiAktif.judul}</p>
          <Link
            href={`/peserta/sesi/${sesiAktif.id}/attendance`}
            className="mt-3 inline-block px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700"
          >
            Upload Presensi Sekarang →
          </Link>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
          <p className="text-gray-500 text-sm">Tidak ada sesi presensi yang aktif saat ini.</p>
        </div>
      )}

      {kelas.sesi?.map((sesi: any) => {
        const cfg = SESI_CFG[sesi.tipe as keyof typeof SESI_CFG];
        return (
          <div key={sesi.id} className="flex items-center justify-between bg-white rounded-xl p-3 border border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-base">{cfg?.icon}</span>
              <p className="text-sm font-medium text-gray-700">{sesi.judul}</p>
            </div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full
              ${sesi.is_aktif ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
              {sesi.is_aktif ? "Aktif" : "Tutup"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function SertifikatTab({ kelas, isOwner }: { kelas: any; isOwner: boolean }) {
  const [status, setStatus] = useState<{ eligible: boolean; reason: string; certificate: any } | null>(null);
  const [loading, setLoading] = useState(!isOwner);

  const checkStatus = async () => {
    try {
      const { data } = await axios.get(`/peserta/kelas-online/${kelas.id}/sertifikat/check`);
      setStatus(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOwner) {
      checkStatus();
      const interval = setInterval(checkStatus, 20000); // Refresh every 20s
      return () => clearInterval(interval);
    }
  }, [kelas.id, isOwner]);

  if (isOwner) {
    return (
      <div className="text-center py-8">
        <Link
          href={`/kelas-online/${kelas.id}/sertifikat/manage`}
          className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700"
        >
          Buka Halaman Kelola Sertifikat →
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center py-8 px-4">
      {loading ? (
        <p className="text-gray-400 text-sm animate-pulse">Memeriksa status kelulusan...</p>
      ) : status?.eligible ? (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 mb-6">
          <div className="text-4xl mb-3">🎓</div>
          <h3 className="text-emerald-900 font-bold text-lg">Selamat! Anda Telah Lulus</h3>
          <p className="text-emerald-600 text-sm mt-1 mb-6">
            Sertifikat Anda telah diterbitkan secara otomatis.
          </p>
          <Link
            href="/peserta/kelas-online/sertifikat"
            className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all"
          >
            Ambil Sertifikat Sekarang →
          </Link>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 mb-6">
          <div className="text-4xl mb-3">⏳</div>
          <h3 className="text-gray-900 font-bold text-lg">Sertifikat Belum Tersedia</h3>
          <p className="text-gray-500 text-sm mt-1 max-w-sm mx-auto">
            {status?.reason || "Lengkapi seluruh presensi dan tugas untuk mendapatkan sertifikat."}
          </p>
          <div className="mt-6 pt-6 border-t border-gray-100">
             <Link
                href="/peserta/kelas-online/sertifikat"
                className="text-indigo-600 font-semibold text-sm hover:underline"
              >
                Lihat Daftar Sertifikat Saya →
              </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// ================================================================

type Props = {
  kelas: any;
  isOwner: boolean;
  materi?: { file: string | null; name: string | null };
  assignments?: any[];
  submissions?: any[];
  pesertaList?: any[];
};

export default function TabEngineKelasOnline({ kelas, isOwner, materi, assignments = [], submissions = [], pesertaList = [] }: Props) {
  const [activeTab, setActiveTab] = useState(isOwner ? "detail" : "section");

  const tabsOwner = useMemo(
    () => [
      { id: "detail", label: "DETAIL", icon: <BookOpen className="h-3 w-3" /> },
      { id: "section", label: "MATERI", icon: <BookOpen className="h-3 w-3" /> },
      { id: "meeting", label: "SESI", icon: <Video className="h-3 w-3" /> },
      { id: "instruktur", label: "INSTRUKTUR", icon: <User className="h-3 w-3" /> },
      { id: "presensi", label: "PRESENSI", icon: <CalendarCheck className="h-3 w-3" /> },
      { id: "sertifikat", label: "SERTIFIKAT", icon: <Medal className="h-3 w-3" /> },
      ...(kelas.has_assignment ? [{ id: "assignment", label: "ASSIGNMENT", icon: <CheckSquare className="h-3 w-3" /> }] : []),
      { id: "grade", label: "NILAI", icon: <Award className="h-3 w-3" /> },
      { id: "email", label: "EMAIL", icon: <Mail className="h-3 w-3" /> },
      { id: "transaksi", label: "TRANSAKSI", icon: <BarChart3 className="h-3 w-3" /> },
    ],
    [kelas.has_assignment]
  );

  const tabsPeserta = useMemo(
    () => [
      { id: "section", label: "MATERI", icon: <BookOpen className="h-3 w-3" /> },
      { id: "meeting", label: "SESI", icon: <Video className="h-3 w-3" /> },
      { id: "instruktur", label: "INSTRUKTUR", icon: <User className="h-3 w-3" /> },
      { id: "presensi", label: "PRESENSI", icon: <CalendarCheck className="h-3 w-3" /> },
      { id: "sertifikat", label: "SERTIFIKAT", icon: <Medal className="h-3 w-3" /> },
      ...(kelas.has_assignment ? [{ id: "assignment", label: "TUGAS", icon: <CheckSquare className="h-3 w-3" /> }] : []),
    ],
    [kelas.has_assignment]
  );

  const tabs = isOwner ? tabsOwner : tabsPeserta;

  const renderTab = () => {
    switch (activeTab) {
      case "detail":     return <TabDetail kelas={kelas} isOwner={isOwner} />;
      case "section":    return <TabSection kelasId={kelas.id} isOwner={isOwner} />;
      case "meeting":    return <TabMeeting kelasId={kelas.id} meetings={kelas.meetings} isOwner={isOwner} />;
      case "instruktur": return <TabInstructor kelasId={kelas.id} instructorList={kelas.instruktur} isOwner={isOwner} />;
      case "presensi":   return <PresensiTab kelas={kelas} isOwner={isOwner} />;
      case "sertifikat": return <SertifikatTab kelas={kelas} isOwner={isOwner} />;
      case "assignment": return <TabAssignment kelasId={kelas.id} initialAssignmentList={kelas.assignments} isOwner={isOwner} />;
      case "grade":      return <TabGrade kelasId={kelas.id} assignments={assignments} submissions={submissions} />;
      case "email":      return <TabEmail pesertaList={pesertaList} />;
      case "transaksi":  return <TabTransaksi kelasId={kelas.id} isGratis={kelas.is_gratis} pesertaList={pesertaList} />;
      default:           return null;
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
          <div className="min-h-[200px]">{renderTab()}</div>
        </div>

        {/* SIDEBAR hanya untuk owner */}
        {isOwner && (
          <div className="w-full lg:w-80 shrink-0">
            <SidebarPanel kelas={kelas} />
          </div>
        )}
      </div>
    </div>
  );
}
