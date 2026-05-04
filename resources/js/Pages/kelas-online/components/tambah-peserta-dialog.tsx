import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { router } from "@inertiajs/react";

export function TambahPesertaDialog({
  open,
  onOpenChange,
  kelasId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  kelasId: number;
}) {
  const [search, setSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  
  // Ini hanya dummy UI karena endpoint pencarian peserta belum tersedia
  // Anda bisa menggantinya dengan fetch() ke endpoint pencarian peserta.
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = () => {
    if (!search.trim()) return;
    setIsSearching(true);
    // TODO: Implementasi pencarian peserta ke backend
    // fetch(`/api/peserta/search?q=${search}`)...
    
    // Simulasi hasil pencarian
    setTimeout(() => {
      setResults([
        { id: 999, nama: "Peserta Demo", email: "demo@example.com" }
      ]);
      setIsSearching(false);
    }, 1000);
  };

  const handleAdd = (pesertaId: number) => {
    // TODO: Implementasi endpoint untuk menambahkan peserta ke kelas
    toast.info("Fitur menambahkan peserta dari database akan segera tersedia! Anda perlu membuat endpoint backend untuk memprosesnya.");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Peserta dari Database</DialogTitle>
          <DialogDescription>
            Cari peserta yang sudah ada di sistem dan tambahkan ke kelas ini.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari email atau nama peserta..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={isSearching || !search.trim()}>
              {isSearching ? "Mencari..." : "Cari"}
            </Button>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden h-64 overflow-y-auto bg-gray-50 p-2">
            {results.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-gray-400">
                {search ? "Pencarian tidak ditemukan." : "Masukkan kata kunci untuk mencari."}
              </div>
            ) : (
              <div className="space-y-2">
                {results.map((p) => (
                  <div key={p.id} className="bg-white p-3 border border-gray-200 rounded-md flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">{p.nama}</p>
                      <p className="text-xs text-gray-500">{p.email}</p>
                    </div>
                    <Button size="sm" onClick={() => handleAdd(p.id)} className="h-8">
                      <UserPlus className="h-3 w-3 mr-1" /> Tambah
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
