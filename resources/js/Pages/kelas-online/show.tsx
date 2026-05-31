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

      <div className="p-6 bg-slate-50/20 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-slate-450 font-semibold mb-1">
              PRODUK ·{" "}
              <button
                onClick={() => router.visit("/kelas-online")}
                className="hover:text-indigo-600 transition"
              >
                Kelas Online
              </button>
            </p>

            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              {kelas?.nama}
            </h1>
            {isOwner && (
              <p className="text-xs text-slate-400 mt-1.5 font-medium">
                Penyelenggara: <span className="font-semibold text-slate-600">{kelas.owner?.name}</span>
              </p>
            )}
          </div>

          <div className="flex gap-2.5">
            <Button
              variant="outline"
              className="border-gray-200 text-slate-655 hover:bg-slate-50 hover:text-slate-800 text-xs font-bold"
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