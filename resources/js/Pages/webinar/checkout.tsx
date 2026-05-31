import { Head } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { 
  Calendar, Users, AlertCircle, Check, Award, Play, 
  CheckCircle2, Clock, User, Phone, Mail, Loader2
} from "lucide-react";
import PublicProductLayout from "@/components/public/PublicProductLayout";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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
  instruksi?: string;
  syarat_ketentuan?: string;
  user_id?: number | null;
};

type Props = {
  webinar: Webinar;
};

declare global {
  interface Window {
    snap: any;
  }
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

export default function CheckoutWebinar({ webinar }: Props) {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [snapLoaded, setSnapLoaded] = useState(false);

  useEffect(() => {
    // Load Midtrans Snap
    const script = document.createElement("script");
    script.src = "https://app.midtrans.com/snap/snap.js";
    script.async = true;
    script.onload = () => setSnapLoaded(true);
    document.body.appendChild(script);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/webinar/${webinar.id}/payment/process`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": document
              .querySelector('meta[name="csrf-token"]')
              ?.getAttribute("content") || "",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Gagal memproses pembayaran");
        setLoading(false);
        return;
      }

      // Jika gratis
      if (data.order_id?.startsWith("FREE-")) {
        setSuccess(true);
        setTimeout(() => {
          window.location.href = `/webinar/confirmation?order_id=${data.order_id}`;
        }, 1500);
        return;
      }

      // Tampilkan Midtrans payment
      if (data.snap_token && window.snap) {
        window.snap.pay(data.snap_token, {
          onSuccess: (result: any) => {
            window.location.href = `/webinar/confirmation?order_id=${data.order_id}&status=success`;
          },
          onPending: (result: any) => {
            window.location.href = `/webinar/confirmation?order_id=${data.order_id}&status=pending`;
          },
          onError: (result: any) => {
            setError("Pembayaran gagal");
            setLoading(false);
          },
          onClose: () => {
            setError("Pembayaran dibatalkan");
            setLoading(false);
          },
        });
      }
    } catch (err) {
      setError("Error: " + (err instanceof Error ? err.message : "Unknown error"));
      setLoading(false);
    }
  };

  const formatTanggal = (str?: string) => {
    if (!str) return "";
    return new Date(str).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <PublicProductLayout
      productId={`webinar:${webinar.id}`}
      title={webinar.nama}
      harga={webinar.harga ?? 0}
      hargaCoret={webinar.harga_coret}
      redirectUrl={null}
      themeColorClass="bg-purple-600 hover:bg-purple-700"
      textColorClass="text-purple-600"
      badgeText="Webinar"
      navTitle="Mayar Webinar"
      navIcon={<Award className="text-white h-5 w-5" />}
      creatorId={webinar.user_id}
      onCheckout={() => setCheckoutOpen(true)}
    >
      <div className="space-y-8">
        
        {/* Cover and Quick Details */}
        <div className="grid md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-5">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative aspect-[4/3] bg-slate-100 rounded-2xl overflow-hidden shadow-xl border border-slate-200/60">
                {webinar.cover ? (
                  <img src={webinar.cover} alt={webinar.nama} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 to-indigo-600 flex flex-col items-center justify-center p-8 text-center text-white">
                    <Play size={64} className="opacity-80 mb-2" />
                    <p className="font-bold text-sm">Interactive Webinar</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="md:col-span-7 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-100 uppercase tracking-wider">
                Webinar
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight leading-tight">
                {webinar.nama}
              </h1>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-white rounded-2xl p-4 text-center border border-slate-100 shadow-sm">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Peserta Terdaftar</p>
                <p className="text-base font-extrabold text-slate-800">{webinar.peserta_count ?? 0}</p>
              </div>
              {webinar.max_peserta && (
                <div className="bg-white rounded-2xl p-4 text-center border border-slate-100 shadow-sm">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Max Kuota</p>
                  <p className="text-base font-extrabold text-slate-800">{webinar.max_peserta} Orang</p>
                </div>
              )}
              {webinar.tanggal_mulai && (
                <div className="bg-white rounded-2xl p-4 text-center border border-slate-100 shadow-sm col-span-2 sm:col-span-1">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Waktu</p>
                  <p className="text-[11px] font-extrabold text-slate-800 truncate" title={formatTanggal(webinar.tanggal_mulai)}>
                    {formatTanggal(webinar.tanggal_mulai)}
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <Clock className="h-4 w-4 text-purple-500" />
              <span>Jadwal Mulai: {formatTanggal(webinar.tanggal_mulai) || "-"}</span>
            </div>
          </div>
        </div>

        {/* Deskripsi */}
        {webinar.deskripsi && (
          <div>
            <ContentCard title="Deskripsi Webinar">
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {webinar.deskripsi}
              </p>
            </ContentCard>
          </div>
        )}

        {/* Syarat & Ketentuan */}
        {webinar.syarat_ketentuan && (
          <div>
            <ContentCard title="Syarat & Ketentuan">
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {webinar.syarat_ketentuan}
              </p>
            </ContentCard>
          </div>
        )}

        {/* Fasilitas */}
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { title: "Akses Rekaman", desc: "Tonton kapan saja setelah live selesai" },
            { title: "Sertifikat Elektronik", desc: "Dapatkan sertifikat penyelesaian resmi" },
            { title: "Materi Lengkap", desc: "Akses ke slide presentasi & referensi tambahan" }
          ].map((item, idx) => (
            <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-1">
              <div className="flex items-center gap-2 text-purple-600 font-bold text-sm">
                <CheckCircle2 size={16} className="text-purple-600" />
                <span>{item.title}</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

      </div>

      {/* Checkout Dialog */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">Pendaftaran Webinar</DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              Silakan isi formulir di bawah ini untuk mengamankan tiket webinar Anda.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-slate-700">Nama Lengkap *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="pl-9 rounded-xl border-slate-200"
                  placeholder="Masukkan nama lengkap Anda"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-slate-700">Alamat Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="pl-9 rounded-xl border-slate-200"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-slate-700">No. Telepon / WhatsApp *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="pl-9 rounded-xl border-slate-200"
                  placeholder="08xx xxxx xxxx"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-start gap-2.5 text-xs">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 text-green-700 rounded-xl border border-green-200 flex items-start gap-2.5 text-xs animate-pulse">
                <Check size={16} className="flex-shrink-0 mt-0.5" />
                <span>✓ Berhasil! Mengalihkan ke halaman konfirmasi...</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || success}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses Pendaftaran...
                </>
              ) : (
                "Lanjut ke Pembayaran"
              )}
            </Button>

            <p className="text-[10px] text-slate-400 text-center">
              🔒 Transaksi aman & terenkripsi oleh Midtrans.
            </p>
          </form>
        </DialogContent>
      </Dialog>
    </PublicProductLayout>
  );
}

