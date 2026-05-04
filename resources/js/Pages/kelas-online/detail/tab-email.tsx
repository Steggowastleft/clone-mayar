import { useState } from "react";
import { MessageCircle } from "lucide-react";

// ─────────────────────────────────────────────
// Type
// ─────────────────────────────────────────────
type PesertaItem = {
  id: number;
  nama: string;
  email: string;
  no_hp?: string;
  tanggal_daftar: string;
  created_at: string;
};

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function TabEmail({
  pesertaList = [],
}: {
  pesertaList: PesertaItem[];
}) {
  const [selectedPeserta, setSelectedPeserta] =
    useState<PesertaItem | null>(null);

  // Toggle klik (klik lagi = close)
  const handleClick = (p: PesertaItem) => {
    if (selectedPeserta?.id === p.id) {
      setSelectedPeserta(null);
    } else {
      setSelectedPeserta(p);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5">
      
      {/* Title */}
      <h2 className="text-sm font-semibold text-gray-700 mb-4">
        Daftar Email Peserta
      </h2>

      {/* List */}
      {pesertaList.length === 0 ? (
        <p className="text-gray-400 text-sm">Belum ada peserta</p>
      ) : (
        <div className="space-y-1">
          {pesertaList.map((p) => (
            <div
              key={p.id}
              onClick={() => handleClick(p)}
              className={`cursor-pointer border-b py-2 text-sm transition ${
                selectedPeserta?.id === p.id
                  ? "text-blue-800 font-semibold"
                  : "text-blue-600 hover:text-blue-800"
              }`}
            >
              {p.email}
            </div>
          ))}
        </div>
      )}

      {/* ───────────────────────────── */}
      {/* POPUP MODAL */}
      {/* ───────────────────────────── */}
      {selectedPeserta && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setSelectedPeserta(null)} // klik luar = close
        >
          <div
            className="bg-white rounded-lg shadow-lg p-5 w-[350px]"
            onClick={(e) => e.stopPropagation()} // biar klik dalam nggak nutup
          >
            <h3 className="text-sm font-semibold mb-3 text-gray-800">
              Detail Peserta
            </h3>

            <p className="text-sm text-gray-700">
              <strong>Nama:</strong> {selectedPeserta.nama}
            </p>

            <p className="text-sm text-gray-700 mt-2">
              <strong>Email:</strong> {selectedPeserta.email}
            </p>

            <p className="text-sm text-gray-700 mt-2">
              <strong>No HP:</strong> {selectedPeserta.no_hp || "-"}
            </p>

            <p className="text-sm text-gray-700 mt-2">
              <strong>Tanggal Daftar:</strong>{" "}
              {new Date(selectedPeserta.tanggal_daftar).toLocaleString("id-ID", {
                dateStyle: "full",
                timeStyle: "short",
              })}
            </p>

            {/* Aksi WhatsApp */}
            {selectedPeserta.no_hp && (
              <a
                href={`https://wa.me/${selectedPeserta.no_hp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center justify-center gap-2 w-full py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded transition"
              >
                <MessageCircle className="h-4 w-4" />
                Hubungi via WhatsApp
              </a>
            )}

            {/* Tombol close */}
            <button
              onClick={() => setSelectedPeserta(null)}
              className="mt-2 w-full py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
