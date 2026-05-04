import { Head } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { Calendar, Users, AlertCircle, Check } from "lucide-react";

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
};

type Props = {
  webinar: Webinar;
};

declare global {
  interface Window {
    snap: any;
  }
}

function formatHarga(n?: number) {
  if (!n || n === 0) return "Gratis";
  return `Rp ${Number(n).toLocaleString("id-ID")}`;
}

export default function CheckoutWebinar({ webinar }: Props) {
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

  return (
    <>
      <Head title={`Checkout - ${webinar.nama}`} />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-slate-900 to-blue-900 text-white py-8">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-3xl font-extrabold">{webinar.nama}</h1>
            <p className="text-slate-300 mt-2">Checkout & Pembayaran</p>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            {/* LEFT SIDE - FORM */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">
                  Informasi Peserta
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 transition"
                      placeholder="Masukkan nama lengkap Anda"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 transition"
                      placeholder="email@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      No. Telepon/WhatsApp *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 transition"
                      placeholder="08xx xxxx xxxx"
                    />
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-start gap-3">
                      <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  {success && (
                    <div className="p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 flex items-start gap-3 animate-pulse">
                      <Check size={20} className="flex-shrink-0 mt-0.5" />
                      <span>✓ Berhasil! Mengarahkan...</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || success}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "⏳ Memproses..." : "Lanjut ke Pembayaran"}
                  </button>

                  <p className="text-xs text-gray-600 text-center">
                    Dengan melanjutkan, Anda setuju dengan syarat & ketentuan layanan kami
                  </p>
                </form>
              </div>
            </div>

            {/* RIGHT SIDE - SUMMARY */}
            <div>
              <div className="bg-white rounded-xl shadow-lg overflow-hidden sticky top-4">
                {/* COVER */}
                <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  {webinar.cover ? (
                    <img
                      src={webinar.cover}
                      alt={webinar.nama}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-white text-center">
                      <div className="text-6xl">🎓</div>
                    </div>
                  )}
                </div>

                {/* DETAIL */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                      {webinar.nama}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {webinar.deskripsi}
                    </p>
                  </div>

                  <div className="space-y-3 py-4 border-t border-b">
                    {webinar.tanggal_mulai && (
                      <div className="flex items-center gap-3 text-sm text-gray-700">
                        <Calendar size={16} className="text-blue-600" />
                        <span>
                          {new Date(webinar.tanggal_mulai).toLocaleDateString(
                            "id-ID",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </div>
                    )}

                    {webinar.peserta_count !== undefined && (
                      <div className="flex items-center gap-3 text-sm text-gray-700">
                        <Users size={16} className="text-blue-600" />
                        <span>
                          {webinar.peserta_count}{" "}
                          {webinar.max_peserta
                            ? `/ ${webinar.max_peserta}`
                            : ""}{" "}
                          peserta
                        </span>
                      </div>
                    )}
                  </div>

                  {/* PRICE */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 mb-2">Total Pembayaran</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-blue-600">
                        {formatHarga(webinar.harga)}
                      </span>
                      {webinar.harga_coret &&
                        webinar.harga_coret > webinar.harga && (
                          <span className="text-sm text-gray-400 line-through">
                            {formatHarga(webinar.harga_coret)}
                          </span>
                        )}
                    </div>
                  </div>

                  {/* BENEFITS */}
                  <div className="space-y-2 pt-4">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Fasilitas:
                    </p>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-center gap-2">
                        <Check size={16} className="text-green-600" />
                        <span>Akses Selamanya</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={16} className="text-green-600" />
                        <span>Sertifikat Resmi</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={16} className="text-green-600" />
                        <span>Materi Lengkap</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
