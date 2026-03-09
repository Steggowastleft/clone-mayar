// resources/js/layouts/GuestLayout.tsx
import { ReactNode } from "react";

type GuestLayoutProps = {
  children: ReactNode;
};

export default function GuestLayout({ children }: GuestLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {children}
    </div>
  );
}