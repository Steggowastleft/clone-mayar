import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
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

  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ sync kalau event berubah
  useEffect(() => {
    setForm({
      nama: event.nama || "",
      deskripsi: event.deskripsi || "",
      lokasi: event.lokasi || "",
    });
  }, [event]);

  const handleClose = (v: boolean) => {
    onOpenChange(v);

    if (!v) {
      setForm({
        nama: event.nama || "",
        deskripsi: event.deskripsi || "",
        lokasi: event.lokasi || "",
      });
    }
  };

  const handleSave = () => {
    if (!form.nama.trim()) return;

    setIsSubmitting(true);

    router.put(`/events/${event.id}`, form, {
      preserveScroll: true,
      onSuccess: () => {
        setIsSubmitting(false);
        onOpenChange(false);
      },
      onError: () => {
        setIsSubmitting(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
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

          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}