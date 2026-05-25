import DashboardLayout from "@/components/dashboard/dashboardlayout";
import { Head, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  ArrowRight, 
  Users, 
  ShoppingBag,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";

type Bundling = {
  id: number;
  nama: string;
  harga: number;
  harga_coret?: number;
  cover_url?: string;
  jumlah_produk: number;
  jumlah_terjual: number;
};

type Props = {
  bundlings: Bundling[];
};

export default function Catalog({ bundlings }: Props) {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Head title="Katalog Bundling Produk" />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight mb-2">
                Katalog Bundling
              </h1>
              <p className="text-blue-100 text-lg max-w-2xl">
                Hemat lebih banyak dengan paket bundling produk pilihan kami. 
                Satu transaksi untuk berbagai produk berkualitas.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="text-3xl font-bold text-white mb-1">
                {bundlings.length}
              </div>
              <div className="text-blue-200 text-sm uppercase tracking-wider font-semibold">
                Paket Tersedia
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 -mt-8">
        {bundlings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-16 text-center border border-gray-100 mt-12">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Belum Ada Bundling</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              Saat ini belum ada paket bundling yang dipublikasikan. 
              Silakan cek kembali nanti atau hubungi admin.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bundlings.map((bundling) => (
              <div 
                key={bundling.id}
                className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col"
              >
                {/* Image Container */}
                <div className="relative aspect-video overflow-hidden bg-gray-100">
                  {bundling.cover_url ? (
                    <img 
                      src={bundling.cover_url} 
                      alt={bundling.nama}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 text-gray-300">
                      <Package className="h-12 w-12 opacity-50" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                      {bundling.jumlah_produk} PRODUK
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <h2 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 min-h-[3.5rem] group-hover:text-blue-600 transition-colors">
                    {bundling.nama}
                  </h2>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span>{bundling.jumlah_terjual} Terjual</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ShoppingBag className="h-4 w-4 text-indigo-500" />
                      <span>Paket Bundling</span>
                    </div>
                  </div>

                  <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                    <div>
                      {bundling.harga_coret && (
                        <p className="text-xs text-gray-400 line-through mb-0.5">
                          Rp {Number(bundling.harga_coret).toLocaleString("id-ID")}
                        </p>
                      )}
                      <p className="text-2xl font-black text-gray-900 tracking-tight">
                        {bundling.harga === 0 ? (
                          <span className="text-green-600 uppercase">Gratis</span>
                        ) : (
                          `Rp ${Number(bundling.harga).toLocaleString("id-ID")}`
                        )}
                      </p>
                    </div>
                    
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-200"
                      onClick={() => router.visit(`/p/${bundling.id}/bundling`)}
                    >
                      Beli <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
