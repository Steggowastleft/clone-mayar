import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Download, Printer, Search, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import DashboardLayout from "@/components/dashboard/dashboardlayout";

type PermintaanBayar = {
  id: number;
  kode: string;
  nama: string;
  email: string;
  jumlah: number;
  keterangan: string;
  status: "menunggu" | "dibayar" | "kadaluarsa" | "dibatalkan";
  tanggal: string;
  penjual?: string;
};

type Props = { permintaan?: PermintaanBayar[] };

export default function PermintaanBayarIndex({ permintaan = [] }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = permintaan.filter((p) => {
    const matchSearch =
      p.nama.toLowerCase().includes(search.toLowerCase()) ||
      p.kode.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusBadge = (status: string) => {
    switch (status) {
      case "menunggu":   return <Badge className="bg-yellow-500 text-white">Menunggu</Badge>;
      case "dibayar":    return <Badge className="bg-green-500 text-white">Dibayar</Badge>;
      case "kadaluarsa": return <Badge className="bg-red-500 text-white">Kadaluarsa</Badge>;
      case "dibatalkan": return <Badge className="bg-gray-500 text-white">Dibatalkan</Badge>;
      default:           return <Badge>-</Badge>;
    }
  };

  const filterBtns = [
    { label: "SEMUA", value: "all" },
    { label: "MENUNGGU", value: "menunggu" },
    { label: "DIBAYAR", value: "dibayar" },
    { label: "KADALUARSA", value: "kadaluarsa" },
    { label: "DIBATALKAN", value: "dibatalkan" },
  ];

  return (
    <DashboardLayout>
      <Head title="Permintaan Bayar" />
      <div className="flex gap-0 min-h-screen">
        <div className="flex-1 p-6">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">PROJEK</p>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Permintaan Bayar</h1>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => router.visit("/permintaan-bayar/buat")}>
              + BUAT PERMINTAAN
            </Button>
          </div>

          {/* Sub nav */}
          <div className="flex gap-1 mb-4">
            <button className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-md">
              Semua Permintaan
            </button>
            <button
              className="px-4 py-2 text-sm font-semibold bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-md"
              onClick={() => router.visit("/permintaan-bayar/buat")}>
              Buat Permintaan
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-700">Semua Permintaan Bayar</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Input placeholder="Cari permintaan..." className="pl-8 w-48 text-sm"
                    value={search} onChange={(e) => setSearch(e.target.value)} />
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                </div>
                <button className="text-gray-400 hover:text-gray-600"><Printer className="h-5 w-5" /></button>
                <button className="text-gray-400 hover:text-gray-600"><Download className="h-5 w-5" /></button>
              </div>
            </div>
            <div className="p-6">
              {filtered.length === 0 ? (
                <p className="text-center text-gray-400 py-12 text-sm">There are no records to display</p>
              ) : (
                <div className="space-y-3">
                  {filtered.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition">
                      <div>
                        <p className="font-semibold text-gray-800">{p.nama}</p>
                        <p className="text-sm text-gray-500">{p.kode} · {p.email} · {p.tanggal}</p>
                        <p className="text-sm text-gray-500">{p.keterangan}</p>
                        <div className="flex gap-4 mt-1">
                          <p className="text-sm font-medium text-blue-600">Rp {p.jumlah.toLocaleString("id-ID")}</p>
                          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                            {p.penjual ?? "Admin"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {statusBadge(p.status)}
                        <Button size="sm" onClick={() => router.visit(`/permintaan-bayar/${p.id}`)}>Detail</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="w-72 border-l border-gray-200 bg-gray-50 p-4 space-y-3 shrink-0">
          <Input placeholder="Cari Permintaan Bayar" className="bg-white text-sm"
            value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="space-y-2">
            {filterBtns.map((btn) => (
              <button key={btn.value} onClick={() => setStatusFilter(btn.value)}
                className={cn("w-full px-4 py-2.5 rounded-md text-sm font-semibold tracking-wide transition",
                  statusFilter === btn.value ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
                )}>
                {btn.label}
              </button>
            ))}
          </div>
          <button onClick={() => router.visit("/permintaan-bayar/buat")}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-900 text-white text-sm font-semibold rounded-md transition mt-2">
            BUAT PERMINTAAN BARU <ExternalLink className="h-4 w-4" />
          </button>
          <p className="text-xs text-gray-500 text-center leading-relaxed">
            Kirim permintaan pembayaran langsung ke pelanggan Anda melalui link.
          </p>
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold"
            onClick={() => router.visit("/permintaan-bayar/buat")}>
            + Buat Permintaan Bayar
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
