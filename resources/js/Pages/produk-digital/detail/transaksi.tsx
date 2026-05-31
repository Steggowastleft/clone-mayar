import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, Download, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

type TransaksiItem = {
  id: number;
  pelanggan: string;
  email: string;
  no_hp: string;
  status: string; // 'Lunas' | 'Gagal' | 'Belum Bayar' | 'Dibatalkan'
  metode_pembayaran: string;
  kode_kupon: string;
  tanggal: string;
  resi: string;
};

type Props = {
  transaksi?: TransaksiItem[];
};

export default function TabTransaksi({ transaksi = [] }: Props) {
  const [searchPaid, setSearchPaid] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [dateFilterPaid, setDateFilterPaid] = useState<Date | undefined>(undefined);
  const [dateOpenPaid, setDateOpenPaid] = useState(false);

  const [searchUnpaid, setSearchUnpaid] = useState("");
  const [dateFilterUnpaid, setDateFilterUnpaid] = useState<Date | undefined>(undefined);
  const [dateOpenUnpaid, setDateOpenUnpaid] = useState(false);

  // Table 1 Filter
  const filteredPaid = transaksi.filter((t) => {
    const matchSearch =
      t.pelanggan.toLowerCase().includes(searchPaid.toLowerCase()) ||
      t.email.toLowerCase().includes(searchPaid.toLowerCase());
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    const matchMethod = methodFilter === "all" || t.metode_pembayaran === methodFilter;
    
    let matchDate = true;
    if (dateFilterPaid) {
      matchDate = t.tanggal.toLowerCase().includes(format(dateFilterPaid, "d M").toLowerCase());
    }
    
    return matchSearch && matchStatus && matchMethod && matchDate;
  });

  // Table 2 (Belum Bayar only)
  const unpaidList = transaksi.filter((t) => t.status === "Belum Bayar");
  const filteredUnpaid = unpaidList.filter((t) => {
    const matchSearch =
      t.pelanggan.toLowerCase().includes(searchUnpaid.toLowerCase()) ||
      t.email.toLowerCase().includes(searchUnpaid.toLowerCase());
      
    let matchDate = true;
    if (dateFilterUnpaid) {
      matchDate = t.tanggal.toLowerCase().includes(format(dateFilterUnpaid, "d M").toLowerCase());
    }
    
    return matchSearch && matchDate;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Lunas":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1.5" />
            Lunas
          </span>
        );
      case "Gagal":
      case "Terlambat":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 mr-1.5" />
            Gagal
          </span>
        );
      case "Belum Bayar":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-50 text-yellow-750 border border-yellow-250">
            <span className="h-1.5 w-1.5 rounded-full bg-yellow-500 mr-1.5" />
            Belum Bayar
          </span>
        );
      case "Dibatalkan":
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-55 text-gray-600 border border-gray-200">
            <span className="h-1.5 w-1.5 rounded-full bg-gray-400 mr-1.5" />
            Dibatalkan
          </span>
        );
    }
  };

  const renderTable = (data: TransaksiItem[], emptyMsg: string) => {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pelanggan</th>
              <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Email</th>
              <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">No Hp</th>
              <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">Metode Pembayaran</th>
              <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Kode Kupon</th>
              <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tanggal</th>
              <th className="px-5 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Resi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dashed divide-slate-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center text-slate-450 py-16 text-sm">
                  {emptyMsg}
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/20 transition">
                  <td className="px-5 py-4 text-xs font-bold text-slate-800">{item.pelanggan}</td>
                  <td className="px-5 py-4 text-xs font-medium text-slate-500">{item.email}</td>
                  <td className="px-5 py-4 text-xs font-semibold text-slate-500 whitespace-nowrap">{item.no_hp}</td>
                  <td className="px-5 py-4 whitespace-nowrap">{getStatusBadge(item.status)}</td>
                  <td className="px-5 py-4 text-xs font-bold text-slate-700 text-center whitespace-nowrap">{item.metode_pembayaran}</td>
                  <td className="px-5 py-4 text-xs font-semibold text-slate-500">{item.kode_kupon}</td>
                  <td className="px-5 py-4 text-xs font-semibold text-slate-400 whitespace-nowrap">{item.tanggal}</td>
                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <button className="text-xs font-bold text-blue-600 hover:text-blue-800 underline">
                      {item.resi}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. SEMUA TRANSAKSI TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Table Header Filter Bar */}
        <div className="px-5 py-4 border-b border-slate-100 space-y-3 bg-white">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
              Semua Transaksi Produk Digital Ini
            </h3>
            <button className="text-blue-600 hover:text-blue-800 text-xs font-bold flex items-center gap-1">
              <Download className="h-3.5 w-3.5" /> Ekspor Data
            </button>
          </div>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            {/* Search */}
            <div className="relative w-64 max-w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cari Nama/Email..."
                className="pl-8 text-xs bg-slate-50/50 border-slate-200 rounded-lg w-full"
                value={searchPaid}
                onChange={(e) => setSearchPaid(e.target.value)}
              />
            </div>
            
            {/* Filters */}
            <div className="flex items-center gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36 bg-white border-slate-200 rounded-lg text-xs font-semibold text-slate-600">
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent className="z-[200]">
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="Lunas">Lunas</SelectItem>
                  <SelectItem value="Belum Bayar">Belum Bayar</SelectItem>
                  <SelectItem value="Gagal">Gagal</SelectItem>
                  <SelectItem value="Dibatalkan">Dibatalkan</SelectItem>
                </SelectContent>
              </Select>

              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger className="w-36 bg-white border-slate-200 rounded-lg text-xs font-semibold text-slate-600">
                  <SelectValue placeholder="Metode Pembayaran" />
                </SelectTrigger>
                <SelectContent className="z-[200]">
                  <SelectItem value="all">Semua Metode</SelectItem>
                  <SelectItem value="QRIS">QRIS</SelectItem>
                  <SelectItem value="Transfer Bank">Transfer Bank</SelectItem>
                </SelectContent>
              </Select>

              {/* Date Filter */}
              <Popover open={dateOpenPaid} onOpenChange={setDateOpenPaid}>
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg bg-white text-xs font-semibold hover:border-slate-350 transition text-slate-600",
                      dateFilterPaid && "text-slate-800 border-slate-450"
                    )}
                  >
                    <CalendarIcon className="h-4 w-4 text-slate-450 shrink-0" />
                    {dateFilterPaid
                      ? format(dateFilterPaid, "dd MMM yyyy", { locale: idLocale })
                      : "Pilih Tanggal"}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-[200]" align="end">
                  <Calendar
                    mode="single"
                    selected={dateFilterPaid}
                    onSelect={(d) => {
                      setDateFilterPaid(d);
                      setDateOpenPaid(false);
                    }}
                    initialFocus
                  />
                  {dateFilterPaid && (
                    <div className="p-2 border-t">
                      <button
                        className="w-full text-center text-xs text-slate-500 hover:text-slate-800 font-semibold"
                        onClick={() => {
                          setDateFilterPaid(undefined);
                          setDateOpenPaid(false);
                        }}
                      >
                        Reset Tanggal
                      </button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {renderTable(filteredPaid, "Belum ada transaksi")}

        {/* Pagination mock */}
        <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-center gap-4 text-xs font-semibold text-slate-500">
          <button className="hover:text-slate-800 disabled:opacity-50" disabled>&lt;</button>
          <span>1 / 1</span>
          <button className="hover:text-slate-800 disabled:opacity-50" disabled>&gt;</button>
        </div>
      </div>

      {/* 2. BELUM BAYAR TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Table Header Filter Bar */}
        <div className="px-5 py-4 border-b border-slate-100 space-y-3 bg-white">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
              Semua Pelanggan Belum Bayar Produk Digital Ini
            </h3>
            <button className="text-blue-600 hover:text-blue-800 text-xs font-bold flex items-center gap-1">
              <Download className="h-3.5 w-3.5" /> Ekspor Data
            </button>
          </div>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            {/* Search */}
            <div className="relative w-64 max-w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cari Nama/Email..."
                className="pl-8 text-xs bg-slate-50/50 border-slate-200 rounded-lg w-full"
                value={searchUnpaid}
                onChange={(e) => setSearchUnpaid(e.target.value)}
              />
            </div>

            {/* Date Filter */}
            <Popover open={dateOpenUnpaid} onOpenChange={setDateOpenUnpaid}>
              <PopoverTrigger asChild>
                <button
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg bg-white text-xs font-semibold hover:border-slate-350 transition text-slate-600",
                    dateFilterUnpaid && "text-slate-800 border-slate-450"
                  )}
                >
                  <CalendarIcon className="h-4 w-4 text-slate-455 shrink-0" />
                  {dateFilterUnpaid
                    ? format(dateFilterUnpaid, "dd MMM yyyy", { locale: idLocale })
                    : "Pilih Tanggal"}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-[200]" align="end">
                <Calendar
                  mode="single"
                  selected={dateFilterUnpaid}
                  onSelect={(d) => {
                    setDateFilterUnpaid(d);
                    setDateOpenUnpaid(false);
                  }}
                  initialFocus
                />
                {dateFilterUnpaid && (
                  <div className="p-2 border-t">
                    <button
                      className="w-full text-center text-xs text-slate-500 hover:text-slate-800 font-semibold"
                      onClick={() => {
                        setDateFilterUnpaid(undefined);
                        setDateOpenUnpaid(false);
                      }}
                    >
                      Reset Tanggal
                    </button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {renderTable(filteredUnpaid, "Tidak ada pelanggan yang belum bayar")}

        {/* Pagination mock */}
        <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-center gap-4 text-xs font-semibold text-slate-500">
          <button className="hover:text-slate-800 disabled:opacity-50" disabled>&lt;</button>
          <span>1 / 1</span>
          <button className="hover:text-slate-800 disabled:opacity-50" disabled>&gt;</button>
        </div>
      </div>
    </div>
  );
}