import { Head, Link } from "@inertiajs/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Download, Printer, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import DashboardLayout from "@/components/dashboard/dashboardlayout";

type Permintaan = {
  id: number;
  kode: string;
  pelanggan: string;
  email: string;
  nominal: number;
  keterangan: string;
  status: "menunggu" | "dibayar" | "kadaluarsa";
  dibuat: string;
  expired: string;
};

type Props = { permintaans: Permintaan[] };

export default function SemualPermintaanIndex({ permintaans = [] }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = permintaans.filter((p) => {
    const matchSearch =
      p.pelanggan.toLowerCase().includes(search.toLowerCase()) ||
      p.kode.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusBadge = (status: string) => {
    switch (status) {
      case "dibayar":    return <Badge className="bg-green-500 text-white">Dibayar</Badge>;
      case "kadaluarsa": return <Badge className="bg-red-400 text-white">Kadaluarsa</Badge>;
      default:           return <Badge className="bg-yellow-400 text-white">Menunggu</Badge>;
    }
  };

  const filterBtns = [
    { label: "SEMUA", value: "all" },
    { label: "MENUNGGU", value: "menunggu" },
    { label: "DIBAYAR", value: "dibayar" },
    { label: "KADALUARSA", value: "kadaluarsa" },
  ];

  return (
    <DashboardLayout>
      <Head title="Permintaan Bayar" />
      <div className="flex gap-0 min-h-screen">

        {/* ── Konten Utama ── */}
        <div className="flex-1 p-6">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">TRANSAKSI</p>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Permintaan Bayar</h1>
            <Link href="/permintaan-bayar/buat">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">+ BUAT PERMINTAAN</Button>
            </Link>
          </div>

          {/* Sub Nav */}
          <div className="flex gap-0 mb-6 border-b border-gray-200">
            <Link
              href="/permintaan-bayar"
              className="text-sm px-4 py-2.5 border-b-2 border-blue-600 text-blue-600 font-semibold -mb-px"
            >
              Semua Permintaan
            </Link>
            <Link
              href="/permintaan-bayar/buat"
              className="text-sm px-4 py-2.5 text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300 -mb-px transition"
            >
              Buat Permintaan
            </Link>
          </div>

          {/* Table Card */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-700">Semua Permintaan</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Input
                    placeholder="Cari permintaan..."
                    className="pl-8 w-48 text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <Wallet className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                </div>
                <button className="text-gray-400 hover:text-gray-600"><Printer className="h-5 w-5" /></button>
                <button className="text-gray-400 hover:text-gray-600"><Download className="h-5 w-5" /></button>
              </div>
            </div>

            <div className="overflow-x-auto">
              {filtered.length === 0 ? (
                <p className="text-center text-gray-400 py-12 text-sm">There are no records to display</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {["Kode", "Pelanggan", "Nominal", "Keterangan", "Status", "Expired", "Aksi"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-600">{p.kode}</td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-gray-800">{p.pelanggan}</p>
                          <p className="text-xs text-gray-400">{p.email}</p>
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-800">
                          Rp {p.nominal.toLocaleString("id-ID")}
                        </td>
                        <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{p.keterangan}</td>
                        <td className="px-4 py-3">{statusBadge(p.status)}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{p.expired}</td>
                        <td className="px-4 py-3">
                          <Button size="sm" variant="outline">Detail</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* ── Sidebar Kanan ── */}
        <div className="w-72 border-l border-gray-200 bg-gray-50 p-4 space-y-3 shrink-0">
          <Input
            placeholder="Cari Permintaan"
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
          <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Info</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Buat permintaan pembayaran dan kirimkan ke pelanggan Anda via email. Pantau status pembayaran secara real-time.
            </p>
          </div>
          <Link href="/permintaan-bayar/buat">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold">
              + Buat Permintaan Baru
            </Button>
          </Link>
        </div>

      </div>
    </DashboardLayout>
  );
}
