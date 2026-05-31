import { Head, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";

import DashboardLayout from "@/components/dashboard/dashboardlayout";

// TAB ENGINE (controller utama)
import TabBootcampDetail from "./detail/tab-detail";

// types dari tab biar props tetap aman
import type { SubmissionItem, AssignmentOption } from "./detail/grade";
import type { Assignment } from "./detail/assignment";
import type { PesertaItem } from "./detail/peserta";
import type { RatingItem } from "./detail/rating";
import type { PembayaranItem } from "./detail/pembayaran";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
type Bootcamp = {
  id: number;
  name: string;
  nama?: string;
  status: "published" | "unpublished" | "unlisted";
  deskripsi?: string;
  harga?: number;
  url?: string;
  tanggal_mulai?: string;
  tanggal_selesai?: string;
  cover_url?: string;

  participants?: number;
  max_peserta?: number;
};

type Props = {
  bootcamp: Bootcamp;
  sesiList?: any[];
  babList?: any[];
  assignments?: AssignmentOption[];
  submissions?: SubmissionItem[];
  assignmentList?: Assignment[];
  pesertaList?: PesertaItem[];
  ratings?: RatingItem[];
  pembayaranList?: PembayaranItem[];
};

export default function BootcampDetail(props: Props) {
  const { bootcamp } = props;

  return (
    <DashboardLayout>
      <Head title={bootcamp?.name || "Bootcamp Detail"} />

      <div className="p-6 bg-slate-50/20 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-slate-450 font-semibold mb-1">
              PROJEK ·{" "}
              <button
                onClick={() => router.visit("/bootcamps")}
                className="hover:text-blue-600 transition"
              >
                Bootcamp
              </button>
            </p>

            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              {bootcamp?.name}
            </h1>
          </div>

          <div className="flex gap-2.5">
            <Button
              variant="outline"
              className="border-gray-200 text-slate-655 hover:bg-slate-50 hover:text-slate-800 text-xs font-bold"
              onClick={() => window.open(`/bootcamp/${bootcamp.id}`, "_blank")}
            >
              PRODUK
            </Button>

            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
              onClick={() => router.visit("/semua-produk/create")}
            >
              + BUAT
            </Button>
          </div>
        </div>

        {/* TAB SYSTEM - hanya render sekali */}
        <TabBootcampDetail {...props} />
      </div>
    </DashboardLayout>
  );
}