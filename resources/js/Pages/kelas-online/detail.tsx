import { Link, router } from "@inertiajs/react";

interface KelasOnline {
  id: number;
  nama: string;
  deskripsi: string;
  thumbnail: string | null;
  harga: number;
  is_gratis: boolean;
  status: "published" | "unpublished" | "unlisted";
  tanggal_mulai: string | null;
  peserta_terdaftar_count: number;
}

interface Props {
  produk: {
    data: KelasOnline[];
    current_page: number;
    last_page: number;
    total: number;
  };
}

const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  published:   { label: "Published",    cls: "bg-emerald-100 text-emerald-700" },
  unpublished: { label: "Unpublished",  cls: "bg-yellow-100 text-yellow-700" },
  unlisted:    { label: "Unlisted",     cls: "bg-blue-100 text-blue-700" },
};

export default function KelasOnlineIndex({ produk }: Props) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kelas Online</h1>
            <p className="text-gray-500 text-sm mt-1">
              {produk.total} kelas terdaftar
            </p>
          </div>
          <Link
            href="/kelas-online/create"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-sm"
          >
            + Buat Kelas
          </Link>
        </div>

        {/* Grid */}
        {produk.data.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <div className="text-5xl mb-4">📚</div>
            <p className="text-lg font-medium">Belum ada kelas online</p>
            <p className="text-sm mt-1">Buat kelas pertama Anda sekarang</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {produk.data.map((kelas) => {
              const status = STATUS_CFG[kelas.status];
              return (
                <div
                  key={kelas.id}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Thumbnail */}
                  <div className="h-40 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                    {kelas.thumbnail ? (
                      <img
                        src={`/storage/${kelas.thumbnail}`}
                        alt={kelas.nama}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl">🎓</span>
                    )}
                  </div>

                  <div className="p-4">
                    {/* Status + Harga */}
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.cls}`}>
                        {status.label}
                      </span>
                      <span className="text-sm font-bold text-gray-800">
                        {kelas.is_gratis ? "Gratis" : `Rp ${Number(kelas.harga).toLocaleString("id-ID")}`}
                      </span>
                    </div>

                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">{kelas.nama}</h3>

                    {kelas.deskripsi && (
                      <p className="text-xs text-gray-500 line-clamp-2 mb-3">{kelas.deskripsi}</p>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                      <span>👥 {kelas.peserta_terdaftar_count} peserta</span>
                      {kelas.tanggal_mulai && (
                        <span>📅 {new Date(kelas.tanggal_mulai).toLocaleDateString("id-ID")}</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        href={`/kelas-online/${kelas.id}/manage`}
                        className="flex-1 text-center py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors"
                      >
                        Kelola
                      </Link>
                      <Link
                        href={`/kelas-online/${kelas.id}/sertifikat/manage`}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                        title="Kelola Sertifikat"
                      >
                        🏆
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {produk.last_page > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: produk.last_page }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => router.get("/kelas-online", { page })}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors
                  ${page === produk.current_page
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