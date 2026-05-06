import DashboardLayout from "@/components/dashboard/dashboardlayout";
import { Head, router, useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { useState, useRef } from "react";
import { CalendarIcon, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Product = {
  id: number;
  id_type: string;
  nama: string;
  type: string;
  harga: number;
  cover?: string;
};

type BundlingData = {
  id: number;
  nama: string;
  harga: number;
  hargaCoret?: number;
  deskripsi?: string;
  cover?: string;
  tipePembayaran: string;
  tanggalKadaluarsa?: string;
  pesanSetelahBayar?: string;
  maksimalPembayaran?: number;
  redirectUrl?: string;
  bisaAffiliate: boolean;
  produkIds: any[];
};

type EditProps = {
  bundling: BundlingData;
  products: Product[];
};

export default function Edit({ bundling, products }: EditProps) {
  const { data, setData, post, processing, errors } = useForm({
    nama: bundling.nama,
    harga: bundling.harga.toString(),
    hargaCoret: (bundling.hargaCoret || "").toString(),
    deskripsi: bundling.deskripsi || "",
    cover: null as File | null,
    tipePembayaran: bundling.tipePembayaran,
    tanggalKadaluarsa: bundling.tanggalKadaluarsa || "",
    pesanSetelahBayar: bundling.pesanSetelahBayar || "",
    maksimalPembayaran: (bundling.maksimalPembayaran || "").toString(),
    redirectUrl: bundling.redirectUrl || "",
    bisaAffiliate: bundling.bisaAffiliate,
    produkIds: bundling.produkIds || [],
  });

  const [coverPreview, setCoverPreview] = useState<string | null>(
    bundling.cover ? `/storage/${bundling.cover}` : null
  );
  const [dateOpen, setDateOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    bundling.tanggalKadaluarsa
      ? new Date(bundling.tanggalKadaluarsa)
      : undefined
  );
  const [searchProduk, setSearchProduk] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setData("cover", file);
      const reader = new FileReader();
      reader.onload = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
    setData("tanggalKadaluarsa", date ? format(date, "yyyy-MM-dd") : "");
    setDateOpen(false);
  };

  const handleAddProduct = (product: Product) => {
    if (!data.produkIds.find((p) => p.id === product.id_type)) {
      setData("produkIds", [
        ...data.produkIds,
        { id: product.id_type, nama: product.nama, type: product.type },
      ]);
      setSearchProduk("");
    }
  };

  const handleRemoveProduct = (id: string) => {
    setData(
      "produkIds",
      data.produkIds.filter((p) => p.id !== id)
    );
  };

  const filteredProducts = products.filter((p) =>
    p.nama.toLowerCase().includes(searchProduk.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!data.nama.trim()) {
      alert("Nama bundling wajib diisi");
      return;
    }

    if (data.produkIds.length === 0) {
      alert("Minimal pilih 1 produk");
      return;
    }

    if (!data.harga) {
      alert("Harga wajib diisi");
      return;
    }

    const formData = new FormData();
    formData.append("nama", data.nama);
    formData.append("harga", data.harga.toString());
    formData.append("hargaCoret", data.hargaCoret || "");
    formData.append("deskripsi", data.deskripsi);
    formData.append("tipePembayaran", data.tipePembayaran);
    formData.append("tanggalKadaluarsa", data.tanggalKadaluarsa);
    formData.append("pesanSetelahBayar", data.pesanSetelahBayar);
    formData.append("maksimalPembayaran", data.maksimalPembayaran);
    formData.append("redirectUrl", data.redirectUrl);
    formData.append("bisaAffiliate", data.bisaAffiliate ? "1" : "0");

    // Add selected products
    data.produkIds.forEach((p) => {
      formData.append("produkIds[]", p.id);
    });

    if (data.cover) {
      formData.append("cover", data.cover);
    }

    post(`/bundling/${bundling.id}`, {
      forceFormData: true,
    } as any);
  };

  return (
    <DashboardLayout title="Edit Bundling">
      <Head title="Edit Bundling" />

      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.visit("/bundling")}
            className="text-blue-600 mb-4"
          >
            ← Kembali
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">Edit Bundling</h1>
          <p className="text-gray-600 mt-1">
            Update bundling produk anda
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nama Bundling */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <Label className="text-sm font-semibold text-gray-700 mb-2 block">
              Nama Bundling *
            </Label>
            <Input
              placeholder="Contoh: Paket Premium Web Developer"
              value={data.nama}
              onChange={(e) => setData("nama", e.target.value)}
              className="w-full"
            />
            {errors.nama && (
              <p className="text-red-500 text-sm mt-1">{errors.nama}</p>
            )}
          </div>

          {/* Pilih Produk */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <Label className="text-sm font-semibold text-gray-700 mb-2 block">
              Pilih Produk Bundling *
            </Label>
            <div className="relative mb-3">
              <Input
                placeholder="Ketik Nama Produk..."
                value={searchProduk}
                onChange={(e) => setSearchProduk(e.target.value)}
                className="w-full"
              />
              {searchProduk && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((p) => (
                      <button
                        key={p.id_type}
                        type="button"
                        onClick={() => handleAddProduct(p)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                      >
                        <p className="font-medium text-gray-800">{p.nama}</p>
                        <p className="text-xs text-gray-500">
                          {p.type} · Rp{" "}
                          {p.harga.toLocaleString("id-ID")}
                        </p>
                      </button>
                    ))
                  ) : (
                    <p className="px-4 py-2 text-gray-500 text-sm">
                      Tidak ada produk ditemukan
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Selected Products */}
            {data.produkIds.length > 0 && (
              <div className="space-y-2">
                {data.produkIds.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{p.nama}</p>
                      <p className="text-xs text-gray-600">{p.type}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveProduct(p.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Harga */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                Harga *
              </Label>
              <div className="flex items-center">
                <span className="text-gray-600 font-medium mr-2">Rp</span>
                <Input
                  type="number"
                  placeholder="0"
                  value={data.harga}
                  onChange={(e) => setData("harga", e.target.value)}
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Penagihan menggunakan mata uang IDR (Rupiah)
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                Harga Coret (Opsional)
              </Label>
              <div className="flex items-center">
                <span className="text-gray-600 font-medium mr-2">Rp</span>
                <Input
                  type="number"
                  placeholder="0"
                  value={data.hargaCoret}
                  onChange={(e) => setData("hargaCoret", e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* Cover */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <Label className="text-sm font-semibold text-gray-700 mb-2 block">
              Cover (gambar/video untuk promo)
            </Label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition"
            >
              {coverPreview ? (
                <div className="relative">
                  <img
                    src={coverPreview}
                    alt="Preview"
                    className="h-32 mx-auto rounded"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCoverPreview(null);
                      setData("cover", null);
                    }}
                    className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 font-medium">Drag & drop image</p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              className="hidden"
            />
          </div>

          {/* Deskripsi */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <Label className="text-sm font-semibold text-gray-700 mb-2 block">
              Deskripsi *
            </Label>
            <Textarea
              placeholder="Jelaskan bundling anda..."
              value={data.deskripsi}
              onChange={(e) => setData("deskripsi", e.target.value)}
              rows={5}
            />
          </div>

          {/* Tanggal Kadaluarsa */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <Label className="text-sm font-semibold text-gray-700 mb-2 block">
              Tanggal Kadaluarsa
            </Label>
            <p className="text-xs text-gray-500 mb-3">
              Pilih tanggal atau kosongkan
            </p>
            <Popover open={dateOpen} onOpenChange={setDateOpen}>
              <PopoverTrigger asChild>
                <button
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-md bg-white text-sm text-left hover:border-gray-300 transition",
                    selectedDate ? "text-gray-800" : "text-gray-400"
                  )}
                >
                  <CalendarIcon className="h-4 w-4" />
                  {selectedDate
                    ? format(selectedDate, "dd MMMM yyyy", { locale: idLocale })
                    : "Pilih tanggal atau kosongkan"}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-gray-500 mt-2">
              Kami akan menutup link pembayaran pada tanggal ini (opsional)
            </p>
          </div>

          {/* Pesan Setelah Bayar */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <Label className="text-sm font-semibold text-gray-700 mb-2 block">
              Pesan setelah bayar / catatan
            </Label>
            <Textarea
              placeholder="Pesan yang akan dilihat oleh pembeli setelah melakukan pembayaran (opsional)..."
              value={data.pesanSetelahBayar}
              onChange={(e) => setData("pesanSetelahBayar", e.target.value)}
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-2">
              Masukkan ucapan terima kasih, instruksi join grup wa, atau pesan
              lainnya disini.
            </p>
          </div>

          {/* Maksimal Pembayaran */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <Label className="text-sm font-semibold text-gray-700 mb-2 block">
              Maksimum Jumlah Pembayaran (Kuota / Qty)
            </Label>
            <Input
              type="number"
              placeholder="Kosongkan untuk unlimited"
              value={data.maksimalPembayaran}
              onChange={(e) => setData("maksimalPembayaran", e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-2">
              Kami akan menutup link pembayaran setelah melewati batas jumlah
              maksimal. Kosongkan untuk tanpa limit jumlah (unlimited)
            </p>
          </div>

          {/* Redirect URL */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <Label className="text-sm font-semibold text-gray-700 mb-2 block">
              Redirect URL
            </Label>
            <Input
              placeholder="https://websitesaya.com/pembayaran-sukses"
              value={data.redirectUrl}
              onChange={(e) => setData("redirectUrl", e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-2">
              Jika diisi, Kami akan membawa pelanggan ke halaman ini setelah
              sukses membayar
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.visit("/bundling")}
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={processing}
            >
              {processing ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
