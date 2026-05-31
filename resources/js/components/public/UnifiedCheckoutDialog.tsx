import { useState, useEffect } from "react";
import { usePage } from "@inertiajs/react";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2, CheckCircle2, ArrowRight,
  Mail, KeyRound, User, ChevronLeft, UserPlus, Phone, ShieldCheck, Sparkles
} from "lucide-react";
import { toast } from "sonner";

// Extend Window interface for Midtrans snap
declare global {
  interface Window {
    snap: any;
  }
}

type Step = "pilihan" | "login" | "register" | "checkout_info" | "success";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  productType: string;
  productId: string | number;
  productName: string;
  harga: number;
  prefilledName?: string;
  prefilledEmail?: string;
  prefilledPhone?: string;
};

export default function UnifiedCheckoutDialog({
  open,
  onOpenChange,
  productType,
  productId,
  productName,
  harga,
  prefilledName = "",
  prefilledEmail = "",
  prefilledPhone = "",
}: Props) {
  const { props } = usePage();
  const authPeserta = (props.auth as any)?.peserta;
  const clientKey = (props as any).midtrans_client_key || "";

  const [step, setStep] = useState<Step>("pilihan");
  const [email, setEmail] = useState("");
  const [nama, setNama] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [snapLoaded, setSnapLoaded] = useState(false);

  // Load Midtrans Snap Script dynamically
  useEffect(() => {
    if (open) {
      const isSandbox = clientKey.startsWith("SB-");
      const snapUrl = isSandbox
        ? "https://app.sandbox.midtrans.com/snap/snap.js"
        : "https://app.midtrans.com/snap/snap.js";

      // Check if script already exists
      const existingScript = document.querySelector(`script[src="${snapUrl}"]`);
      if (existingScript) {
        setSnapLoaded(true);
        return;
      }

      const script = document.createElement("script");
      script.src = snapUrl;
      script.setAttribute("data-client-key", clientKey);
      script.async = true;
      script.onload = () => setSnapLoaded(true);
      document.body.appendChild(script);
    }
  }, [open, clientKey]);

  // Handle auto-login detection or reset
  useEffect(() => {
    if (open) {
      if (authPeserta) {
        const nameVal = prefilledName || authPeserta.nama || "";
        const emailVal = prefilledEmail || authPeserta.email || "";
        const phoneVal = prefilledPhone || authPeserta.no_hp || "08123456789";

        setNama(nameVal);
        setEmail(emailVal);
        setPhone(phoneVal);
        setStep("checkout_info");

        // Immediately trigger checkout submit logic for logged-in user
        handleCheckoutSubmit({
          name: nameVal,
          email: emailVal,
          phone: phoneVal,
        });
      } else {
        setStep("pilihan");
        setEmail(prefilledEmail || "");
        setNama(prefilledName || "");
        setPhone(prefilledPhone || "");
        setPassword("");
      }
      setErrors({});
    }
  }, [open, authPeserta, prefilledName, prefilledEmail, prefilledPhone]);

  const getCsrf = () => {
    return (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || "";
  };

  const formatHarga = (n: number) => {
    if (n === 0) return "Gratis";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(n);
  };

  // Step 2a: Log in existing peserta
  const handleLogin = async () => {
    const cleanEmail = email.trim().toLowerCase();
    const errs: Record<string, string> = {};
    if (!cleanEmail) errs.email = "Email wajib diisi.";
    if (!password) errs.password = "Password wajib diisi.";
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    
    setErrors({});
    setLoading(true);
    try {
      const res = await fetch("/peserta/login-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": getCsrf(),
        },
        body: JSON.stringify({ email: cleanEmail, password }),
      });
      const data = await res.json();

      if (res.ok && data.peserta) {
        setNama(data.peserta.nama || "");
        setEmail(data.peserta.email || "");
        setPhone(data.peserta.no_hp || "08123456789");
        setStep("checkout_info");
        
        // Auto trigger checkout on successful login!
        await handleCheckoutSubmit({
          name: data.peserta.nama || "",
          email: data.peserta.email || "",
          phone: data.peserta.no_hp || "08123456789",
        });
      } else {
        setErrors({ password: data.message || "Password salah atau email tidak terdaftar." });
      }
    } catch {
      setErrors({ password: "Gagal login. Periksa koneksi internet Anda." });
    } finally {
      setLoading(false);
    }
  };

  // Step 2b: Register new peserta
  const handleRegister = async () => {
    const cleanEmail = email.trim().toLowerCase();
    const errs: Record<string, string> = {};
    if (!nama) errs.nama = "Nama lengkap wajib diisi.";
    if (!cleanEmail) errs.email = "Email wajib diisi.";
    if (!/\S+@\S+\.\S+/.test(cleanEmail)) errs.email = "Format email tidak valid.";
    if (!password || password.length < 8) errs.password = "Password minimal 8 karakter.";
    
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    
    setErrors({});
    setLoading(true);

    try {
      const res = await fetch("/peserta/register-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": getCsrf(),
        },
        body: JSON.stringify({ email: cleanEmail, nama, password }),
      });

      const data = await res.json();
      if (res.ok && data.peserta) {
        setNama(data.peserta.nama || "");
        setEmail(data.peserta.email || "");
        setPhone("08123456789");
        setStep("checkout_info");

        // Auto trigger checkout on successful registration!
        await handleCheckoutSubmit({
          name: data.peserta.nama || "",
          email: data.peserta.email || "",
          phone: "08123456789",
        });
      } else if (res.status === 422) {
        const flatErrors: Record<string, string> = {};
        for (const [key, value] of Object.entries(data.errors || data)) {
          flatErrors[key] = Array.isArray(value) ? value[0] : (value as string);
        }
        setErrors(flatErrors);
      } else {
        setErrors({ general: data.message || "Gagal mendaftar akun." });
      }
    } catch {
      setErrors({ general: "Terjadi kesalahan jaringan saat mendaftar." });
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Unified Checkout Process
  const handleCheckoutSubmit = async (customData?: { name: string; email: string; phone: string }) => {
    const submitName = customData?.name || nama;
    const submitEmail = customData?.email || email;
    const submitPhone = customData?.phone || phone;

    const errs: Record<string, string> = {};
    if (!submitName) errs.nama = "Nama lengkap wajib diisi.";
    if (!submitEmail) errs.email = "Email wajib diisi.";
    if (!submitPhone) errs.phone = "Nomor Handphone wajib diisi.";
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      const res = await fetch("/checkout/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": getCsrf(),
        },
        body: JSON.stringify({
          product_type: productType,
          product_id: productId,
          name: submitName,
          email: submitEmail,
          phone: submitPhone,
          amount: harga,
        }),
      });

      const data = await res.json();

      if (res.status === 409) {
        toast.info("Anda sudah terdaftar untuk produk ini.");
        window.location.href = data.redirect || "/peserta/dashboard";
        return;
      }

      if (!res.ok) {
        setErrors({ general: data.message || "Gagal memproses pendaftaran." });
        setLoading(false);
        return;
      }

      // If free product checkout
      if (data.is_free) {
        setStep("success");
        toast.success("Pendaftaran berhasil!");
        setTimeout(() => {
          window.location.href = data.redirect || "/peserta/dashboard";
        }, 1500);
        return;
      }

      // If paid, initiate Midtrans Snap
      if (data.snap_token && window.snap) {
        // CLOSE the dialog first to prevent Radix Dialog's focus trap and overlay blocking pointer events!
        onOpenChange(false);

        window.snap.pay(data.snap_token, {
          onSuccess: (result: any) => {
            window.location.href = `/checkout/confirmation?order_id=${data.order_id}&status=success`;
          },
          onPending: (result: any) => {
            window.location.href = `/checkout/confirmation?order_id=${data.order_id}&status=pending`;
          },
          onError: (result: any) => {
            toast.error("Pembayaran gagal. Silakan coba lagi.");
            setLoading(false);
          },
          onClose: () => {
            toast.info("Pembayaran dibatalkan.");
            setLoading(false);
          },
        });
      } else {
        setErrors({ general: "Metode pembayaran Midtrans tidak siap." });
        setLoading(false);
      }
    } catch (err: any) {
      setErrors({ general: "Terjadi kesalahan: " + (err.message || "Kesalahan tidak diketahui") });
      setLoading(false);
    }
  };

  const titles: Record<Step, string> = {
    pilihan: "Daftar & Checkout",
    login: "Masuk ke Akun Peserta",
    register: "Daftar Akun Peserta Baru",
    checkout_info: "Konfirmasi Informasi Checkout",
    success: "Pendaftaran Berhasil! 🎉",
  };

  const descs: Record<Step, string> = {
    pilihan: "Silakan pilih cara untuk mendaftar kelas ini.",
    login: "Silakan masuk menggunakan email dan password Anda.",
    register: "Buat akun baru untuk melanjutkan pembelian.",
    checkout_info: "Lengkapi data untuk menyelesaikan pembayaran/pendaftaran.",
    success: "Anda akan segera dialihkan ke halaman dashboard.",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-3xl border border-gray-100/50 shadow-2xl">
        
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-50 bg-slate-50/50 relative">
          {step !== "pilihan" && step !== "success" && !authPeserta && (
            <button
              onClick={() => {
                setStep("pilihan");
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-600 mb-3 transition"
            >
              <ChevronLeft size={14} /> Kembali
            </button>
          )}

          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-900 tracking-tight">
              {titles[step]}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 font-medium">
              {descs[step]}
            </DialogDescription>
          </DialogHeader>

          {/* Premium indicator */}
          <div className="absolute top-6 right-6 flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-blue-600 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
            <Sparkles size={10} />
            <span>Secure</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          
          {/* Choice Step */}
          {step === "pilihan" && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/80 text-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Produk</p>
                <p className="text-sm font-black text-slate-800 mt-1 line-clamp-1">{productName}</p>
                <p className="text-2xl font-black text-indigo-600 mt-1.5">{formatHarga(harga)}</p>
              </div>

              <button
                onClick={() => setStep("login")}
                className="w-full flex items-center gap-4 p-4 border border-slate-200/80 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50/30 transition-all duration-300 text-left group"
              >
                <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center shrink-0 group-hover:bg-indigo-100 transition">
                  <KeyRound className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800">Sudah punya akun</p>
                  <p className="text-xs text-slate-400 mt-0.5">Masuk dengan email & password</p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-600 transition shrink-0" />
              </button>

              <button
                onClick={() => setStep("register")}
                className="w-full flex items-center gap-4 p-4 border border-slate-200/80 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50/30 transition-all duration-300 text-left group"
              >
                <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition">
                  <UserPlus className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800">Belum punya akun</p>
                  <p className="text-xs text-slate-400 mt-0.5">Daftar akun peserta baru</p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-600 transition shrink-0" />
              </button>
            </div>
          )}

          {/* Login Form Step */}
          {step === "login" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="login-email" className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 rounded-xl border-slate-200 focus-visible:ring-indigo-500"
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500 font-semibold pl-1">{errors.email}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="login-password" className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                  Password
                </Label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="login-password"
                    type={showPw ? "text" : "password"}
                    placeholder="Masukkan password Anda"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 rounded-xl border-slate-200 focus-visible:ring-indigo-500"
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
                  >
                    {showPw ? "Sembunyikan" : "Tampilkan"}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 font-semibold pl-1">{errors.password}</p>}
              </div>

              {errors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-semibold text-center">
                  {errors.general}
                </div>
              )}

              <Button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-6 rounded-xl shadow-lg"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Masuk & Lanjutkan"}
              </Button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep("register");
                    setErrors({});
                  }}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
                >
                  Belum punya akun? Daftar Baru
                </button>
              </div>
            </div>
          )}

          {/* Register Form Step */}
          {step === "register" && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="reg-nama" className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                  Nama Lengkap
                </Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="reg-nama"
                    placeholder="Nama lengkap Anda"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    className="pl-10 rounded-xl border-slate-200 focus-visible:ring-indigo-500"
                  />
                </div>
                {errors.nama && <p className="text-xs text-red-500 font-semibold pl-1">{errors.nama}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reg-email" className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 rounded-xl border-slate-200 focus-visible:ring-indigo-500"
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500 font-semibold pl-1">{errors.email}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reg-password" className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                  Password
                </Label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="reg-password"
                    type={showPw ? "text" : "password"}
                    placeholder="Minimal 8 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 rounded-xl border-slate-200 focus-visible:ring-indigo-500"
                    onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
                  >
                    {showPw ? "Sembunyikan" : "Tampilkan"}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 font-semibold pl-1">{errors.password}</p>}
              </div>

              {errors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-semibold text-center">
                  {errors.general}
                </div>
              )}

              <Button
                onClick={handleRegister}
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-6 rounded-xl shadow-lg"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Daftar & Lanjutkan"}
              </Button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep("login");
                    setErrors({});
                  }}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
                >
                  Sudah punya akun? Masuk
                </button>
              </div>
            </div>
          )}

          {/* Checkout Info (Loading or manual retry fallback if errors happen) */}
          {step === "checkout_info" && (
            <div className="space-y-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                  <p className="text-sm font-bold text-slate-700">Memproses checkout Anda...</p>
                  <p className="text-xs text-slate-400">Harap tunggu sebentar.</p>
                </div>
              ) : (
                <>
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
                    <div className="flex justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
                      <span>Rincian Pembelian</span>
                    </div>
                    <p className="text-sm font-black text-slate-800 line-clamp-1">{productName}</p>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200/50 mt-2">
                      <span className="text-xs text-slate-500 font-semibold">Total Bayar</span>
                      <span className="text-lg font-black text-indigo-600">{formatHarga(harga)}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="checkout-name" className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                        Nama Penerima / Pendaftar
                      </Label>
                      <Input
                        id="checkout-name"
                        value={nama}
                        onChange={(e) => setNama(e.target.value)}
                        className="rounded-xl border-slate-200"
                      />
                      {errors.nama && <p className="text-xs text-red-500 font-semibold pl-1">{errors.nama}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="checkout-phone" className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                        Nomor Handphone (WhatsApp)
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="checkout-phone"
                          type="tel"
                          placeholder="08xxxxxxxxxx"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="pl-10 rounded-xl border-slate-200"
                        />
                      </div>
                      {errors.phone && <p className="text-xs text-red-500 font-semibold pl-1">{errors.phone}</p>}
                    </div>
                  </div>

                  {errors.general && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-semibold text-center">
                      {errors.general}
                    </div>
                  )}

                  <Button
                    onClick={() => handleCheckoutSubmit()}
                    disabled={loading || !snapLoaded}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-7 text-base rounded-2xl shadow-xl"
                  >
                    {harga > 0 ? "BAYAR SEKARANG" : "DAFTAR SEKARANG"}
                  </Button>
                </>
              )}

              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-semibold pt-2">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span>Transaksi ini diamankan oleh Midtrans</span>
              </div>
            </div>
          )}

          {/* Success Step */}
          {step === "success" && (
            <div className="flex flex-col items-center justify-center py-6 space-y-3">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-9 w-9 text-emerald-500 animate-bounce" />
              </div>
              <p className="font-black text-slate-800 text-base text-center">Pendaftaran Berhasil!</p>
              <p className="text-xs text-slate-400 text-center font-medium">
                Mengalihkan Anda ke halaman dashboard kelas...
              </p>
              <Loader2 className="h-5 w-5 text-indigo-500 animate-spin mt-2" />
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}
