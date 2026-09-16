import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, RefreshCw, Home, LayoutDashboard, LogIn, ExternalLink } from 'lucide-react';

export default function ErrorPage({ status = 404, message }) {
    const errorConfigs = {
        400: {
            code: 400,
            badge: 'HTTP 400 • Bad Request',
            badgeClass: 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300',
            dotClass: 'bg-blue-600 dark:bg-blue-400',
            title: 'Permintaan Tidak Valid',
            description: 'Format permintaan data atau parameter yang dikirimkan tidak dapat diproses oleh server sistem STAS RG Projects.',
            primaryAction: { label: 'Coba Muat Ulang', icon: RefreshCw, onClick: () => window.location.reload() },
            secondaryAction: { label: 'Kembali ke Beranda', icon: Home, href: '/' },
        },
        401: {
            code: 401,
            badge: 'HTTP 401 • Unauthorized',
            badgeClass: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300',
            dotClass: 'bg-amber-600 dark:bg-amber-400',
            title: 'Autentikasi Diperlukan',
            description: 'Sesi login Anda belum aktif atau telah berakhir. Silakan masuk terlebih dahulu dengan akun resmi STAS-RG.',
            primaryAction: { label: 'Masuk ke Akun', icon: LogIn, href: '/login' },
            secondaryAction: { label: 'Kembali ke Beranda', icon: Home, href: '/' },
        },
        403: {
            code: 403,
            badge: 'HTTP 403 • Forbidden',
            badgeClass: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300',
            dotClass: 'bg-amber-600 dark:bg-amber-400',
            title: 'Akses Ditolak',
            description: 'Mohon maaf, Anda tidak memiliki izin otorisasi atau hak akses yang memadai untuk membuka dokumen atau menu ini.',
            primaryAction: { label: 'Kembali', icon: ArrowLeft, onClick: () => window.history.length > 1 ? window.history.back() : router.visit('/') },
            secondaryAction: { label: 'Ke Dashboard', icon: LayoutDashboard, href: '/dashboard' },
            infoPill: 'Hubungi administrator laboratorium jika Anda memerlukan otorisasi tambahan.',
        },
        404: {
            code: 404,
            badge: 'HTTP 404 • Not Found',
            badgeClass: 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300',
            dotClass: 'bg-blue-600 dark:bg-blue-400',
            title: 'Halaman Tidak Ditemukan',
            description: 'Halaman atau dokumen spesifikasi riset yang Anda tuju tidak ditemukan pada sistem repositori STAS RG Projects atau mungkin telah dipindahkan.',
            primaryAction: { label: 'Kembali ke Beranda', icon: Home, href: '/' },
            secondaryAction: { label: 'Kembali', icon: ArrowLeft, onClick: () => window.history.length > 1 ? window.history.back() : router.visit('/') },
        },
        419: {
            code: 419,
            badge: 'HTTP 419 • Page Expired',
            badgeClass: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300',
            dotClass: 'bg-amber-600 dark:bg-amber-400',
            title: 'Sesi Halaman Telah Kedaluwarsa',
            description: 'Token keamanan sesi formulir telah berakhir karena tidak ada aktivitas dalam beberapa waktu. Silakan segarkan halaman untuk melanjutkan.',
            primaryAction: { label: 'Segarkan Halaman', icon: RefreshCw, onClick: () => window.location.reload() },
            secondaryAction: { label: 'Masuk Kembali', icon: LogIn, href: '/login' },
            infoPill: 'Tindakan pengamanan otomatis untuk melindungi integritas data riset Anda.',
        },
        429: {
            code: 429,
            badge: 'HTTP 429 • Too Many Requests',
            badgeClass: 'bg-orange-50 dark:bg-orange-950/60 border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-300',
            dotClass: 'bg-orange-600 dark:bg-orange-400',
            title: 'Terlalu Banyak Permintaan',
            description: 'Sistem mendeteksi frekuensi pengiriman permintaan yang terlalu tinggi dari jaringan Anda dalam waktu singkat. Silakan tunggu beberapa saat.',
            primaryAction: { label: 'Coba Lagi', icon: RefreshCw, onClick: () => window.location.reload() },
            secondaryAction: { label: 'Kembali ke Beranda', icon: Home, href: '/' },
            infoPill: 'Mekanisme Rate Limiting aktif demi menjaga stabilitas performa sistem riset.',
        },
        500: {
            code: 500,
            badge: 'HTTP 500 • Server Error',
            badgeClass: 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300',
            dotClass: 'bg-rose-600 dark:bg-rose-400',
            title: 'Terjadi Kesalahan pada Server',
            description: 'Sistem STAS RG Projects mengalami kendala teknis saat memproses permintaan ini. Tim administrator laboratorium telah mencatat aktivitas ini.',
            primaryAction: { label: 'Coba Muat Ulang', icon: RefreshCw, onClick: () => window.location.reload() },
            secondaryAction: { label: 'Kembali ke Beranda', icon: Home, href: '/' },
            infoPill: 'Jika masalah berlanjut, hubungi tim dukungan di stas.research@telkomuniversity.ac.id',
        },
        503: {
            code: 503,
            badge: 'HTTP 503 • Service Unavailable',
            badgeClass: 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300',
            dotClass: 'bg-rose-600 dark:bg-rose-400',
            title: 'Layanan Sedang dalam Pemeliharaan',
            description: 'Sistem STAS RG Projects saat ini sedang menjalani proses pemeliharaan rutin atau peningkatan infrastruktur server. Kami akan segera kembali aktif.',
            primaryAction: { label: 'Coba Muat Ulang', icon: RefreshCw, onClick: () => window.location.reload() },
            secondaryAction: { label: 'Kunjungi Website STAS-RG', icon: ExternalLink, href: 'https://www.stas-rg.com' },
            infoPill: 'Laboratorium CoE STAS-RG • Fakultas Ilmu Terapan Telkom University.',
        },
    };

    const config = errorConfigs[status] || errorConfigs[500];
    const displayDescription = message || config.description;
    const errorImage = status === 400
        ? '/assets/img/icon/tidakvalid.png'
        : status === 401
        ? '/assets/img/icon/autentikasi.png'
        : status === 403
        ? '/assets/img/icon/aksesditolak.png'
        : status === 419
        ? '/assets/img/icon/sesikedaluwarsa.png'
        : status === 429
        ? '/assets/img/icon/terlalubanyakpermintaan.png'
        : status === 500
        ? '/assets/img/icon/kesalahanserver.png'
        : status === 503
        ? '/assets/img/icon/pemeliharaan.png'
        : '/assets/img/icon/notfound.png';

    return (
        <div className="min-h-screen bg-[#FAFBFD] dark:bg-[#090D16] text-slate-900 dark:text-white flex flex-col justify-between items-center p-4 sm:p-6 relative overflow-x-hidden selection:bg-[#0AB600]/20 selection:text-[#0AB600]">
            <Head title={`${config.code} — ${config.title} | STAS RG Projects`} />

            {/* Ambient Background Glow Effect (Subtle SaaS light) */}
            <div className="ambient-glow" style={{ filter: 'blur(64px)', WebkitFilter: 'blur(64px)' }} />

            {/* Header Brand */}
            <Link
                href="/"
                className="relative z-10 flex items-center justify-center gap-3 pt-4 pb-6 group"
                title="Menuju Beranda STAS-RG Projects"
            >
                <img
                    src="/assets/img/telu.png"
                    alt="Telkom University"
                    className="h-8 sm:h-9 w-auto object-contain dark:brightness-0 dark:invert opacity-90 group-hover:opacity-100 transition-opacity"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-700" />
                <img
                    src="/assets/img/stas.png"
                    alt="STAS-RG"
                    className="h-8 sm:h-9 w-auto object-contain group-hover:scale-105 transition-transform"
                    onError={(e) => { e.currentTarget.src = '/assets/img/STAS RG.png'; }}
                />
            </Link>

            {/* Center Error Box */}
            <div className="relative z-10 w-full max-w-lg my-auto bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-6 sm:p-10 text-center shadow-xs">
                {/* Illustration & Big Numeric Code */}
                <div className="flex flex-col items-center justify-center mb-3">
                    <img
                        src={errorImage}
                        alt="Illustration"
                        className="w-28 sm:w-32 h-auto object-contain mx-auto mb-3 drop-shadow-xs"
                    />
                    <div className="text-5xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        {config.code}
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight uppercase mb-3">
                    {config.title}
                </h1>

                {/* Description */}
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-sm mx-auto mb-8">
                    {displayDescription}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                    {config.primaryAction.onClick ? (
                        <button
                            type="button"
                            onClick={config.primaryAction.onClick}
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0AB600] hover:bg-[#089600] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                        >
                            <config.primaryAction.icon className="w-4 h-4" />
                            <span>{config.primaryAction.label}</span>
                        </button>
                    ) : (
                        <Link
                            href={config.primaryAction.href}
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0AB600] hover:bg-[#089600] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                        >
                            <config.primaryAction.icon className="w-4 h-4" />
                            <span>{config.primaryAction.label}</span>
                        </Link>
                    )}

                    {config.secondaryAction && (
                        config.secondaryAction.onClick ? (
                            <button
                                type="button"
                                onClick={config.secondaryAction.onClick}
                                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold transition-all cursor-pointer"
                            >
                                <config.secondaryAction.icon className="w-4 h-4" />
                                <span>{config.secondaryAction.label}</span>
                            </button>
                        ) : (
                            <Link
                                href={config.secondaryAction.href}
                                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold transition-all cursor-pointer"
                            >
                                <config.secondaryAction.icon className="w-4 h-4" />
                                <span>{config.secondaryAction.label}</span>
                            </Link>
                        )
                    )}
                </div>

                {/* Additional Info Callout */}
                {config.infoPill && (
                    <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800/80 text-[11px] text-zinc-500 dark:text-zinc-400">
                        {config.infoPill}
                    </div>
                )}
            </div>

            {/* Footer Attribution */}
            <footer className="relative z-10 py-4 text-center text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
                <p>
                    © {new Date().getFullYear()} <strong>CoE STAS-RG</strong> • Fakultas Ilmu Terapan Telkom University.
                </p>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                    Butuh bantuan? Kunjungi{' '}
                    <a
                        href="/support"
                        className="text-[#0AB600] font-semibold hover:underline"
                    >
                        Pusat Bantuan & Kontak Support
                    </a>{' '}
                    atau email{' '}
                    <a
                        href="mailto:stas.research@telkomuniversity.ac.id"
                        className="text-[#0AB600] font-semibold hover:underline"
                    >
                        stas.research@telkomuniversity.ac.id
                    </a>
                </p>
            </footer>
        </div>
    );
}
