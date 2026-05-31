import DashboardLayout from "@/components/dashboard/dashboardlayout";
import { Head, Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft } from "lucide-react";

type DetailTransaksi = {
  id: number;
  order_id: string;
  nama_pembeli: string;
  email_pembeli: string;
  no_hp_pembeli: string;
  status: "sukses" | "pending" | "gagal";
  tanggal: string;
  produk_nama: string;
  produk_jenis: string;
  penjual: string;
  redirect_url: string;
  harga_original: number;
  diskon: number;
  total_bayar: number;
  catatan?: string;
};

type Props = {
  detail: DetailTransaksi;
};

// Reusable cell for key-value styling matching the mockup
function DetailCell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border border-blue-200/60 rounded-lg overflow-hidden flex items-center h-11 text-xs md:text-sm bg-white shadow-sm">
      <div className="w-[170px] px-4 font-semibold text-gray-500 border-r border-blue-200/60 h-full flex items-center bg-transparent shrink-0">
        {label}
      </div>
      <div className="flex-grow px-4 font-medium text-gray-800 h-full flex items-center overflow-hidden truncate">
        {children}
      </div>
    </div>
  );
}

export default function TransaksiDetail({ detail }: Props) {
  const handlePrint = () => {
    window.print();
  };

  const formatRupiah = (val: number) => {
    return "Rp. " + new Intl.NumberFormat("id-ID").format(val);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "sukses":
        return { text: "Lunas", className: "text-[#008A2E] font-bold" };
      case "pending":
        return { text: "Pending", className: "text-amber-600 font-bold" };
      case "gagal":
        return { text: "Gagal", className: "text-rose-600 font-bold" };
      default:
        return { text: "-", className: "text-gray-500" };
    }
  };

  const statusStyle = getStatusStyle(detail.status);

  return (
    <DashboardLayout>
      <Head title={`Detail Transaksi - ${detail.order_id}`} />
      
      {/* Styles for printing */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />

      <div className="max-w-5xl mx-auto p-6 space-y-6">
        
        {/* Header / Breadcrumbs & Title */}
        <div className="flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <Link
              href="/transaksi"
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">
                <Link href="/transaksi" className="hover:text-gray-600 transition">
                  Transaksi
                </Link>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight font-sans">Detail Transaksi</h1>
            </div>
          </div>
          <div>
            <Button
              onClick={handlePrint}
              variant="ghost"
              className="bg-blue-50/70 hover:bg-blue-100 text-blue-600 font-bold px-4 py-2 h-10 rounded-lg flex items-center gap-2 text-xs transition border border-blue-100/50"
            >
              Ekspor Data <Download className="h-4 w-4 shrink-0" />
            </Button>
          </div>
        </div>

        {/* Main Printable Card Wrapper */}
        <div id="print-area" className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-8">
          
          {/* Section 1: Informasi Pelanggan */}
          <div className="space-y-4">
            <h3 className="text-base font-extrabold text-slate-800">Informasi Pelanggan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Column 1 */}
              <DetailCell label="Status Transaksi">
                <span className={statusStyle.className}>{statusStyle.text}</span>
              </DetailCell>
              
              <DetailCell label="Waktu Pembayaran">
                <span className="text-[#2563EB] font-medium">{detail.tanggal}</span>
              </DetailCell>
              
              <DetailCell label="Nama Pelanggan">
                <span className="text-slate-800 font-medium">{detail.nama_pembeli}</span>
              </DetailCell>

              {/* Column 2 */}
              <DetailCell label="Email Pelanggan">
                <span className="text-slate-800 font-medium">{detail.email_pembeli}</span>
              </DetailCell>
              
              <DetailCell label="No.Telp Pelanggan">
                <span className="text-slate-800 font-medium">{detail.no_hp_pembeli || "-"}</span>
              </DetailCell>
              
              <DetailCell label="Detail Pelanggan">
                <Link
                  href={`/pelanggan?search=${detail.email_pembeli}`}
                  className="text-[#2563EB] font-bold hover:underline"
                >
                  Lihat Detail
                </Link>
              </DetailCell>

            </div>
          </div>

          {/* Section 2: Informasi Produk */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-800">Informasi Produk</h3>
              <Link
                href={detail.redirect_url}
                className="text-xs font-bold text-[#2563EB] hover:underline no-print"
              >
                Lihat Detail
              </Link>
            </div>
            <div className="flex flex-col gap-4">
              
              <DetailCell label="Nama Produk">
                <span className="text-[#008A2E] font-bold">{detail.produk_nama}</span>
              </DetailCell>
              
              <DetailCell label="Kategori Produk">
                <span className="text-slate-800 font-medium">{detail.produk_jenis}</span>
              </DetailCell>
              
              <DetailCell label="Harga Produk">
                <span className="text-slate-800 font-semibold">{formatRupiah(detail.harga_original)}</span>
              </DetailCell>

            </div>
          </div>

          {/* Section 3: Informasi Pembayaran */}
          <div className="space-y-4 pt-2">
            <h3 className="text-base font-extrabold text-slate-800">Informasi Pembayaran</h3>
            <div className="border border-blue-200/80 rounded-xl p-5 md:p-6 bg-white shadow-xs">
              <h4 className="text-sm font-bold text-slate-800 mb-4">Informasi Pembayaran</h4>
              <div className="space-y-3">
                
                <div className="flex justify-between items-center text-xs md:text-sm text-slate-500 font-medium">
                  <span>Harga</span>
                  <span className="text-slate-700">{formatRupiah(detail.harga_original)}</span>
                </div>
                
                <div className="flex justify-between items-center text-xs md:text-sm text-slate-500 font-medium">
                  <span>Diskon</span>
                  <span className="text-slate-700">{formatRupiah(detail.diskon)}</span>
                </div>
                
                <div className="flex justify-between items-baseline pt-4 border-t border-slate-100">
                  <span className="text-base md:text-lg font-bold text-slate-800">Total</span>
                  <span className="text-xl md:text-2xl font-black text-slate-900">
                    {formatRupiah(detail.total_bayar)}
                  </span>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
