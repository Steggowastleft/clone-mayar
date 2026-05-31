import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Copy, ChevronDown, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { router } from "@inertiajs/react";
import { toast } from "sonner";

import type { Webinar } from "../detail";

export default function TabDetail({ webinar }: { webinar: Webinar }) {
  const [deskOpen, setDeskOpen] = useState(false);
  const [pembicaraOpen, setPembicaraOpen] = useState(false);
  const [isSubmittingPembicara, setIsSubmittingPembicara] = useState(false);
  
  const [pembicaraForm, setPembicaraForm] = useState({
    nama: "",
    pekerjaan: "",
    profil: "",
    foto: null as File | null,
  });

  const baseUrl = window.location.origin;

  const handlePembicaraSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pembicaraForm.nama.trim() || !pembicaraForm.pekerjaan.trim() || !pembicaraForm.profil.trim()) {
      toast.error("Nama, Pekerjaan, dan Profil Pembicara wajib diisi");
      return;
    }
    
    setIsSubmittingPembicara(true);
    
    const formData = new FormData();
    formData.append("nama", pembicaraForm.nama);
    formData.append("pekerjaan", pembicaraForm.pekerjaan);
    formData.append("profil", pembicaraForm.profil);
    if (pembicaraForm.foto) {
      formData.append("foto", pembicaraForm.foto);
    }

    router.post(`/webinars/${webinar.id}/pembicara`, formData, {
      forceFormData: true,
      onSuccess: () => {
        toast.success("Pembicara berhasil ditambahkan!");
        setPembicaraOpen(false);
        setPembicaraForm({ nama: "", pekerjaan: "", profil: "", foto: null });
        setIsSubmittingPembicara(false);
      },
      onError: () => {
        toast.error("Gagal menambahkan pembicara.");
        setIsSubmittingPembicara(false);
      }
    });
  };

  const rows = [
    {
      label: "Status",
      value: (
        <Badge
          className={cn(
            "text-white text-xs",
            webinar.status === "published"
              ? "bg-green-500"
              : webinar.status === "unlisted"
              ? "bg-gray-500"
              : "bg-yellow-500"
          )}
        >
          {webinar.status}
        </Badge>
      ),
    },
    { label: "Nama", value: webinar.nama },
    {
      label: "URL Webinar",
      value: webinar.url || "-",
    },
    { label: "Peserta", value: webinar.peserta },
    { label: "Max Peserta", value: webinar.max_peserta ?? "-" },
    {
      label: "Tanggal Mulai",
      value: webinar.tanggal_mulai ?? "-",
    },
    {
      label: "Tanggal Selesai",
      value: webinar.tanggal_selesai ?? "-",
    },
    {
      label: "Deskripsi",
      value: (
        <button
          onClick={() => setDeskOpen(true)}
          className="text-blue-600 text-sm underline"
        >
          Lihat Deskripsi
        </button>
      ),
    },
  ];

  return (
    <>
      {/* SHARE */}
      <div className="bg-white border border-blue-100 rounded-xl shadow-sm p-6 mb-5 space-y-4">
        <h3 className="text-base font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          Bagi Tautan untuk Menerima Order
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              label: "Tautan Pembayaran (Checkout)",
              url: `${baseUrl}/p/${webinar.id}/webinar`,
            },
            {
              label: "Halaman Detail Webinar",
              url: `${baseUrl}/webinar/${webinar.id}`,
            },
          ].map((item) => (
            <div key={item.label} className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</span>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={item.url}
                  className="bg-slate-50/50 border-slate-200 text-xs font-semibold text-slate-600 select-all h-9"
                />
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(item.url);
                    toast.success(`${item.label} berhasil disalin!`);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3 h-9"
                  size="sm"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TAMBAH PEMBICARA SECTION */}
      <div className="bg-white border rounded-lg p-5 mb-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-blue-600" /> Pembicara Webinar
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Anda dapat menambahkan daftar pembicara yang akan mengisi webinar ini.
            </p>
          </div>
          <Button onClick={() => setPembicaraOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white shrink-0">
            + Tambah Pembicara
          </Button>
        </div>

        {webinar.pembicaras && webinar.pembicaras.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {webinar.pembicaras.map((pembicara) => (
              <div key={pembicara.id} className="border rounded-lg p-4 flex gap-3 items-start bg-gray-50">
                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border bg-white">
                  {pembicara.foto_url ? (
                    <img src={pembicara.foto_url} alt={pembicara.nama} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold">
                      {pembicara.nama.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-800">{pembicara.nama}</h4>
                  <p className="text-xs text-blue-600 font-medium mb-1">{pembicara.pekerjaan}</p>
                  <p className="text-[10px] text-gray-500 line-clamp-2">{pembicara.profil}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden p-6">
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse">
            <tbody className="divide-y divide-slate-200">
              {rows.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/20 transition">
                  <td className="px-5 py-4 text-xs font-bold text-slate-550 w-56 border-r border-slate-200 bg-slate-50/30 whitespace-nowrap">
                    {row.label}
                  </td>
                  <td className="px-5 py-4 text-xs font-medium text-slate-700">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Centered Created At */}
        <div className="text-center py-3 border border-blue-150 rounded-lg text-blue-650 font-bold bg-white mt-5 text-xs">
          Dibuat pada {webinar.created_at ? new Date(webinar.created_at).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          }) : "-"}
        </div>
      </div>

      {/* MODAL */}
      <Dialog open={deskOpen} onOpenChange={setDeskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deskripsi</DialogTitle>
          </DialogHeader>

          <div className="text-sm whitespace-pre-wrap">
            {webinar.deskripsi || "Tidak ada deskripsi"}
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL TAMBAH PEMBICARA */}
      <Dialog open={pembicaraOpen} onOpenChange={setPembicaraOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Tambah Pembicara Webinar</DialogTitle>
            <DialogDescription>Anda dapat menambahkan Pembicara Webinar anda.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePembicaraSubmit} className="space-y-4 mt-2">
            <div className="space-y-1">
              <Label htmlFor="nama">Nama Pembicara <span className="text-red-500">*</span></Label>
              <Input 
                id="nama"
                placeholder="Contoh: Budi Santoso"
                value={pembicaraForm.nama}
                onChange={(e) => setPembicaraForm({ ...pembicaraForm, nama: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="pekerjaan">Pekerjaan/Jabatan Pembicara <span className="text-red-500">*</span></Label>
              <Input 
                id="pekerjaan"
                placeholder="Contoh: CEO di TechCorp"
                value={pembicaraForm.pekerjaan}
                onChange={(e) => setPembicaraForm({ ...pembicaraForm, pekerjaan: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="profil">Profil Pembicara <span className="text-red-500">*</span></Label>
              <Textarea 
                id="profil"
                placeholder="Tuliskan biografi singkat pembicara..."
                className="min-h-[100px]"
                value={pembicaraForm.profil}
                onChange={(e) => setPembicaraForm({ ...pembicaraForm, profil: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="foto">Foto Profil Pembicara</Label>
              <Input 
                id="foto"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setPembicaraForm({ ...pembicaraForm, foto: e.target.files[0] });
                  }
                }}
              />
              <p className="text-[10px] text-gray-500 mt-1">Format: JPG, PNG, WEBP (Maks: 2MB). Opsional.</p>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setPembicaraOpen(false)} disabled={isSubmittingPembicara}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmittingPembicara} className="bg-blue-600 hover:bg-blue-700 text-white">
                {isSubmittingPembicara ? "Menyimpan..." : "Simpan Pembicara"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}