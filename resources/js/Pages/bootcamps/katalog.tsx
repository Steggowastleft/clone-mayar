import { Head, router } from "@inertiajs/react";
import { Users, BookOpen, DollarSign, ArrowRight } from "lucide-react";
import { ArrowLeft } from "lucide-react";


type Bootcamp = {
  id: number;
  name: string;
  deskripsi?: string;
  harga: number;
  is_free: boolean;
  cover_url?: string;
  peserta_count?: number;
  omset?: number;
  status?: string;
  syarat_ketentuan?: string;
};

type Props = {
  bootcamps: Bootcamp[];
};

function formatHarga(n?: number) {
  if (!n || n === 0) return "Gratis";
  return `Rp ${Number(n).toLocaleString("id-ID")}`;
}

export default function Katalog({ bootcamps }: Props) {
  return (
    <>
      <Head title="Katalog Bootcamp" />

      <div className="min-h-screen bg-gray-50">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-slate-900 to-blue-900 text-white py-12">
          <div className="max-w-6xl mx-auto px-4">
            <h1 className="text-3xl font-extrabold">Katalog Bootcamp</h1>
            <p className="text-slate-300 mt-2 text-sm">
              Temukan bootcamp terbaik dan mulai belajar 🚀
            </p>
          </div>
        </div>

        {/* LIST */}
        <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bootcamps.map((b) => (
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
                <div className="w-full h-40 bg-gradient-to-br from-blue-500 to-indigo-600" />
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
                    <Users className="h-3 w-3 text-blue-500" />
                    {b.peserta_count || 0} peserta
                  </span>

                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-green-500" />
                    {formatHarga(b.omset)}
                  </span>

                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3 text-purple-500" />
                    Bootcamp
                  </span>

                </div>

                {/* Syarat & Ketentuan */}
                {b.syarat_ketentuan && (
                  <div className="text-xs text-gray-500 border-t pt-2 mt-2 bg-slate-50/50 p-2 rounded-lg border-slate-100">
                    <p className="font-bold text-gray-700 mb-0.5">Syarat & Ketentuan:</p>
                    <p className="line-clamp-2 text-gray-500 leading-relaxed">{b.syarat_ketentuan}</p>
                  </div>
                )}

                {/* PRICE + CTA */}
                <div className="flex items-center justify-between pt-3">
                  <span className="text-lg font-extrabold text-gray-900">
                    {formatHarga(b.harga)}
                  </span>

                  <button
                    onClick={() => router.visit(`/bootcamp/${b.id}`)}
                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md flex items-center gap-1"
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