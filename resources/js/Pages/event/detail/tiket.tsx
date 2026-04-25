import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Ticket,
  Pencil,
  Trash2,
} from "lucide-react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
export type TiketItem = {
  id: number;
  nama: string;
  harga: number;
  kuota: number;
  terjual: number;
};

type Props = {
  eventId: number;
  tiketList: TiketItem[];
};

// ─────────────────────────────────────────────
// Format Rupiah
// ─────────────────────────────────────────────
function formatRupiah(num: number) {
  return "Rp " + num.toLocaleString("id-ID");
}

// ─────────────────────────────────────────────
// Dialog Form
// ─────────────────────────────────────────────
function FormDialog({
  open,
  onClose,
  onSave,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initial?: Partial<TiketItem>;
}) {
  const [form, setForm] = useState({
    nama: initial?.nama || "",
    harga: initial?.harga || 0,
    kuota: initial?.kuota || 0,
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initial ? "Edit Tiket" : "Tambah Tiket"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            placeholder="Nama tiket"
            value={form.nama}
            onChange={(e) => setForm({ ...form, nama: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Harga"
            value={form.harga}
            onChange={(e) =>
              setForm({ ...form, harga: Number(e.target.value) })
            }
          />
          <Input
            type="number"
            placeholder="Kuota"
            value={form.kuota}
            onChange={(e) =>
              setForm({ ...form, kuota: Number(e.target.value) })
            }
          />

          <Button
            className="w-full"
            onClick={() => {
              onSave(form);
              onClose();
            }}
          >
            Simpan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function TabTiket({ eventId, tiketList }: Props) {
  const [data, setData] = useState<TiketItem[]>(tiketList);
  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<TiketItem | null>(null);

  // ── CRUD LOCAL (dummy dulu) ─────────────────
  const handleSave = (form: any) => {
    if (editItem) {
      setData((prev) =>
        prev.map((t) =>
          t.id === editItem.id ? { ...t, ...form } : t
        )
      );
    } else {
      setData((prev) => [
        ...prev,
        {
          id: Date.now(),
          ...form,
          terjual: 0,
        },
      ]);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Hapus tiket?")) {
      setData((prev) => prev.filter((t) => t.id !== id));
    }
  };

  // ── UI ─────────────────────────────────────
  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-gray-700">Daftar Tiket</h2>
        <Button
          onClick={() => {
            setEditItem(null);
            setOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-1" />
          Tambah Tiket
        </Button>
      </div>

      {/* List */}
      <div className="grid gap-3">
        {data.length === 0 ? (
          <div className="text-center text-gray-400 py-10">
            Belum ada tiket
          </div>
        ) : (
          data.map((t) => (
            <div
              key={t.id}
              className="border rounded-lg p-4 flex justify-between items-center"
            >
              <div>
                <p className="font-bold text-gray-800">{t.nama}</p>
                <p className="text-sm text-gray-500">
                  {formatRupiah(t.harga)}
                </p>
                <p className="text-xs text-gray-400">
                  {t.terjual}/{t.kuota} terjual
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditItem(t);
                    setOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(t.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Dialog */}
      <FormDialog
        open={open}
        onClose={() => setOpen(false)}
        onSave={handleSave}
        initial={editItem || undefined}
      />
    </div>
  );
}