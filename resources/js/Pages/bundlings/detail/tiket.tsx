import { Mail, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export type TiketItem = {
  id: number;
  nama: string;
  email: string;
  no_wa?: string;
  status: string;
  created_at: string;
};

type Props = {
  bundlingId: number;
  tiketList?: TiketItem[];
};

export default function TabTiket({
  bundlingId,
  tiketList = [],
}: Props) {
  if (tiketList.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400 bg-white border border-gray-100 rounded-xl shadow-sm">
        <Mail className="h-16 w-16 mx-auto mb-4 opacity-20" />
        <p className="text-sm font-bold uppercase tracking-widest">Belum ada tiket/sertifikat</p>
        <p className="text-xs mt-1">Data akan muncul setelah peserta menyelesaikan pembayaran</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-black text-gray-800 text-sm uppercase tracking-tight flex items-center gap-2">
          <Mail className="h-4 w-4 text-blue-600" />
          Tiket & Sertifikat
        </h3>
        <Button size="sm" variant="outline" className="h-8 text-[10px] font-bold gap-2">
          <Download className="h-3.5 w-3.5" /> DOWNLOAD SEMUA
        </Button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              {["Nama Peserta", "Email", "WhatsApp", "Tgl Diterima", "Status"].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tiketList.map((tiket) => (
              <tr
                key={tiket.id}
                className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50 transition-colors"
              >
                <td className="px-5 py-3.5 text-xs font-bold text-gray-800">{tiket.nama}</td>
                <td className="px-5 py-3.5 text-xs text-gray-500">
                  {tiket.email}
                </td>
                <td className="px-5 py-3.5 text-xs text-gray-500 font-medium">
                  {tiket.no_wa || "-"}
                </td>
                <td className="px-5 py-3.5 text-[10px] text-gray-400 font-bold uppercase">
                  {format(new Date(tiket.created_at), "dd MMM yyyy", { locale: idLocale })}
                </td>
                <td className="px-5 py-3.5">
                  <Badge
                    className={
                      tiket.status === "sent"
                        ? "bg-green-100 text-green-700 border-green-200"
                        : "bg-blue-100 text-blue-700 border-blue-200"
                    }
                  >
                    {tiket.status === "sent" ? "TERKIRIM" : "PROSES"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}