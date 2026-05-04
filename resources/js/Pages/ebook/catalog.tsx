import { Head, router } from "@inertiajs/react";
import {
  Users, DollarSign, ArrowRight,
  Megaphone, Calendar, ShoppingBag, Link,
  Heart, PenLine, GraduationCap, UserCheck,
} from "lucide-react";

type Produk = {
  id: string;
  product_id: number;
  type: string;
  nama: string;
  harga: number;
  status?: string;
  tanggal: string;
  terjual: number;
  kategori: string;
};

type Props = {
  produk: Produk[];
};

type TypeConfig = {
  Icon: React.ElementType;
  color: string;
  route: string;
  gradient: string;
};

const TYPE_CONFIG: Record<string, TypeConfig> = {
  webinar: {
    Icon: Megaphone,
    color: "text-orange-500",
    route: "/webinar",
    gradient: "from-orange-400 to-red-500",
  },
  event: {
    Icon: Calendar,
    color: "text-pink-500",
    route: "/event",
    gradient: "from-pink-400 to-rose-500",
  },
  bootcamp: {
    Icon: GraduationCap,
    color: "text-blue-500",
    route: "/bootcamp",
    gradient: "from-blue-500 to-indigo-600",
  },
  "coaching-mentoring": {
    Icon: UserCheck,
    color: "text-teal-500",
    route: "/coaching-mentoring",
    gradient: "from-teal-400 to-cyan-600",
  },
  "produk-digital": {
    Icon: ShoppingBag,
    color: "text-violet-500",
    route: "/produk-digital",
    gradient: "from-violet-500 to-purple-600",
  },
  "payment-link": {
    Icon: Link,
    color: "text-sky-500",
    route: "/payment-link",
    gradient: "from-sky-400 to-blue-500",
  },
  "penggalangan-dana": {
    Icon: Heart,
    color: "text-red-500",
    route: "/penggalangan-dana",
    gradient: "from-red-400 to-pink-500",
  },
  tulisan: {
    Icon: PenLine,
    color: "text-amber-500",
    route: "/tulisan",
    gradient: "from-amber-400 to-yellow-500",
  },
  ebook: {
    Icon: BookOpen,
    color: "text-indigo-500",
    route: "/ebook",
    gradient: "from-indigo-400 to-blue-500",
  },
};

// Import missing icon
import { BookOpen } from "lucide-react";

function formatHarga(n?: number) {
  if (!n || n === 0) return "Gratis";
  return `Rp ${Number(n).toLocaleString("id-ID")}`;
}

export default function Katalog({ produk }: Props) {
  const list = produk ?? [];

  return (
    <>
      <Head title="Katalog Ebook" />

      <div className="min-h-screen bg-gray-50">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-slate-900 to-blue-900 text-white py-12">
          <div className="max-w-6xl mx-auto px-4">
            <h1 className="text-3xl font-extrabold">Katalog Ebook</h1>
            <p className="text-slate-300 mt-2 text-sm">
              {list.length} ebook tersedia — temukan yang terbaik untuk Anda 🚀
            </p>
          </div>
        </div>

        {/* GRID */}
        <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.length === 0 && (
            <p className="col-span-full text-center text-gray-400 py-16">
              Belum ada ebook yang tersedia.
            </p>
          )}

          {list.map((p) => {
            const cfg = TYPE_CONFIG[p.type];
            const gradient = cfg?.gradient ?? "from-gray-400 to-gray-600";

            return (
              <div
                key={p.id}
                className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden border"
              >
                {/* Thumbnail */}
                <div
                  className={`w-full h-40 bg-gradient-to-br ${gradient} flex items-end p-3`}
                >
                  <span className="text-white text-xs font-semibold bg-black/30 rounded px-2 py-0.5">
                    {p.kategori}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <h2 className="font-bold text-gray-800 line-clamp-2">
                    {p.nama}
                  </h2>

                  {/* STATS */}
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-blue-500" />
                      {p.terjual} terjual
                    </span>

                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-green-500" />
                      {formatHarga(p.harga)}
                    </span>

                    {cfg && (
                      <span className={`flex items-center gap-1 ${cfg.color}`}>
                        <cfg.Icon className="h-3 w-3" />
                        {p.kategori}
                      </span>
                    )}
                  </div>

                  {/* Status badge */}
                  {p.status && (
                    <span
                      className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
                        p.status === "active" || p.status === "published"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {p.status}
                    </span>
                  )}

                  {/* PRICE + CTA */}
                  <div className="flex items-center justify-between pt-3">
                    <span className="text-lg font-extrabold text-gray-900">
                      {formatHarga(p.harga)}
                    </span>

                    <button
                      onClick={() =>
                        cfg
                          ? router.visit(`${cfg.route}/${p.product_id}/p`)
                          : undefined
                      }
                      className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md flex items-center gap-1"
                    >
                      Detail <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
