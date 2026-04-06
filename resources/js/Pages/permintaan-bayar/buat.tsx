import { Head, router, useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DashboardLayout from "@/components/dashboard/dashboardlayout";

export default function PermintaanBayarBuat() {
  const { data, setData, post, processing, errors } = useForm({
    nama: "",
    email: "",
    jumlah: "",
    keterangan: "",
    kadaluarsa: "",
  });

  return (
    <DashboardLayout>
      <Head title="Buat Permintaan Bayar" />
      <div className="flex gap-0 min-h-screen">
        <div className="flex-1 p-6">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">PROJEK</p>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Permintaan Bayar</h1>
          </div>

          {/* Sub nav */}
          <div className="flex gap-1 mb-4">
            <button
              className="px-4 py-2 text-sm font-semibold bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-md"
              onClick={() => router.visit("/permintaan-bayar")}>
              Semua Permintaan
            </button>
            <button className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-md">
              Buat Permintaan
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 max-w-xl">
            <h2 className="font-semibold text-gray-700 mb-4">Buat Permintaan Bayar Baru</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nama">Nama Pelanggan</Label>
                <Input id="nama" placeholder="Masukkan nama pelanggan" className="mt-1"
                  value={data.nama} onChange={(e) => setData("nama", e.target.value)} />
                {errors.nama && <p className="text-red-500 text-xs mt-1">{errors.nama}</p>}
              </div>
              <div>
                <Label htmlFor="email">Email Pelanggan</Label>
                <Input id="email" type="email" placeholder="email@example.com" className="mt-1"
                  value={data.email} onChange={(e) => setData("email", e.target.value)} />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <Label htmlFor="jumlah">Jumlah (Rp)</Label>
                <Input id="jumlah" type="number" placeholder="0" className="mt-1"
                  value={data.jumlah} onChange={(e) => setData("jumlah", e.target.value)} />
                {errors.jumlah && <p className="text-red-500 text-xs mt-1">{errors.jumlah}</p>}
              </div>
              <div>
                <Label htmlFor="keterangan">Keterangan</Label>
                <Input id="keterangan" placeholder="Keterangan pembayaran" className="mt-1"
                  value={data.keterangan} onChange={(e) => setData("keterangan", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="kadaluarsa">Tanggal Kadaluarsa</Label>
                <Input id="kadaluarsa" type="date" className="mt-1"
                  value={data.kadaluarsa} onChange={(e) => setData("kadaluarsa", e.target.value)} />
              </div>
              <div className="flex gap-2 pt-2">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => post("/permintaan-bayar")} disabled={processing}>
                  {processing ? "Menyimpan..." : "Kirim Permintaan"}
                </Button>
                <Button variant="outline" onClick={() => router.visit("/permintaan-bayar")}>Batal</Button>
              </div>
            </div>
          </div>
        </div>
        <div className="w-72 border-l border-gray-200 bg-gray-50 p-4 space-y-3 shrink-0">
          <p className="text-sm font-semibold text-gray-700">Info Permintaan Bayar</p>
          <p className="text-xs text-gray-500 leading-relaxed">
            Buat permintaan pembayaran yang akan dikirimkan kepada pelanggan melalui email berisi link pembayaran.
          </p>
          <div className="bg-blue-50 border border-blue-100 rounded-md p-3">
            <p className="text-xs text-blue-700 font-semibold mb-1">Tips</p>
            <ul className="text-xs text-blue-600 space-y-1 list-disc list-inside">
              <li>Pastikan email pelanggan benar</li>
              <li>Isi keterangan agar pelanggan paham</li>
              <li>Atur tanggal kadaluarsa yang wajar</li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
