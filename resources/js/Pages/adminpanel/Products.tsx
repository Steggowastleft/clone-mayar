import React, { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/dashboardlayout';
import { 
  ShoppingBag, Search, Mail, Calendar, Eye, FileText,
  PlayCircle, Video, GraduationCap, CheckCircle2, Clock,
  SlidersHorizontal, RotateCcw, Trash2, Download,
  BookOpen, Heart, Link2, Package
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription 
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { toast } from 'sonner';

interface Creator {
  name: string;
  email: string;
}

interface Product {
  id: string | number;
  name: string;
  type: 'Digital Product' | 'Bootcamp' | 'Online Class' | 'Webinar' | string;
  price: number;
  status: 'published' | 'draft' | 'active' | string;
  description: string;
  created_at: string;
  cover_url?: string | null;
  creator: Creator;
}

interface Props {
  products: Product[];
  auth: {
    user: any;
  };
}

export default function ProductsList({ products = [] }: Props) {
  const [searchTerm, setSearchTerm] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('search') || '';
    }
    return '';
  });
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Detail Dialog State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Statistics
  const stats = useMemo(() => {
    const total = products.length;
    const digital = products.filter(p => p.type === 'Digital Product').length;
    const bootcamps = products.filter(p => p.type === 'Bootcamp').length;
    const onlineClasses = products.filter(p => p.type === 'Online Class').length;
    const webinars = products.filter(p => p.type === 'Webinar').length;
    const published = products.filter(p => p.status === 'published' || p.status === 'active').length;
    
    return { total, digital, bootcamps, onlineClasses, webinars, published };
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.creator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.creator.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = 
        typeFilter === 'all' || 
        p.type === typeFilter;
        
      const matchesStatus = 
        statusFilter === 'all' || 
        p.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [products, searchTerm, typeFilter, statusFilter]);

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'Digital Product':
        return (
          <span className="inline-flex items-center gap-1 bg-pink-50 text-pink-700 px-2 py-0.5 rounded-md text-xs font-bold border border-pink-100 uppercase">
            <FileText className="h-3 w-3" />
            Digital Product
          </span>
        );
      case 'Bootcamp':
        return (
          <span className="inline-flex items-center gap-1 bg-violet-50 text-violet-700 px-2 py-0.5 rounded-md text-xs font-bold border border-violet-100 uppercase">
            <GraduationCap className="h-3 w-3" />
            Bootcamp
          </span>
        );
      case 'Online Class':
        return (
          <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md text-xs font-bold border border-purple-100 uppercase">
            <PlayCircle className="h-3 w-3" />
            Online Class
          </span>
        );
      case 'Webinar':
        return (
          <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-2 py-0.5 rounded-md text-xs font-bold border border-red-100 uppercase">
            <Video className="h-3 w-3" />
            Webinar
          </span>
        );
      case 'Bundling':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md text-xs font-bold border border-emerald-100 uppercase">
            <Package className="h-3 w-3" />
            Bundling
          </span>
        );
      case 'Coaching & Mentoring':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md text-xs font-bold border border-amber-100 uppercase">
            <GraduationCap className="h-3 w-3" />
            Coaching & Mentoring
          </span>
        );
      case 'Ebook':
        return (
          <span className="inline-flex items-center gap-1 bg-sky-50 text-sky-700 px-2 py-0.5 rounded-md text-xs font-bold border border-sky-100 uppercase">
            <BookOpen className="h-3 w-3" />
            Ebook
          </span>
        );
      case 'Event':
        return (
          <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 px-2 py-0.5 rounded-md text-xs font-bold border border-teal-100 uppercase">
            <Calendar className="h-3 w-3" />
            Event
          </span>
        );
      case 'Payment Link':
        return (
          <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md text-xs font-bold border border-indigo-100 uppercase">
            <Link2 className="h-3 w-3" />
            Payment Link
          </span>
        );
      case 'Penggalangan Dana':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md text-xs font-bold border border-rose-100 uppercase">
            <Heart className="h-3 w-3" />
            Penggalangan Dana
          </span>
        );
      case 'Tulisan':
        return (
          <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 px-2 py-0.5 rounded-md text-xs font-bold border border-orange-100 uppercase">
            <FileText className="h-3 w-3" />
            Tulisan
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-slate-50 text-slate-700 px-2 py-0.5 rounded-md text-xs font-bold border border-slate-100 uppercase">
            <ShoppingBag className="h-3 w-3" />
            {type}
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'published' || status === 'active') {
      return (
        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-medium border border-emerald-100">
          <CheckCircle2 className="h-3 w-3" />
          Published
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 bg-slate-50 text-slate-600 px-2 py-0.5 rounded-full text-xs font-medium border border-slate-100">
        <Clock className="h-3 w-3" />
        Draft
      </span>
    );
  };

  const getTypeSlug = (type: string) => {
    switch (type) {
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
      default: return type.toLowerCase().replace(/\s+/g, '-');
    }
  };

  const handleDeleteProduct = (product: Product) => {
    if (confirm(`Apakah Anda yakin ingin menghapus produk "${product.name}" secara permanen?`)) {
      router.delete(`/admin/products/${getTypeSlug(product.type)}/${product.id}`, {
        onSuccess: () => {
          toast.success("Produk berhasil dihapus!");
          setIsDialogOpen(false);
        },
        onError: () => {
          toast.error("Gagal menghapus produk.");
        }
      });
    }
  };

  const handleExportProducts = () => {
    if (filteredProducts.length === 0) return;
    
    const exportData = filteredProducts.map(p => ({
      ID: p.id,
      Nama: p.name,
      Tipe: p.type,
      Harga: p.price,
      Status: p.status,
      'Nama Creator': p.creator?.name || '—',
      'Email Creator': p.creator?.email || '—',
      'Dibuat Pada': p.created_at
    }));
    
    const headers = Object.keys(exportData[0]).join(';');
    const rows = exportData.map(row => 
      Object.values(row).map(val => {
        let str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      }).join(';')
    );
    
    const csvContent = "\uFEFF" + [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `daftar_produk_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const viewProductDetail = (product: Product) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  return (
    <DashboardLayout title="Daftar Produk">
      <Head title="Daftar Produk - Admin Panel" />
      <div className="px-6 py-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Daftar Produk</h1>
            <p className="text-sm text-slate-500 mt-1">Lihat dan awasi semua produk yang dibuat oleh creator di platform.</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleExportProducts}
              disabled={filteredProducts.length === 0}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-2 rounded-xl text-xs h-9 px-4 transition-colors"
            >
              <Download className="h-4 w-4" />
              Ekspor CSV
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <Card className="border-slate-100/80 shadow-sm bg-gradient-to-br from-white to-slate-50/50 col-span-2 lg:col-span-2">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Produk</p>
                <h3 className="text-2xl font-black text-slate-800 mt-1">{stats.total}</h3>
              </div>
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <ShoppingBag className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-100/80 shadow-sm bg-gradient-to-br from-white to-slate-50/50">
            <CardContent className="p-5 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Digital</span>
              <div className="flex items-baseline justify-between mt-2">
                <h4 className="text-lg font-black text-slate-800">{stats.digital}</h4>
                <FileText className="h-4 w-4 text-pink-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-100/80 shadow-sm bg-gradient-to-br from-white to-slate-50/50">
            <CardContent className="p-5 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Bootcamp</span>
              <div className="flex items-baseline justify-between mt-2">
                <h4 className="text-lg font-black text-slate-800">{stats.bootcamps}</h4>
                <GraduationCap className="h-4 w-4 text-violet-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-100/80 shadow-sm bg-gradient-to-br from-white to-slate-50/50">
            <CardContent className="p-5 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Class</span>
              <div className="flex items-baseline justify-between mt-2">
                <h4 className="text-lg font-black text-slate-800">{stats.onlineClasses}</h4>
                <PlayCircle className="h-4 w-4 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-100/80 shadow-sm bg-gradient-to-br from-white to-slate-50/50">
            <CardContent className="p-5 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Webinar</span>
              <div className="flex items-baseline justify-between mt-2">
                <h4 className="text-lg font-black text-slate-800">{stats.webinars}</h4>
                <Video className="h-4 w-4 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Grid: Filters Left, Table Right */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Panel: Filter & Search (1 col -> 20%) */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white/90 backdrop-blur-sm p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-slate-700">
                  <SlidersHorizontal className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-bold uppercase tracking-wider">Filter Pencarian</span>
                </div>
                {(searchTerm !== '' || typeFilter !== 'all' || statusFilter !== 'all') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('');
                      setTypeFilter('all');
                      setStatusFilter('all');
                    }}
                    className="h-6 text-[10px] text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-bold flex items-center gap-1.5 px-2 rounded-md transition-all"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset
                  </Button>
                )}
              </div>

              {/* Search Box */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kata Kunci</label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Nama produk/creator..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-9 bg-slate-50/50 border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl transition-all text-xs shadow-sm"
                  />
                </div>
              </div>

              {/* Type Select */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <ShoppingBag className="h-3 w-3 text-slate-400" />
                  Tipe Produk
                </label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full bg-slate-50/50 border-slate-200 text-xs font-semibold text-slate-700 h-9 rounded-xl">
                    <SelectValue placeholder="Pilih Tipe" />
                  </SelectTrigger>
                  <SelectContent className="border-slate-100 shadow-lg">
                    <SelectItem value="all" className="text-xs">Semua Tipe</SelectItem>
                    <SelectItem value="Digital Product" className="text-xs">Digital Product</SelectItem>
                    <SelectItem value="Bootcamp" className="text-xs">Bootcamp</SelectItem>
                    <SelectItem value="Online Class" className="text-xs">Online Class</SelectItem>
                    <SelectItem value="Webinar" className="text-xs">Webinar</SelectItem>
                    <SelectItem value="Bundling" className="text-xs">Bundling</SelectItem>
                    <SelectItem value="Coaching & Mentoring" className="text-xs">Coaching & Mentoring</SelectItem>
                    <SelectItem value="Ebook" className="text-xs">Ebook</SelectItem>
                    <SelectItem value="Event" className="text-xs">Event</SelectItem>
                    <SelectItem value="Payment Link" className="text-xs">Payment Link</SelectItem>
                    <SelectItem value="Penggalangan Dana" className="text-xs">Penggalangan Dana</SelectItem>
                    <SelectItem value="Tulisan" className="text-xs">Tulisan</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Select */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-slate-400" />
                  Status
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full bg-slate-50/50 border-slate-200 text-xs font-semibold text-slate-700 h-9 rounded-xl">
                    <SelectValue placeholder="Pilih Status" />
                  </SelectTrigger>
                  <SelectContent className="border-slate-100 shadow-lg">
                    <SelectItem value="all" className="text-xs">Semua Status</SelectItem>
                    <SelectItem value="published" className="text-xs">Published / Active</SelectItem>
                    <SelectItem value="draft" className="text-xs">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Right Panel: Data Table (4 cols -> 80%) */}
          <div className="lg:col-span-4">
            {/* Table List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-bold uppercase text-slate-500 tracking-wider">
                      <th className="px-6 py-4">Produk</th>
                      <th className="px-6 py-4">Tipe</th>
                      <th className="px-6 py-4">Harga</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Pembuat (Creator)</th>
                      <th className="px-6 py-4">Dibuat Pada</th>
                      <th className="px-6 py-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                          <ShoppingBag className="h-10 w-10 mx-auto text-slate-200 mb-3" />
                          Tidak ada produk yang ditemukan.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-slate-50 border rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                                {p.cover_url ? (
                                  <img src={p.cover_url} alt={p.name} className="w-full h-full object-cover" />
                                ) : (
                                  <ShoppingBag className="h-4 w-4 text-slate-300" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-slate-800 truncate max-w-xs sm:max-w-sm" title={p.name}>
                                  {p.name}
                                </div>
                                <div className="text-xs text-slate-400 truncate max-w-xs mt-0.5">
                                  ID: #{p.id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {getTypeBadge(p.type)}
                          </td>
                          <td className="px-6 py-4 font-semibold text-slate-900">
                            Rp {p.price ? Number(p.price).toLocaleString('id-ID') : '0'}
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(p.status)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-slate-800">{p.creator?.name ?? 'Unknown'}</div>
                            <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                              <Mail className="h-3 w-3 shrink-0" />
                              {p.creator?.email ?? '—'}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-500 text-xs">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-slate-400" />
                              {p.created_at}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex gap-2 justify-end items-center">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => viewProductDetail(p)}
                                className="text-xs bg-slate-50 hover:bg-slate-100 font-semibold px-3 py-1.5 rounded-lg text-slate-700 transition-colors flex items-center gap-1"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                Detail
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteProduct(p)}
                                className="text-xs bg-rose-50 hover:bg-rose-100 hover:text-rose-700 font-semibold p-2 rounded-lg text-rose-600 transition-colors flex items-center justify-center"
                                title="Hapus Produk"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          {selectedProduct && (
            <>
              <DialogHeader className="border-b border-slate-100 pb-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-slate-50 border rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                    {selectedProduct.cover_url ? (
                      <img src={selectedProduct.cover_url} alt={selectedProduct.name} className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingBag className="h-7 w-7 text-slate-300" />
                    )}
                  </div>
                  <div className="min-w-0 space-y-1">
                    <DialogTitle className="text-base font-bold text-slate-900 leading-snug">
                      {selectedProduct.name}
                    </DialogTitle>
                    <DialogDescription className="text-xs font-semibold">
                      ID Produk: #{selectedProduct.id}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="py-4 space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Tipe Produk</span>
                    <div className="mt-1">{getTypeBadge(selectedProduct.type)}</div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Status</span>
                    <div className="mt-1">{getStatusBadge(selectedProduct.status)}</div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Harga</span>
                    <p className="text-sm font-black text-slate-900 mt-1">
                      Rp {Number(selectedProduct.price).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Tanggal Dibuat</span>
                    <p className="text-xs font-semibold text-slate-700 mt-1.5 flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {selectedProduct.created_at}
                    </p>
                  </div>
                </div>

                {/* Creator Information */}
                <div className="p-4 border border-slate-100 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Pembuat (Creator)</span>
                  <div className="font-semibold text-slate-800">{selectedProduct.creator?.name ?? 'Unknown'}</div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    {selectedProduct.creator?.email ?? '—'}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Deskripsi</span>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/30 p-3 rounded-lg border border-slate-100 max-h-32 overflow-y-auto">
                    {selectedProduct.description || 'Tidak ada deskripsi.'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 border-t border-slate-100 pt-4">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5 justify-center rounded-xl"
                  onClick={() => {
                    setIsDialogOpen(false);
                    router.visit(`/admin/products/${getTypeSlug(selectedProduct.type)}/${selectedProduct.id}`);
                  }}
                >
                  <Eye className="h-4 w-4" />
                  Lihat Detail Selengkapnya
                </Button>
                <div className="flex gap-2 w-full">
                  <Button
                    variant="outline"
                    className="flex-1 text-slate-700 font-semibold rounded-xl"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Tutup
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1 font-semibold flex items-center gap-1.5 justify-center rounded-xl"
                    onClick={() => handleDeleteProduct(selectedProduct)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Hapus Produk
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
