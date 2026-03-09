// resources/js/Pages/Bootcamp/Tutorial.tsx
import { Head } from '@inertiajs/react'
import { Card, CardContent } from '@/components/ui/card'

const steps = [
  { step: 1, title: 'Buat Bootcamp', desc: 'Klik tombol "Buat Bootcamp" di halaman utama, isi form Step 1: nama, deskripsi, kategori, dan durasi.' },
  { step: 2, title: 'Isi Detail & Harga', desc: 'Di Step 2, isi harga, kuota, tanggal mulai/selesai, dan status publikasi.' },
  { step: 3, title: 'Tambahkan Link Pembayaran', desc: 'Paste URL link pembayaran (Midtrans, Xendit, dll) di kolom "Link Pembayaran".' },
  { step: 4, title: 'Publish Bootcamp', desc: 'Ubah status menjadi "Published" agar bootcamp muncul di Katalog publik.' },
  { step: 5, title: 'Bagikan Katalog', desc: 'Klik tombol "Katalog Kelas" untuk membuka halaman katalog yang bisa dibagikan ke calon peserta.' },
]

export default function Tutorial() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Head title="Tutorial Bootcamp" />
      <div className="max-w-3xl mx-auto py-12 px-6">
        <h1 className="text-2xl font-bold mb-2">Tutorial: Membuat Link Pembayaran Bootcamp</h1>
        <p className="text-gray-500 mb-8">Ikuti langkah-langkah berikut untuk membuat dan mempublikasikan bootcamp dengan link pembayaran.</p>
        
        <div className="space-y-4">
          {steps.map(s => (
            <Card key={s.step}>
              <CardContent className="flex items-start gap-4 pt-4">
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
                  {s.step}
                </div>
                <div>
                  <h3 className="font-semibold">{s.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{s.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}