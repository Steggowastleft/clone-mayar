import { Head, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import DashboardLayout from "@/components/dashboard/dashboardlayout";
import {
  ArrowLeft,
  Edit,
  ExternalLink,
  Trash2,
  Package,
  Copy,
  Calendar,
  Clock,
  MapPin,
  Link2,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Product = {
  id: number;
  nama: string;
  slug?: string;
  cover?: string;
  cover_url?: string;
  thumbnail?: string;
  harga?: number;
  status?: string;
  deskripsi?: string;
  url?: string;
  peserta?: number;
  max_peserta?: number;
  tanggal_mulai?: string;
  tanggal_selesai?: string;
  created_at?: string;
  lokasi?: string;
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
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  event: {
    label: "Event",
    editRoute: "event.edit",
    listRoute: "event.index",
    color: "bg-purple-100 text-purple-700 border-purple-200",
  },
  bootcamp: {
    label: "Bootcamp",
    editRoute: "bootcamp.edit",
    listRoute: "bootcamp.index",
    color: "bg-green-100 text-green-700 border-green-200",
  },
  "kelas-online": {
    label: "Kelas Online",
    editRoute: "kelas-online.edit",
    listRoute: "kelas-online.index",
    color: "bg-indigo-100 text-indigo-700 border-indigo-200",
  },
  "produk-digital": {
    label: "Produk Digital",
    editRoute: "produk-digital.show",
    listRoute: "produk-digital.index",
    color: "bg-orange-100 text-orange-700 border-orange-200",
  },
  "payment-link": {
    label: "Link Pembayaran",
    editRoute: "payment-link.index",
    listRoute: "payment-link.index",
    color: "bg-red-100 text-red-700 border-red-200",
  },
};

const getDetailRoute = (type: string, id: number) => {
  switch (type) {
    case "webinar":
      return `/webinar/${id}`;
    case "event":
      return `/event/${id}`;
    case "bootcamp":
      return `/bootcamps/${id}`;
    case "kelas-online":
      return `/kelas-online/${id}`;
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
    case "aktif":
      return "bg-green-50 text-green-700 border-green-200";
    case "unpublished":
      return "bg-yellow-50 text-yellow-750 border-yellow-200";
    case "unlisted":
    case "dibatalkan":
      return "bg-gray-50 text-gray-700 border-gray-200";
    case "draft":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "selesai":
      return "bg-slate-50 text-slate-700 border-slate-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};

const formatRupiah = (value: number) => {
  return "Rp " + new Intl.NumberFormat("id-ID").format(value);
};

const getCoverUrl = (product: Product) => {
  if (product.cover_url) {
    return product.cover_url.startsWith("http") ? product.cover_url : `/storage/${product.cover_url}`;
  }
  if (product.cover) {
    return product.cover.startsWith("http") ? product.cover : `/storage/${product.cover}`;
  }
  if (product.thumbnail) {
    return product.thumbnail.startsWith("http") ? product.thumbnail : `/storage/${product.thumbnail}`;
  }
  return null;
};

const getCheckoutUrl = (type: string, id: number) => {
  const typeMap: Record<string, string> = {
    "produk-digital": "digital",
    "webinar": "webinar",
    "event": "event",
    "bootcamp": "bootcamp",
    "kelas-online": "kelas_online",
    "payment-link": "payment_link",
    "coaching-mentoring": "coaching_mentoring",
    "penggalangan-dana": "penggalangan_dana",
    "tulisan": "tulisan",
  };
  const typeKey = typeMap[type] || type;
  return `${window.location.origin}/p/${id}/${typeKey}`;
};

const getProductPageUrl = (type: string, slug?: string) => {
  if (!slug) return null;
  const pathMap: Record<string, string> = {
    "produk-digital": "produk",
    "webinar": "webinar",
    "event": "event",
    "bootcamp": "bootcamp",
    "kelas-online": "kelas-online",
    "payment-link": "payment-link",
    "coaching-mentoring": "coaching-mentoring",
    "penggalangan-dana": "donasi",
    "tulisan": "tulisan",
  };
  const path = pathMap[type] || type;
  return `${window.location.origin}/${path}/${slug}`;
};

export default function ProductShow({ product, type }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);
  const config = typeConfig[type] || {
    label: type.replace("-", " ").toUpperCase(),
    editRoute: "semua-produk.edit",
    listRoute: "semua-produk.index",
    color: "bg-slate-100 text-slate-700 border-slate-200",
  };

  const detailRoute = getDetailRoute(type, product.id);
  const coverUrl = getCoverUrl(product);

  const checkoutUrl = getCheckoutUrl(type, product.id);
  const productPageUrl = getProductPageUrl(type, product.slug || product.name || product.nama);

  const handleDelete = () => {
    if (confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
      setIsDeleting(true);
      router.delete(`/semua-produk/${type}:${product.id}`, {
        onFinish: () => setIsDeleting(false),
      });
    }
  };

  // Compile detail rows
  const detailRows = [
    {
      label: "Status",
      value: (
        <span
          className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
            statusColor(product.status || "unpublished")
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full mr-1.5",
              product.status === "published" || product.status === "aktif"
                ? "bg-green-500"
                : product.status === "draft"
                ? "bg-blue-500"
                : "bg-yellow-500"
            )}
          />
          {product.status ? product.status.toUpperCase() : "UNPUBLISHED"}
        </span>
      ),
    },
    {
      label: "Tipe Produk",
      value: (
        <Badge className={cn("text-xs font-semibold border px-2 py-0.5 rounded-full", config.color)} variant="outline">
          {config.label}
        </Badge>
      ),
    },
    {
      label: "Nama Produk",
      value: <span className="font-bold text-slate-800">{product.nama || product.name}</span>,
    },
  ];

  if (product.harga !== undefined) {
    detailRows.push({
      label: "Harga",
      value: (
        <span className="font-extrabold text-blue-600 text-sm">
          {product.harga > 0 ? formatRupiah(product.harga) : "Gratis"}
        </span>
      ),
    });
  }

  if (product.deskripsi) {
    detailRows.push({
      label: "Deskripsi",
      value: (
        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
          {product.deskripsi}
        </p>
      ),
    });
  }

  if (product.url) {
    detailRows.push({
      label: "URL",
      value: (
        <a
          href={product.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline flex items-center gap-1.5 w-fit font-semibold"
        >
          {product.url}
          <ExternalLink className="h-3 w-3" />
        </a>
      ),
    });
  }

  if (product.lokasi) {
    detailRows.push({
      label: "Lokasi",
      value: <span className="font-semibold text-slate-700">{product.lokasi}</span>,
    });
  }

  if (product.peserta !== undefined) {
    detailRows.push({
      label: "Total Peserta",
      value: <span className="font-semibold text-slate-700">{product.peserta} Orang</span>,
    });
  }

  if (product.max_peserta !== undefined) {
    detailRows.push({
      label: "Kuota Maksimal",
      value: <span className="font-semibold text-slate-700">{product.max_peserta || "Unlimited"}</span>,
    });
  }

  if (product.tanggal_mulai) {
    detailRows.push({
      label: "Tanggal Mulai",
      value: (
        <span className="font-semibold text-slate-700">
          {new Date(product.tanggal_mulai).toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      ),
    });
  }

  if (product.tanggal_selesai) {
    detailRows.push({
      label: "Tanggal Selesai",
      value: (
        <span className="font-semibold text-slate-700">
          {new Date(product.tanggal_selesai).toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      ),
    });
  }

  const formattedDate = product.created_at
    ? new Date(product.created_at).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

  return (
    <DashboardLayout>
      <Head title={product.nama || product.name} />

      <div className="p-6 bg-slate-50/20 min-h-screen">
        {/* Breadcrumbs / Back button + Title */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={() => router.visit("/semua-produk")}
              className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-1 hover:text-slate-600 transition"
            >
              <ArrowLeft className="h-3 w-3" />
              Kembali ke Daftar
            </button>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              {product.nama || product.name}
            </h1>
          </div>
          
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center gap-1.5"
            onClick={() => router.visit("/semua-produk/create")}
          >
            + Tambah Produk
          </Button>
        </div>

        {/* Content Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column: Spec card */}
          <div className="flex-1 min-w-0 space-y-6">
            
            {/* Share Links Card */}
            <div className="bg-white border border-blue-100 rounded-xl shadow-sm p-6 space-y-4">
              <h3 className="text-base font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
                <Link2 className="h-4 w-4 text-blue-500" />
                Bagi Tautan untuk Menerima Order
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tautan Pembayaran (Checkout)</span>
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value={checkoutUrl}
                      className="bg-slate-50/50 border-slate-200 text-xs font-semibold text-slate-600 select-all"
                    />
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(checkoutUrl);
                        toast.success("Tautan pembayaran berhasil disalin!");
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3"
                      size="sm"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {productPageUrl && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Halaman Detail Produk</span>
                    <div className="flex gap-2">
                      <Input
                        readOnly
                        value={productPageUrl}
                        className="bg-slate-50/50 border-slate-200 text-xs font-semibold text-slate-600 select-all"
                      />
                      <Button
                        onClick={() => {
                          navigator.clipboard.writeText(productPageUrl);
                          toast.success("Tautan halaman produk berhasil disalin!");
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3"
                        size="sm"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Spec Sheet Table */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden p-6">
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <tbody className="divide-y divide-slate-200">
                    {detailRows.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/20 transition">
                        <td className="px-5 py-4 text-xs font-bold text-slate-550 w-56 border-r border-slate-200 bg-slate-50/30 whitespace-nowrap">
                          {row.label}
                        </td>
                        <td className="px-5 py-4 text-xs font-medium text-slate-700">
                          {row.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Centered Created At */}
              <div className="text-center py-3 border border-blue-150 rounded-lg text-blue-650 font-bold bg-white mt-5 text-xs">
                Dibuat {formattedDate}
              </div>
            </div>
          </div>

          {/* Right Column: Actions and Cover */}
          <div className="w-full lg:w-80 shrink-0 space-y-6">
            
            {/* Cover Image Block */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt={product.nama || product.name}
                  className="w-full h-auto object-cover aspect-[3/4]"
                />
              ) : (
                <div className="w-full aspect-[3/4] bg-slate-100 flex flex-col items-center justify-center text-slate-450 border-b p-6">
                  <Package className="h-12 w-12 text-slate-300 mb-3 animate-pulse" />
                  <span className="text-xs font-extrabold tracking-wider">Belum Ada Cover</span>
                </div>
              )}
            </div>

            {/* Actions Card */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-2.5 border-b border-slate-100">
                Tindakan Produk
              </h3>

              {/* Status Badge Display */}
              <div className="py-2.5 bg-slate-50 rounded-lg border border-slate-200/60 text-center">
                <span className="text-[10px] font-bold text-slate-400 block mb-0.5">STATUS SAAT INI</span>
                <span className="text-xs font-extrabold text-slate-800 uppercase">
                  {product.status || "UNPUBLISHED"}
                </span>
              </div>

              {/* Action buttons */}
              <div className="space-y-2.5">
                {detailRoute && (
                  <button
                    onClick={() => router.visit(detailRoute)}
                    className="w-full py-2 bg-white border border-blue-500 text-blue-600 font-extrabold text-xs tracking-wider rounded-lg hover:bg-blue-50 transition uppercase flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Buka Detail Halaman
                  </button>
                )}

                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full py-2 bg-white border border-red-500 text-red-600 font-extrabold text-xs tracking-wider rounded-lg hover:bg-red-50 transition uppercase flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Hapus Produk
                </button>

                <button
                  onClick={() => router.visit("/semua-produk")}
                  className="w-full py-2 bg-white border border-slate-800 text-slate-800 font-extrabold text-xs tracking-wider rounded-lg hover:bg-slate-50 transition uppercase flex items-center justify-center gap-1.5"
                >
                  Kembali
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
