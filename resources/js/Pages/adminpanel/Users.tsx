import React, { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import DashboardLayout from '@/components/dashboard/dashboardlayout';
import { 
  Users as UsersIcon, Search, Shield, CheckCircle2, 
  XCircle, Clock, Eye, ShoppingBag, Calendar, Mail, ArrowRight, UserCheck,
  SlidersHorizontal, RotateCcw, Download
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

interface Product {
  id: number;
  name: string;
  type: string;
  price: number;
  status: string;
  description: string;
  created_at: string;
  cover_url?: string | null;
}

interface User {
  id: string | number;
  name: string;
  email: string;
  phone?: string | null;
  role: 'admin' | 'creator' | string;
  created_at: string;
  verification_status: 'verified' | 'unverified' | 'pending' | 'rejected' | string;
  products_count: number;
  products: Product[];
}

interface Props {
  users: User[];
  auth: {
    user: any;
  };
}

export default function UsersList({ users = [] }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Detail Dialog State
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Statistics
  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter(u => u.role === 'admin').length;
    const creators = users.filter(u => u.role === 'creator' || u.role !== 'admin').length;
    const verified = users.filter(u => u.verification_status === 'verified').length;
    return { total, admins, creators, verified };
  }, [users]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = 
        roleFilter === 'all' || 
        (roleFilter === 'admin' && u.role === 'admin') ||
        (roleFilter === 'creator' && u.role !== 'admin');
        
      const matchesStatus = 
        statusFilter === 'all' || 
        u.verification_status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'verified':
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-medium border border-emerald-100">
            <CheckCircle2 className="h-3 w-3" />
            Verified
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full text-xs font-medium border border-amber-100">
            <Clock className="h-3 w-3 animate-pulse" />
            Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full text-xs font-medium border border-rose-100">
            <XCircle className="h-3 w-3" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-slate-50 text-slate-600 px-2 py-0.5 rounded-full text-xs font-medium border border-slate-100">
            <Clock className="h-3 w-3" />
            Unverified
          </span>
        );
    }
  };

  const getRoleBadge = (role: string) => {
    if (role === 'admin') {
      return (
        <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md text-xs font-bold border border-rose-100 uppercase">
          <Shield className="h-3 w-3" />
          Admin
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 bg-sky-50 text-sky-700 px-2 py-0.5 rounded-md text-xs font-bold border border-sky-100 uppercase">
        <UsersIcon className="h-3 w-3" />
        Creator
      </span>
    );
  };

  const getWhatsAppLink = (phone?: string | null, userName?: string) => {
    if (!phone) return null;
    let clean = phone.replace(/\D/g, "");
    if (clean.startsWith("0")) {
      clean = "62" + clean.slice(1);
    } else if (clean.startsWith("8")) {
      clean = "62" + clean;
    }
    return `https://wa.me/${clean}?text=${encodeURIComponent(
      `Halo ${userName}, saya dari Admin platform Mayar. Ada beberapa hal yang ingin kami koordinasikan.`
    )}`;
  };

  const handleExportUsers = () => {
    if (filteredUsers.length === 0) return;
    
    const exportData = filteredUsers.map(u => ({
      ID: u.id,
      Nama: u.name,
      Email: u.email,
      WhatsApp: u.phone || '—',
      Role: u.role,
      'Status Verifikasi': u.verification_status,
      'Jumlah Produk': u.products_count,
      'Bergabung Pada': u.created_at
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
    link.setAttribute("download", `daftar_user_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const viewUserDetail = (user: User) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  return (
    <DashboardLayout title="Daftar User">
      <Head title="Daftar User - Admin Panel" />
      <div className="px-6 py-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Daftar User</h1>
            <p className="text-sm text-slate-500 mt-1">Kelola dan lihat informasi lengkap creator serta admin terdaftar.</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleExportUsers}
              disabled={filteredUsers.length === 0}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-2 rounded-xl text-xs h-9 px-4 transition-colors"
            >
              <Download className="h-4 w-4" />
              Ekspor CSV
            </Button>
          </div>
        </div>

        {/* Stats Summary Card */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-slate-100/80 shadow-sm bg-gradient-to-br from-white to-slate-50/50 hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total User</p>
                <h3 className="text-2xl font-black text-slate-800 mt-1">{stats.total}</h3>
              </div>
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <UsersIcon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-100/80 shadow-sm bg-gradient-to-br from-white to-slate-50/50 hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Creator</p>
                <h3 className="text-2xl font-black text-slate-800 mt-1">{stats.creators}</h3>
              </div>
              <div className="w-10 h-10 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center">
                <UsersIcon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-100/80 shadow-sm bg-gradient-to-br from-white to-slate-50/50 hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Administrator</p>
                <h3 className="text-2xl font-black text-slate-800 mt-1">{stats.admins}</h3>
              </div>
              <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                <Shield className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-100/80 shadow-sm bg-gradient-to-br from-white to-slate-50/50 hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verified Creator</p>
                <h3 className="text-2xl font-black text-slate-800 mt-1">{stats.verified}</h3>
              </div>
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <UserCheck className="h-5 w-5" />
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
                {(searchTerm !== '' || roleFilter !== 'all' || statusFilter !== 'all') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('');
                      setRoleFilter('all');
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
                    placeholder="Nama atau email..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-9 bg-slate-50/50 border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl transition-all text-xs shadow-sm"
                  />
                </div>
              </div>

              {/* Role Select */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Shield className="h-3 w-3 text-slate-400" />
                  Role
                </label>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full bg-slate-50/50 border-slate-200 text-xs font-semibold text-slate-700 h-9 rounded-xl">
                    <SelectValue placeholder="Pilih Role" />
                  </SelectTrigger>
                  <SelectContent className="border-slate-100 shadow-lg">
                    <SelectItem value="all" className="text-xs">Semua Role</SelectItem>
                    <SelectItem value="creator" className="text-xs">Creator Only</SelectItem>
                    <SelectItem value="admin" className="text-xs">Admin Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Select */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <UserCheck className="h-3 w-3 text-slate-400" />
                  Status Verifikasi
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full bg-slate-50/50 border-slate-200 text-xs font-semibold text-slate-700 h-9 rounded-xl">
                    <SelectValue placeholder="Pilih Status" />
                  </SelectTrigger>
                  <SelectContent className="border-slate-100 shadow-lg">
                    <SelectItem value="all" className="text-xs">Semua Status</SelectItem>
                    <SelectItem value="verified" className="text-xs">Verified</SelectItem>
                    <SelectItem value="unverified" className="text-xs">Unverified</SelectItem>
                    <SelectItem value="pending" className="text-xs">Pending</SelectItem>
                    <SelectItem value="rejected" className="text-xs">Rejected</SelectItem>
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
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Verifikasi Akun</th>
                      <th className="px-6 py-4">Jumlah Produk</th>
                      <th className="px-6 py-4">Bergabung Pada</th>
                      <th className="px-6 py-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                          <UsersIcon className="h-10 w-10 mx-auto text-slate-200 mb-3" />
                          Tidak ada user yang ditemukan.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => {
                        const waLink = getWhatsAppLink(u.phone, u.name);
                        return (
                          <tr key={u.id} className="hover:bg-slate-50/30 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-semibold text-slate-800">{u.name}</div>
                              <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                                <Mail className="h-3 w-3 shrink-0" />
                                {u.email}
                              </div>
                              {u.phone && (
                                <div className="text-xs text-emerald-600 font-medium mt-0.5">
                                  WA: {u.phone}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {getRoleBadge(u.role)}
                            </td>
                            <td className="px-6 py-4">
                              {getVerificationBadge(u.verification_status)}
                            </td>
                            <td className="px-6 py-4 font-semibold text-slate-700">
                              {u.products_count} Produk
                            </td>
                            <td className="px-6 py-4 text-slate-500 text-xs">
                              <span className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                {u.created_at}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex gap-2 justify-end items-center">
                                {waLink && (
                                  <a
                                    href={waLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs bg-emerald-50 hover:bg-emerald-100 font-bold px-2.5 py-1.5 rounded-lg text-emerald-700 transition-colors"
                                  >
                                    <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                                      <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.333 4.993L2 22l5.233-1.371a9.947 9.947 0 0 0 4.773 1.226h.004c5.505 0 9.99-4.477 9.99-9.985C22 6.478 17.518 2 12.012 2zm5.72 13.06c-.313.882-1.802 1.626-2.484 1.706-.682.08-1.547.288-4.52-.942-3.802-1.57-6.248-5.44-6.438-5.69-.19-.25-1.488-1.982-1.488-3.78 0-1.8 1.012-2.684 1.373-3.045.362-.361.793-.451 1.053-.451.26 0 .52.003.744.013.23.01.536-.04.832.67.313.751 1.073 2.624 1.163 2.805.09.18.15.39.03.63-.12.24-.18.39-.36.6-.18.21-.381.47-.541.63-.18.18-.36.38-.15.74.21.36.93 1.53 1.985 2.47 1.35 1.21 2.49 1.58 2.85 1.76.36.18.57.15.78-.09.21-.24.9-1.05 1.14-1.41.24-.36.48-.3.81-.18.33.12 2.085 1.02 2.445 1.2.36.18.6.27.69.42.09.15.09.87-.22 1.76z"/>
                                    </svg>
                                    WA
                                  </a>
                                )}
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => viewUserDetail(u)}
                                  className="text-xs bg-slate-50 hover:bg-slate-100 font-semibold px-3 py-1.5 rounded-lg text-slate-700 transition-colors flex items-center gap-1"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                  Detail
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Detail & Product List Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl overflow-y-auto max-h-[85vh]">
          {selectedUser && (
            <>
              <DialogHeader className="border-b border-slate-100 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <DialogTitle className="text-xl font-bold text-slate-900">{selectedUser.name}</DialogTitle>
                    <DialogDescription className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      {selectedUser.email}
                    </DialogDescription>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {getRoleBadge(selectedUser.role)}
                    {getVerificationBadge(selectedUser.verification_status)}
                  </div>
                </div>
              </DialogHeader>

              <div className="py-4 space-y-5">
                {/* General Info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">ID User</span>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5">#{selectedUser.id}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Terdaftar Pada</span>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5">{selectedUser.created_at}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">WhatsApp / Phone</span>
                    {selectedUser.phone ? (
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-sm font-semibold text-slate-800">{selectedUser.phone}</p>
                        <a
                          href={getWhatsAppLink(selectedUser.phone, selectedUser.name) || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 hover:bg-emerald-100 font-bold px-2 py-1 rounded-md text-emerald-700 transition-colors"
                        >
                          Chat
                        </a>
                      </div>
                    ) : (
                      <p className="text-sm font-semibold text-slate-400 mt-0.5">—</p>
                    )}
                  </div>
                </div>

                {/* Product List Title */}
                <div>
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
                    <ShoppingBag className="h-4 w-4 text-slate-500" />
                    Daftar Produk yang Dibuat ({selectedUser.products.length})
                  </h4>

                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {selectedUser.products.length === 0 ? (
                      <p className="text-sm text-slate-400 text-center py-8 bg-slate-50/30 border border-dashed rounded-xl">
                        Creator ini belum membuat produk apapun.
                      </p>
                    ) : (
                      selectedUser.products.map((prod) => (
                        <div 
                          key={prod.id} 
                          className="flex items-center gap-4 p-3 border border-slate-100 hover:border-slate-200 bg-white rounded-xl shadow-sm hover:shadow transition-all"
                        >
                          <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center shrink-0 border overflow-hidden">
                            {prod.cover_url ? (
                              <img src={prod.cover_url} alt={prod.name} className="w-full h-full object-cover" />
                            ) : (
                              <ShoppingBag className="h-5 w-5 text-slate-300" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <a
                              href={`/admin/products?search=${encodeURIComponent(prod.name)}`}
                              className="hover:underline font-bold text-slate-800 text-sm flex items-center gap-1 hover:text-blue-600 transition"
                            >
                              {prod.name}
                              <ArrowRight className="h-3 w-3 shrink-0" />
                            </a>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded-md uppercase shrink-0">
                                {prod.type}
                              </span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                                prod.status === 'published' || prod.status === 'active'
                                  ? 'bg-emerald-50 text-emerald-600'
                                  : 'bg-slate-50 text-slate-500'
                              } uppercase`}>
                                {prod.status}
                              </span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-black text-slate-900">
                              Rp {Number(prod.price).toLocaleString('id-ID')}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1">
                              {prod.created_at}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
