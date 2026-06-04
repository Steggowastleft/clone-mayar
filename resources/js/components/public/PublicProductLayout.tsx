import { Head } from "@inertiajs/react";
import { useState } from "react";
import { Share2, Copy, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import PublicCheckoutSidebar from "./PublicCheckoutSidebar";

interface PublicProductLayoutProps {
  productId: string; // e.g. "ebook:1", "payment-link:2"
  title: string;
  harga: number;
  hargaCoret?: number | null;
  redirectUrl?: string | null;
  themeColorClass?: string; // e.g., "bg-blue-600 hover:bg-blue-700"
  textColorClass?: string; // e.g., "text-blue-600"
  badgeText?: string;
  navTitle?: string;
  navIcon?: React.ReactNode;
  children: React.ReactNode; // left side content (details, specs, description)
  hideCoupon?: boolean;
  onCheckout?: (finalPrice?: number, couponCode?: string) => void;
  creatorId?: number | null;
}

export default function PublicProductLayout({
  productId,
  title,
  harga,
  hargaCoret,
  redirectUrl,
  themeColorClass = "bg-blue-600 hover:bg-blue-700",
  textColorClass = "text-blue-600",
  badgeText = "Produk",
  navTitle = "Mayar Catalog",
  navIcon,
  children,
  hideCoupon = false,
  onCheckout,
  creatorId
}: PublicProductLayoutProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Tautan berhasil disalin ke papan klip!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 antialiased selection:bg-indigo-500 selection:text-white relative overflow-hidden font-sans">
      <Head title={title} />

      {/* Futuristic Background Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Navigation Header */}
      <nav className="border-b border-slate-100 bg-white/75 backdrop-blur-xl sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                if (document.referrer && document.referrer.includes('/catalog')) {
                  window.history.back();
                } else {
                  window.location.href = creatorId ? `/catalog?user_id=${creatorId}` : "/catalog";
                }
              }}
              className="inline-flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className={`w-9 h-9 ${themeColorClass} rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20`}>
                {navIcon}
              </div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 bg-clip-text text-transparent">
                {navTitle}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCopyLink}
              className="rounded-xl border-slate-200/80 hover:bg-slate-50 gap-2 font-semibold text-slate-600"
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">{copied ? "Tersalin!" : "Bagikan"}</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 relative z-10">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT SIDE CONTENT: Cover, Title, Specs, Reviews, Description */}
          <div className="lg:col-span-8 space-y-8">
            {children}
          </div>

          {/* RIGHT SIDE CONTENT: Sticky Checkout Sidebar */}
          <div className="lg:col-span-4 lg:sticky lg:top-28">
            <PublicCheckoutSidebar 
              productId={productId}
              harga={harga}
              hargaCoret={hargaCoret}
              redirectUrl={redirectUrl}
              themeColorClass={themeColorClass}
              buttonText="Beli Sekarang"
              hideCoupon={hideCoupon}
              onCheckout={onCheckout}
            />
          </div>

        </div>
      </main>

      {/* Premium Footer */}
      <footer className="border-t border-slate-100 py-16 mt-24 bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 opacity-75">
            <div className={`w-6 h-6 ${themeColorClass} rounded-lg flex items-center justify-center text-white`}>
              {navIcon}
            </div>
            <span className="font-bold text-slate-700">{navTitle}</span>
          </div>
          <p className="text-sm text-slate-400 font-medium">&copy; 2026 Mayar. Seluruh hak cipta dilindungi undang-undang.</p>
        </div>
      </footer>
    </div>
  );
}
