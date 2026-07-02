import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Copy, Loader2, Code2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { router } from "@inertiajs/react";
import type { Tulisan } from "../detail";

const formatRupiahInput = (value: string | number) => {
  if (value === undefined || value === null || value === "") return "";
  const clean = String(value).replace(/\D/g, "");
  return clean ? new Intl.NumberFormat("id-ID").format(Number(clean)) : "";
};

type Props = {
  tulisan: Tulisan;
};

export default function DetailTab({ tulisan }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deskOpen, setDeskOpen] = useState(false);
  const baseUrl = window.location.origin;

  const [formData, setFormData] = useState({
    nama: tulisan.nama || "",
    url: tulisan.url || "",
    tipe_tulisan: tulisan.tipe_tulisan || "one_shot",
    tipe_pembayaran: tulisan.tipe_pembayaran || "berbayar",
    mekanisme_bayar: tulisan.mekanisme_bayar || "per_chapter",
    harga: tulisan.harga?.toString() || "0",
    deskripsi: tulisan.deskripsi || "",
    tanggal_mulai_jual: tulisan.tanggal_mulai_jual || "",
    tanggal_kadaluarsa: tulisan.tanggal_kadaluarsa || "",
    catatan: tulisan.catatan || "",
    max_pembayaran: tulisan.max_pembayaran?.toString() || "",
    genre: tulisan.genre || "",
    author: tulisan.author || "",
    bahasa: tulisan.bahasa || "",
    affiliate_enabled: tulisan.affiliate_enabled ?? false,
  });

  const handleSave = () => {
    setIsLoading(true);
    const cleanedData = {
      ...formData,
      harga: formData.harga ? formData.harga.replace(/\D/g, "") : "0",
    };
    router.put(`/tulisan/${tulisan.id}`, cleanedData, {
      onSuccess: () => {
        setIsEditing(false);
      },
      onError: (errors) => {
        alert("Gagal menyimpan data: " + JSON.stringify(errors));
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
            tulisan.status === "published"
              ? "bg-green-500"
              : tulisan.status === "unlisted"
              ? "bg-gray-500"
              : "bg-yellow-500"
          )}
        >
          {tulisan.status}
        </Badge>
      ),
    },
    { label: "Nama", value: tulisan.nama },
    {
      label: "Tipe Tulisan",
      value: tulisan.tipe_tulisan === "one_shot" ? "One-Shot" : "Chapter",
    },
    {
      label: "Tipe / Mekanisme",
      value:
        tulisan.tipe_tulisan === "one_shot"
          ? tulisan.tipe_pembayaran === "berbayar" ? "Produk Berbayar" : tulisan.tipe_pembayaran === "gratis" ? "Gratis" : "Bayar Semaunya"
          : tulisan.mekanisme_bayar === "per_chapter" ? "Per Chapter" : tulisan.mekanisme_bayar === "semua_chapter" ? "Semua Chapter" : "-",
    },
    {
      label: "Harga",
      value: tulisan.harga > 0 ? `Rp ${tulisan.harga.toLocaleString("id-ID")}` : "Gratis / Sesuai Mekanisme",
    },
    { label: "URL Tulisan", value: tulisan.url || "-" },
    { label: "Terjual", value: tulisan.terjual },
    { label: "Max Pembayaran", value: tulisan.max_pembayaran ?? "Unlimited" },
    {
      label: "Mulai Penjualan",
      value: tulisan.tanggal_mulai_jual ?? "-",
    },
    {
      label: "Kadaluarsa",
      value: tulisan.tanggal_kadaluarsa ?? "-",
    },
    {
      label: "Bisa Affiliate",
      value: tulisan.affiliate_enabled ? (
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
      label: "Genre",
      value: tulisan.genre || "-",
    },
    {
      label: "Author",
      value: tulisan.author || "-",
    },
    {
      label: "Bahasa",
      value: tulisan.bahasa || "-",
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
      value: tulisan.cover ? (
        <img
          src={`/storage/${tulisan.cover}`}
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
          <h2 className="text-lg font-semibold mb-4">Edit Tulisan</h2>

          <div className="space-y-4">
            <div>
              <Label htmlFor="nama">Judul Tulisan</Label>
              <Input
                id="nama"
                value={formData.nama}
                onChange={(e) =>
                  setFormData({ ...formData, nama: e.target.value })
                }
                placeholder="Judul Tulisan"
              />
            </div>

            <div>
              <Label htmlFor="url">URL Path</Label>
              <Input
                id="url"
                type="text"
                value={formData.url}
                onChange={(e) =>
                  setFormData({ ...formData, url: e.target.value })
                }
                placeholder="custom-url-path"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tipe_tulisan">Tipe Tulisan</Label>
                <Select
                  value={formData.tipe_tulisan}
                  onValueChange={(value) =>
                    setFormData({ ...formData, tipe_tulisan: value })
                  }
                >
                  <SelectTrigger id="tipe_tulisan">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one_shot">One-Shot</SelectItem>
                    <SelectItem value="chapter">Chapter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.tipe_tulisan === "one_shot" ? (
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
                      <SelectItem value="berbayar">Berbayar</SelectItem>
                      <SelectItem value="gratis">Gratis</SelectItem>
                      <SelectItem value="bayar_semaunya">Bayar Semaunya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div>
                  <Label htmlFor="mekanisme_bayar">Mekanisme Bayar</Label>
                  <Select
                    value={formData.mekanisme_bayar}
                    onValueChange={(value) =>
                      setFormData({ ...formData, mekanisme_bayar: value })
                    }
                  >
                    <SelectTrigger id="mekanisme_bayar">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="per_chapter">Per Chapter</SelectItem>
                      <SelectItem value="semua_chapter">Semua Chapter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {(formData.tipe_tulisan === "one_shot" && formData.tipe_pembayaran !== "gratis") && (
              <div>
                <Label htmlFor="harga">Harga</Label>
                <Input
                  id="harga"
                  type="text"
                  value={formatRupiahInput(formData.harga)}
                  onChange={(e) =>
                    setFormData({ ...formData, harga: e.target.value.replace(/\D/g, "") })
                  }
                  placeholder="0"
                  inputMode="numeric"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tanggal_mulai_jual">Waktu Mulai Jual</Label>
                <Input
                  id="tanggal_mulai_jual"
                  type="datetime-local"
                  value={formData.tanggal_mulai_jual ? formData.tanggal_mulai_jual.slice(0, 16) : ""}
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
                  type="datetime-local"
                  value={formData.tanggal_kadaluarsa ? formData.tanggal_kadaluarsa.slice(0, 16) : ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tanggal_kadaluarsa: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {formData.tipe_tulisan === "one_shot" && (
                <div>
                <Label htmlFor="max_pembayaran">Maks. Pembayaran (Quota)</Label>
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
            )}

            <div>
              <Label htmlFor="deskripsi">Deskripsi</Label>
              <Textarea
                id="deskripsi"
                value={formData.deskripsi}
                onChange={(e) =>
                  setFormData({ ...formData, deskripsi: e.target.value })
                }
                placeholder="Deskripsi atau Teaser Tulisan"
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
            
            <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="genre">Genre</Label>
                  <Select
                    value={formData.genre}
                    onValueChange={(v) => setFormData({ ...formData, genre: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Genre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fiksi">Fiksi</SelectItem>
                      <SelectItem value="non-fiksi">Non-Fiksi</SelectItem>
                      <SelectItem value="romance">Romance</SelectItem>
                      <SelectItem value="fantasy">Fantasy</SelectItem>
                      <SelectItem value="horror">Horror</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) =>
                      setFormData({ ...formData, author: e.target.value })
                    }
                    placeholder="Nama Penulis"
                  />
                </div>
                <div>
                  <Label htmlFor="bahasa">Bahasa</Label>
                  <Select
                    value={formData.bahasa}
                    onValueChange={(v) => setFormData({ ...formData, bahasa: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Bahasa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="id">Indonesia</SelectItem>
                      <SelectItem value="en">Inggris</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Switch
                    id="affiliate_enabled"
                    checked={formData.affiliate_enabled}
                    onCheckedChange={(v) => setFormData({ ...formData, affiliate_enabled: v })}
                />
              <Label htmlFor="affiliate_enabled" className="mb-0 cursor-pointer">
                Aktifkan Affiliate
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
              url: `${baseUrl}/tulisan/${tulisan.id}/p`,
              openable: true,
            },
            {
              label: "COPY HALAMAN",
              url: `${baseUrl}/tulisan/${tulisan.id}/p`,
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
                    className="px-3 py-2 bg-gray-800 border border-t-0 border-gray-800 text-white hover:bg-gray-700 flex items-center justify-center"
                    title="Buka di tab baru"
                  >
                    <Code2 className="h-4 w-4" />
                  </a>
                ) : (
                  <button
                    onClick={() => navigator.clipboard.writeText(item.url)}
                    className="px-3 py-2 bg-gray-800 border border-t-0 border-gray-800 text-white hover:bg-gray-700 flex items-center justify-center"
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
            Dibuat: {tulisan.created_at ?? "-"}
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
            {tulisan.deskripsi || "Tidak ada deskripsi."}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}