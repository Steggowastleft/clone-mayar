import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Printer, FileDown } from "lucide-react";

function TableHeader({
  search,
  setSearch,
  title,
}: {
  search: string;
  setSearch: (v: string) => void;
  title: string;
}) {
  return (
    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
      <h3 className="font-semibold text-gray-700">{title}</h3>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Input
            placeholder="Filter halaman..."
            className="pl-8 w-44 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <svg
            className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <button className="p-2 border border-gray-200 rounded-md hover:bg-gray-50 text-gray-500">
          <Printer className="h-4 w-4" />
        </button>
        <button className="p-2 border border-gray-200 rounded-md hover:bg-gray-50 text-gray-500">
          <FileDown className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function TabTransaksi({ coachingId }: { coachingId: number }) {
  const [search, setSearch] = useState("");

  // ✅ pindahin ke sini
  const [searchPaid, setSearchPaid] = useState("");
  const [searchUnpaid, setSearchUnpaid] = useState("");
  const cardClass = "bg-white border border-gray-200 rounded-lg shadow-sm";

  return (
    <div className="space-y-5">
      {/* CARD 1 */}
      <div className={cardClass}>
        <TableHeader
          title="Daftar Peserta / Transaksi"
          search={searchPaid}
          setSearch={setSearchPaid}
        />
        <div className="p-6">
          <p className="text-center text-gray-400 py-8 text-sm">
            Belum ada transaksi
          </p>
        </div>
      </div>

      {/* CARD 2 */}
      <div className={cardClass}>
        <TableHeader
          title="Peserta Belum Bayar"
          search={searchUnpaid}
          setSearch={setSearchUnpaid}
        />
        <div className="p-6">
          <p className="text-center text-gray-400 py-8 text-sm">
            Tidak ada peserta yang belum bayar
          </p>
        </div>
      </div>
    </div>
  );
}