import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/dashboardlayout';
import { CreditCard, CheckCircle, XCircle, Clock, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Withdrawal {
  id: number;
  user_id: string;
  jumlah: number | string;
  metode_pembayaran: string;
  nomor_rekening?: string;
  nama_pemilik_rekening?: string;
  bank_name?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  catatan?: string;
  admin_notes?: string;
  tanggal_permohonan: string;
  tanggal_approval?: string;
  tanggal_selesai?: string;
  user?: {
    name: string;
    email: string;
  };
}

interface Props {
  withdrawals: Withdrawal[];
}

export default function Withdrawals({ withdrawals }: Props) {
  const csrf = typeof document !== 'undefined' ? document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') : null;
  const [loadingId, setLoadingId] = useState<number | null>(null);

  // Dialog States
  const [confirmApproveOpen, setConfirmApproveOpen] = useState(false);
  const [selectedApproveId, setSelectedApproveId] = useState<number | null>(null);

  const [confirmRejectOpen, setConfirmRejectOpen] = useState(false);
  const [selectedRejectId, setSelectedRejectId] = useState<number | null>(null);
  const [adminNotes, setAdminNotes] = useState("");

  const [confirmCompleteOpen, setConfirmCompleteOpen] = useState(false);
  const [selectedCompleteId, setSelectedCompleteId] = useState<number | null>(null);

  async function postJson(url: string, data: any = {}) {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-CSRF-TOKEN': csrf || '',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return res.json();
  }

  function openApproveModal(id: number) {
    setSelectedApproveId(id);
    setConfirmApproveOpen(true);
  }

  async function handleApproveConfirm() {
    if (!selectedApproveId) return;
    const id = selectedApproveId;
    setLoadingId(id);
    try {
      const res = await postJson(`/admin/withdrawal/${id}/approve`);
      if (res.success) {
        toast.success(res.message || 'Permintaan penarikan berhasil disetujui.');
        router.reload();
      } else {
        toast.error(res.message || 'Gagal menyetujui penarikan.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Terjadi kesalahan.');
    } finally {
      setLoadingId(null);
      setConfirmApproveOpen(false);
      setSelectedApproveId(null);
    }
  }

  function openRejectModal(id: number) {
    setSelectedRejectId(id);
    setAdminNotes("");
    setConfirmRejectOpen(true);
  }

  async function handleRejectConfirm() {
    if (!selectedRejectId) return;
    if (!adminNotes.trim()) {
      toast.error("Alasan penolakan tidak boleh kosong.");
      return;
    }
    const id = selectedRejectId;
    setLoadingId(id);
    try {
      const res = await postJson(`/admin/withdrawal/${id}/reject`, { admin_notes: adminNotes });
      if (res.success) {
        toast.success(res.message || 'Permintaan penarikan berhasil ditolak.');
        router.reload();
      } else {
        toast.error(res.message || 'Gagal menolak penarikan.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Terjadi kesalahan.');
    } finally {
      setLoadingId(null);
      setConfirmRejectOpen(false);
      setSelectedRejectId(null);
      setAdminNotes("");
    }
  }

  function openCompleteModal(id: number) {
    setSelectedCompleteId(id);
    setConfirmCompleteOpen(true);
  }

  async function handleCompleteConfirm() {
    if (!selectedCompleteId) return;
    const id = selectedCompleteId;
    setLoadingId(id);
    try {
      const res = await postJson(`/admin/withdrawal/${id}/mark-completed`);
      if (res.success) {
        toast.success(res.message || 'Permintaan penarikan ditandai selesai.');
        router.reload();
      } else {
        toast.error(res.message || 'Gagal menyelesaikan penarikan.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Terjadi kesalahan.');
    } finally {
      setLoadingId(null);
      setConfirmCompleteOpen(false);
      setSelectedCompleteId(null);
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-semibold">
            <CheckCircle className="h-3.5 w-3.5" />
            Completed
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-semibold">
            <Check className="h-3.5 w-3.5" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-2.5 py-1 rounded-full text-xs font-semibold">
            <XCircle className="h-3.5 w-3.5" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full text-xs font-semibold">
            <Clock className="h-3.5 w-3.5" />
            Pending
          </span>
        );
    }
  };

  return (
    <DashboardLayout title="Permintaan Penarikan">
      <div className="px-6 py-8 max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Permintaan Penarikan</h1>
          <p className="text-sm text-slate-400 mt-0.5">Kelola permintaan penarikan dana dari creator.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                  <th className="px-6 py-4">Creator</th>
                  <th className="px-6 py-4">Jumlah</th>
                  <th className="px-6 py-4">Informasi Rekening</th>
                  <th className="px-6 py-4">Catatan</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Diajukan Pada</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {withdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                      <CreditCard className="h-10 w-10 mx-auto text-slate-200 mb-3" />
                      Belum ada permintaan penarikan dana.
                    </td>
                  </tr>
                ) : (
                  withdrawals.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{w.user?.name}</div>
                        <div className="text-xs text-slate-400">{w.user?.email}</div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        Rp {Number(w.jumlah).toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800">{w.bank_name || w.metode_pembayaran}</div>
                        <div className="text-xs text-slate-500">No: {w.nomor_rekening || '—'}</div>
                        <div className="text-xs text-slate-400">A/N: {w.nama_pemilik_rekening || '—'}</div>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <div className="text-xs text-slate-600 truncate" title={w.catatan}>{w.catatan || '—'}</div>
                        {w.admin_notes && (
                          <div className="text-xs text-red-500 mt-1 italic">Admin: {w.admin_notes}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(w.status)}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {w.tanggal_permohonan ? new Date(w.tanggal_permohonan).toLocaleString('id-ID') : '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {w.status === 'pending' && (
                            <>
                              <button
                                disabled={loadingId !== null}
                                onClick={() => openApproveModal(w.id)}
                                className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-bold transition-colors disabled:opacity-55"
                              >
                                Setujui
                              </button>
                              <button
                                disabled={loadingId !== null}
                                onClick={() => openRejectModal(w.id)}
                                className="text-xs bg-red-50 text-red-700 hover:bg-red-100 px-3 py-1.5 rounded-lg font-bold transition-colors disabled:opacity-55"
                              >
                                Tolak
                              </button>
                            </>
                          )}
                          {w.status === 'approved' && (
                            <button
                              disabled={loadingId !== null}
                              onClick={() => openCompleteModal(w.id)}
                              className="text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-1.5 rounded-lg font-bold transition-colors disabled:opacity-55"
                            >
                              Selesai
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Approve Confirmation Dialog */}
      <Dialog open={confirmApproveOpen} onOpenChange={setConfirmApproveOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Setujui Penarikan</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menyetujui permintaan penarikan dana ini?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setConfirmApproveOpen(false);
                setSelectedApproveId(null);
              }}
            >
              Batal
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleApproveConfirm}
              disabled={loadingId !== null}
            >
              Ya, Setujui
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Reason Dialog */}
      <Dialog open={confirmRejectOpen} onOpenChange={setConfirmRejectOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Tolak Penarikan</DialogTitle>
            <DialogDescription>
              Berikan alasan mengapa permintaan penarikan dana ini ditolak. Catatan ini akan dikirimkan ke creator.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Textarea
              placeholder="Contoh: Informasi rekening bank tidak valid."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={4}
              className="resize-none w-full"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setConfirmRejectOpen(false);
                setSelectedRejectId(null);
                setAdminNotes("");
              }}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={loadingId !== null || !adminNotes.trim()}
            >
              Ya, Tolak
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Confirmation Dialog */}
      <Dialog open={confirmCompleteOpen} onOpenChange={setConfirmCompleteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Selesaikan Penarikan</DialogTitle>
            <DialogDescription>
              Tandai transaksi penarikan dana ini sebagai selesai (dana telah berhasil dikirimkan ke rekening tujuan).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setConfirmCompleteOpen(false);
                setSelectedCompleteId(null);
              }}
            >
              Batal
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleCompleteConfirm}
              disabled={loadingId !== null}
            >
              Tandai Selesai
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
