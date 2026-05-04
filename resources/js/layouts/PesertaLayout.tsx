import React, { ReactNode } from "react";
import { Head, router, Link } from "@inertiajs/react";
import { BookOpen, LogOut, User } from "lucide-react";

type Peserta = {
  id: number;
  nama: string;
  email: string;
  foto_url?: string;
};

type Props = {
  children: ReactNode;
  peserta?: Peserta;
  title?: string;
};

export default function PesertaLayout({ children, peserta, title }: Props) {
  const handleLogout = () => {
    router.post("/peserta/logout");
  };

  // Fallback peserta data if not provided (get from usePage if needed)
  // For now assume it's passed or handle optionality

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {title && <Head title={title} />}

      {/* Navbar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/peserta/dashboard" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-gray-800 text-sm tracking-tight">Dashboard Peserta</span>
          </Link>

          {peserta && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {peserta.foto_url ? (
                  <img src={peserta.foto_url} className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-50" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200">
                    <User className="h-4 w-4 text-indigo-600" />
                  </div>
                )}
                <span className="text-sm font-semibold text-gray-700 hidden sm:block">{peserta.nama}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-red-500 transition px-3 py-1.5 rounded-lg hover:bg-red-50 border border-transparent hover:border-red-100"
              >
                <LogOut className="h-3.5 w-3.5" /> Keluar
              </button>
            </div>
          )}
        </div>
      </div>

      <main className="flex-1">{children}</main>

      <footer className="bg-white border-t border-gray-100 py-6 mt-auto">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-xs text-gray-400">&copy; 2026 My Bootcamp. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
