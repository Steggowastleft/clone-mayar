import { useState, useRef } from "react";
import { router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { DatePickerField } from "./datepickers";

type Bootcamp = {
  id: number;
  name: string;
  batch: string;
  status: "published" | "unpublished" | "unlisted";
  date: string;
  participants: number;
  kategori?: string;
  harga?: number;
  deskripsi?: string;
  instruksi?: string;
  syarat_ketentuan?: string;
  cover?: string;
  cover_url?: string;
  tanggal_mulai_jual?: string;
  tanggal_tutup_daftar?: string;
  tanggal_mulai_pembelajaran?: string;
  tanggal_batas_pembelajaran?: string;
};

const formatRupiahInput = (value: string | number) => {
  if (value === undefined || value === null || value === "") return "";
  const clean = String(value).replace(/\D/g, "");
  return clean ? new Intl.NumberFormat("id-ID").format(Number(clean)) : "";
};

export function EditBootcampDialog({
  open,
  onOpenChange,
  bootcamp,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  bootcamp: Bootcamp;
}) {
  const fileInputRef  = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverFile,    setCoverFile]    = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(bootcamp.cover_url || null);

  const [form, setForm] = useState({
    judul:           bootcamp.name                        || "",
    kategori:        bootcamp.kategori                    || "",
    tipePembayaran:  (bootcamp as any).tipe_pembayaran    || "",
    harga:           bootcamp.harga ? String(bootcamp.harga) : "",
    hargaCoret:      (bootcamp as any).harga_coret ? String((bootcamp as any).harga_coret) : "",
    deskripsi:       bootcamp.deskripsi                   || "",
    instruksi:       bootcamp.instruksi                   || "",
    syaratKetentuan: bootcamp.syarat_ketentuan            || "",
    maxPeserta:      (bootcamp as any).max_peserta        ? String((bootcamp as any).max_peserta) : "",
    batasNilaiQuiz:  (bootcamp as any).batas_nilai_quiz   ? String((bootcamp as any).batas_nilai_quiz) : "",
    redirectUrl:     (bootcamp as any).redirect_url       || "",
    bisaAffiliate:   (bootcamp as any).bisa_affiliate     || false,
  });

  console.log("tipePembayaran:", form.tipePembayaran);
  console.log("bootcamp:", bootcamp);

  const parseDate = (val?: string): Date | undefined => {
    if (!val) return undefined;
    const d = new Date(val);
    return isNaN(d.getTime()) ? undefined : d;
  };

  const [tanggalMulaiJual,         setTanggalMulaiJual]         = useState<Date | undefined>(parseDate(bootcamp.tanggal_mulai_jual));
  const [tanggalTutupDaftar,       setTanggalTutupDaftar]       = useState<Date | undefined>(parseDate(bootcamp.tanggal_tutup_daftar));
  const [tanggalMulaiPembelajaran, setTanggalMulaiPembelajaran] = useState<Date | undefined>(parseDate(bootcamp.tanggal_mulai_pembelajaran));
  const [tanggalBatasPembelajaran, setTanggalBatasPembelajaran] = useState<Date | undefined>(parseDate(bootcamp.tanggal_batas_pembelajaran));

  const kategoriOptions = [
    "Teknologi & Pemrograman", "Desain & Kreatif", "Bisnis & Kewirausahaan",
    "Pemasaran Digital", "Data Science & AI", "Bahasa & Komunikasi",
    "Keuangan & Akuntansi", "Kesehatan & Kebugaran", "Pendidikan & Pengajaran", "Lainnya",
  ];

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    const reader = new FileReader();
    reader.onload = () => setCoverPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!form.judul.trim()) return;
    setIsSubmitting(true);

    const payload = new FormData();
    payload.append("_method",         "PUT");
    payload.append("judul",           form.judul);
    payload.append("kategori",        form.kategori);
    payload.append("tipePembayaran",  form.tipePembayaran);
    payload.append("harga",           form.harga);
    payload.append("hargaCoret",      form.hargaCoret);
    payload.append("deskripsi",       form.deskripsi);
    payload.append("instruksi",       form.instruksi);
    payload.append("syaratKetentuan", form.syaratKetentuan);
    payload.append("maxPeserta",      form.maxPeserta);
    payload.append("batasNilaiQuiz",  form.batasNilaiQuiz);
    payload.append("redirectUrl",     form.redirectUrl);
    payload.append("bisaAffiliate",   form.bisaAffiliate ? "1" : "0");
    if (tanggalMulaiJual)         payload.append("tanggalMulaiJual",         format(tanggalMulaiJual,         "yyyy-MM-dd"));
    if (tanggalTutupDaftar)       payload.append("tanggalTutupDaftar",       format(tanggalTutupDaftar,       "yyyy-MM-dd"));
    if (tanggalMulaiPembelajaran) payload.append("tanggalMulaiPembelajaran", format(tanggalMulaiPembelajaran, "yyyy-MM-dd"));
    if (tanggalBatasPembelajaran) payload.append("tanggalBatasPembelajaran", format(tanggalBatasPembelajaran, "yyyy-MM-dd"));
    if (coverFile) payload.append("cover", coverFile);

    router.post(`/bootcamps/${bootcamp.id}`, payload, {
      forceFormData: true,
      onSuccess: () => { setIsSubmitting(false); onOpenChange(false); },
      onError:   () => setIsSubmitting(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-t-lg sticky top-0 z-10">
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-bold">
              Edit Kelas Cohort / Bootcamp
            </DialogTitle>
            <DialogDescription className="text-blue-100 text-sm leading-relaxed mt-1">
              Mengadakan kelas berkelompok (batch / cohort-based) dengan banyak sesi semakin mudah dengan Mayar
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-5">
          {/* Judul */}
          <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-700">
              Judul / Nama Bootcamp <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="Contoh: Web Development Bootcamp Batch 5"
              value={form.judul}
              onChange={(e) => setForm({ ...form, judul: e.target.value })}
            />
          </div>

          {/* Kategori */}
          <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-700">
              Kategori <span className="text-red-500">*</span>
            </Label>
            <Select value={form.kategori} onValueChange={(v) => setForm({ ...form, kategori: v })}>
              <SelectTrigger><SelectValue placeholder="Pilih kategori bootcamp..." /></SelectTrigger>
              <SelectContent className="z-[200]">
                {kategoriOptions.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Tipe Pembayaran */}
          <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-700">
              Tipe Pembayaran <span className="text-red-500">*</span>
            </Label>
            <Select value={form.tipePembayaran} onValueChange={(v) => setForm({ ...form, tipePembayaran: v })}>
              <SelectTrigger><SelectValue placeholder="Pilih tipe pembayaran..." /></SelectTrigger>
              <SelectContent className="z-[200]">
                <SelectItem value="berbayar">Produk Berbayar</SelectItem>
                <SelectItem value="gratis">Produk Gratis</SelectItem>
                <SelectItem value="bayar_semaunya">Produk Bayar Semaunya</SelectItem>
              </SelectContent>
            </Select>
          </div>

        {form.tipePembayaran !== "gratis" && (
  <>
    {/* Harga */}
    <div className="space-y-1">
      <Label className="text-sm font-medium text-gray-700">Harga (Rp)</Label>
      <div className="relative">
        <span className="absolute left-3 top-2.5 text-sm text-gray-500">Rp</span>
        <Input
          className="pl-9"
          placeholder="0"
          type="text"
          value={form.harga ? formatRupiahInput(form.harga) : ""}
          onChange={(e) => setForm({ ...form, harga: e.target.value.replace(/\D/g, "") })}
        />
      </div>
    </div>

    {/* Harga Coret */}
    <div className="space-y-1">
      <Label className="text-sm font-medium text-gray-700">
        Harga Coret (Rp){" "}
        <span className="text-gray-400 font-normal">(Opsional)</span>
      </Label>
      <div className="relative">
        <span className="absolute left-3 top-2.5 text-sm text-gray-500">Rp</span>
        <Input
          className="pl-9"
          placeholder="Harus lebih besar dari harga awal"
          type="text"
          value={form.hargaCoret ? formatRupiahInput(form.hargaCoret) : ""}
          onChange={(e) => setForm({ ...form, hargaCoret: e.target.value.replace(/\D/g, "") })}
        />
      </div>

      {form.harga && form.hargaCoret && Number(form.hargaCoret) <= Number(form.harga) && (
        <p className="text-xs text-red-500">
          Harga coret harus lebih besar dari harga awal
        </p>
      )}
    </div>
  </>
)}

          {/* Deskripsi */}
          <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-700">Deskripsi</Label>
            <Textarea
              placeholder="Tuliskan deskripsi bootcamp kamu..."
              rows={4}
              value={form.deskripsi}
              onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
            />
          </div>

          {/* Cover */}
          <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-700">Cover Gambar</Label>
            <div
              className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition"
              onClick={() => fileInputRef.current?.click()}
            >
              {coverPreview ? (
                <img src={coverPreview} alt="preview" className="max-h-40 mx-auto rounded-md object-cover" />
              ) : (
                <div className="space-y-2">
                  <div className="h-8 w-8 text-gray-400 mx-auto flex items-center justify-center">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="h-8 w-8">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500">Klik untuk unggah gambar cover</p>
                  <p className="text-xs text-gray-400">PNG, JPG, WEBP (maks. 5MB)</p>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
            {coverFile && <p className="text-xs text-green-600">✓ {coverFile.name}</p>}
          </div>

          {/* Instruksi */}
          <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-700">Instruksi</Label>
            <p className="text-xs text-gray-500 leading-relaxed">
              Instruksi adalah catatan yang akan dilihat oleh pendaftar setelah melakukan pendaftaran/membayar.
              Anda bisa memasukkan instruksi masuk ke zoom, passwordnya, link gabung grup WA, formulir google, kontak cs dll disini.
            </p>
            <Textarea
              placeholder="Contoh: Silakan bergabung ke grup WhatsApp melalui link berikut..."
              rows={3}
              value={form.instruksi}
              onChange={(e) => setForm({ ...form, instruksi: e.target.value })}
            />
          </div>

          {/* Syarat & Ketentuan */}
          <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-700">Syarat & Ketentuan</Label>
            <Textarea
              placeholder="Tuliskan syarat dan ketentuan bootcamp..."
              rows={3}
              value={form.syaratKetentuan}
              onChange={(e) => setForm({ ...form, syaratKetentuan: e.target.value })}
            />
          </div>

          {/* Date Pickers */}
          <div className="grid grid-cols-2 gap-4">
            <DatePickerField label="Mulai Tanggal Penjualan"       value={tanggalMulaiJual}         onChange={setTanggalMulaiJual} />
            <DatePickerField label="Tanggal Penutupan Pendaftaran" value={tanggalTutupDaftar}       onChange={setTanggalTutupDaftar} />
            <DatePickerField label="Mulai Pembelajaran"            value={tanggalMulaiPembelajaran} onChange={setTanggalMulaiPembelajaran} />
            <DatePickerField label="Batas Pembelajaran"            value={tanggalBatasPembelajaran} onChange={setTanggalBatasPembelajaran} optional />
          </div>

          {/* Max Peserta */}
          <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-700">Jumlah Maksimum Peserta</Label>
            <Input
              type="number"
              placeholder="Kosongkan untuk unlimited"
              value={form.maxPeserta}
              onChange={(e) => setForm({ ...form, maxPeserta: e.target.value })}
            />
            <p className="text-xs text-gray-400">
              Kami akan menutup pendaftaran setelah melewati batas jumlah maksimal. Kosongkan untuk tanpa limit jumlah (unlimited).
            </p>
          </div>

          {/* Batas Nilai Quiz */}
          <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-700">Batas Nilai Quiz untuk Sertifikat</Label>
            <Input
              type="number"
              placeholder="Kosongkan jika tidak dibatasi nilai"
              min={0}
              max={100}
              value={form.batasNilaiQuiz}
              onChange={(e) => setForm({ ...form, batasNilaiQuiz: e.target.value })}
            />
            <p className="text-xs text-gray-400">
              Kami akan menutup akses sertifikat sebelum customer mencapai batas minimal nilai rata-rata quiz.
              Kosongkan jika akses sertifikat tidak dibatasi nilai rata-rata quiz.
            </p>
          </div>

          {/* Redirect URL */}
          <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-700">
              Redirect URL <span className="text-gray-400 font-normal">(Opsional)</span>
            </Label>
            <Input
              type="url"
              placeholder="https://example.com/thank-you"
              value={form.redirectUrl}
              onChange={(e) => setForm({ ...form, redirectUrl: e.target.value })}
            />
            <p className="text-xs text-gray-400">
              Pelanggan akan dibawa ke halaman ini setelah membayar (opsional / bisa dikosongkan).
            </p>
          </div>

          {/* Affiliate Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <Label className="text-sm font-medium text-gray-700">Produk Bisa Diaffiliate</Label>
              <p className="text-xs text-gray-400">Izinkan affiliate untuk mempromosikan bootcamp ini</p>
            </div>
            <Switch
              checked={form.bisaAffiliate}
              onCheckedChange={(v) => setForm({ ...form, bisaAffiliate: v })}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Batal
            </Button>
            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleSave}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}