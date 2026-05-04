import { router, Head } from "@inertiajs/react";
import PesertaLayout from "@/Layouts/PesertaLayout";
import TabEngineKelasOnline from "@/Pages/kelas-online/detail/tab-engine";
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
  kelas: KelasOnline;
  peserta: any;
  materi?: { file: string | null; name: string | null };
}

export default function BelajarKelasOnline({ kelas, peserta, materi }: Props) {
  return (
    <PesertaLayout peserta={peserta} title={kelas.nama}>
      <div className="p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <nav className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              <button onClick={() => router.visit("/peserta/dashboard")} className="hover:text-indigo-600 transition">
                DASHBOARD
              </button>
              <span className="text-gray-300">/</span>
              <span className="text-indigo-600">BELAJAR</span>
            </nav>
            
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                {kelas.nama}
              </h1>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Diselenggarakan oleh <span className="font-bold text-gray-700">{kelas.owner?.name}</span>
            </p>
          </div>

          <div>
            <Button
              variant="outline"
              className="rounded-xl border-gray-200 text-gray-600 font-bold text-xs"
              onClick={() => router.visit("/peserta/dashboard")}
            >
              KEMBALI KE DASHBOARD
            </Button>
          </div>
        </div>

        {/* Tab System — reusing the existing one but as participant */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2 sm:p-6">
            <TabEngineKelasOnline kelas={kelas} isOwner={false} materi={materi} />
        </div>
      </div>
    </PesertaLayout>
  );
}
