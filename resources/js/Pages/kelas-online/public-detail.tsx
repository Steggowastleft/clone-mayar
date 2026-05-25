import { Head } from "@inertiajs/react";
import { useState } from "react";
import {
  ChevronDown, ChevronUp, CheckCircle2,
  Users, Calendar, Play, ArrowRight, Award,
  Clock, BookOpen, GraduationCap
} from "lucide-react";
import { KelasOnlineCheckoutDialog } from "./components/checkout-dialog";
import PublicProductLayout from "@/components/public/PublicProductLayout";

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
// Content Card
// ─────────────────────────────────────────────
function ContentCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-slate-50">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{title}</h3>
      </div>
      <div className="px-6 py-5">{children}</div>
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
    <PublicProductLayout
      productId={`kelas-online:${kelas.id}`}
      title={kelas.nama}
      harga={kelas.harga ?? 0}
      hargaCoret={null}
      redirectUrl={null}
      themeColorClass="bg-indigo-600 hover:bg-indigo-700"
      textColorClass="text-indigo-600"
      badgeText="Kelas Online"
      navTitle="Mayar Kelas Online"
      navIcon={<GraduationCap className="text-white h-5 w-5" />}
      onCheckout={() => setCheckoutOpen(true)}
    >
      <div className="space-y-8">
        
        {/* Cover and Quick Details */}
        <div className="grid md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-5">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative aspect-[4/3] bg-slate-100 rounded-2xl overflow-hidden shadow-xl border border-slate-200/60">
                {kelas.thumbnail ? (
                  <img src={kelas.thumbnail} alt={kelas.nama} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-violet-600 flex flex-col items-center justify-center p-8 text-center text-white">
                    <Play size={64} className="opacity-80 mb-2" />
                    <p className="font-bold text-sm">Kelas Online</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="md:col-span-7 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wider">
                Kelas Online
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight leading-tight">
                {kelas.nama}
              </h1>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-white rounded-2xl p-4 text-center border border-slate-100 shadow-sm">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Peserta</p>
                <p className="text-base font-extrabold text-slate-800">{kelas.peserta_terdaftar_count}</p>
              </div>
              {kelas.tanggal_mulai && (
                <div className="bg-white rounded-2xl p-4 text-center border border-slate-100 shadow-sm">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Mulai</p>
                  <p className="text-xs font-extrabold text-slate-800 truncate">{kelas.tanggal_mulai}</p>
                </div>
              )}
              {kelas.tanggal_selesai && (
                <div className="bg-white rounded-2xl p-4 text-center border border-slate-100 shadow-sm">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Selesai</p>
                  <p className="text-xs font-extrabold text-slate-800 truncate">{kelas.tanggal_selesai}</p>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <BookOpen className="h-4 w-4 text-indigo-500" />
              <span>Diselenggarakan oleh: {kelas.owner.name}</span>
            </div>
          </div>
        </div>

        {/* Sticky Nav inside left column for smooth navigation */}
        {navItems.length > 0 && (
          <div className="bg-white border border-slate-100 rounded-2xl p-2 flex gap-4 overflow-x-auto text-xs font-bold text-slate-500 scrollbar-none shadow-sm">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="whitespace-nowrap px-4 py-2 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition">
                {item.label}
              </a>
            ))}
          </div>
        )}

        {/* Tentang Kelas */}
        {kelas.deskripsi && (
          <div id="tentang">
            <ContentCard title="Tentang Kelas">
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {kelas.deskripsi}
              </p>
            </ContentCard>
          </div>
        )}

        {/* Syarat Sertifikat */}
        {kelas.require_quiz_sertifikat && (
          <div id="sertifikat">
            <ContentCard title="Syarat Mendapat Sertifikat">
              <div className="space-y-2">
                <div className="flex items-center gap-3 border border-slate-50 rounded-2xl p-4 bg-slate-50/20">
                  <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-700 leading-relaxed">Hadir di semua sesi presensi (awal, tengah, akhir)</p>
                </div>
                {kelas.nilai_minimum_quiz && (
                  <div className="flex items-center gap-3 border border-slate-50 rounded-2xl p-4 bg-slate-50/20">
                    <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-700 leading-relaxed">
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

      {/* Checkout Dialog */}
      <KelasOnlineCheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        kelas={kelas}
      />
    </PublicProductLayout>
  );
}

