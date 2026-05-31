import { Head } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { CheckCircle2, Clock, AlertCircle, Home, Sparkles } from "lucide-react";

type Props = {
  order_id: string;
  status?: string;
};

export default function CheckoutConfirmation({ order_id, status }: Props) {
  const [paymentData, setPaymentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!order_id) {
      setError("Order ID tidak ditentukan");
      setLoading(false);
      return;
    }

    // Validate payment status with backend
    fetch(`/checkout/validate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": document
          .querySelector('meta[name="csrf-token"]')
          ?.getAttribute("content") || "",
      },
      body: JSON.stringify({ order_id }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPaymentData(data.payment);
        } else {
          setError(data.message || "Pembayaran tidak ditemukan");
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [order_id]);

  const isSuccess = status === "success" || paymentData?.status === "paid" || paymentData?.status === "aktif" || paymentData?.status === "active";
  const isPending = status === "pending" || paymentData?.status === "pending";
  const isFailed = status === "failed" || paymentData?.status === "failed";

  return (
    <>
      <Head title="Konfirmasi Pendaftaran" />

      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 relative overflow-hidden font-sans">
        {/* Decorative background blur shapes */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-300/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-md w-full relative z-10">
          {loading ? (
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10 text-center space-y-4">
              <div className="inline-block animate-spin text-blue-600">
                <LoaderIcon />
              </div>
              <p className="text-slate-600 font-bold">Memverifikasi pendaftaran Anda...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center space-y-6">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle size={32} className="text-red-500" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-800 mb-1">
                  Verifikasi Gagal
                </h1>
                <p className="text-sm text-slate-400 font-medium">{error}</p>
              </div>
              <a
                href="/"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-900 transition-all font-bold"
              >
                <Home size={16} />
                Kembali ke Beranda
              </a>
            </div>
          ) : isSuccess ? (
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center space-y-6">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto relative">
                <CheckCircle2 size={40} className="text-emerald-500" />
                <div className="absolute -top-1 -right-1 flex items-center justify-center bg-blue-500 text-white rounded-full p-1 shadow-md">
                  <Sparkles size={12} />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                  Transaksi Berhasil!
                </h1>
                <p className="text-sm text-slate-500 font-semibold px-4">
                  Selamat! Anda kini telah terdaftar. Silakan akses kelas Anda melalui dashboard peserta.
                </p>
              </div>

              {paymentData && (
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-left text-xs font-semibold space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">ORDER ID</span>
                    <span className="font-bold text-slate-800">{paymentData.order_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">STATUS PEMBAYARAN</span>
                    <span className="font-bold text-emerald-500">PAID / AKTIF</span>
                  </div>
                </div>
              )}

              <div className="space-y-3 pt-2">
                <button
                  onClick={() => (window.location.href = "/peserta/dashboard")}
                  className="w-full px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-100 transition-all font-black text-sm tracking-wide"
                >
                  MASUK KE DASHBOARD KELAS
                </button>
                <a
                  href="/catalog"
                  className="block px-6 py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition font-bold text-sm"
                >
                  Kembali ke Katalog
                </a>
              </div>
            </div>
          ) : isPending ? (
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center space-y-6">
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto">
                <Clock size={32} className="text-amber-500 animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-800 mb-2">
                  Menunggu Pembayaran
                </h1>
                <p className="text-sm text-slate-500 font-semibold px-4">
                  Silakan selesaikan pembayaran Anda di aplikasi/bank Anda.
                </p>
              </div>

              {paymentData && (
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-left text-xs font-semibold space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">ORDER ID</span>
                    <span className="font-bold text-slate-800">{paymentData.order_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">STATUS</span>
                    <span className="font-bold text-amber-500">PENDING</span>
                  </div>
                </div>
              )}

              <div className="space-y-3 pt-2">
                <button
                  onClick={() => (window.location.href = "/peserta/dashboard")}
                  className="w-full px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg transition-all font-black text-sm"
                >
                  LIHAT DASHBOARD PESERTA
                </button>
                <a
                  href="/catalog"
                  className="block px-6 py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition font-bold text-sm"
                >
                  Kembali ke Katalog
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center space-y-6">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle size={32} className="text-red-500" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-800 mb-2">
                  Transaksi Gagal / Dibatalkan
                </h1>
                <p className="text-sm text-slate-500 font-semibold px-4">
                  Sayang sekali pendaftaran Anda gagal atau telah dibatalkan.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={() => window.history.back()}
                  className="w-full px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg transition-all font-black text-sm"
                >
                  COBA DAFTAR KEMBALI
                </button>
                <a
                  href="/catalog"
                  className="block px-6 py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition font-bold text-sm"
                >
                  Kembali ke Katalog
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function LoaderIcon() {
  return (
    <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}
