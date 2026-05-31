import { Bell, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface Transaction {
  id: string | number;
  type: "income" | "expense" | "refund";
  buyerName: string;
  actionText: string;
  avatar?: string;
  amount: string | number;
  date: string;
}

interface DashboardHeaderProps {
  userName: string;
  userRole?: string;
  onMenuClick?: () => void;
  transactions?: Transaction[];
}

export function DashboardHeader({ userName, userRole = 'Creator', onMenuClick, transactions = [] }: DashboardHeaderProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = userName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  return (
    <header className="sticky top-0 z-40 bg-[#f8fafc] border-b border-slate-100">
      <div className="px-6 h-14 flex items-center justify-between">
        {/* Left: page greeting */}
        <div className="flex items-center gap-3">
          <p className="text-sm font-semibold text-slate-800">
            Hai, {userName}
          </p>
        </div>

        {/* Right: Empty */}
        <div />
      </div>
    </header>
  );
}
