import AppLayout from "@/layouts/app-layout";
import { Head, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";


// TAB ENGINE (controller utama)
import TabBootcampDetail from "./detail/tab-detail";

// types dari tab biar props tetap aman
import type { SubmissionItem, AssignmentOption } from "./detail/grade";
import type { Assignment } from "./detail/assignment";
import type { PesertaItem } from "./detail/peserta";
import type { RatingItem } from "./detail/rating";
import type { PembayaranItem } from "./detail/pembayaran";

type Bootcamp = {
  id: number;
  name: string;
  batch: string;
  status: "published" | "unpublished" | "unlisted";
  date: string;
  participants: number;
  kategori?: string;
  harga?: number;
  deskripsi?: string;
  instruksi?: string;
  syarat_ketentuan?: string;
  cover?: string;
  cover_url?: string;
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
  console.log("PAGE PROPS:", props);

  return (
    <AppLayout>
      <Head title={bootcamp?.name || "Bootcamp Detail"} />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs text-gray-400 mb-1">
              PROJEK ·{" "}
              <button
                onClick={() => router.visit("/bootcamps")}
                className="hover:text-blue-600 transition"
              >
                Kelas Cohort / Bootcamp
              </button>
            </p>

            <h1 className="text-xl font-bold text-gray-800">
              {bootcamp?.name}
            </h1>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-blue-500 text-blue-600 hover:bg-blue-50 text-sm"
              onClick={() => window.open(`/bootcamp/${bootcamp.id}`, "_blank")}
            >
              PRODUK
            </Button>

            <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm">
              + BUAT
            </Button>
          </div>
        </div>

  

        {/* TAB SYSTEM - hanya render sekali */}
        <TabBootcampDetail {...props} />
      </div>
    </AppLayout>
  );
}