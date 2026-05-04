import { Head, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/dashboard/dashboardlayout";
import {
  ArrowLeft,
  Edit,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type Product = {
  id: number;
  nama: string;
  [key: string]: any;
};

type Props = {
  product: Product;
  type: string;
};

const typeConfig: Record<string, {
  label: string;
  editRoute: string;
  listRoute: string;
  color: string;
}> = {
  webinar: {
    label: "Webinar",
    editRoute: "webinar.edit",
    listRoute: "webinar.index",
    color: "bg-blue-100 text-blue-700",
  },
  event: {
    label: "Event",
    editRoute: "event.edit",
    listRoute: "event.index",
    color: "bg-purple-100 text-purple-700",
  },
  bootcamp: {
    label: "Kelas Online",
    editRoute: "bootcamp.edit",
    listRoute: "bootcamp.index",
    color: "bg-green-100 text-green-700",
  },
  "produk-digital": {
    label: "Produk Digital",
    editRoute: "produk-digital.show",
    listRoute: "produk-digital.index",
    color: "bg-orange-100 text-orange-700",
  },
  "payment-link": {
    label: "Link Pembayaran",
    editRoute: "payment-link.index",
    listRoute: "payment-link.index",
    color: "bg-red-100 text-red-700",
  },
};

const getDetailRoute = (type: string, id: number) => {
  switch (type) {
    case "webinar":
      return `/webinar/${id}`;
    case "event":
      return `/event/${id}`;
    case "bootcamp":
      return `/bootcamp/catalog`;
    case "produk-digital":
      return `/produk-digital/${id}`;
    case "payment-link":
      return `/payment-link/${id}`;
    default:
      return null;
  }
};

const statusColor = (status: string) => {
  switch (status) {
    case "published":
      return "bg-green-100 text-green-700";
    case "unpublished":
      return "bg-yellow-100 text-yellow-700";
    case "unlisted":
      return "bg-gray-100 text-gray-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const formatRupiah = (value: number) => {
  return "Rp " + new Intl.NumberFormat("id-ID").format(value);
};

export default function ProductShow({ product, type }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);
  const config = typeConfig[type] || typeConfig.webinar;
  const detailRoute = getDetailRoute(type, product.id);

  const handleDelete = () => {
    if (confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
      setIsDeleting(true);
      router.delete(`/semua-produk/${type}:${product.id}`, {
        onFinish: () => setIsDeleting(false),
      });
    }
  };

  return (
    <DashboardLayout>
      <Head title={product.nama} />
      <div className="flex gap-0 min-h-screen">
        <div className="flex-1 p-6">
          <Button
            variant="ghost"
            onClick={() => router.visit("/semua-produk")}
            className="mb-6 text-gray-600"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>

          <div className="max-w-4xl">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Badge className={cn("text-sm", config.color)}>
                    {config.label}
                  </Badge>
                  <Badge className={cn("text-sm", statusColor(product.status || "unpublished"))}>
                    {product.status || "Unpublished"}
                  </Badge>
                </div>
                <h1 className="text-3xl font-bold text-gray-800">{product.nama}</h1>
              </div>
              <div className="flex gap-2">
                {detailRoute && (
                  <Button
                    variant="outline"
                    onClick={() => router.visit(detailRoute)}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Buka Detail
                  </Button>
                )}
                <Button
                  variant="destructive"
                  disabled={isDeleting}
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus
                </Button>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">Informasi Produk</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nama */}
                <div>
                  <label className="text-sm font-medium text-gray-600">Nama Produk</label>
                  <p className="mt-1 text-gray-800">{product.nama}</p>
                </div>

                {/* Tipe */}
                <div>
                  <label className="text-sm font-medium text-gray-600">Tipe</label>
                  <p className="mt-1 text-gray-800">{config.label}</p>
                </div>

                {/* Harga */}
                {product.harga !== undefined && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Harga</label>
                    <p className="mt-1 text-gray-800 font-medium text-blue-600">
                      {formatRupiah(product.harga)}
                    </p>
                  </div>
                )}

                {/* Status */}
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <p className="mt-1">
                    <Badge className={cn("text-xs", statusColor(product.status || "unpublished"))}>
                      {product.status || "Unpublished"}
                    </Badge>
                  </p>
                </div>

                {/* Deskripsi */}
                {product.deskripsi && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-600">Deskripsi</label>
                    <p className="mt-1 text-gray-800 text-sm leading-relaxed">
                      {product.deskripsi}
                    </p>
                  </div>
                )}

                {/* URL */}
                {product.url && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-600">URL</label>
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 text-blue-600 hover:underline flex items-center gap-2 w-fit"
                    >
                      {product.url}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}

                {/* Peserta */}
                {product.peserta !== undefined && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Peserta</label>
                    <p className="mt-1 text-gray-800">{product.peserta}</p>
                  </div>
                )}

                {/* Max Peserta */}
                {product.max_peserta !== undefined && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Max Peserta</label>
                    <p className="mt-1 text-gray-800">
                      {product.max_peserta || "Unlimited"}
                    </p>
                  </div>
                )}

                {/* Tanggal Mulai */}
                {product.tanggal_mulai && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Tanggal Mulai</label>
                    <p className="mt-1 text-gray-800">
                      {new Date(product.tanggal_mulai).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                )}

                {/* Tanggal Selesai */}
                {product.tanggal_selesai && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Tanggal Selesai</label>
                    <p className="mt-1 text-gray-800">
                      {new Date(product.tanggal_selesai).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                )}

                {/* Created At */}
                <div>
                  <label className="text-sm font-medium text-gray-600">Dibuat Pada</label>
                  <p className="mt-1 text-gray-800">
                    {product.created_at
                      ? new Date(product.created_at).toLocaleDateString("id-ID", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </p>
                </div>
              </div>

              {detailRoute && (
                <div className="mt-8 pt-6 border-t">
                  <p className="text-sm text-gray-600 mb-4">
                    Untuk mengedit produk ini secara detail, buka halaman detail produk.
                  </p>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => router.visit(detailRoute)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit di Halaman Detail
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
