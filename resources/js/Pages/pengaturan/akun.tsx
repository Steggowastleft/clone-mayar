import DashboardLayout from "@/components/dashboard/dashboardlayout";
import { Head, router } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";
import { CheckCircle, Clock, XCircle, ShieldAlert, Upload } from "lucide-react";

const VERIF_TYPES = [
  'Individu',
  'Badan Usaha',
  'Yayasan',
  'Perseroan Terbatas',
  'Perseroan Perorangan',
];

const REQUIRED_DOCS: Record<string, Array<{ key: string; label: string }>> = {
  'Individu': [
    { key: 'ktp', label: 'Dokumen KTP' },
    { key: 'selfie_ktp', label: 'Selfie dengan KTP' },
    { key: 'npwp', label: 'NPWP' },
    { key: 'rekening_front', label: 'Halaman depan buku tabungan / screenshot rekening' },
  ],
  'Badan Usaha': [
    { key: 'ktp_director', label: 'KTP Direktur / Penanggung Jawab' },
    { key: 'selfie_director', label: 'Selfie KTP Direktur' },
    { key: 'akta', label: 'Akta Perusahaan' },
    { key: 'sk_kemenkumham', label: 'SK Kemenkumham' },
    { key: 'tdp', label: 'TDP' },
    { key: 'nib', label: 'NIB' },
    { key: 'siup', label: 'SIUP' },
    { key: 'npwp_company', label: 'NPWP Perusahaan' },
    { key: 'rekening_front', label: 'Halaman depan buku tabungan / screenshot rekening' },
  ],
  'Yayasan': [
    { key: 'ktp_director', label: 'KTP Direktur / Penanggung Jawab Yayasan' },
    { key: 'npwp_yayasan', label: 'NPWP Yayasan' },
    { key: 'akta_yayasan', label: 'Akta Yayasan' },
    { key: 'sk_kemenkumham', label: 'SK Kemenkumham' },
    { key: 'tdy', label: 'TDY' },
    { key: 'rekening_front', label: 'Halaman depan buku tabungan / screenshot rekening' },
  ],
  'Perseroan Terbatas': [
    { key: 'ktp_owner', label: 'KTP Pemilik / Direktur' },
    { key: 'npwp_company', label: 'NPWP Perusahaan' },
    { key: 'nib', label: 'NIB' },
    { key: 'akta_pengangkatan', label: 'Akta Pengangkatan Direktur Terakhir' },
    { key: 'sk_kemenkumham_pengangkatan', label: 'SK Kemenkumham atas Akta Pengangkatan' },
    { key: 'rekening_front', label: 'Halaman depan buku tabungan PT' },
    { key: 'perizinan_lain', label: 'Dokumen perizinan industri lainnya' },
  ],
  'Perseroan Perorangan': [
    { key: 'ktp_owner', label: 'KTP Pemilik / Direktur' },
    { key: 'npwp_company', label: 'NPWP Perusahaan' },
    { key: 'nib', label: 'NIB' },
    { key: 'surat_pernyataan', label: 'Surat Pernyataan Pendirian Perseroan Perorangan' },
    { key: 'sertifikat_pendaftaran', label: 'Sertifikat Pendaftaran Pendirian' },
    { key: 'rekening_front', label: 'Halaman depan buku tabungan PT' },
    { key: 'perizinan_lain', label: 'Dokumen perizinan industri lainnya' },
  ],
};

interface Props {
  user: {
    name: string;
    email: string;
    business_name?: string;
    website?: string;
    business_email?: string;
    phone?: string;
    address?: string;
    country?: string;
    province?: string;
    city?: string;
    district?: string;
    currency?: string;
    bank_provider?: string;
    bank_account_number?: string;
    bank_account_name?: string;
    created_at?: string;
  };
  verification?: {
    id: number;
    verification_type: string;
    legal_name: string;
    id_number?: string;
    business_name?: string;
    business_description?: string;
    business_address?: string;
    website?: string;
    status: string;
    decline_reason?: string;
    submitted_at?: string;
    documents?: Array<{
      id: number;
      document_type: string;
      original_name: string;
    }>;
  } | null;
}

export default function PengaturanAkun({ user, verification }: Props) {
  const [activeTab, setActiveTab] = useState<'detail' | 'rekening' | 'verifikasi'>('detail');

  // Detail bisnis state
  const [detail, setDetail] = useState({
    business_name: user?.business_name || '',
    website: user?.website || '',
    business_email: user?.business_email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    country: user?.country || '',
    province: user?.province || '',
    city: user?.city || '',
    district: user?.district || '',
    currency: user?.currency || 'IDR',
  });

  // Rekening state
  const [bank, setBank] = useState({
    provider: user?.bank_provider || '',
    account_number: user?.bank_account_number || '',
    account_name: user?.bank_account_name || '',
  });

  // Verifikasi state
  const [verif, setVerif] = useState({
    verification_type: verification?.verification_type || 'Individu',
    legal_name: verification?.legal_name || '',
    id_number: verification?.id_number || '',
    business_name: verification?.business_name || '',
    business_description: verification?.business_description || '',
    business_address: verification?.business_address || '',
    website: verification?.website || '',
  });
  
  const [status, setStatus] = useState<string | null>(verification?.status || null);
  const [docs, setDocs] = useState<Record<string, File | null>>({});
  const [verificationErrors, setVerificationErrors] = useState<Record<string, string>>({});
  const [businessErrors, setBusinessErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [bankLoading, setBankLoading] = useState(false);

  // Sync state values when props update
  useEffect(() => {
    if (user) {
      setDetail({
        business_name: user.business_name || '',
        website: user.website || '',
        business_email: user.business_email || '',
        phone: user.phone || '',
        address: user.address || '',
        country: user.country || '',
        province: user.province || '',
        city: user.city || '',
        district: user.district || '',
        currency: user.currency || 'IDR',
      });
      setBank({
        provider: user.bank_provider || '',
        account_number: user.bank_account_number || '',
        account_name: user.bank_account_name || '',
      });
    }
  }, [user]);

  useEffect(() => {
    if (verification) {
      setVerif({
        verification_type: verification.verification_type || 'Individu',
        legal_name: verification.legal_name || '',
        id_number: verification.id_number || '',
        business_name: verification.business_name || '',
        business_description: verification.business_description || '',
        business_address: verification.business_address || '',
        website: verification.website || '',
      });
      setStatus(verification.status || null);
    } else {
      setStatus(null);
    }
  }, [verification]);

  const requiredDocs = useMemo(() => REQUIRED_DOCS[verif.verification_type] || [], [verif.verification_type]);

  const onFileChange = (key: string, f: File | null) => {
    setDocs((s) => ({ ...s, [key]: f }));
  };

  const isValidUrl = (url: string) => {
    try {
      const u = new URL(url);
      return ['http:', 'https:'].includes(u.protocol);
    } catch { return false; }
  };
  const isValidEmail = (email: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);

  const submitDetail = () => {
    if (!detail.business_name.trim()) {
      setBusinessErrors(prev => ({ ...prev, business_name: 'Nama bisnis wajib diisi' }));
      toast.error('Nama bisnis wajib diisi');
      return;
    }
    if (detail.website && !isValidUrl(detail.website)) {
      setBusinessErrors(prev => ({ ...prev, website: 'URL tidak valid' }));
      toast.error('URL tidak valid');
      return;
    }
    if (detail.business_email && !isValidEmail(detail.business_email)) {
      setBusinessErrors(prev => ({ ...prev, business_email: 'Email tidak valid' }));
      toast.error('Email tidak valid');
      return;
    }
    if (detail.currency && detail.currency.length > 10) {
      setBusinessErrors(prev => ({ ...prev, currency: 'Mata uang terlalu panjang' }));
      toast.error('Mata uang tidak boleh lebih dari 10 karakter');
      return;
    }

    setLoading(true);
    router.post('/account/business', {
      business_name: detail.business_name,
      website: detail.website,
      business_email: detail.business_email,
      phone: detail.phone,
      address: detail.address,
      country: detail.country,
      province: detail.province,
      city: detail.city,
      district: detail.district,
      currency: detail.currency,
    }, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Detail bisnis berhasil disimpan');
        setBusinessErrors({});
      },
      onError: (errors) => {
        setBusinessErrors(errors);
        const errorMsg = Object.values(errors).join(', ');
        toast.error(errorMsg || 'Gagal menyimpan detail bisnis');
      },
      onFinish: () => setLoading(false)
    });
  };

  const submitBank = () => {
    if (!bank.provider.trim()) {
      toast.error('Nama bank wajib diisi');
      return;
    }
    if (!bank.account_number.trim()) {
      toast.error('Nomor rekening wajib diisi');
      return;
    }
    if (!bank.account_name.trim()) {
      toast.error('Nama pemilik rekening wajib diisi');
      return;
    }

    setBankLoading(true);
    router.post('/account/bank', {
      provider: bank.provider,
      account_number: bank.account_number,
      account_name: bank.account_name,
    }, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Data rekening berhasil disimpan');
      },
      onError: (errors) => {
        const errorMsg = Object.values(errors).join(', ');
        toast.error(errorMsg || 'Gagal menyimpan data rekening');
      },
      onFinish: () => setBankLoading(false)
    });
  };

  const submitVerification = () => {
    if (status === 'pending' || status === 'approved') return;
    if (!verif.legal_name.trim()) {
      setVerificationErrors(prev => ({ ...prev, legal_name: 'Nama sesuai KTP wajib diisi' }));
      toast.error('Nama sesuai KTP wajib diisi');
      return;
    }
    if (verif.website && !isValidUrl(verif.website)) {
      setVerificationErrors(prev => ({ ...prev, website: 'URL tidak valid' }));
      toast.error('URL tidak valid');
      return;
    }

    const form = new FormData();
    form.append('verification_type', verif.verification_type);
    form.append('legal_name', verif.legal_name);
    if (verif.id_number) form.append('id_number', verif.id_number);
    if (verif.business_name) form.append('business_name', verif.business_name);
    if (verif.business_description) form.append('business_description', verif.business_description);
    if (verif.business_address) form.append('business_address', verif.business_address);
    if (verif.website) form.append('website', verif.website);

    // append files
    for (const d of requiredDocs) {
      const f = docs[d.key];
      if (!f) {
        toast.error('File wajib diunggah: ' + d.label);
        return;
      }
      form.append(`documents[${d.key}]`, f, f.name);
    }

    setLoading(true);
    router.post('/account/verification', form, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Verifikasi berhasil diajukan');
        setVerificationErrors({});
      },
      onError: (errors) => {
        setVerificationErrors(errors);
        const errorMsg = Object.values(errors).join(', ');
        toast.error(errorMsg || 'Gagal mengirim verifikasi');
      },
      onFinish: () => setLoading(false)
    });
  };

  return (
    <DashboardLayout title="Pengaturan Akun">
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Pengaturan Akun</h1>

        {/* ── Tabs Navigation ── */}
        <div className="flex border border-gray-250 rounded-xl overflow-hidden w-max bg-white mb-6">
          <button
            onClick={() => setActiveTab('detail')}
            className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border-r border-gray-200 last:border-0 ${
              activeTab === 'detail' ? 'bg-blue-50/70 text-blue-600' : 'text-slate-500 hover:bg-slate-50/50'
            }`}
          >
            Detail Bisnis
          </button>
          <button
            onClick={() => setActiveTab('rekening')}
            className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all border-r border-gray-200 last:border-0 ${
              activeTab === 'rekening' ? 'bg-blue-50/70 text-blue-600' : 'text-slate-500 hover:bg-slate-50/50'
            }`}
          >
            Rekening
          </button>
          <button
            onClick={() => setActiveTab('verifikasi')}
            className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all last:border-0 ${
              activeTab === 'verifikasi' ? 'bg-blue-50/70 text-blue-600' : 'text-slate-500 hover:bg-slate-50/50'
            }`}
          >
            Verifikasi
          </button>
        </div>

        {/* ── Tab Content ── */}
        <div className="min-h-[400px]">
          {activeTab === 'detail' && (
            <div className="space-y-6">
              <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* Data Bisnis Column */}
                <div className="flex-1 w-full space-y-4">
                  <h2 className="text-xl font-bold text-slate-850">Data Bisnis</h2>
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3.5">
                    {/* Nama Row */}
                    <div className="border border-blue-100 rounded-xl overflow-hidden grid grid-cols-[180px_1fr] items-start bg-white focus-within:border-blue-500 transition-colors">
                      <div className="font-bold text-slate-700 text-xs px-4 py-4 bg-slate-50/50 border-r border-blue-100 h-full flex items-center shrink-0">
                        Nama
                      </div>
                      <div className="px-4 py-3 flex flex-col gap-1 w-full">
                        <input
                          type="text"
                          placeholder="Nama Bisnis"
                          maxLength={100}
                          value={detail.business_name}
                          onChange={(e) => setDetail({ ...detail, business_name: e.target.value })}
                          className="w-full border-0 focus:ring-0 px-0 py-0.5 bg-transparent text-slate-700 text-sm placeholder:text-slate-400 font-semibold"
                        />
                        <p className="text-[10px] text-slate-400 leading-relaxed">
                          Jika anda ingin mengubah nama bisnis, silahkan kirimkan permintaan ke whatsapp admin disini (+62812345878) dengan menyertakan alasan, akun sosmed/website baru dan akun email mayar anda
                        </p>
                      </div>
                    </div>

                    {/* Website Row */}
                    <div className="border border-blue-100 rounded-xl overflow-hidden grid grid-cols-[180px_1fr] items-center bg-white focus-within:border-blue-500 transition-colors">
                      <div className="font-bold text-slate-700 text-xs px-4 py-4 bg-slate-50/50 border-r border-blue-100 h-full flex items-center shrink-0">
                        Website
                      </div>
                      <div className="px-4 py-2">
                        <input
                          type="text"
                          placeholder="leeyjayasukses.id"
                          value={detail.website}
                          onChange={(e) => setDetail({ ...detail, website: e.target.value })}
                          className="w-full border-0 focus:ring-0 px-0 py-0.5 bg-transparent text-slate-700 text-sm placeholder:text-slate-400"
                        />
                        {businessErrors.website && (
                          <p className="text-xs text-red-650 mt-1">{businessErrors.website}</p>
                        )}
                      </div>
                    </div>

                    {/* Email Bisnis Row */}
                    <div className="border border-blue-100 rounded-xl overflow-hidden grid grid-cols-[180px_1fr] items-center bg-white focus-within:border-blue-500 transition-colors">
                      <div className="font-bold text-slate-700 text-xs px-4 py-4 bg-slate-50/50 border-r border-blue-100 h-full flex items-center shrink-0">
                        Email Bisnis
                      </div>
                      <div className="px-4 py-2">
                        <input
                          type="email"
                          placeholder="leeyjayasukses@gmail.com"
                          value={detail.business_email}
                          onChange={(e) => setDetail({ ...detail, business_email: e.target.value })}
                          className="w-full border-0 focus:ring-0 px-0 py-0.5 bg-transparent text-slate-700 text-sm placeholder:text-slate-400"
                        />
                        {businessErrors.business_email && (
                          <p className="text-xs text-red-650 mt-1">{businessErrors.business_email}</p>
                        )}
                      </div>
                    </div>

                    {/* No Hp Bisnis Row */}
                    <div className="border border-blue-100 rounded-xl overflow-hidden grid grid-cols-[180px_1fr] items-center bg-white focus-within:border-blue-500 transition-colors">
                      <div className="font-bold text-slate-700 text-xs px-4 py-4 bg-slate-50/50 border-r border-blue-100 h-full flex items-center shrink-0">
                        No Hp Bisnis
                      </div>
                      <div className="px-4 py-2">
                        <input
                          type="text"
                          placeholder="0812349999"
                          maxLength={15}
                          value={detail.phone}
                          onChange={(e) => setDetail({ ...detail, phone: e.target.value })}
                          className="w-full border-0 focus:ring-0 px-0 py-0.5 bg-transparent text-slate-700 text-sm placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    {/* Alamat Row */}
                    <div className="border border-blue-100 rounded-xl overflow-hidden grid grid-cols-[180px_1fr] items-start bg-white focus-within:border-blue-500 transition-colors">
                      <div className="font-bold text-slate-700 text-xs px-4 py-4 bg-slate-50/50 border-r border-blue-100 h-full flex items-center shrink-0">
                        Alamat
                      </div>
                      <div className="px-4 py-2">
                        <textarea
                          placeholder="Alamat lengkap"
                          value={detail.address}
                          onChange={(e) => setDetail({ ...detail, address: e.target.value })}
                          rows={2}
                          className="w-full border-0 focus:ring-0 px-0 py-0.5 bg-transparent text-slate-700 text-sm placeholder:text-slate-400 resize-none"
                        />
                      </div>
                    </div>

                    {/* Negara Row */}
                    <div className="border border-blue-100 rounded-xl overflow-hidden grid grid-cols-[180px_1fr] items-center bg-white focus-within:border-blue-500 transition-colors">
                      <div className="font-bold text-slate-700 text-xs px-4 py-4 bg-slate-50/50 border-r border-blue-100 h-full flex items-center shrink-0">
                        Negara*
                      </div>
                      <div className="px-4 py-2">
                        <input
                          type="text"
                          value={detail.country}
                          onChange={(e) => setDetail({ ...detail, country: e.target.value })}
                          className="w-full border-0 focus:ring-0 px-0 py-0.5 bg-transparent text-slate-700 text-sm"
                        />
                      </div>
                    </div>

                    {/* Provinsi Row */}
                    <div className="border border-blue-100 rounded-xl overflow-hidden grid grid-cols-[180px_1fr] items-center bg-white focus-within:border-blue-500 transition-colors">
                      <div className="font-bold text-slate-700 text-xs px-4 py-4 bg-slate-50/50 border-r border-blue-100 h-full flex items-center shrink-0">
                        Provinsi*
                      </div>
                      <div className="px-4 py-2">
                        <input
                          type="text"
                          value={detail.province}
                          onChange={(e) => setDetail({ ...detail, province: e.target.value })}
                          className="w-full border-0 focus:ring-0 px-0 py-0.5 bg-transparent text-slate-700 text-sm"
                        />
                      </div>
                    </div>

                    {/* Kota/Kabupaten Row */}
                    <div className="border border-blue-100 rounded-xl overflow-hidden grid grid-cols-[180px_1fr] items-center bg-white focus-within:border-blue-500 transition-colors">
                      <div className="font-bold text-slate-700 text-xs px-4 py-4 bg-slate-50/50 border-r border-blue-100 h-full flex items-center shrink-0">
                        Kota/Kabupaten*
                      </div>
                      <div className="px-4 py-2">
                        <input
                          type="text"
                          value={detail.city}
                          onChange={(e) => setDetail({ ...detail, city: e.target.value })}
                          className="w-full border-0 focus:ring-0 px-0 py-0.5 bg-transparent text-slate-700 text-sm"
                        />
                      </div>
                    </div>

                    {/* Kecamatan Row */}
                    <div className="border border-blue-100 rounded-xl overflow-hidden grid grid-cols-[180px_1fr] items-center bg-white focus-within:border-blue-500 transition-colors">
                      <div className="font-bold text-slate-700 text-xs px-4 py-4 bg-slate-50/50 border-r border-blue-100 h-full flex items-center shrink-0">
                        Kecamatan*
                      </div>
                      <div className="px-4 py-2">
                        <input
                          type="text"
                          value={detail.district}
                          onChange={(e) => setDetail({ ...detail, district: e.target.value })}
                          className="w-full border-0 focus:ring-0 px-0 py-0.5 bg-transparent text-slate-700 text-sm"
                        />
                      </div>
                    </div>

                    {/* Mata Uang Row */}
                    <div className="border border-blue-100 rounded-xl overflow-hidden grid grid-cols-[180px_1fr] items-center bg-white focus-within:border-blue-500 transition-colors">
                      <div className="font-bold text-slate-700 text-xs px-4 py-4 bg-slate-50/50 border-r border-blue-100 h-full flex items-center shrink-0">
                        Mata Uang*
                      </div>
                      <div className="px-4 py-2">
                        <input
                          type="text"
                          value={detail.currency}
                          onChange={(e) => setDetail({ ...detail, currency: e.target.value })}
                          className="w-full border-0 focus:ring-0 px-0 py-0.5 bg-transparent text-slate-700 text-sm"
                        />
                        {businessErrors.currency && (
                          <p className="text-xs text-red-650 mt-1">{businessErrors.currency}</p>
                        )}
                      </div>
                    </div>

                    {/* Submit Row */}
                    <div className="pt-2">
                      <button
                        onClick={submitDetail}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md uppercase tracking-wider text-xs"
                      >
                        {loading ? 'Menyimpan...' : 'Simpan Detail Bisnis'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Foto Profil Column */}
                <div className="w-full lg:w-72 space-y-4 shrink-0">
                  <h2 className="text-xl font-bold text-slate-850">Foto Profil</h2>
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center">
                    <div className="w-40 h-40 rounded-full bg-slate-200 flex items-center justify-center mb-6 overflow-hidden border border-slate-300">
                      <div className="w-full h-full bg-gray-300 rounded-full" />
                    </div>
                    
                    <div className="w-full space-y-2.5">
                      <label className="w-full block cursor-pointer border border-blue-500 hover:bg-blue-50/50 text-blue-600 font-bold py-2 rounded-xl text-xs transition-colors uppercase tracking-wider text-center">
                        Ganti Foto
                        <input type="file" className="hidden" accept="image/*" />
                      </label>
                      <button className="w-full border border-red-500 hover:bg-red-50/50 text-red-500 font-bold py-2 rounded-xl text-xs transition-colors uppercase tracking-wider">
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timestamp Footer Bar */}
              <div className="border border-blue-100 rounded-xl bg-blue-50/5 py-3.5 text-center text-blue-600 font-semibold text-xs mt-6">
                Dibuat {user?.created_at || '10 Jan 2026 22:24'}
              </div>
            </div>
          )}

          {activeTab === 'rekening' && (
            <div className="max-w-3xl space-y-4">
              <h2 className="text-xl font-bold text-slate-850">Rekening</h2>
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3.5">
                {/* Bank Provider Row */}
                <div className="border border-blue-100 rounded-xl overflow-hidden grid grid-cols-[180px_1fr] items-center bg-white focus-within:border-blue-500 transition-colors">
                  <div className="font-bold text-slate-700 text-xs px-4 py-4 bg-slate-50/50 border-r border-blue-100 h-full flex items-center shrink-0">
                    Nama Bank / E-Wallet
                  </div>
                  <div className="px-4 py-2">
                    <input
                      type="text"
                      value={bank.provider}
                      onChange={(e) => setBank({ ...bank, provider: e.target.value })}
                      className="w-full border-0 focus:ring-0 px-0 py-0.5 bg-transparent text-slate-700 text-sm"
                    />
                  </div>
                </div>

                {/* Account Number Row */}
                <div className="border border-blue-100 rounded-xl overflow-hidden grid grid-cols-[180px_1fr] items-center bg-white focus-within:border-blue-500 transition-colors">
                  <div className="font-bold text-slate-700 text-xs px-4 py-4 bg-slate-50/50 border-r border-blue-100 h-full flex items-center shrink-0">
                    Nomor Rekening / E-Wallet
                  </div>
                  <div className="px-4 py-2">
                    <input
                      type="text"
                      value={bank.account_number}
                      onChange={(e) => setBank({ ...bank, account_number: e.target.value })}
                      className="w-full border-0 focus:ring-0 px-0 py-0.5 bg-transparent text-slate-700 text-sm"
                    />
                  </div>
                </div>

                {/* Account Name Row */}
                <div className="border border-blue-100 rounded-xl overflow-hidden grid grid-cols-[180px_1fr] items-center bg-white focus-within:border-blue-500 transition-colors">
                  <div className="font-bold text-slate-700 text-xs px-4 py-4 bg-slate-50/50 border-r border-blue-100 h-full flex items-center shrink-0">
                    Atas Nama
                  </div>
                  <div className="px-4 py-2">
                    <input
                      type="text"
                      value={bank.account_name}
                      onChange={(e) => setBank({ ...bank, account_name: e.target.value })}
                      className="w-full border-0 focus:ring-0 px-0 py-0.5 bg-transparent text-slate-700 text-sm"
                    />
                  </div>
                </div>

                {/* Submit Row */}
                <div className="pt-2">
                  <button
                    onClick={submitBank}
                    disabled={bankLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md uppercase tracking-wider text-xs"
                  >
                    {bankLoading ? 'Menyimpan...' : 'Simpan Data Rekening'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'verifikasi' && (
            <div className="max-w-3xl space-y-6">
              <h2 className="text-xl font-bold text-slate-850">Verifikasi Akun</h2>

              {/* Status Section */}
              <div className="mb-6">
                {status === 'approved' && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex gap-4 items-start shadow-sm">
                    <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h3 className="font-bold text-emerald-900 text-base">Akun Terverifikasi</h3>
                      <p className="text-sm text-emerald-700 leading-relaxed">
                        Selamat! Identitas dan bisnis Anda telah berhasil diverifikasi oleh tim kepatuhan kami.
                      </p>
                      <div className="mt-4 pt-3 border-t border-emerald-100 grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-xs text-emerald-850">
                        <div>
                          <span className="font-medium text-emerald-600 block">Tipe Verifikasi:</span>
                          <span className="font-semibold text-slate-800">{verification?.verification_type}</span>
                        </div>
                        <div>
                          <span className="font-medium text-emerald-600 block">Nama Legal:</span>
                          <span className="font-semibold text-slate-800">{verification?.legal_name}</span>
                        </div>
                        {verification?.id_number && (
                          <div>
                            <span className="font-medium text-emerald-600 block">Nomor KTP / Identitas:</span>
                            <span className="font-semibold text-slate-800">{verification?.id_number}</span>
                          </div>
                        )}
                        {verification?.submitted_at && (
                          <div>
                            <span className="font-medium text-emerald-600 block">Disetujui pada:</span>
                            <span className="font-semibold text-slate-800">
                              {new Date(verification.submitted_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {status === 'pending' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex gap-4 items-start shadow-sm">
                    <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
                      <Clock className="h-6 w-6 animate-pulse" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h3 className="font-bold text-amber-900 text-base">Verifikasi Sedang Ditinjau</h3>
                      <p className="text-sm text-amber-700 leading-relaxed">
                        Dokumen dan data Anda telah kami terima dan saat ini sedang dalam proses peninjauan oleh tim admin. Proses ini biasanya memerlukan waktu 1-3 hari kerja.
                      </p>
                      <div className="mt-4 pt-3 border-t border-amber-100 grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-xs text-amber-850">
                        <div>
                          <span className="font-medium text-amber-600 block">Tipe Verifikasi:</span>
                          <span className="font-semibold text-slate-800">{verification?.verification_type}</span>
                        </div>
                        <div>
                          <span className="font-medium text-amber-600 block">Nama Legal:</span>
                          <span className="font-semibold text-slate-800">{verification?.legal_name}</span>
                        </div>
                        {verification?.id_number && (
                          <div>
                            <span className="font-medium text-amber-600 block">Nomor KTP / Identitas:</span>
                            <span className="font-semibold text-slate-800">{verification?.id_number}</span>
                          </div>
                        )}
                        {verification?.submitted_at && (
                          <div>
                            <span className="font-medium text-amber-600 block">Diajukan Pada:</span>
                            <span className="font-semibold text-slate-800">
                              {new Date(verification.submitted_at).toLocaleString('id-ID')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {(status === 'rejected' || status === 'declined') && (
                  <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 flex gap-4 items-start shadow-sm mb-4">
                    <div className="p-3 bg-rose-100 text-rose-700 rounded-xl">
                      <XCircle className="h-6 w-6" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h3 className="font-bold text-rose-900 text-base">Verifikasi Ditolak</h3>
                      <p className="text-sm text-rose-750 leading-relaxed">
                        Mohon maaf, pengajuan verifikasi akun Anda belum dapat disetujui karena alasan berikut:
                      </p>
                      {verification?.decline_reason && (
                        <div className="mt-2 p-3 bg-rose-100/50 rounded-lg text-sm text-rose-950 border border-rose-200 font-medium">
                          &ldquo;{verification.decline_reason}&rdquo;
                        </div>
                      )}
                      <p className="text-xs text-rose-600 mt-2">
                        Silakan periksa kembali berkas dan informasi Anda, lalu ajukan kembali formulir di bawah ini dengan dokumen yang benar.
                      </p>
                    </div>
                  </div>
                )}

                {!status && (
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 flex gap-4 items-start shadow-sm">
                    <div className="p-3 bg-blue-100 text-blue-700 rounded-xl">
                      <ShieldAlert className="h-6 w-6" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h3 className="font-bold text-blue-900 text-base">Verifikasi Akun Diperlukan</h3>
                      <p className="text-sm text-blue-700 leading-relaxed">
                        Untuk mematuhi regulasi keuangan dan dapat melakukan pencairan dana (withdraw), Anda wajib menyelesaikan proses verifikasi identitas (KYC).
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Formulir Pengajuan */}
              {status !== 'pending' && status !== 'approved' && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-800 text-lg mb-2">Data Rekening Bisnis</h3>
                  
                  {/* Jenis Verifikasi Row */}
                  <div className="border border-blue-100 rounded-xl overflow-hidden grid grid-cols-[180px_1fr] items-center bg-white focus-within:border-blue-500 transition-colors">
                    <div className="font-bold text-slate-700 text-xs px-4 py-4 bg-slate-50/50 border-r border-blue-100 h-full flex items-center shrink-0">
                      Jenis Verifikasi
                    </div>
                    <div className="px-4 py-2">
                      <Select onValueChange={(v: string) => setVerif({ ...verif, verification_type: v })} defaultValue={verif.verification_type}>
                        <SelectTrigger className="w-full border-0 shadow-none focus:ring-0 p-0 h-auto bg-transparent text-slate-700 text-sm">
                          <SelectValue placeholder="Pilih jenis..." />
                        </SelectTrigger>
                        <SelectContent>
                          {VERIF_TYPES.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Nama Sesuai KTP Row */}
                  <div className="border border-blue-100 rounded-xl overflow-hidden grid grid-cols-[180px_1fr] items-center bg-white focus-within:border-blue-500 transition-colors">
                    <div className="font-bold text-slate-700 text-xs px-4 py-4 bg-slate-50/50 border-r border-blue-100 h-full flex items-center shrink-0">
                      Nama Sesuai KTP*
                    </div>
                    <div className="px-4 py-2">
                      <input
                        type="text"
                        placeholder="Masukkan Nama Sesuai KTP"
                        value={verif.legal_name}
                        onChange={(e) => setVerif({ ...verif, legal_name: e.target.value })}
                        className="w-full border-0 focus:ring-0 px-0 py-0.5 bg-transparent text-slate-700 text-sm"
                      />
                      {verificationErrors.legal_name && (
                        <p className="text-xs text-red-650 mt-1">{verificationErrors.legal_name}</p>
                      )}
                    </div>
                  </div>

                  {/* Nomor KTP Row */}
                  <div className="border border-blue-100 rounded-xl overflow-hidden grid grid-cols-[180px_1fr] items-center bg-white focus-within:border-blue-500 transition-colors">
                    <div className="font-bold text-slate-700 text-xs px-4 py-4 bg-slate-50/50 border-r border-blue-100 h-full flex items-center shrink-0">
                      Nomor KTP*
                    </div>
                    <div className="px-4 py-2">
                      <input
                        type="text"
                        placeholder="1234567890123456"
                        value={verif.id_number}
                        onChange={(e) => setVerif({ ...verif, id_number: e.target.value })}
                        className="w-full border-0 focus:ring-0 px-0 py-0.5 bg-transparent text-slate-700 text-sm"
                      />
                      {verificationErrors.id_number && (
                        <p className="text-xs text-red-650 mt-1">{verificationErrors.id_number}</p>
                      )}
                    </div>
                  </div>

                  {/* Nama Usaha Row */}
                  <div className="border border-blue-100 rounded-xl overflow-hidden grid grid-cols-[180px_1fr] items-center bg-white focus-within:border-blue-500 transition-colors">
                    <div className="font-bold text-slate-700 text-xs px-4 py-4 bg-slate-50/50 border-r border-blue-100 h-full flex items-center shrink-0">
                      Nama Usaha / Bisnis*
                    </div>
                    <div className="px-4 py-2">
                      <input
                        type="text"
                        placeholder="Nama Usaha"
                        maxLength={100}
                        value={verif.business_name}
                        onChange={(e) => setVerif({ ...verif, business_name: e.target.value })}
                        className="w-full border-0 focus:ring-0 px-0 py-0.5 bg-transparent text-slate-700 text-sm"
                      />
                    </div>
                  </div>

                  {/* Deskripsi Usaha Row */}
                  <div className="border border-blue-100 rounded-xl overflow-hidden grid grid-cols-[180px_1fr] items-start bg-white focus-within:border-blue-500 transition-colors">
                    <div className="font-bold text-slate-700 text-xs px-4 py-4 bg-slate-50/50 border-r border-blue-100 h-full flex items-center shrink-0">
                      Deskripsi Usaha / Bisnis (Lengkapi dengan sosial media dan/atau website)*
                    </div>
                    <div className="px-4 py-2">
                      <textarea
                        placeholder="Deskripsi singkat usaha"
                        value={verif.business_description}
                        onChange={(e) => setVerif({ ...verif, business_description: e.target.value })}
                        rows={3}
                        className="w-full border-0 focus:ring-0 px-0 py-0.5 bg-transparent text-slate-700 text-sm placeholder:text-slate-400 resize-none"
                      />
                    </div>
                  </div>

                  {/* Alamat Usaha Row */}
                  <div className="border border-blue-100 rounded-xl overflow-hidden grid grid-cols-[180px_1fr] items-start bg-white focus-within:border-blue-500 transition-colors">
                    <div className="font-bold text-slate-700 text-xs px-4 py-4 bg-slate-50/50 border-r border-blue-100 h-full flex items-center shrink-0">
                      Alamat Usaha / Bisnis*
                    </div>
                    <div className="px-4 py-2">
                      <textarea
                        placeholder="Alamat usaha"
                        value={verif.business_address}
                        onChange={(e) => setVerif({ ...verif, business_address: e.target.value })}
                        rows={2}
                        className="w-full border-0 focus:ring-0 px-0 py-0.5 bg-transparent text-slate-700 text-sm placeholder:text-slate-400 resize-none"
                      />
                    </div>
                  </div>

                  {/* Website Row */}
                  <div className="border border-blue-100 rounded-xl overflow-hidden grid grid-cols-[180px_1fr] items-center bg-white focus-within:border-blue-500 transition-colors">
                    <div className="font-bold text-slate-700 text-xs px-4 py-4 bg-slate-50/50 border-r border-blue-100 h-full flex items-center shrink-0">
                      Website
                    </div>
                    <div className="px-4 py-2">
                      <input
                        type="text"
                        placeholder="leeyjayasukses.id"
                        value={verif.website}
                        onChange={(e) => setVerif({ ...verif, website: e.target.value })}
                        className="w-full border-0 focus:ring-0 px-0 py-0.5 bg-transparent text-slate-700 text-sm"
                      />
                      {verificationErrors.website && (
                        <p className="text-xs text-red-650 mt-1">{verificationErrors.website}</p>
                      )}
                    </div>
                  </div>

                  {/* Grid of 4 dashed upload zones */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    {requiredDocs.map((d) => (
                      <div key={d.key} className="flex flex-col">
                        <label className="text-xs font-bold text-slate-700 mb-1.5 block">{d.label}*</label>
                        <div className="border-2 border-dashed border-blue-200 hover:border-blue-400 rounded-2xl p-6 bg-slate-50/40 flex flex-col items-center justify-center text-center transition-colors relative min-h-[120px]">
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={(e) => onFileChange(d.key, e.target.files?.[0] ?? null)}
                          />
                          <Upload className="h-5 w-5 text-blue-400 mb-2" />
                          <div className="flex flex-col items-center gap-1.5">
                            <span className="text-xs font-semibold text-blue-600 hover:underline">
                              {docs[d.key] ? 'Ubah file...' : 'Upload files...'}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {docs[d.key] ? docs[d.key]!.name : 'Drop files here'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      onClick={submitVerification}
                      disabled={loading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md uppercase tracking-wider text-xs"
                    >
                      {loading ? 'Mengirim...' : 'Kirim Data Verifikasi'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
