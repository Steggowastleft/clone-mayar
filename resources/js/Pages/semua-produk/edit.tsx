import { Head, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/dashboard/dashboardlayout";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useEffect } from "react";

type Product = {
  id: number;
  nama: string;
  [key: string]: any;
};

type Props = {
  product: Product;
  type: string;
};

const typeConfig: Record<string, {
  label: string;
  editRoute: (id: number) => string;
}> = {
  webinar: {
    label: "Webinar",
    editRoute: (id) => `/webinar/${id}`,
  },
  event: {
    label: "Event",
    editRoute: (id) => `/event/${id}`,
  },
  bootcamp: {
    label: "Kelas Online",
    editRoute: (id) => `/bootcamps/${id}`,
  },
  "produk-digital": {
    label: "Produk Digital",
    editRoute: (id) => `/produk-digital/${id}`,
  },
  "payment-link": {
    label: "Link Pembayaran",
    editRoute: (id) => `/payment-link/${id}`,
  },
};

export default function ProductEdit({ product, type }: Props) {
  const config = typeConfig[type] || typeConfig.webinar;
  const editUrl = config.editRoute(product.id);

  // Auto-redirect to the specific product's edit page
  useEffect(() => {
    router.visit(editUrl);
  }, []);

  return (
    <DashboardLayout>
      <Head title={`Edit ${product.nama}`} />
      <div className="flex gap-0 min-h-screen">
        <div className="flex-1 p-6">
          <div className="max-w-4xl">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 text-center">
              <p className="text-gray-600 mb-4">
                Kami mengarahkan Anda ke halaman edit {config.label}...
              </p>
              <Button
                variant="outline"
                onClick={() => router.visit(editUrl)}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Buka Halaman Edit
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
