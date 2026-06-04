import { Head } from "@inertiajs/react";
import UnifiedCheckoutDialog from "@/components/public/UnifiedCheckoutDialog";
import { useState } from "react";
import {
  ChevronDown, ChevronUp, CheckCircle2,
  Clock, Users, BookOpen, MapPin, Video,
  Calendar, User, Play, ArrowRight, Award,
  ChevronRight, Download, GraduationCap
} from "lucide-react";
import PublicProductLayout from "@/components/public/PublicProductLayout";

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
  user_id?: number | null;
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

function ensureArray(val: any): any[] {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try { const p = JSON.parse(val); return Array.isArray(p) ? p : []; }
    catch { return []; }
  }
  return [];
}

function FaqItem({ item }: { item: { pertanyaan: string; jawaban: string } }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-100 rounded-2xl overflow-hidden mb-2 bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-slate-50 transition"
      >
        <span className="text-sm font-semibold text-slate-800">{item.pertanyaan}</span>
        {open
          ? <ChevronUp className="h-4 w-4 text-slate-500 shrink-0" />
          : <ChevronDown className="h-4 w-4 text-slate-500 shrink-0" />
        }
      </button>
      {open && (
        <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed bg-white border-t border-slate-50 pt-2">
          {item.jawaban}
        </div>
      )}
    </div>
  );
}

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

export default function BootcampPublic(props: Props) {
  const { bootcamp, peserta = null } = props;
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutPrice, setCheckoutPrice] = useState(bootcamp.harga ?? 0);
  const [couponCode, setCouponCode] = useState("");
  const isBerbayar = (bootcamp.harga ?? 0) > 0;

  const sesiList   = ensureArray(props.sesiList);
  const babList    = ensureArray(props.babList);
  const instruktur = ensureArray(props.instruktur);
  const silabus    = ensureArray(props.silabus);
  const cocokUntuk = ensureArray(props.cocokUntuk);
  const outcome    = ensureArray(props.outcome);
  const faqs       = ensureArray(props.faqs);

  const [babExpanded, setBabExpanded] = useState<Record<number, boolean>>({});
  const [instrukturExpanded, setInstrukturExpanded] = useState<Record<number, boolean>>({});

  const navItems = [
    outcome.length    > 0 && { href: "#outcome",    label: "Outcome" },
    cocokUntuk.length > 0 && { href: "#cocok",      label: "Untuk Siapa" },
    silabus.length    > 0 && { href: "#silabus",    label: "Silabus" },
    babList.length    > 0 && { href: "#modul",      label: "Modul" },
    sesiList.length   > 0 && { href: "#sesi",       label: "Jadwal Sesi" },
    instruktur.length > 0 && { href: "#instruktur", label: "Instruktur" },
  ].filter(Boolean) as { href: string; label: string }[];

  const handleCheckoutClick = (finalPrice?: number, coupon?: string) => {
    if (typeof finalPrice === "number") {
      setCheckoutPrice(finalPrice);
    }
    setCouponCode(coupon || "");
    setCheckoutOpen(true);
  };

  return (
    <PublicProductLayout
      productId={`bootcamp:${bootcamp.id}`}
      title={bootcamp.name}
      harga={bootcamp.harga ?? 0}
      hargaCoret={bootcamp.harga_coret}
      redirectUrl={null}
      themeColorClass="bg-blue-600 hover:bg-blue-700"
      textColorClass="text-blue-600"
      badgeText="Bootcamp"
      navTitle="Mayar Bootcamp"
      navIcon={<GraduationCap className="text-white h-5 w-5" />}
      onCheckout={handleCheckoutClick}
      creatorId={bootcamp.user_id}
    >
      <div className="space-y-8">
        
        {/* Cover and Quick Details */}
        <div className="grid md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-5">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative aspect-[3/4] bg-slate-100 rounded-2xl overflow-hidden shadow-xl border border-slate-200/60">
                {bootcamp.cover_url ? (
                  <img src={bootcamp.cover_url} alt={bootcamp.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex flex-col items-center justify-center p-8 text-center text-white">
                    <GraduationCap size={64} className="opacity-80 mb-2" />
                    <p className="font-bold text-sm">Bootcamp Interactive</p>
                  </div>
                )}
                
                {/* Batch Badge */}
                <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border border-slate-700">
                  {bootcamp.batch || "BATCH 1"}
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-7 space-y-6">
            <div className="space-y-3">
              {bootcamp.kategori && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wider">
                  {bootcamp.kategori}
                </div>
              )}
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight leading-tight">
                {bootcamp.name}
              </h1>
              {bootcamp.deskripsi && (
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{bootcamp.deskripsi}</p>
              )}
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              {sesiList.length > 0 && (
                <div className="bg-white rounded-2xl p-4 text-center border border-slate-100 shadow-sm">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Sesi</p>
                  <p className="text-base font-extrabold text-slate-800">{sesiList.length}</p>
                </div>
              )}
              {bootcamp.max_peserta && (
                <div className="bg-white rounded-2xl p-4 text-center border border-slate-100 shadow-sm">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Max Peserta</p>
                  <p className="text-base font-extrabold text-slate-800">{bootcamp.max_peserta}</p>
                </div>
              )}
              {babList.length > 0 && (
                <div className="bg-white rounded-2xl p-4 text-center border border-slate-100 shadow-sm">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Modul</p>
                  <p className="text-base font-extrabold text-slate-800">{babList.length}</p>
                </div>
              )}
            </div>
            
            {bootcamp.tanggal_mulai_pembelajaran && (
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span>Pembelajaran dimulai: {bootcamp.tanggal_mulai_pembelajaran}</span>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Nav inside left column for smooth navigation */}
        {navItems.length > 0 && (
          <div className="bg-white border border-slate-100 rounded-2xl p-2 flex gap-4 overflow-x-auto text-xs font-bold text-slate-500 scrollbar-none shadow-sm">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="whitespace-nowrap px-4 py-2 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition">
                {item.label}
              </a>
            ))}
          </div>
        )}

        {/* Outcome */}
        {outcome.length > 0 && (
          <div id="outcome">
            <ContentCard title="Yang Akan Kamu Capai">
              <div className="grid sm:grid-cols-2 gap-3">
                {outcome.map((item: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 border border-slate-50 rounded-2xl p-4 bg-slate-50/20">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-700 leading-relaxed">{item}</p>
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
                  <div key={i} className="flex items-start gap-3 border border-slate-100 rounded-2xl p-4 bg-white">
                    <span className="text-xs font-black text-blue-600 bg-blue-50 w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-xs font-semibold text-slate-700 pt-0.5">{item}</p>
                  </div>
                ))}
              </div>
            </ContentCard>
          </div>
        )}

        {/* Silabus */}
        {silabus.length > 0 && (
          <div id="silabus">
            <ContentCard title="Silabus Program">
              <div className="space-y-2">
                {silabus.map((item: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 border border-slate-100 rounded-2xl p-4 bg-white">
                    <span className="text-xs font-black text-slate-400 w-5 shrink-0 mt-0.5">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <p className="text-xs font-semibold text-slate-700">{item}</p>
                  </div>
                ))}
              </div>
            </ContentCard>
          </div>
        )}

        {/* Kurikulum / Bab */}
        {babList.length > 0 && (
          <div id="modul">
            <ContentCard title="Kurikulum & Modul Belajar">
              <div className="space-y-2">
                {babList.map((bab: Bab, i: number) => (
                  <div key={i} className="border border-slate-100 rounded-2xl overflow-hidden bg-white">
                    <button
                      onClick={() => setBabExpanded((p) => ({ ...p, [i]: !p[i] }))}
                      className="w-full flex items-center justify-between px-4 py-3.5 bg-slate-50/50 hover:bg-slate-50 transition text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          Bab {i + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-800">{bab.judul}</span>
                        {bab.materis && bab.materis.length > 0 && (
                          <span className="text-[10px] text-slate-400">({bab.materis.length} materi)</span>
                        )}
                      </div>
                      {babExpanded[i]
                        ? <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" />
                        : <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                      }
                    </button>
                    {babExpanded[i] && bab.materis && bab.materis.length > 0 && (
                      <div className="divide-y divide-slate-50 bg-white">
                        {bab.materis.map((m, j) => (
                          <div key={j} className="flex items-center gap-3 px-4 py-3">
                            <Play className="h-3 w-3 text-slate-300 shrink-0 fill-current" />
                            <span className="text-xs text-slate-600 flex-1">{m.judul}</span>
                            {m.durasi && <span className="text-xs text-slate-400 font-semibold">{m.durasi}</span>}
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
            <ContentCard title="Jadwal Sesi Pembelajaran">
              <div className="space-y-3">
                {sesiList.map((sesi: Sesi, i: number) => (
                  <div key={i} className="flex items-start gap-4 border border-slate-100 rounded-2xl p-4 bg-white">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                      {sesi.is_online
                        ? <Video className="h-5 w-5 text-blue-500" />
                        : <MapPin className="h-5 w-5 text-emerald-500" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-slate-800">{sesi.judul}</p>
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                          sesi.is_online ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
                        }`}>
                          {sesi.is_online ? "Online" : "Offline"}
                        </span>
                      </div>
                      {sesi.waktu_mulai && (
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {sesi.waktu_mulai}{sesi.waktu_selesai && ` – ${sesi.waktu_selesai}`}
                        </p>
                      )}
                      {!sesi.is_online && sesi.lokasi && (
                        <p className="text-xs text-slate-400 mt-1 flex items-start gap-1.5">
                          <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-slate-300" />
                          <span className="line-clamp-2">{sesi.lokasi}</span>
                        </p>
                      )}
                      {sesi.nama_pemateri && (
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-slate-300" /> {sesi.nama_pemateri}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ContentCard>
          </div>
        )}

        {/* Instruktur */}
        {instruktur.length > 0 && (
          <div id="instruktur">
            <ContentCard title="Instruktur & Pengajar">
              <div className="grid sm:grid-cols-2 gap-4">
                {instruktur.map((ins: Instruktur, i: number) => (
                  <div key={i} className="border border-slate-100 rounded-2xl overflow-hidden bg-white">
                    <button
                      onClick={() => setInstrukturExpanded((p) => ({ ...p, [i]: !p[i] }))}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition text-left"
                    >
                      {ins.foto_url ? (
                        <img src={ins.foto_url} alt={ins.nama} className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-100" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shrink-0">
                          <span className="text-white text-sm font-bold">
                            {ins.nama.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{ins.nama}</p>
                        {ins.jabatan && (
                          <p className="text-[10px] text-blue-600 font-bold truncate mt-0.5">{ins.jabatan}</p>
                        )}
                      </div>
                      <ChevronRight className={`h-4 w-4 text-slate-400 transition-transform ${instrukturExpanded[i] ? "rotate-90" : ""}`} />
                    </button>
                    {instrukturExpanded[i] && ins.bio && (
                      <div className="px-4 pb-4 pt-1 text-xs text-slate-500 leading-relaxed bg-slate-50/50 border-t border-slate-100">
                        {ins.bio}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ContentCard>
          </div>
        )}

        {/* FAQs */}
        {faqs.length > 0 && (
          <ContentCard title="Frequently Asked Question (FAQ)">
            {faqs.map((item: { pertanyaan: string; jawaban: string }, i: number) => (
              <FaqItem key={i} item={item} />
            ))}
          </ContentCard>
        )}

      </div>

      <UnifiedCheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        productType="bootcamp"
        productId={bootcamp.id}
        productName={bootcamp.name}
        harga={checkoutPrice}
        couponCode={couponCode}
      />
    </PublicProductLayout>
  );
}