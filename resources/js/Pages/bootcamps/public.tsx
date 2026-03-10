import { Head } from "@inertiajs/react";
import { CheckoutDialog } from "@/Pages/Peserta/checkoutdialog";
import { useState } from "react";
import {
  ChevronDown, ChevronUp, CheckCircle2,
  Clock, Users, BookOpen, MapPin, Video,
  Calendar, User, Play, ArrowRight, Award,
  HelpCircle, ChevronRight, Download,
} from "lucide-react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type Sesi = {
  judul: string;
  is_online: boolean;
  lokasi?: string;
  waktu_mulai?: string;
  waktu_selesai?: string;
  nama_pemateri?: string;
};

type Bab = {
  judul: string;
  deskripsi?: string;
  materis?: { judul: string; tipe: string; durasi?: string }[];
};

type Instruktur = {
  nama: string;
  jabatan?: string;
  bio?: string;
  foto_url?: string;
};

type Bootcamp = {
  id: number;
  name: string;
  batch: string;
  harga?: number;
  harga_coret?: number;
  deskripsi?: string;
  kategori?: string;
  cover_url?: string;
  max_peserta?: number;
  tanggal_mulai_pembelajaran?: string;
  tanggal_batas_pembelajaran?: string;
};

type Peserta = {
  id: number;
  nama: string;
  email: string;
  no_hp?: string;
} | null;

type Props = {
  bootcamp: Bootcamp;
  peserta?: Peserta;
  sesiList?: any;
  babList?: any;
  instruktur?: any;
  silabus?: any;
  cocokUntuk?: any;
  outcome?: any;
  faqs?: any;
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function ensureArray(val: any): any[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try { const p = JSON.parse(val); return Array.isArray(p) ? p : []; }
    catch { return []; }
  }
  return [];
}

function formatHarga(n?: number) {
  if (!n || n === 0) return "Gratis";
  return `Rp ${Number(n).toLocaleString("id-ID")}`;
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
// Content Card (kiri)
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
// Main Page
// ─────────────────────────────────────────────
export default function BootcampPublic(props: Props) {
  const { bootcamp, peserta = null } = props;
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const sesiList   = ensureArray(props.sesiList);
  const babList    = ensureArray(props.babList);
  const instruktur = ensureArray(props.instruktur);
  const silabus    = ensureArray(props.silabus);
  const cocokUntuk = ensureArray(props.cocokUntuk);
  const outcome    = ensureArray(props.outcome);
  const faqs       = ensureArray(props.faqs);

  const [babExpanded, setBabExpanded] = useState<Record<number, boolean>>({});
  const [instrukturExpanded, setInstrukturExpanded] = useState<Record<number, boolean>>({});

  // Nav items untuk sticky nav
  const navItems = [
    outcome.length    > 0 && { href: "#outcome",    label: "Outcome" },
    cocokUntuk.length > 0 && { href: "#cocok",      label: "Untuk Siapa" },
    silabus.length    > 0 && { href: "#silabus",    label: "Silabus" },
    babList.length    > 0 && { href: "#modul",      label: "Modul" },
    sesiList.length   > 0 && { href: "#sesi",       label: "Jadwal Sesi" },
    instruktur.length > 0 && { href: "#instruktur", label: "Instruktur" },
  ].filter(Boolean) as { href: string; label: string }[];

  return (
    <>
      <Head title={bootcamp.name} />
      <div className="min-h-screen bg-white">

        {/* ════════════════════════════════════════
            HERO — tetap seperti sebelumnya
        ════════════════════════════════════════ */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white">
          <div className="max-w-5xl mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-5 gap-10 items-center">
            <div className="lg:col-span-3 space-y-5">
              {bootcamp.kategori && (
                <span className="inline-block text-xs font-bold tracking-widest text-blue-300 uppercase">
                  {bootcamp.kategori}
                </span>
              )}
              <h1 className="text-3xl lg:text-4xl font-extrabold leading-tight">{bootcamp.name}</h1>
              {bootcamp.deskripsi && (
                <p className="text-slate-300 text-sm leading-relaxed line-clamp-3">{bootcamp.deskripsi}</p>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-slate-300">
                {sesiList.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-blue-400" /> {sesiList.length} Sesi
                  </span>
                )}
                {bootcamp.max_peserta && (
                  <span className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-blue-400" /> Maks. {bootcamp.max_peserta} Peserta
                  </span>
                )}
                {babList.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-blue-400" /> {babList.length} Modul
                  </span>
                )}
              </div>
            </div>

            {/* CTA Card */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                {bootcamp.cover_url ? (
                  <img src={bootcamp.cover_url} alt={bootcamp.name} className="w-full h-44 object-cover" />
                ) : (
                  <div className="w-full h-44 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <Play className="h-14 w-14 text-white opacity-80" />
                  </div>
                )}
                <div className="p-5 space-y-3">
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-extrabold text-gray-900">{formatHarga(bootcamp.harga)}</span>
                    {bootcamp.harga_coret && (
                      <span className="text-sm text-gray-400 line-through">{formatHarga(bootcamp.harga_coret)}</span>
                    )}
                  </div>
                  {bootcamp.tanggal_mulai_pembelajaran && (
                    <p className="text-xs text-gray-500 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-blue-500" />
                      Mulai: {bootcamp.tanggal_mulai_pembelajaran}
                    </p>
                  )}
                  <button
                    onClick={() => setCheckoutOpen(true)}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition flex items-center justify-center gap-2"
                  >
                    Daftar Sekarang <ArrowRight className="h-4 w-4" />
                  </button>
                  <p className="text-xs text-gray-400 text-center">{bootcamp.batch}</p>
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
                  <a key={item.href} href={item.href} className="whitespace-nowrap hover:text-blue-600 transition">
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

            {/* Outcome */}
            {outcome.length > 0 && (
              <div id="outcome">
                <ContentCard title="Yang Akan Kamu Capai">
                  <div className="space-y-2">
                    {outcome.map((item: string, i: number) => (
                      <div key={i} className="flex items-start gap-3 border border-gray-100 rounded-md px-3 py-2.5">
                        <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-700">{item}</p>
                      </div>
                    ))}
                  </div>
                </ContentCard>
              </div>
            )}

            {/* Cocok Untuk */}
            {cocokUntuk.length > 0 && (
              <div id="cocok">
                <ContentCard title="Kelas Ini Cocok Untuk?">
                  <div className="space-y-2">
                    {cocokUntuk.map((item: string, i: number) => (
                      <div key={i} className="flex items-start gap-3 border border-gray-100 rounded-md px-3 py-2.5">
                        <span className="text-xs font-bold text-gray-400 w-5 shrink-0 mt-0.5">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <p className="text-sm font-medium text-gray-800">{item}</p>
                      </div>
                    ))}
                  </div>
                </ContentCard>
              </div>
            )}

            {/* Silabus */}
            {silabus.length > 0 && (
              <div id="silabus">
                <ContentCard title="Silabus">
                  <div className="space-y-2">
                    {silabus.map((item: string, i: number) => (
                      <div key={i} className="flex items-start gap-3 border border-gray-100 rounded-md px-3 py-2.5">
                        <span className="text-xs font-bold text-gray-400 w-5 shrink-0 mt-0.5">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <p className="text-sm text-gray-800">{item}</p>
                      </div>
                    ))}
                  </div>
                </ContentCard>
              </div>
            )}

            {/* Kurikulum / Bab */}
            {babList.length > 0 && (
              <div id="modul">
                <ContentCard title="Kurikulum & Modul">
                  <div className="space-y-2">
                    {babList.map((bab: Bab, i: number) => (
                      <div key={i} className="border border-gray-100 rounded-md overflow-hidden">
                        <button
                          onClick={() => setBabExpanded((p) => ({ ...p, [i]: !p[i] }))}
                          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition text-left"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                              Bab {i + 1}
                            </span>
                            <span className="text-sm font-medium text-gray-800">{bab.judul}</span>
                            {bab.materis && bab.materis.length > 0 && (
                              <span className="text-xs text-gray-400">({bab.materis.length} materi)</span>
                            )}
                          </div>
                          {babExpanded[i]
                            ? <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" />
                            : <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
                          }
                        </button>
                        {babExpanded[i] && bab.materis && bab.materis.length > 0 && (
                          <div className="divide-y divide-gray-50 bg-white">
                            {bab.materis.map((m, j) => (
                              <div key={j} className="flex items-center gap-3 px-4 py-2.5">
                                <Play className="h-3 w-3 text-gray-300 shrink-0" />
                                <span className="text-xs text-gray-600 flex-1">{m.judul}</span>
                                {m.durasi && <span className="text-xs text-gray-400">{m.durasi}</span>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ContentCard>
              </div>
            )}

            {/* Jadwal Sesi */}
            {sesiList.length > 0 && (
              <div id="sesi">
                <ContentCard title="Jadwal Sesi">
                  <div className="space-y-3">
                    {sesiList.map((sesi: Sesi, i: number) => (
                      <div key={i} className="flex items-start gap-3 border border-gray-100 rounded-md px-3 py-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                          {sesi.is_online
                            ? <Video className="h-4 w-4 text-blue-500" />
                            : <MapPin className="h-4 w-4 text-emerald-500" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-medium text-gray-800">{sesi.judul}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              sesi.is_online ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
                            }`}>
                              {sesi.is_online ? "Online" : "Offline"}
                            </span>
                          </div>
                          {sesi.waktu_mulai && (
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {sesi.waktu_mulai}{sesi.waktu_selesai && ` – ${sesi.waktu_selesai}`}
                            </p>
                          )}
                          {!sesi.is_online && sesi.lokasi && (
                            <p className="text-xs text-gray-400 mt-0.5 flex items-start gap-1">
                              <MapPin className="h-3 w-3 shrink-0 mt-0.5" />
                              <span className="line-clamp-2">{sesi.lokasi}</span>
                            </p>
                          )}
                          {sesi.nama_pemateri && (
                            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                              <User className="h-3 w-3" /> {sesi.nama_pemateri}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ContentCard>
              </div>
            )}

            {/* FAQ */}
            {faqs.length > 0 && (
              <ContentCard title="Frequently Asked Question">
                {faqs.map((item: { pertanyaan: string; jawaban: string }, i: number) => (
                  <FaqItem key={i} item={item} />
                ))}
              </ContentCard>
            )}

          </div>

          {/* ── KANAN (Sidebar) ── */}
          <div className="w-60 shrink-0 space-y-4">

            {/* Card Detail & Harga */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Detail</p>
              </div>
              <div className="px-4 py-4 space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Harga</p>
                  <p className="text-xl font-extrabold text-gray-900 mt-0.5">
                    {formatHarga(bootcamp.harga)}
                  </p>
                  {bootcamp.harga_coret && (
                    <p className="text-xs text-gray-400 line-through">{formatHarga(bootcamp.harga_coret)}</p>
                  )}
                </div>

                {bootcamp.tanggal_mulai_pembelajaran && (
                  <div>
                    <p className="text-xs text-gray-400">Mulai Pembelajaran</p>
                    <p className="text-sm font-medium text-gray-800">{bootcamp.tanggal_mulai_pembelajaran}</p>
                  </div>
                )}

                {bootcamp.max_peserta && (
                  <div>
                    <p className="text-xs text-gray-400">Maks. Peserta</p>
                    <p className="text-sm font-medium text-gray-800">{bootcamp.max_peserta} orang</p>
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <button className="w-9 h-9 border border-gray-200 rounded-md flex items-center justify-center hover:bg-gray-50 transition shrink-0">
                    <Download className="h-4 w-4 text-gray-500" />
                  </button>
                  <button className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-md transition uppercase tracking-wide">
                    Beli Sekarang
                  </button>
                </div>
              </div>
            </div>

            {/* Card Pemateri */}
            {instruktur.length > 0 && (
              <div id="instruktur" className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Pemateri</p>
                </div>
                <div className="divide-y divide-gray-50">
                  {instruktur.map((ins: Instruktur, i: number) => (
                    <div key={i}>
                      <button
                        onClick={() => setInstrukturExpanded((p) => ({ ...p, [i]: !p[i] }))}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left"
                      >
                        {ins.foto_url ? (
                          <img src={ins.foto_url} alt={ins.nama} className="w-9 h-9 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shrink-0">
                            <span className="text-white text-sm font-bold">
                              {ins.nama.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{ins.nama}</p>
                          {ins.jabatan && (
                            <p className="text-xs text-blue-600 font-medium truncate">{ins.jabatan}</p>
                          )}
                        </div>
                        <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${instrukturExpanded[i] ? "rotate-90" : ""}`} />
                      </button>
                      {instrukturExpanded[i] && ins.bio && (
                        <div className="px-4 pb-3 pt-1 text-xs text-gray-500 leading-relaxed bg-gray-50 border-t border-gray-100">
                          {ins.bio}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ════════════════════════════════════════
            FOOTER CTA
        ════════════════════════════════════════ */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-14">
          <div className="max-w-2xl mx-auto px-4 text-center space-y-4">
            <Award className="h-10 w-10 text-blue-200 mx-auto" />
            <h2 className="text-2xl font-extrabold text-white">{bootcamp.name}</h2>
            <p className="text-blue-100 text-sm">Mulai perjalanan belajarmu sekarang</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl font-extrabold text-white">{formatHarga(bootcamp.harga)}</span>
              {bootcamp.harga_coret && (
                <span className="text-blue-200 line-through text-sm">{formatHarga(bootcamp.harga_coret)}</span>
              )}
            </div>
            <button
              onClick={() => setCheckoutOpen(true)}
              className="bg-white text-blue-700 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition text-sm inline-flex items-center gap-2"
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
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span>BAHASA</span>
              <span>|</span>
              <span>ENGLISH</span>
            </div>
          </div>
          <div className="text-center mt-3 text-xs text-gray-300">🔒 POWERED BY MAYAR.ID</div>
        </div>

      </div>

      {/* Checkout Dialog */}
      <CheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        bootcampId={bootcamp.id}
        bootcampName={bootcamp.name}
        harga={bootcamp.harga}
      />
    </>
  );
}