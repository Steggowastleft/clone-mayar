import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Copy, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

import type { Webinar } from "../detail";

export default function TabDetail({ webinar }: { webinar: Webinar }) {
  const [deskOpen, setDeskOpen] = useState(false);
  const baseUrl = window.location.origin;

  const rows = [
    {
      label: "Status",
      value: (
        <Badge
          className={cn(
            "text-white text-xs",
            webinar.status === "published"
              ? "bg-green-500"
              : webinar.status === "unlisted"
              ? "bg-gray-500"
              : "bg-yellow-500"
          )}
        >
          {webinar.status}
        </Badge>
      ),
    },
    { label: "Nama", value: webinar.nama },
    {
      label: "URL Webinar",
      value: webinar.url || "-",
    },
    { label: "Peserta", value: webinar.peserta },
    { label: "Max Peserta", value: webinar.max_peserta ?? "-" },
    {
      label: "Tanggal Mulai",
      value: webinar.tanggal_mulai ?? "-",
    },
    {
      label: "Tanggal Selesai",
      value: webinar.tanggal_selesai ?? "-",
    },
    {
      label: "Deskripsi",
      value: (
        <button
          onClick={() => setDeskOpen(true)}
          className="text-blue-600 text-sm underline"
        >
          Lihat Deskripsi
        </button>
      ),
    },
  ];

  return (
    <>
      {/* SHARE */}
      <div className="bg-white border rounded-lg p-5 mb-5">
        <h3 className="font-semibold mb-4">Share Link</h3>

        <div className="grid grid-cols-2 gap-4">
          {[
            {
              label: "COPY LINK",
              url: `${baseUrl}/p/${webinar.id}/webinar`,
            },
            {
              label: "OPEN",
              url: `${baseUrl}/webinar/${webinar.id}`,
            },
          ].map((item) => (
            <div key={item.label}>
              <div className="px-3 py-2 bg-gray-50 border text-xs truncate">
                {item.url}
              </div>

              <button
                onClick={() => navigator.clipboard.writeText(item.url)}
                className="w-full py-2 border text-xs flex items-center justify-center gap-2"
              >
                <Copy className="h-3 w-3" />
                {item.label}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border rounded-lg">
        <table className="w-full">
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b">
                <td className="px-5 py-3 text-sm text-gray-500 w-56">
                  {row.label}
                </td>
                <td className="px-5 py-3 text-sm">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      <Dialog open={deskOpen} onOpenChange={setDeskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deskripsi</DialogTitle>
          </DialogHeader>

          <div className="text-sm whitespace-pre-wrap">
            {webinar.deskripsi || "Tidak ada deskripsi"}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}