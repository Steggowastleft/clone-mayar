import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Copy,
  ArrowLeft,
} from "lucide-react";

type Withdrawal = {
  id: number;
  user: {
    name: string;
    email: string;
  };
  jumlah: number;
  metode_pembayaran: string;
  nomor_rekening?: string;
  nama_pemilik_rekening?: string;
  bank_name?: string;
  status: "pending" | "approved" | "rejected" | "completed";
  catatan?: string;
  admin_notes?: string;
  tanggal_permohonan: string;
  tanggal_approval?: string;
  tanggal_selesai?: string;
  approvedBy?: {
    name: string;
  };
};

type Props = {
  withdrawal: Withdrawal;
};

function formatHarga(n: number) {
  return `Rp ${Number(n).toLocaleString("id-ID")}`;
}

function formatTanggal(date: string) {
  return new Date(date).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusBadge(status: string) {
  const styles: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    pending: {
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      icon: <Clock size={20} />,
    },
    approved: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      icon: <CheckCircle2 size={20} />,
    },
    completed: {
      bg: "bg-green-50",
      text: "text-green-700",
      icon: <CheckCircle2 size={20} />,
    },
    rejected: {
      bg: "bg-red-50",
      text: "text-red-700",
      icon: <XCircle size={20} />,
    },
  };

  const style = styles[status] || styles.pending;

  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold ${style.bg} ${style.text}`}>
      {style.icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </div>
  );
}

export default function WithdrawalDetail({ withdrawal }: Props) {
  const [loading, setLoading] = useState(false);
  const [approveNotes, setApproveNotes] = useState("");
  const [rejectNotes, setRejectNotes] = useState("");
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleApprove = async () => {
    if (!approveNotes.trim()) {
      setError("Catatan approval tidak boleh kosong");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/admin/withdrawal/${withdrawal.id}/approve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": document
              .querySelector('meta[name="csrf-token"]')
              ?.getAttribute("content") || "",
          },
          body: JSON.stringify({
            admin_notes: approveNotes,
          }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Gagal approve withdrawal");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.visit("/admin/withdrawal");
      }, 1500);
    } catch (err) {
      setError("Error: " + (err instanceof Error ? err.message : "Unknown error"));
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectNotes.trim()) {
      setError("Alasan penolakan tidak boleh kosong");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/admin/withdrawal/${withdrawal.id}/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": document
              .querySelector('meta[name="csrf-token"]')
              ?.getAttribute("content") || "",
          },
          body: JSON.stringify({
            admin_notes: rejectNotes,
          }),
        }
      );

      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Gagal reject withdrawal");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.visit("/admin/withdrawal");
      }, 1500);
    } catch (err) {
      setError("Error: " + (err instanceof Error ? err.message : "Unknown error"));
      setLoading(false);
    }
  };

  const handleMarkCompleted = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/admin/withdrawal/${withdrawal.id}/mark-completed`,
        {
          method: "POST",
          headers: {
            "X-CSRF-Token": document
              .querySelector('meta[name="csrf-token"]')
              ?.getAttribute("content") || "",
          },
        }
      );

      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Gagal mark completed");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.visit("/admin/withdrawal");
      }, 1500);
    } catch (err) {
      setError("Error: " + (err instanceof Error ? err.message : "Unknown error"));
      setLoading(false);
    }
  };

  const isPending = withdrawal.status === "pending";
  const isApproved = withdrawal.status === "approved";

  return (
    <>
      <Head title={`Withdrawal Detail #${withdrawal.id}`} />

      <div className="min-h-screen bg-gray-50">
        {/* HEADER */}
        <div className="bg-white border-b">
          <div className="max-w-5xl mx-auto px-6 py-6">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => router.visit("/admin/withdrawal")}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                Withdrawal Request #{withdrawal.id}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              {getStatusBadge(withdrawal.status)}
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* LEFT - DETAILS */}
            <div className="md:col-span-2">
              {/* USER INFO */}
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Informasi User
                </h2>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600">Nama</label>
                    <p className="font-semibold text-gray-900">
                      {withdrawal.user.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Email</label>
                    <p className="font-semibold text-gray-900">
                      {withdrawal.user.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* WITHDRAWAL DETAILS */}
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Detail Penarikan
                </h2>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">
                        Jumlah Penarikan
                      </label>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatHarga(withdrawal.jumlah)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">
                        Metode Pembayaran
                      </label>
                      <p className="font-semibold text-gray-900">
                        {withdrawal.metode_pembayaran}
                      </p>
                    </div>
                  </div>

                  {/* BANK DETAILS */}
                  {(withdrawal.bank_name ||
                    withdrawal.nomor_rekening ||
                    withdrawal.nama_pemilik_rekening) && (
                    <div className="border-t pt-4">
                      <h3 className="font-semibold text-gray-900 mb-3">
                        Informasi Rekening
                      </h3>
                      <div className="space-y-3">
                        {withdrawal.bank_name && (
                          <div>
                            <label className="text-sm text-gray-600">Bank</label>
                            <p className="font-semibold text-gray-900">
                              {withdrawal.bank_name}
                            </p>
                          </div>
                        )}
                        {withdrawal.nomor_rekening && (
                          <div>
                            <label className="text-sm text-gray-600">
                              Nomor Rekening
                            </label>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-gray-900">
                                {withdrawal.nomor_rekening}
                              </p>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    withdrawal.nomor_rekening || ""
                                  );
                                }}
                                className="p-1 hover:bg-gray-100 rounded transition"
                              >
                                <Copy size={16} className="text-gray-600" />
                              </button>
                            </div>
                          </div>
                        )}
                        {withdrawal.nama_pemilik_rekening && (
                          <div>
                            <label className="text-sm text-gray-600">
                              Nama Pemilik Rekening
                            </label>
                            <p className="font-semibold text-gray-900">
                              {withdrawal.nama_pemilik_rekening}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* CATATAN USER */}
                  {withdrawal.catatan && (
                    <div className="border-t pt-4">
                      <label className="text-sm text-gray-600">
                        Catatan dari User
                      </label>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg mt-2">
                        {withdrawal.catatan}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* TIMESTAMPS */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Timeline
                </h2>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600">
                      Tanggal Permohonan
                    </label>
                    <p className="font-semibold text-gray-900">
                      {formatTanggal(withdrawal.tanggal_permohonan)}
                    </p>
                  </div>
                  {withdrawal.tanggal_approval && (
                    <div>
                      <label className="text-sm text-gray-600">
                        Tanggal Approval
                      </label>
                      <p className="font-semibold text-gray-900">
                        {formatTanggal(withdrawal.tanggal_approval)}
                      </p>
                    </div>
                  )}
                  {withdrawal.tanggal_selesai && (
                    <div>
                      <label className="text-sm text-gray-600">
                        Tanggal Selesai
                      </label>
                      <p className="font-semibold text-gray-900">
                        {formatTanggal(withdrawal.tanggal_selesai)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT - ACTIONS */}
            <div>
              {isPending && (
                <div className="space-y-4">
                  {/* APPROVE */}
                  {action === "approve" ? (
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="font-bold text-gray-900 mb-4">
                        Approve Withdrawal
                      </h3>
                      <div className="space-y-4">
                        <textarea
                          value={approveNotes}
                          onChange={(e) => setApproveNotes(e.target.value)}
                          placeholder="Catatan untuk approval (wajib diisi)"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={4}
                          disabled={loading}
                        />

                        {error && (
                          <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-start gap-2">
                            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                            <span>{error}</span>
                          </div>
                        )}

                        {success && (
                          <div className="p-3 bg-green-50 text-green-700 rounded-lg border border-green-200 flex items-start gap-2">
                            <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
                            <span>Berhasil!</span>
                          </div>
                        )}

                        <div className="flex gap-3">
                          <button
                            onClick={handleApprove}
                            disabled={loading || !approveNotes.trim()}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loading ? "Memproses..." : "Approve"}
                          </button>
                          <button
                            onClick={() => {
                              setAction(null);
                              setError("");
                            }}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setAction("approve");
                        setError("");
                      }}
                      className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 size={18} />
                      Approve
                    </button>
                  )}

                  {/* REJECT */}
                  {action === "reject" ? (
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="font-bold text-gray-900 mb-4">
                        Reject Withdrawal
                      </h3>
                      <div className="space-y-4">
                        <textarea
                          value={rejectNotes}
                          onChange={(e) => setRejectNotes(e.target.value)}
                          placeholder="Alasan penolakan (wajib diisi)"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                          rows={4}
                          disabled={loading}
                        />

                        {error && (
                          <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-start gap-2">
                            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                            <span>{error}</span>
                          </div>
                        )}

                        {success && (
                          <div className="p-3 bg-green-50 text-green-700 rounded-lg border border-green-200 flex items-start gap-2">
                            <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
                            <span>Berhasil!</span>
                          </div>
                        )}

                        <div className="flex gap-3">
                          <button
                            onClick={handleReject}
                            disabled={loading || !rejectNotes.trim()}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loading ? "Memproses..." : "Reject"}
                          </button>
                          <button
                            onClick={() => {
                              setAction(null);
                              setError("");
                            }}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setAction("reject");
                        setError("");
                      }}
                      className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold flex items-center justify-center gap-2"
                    >
                      <XCircle size={18} />
                      Reject
                    </button>
                  )}
                </div>
              )}

              {isApproved && (
                <div className="bg-blue-50 rounded-lg shadow p-6 border border-blue-200">
                  <h3 className="font-bold text-blue-900 mb-4">
                    Status: Approved
                  </h3>
                  <button
                    onClick={handleMarkCompleted}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
                  >
                    {loading ? "Memproses..." : "Mark as Completed"}
                  </button>
                </div>
              )}

              {withdrawal.status === "completed" && (
                <div className="bg-green-50 rounded-lg shadow p-6 border border-green-200">
                  <div className="flex items-center gap-2 text-green-700 font-semibold">
                    <CheckCircle2 size={20} />
                    Withdrawal Completed
                  </div>
                </div>
              )}

              {withdrawal.status === "rejected" && (
                <div className="bg-red-50 rounded-lg shadow p-6 border border-red-200">
                  <div className="flex items-center gap-2 text-red-700 font-semibold mb-3">
                    <XCircle size={20} />
                    Withdrawal Rejected
                  </div>
                  {withdrawal.admin_notes && (
                    <div className="text-sm text-red-700">
                      <p className="font-semibold mb-1">Alasan:</p>
                      <p>{withdrawal.admin_notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
