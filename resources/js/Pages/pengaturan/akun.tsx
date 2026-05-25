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
    <DashboardLayout>
      <Head title="Pengaturan Akun" />
      <div className="flex gap-6">
        {/* Navigation Sidebar */}
        <div className="w-56 border-r border-gray-200 bg-white p-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 pb-2 pt-1">Pengaturan</p>
          <button onClick={() => setActiveTab('detail')} className={`w-full text-left px-3 py-2 rounded-md ${activeTab==='detail'?'bg-blue-50 text-blue-700':'text-gray-600 hover:bg-gray-100'}`}>Detail Bisnis</button>
          <button onClick={() => setActiveTab('rekening')} className={`w-full text-left mt-1 px-3 py-2 rounded-md ${activeTab==='rekening'?'bg-blue-50 text-blue-700':'text-gray-600 hover:bg-gray-100'}`}>Rekening</button>
          <button onClick={() => setActiveTab('verifikasi')} className={`w-full text-left mt-1 px-3 py-2 rounded-md ${activeTab==='verifikasi'?'bg-blue-50 text-blue-700':'text-gray-600 hover:bg-gray-100'}`}>Verifikasi</button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 p-6">
          {activeTab === 'detail' && (
            <div className="max-w-3xl">
              <h2 className="text-lg font-bold mb-4 text-slate-800">Detail Bisnis</h2>
              <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 shadow-sm">
                <div>
                  <Label>Nama Bisnis</Label>
                  <Input placeholder="Nama Bisnis" maxLength={100} value={detail.business_name} onChange={(e) => setDetail({ ...detail, business_name: e.target.value })} />
                </div>
                <div>
                  <Label>Website</Label>
                  <Input
                    placeholder="https://example.com"
                    value={detail.website}
                    onChange={(e) => setDetail({ ...detail, website: e.target.value })}
                  />
                  {businessErrors.website && (
                    <p className="text-sm text-red-600 mt-1">{businessErrors.website}</p>
                  )}
                </div>
                <div>
                  <Label>Email Bisnis</Label>
                  <Input
                    placeholder="email@domain.com"
                    value={detail.business_email}
                    onChange={(e) => setDetail({ ...detail, business_email: e.target.value })}
                  />
                  {businessErrors.business_email && (
                    <p className="text-sm text-red-600 mt-1">{businessErrors.business_email}</p>
                  )}
                </div>
                <div>
                  <Label>No HP Bisnis</Label>
                  <Input placeholder="08xxxxxxxxxx" maxLength={15} value={detail.phone} onChange={(e) => setDetail({ ...detail, phone: e.target.value })} />
                </div>
                <div>
                  <Label>Alamat</Label>
                  <Textarea placeholder="Alamat lengkap" value={detail.address} onChange={(e) => setDetail({ ...detail, address: e.target.value })} rows={3} />
                </div>
                <div className="flex gap-2">
                  <div className="w-1/3">
                    <Label>Negara</Label>
                    <Input value={detail.country} onChange={(e) => setDetail({ ...detail, country: e.target.value })} />
                  </div>
                  <div className="w-1/3">
                    <Label>Provinsi</Label>
                    <Input value={detail.province} onChange={(e) => setDetail({ ...detail, province: e.target.value })} />
                  </div>
                  <div className="w-1/3">
                    <Label>Kota / Kabupaten</Label>
                    <Input value={detail.city} onChange={(e) => setDetail({ ...detail, city: e.target.value })} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="w-1/2">
                    <Label>Kecamatan</Label>
                    <Input value={detail.district} onChange={(e) => setDetail({ ...detail, district: e.target.value })} />
                  </div>
                  <div className="w-1/2">
                    <Label>Mata Uang</Label>
                    <Input
                      placeholder="IDR"
                      maxLength={10}
                      value={detail.currency}
                      onChange={(e) => setDetail({ ...detail, currency: e.target.value })}
                    />
                    {businessErrors.currency && (
                      <p className="text-sm text-red-600 mt-1">{businessErrors.currency}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={submitDetail} disabled={loading}>
                    {loading ? 'Menyimpan...' : 'Simpan Detail Bisnis'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rekening' && (
            <div className="max-w-2xl">
              <h2 className="text-lg font-bold mb-4 text-slate-800">Rekening</h2>
              <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 shadow-sm">
                <div>
                  <Label>Nama Bank / E-Wallet</Label>
                  <Input value={bank.provider} onChange={(e) => setBank({ ...bank, provider: e.target.value })} />
                </div>
                <div>
                  <Label>Nomor Rekening / E-Wallet</Label>
                  <Input value={bank.account_number} onChange={(e) => setBank({ ...bank, account_number: e.target.value })} />
                </div>
                <div>
                  <Label>Atas Nama</Label>
                  <Input value={bank.account_name} onChange={(e) => setBank({ ...bank, account_name: e.target.value })} />
                </div>
                <div className="pt-2">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={submitBank} disabled={bankLoading}>
                    {bankLoading ? 'Menyimpan...' : 'Simpan Data Rekening'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'verifikasi' && (
            <div className="max-w-3xl">
              <h2 className="text-lg font-bold mb-4 text-slate-800">Verifikasi Akun</h2>

              {/* Status Section */}
              <div className="mb-6">
                {status === 'approved' && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 flex gap-4 items-start shadow-sm animate-fade-in">
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
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex gap-4 items-start shadow-sm">
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
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 flex gap-4 items-start shadow-sm mb-4">
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
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 flex gap-4 items-start shadow-sm">
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

              {/* Only show the request form if the status is not pending and not approved */}
              {status !== 'pending' && status !== 'approved' && (
                <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 shadow-sm">
                  <div className="border-b border-gray-100 pb-3 mb-2">
                    <h3 className="font-bold text-slate-850 text-base">Formulir Pengajuan Verifikasi</h3>
                    <p className="text-xs text-gray-500">Lengkapi seluruh data legalitas di bawah untuk proses verifikasi akun.</p>
                  </div>
                  
                  <div>
                    <Label>Jenis Verifikasi</Label>
                    <Select onValueChange={(v: string) => setVerif({ ...verif, verification_type: v })} defaultValue={verif.verification_type}>
                      <SelectTrigger><SelectValue placeholder="Pilih jenis..." /></SelectTrigger>
                      <SelectContent>
                        {VERIF_TYPES.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Nama sesuai KTP / Penanggung Jawab</Label>
                    <Input
                      placeholder="Masukkan Nama Sesuai KTP"
                      value={verif.legal_name}
                      onChange={(e) => setVerif({ ...verif, legal_name: e.target.value })}
                    />
                    {verificationErrors.legal_name && (
                      <p className="text-sm text-red-600 mt-1">{verificationErrors.legal_name}</p>
                    )}
                  </div>
                  <div>
                    <Label>Nomor KTP</Label>
                    <Input
                      placeholder="1234567890123456"
                      value={verif.id_number}
                      onChange={(e) => setVerif({ ...verif, id_number: e.target.value })}
                    />
                    {verificationErrors.id_number && (
                      <p className="text-sm text-red-600 mt-1">{verificationErrors.id_number}</p>
                    )}
                  </div>
                  <div>
                    <Label>Nama Usaha / Bisnis</Label>
                    <Input placeholder="Nama Usaha" maxLength={100} value={verif.business_name} onChange={(e) => setVerif({ ...verif, business_name: e.target.value })} />
                  </div>
                  <div>
                    <Label>Deskripsi Usaha</Label>
                    <Textarea placeholder="Deskripsi singkat usaha" value={verif.business_description} onChange={(e) => setVerif({ ...verif, business_description: e.target.value })} rows={3} />
                  </div>
                  <div>
                    <Label>Alamat Usaha</Label>
                    <Textarea placeholder="Alamat usaha" value={verif.business_address} onChange={(e) => setVerif({ ...verif, business_address: e.target.value })} rows={2} />
                  </div>
                  <div>
                    <Label>Website</Label>
                    <Input
                      placeholder="https://example.com"
                      value={verif.website}
                      onChange={(e) => setVerif({ ...verif, website: e.target.value })}
                    />
                    {verificationErrors.website && (
                      <p className="text-sm text-red-600 mt-1">{verificationErrors.website}</p>
                    )}
                  </div>

                  <div className="pt-2">
                    <Label className="font-bold text-slate-800 text-sm mb-3 block">Dokumen Wajib</Label>
                    <div className="grid gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      {requiredDocs.map((d) => (
                        <div key={d.key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/50 last:border-0 last:pb-0">
                          <div className="flex-1">
                            <Label className="text-sm font-semibold text-slate-700">{d.label}</Label>
                            <p className="text-xs text-slate-400">Format: JPG, JPEG, PNG, PDF (Maks. 5MB)</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="cursor-pointer inline-flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 transition-colors px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 shadow-sm">
                              <Upload className="h-3.5 w-3.5 text-slate-400" />
                              <span>{docs[d.key] ? 'Ubah File' : 'Pilih File'}</span>
                              <input type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={(e) => onFileChange(d.key, e.target.files?.[0] ?? null)} />
                            </label>
                            {docs[d.key] && (
                              <span className="text-xs text-emerald-600 font-medium truncate max-w-[150px]" title={docs[d.key]?.name}>
                                {docs[d.key]?.name}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 flex gap-2">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6" onClick={submitVerification} disabled={loading}>
                      {loading ? 'Mengirim...' : 'Ajukan Verifikasi'}
                    </Button>
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
