import { Head, Link, useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DashboardLayout from "@/components/dashboard/dashboardlayout";
import { PageProps } from "@/types";

export default function BuatPermintaan({}: PageProps) {
  const { data, setData, post, processing, errors } = useForm({
    pelanggan_email: "",
    nominal: "",
    keterangan: "",
    expired_at: "",
    kirim_notif: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post("/permintaan-bayar");
  };

  return (
    <DashboardLayout>
      <Head title="Buat Permintaan Bayar" />
      <div className="flex gap-0 min-h-screen">

        {/* ── Konten Utama ── */}
        <div className="flex-1 p-6">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">TRANSAKSI</p>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Permintaan Bayar</h1>

          {/* Sub Nav */}
          <div className="flex gap-0 mb-6 border-b border-gray-200">
            <Link
              href="/permintaan-bayar"
              className="text-sm px-4 py-2.5 text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300 -mb-px transition"
            >
              Semua Permintaan
            </Link>
            <Link
              href="/permintaan-bayar/buat"
              className="text-sm px-4 py-2.5 border-b-2 border-blue-600 text-blue-600 font-semibold -mb-px"
            >
              Buat Permintaan
            </Link>
          </div>

          {/* Form Card */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 max-w-xl">
            <h2 className="font-semibold text-gray-700 mb-5">Detail Permintaan</h2>
            <form onSubmit={handleSubmit} className="space-y-5">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email Pelanggan <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  value={data.pelanggan_email}
                  onChange={(e) => setData("pelanggan_email", e.target.value)}
                  placeholder="contoh@email.com"
                  className="w-full"
                />
                {errors.pelanggan_email && (
                  <p className="text-red-500 text-xs mt-1">{errors.pelanggan_email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nominal <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">Rp</span>
                  <Input
                    type="number"
                    value={data.nominal}
                    onChange={(e) => setData("nominal", e.target.value)}
                    placeholder="0"
                    className="pl-10"
                  />
                </div>
                {errors.nominal && (
                  <p className="text-red-500 text-xs mt-1">{errors.nominal}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Keterangan</label>
                <textarea
                  value={data.keterangan}
                  onChange={(e) => setData("keterangan", e.target.value)}
                  placeholder="Deskripsi permintaan bayar..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tanggal Kadaluarsa</label>
                <Input
                  type="datetime-local"
                  value={data.expired_at}
                  onChange={(e) => setData("expired_at", e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.kirim_notif}
                    onChange={(e) => setData("kirim_notif", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
                </label>
                <span className="text-sm text-gray-700">Kirim notifikasi email ke pelanggan</span>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={processing}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {processing ? "Membuat..." : "Buat Permintaan"}
                </Button>
                <Link href="/permintaan-bayar">
                  <Button type="button" variant="outline">Batal</Button>
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* ── Sidebar Kanan ── */}
        <div className="w-72 border-l border-gray-200 bg-gray-50 p-4 space-y-3 shrink-0">
          <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">💡 Cara Kerja</p>
            <ul className="text-xs text-gray-500 leading-relaxed space-y-1.5">
              <li>• Masukkan email pelanggan yang akan ditagih</li>
              <li>• Tentukan nominal yang harus dibayar</li>
              <li>• Pelanggan mendapat link pembayaran via email</li>
              <li>• Pantau status di "Semua Permintaan"</li>
            </ul>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">📋 Ketentuan</p>
            <ul className="text-xs text-gray-500 leading-relaxed space-y-1.5">
              <li>• Nominal minimum Rp 10.000</li>
              <li>• Link valid hingga tanggal kadaluarsa</li>
              <li>• Notifikasi otomatis dikirim via email</li>
            </ul>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
