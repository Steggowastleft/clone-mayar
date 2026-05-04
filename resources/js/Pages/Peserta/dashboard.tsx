import { router, Head } from "@inertiajs/react";
import { useState } from "react";
import { BookOpen, Clock, Award, User, ChevronRight, Play, Star } from "lucide-react";
import RatingDialog from "./ratingdialog";
import PesertaLayout from "@/Layouts/PesertaLayout";

type BootcampItem = {
  id: number;
  name: string;
  batch: string;
  cover_url?: string;
  kategori?: string;
  status: string;
  tanggal_aktif?: string;
  tanggal_expired?: string;
  rating?: number | null;
};

type KelasOnlineItem = {
  id: number;
  name: string;
  cover_url?: string;
  owner_name: string;
  tanggal_aktif?: string;
  status: string;
};

type Peserta = {
  id: number;
  nama: string;
  email: string;
  no_hp?: string;
  foto_url?: string;
};

type Props = {
  peserta: Peserta;
  bootcamps: BootcampItem[];
  kelasOnlines: KelasOnlineItem[];
};

export default function PesertaDashboard({
  peserta,
  bootcamps: initialBootcamps,
  kelasOnlines = []
}: Props) {
  const [bootcamps, setBootcamps] = useState(initialBootcamps);
  const [ratingTarget, setRatingTarget] = useState<BootcampItem | null>(null);

  const totalDiikuti = bootcamps.length + kelasOnlines.length;

  return (
    <PesertaLayout peserta={peserta} title="Dashboard Peserta">
      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Welcome Area */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 mb-8 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Halo, {peserta.nama.split(" ")[0]}! 👋
            </h1>
            <p className="text-sm text-gray-500 mt-2 max-w-lg">
              Selamat datang kembali di dashboard belajarmu. Kamu saat ini terdaftar di <span className="font-bold text-indigo-600">{totalDiikuti}</span> program pembelajaran.
            </p>
          </div>
          {/* Subtle background decoration */}
          <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-50 rounded-full -mr-10 -mt-10 opacity-50" />
          <div className="absolute left-1/2 bottom-0 w-24 h-24 bg-blue-50 rounded-full -mb-12 opacity-50" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            {
              icon: <BookOpen className="h-5 w-5 text-blue-600" />,
              label: "Bootcamp Diikuti",
              value: bootcamps.length,
              bg: "bg-blue-50",
              border: "border-blue-100"
            },
            {
              icon: <Play className="h-5 w-5 text-indigo-600" />,
              label: "Kelas Online Diikuti",
              value: kelasOnlines.length,
              bg: "bg-indigo-50",
              border: "border-indigo-100"
            },
            {
              icon: <Award className="h-5 w-5 text-emerald-600" />,
              label: "Total Program",
              value: totalDiikuti,
              bg: "bg-emerald-50",
              border: "border-emerald-100"
            },
          ].map((stat, i) => (
            <div key={i} className={`bg-white border ${stat.border} rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow duration-300`}>
              <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center shrink-0 shadow-inner`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-black text-gray-900 mt-0.5">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-12">
          {/* KELAS ONLINE SECTION */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                <h2 className="text-lg font-extrabold text-gray-800 tracking-tight">
                  Kelas Online Kamu
                </h2>
              </div>
              <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                {kelasOnlines.length} KELAS
              </span>
            </div>

            {kelasOnlines.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="h-8 w-8 text-gray-300" />
                </div>
                <p className="text-sm font-semibold text-gray-500">Belum ada Kelas Online yang diikuti</p>
                <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">Tingkatkan keahlianmu dengan mengikuti berbagai kelas online yang tersedia.</p>
                <button
                  onClick={() => router.visit("/kelas-online")}
                  className="mt-4 px-6 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition"
                >
                  Cari Kelas Online
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {kelasOnlines.map((ko) => (
                  <div
                    key={ko.id}
                    onClick={() => router.visit(`/peserta/kelas-online/${ko.id}`)}
                    className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col h-full shadow-sm"
                  >
                    <div className="relative aspect-video overflow-hidden bg-indigo-100">
                      {ko.cover_url ? (
                        <img src={ko.cover_url} alt={ko.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                          <Play className="h-12 w-12 text-white opacity-40 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <span className="bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-black text-indigo-600 shadow-sm border border-indigo-50">
                          KELAS ONLINE
                        </span>
                      </div>
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex-1">
                        <h3 className="text-base font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
                          {ko.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                            <User className="h-3 w-3 text-gray-400" />
                          </div>
                          <p className="text-xs text-gray-500 font-medium truncate">{ko.owner_name}</p>
                        </div>
                      </div>

                      <div className="mt-5 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl transition-colors group-hover:bg-indigo-100">
                          <Play className="h-3 w-3" />
                          MASUK KELAS
                        </div>
                        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-tighter">
                          Daftar: {ko.tanggal_aktif}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* BOOTCAMP SECTION */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                <h2 className="text-lg font-extrabold text-gray-800 tracking-tight">
                  Bootcamp Kamu
                </h2>
              </div>
              <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                {bootcamps.length} BOOTCAMP
              </span>
            </div>

            {bootcamps.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-gray-300" />
                </div>
                <p className="text-sm font-semibold text-gray-500">Belum ada Bootcamp yang diikuti</p>
                <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">Ayo bergabung dengan komunitas belajar kami dan percepat kariermu.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {bootcamps.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group shadow-sm"
                  >
                    {/* Cover */}
                    <div className="relative aspect-video overflow-hidden cursor-pointer" onClick={() => router.visit(`/peserta/kelas/${b.id}`)}>
                      {b.cover_url ? (
                        <img src={b.cover_url} alt={b.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                          <BookOpen className="h-12 w-12 text-white opacity-40 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black shadow-sm border border-white/20 backdrop-blur-md ${
                          b.status === "active"
                            ? "bg-emerald-500/90 text-white"
                            : b.status === "completed"
                            ? "bg-blue-600/90 text-white"
                            : "bg-yellow-500/90 text-white"
                        }`}>
                          {b.status === "completed" ? "SELESAI" : b.status === "active" ? "AKTIF" : "PENDING"}
                        </span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex-1 cursor-pointer" onClick={() => router.visit(`/peserta/kelas/${b.id}`)}>
                        {b.kategori && (
                          <p className="text-[10px] font-black text-blue-600 mb-1 uppercase tracking-widest">{b.kategori}</p>
                        )}
                        <h3 className="text-base font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                          {b.name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <p className="text-xs text-gray-500 font-medium">{b.batch}</p>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-50 space-y-3">
                        {/* Progress/Enter */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5" onClick={() => router.visit(`/peserta/kelas/${b.id}`)}>
                            <p className="text-xs font-bold text-blue-600 hover:underline cursor-pointer flex items-center gap-1">
                              Belajar Sekarang <ChevronRight className="h-3 w-3" />
                            </p>
                          </div>
                          {b.rating ? (
                            <div className="flex items-center gap-0.5">
                              <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                              <span className="text-[10px] font-bold text-gray-500">{b.rating}</span>
                            </div>
                          ) : null}
                        </div>

                        {/* Certificate Button */}
                        {b.status === "completed" && (
                          <button
                            onClick={() => router.visit(`/peserta/bootcamp/${b.id}/sertifikat`)}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-blue-200 hover:scale-[1.02] active:scale-[0.98] transition-all"
                          >
                            <Award className="h-4 w-4" /> AMBIL SERTIFIKAT
                          </button>
                        )}

                        {/* Rating Button */}
                        <button
                          onClick={() => setRatingTarget(b)}
                          className={`w-full py-2 text-xs font-bold rounded-xl border transition-all ${
                            b.rating
                              ? "border-gray-200 text-gray-500 hover:bg-gray-50"
                              : "border-yellow-200 text-yellow-600 bg-yellow-50 hover:bg-yellow-100"
                          }`}
                        >
                          {b.rating ? "EDIT ULASAN" : "BERI ULASAN KELAS"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Rating Dialog */}
        {ratingTarget && (
          <RatingDialog
            open={!!ratingTarget}
            onOpenChange={(v) => { if (!v) setRatingTarget(null); }}
            bootcampId={ratingTarget.id}
            bootcampName={ratingTarget.name}
            existingRating={ratingTarget.rating ? { id: 0, bintang: ratingTarget.rating, tampil_anonim: false } : null}
            onSuccess={(r) => {
              setBootcamps((prev) => prev.map((b) => b.id === ratingTarget.id ? { ...b, rating: r.bintang } : b));
              setRatingTarget(null);
            }}
          />
        )}
      </div>
    </PesertaLayout>
  );
}