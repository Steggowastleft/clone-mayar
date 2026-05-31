import DashboardLayout from "@/components/dashboard/dashboardlayout";
import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  CreditCard, CheckCircle, Clock, XCircle, ShieldAlert,
  ArrowUpRight, Landmark, Info, FileText, CalendarDays
} from "lucide-react";

interface WithdrawalItem {
  id: number;
  jumlah: string | number;
  metode_pembayaran: string;
  nomor_rekening: string;
  nama_pemilik_rekening: string;
  bank_name: string;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  catatan?: string;
  admin_notes?: string;
  tanggal_permohonan: string;
  tanggal_approval?: string;
  tanggal_selesai?: string;
}

interface Props {
  user: {
    name: string;
    email: string;
    bank_provider?: string;
    bank_account_number?: string;
    bank_account_name?: string;
  };
  balance: number;
  totalWithdrawn: number;
  verificationStatus: 'unverified' | 'pending' | 'approved' | 'rejected' | string;
  withdrawals: WithdrawalItem[];
}

export default function CreatorWithdrawal({
  user,
  balance = 0,
  totalWithdrawn = 0,
  verificationStatus = 'unverified',
  withdrawals = []
}: Props) {
  const [displayJumlah, setDisplayJumlah] = useState("");
  const [catatan, setCatatan] = useState("");
  const [loading, setLoading] = useState(false);

  const isBankSetup = !!(user.bank_provider && user.bank_account_number && user.bank_account_name);
  const isKycApproved = verificationStatus === 'approved';

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(val);
  };

  const formatInputRupiah = (value: string) => {
    const numberString = value.replace(/[^0-9]/g, "");
    if (!numberString) return "";
    return new Intl.NumberFormat("id-ID").format(parseInt(numberString, 10));
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isKycApproved) {
      toast.error("Akun Anda harus terverifikasi untuk menarik dana.");
      return;
    }

    if (!isBankSetup) {
      toast.error("Silakan lengkapi data rekening bank Anda terlebih dahulu.");
      return;
    }

    const rawAmount = parseFloat(displayJumlah.replace(/[^0-9]/g, ""));
    if (isNaN(rawAmount) || rawAmount <= 0) {
      toast.error("Silakan masukkan jumlah penarikan yang valid.");
      return;
    }

    if (rawAmount < 50000) {
      toast.error("Batas minimum penarikan adalah Rp 50.000.");
      return;
    }

    if (rawAmount > balance) {
      toast.error("Jumlah penarikan melebihi saldo aktif Anda.");
      return;
    }

    setLoading(true);
    router.post("/pengaturan/withdrawal", {
      jumlah: rawAmount,
      catatan
    }, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success("Permohonan penarikan dana berhasil diajukan!");
        setDisplayJumlah("");
        setCatatan("");
      },
      onError: (errors) => {
        const errorMsg = Object.values(errors).join(", ");
        toast.error(errorMsg || "Gagal mengajukan penarikan dana.");
      },
      onFinish: () => setLoading(false)
    });
  };

  const getStatusBadge = (status: WithdrawalItem['status']) => {
    const classes = {
      pending: "bg-amber-50 text-amber-700 border-amber-200",
      approved: "bg-blue-50 text-blue-700 border-blue-200",
      completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
      rejected: "bg-rose-50 text-rose-700 border-rose-200"
    };

    const labels = {
      pending: "Ditinjau",
      approved: "Disetujui",
      completed: "Selesai",
      rejected: "Ditolak"
    };

    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${classes[status]}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <DashboardLayout>
      <Head title="Withdrawal Saldo — BiinsCart" />
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header Title */}
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Withdrawal Saldo</h1>
          <p className="text-xs text-slate-500 mt-1">
            Tarik dana pendapatan penjualan produk Anda langsung ke rekening bank lokal Anda.
          </p>
        </div>

        {/* Balance Cards Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-100 relative overflow-hidden flex flex-col justify-between h-40">
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black tracking-wider uppercase text-blue-100 opacity-90">Saldo Aktif</p>
                <h3 className="text-2xl font-black mt-1.5">{formatRupiah(balance)}</h3>
              </div>
              <div className="p-2.5 bg-white/10 rounded-xl">
                <ArrowUpRight className="h-5 w-5 text-white" />
              </div>
            </div>
            <p className="text-[10px] text-blue-100/80 font-medium relative z-10">
              *Telah dikurangi transaksi penarikan pending/selesai.
            </p>
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-40">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black tracking-wider uppercase text-slate-400">Total Pencairan</p>
                <h3 className="text-2xl font-black text-slate-800 mt-1.5">{formatRupiah(totalWithdrawn)}</h3>
              </div>
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <CheckCircle className="h-5 w-5" />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              Dari seluruh penarikan berstatus disetujui & selesai.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-40">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black tracking-wider uppercase text-slate-400">Rekening Tujuan</p>
                {isBankSetup ? (
                  <div className="mt-2 space-y-0.5">
                    <p className="text-xs font-extrabold text-slate-800">{user.bank_provider}</p>
                    <p className="text-sm font-bold text-blue-600 tracking-wider">{user.bank_account_number}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase truncate max-w-[190px]">
                      A.N. {user.bank_account_name}
                    </p>
                  </div>
                ) : (
                  <div className="mt-2 text-rose-500 font-bold flex items-center gap-1.5 text-xs">
                    <Info className="h-4 w-4 shrink-0" />
                    <span>Rekening Belum Diatur</span>
                  </div>
                )}
              </div>
              <div className="p-2.5 bg-slate-50 text-slate-600 rounded-xl">
                <Landmark className="h-5 w-5" />
              </div>
            </div>
            {!isBankSetup && (
              <a
                href="/pengaturan/akun?tab=rekening"
                className="text-[10px] text-blue-600 font-extrabold hover:underline"
              >
                Atur Rekening Sekarang &rarr;
              </a>
            )}
          </div>
        </div>

        {/* Main Content Grid: Request Form & Rejections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Column 1 & 2: Form input withdrawal */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* KYC Warnings */}
            {!isKycApproved && (
              <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 flex gap-4 items-start shadow-sm">
                <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl">
                  {verificationStatus === 'pending' ? (
                    <Clock className="h-5 w-5 animate-pulse" />
                  ) : (
                    <ShieldAlert className="h-5 w-5" />
                  )}
                </div>
                <div className="space-y-1">
                  <h3 className="font-extrabold text-amber-900 text-sm">
                    {verificationStatus === 'pending' ? "Verifikasi Sedang Ditinjau" : "Verifikasi Identitas (KYC) Diperlukan"}
                  </h3>
                  <p className="text-xs text-amber-700 leading-relaxed font-medium">
                    {verificationStatus === 'pending'
                      ? "Dokumen verifikasi Anda sedang dalam proses peninjauan oleh admin. Penarikan dana baru akan diaktifkan setelah pengajuan Anda disetujui."
                      : "Sesuai regulasi keuangan, Anda wajib menyelesaikan verifikasi identitas di menu Pengaturan Akun sebelum dapat menarik saldo pendapatan."}
                  </p>
                  {verificationStatus !== 'pending' && (
                    <a
                      href="/pengaturan/akun"
                      className="inline-block mt-3 text-xs font-black text-amber-800 bg-amber-100 hover:bg-amber-200 px-4 py-2 rounded-xl transition"
                    >
                      Ajukan Verifikasi Sekarang
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Form Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
              <div className="border-b border-slate-100 pb-3 mb-5">
                <h3 className="font-extrabold text-slate-800 text-sm">Ajukan Penarikan Dana</h3>
                <p className="text-slate-400 text-[10px] mt-0.5">Lengkapi formulir untuk mencairkan saldo pendapatan Anda.</p>
              </div>

              <form onSubmit={handleWithdraw} className="space-y-5">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jumlah Penarikan (Rp)</Label>
                  <div className="relative">
                    <span className="absolute left-4 top-2.5 text-xs font-bold text-slate-400">Rp</span>
                    <Input
                      type="text"
                      placeholder="Contoh: 100.000"
                      className="pl-10 rounded-xl bg-slate-50/50 focus:bg-white text-xs font-bold py-5 border-slate-200"
                      value={displayJumlah}
                      onChange={(e) => {
                        const formatted = formatInputRupiah(e.target.value);
                        setDisplayJumlah(formatted);
                      }}
                      disabled={!isKycApproved || !isBankSetup || loading}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] pl-1 font-semibold">
                    <span className="text-slate-400">Min: Rp 50.000</span>
                    <button
                      type="button"
                      onClick={() => setDisplayJumlah(new Intl.NumberFormat("id-ID").format(balance))}
                      className="text-blue-600 hover:underline"
                      disabled={!isKycApproved || !isBankSetup || balance < 50000}
                    >
                      Tarik Semua Saldo
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Catatan (Opsional)</Label>
                  <Textarea
                    placeholder="Masukkan pesan tambahan untuk admin..."
                    className="rounded-xl bg-slate-50/50 focus:bg-white text-xs py-3 border-slate-200"
                    rows={3}
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    disabled={!isKycApproved || !isBankSetup || loading}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-755 text-white font-black text-xs py-5 rounded-xl shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                  disabled={!isKycApproved || !isBankSetup || loading}
                >
                  {loading ? "Memproses..." : "AJUKAN PENARIKAN DANA"}
                </Button>
              </form>
            </div>
          </div>

          {/* Column 3: Policy Information */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-4">
            <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-600 shrink-0" />
              Ketentuan Penarikan
            </h4>
            <ul className="text-slate-500 text-[10px] space-y-3 font-semibold list-disc pl-4 leading-relaxed">
              <li>Pencairan dana hanya dikirim ke rekening bank lokal yang telah dikonfigurasi.</li>
              <li>Minimal penarikan dana per transaksi adalah <strong>Rp 50.000</strong>.</li>
              <li>Proses peninjauan permohonan membutuhkan waktu <strong>1x24 jam</strong> kerja setelah diajukan.</li>
              <li>Pastikan nomor rekening bank Anda valid. Kesalahan penulisan data rekening sepenuhnya menjadi tanggung jawab creator.</li>
              <li>Akun creator wajib terverifikasi (KYC) demi kenyamanan dan perlindungan transaksi penarikan dana.</li>
            </ul>
          </div>
        </div>

        {/* Withdrawal History Table */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="border-b border-slate-100 pb-3 mb-5">
            <h3 className="font-extrabold text-slate-800 text-sm">Riwayat Penarikan Dana</h3>
            <p className="text-slate-400 text-[10px] mt-0.5">Daftar seluruh transaksi permohonan pencairan dana yang pernah diajukan.</p>
          </div>

          {withdrawals.length === 0 ? (
            <div className="text-center py-12">
              <Landmark className="h-10 w-10 text-slate-300 mx-auto mb-2.5" />
              <p className="text-xs font-bold text-slate-450">Belum ada riwayat penarikan dana.</p>
              <p className="text-[10px] text-slate-400 mt-1">Saat Anda melakukan penarikan, detail transaksinya akan muncul di sini.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-semibold text-slate-650">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 pr-4 font-bold">Tanggal</th>
                    <th className="pb-3 px-4 font-bold">Bank Penerima</th>
                    <th className="pb-3 px-4 font-bold">Jumlah</th>
                    <th className="pb-3 px-4 font-bold text-center">Status</th>
                    <th className="pb-3 pl-4 font-bold">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {withdrawals.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-4 pr-4 text-slate-800 font-bold shrink-0">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                          <span>{new Date(item.tanggal_permohonan).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <p className="text-slate-800 font-extrabold text-[11px]">{item.bank_name}</p>
                          <p className="text-[10px] font-bold text-blue-600 tracking-wider">{item.nomor_rekening}</p>
                          <p className="text-[9px] text-slate-400 font-bold truncate max-w-[180px]">A.N. {item.nama_pemilik_rekening}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-extrabold text-slate-900">
                        {formatRupiah(parseFloat(item.jumlah as string))}
                      </td>
                      <td className="py-4 px-4 text-center shrink-0">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="py-4 pl-4 text-[10px] max-w-xs font-medium leading-relaxed">
                        {item.catatan && (
                          <p className="text-slate-500 italic"><span className="font-extrabold not-italic text-slate-400">Catatan:</span> {item.catatan}</p>
                        )}
                        {item.admin_notes && (
                          <p className="text-rose-600 mt-1 font-bold"><span className="font-black text-rose-500">Admin:</span> {item.admin_notes}</p>
                        )}
                        {!item.catatan && !item.admin_notes && (
                          <span className="text-slate-400 italic">Tidak ada catatan</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
