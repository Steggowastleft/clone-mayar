import DashboardLayout from "@/components/dashboard/dashboardlayout";
import { Head, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

type BundlingItem = {
  id: number;
  nama: string;
  tipe: string;
  harga: number;
  cover?: string;
};

type BundlingDetail = {
  id: number;
  nama: string;
  harga: number;
  harga_coret?: number;
  deskripsi?: string;
  cover_url?: string;
  tipe_pembayaran: string;
  tanggal_kadaluarsa?: string;
  pesan_setelah_bayar?: string;
  maksimal_pembayaran?: number;
  redirect_url?: string;
  bisa_affiliate: boolean;
  status: "published" | "unpublished";
  jumlah_terjual: number;
  items: BundlingItem[];
  registrasi_count: number;
};

type ShowProps = {
  bundling: BundlingDetail;
};

export default function Show({ bundling }: ShowProps) {
  const handleDelete = () => {
    if (confirm("Apakah Anda yakin ingin menghapus bundling ini?")) {
      router.delete(`/bundling/${bundling.id}`);
    }
  };

  const handleToggleStatus = () => {
    router.patch(`/bundling/${bundling.id}/status`, {});
  };

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

  return (
    <DashboardLayout title="Detail Bundling">
      <Head title={`${bundling.nama} - Detail Bundling`} />

      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.visit("/bundling")}
            className="text-blue-600 mb-4"
          >
            ← Kembali
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {bundling.nama}
              </h1>
              <p className="text-gray-600 mt-1">
                Lihat dan kelola detail bundling produk anda
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => router.visit(`/bundling/${bundling.id}/edit`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Hapus
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="col-span-2 space-y-6">
            {/* Status & Info */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Informasi Umum
                </h2>
                <div className="flex items-center gap-2">
                  {statusBadge(bundling.status)}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleToggleStatus}
                  >
                    {bundling.status === "published"
                      ? "Unpublish"
                      : "Publish"}
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Harga
                    </p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">
                      Rp {bundling.harga.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Tipe Pembayaran
                    </p>
                    <p className="text-lg font-semibold text-gray-800 mt-1 capitalize">
                      {bundling.tipe_pembayaran}
                    </p>
                  </div>
                </div>

                {bundling.harga_coret && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Harga Coret
                    </p>
                    <p className="text-sm line-through text-gray-500 mt-1">
                      Rp {bundling.harga_coret.toLocaleString("id-ID")}
                    </p>
                  </div>
                )}

                {bundling.deskripsi && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Deskripsi
                    </p>
                    <p className="text-gray-700 mt-2">{bundling.deskripsi}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Cover Image */}
            {bundling.cover_url && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Cover
                </h2>
                <img
                  src={bundling.cover_url}
                  alt={bundling.nama}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}

            {/* Products in Bundle */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Produk dalam Bundling ({bundling.items.length})
              </h2>
              <div className="space-y-3">
                {bundling.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-3 border border-gray-100 rounded-lg"
                  >
                    {item.cover && (
                      <img
                        src={item.cover}
                        alt={item.nama}
                        className="h-12 w-12 rounded object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{item.nama}</p>
                      <p className="text-xs text-gray-500">{item.tipe}</p>
                    </div>
                    <p className="font-semibold text-gray-800">
                      Rp {item.harga.toLocaleString("id-ID")}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Settings */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Pengaturan Tambahan
              </h2>
              <div className="space-y-4">
                {bundling.tanggal_kadaluarsa && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Tanggal Kadaluarsa
                    </p>
                    <p className="text-gray-800 mt-1">
                      {format(
                        new Date(bundling.tanggal_kadaluarsa),
                        "dd MMMM yyyy",
                        { locale: idLocale }
                      )}
                    </p>
                  </div>
                )}

                {bundling.maksimal_pembayaran && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Maksimal Pembayaran
                    </p>
                    <p className="text-gray-800 mt-1">
                      {bundling.maksimal_pembayaran} unit
                    </p>
                  </div>
                )}

                {bundling.redirect_url && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Redirect URL
                    </p>
                    <p className="text-gray-800 mt-1 break-all text-sm">
                      {bundling.redirect_url}
                    </p>
                  </div>
                )}

                {bundling.pesan_setelah_bayar && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Pesan Setelah Bayar
                    </p>
                    <p className="text-gray-800 mt-1">
                      {bundling.pesan_setelah_bayar}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Bisa Affiliate
                  </p>
                  <p className="text-gray-800 mt-1">
                    {bundling.bisa_affiliate ? "Ya" : "Tidak"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Statistics */}
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Jumlah Penjualan
              </p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {bundling.jumlah_terjual}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Paket terjual hingga saat ini
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Total Registrasi
              </p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {bundling.registrasi_count}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Pembeli yang mendaftar
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Total Produk
              </p>
              <p className="text-3xl font-bold text-gray-800 mt-2">
                {bundling.items.length}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Produk dalam bundling
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
