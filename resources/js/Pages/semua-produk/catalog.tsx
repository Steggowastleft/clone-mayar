import { Head, router } from "@inertiajs/react";
import {
  Users, DollarSign, ArrowRight,
  Megaphone, Calendar, ShoppingBag, Link,
  Heart, PenLine, GraduationCap, UserCheck,
  Book, Mic, Music, Layout, 
  CreditCard, Package, Boxes, Image as ImageIcon
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
    route: "/bootcamp/catalog",
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
    Icon: Book,
    color: "text-emerald-500",
    route: "/ebook",
    gradient: "from-emerald-400 to-teal-500",
  },
  podcast: {
    Icon: Mic,
    color: "text-indigo-500",
    route: "/podcast",
    gradient: "from-indigo-400 to-purple-500",
  },
  "audio-book": {
    Icon: Music,
    color: "text-rose-500",
    route: "/audio-book",
    gradient: "from-rose-400 to-red-500",
  },
  "web-komik": {
    Icon: ImageIcon,
    color: "text-cyan-500",
    route: "/web-komik",
    gradient: "from-cyan-400 to-blue-500",
  },
  "membership-saas": {
    Icon: Layout,
    color: "text-slate-500",
    route: "/membership-saas",
    gradient: "from-slate-400 to-gray-600",
  },
  "creator-support-page": {
    Icon: Heart,
    color: "text-rose-400",
    route: "/creator-support-page",
    gradient: "from-rose-300 to-pink-400",
  },
  "paket-berlangganan": {
    Icon: CreditCard,
    color: "text-blue-400",
    route: "/paket-berlangganan",
    gradient: "from-blue-300 to-indigo-400",
  },
  "produk-fisik": {
    Icon: Package,
    color: "text-orange-600",
    route: "/produk-fisik",
    gradient: "from-orange-500 to-amber-600",
  },
  bundle: {
    Icon: Boxes,
    color: "text-indigo-600",
    route: "/bundle",
    gradient: "from-indigo-500 to-purple-700",
  },
};

function formatHarga(n?: number) {
  if (!n || n === 0) return "Gratis";
  return `Rp ${Number(n).toLocaleString("id-ID")}`;
}

export default function Katalog({ produk }: Props) {
  const list = produk ?? [];

  return (
    <>
      <Head title="Katalog Produk" />

      <div className="min-h-screen bg-gray-50">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-slate-900 to-blue-900 text-white py-12">
          <div className="max-w-6xl mx-auto px-4">
            <h1 className="text-3xl font-extrabold">Katalog Semua Produk</h1>
            <p className="text-slate-300 mt-2 text-sm">
              {list.length} produk tersedia — temukan yang terbaik untuk Anda 🚀
            </p>
          </div>
        </div>

        {/* GRID */}
        <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.length === 0 && (
            <p className="col-span-full text-center text-gray-400 py-16">
              Belum ada produk yang tersedia.
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


                  {/* PRICE + CTA */}
                  <div className="flex items-center justify-between pt-3">
                    <span className="text-lg font-extrabold text-gray-900">
                      {formatHarga(p.harga)}
                    </span>

                    <button
                      onClick={() =>
                        cfg
                          ? router.visit(
                              p.type === 'bootcamp' 
                                ? cfg.route
                                : `${cfg.route}/${p.product_id}${p.type === 'webinar' ? '' : '/p'}`
                            )
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