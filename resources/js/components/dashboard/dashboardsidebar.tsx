import { useState } from "react";
import { Link, router } from "@inertiajs/react";
import {
  LayoutDashboard, Users, CreditCard, RefreshCw, ShoppingBag,
  Send, Package, Link2, Box, BookOpen, MonitorPlay,
  GraduationCap, Video, CalendarDays, Headphones, Heart,
  PackageOpen, BookMarked, Mic, Headphones as AudioIcon,
  PenLine, BookImage, Globe, Crown, ChevronDown, ChevronRight,
  LogOut, Zap, ChevronLeft, Menu, X,
  ShoppingCart,
} from "lucide-react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type NavItem = {
  label: string;
  icon: React.ReactNode;
  href?: string;
  badge?: string;
  children?: NavItem[];
};

type Props = {
  user: { name: string; email: string };
  currentPath?: string;
};

// ─────────────────────────────────────────────
// Nav structure — mirip Mayar
// ─────────────────────────────────────────────
const NAV_MAIN: NavItem[] = [
  { label: "Beranda", icon: <LayoutDashboard className="h-4 w-4" />, href: "/dashboard" },
  { label: "Pelanggan", icon: <Users className="h-4 w-4" />, href: "/pelanggan" },
  { label: "Transaksi", icon: <CreditCard className="h-4 w-4" />, href: "/transaksi" },
  { label: "Berlangganan", icon: <RefreshCw className="h-4 w-4" />, href: "/berlangganan" },
  { label: "Order", icon: <ShoppingBag className="h-4 w-4" />, href: "/order" },
  {
    label: "Permintaan Pembayaran",
    icon: <Send className="h-4 w-4" />,
    href: "/permintaan-pembayaran",
    children: [
      { label: "Semua Permintaan", icon: <Send className="h-3.5 w-3.5" />, href: "/permintaan-pembayaran" },
      { label: "Buat Permintaan", icon: <Send className="h-3.5 w-3.5" />, href: "/permintaan-pembayaran/buat" },
    ],
  },
];

const NAV_PRODUK: NavItem[] = [
  { label: "Semua Produk", icon: <Package className="h-4 w-4" />, href: "/semua-produk" },
  { label: "Link Pembayaran", icon: <Link2 className="h-4 w-4" />, href: "/payment-link" },
  { label: "Produk Fisik", icon: <Box className="h-4 w-4" />, href: "/produk-fisik", badge: "Beta" },
  { label: "Produk Digital", icon: <BookOpen className="h-4 w-4" />, href: "/produk-digital" },
  { label: "Kelas Online (OD)", icon: <MonitorPlay className="h-4 w-4" />, href: "/kelas-online" },
  { label: "Kelas Cohort / Bootcamp", icon: <GraduationCap className="h-4 w-4" />, href: "/bootcamps" },
  { label: "Webinar", icon: <Video className="h-4 w-4" />, href: "/webinar" },
  { label: "Event & Acara", icon: <CalendarDays className="h-4 w-4" />, href: "/event" },
  { label: "Coaching & Mentoring", icon: <Headphones className="h-4 w-4" />, href: "/coaching-mentoring" },
  { label: "Penggalangan Dana", icon: <Heart className="h-4 w-4" />, href: "/penggalangan-dana" },
  { label: "Paket Berlangganan", icon: <PackageOpen className="h-4 w-4" />, href: "/paket-berlangganan" },
  { label: "E-Book", icon: <BookMarked className="h-4 w-4" />, href: "/ebook" },
  { label: "Podcast", icon: <Mic className="h-4 w-4" />, href: "/podcast" },
  { label: "Audio Book", icon: <AudioIcon className="h-4 w-4" />, href: "/audio-book" },
  { label: "Tulisan", icon: <PenLine className="h-4 w-4" />, href: "/tulisan" },
  { label: "Web Komik", icon: <BookImage className="h-4 w-4" />, href: "/web-komik" },
  { label: "Creator Support Page", icon: <Globe className="h-4 w-4" />, href: "/creator-support-page" },
  { label: "Membership & SaaS", icon: <Crown className="h-4 w-4" />, href: "/membership-saas" },
];

// ─────────────────────────────────────────────
// Single nav item
// ─────────────────────────────────────────────
function NavRow({
  item, currentPath, depth = 0,
}: {
  item: NavItem;
  currentPath: string;
  depth?: number;
}) {
  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.href === currentPath;
  const [open, setOpen] = useState(
    hasChildren ? item.children!.some((c) => c.href === currentPath) : false
  );

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all group
            ${isActive
              ? "bg-blue-50 text-blue-700 font-semibold"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
        >
          <span className={`shrink-0 transition-colors ${isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"}`}>
            {item.icon}
          </span>
          <span className="flex-1 text-left font-medium">{item.label}</span>
          {open
            ? <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
            : <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
          }
        </button>
        {open && (
          <div className="ml-4 mt-0.5 border-l border-gray-100 pl-3 space-y-0.5">
            {item.children!.map((child) => (
              <NavRow key={child.label} item={child} currentPath={currentPath} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href || "#"}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all group
        ${isActive
          ? "bg-blue-50 text-blue-700 font-semibold"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        }`}
    >
      <span className={`shrink-0 transition-colors ${isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"}`}>
        {item.icon}
      </span>
      <span className="flex-1 font-medium">{item.label}</span>
      {item.badge && (
        <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

// ─────────────────────────────────────────────
// Main Sidebar
// ─────────────────────────────────────────────
export function DashboardSidebar({ user, currentPath = "" }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => router.post("/logout");

  const SidebarContent = () => (
    <div className="flex flex-col h-full">

      {/* Logo */}
      <div className="px-4 py-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm shadow-blue-200 shrink-0">
            <ShoppingCart className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <span className="font-black text-3xl tracking-wide">
              AksaCart
            </span>
          )}
        </div>
        {/* Collapse toggle — desktop only */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
        >
          <ChevronLeft className={`h-4 w-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
        </button>
        {/* Close — mobile */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 rounded-md hover:bg-gray-100 text-gray-400"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* User info */}
      {!collapsed && (
        <div className="mx-3 mb-3 px-3 py-2.5 bg-blue-50 rounded-xl border border-blue-100">
          <p className="text-xs font-bold text-gray-800 truncate">{user.name}</p>
          <p className="text-xs text-gray-400 truncate">{user.email}</p>
        </div>
      )}

      {/* Nav — scrollable */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5 scrollbar-thin">

        {/* Main nav */}
        {!collapsed ? (
          <>
            <div className="space-y-0.5">
              {NAV_MAIN.map((item) => (
                <NavRow key={item.label} item={item} currentPath={currentPath} />
              ))}
            </div>

            {/* Produk section */}
            <div className="pt-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-3 mb-2">
                Produk
              </p>
              <div className="space-y-0.5">
                {NAV_PRODUK.map((item) => (
                  <NavRow key={item.label} item={item} currentPath={currentPath} />
                ))}
              </div>
            </div>
          </>
        ) : (
          /* Collapsed — ikon saja */
          <div className="space-y-1 pt-1">
            {[...NAV_MAIN, ...NAV_PRODUK].map((item) => (
              <Link
                key={item.label}
                href={item.href || "#"}
                title={item.label}
                className={`flex items-center justify-center p-2.5 rounded-lg transition-all
                  ${item.href === currentPath
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-400 hover:bg-gray-50 hover:text-gray-700"
                  }`}
              >
                {item.icon}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div className="shrink-0 border-t border-gray-100 p-3 space-y-1">
        {/* Affiliate mode */}
        {!collapsed && (
          <button className="w-full flex items-center justify-center gap-2 py-2 px-3 border-2 border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition">
            <RefreshCw className="h-3.5 w-3.5" />
            Ganti ke Mode Affiliate
          </button>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold text-gray-500 hover:bg-red-50 hover:text-red-500 transition
            ${collapsed ? "justify-center" : ""}`}
        >
          <LogOut className="h-3.5 w-3.5 shrink-0" />
          {!collapsed && "Keluar"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Mobile toggle button ── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-white border border-gray-200 rounded-xl shadow-sm text-gray-600 hover:text-blue-600"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile sidebar ── */}
      <div className={`
        fixed top-0 left-0 h-full z-50 bg-white border-r border-gray-100 shadow-xl
        transform transition-transform duration-300 lg:hidden
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        w-64
      `}>
        <SidebarContent />
      </div>

      {/* ── Desktop sidebar ── */}
      <div className={`
        hidden lg:flex flex-col h-screen sticky top-0
        bg-white border-r border-gray-100
        transition-all duration-300
        ${collapsed ? "w-16" : "w-60"}
        shrink-0
      `}>
        <SidebarContent />
      </div>
    </>
  );
}