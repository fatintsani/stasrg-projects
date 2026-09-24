import React, { useState } from 'react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Fingerprint, LogIn, ArrowRight, ShieldCheck, AlertCircle, Clock, Info, AlertTriangle, X, Sparkles } from 'lucide-react';
import { AppProvider, useApp } from '../../Context/AppContext';
import AuthLayout from '../../Components/AuthLayout';
import BiometricModal from '../../Components/BiometricModal';

function GoogleLogo({ className = "w-4 h-4" }) {
    return (
        <svg viewBox="0 0 24 24" className={className}>
            <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
        </svg>
    );
}

function LoginFormContent({ status, hasGoogleAuth = false, hasTeluSso = false }) {
    const { t, language } = useApp();
    const { flash } = usePage().props;
    const [showPassword, setShowPassword] = useState(false);
    const [isBiometricOpen, setIsBiometricOpen] = useState(false);
    
    // State for Feature In-Development Alert Modal
    const [devAlert, setDevAlert] = useState({
        isOpen: false,
        title: '',
        message: '',
        provider: '',
    });

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    const handleGoogleLogin = () => {
        if (!hasGoogleAuth) {
            setDevAlert({
                isOpen: true,
                title: 'Login Google Sedang Dalam Pengembangan',
                message: 'Fitur autentikasi Single Sign-On menggunakan Akun Google saat ini sedang dalam tahap konfigurasi & integrasi API oleh Administrator. Silakan masuk menggunakan Email/Username dan Kata Sandi terdaftar Anda.',
                provider: 'google',
            });
            return;
        }
        window.location.href = '/auth/google/redirect';
    };

    const handleTeluSsoLogin = () => {
        if (!hasTeluSso) {
            setDevAlert({
                isOpen: true,
                title: 'SSO Telkom University Sedang Dalam Pengembangan',
                message: 'Integrasi autentikasi Single Sign-On (SSO) Telkom University (iGracias / Office 365 Tel-U) sedang dalam tahap pengembangan & penghubungan gateway API resmi. Silakan masuk menggunakan kredensial akun STAS RG Anda.',
                provider: 'telu',
            });
            return;
        }
        window.location.href = '/auth/telu-sso/redirect';
    };

    const handleBiometricSuccess = (res) => {
        setIsBiometricOpen(false);
        if (res && res.redirect_url) {
            window.location.href = res.redirect_url;
        } else {
            window.location.href = '/dashboard';
        }
    };

    // Check if error is related to pending approval or rejection
    const isPendingError = errors.email && errors.email.includes('menunggu persetujuan');
    const isRejectedError = errors.email && errors.email.includes('ditolak');
    const isInactiveError = errors.email && errors.email.includes('dinonaktifkan');

    return (
        <AuthLayout
            title={t.auth?.login?.title || 'Masuk ke Platform'}
            subtitle={t.auth?.login?.subtitle || 'Akses terpusat untuk publikasi dan manajemen proyek STAS RG.'}
            badge={null}
        >
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full p-7 sm:p-9 rounded-3xl bg-white dark:bg-[#18181B] border border-zinc-200/80 dark:border-zinc-800/80 transition-colors shadow-sm relative"
            >
                {/* Header inside Card */}
                <div className="text-center mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        {t.auth?.login?.title || 'Masuk ke Platform'}
                    </h1>
                    <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-2 max-w-sm mx-auto leading-relaxed">
                        {t.auth?.login?.subtitle || 'Akses terpusat untuk repositori dokumen dan manajemen proyek STAS RG.'}
                    </p>
                </div>

                {/* Flash Status Notification (e.g. after registration) */}
                {status && (
                    <div className="mb-5 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-xs font-semibold text-amber-900 dark:text-amber-300 flex items-start gap-2.5">
                        <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{status}</span>
                    </div>
                )}

                {/* Warning Flash Notice (e.g. from OAuth redirect fallback) */}
                {flash?.warning && (
                    <div className="mb-5 p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/60 border border-amber-300/80 dark:border-amber-800/80 text-xs font-medium text-amber-900 dark:text-amber-200 flex items-start gap-2.5 animate-in fade-in duration-200">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div className="leading-relaxed">
                            <span className="font-bold">Pemberitahuan Sistem: </span>
                            {flash.warning}
                        </div>
                    </div>
                )}

                {/* Prominent Pending Approval Warning Banner */}
                {isPendingError && (
                    <div className="mb-5 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-xs font-semibold text-amber-900 dark:text-amber-200 flex items-start gap-2.5 animate-in fade-in duration-200">
                        <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold text-amber-900 dark:text-amber-200">Persetujuan Diperlukan</p>
                            <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5 leading-relaxed">
                                {errors.email} Hubungi Administrator untuk mempercepat proses aktivasi akun Anda.
                            </p>
                        </div>
                    </div>
                )}

                {/* Rejected or Inactive Status Banner */}
                {(isRejectedError || isInactiveError) && (
                    <div className="mb-5 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-xs font-semibold text-rose-900 dark:text-rose-200 flex items-start gap-2.5 animate-in fade-in duration-200">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold text-rose-900 dark:text-rose-200">Akses Akun Dibatasi</p>
                            <p className="text-[11px] text-rose-800 dark:text-rose-300 mt-0.5 leading-relaxed">
                                {errors.email}
                            </p>
                        </div>
                    </div>
                )}

                {/* Quick Social, SSO & Biometric Logins */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-6">
                    {/* Google Sign In */}
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/90 text-slate-800 dark:text-zinc-200 text-xs font-semibold border border-zinc-200/90 dark:border-zinc-700/80 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all cursor-pointer shadow-sm group"
                        title="Masuk dengan Akun Google"
                    >
                        <GoogleLogo className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                        <span className="truncate">Google</span>
                    </button>

                    {/* Telkom University SSO */}
                    <button
                        type="button"
                        onClick={handleTeluSsoLogin}
                        className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white dark:bg-zinc-900 hover:bg-rose-50/40 dark:hover:bg-rose-950/20 text-slate-800 dark:text-zinc-200 text-xs font-semibold border border-zinc-200/90 dark:border-zinc-700/80 hover:border-rose-300 dark:hover:border-rose-800/60 transition-all cursor-pointer shadow-sm group"
                        title="Masuk dengan SSO Telkom University"
                    >
                        <img
                            src="/assets/img/telu_noname.png"
                            alt="SSO Tel-U"
                            className="w-4 h-4 object-contain shrink-0 transition-transform group-hover:scale-110"
                        />
                        <span className="truncate">SSO Tel-U</span>
                    </button>

                    {/* Passkey / Biometric Sign In */}
                    <button
                        type="button"
                        onClick={() => setIsBiometricOpen(true)}
                        className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#0AB600]/10 hover:bg-[#0AB600]/15 dark:hover:bg-[#0AB600]/20 text-[#089600] dark:text-[#0AB600] text-xs font-semibold border border-[#0AB600]/30 hover:border-[#0AB600]/50 transition-all cursor-pointer shadow-sm group"
                        title="Masuk dengan Sidik Jari / Face ID"
                    >
                        <Fingerprint className="w-4 h-4 text-[#0AB600] shrink-0 transition-transform group-hover:scale-110" />
                        <span className="truncate">Passkey</span>
                    </button>
                </div>

                {/* Divider */}
                <div className="relative flex items-center justify-center my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-zinc-200/80 dark:border-zinc-800" />
                    </div>
                    <span className="relative px-3 bg-white dark:bg-[#18181B] text-[11px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                        {t.auth?.login?.orDivider || 'atau gunakan kredensial'}
                    </span>
                </div>

                {/* Standard Credentials Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email / Username Field */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-800 dark:text-zinc-200 mb-1.5">
                            Email atau Username
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
                                <Mail className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                required
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="Masukkan email atau username Anda"
                                className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-50/70 dark:bg-zinc-900/80 border ${
                                    errors.email ? 'border-rose-400 dark:border-rose-600' : 'border-zinc-200 dark:border-zinc-800'
                                } text-slate-900 dark:text-white text-xs sm:text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-[#0AB600] dark:focus:border-[#0AB600] transition-colors`}
                            />
                        </div>
                        {errors.email && !isPendingError && !isRejectedError && !isInactiveError && (
                            <p className="text-xs text-rose-600 dark:text-rose-400 mt-1.5 font-medium flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                <span>{errors.email}</span>
                            </p>
                        )}
                    </div>

                    {/* Password Field */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                                Kata Sandi
                            </label>
                            <Link
                                href="/forgot-password"
                                className="text-[11px] font-semibold text-[#0AB600] hover:underline"
                            >
                                Lupa kata sandi?
                            </Link>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
                                <Lock className="w-4 h-4" />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Masukkan kata sandi Anda"
                                className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-zinc-50/70 dark:bg-zinc-900/80 border ${
                                    errors.password ? 'border-rose-400 dark:border-rose-600' : 'border-zinc-200 dark:border-zinc-800'
                                } text-slate-900 dark:text-white text-xs sm:text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-[#0AB600] dark:focus:border-[#0AB600] transition-colors`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors cursor-pointer"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-zinc-400" />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-xs text-rose-600 dark:text-rose-400 mt-1.5 font-medium flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                <span>{errors.password}</span>
                            </p>
                        )}
                    </div>

                    {/* Remember Me Checkbox */}
                    <div className="flex items-center justify-between pt-1">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 text-[#0AB600] focus:ring-0 accent-[#0AB600] dark:accent-[#0AB600] cursor-pointer"
                            />
                            <span className="text-xs text-zinc-600 dark:text-zinc-400">
                                Ingat saya pada perangkat ini
                            </span>
                        </label>
                    </div>

                    {/* Primary Submit Button */}
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-[#0AB600] hover:bg-[#089600] disabled:opacity-70 text-white text-xs sm:text-sm font-semibold border border-[#0AB600] transition-all duration-200 cursor-pointer mt-2 shadow-sm"
                    >
                        <LogIn className="w-4 h-4" />
                        <span>{processing ? 'Memverifikasi...' : 'Masuk ke Platform'}</span>
                    </button>
                </form>

                {/* Sign Up / Create User Footer Link */}
                <div className="mt-6 pt-5 border-t border-zinc-200/80 dark:border-zinc-800 text-center">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Belum memiliki akun terdaftar?{' '}
                        <Link
                            href="/register"
                            className="font-bold text-[#0AB600] hover:underline inline-flex items-center gap-0.5"
                        >
                            <span>Daftar Akun Baru</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </p>
                </div>
            </motion.div>

            {/* Biometric Interactive Modal */}
            <BiometricModal
                isOpen={isBiometricOpen}
                onClose={() => setIsBiometricOpen(false)}
                onSuccess={handleBiometricSuccess}
                userEmail={data.email}
            />

            {/* Feature In-Development Alert Modal */}
            <AnimatePresence>
                {devAlert.isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setDevAlert({ ...devAlert, isOpen: false })}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        />

                        {/* Modal Box */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ type: 'spring', duration: 0.3 }}
                            className="relative w-full max-w-md p-6 bg-white dark:bg-[#18181B] rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl z-10 overflow-hidden"
                        >
                            {/* Decorative background glow */}
                            <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 flex items-center justify-center shrink-0">
                                        {devAlert.provider === 'telu' ? (
                                            <img
                                                src="/assets/img/telu_noname.png"
                                                alt="Telkom University"
                                                className="w-7 h-7 object-contain"
                                            />
                                        ) : (
                                            <GoogleLogo className="w-6 h-6" />
                                        )}
                                    </div>
                                    <div>
        
                                        <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                                            {devAlert.title}
                                        </h3>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setDevAlert({ ...devAlert, isOpen: false })}
                                    className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6 bg-zinc-50 dark:bg-zinc-900/60 p-3.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
                                {devAlert.message}
                            </p>

                            <div className="flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setDevAlert({ ...devAlert, isOpen: false })}
                                    className="w-full py-2.5 px-4 rounded-xl bg-[#0AB600] hover:bg-[#089600] text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-sm"
                                >
                                    Saya Mengerti, Gunakan Kredensial Biasa
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AuthLayout>
    );
}

export default function Login({ status, hasGoogleAuth, hasTeluSso }) {
    return (
        <AppProvider>
            <LoginFormContent
                status={status}
                hasGoogleAuth={hasGoogleAuth}
                hasTeluSso={hasTeluSso}
            />
        </AppProvider>
    );
}
