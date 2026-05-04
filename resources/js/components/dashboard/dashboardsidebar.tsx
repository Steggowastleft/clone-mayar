import { useState } from "react";
import { Link, router } from "@inertiajs/react";
import {
  LayoutDashboard, Users, CreditCard, Send, Package,
  MonitorPlay, Video, GraduationCap, BookOpen, Heart,
  CalendarDays, Link2, Receipt, FileText, ShoppingBag,
  Ticket, Star, Settings, User, ChevronDown, ChevronRight,
  LogOut, ChevronLeft, Menu, X, ShoppingCart, ExternalLink,
} from "lucide-react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type NavItem = {
  label: string;
  icon: React.ReactNode;
  href?: string;
  badge?: number;
  children?: NavItem[];
};

type BadgeCounts = {
  faktur?: number;
  kelasOnline?: number;
  webinar?: number;
  penggalanganDana?: number;
  kegiatan?: number;
  linkPembayaran?: number;
  fakturPembayaran?: number;
  bundling?: number;
  penilaianUlasan?: number;
};

type Props = {
  user: { name: string; email: string };
  currentPath?: string;
  badgeCounts?: BadgeCounts;
};

// ─────────────────────────────────────────────
// Menu Structure - Final
// ─────────────────────────────────────────────
const MENU_ITEMS: NavItem[] = [
  { label: "Menu Utama", icon: <LayoutDashboard className="h-4 w-4" />, href: "/dashboard" },
  { label: "Pelanggan", icon: <Users className="h-4 w-4" />, href: "/pelanggan" },
  { label: "Transaksi", icon: <CreditCard className="h-4 w-4" />, href: "/transaksi" },
  {
    label: "Permintaan Pembayaran",
    icon: <Send className="h-4 w-4" />,
    children: [
      { label: "Faktur", icon: <FileText className="h-3.5 w-3.5" />, href: "/faktur" },
    ],
  },
  {
    label: "Semua Produk",
    icon: <Package className="h-4 w-4" />,
    children: [
      { label: "Kelas Online", icon: <MonitorPlay className="h-3.5 w-3.5" />, href: "/kelas-online" },
      { label: "Webinar", icon: <Video className="h-3.5 w-3.5" />, href: "/webinar" },
      { label: "Bootcamp", icon: <GraduationCap className="h-3.5 w-3.5" />, href: "/bootcamps" },
      { label: "Produk Digital", icon: <BookOpen className="h-3.5 w-3.5" />, href: "/produk-digital" },
      { label: "Penggalangan Dana", icon: <Heart className="h-3.5 w-3.5" />, href: "/penggalangan-dana" },
      { label: "Kegiatan / Acara", icon: <CalendarDays className="h-3.5 w-3.5" />, href: "/event" },
      { label: "Link Pembayaran", icon: <Link2 className="h-3.5 w-3.5" />, href: "/payment-link" },
      { label: "Pembayaran Tagihan", icon: <Receipt className="h-3.5 w-3.5" />, href: "/pembayaran-tagihan" },
      { label: "Faktur Pembayaran", icon: <FileText className="h-3.5 w-3.5" />, href: "/faktur-pembayaran" },
    ],
  },
  {
    label: "Pemasaran",
    icon: <ShoppingBag className="h-4 w-4" />,
    children: [
      { label: "Bundling", icon: <Package className="h-3.5 w-3.5" />, href: "/bundling" },
      { label: "Diskon dan Kupon", icon: <Ticket className="h-3.5 w-3.5" />, href: "/diskon-kupon" },
      { label: "Penilaian dan Ulasan", icon: <Star className="h-3.5 w-3.5" />, href: "/penilaian-ulasan" },
    ],
  },
  {
    label: "Pengaturan",
    icon: <Settings className="h-4 w-4" />,
    children: [
      { label: "Akun", icon: <User className="h-3.5 w-3.5" />, href: "/pengaturan/akun" },
    ],
  },
];

// ─────────────────────────────────────────────
// Badge mapping helper
// ─────────────────────────────────────────────
function getBadgeForItem(label: string, badgeCounts?: BadgeCounts): number | undefined {
  if (!badgeCounts) return undefined;
  const map: Record<string, keyof BadgeCounts> = {
    "Faktur": "faktur",
    "Kelas Online": "kelasOnline",
    "Webinar": "webinar",
    "Penggalangan Dana": "penggalanganDana",
    "Kegiatan / Acara": "kegiatan",
    "Link Pembayaran": "linkPembayaran",
    "Faktur Pembayaran": "fakturPembayaran",
    "Bundling": "bundling",
    "Penilaian dan Ulasan": "penilaianUlasan",
  };
  const key = map[label];
  return key ? badgeCounts[key] : undefined;
}

// ─────────────────────────────────────────────
// Single nav item
// ─────────────────────────────────────────────
function NavRow({
  item, currentPath, badgeCounts, depth = 0,
}: {
  item: NavItem;
  currentPath: string;
  badgeCounts?: BadgeCounts;
  depth?: number;
}) {
  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.href === currentPath;
  const [open, setOpen] = useState(
    hasChildren ? item.children!.some((c) => c.href === currentPath) : false
  );
  const badge = item.badge ?? getBadgeForItem(item.label, badgeCounts);

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
              <NavRow key={child.label} item={child} currentPath={currentPath} badgeCounts={badgeCounts} depth={depth + 1} />
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
      {badge !== undefined && (
        <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </Link>
  );
}

// ─────────────────────────────────────────────
// Main Sidebar
// ─────────────────────────────────────────────
export function DashboardSidebar({ user, currentPath = "", badgeCounts }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => router.post("/logout");

  const SidebarContent = () => (
    <div className="flex flex-col h-full">

      {/* Logo */}
      <div className={`px-4 py-5 flex items-center shrink-0 ${collapsed ? "justify-center flex-col gap-3" : "justify-between"}`}>
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm shadow-blue-200 shrink-0 group-hover:scale-110 transition-transform">
            <ShoppingCart className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <span className="font-black text-3xl tracking-wide group-hover:text-blue-600 transition-colors">
              AksaCart
            </span>
          )}
        </Link>
        {/* Collapse toggle — desktop only */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`hidden lg:flex p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition ${collapsed ? "" : ""}`}
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

      {/* User info & Shop Link */}
      {!collapsed && (
        <div className="mx-3 mb-3 p-3 bg-slate-900 rounded-2xl border border-slate-800 shadow-lg shadow-slate-200">
          <div className="mb-3 px-1">
            <p className="text-xs font-bold text-white truncate">{user.name}</p>
            <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
          </div>
          <button 
            onClick={() => window.open("/catalog", "_blank")}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black uppercase tracking-wider rounded-xl transition-all hover:shadow-lg hover:shadow-blue-500/30"
          >
            Lihat Katalog
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Nav — scrollable */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5 scrollbar-thin">

        {/* Main nav */}
        {!collapsed ? (
          <div className="space-y-0.5">
            {MENU_ITEMS.map((item) => (
              <NavRow key={item.label} item={item} currentPath={currentPath} badgeCounts={badgeCounts} />
            ))}
          </div>
        ) : (
          /* Collapsed — ikon saja */
          <div className="space-y-1 pt-1">
            {MENU_ITEMS.map((item) => (
              item.href ? (
                <Link
                  key={item.label}
                  href={item.href}
                  title={item.label}
                  className={`flex items-center justify-center p-2.5 rounded-lg transition-all
                    ${item.href === currentPath
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-400 hover:bg-gray-50 hover:text-gray-700"
                    }`}
                >
                  {item.icon}
                </Link>
              ) : null
            ))}
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div className="shrink-0 border-t border-gray-100 p-3">
        {/* Logout */}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold text-gray-500 hover:bg-red-50 hover:text-red-500 transition
            ${collapsed ? "justify-center" : ""}`}
        >
          <LogOut className="h-3.5 w-3.5 shrink-0" />
          {!collapsed && "Log Out"}
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