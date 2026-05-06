import DashboardLayout from "@/components/dashboard/dashboardlayout";
import { Head, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Printer, Download, Trash2, Edit } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { useState } from "react";

type Bundling = {
  id: number;
  nama: string;
  harga: number;
  status: "published" | "unpublished";
  cover_url?: string;
  jumlah_produk: number;
  jumlah_terjual: number;
  created_at: string;
};

type IndexProps = {
  bundlings: Bundling[];
};

export default function Index({ bundlings }: IndexProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredBundlings = bundlings.filter((b) => {
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    const matchSearch = b.nama.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const statusBadge = (status: string) => {
    switch (status) {
      case "published":
        return (
          <Badge className="bg-green-500 text-white">Published</Badge>
        );
      case "unpublished":
        return (
          <Badge className="bg-yellow-500 text-white">Unpublished</Badge>
        );
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus bundling ini?")) {
      router.delete(`/bundling/${id}`);
    }
  };

  const filterButtons = [
    { label: "SEMUA", value: "all" },
    { label: "PUBLISHED", value: "published" },
    { label: "UNPUBLISHED", value: "unpublished" },
  ];

  return (
    <DashboardLayout title="Bundling Produk">
      <Head title="Bundling Produk" />

      <div className="flex gap-0 min-h-screen">
        {/* MAIN CONTENT */}
        <div className="flex-1 p-6">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
            PRODUK
          </p>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Bundling Produk
            </h1>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-blue-500 text-blue-600 hover:bg-blue-50"
              >
                KATALOG
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => router.visit("/bundling/create")}
              >
                + BUAT BUNDLING
              </Button>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 mb-6">
            {filterButtons.map((btn) => (
              <button
                key={btn.value}
                onClick={() => setStatusFilter(btn.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  statusFilter === btn.value
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Table Panel */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-700">
                Semua Bundling Produk
              </h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Input
                    placeholder="Cari bundling..."
                    className="pl-8 w-48 text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <svg
                    className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <Printer className="h-5 w-5" />
                </button>
                <button className="text-gray-400 hover:text-gray-600">
                  <Download className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              {filteredBundlings.length === 0 ? (
                <p className="text-center text-gray-400 py-12 text-sm">
                  Tidak ada bundling untuk ditampilkan
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredBundlings.map((bundling) => (
                    <div
                      key={bundling.id}
                      className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        {bundling.cover_url && (
                          <img
                            src={bundling.cover_url}
                            alt={bundling.nama}
                            className="h-12 w-12 rounded-md object-cover"
                          />
                        )}
                        <div>
                          <p className="font-semibold text-gray-800">
                            {bundling.nama}
                          </p>
                          <p className="text-sm text-gray-500">
                            Rp {bundling.harga.toLocaleString("id-ID")} ·{" "}
                            {bundling.jumlah_produk} produk · Terjual{" "}
                            {bundling.jumlah_terjual}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {format(
                              new Date(bundling.created_at),
                              "dd MMM yyyy",
                              { locale: idLocale }
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {statusBadge(bundling.status)}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            router.visit(`/bundling/${bundling.id}`)
                          }
                        >
                          Detail
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            router.visit(`/bundling/${bundling.id}/edit`)
                          }
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(bundling.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
