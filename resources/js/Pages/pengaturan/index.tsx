import AppLayout from "@/layouts/app-layout";
import { Head } from "@inertiajs/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { User, Bell, Shield, CreditCard, Globe, ChevronRight, Download } from "lucide-react";
import Dashboard from "../dashboard";
import DashboardLayout from "@/components/dashboard/dashboardlayout";

type PengaturanProps = {
  user?: {
    name: string;
    email: string;
    no_hp?: string;
    bio?: string;
    website?: string;
  };
};

export default function PengaturanIndex({ user }: PengaturanProps) {
  const [activeSection, setActiveSection] = useState("profil");
  const u = user ?? { name: "", email: "", no_hp: "", bio: "", website: "" };
  const [form, setForm] = useState({ ...u });

  const sections = [
    { id: "profil",       label: "Profil",            icon: <User className="h-4 w-4" /> },
    { id: "notifikasi",   label: "Notifikasi",         icon: <Bell className="h-4 w-4" /> },
    { id: "keamanan",     label: "Keamanan",           icon: <Shield className="h-4 w-4" /> },
    { id: "pembayaran",   label: "Metode Pembayaran",  icon: <CreditCard className="h-4 w-4" /> },
    { id: "toko",         label: "Pengaturan Toko",    icon: <Globe className="h-4 w-4" /> },
    { id: "ekspor",       label: "Ekspor Data",       icon: <Download className="h-4 w-4" /> },
  ];

  return (
    <DashboardLayout>
      <Head title="Pengaturan" />
      <div className="flex gap-0 min-h-screen">
        {/* Sections sidebar */}
        <div className="w-56 border-r border-gray-200 bg-white p-3 space-y-0.5 shrink-0">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 pb-2 pt-1">Pengaturan</p>
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition",
                activeSection === s.id
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <span className={activeSection === s.id ? "text-blue-600" : "text-gray-400"}>{s.icon}</span>
              <span className="flex-1 text-left">{s.label}</span>
              <ChevronRight className={cn("h-3.5 w-3.5 text-gray-400", activeSection === s.id && "text-blue-400")} />
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          {activeSection === "profil" && (
            <div className="max-w-xl">
              <h2 className="text-lg font-bold text-gray-800 mb-5">Profil</h2>
              <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700">Nama Lengkap</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700">Email</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700">No. HP</Label>
                  <Input value={form.no_hp ?? ""} onChange={(e) => setForm({ ...form, no_hp: e.target.value })} placeholder="+62..." />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700">Bio</Label>
                  <Textarea value={form.bio ?? ""} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} placeholder="Ceritakan tentang diri Anda..." />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700">Website</Label>
                  <Input value={form.website ?? ""} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://..." />
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">Simpan Perubahan</Button>
              </div>
            </div>
          )}

          {activeSection === "notifikasi" && (
            <div className="max-w-xl">
              <h2 className="text-lg font-bold text-gray-800 mb-5">Notifikasi</h2>
              <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
                {["Transaksi Baru", "Pelanggan Baru", "Komentar", "Laporan Mingguan"].map((item) => (
                  <div key={item} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-700">{item}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-10 h-5 bg-gray-200 peer-checked:bg-blue-600 rounded-full transition peer-focus:ring-2 peer-focus:ring-blue-300 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
                    </label>
                  </div>
                ))}
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">Simpan</Button>
              </div>
            </div>
          )}

          {activeSection === "keamanan" && (
            <div className="max-w-xl">
              <h2 className="text-lg font-bold text-gray-800 mb-5">Keamanan</h2>
              <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700">Password Saat Ini</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700">Password Baru</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-700">Konfirmasi Password Baru</Label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">Update Password</Button>
              </div>
            </div>
          )}

          {(activeSection === "pembayaran" || activeSection === "toko") && (
            <div className="max-w-xl">
              <h2 className="text-lg font-bold text-gray-800 mb-5">
                {sections.find((s) => s.id === activeSection)?.label}
              </h2>
              <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                <p className="text-gray-400 text-sm">Fitur ini akan segera tersedia</p>
              </div>
            </div>
          )}

          {activeSection === "ekspor" && (
            <div className="max-w-xl">
              <h2 className="text-lg font-bold text-gray-800 mb-5">Ekspor Data</h2>
              <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-6">
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Pilih tipe data produk yang ingin Anda ekspor. File akan diunduh dalam format spreadsheet CSV (Comma-Separated Values).
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Tipe Produk</Label>
                  <select 
                    id="export-type-select"
                    className="w-full bg-[#eaedf0] border-0 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                    defaultValue="all"
                  >
                    <option value="all">Semua Produk</option>
                    <option value="bootcamp">Kelas Cohort / Bootcamp</option>
                    <option value="kelas-online">Kelas Online</option>
                    <option value="webinar">Webinar</option>
                    <option value="produk-digital">Produk Digital</option>
                    <option value="coaching-mentoring">Coaching & Mentoring</option>
                    <option value="bundling">Bundling</option>
                    <option value="payment-link">Link Pembayaran</option>
                    <option value="penggalangan-dana">Penggalangan Dana</option>
                  </select>
                </div>

                <Button 
                  onClick={() => {
                    const select = document.getElementById("export-type-select") as HTMLSelectElement;
                    const val = select ? select.value : "all";
                    window.open(`/pengaturan/ekspor?type=${val}`, "_blank");
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold w-full py-2.5"
                >
                  Unduh File Ekspor (.csv)
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
