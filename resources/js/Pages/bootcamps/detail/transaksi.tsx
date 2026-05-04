import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Printer, FileDown } from "lucide-react";

type PesertaItem = {
  id: number;
  nama: string;
  email: string;
  status?: string;
};

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
            placeholder="Cari nama / email..."
            className="pl-8 w-44 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button className="p-2 border rounded-md">
          <Printer className="h-4 w-4" />
        </button>
        <button className="p-2 border rounded-md">
          <FileDown className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function TabTransaksi({
  pesertaList = [],
  bootcamp,
}: {
  pesertaList: PesertaItem[];
  bootcamp: { harga?: number };
}) {

console.log("DARI INERTIA STRING:", JSON.stringify(pesertaList, null, 2));

  const [searchPaid, setSearchPaid] = useState("");
  const [searchUnpaid, setSearchUnpaid] = useState("");

  const cardClass = "bg-white border border-gray-200 rounded-lg shadow-sm";

  // ✅ CEK GRATIS ATAU TIDAK
  const isGratis = !bootcamp?.harga || bootcamp.harga === 0;

  // ✅ ATAS (SEMUA kalau gratis, kalau berbayar hanya paid)
  const pesertaPaid = pesertaList.filter((p) => {
    if (isGratis) return true;
    return p.status === "paid";
  });

  const filteredPaid = pesertaPaid.filter(
    (p) =>
      p.nama.toLowerCase().includes(searchPaid.toLowerCase()) ||
      p.email.toLowerCase().includes(searchPaid.toLowerCase())
  );

  // ✅ BAWAH (hanya kalau berbayar)
  const pesertaUnpaid = isGratis
    ? []
    : pesertaList.filter((p) => p.status !== "paid");

  const filteredUnpaid = pesertaUnpaid.filter(
    (p) =>
      p.nama.toLowerCase().includes(searchUnpaid.toLowerCase()) ||
      p.email.toLowerCase().includes(searchUnpaid.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* 🔵 ATAS */}
      <div className={cardClass}>
        <TableHeader
          title="Daftar Peserta / Transaksi"
          search={searchPaid}
          setSearch={setSearchPaid}
        />

        <div className="p-6">
          {filteredPaid.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">
              Belum ada peserta
            </p>
          ) : (
            <div className="space-y-2">
              {filteredPaid.map((p) => (
                <div
                  key={p.id}
                  className="flex justify-between border-b py-2 text-sm"
                >
                  <span>{p.nama}</span>
                  <span className="text-blue-600">{p.email}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 🔴 BAWAH (HANYA KALAU BERBAYAR) */}
      {!isGratis && (
        <div className={cardClass}>
          <TableHeader
            title="Peserta Belum Bayar"
            search={searchUnpaid}
            setSearch={setSearchUnpaid}
          />

          <div className="p-6">
            {filteredUnpaid.length === 0 ? (
              <p className="text-center text-gray-400 py-8 text-sm">
                Tidak ada peserta yang belum bayar
              </p>
            ) : (
              <div className="space-y-2">
                {filteredUnpaid.map((p) => (
                  <div
                    key={p.id}
                    className="flex justify-between border-b py-2 text-sm"
                  >
                    <span>{p.nama}</span>
                    <span className="text-red-500">{p.email}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
