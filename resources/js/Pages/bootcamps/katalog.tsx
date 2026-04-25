import { Head, router } from "@inertiajs/react";
import { Users, BookOpen, DollarSign, ArrowRight } from "lucide-react";
import { ArrowLeft } from "lucide-react";


type Bootcamp = {
  id: number;
  title: string;
  description?: string;
  price: number;
  thumbnail?: string;
  peserta_count?: number;
  omset?: number;
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
              {b.thumbnail ? (
                <img
                  src={b.thumbnail}
                  className="w-full h-40 object-cover"
                />
              ) : (
                <div className="w-full h-40 bg-gradient-to-br from-blue-500 to-indigo-600" />
              )}

              {/* Content */}
              <div className="p-4 space-y-3">
                
                <h2 className="font-bold text-gray-800 line-clamp-2">
                  {b.title}
                </h2>

                {b.description && (
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {b.description}
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

                {/* PRICE + CTA */}
                <div className="flex items-center justify-between pt-3">
                  <span className="text-lg font-extrabold text-gray-900">
                    {formatHarga(b.price)}
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