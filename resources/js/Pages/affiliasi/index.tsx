
import { Head } from "@inertiajs/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Download, Printer, Link2, Users, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import DashboardLayout from "@/components/dashboard/dashboardlayout";

type Affiliator = {
  id: number;
  nama: string;
  email: string;
  kode_afiliasi: string;
  total_klik: number;
  total_konversi: number;
  komisi_total: number;
  status: "aktif" | "nonaktif";
  bergabung: string;
};

type Props = { affiliators: Affiliator[] };

export default function AffiliasiIndex({ affiliators = [] }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = affiliators.filter((a) => {
    const matchSearch =
      a.nama.toLowerCase().includes(search.toLowerCase()) ||
      a.kode_afiliasi.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const filterBtns = [
    { label: "SEMUA", value: "all" },
    { label: "AKTIF", value: "aktif" },
    { label: "NONAKTIF", value: "nonaktif" },
  ];

  return (
    <DashboardLayout>
      <Head title="Affiliasi" />
      <div className="flex gap-0 min-h-screen">
        <div className="flex-1 p-6">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">PEMASARAN</p>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Affiliasi</h1>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">+ Tambah Affiliator</Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: "Total Affiliator", value: affiliators.length, icon: <Users className="h-5 w-5 text-blue-600" />, bg: "bg-blue-50" },
              { label: "Total Klik", value: affiliators.reduce((s, a) => s + a.total_klik, 0), icon: <Link2 className="h-5 w-5 text-indigo-600" />, bg: "bg-indigo-50" },
              { label: "Total Komisi", value: `Rp ${affiliators.reduce((s, a) => s + a.komisi_total, 0).toLocaleString("id-ID")}`, icon: <TrendingUp className="h-5 w-5 text-green-600" />, bg: "bg-green-50" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center shrink-0`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  <p className="text-lg font-bold text-gray-800">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-700">Daftar Affiliator</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Input placeholder="Cari affiliator..." className="pl-8 w-52 text-sm"
                    value={search} onChange={(e) => setSearch(e.target.value)} />
                  <Users className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                </div>
                <button className="text-gray-400 hover:text-gray-600"><Printer className="h-5 w-5" /></button>
                <button className="text-gray-400 hover:text-gray-600"><Download className="h-5 w-5" /></button>
              </div>
            </div>
            <div className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <p className="text-center text-gray-400 py-12 text-sm">There are no records to display</p>
              ) : (
                filtered.map((a) => (
                  <div key={a.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-gray-50 transition">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{a.nama}</p>
                      <p className="text-xs text-gray-400">{a.email} · Kode: <span className="font-mono text-blue-600">{a.kode_afiliasi}</span></p>
                    </div>
                    <div className="flex items-center gap-6 text-xs text-gray-600">
                      <div className="text-center">
                        <p className="font-semibold text-gray-800">{a.total_klik}</p>
                        <p>Klik</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-gray-800">{a.total_konversi}</p>
                        <p>Konversi</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-green-600">Rp {a.komisi_total.toLocaleString("id-ID")}</p>
                        <p>Komisi</p>
                      </div>
                      <Badge className={a.status === "aktif" ? "bg-green-500 text-white" : "bg-gray-400 text-white"}>
                        {a.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="w-64 border-l border-gray-200 bg-gray-50 p-4 space-y-3 shrink-0">
          <Input placeholder="Cari Affiliator" className="bg-white text-sm"
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
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold">
            + Tambah Affiliator
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
