import AppLayout from "@/layouts/app-layout"
import { Head } from "@inertiajs/react"

export default function Page() {
    return (
        <AppLayout>
            <Head title="Creator Support" />

            <div className="p-6 space-y-4">
                <h1 className="text-2xl font-bold">Creator Support</h1>

                <div className="bg-white rounded-xl shadow p-6">
                    <p className="text-gray-500">
                        Halaman Creator Support (coming soon)
                    </p>
                </div>
            </div>
        </AppLayout>
    )
}
