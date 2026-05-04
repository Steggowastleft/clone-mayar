import { Head } from "@inertiajs/react";
import { useState } from "react";
import {
  ChevronDown, ChevronUp, CheckCircle2,
  Users, Calendar, Play, ArrowRight, Award,
  Clock, BookOpen,
} from "lucide-react";
import { KelasOnlineCheckoutDialog } from "./components/checkout-dialog";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type KelasOnline = {
  id: number;
  nama: string;
  deskripsi?: string;
  thumbnail?: string;
  harga: number;
  is_gratis: boolean;
  status: string;
  tanggal_mulai?: string;
  tanggal_selesai?: string;
  require_quiz_sertifikat?: boolean;
  nilai_minimum_quiz?: number;
  peserta_terdaftar_count: number;
  owner: { name: string };
};

type Peserta = {
  id: number;
  nama: string;
  email: string;
  no_hp?: string;
} | null;

type Props = {
  kelas: KelasOnline;
  peserta?: Peserta;
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function formatHarga(harga: number, isGratis: boolean) {
  if (isGratis || harga === 0) return "Gratis";
  return `Rp ${Number(harga).toLocaleString("id-ID")}`;
}

// ─────────────────────────────────────────────
// Content Card
// ─────────────────────────────────────────────
function ContentCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg mb-4 overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────
// FAQ Item
// ─────────────────────────────────────────────
function FaqItem({ item }: { item: { pertanyaan: string; jawaban: string } }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-md overflow-hidden mb-2">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition"
      >
        <span className="text-sm font-medium text-gray-800">{item.pertanyaan}</span>
        {open
          ? <ChevronUp className="h-4 w-4 text-gray-500 shrink-0" />
          : <ChevronDown className="h-4 w-4 text-gray-500 shrink-0" />
        }
      </button>
      {open && (
        <div className="px-4 pb-3 text-sm text-gray-600 leading-relaxed bg-white border-t border-gray-100">
          {item.jawaban}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
export default function KelasOnlinePublicDetail({ kelas, peserta = null }: Props) {
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // Nav items sticky
  const navItems = [
    kelas.deskripsi && { href: "#tentang", label: "Tentang Kelas" },
    kelas.require_quiz_sertifikat && { href: "#sertifikat", label: "Sertifikat" },
    { href: "#penyelenggara", label: "Penyelenggara" },
  ].filter(Boolean) as { href: string; label: string }[];

  return (
    <>
      <Head title={kelas.nama} />
      <div className="min-h-screen bg-white">

        {/* ════════════════════════════════════════
            HERO
        ════════════════════════════════════════ */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-900 text-white">
          <div className="max-w-5xl mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-5 gap-10 items-center">
            <div className="lg:col-span-3 space-y-5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  kelas.status === "aktif"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : "bg-white/10 text-white/60 border-white/20"
                }`}>
                  {kelas.status.toUpperCase()}
                </span>
              </div>

              <h1 className="text-3xl lg:text-4xl font-extrabold leading-tight">
                {kelas.nama}
              </h1>

              {kelas.deskripsi && (
                <p className="text-slate-300 text-sm leading-relaxed line-clamp-3">
                  {kelas.deskripsi}
                </p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-indigo-400" />
                  {kelas.peserta_terdaftar_count} Peserta
                </span>
                {kelas.tanggal_mulai && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-indigo-400" />
                    Mulai: {kelas.tanggal_mulai}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-indigo-400" />
                  oleh {kelas.owner.name}
                </span>
              </div>
            </div>

            {/* CTA Card */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                {kelas.thumbnail ? (
                  <img src={kelas.thumbnail} alt={kelas.nama} className="w-full h-44 object-cover" />
                ) : (
                  <div className="w-full h-44 bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                    <Play className="h-14 w-14 text-white opacity-80" />
                  </div>
                )}

                <div className="p-5 space-y-3">
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-extrabold text-gray-900">
                      {formatHarga(kelas.harga, kelas.is_gratis)}
                    </span>
                  </div>

                  {kelas.tanggal_mulai && (
                    <p className="text-xs text-gray-500 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                      Mulai: {kelas.tanggal_mulai}
                    </p>
                  )}
                  {kelas.tanggal_selesai && (
                    <p className="text-xs text-gray-500 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-indigo-500" />
                      Selesai: {kelas.tanggal_selesai}
                    </p>
                  )}

                  <button
                    onClick={() => setCheckoutOpen(true)}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition flex items-center justify-center gap-2"
                  >
                    Daftar Sekarang <ArrowRight className="h-4 w-4" />
                  </button>

                  <p className="text-xs text-gray-400 text-center">
                    🔒 Pendaftaran aman & terlindungi
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════
            STICKY NAV
        ════════════════════════════════════════ */}
        {navItems.length > 0 && (
          <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
            <div className="max-w-5xl mx-auto px-4">
              <div className="flex gap-6 overflow-x-auto py-3 text-sm font-medium text-gray-500">
                {navItems.map((item) => (
                  <a key={item.href} href={item.href} className="whitespace-nowrap hover:text-indigo-600 transition">
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════
            KONTEN — 2 kolom
        ════════════════════════════════════════ */}
        <div className="max-w-5xl mx-auto px-4 py-6 flex gap-6 items-start">

          {/* ── KIRI ── */}
          <div className="flex-1 min-w-0">

            {/* Tentang Kelas */}
            {kelas.deskripsi && (
              <div id="tentang">
                <ContentCard title="Tentang Kelas">
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                    {kelas.deskripsi}
                  </p>
                </ContentCard>
              </div>
            )}

            {/* Syarat Sertifikat */}
            {kelas.require_quiz_sertifikat && (
              <div id="sertifikat">
                <ContentCard title="📜 Syarat Mendapat Sertifikat">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 border border-gray-100 rounded-md px-3 py-2.5">
                      <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700">Hadir di semua sesi presensi (awal, tengah, akhir)</p>
                    </div>
                    {kelas.nilai_minimum_quiz && (
                      <div className="flex items-center gap-3 border border-gray-100 rounded-md px-3 py-2.5">
                        <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-700">
                          Nilai quiz minimum: <strong>{kelas.nilai_minimum_quiz}</strong>
                        </p>
                      </div>
                    )}
                  </div>
                </ContentCard>
              </div>
            )}

            {/* Penyelenggara */}
            <div id="penyelenggara">
              <ContentCard title="Penyelenggara">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center shrink-0">
                    <span className="text-white text-sm font-bold">
                      {kelas.owner.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{kelas.owner.name}</p>
                    <p className="text-xs text-gray-400">Penyelenggara Kelas</p>
                  </div>
                </div>
              </ContentCard>
            </div>
          </div>

          {/* ── KANAN (Sidebar) ── */}
          <div className="w-60 shrink-0 space-y-4">

            {/* Card Detail */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Detail</p>
              </div>
              <div className="px-4 py-4 space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Harga</p>
                  <p className="text-xl font-extrabold text-gray-900 mt-0.5">
                    {formatHarga(kelas.harga, kelas.is_gratis)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Peserta Terdaftar</p>
                  <p className="text-sm font-medium text-gray-800 flex items-center gap-1 mt-0.5">
                    <Users className="h-3.5 w-3.5 text-indigo-500" />
                    {kelas.peserta_terdaftar_count} orang
                  </p>
                </div>

                {kelas.tanggal_mulai && (
                  <div>
                    <p className="text-xs text-gray-500">Mulai Pembelajaran</p>
                    <p className="text-sm font-medium text-gray-800">{kelas.tanggal_mulai}</p>
                  </div>
                )}

                {kelas.tanggal_selesai && (
                  <div>
                    <p className="text-xs text-gray-500">Selesai Pembelajaran</p>
                    <p className="text-sm font-medium text-gray-800">{kelas.tanggal_selesai}</p>
                  </div>
                )}

                <button
                  onClick={() => setCheckoutOpen(true)}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition uppercase tracking-wide mt-1"
                >
                  Daftar Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════
            FOOTER CTA
        ════════════════════════════════════════ */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-700 py-14">
          <div className="max-w-2xl mx-auto px-4 text-center space-y-4">
            <Award className="h-10 w-10 text-indigo-200 mx-auto" />
            <h2 className="text-2xl font-extrabold text-white">{kelas.nama}</h2>
            <p className="text-indigo-100 text-sm">Mulai perjalanan belajarmu sekarang</p>
            <div className="flex items-center justify-center">
              <span className="text-2xl font-extrabold text-white">
                {formatHarga(kelas.harga, kelas.is_gratis)}
              </span>
            </div>
            <button
              onClick={() => setCheckoutOpen(true)}
              className="bg-white text-indigo-700 font-bold px-8 py-3 rounded-xl hover:bg-indigo-50 transition text-sm inline-flex items-center gap-2"
            >
              Daftar Sekarang <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-white py-5">
          <div className="max-w-5xl mx-auto px-4 flex items-center justify-between flex-wrap gap-3">
            <div className="flex gap-5 text-xs text-gray-400">
              <a href="#" className="hover:text-gray-600 transition">Kebijakan Layanan</a>
              <a href="#" className="hover:text-gray-600 transition">Kebijakan Privasi</a>
            </div>
          </div>
          <div className="text-center mt-3 text-xs text-gray-300">🔒 POWERED BY MAYAR.ID</div>
        </div>
      </div>

      {/* Checkout Dialog */}
      <KelasOnlineCheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        kelas={kelas}
      />
    </>
  );
}
