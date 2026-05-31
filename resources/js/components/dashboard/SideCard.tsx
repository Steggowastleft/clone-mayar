import { Star, MoreHorizontal } from "lucide-react";

interface Transaction {
  id: string | number;
  type: "income" | "expense" | "refund";
  buyerName: string;
  actionText: string;
  avatar?: string;
  amount: string | number;
  date: string;
}

interface Review {
  id: string | number;
  productName: string;
  reviewer: string;
  rating: number;
  comment: string;
  date: string;
}

interface SideCardProps {
  transactionTitle?: string;
  transactions?: Transaction[];
  reviewTitle?: string;
  reviews?: Review[];
  isLoadingTransactions?: boolean;
  isLoadingReviews?: boolean;
}

const DEFAULT_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80", // female 1
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80", // male 1
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80", // female 2
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80", // male 2
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80"  // female 3
];

const DEFAULT_REVIEWS_AVATARS = [
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80"
];

export function SideCard({
  transactionTitle = "Transaksi Terbaru",
  transactions = [],
  reviewTitle = "Penilaian dan Ulasan",
  reviews = [],
  isLoadingTransactions = false,
  isLoadingReviews = false,
}: SideCardProps) {
  return (
    <div className="space-y-6">
      {/* ── Transactions Card ── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800">{transactionTitle}</h3>
          <button className="p-1 hover:bg-slate-50 rounded-lg transition-colors">
            <MoreHorizontal className="h-5 w-5 text-blue-600" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {isLoadingTransactions ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <p className="text-sm font-semibold text-slate-500">Tidak Ada Data Transaksi Terbaru</p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((trx, idx) => {
                const avatarUrl = trx.avatar || DEFAULT_AVATARS[idx % DEFAULT_AVATARS.length];
                return (
                  <div
                    key={trx.id}
                    className="flex items-center gap-3 px-4 py-3 bg-blue-50/70 border border-blue-100/30 rounded-2xl transition-colors"
                  >
                    {/* User profile avatar */}
                    <img
                      src={avatarUrl}
                      alt={trx.buyerName}
                      className="w-10 h-10 rounded-full object-cover border border-white shrink-0 shadow-sm"
                    />
                    {/* Buyer and Action description */}
                    <div className="text-xs text-slate-600 leading-relaxed">
                      <span className="font-bold text-slate-800 mr-1">{trx.buyerName}</span>
                      <span>{trx.actionText}</span>
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
          <h3 className="text-base font-bold text-slate-800">{reviewTitle}</h3>
          <button className="p-1 hover:bg-slate-50 rounded-lg transition-colors">
            <MoreHorizontal className="h-5 w-5 text-blue-600" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {isLoadingReviews ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <p className="text-sm font-semibold text-slate-500">Tidak Ada Data Penilaian dan Ulasan</p>
            </div>
          ) : (
            <div className="space-y-4 divide-y divide-slate-100">
              {reviews.map((rv, idx) => {
                const reviewerAvatar = DEFAULT_REVIEWS_AVATARS[idx % DEFAULT_REVIEWS_AVATARS.length];
                return (
                  <div key={rv.id} className={`pt-3 first:pt-0`}>
                    {/* Top Row: Avatar + Name + Rating Stars + Date */}
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={reviewerAvatar}
                          alt={rv.reviewer}
                          className="w-8 h-8 rounded-full object-cover border border-slate-100 shrink-0"
                        />
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-bold text-slate-800">{rv.reviewer}</span>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-2.5 w-2.5 ${
                                  i < rv.rating ? "fill-amber-400 text-amber-400" : "text-slate-200 fill-slate-200"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold shrink-0">
                        {rv.date || "12.30"}
                      </span>
                    </div>
                    {/* Comment text */}
                    {rv.comment && (
                      <p className="text-xs text-slate-600 pl-10 leading-relaxed">
                        {rv.comment}
                      </p>
                    )}
                    {/* Target Product */}
                    <p className="text-[10px] text-slate-400 font-medium pl-10 mt-1">
                      Produk: {rv.productName}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
