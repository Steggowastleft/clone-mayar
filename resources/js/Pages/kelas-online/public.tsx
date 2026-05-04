import { useState } from "react";
import { router } from "@inertiajs/react";

interface KelasOnline {
  id: number;
  slug: string;
  nama: string;
  deskripsi: string | null;
  thumbnail: string | null;
  harga: number;
  is_gratis: boolean;
  tanggal_mulai: string | null;
  owner: { name: string };
  peserta_terdaftar_count: number;
}

interface Props {
  kelasOnline: { data: KelasOnline[]; total: number };
  filters?: { search?: string };
}

export default function KelasOnlinePublic({ kelasOnline, filters }: Props) {
  const [search, setSearch] = useState(filters?.search ?? "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get("/kelas-online/katalog", { search }, { preserveState: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {/* Hero */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-black mb-3">Kelas Online</h1>
          <p className="text-indigo-200 mb-6">Tingkatkan skill Anda bersama instruktur berpengalaman</p>

          {/* Search */}
          <form onSubmit={handleSearch} className="max-w-lg mx-auto flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kelas..."
              className="flex-1 px-4 py-2.5 rounded-xl text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-white text-indigo-600 font-bold rounded-xl text-sm hover:bg-indigo-50"
            >
              Cari
            </button>
          </form>
        </div>
      </div>

      {/* Grid Kelas */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        <p className="text-gray-500 text-sm mb-6">{kelasOnline.total} kelas tersedia</p>

        {kelasOnline.data.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">🔍</div>
            <p className="font-medium">Kelas tidak ditemukan</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {kelasOnline.data.map((kelas) => (
              <a
                key={kelas.id}
                href={`/kelas-online/${kelas.slug}`}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group"
              >
                {/* Thumbnail */}
                <div className="h-44 bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center overflow-hidden">
                  {kelas.thumbnail
                    ? <img
                        src={`/storage/${kelas.thumbnail}`}
                        alt={kelas.nama}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    : <span className="text-5xl">🎓</span>
                  }
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {kelas.nama}
                  </h3>
                  <p className="text-xs text-gray-400 mb-2">oleh {kelas.owner.name}</p>

                  {kelas.deskripsi && (
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">{kelas.deskripsi}</p>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-600">
                      {kelas.is_gratis ? "Gratis" : `Rp ${Number(kelas.harga).toLocaleString("id-ID")}`}
                    </span>
                    <span className="text-xs text-gray-400">
                      👥 {kelas.peserta_terdaftar_count}
                    </span>
                  </div>

                  {kelas.tanggal_mulai && (
                    <p className="text-xs text-gray-400 mt-2">
                      📅 {new Date(kelas.tanggal_mulai).toLocaleDateString("id-ID", {
                        day: "numeric", month: "short", year: "numeric"
                      })}
                    </p>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}