import { Head, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  ArrowLeft, 
  CheckCircle2, 
  ShoppingCart,
  ShieldCheck,
  Zap,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";

type BundlingItem = {
  id: number;
  nama: string;
  tipe: string;
  harga: number;
  cover?: string;
  deskripsi?: string;
};

type Bundling = {
  id: number;
  nama: string;
  harga: number;
  harga_coret?: number;
  deskripsi?: string;
  cover_url?: string;
  items: BundlingItem[];
  jumlah_terjual: number;
};

type Props = {
  bundling: Bundling;
};

export default function PublicShow({ bundling }: Props) {
  const discountAmount = bundling.harga_coret ? Number(bundling.harga_coret) - Number(bundling.harga) : 0;
  const discountPercentage = bundling.harga_coret ? Math.round((discountAmount / Number(bundling.harga_coret)) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Head title={bundling.nama} />

      {/* Top Navbar */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <button 
            onClick={() => router.visit('/bundling/catalog')}
            className="flex items-center text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Katalog
          </button>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">HARGA PAKET</p>
              <p className="text-sm font-black text-gray-900">
                Rp {Number(bundling.harga).toLocaleString("id-ID")}
              </p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200">
              Daftar Sekarang
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Info & Content */}
          <div className="lg:col-span-7 space-y-10">
            
            {/* Main Info Card */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                  Bundle Package
                </span>
                {discountPercentage > 0 && (
                  <span className="bg-red-50 text-red-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                    Hemat {discountPercentage}%
                  </span>
                )}
              </div>
              
              <h1 className="text-4xl font-black text-gray-900 leading-tight mb-6">
                {bundling.nama}
              </h1>

              {bundling.cover_url && (
                <div className="aspect-video rounded-2xl overflow-hidden mb-8 shadow-lg">
                  <img src={bundling.cover_url} alt={bundling.nama} className="w-full h-full object-cover" />
                </div>
              )}

              <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed">
                <h3 className="text-gray-900 font-bold text-xl mb-4">Tentang Bundling Ini</h3>
                <p className="whitespace-pre-line">{bundling.deskripsi || "Tidak ada deskripsi tersedia."}</p>
              </div>
            </div>

            {/* Product List */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-gray-900">Isi Paket Bundling</h2>
                <span className="text-sm font-bold text-blue-600 bg-blue-50 px-4 py-1 rounded-full">
                  {bundling.items.length} Produk Terintegrasi
                </span>
              </div>

              <div className="space-y-4">
                {bundling.items.map((item) => (
                  <div 
                    key={item.id}
                    className="group bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:border-blue-200 transition-all flex gap-5"
                  >
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                      {item.cover ? (
                        <img src={item.cover} alt={item.nama} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-100">
                          <Package className="h-8 w-8 opacity-50" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 py-0.5 bg-gray-50 rounded">
                          {item.tipe}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 truncate group-hover:text-blue-600 transition-colors">
                        {item.nama}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">Rp {Number(item.harga).toLocaleString("id-ID")}</p>
                    </div>
                    <div className="flex items-center px-4">
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Checkout Card */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 space-y-6">
              <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-blue-900/5 border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                  <ShoppingCart className="h-40 w-40 text-blue-600 -rotate-12" />
                </div>

                <div className="relative z-10">
                  <h3 className="text-xl font-black text-gray-900 mb-8">Summary Pembelian</h3>

                  <div className="space-y-4 mb-10">
                    <div className="flex justify-between text-gray-500">
                      <span>Total Harga Normal</span>
                      <span className="line-through">
                        Rp {Number(bundling.harga_coret || bundling.harga).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-1">Harga Hemat Paket</span>
                        <span className="text-4xl font-black text-gray-900">
                          Rp {Number(bundling.harga).toLocaleString("id-ID")}
                        </span>
                      </div>
                      {discountPercentage > 0 && (
                        <div className="bg-red-500 text-white text-xs font-black px-3 py-1.5 rounded-lg mb-1">
                          SAVE {discountPercentage}%
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center">
                        <Zap className="h-3 w-3 text-blue-600" />
                      </div>
                      Akses Instan ke {bundling.items.length} Produk
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center">
                        <ShieldCheck className="h-3 w-3 text-blue-600" />
                      </div>
                      Pembayaran Aman & Terverifikasi
                    </div>
                  </div>

                  <Button className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white text-lg font-black rounded-2xl shadow-xl shadow-blue-200 transition-all hover:-translate-y-1 active:translate-y-0">
                    Daftar Sekarang
                  </Button>

                  <p className="text-center text-xs text-gray-400 mt-6 flex items-center justify-center gap-2">
                    <Info className="h-3 w-3" />
                    Setelah bayar, akses akan otomatis aktif
                  </p>
                </div>
              </div>

              {/* Stats Card */}
              <div className="bg-gradient-to-br from-gray-900 to-slate-800 rounded-3xl p-6 text-white flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                    <Users className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">BERGABUNG</p>
                    <p className="text-xl font-black">{bundling.jumlah_terjual}+ Peserta</p>
                  </div>
                </div>
                <ArrowRight className="h-6 w-6 text-gray-500" />
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
