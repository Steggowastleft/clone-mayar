import AppLayout from "@/layouts/app-layout";
import { Head } from "@inertiajs/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Download, Printer, Copy, Link2, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import DashboardLayout from "@/components/dashboard/dashboardlayout";

type LinkPembayaran = {
  id: number;
  nama: string;
  url: string;
  harga: number;
  status: "aktif" | "nonaktif";
  klik: number;
  transaksi: number;
  tanggal: string;
};

type Props = { links: LinkPembayaran[] };

export default function LinkPembayaranIndex({ links = [] }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const filtered = links.filter((l) => {
    const matchSearch = l.nama.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleCopy = (url: string, id: number) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "aktif":    return <Badge className="bg-green-500 text-white">Aktif</Badge>;
      case "nonaktif": return <Badge className="bg-gray-400 text-white">Nonaktif</Badge>;
      default:         return <Badge>-</Badge>;
    }
  };

  const filterBtns = [
    { label: "SEMUA", value: "all" },
    { label: "AKTIF", value: "aktif" },
    { label: "NONAKTIF", value: "nonaktif" },
  ];

  return (
    <DashboardLayout>
      <Head title="Link Pembayaran" />
      <div className="flex gap-0 min-h-screen">
        <div className="flex-1 p-6">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">PROJEK</p>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Link Pembayaran</h1>
            <div className="flex gap-2">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">+ BUAT LINK</Button>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-700">Semua Link Pembayaran</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Input placeholder="Cari link..." className="pl-8 w-48 text-sm"
                    value={search} onChange={(e) => setSearch(e.target.value)} />
                  <Link2 className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
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
                  {filtered.map((l) => (
                    <div key={l.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800">{l.nama}</p>
                        <p className="text-xs text-blue-500 truncate mt-0.5">{l.url}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{l.tanggal} · {l.klik} klik · {l.transaksi} transaksi</p>
                      </div>
                      <div className="flex items-center gap-2 ml-4 shrink-0">
                        {statusBadge(l.status)}
                        <button
                          onClick={() => handleCopy(l.url, l.id)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                          title="Salin link"
                        >
                          {copiedId === l.id
                            ? <CheckCircle className="h-4 w-4 text-green-500" />
                            : <Copy className="h-4 w-4" />
                          }
                        </button>
                        <Button size="sm">Detail</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-72 border-l border-gray-200 bg-gray-50 p-4 space-y-3 shrink-0">
          <Input placeholder="Cari Link Pembayaran" className="bg-white text-sm"
            value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="space-y-2">
            {filterBtns.map((btn) => (
              <button key={btn.value} onClick={() => setStatusFilter(btn.value)}
                className={cn("w-full px-4 py-2.5 rounded-md text-sm font-semibold tracking-wide transition",
                  statusFilter === btn.value
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
                )}>
                {btn.label}
              </button>
            ))}
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Info</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Link Pembayaran memungkinkan Anda membuat halaman pembayaran langsung tanpa produk tertentu.
            </p>
          </div>
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold">
            + Buat Link Baru
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
