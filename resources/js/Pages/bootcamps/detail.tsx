import { Head } from "@inertiajs/react";
import DashboardLayout from "@/components/dashboard/dashboardlayout";
import TabBootcampDetail from "./detail/tab-detail";

/**
 * BOOTCAMP DETAIL PAGE — Entry Point
 * 
 * File ini adalah wrapper/entry point untuk halaman detail bootcamp.
 * Semua logic dan rendering ditangani oleh TabBootcampDetail component.
 */

type Props = {
  bootcamp: any;
  sesiList?: any[];
  babList?: any[];
  assignments?: any[];
  submissions?: any[];
  assignmentList?: any[];
  pesertaList?: any[];
  ratings?: any[];
  pembayaranList?: any[];
};

export default function BootcampDetail(props: Props) {
  const { bootcamp } = props;

  return (
    <DashboardLayout>
      <Head title={bootcamp?.name || "Detail Bootcamp"} />
      <TabBootcampDetail {...props} />
    </DashboardLayout>
  );
}