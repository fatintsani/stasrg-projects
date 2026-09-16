import React, { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, UserCheck, ArrowRight, AlertCircle, Clock, AtSign, Info } from 'lucide-react';
import { AppProvider, useApp } from '../../Context/AppContext';
import AuthLayout from '../../Components/AuthLayout';

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

function RegisterFormContent() {
    const { t, language } = useApp();
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
        agree: false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/register', {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const handleGoogleRegister = () => {
        window.location.href = '/auth/google/redirect';
    };

    return (
        <AuthLayout
            title="Daftar Akun Baru"
            subtitle="Buat akun untuk mengajukan akses ke platform STAS RG Projects."
            badge={null}
        >
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full p-7 sm:p-9 rounded-3xl bg-white dark:bg-[#18181B] border border-zinc-200/80 dark:border-zinc-800/80 transition-colors shadow-sm"
            >
                {/* Header inside Card */}
                <div className="text-center mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        {t.auth?.register?.title || 'Daftar Akun Baru'}
                    </h1>
                    <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-2 max-w-sm mx-auto leading-relaxed">
                        {t.auth?.register?.subtitle || 'Buat akun untuk mengajukan akses ke platform STAS RG Projects.'}
                    </p>
                </div>

                {/* Notice Alert about Admin Approval Flow */}
                <div className="mb-6 p-3.5 rounded-2xl bg-[#0AB600]/10 border border-[#0AB600]/30 flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-[#0AB600] shrink-0 mt-0.5" />
                    <p className="text-[11px] text-slate-900 dark:text-[#0AB600] leading-relaxed">
                        <strong>Informasi:</strong> Pendaftaran terbuka untuk semua email (Gmail, Yahoo, dll). Setelah mendaftar, akun akan berstatus <em>Pending</em> hingga disetujui oleh Administrator.
                    </p>
                </div>

                {/* Google Sign Up Quick Button */}
                <div className="mb-6">
                    <button
                        type="button"
                        onClick={handleGoogleRegister}
                        className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/90 text-slate-800 dark:text-zinc-200 text-xs font-semibold border border-zinc-200/90 dark:border-zinc-700/80 transition-all cursor-pointer"
                    >
                        <GoogleLogo className="w-4 h-4 shrink-0" />
                        <span>Daftar Akun via Google</span>
                    </button>
                </div>

                {/* Divider */}
                <div className="relative flex items-center justify-center my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-zinc-200/80 dark:border-zinc-800" />
                    </div>
                    <span className="relative px-3 bg-white dark:bg-[#18181B] text-[11px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                        atau daftar manual
                    </span>
                </div>

                {/* Registration Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Full Name */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-800 dark:text-zinc-200 mb-1.5">
                            {t.auth?.register?.fullNameLabel || 'Nama Lengkap'} <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
                                <User className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                required
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder={t.auth?.register?.fullNamePlaceholder || 'Masukkan nama lengkap Anda'}
                                className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-50/70 dark:bg-zinc-900/80 border ${
                                    errors.name ? 'border-rose-400 dark:border-rose-600' : 'border-zinc-200 dark:border-zinc-800'
                                } text-slate-900 dark:text-white text-xs sm:text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-[#0AB600] dark:focus:border-[#0AB600] transition-colors`}
                            />
                        </div>
                        {errors.name && (
                            <p className="text-xs text-rose-600 dark:text-rose-400 mt-1.5 font-medium flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                <span>{errors.name}</span>
                            </p>
                        )}
                    </div>

                    {/* Username */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-800 dark:text-zinc-200 mb-1.5">
                            {t.auth?.register?.usernameLabel || 'Username Akun'} <span className="text-zinc-400 font-normal">(opsional)</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
                                <AtSign className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                value={data.username}
                                onChange={(e) => setData('username', e.target.value)}
                                placeholder={t.auth?.register?.usernamePlaceholder || 'Masukkan username akun'}
                                className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-50/70 dark:bg-zinc-900/80 border ${
                                    errors.username ? 'border-rose-400 dark:border-rose-600' : 'border-zinc-200 dark:border-zinc-800'
                                } text-slate-900 dark:text-white text-xs sm:text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-[#0AB600] dark:focus:border-[#0AB600] transition-colors`}
                            />
                        </div>
                        {errors.username && (
                            <p className="text-xs text-rose-600 dark:text-rose-400 mt-1.5 font-medium flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                <span>{errors.username}</span>
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-800 dark:text-zinc-200 mb-1.5">
                            {t.auth?.register?.emailLabel || 'Alamat Email'} <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
                                <Mail className="w-4 h-4" />
                            </div>
                            <input
                                type="email"
                                required
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder={t.auth?.register?.emailPlaceholder || 'Masukkan alamat email Anda'}
                                className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-50/70 dark:bg-zinc-900/80 border ${
                                    errors.email ? 'border-rose-400 dark:border-rose-600' : 'border-zinc-200 dark:border-zinc-800'
                                } text-slate-900 dark:text-white text-xs sm:text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-[#0AB600] dark:focus:border-[#0AB600] transition-colors`}
                            />
                        </div>
                        {errors.email && (
                            <p className="text-xs text-rose-600 dark:text-rose-400 mt-1.5 font-medium flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                <span>{errors.email}</span>
                            </p>
                        )}
                    </div>

                    {/* Password Field */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-800 dark:text-zinc-200 mb-1.5">
                            {t.auth?.register?.passwordLabel || 'Kata Sandi'} <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
                                <Lock className="w-4 h-4" />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder={t.auth?.register?.passwordPlaceholder || 'Masukkan kata sandi (min. 8 karakter)'}
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

                    {/* Confirm Password Field */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-800 dark:text-zinc-200 mb-1.5">
                            {t.auth?.register?.passwordConfirmLabel || 'Konfirmasi Kata Sandi'} <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
                                <Lock className="w-4 h-4" />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                placeholder={t.auth?.register?.passwordConfirmPlaceholder || 'Masukkan ulang kata sandi Anda'}
                                className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-zinc-50/70 dark:bg-zinc-900/80 border ${
                                    errors.password_confirmation ? 'border-rose-400 dark:border-rose-600' : 'border-zinc-200 dark:border-zinc-800'
                                } text-slate-900 dark:text-white text-xs sm:text-sm placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-[#0AB600] dark:focus:border-[#0AB600] transition-colors`}
                            />
                        </div>
                        {errors.password_confirmation && (
                            <p className="text-xs text-rose-600 dark:text-rose-400 mt-1.5 font-medium flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                <span>{errors.password_confirmation}</span>
                            </p>
                        )}
                    </div>

                    {/* Agree to Terms Checkbox */}
                    <div className="pt-1">
                        <label className="flex items-start gap-2.5 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                required
                                checked={data.agree}
                                onChange={(e) => setData('agree', e.target.checked)}
                                className="w-4 h-4 mt-0.5 rounded border-zinc-300 dark:border-zinc-700 text-[#0AB600] focus:ring-0 accent-[#0AB600] dark:accent-[#0AB600] cursor-pointer shrink-0"
                            />
                            <span className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                Saya menyetujui{' '}
                                <Link href="/privacy" className="text-[#0AB600] font-semibold hover:underline">
                                    Kebijakan Privasi
                                </Link>{' '}
                                dan{' '}
                                <Link href="/terms" className="text-[#0AB600] font-semibold hover:underline">
                                    Ketentuan Layanan
                                </Link>
                            </span>
                        </label>
                        {errors.agree && (
                            <p className="text-xs text-rose-600 dark:text-rose-400 mt-1.5 font-medium flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                <span>{errors.agree}</span>
                            </p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-[#0AB600] hover:bg-[#089600] disabled:opacity-70 text-white text-xs sm:text-sm font-semibold border border-[#0AB600] transition-all duration-200 cursor-pointer mt-2"
                    >
                        <UserCheck className="w-4 h-4" />
                        <span>{processing ? 'Mendaftarkan Akun...' : 'Daftar Akun'}</span>
                    </button>
                </form>

                {/* Back to Login Footer Link */}
                <div className="mt-6 pt-5 border-t border-zinc-200/80 dark:border-zinc-800 text-center">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Sudah memiliki akun terdaftar?{' '}
                        <Link
                            href="/login"
                            className="font-bold text-[#0AB600] hover:underline inline-flex items-center gap-0.5"
                        >
                            <span>Masuk Sekarang</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </p>
                </div>
            </motion.div>
        </AuthLayout>
    );
}

export default function Register() {
    return (
        <AppProvider>
            <RegisterFormContent />
        </AppProvider>
    );
}
