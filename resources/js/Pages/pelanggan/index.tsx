import AppLayout from "@/layouts/app-layout";
import { Head } from "@inertiajs/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Printer, UserCircle, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import DashboardLayout from "@/components/dashboard/dashboardlayout";

type Pelanggan = {
  id: number;
  nama: string;
  email: string;
  no_hp?: string;
  total_transaksi: number;
  total_belanja: number;
  tanggal_daftar: string;
  produk_dibeli: string[];
};

type Props = { pelanggan: Pelanggan[] };

export default function PelangganIndex({ pelanggan = [] }: Props) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("terbaru");

  const filtered = pelanggan.filter((p) =>
    p.nama.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  const sortBtns = [
    { label: "TERBARU", value: "terbaru" },
    { label: "TERLAMA", value: "terlama" },
    { label: "TERBANYAK BELI", value: "terbanyak" },
  ];

  return (
    <DashboardLayout>
      <Head title="Pelanggan" />
      <div className="flex gap-0 min-h-screen">
        <div className="flex-1 p-6">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">CRM</p>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Pelanggan</h1>
            <div className="flex gap-2">
              <Button variant="outline" className="border-blue-500 text-blue-600 hover:bg-blue-50">
                <Download className="h-4 w-4 mr-1" /> Export
              </Button>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-700">Semua Pelanggan</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Input placeholder="Cari pelanggan..." className="pl-8 w-52 text-sm"
                    value={search} onChange={(e) => setSearch(e.target.value)} />
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                </div>
                <button className="text-gray-400 hover:text-gray-600"><Printer className="h-5 w-5" /></button>
                <button className="text-gray-400 hover:text-gray-600"><Download className="h-5 w-5" /></button>
              </div>
            </div>

            {/* Table header */}
            <div className="px-5 py-2 border-b border-gray-100 grid grid-cols-5 gap-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <div className="col-span-2">Pelanggan</div>
              <div>Produk Dibeli</div>
              <div>Total Belanja</div>
              <div>Daftar Sejak</div>
            </div>

            <div className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <p className="text-center text-gray-400 py-12 text-sm">Tidak ada pelanggan ditemukan</p>
              ) : (
                filtered.map((p) => (
                  <div key={p.id} className="px-5 py-3.5 grid grid-cols-5 gap-4 items-center hover:bg-gray-50 transition">
                    <div className="col-span-2 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <UserCircle className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{p.nama}</p>
                        <p className="text-xs text-gray-400">{p.email}</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">{p.total_transaksi} produk</div>
                    <div className="text-sm font-semibold text-gray-700">
                      Rp {p.total_belanja.toLocaleString("id-ID")}
                    </div>
                    <div className="text-xs text-gray-500">{p.tanggal_daftar}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="w-64 border-l border-gray-200 bg-gray-50 p-4 space-y-3 shrink-0">
          <Input placeholder="Cari Pelanggan" className="bg-white text-sm"
            value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="space-y-2">
            {sortBtns.map((btn) => (
              <button key={btn.value} onClick={() => setSortBy(btn.value)}
                className={cn("w-full px-4 py-2.5 rounded-md text-sm font-semibold tracking-wide transition",
                  sortBy === btn.value
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
                )}>
                {btn.label}
              </button>
            ))}
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Statistik</p>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Total Pelanggan</span>
                <span className="font-semibold">{pelanggan.length}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Bulan Ini</span>
                <span className="font-semibold text-green-600">0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
