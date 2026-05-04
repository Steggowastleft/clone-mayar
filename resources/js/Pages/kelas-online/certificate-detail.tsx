import { useRef, useEffect, useState } from "react";
import { Head, router } from "@inertiajs/react";
import { Award, Download, Share2, ArrowLeft, CheckCircle2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import QRCode from "qrcode";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type Props = {
  sertifikat: {
    id: number;
    nomor_sertifikat: string;
    nama_peserta: string;
    nama_kelas: string;
    nama_instruktur?: string;
    tanggal_selesai: string;
    qr_token: string;
    verifikasi_url: string;
  };
  peserta: { id: number; nama: string };
};

// ─────────────────────────────────────────────
// Certificate Card (printable)
// ─────────────────────────────────────────────
function CertificateCard({ sertifikat, qrDataUrl }: {
  sertifikat: Props["sertifikat"];
  qrDataUrl: string;
}) {
  return (
    <div
      id="certificate-card"
      className="relative bg-white w-[794px] h-[562px] overflow-hidden shadow-2xl mx-auto"
      style={{ fontFamily: "'Georgia', serif" }}
    >
      {/* Background decorative border */}
      <div className="absolute inset-0 border-[16px] border-double border-indigo-800 m-3 pointer-events-none" />
      <div className="absolute inset-0 border-[2px] border-amber-400 m-6 pointer-events-none" />

      {/* Corner decorations */}
      {[
        "top-4 left-4", "top-4 right-4",
        "bottom-4 left-4", "bottom-4 right-4"
      ].map((pos, i) => (
        <div key={i} className={`absolute ${pos} w-10 h-10`}>
          <div className="w-full h-full border-4 border-amber-400 rounded-full opacity-60" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-16 py-10 text-center">

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-indigo-800 rounded-full flex items-center justify-center">
            <Award className="h-6 w-6 text-amber-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-indigo-800 uppercase tracking-widest">Sertifikat Kelulusan</p>
            <p className="text-xs text-gray-500">Certificate of Completion</p>
          </div>
        </div>

        {/* Diberikan kepada */}
        <p className="text-sm text-gray-500 mb-1 italic">Diberikan kepada</p>
        <h1
          className="text-4xl font-bold text-indigo-900 mb-3"
          style={{ fontFamily: "'Georgia', serif", borderBottom: "2px solid #B8860B", paddingBottom: "8px" }}
        >
          {sertifikat.nama_peserta}
        </h1>

        {/* Telah menyelesaikan */}
        <p className="text-sm text-gray-600 mb-1">Telah berhasil menyelesaikan program</p>
        <h2 className="text-xl font-bold text-indigo-800 mb-4">
          {sertifikat.nama_kelas}
        </h2>

        <p className="text-xs text-gray-500 mb-6">
          Diselesaikan pada tanggal <span className="font-semibold text-gray-700">{sertifikat.tanggal_selesai}</span>
        </p>

        {/* Footer */}
        <div className="flex items-end justify-between w-full mt-auto">
          {/* Tanda tangan instruktur */}
          <div className="text-center min-w-[150px]">
            {sertifikat.nama_instruktur ? (
              <>
                <div className="w-32 border-b border-gray-400 mb-1 mx-auto" style={{ height: "40px" }}>
                  <p className="text-lg text-gray-400 italic" style={{ fontFamily: "cursive" }}>
                    {sertifikat.nama_instruktur}
                  </p>
                </div>
                <p className="text-xs text-gray-600 font-semibold">{sertifikat.nama_instruktur}</p>
                <p className="text-xs text-gray-400">Instruktur</p>
              </>
            ) : (
                <>
                <div className="w-32 border-b border-gray-400 mb-1 mx-auto" style={{ height: "40px" }}>
                  <p className="text-lg text-gray-400 italic" style={{ fontFamily: "cursive" }}>
                    Official
                  </p>
                </div>
                <p className="text-xs text-gray-600 font-semibold">Penyelenggara Event</p>
                <p className="text-xs text-gray-400">Penyelenggara</p>
              </>
            )}
          </div>

          {/* Nomor sertifikat */}
          <div className="text-center">
            <div className="flex items-center gap-1 justify-center mb-1">
              <Shield className="h-3 w-3 text-indigo-600" />
              <p className="text-xs font-bold text-indigo-700">{sertifikat.nomor_sertifikat}</p>
            </div>
            <p className="text-xs text-gray-400">Nomor Sertifikat</p>
          </div>

          {/* QR Code */}
          <div className="text-center">
            {qrDataUrl && (
              <img src={qrDataUrl} alt="QR Code" className="w-16 h-16 mx-auto" />
            )}
            <p className="text-xs text-gray-400 mt-1">Scan untuk verifikasi</p>
          </div>
        </div>
      </div>

      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
        <Award className="h-96 w-96 text-indigo-900" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
export default function KelasOnlineCertificateDetail({ sertifikat, peserta }: Props) {
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [copying,   setCopying]   = useState(false);

  // Generate QR code
  useEffect(() => {
    if (sertifikat.verifikasi_url) {
      QRCode.toDataURL(sertifikat.verifikasi_url, {
        width: 128,
        margin: 1,
        color: { dark: "#1e3a5f", light: "#ffffff" },
      }).then(setQrDataUrl).catch(console.error);
    }
  }, [sertifikat.verifikasi_url]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(sertifikat.verifikasi_url);
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  };

  return (
    <>
      <Head title={`Sertifikat — ${sertifikat.nama_kelas}`} />

      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #certificate-card, #certificate-card * { visibility: visible; }
          #certificate-card {
            position: fixed;
            top: 0; left: 0;
            width: 100vw;
            box-shadow: none;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="min-h-screen bg-gray-100">

        {/* Navbar */}
        <div className="no-print bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyLink}>
              <Share2 className="h-4 w-4 mr-1.5" />
              {copying ? "Tersalin!" : "Bagikan Link"}
            </Button>
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={handlePrint}>
              <Download className="h-4 w-4 mr-1.5" />
              Download / Print
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-5xl mx-auto px-6 py-10">

          {/* Congratulations banner */}
          <div className="no-print mb-8 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 text-white text-center">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Award className="h-7 w-7 text-yellow-300" />
            </div>
            <h1 className="text-2xl font-black mb-1">🎉 Selamat, {peserta.nama}!</h1>
            <p className="text-indigo-100 text-sm">Kamu telah berhasil menyelesaikan {sertifikat.nama_kelas}</p>
          </div>

          {/* Certificate */}
          <div className="flex justify-center mb-8 overflow-x-auto">
            <CertificateCard sertifikat={sertifikat} qrDataUrl={qrDataUrl} />
          </div>

          {/* Info cards */}
          <div className="no-print grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <p className="text-xs text-gray-400 mb-1">Nomor Sertifikat</p>
              <p className="text-sm font-bold text-indigo-700">{sertifikat.nomor_sertifikat}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <p className="text-xs text-gray-400 mb-1">Tanggal Selesai</p>
              <p className="text-sm font-bold text-gray-800">{sertifikat.tanggal_selesai}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <p className="text-xs text-gray-400 mb-1">Status</p>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <p className="text-sm font-bold text-green-600">Terverifikasi</p>
              </div>
            </div>
          </div>

          {/* Verification link */}
          <div className="no-print mt-4 bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-xs text-gray-400 mb-1.5 flex items-center gap-1">
              <Shield className="h-3.5 w-3.5" /> Link Verifikasi
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-gray-50 px-3 py-2 rounded-lg text-indigo-700 truncate border border-gray-200">
                {sertifikat.verifikasi_url}
              </code>
              <Button size="sm" variant="outline" onClick={handleCopyLink}>
                {copying ? "✓" : "Salin"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
