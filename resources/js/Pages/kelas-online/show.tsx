import { Head, router } from "@inertiajs/react";
import DashboardLayout from "@/components/dashboard/dashboardlayout";
import TabEngineKelasOnline from "./detail/tab-engine";
import { Button } from "@/components/ui/button";

interface Sesi {
  id: number;
  tipe: "awal" | "tengah" | "akhir";
  judul: string;
  is_aktif: boolean;
}

interface KelasOnline {
  id: number;
  nama: string;
  deskripsi: string | null;
  status: string;
  harga: number;
  is_gratis: boolean;
  tanggal_mulai: string | null;
  tanggal_selesai: string | null;
  has_assignment: boolean;
  require_quiz_sertifikat: boolean;
  sesi: Sesi[];
  owner: { id: number; name: string };
  babs?: any[];
  instruktur?: any[];
}

interface Props {
  id: string;
  kelas: KelasOnline;
  isOwner: boolean;
  materi?: { file: string | null; name: string | null };
  assignments: any[];
  submissions: any[];
  pesertaList: any[];
}

export default function KelasOnlineShow({ id, kelas, isOwner, materi, assignments, submissions, pesertaList }: Props) {
  return (
    <DashboardLayout>
      <Head title={kelas?.nama || "Kelas Online Detail"} />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs text-gray-400 mb-1">
              PRODUK ·{" "}
              <button
                onClick={() => router.visit("/kelas-online")}
                className="hover:text-indigo-600 transition"
              >
                Kelas Online
              </button>
            </p>

            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-800">
                {kelas?.nama}
              </h1>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full
                ${kelas.status === "published"
                  ? "bg-emerald-100 text-emerald-700"
                  : kelas.status === "unpublished"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-blue-100 text-blue-700"}`}>
                {kelas.status}
              </span>
            </div>
            {isOwner && (
              <p className="text-xs text-gray-400 mt-1">
                Penyelenggara: {kelas.owner?.name}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-gray-300 text-gray-600 hover:bg-gray-50 text-sm"
              onClick={() => router.visit("/kelas-online")}
            >
              KEMBALI
            </Button>
          </div>
        </div>

        {/* TAB SYSTEM */}
        <TabEngineKelasOnline 
          kelas={kelas} 
          isOwner={isOwner} 
          materi={materi} 
          assignments={assignments}
          submissions={submissions}
          pesertaList={pesertaList}
        />
      </div>
    </DashboardLayout>
  );
}