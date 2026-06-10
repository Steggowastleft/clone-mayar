import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  FileText, 
  ChevronLeft, 
  Printer, 
  Search, 
  ArrowRight,
  TrendingUp,
  Receipt,
  User,
  Calendar,
  CreditCard,
  CheckCircle2
} from "lucide-react";

type PurchasedProductItem = {
  id: number;
  name: string;
  cover_url?: string;
  kategori: string;
  type: string;
  status: string;
  tanggal_aktif: string;
  rating?: number | null;
  download_url?: string;
  owner_name?: string;
  batch?: string;
  order_id?: string | null;
  harga_bayar?: number;
};

type Peserta = {
  id: number;
  nama: string;
  email: string;
  no_hp?: string;
  foto_url?: string;
};

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  peserta: Peserta;
  purchasedProducts: PurchasedProductItem[];
};

export default function InvoiceDialog({
  open,
  onOpenChange,
  peserta,
  purchasedProducts = []
}: Props) {
  const [selectedItem, setSelectedItem] = useState<PurchasedProductItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const handlePrint = () => {
    window.print();
  };

  // Filter transactions
  const filteredProducts = purchasedProducts.filter(item => {
    const term = searchQuery.toLowerCase();
    const nameMatch = item.name.toLowerCase().includes(term);
    const orderIdMatch = item.order_id ? item.order_id.toLowerCase().includes(term) : false;
    const catMatch = item.kategori.toLowerCase().includes(term);
    return nameMatch || orderIdMatch || catMatch;
  });

  return (
    <Dialog open={open} onOpenChange={(v) => {
      onOpenChange(v);
      if (!v) {
        // Reset state on close
        setSelectedItem(null);
        setSearchQuery("");
      }
    }}>
      <DialogContent className="max-w-3xl w-full max-h-[85vh] overflow-y-auto p-0 border border-slate-200 shadow-2xl rounded-2xl bg-slate-50/50">
        
        {/* Style block for clean receipt printing */}
        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            #receipt-print-area, #receipt-print-area * {
              visibility: visible;
            }
            #receipt-print-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              box-shadow: none !important;
              border: none !important;
              background: white !important;
              color: black !important;
            }
            .no-print {
              display: none !important;
            }
            /* Reset modal content wrapper heights/scrolls for printing */
            div[role="dialog"] {
              overflow: visible !important;
              max-height: none !important;
              box-shadow: none !important;
            }
          }
        `}</style>

        {!selectedItem ? (
          // ── TRANSACTION LIST VIEW ──
          <div className="flex flex-col h-full">
            <DialogHeader className="p-6 bg-white border-b border-slate-100 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100">
                  <Receipt className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-black text-slate-850">Faktur & Struk Belanja</DialogTitle>
                  <p className="text-xs text-slate-400">Riwayat transaksi pembelian produk digital dan kelas online Anda.</p>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative mt-4">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari transaksi berdasarkan nama produk, order ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs outline-none focus:border-blue-600 focus:bg-white transition"
                />
              </div>
            </DialogHeader>

            <div className="p-6 space-y-3 overflow-y-auto">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
                  <FileText className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-500">Tidak ada riwayat transaksi ditemukan</p>
                  <p className="text-[10px] text-slate-400 mt-1">Ganti kata kunci pencarian atau beli produk terlebih dahulu.</p>
                </div>
              ) : (
                filteredProducts.map((item) => {
                  const hasOrder = !!item.order_id;
                  const orderDisplay = item.order_id || `ORD-FREE-${item.id}`;
                  const isFree = !item.harga_bayar || item.harga_bayar <= 0;
                  const displayPrice = isFree ? "Gratis" : formatRupiah(item.harga_bayar || 0);

                  return (
                    <div
                      key={`${item.type}-${item.id}`}
                      className="bg-white border border-slate-100 hover:border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition shadow-sm hover:shadow-md"
                    >
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[9px] font-black tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 uppercase border border-slate-200/50">
                            {item.kategori}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">
                            {item.tanggal_aktif}
                          </span>
                        </div>
                        <h4 className="text-xs font-extrabold text-slate-850 line-clamp-1">{item.name}</h4>
                        <p className="text-[10px] font-mono text-slate-450">ID: {orderDisplay}</p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-50">
                        <div className="text-left sm:text-right">
                          <p className="text-[10px] font-bold text-slate-400">Total Bayar</p>
                          <p className={`text-xs font-black ${isFree ? "text-emerald-600" : "text-slate-800"}`}>
                            {displayPrice}
                          </p>
                        </div>
                        
                        <button
                          onClick={() => setSelectedItem(item)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl text-[10px] font-bold transition shadow-sm"
                        >
                          <span>Lihat Struk</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          // ── DETAILED PREMIUM RECEIPT VIEW ──
          <div className="flex flex-col">
            <DialogHeader className="p-4 bg-white border-b border-slate-100 flex flex-row items-center justify-between sticky top-0 z-10 no-print">
              <button
                onClick={() => setSelectedItem(null)}
                className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
              >
                <ChevronLeft className="h-4 w-4" />
                Kembali ke Daftar
              </button>
              
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-100"
              >
                <Printer className="h-3.5 w-3.5" />
                Cetak Struk
              </button>
            </DialogHeader>

            {/* Receipt Content Area */}
            <div className="p-6 flex justify-center bg-slate-50/50">
              <div 
                id="receipt-print-area"
                className="bg-white border border-slate-200 shadow-xl rounded-2xl w-full max-w-xl p-8 relative overflow-hidden"
              >
                {/* LUNAS Watermark stamp */}
                <div className="absolute right-8 top-8 select-none pointer-events-none">
                  <div className="border-4 border-double border-emerald-500/70 text-emerald-500/70 font-black px-4 py-1.5 rounded-xl uppercase tracking-widest text-sm -rotate-12">
                    LUNAS
                  </div>
                </div>

                {/* Receipt Header */}
                <div className="text-center pb-6 border-b border-dashed border-slate-200">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Receipt className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="font-black text-slate-850 text-sm tracking-tight">BiinsCart</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Invoice Belanja & Konfirmasi Akses Layanan</p>
                  <p className="text-[9px] text-slate-350 mt-0.5">Jakarta, Indonesia · support@biinscart.com</p>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4 py-6 border-b border-slate-100">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">ID Transaksi</span>
                    <span className="text-xs font-mono font-bold text-slate-800">{selectedItem.order_id || `ORD-FREE-${selectedItem.id}`}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Tanggal Pembelian</span>
                    <span className="text-xs font-bold text-slate-800">{selectedItem.tanggal_aktif}</span>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="py-6 border-b border-slate-100 space-y-2">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <User className="h-3 w-3 text-blue-600" /> Informasi Pembeli
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Nama</span>
                      <span className="font-bold text-slate-800">{peserta.nama}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px]">Email</span>
                      <span className="font-bold text-slate-800">{peserta.email}</span>
                    </div>
                    {peserta.no_hp && (
                      <div className="col-span-2 pt-1 border-t border-slate-50 mt-1">
                        <span className="text-slate-400 block text-[10px]">No. WhatsApp</span>
                        <span className="font-bold text-slate-800">{peserta.no_hp}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Items Bought */}
                <div className="py-6 border-b border-slate-100 space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="h-3 w-3 text-blue-600" /> Rincian Produk
                  </h4>
                  
                  <div className="bg-slate-50 rounded-xl p-4 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-600 uppercase">
                        {selectedItem.kategori}
                      </span>
                      <h5 className="text-xs font-extrabold text-slate-850 mt-2.5 leading-snug">{selectedItem.name}</h5>
                      {(selectedItem.owner_name || selectedItem.batch) && (
                        <p className="text-[10px] text-slate-400 font-medium">
                          {selectedItem.owner_name ? `Instruktur: ${selectedItem.owner_name}` : `Batch: ${selectedItem.batch}`}
                        </p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-slate-800">
                        {(!selectedItem.harga_bayar || selectedItem.harga_bayar <= 0) 
                          ? "Gratis" 
                          : formatRupiah(selectedItem.harga_bayar - (selectedItem.harga_bayar > 5000 ? 5000 : 0))
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {/* Price Summary Breakdown */}
                <div className="py-6 space-y-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <CreditCard className="h-3 w-3 text-blue-600" /> Ringkasan Pembayaran
                  </h4>

                  {(() => {
                    const isFree = !selectedItem.harga_bayar || selectedItem.harga_bayar <= 0;
                    const paidAmount = selectedItem.harga_bayar || 0;
                    const fee = isFree ? 0 : 5000;
                    const basePrice = isFree ? 0 : (paidAmount - fee);

                    return (
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between text-slate-500">
                          <span>Harga Produk</span>
                          <span>{isFree ? "Rp 0" : formatRupiah(basePrice)}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>Biaya Layanan & Admin</span>
                          <span>{isFree ? "Rp 0" : formatRupiah(fee)}</span>
                        </div>
                        <div className="flex justify-between text-slate-550 pt-2 border-t border-slate-100 font-extrabold">
                          <span className="text-slate-850 text-sm">Total Pembayaran</span>
                          <span className="text-blue-600 text-sm">{isFree ? "Gratis" : formatRupiah(paidAmount)}</span>
                        </div>
                        
                        <div className="pt-4 flex items-center gap-2 justify-center text-[10px] text-emerald-600 font-bold bg-emerald-50/70 border border-emerald-100 rounded-xl py-2 px-3">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Status Transaksi: Pembayaran Berhasil & Akses Produk Aktif</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Footer Notes */}
                <div className="text-center pt-6 border-t border-dashed border-slate-200 mt-4">
                  <p className="text-[9px] text-slate-400">Terima kasih telah berbelanja di BiinsCart.</p>
                  <p className="text-[9px] text-slate-350 mt-1">Struk ini sah sebagai bukti pembayaran dan pendaftaran produk digital.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
