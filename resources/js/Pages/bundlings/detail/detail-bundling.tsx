import { type Bundling } from "../show";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export default function TabDetail({ bundling }: { bundling: Bundling }) {
  return (
    <div className="space-y-6">
      {/* Main Info */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
            Harga
          </p>
          <p className="text-2xl font-bold text-gray-800 mt-2">
            Rp {bundling.harga.toLocaleString("id-ID")}
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
            Tipe Pembayaran
          </p>
          <p className="text-lg font-semibold text-gray-800 mt-2 capitalize">
            {bundling.tipe_pembayaran}
          </p>
        </div>
      </div>

      {bundling.harga_coret && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
            Harga Coret
          </p>
          <p className="text-lg line-through text-gray-500 mt-2">
            Rp {bundling.harga_coret.toLocaleString("id-ID")}
          </p>
        </div>
      )}

      {/* Deskripsi */}
      {bundling.deskripsi && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">
            Deskripsi
          </p>
          <p className="text-gray-700 whitespace-pre-wrap">
            {bundling.deskripsi}
          </p>
        </div>
      )}

      {/* Cover */}
      {bundling.cover_url && (
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-3">
            Cover Bundling
          </p>
          <img
            src={bundling.cover_url}
            alt={bundling.nama}
            className="w-full h-80 object-cover rounded-lg"
          />
        </div>
      )}

      {/* Produk dalam Bundling */}
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-3">
          Produk dalam Bundling ({bundling.items.length})
        </p>
        <div className="space-y-2">
          {bundling.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              {item.cover && (
                <img
                  src={item.cover}
                  alt={item.nama}
                  className="h-16 w-16 rounded object-cover"
                />
              )}
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{item.nama}</p>
                <p className="text-xs text-gray-500">{item.tipe}</p>
              </div>
              <p className="font-semibold text-gray-800 text-right">
                Rp {item.harga.toLocaleString("id-ID")}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Pengaturan Tambahan */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
          Pengaturan Tambahan
        </p>

        <div className="grid grid-cols-2 gap-4">
          {bundling.tanggal_kadaluarsa && (
            <div>
              <p className="text-xs text-gray-500">Tanggal Kadaluarsa</p>
              <p className="font-medium text-gray-800 mt-1">
                {format(new Date(bundling.tanggal_kadaluarsa), "dd MMM yyyy", {
                  locale: idLocale,
                })}
              </p>
            </div>
          )}

          {bundling.maksimal_pembayaran && (
            <div>
              <p className="text-xs text-gray-500">Maks. Pembayaran</p>
              <p className="font-medium text-gray-800 mt-1">
                {bundling.maksimal_pembayaran} unit
              </p>
            </div>
          )}

          <div>
            <p className="text-xs text-gray-500">Bisa Affiliate</p>
            <p className="font-medium text-gray-800 mt-1">
              {bundling.bisa_affiliate ? "✓ Ya" : "✗ Tidak"}
            </p>
          </div>
        </div>

        {bundling.redirect_url && (
          <div>
            <p className="text-xs text-gray-500">Redirect URL</p>
            <p className="font-medium text-gray-800 mt-1 text-sm break-all">
              {bundling.redirect_url}
            </p>
          </div>
        )}

        {bundling.pesan_setelah_bayar && (
          <div>
            <p className="text-xs text-gray-500">Pesan Setelah Bayar</p>
            <p className="font-medium text-gray-800 mt-1 text-sm whitespace-pre-wrap">
              {bundling.pesan_setelah_bayar}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
