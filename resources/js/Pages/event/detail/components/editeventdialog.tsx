import { useState } from "react";
import { router } from "@inertiajs/react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Event = {
  id: number;
  nama: string;
  deskripsi?: string;
  lokasi?: string;
};

export function EditEventDialog({
  open,
  onOpenChange,
  event
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  event: Event;
}) {

  const [form, setForm] = useState({
    nama: event.nama || "",
    deskripsi: event.deskripsi || "",
    lokasi: event.lokasi || "",
  });

  const handleSave = () => {
    if (!form.nama.trim()) {
      toast.error("Nama event wajib diisi");
      return;
    }
    
    router.put(`/event/${event.id}`, form, {
      preserveScroll: true,
      onSuccess: () => {
        onOpenChange(false);
        toast.success("Event berhasil diperbarui!");
      },
      onError: (errors) => {
        const errorMsg = Object.values(errors)[0] as string || "Gagal memperbarui event";
        toast.error(errorMsg);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            placeholder="Nama Event"
            value={form.nama}
            onChange={(e) => setForm({ ...form, nama: e.target.value })}
          />

          <Input
            placeholder="Lokasi"
            value={form.lokasi}
            onChange={(e) => setForm({ ...form, lokasi: e.target.value })}
          />

          <Input
            placeholder="Deskripsi"
            value={form.deskripsi}
            onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
          />

          <Button onClick={handleSave}>Simpan</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}