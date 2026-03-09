import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, BookOpen } from "lucide-react";

export default function PesertaRegister() {
  const [form, setForm] = useState({
    nama: "", email: "", no_hp: "", password: "", password_confirmation: "",
  });
  const [showPw, setShowPw]   = useState(false);
  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setLoading(true);
    router.post("/peserta/register", form, {
      onError:  (e) => { setErrors(e); setLoading(false); },
      onFinish: () => setLoading(false),
    });
  };

  const f = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm({ ...form, [key]: e.target.value }),
  });

  return (
    <>
      <Head title="Daftar Akun Peserta" />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Buat Akun Peserta</h1>
            <p className="text-slate-400 text-sm mt-1">Daftar untuk mengikuti bootcamp</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-4">
            {/* Nama */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Nama Lengkap *</Label>
              <Input placeholder="Nama kamu" {...f("nama")} className={errors.nama ? "border-red-400" : ""} />
              {errors.nama && <p className="text-xs text-red-500">{errors.nama}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Email *</Label>
              <Input type="email" placeholder="email@kamu.com" {...f("email")} className={errors.email ? "border-red-400" : ""} />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>

            {/* No HP */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">No. Handphone</Label>
              <Input placeholder="08xxxxxxxxxx" {...f("no_hp")} />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Password *</Label>
              <div className="relative">
                <Input
                  type={showPw ? "text" : "password"}
                  placeholder="Min. 8 karakter"
                  {...f("password")}
                  className={errors.password ? "border-red-400 pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
            </div>

            {/* Konfirmasi Password */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Konfirmasi Password *</Label>
              <Input
                type={showPw ? "text" : "password"}
                placeholder="Ulangi password"
                {...f("password_confirmation")}
              />
            </div>

            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold mt-2"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Mendaftar...</> : "Buat Akun"}
            </Button>

            <p className="text-center text-sm text-gray-500">
              Sudah punya akun?{" "}
              <a href="/peserta/login" className="text-blue-600 font-medium hover:underline">
                Masuk di sini
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}