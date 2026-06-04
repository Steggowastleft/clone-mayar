import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Copy, Loader2, Code2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { router, usePage } from "@inertiajs/react";
import { Ebook } from "../detail";

type Props = {
  ebook: Ebook;
  onUpdate?: (ebook: Ebook) => void;
};

// Formatter Rupiah
const formatRupiah = (number: string | number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export default function DetailTab({ ebook, onUpdate }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deskOpen, setDeskOpen] = useState(false);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const baseUrl = window.location.origin;

  const [formData, setFormData] = useState({
    nama: ebook.nama,
    deskripsi: ebook.deskripsi || "",
    url: ebook.url || "",
    tipe_pembayaran: ebook.tipe_pembayaran || "berbayar",
    harga: ebook.harga?.toString() || "",
    harga_coret: ebook.harga_coret?.toString() || "",
    tanggal_mulai_jual: ebook.tanggal_mulai_jual ? ebook.tanggal_mulai_jual.split(' ')[0] : "",
    tanggal_kadaluarsa: ebook.tanggal_kadaluarsa ? ebook.tanggal_kadaluarsa.split(' ')[0] : "",
    max_pembayaran: ebook.max_pembayaran?.toString() || "",
    sumber_file: ebook.sumber_file || "upload",
    file_url: ebook.file_url || "",
    bisa_didownload: ebook.bisa_didownload,
    author: ebook.author || "",
    isbn: ebook.isbn || "",
    format: ebook.format || "",
    bahasa: ebook.bahasa || "",
    jumlah_halaman: ebook.jumlah_halaman?.toString() || "",
    tanggal_publish: ebook.tanggal_publish ? ebook.tanggal_publish.split(' ')[0] : "",
    affiliate_enabled: ebook.affiliate_enabled,
    catatan: ebook.catatan || "",
  });

  const handleSave = () => {
    setIsLoading(true);
    const payload = new FormData();
    payload.append('_method', 'put');
    payload.append("nama", formData.nama);
    payload.append("url", formData.url);
    payload.append("tipe_pembayaran", formData.tipe_pembayaran);
    
    if (formData.tipe_pembayaran !== "gratis") {
        const rawHarga = formData.harga.replace(/\./g, "");
        payload.append("harga", rawHarga || "0");
        
        const rawHargaCoret = formData.harga_coret.replace(/\./g, "");
        if (rawHargaCoret) payload.append("harga_coret", rawHargaCoret);
    }

    payload.append("max_pembayaran", formData.max_pembayaran);
    payload.append("deskripsi", formData.deskripsi);
    payload.append("catatan", formData.catatan);
    payload.append("sumber_file", formData.sumber_file);
    if (formData.sumber_file === "upload" && sourceFile) {
      payload.append("file", sourceFile);
    } else if (formData.sumber_file === "link") {
      payload.append("file_url", formData.file_url);
    }
    payload.append("bisa_didownload", formData.bisa_didownload ? "1" : "0");
    payload.append("author", formData.author);
    payload.append("isbn", formData.isbn);
    payload.append("format", formData.format);
    payload.append("bahasa", formData.bahasa);
    payload.append("jumlah_halaman", formData.jumlah_halaman);
    payload.append("affiliate_enabled", formData.affiliate_enabled ? "1" : "0");

    if (formData.tanggal_mulai_jual) payload.append("tanggal_mulai_jual", formData.tanggal_mulai_jual + " 00:00:00");
    if (formData.tanggal_kadaluarsa) payload.append("tanggal_kadaluarsa", formData.tanggal_kadaluarsa + " 00:00:00");
    if (formData.tanggal_publish) payload.append("tanggal_publish", formData.tanggal_publish);

    router.post(`/ebook/${ebook.id}`, payload, {
      onSuccess: (page: any) => {
        setIsEditing(false);
        if (page.props?.ebook && onUpdate) {
          onUpdate(page.props.ebook);
        }
      },
      onError: () => {
        alert("Gagal menyimpan data");
      },
      onFinish: () => {
        setIsLoading(false);
      },
      preserveScroll: true,
    });
  };

  const rows = [
    {
      label: "Status",
      value: (
        <Badge
          className={cn(
            "text-white text-xs",
            ebook.status === "published"
              ? "bg-green-500"
              : ebook.status === "unlisted"
              ? "bg-gray-500"
              : "bg-yellow-500"
          )}
        >
          {ebook.status}
        </Badge>
      ),
    },
    { label: "Nama Produk", value: ebook.nama },
    {
      label: "Tipe Pembayaran",
      value: ebook.tipe_pembayaran === "berbayar" ? "Berbayar" : ebook.tipe_pembayaran === "bayar_semaunya" ? "Bayar Semaunya" : "Gratis",
    },
    {
      label: "Harga",
      value:
        ebook.tipe_pembayaran !== "gratis"
          ? `Rp ${new Intl.NumberFormat("id-ID").format(ebook.harga || 0)}`
          : "-",
    },
    {
      label: "Harga Coret",
      value:
        ebook.tipe_pembayaran !== "gratis" && ebook.harga_coret
          ? `Rp ${new Intl.NumberFormat("id-ID").format(ebook.harga_coret)}`
          : "-",
    },
    {
      label: "Waktu Mulai Jual",
      value: ebook.tanggal_mulai_jual || "-",
    },
    {
      label: "Tanggal Kadaluarsa",
      value: ebook.tanggal_kadaluarsa || "-",
    },
    {
      label: "Maks. Pembayaran",
      value: ebook.max_pembayaran ?? "Unlimited",
    },
    {
      label: "Terjual",
      value: ebook.terjual,
    },
    {
      label: "Sumber File",
      value: ebook.sumber_file === "upload" ? "Upload File" : "Link External",
    },
    {
      label: "Bisa didownload",
      value: ebook.bisa_didownload ? "Aktif" : "Tidak Aktif",
    },
    {
      label: "Author",
      value: ebook.author || "-",
    },
    {
      label: "Format",
      value: ebook.format ? ebook.format.toUpperCase() : "-",
    },
    {
      label: "Bisa Affiliate",
      value: ebook.affiliate_enabled ? (
        <Badge className="bg-green-100 text-green-700 border border-green-200">
          Ya
        </Badge>
      ) : (
        <Badge className="bg-gray-100 text-gray-600 border border-gray-200">
          Tidak
        </Badge>
      ),
    },
    {
      label: "Deskripsi",
      value: (
        <button
          onClick={() => setDeskOpen(true)}
          className="text-blue-600 text-sm underline hover:text-blue-800"
        >
          Lihat Deskripsi
        </button>
      ),
    },
    {
      label: "Cover",
      value: ebook.cover ? (
        <img
          src={`/storage/${ebook.cover}`}
          alt="cover"
          className="h-20 w-32 object-cover rounded-md"
        />
      ) : (
        <span className="text-gray-400 text-sm">Tidak ada gambar</span>
      ),
    },
  ];

  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Edit Detail Ebook</h2>

          <div className="space-y-4">
            <div>
              <Label htmlFor="nama">Nama Produk</Label>
              <Input
                id="nama"
                value={formData.nama}
                onChange={(e) =>
                  setFormData({ ...formData, nama: e.target.value })
                }
                placeholder="Nama ebook"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tipe_pembayaran">Tipe Pembayaran</Label>
                <Select
                  value={formData.tipe_pembayaran}
                  onValueChange={(value) =>
                    setFormData({ ...formData, tipe_pembayaran: value })
                  }
                >
                  <SelectTrigger id="tipe_pembayaran">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="berbayar">Produk Berbayar</SelectItem>
                    <SelectItem value="gratis">Gratis</SelectItem>
                    <SelectItem value="bayar_semaunya">Bayar Semaunya</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.tipe_pembayaran !== "gratis" && (
                <div>
                  <Label htmlFor="harga">Harga</Label>
                  <Input
                    id="harga"
                    type="text"
                    value={formData.harga ? formatRupiah(formData.harga) : ""}
                    onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setFormData({ ...formData, harga: val })
                    }}
                    placeholder="0"
                  />
                </div>
              )}
            </div>

            {formData.tipe_pembayaran !== "gratis" && (
              <div>
                <Label htmlFor="harga_coret">Harga Coret (Opsional)</Label>
                <Input
                  id="harga_coret"
                  type="text"
                  value={formData.harga_coret ? formatRupiah(formData.harga_coret) : ""}
                  onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setFormData({ ...formData, harga_coret: val })
                  }}
                  placeholder="0"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tanggal_mulai_jual">Waktu Mulai Jual</Label>
                <Input
                  id="tanggal_mulai_jual"
                  type="date"
                  value={formData.tanggal_mulai_jual}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tanggal_mulai_jual: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="tanggal_kadaluarsa">Tanggal Kadaluarsa</Label>
                <Input
                  id="tanggal_kadaluarsa"
                  type="date"
                  value={formData.tanggal_kadaluarsa}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tanggal_kadaluarsa: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="max_pembayaran">Maksimum Jumlah Pembayaran</Label>
              <Input
                id="max_pembayaran"
                type="number"
                value={formData.max_pembayaran}
                onChange={(e) =>
                  setFormData({ ...formData, max_pembayaran: e.target.value })
                }
                placeholder="Biarkan kosong untuk unlimited"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="sumber_file">Sumber File</Label>
                  <Select
                    value={formData.sumber_file}
                    onValueChange={(value) =>
                      setFormData({ ...formData, sumber_file: value })
                    }
                  >
                    <SelectTrigger id="sumber_file">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upload">Upload File</SelectItem>
                      <SelectItem value="link">Gunakan Link External</SelectItem>
                    </SelectContent>
                  </Select>

                  {formData.sumber_file === "upload" && (
                    <div className="mt-2">
                      <Input type="file" onChange={(e) => setSourceFile(e.target.files?.[0] || null)} />
                      {ebook.sumber_file === "upload" && ebook.file_url && !sourceFile && (
                        <p className="text-xs text-gray-400 mt-1">File saat ini: {ebook.file_url.split('/').pop()}</p>
                      )}
                    </div>
                  )}
                  {formData.sumber_file === "link" && (
                    <div className="mt-2">
                      <Input 
                        placeholder="https://..." 
                        value={formData.file_url} 
                        onChange={(e) => setFormData({ ...formData, file_url: e.target.value })} 
                      />
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col justify-center">
                    <div className="flex items-center gap-2 mt-4">
                      <Label htmlFor="bisa_didownload" className="mb-0 cursor-pointer text-sm">
                        Bisa didownload ?
                      </Label>
                      <Switch
                        id="bisa_didownload"
                        checked={formData.bisa_didownload}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            bisa_didownload: checked,
                          })
                        }
                      />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div>
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) =>
                      setFormData({ ...formData, author: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="isbn">ISBN</Label>
                  <Input
                    id="isbn"
                    value={formData.isbn}
                    onChange={(e) =>
                      setFormData({ ...formData, isbn: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="format">Format</Label>
                  <Select
                    value={formData.format}
                    onValueChange={(value) =>
                      setFormData({ ...formData, format: value })
                    }
                  >
                    <SelectTrigger id="format">
                      <SelectValue placeholder="Pilih Format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="epub">EPUB</SelectItem>
                      <SelectItem value="mobi">MOBI</SelectItem>
                      <SelectItem value="azw">AZW</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="bahasa">Bahasa</Label>
                  <Input
                    id="bahasa"
                    value={formData.bahasa}
                    onChange={(e) =>
                      setFormData({ ...formData, bahasa: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="jumlah_halaman">Jumlah Halaman</Label>
                  <Input
                    id="jumlah_halaman"
                    type="number"
                    value={formData.jumlah_halaman}
                    onChange={(e) =>
                      setFormData({ ...formData, jumlah_halaman: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="tanggal_publish">Tanggal Publish</Label>
                  <Input
                    id="tanggal_publish"
                    type="date"
                    value={formData.tanggal_publish}
                    onChange={(e) =>
                      setFormData({ ...formData, tanggal_publish: e.target.value })
                    }
                  />
                </div>
            </div>

            <div className="border-t pt-4">
              <Label htmlFor="deskripsi">Deskripsi</Label>
              <Textarea
                id="deskripsi"
                value={formData.deskripsi}
                onChange={(e) =>
                  setFormData({ ...formData, deskripsi: e.target.value })
                }
                placeholder="Deskripsi ebook"
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="catatan">Catatan</Label>
              <Textarea
                id="catatan"
                value={formData.catatan}
                onChange={(e) =>
                  setFormData({ ...formData, catatan: e.target.value })
                }
                placeholder="Catatan untuk pembeli"
                rows={3}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="affiliate_enabled"
                checked={formData.affiliate_enabled}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    affiliate_enabled: checked,
                  })
                }
              />
              <Label htmlFor="affiliate_enabled" className="mb-0 cursor-pointer">
                Produk bisa diaffiliate
              </Label>
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Simpan
            </Button>
            <Button
              onClick={() => setIsEditing(false)}
              variant="outline"
              disabled={isLoading}
            >
              Batal
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* SHARE */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 mb-5">
        <h3 className="font-semibold text-gray-800 mb-4">Share Link</h3>

        <div className="grid grid-cols-2 gap-4">
          {[
            {
              label: "COPY LINK PENDAFTARAN",
              url: `${baseUrl}/ebook/${ebook.id}/p`,
              openable: true,
            },
            {
              label: "COPY HALAMAN",
              url: `${baseUrl}/ebook/${ebook.id}/p`,
              openable: true,
            },
          ].map((item) => (
            <div key={item.label}>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-t-md text-xs text-gray-500 truncate">
                {item.url}
              </div>
              <div className="flex">
                <button
                  onClick={() => navigator.clipboard.writeText(item.url)}
                  className="flex-1 py-2 bg-white border border-t-0 border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  <Copy className="h-3 w-3" />
                  {item.label}
                </button>
                {item.openable ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-gray-800 border border-t-0 border-gray-800 text-white hover:bg-gray-700 flex items-center"
                    title="Buka di tab baru"
                  >
                    <Code2 className="h-4 w-4" />
                  </a>
                ) : (
                  <button
                    onClick={() => navigator.clipboard.writeText(item.url)}
                    className="px-3 py-2 bg-gray-800 border border-t-0 border-gray-800 text-white hover:bg-gray-700"
                  >
                    <Code2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-400 text-center mt-3">
          Share link di atas ke sosial media, WhatsApp, Telegram, TikTok,
          landing page, email, atau channel penjualan lainnya.
        </p>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-gray-50 last:border-0">
                <td className="px-5 py-3 text-sm text-gray-500 w-56 align-top">
                  {row.label}
                </td>
                <td className="px-5 py-3 text-sm text-gray-800">
                  {row.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="px-5 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Dibuat: {ebook.created_at}
          </p>
        </div>
      </div>

      <Button
        onClick={() => setIsEditing(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white mt-5"
      >
        Edit Detail
      </Button>

      {/* MODAL DESKRIPSI */}
      <Dialog open={deskOpen} onOpenChange={setDeskOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Deskripsi</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
            {ebook.deskripsi || "Tidak ada deskripsi."}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}