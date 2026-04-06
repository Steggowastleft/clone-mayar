import AppLayout from "@/layouts/app-layout";
import { Head } from "@inertiajs/react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Printer, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import Dashboard from "../dashboard";
import DashboardLayout from "@/components/dashboard/dashboardlayout";

type Transaksi = {
  id: number;
  kode: string;
  nama_pembeli: string;
  email: string;
  produk: string;
  jenis_produk: string;
  jumlah: number;
  status: "sukses" | "pending" | "gagal" | "refund";
  tanggal: string;
};

type Props = { transaksi: Transaksi[] };

export default function TransaksiIndex({ transaksi = [] }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = transaksi.filter((t) => {
    const matchSearch =
      t.nama_pembeli.toLowerCase().includes(search.toLowerCase()) ||
      t.kode.toLowerCase().includes(search.toLowerCase()) ||
      t.produk.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusBadge = (status: string) => {
    switch (status) {
      case "sukses":  return <Badge className="bg-green-500 text-white">Sukses</Badge>;
      case "pending": return <Badge className="bg-yellow-500 text-white">Pending</Badge>;
      case "gagal":   return <Badge className="bg-red-500 text-white">Gagal</Badge>;
      case "refund":  return <Badge className="bg-gray-500 text-white">Refund</Badge>;
      default:        return <Badge>-</Badge>;
    }
  };

  const filterBtns = [
    { label: "SEMUA", value: "all" },
    { label: "SUKSES", value: "sukses" },
    { label: "PENDING", value: "pending" },
    { label: "GAGAL", value: "gagal" },
    { label: "REFUND", value: "refund" },
  ];

  return (
    <DashboardLayout>
      <Head title="Transaksi" />
      <div className="flex gap-0 min-h-screen">
        {/* Main */}
        <div className="flex-1 p-6">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">KEUANGAN</p>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Transaksi</h1>
            <div className="flex gap-2">
              <Button variant="outline" className="border-blue-500 text-blue-600 hover:bg-blue-50">
                <Download className="h-4 w-4 mr-1" /> Export
              </Button>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-700">Semua Transaksi</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Input
                    placeholder="Cari transaksi..."
                    className="pl-8 w-52 text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                </div>
                <button className="text-gray-400 hover:text-gray-600"><Printer className="h-5 w-5" /></button>
                <button className="text-gray-400 hover:text-gray-600"><Download className="h-5 w-5" /></button>
              </div>
            </div>

            {/* Table header */}
            <div className="px-5 py-2 border-b border-gray-100 grid grid-cols-6 gap-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <div>Kode</div>
              <div>Pembeli</div>
              <div>Produk</div>
              <div>Jumlah</div>
              <div>Tanggal</div>
              <div>Status</div>
            </div>

            <div className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <p className="text-center text-gray-400 py-12 text-sm">Tidak ada transaksi ditemukan</p>
              ) : (
                filtered.map((t) => (
                  <div key={t.id} className="px-5 py-3 grid grid-cols-6 gap-4 items-center hover:bg-gray-50 transition">
                    <div className="text-xs font-mono text-gray-500">{t.kode}</div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{t.nama_pembeli}</p>
                      <p className="text-xs text-gray-400">{t.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-700">{t.produk}</p>
                      <p className="text-xs text-gray-400">{t.jenis_produk}</p>
                    </div>
                    <div className="text-sm font-semibold text-gray-700">
                      Rp {t.jumlah.toLocaleString("id-ID")}
                    </div>
                    <div className="text-xs text-gray-500">{t.tanggal}</div>
                    <div>{statusBadge(t.status)}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="w-64 border-l border-gray-200 bg-gray-50 p-4 space-y-3 shrink-0">
          <Input
            placeholder="Cari transaksi..."
            className="bg-white text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="space-y-2">
            {filterBtns.map((btn) => (
              <button
                key={btn.value}
                onClick={() => setStatusFilter(btn.value)}
                className={cn(
                  "w-full px-4 py-2.5 rounded-md text-sm font-semibold tracking-wide transition",
                  statusFilter === btn.value
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
                )}
              >
                {btn.label}
              </button>
            ))}
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Ringkasan</p>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Total Transaksi</span>
                <span className="font-semibold">{transaksi.length}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Sukses</span>
                <span className="font-semibold text-green-600">{transaksi.filter(t => t.status === "sukses").length}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Pending</span>
                <span className="font-semibold text-yellow-600">{transaksi.filter(t => t.status === "pending").length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
