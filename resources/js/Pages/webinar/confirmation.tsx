import { Head } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { CheckCircle2, Clock, AlertCircle, Home } from "lucide-react";

type Props = {
  order_id: string;
  status?: string;
};

export default function ConfirmationWebinar({ order_id, status }: Props) {
  const [paymentData, setPaymentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Validasi pembayaran
    fetch(`/webinar/payment/validate`, {
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

  const isSuccess = status === "success" || paymentData?.status === "paid";
  const isPending = status === "pending" || paymentData?.status === "pending";
  const isFailed = status === "failed" || paymentData?.status === "failed";

  return (
    <>
      <Head title="Konfirmasi Pembayaran" />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          {loading ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="inline-block animate-spin">
                <div className="text-4xl">⏳</div>
              </div>
              <p className="text-gray-600 mt-4">Memverifikasi pembayaran...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-center">
                <div className="text-6xl mb-4">❌</div>
                <h1 className="text-2xl font-bold text-red-600 mb-2">
                  Terjadi Kesalahan
                </h1>
                <p className="text-gray-600 mb-6">{error}</p>
                <a
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Home size={16} />
                  Kembali ke Beranda
                </a>
              </div>
            </div>
          ) : isSuccess ? (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-center">
                <CheckCircle2 size={64} className="text-green-600 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  Pembayaran Berhasil!
                </h1>
                <p className="text-gray-600 mb-6">
                  Terima kasih telah mendaftar. Anda sekarang memiliki akses ke webinar ini.
                </p>

                {paymentData && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order ID:</span>
                      <span className="font-semibold">{paymentData.order_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Jumlah:</span>
                      <span className="font-semibold">
                        Rp {Number(paymentData.amount).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-semibold text-green-600">Sukses</span>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <button
                    onClick={() => (window.location.href = "/peserta/dashboard")}
                    className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                  >
                    Akses Dashboard Peserta
                  </button>
                  <a
                    href="/"
                    className="block px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Kembali ke Beranda
                  </a>
                </div>
              </div>
            </div>
          ) : isPending ? (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-center">
                <Clock size={64} className="text-yellow-600 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  Pembayaran Tertunda
                </h1>
                <p className="text-gray-600 mb-6">
                  Pembayaran Anda sedang diproses. Silakan tunggu konfirmasi email.
                </p>

                {paymentData && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Order ID:</span>
                      <span className="font-semibold">{paymentData.order_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-semibold text-yellow-600">Pending</span>
                    </div>
                  </div>
                )}

                <a
                  href="/"
                  className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Kembali ke Beranda
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-center">
                <AlertCircle size={64} className="text-red-600 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  Pembayaran Gagal
                </h1>
                <p className="text-gray-600 mb-6">
                  Pembayaran Anda tidak berhasil diproses. Silakan coba lagi.
                </p>

                <div className="space-y-3">
                  <button
                    onClick={() => window.history.back()}
                    className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                  >
                    Coba Lagi
                  </button>
                  <a
                    href="/"
                    className="block px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Kembali ke Beranda
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
