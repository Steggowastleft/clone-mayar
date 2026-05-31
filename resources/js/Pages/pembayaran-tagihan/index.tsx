import { Head, Link } from "@inertiajs/react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { 
  Receipt, 
  CreditCard, 
  TrendingUp, 
  Users, 
  Search, 
  Printer, 
  Send, 
  Check, 
  X, 
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import DashboardLayout from "@/components/dashboard/dashboardlayout";
import { toast } from "sonner";
import axios from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Transaksi = {
  id: number;
  kode: string;
  nama_pembeli: string;
  email: string;
  no_hp: string;
  produk: string;
  jenis_produk: string;
  jumlah: number;
  status: "pending";
  tanggal: string;
  penjual: string;
  redirect_url: string;
};

type Props = { transaksi: Transaksi[] };

export default function PembayaranTagihanIndex({ transaksi = [] }: Props) {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  
  // Bulk reminder states
  const [channel, setChannel] = useState<"email" | "wa" | "both">("email");
  const [isSending, setIsSending] = useState(false);

  // Staggered sending dialog states
  const [sendingDialogOpen, setSendingDialogOpen] = useState(false);
  const [sendingProgress, setSendingProgress] = useState(0);
  const [sendingIndex, setSendingIndex] = useState(0);
  const [sendingStatus, setSendingStatus] = useState("");
  const [sendingLog, setSendingLog] = useState<string[]>([]);

  // Filter transactions
  const filtered = transaksi.filter((t) => {
    return (
      t.nama_pembeli.toLowerCase().includes(search.toLowerCase()) ||
      t.kode.toLowerCase().includes(search.toLowerCase()) ||
      t.produk.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase())
    );
  });

  // Unique buyers count
  const uniqueBuyersCount = new Set(filtered.map(t => t.nama_pembeli)).size;

  // Total nominal pending
  const totalNominal = filtered.reduce((acc, t) => acc + t.jumlah, 0);

  // Average billing nominal
  const averageBilling = filtered.length > 0 ? Math.round(totalNominal / filtered.length) : 0;

  // Toggle selection for all items
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filtered.map((t) => t.id));
    } else {
      setSelectedIds([]);
    }
  };

  // Toggle selection for single item
  const handleSelectItem = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  // Get inline background gradient style for initials avatar (guarantees dynamic style compilation)
  const getAvatarGradientStyle = (name: string) => {
    const charCode = name.charCodeAt(0) || 0;
    const gradients = [
      "linear-gradient(135deg, #3b82f6, #4f46e5)", // blue-indigo
      "linear-gradient(135deg, #8b5cf6, #d946ef)", // violet-fuchsia
      "linear-gradient(135deg, #10b981, #059669)", // emerald-teal
      "linear-gradient(135deg, #f59e0b, #ea580c)", // amber-orange
      "linear-gradient(135deg, #f43f5e, #db2777)", // rose-pink
      "linear-gradient(135deg, #0ea5e9, #2563eb)"  // sky-blue
    ];
    return gradients[charCode % gradients.length];
  };

  // Get product type custom color styles
  const getProductBadgeStyles = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes("kelas")) {
      return "bg-purple-50 text-purple-755 border-purple-200";
    } else if (lowerType.includes("webinar")) {
      return "bg-red-50 text-red-755 border-red-200";
    } else if (lowerType.includes("bootcamp")) {
      return "bg-indigo-50 text-indigo-755 border-indigo-200";
    } else if (lowerType.includes("digital")) {
      return "bg-pink-50 text-pink-755 border-pink-200";
    } else if (lowerType.includes("dana") || lowerType.includes("donasi")) {
      return "bg-emerald-50 text-emerald-755 border-emerald-200";
    } else if (lowerType.includes("event") || lowerType.includes("acara")) {
      return "bg-amber-50 text-amber-755 border-amber-200";
    } else if (lowerType.includes("link") || lowerType.includes("payment")) {
      return "bg-sky-50 text-sky-755 border-sky-200";
    }
    return "bg-slate-50 text-slate-755 border-slate-200";
  };

  // Trigger quick single send
  const handleQuickSend = async (id: number, buyerName: string) => {
    try {
      const response = await axios.post("/pembayaran-tagihan/remind", {
        ids: [id],
        channel: "both",
        method: "direct",
      });
      if (response.data.success) {
        toast.success(`Pengingat berhasil terkirim ke ${buyerName}.`);
      } else {
        toast.error("Gagal mengirim pengingat.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan saat mengirim pengingat.");
    }
  };

  // Process bulk reminders
  const handleSendReminders = async (method: "direct" | "spread") => {
    if (selectedIds.length === 0) return;

    if (method === "direct") {
      setIsSending(true);
      try {
        const response = await axios.post("/pembayaran-tagihan/remind", {
          ids: selectedIds,
          channel: channel,
          method: "direct",
        });
        if (response.data.success) {
          toast.success(response.data.message || `Berhasil mengirim pengingat ke ${selectedIds.length} pelanggan.`);
          setSelectedIds([]);
        } else {
          toast.error("Gagal mengirim pengingat.");
        }
      } catch (err) {
        toast.error("Terjadi kesalahan saat mengirim pengingat.");
      } finally {
        setIsSending(false);
      }
    } else {
      // Spread/staggered mode
      setSendingDialogOpen(true);
      setSendingProgress(0);
      setSendingIndex(0);
      setSendingStatus("Menghubungkan layanan antrean...");
      setSendingLog([]);
      setIsSending(true);

      const idsToSend = [...selectedIds];
      const logs: string[] = [];

      try {
        for (let i = 0; i < idsToSend.length; i++) {
          const id = idsToSend[i];
          const trans = transaksi.find((t) => t.id === id);
          const name = trans ? trans.nama_pembeli : `Pelanggan #${id}`;
          const contact = trans ? (channel === "wa" ? trans.no_hp : trans.email) : "";

          setSendingIndex(i + 1);
          setSendingProgress(Math.round((i / idsToSend.length) * 100));
          setSendingStatus(`Menyiapkan pesan untuk ${name} via ${channel.toUpperCase()}...`);

          try {
            await axios.post("/pembayaran-tagihan/remind", {
              ids: [id],
              channel: channel,
              method: "spread",
            });
            logs.push(`[${new Date().toLocaleTimeString()}] ✓ BERHASIL: Pengingat dikirim ke ${name} (${contact})`);
          } catch (err) {
            logs.push(`[${new Date().toLocaleTimeString()}] ✗ GAGAL: Tidak dapat mengirim ke ${name} (${contact})`);
          }
          setSendingLog([...logs]);

          // Delay for spread simulation (1.5 seconds)
          await new Promise((resolve) => setTimeout(resolve, 1500));
        }

        setSendingProgress(100);
        setSendingStatus("Semua pengingat telah berhasil disebar!");
        toast.success(`Proses pengiriman bertahap ke ${idsToSend.length} pelanggan selesai.`);
        setSelectedIds([]);
      } catch (err) {
        toast.error("Proses pengiriman terganggu.");
      } finally {
        setIsSending(false);
      }
    }
  };

  return (
    <DashboardLayout>
      <Head title="Pembayaran Tagihan" />
      
      <div className="p-6 space-y-8 bg-slate-50/40 min-h-screen pb-32">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-blue-200">
                Billing System
              </span>
              <span className="bg-yellow-50 text-yellow-700 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-yellow-200 flex items-center gap-1.5 animate-pulse">
                <span className="h-1.5 w-1.5 bg-yellow-500 rounded-full" /> Pending tagihan
              </span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none flex items-center gap-2.5">
              Pembayaran Tagihan
            </h1>
            <p className="text-xs text-slate-450 mt-2 font-semibold max-w-xl leading-relaxed">
              Pantau seluruh tagihan pelanggan yang masih tertunda (pending) dan kirimkan notifikasi pengingat secara personal (Email/WA) secara instan atau terjadwal.
            </p>
          </div>
          <div className="flex gap-2.5">
            <Button 
              variant="outline" 
              onClick={() => window.print()}
              className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition"
            >
              <Printer className="h-4 w-4 mr-2 text-slate-400" /> Cetak Tagihan
            </Button>
          </div>
        </div>

        {/* Dynamic Premium Metrics Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Total Pending */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between hover:shadow-md transition duration-300 relative overflow-hidden group">
            <div className="absolute top-0 left-0 h-1.5 w-full bg-gradient-to-r from-yellow-400 to-amber-500" />
            <div className="space-y-1.5">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tagihan Pending</p>
              <h3 className="text-3xl font-black text-slate-900">{filtered.length}</h3>
              <p className="text-[10px] text-yellow-600 font-extrabold flex items-center gap-1">
                <span>Perlu ditindaklanjuti</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-50 border border-yellow-100 rounded-xl flex items-center justify-center text-yellow-600 group-hover:scale-110 transition-transform shrink-0">
              <Receipt size={22} />
            </div>
          </div>

          {/* Card 2: Nominal Pending */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between hover:shadow-md transition duration-300 relative overflow-hidden group">
            <div className="absolute top-0 left-0 h-1.5 w-full bg-gradient-to-r from-blue-500 to-indigo-600" />
            <div className="space-y-1.5">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nominal Pending</p>
              <h3 className="text-2xl font-black text-slate-900">Rp {totalNominal.toLocaleString("id-ID")}</h3>
              <p className="text-[10px] text-blue-600 font-extrabold flex items-center gap-1">
                <span>Total omzet tertunda</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform shrink-0">
              <CreditCard size={22} />
            </div>
          </div>

          {/* Card 3: Average Billing */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between hover:shadow-md transition duration-300 relative overflow-hidden group">
            <div className="absolute top-0 left-0 h-1.5 w-full bg-gradient-to-r from-emerald-400 to-teal-500" />
            <div className="space-y-1.5">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rerata Tagihan</p>
              <h3 className="text-2xl font-black text-slate-900">Rp {averageBilling.toLocaleString("id-ID")}</h3>
              <p className="text-[10px] text-emerald-600 font-extrabold flex items-center gap-1">
                <span>Nilai rata-rata invoice</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform shrink-0">
              <TrendingUp size={22} />
            </div>
          </div>

          {/* Card 4: Unique Customers */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between hover:shadow-md transition duration-300 relative overflow-hidden group">
            <div className="absolute top-0 left-0 h-1.5 w-full bg-gradient-to-r from-violet-500 to-fuchsia-600" />
            <div className="space-y-1.5">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pelanggan Unik</p>
              <h3 className="text-3xl font-black text-slate-900">{uniqueBuyersCount}</h3>
              <p className="text-[10px] text-violet-600 font-extrabold flex items-center gap-1">
                <span>Jumlah pembeli pending</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-violet-50 border border-violet-100 rounded-xl flex items-center justify-center text-violet-600 group-hover:scale-110 transition-transform shrink-0">
              <Users size={22} />
            </div>
          </div>
        </div>

        {/* Main Section */}
        <div className="space-y-4">
          {/* Filtering Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 border border-slate-200 rounded-2xl shadow-xs">
            <div className="relative flex-1 max-w-md w-full">
              <Input
                placeholder="Cari pembeli, kode order, produk..."
                className="pl-9 text-xs rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white transition w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            </div>
            <div className="flex items-center gap-3 self-end sm:self-auto text-xs text-slate-550 font-bold">
              <span>Menampilkan <span className="text-slate-800 font-black">{filtered.length}</span> tagihan</span>
            </div>
          </div>

          {/* Bulk Action Alert Banner (High Visibility & Spacious) */}
          {selectedIds.length > 0 && (
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 md:p-8 rounded-3xl border border-indigo-500/20 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-8 animate-in slide-in-from-top-3 duration-300">
              <div className="flex items-center gap-5">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-600 text-white text-sm font-black border border-indigo-500 shadow-md shrink-0 select-none animate-pulse">
                  {selectedIds.length}
                </div>
                <div>
                  <h4 className="text-sm font-black text-white flex items-center gap-1.5 tracking-wide">
                    Tindakan Massal Terpilih
                  </h4>
                  <p className="text-xs text-slate-300 font-semibold mt-1 max-w-2xl leading-relaxed">
                    Kirim pengingat tagihan ke semua pelanggan terpilih secara instan atau bertahap (spread).
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-5 justify-end ml-auto w-full lg:w-auto">
                {/* Media Channel Select */}
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest select-none">Media Saluran:</span>
                  <Select value={channel} onValueChange={(val: any) => setChannel(val)}>
                    <SelectTrigger className="w-[140px] text-xs h-10 rounded-xl bg-slate-900 border-slate-800 text-white font-bold hover:bg-slate-800/80 transition focus:ring-2 focus:ring-indigo-500 shadow-md">
                      <SelectValue placeholder="Pilih Media" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-white rounded-xl shadow-lg">
                      <SelectItem value="email" className="hover:bg-slate-850 focus:bg-slate-850 focus:text-white text-xs font-semibold cursor-pointer">Email</SelectItem>
                      <SelectItem value="wa" className="hover:bg-slate-850 focus:bg-slate-850 focus:text-white text-xs font-semibold cursor-pointer">WhatsApp</SelectItem>
                      <SelectItem value="both" className="hover:bg-slate-850 focus:bg-slate-850 focus:text-white text-xs font-semibold cursor-pointer">Email & WA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    onClick={() => handleSendReminders("spread")}
                    disabled={isSending}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider h-10 px-6 rounded-xl flex items-center gap-2 shadow-md shadow-indigo-500/20 transition active:scale-95 duration-150"
                  >
                    <Send size={12} /> {isSending ? "Mengirim..." : "Kirim Bertahap (Spread)"}
                  </Button>

                  <Button
                    onClick={() => handleSendReminders("direct")}
                    disabled={isSending}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider h-10 px-5 rounded-xl flex items-center gap-2 shadow-md shadow-blue-500/20 transition active:scale-95 duration-150"
                  >
                    <Send size={12} /> {isSending ? "Mengirim..." : "Kirim Instan"}
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => setSelectedIds([])}
                    className="text-slate-400 hover:text-white text-xs font-bold px-3.5 h-10 rounded-xl hover:bg-white/5 transition duration-150"
                  >
                    Batal
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Premium List Cards Layout using standard robust HTML Table */}
          <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100/50 text-[10px] font-black text-slate-450 uppercase tracking-widest select-none">
                    <th className="py-4 px-6 text-center w-12">
                      <input
                        type="checkbox"
                        className="rounded border-slate-350 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer transition"
                        checked={filtered.length > 0 && selectedIds.length === filtered.length}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th className="py-4 px-4 w-48">Kode Order</th>
                    <th className="py-4 px-4 min-w-[200px]">Pelanggan</th>
                    <th className="py-4 px-4 min-w-[220px]">Produk & Layanan</th>
                    <th className="py-4 px-4 w-36">Nominal</th>
                    <th className="py-4 px-4 w-44">Tanggal</th>
                    <th className="py-4 px-4 w-28 text-center">Status</th>
                    <th className="py-4 px-6 text-right w-36">Aksi Cepat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center text-slate-400 text-xs font-semibold">
                        Tidak ada tagihan tertunda (pending) yang ditemukan.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((t) => {
                      const isSelected = selectedIds.includes(t.id);
                      const initials = t.nama_pembeli
                        .split(" ")
                        .slice(0, 2)
                        .map((n) => n.charAt(0))
                        .join("")
                        .toUpperCase();
                      
                      return (
                        <tr
                          key={t.id}
                          className={cn(
                            "group hover:bg-slate-50/50 transition-colors duration-250",
                            isSelected && "bg-blue-50/10 hover:bg-blue-50/20"
                          )}
                        >
                          <td className="py-4 px-6 text-center">
                            <input
                              type="checkbox"
                              className="rounded border-slate-350 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer transition"
                              checked={isSelected}
                              onChange={(e) => handleSelectItem(t.id, e.target.checked)}
                            />
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-[11px] font-mono font-black text-slate-500 bg-slate-100 border border-slate-200/60 rounded px-2.5 py-1">
                              {t.kode}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-inner select-none"
                                style={{ backgroundImage: getAvatarGradientStyle(t.nama_pembeli) }}
                              >
                                {initials}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-black text-slate-800 truncate">{t.nama_pembeli}</p>
                                <p className="text-[10px] text-slate-450 font-semibold truncate mt-0.5">{t.email}</p>
                                <p className="text-[9px] text-slate-400 font-semibold mt-0.5">{t.no_hp || "-"}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="min-w-0 space-y-1">
                              <p className="text-xs font-extrabold text-slate-700 truncate" title={t.produk}>
                                {t.produk}
                              </p>
                              <span className={cn(
                                "inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border shadow-2xs",
                                getProductBadgeStyles(t.jenis_produk)
                              )}>
                                {t.jenis_produk}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-xs font-black text-slate-850">
                              Rp {t.jumlah.toLocaleString("id-ID")}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-semibold text-[11px] text-slate-500">
                            {t.tanggal}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <Badge className="bg-yellow-50 text-yellow-755 border border-yellow-200 text-[10px] font-black uppercase px-2 py-0.5 rounded-full select-none">
                              Pending
                            </Badge>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2.5">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleQuickSend(t.id, t.nama_pembeli)}
                                className="h-8 w-8 rounded-lg border border-slate-200 bg-white text-blue-500 hover:bg-blue-50 transition p-0 shrink-0 flex items-center justify-center"
                                title="Kirim pengingat instan"
                              >
                                <Send size={12} />
                              </Button>
                              <Link
                                href={`/transaksi/${t.id}`}
                                className="inline-flex items-center justify-center text-xs font-extrabold h-8 px-3 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-sm transition"
                              >
                                Detail
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Floating Action Dock for Multi-Select */}
        {selectedIds.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between gap-6 bg-slate-900/95 backdrop-blur-md border border-slate-800 shadow-2xl rounded-2xl px-6 py-4 max-w-4xl w-[90%] md:w-max animate-in fade-in slide-in-from-bottom-5 duration-300">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white text-xs font-black px-2.5 py-1.5 rounded-full shrink-0 flex items-center justify-center h-7 min-w-7 border border-blue-500 shadow-md">
                {selectedIds.length}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-white leading-none">Tagihan Terpilih</p>
                <p className="text-[10px] text-slate-450 font-semibold mt-1">Siap dikirimkan pengingat massal</p>
              </div>
            </div>
            
            <div className="h-6 w-[1px] bg-slate-800 hidden sm:block shrink-0" />
            
            <div className="flex flex-wrap items-center gap-4 justify-end">
               {/* Media Channel Select */}
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest select-none">Media:</span>
                  <Select value={channel} onValueChange={(val: any) => setChannel(val)}>
                    <SelectTrigger className="w-[130px] text-xs h-9 rounded-xl bg-slate-900 border-slate-700 text-white font-bold hover:bg-slate-800 transition focus:ring-1 focus:ring-blue-500 shadow-inner">
                      <SelectValue placeholder="Pilih Media" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-850 text-white rounded-xl shadow-lg">
                      <SelectItem value="email" className="hover:bg-slate-850 focus:bg-slate-850 focus:text-white text-xs font-semibold cursor-pointer">Email</SelectItem>
                      <SelectItem value="wa" className="hover:bg-slate-850 focus:bg-slate-850 focus:text-white text-xs font-semibold cursor-pointer">WhatsApp</SelectItem>
                      <SelectItem value="both" className="hover:bg-slate-850 focus:bg-slate-850 focus:text-white text-xs font-semibold cursor-pointer">Email & WA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

               <div className="flex items-center gap-2">
                 <Button
                   onClick={() => handleSendReminders("direct")}
                   disabled={isSending}
                   className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider h-9 px-4 rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition active:scale-95"
                 >
                   <Send size={11} /> {isSending ? "Kirim..." : "Kirim Instan"}
                 </Button>
                 
                 <Button
                   onClick={() => handleSendReminders("spread")}
                   disabled={isSending}
                   className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider h-9 px-4 rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition active:scale-95"
                 >
                   <Send size={11} /> {isSending ? "Kirim..." : "Kirim Bertahap (Spread)"}
                 </Button>

                 <Button
                   variant="ghost"
                   onClick={() => setSelectedIds([])}
                   className="text-slate-400 hover:text-white p-2 rounded-xl"
                   title="Batalkan Pilihan"
                 >
                   <X size={16} />
                 </Button>
               </div>
            </div>
          </div>
        )}

      </div>

      {/* Progress Dialog for Staggered/Spread Send */}
      <Dialog open={sendingDialogOpen} onOpenChange={isSending ? () => {} : setSendingDialogOpen}>
        <DialogContent className="max-w-md p-6 bg-white rounded-3xl border border-slate-150 shadow-2xl">
          <DialogTitle className="text-base font-black text-slate-850 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Send className="h-5 w-5 text-blue-600 animate-pulse" /> Mengirim Pengingat Tagihan (Bertahap)
          </DialogTitle>
          <div className="space-y-5 pt-3">
            
            {/* Progress Counters */}
            <div className="flex justify-between items-center text-xs font-extrabold text-slate-500">
              <span>Progres Pengiriman</span>
              <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-mono">
                {sendingIndex} / {selectedIds.length} Pelanggan
              </span>
            </div>

            {/* Dynamic Progress Bar */}
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-150/50">
              <div 
                className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-out" 
                style={{ width: `${sendingProgress}%` }}
              />
            </div>

            {/* Current Sending Status Message */}
            <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-xl flex items-start gap-2.5">
              {sendingProgress < 100 ? (
                <Loader2 className="h-4 w-4 text-blue-600 animate-spin shrink-0 mt-0.5" />
              ) : (
                <div className="w-4 h-4 bg-green-100 border border-green-200 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="h-2.5 w-2.5 text-green-700 font-bold" />
                </div>
              )}
              <p className="text-xs font-bold text-blue-900 leading-snug">{sendingStatus}</p>
            </div>

            {/* Neon Logs Terminal */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aktivitas Console Log</span>
              <div className="h-44 overflow-y-auto bg-slate-950 rounded-xl p-3.5 font-mono text-[9px] text-emerald-400 space-y-1 scrollbar-thin shadow-inner border border-slate-900">
                {sendingLog.length === 0 ? (
                  <span className="text-slate-600 italic">Menghubungkan ke logs terminal...</span>
                ) : (
                  sendingLog.map((log, idx) => (
                    <div key={idx} className={cn(
                      log.includes("✓") ? "text-emerald-400 font-bold" : "text-rose-400 font-bold animate-pulse"
                    )}>
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Dialog Footer Action */}
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <Button
                disabled={isSending}
                onClick={() => setSendingDialogOpen(false)}
                className="bg-slate-900 hover:bg-slate-950 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition active:scale-95"
              >
                Selesai & Tutup
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </DashboardLayout>
  );
}
