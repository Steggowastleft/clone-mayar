import { Head, usePage } from "@inertiajs/react";
import { DashboardSidebar } from "@/components/dashboard/dashboardsidebar";
import { Toaster } from "@/components/ui/sonner";

type Props = {
  title?: string;
  children: React.ReactNode;
};

export default function DashboardLayout({ title, children }: Props) {
  const { auth, ziggy } = usePage().props as any;

  return (
    <>
      {title && <Head title={`${title} — BootcampOS`} />}
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar
          user={{
            name:  auth?.user?.name  || "Penjual",
            email: auth?.user?.email || "",
          }}
          currentPath={ziggy?.location ? new URL(ziggy.location).pathname : ""}
        />
        <main className="flex-1 min-w-0 overflow-y-auto">
          {children}
        </main>
      </div>
      <Toaster position="top-right" richColors />
    </>
  );
}