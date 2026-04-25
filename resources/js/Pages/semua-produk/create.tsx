import { Head, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/dashboard/dashboardlayout";
import {
  BookOpen,
  Video,
  ShoppingBag,
  DollarSign,
  Link2Icon,
  Zap,
  User,
} from "lucide-react";

type ProductType = {
  value: string;
  label: string;
};

type Props = {
  productTypes: ProductType[];
};

const productTypeIcons: Record<string, React.ReactNode> = {
  webinar: <Video className="h-8 w-8" />,
  event: <Zap className="h-8 w-8" />,
  bootcamp: <BookOpen className="h-8 w-8" />,
  "coaching-mentoring": <User className="h-8 w-8" />,
  "produk-digital": <ShoppingBag className="h-8 w-8" />,
  "payment-link": <Link2Icon className="h-8 w-8" />,
};

const productTypeDescriptions: Record<string, string> = {
  webinar: "Buat webinar interaktif untuk sharing ilmu dengan peserta",
  event: "Buat event atau acara khusus dengan berbagai tiket",
  bootcamp: "Buat program pembelajaran intensif dengan kurikulum lengkap",
  "coaching-mentoring": "Tawarkan sesi coaching atau mentoring 1-on-1",
  "produk-digital": "Jual produk digital seperti ebook, template, atau resource",
  "payment-link": "Buat link pembayaran untuk produk atau layanan apapun",
};

const routeMap: Record<string, string> = {
  webinar: "webinar.index",
  event: "event.index",
  bootcamp: "bootcamp.index",
  "coaching-mentoring": "coaching-mentoring.create",
  "produk-digital": "produk-digital.index",
  "payment-link": "payment-link.index",
};

export default function CreateProduct({ productTypes }: Props) {
  const handleSelectType = (type: string) => {
    const route = routeMap[type];
    if (route) {
      router.visit(route);
    }
  };

  return (
    <DashboardLayout>
      <Head title="Buat Produk" />
      <div className="flex gap-0 min-h-screen">
        <div className="flex-1 p-6">
          <Button
            variant="ghost"
            onClick={() => router.visit("/semua-produk")}
            className="mb-6 text-gray-600"
          >
            ← Kembali
          </Button>

          <div className="max-w-4xl">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Buat Produk Baru</h1>
            <p className="text-gray-600 mb-8">Pilih jenis produk yang ingin Anda buat</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {productTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => handleSelectType(type.value)}
                  className="group relative bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-lg transition-all text-left"
                >
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
                      →
                    </div>
                  </div>

                  <div className="text-blue-600 mb-4">
                    {productTypeIcons[type.value] || <ShoppingBag className="h-8 w-8" />}
                  </div>

                  <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition">
                    {type.label}
                  </h3>

                  <p className="text-sm text-gray-600">
                    {productTypeDescriptions[type.value] || "Buat produk baru"}
                  </p>

                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={(e) => {
                        e.preventDefault();
                        handleSelectType(type.value);
                      }}
                    >
                      Buat {type.label}
                    </Button>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
