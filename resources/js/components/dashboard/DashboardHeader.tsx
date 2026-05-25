import { Bell, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface Transaction {
  id: string | number;
  type: "income" | "expense" | "refund";
  title: string;
  amount: string | number;
  date: string;
}

interface DashboardHeaderProps {
  userName: string;
  userRole?: string;
  onMenuClick?: () => void;
  transactions?: Transaction[];
}

export function DashboardHeader({ userName, userRole = 'Creator', transactions = [] }: DashboardHeaderProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = userName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-slate-200">
      <div className="px-6 h-14 flex items-center justify-between">
        {/* Left: page greeting */}
        <p className="text-sm font-semibold text-slate-700">
          Halo, <span className="text-blue-600">{userName}</span> 👋
        </p>

        {/* Right: Notif + Avatar */}
        <div className="flex items-center gap-2" ref={ref}>

          {/* Bell notification */}
          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors"
            >
              <Bell className="h-[18px] w-[18px] text-slate-600" />
              {transactions.length > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
              )}
            </button>

            {/* Dropdown */}
            {open && (
              <div className="absolute top-11 right-0 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50">
                {/* Header */}
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-800">Notifikasi</span>
                  {transactions.length > 0 && (
                    <span className="text-[11px] font-semibold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                      {transactions.length} baru
                    </span>
                  )}
                </div>

                {/* List */}
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                  {transactions.length === 0 ? (
                    <div className="py-10 text-center">
                      <Bell className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                      <p className="text-xs text-slate-400">Belum ada notifikasi baru</p>
                    </div>
                  ) : (
                    transactions.slice(0, 6).map((trx) => (
                      <div key={trx.id} className="px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer">
                        <div className="flex gap-3 items-start">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${trx.type === "income" ? "bg-emerald-100" : "bg-red-100"}`}>
                            <span className={`text-[11px] font-bold ${trx.type === "income" ? "text-emerald-600" : "text-red-500"}`}>
                              {trx.type === "income" ? "+" : "-"}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-slate-800 truncate">{trx.title}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">{trx.date}</p>
                          </div>
                          <div className={`text-xs font-bold flex-shrink-0 ${trx.type === "income" ? "text-emerald-600" : "text-red-500"}`}>
                            {typeof trx.amount === "number"
                              ? `Rp ${trx.amount.toLocaleString("id-ID")}`
                              : trx.amount}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {transactions.length > 0 && (
                  <div className="border-t border-slate-100 px-4 py-2.5">
                    <button className="w-full text-center text-xs font-semibold text-blue-600 hover:text-blue-700 py-1 transition-colors">
                      Lihat semua transaksi
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Avatar */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              {initials ? (
                <span className="text-white text-xs font-bold">{initials}</span>
              ) : (
                <User className="h-3.5 w-3.5 text-white" />
              )}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-slate-800 leading-none">{userName}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{userRole}</p>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
