import { Head, router } from "@inertiajs/react";
import { Users, Calendar, DollarSign, ArrowRight, Lock } from "lucide-react";
import { ArrowLeft } from "lucide-react";

type Webinar = {
  id: number;
  nama: string;
  deskripsi?: string;
  harga: number;
  harga_coret?: number;
  is_free: boolean;
  cover?: string;
  peserta_count?: number;
  max_peserta?: number;
  tanggal_mulai?: string;
  tanggal_selesai?: string;
  status?: string;
  is_full?: boolean;
};

type Props = {
  webinars: Webinar[];
};

function formatHarga(n?: number) {
  if (!n || n === 0) return "Gratis";
  return `Rp ${Number(n).toLocaleString("id-ID")}`;
}

function formatTanggal(date?: string) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function KatalogWebinar({ webinars }: Props) {
  return (
    <>
      <Head title="Katalog Webinar" />

      <div className="min-h-screen bg-gray-50">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-slate-900 to-blue-900 text-white py-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => window.history.back()}
                className="hover:bg-blue-800 p-2 rounded-lg transition"
              >
                <ArrowLeft size={20} />
              </button>
            </div>
            <h1 className="text-3xl font-extrabold">Katalog Webinar</h1>
            <p className="text-slate-300 mt-2 text-sm">
              Temukan webinar terbaik dan tingkatkan skill Anda 🚀
            </p>
          </div>
        </div>

        {/* STATS */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="text-2xl font-bold text-blue-600">
                {webinars.length}
              </div>
              <div className="text-sm text-gray-600">Total Webinar</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="text-2xl font-bold text-green-600">
                {webinars.filter((w) => w.is_free).length}
              </div>
              <div className="text-sm text-gray-600">Webinar Gratis</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="text-2xl font-bold text-purple-600">
                {webinars.reduce((a, w) => a + (w.peserta_count || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Total Peserta</div>
            </div>
          </div>
        </div>

        {/* LIST */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          {webinars.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">📭</div>
              <p className="text-gray-500">Belum ada webinar yang dipublikasi</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {webinars.map((webinar) => (
                <div
                  key={webinar.id}
                  className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden border hover:border-blue-300"
                >
                  {/* IMAGE */}
                  <div className="relative h-48 bg-gradient-to-br from-blue-400 to-purple-500 overflow-hidden group">
                    {webinar.cover ? (
                      <img
                        src={webinar.cover}
                        alt={webinar.nama}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-white text-center">
                          <div className="text-4xl mb-2">🎓</div>
                          <div className="text-sm opacity-75">Webinar</div>
                        </div>
                      </div>
                    )}

                    {/* BADGE STATUS */}
                    <div className="absolute top-3 right-3 flex gap-2">
                      {webinar.is_full && (
                        <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                          <Lock size={12} /> PENUH
                        </div>
                      )}
                      {webinar.is_free && (
                        <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          GRATIS
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CONTENT */}
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2 line-clamp-2 text-gray-800">
                      {webinar.nama}
                    </h3>

                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                      {webinar.deskripsi || "Deskripsi tidak tersedia"}
                    </p>

                    {/* STATS */}
                    <div className="space-y-2 mb-4 text-sm text-gray-600">
                      {webinar.tanggal_mulai && (
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-blue-600" />
                          <span>{formatTanggal(webinar.tanggal_mulai)}</span>
                        </div>
                      )}

                      {webinar.peserta_count !== undefined && (
                        <div className="flex items-center gap-2">
                          <Users size={16} className="text-blue-600" />
                          <span>
                            {webinar.peserta_count}{" "}
                            {webinar.max_peserta
                              ? `/ ${webinar.max_peserta}`
                              : ""}{" "}
                            peserta
                          </span>
                        </div>
                      )}
                    </div>

                    {/* PRICE */}
                    <div className="mb-4 pb-4 border-t">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-blue-600">
                          {formatHarga(webinar.harga)}
                        </span>
                        {webinar.harga_coret &&
                          webinar.harga_coret > webinar.harga && (
                            <span className="text-sm text-gray-400 line-through">
                              {formatHarga(webinar.harga_coret)}
                            </span>
                          )}
                      </div>
                    </div>

                    {/* CTA */}
                    <button
                      onClick={() =>
                        router.visit(
                          `/webinar/${webinar.id}/detail`
                        )
                      }
                      disabled={webinar.is_full}
                      className={`w-full py-2 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
                        webinar.is_full
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      Detail & Daftar
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
