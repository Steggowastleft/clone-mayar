import { Head, Link } from "@inertiajs/react";
import { 
  Printer, 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin,
  AlertTriangle,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";

type FakturDetail = {
  id: number;
  kode: string;
  nama_pembeli: string;
  email: string;
  no_hp: string;
  produk: string;
  jenis_produk: string;
  jumlah: number;
  status: string;
  tanggal: string;
  keterangan?: string;
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
  faktur: FakturDetail;
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

export default function FakturShow({ faktur, fakturSetting, userDefault }: Props) {
  // Extract custom settings or default values
  const companyName = fakturSetting?.company_name || userDefault.name || "Biinscart Seller";
  const companyEmail = fakturSetting?.company_email || userDefault.email || "";
  const companyPhone = fakturSetting?.company_phone || userDefault.phone || "";
  const companyAddress = fakturSetting?.company_address || userDefault.address || "";
  const templateId = fakturSetting?.template_id || "1";
  const notes = fakturSetting?.notes || "Terima kasih atas kepercayaan Anda bertransaksi dengan kami.";
  const signatureName = fakturSetting?.signature_name || userDefault.name || "";
  const signatureTitle = fakturSetting?.signature_title || "Pemilik Bisnis";

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Head title={`Faktur #${faktur.kode}`} />

      {/* Tailwind Print Style Helper & Bulletproof print-only override */}
      <style dangerouslySetInnerHTML={{__html: `
        @media screen {
          .print-only {
            display: none !important;
          }
        }
        @media print {
          body {
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          .print-area {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
        }
      `}} />

      {/* Main Container for Web View */}
      <div className="min-h-screen bg-slate-50 py-8 px-4 md:px-8 no-print animate-in fade-in-50 duration-200">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
          <Link
            href="/faktur"
            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500 hover:text-slate-900 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Daftar Faktur
          </Link>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] h-8 px-4 rounded-lg shadow-sm transition active:scale-95 duration-100"
            >
              <Printer className="h-3.5 w-3.5" /> Cetak Faktur (PDF)
            </button>
          </div>
        </div>

        {/* Invoice Body Container for Web View */}
        <div className="max-w-4xl mx-auto bg-white border border-slate-250 shadow-md rounded-2xl overflow-hidden">
          {renderTemplate()}
        </div>
      </div>

      {/* Print-Only Container (Rendered exactly when window.print() is called) */}
      <div className="print-only print-area w-full bg-white p-0">
        {renderTemplate(true)}
      </div>
    </>
  );

  function renderTemplate(isPrintMode = false) {
    switch (templateId) {
      case "2":
        return renderTemplateModernGradient(isPrintMode);
      case "3":
        return renderTemplateProfessionalClassic(isPrintMode);
      case "1":
      default:
        return renderTemplateMinimalistClean(isPrintMode);
    }
  }

  // ==========================================
  // TEMPLATE 1: MINIMALIST CLEAN (BLACK & WHITE)
  // ==========================================
  function renderTemplateMinimalistClean(isPrintMode = false) {
    return (
      <div className="p-8 md:p-12 space-y-8 bg-white text-slate-800 relative">
        {/* Top Accent line */}
        <div className="h-1.5 bg-slate-950 -mt-8 md:-mt-12 -mx-8 md:-mx-12 mb-6" />

        {/* Diagonal Unpaid Stamp */}
        <div className="absolute top-8 right-56 -rotate-12 border border-red-500/20 text-red-500/30 text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded select-none">
          BELUM BAYAR / UNPAID
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900">{companyName}</h1>
            <div className="text-[11px] text-slate-500 space-y-1 mt-2 font-medium">
              {companyEmail && <p className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-slate-400" /> {companyEmail}</p>}
              {companyPhone && <p className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-slate-400" /> {companyPhone}</p>}
              {companyAddress && <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-slate-400" /> {companyAddress}</p>}
            </div>
          </div>
          <div className="text-left md:text-right">
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-widest">FAKTUR PERMINTAAN</h2>
            <div className="text-[11px] text-slate-500 font-mono space-y-1 mt-2">
              <p>NO FAKTUR: <span className="font-bold text-slate-850">{faktur.kode}</span></p>
              <p>TANGGAL: <span>{faktur.tanggal}</span></p>
              <div className="mt-2 inline-block bg-yellow-50 border border-yellow-250 text-yellow-800 text-[9px] font-bold tracking-wider px-2.5 py-0.5 rounded uppercase">
                PENDING / BELUM DIBAYAR
              </div>
            </div>
          </div>
        </div>

        <hr className="border-slate-200" />

        {/* Billing Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Ditagihkan Kepada:</p>
            <h3 className="text-xs font-black text-slate-900">{faktur.nama_pembeli}</h3>
            <p className="text-[11px] text-slate-500 font-semibold">{faktur.email}</p>
            {faktur.no_hp && <p className="text-[11px] text-slate-500 font-semibold">{faktur.no_hp}</p>}
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Tujuan Transfer Pembayaran:</p>
            <div className="text-[11px] text-slate-650 space-y-0.5 bg-slate-50 border border-slate-200 p-3 rounded-xl">
              <p className="font-bold text-slate-850">{userDefault.bank_provider || "BANK BCA"}</p>
              <p>No. Rekening: <span className="font-mono font-bold text-slate-900">{userDefault.bank_account_number || "8123-XXXX-XX"}</span></p>
              <p>Atas Nama: <span className="font-bold text-slate-700">{userDefault.bank_account_name || userDefault.name}</span></p>
            </div>
          </div>
        </div>

        {/* Table of Items */}
        <div className="border border-slate-200 rounded-xl overflow-hidden mt-6">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[9px] font-black text-slate-550 uppercase tracking-widest">
                <th className="py-2.5 px-4">Deskripsi Layanan / Item</th>
                <th className="py-2.5 px-4 text-center w-24">Kategori</th>
                <th className="py-2.5 px-4 text-right w-36">Jumlah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              <tr className="align-top">
                <td className="py-4 px-4">
                  <p className="font-bold text-slate-900">{faktur.produk}</p>
                  {faktur.keterangan && <p className="text-[10px] text-slate-500 mt-1 font-medium leading-relaxed">{faktur.keterangan}</p>}
                </td>
                <td className="py-4 px-4 text-center font-bold text-slate-600 uppercase tracking-wider text-[9px] self-center">
                  {faktur.jenis_produk}
                </td>
                <td className="py-4 px-4 text-right font-bold text-slate-900">
                  Rp {faktur.jumlah.toLocaleString("id-ID")}
                </td>
              </tr>
              {/* Detailed Breakdown */}
              <tr className="bg-slate-50/50">
                <td colSpan={2} className="py-2 px-4 text-right font-bold text-slate-500 text-[10px]">
                  Subtotal
                </td>
                <td className="py-2 px-4 text-right font-bold text-slate-800">
                  Rp {faktur.jumlah.toLocaleString("id-ID")}
                </td>
              </tr>
              <tr className="bg-slate-50/50">
                <td colSpan={2} className="py-2 px-4 text-right font-bold text-slate-500 text-[10px]">
                  Pajak (PPN 0%)
                </td>
                <td className="py-2 px-4 text-right font-bold text-slate-800">
                  Rp 0
                </td>
              </tr>
              <tr className="bg-slate-100 border-t-2 border-slate-900">
                <td colSpan={2} className="py-3 px-4 text-right font-black text-slate-900 text-xs">
                  TOTAL PEMBAYARAN
                </td>
                <td className="py-3 px-4 text-right font-black text-slate-950 text-sm">
                  Rp {faktur.jumlah.toLocaleString("id-ID")}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer info & Signature */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-6">
          <div className="md:col-span-8 space-y-1.5">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Catatan / Keterangan:</p>
            <p className="text-xs text-slate-500 italic leading-relaxed font-semibold">
              {notes}
            </p>
          </div>
          <div className="md:col-span-4 flex justify-start md:justify-end text-left md:text-right">
            <div className="w-48 border-t border-dashed border-slate-350 pt-3 text-xs space-y-1">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Hormat Kami,</p>
              <div className="h-8 flex items-center justify-start md:justify-end text-[10px] text-slate-350 italic font-serif">Signature</div>
              <p className="font-black text-slate-900 leading-none">{signatureName}</p>
              <p className="text-[10px] text-slate-500 font-semibold leading-none">{signatureTitle}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // TEMPLATE 2: MODERN GRADIENT (BLUE & INDIGO)
  // ==========================================
  function renderTemplateModernGradient(isPrintMode = false) {
    return (
      <div className="p-8 md:p-12 space-y-8 bg-gradient-to-b from-blue-50/10 to-white text-slate-800 relative">
        {/* Top Accent Gradient Bar */}
        <div className="h-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 -mt-8 md:-mt-12 -mx-8 md:-mx-12 mb-6" />

        {/* Diagonal Unpaid Stamp */}
        <div className="absolute top-14 right-12 -rotate-12 border border-red-500/25 text-red-500/35 text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded select-none">
          BELUM BAYAR / UNPAID
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between gap-6 items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs select-none">
                {companyName.charAt(0).toUpperCase()}
              </span>
              <h1 className="text-lg font-black text-slate-900">{companyName}</h1>
            </div>
            <div className="text-[11px] text-slate-500 space-y-1 pt-2 font-medium">
              {companyEmail && <p className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-blue-500" /> {companyEmail}</p>}
              {companyPhone && <p className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-blue-500" /> {companyPhone}</p>}
              {companyAddress && <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-blue-500" /> {companyAddress}</p>}
            </div>
          </div>
          <div className="text-left md:text-right space-y-2">
            <span className="bg-blue-100 text-blue-700 text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-blue-250">
              FAKTUR PERMINTAAN
            </span>
            <h2 className="text-sm font-mono font-black text-slate-800 mt-2">#{faktur.kode}</h2>
            <div className="text-[10px] text-slate-500 space-y-0.5 font-semibold">
              <p>Tanggal Tagihan: <span className="font-extrabold text-slate-700">{faktur.tanggal}</span></p>
              <div className="inline-flex items-center gap-1 mt-1 bg-yellow-50 text-yellow-750 border border-yellow-250 text-[9px] font-black uppercase px-2.5 py-0.2 rounded-full select-none">
                <span className="h-1 w-1 bg-yellow-500 rounded-full" /> Pending
              </div>
            </div>
          </div>
        </div>

        <div className="h-[1px] bg-slate-150" />

        {/* Billing Info Panel */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1.5">Ditagihkan Kepada</p>
            <h3 className="text-xs font-black text-slate-900">{faktur.nama_pembeli}</h3>
            <p className="text-[11px] text-slate-500 font-semibold">{faktur.email}</p>
            {faktur.no_hp && <p className="text-[11px] text-slate-450 font-semibold mt-1">{faktur.no_hp}</p>}
          </div>
          <div className="space-y-1 border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6">
            <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1.5">Tujuan Pembayaran (Bank Transfer)</p>
            <div className="text-[11px] text-slate-650 space-y-0.5">
              <p className="font-extrabold text-slate-900">{userDefault.bank_provider || "BANK BCA"}</p>
              <p>No. Rekening: <span className="font-mono font-bold text-slate-900">{userDefault.bank_account_number || "8123-XXXX-XX"}</span></p>
              <p>Atas Nama: <span className="font-bold text-slate-700">{userDefault.bank_account_name || userDefault.name}</span></p>
            </div>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="overflow-hidden border border-slate-200 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest">
                <th className="py-2.5 px-5">Rincian Layanan / Item</th>
                <th className="py-2.5 px-4 text-center w-24">Kategori</th>
                <th className="py-2.5 px-5 text-right w-36">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              <tr className="align-top hover:bg-slate-50/50 transition">
                <td className="py-4 px-5">
                  <span className="font-black text-slate-800 text-xs block">{faktur.produk}</span>
                  {faktur.keterangan && <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1">{faktur.keterangan}</p>}
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded border bg-blue-50 text-blue-755 border-blue-200 shadow-3xs">
                    {faktur.jenis_produk}
                  </span>
                </td>
                <td className="py-4 px-5 text-right font-bold text-slate-900">
                  Rp {faktur.jumlah.toLocaleString("id-ID")}
                </td>
              </tr>
              {/* Detailed Breakdown */}
              <tr className="bg-slate-50/20">
                <td colSpan={2} className="py-2 px-5 text-right font-bold text-slate-500 text-[10px]">
                  Subtotal
                </td>
                <td className="py-2 px-5 text-right font-bold text-slate-800">
                  Rp {faktur.jumlah.toLocaleString("id-ID")}
                </td>
              </tr>
              <tr className="bg-slate-50/20">
                <td colSpan={2} className="py-2 px-5 text-right font-bold text-slate-500 text-[10px]">
                  Pajak (PPN 0%)
                </td>
                <td className="py-2 px-5 text-right font-bold text-slate-800">
                  Rp 0
                </td>
              </tr>
              <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-slate-200">
                <td colSpan={2} className="py-3 px-5 text-right font-black text-slate-850 text-xs">
                  TOTAL PEMBAYARAN
                </td>
                <td className="py-3 px-5 text-right font-black text-indigo-700 text-sm">
                  Rp {faktur.jumlah.toLocaleString("id-ID")}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer Notes & Signature */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-6">
          <div className="md:col-span-7 space-y-1.5">
            <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Catatan Penjual</p>
            <p className="text-xs text-slate-550 italic leading-relaxed font-semibold bg-blue-50/10 border border-blue-100/55 p-3 rounded-2xl">
              {notes}
            </p>
          </div>
          <div className="md:col-span-5 flex justify-start md:justify-end text-left md:text-right">
            <div className="w-56 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-1">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Hormat Kami,</p>
              <div className="h-8 flex items-center justify-start md:justify-end text-[10px] text-blue-600/70 italic font-serif">Signature Signed</div>
              <p className="font-black text-slate-900 leading-none">{signatureName}</p>
              <p className="text-[10px] text-slate-450 font-semibold leading-none mt-1">{signatureTitle}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // TEMPLATE 3: PROFESSIONAL CLASSIC (EMERALD)
  // ==========================================
  function renderTemplateProfessionalClassic(isPrintMode = false) {
    return (
      <div className="p-8 md:p-12 space-y-8 bg-white text-slate-800 relative">
        
        {/* Diagonal Unpaid Stamp */}
        <div className="absolute top-26 right-12 -rotate-12 border border-red-500/25 text-red-500/35 text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded select-none">
          BELUM BAYAR / UNPAID
        </div>

        {/* Emerald Header Section */}
        <div className="bg-emerald-800 text-white p-6 md:p-8 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-xl font-serif font-black tracking-tight">{companyName}</h1>
            <p className="text-[10px] text-emerald-100/80 font-medium leading-relaxed max-w-sm mt-1.5">
              {companyAddress || "Alamat kantor pusat..."}
            </p>
          </div>
          <div className="text-left md:text-right md:border-l md:border-emerald-700/60 md:pl-6">
            <h2 className="text-md font-serif font-black tracking-widest">FAKTUR PERMINTAAN</h2>
            <p className="text-[11px] text-emerald-100/80 font-mono mt-1">NO: #{faktur.kode}</p>
          </div>
        </div>

        {/* Detail Meta Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-2">
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tanggal Tagihan</p>
            <p className="font-bold text-slate-800 mt-1">{faktur.tanggal}</p>
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Kontak Bisnis</p>
            <p className="font-bold text-slate-850 mt-1">{companyPhone || "-"}</p>
            <p className="text-[10px] text-slate-500 font-semibold">{companyEmail}</p>
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Kirim Ke</p>
            <p className="font-bold text-slate-850 mt-1">{faktur.nama_pembeli}</p>
            <p className="text-[10px] text-slate-500 font-semibold">{faktur.email}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Status Pembayaran</p>
            <span className="inline-block mt-1 font-black bg-yellow-50 text-yellow-800 border border-yellow-250 uppercase text-[9px] tracking-wider px-2 py-0.5 rounded">
              PENDING
            </span>
          </div>
        </div>

        {/* Payment Destination (Bank details) */}
        <div className="border border-emerald-200 bg-emerald-50/10 rounded-xl p-4 text-xs space-y-1">
          <p className="text-[9px] font-black text-emerald-800 uppercase tracking-widest">Informasi Rekening Transfer (Tujuan Pembayaran):</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-bold text-slate-700">
            <div>Bank: <span className="font-extrabold text-slate-850">{userDefault.bank_provider || "BANK BCA"}</span></div>
            <div>No. Rekening: <span className="font-mono font-extrabold text-slate-900">{userDefault.bank_account_number || "8123-XXXX-XX"}</span></div>
            <div className="sm:text-right">Atas Nama: <span className="font-extrabold text-slate-850">{userDefault.bank_account_name || userDefault.name}</span></div>
          </div>
        </div>

        <hr className="border-slate-200" />

        {/* Product Table */}
        <div className="overflow-hidden border border-slate-200 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-55/60 border-b border-slate-200 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                <th className="py-3 px-4">Layanan / Item</th>
                <th className="py-3 px-4 text-center w-24">Kategori</th>
                <th className="py-3 px-4 text-right w-36">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              <tr>
                <td className="py-4 px-4">
                  <p className="font-bold text-slate-900">{faktur.produk}</p>
                  {faktur.keterangan && <p className="text-[10px] text-slate-550 font-medium leading-relaxed mt-1">{faktur.keterangan}</p>}
                </td>
                <td className="py-4 px-4 text-center font-bold text-emerald-800 uppercase tracking-wider text-[9px]">
                  {faktur.jenis_produk}
                </td>
                <td className="py-4 px-4 text-right font-bold text-slate-900">
                  Rp {faktur.jumlah.toLocaleString("id-ID")}
                </td>
              </tr>
              {/* Detailed Breakdown */}
              <tr className="bg-emerald-50/10">
                <td colSpan={2} className="py-2 px-4 text-right font-bold text-slate-500 text-[10px] border-t border-slate-200">
                  Subtotal
                </td>
                <td className="py-2 px-4 text-right font-bold text-slate-800 border-t border-slate-200">
                  Rp {faktur.jumlah.toLocaleString("id-ID")}
                </td>
              </tr>
              <tr className="bg-emerald-50/10">
                <td colSpan={2} className="py-2 px-4 text-right font-bold text-slate-500 text-[10px]">
                  Pajak (PPN 0%)
                </td>
                <td className="py-2 px-4 text-right font-bold text-slate-800">
                  Rp 0
                </td>
              </tr>
              {/* Emerald styled totals row */}
              <tr className="bg-emerald-50/30">
                <td colSpan={2} className="py-3.5 px-4 text-right font-black text-slate-800 text-xs border-t-2 border-emerald-800">
                  TOTAL PEMBAYARAN (NET)
                </td>
                <td className="py-3.5 px-4 text-right font-black text-emerald-850 text-sm border-t-2 border-emerald-800">
                  Rp {faktur.jumlah.toLocaleString("id-ID")}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer Memo & Authorised Signature */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-6">
          <div className="md:col-span-8 space-y-2">
            <p className="text-[9px] font-black text-emerald-800 uppercase tracking-widest">Memo Faktur:</p>
            <p className="text-xs text-slate-650 leading-relaxed font-semibold">
              {notes}
            </p>
          </div>
          <div className="md:col-span-4 flex justify-start md:justify-end text-left md:text-right">
            <div className="w-52 text-xs space-y-1.5 border-t border-slate-200 pt-3">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Tanda Tangan Authorized:</p>
              <div className="h-8 flex items-center justify-start md:justify-end text-[10px] text-slate-300 italic font-serif">Authorized Sign</div>
              <p className="font-black text-slate-850 leading-none">{signatureName}</p>
              <p className="text-[10px] text-slate-550 font-semibold leading-none">{signatureTitle}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
