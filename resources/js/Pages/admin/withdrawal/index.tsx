import { Head, router } from "@inertiajs/react";
import { useState, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  MoreVertical,
  Eye,
  Search,
  Filter,
} from "lucide-react";

type Withdrawal = {
  id: number;
  user: {
    name: string;
    email: string;
  };
  jumlah: number;
  metode_pembayaran: string;
  bank_name?: string;
  nomor_rekening?: string;
  status: "pending" | "approved" | "rejected" | "completed";
  tanggal_permohonan: string;
  tanggal_approval?: string;
  admin_notes?: string;
};

type Props = {
  withdrawals: {
    data: Withdrawal[];
    links: any;
  };
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
      icon: <Clock size={16} />,
    },
    approved: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      icon: <CheckCircle2 size={16} />,
    },
    completed: {
      bg: "bg-green-50",
      text: "text-green-700",
      icon: <CheckCircle2 size={16} />,
    },
    rejected: {
      bg: "bg-red-50",
      text: "text-red-700",
      icon: <XCircle size={16} />,
    },
  };

  const style = styles[status] || styles.pending;

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${style.bg} ${style.text}`}>
      {style.icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function WithdrawalIndex({ withdrawals }: Props) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filtered, setFiltered] = useState(withdrawals.data);

  useEffect(() => {
    let result = withdrawals.data;

    if (search) {
      result = result.filter(
        (w) =>
          w.user.name.toLowerCase().includes(search.toLowerCase()) ||
          w.user.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filterStatus) {
      result = result.filter((w) => w.status === filterStatus);
    }

    setFiltered(result);
  }, [search, filterStatus, withdrawals.data]);

  return (
    <>
      <Head title="Manajemen Withdrawal" />

      <div className="min-h-screen bg-gray-50">
        {/* HEADER */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-900">Withdrawal Requests</h1>
            <p className="text-gray-600 mt-1">Kelola permintaan penarikan dana dari users</p>
          </div>
        </div>

        {/* STATS */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
              <div className="text-3xl font-bold text-yellow-600">
                {withdrawals.data.filter((w) => w.status === "pending").length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Pending</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
              <div className="text-3xl font-bold text-blue-600">
                {withdrawals.data.filter((w) => w.status === "approved").length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Approved</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
              <div className="text-3xl font-bold text-green-600">
                {withdrawals.data.filter((w) => w.status === "completed").length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Completed</div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
              <div className="text-3xl font-bold text-red-600">
                {formatHarga(
                  withdrawals.data
                    .filter((w) => w.status === "pending")
                    .reduce((a, w) => a + w.jumlah, 0)
                )}
              </div>
              <div className="text-sm text-gray-600 mt-1">Total Pending</div>
            </div>
          </div>

          {/* SEARCH & FILTER */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search
                  size={18}
                  className="absolute left-3 top-3 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Cari berdasarkan nama atau email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter size={18} className="text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Semua Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {filtered.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-4xl mb-4">📭</div>
                <p className="text-gray-600">Tidak ada withdrawal request</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Jumlah
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Metode
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Tanggal
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filtered.map((withdrawal) => (
                      <tr key={withdrawal.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-semibold text-gray-900">
                              {withdrawal.user.name}
                            </div>
                            <div className="text-sm text-gray-600">
                              {withdrawal.user.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-900">
                          {formatHarga(withdrawal.jumlah)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div>
                            {withdrawal.metode_pembayaran}
                            {withdrawal.bank_name && (
                              <div className="text-xs text-gray-500">
                                {withdrawal.bank_name}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(withdrawal.status)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatTanggal(withdrawal.tanggal_permohonan)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() =>
                              router.visit(`/admin/withdrawal/${withdrawal.id}`)
                            }
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                          >
                            <Eye size={16} />
                            Detail
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
