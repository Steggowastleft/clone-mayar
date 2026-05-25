import React from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { Link } from '@inertiajs/react';
import { 
  CreditCard, Users, FileText, ShoppingBag, Shield, Clock, 
  CheckCircle2, MessageSquare, Award, ChevronRight, TrendingUp,
  ArrowUpRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-xs min-w-[140px]">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-slate-500">{entry.name}</span>
          </div>
          <span className="font-bold text-slate-800">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function AdminDashboard({ 
  user, 
  stats = {}, 
  verifications = [], 
  withdrawals = [],
  chartData = [],
  topSellers = [],
  bestSellingProducts = []
}: any) {
  const csrf = typeof document !== 'undefined' ? document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') : null;

  async function postJson(url: string, data: any = {}) {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRF-TOKEN': csrf || '',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return res.json();
  }

  async function approveVerification(id: string) {
    if (!confirm('Apakah Anda yakin ingin menyetujui verifikasi ini?')) return;
    await postJson(`/admin/verifikasi/${id}/approve`);
    location.reload();
  }

  async function rejectVerification(id: string) {
    const reason = prompt('Alasan penolakan (ditampilkan ke user):');
    if (!reason) return;
    await postJson(`/admin/verifikasi/${id}/reject`, { decline_reason: reason });
    location.reload();
  }

  async function approveWithdrawal(id: string) {
    if (!confirm('Setujui permintaan penarikan ini?')) return;
    await postJson(`/admin/withdrawal/${id}/approve`);
    location.reload();
  }

  async function rejectWithdrawal(id: string) {
    const note = prompt('Alasan penolakan:');
    if (!note) return;
    await postJson(`/admin/withdrawal/${id}/reject`, { admin_notes: note });
    location.reload();
  }

  async function completeWithdrawal(id: string) {
    if (!confirm('Tandai sebagai selesai?')) return;
    await postJson(`/admin/withdrawal/${id}/mark-completed`);
    location.reload();
  }

  const getWhatsAppLink = (phone?: string | null, userName?: string) => {
    if (!phone) return null;
    let clean = phone.replace(/\D/g, "");
    if (clean.startsWith("0")) {
      clean = "62" + clean.slice(1);
    } else if (clean.startsWith("8")) {
      clean = "62" + clean;
    }
    return `https://wa.me/${clean}?text=${encodeURIComponent(
      `Halo ${userName}, saya dari Admin platform AksaCart. Ada beberapa hal yang ingin kami koordinasikan.`
    )}`;
  };

  const getProductTypeBadge = (type: string) => {
    switch (type) {
      case 'Digital Product':
        return 'bg-pink-50 text-pink-700 border-pink-100';
      case 'Bootcamp':
        return 'bg-violet-50 text-violet-700 border-violet-100';
      case 'Online Class':
        return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'Webinar':
        return 'bg-red-50 text-red-700 border-red-100';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader userName={user?.name ?? 'Admin'} userRole="Admin" />
      <main className="px-6 py-8 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Dashboard</h1>
            <p className="text-sm text-slate-500 mt-0.5">Analisis performa platform dan manajemen verifikasi/penarikan dana.</p>
          </div>
        </div>

        {/* ── Summary Stats Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard title="Total Users" value={stats.total_users ?? '0'} icon={<Users className="h-4 w-4" />} color="blue" />
          <SummaryCard title="Total Transaksi" value={stats.total_transactions ?? '0'} icon={<ShoppingBag className="h-4 w-4" />} color="purple" />
          <SummaryCard title="Pending Verifikasi" value={stats.pending_verifications_count ?? '0'} icon={<FileText className="h-4 w-4" />} color="amber" />
          <SummaryCard title="Pending Withdrawal" value={stats.pending_withdrawals_count ?? '0'} icon={<CreditCard className="h-4 w-4" />} color="green" />
        </div>

        {/* ── Middle Row: Daily Transaction Chart & Top Sellers ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Card */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Analisis Transaksi Harian</h2>
                <p className="text-xs text-slate-400 mt-0.5">Jumlah pendaftaran & pembelian produk dalam 7 hari terakhir</p>
              </div>
              <div className="p-2 bg-purple-50 text-purple-700 rounded-xl">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>

            <div className="h-64">
              {chartData.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                  <TrendingUp className="h-10 w-10 text-slate-200 animate-pulse" />
                  <p className="text-sm">Belum ada data transaksi yang tercatat</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradTrx" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                      dy={4}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                      width={40}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="transactions"
                      name="Transaksi"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      fill="url(#gradTrx)"
                      dot={false}
                      activeDot={{ r: 4, fill: "#8b5cf6" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Top Sellers Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Penjual Terlaris</h2>
                <p className="text-xs text-slate-400 mt-0.5">Top 5 Creator dengan total penjualan terbanyak</p>
              </div>
              <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                <Award className="h-5 w-5" />
              </div>
            </div>

            <div className="flex-1 space-y-3.5">
              {topSellers.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-10 text-center">
                  <Users className="h-10 w-10 text-slate-200 mb-2" />
                  <p className="text-sm">Belum ada creator yang melakukan penjualan</p>
                </div>
              ) : (
                topSellers.map((s: any, idx: number) => {
                  const waLink = getWhatsAppLink(s.phone, s.name);
                  return (
                    <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                      {/* Rank / Avatar */}
                      <div className="relative shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-tr from-blue-50 to-indigo-50 text-indigo-700 font-bold rounded-xl flex items-center justify-center border border-indigo-100">
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white shadow-sm">
                          {idx + 1}
                        </span>
                      </div>

                      {/* Detail */}
                      <div className="flex-1 min-w-0">
                        <Link 
                          href={`/admin/products?search=${encodeURIComponent(s.name)}`}
                          className="font-bold text-slate-800 text-xs hover:underline block truncate flex items-center gap-0.5 hover:text-blue-600 transition"
                          title="Lihat semua produk creator ini"
                        >
                          {s.name}
                          <ArrowUpRight className="h-3 w-3 inline opacity-50" />
                        </Link>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{s.email}</p>
                        <p className="text-[10px] text-emerald-600 font-bold mt-1">
                          {s.total_sales} Penjualan
                        </p>
                      </div>

                      {/* WhatsApp Button */}
                      {waLink && (
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-100/50 shrink-0"
                          title="Hubungi Creator via WA"
                        >
                          <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                            <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.333 4.993L2 22l5.233-1.371a9.947 9.947 0 0 0 4.773 1.226h.004c5.505 0 9.99-4.477 9.99-9.985C22 6.478 17.518 2 12.012 2zm5.72 13.06c-.313.882-1.802 1.626-2.484 1.706-.682.08-1.547.288-4.52-.942-3.802-1.57-6.248-5.44-6.438-5.69-.19-.25-1.488-1.982-1.488-3.78 0-1.8 1.012-2.684 1.373-3.045.362-.361.793-.451 1.053-.451.26 0 .52.003.744.013.23.01.536-.04.832.67.313.751 1.073 2.624 1.163 2.805.09.18.15.39.03.63-.12.24-.18.39-.36.6-.18.21-.381.47-.541.63-.18.18-.36.38-.15.74.21.36.93 1.53 1.985 2.47 1.35 1.21 2.49 1.58 2.85 1.76.36.18.57.15.78-.09.21-.24.9-1.05 1.14-1.41.24-.36.48-.3.81-.18.33.12 2.085 1.02 2.445 1.2.36.18.6.27.69.42.09.15.09.87-.22 1.76z"/>
                          </svg>
                        </a>
                      )}
                    </div>
                  );
                })
              )}
            </div>
            <div className="border-t border-slate-100 pt-3 mt-3">
              <Link href="/admin/users?role=creator" className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center justify-center gap-0.5">
                Kelola Semua Creator
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* ── Bottom Row: Pending Verifications, Pending Withdrawals, Best Selling Products ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Account Verifications */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-500" />
              Verifikasi Akun
            </h2>
            <div className="space-y-3">
              {verifications.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">Tidak ada permintaan verifikasi pending.</p>
              ) : (
                verifications.map((v: any) => (
                  <div key={v.id} className="flex flex-col border border-slate-100 hover:border-slate-200 rounded-xl p-3 bg-slate-50/50 hover:bg-white transition-all space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-slate-800 text-xs">{v.legal_name ?? v.user?.name}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{v.verification_type} • {v.user?.email}</div>
                      </div>
                    </div>
                    <div className="flex gap-1.5 justify-end">
                      <button onClick={() => approveVerification(v.id)} className="text-[10px] font-bold bg-amber-100 hover:bg-amber-200 text-amber-800 px-2.5 py-1.5 rounded-lg transition-colors">Approve</button>
                      <button onClick={() => rejectVerification(v.id)} className="text-[10px] font-bold bg-red-50 hover:bg-red-100 text-red-600 px-2.5 py-1.5 rounded-lg transition-colors">Reject</button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="border-t border-slate-100 pt-3 mt-4">
              <Link href="/admin/verifikasi" className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center justify-center gap-0.5">
                Lihat Semua Verifikasi
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Pending Withdrawals */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-emerald-500" />
              Penarikan Dana
            </h2>
            <div className="space-y-3">
              {withdrawals.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">Tidak ada permintaan penarikan pending.</p>
              ) : (
                withdrawals.map((w: any) => (
                  <div key={w.id} className="flex flex-col border border-slate-100 hover:border-slate-200 rounded-xl p-3 bg-slate-50/50 hover:bg-white transition-all space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-slate-800 text-xs">{w.user?.name ?? '—'}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Rp {Number(w.jumlah).toLocaleString()} • {w.metode_pembayaran}</div>
                      </div>
                    </div>
                    <div className="flex gap-1.5 justify-end">
                      <button onClick={() => approveWithdrawal(w.id)} className="text-[10px] font-bold bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-2.5 py-1.5 rounded-lg transition-colors">Approve</button>
                      <button onClick={() => rejectWithdrawal(w.id)} className="text-[10px] font-bold bg-red-50 hover:bg-red-100 text-red-600 px-2.5 py-1.5 rounded-lg transition-colors">Reject</button>
                      <button onClick={() => completeWithdrawal(w.id)} className="text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg transition-colors">Mark Done</button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="border-t border-slate-100 pt-3 mt-4">
              <Link href="/admin/withdrawals" className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center justify-center gap-0.5">
                Lihat Semua Penarikan
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Best Selling Products */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-pink-500" />
              Produk Terlaris
            </h2>
            <div className="flex-1 space-y-3.5">
              {bestSellingProducts.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-10 text-center">
                  <ShoppingBag className="h-10 w-10 text-slate-200 mb-2" />
                  <p className="text-sm">Belum ada produk terlaris yang tercatat</p>
                </div>
              ) : (
                bestSellingProducts.map((p: any) => (
                  <div key={p.name} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                    {/* Visual Marker */}
                    <div className="shrink-0">
                      <div className="w-10 h-10 bg-slate-50 border rounded-xl flex items-center justify-center overflow-hidden">
                        <ShoppingBag className="h-5 w-5 text-slate-300" />
                      </div>
                    </div>

                    {/* Detail */}
                    <div className="flex-1 min-w-0">
                      <Link 
                        href={`/admin/products?search=${encodeURIComponent(p.name)}`}
                        className="font-bold text-slate-800 text-xs hover:underline block truncate hover:text-blue-600 transition"
                        title="Lihat detail produk"
                      >
                        {p.name}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getProductTypeBadge(p.type)}`}>
                          {p.type}
                        </span>
                        <span className="text-[10px] text-slate-400">oleh {p.creator}</span>
                      </div>
                    </div>

                    {/* Sold count */}
                    <div className="text-right shrink-0">
                      <p className="text-xs font-black text-slate-800">{p.sold} terjual</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="border-t border-slate-100 pt-3 mt-4">
              <Link href="/admin/products" className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center justify-center gap-0.5">
                Lihat Semua Produk
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

