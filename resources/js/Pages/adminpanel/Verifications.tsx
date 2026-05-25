import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/dashboardlayout';
import { FileText, CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react';
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

interface VerificationDocument {
  id: number;
  document_type: string;
  file_path: string;
  original_name: string;
}

interface Verification {
  id: number;
  user_id: string;
  verification_type: 'individual' | 'business';
  legal_name: string;
  id_number: string;
  business_name?: string;
  business_description?: string;
  business_address?: string;
  website?: string;
  status: 'unverified' | 'pending' | 'approved' | 'rejected';
  decline_reason?: string;
  submitted_at: string;
  user: {
    name: string;
    email: string;
  };
  documents: VerificationDocument[];
}

interface Props {
  verifications: {
    data: Verification[];
    links: any[];
    current_page: number;
    last_page: number;
  };
}

export default function Verifications({ verifications }: Props) {
  const [loadingId, setLoadingId] = useState<number | null>(null);
  
  // Dialog States
  const [confirmApproveOpen, setConfirmApproveOpen] = useState(false);
  const [selectedApproveId, setSelectedApproveId] = useState<number | null>(null);

  const [confirmRejectOpen, setConfirmRejectOpen] = useState(false);
  const [selectedRejectId, setSelectedRejectId] = useState<number | null>(null);
  const [declineReason, setDeclineReason] = useState("");

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null);

  const isImageFile = (filename: string) => {
    if (!filename) return false;
    const ext = filename.split('.').pop()?.toLowerCase();
    return ext ? ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext) : false;
  };

  function openDetailModal(v: Verification) {
    setSelectedVerification(v);
    setDetailModalOpen(true);
  }

  const csrf = typeof document !== 'undefined' ? document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') : null;

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
      const res = await postJson(`/admin/verifikasi/${id}/approve`);
      if (res.success) {
        toast.success(res.message || 'Verifikasi berhasil disetujui.');
        router.reload();
      } else {
        toast.error(res.message || 'Gagal menyetujui verifikasi.');
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
    setDeclineReason("");
    setConfirmRejectOpen(true);
  }

  async function handleRejectConfirm() {
    if (!selectedRejectId) return;
    if (!declineReason.trim()) {
      toast.error("Alasan penolakan tidak boleh kosong.");
      return;
    }
    const id = selectedRejectId;
    setLoadingId(id);
    try {
      const res = await postJson(`/admin/verifikasi/${id}/reject`, { decline_reason: declineReason });
      if (res.success) {
        toast.success(res.message || 'Verifikasi berhasil ditolak.');
        router.reload();
      } else {
        toast.error(res.message || 'Gagal menolak verifikasi.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Terjadi kesalahan.');
    } finally {
      setLoadingId(null);
      setConfirmRejectOpen(false);
      setSelectedRejectId(null);
      setDeclineReason("");
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-semibold">
            <CheckCircle className="h-3.5 w-3.5" />
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
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full text-xs font-semibold">
            <Clock className="h-3.5 w-3.5" />
            Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-slate-50 text-slate-600 px-2.5 py-1 rounded-full text-xs font-semibold">
            Unverified
          </span>
        );
    }
  };

  return (
    <DashboardLayout title="Verifikasi Akun">
      <div className="px-6 py-8 max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Verifikasi Akun</h1>
          <p className="text-sm text-slate-400 mt-0.5">Kelola verifikasi akun pengguna dan dokumen legal mereka.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Tipe</th>
                  <th className="px-6 py-4">Nama Legal & ID</th>
                  <th className="px-6 py-4">Bisnis / Deskripsi</th>
                  <th className="px-6 py-4">Dokumen</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Diajukan Pada</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {verifications.data.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                      <FileText className="h-10 w-10 mx-auto text-slate-200 mb-3" />
                      Belum ada permintaan verifikasi akun.
                    </td>
                  </tr>
                ) : (
                  verifications.data.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{v.user?.name}</div>
                        <div className="text-xs text-slate-400">{v.user?.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="capitalize">{v.verification_type}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{v.legal_name || '—'}</div>
                        <div className="text-xs text-slate-400">ID: {v.id_number || '—'}</div>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        {v.verification_type === 'business' ? (
                          <>
                            <div className="font-semibold text-slate-800">{v.business_name}</div>
                            {v.website && (
                              <a href={v.website} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline inline-flex items-center gap-0.5">
                                {v.website} <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                            <div className="text-xs text-slate-400 line-clamp-2 mt-1">{v.business_description}</div>
                          </>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5">
                          {v.documents?.length === 0 ? (
                            <span className="text-xs text-slate-400">Tidak ada dokumen</span>
                          ) : (
                            v.documents?.map((doc) => (
                              <a
                                key={doc.id}
                                href={`/account/verification/documents/${doc.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                              >
                                <FileText className="h-3.5 w-3.5 text-slate-400" />
                                <span className="truncate max-w-[120px]">{doc.original_name || doc.document_type}</span>
                              </a>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {getStatusBadge(v.status)}
                          {v.status === 'rejected' && v.decline_reason && (
                            <span className="text-[11px] text-red-500 max-w-[150px] break-words">
                              Alasan: {v.decline_reason}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {v.submitted_at ? new Date(v.submitted_at).toLocaleString('id-ID') : '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openDetailModal(v)}
                            className="text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 px-3 py-1.5 rounded-lg font-bold transition-colors"
                          >
                            Detail
                          </button>
                          {v.status === 'pending' && (
                            <>
                              <button
                                disabled={loadingId !== null}
                                onClick={() => openApproveModal(v.id)}
                                className="text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-1.5 rounded-lg font-bold transition-colors disabled:opacity-55"
                              >
                                Setujui
                              </button>
                              <button
                                disabled={loadingId !== null}
                                onClick={() => openRejectModal(v.id)}
                                className="text-xs bg-red-50 text-red-700 hover:bg-red-100 px-3 py-1.5 rounded-lg font-bold transition-colors disabled:opacity-55"
                              >
                                Tolak
                              </button>
                            </>
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
            <DialogTitle>Setujui Verifikasi</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menyetujui permintaan verifikasi akun ini? Akun pengguna akan langsung ditandai sebagai terverifikasi.
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
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
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
            <DialogTitle>Tolak Verifikasi</DialogTitle>
            <DialogDescription>
              Berikan alasan mengapa permintaan verifikasi akun ini ditolak. Alasan ini akan ditampilkan ke pengguna.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Textarea
              placeholder="Contoh: Dokumen identitas tidak jelas atau buram."
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
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
                setDeclineReason("");
              }}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={loadingId !== null || !declineReason.trim()}
            >
              Ya, Tolak
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Verification Detail Dialog */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedVerification && (
            <div className="space-y-6">
              <div>
                <DialogTitle className="text-xl font-bold text-slate-900">Detail Pengajuan Verifikasi</DialogTitle>
                <DialogDescription className="text-sm text-slate-400 mt-1">
                  Data lengkap legalitas dan dokumen pendukung pengguna.
                </DialogDescription>
              </div>

              {/* User Account Info */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Informasi Akun Pemohon</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-slate-500">Nama Akun: </span>
                    <span className="font-semibold text-slate-800">{selectedVerification.user?.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Email: </span>
                    <span className="font-semibold text-slate-800">{selectedVerification.user?.email}</span>
                  </div>
                </div>
              </div>

              {/* Status Banner */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Status Verifikasi</h4>
                {selectedVerification.status === 'approved' && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex gap-3 items-start shadow-sm">
                    <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <div>
                      <h5 className="font-bold text-emerald-950 text-sm">Akun Terverifikasi</h5>
                      <p className="text-xs text-emerald-700 leading-relaxed mt-0.5">
                        Identitas dan bisnis ini telah diverifikasi dan disetujui.
                      </p>
                    </div>
                  </div>
                )}
                {selectedVerification.status === 'pending' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 items-start shadow-sm">
                    <Clock className="h-5 w-5 text-amber-600 mt-0.5 animate-pulse" />
                    <div>
                      <h5 className="font-bold text-amber-950 text-sm">Sedang Ditinjau</h5>
                      <p className="text-xs text-amber-700 leading-relaxed mt-0.5">
                        Menunggu keputusan persetujuan dari tim admin kepatuhan.
                      </p>
                    </div>
                  </div>
                )}
                {selectedVerification.status === 'rejected' && (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex gap-3 items-start shadow-sm">
                    <XCircle className="h-5 w-5 text-rose-600 mt-0.5" />
                    <div className="flex-1">
                      <h5 className="font-bold text-rose-950 text-sm">Verifikasi Ditolak</h5>
                      {selectedVerification.decline_reason && (
                        <div className="mt-2 p-2.5 bg-rose-100/50 rounded-lg text-xs text-rose-950 border border-rose-200 font-semibold italic">
                          &ldquo;{selectedVerification.decline_reason}&rdquo;
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Identity & Business Info Grid */}
              <div className="border-t border-slate-100 pt-4">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Informasi Legalitas & Bisnis</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Tipe Verifikasi</span>
                    <span className="font-semibold text-slate-800 capitalize">{selectedVerification.verification_type}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Nama Sesuai KTP / Legal</span>
                    <span className="font-semibold text-slate-800">{selectedVerification.legal_name || '—'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Nomor KTP / Identitas</span>
                    <span className="font-semibold text-slate-800">{selectedVerification.id_number || '—'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Website Bisnis</span>
                    {selectedVerification.website ? (
                      <a
                        href={selectedVerification.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        {selectedVerification.website} <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="font-semibold text-slate-800">—</span>
                    )}
                  </div>
                  {selectedVerification.verification_type === 'business' && (
                    <>
                      <div>
                        <span className="text-xs text-slate-400 block font-medium">Nama Usaha / Perusahaan</span>
                        <span className="font-semibold text-slate-800">{selectedVerification.business_name || '—'}</span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-xs text-slate-400 block font-medium">Deskripsi Usaha</span>
                        <span className="text-slate-700 block mt-0.5 leading-relaxed bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">{selectedVerification.business_description || '—'}</span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-xs text-slate-400 block font-medium">Alamat Lengkap Usaha</span>
                        <span className="text-slate-700 block mt-0.5 leading-relaxed bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">{selectedVerification.business_address || '—'}</span>
                      </div>
                    </>
                  )}
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Tanggal Diajukan</span>
                    <span className="font-semibold text-slate-800">
                      {selectedVerification.submitted_at ? new Date(selectedVerification.submitted_at).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Documents & Files Preview */}
              <div className="border-t border-slate-100 pt-4">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Dokumen Pendukung</h4>
                <div className="grid grid-cols-1 gap-4">
                  {selectedVerification.documents?.length === 0 ? (
                    <span className="text-sm text-slate-400">Tidak ada dokumen yang diunggah.</span>
                  ) : (
                    selectedVerification.documents?.map((doc) => {
                      const isImg = isImageFile(doc.original_name || doc.file_path);
                      const docUrl = `/account/verification/documents/${doc.id}`;
                      return (
                        <div key={doc.id} className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 flex flex-col space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                              {doc.document_type.replace(/_/g, ' ')}
                            </span>
                            <a
                              href={docUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 font-semibold"
                            >
                              Open in New Tab <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                          {isImg ? (
                            <div className="relative border border-slate-200 rounded-lg overflow-hidden bg-white max-h-[350px] flex items-center justify-center p-2 shadow-inner">
                              <img
                                src={docUrl}
                                alt={doc.original_name || doc.document_type}
                                className="max-h-[330px] max-w-full object-contain rounded"
                              />
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                <FileText className="h-6 w-6" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-semibold text-slate-800 block truncate" title={doc.original_name}>
                                  {doc.original_name}
                                </span>
                                <span className="text-xs text-slate-400 capitalize block mt-0.5">
                                  Type: {doc.document_type.replace(/_/g, ' ')}
                                </span>
                              </div>
                              <a
                                href={docUrl}
                                download
                                className="text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 px-3.5 py-2 rounded-lg font-bold transition-colors"
                              >
                                Download
                              </a>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Quick Actions Footer inside Modal */}
              <DialogFooter className="border-t border-slate-100 pt-4 flex gap-2 sm:gap-0 justify-between items-center">
                <div>
                  {selectedVerification.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="font-bold"
                        onClick={() => {
                          setDetailModalOpen(false);
                          openRejectModal(selectedVerification.id);
                        }}
                      >
                        Tolak
                      </Button>
                      <Button
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                        size="sm"
                        onClick={() => {
                          setDetailModalOpen(false);
                          openApproveModal(selectedVerification.id);
                        }}
                      >
                        Setujui
                      </Button>
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDetailModalOpen(false)}
                >
                  Tutup
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
