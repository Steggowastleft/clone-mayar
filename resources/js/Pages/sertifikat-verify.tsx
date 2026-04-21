import { Head } from "@inertiajs/react";
import { CheckCircle2, Award, Shield, User, BookOpen, Calendar } from "lucide-react";

type Props = {
  sertifikat: {
    nomor_sertifikat: string;
    nama_peserta: string;
    nama_bootcamp: string;
    nama_instruktur?: string;
    tanggal_selesai: string;
    valid: boolean;
  };
};

export default function SertifikatVerify({ sertifikat }: Props) {
  return (
    <>
      <Head title="Verifikasi Sertifikat" />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">

          {/* Status */}
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${sertifikat.valid ? "bg-green-100" : "bg-red-100"}`}>
            {sertifikat.valid
              ? <CheckCircle2 className="h-8 w-8 text-green-600" />
              : <Shield className="h-8 w-8 text-red-500" />
            }
          </div>

          <h1 className="text-xl font-black text-gray-900 mb-1">
            {sertifikat.valid ? "✅ Sertifikat Valid" : "❌ Sertifikat Tidak Valid"}
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            {sertifikat.valid
              ? "Sertifikat ini asli dan terverifikasi."
              : "Sertifikat ini tidak ditemukan dalam sistem kami."}
          </p>

          {sertifikat.valid && (
            <div className="space-y-3 text-left bg-gray-50 rounded-xl p-4">
              {[
                { icon: <User className="h-4 w-4 text-blue-500" />,     label: "Nama",             value: sertifikat.nama_peserta },
                { icon: <BookOpen className="h-4 w-4 text-blue-500" />, label: "Program",          value: sertifikat.nama_bootcamp },
                { icon: <Calendar className="h-4 w-4 text-blue-500" />, label: "Tanggal Selesai",  value: sertifikat.tanggal_selesai },
                { icon: <Award className="h-4 w-4 text-blue-500" />,    label: "No. Sertifikat",   value: sertifikat.nomor_sertifikat },
                ...(sertifikat.nama_instruktur ? [{ icon: <User className="h-4 w-4 text-blue-500" />, label: "Instruktur", value: sertifikat.nama_instruktur }] : []),
              ].map((row) => (
                <div key={row.label} className="flex items-start gap-3">
                  <div className="shrink-0 mt-0.5">{row.icon}</div>
                  <div>
                    <p className="text-xs text-gray-400">{row.label}</p>
                    <p className="text-sm font-semibold text-gray-800">{row.value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-gray-400 mt-6">
            Verifikasi ini dilakukan secara otomatis oleh sistem.
          </p>
        </div>
      </div>
    </>
  );
}