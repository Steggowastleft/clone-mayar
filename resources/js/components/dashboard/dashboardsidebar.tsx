import { useState, useEffect } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import {
  LayoutDashboard, Users, CreditCard, Send, Package,
  MonitorPlay, Video, GraduationCap, BookOpen, Heart,
  CalendarDays, Link2, Receipt, FileText, ShoppingBag,
  Ticket, Star, Settings, User, ChevronDown, ChevronRight,
  LogOut, ChevronLeft, Menu, X, ShoppingCart, ExternalLink,
  MessageSquare,
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
  external?: boolean;
};
 
type BadgeCounts = {
  faktur?: number;
  kelasOnline?: number;
  webinar?: number;
  bootcamps?: number;
  produkDigital?: number;
  penggalanganDana?: number;
  kegiatan?: number;
  linkPembayaran?: number;
  fakturPembayaran?: number;
  bundling?: number;
  diskonKupon?: number;
  penilaianUlasan?: number;
};
 
type Props = {
  user: { id?: number; name: string; email: string; role?: string };
  currentPath?: string;
  badgeCounts?: BadgeCounts;
};
 
const ADMIN_MENU_ITEMS: NavItem[] = [
  { label: "Dashboard Admin", icon: <LayoutDashboard className="h-4 w-4" />, href: "/admin/dashboard" },
  { label: "Daftar User", icon: <Users className="h-4 w-4" />, href: "/admin/users" },
  { label: "Daftar Produk", icon: <Package className="h-4 w-4" />, href: "/admin/products" },
  { label: "Verifikasi Akun", icon: <FileText className="h-4 w-4" />, href: "/admin/verifikasi" },
  { label: "Penarikan Dana", icon: <CreditCard className="h-4 w-4" />, href: "/admin/withdrawals" },
];
 
 
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
      { label: "Pelatihan", icon: <GraduationCap className="h-3.5 w-3.5" />, href: "/bootcamps" },
      { label: "Produk Digital", icon: <BookOpen className="h-3.5 w-3.5" />, href: "/produk-digital" },
      { label: "Penggalangan Dana", icon: <Heart className="h-3.5 w-3.5" />, href: "/penggalangan-dana" },
      { label: "Kegiatan/acara", icon: <CalendarDays className="h-3.5 w-3.5" />, href: "/event" },
      { label: "Link pembayaran", icon: <Link2 className="h-3.5 w-3.5" />, href: "/payment-link" },
    ],
  },
  {
    label: "Pembayaran Tagihan",
    icon: <Receipt className="h-4 w-4" />,
    children: [
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
      { label: "Withdrawal", icon: <CreditCard className="h-3.5 w-3.5" />, href: "/pengaturan/withdrawal" },
      { label: "Ekspor Data", icon: <FileText className="h-3.5 w-3.5" />, href: "/ekspor-data" },
    ],
  },
];
 
// ─────────────────────────────────────────────
// Badge mapping helper
// ─────────────────────────────────────────────
function getBadgeForItem(label: string, badgeCounts?: BadgeCounts): number | undefined {
  const mockCounts: Record<string, number> = {
    "Faktur": 3,
    "Kelas Online": 2,
    "Webinar": 6,
    "Penggalangan Dana": 1,
    "Kegiatan/acara": 3,
    "Link pembayaran": 5,
    "Faktur Pembayaran": 1,
    "Bundling": 1,
    "Diskon dan Kupon": 1,
    "Penilaian dan Ulasan": 1,
  };
 
  if (!badgeCounts) {
    return mockCounts[label];
  }
 
  const map: Record<string, keyof BadgeCounts> = {
    "Faktur": "faktur",
    "Kelas Online": "kelasOnline",
    "Webinar": "webinar",
    "Pelatihan": "bootcamps",
    "Produk Digital": "produkDigital",
    "Penggalangan Dana": "penggalanganDana",
    "Kegiatan/acara": "kegiatan",
    "Link pembayaran": "linkPembayaran",
    "Faktur Pembayaran": "fakturPembayaran",
    "Bundling": "bundling",
    "Diskon dan Kupon": "diskonKupon",
    "Penilaian dan Ulasan": "penilaianUlasan",
  };
  const key = map[label];
  const count = key ? badgeCounts[key] : undefined;
  return count;
}
 
// ─────────────────────────────────────────────
// Single nav item
// ─────────────────────────────────────────────
function isPathActive(href: string | undefined, currentPath: string): boolean {
  if (!href) return false;
  
  const cleanPath = currentPath.split(/[?#]/)[0];
  const cleanHref = href.split(/[?#]/)[0];
  
  if (cleanHref === cleanPath) return true;
  
  if (cleanHref !== "/" && cleanHref !== "" && cleanPath.startsWith(cleanHref + "/")) {
    return true;
  }
  
  return false;
}
 
function getItemStyle(href: string | undefined, isActive: boolean) {
  if (!isActive) {
    return {
      rowClass: "text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all",
      iconClass: "text-slate-400 group-hover:text-slate-600",
      badgeClass: "bg-slate-100 text-slate-500",
    };
  }
 
  return {
    rowClass: "bg-blue-50 text-blue-600 font-semibold",
    iconClass: "text-blue-600",
    badgeClass: "bg-blue-100 text-blue-600",
  };
}
 
// ─────────────────────────────────────────────
// Single nav item
// ─────────────────────────────────────────────
function NavRow({
  item, currentPath, badgeCounts, depth = 0, onLinkClick,
}: {
  item: NavItem;
  currentPath: string;
  badgeCounts?: BadgeCounts;
  depth?: number;
  onLinkClick?: () => void;
}) {
  const hasChildren = !!(item.children && item.children.length > 0);
  const isActive = isPathActive(item.href, currentPath);
  const hasActiveChild = hasChildren && item.children!.some((c) => isPathActive(c.href, currentPath));
  const [open, setOpen] = useState(hasActiveChild);
  const badge = item.badge ?? getBadgeForItem(item.label, badgeCounts);
 
  const style = getItemStyle(item.href, isActive);
 
  if (hasChildren) {
    const parentIsActive = hasActiveChild;
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200 group
            ${parentIsActive
              ? "text-slate-900 font-semibold bg-slate-50/50"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
        >
          <span className={`shrink-0 transition-colors duration-200
            ${parentIsActive ? "text-slate-700" : "text-slate-400 group-hover:text-slate-600"}`}
          >
            {item.icon}
          </span>
          <span className="flex-1 text-left font-medium">{item.label}</span>
          {open
            ? <ChevronDown className="h-3.5 w-3.5 transition-colors duration-200 text-slate-400" />
            : <ChevronRight className="h-3.5 w-3.5 transition-colors duration-200 text-slate-400" />
          }
        </button>
        {open && (
          <div className="ml-4 mt-0.5 border-l border-slate-100 pl-3 space-y-0.5">
            {item.children!.map((child) => (
              <NavRow key={child.label} item={child} currentPath={currentPath} badgeCounts={badgeCounts} depth={depth + 1} onLinkClick={onLinkClick} />
            ))}
          </div>
        )}
      </div>
    );
  }
 
  const isLogout = item.href === "#logout";
 
  if (isLogout) {
    const handleLogout = () => router.post("/logout");
    return (
      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200 group text-slate-600 hover:bg-red-50 hover:text-red-500 font-semibold"
      >
        <span className="shrink-0 transition-colors duration-200 text-slate-400 group-hover:text-red-500">
          {item.icon}
        </span>
        <span className="flex-1 text-left font-medium">{item.label}</span>
      </button>
    );
  }
 
  const isExternal = item.external || item.href?.startsWith('http://') || item.href?.startsWith('https://') || item.href?.startsWith('//');
 
  if (isExternal) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onLinkClick}
        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200 group ${style.rowClass}`}
      >
        <span className={`shrink-0 transition-colors duration-200 ${style.iconClass}`}>
          {item.icon}
        </span>
        <span className="flex-1 font-medium">{item.label}</span>
        <ExternalLink className="h-3.5 w-3.5 opacity-60 shrink-0 ml-auto" />
      </a>
    );
  }
 
  return (
    <Link
      href={item.href || "#"}
      onClick={onLinkClick}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200 group ${style.rowClass}`}
    >
      <span className={`shrink-0 transition-colors duration-200 ${style.iconClass}`}>
        {item.icon}
      </span>
      <span className="flex-1 font-medium">{item.label}</span>
      {badge !== undefined && badge > 0 && (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-colors duration-200 ${style.badgeClass}`}>
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
  const { url, props } = usePage();
  const activePath = currentPath || url;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sidebar-collapsed") === "true";
    }
    return false;
  });

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar-collapsed", String(next));
      return next;
    });
  };

  const sharedBadgeCounts = props.sidebarBadgeCounts as BadgeCounts | undefined;
  const finalBadgeCounts = sharedBadgeCounts || badgeCounts;
 
  useEffect(() => {
    const handleToggle = () => setMobileOpen(open => !open);
    window.addEventListener('toggle-sidebar', handleToggle);
    return () => window.removeEventListener('toggle-sidebar', handleToggle);
  }, []);
 
  const isAdmin = user.role === 'admin';
  const userSlug = user.name ? user.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : user.id;
  const creatorMenuItems: NavItem[] = [
    { label: "Catalog", icon: <ShoppingCart className="h-4 w-4" />, href: `/catalog?${userSlug}`, external: true },
    ...MENU_ITEMS
  ];
  const items = isAdmin ? ADMIN_MENU_ITEMS : creatorMenuItems;
 
  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => {
    return (
      <div className="flex flex-col h-full bg-white w-60 shrink-0">
        {/* Logo */}
        <div className="px-6 py-6 flex items-center shrink-0 justify-between border-b border-slate-50">
          <Link href={isAdmin ? "/admin/dashboard" : "/dashboard"} className="flex items-center gap-2.5 group">
            <span className="font-black text-2xl tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">
              Biinscart
            </span>
          </Link>
          {/* Close — mobile */}
          {isMobile && (
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
 
        {/* Nav — scrollable */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 scrollbar-thin">
          <div className="space-y-1">
            {items.map((item) => (
              <NavRow
                key={item.label}
                item={item}
                currentPath={activePath}
                badgeCounts={finalBadgeCounts}
                onLinkClick={() => setMobileOpen(false)}
              />
            ))}
          </div>
        </div>
 
        {/* Logout button at bottom */}
        <div className="p-4 border-t border-slate-100 shrink-0 bg-slate-50/50">
          <button
            onClick={() => router.post("/logout")}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group text-slate-600 hover:bg-red-50 hover:text-red-600 font-semibold border border-transparent hover:border-red-100"
            title="Keluar"
          >
            <LogOut className="h-4 w-4 text-slate-400 group-hover:text-red-500 transition-colors" />
            <span>Keluar</span>
          </button>
        </div>
      </div>
    );
  };
 
  return (
    <>
      {/* ── Mobile toggle button ── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-4 z-40 p-2 bg-white border border-slate-100 rounded-xl shadow-sm text-slate-600 hover:text-blue-600 hover:border-blue-100 transition-all active:scale-95"
      >
        <Menu className="h-5 w-5" />
      </button>
 
      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}
 
      {/* ── Mobile sidebar ── */}
      <div className={`
        fixed top-0 left-0 h-full z-50 bg-white border-r border-slate-100 shadow-2xl
        transform transition-transform duration-300 ease-out lg:hidden
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        w-60
      `}>
        <SidebarContent isMobile={true} />
      </div>
 
      {/* ── Desktop Toggle Button ── */}
      <button
        onClick={toggleCollapse}
        className={`
          hidden lg:flex items-center justify-center fixed top-20 z-50
          w-6 h-6 bg-white border border-slate-200 rounded-full shadow-md
          text-slate-500 hover:text-blue-600 transition-all duration-300 hover:scale-105 active:scale-95
          transform -translate-x-1/2
        `}
        style={{
          left: collapsed ? "12px" : "240px",
          transition: "left 300ms ease-in-out"
        }}
        title={collapsed ? "Buka Sidebar" : "Tutup Sidebar"}
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      {/* ── Desktop sidebar ── */}
      <div className={`
        hidden lg:flex flex-col h-screen sticky top-0 bg-white border-r border-slate-100 shrink-0
        transition-all duration-300 ease-in-out
        ${collapsed ? "w-0 border-r-0" : "w-60"}
        overflow-hidden
      `}>
        <SidebarContent isMobile={false} />
      </div>
    </>
  );
}