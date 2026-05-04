import { Link } from "@inertiajs/react";

interface Certificate {
  id: number;
  nomor_sertifikat: string;
  status: "approved" | "manual_approved";
  is_manual_approved: boolean;
  approved_at: string;
  kelas_online: { id: number; nama: string; thumbnail: string | null };
  qr_token: string;
}

interface Props {
  certificates: Certificate[];
}

export default function MyCertificates({ certificates }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-900">🏆 Sertifikat Saya</h1>
          <p className="text-gray-500 text-sm mt-1">{certificates.length} sertifikat diterbitkan</p>
        </div>

        {certificates.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">📜</div>
            <p className="text-lg font-medium text-gray-600">Belum ada sertifikat</p>
            <p className="text-sm text-gray-400 mt-1">
              Selesaikan kelas dan lengkapi presensi untuk mendapatkan sertifikat.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Dekoratif atas */}
                <div className="h-2 w-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400" />

                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Thumbnail kelas */}
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shrink-0 overflow-hidden">
                      {cert.kelas_online.thumbnail ? (
                        <img src={`/storage/${cert.kelas_online.thumbnail}`} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">🎓</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm line-clamp-2">{cert.kelas_online.nama}</p>
                      <p className="text-xs text-gray-400 mt-1 font-mono">{cert.nomor_sertifikat}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(cert.approved_at).toLocaleDateString("id-ID", {
                          day: "numeric", month: "long", year: "numeric"
                        })}
                      </p>
                    </div>
                  </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full
                        ${cert.is_manual_approved
                          ? "bg-blue-100 text-blue-700"
                          : "bg-emerald-100 text-emerald-700"}`}>
                        {cert.is_manual_approved ? "✅ Disetujui Manual" : "🤖 Otomatis"}
                      </span>

                      <div className="flex items-center gap-3">
                        <a
                          href={`/kelas-online/sertifikat/verify/${cert.qr_token}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-gray-400 hover:text-indigo-600 transition-colors"
                        >
                          Verifikasi ↗
                        </a>
                        <Link
                          href={`/peserta/kelas-online/sertifikat/${cert.id}`}
                          className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors"
                        >
                          Lihat Sertifikat
                        </Link>
                      </div>
                    </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}