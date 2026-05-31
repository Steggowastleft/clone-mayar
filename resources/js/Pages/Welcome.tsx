import { useState, useEffect } from 'react';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { 
    Zap, 
    ArrowRight, 
    Sparkles, 
    TrendingUp, 
    Video, 
    BookOpen, 
    Users, 
    CheckCircle2, 
    Coins, 
    Smartphone, 
    ChevronRight, 
    ShieldCheck, 
    PieChart,
    Layers,
    MessageSquare,
    Award
} from 'lucide-react';

interface Transaction {
    id: number;
    name: string;
    product: string;
    amount: string;
    time: string;
}

export default function Welcome({
    auth,
    laravelVersion,
    phpVersion,
}: PageProps<{ laravelVersion: string; phpVersion: string }>) {
    // Ticker state for live transactions simulation
    const [transactions, setTransactions] = useState<Transaction[]>([
        { id: 1, name: 'Budi Santoso', product: 'Bootcamp Fullstack Laravel', amount: 'Rp 1,250,000', time: '1 menit lalu' },
        { id: 2, name: 'Sarah Amelia', product: 'Ebook UI/UX Design Guide', amount: 'Rp 150,000', time: '3 menit lalu' },
        { id: 3, name: 'Dewo Prasetyo', product: 'Kelas Online React Native', amount: 'Rp 450,000', time: '5 menit lalu' },
    ]);

    // Earnings Estimator states
    const [productType, setProductType] = useState<'bootcamp' | 'ebook' | 'class'>('bootcamp');
    const [price, setPrice] = useState<number>(850000);
    const [buyers, setBuyers] = useState<number>(80);

    // Dynamic ticker updates
    useEffect(() => {
        const names = ['Andi Pratama', 'Siti Rahma', 'Rian Hidayat', 'Putri Ayu', 'Fahmi Idris', 'Indah Permata', 'Eko Saputra', 'Rina Wijaya', 'Doni Setiawan', 'Gita Lestari'];
        const products = {
            bootcamp: ['Bootcamp Fullstack Laravel', 'Mentoring UI/UX Expert', 'Bootcamp React & TypeScript'],
            ebook: ['Ebook Tailwind CSS Tips', 'Ebook UI/UX Design Guide', 'Panduan Jualan Digital PDF'],
            class: ['Kelas Online React Native', 'Mastering Laravel 11', 'Video Course Copywriting']
        };
        const amounts = {
            bootcamp: ['Rp 850,000', 'Rp 1,250,000', 'Rp 1,999,000'],
            ebook: ['Rp 99,000', 'Rp 150,000', 'Rp 249,000'],
            class: ['Rp 299,000', 'Rp 450,000', 'Rp 599,000']
        };

        const interval = setInterval(() => {
            const randomName = names[Math.floor(Math.random() * names.length)];
            const type = Math.random() > 0.5 ? 'bootcamp' : (Math.random() > 0.5 ? 'ebook' : 'class');
            const randomProduct = products[type][Math.floor(Math.random() * products[type].length)];
            const randomAmount = amounts[type][Math.floor(Math.random() * amounts[type].length)];
            
            setTransactions(prev => [
                {
                    id: Date.now(),
                    name: randomName,
                    product: randomProduct,
                    amount: randomAmount,
                    time: 'Baru saja'
                },
                ...prev.slice(0, 3)
            ]);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    // Price updates based on product type selection
    const handleProductTypeChange = (type: 'bootcamp' | 'ebook' | 'class') => {
        setProductType(type);
        if (type === 'bootcamp') {
            setPrice(850000);
            setBuyers(80);
        } else if (type === 'ebook') {
            setPrice(125000);
            setBuyers(250);
        } else {
            setPrice(350000);
            setBuyers(120);
        }
    };

    // Calculate revenue metrics
    const grossRevenue = price * buyers;
    const platformFee = Math.round(grossRevenue * 0.025); // 2.5% platform fee
    const netRevenue = grossRevenue - platformFee;

    const formatIDR = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }).format(val);
    };

    const getDashboardUrl = () => {
        if (auth.user) {
            return (auth.user as any).role === 'admin' ? '/admin/dashboard' : '/dashboard';
        }
        return '/register';
    };

    const ctaText = auth.user ? 'Ke Dashboard Saya' : 'Mulai Jualan Gratis';

    return (
        <>
            <Head title="Jual Produk Digital & Bootcamp Terbaik — BiinsCart" />
            
            <style>{`
                .glass-navbar {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border-bottom: 1px solid rgba(226, 232, 240, 0.6);
                }
                .dark .glass-navbar {
                    background: rgba(15, 23, 42, 0.7);
                    border-bottom: 1px solid rgba(51, 65, 85, 0.4);
                }
                .glass-card {
                    background: rgba(255, 255, 255, 0.45);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                }
                .dark .glass-card {
                    background: rgba(15, 23, 42, 0.45);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }
                .brand-gradient-text {
                    background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 50%, #10b981 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .brand-gradient-bg {
                    background: linear-gradient(135deg, #1e40af 0%, #1d4ed8 40%, #2563eb 70%, #3b82f6 100%);
                }
                .font-cabinet {
                    font-family: 'Cabinet Grotesk', sans-serif;
                }
                .font-serif-in {
                    font-family: 'Instrument Serif', serif;
                }
                .feature-card:hover .feature-icon-container {
                    transform: scale(1.1) rotate(5deg);
                    background-color: #2563eb;
                    color: #ffffff;
                }
            `}</style>

            <div className="min-h-screen text-slate-800 dark:text-slate-100 font-cabinet transition-colors duration-300">
                {/* ── HEADER / NAVIGATION ── */}
                <header className="fixed top-0 left-0 right-0 z-50 glass-navbar transition-all duration-300">
                    <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2.5 group">
                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition">
                                <Zap className="h-5.5 w-5.5 text-white" fill="currentColor" />
                            </div>
                            <span className="font-black text-2xl tracking-tight bg-gradient-to-r from-blue-700 to-indigo-600 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                                BiinsCart
                            </span>
                        </Link>

                        {/* Middle Links (Desktop) */}
                        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600 dark:text-slate-300">
                            <a href="#fitur" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Fitur</a>
                            <a href="#simulasi" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Simulasi Pendapatan</a>
                            <a href="#testimoni" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Testimoni</a>
                            <a href="#faq" className="hover:text-blue-600 dark:hover:text-blue-400 transition">FAQ</a>
                        </nav>

                        {/* Right Buttons */}
                        <div className="flex items-center gap-4">
                            {auth.user ? (
                                <Link
                                    href={getDashboardUrl()}
                                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 hover:-translate-y-0.5 transition"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition px-3 py-2"
                                    >
                                        Masuk
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="hidden sm:inline-flex px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-white font-bold text-sm hover:-translate-y-0.5 transition shadow-sm"
                                    >
                                        Daftar Gratis
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* ── HERO SECTION ── */}
                <section className="relative pt-36 pb-20 px-6 overflow-hidden">
                    <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
                        {/* Hero Text */}
                        <div className="lg:col-span-7 space-y-6 text-left">
                            {/* Promo Badge */}
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200/50 dark:border-blue-800/40">
                                <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                                    Platform Creator Ekonomi Terbaik
                                </span>
                            </div>

                            {/* Headline */}
                            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-950 dark:text-white leading-[1.08] max-w-2xl">
                                Ubah Keahlianmu Menjadi Bisnis Digital yang <span className="brand-gradient-text">Menguntungkan</span>
                            </h1>

                            {/* Tagline */}
                            <p className="text-xl text-slate-500 dark:text-slate-400 max-w-xl font-normal leading-relaxed">
                                Jual kelas online, bootcamp, e-book, dan kelola semua peserta dalam satu platform <span className="font-serif-in italic text-blue-600 dark:text-blue-400 text-2xl font-bold">luxurious & seamless.</span>
                            </p>

                            {/* CTAs */}
                            <div className="flex flex-wrap items-center gap-3 pt-4">
                                <Link
                                    href={getDashboardUrl()}
                                    className="px-7 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-1 transition duration-200 flex items-center gap-2 group"
                                >
                                    {ctaText}
                                    <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-1 transition" />
                                </Link>
                                <Link
                                    href="/peserta/login"
                                    className="px-7 py-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-sm hover:-translate-y-0.5 transition duration-200 flex items-center gap-2 shadow-sm"
                                >
                                    <span>Portal Member / Pembeli</span>
                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                                </Link>
                                <a
                                    href="#simulasi"
                                    className="px-6 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-600 dark:text-slate-200 font-bold text-sm hover:-translate-y-0.5 transition duration-200"
                                >
                                    Simulasi Pendapatan
                                </a>
                            </div>

                            {/* Stats mini */}
                            <div className="grid grid-cols-3 gap-6 pt-10 border-t border-slate-200/60 dark:border-slate-800/60 max-w-lg">
                                <div>
                                    <h4 className="text-3xl font-black text-slate-950 dark:text-white">10K+</h4>
                                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mt-1">Creator Aktif</p>
                                </div>
                                <div>
                                    <h4 className="text-3xl font-black text-slate-950 dark:text-white">Rp 50B+</h4>
                                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mt-1">Total Transaksi</p>
                                </div>
                                <div>
                                    <h4 className="text-3xl font-black text-slate-950 dark:text-white">99.9%</h4>
                                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mt-1">Sistem Uptime</p>
                                </div>
                            </div>
                        </div>

                        {/* Interactive Creator Dashboard Preview Mockup */}
                        <div className="lg:col-span-5 relative">
                            {/* Glow element */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-emerald-500/10 blur-3xl -z-10 rounded-full" />
                            
                            {/* Glass Dashboard Window */}
                            <div className="w-full rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl overflow-hidden glass-card">
                                {/* Header of Mock Window */}
                                <div className="h-12 bg-slate-50/60 dark:bg-slate-900/60 border-b border-slate-200/50 dark:border-slate-800/50 px-5 flex items-center justify-between">
                                    <div className="flex gap-1.5">
                                        <span className="w-3 h-3 rounded-full bg-red-400 block" />
                                        <span className="w-3 h-3 rounded-full bg-yellow-400 block" />
                                        <span className="w-3 h-3 rounded-full bg-green-400 block" />
                                    </div>
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">BiinsCart Dashboard Creator</span>
                                    <span className="w-3 h-3" />
                                </div>

                                {/* Body of Mock Window */}
                                <div className="p-6 space-y-6">
                                    {/* Main Metrics Card */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-white/70 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[11px] font-bold text-slate-400 uppercase">Pendapatan Bulan Ini</span>
                                                <TrendingUp className="h-4 w-4 text-emerald-500" />
                                            </div>
                                            <h3 className="text-xl font-black text-slate-950 dark:text-white mt-1">Rp 48,250,000</h3>
                                            <span className="text-[10px] text-emerald-500 font-bold bg-emerald-100/60 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full inline-block mt-2">+18.4% Dari Bulan Lalu</span>
                                        </div>
                                        <div className="p-4 bg-white/70 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[11px] font-bold text-slate-400 uppercase">Total Siswa</span>
                                                <Users className="h-4 w-4 text-blue-500" />
                                            </div>
                                            <h3 className="text-xl font-black text-slate-950 dark:text-white mt-1">1,248 Orang</h3>
                                            <span className="text-[10px] text-blue-500 font-bold bg-blue-100/60 dark:bg-blue-500/10 px-2 py-0.5 rounded-full inline-block mt-2">+52 Siswa Hari Ini</span>
                                        </div>
                                    </div>

                                    {/* Ticker / Live Sales Simulator */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-2">
                                            <h4 className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                                                Aktivitas Transaksi Live
                                            </h4>
                                            <span className="text-[10px] text-slate-400">Simulasi Real-time</span>
                                        </div>

                                        <div className="space-y-2.5">
                                            {transactions.map((tx) => (
                                                <div 
                                                    key={tx.id}
                                                    className="flex items-center justify-between p-3 bg-white/40 dark:bg-slate-950/20 border border-slate-200/40 dark:border-slate-900/50 rounded-xl transition duration-500 hover:bg-white/80 dark:hover:bg-slate-900/80 animate-fade-in"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center font-black text-xs">
                                                            {tx.name[0]}
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">{tx.name}</p>
                                                            <p className="text-[10px] text-slate-400 leading-none mt-1">Membeli {tx.product}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs font-black text-blue-600 dark:text-blue-400 leading-tight">{tx.amount}</p>
                                                        <p className="text-[9px] text-slate-400 leading-none mt-1">{tx.time}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── INTERACTIVE CALCULATOR SECTION ── */}
                <section id="simulasi" className="py-24 px-6 relative border-t border-slate-200/50 dark:border-slate-800/50">
                    <div className="max-w-4xl mx-auto text-center space-y-12">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200/40 dark:border-emerald-800/30">
                                <Coins className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-widest">Simulator Pendapatan</span>
                            </div>
                            <h2 className="text-3xl sm:text-5xl font-black text-slate-950 dark:text-white tracking-tight leading-tight">
                                Berapa Banyak yang Bisa Kamu Hasilkan?
                            </h2>
                            <p className="text-base text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
                                Pilih jenis produk digitalmu, gerakkan slider harga dan perkiraan pembeli, lalu lihat hasil simulasi pendapatan bersih kamu.
                            </p>
                        </div>

                        {/* Simulator Card Container */}
                        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-10 shadow-xl glass-card text-left grid md:grid-cols-12 gap-8 items-center">
                            {/* Sliders Area */}
                            <div className="md:col-span-7 space-y-8">
                                {/* Product Type Selector */}
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Pilih Jenis Produk</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleProductTypeChange('bootcamp')}
                                            className={`p-3.5 rounded-xl border font-bold text-xs transition duration-200 text-center flex flex-col items-center gap-1.5 ${
                                                productType === 'bootcamp'
                                                    ? 'border-blue-600 bg-blue-50/70 text-blue-700 dark:border-blue-500 dark:bg-blue-950/30 dark:text-blue-400'
                                                    : 'border-slate-200 hover:border-slate-300 text-slate-600 dark:border-slate-800 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                                            }`}
                                        >
                                            <Video className="h-4.5 w-4.5" />
                                            Bootcamp / Live Sesi
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleProductTypeChange('class')}
                                            className={`p-3.5 rounded-xl border font-bold text-xs transition duration-200 text-center flex flex-col items-center gap-1.5 ${
                                                productType === 'class'
                                                    ? 'border-blue-600 bg-blue-50/70 text-blue-700 dark:border-blue-500 dark:bg-blue-950/30 dark:text-blue-400'
                                                    : 'border-slate-200 hover:border-slate-300 text-slate-600 dark:border-slate-800 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                                            }`}
                                        >
                                            <BookOpen className="h-4.5 w-4.5" />
                                            Kelas Online
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleProductTypeChange('ebook')}
                                            className={`p-3.5 rounded-xl border font-bold text-xs transition duration-200 text-center flex flex-col items-center gap-1.5 ${
                                                productType === 'ebook'
                                                    ? 'border-blue-600 bg-blue-50/70 text-blue-700 dark:border-blue-500 dark:bg-blue-950/30 dark:text-blue-400'
                                                    : 'border-slate-200 hover:border-slate-300 text-slate-600 dark:border-slate-800 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50'
                                            }`}
                                        >
                                            <Layers className="h-4.5 w-4.5" />
                                            E-Book / PDF
                                        </button>
                                    </div>
                                </div>

                                {/* Slider 1: Price */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-baseline">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Harga per Produk</label>
                                        <span className="text-lg font-black text-blue-600 dark:text-blue-400">{formatIDR(price)}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min={productType === 'ebook' ? 25000 : (productType === 'class' ? 100000 : 250000)}
                                        max={productType === 'ebook' ? 500000 : (productType === 'class' ? 2000000 : 5000000)}
                                        step={productType === 'ebook' ? 5000 : (productType === 'class' ? 25000 : 50000)}
                                        value={price}
                                        onChange={(e) => setPrice(Number(e.target.value))}
                                        className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500"
                                    />
                                    <div className="flex justify-between text-[10px] text-slate-400 uppercase font-bold">
                                        <span>Min</span>
                                        <span>Max</span>
                                    </div>
                                </div>

                                {/* Slider 2: Buyers */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-baseline">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Estimasi Pembeli (Bulan)</label>
                                        <span className="text-lg font-black text-blue-600 dark:text-blue-400">{buyers} Peserta</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="5"
                                        max={productType === 'ebook' ? 1000 : (productType === 'class' ? 500 : 250)}
                                        step="5"
                                        value={buyers}
                                        onChange={(e) => setBuyers(Number(e.target.value))}
                                        className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500"
                                    />
                                    <div className="flex justify-between text-[10px] text-slate-400 uppercase font-bold">
                                        <span>5 Pembeli</span>
                                        <span>{productType === 'ebook' ? '1,000' : (productType === 'class' ? '500' : '250')} Pembeli</span>
                                    </div>
                                </div>
                            </div>

                            {/* Revenue Display Area */}
                            <div className="md:col-span-5 p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white space-y-6 flex flex-col justify-between self-stretch">
                                <div className="space-y-4">
                                    <div>
                                        <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest block">Kotor Pendapatan</span>
                                        <h4 className="text-xl font-bold text-slate-200 mt-0.5">{formatIDR(grossRevenue)}</h4>
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest block">Biaya Layanan (2.5%)</span>
                                            <span className="text-[9px] font-bold bg-slate-800/80 px-2 py-0.5 rounded text-indigo-200">Termurah!</span>
                                        </div>
                                        <h4 className="text-sm font-bold text-red-300 mt-0.5">-{formatIDR(platformFee)}</h4>
                                    </div>

                                    <div className="h-px bg-white/10 my-4" />

                                    <div>
                                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">Estimasi Pendapatan Bersih</span>
                                        <h3 className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">{formatIDR(netRevenue)}</h3>
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <Link
                                        href={getDashboardUrl()}
                                        className="w-full text-center py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-sm transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-emerald-500/20 block"
                                    >
                                        Mulai Hasilkan Sekarang
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── FEATURES SECTION ── */}
                <section id="fitur" className="py-24 px-6 bg-slate-50/50 dark:bg-slate-950/20 border-y border-slate-200/40 dark:border-slate-800/40">
                    <div className="max-w-7xl mx-auto space-y-16">
                        <div className="text-center space-y-4 max-w-2xl mx-auto">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200/50 dark:border-blue-800/40">
                                <Layers className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-widest">Fitur Unggulan</span>
                            </div>
                            <h2 className="text-3xl sm:text-5xl font-black text-slate-950 dark:text-white tracking-tight leading-tight">
                                Semuanya Siap untuk Membantu Bisnismu Melaju
                            </h2>
                            <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed">
                                BiinsCart memberikan ekosistem lengkap untuk mendistribusikan konten edukasi dan digital dengan alur otomatis.
                            </p>
                        </div>

                        {/* Feature Grid */}
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* Feature 1 */}
                            <div className="p-8 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/50 hover:shadow-xl hover:-translate-y-1.5 transition duration-300 flex flex-col justify-between feature-card group">
                                <div className="space-y-5">
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shadow-sm transition duration-300 feature-icon-container">
                                        <Video className="h-6 w-6" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-bold text-slate-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Bootcamp & Live Sesi</h3>
                                        <p className="text-sm text-slate-400 dark:text-slate-400 leading-relaxed">
                                            Jual program intensif berbasis waktu. Bagikan link Zoom, atur silabus harian, and kumpulkan tugas peserta secara terstruktur.
                                        </p>
                                    </div>
                                </div>
                                <div className="pt-5 flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                                    Selengkapnya <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition" />
                                </div>
                            </div>

                            {/* Feature 2 */}
                            <div className="p-8 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/50 hover:shadow-xl hover:-translate-y-1.5 transition duration-300 flex flex-col justify-between feature-card group">
                                <div className="space-y-5">
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shadow-sm transition duration-300 feature-icon-container">
                                        <BookOpen className="h-6 w-6" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-bold text-slate-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Kelas Rekaman</h3>
                                        <p className="text-sm text-slate-400 dark:text-slate-400 leading-relaxed">
                                            Unggah video pembelajaran dengan alur bertahap (drip content). Siswa belajar mandiri, lengkap dengan tracking kemajuan kelas.
                                        </p>
                                    </div>
                                </div>
                                <div className="pt-5 flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                                    Selengkapnya <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition" />
                                </div>
                            </div>

                            {/* Feature 3 */}
                            <div className="p-8 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/50 hover:shadow-xl hover:-translate-y-1.5 transition duration-300 flex flex-col justify-between feature-card group">
                                <div className="space-y-5">
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shadow-sm transition duration-300 feature-icon-container">
                                        <Layers className="h-6 w-6" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-bold text-slate-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Jual File & E-book</h3>
                                        <p className="text-sm text-slate-400 dark:text-slate-400 leading-relaxed">
                                            Distribusikan PDF, software, source code, aset desain, atau e-book secara aman. Link download dikirim otomatis setelah transaksi.
                                        </p>
                                    </div>
                                </div>
                                <div className="pt-5 flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                                    Selengkapnya <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition" />
                                </div>
                            </div>

                            {/* Feature 4 */}
                            <div className="p-8 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/50 hover:shadow-xl hover:-translate-y-1.5 transition duration-300 flex flex-col justify-between feature-card group">
                                <div className="space-y-5">
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shadow-sm transition duration-300 feature-icon-container">
                                        <Coins className="h-6 w-6" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-bold text-slate-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Payment Gateway Terintegrasi</h3>
                                        <p className="text-sm text-slate-400 dark:text-slate-400 leading-relaxed">
                                            Terima pembayaran instan via QRIS, E-Wallet (Gopay, OVO, ShopeePay), Transfer Bank Virtual Account, hingga ritel (Alfamart, Indomaret).
                                        </p>
                                    </div>
                                </div>
                                <div className="pt-5 flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                                    Selengkapnya <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition" />
                                </div>
                            </div>

                            {/* Feature 5 */}
                            <div className="p-8 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/50 hover:shadow-xl hover:-translate-y-1.5 transition duration-300 flex flex-col justify-between feature-card group">
                                <div className="space-y-5">
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shadow-sm transition duration-300 feature-icon-container">
                                        <Smartphone className="h-6 w-6" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-bold text-slate-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Landing Page Instan</h3>
                                        <p className="text-sm text-slate-400 dark:text-slate-400 leading-relaxed">
                                            Setiap produk mendapatkan halaman jualan (checkout page) khusus yang dioptimalkan secara mobile agar konversi penjualanmu tinggi.
                                        </p>
                                    </div>
                                </div>
                                <div className="pt-5 flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                                    Selengkapnya <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition" />
                                </div>
                            </div>

                            {/* Feature 6 */}
                            <div className="p-8 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/50 hover:shadow-xl hover:-translate-y-1.5 transition duration-300 flex flex-col justify-between feature-card group">
                                <div className="space-y-5">
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shadow-sm transition duration-300 feature-icon-container">
                                        <PieChart className="h-6 w-6" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-bold text-slate-950 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Laporan & Analitik Mendalam</h3>
                                        <p className="text-sm text-slate-400 dark:text-slate-400 leading-relaxed">
                                            Analisis asal klik, rasio pendaftaran, laporan keuangan harian, dan ringkasan penarikan dana (withdraw) langsung ke rekeningmu.
                                        </p>
                                    </div>
                                </div>
                                <div className="pt-5 flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                                    Selengkapnya <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── TESTIMONIALS SECTION ── */}
                <section id="testimoni" className="py-24 px-6 max-w-7xl mx-auto space-y-16">
                    <div className="text-center space-y-4 max-w-2xl mx-auto">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200/50 dark:border-indigo-800/40">
                            <Award className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                            <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-widest">Kisah Sukses Creator</span>
                        </div>
                        <h2 className="text-3xl sm:text-5xl font-black text-slate-950 dark:text-white tracking-tight leading-tight">
                            Dipercaya oleh Para Penjual Pintar
                        </h2>
                        <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed">
                            Lihat bagaimana kreator dan pengajar di Indonesia mendirikan bisnis edukasi mereka bersama BiinsCart.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Testimonial 1 */}
                        <div className="p-8 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/50 space-y-6 flex flex-col justify-between">
                            <p className="text-lg font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
                                "Sebelumnya saya repot mengonfirmasi pembayaran bukti transfer manual di WhatsApp. Sekarang di BiinsCart, peserta langsung bayar dengan VA / QRIS, dan link download materi otomatis dikirim detik itu juga."
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center font-black">
                                    D
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-950 dark:text-white leading-tight">Dewi Anggraeni</h4>
                                    <p className="text-xs text-slate-400 mt-0.5">Pengajar UI/UX & Pemilik E-book "Design Guidebook"</p>
                                </div>
                            </div>
                        </div>

                        {/* Testimonial 2 */}
                        <div className="p-8 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/50 space-y-6 flex flex-col justify-between">
                            <p className="text-lg font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
                                "Mengelola 150+ peserta bootcamp coding secara manual adalah mimpi buruk. Berkat modul silabus terpadu dan feedback tugas BiinsCart, platform ini menghemat 20 jam kerja mingguan saya."
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center font-black">
                                    R
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-950 dark:text-white leading-tight">Rinaldi Prasetyo</h4>
                                    <p className="text-xs text-slate-400 mt-0.5">Developer Lead & Tutor Bootcamp "Fullstack Node.js"</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── FAQ SECTION ── */}
                <section id="faq" className="py-24 px-6 bg-slate-50/50 dark:bg-slate-950/20 border-t border-slate-200/40 dark:border-slate-800/40">
                    <div className="max-w-4xl mx-auto space-y-16">
                        <div className="text-center space-y-4 max-w-2xl mx-auto">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200/50 dark:border-blue-800/40">
                                <MessageSquare className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-widest">Tanya Jawab</span>
                            </div>
                            <h2 className="text-3xl sm:text-5xl font-black text-slate-950 dark:text-white tracking-tight leading-tight">
                                Sering Ditanyakan
                            </h2>
                        </div>

                        <div className="space-y-6">
                            {[
                                {
                                    q: 'Apakah BiinsCart memotong biaya bulanan?',
                                    a: 'Tidak. Kami tidak mengenakan biaya langganan bulanan wajib. Kami hanya memotong biaya platform kecil sebesar 2.5% per transaksi sukses. Anda hanya membayar ketika Anda berhasil menjual.'
                                },
                                {
                                    q: 'Metode pembayaran apa saja yang disediakan?',
                                    a: 'Kami menyediakan integrasi pembayaran terluas, mencakup Transfer Bank Virtual Account (BCA, Mandiri, BNI, BRI), E-Wallet (GoPay, ShopeePay, OVO, DANA), QRIS, serta jaringan ritel seperti Alfamart dan Indomaret.'
                                },
                                {
                                    q: 'Berapa lama proses pencairan dana (withdrawal)?',
                                    a: 'Dana hasil penjualan dikreditkan ke saldo akun Anda secara instan dan dapat ditarik langsung ke rekening bank lokal pilihan Anda. Proses penarikan biasanya diproses dalam waktu 1x24 jam kerja.'
                                },
                                {
                                    q: 'Apakah saya bisa membatasi download file digital?',
                                    a: 'Ya. Anda dapat menentukan limitasi download per user, masa kedaluwarsa link download, serta memantau histori download peserta untuk menjaga keamanan intelektual produk digital Anda.'
                                }
                            ].map((item, idx) => (
                                <div key={idx} className="p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900/40 space-y-2">
                                    <h4 className="font-bold text-base text-slate-950 dark:text-white">{item.q}</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.a}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── CTA BOTTOM BANNER ── */}
                <section className="py-24 px-6 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-slate-950 -z-20" />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-900/50 via-indigo-900/40 to-slate-950/80 -z-10" />
                    
                    <div className="max-w-3xl mx-auto space-y-8 text-white">
                        <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                            Siap Memulai Perjalanan Bisnis Digitalmu?
                        </h2>
                        <p className="text-base text-indigo-200/80 max-w-xl mx-auto leading-relaxed">
                            Daftar sekarang secara gratis, buat halaman jualan pertamamu dalam 5 menit, dan nikmati fitur lengkap tanpa ribet coding.
                        </p>
                        <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link
                                href={getDashboardUrl()}
                                className="px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-base shadow-xl shadow-blue-500/25 hover:shadow-blue-500/35 hover:-translate-y-1 transition duration-200 w-full sm:w-auto"
                            >
                                {ctaText}
                            </Link>
                            <Link
                                href={route('login')}
                                className="px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-base hover:-translate-y-0.5 transition duration-200 w-full sm:w-auto"
                            >
                                Masuk ke Akun
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ── FOOTER ── */}
                <footer className="py-12 px-6 border-t border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-950 text-slate-400 text-sm">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Zap className="h-4.5 w-4.5 text-white" fill="currentColor" />
                            </div>
                            <span className="font-black text-lg tracking-tight text-slate-900 dark:text-white">
                                BiinsCart
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                            &copy; {new Date().getFullYear()} BiinsCart. All rights reserved. Powered by Laravel v{laravelVersion} (PHP v{phpVersion}).
                        </p>
                        <div className="flex gap-6 text-xs font-bold text-slate-400 dark:text-slate-500">
                            <a href="#fitur" className="hover:text-blue-600 transition">Fitur</a>
                            <a href="#simulasi" className="hover:text-blue-600 transition">Simulasi</a>
                            <a href="#faq" className="hover:text-blue-600 transition">FAQ</a>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
