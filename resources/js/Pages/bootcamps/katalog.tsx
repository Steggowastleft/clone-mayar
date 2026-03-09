// resources/js/Pages/Bootcamp/Katalog.tsx
import { Head } from '@inertiajs/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Bootcamp {
  id: number
  name: string
  description: string
  category: string
  duration_months: number
  price: number
  quota: number
  start_date: string
  end_date: string
  payment_link: string
}

export default function Katalog({ bootcamps }: { bootcamps: Bootcamp[] }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Head title="Katalog Bootcamp" />
      
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold">Katalog Kelas Bootcamp</h1>
          <p className="mt-2 text-blue-100">
            Program pelatihan intensif untuk meningkatkan skill digital kamu
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-5xl mx-auto py-10 px-6">
        {bootcamps.length === 0 ? (
          <p className="text-center text-gray-400 py-16">Belum ada kelas yang dipublikasikan.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bootcamps.map(b => (
              <Card key={b.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Badge variant="secondary" className="w-fit">{b.category}</Badge>
                  <CardTitle className="text-lg mt-1">{b.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-500 line-clamp-3">{b.description}</p>
                  <div className="flex justify-between text-sm">
                    <span>⏱ {b.duration_months} bulan</span>
                    <span>👥 {b.quota} peserta</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    📅 {b.start_date} → {b.end_date}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="font-bold text-blue-600">
                      Rp {Number(b.price).toLocaleString('id-ID')}
                    </span>
                    {b.payment_link && (
                      <Button size="sm" onClick={() => window.open(b.payment_link, '_blank')}>
                        Daftar Sekarang
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}