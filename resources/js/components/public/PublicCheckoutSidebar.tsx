import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ShieldCheck, CreditCard, Sparkles } from "lucide-react";

type AppliedCoupon = {
  kode: string;
  tipe_diskon: string;
  besaran: number;
  discount_amount: number;
  final_price: number;
};

type Props = {
  productId: string; // e.g. "ebook:1"
  harga: number;
  hargaCoret?: number | null;
  redirectUrl?: string | null;
  themeColorClass?: string; // e.g., "bg-sky-600 hover:bg-sky-700"
  buttonText?: string;
  hideCoupon?: boolean;
  onCheckout?: () => void;
};

export default function PublicCheckoutSidebar({
  productId,
  harga,
  hargaCoret,
  redirectUrl,
  themeColorClass = "bg-blue-600 hover:bg-blue-700",
  buttonText = "Beli Sekarang",
  hideCoupon = false,
  onCheckout
}: Props) {
  const [couponCode, setCouponCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const formatHarga = (n: number) => {
    if (n === 0) return "Gratis";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(n);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplying(true);
    setErrorMsg(null);

    try {
      const response = await fetch("/diskon/validate-coupon", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-CSRF-TOKEN": (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || "",
        },
        body: JSON.stringify({
          kode_kupon: couponCode,
          product_id: productId,
          harga: harga,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal menerapkan kupon.");
      }

      setAppliedCoupon({
        kode: couponCode.toUpperCase(),
        tipe_diskon: data.tipe_diskon,
        besaran: data.besaran,
        discount_amount: data.discount_amount,
        final_price: data.final_price,
      });
      toast.success("Kupon berhasil diterapkan!");
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan.");
      toast.error(err.message || "Terjadi kesalahan.");
      setAppliedCoupon(null);
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setErrorMsg(null);
    toast.info("Kupon dihapus.");
  };

  const handleCheckout = () => {
    if (onCheckout) {
      onCheckout();
    } else if (redirectUrl) {
      window.location.href = redirectUrl;
    } else {
      alert("Metode pembayaran sedang disiapkan. Hubungi admin untuk informasi lebih lanjut.");
    }
  };

  const currentPrice = appliedCoupon ? appliedCoupon.final_price : harga;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 sticky top-24 space-y-6">
      
      {/* Price Header */}
      <div>
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">
          Harga Produk
        </p>
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-3xl font-black text-gray-900">
            {formatHarga(currentPrice)}
          </span>
          {hargaCoret && hargaCoret > currentPrice && (
            <span className="text-sm text-gray-400 line-through font-medium">
              {formatHarga(hargaCoret)}
            </span>
          )}
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Coupon Input */}
      {harga > 0 && !hideCoupon && (
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wider block">
            Punya Kode Kupon?
          </label>
          <div className="flex gap-2">
            <Input
              placeholder="Masukkan kode kupon"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              disabled={isApplying || !!appliedCoupon}
              className="rounded-xl border-gray-200 uppercase font-mono font-bold"
            />
            {appliedCoupon ? (
              <Button 
                variant="destructive" 
                onClick={handleRemoveCoupon}
                className="rounded-xl"
              >
                Hapus
              </Button>
            ) : (
              <Button 
                onClick={handleApplyCoupon} 
                disabled={isApplying || !couponCode.trim()}
                className={`${themeColorClass} text-white rounded-xl`}
              >
                {isApplying ? "..." : "Terapkan"}
              </Button>
            )}
          </div>
          {errorMsg && (
            <p className="text-xs text-red-500 font-medium pl-1">{errorMsg}</p>
          )}
          {appliedCoupon && (
            <p className="text-xs text-green-600 font-semibold pl-1 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-green-500" />
              Kupon <strong>{appliedCoupon.kode}</strong> diterapkan (Hemat {formatHarga(appliedCoupon.discount_amount)})
            </p>
          )}
        </div>
      )}

      {/* Pricing Details Breakdown */}
      <div className="space-y-3 pt-2 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
        <h4 className="text-xs font-bold text-gray-600 uppercase tracking-widest">
          Rincian Pembayaran
        </h4>
        <div className="space-y-2 text-sm text-gray-600 pt-1">
          <div className="flex justify-between">
            <span>Harga Asli</span>
            <span className="font-semibold text-gray-900">{formatHarga(harga)}</span>
          </div>
          {appliedCoupon && (
            <div className="flex justify-between text-green-600">
              <span>Diskon ({appliedCoupon.kode})</span>
              <span className="font-semibold">- {formatHarga(appliedCoupon.discount_amount)}</span>
            </div>
          )}
          <hr className="border-gray-200/50 my-1" />
          <div className="flex justify-between font-black text-gray-900 text-base">
            <span>Total Bayar</span>
            <span>{formatHarga(currentPrice)}</span>
          </div>
        </div>
      </div>

      {/* Checkout Button */}
      <Button 
        onClick={handleCheckout}
        className={`w-full ${themeColorClass} text-white font-black py-7 text-lg rounded-2xl shadow-lg hover:scale-[1.02] transition-all`}
      >
        {buttonText.toUpperCase()}
      </Button>

      {/* Trust Markers */}
      <div className="space-y-3 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2.5 text-xs font-semibold text-gray-600">
          <ShieldCheck size={16} className="text-green-500 shrink-0" />
          <span>Pembayaran Aman & Terenkripsi</span>
        </div>
        <div className="flex items-center gap-2.5 text-xs font-semibold text-gray-600">
          <CreditCard size={16} className="text-blue-500 shrink-0" />
          <span>Mendukung Transfer & E-Wallet</span>
        </div>
        <div className="flex items-center gap-2.5 text-xs font-semibold text-gray-600">
          <CheckCircle2 size={16} className="text-indigo-500 shrink-0" />
          <span>Akses Instan setelah Bayar</span>
        </div>
      </div>

    </div>
  );
}
