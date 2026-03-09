import React, { ReactNode } from "react";
import { router, Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";

type AppLayoutProps = {
  children: ReactNode;
  header?: ReactNode; 
};

export default function AppLayout({ children, header }: AppLayoutProps) {
  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    router.post("/logout");
  };

  return (  
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">My Bootcamp Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/bootcamps">
            <Button>Dashboard</Button>
          </Link>
          <Button onClick={handleLogout} variant="destructive">
            Logout
          </Button>
        </div>
      </header>

      <main className="p-6 flex-1">{children}</main>

      <footer className="bg-white shadow p-4 text-center text-sm text-gray-500">
        &copy; 2026 My Bootcamp
      </footer>
    </div>
  );
}