import { Head, router } from "@inertiajs/react";
import { BookOpen, Clock, Award, LogOut, User, ChevronRight, Play } from "lucide-react";

type BootcampItem = {
  id: number;
  name: string;
  batch: string;
  cover_url?: string;
  kategori?: string;
  status: string;
  tanggal_aktif?: string;
  tanggal_expired?: string;
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
};

export default function PesertaDashboard({ peserta, bootcamps }: Props) {
  const handleLogout = () => {
    router.post("/peserta/logout");
  };

  return (
    <>
      <Head title="Dashboard Peserta" />
      <div className="min-h-screen bg-gray-50">

        {/* Navbar */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-gray-800 text-sm">Dashboard Peserta</span>
            </div>
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="flex items-center gap-2">
                {peserta.foto_url ? (
                  <img src={peserta.foto_url} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700 hidden sm:block">{peserta.nama}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-500 transition px-2 py-1.5 rounded-md hover:bg-red-50"
              >
                <LogOut className="h-3.5 w-3.5" /> Keluar
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-5xl mx-auto px-4 py-8">

          {/* Welcome */}
          <div className="mb-8">
            <h1 className="text-xl font-bold text-gray-900">
              Halo, {peserta.nama.split(" ")[0]}! 👋
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Kamu terdaftar di {bootcamps.length} bootcamp
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { icon: <BookOpen className="h-5 w-5 text-blue-600" />, label: "Bootcamp Diikuti", value: bootcamps.length, bg: "bg-blue-50" },
              { icon: <Play className="h-5 w-5 text-emerald-600" />,  label: "Sedang Aktif",    value: bootcamps.filter(b => b.status === "active").length, bg: "bg-emerald-50" },
              { icon: <Award className="h-5 w-5 text-yellow-600" />,  label: "Selesai",         value: bootcamps.filter(b => b.status === "completed").length, bg: "bg-yellow-50" },
            ].map((stat, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center shrink-0`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bootcamp List */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
              Bootcamp Kamu
            </h2>

            {bootcamps.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                <BookOpen className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400">Kamu belum terdaftar di bootcamp manapun</p>
                <p className="text-xs text-gray-300 mt-1">Cari bootcamp dan daftar sekarang!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {bootcamps.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => router.visit(`/peserta/kelas/${b.id}`)}
                    className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md hover:border-blue-200 transition text-left group"
                  >
                    {/* Cover */}
                    {b.cover_url ? (
                      <img src={b.cover_url} alt={b.name} className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-36 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <Play className="h-10 w-10 text-white opacity-70" />
                      </div>
                    )}

                    {/* Info */}
                    <div className="p-4">
                      {b.kategori && (
                        <p className="text-xs text-blue-600 font-medium mb-1">{b.kategori}</p>
                      )}
                      <h3 className="text-sm font-semibold text-gray-800 line-clamp-2">{b.name}</h3>
                      <p className="text-xs text-gray-400 mt-1">{b.batch}</p>

                      <div className="flex items-center justify-between mt-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          b.status === "active"
                            ? "bg-emerald-50 text-emerald-600"
                            : b.status === "completed"
                            ? "bg-gray-100 text-gray-500"
                            : "bg-yellow-50 text-yellow-600"
                        }`}>
                          {b.status === "active" ? "Aktif" : b.status === "completed" ? "Selesai" : b.status}
                        </span>
                        <span className="text-xs text-blue-600 flex items-center gap-1 font-medium">
                          Masuk Kelas <ChevronRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}