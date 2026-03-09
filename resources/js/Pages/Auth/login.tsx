import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2, BookOpen, AlertCircle } from "lucide-react";

type Props = {
  redirectTo?: string;
};

export default function PesertaLogin({ redirectTo = "/peserta/dashboard" }: Props) {
  const [form, setForm]     = useState({ email: "", password: "", remember: false, redirect_to: redirectTo });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setLoading(true);
    router.post("/peserta/login", form, {
      onError:  (e) => { setErrors(e); setLoading(false); },
      onFinish: () => setLoading(false),
    });
  };

  return (
    <>
      <Head title="Login Peserta" />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Masuk sebagai Peserta</h1>
            <p className="text-slate-400 text-sm mt-1">Akses kelas bootcamp kamu</p>
          </div>

          {/* Alert — jika login admin salah masuk */}
          <div className="bg-blue-900/40 border border-blue-700/50 rounded-xl px-4 py-3 mb-4 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-300">
              Halaman ini khusus untuk <strong>peserta</strong>. Jika kamu admin,{" "}
              <a href="/login" className="underline hover:text-white">masuk di sini</a>.
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-5">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Email</Label>
              <Input
                type="email"
                placeholder="email@kamu.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={errors.email ? "border-red-400" : ""}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Password</Label>
              <div className="relative">
                <Input
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
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

            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Masuk...</> : "Masuk"}
            </Button>

            <p className="text-center text-sm text-gray-500">
              Belum punya akun?{" "}
              <a
                href={`/peserta/register?redirect=${encodeURIComponent(redirectTo)}`}
                className="text-blue-600 font-medium hover:underline"
              >
                Daftar di sini
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}