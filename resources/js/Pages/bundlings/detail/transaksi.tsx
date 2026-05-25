import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Printer,
  Download,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Search,
} from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

type Transaction = {
  id: number;
  peserta_nama: string;
  jumlah: number;
  status: string;
  tanggal: string;
};

type Props = {
  bundlingId: number;
  transaksiList?: Transaction[];
};

function TableHeader({
  search,
  setSearch,
  title,
  count,
}: {
  search: string;
  setSearch: (v: string) => void;
  title: string;
  count: number;
}) {
  return (
    <div className="px-5 py-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/30">
      <div className="flex items-center gap-3">
        <h3 className="font-bold text-gray-800 text-sm uppercase tracking-tight">{title}</h3>
        <Badge className="bg-blue-600 text-white font-bold text-[10px]">
          {count}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
          <Input
            placeholder="Filter data..."
            className="pl-8 h-8 w-44 text-[10px] font-bold bg-white border-gray-200"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="p-1.5 border border-gray-200 rounded-md hover:bg-white text-gray-500 shadow-sm transition-all">
          <Printer className="h-3.5 w-3.5" />
        </button>
        <button className="p-1.5 border border-gray-200 rounded-md hover:bg-white text-gray-500 shadow-sm transition-all">
          <Download className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function TabTransaksi({
  bundlingId,
  transaksiList = [],
}: Props) {
  const [searchPaid, setSearchPaid] = useState("");
  
  const paidTransactions = transaksiList.filter(t => t.status === "success");
  const filteredPaid = paidTransactions.filter(t => 
    t.peserta_nama.toLowerCase().includes(searchPaid.toLowerCase())
  );

  const totalPenjualan = paidTransactions.reduce((sum, t) => sum + t.jumlah, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 p-5 rounded-xl border border-white shadow-sm">
          <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">
            Total Penjualan
          </p>
          <p className="text-2xl font-black text-green-700 mt-1">
            Rp {totalPenjualan.toLocaleString("id-ID")}
          </p>
          <div className="mt-2 h-1 w-full bg-green-200 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 w-2/3" />
          </div>
        </div>

        <div className="bg-blue-50 p-5 rounded-xl border border-white shadow-sm">
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
            Total Transaksi
          </p>
          <p className="text-2xl font-black text-blue-700 mt-1">
            {transaksiList.length}
          </p>
          <div className="mt-2 h-1 w-full bg-blue-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 w-1/2" />
          </div>
        </div>

        <div className="bg-yellow-50 p-5 rounded-xl border border-white shadow-sm">
          <p className="text-[10px] font-black text-yellow-600 uppercase tracking-widest">
            Menunggu
          </p>
          <p className="text-2xl font-black text-yellow-700 mt-1">
            {transaksiList.filter((t) => t.status === "pending").length}
          </p>
          <div className="mt-2 h-1 w-full bg-yellow-200 rounded-full overflow-hidden">
            <div className="h-full bg-yellow-500 w-1/4" />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <TableHeader 
          title="Daftar Transaksi Berhasil" 
          search={searchPaid} 
          setSearch={setSearchPaid} 
          count={filteredPaid.length}
        />
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {["Pembeli", "Jumlah Pembayaran", "Tanggal", "Status"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredPaid.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400 text-xs italic">
                    Belum ada transaksi yang sesuai
                  </td>
                </tr>
              ) : (
                filteredPaid.map((t) => (
                  <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200 text-gray-500 font-bold text-[10px]">
                          {t.peserta_nama.charAt(0)}
                        </div>
                        <p className="font-bold text-gray-800 text-xs">{t.peserta_nama}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-xs font-black text-gray-900">
                        Rp {t.jumlah.toLocaleString("id-ID")}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 text-[10px] text-gray-500 font-bold">
                      {format(new Date(t.tanggal), "dd MMM yyyy HH:mm", { locale: idLocale })}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide">
                        SUKSES
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}