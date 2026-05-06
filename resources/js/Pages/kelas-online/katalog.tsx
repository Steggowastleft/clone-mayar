import { Head, router } from "@inertiajs/react";
import { Users, MonitorPlay, ArrowRight } from "lucide-react";


type KelasOnline = {
  id: number;
  name: string;
  deskripsi?: string;
  harga: number;
  is_free: boolean;
  cover_url?: string;
  peserta_count?: number;
  status?: string;
};

type Props = {
  kelasOnlineList: KelasOnline[];
};

function formatHarga(n?: number) {
  if (!n || n === 0) return "Gratis";
  return `Rp ${Number(n).toLocaleString("id-ID")}`;
}

export default function Katalog({ kelasOnlineList }: Props) {
  return (
    <>
      <Head title="Katalog Kelas Online" />

      <div className="min-h-screen bg-gray-50">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-900 text-white py-12">
          <div className="max-w-6xl mx-auto px-4">
            <h1 className="text-3xl font-extrabold">Katalog Kelas Online</h1>
            <p className="text-slate-300 mt-2 text-sm">
              Temukan kelas online terbaik dan tingkatkan skill Anda 🚀
            </p>
          </div>
        </div>

        {/* LIST */}
        <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kelasOnlineList.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden border"
            >
              {/* Thumbnail */}
              {b.cover_url ? (
                <img
                  src={b.cover_url}
                  className="w-full h-40 object-cover"
                />
              ) : (
                <div className="w-full h-40 bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                   <MonitorPlay className="h-10 w-10 text-white opacity-50" />
                </div>
              )}

              {/* Content */}
              <div className="p-4 space-y-3">
                
                <h2 className="font-bold text-gray-800 line-clamp-2">
                  {b.name}
                </h2>

                {b.deskripsi && (
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {b.deskripsi}
                  </p>
                )}

                {/* STATS */}
                <div className="flex flex-wrap gap-3 text-xs text-gray-500 pt-2">

                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3 text-indigo-500" />
                    {b.peserta_count || 0} peserta
                  </span>

                  <span className="flex items-center gap-1">
                    <MonitorPlay className="h-3 w-3 text-violet-500" />
                    Kelas Online
                  </span>

                </div>

                {/* PRICE + CTA */}
                <div className="flex items-center justify-between pt-3">
                  <span className="text-lg font-extrabold text-gray-900">
                    {formatHarga(b.harga)}
                  </span>

                  <button
                    onClick={() => router.visit(`/p/${b.id}/kelas-online`)}
                    className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-md flex items-center gap-1"
                  >
                    Detail <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
                

              </div>
            </div>
          ))}
        </div>

      </div>
    </>
  );
}