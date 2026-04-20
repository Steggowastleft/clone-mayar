import AppLayout from "@/layouts/app-layout"
import { Head } from "@inertiajs/react"

export default function CreatePermintaan() {
    return (
        <AppLayout>
            <Head title="Buat Permintaan Bayar" />

            <div className="p-6 space-y-4">
                <h1 className="text-2xl font-bold">Buat Permintaan</h1>

                <div className="bg-white rounded-xl shadow p-6">
                    <p className="text-gray-500">Form buat permintaan bayar</p>
                </div>
            </div>
        </AppLayout>
    )
}
