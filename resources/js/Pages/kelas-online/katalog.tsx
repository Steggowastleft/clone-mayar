// katalog.tsx — re-export dari public.tsx
// Sesuai struktur folder di screenshot (katalog.tsx ada terpisah dari public.tsx)

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
  kelasOnline: { data: KelasOnline[]; total: number; current_page: number; last_page: number };
  filters?: { search?: string; kategori?: string };
}

const KATEGORI = ["Semua", "Desain", "Pemrograman", "Marketing", "Bisnis", "Produktivitas"];

export default function KelasOnlineKatalog({ kelasOnline, filters }: Props) {
  const [search, setSearch]     = useState(filters?.search ?? "");
  const [kategori, setKategori] = useState(filters?.kategori ?? "Semua");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get("/kelas-online/katalog", { search, kategori }, { preserveState: true });
  };

  const handleKategori = (kat: string) => {
    setKategori(kat);
    router.get("/kelas-online/katalog", { search, kategori: kat }, { preserveState: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <form onSubmit={handleSearch} className="flex gap-2 max-w-lg">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kelas online..."
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700"
            >
              Cari
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Kategori Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {KATEGORI.map((kat) => (
            <button
              key={kat}
              onClick={() => handleKategori(kat)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors
                ${kategori === kat
                  ? "bg-indigo-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-300"}`}
            >
              {kat}
            </button>
          ))}
        </div>

        {/* Results header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">{kelasOnline.total} kelas ditemukan</p>
        </div>

        {/* Grid */}
        {kelasOnline.data.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">🎓</div>
            <p className="font-medium text-gray-600">Belum ada kelas yang tersedia</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {kelasOnline.data.map((kelas) => (
              <a
                key={kelas.id}
                href={`/kelas-online/daftar/${kelas.slug}`}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-all group"
              >
                <div className="h-36 bg-gradient-to-br from-indigo-100 to-violet-100 overflow-hidden">
                  {kelas.thumbnail
                    ? <img
                        src={`/storage/${kelas.thumbnail}`}
                        alt={kelas.nama}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    : <div className="w-full h-full flex items-center justify-center text-4xl">🎓</div>
                  }
                </div>

                <div className="p-3">
                  <h3 className="font-bold text-gray-900 text-sm line-clamp-2 mb-1 group-hover:text-indigo-600 transition-colors">
                    {kelas.nama}
                  </h3>
                  <p className="text-xs text-gray-400 mb-2">oleh {kelas.owner.name}</p>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-indigo-600">
                      {kelas.is_gratis ? "Gratis" : `Rp ${Number(kelas.harga).toLocaleString("id-ID")}`}
                    </span>
                    <span className="text-xs text-gray-400">👥 {kelas.peserta_terdaftar_count}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Pagination */}
        {kelasOnline.last_page > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: kelasOnline.last_page }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => router.get("/kelas-online/katalog", { search, kategori, page })}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors
                  ${page === kelasOnline.current_page
                    ? "bg-indigo-600 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}