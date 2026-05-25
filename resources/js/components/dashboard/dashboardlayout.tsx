import { Head, usePage } from "@inertiajs/react";
import { DashboardSidebar } from "@/components/dashboard/dashboardsidebar";
import { Toaster } from "@/components/ui/sonner";

type Props = {
  title?: string;
  children: React.ReactNode;
};

export default function DashboardLayout({ title, children }: Props) {
  const { auth } = usePage().props as any;
  const { url } = usePage();
  const currentPath = url.split(/[?#]/)[0];

  return (
    <>
      {title && <Head title={`${title} — BiinsCart`} />}
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar
          user={{
            name:  auth?.user?.name  || "Penjual",
            email: auth?.user?.email || "",
            role:  auth?.user?.role,
          }}
          currentPath={currentPath}
        />
        <main className="flex-1 min-w-0 overflow-y-auto">
          {children}
        </main>
      </div>
      <Toaster position="top-right" richColors />
    </>
  );
}