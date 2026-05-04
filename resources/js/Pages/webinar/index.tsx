import AppLayout from "@/layouts/app-layout";
import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Download, Printer, ExternalLink, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import DashboardLayout from "@/components/dashboard/dashboardlayout";

type Webinar = {
  id: number;
  nama: string;
  tanggal_mulai: string;
  durasi: string;
  harga: number;
  status: "published" | "unpublished" | "unlisted";
  peserta: number;
};

type Props = { webinars: Webinar[] };

export default function WebinarIndex({ webinars = [] }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = webinars.filter((w) => {
    const matchSearch = w.nama.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || w.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusBadge = (status: string) => {
    switch (status) {
      case "published":   return <Badge className="bg-green-500 text-white">Published</Badge>;
      case "unpublished": return <Badge className="bg-yellow-500 text-white">Unpublished</Badge>;
      case "unlisted":    return <Badge className="bg-gray-500 text-white">Unlisted</Badge>;
      default:            return <Badge>-</Badge>;
    }
  };

  const filterBtns = [
    { label: "SEMUA", value: "all" },
    { label: "PUBLISHED", value: "published" },
    { label: "UNPUBLISHED", value: "unpublished" },
    { label: "UNLISTED", value: "unlisted" },
  ];

  return (
    <DashboardLayout>
      <Head title="Webinar" />
      <div className="flex gap-0 min-h-screen">
        <div className="flex-1 p-6">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">PROJEK</p>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Webinar</h1>
            <div className="flex gap-2">
              <Button variant="outline" className="border-blue-500 text-blue-600 hover:bg-blue-50">PRODUK</Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">+ BUAT</Button>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-700">Semua Webinar</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Input placeholder="Filter Halaman" className="pl-8 w-48 text-sm"
                    value={search} onChange={(e) => setSearch(e.target.value)} />
                  <Video className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
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
                  {filtered.map((w) => (
                    <div key={w.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition">
                      <div>
                        <p className="font-semibold text-gray-800">{w.nama}</p>
                        <p className="text-sm text-gray-500">{w.tanggal_mulai} · {w.durasi} · {w.peserta} peserta</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {statusBadge(w.status)}
                        <Button size="sm" onClick={() => router.visit(`/webinar/${w.id}`)}>Detail</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-72 border-l border-gray-200 bg-gray-50 p-4 space-y-3 shrink-0">
          <Input placeholder="Cari Webinar" className="bg-white text-sm"
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
          <button onClick={() => window.open("/webinar/catalog", "_blank")}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-900 text-white text-sm font-semibold rounded-md transition">
            KATALOG WEBINAR <ExternalLink className="h-4 w-4" />
          </button>
          <p className="text-xs text-gray-500 text-center leading-relaxed">
            Halaman katalog online untuk semua Webinar Anda yang aktif.
          </p>
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold">
            + Buat Webinar Baru
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
