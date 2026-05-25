import { ArrowUpRight, Star, MessageCircle, ArrowRight, Wallet, Package } from "lucide-react";
import { router } from "@inertiajs/react";

interface Transaction {
  id: string | number;
  type: "income" | "expense" | "refund";
  title: string;
  amount: string | number;
  date: string;
  penjual?: string;
}

interface Review {
  id: string | number;
  productName: string;
  reviewer: string;
  rating: number;
  comment: string;
  date: string;
}

interface Product {
  id: string;
  product_id: number;
  type: string;
  nama: string;
  kategori: string;
  harga: number;
  status: string;
  terjual: number;
  tanggal: string;
}

interface SideCardProps {
  transactionTitle?: string;
  transactions?: Transaction[];
  reviewTitle?: string;
  reviews?: Review[];
  products?: Product[];
  isLoadingTransactions?: boolean;
  isLoadingReviews?: boolean;
  isLoadingProducts?: boolean;
}

const typeConfig = {
  income: { label: "Masuk", bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-400", sign: "+" },
  refund: { label: "Refund", bg: "bg-orange-50", text: "text-orange-600", dot: "bg-orange-400", sign: "-" },
  expense: { label: "Keluar", bg: "bg-red-50", text: "text-red-500", dot: "bg-red-400", sign: "-" },
};

export function SideCard({
  transactionTitle = "Transaksi Terbaru",
  transactions = [],
  reviewTitle = "Ulasan Terbaru",
  reviews = [],
  products = [],
  isLoadingTransactions = false,
  isLoadingReviews = false,
  isLoadingProducts = false,
}: SideCardProps) {
  return (
    <div className="space-y-5">
      {/* ── Transactions Card ── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">{transactionTitle}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">{transactions.length} transaksi terakhir</p>
          </div>
          <button className="text-[11px] text-blue-600 font-semibold flex items-center gap-1 hover:underline">
            Lihat semua <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        <div className="p-3">
          {isLoadingTransactions ? (
            <div className="space-y-2 p-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Wallet className="h-8 w-8 text-slate-200 mb-2" />
              <p className="text-xs font-medium text-slate-400">Belum ada transaksi</p>
            </div>
          ) : (
            <div className="space-y-1">
              {transactions.map((trx) => {
                const cfg = typeConfig[trx.type] ?? typeConfig.income;
                return (
                  <div key={trx.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                    {/* Icon dot */}
                    <div className={`w-8 h-8 rounded-full ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                      <ArrowUpRight className={`h-3.5 w-3.5 ${cfg.text} ${trx.type !== "income" ? "rotate-180" : ""}`} />
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{trx.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {trx.date} &bull; <span className="text-slate-500 font-medium">{trx.penjual ?? "Admin"}</span>
                      </p>
                    </div>
                    {/* Amount */}
                    <div className={`text-xs font-bold ${cfg.text} flex-shrink-0`}>
                      {cfg.sign}
                      {typeof trx.amount === "number"
                        ? `Rp ${trx.amount.toLocaleString("id-ID")}`
                        : trx.amount}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Reviews Card ── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">{reviewTitle}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">{reviews.length} ulasan terbaru</p>
          </div>
          <MessageCircle className="h-4 w-4 text-slate-300" />
        </div>

        <div className="p-3">
          {isLoadingReviews ? (
            <div className="space-y-2 p-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Star className="h-8 w-8 text-slate-200 mb-2" />
              <p className="text-xs font-medium text-slate-400">Belum ada ulasan</p>
            </div>
          ) : (
            <div className="space-y-1">
              {reviews.map((rv) => (
                <div key={rv.id} className="p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{rv.productName}</p>
                      <p className="text-[11px] text-slate-400">{rv.reviewer}</p>
                    </div>
                    <div className="flex gap-0.5 flex-shrink-0">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${i < rv.rating ? "fill-amber-400 text-amber-400" : "text-slate-200 fill-slate-200"}`}
                        />
                      ))}
                    </div>
                  </div>
                  {rv.comment && (
                    <p className="text-[11px] text-slate-500 line-clamp-2 italic">"{rv.comment}"</p>
                  )}
                  <p className="text-[10px] text-slate-300 mt-1.5">{rv.date}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Semua Produk Card ── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Semua Produk</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">{products.length} produk tersedia</p>
          </div>
          <button
            onClick={() => router.visit("/semua-produk")}
            className="text-[11px] text-blue-600 font-semibold flex items-center gap-1 hover:underline"
          >
            Lihat semua <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        <div className="p-3">
          {isLoadingProducts ? (
            <div className="space-y-2 p-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Package className="h-8 w-8 text-slate-200 mb-2" />
              <p className="text-xs font-medium text-slate-400">Belum ada produk</p>
            </div>
          ) : (
            <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1">
              {products.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => router.visit(`/semua-produk/${prod.id}`)}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  {/* Category initials badge */}
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold text-[10px] uppercase">
                    {prod.kategori ? prod.kategori.substring(0, 2) : "PR"}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{prod.nama}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {prod.kategori} &bull; {prod.terjual ?? 0} terjual
                    </p>
                  </div>
                  {/* Price */}
                  <div className="text-xs font-bold text-slate-600 flex-shrink-0">
                    {prod.harga > 0 ? `Rp ${prod.harga.toLocaleString("id-ID")}` : "Gratis"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
