import { useState } from "react";
import { Input } from "@/components/ui/input";

export type PesertaItem = {
  id: number;
  nama: string;
  email: string;
};

type Props = {
  produkId: number;
  pesertaList: PesertaItem[];
};

export default function TabPeserta({ produkId, pesertaList = [] }: Props) {
  const [search, setSearch] = useState("");

  const filtered = pesertaList.filter((p) =>
    p.nama.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white border rounded-lg">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-gray-700">Daftar Pembeli / Donatur</h3>
        <div className="relative">
          <Input
            placeholder="Cari pembeli..."
            className="pl-8 w-48 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <svg className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      <div className="p-6">
        {filtered.length === 0 ? (
          <p className="text-center text-gray-400 py-8 text-sm">Belum ada pembeli/donatur</p>
        ) : (
          <div className="space-y-2">
            {filtered.map((p) => (
              <div key={p.id} className="p-3 border border-gray-100 rounded-lg">
                <p className="font-semibold text-sm text-gray-800">{p.nama}</p>
                <p className="text-xs text-gray-500">{p.email}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}