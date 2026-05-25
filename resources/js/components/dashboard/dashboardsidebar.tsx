import { useState } from "react";
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
  user: { name: string; email: string; role?: string };
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
  {
    label: "Hubungi Admin (WA)",
    icon: <MessageSquare className="h-4 w-4" />,
    href: "https://wa.me/6281234567890?text=Halo%20Admin%20AksaCart,%20saya%20ingin%20berkoordinasi%20mengenai%20layanan%20saya.",
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
function isPathActive(href: string | undefined, currentPath: string): boolean {
  if (!href) return false;
  
  // Clean paths of query parameters and hashes
  const cleanPath = currentPath.split(/[?#]/)[0];
  const cleanHref = href.split(/[?#]/)[0];
  
  if (cleanHref === cleanPath) return true;
  
  // Match subroutes e.g., href = /kelas-online, cleanPath = /kelas-online/1
  if (cleanHref !== "/" && cleanHref !== "" && cleanPath.startsWith(cleanHref + "/")) {
    return true;
  }
  
  return false;
}

function getItemStyle(href: string | undefined, isActive: boolean) {
  if (!isActive) {
    return {
      rowClass: "text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:translate-x-1",
      iconClass: "text-gray-400 group-hover:text-gray-600",
      badgeClass: "bg-blue-100 text-blue-600",
    };
  }

  const path = href ? href.split(/[?#]/)[0] : "";
  let bgClass = "bg-blue-600";
  let shadowClass = "shadow-lg shadow-blue-500/35";

  if (path.startsWith("/admin/dashboard")) {
    bgClass = "bg-rose-600";
    shadowClass = "shadow-lg shadow-rose-500/35";
  } else if (path.startsWith("/admin/verifikasi")) {
    bgClass = "bg-indigo-600";
    shadowClass = "shadow-lg shadow-indigo-500/35";
  } else if (path.startsWith("/admin/withdrawals")) {
    bgClass = "bg-emerald-600";
    shadowClass = "shadow-lg shadow-emerald-500/35";
  } else if (path.startsWith("/dashboard")) {
    bgClass = "bg-blue-600";
    shadowClass = "shadow-lg shadow-blue-500/35";
  } else if (path.startsWith("/pelanggan")) {
    bgClass = "bg-indigo-600";
    shadowClass = "shadow-lg shadow-indigo-500/35";
  } else if (path.startsWith("/transaksi")) {
    bgClass = "bg-emerald-600";
    shadowClass = "shadow-lg shadow-emerald-500/35";
  } else if (path.startsWith("/faktur")) {
    bgClass = "bg-amber-500";
    shadowClass = "shadow-lg shadow-amber-500/35";
  } else if (path.startsWith("/kelas-online")) {
    bgClass = "bg-purple-600";
    shadowClass = "shadow-lg shadow-purple-500/35";
  } else if (path.startsWith("/webinar")) {
    bgClass = "bg-red-500";
    shadowClass = "shadow-lg shadow-red-500/35";
  } else if (path.startsWith("/bootcamps")) {
    bgClass = "bg-violet-600";
    shadowClass = "shadow-lg shadow-violet-500/35";
  } else if (path.startsWith("/produk-digital")) {
    bgClass = "bg-pink-500";
    shadowClass = "shadow-lg shadow-pink-500/35";
  } else if (path.startsWith("/penggalangan-dana")) {
    bgClass = "bg-rose-500";
    shadowClass = "shadow-lg shadow-rose-500/35";
  } else if (path.startsWith("/event")) {
    bgClass = "bg-teal-600";
    shadowClass = "shadow-lg shadow-teal-500/35";
  } else if (path.startsWith("/payment-link")) {
    bgClass = "bg-sky-600";
    shadowClass = "shadow-lg shadow-sky-500/35";
  } else if (path.startsWith("/pembayaran-tagihan")) {
    bgClass = "bg-orange-500";
    shadowClass = "shadow-lg shadow-orange-500/35";
  } else if (path.startsWith("/faktur-pembayaran")) {
    bgClass = "bg-fuchsia-600";
    shadowClass = "shadow-lg shadow-fuchsia-500/35";
  } else if (path.startsWith("/bundling")) {
    bgClass = "bg-green-600";
    shadowClass = "shadow-lg shadow-green-500/35";
  } else if (path.startsWith("/diskon-kupon")) {
    bgClass = "bg-yellow-500";
    shadowClass = "shadow-lg shadow-yellow-500/35";
  } else if (path.startsWith("/penilaian-ulasan")) {
    bgClass = "bg-amber-600";
    shadowClass = "shadow-lg shadow-amber-600/35";
  } else if (path.startsWith("/pengaturan")) {
    bgClass = "bg-slate-700";
    shadowClass = "shadow-lg shadow-slate-600/35";
  }

  return {
    rowClass: `${bgClass} text-white font-semibold ${shadowClass}`,
    iconClass: "text-white",
    badgeClass: "bg-white/20 text-white",
  };
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
              ? "bg-gray-50 text-gray-900 font-semibold font-semibold"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:translate-x-1"
            }`}
        >
          <span className={`shrink-0 transition-colors duration-200
            ${parentIsActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"}`}
          >
            {item.icon}
          </span>
          <span className="flex-1 text-left font-medium">{item.label}</span>
          {open
            ? <ChevronDown className={`h-3.5 w-3.5 transition-colors duration-200 ${parentIsActive ? "text-blue-600" : "text-gray-400"}`} />
            : <ChevronRight className={`h-3.5 w-3.5 transition-colors duration-200 ${parentIsActive ? "text-blue-600" : "text-gray-400"}`} />
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

  const isExternal = item.href?.startsWith('http://') || item.href?.startsWith('https://') || item.href?.startsWith('//');

  if (isExternal) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
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
      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200 group ${style.rowClass}`}
    >
      <span className={`shrink-0 transition-colors duration-200 ${style.iconClass}`}>
        {item.icon}
      </span>
      <span className="flex-1 font-medium">{item.label}</span>
      {badge !== undefined && (
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
  const { url } = usePage();
  const activePath = currentPath || url;
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => router.post("/logout");

  const isAdmin = user.role === 'admin';
  const items = isAdmin ? ADMIN_MENU_ITEMS : MENU_ITEMS;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">

      {/* Logo */}
      <div className={`px-4 py-5 flex items-center shrink-0 ${collapsed ? "justify-center flex-col gap-3" : "justify-between"}`}>
        <Link href={isAdmin ? "/admin/dashboard" : "/dashboard"} className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm shadow-blue-200 shrink-0 group-hover:scale-110 transition-transform">
            <ShoppingCart className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-black text-3xl tracking-wide group-hover:text-blue-600 transition-colors leading-none">
                AksaCart
              </span>
              {isAdmin && (
                <span className="text-[10px] bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded w-max mt-1.5 uppercase tracking-wider leading-none">
                  Admin
                </span>
              )}
            </div>
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
          <div className={`${isAdmin ? "" : "mb-3"} px-1`}>
            <p className="text-xs font-bold text-white truncate">{user.name}</p>
            <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
          </div>
          {!isAdmin && (
            <button 
              onClick={() => window.open("/catalog", "_blank")}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black uppercase tracking-wider rounded-xl transition-all hover:shadow-lg hover:shadow-blue-500/30"
            >
              Lihat Katalog
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Nav — scrollable */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5 scrollbar-thin">

        {/* Main nav */}
        {!collapsed ? (
          <div className="space-y-0.5">
            {items.map((item) => (
              <NavRow key={item.label} item={item} currentPath={activePath} badgeCounts={badgeCounts} />
            ))}
          </div>
        ) : (
          /* Collapsed — ikon saja */
          <div className="space-y-1 pt-1">
            {items.map((item) => {
              const hasChildren = !!(item.children && item.children.length > 0);
              const isActive = item.href 
                ? isPathActive(item.href, activePath)
                : (hasChildren && item.children!.some((c) => isPathActive(c.href, activePath)));
              
              const activeHref = item.href || (hasChildren ? item.children![0].href : undefined);
              const style = getItemStyle(activeHref, isActive);
              
              if (item.href) {
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    title={item.label}
                    className={`flex items-center justify-center p-2.5 rounded-lg transition-all duration-200
                      ${isActive
                        ? `${style.rowClass}`
                        : "text-gray-400 hover:bg-gray-50 hover:text-gray-700 hover:scale-105"
                      }`}
                  >
                    {item.icon}
                  </Link>
                );
              } else if (hasChildren) {
                return (
                  <button
                    key={item.label}
                    onClick={() => setCollapsed(false)}
                    title={item.label}
                    className={`w-full flex items-center justify-center p-2.5 rounded-lg transition-all duration-200
                      ${isActive
                        ? `${style.rowClass}`
                        : "text-gray-400 hover:bg-gray-50 hover:text-gray-700 hover:scale-105"
                      }`}
                  >
                    {item.icon}
                  </button>
                );
              }
              return null;
            })}
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