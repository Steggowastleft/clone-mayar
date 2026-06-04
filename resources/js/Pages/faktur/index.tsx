import { Head, Link, useForm } from "@inertiajs/react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Settings, 
  Search, 
  Eye, 
  Check, 
  AlertCircle,
  Building,
  Mail,
  Phone,
  MapPin,
  PenTool,
  Sparkles,
  Layout,
  LayoutGrid,
  FileCode,
  Send,
  CreditCard,
  User,
  DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";
import DashboardLayout from "@/components/dashboard/dashboardlayout";
import { toast } from "sonner";
import axios from "axios";

type Transaksi = {
  id: number;
  kode: string;
  nama_pembeli: string;
  email: string;
  no_hp: string;
  produk: string;
  jenis_produk: string;
  jumlah: number;
  status: "pending";
  tanggal: string;
  penjual: string;
  redirect_url: string;
};

type FakturSetting = {
  company_name?: string;
  company_email?: string;
  company_phone?: string;
  company_address?: string;
  notes?: string;
  template_id: string;
  signature_name?: string;
  signature_title?: string;
} | null;

type Props = {
  transaksi: Transaksi[];
  fakturSetting: FakturSetting;
  userDefault: {
    name: string;
    email: string;
    phone: string;
    address: string;
    bank_provider: string;
    bank_account_number: string;
    bank_account_name: string;
  };
};

export default function FakturIndex({ transaksi = [], fakturSetting, userDefault }: Props) {
  const [activeTab, setActiveTab] = useState<"daftar" | "pengaturan">("daftar");
  const [search, setSearch] = useState("");
  const [isSendingAll, setIsSendingAll] = useState(false);

  // Setup form using Inertia useForm
  const { data, setData, post, processing } = useForm({
    company_name: fakturSetting?.company_name || userDefault.name || "",
    company_email: fakturSetting?.company_email || userDefault.email || "",
    company_phone: fakturSetting?.company_phone || userDefault.phone || "",
    company_address: fakturSetting?.company_address || userDefault.address || "",
    notes: fakturSetting?.notes || "Terima kasih atas kepercayaan Anda bertransaksi dengan kami.",
    template_id: fakturSetting?.template_id || "1",
    signature_name: fakturSetting?.signature_name || userDefault.name || "",
    signature_title: fakturSetting?.signature_title || "Pemilik Bisnis",
  });

  const handleSubmitSettings = (e: React.FormEvent) => {
    e.preventDefault();
    post("/faktur/settings", {
      onSuccess: () => {
        toast.success("Pengaturan faktur berhasil disimpan!");
      },
      onError: () => {
        toast.error("Gagal menyimpan pengaturan faktur.");
      }
    });
  };

  const handleSendAllReminders = async () => {
    if (transaksi.length === 0) {
      toast.info("Tidak ada tagihan pending yang perlu dikirimi pengingat.");
      return;
    }
    setIsSendingAll(true);
    try {
      const response = await axios.post("/pembayaran-tagihan/remind", {
        ids: transaksi.map((t) => t.id),
        channel: "both",
        method: "direct",
      });
      if (response.data.success) {
        toast.success(`Berhasil mengirim notifikasi Email & WA ke ${transaksi.length} pelanggan.`);
      } else {
        toast.error("Gagal mengirim pengingat.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan saat menghubungi sistem pengingat.");
    } finally {
      setIsSendingAll(false);
    }
  };

  const filteredTransactions = transaksi.filter((t) => {
    return (
      t.nama_pembeli.toLowerCase().includes(search.toLowerCase()) ||
      t.kode.toLowerCase().includes(search.toLowerCase()) ||
      t.produk.toLowerCase().includes(search.toLowerCase())
    );
  });

  const totalNominal = filteredTransactions.reduce((acc, t) => acc + t.jumlah, 0);

  // Template metadata
  const templates = [
    {
      id: "1",
      name: "Template 1: Minimalist Clean",
      desc: "Desain hitam-putih formal, garis tipis presisi, tampilan korporat klasik.",
      previewBg: "bg-slate-50 border-slate-300",
      accentColor: "bg-slate-900"
    },
    {
      id: "2",
      name: "Template 2: Modern Gradient",
      desc: "Sentuhan banner gradient biru-indigo dinamis dan modern.",
      previewBg: "bg-blue-50/50 border-blue-200",
      accentColor: "bg-gradient-to-r from-blue-600 to-indigo-600"
    },
    {
      id: "3",
      name: "Template 3: Professional Classic",
      desc: "Kombinasi hijau emerald formal, berwibawa, & profesional tinggi.",
      previewBg: "bg-emerald-50/40 border-emerald-250",
      accentColor: "bg-emerald-800"
    }
  ];

  return (
    <DashboardLayout>
      <Head title="Faktur Pembayaran" />

      <div className="p-6 space-y-8 bg-slate-50/40 min-h-screen pb-32">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-indigo-50 text-indigo-700 text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-indigo-200">
                Billing System
              </span>
              <span className="bg-yellow-50 text-yellow-700 text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-yellow-200 flex items-center gap-1">
                <span className="h-1 w-1 bg-yellow-500 rounded-full animate-ping" /> Pending Faktur
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none flex items-center gap-2">
              Faktur Permintaan
            </h1>
            <p className="text-[11px] text-slate-450 mt-1.5 font-medium max-w-xl leading-relaxed">
              Atur kustomisasi template dan kelola penagihan Anda. Faktur otomatis digenerasikan secara formal ketika pembayaran pelanggan berstatus pending.
            </p>
          </div>

          {/* Navigation Tab Toggle (Pill Selector) */}
          <div className="flex bg-slate-200/60 border border-slate-300/40 p-1 rounded-xl self-stretch md:self-auto shadow-xs">
            <button
              onClick={() => setActiveTab("daftar")}
              className={cn(
                "flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-extrabold tracking-wide transition duration-150",
                activeTab === "daftar" 
                  ? "bg-white text-slate-900 shadow-sm border border-slate-250/20" 
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              <FileText className="h-3.5 w-3.5" /> Daftar Faktur
            </button>
            <button
              onClick={() => setActiveTab("pengaturan")}
              className={cn(
                "flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-extrabold tracking-wide transition duration-150",
                activeTab === "pengaturan" 
                  ? "bg-white text-slate-900 shadow-sm border border-slate-250/20" 
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              <Settings className="h-3.5 w-3.5" /> Pengaturan Kustom
            </button>
          </div>
        </div>

        {activeTab === "daftar" ? (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            {/* Dynamic Metrics Panel */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between hover:shadow-sm transition relative overflow-hidden group">
                <div className="absolute top-0 left-0 h-1 w-full bg-yellow-400" />
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Faktur Pending</p>
                  <h3 className="text-2xl font-black text-slate-900">{filteredTransactions.length}</h3>
                  <p className="text-[9px] text-yellow-600 font-bold">Perlu Tindakan Pembayaran</p>
                </div>
                <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center text-yellow-600 group-hover:scale-105 transition-transform shrink-0">
                  <AlertCircle size={18} />
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between hover:shadow-sm transition relative overflow-hidden group">
                <div className="absolute top-0 left-0 h-1 w-full bg-indigo-500" />
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Tagihan</p>
                  <h3 className="text-2xl font-black text-slate-900">Rp {totalNominal.toLocaleString("id-ID")}</h3>
                  <p className="text-[9px] text-indigo-600 font-bold font-mono">IDR</p>
                </div>
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-650 group-hover:scale-105 transition-transform shrink-0">
                  <FileText size={18} />
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xs flex items-center justify-between relative overflow-hidden group text-white">
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-indigo-300 uppercase tracking-wider">Template Faktur Aktif</p>
                  <h3 className="text-sm font-black">{templates.find(t => t.id === data.template_id)?.name || "Template 1"}</h3>
                  <p className="text-[9px] text-indigo-200 font-semibold flex items-center gap-1 mt-1">
                    <Sparkles size={9} className="text-yellow-400" /> Auto-Generated
                  </p>
                </div>
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-indigo-300 shrink-0">
                  <Layout size={18} />
                </div>
              </div>
            </div>

            {/* Filtering Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 border border-slate-200 rounded-2xl shadow-xs">
              <div className="relative flex-1 max-w-md w-full">
                <Input
                  placeholder="Cari pembeli, kode order, produk..."
                  className="pl-8 text-[11px] h-8 rounded-lg border-slate-200 bg-slate-50/50 focus:bg-white transition w-full"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                {filteredTransactions.length > 0 && (
                  <Button
                    onClick={handleSendAllReminders}
                    disabled={isSendingAll}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] h-8 px-3 rounded-lg flex items-center gap-1 transition active:scale-95 duration-100 shadow-sm shrink-0"
                  >
                    <Send className="h-3 w-3" /> {isSendingAll ? "Mengirim Notifikasi..." : "Kirim Pengingat Masal (Email & WA)"}
                  </Button>
                )}
                <span className="text-[10px] text-slate-450 font-bold">
                  Menampilkan <span className="text-slate-800 font-extrabold">{filteredTransactions.length}</span> tagihan pending
                </span>
              </div>
            </div>

            {/* Invoices List Table */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-100/50 text-[9px] font-black text-slate-450 uppercase tracking-widest">
                      <th className="py-3 px-6 w-44">Kode Order</th>
                      <th className="py-3 px-4 min-w-[180px]">Pelanggan</th>
                      <th className="py-3 px-4 min-w-[200px]">Produk / Layanan</th>
                      <th className="py-3 px-4 w-32">Nominal</th>
                      <th className="py-3 px-4 w-36">Tanggal dibuat</th>
                      <th className="py-3 px-4 w-28 text-center">Status</th>
                      <th className="py-3 px-6 text-right w-32">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-450 text-[11px] font-semibold">
                          Tidak ada tagihan pending yang ditemukan.
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((t) => {
                        return (
                          <tr key={t.id} className="group hover:bg-slate-55/20 transition duration-150">
                            <td className="py-3.5 px-6">
                              <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 border border-slate-200/50 rounded px-2 py-0.5">
                                {t.kode}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-800 truncate">{t.nama_pembeli}</p>
                                <p className="text-[10px] text-slate-450 truncate">{t.email}</p>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="min-w-0 space-y-0.5">
                                <p className="text-xs font-bold text-slate-650 truncate" title={t.produk}>
                                  {t.produk}
                                </p>
                                <span className="inline-block text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border bg-indigo-50/50 text-indigo-700 border-indigo-100">
                                  {t.jenis_produk}
                                </span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="text-xs font-extrabold text-slate-800">
                                Rp {t.jumlah.toLocaleString("id-ID")}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-[10px] font-semibold text-slate-500">
                              {t.tanggal}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <Badge className="bg-yellow-50 text-yellow-750 border border-yellow-200 text-[8px] font-extrabold px-2 py-0.2 rounded-full">
                                PENDING
                              </Badge>
                            </td>
                            <td className="py-3.5 px-6 text-right">
                              <Link
                                href={`/faktur/${t.id}`}
                                className="inline-flex items-center gap-1 justify-center text-[10px] font-extrabold h-7 px-3 rounded-lg border border-indigo-100 bg-indigo-50 hover:bg-indigo-100 text-indigo-750 shadow-xs transition"
                              >
                                <Eye className="h-3 w-3" /> Detail
                              </Link>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* Custom Settings Tab */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in-50 duration-200">
            
            {/* Form Column */}
            <form onSubmit={handleSubmitSettings} className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 md:p-8 space-y-6 shadow-xs">
              <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-650 shrink-0">
                  <PenTool className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900">Informasi Identitas Faktur</h2>
                  <p className="text-[10px] text-slate-400 font-medium">Lengkapi rincian usaha Anda untuk dicantumkan di bagian kepala faktur.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="company_name" className="text-[10px] font-bold text-slate-600">Nama Perusahaan / Bisnis</Label>
                  <div className="relative">
                    <Input
                      id="company_name"
                      placeholder="Contoh: CV. Berkah Abadi"
                      className="pl-8 text-[11px] h-8.5 rounded-lg border-slate-200 bg-slate-50/40 focus:bg-white transition"
                      value={data.company_name}
                      onChange={(e) => setData("company_name", e.target.value)}
                    />
                    <Building className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="company_email" className="text-[10px] font-bold text-slate-600">Email Resmi Usaha</Label>
                  <div className="relative">
                    <Input
                      id="company_email"
                      type="email"
                      placeholder="business@example.com"
                      className="pl-8 text-[11px] h-8.5 rounded-lg border-slate-200 bg-slate-50/40 focus:bg-white transition"
                      value={data.company_email}
                      onChange={(e) => setData("company_email", e.target.value)}
                    />
                    <Mail className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="company_phone" className="text-[10px] font-bold text-slate-600">No. Telepon Kontak</Label>
                  <div className="relative">
                    <Input
                      id="company_phone"
                      placeholder="+62 812-3456-789"
                      className="pl-8 text-[11px] h-8.5 rounded-lg border-slate-200 bg-slate-50/40 focus:bg-white transition"
                      value={data.company_phone}
                      onChange={(e) => setData("company_phone", e.target.value)}
                    />
                    <Phone className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="company_address" className="text-[10px] font-bold text-slate-600">Alamat Lengkap Perusahaan</Label>
                  <div className="relative">
                    <Input
                      id="company_address"
                      placeholder="Jl. Merdeka No. 123, Jakarta"
                      className="pl-8 text-[11px] h-8.5 rounded-lg border-slate-200 bg-slate-50/40 focus:bg-white transition"
                      value={data.company_address}
                      onChange={(e) => setData("company_address", e.target.value)}
                    />
                    <MapPin className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  </div>
                </div>
              </div>

              <div className="border-b border-slate-100 pb-3 pt-2 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-650 shrink-0">
                  <LayoutGrid className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900">Pilih Desain Layout Template (3 Pilihan)</h2>
                  <p className="text-[10px] text-slate-450 font-medium">Tentukan template formal terbaik yang mewakili identitas institusi Anda.</p>
                </div>
              </div>

              {/* Template Card Selection Container */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {templates.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setData("template_id", tpl.id)}
                    className={cn(
                      "flex flex-col text-left p-3 rounded-xl border transition-all duration-150 hover:shadow-xs focus:outline-none relative group/btn",
                      data.template_id === tpl.id 
                        ? "border-indigo-600 bg-indigo-50/10 ring-1 ring-indigo-500/20" 
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    )}
                  >
                    <div className={cn("w-full h-14 rounded-lg flex items-center justify-center relative overflow-hidden border mb-2", tpl.previewBg)}>
                      <div className={cn("absolute top-1.5 left-1.5 w-6 h-1.5 rounded-full", tpl.accentColor)} />
                      <div className="space-y-0.8 w-full px-2 mt-2">
                        <div className="w-8 h-1 bg-slate-300 rounded" />
                        <div className="w-full h-1 bg-slate-350/50 rounded" />
                      </div>
                      {data.template_id === tpl.id && (
                        <div className="absolute right-1.5 top-1.5 bg-indigo-600 text-white rounded-full p-0.5">
                          <Check className="h-2 w-2 font-bold" />
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-black text-slate-800 leading-tight block">{tpl.name}</span>
                    <span className="text-[8px] text-slate-400 font-semibold leading-snug mt-1 line-clamp-2 w-full">{tpl.desc}</span>
                  </button>
                ))}
              </div>

              <div className="border-b border-slate-100 pb-3 pt-2 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-650 shrink-0">
                  <FileCode className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900">Catatan & Validasi Tanda Tangan</h2>
                  <p className="text-[10px] text-slate-450 font-medium">Beri instruksi pembayaran/catatan dan nama penanggung jawab faktur.</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes" className="text-[10px] font-bold text-slate-600">Catatan Kaki / Instruksi Pembayaran</Label>
                <textarea
                  id="notes"
                  rows={2}
                  className="w-full text-[11px] rounded-lg border border-slate-200 bg-slate-50/40 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 p-2.5 transition"
                  placeholder="Catatan penutup yang tertera pada faktur..."
                  value={data.notes}
                  onChange={(e) => setData("notes", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="signature_name" className="text-[10px] font-bold text-slate-600">Nama Penanggung Jawab</Label>
                  <Input
                    id="signature_name"
                    placeholder="Contoh: Budi Santoso"
                    className="text-[11px] h-8.5 rounded-lg border-slate-200 bg-slate-50/40 focus:bg-white transition"
                    value={data.signature_name}
                    onChange={(e) => setData("signature_name", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signature_title" className="text-[10px] font-bold text-slate-600">Jabatan Penanggung Jawab</Label>
                  <Input
                    id="signature_title"
                    placeholder="Contoh: Direktur Utama"
                    className="text-[11px] h-8.5 rounded-lg border-slate-200 bg-slate-50/40 focus:bg-white transition"
                    value={data.signature_title}
                    onChange={(e) => setData("signature_title", e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <Button
                  type="submit"
                  disabled={processing}
                  className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-[10px] h-8 px-4 rounded-lg transition active:scale-95 duration-100 shadow-sm"
                >
                  {processing ? "Menyimpan..." : "Simpan Pengaturan"}
                </Button>
              </div>
            </form>

            {/* Live Preview Column (Stunning & Formal Design) */}
            <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">
                <span>Visualisasi Live Preview</span>
                <span className="text-[9px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100/50 flex items-center gap-1 font-bold animate-pulse">
                  <Sparkles size={8} /> LIVE
                </span>
              </div>

              {/* Miniature Document UI Container */}
              <div className={cn(
                "bg-white border border-slate-250 rounded-2xl p-5 shadow-md transition-all duration-300 relative overflow-hidden select-none",
                data.template_id === "2" && "border-blue-200 bg-gradient-to-b from-blue-50/5 to-white",
                data.template_id === "3" && "border-emerald-250 bg-gradient-to-b from-emerald-50/5 to-white"
              )}>
                {/* Accent Color Band */}
                {data.template_id === "1" && <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-900" />}
                {data.template_id === "2" && <div className="absolute top-0 left-0 w-full h-2.5 bg-gradient-to-r from-blue-600 to-indigo-600" />}
                {data.template_id === "3" && <div className="absolute top-0 left-0 w-full h-2.5 bg-emerald-800" />}

                {/* Diagonal UNPAID / BELUM BAYAR Stamp */}
                <div className="absolute top-10 right-2 -rotate-12 border border-red-500/30 text-red-500/40 text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded opacity-40 select-none">
                  BELUM BAYAR / UNPAID
                </div>

                {/* Document Header */}
                <div className="flex justify-between items-start mt-2">
                  <div>
                    <h3 className={cn(
                      "font-black text-xs",
                      data.template_id === "2" ? "text-blue-700" : data.template_id === "3" ? "text-emerald-800" : "text-slate-900"
                    )}>
                      {data.company_name || "Nama Perusahaan"}
                    </h3>
                    <p className="text-[8px] text-slate-450 leading-normal mt-0.5 max-w-[170px] font-medium">
                      {data.company_address || "Alamat usaha..."}, Telp: {data.company_phone || "-"}
                    </p>
                    <p className="text-[8px] text-slate-400 font-semibold">{data.company_email || "business@email.com"}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">FAKTUR</span>
                    <h4 className="text-[9px] font-mono font-bold text-slate-700 mt-0.5">INV-2026-001</h4>
                  </div>
                </div>

                <div className="h-[1px] bg-slate-100 my-3" />

                {/* Billing details */}
                <div className="grid grid-cols-2 gap-4 text-[8px] font-medium text-slate-500">
                  <div>
                    <p className="font-bold text-[7px] uppercase tracking-wider text-slate-400">Penerima Tagihan:</p>
                    <p className="font-black text-slate-800 mt-0.5">John Doe</p>
                    <p className="text-slate-450 font-semibold">johndoe@email.com</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[7px] uppercase tracking-wider text-slate-400">Tanggal Faktur:</p>
                    <p className="font-black text-slate-800 mt-0.5">02 Juni 2026</p>
                  </div>
                </div>

                {/* Items Table */}
                <div className="border border-slate-200 rounded-lg overflow-hidden mt-3 text-[8px] font-bold">
                  <div className="grid grid-cols-12 bg-slate-50 p-1.5 text-slate-450 border-b border-slate-200 uppercase tracking-wider text-[7px]">
                    <div className="col-span-8 px-1">Deskripsi Layanan</div>
                    <div className="col-span-4 text-right px-1">Total</div>
                  </div>
                  <div className="grid grid-cols-12 p-2 text-slate-700 bg-white">
                    <div className="col-span-8 px-1">
                      <p className="font-black text-slate-850">Kelas Cohort Premium Masterclass</p>
                      <p className="text-[7px] text-slate-400 mt-0.5 font-medium">Kategori: Bootcamp</p>
                    </div>
                    <div className="col-span-4 text-right self-center font-black text-slate-900 px-1">Rp 1.500.000</div>
                  </div>
                  {/* Detailed formal breakdown */}
                  <div className="border-t border-slate-150/60 p-1.5 bg-slate-50/50 space-y-0.8 text-right font-semibold text-slate-450">
                    <div className="grid grid-cols-12 text-[7px]">
                      <div className="col-span-8">Subtotal:</div>
                      <div className="col-span-4 font-black text-slate-700">Rp 1.500.000</div>
                    </div>
                    <div className="grid grid-cols-12 text-[7px]">
                      <div className="col-span-8">Pajak (PPN 0%):</div>
                      <div className="col-span-4 font-black text-slate-700">Rp 0</div>
                    </div>
                    <div className="grid grid-cols-12 text-[8px] border-t border-slate-200 pt-1 font-black text-slate-850">
                      <div className="col-span-8">Total Pembayaran:</div>
                      <div className={cn(
                        "col-span-4",
                        data.template_id === "2" ? "text-blue-700" : data.template_id === "3" ? "text-emerald-800" : "text-slate-900"
                      )}>Rp 1.500.000</div>
                    </div>
                  </div>
                </div>

                {/* Bank Destination Info (Wow Factor) */}
                <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-2 text-[8px]">
                  <p className="font-bold text-[7px] text-slate-400 uppercase tracking-wider">Tujuan Transfer Pembayaran:</p>
                  <div className="flex justify-between items-center mt-1 font-bold text-slate-700">
                    <span>{userDefault.bank_provider || "BANK BCA"}</span>
                    <span>No. Rek: <span className="font-mono text-slate-900">{userDefault.bank_account_number || "8123-XXXX-12"}</span></span>
                  </div>
                  <p className="text-[7px] text-slate-450 font-semibold mt-0.5">A/N: {userDefault.bank_account_name || userDefault.name}</p>
                </div>

                {/* Notes Memo */}
                <div className="mt-3.5 text-[8px] font-semibold text-slate-400 leading-snug">
                  <p className="font-bold uppercase tracking-wider text-[7px] text-slate-350">Memo:</p>
                  <p className="italic text-slate-450 mt-0.5 leading-snug">{data.notes || "Terima kasih..."}</p>
                </div>

                {/* Signature Block */}
                <div className="flex justify-end mt-4 text-right">
                  <div className="w-28 border-t border-dashed border-slate-200 pt-1.5 space-y-0.5">
                    <p className="text-[6px] font-bold uppercase tracking-wider text-slate-350">Hormat Kami,</p>
                    <div className="h-5 flex items-center justify-center font-serif text-[9px] text-slate-300 italic">Signature</div>
                    <p className="text-[8px] font-black text-slate-800 leading-none">{data.signature_name || "Nama Owner"}</p>
                    <p className="text-[7px] text-slate-450 font-semibold leading-none">{data.signature_title || "Pemilik"}</p>
                  </div>
                </div>
              </div>
              <p className="text-[9px] text-slate-450 font-semibold leading-relaxed text-center px-4">
                *Pratinjau di atas disesuaikan dengan profil default Anda. Cetak PDF dan lembar faktur akan memuat rincian formal secara utuh.
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
