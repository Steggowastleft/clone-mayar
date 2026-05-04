import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Download, Printer, ShoppingBag, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import DashboardLayout from "@/components/dashboard/dashboardlayout";

type Produk = {
  id: string;
  product_id: number;
  type: string;
  nama: string;
  kategori: string;
  harga: number;
  status: "published" | "unpublished" | "unlisted";
  terjual: number;
  tanggal: string;
};

type Props = { produk?: Produk[] };

export default function SemuaProduk({ produk = [] }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const categories = [...new Set(produk.map(p => p.kategori))];

  const filtered = produk.filter((p) => {
    const nama = p.nama ?? "";
    const kategori = p.kategori ?? "";

    const matchSearch = nama.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    const matchCategory =
      categoryFilter === "all" || kategori === categoryFilter;

    return matchSearch && matchStatus && matchCategory;
  });

  const statusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-500 text-white">Published</Badge>;
      case "unpublished":
        return <Badge className="bg-yellow-500 text-white">Unpublished</Badge>;
      case "unlisted":
        return <Badge className="bg-gray-500 text-white">Unlisted</Badge>;
      default:
        return <Badge>-</Badge>;
    }
  };

  const formatRupiah = (value: number) =>
    "Rp " + new Intl.NumberFormat("id-ID").format(value);

  const statusFilterBtns = [
    { label: "SEMUA", value: "all" },
    { label: "PUBLISHED", value: "published" },
    { label: "UNPUBLISHED", value: "unpublished" },
    { label: "UNLISTED", value: "unlisted" },
  ];

  return (
    <DashboardLayout>
      <Head title="Semua Produk" />

      <div className="flex min-h-screen">
        {/* MAIN */}
        <div className="flex-1 p-6">
          <p className="text-xs text-gray-400 uppercase mb-1">PROJEK</p>

          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Semua Produk</h1>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => router.visit("/semua-produk/create")}
            >
              + BUAT
            </Button>
          </div>

          {/* FILTER STATUS */}


          {/* FILTER KATEGORI */}
          {categories.length > 1 && (
            <div className="bg-white border rounded-lg shadow-sm mb-6">
              <div className="px-5 py-4 border-b">
                <h2 className="font-semibold mb-4">Filter Kategori</h2>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setCategoryFilter("all")}
                    className={cn(
                      "px-4 py-2 rounded-md text-sm",
                      categoryFilter === "all"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100"
                    )}
                  >
                    SEMUA
                  </button>

                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={cn(
                        "px-4 py-2 rounded-md text-sm",
                        categoryFilter === cat
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* LIST */}
          <div className="bg-white border rounded-lg shadow-sm">
            <div className="px-5 py-4 border-b flex justify-between">
              <h2 className="font-semibold">
                Semua Produk ({filtered.length})
              </h2>

              <div className="flex gap-3">
                <div className="relative">
                  <Input
                    placeholder="Cari produk..."
                    className="pl-8 w-48 text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <ShoppingBag className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                </div>

                <Printer className="h-5 w-5 text-gray-400 cursor-pointer" />
                <Download className="h-5 w-5 text-gray-400 cursor-pointer" />
              </div>
            </div>

            <div className="p-6">
              {filtered.length === 0 ? (
                <p className="text-center text-gray-400 py-12">
                  Tidak ada produk
                </p>
              ) : (
                <div className="space-y-3">
                  {filtered.map((p) => (
                    <div
                      key={p.id}
                      className="flex justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.visit(`/semua-produk/${p.id}`)}
                    >
                      <div>
                        <div className="flex gap-2 mb-1">
                          <p className="font-semibold">{p.nama}</p>
                          <Badge variant="outline">{p.kategori}</Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          {p.tanggal} • {p.terjual} terjual
                        </p>
                        <p className="text-blue-600 font-medium mt-1">
                          {formatRupiah(p.harga)}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        {statusBadge(p.status)}
                        <ExternalLink className="h-4 w-4" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="w-72 border-l bg-gray-50 p-4 space-y-3">
          <Input
            placeholder="Cari Semua Produk"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="space-y-2">
            {statusFilterBtns.map((btn) => (
              <button
                key={btn.value}
                onClick={() => setStatusFilter(btn.value)}
                className={cn(
                  "w-full py-2 rounded-md text-sm",
                  statusFilter === btn.value
                    ? "bg-blue-600 text-white"
                    : "bg-white border"
                )}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => window.open("/semua-produk/catalog", "_blank")}
            className="w-full bg-gray-800 text-white py-2 rounded-md flex justify-center gap-2"
          >
            KATALOG
            <ExternalLink className="h-4 w-4" />
          </button>

          <Button className="w-full bg-blue-600 text-white">
            + Buat Produk Baru
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}