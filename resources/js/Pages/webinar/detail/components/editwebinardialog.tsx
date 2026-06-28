import { useState, useRef, useEffect } from "react";
import { router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { DatePickerField } from "../components/datepickers";
import { toast } from "sonner";

type Webinar = {
  id: number;
  nama: string;
  deskripsi: string | null;
  url: string | null;
  harga: number;
  harga_coret: number | null;
  lokasi: string | null;
  link_zoom: string | null;
  status: "published" | "unpublished" | "unlisted";
  peserta: number;
  max_peserta: number | null;
  tanggal_mulai: string | null;
  tanggal_selesai: string | null;
  cover: string | null;
};

const formatRupiahInput = (value: string | number) => {
  if (value === undefined || value === null || value === "") return "";
  const clean = String(value).replace(/\D/g, "");
  return clean ? new Intl.NumberFormat("id-ID").format(Number(clean)) : "";
};

export function EditWebinarDialog({
  open,
  onOpenChange,
  event,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  event: Webinar;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(
    event.cover ? `/storage/${event.cover}` : null
  );

  const [form, setForm] = useState({
    nama: "",
    deskripsi: "",
    url: "",
    lokasi: "",
    link_zoom: "",
    harga: "",
    harga_coret: "",
    max_peserta: "",
  });

  const parseDate = (val?: string | null) => {
    if (!val) return undefined;
    const d = new Date(val);
    return isNaN(d.getTime()) ? undefined : d;
  };

  const [tanggalMulai, setTanggalMulai] = useState<Date | undefined>();
  const [tanggalSelesai, setTanggalSelesai] = useState<Date | undefined>();

  useEffect(() => {
    if (event) {
      setForm({
        nama: event.nama || "",
        deskripsi: event.deskripsi || "",
        url: event.url || "",
        lokasi: event.lokasi || "",
        link_zoom: event.link_zoom || "",
        harga: event.harga ? String(event.harga) : "0",
        harga_coret: event.harga_coret ? String(event.harga_coret) : "",
        max_peserta: event.max_peserta ? String(event.max_peserta) : "",
      });
      setTanggalMulai(parseDate(event.tanggal_mulai));
      setTanggalSelesai(parseDate(event.tanggal_selesai));
      setCoverPreview(event.cover ? `/storage/${event.cover}` : null);
      setCoverFile(null);
    }
  }, [event]);

  const handleHargaChange = (field: "harga" | "harga_coret", val: string) => {
    const clean = val.replace(/\D/g, "");
    setForm(prev => ({ ...prev, [field]: clean }));
  };

  const handleSave = () => {
    if (!form.nama.trim()) return;

    setIsSubmitting(true);

    const payload = new FormData();
    payload.append("_method", "PUT");
    payload.append("nama", form.nama);
    payload.append("deskripsi", form.deskripsi || "");
    payload.append("url", form.url || "");
    payload.append("lokasi", form.lokasi || "");
    payload.append("link_zoom", form.link_zoom || "");
    
    const cleanHarga = form.harga ? form.harga.replace(/\D/g, "") : "0";
    payload.append("harga", cleanHarga);

    if (form.harga_coret) {
      const cleanHargaCoret = form.harga_coret.replace(/\D/g, "");
      payload.append("harga_coret", cleanHargaCoret);
    } else {
      payload.append("harga_coret", "");
    }

    if (form.max_peserta) {
      payload.append("max_peserta", form.max_peserta);
    } else {
      payload.append("max_peserta", "");
    }

    if (tanggalMulai) {
      payload.append("tanggal_mulai", tanggalMulai.toISOString());
    }
    if (tanggalSelesai) {
      payload.append("tanggal_selesai", tanggalSelesai.toISOString());
    }

    if (coverFile) {
      payload.append("cover", coverFile);
    }

    router.post(`/webinars/${event.id}`, payload, {
      forceFormData: true,
      onSuccess: () => {
        setIsSubmitting(false);
        onOpenChange(false);
        toast.success("Webinar updated");
        router.reload();
      },
      onError: () => {
        setIsSubmitting(false);
        toast.error("Update gagal");
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Webinar</DialogTitle>
          <DialogDescription>
            Update data webinar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Nama</Label>
            <Input
              value={form.nama}
              onChange={(e) =>
                setForm({ ...form, nama: e.target.value })
              }
            />
          </div>

          <div>
            <Label>Deskripsi</Label>
            <Textarea
              value={form.deskripsi}
              onChange={(e) =>
                setForm({ ...form, deskripsi: e.target.value })
              }
            />
          </div>

          <div>
            <Label>URL Webinar</Label>
            <Input
              value={form.url}
              onChange={(e) =>
                setForm({ ...form, url: e.target.value })
              }
            />
          </div>

          <div>
            <Label>Lokasi</Label>
            <Input
              value={form.lokasi}
              onChange={(e) =>
                setForm({ ...form, lokasi: e.target.value })
              }
            />
          </div>

          <div>
            <Label>Link Zoom</Label>
            <Input
              value={form.link_zoom}
              onChange={(e) =>
                setForm({ ...form, link_zoom: e.target.value })
              }
            />
          </div>

          <div>
            <Label>Harga</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm text-gray-500">Rp</span>
              <Input
                className="pl-9"
                type="text"
                value={formatRupiahInput(form.harga)}
                onChange={(e) => handleHargaChange("harga", e.target.value)}
                inputMode="numeric"
              />
            </div>
          </div>

          <div>
            <Label>Harga Coret</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm text-gray-500">Rp</span>
              <Input
                className="pl-9"
                type="text"
                value={formatRupiahInput(form.harga_coret)}
                onChange={(e) => handleHargaChange("harga_coret", e.target.value)}
                inputMode="numeric"
              />
            </div>
          </div>

          <div>
            <Label>Max Peserta</Label>
            <Input
              type="number"
              value={form.max_peserta}
              onChange={(e) =>
                setForm({ ...form, max_peserta: e.target.value })
              }
            />
          </div>

          {/* COVER */}
          <div>
            <Label>Cover</Label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed p-4 text-center rounded cursor-pointer hover:bg-slate-50 transition"
            >
              {coverPreview ? (
                <img
                  src={coverPreview}
                  className="max-h-40 mx-auto rounded"
                />
              ) : (
                "Upload Cover"
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                setCoverFile(file);

                const reader = new FileReader();
                reader.onload = () =>
                  setCoverPreview(reader.result as string);
                reader.readAsDataURL(file);
              }}
            />
          </div>

          <DatePickerField
            label="Tanggal Mulai"
            value={tanggalMulai}
            onChange={setTanggalMulai}
          />

          <DatePickerField
            label="Tanggal Selesai"
            value={tanggalSelesai}
            onChange={setTanggalSelesai}
          />

          <div className="flex gap-2 pt-3 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>

            <Button onClick={handleSave} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}