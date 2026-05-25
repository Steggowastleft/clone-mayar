import React from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/dashboardlayout';
import { 
  ArrowLeft, Calendar, Mail, Phone, ShieldCheck, 
  Trash2, ShoppingBag, DollarSign, Clock, FileText, CheckCircle2, User, Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Creator {
  id: string | number;
  name: string;
  email: string;
  phone: string;
  business_name: string;
  verification_status: string;
  created_at: string;
}

interface Props {
  product: any;
  creator: Creator | null;
  type: string;
}

export default function ProductDetail({ product, creator, type }: Props) {
  
  const formatCurrency = (val: any) => {
    if (!val) return 'Rp 0';
    return `Rp ${Number(val).toLocaleString('id-ID')}`;
  };

  const formatDate = (val: any) => {
    if (!val) return '—';
    return new Date(val).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDateTime = (val: any) => {
    if (!val) return '—';
    return new Date(val).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeSlug = (typeName: string) => {
    switch (typeName) {
      case 'Digital Product': return 'digital-product';
      case 'Bootcamp': return 'bootcamp';
      case 'Online Class': return 'online-class';
      case 'Webinar': return 'webinar';
      case 'Bundling': return 'bundling';
      case 'Coaching & Mentoring': return 'coaching-mentoring';
      case 'Ebook': return 'ebook';
      case 'Event': return 'event';
      case 'Payment Link': return 'payment-link';
      case 'Penggalangan Dana': return 'penggalangan-dana';
      case 'Tulisan': return 'tulisan';
      default: return typeName.toLowerCase().replace(/\s+/g, '-');
    }
  };

  const handleDeleteProduct = () => {
    if (confirm(`Apakah Anda yakin ingin menghapus produk "${product.nama || product.name || 'ini'}" secara permanen?`)) {
      router.delete(`/admin/products/${getTypeSlug(type)}/${product.id}`, {
        onSuccess: () => {
          toast.success("Produk berhasil dihapus!");
          router.visit('/admin/products');
        },
        onError: () => {
          toast.error("Gagal menghapus produk.");
        }
      });
    }
  };

  const getProductSpecificRows = () => {
    const rows = [];

    switch (type) {
      case 'Digital Product':
        rows.push(
          { label: 'Kategori', value: product.kategori || '—' },
          { label: 'Tipe Pembayaran', value: product.tipe_pembayaran === 'berbayar' ? 'Berbayar' : 'Gratis' },
          { label: 'Sumber File', value: product.sumber_file === 'upload' ? 'Upload File' : (product.sumber_file === 'file_lama' ? 'File Lama' : 'Link / Redirect') },
          { label: 'Redirect URL', value: product.redirect_url ? <a href={product.redirect_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{product.redirect_url}</a> : '—' },
          { label: 'File URL / Path', value: product.file_url ? <a href={product.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{product.file_url}</a> : '—' },
          { label: 'Bisa Affiliate', value: product.bisa_affiliate ? 'Ya' : 'Tidak' },
          { label: 'Max Pembayaran', value: product.max_pembayaran ? `${product.max_pembayaran} pembeli` : 'Unlimited' },
          { label: 'Total Penjualan', value: `${product.total_penjualan || 0} penjualan` },
          { label: 'Catatan', value: product.catatan || '—' }
        );
        if (product.author) rows.push({ label: 'Penulis (Author)', value: product.author });
        if (product.isbn) rows.push({ label: 'ISBN', value: product.isbn });
        if (product.format) rows.push({ label: 'Format', value: product.format });
        if (product.bahasa) rows.push({ label: 'Bahasa', value: product.bahasa });
        if (product.jumlah_halaman) rows.push({ label: 'Jumlah Halaman', value: product.jumlah_halaman });
        break;

      case 'Bootcamp':
        rows.push(
          { label: 'Kategori', value: product.kategori || '—' },
          { label: 'Batch', value: product.batch || '—' },
          { label: 'Max Peserta', value: product.max_peserta ? `${product.max_peserta} orang` : 'Unlimited' },
          { label: 'Batas Nilai Quiz', value: product.batas_nilai_quiz ? `${product.batas_nilai_quiz}%` : '—' },
          { label: 'Bisa Affiliate', value: product.bisa_affiliate ? 'Ya' : 'Tidak' },
          { label: 'Redirect URL', value: product.redirect_url ? <a href={product.redirect_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{product.redirect_url}</a> : '—' },
          { label: 'Tanggal Mulai Jual', value: formatDate(product.tanggal_mulai_jual) },
          { label: 'Tanggal Tutup Daftar', value: formatDate(product.tanggal_tutup_daftar) },
          { label: 'Tanggal Mulai Pembelajaran', value: formatDate(product.tanggal_mulai_pembelajaran) },
          { label: 'Tanggal Batas Pembelajaran', value: formatDate(product.tanggal_batas_pembelajaran) },
          { label: 'Instruksi', value: product.instruksi || '—', block: true },
          { label: 'Syarat & Ketentuan', value: product.syarat_ketentuan || '—', block: true }
        );
        break;

      case 'Online Class':
        rows.push(
          { label: 'Tipe Pembayaran', value: product.is_gratis ? 'Gratis' : 'Berbayar' },
          { label: 'Materi File', value: product.materi_file ? <a href={`/storage/${product.materi_file}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{product.materi_nama_asli || 'Download Materi'}</a> : '—' },
          { label: 'Wajib Quiz untuk Sertifikat', value: product.require_quiz_sertifikat ? 'Ya' : 'Tidak' },
          { label: 'Nilai Minimum Quiz', value: product.nilai_minimum_quiz ? `${product.nilai_minimum_quiz}%` : '—' },
          { label: 'Memiliki Tugas (Assignment)', value: product.has_assignment ? 'Ya' : 'Tidak' },
          { label: 'Tanggal Mulai', value: formatDate(product.tanggal_mulai) },
          { label: 'Tanggal Selesai', value: formatDate(product.tanggal_selesai) }
        );
        break;

      case 'Webinar':
        rows.push(
          { label: 'Link Pendaftaran', value: product.url ? <a href={product.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{product.url}</a> : '—' },
          { label: 'Timezone', value: product.timezone || 'WIB' },
          { label: 'Max Peserta', value: product.max_peserta ? `${product.max_peserta} orang` : 'Unlimited' },
          { label: 'Bisa Affiliate', value: product.affiliate_enabled ? 'Ya' : 'Tidak' },
          { label: 'Redirect URL', value: product.redirect_url ? <a href={product.redirect_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{product.redirect_url}</a> : '—' },
          { label: 'Tanggal Mulai', value: formatDateTime(product.tanggal_mulai) },
          { label: 'Tanggal Selesai', value: formatDateTime(product.tanggal_selesai) },
          { label: 'Waktu Mulai Jual', value: formatDateTime(product.tanggal_mulai_jual) },
          { label: 'Tanggal Tutup Daftar', value: formatDateTime(product.tanggal_tutup_daftar) },
          { label: 'Instruksi', value: product.instruksi || '—', block: true },
          { label: 'Syarat & Ketentuan', value: product.syarat_ketentuan || '—', block: true }
        );
        break;

      case 'Bundling':
        rows.push(
          { label: 'Tipe Pembayaran', value: product.tipe_pembayaran || '—' },
          { label: 'Max Pembayaran', value: product.maksimal_pembayaran ? `${product.maksimal_pembayaran} pembeli` : 'Unlimited' },
          { label: 'Bisa Affiliate', value: product.bisa_affiliate ? 'Ya' : 'Tidak' },
          { label: 'Redirect URL', value: product.redirect_url ? <a href={product.redirect_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{product.redirect_url}</a> : '—' },
          { label: 'Tanggal Kadaluarsa', value: formatDate(product.tanggal_kadaluarsa) },
          { label: 'Pesan Setelah Bayar', value: product.pesan_setelah_bayar || '—', block: true }
        );
        break;

      case 'Coaching & Mentoring':
        rows.push(
          { label: 'Link Booking', value: product.booking_url ? <a href={product.booking_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{product.booking_url}</a> : '—' },
          { label: 'Tipe Pembayaran', value: product.tipe_pembayaran || '—' },
          { label: 'Max Pembayaran', value: product.max_pembayaran ? `${product.max_pembayaran} pembeli` : 'Unlimited' },
          { label: 'Bisa Affiliate', value: product.bisa_affiliate ? 'Ya' : 'Tidak' },
          { label: 'Waktu Mulai Jual', value: formatDateTime(product.waktu_mulai_jual) },
          { label: 'Tanggal Kadaluarsa', value: formatDate(product.tanggal_kadaluarsa) },
          { label: 'Total Penjualan', value: `${product.total_penjualan || 0} penjualan` },
          { label: 'Instruksi', value: product.instruksi || '—', block: true },
          { label: 'Syarat & Ketentuan', value: product.syarat_ketentuan || '—', block: true }
        );
        break;

      case 'Ebook':
        rows.push(
          { label: 'Penulis (Author)', value: product.author || '—' },
          { label: 'ISBN', value: product.isbn || '—' },
          { label: 'Format', value: product.format || '—' },
          { label: 'Bahasa', value: product.bahasa || '—' },
          { label: 'Jumlah Halaman', value: product.jumlah_halaman ? `${product.jumlah_halaman} halaman` : '—' },
          { label: 'Tanggal Publish', value: formatDate(product.tanggal_publish) },
          { label: 'Tipe Pembayaran', value: product.tipe_pembayaran || '—' },
          { label: 'Sumber File', value: product.sumber_file === 'upload' ? 'Upload File' : 'Link / URL' },
          { label: 'File URL / Path', value: product.file_url ? <a href={product.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{product.file_url}</a> : '—' },
          { label: 'Bisa Didownload', value: product.bisa_didownload ? 'Ya' : 'Tidak' },
          { label: 'Max Pembayaran', value: product.max_pembayaran ? `${product.max_pembayaran} pembeli` : 'Unlimited' },
          { label: 'Bisa Affiliate', value: product.affiliate_enabled ? 'Ya' : 'Tidak' },
          { label: 'Total Terjual', value: `${product.terjual || 0} copy` }
        );
        break;

      case 'Event':
        rows.push(
          { label: 'Tipe Event', value: product.tipe || '—' },
          { label: 'Lokasi', value: product.lokasi || '—' },
          { label: 'Link Map', value: product.lokasi_map ? <a href={product.lokasi_map} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">Lihat Map</a> : '—' },
          { label: 'Max Tiket per Transaksi', value: product.max_tiket_per_transaksi || '—' },
          { label: 'Bisa Affiliate', value: product.bisa_affiliate ? 'Ya' : 'Tidak' },
          { label: 'Waktu Mulai', value: formatDateTime(product.waktu_mulai) },
          { label: 'Waktu Selesai', value: formatDateTime(product.waktu_selesai) },
          { label: 'Waktu Mulai Jual', value: formatDateTime(product.waktu_mulai_jual) },
          { label: 'Tanggal Tutup Daftar', value: formatDate(product.tanggal_tutup_daftar) },
          { label: 'Redirect URL', value: product.redirect_url ? <a href={product.redirect_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{product.redirect_url}</a> : '—' },
          { label: 'Instruksi', value: product.instruksi || '—', block: true },
          { label: 'Syarat & Ketentuan', value: product.syarat_ketentuan || '—', block: true }
        );
        break;

      case 'Payment Link':
        rows.push(
          { label: 'Pesan Setelah Bayar', value: product.pesan_setelah_bayar || '—', block: true },
          { label: 'Max Pembayaran', value: product.maksimum_pembayaran ? `${product.maksimum_pembayaran} pembeli` : 'Unlimited' },
          { label: 'Bisa Affiliate', value: product.bisa_affiliate ? 'Ya' : 'Tidak' },
          { label: 'Redirect URL', value: product.redirect_url ? <a href={product.redirect_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{product.redirect_url}</a> : '—' },
          { label: 'Waktu Mulai Jual', value: formatDateTime(product.waktu_mulai_jual) },
          { label: 'Tanggal Kadaluarsa', value: formatDate(product.tanggal_kadaluarsa) }
        );
        break;

      case 'Penggalangan Dana':
        rows.push(
          { label: 'Tipe', value: product.tipe || '—' },
          { label: 'Kategori', value: product.kategori || '—' },
          { label: 'Jenis Hewan (Jika Qurban)', value: product.jenis_hewan || '—' },
          { label: 'Minimal Donasi', value: formatCurrency(product.minimal_donasi) },
          { label: 'Stok (Jika Qurban)', value: product.stok ? `${product.stok} unit` : '—' },
          { label: 'Terkumpul', value: formatCurrency(product.terkumpul) },
          { label: 'Jumlah Donatur/Pembeli', value: `${product.pembeli || 0} orang` },
          { label: 'Tujuan Penggalangan', value: product.tujuan || '—', block: true },
          { label: 'Penerima Manfaat', value: product.penerima_manfaat || '—', block: true },
          { label: 'Rincian Penggunaan Dana', value: product.rincian_penggunaan || '—', block: true },
          { label: 'Tanggal Mulai Jual', value: formatDateTime(product.tanggal_mulai_jual) },
          { label: 'Tanggal Tutup', value: formatDateTime(product.tanggal_tutup) },
          { label: 'Bisa Affiliate', value: product.affiliate_enabled ? 'Ya' : 'Tidak' }
        );
        break;

      case 'Tulisan':
        rows.push(
          { label: 'Genre', value: product.genre || '—' },
          { label: 'Penulis (Author)', value: product.author || '—' },
          { label: 'Bahasa', value: product.bahasa || '—' },
          { label: 'Tipe Tulisan', value: product.tipe_tulisan || '—' },
          { label: 'Tipe Pembayaran', value: product.tipe_pembayaran || '—' },
          { label: 'Mekanisme Bayar', value: product.mekanisme_bayar || '—' },
          { label: 'Max Pembayaran', value: product.max_pembayaran ? `${product.max_pembayaran} pembeli` : 'Unlimited' },
          { label: 'Link Baca', value: product.url ? <a href={product.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">{product.url}</a> : '—' },
          { label: 'Total Terjual', value: `${product.terjual || 0} unit` },
          { label: 'Bisa Affiliate', value: product.affiliate_enabled ? 'Ya' : 'Tidak' },
          { label: 'Catatan', value: product.catatan || '—' }
        );
        break;

      default:
        rows.push({ label: 'Tipe Detail', value: 'Data spesifik tipe produk ini belum didefinisikan.' });
    }

    return rows;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'published' || status === 'active') {
      return (
        <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 w-max">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Published
        </Badge>
      );
    }
    return (
      <Badge className="bg-slate-400 hover:bg-slate-500 text-white border-0 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 w-max">
        <Clock className="h-3.5 w-3.5" />
        Draft
      </Badge>
    );
  };

  const specificRows = getProductSpecificRows();

  return (
    <DashboardLayout title={`Detail Produk: ${product.nama || product.name || ''}`}>
      <Head title={`Detail Produk: ${product.nama || product.name || ''} - Admin Panel`} />
      
      <div className="px-6 py-8 max-w-7xl mx-auto space-y-6">
        
        {/* Back and actions Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="rounded-xl bg-white border-slate-200"
              onClick={() => router.visit('/admin/products')}
            >
              <ArrowLeft className="h-4 w-4 text-slate-600" />
            </Button>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                ADMIN PANEL · <span className="text-blue-600 cursor-pointer hover:underline" onClick={() => router.visit('/admin/products')}>PRODUK</span>
              </p>
              <h1 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
                Detail Produk #{product.id}
              </h1>
            </div>
          </div>

          <Button
            variant="destructive"
            onClick={handleDeleteProduct}
            className="font-semibold flex items-center gap-2 rounded-xl text-xs h-9 px-4 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Hapus Produk secara Permanen
          </Button>
        </div>

        {/* Main Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Product Info & Image Cover */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Cover & Main Summary Card */}
            <Card className="border-slate-100 shadow-sm overflow-hidden rounded-2xl bg-white">
              <div className="p-6 flex flex-col md:flex-row gap-6">
                
                {/* Product Cover */}
                <div className="w-full md:w-52 h-36 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                  {product.cover_url ? (
                    <img 
                      src={product.cover_url} 
                      alt={product.nama || product.name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 text-slate-300">
                      <ShoppingBag className="h-8 w-8" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">No Cover</span>
                    </div>
                  )}
                </div>

                {/* Summary Info */}
                <div className="flex-1 space-y-3.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="bg-blue-50 text-blue-700 border border-blue-100 font-bold uppercase text-[10px] tracking-wide rounded-md px-2 py-0.5">
                      {type}
                    </Badge>
                    {getStatusBadge(product.status)}
                  </div>

                  <h2 className="text-xl font-bold text-slate-900 leading-tight">
                    {product.nama || product.name || '—'}
                  </h2>

                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="h-4 w-4 text-slate-400" />
                      Harga: <span className="text-slate-900 font-bold">{formatCurrency(product.harga)}</span>
                    </div>
                    {product.harga_coret && (
                      <div className="flex items-center gap-1.5 line-through decoration-slate-300 text-slate-400">
                        Harga Coret: {formatCurrency(product.harga_coret)}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      Dibuat pada: <span className="text-slate-700 font-medium">{product.created_at ? formatDateTime(product.created_at) : '—'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Product Detailed Attributes Table */}
            <Card className="border-slate-100 shadow-sm rounded-2xl bg-white overflow-hidden">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4 px-6">
                <CardTitle className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  Spesifikasi & Data Produk Lengkap
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <tbody>
                      {specificRows.map((row, i) => (
                        <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/20">
                          <td className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-64 align-top">
                            {row.label}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-slate-700 leading-relaxed whitespace-pre-line">
                            {row.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Description Card */}
            <Card className="border-slate-100 shadow-sm rounded-2xl bg-white overflow-hidden">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4 px-6">
                <CardTitle className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-600" />
                  Deskripsi Lengkap
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                {product.deskripsi || 'Tidak ada deskripsi.'}
              </CardContent>
            </Card>

          </div>

          {/* Right Column: Creator / Owner Information */}
          <div className="space-y-6">
            
            {/* Creator Information Card */}
            <Card className="border-slate-100 shadow-sm rounded-2xl bg-white overflow-hidden">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4 px-6">
                <CardTitle className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  Pembuat Produk (Creator)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                
                {creator ? (
                  <>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nama Creator</p>
                      <h4 className="text-base font-bold text-slate-800">{creator.name}</h4>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Kontak</p>
                      <a href={`mailto:${creator.email}`} className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-2 mt-0.5">
                        <Mail className="h-4 w-4 text-slate-400" />
                        {creator.email}
                      </a>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">No. Telepon / WhatsApp</p>
                      <span className="text-sm font-semibold text-slate-700 flex items-center gap-2 mt-0.5">
                        <Phone className="h-4 w-4 text-slate-400" />
                        {creator.phone}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nama Bisnis</p>
                      <span className="text-sm font-semibold text-slate-700 mt-0.5 block">
                        {creator.business_name}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status Verifikasi</p>
                      <div className="mt-1">
                        {creator.verification_status === 'approved' || creator.verification_status === 'verified' ? (
                          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0 flex items-center gap-1 w-max font-bold">
                            <ShieldCheck className="h-4 w-4" />
                            Verified
                          </Badge>
                        ) : creator.verification_status === 'pending' ? (
                          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-0 flex items-center gap-1 w-max font-bold">
                            Pending
                          </Badge>
                        ) : (
                          <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-200 border-0 flex items-center gap-1 w-max font-bold">
                            Unverified
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Terdaftar Pada</p>
                      <span className="text-xs font-semibold text-slate-500 block">
                        {creator.created_at}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-slate-400 text-sm text-center py-6">
                    Informasi creator tidak ditemukan.
                  </div>
                )}

              </CardContent>
            </Card>

            {/* Platform Safety Card */}
            <Card className="border-slate-100 shadow-sm rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden">
              <CardContent className="p-6 space-y-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6 text-blue-400" />
                </div>
                <h4 className="font-bold text-base">Dashboard Admin Keamanan</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Sebagai admin, Anda memiliki hak penuh untuk mengawasi konten produk dan menindaklanjuti penyalahgunaan platform. Selalu lakukan verifikasi sebelum menghapus produk creator secara permanen.
                </p>
              </CardContent>
            </Card>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
