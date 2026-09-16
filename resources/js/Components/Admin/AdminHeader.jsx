import React, { useState, useRef, useEffect } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import {
    Menu,
    PanelLeft,
    Search,
    Sun,
    Moon,
    LogOut,
    User,
    Shield,
    Settings,
    ExternalLink,
    ChevronDown,
} from 'lucide-react';
import { useApp } from '../../Context/AppContext';
import { useAlert } from '../../Context/AlertContext';
import GlobalSearchModal from './GlobalSearchModal';
import AdminNotificationDropdown from './AdminNotificationDropdown';

function IndonesiaFlag({ className = "w-5 h-3.5" }) {
    return (
        <span className={`inline-flex items-center justify-center overflow-hidden rounded-[2px] border border-zinc-300 dark:border-zinc-700 shrink-0 ${className}`}>
            <svg viewBox="0 0 600 400" className="w-full h-full block">
                <rect width="600" height="200" fill="#E11D48" />
                <rect y="200" width="600" height="200" fill="#FFFFFF" />
            </svg>
        </span>
    );
}

function EnglishFlag({ className = "w-5 h-3.5" }) {
    return (
        <span className={`inline-flex items-center justify-center overflow-hidden rounded-[2px] border border-zinc-300 dark:border-zinc-700 shrink-0 ${className}`}>
            <svg viewBox="0 0 60 30" className="w-full h-full block">
                <clipPath id="uk-clip-admin"><path d="M0,0 v30 h60 v-30 z"/></clipPath>
                <clipPath id="uk-diag-admin"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath>
                <g clipPath="url(#uk-clip-admin)">
                    <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
                    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
                    <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#uk-diag-admin)" stroke="#C8102E" strokeWidth="4"/>
                    <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
                    <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
                </g>
            </svg>
        </span>
    );
}

export default function AdminHeader({
    onToggleSidebar,
    isSidebarCollapsed = false,
}) {
    const { theme, toggleTheme, language, toggleLanguage, t } = useApp();
    const { showConfirm } = useAlert();
    const { props } = usePage();
    const user = props.auth?.user || { name: 'Admin', email: 'admin@stasrg.com' };

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Global shortcut Cmd+K / Ctrl+K and /
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setIsSearchOpen((prev) => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        setIsDropdownOpen(false);
        const confirmed = await showConfirm({
            title: 'Konfirmasi Keluar',
            message: 'Apakah Anda yakin ingin mengakhiri sesi Admin STAS RG Projects?',
            confirmText: 'Keluar Akun',
            cancelText: 'Batal',
            variant: 'danger',
        });
        if (confirmed) {
            router.post('/logout');
        }
    };

    return (
        <header className="sticky top-0 z-20 h-16 bg-white/80 dark:bg-[#090D16]/80 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors">
            <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
                {/* Left: Mobile/Desktop Toggle & Global Search Bar */}
                <div className="flex items-center gap-3 flex-1 max-w-lg">
                    {/* Sidebar Trigger (Mobile & Desktop) */}
                    <button
                        type="button"
                        onClick={onToggleSidebar}
                        className="p-2 rounded-xl text-zinc-500 hover:text-slate-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
                        title={isSidebarCollapsed ? 'Perluas Sidebar' : 'Perkecil Sidebar'}
                        data-tooltip-pos="bottom"
                        aria-label="Toggle sidebar"
                    >
                        <PanelLeft className="w-5 h-5 hidden md:block" />
                        <Menu className="w-5 h-5 md:hidden" />
                    </button>

                    {/* Global Search Interactive Trigger */}
                    <div className="relative w-full hidden sm:block">
                        <button
                            type="button"
                            onClick={() => setIsSearchOpen(true)}
                            className="w-full flex items-center justify-between pl-3.5 pr-3 py-2 rounded-full bg-zinc-100/90 dark:bg-zinc-900/90 hover:bg-zinc-200/70 dark:hover:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-800/80 text-xs text-left transition-all cursor-pointer group shadow-2xs"
                        >
                            <div className="flex items-center gap-2.5 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
                                <Search className="w-4 h-4 text-zinc-400 group-hover:text-[#0AB600] dark:group-hover:text-[#0AB600] transition-colors" />
                                <span className="truncate">
                                    {t.admin?.header?.searchPlaceholder || 'Cari proyek, deliverable, atau template dokumen...'}
                                </span>
                            </div>
                            <kbd className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 px-1.5 py-0.5 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-2xs">
                                ⌘K
                            </kbd>
                        </button>
                    </div>

                    {/* Mobile Search Icon Button */}
                    <button
                        type="button"
                        onClick={() => setIsSearchOpen(true)}
                        className="p-2 rounded-xl text-zinc-500 hover:text-slate-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors sm:hidden cursor-pointer"
                        title="Cari Proyek & Navigasi"
                        data-tooltip-pos="bottom"
                        data-tooltip-shortcut="Ctrl+K"
                    >
                        <Search className="w-5 h-5" />
                    </button>
                </div>

                {/* Right: Controls & Profile */}
                <div className="flex items-center gap-2 sm:gap-2.5">
                    {/* Language Toggle */}
                    <button
                        type="button"
                        onClick={toggleLanguage}
                        aria-label="Toggle language"
                        title={language === 'id' ? 'Bahasa Indonesia (Klik untuk Switch ke English)' : 'English (Click to switch to Indonesian)'}
                        data-tooltip-pos="bottom"
                        className="p-2 rounded-xl bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                        {language === 'id' ? <IndonesiaFlag className="w-5 h-3.5" /> : <EnglishFlag className="w-5 h-3.5" />}
                    </button>

                    {/* Theme Toggle */}
                    <button
                        type="button"
                        onClick={toggleTheme}
                        aria-label="Toggle theme mode"
                        title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
                        data-tooltip-pos="bottom"
                        className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                        {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
                    </button>

                    {/* Admin Notifications Dropdown */}
                    <AdminNotificationDropdown />

                    {/* User Profile Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            type="button"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-2 p-1.5 pr-2.5 rounded-full bg-zinc-100/80 dark:bg-zinc-900/80 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-800 transition-all cursor-pointer"
                        >
                            {user?.avatar_url || user?.avatar ? (
                                <img
                                    src={user.avatar_url || (user.avatar?.startsWith('http') ? user.avatar : `/storage/${user.avatar}`)}
                                    alt={user.name || 'User'}
                                    className="w-7 h-7 rounded-full object-cover border border-[#0AB600]/30"
                                />
                            ) : (
                                <div className="w-7 h-7 rounded-full bg-[#0AB600]/10 border border-[#0AB600]/30 flex items-center justify-center text-[#0AB600] font-bold text-xs">
                                    {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
                                </div>
                            )}
                            <span className="hidden sm:inline text-xs font-semibold text-slate-800 dark:text-zinc-200 max-w-[90px] truncate">
                                {user.name}
                            </span>
                            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                        </button>

                        {/* Dropdown Menu Card */}
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#18181B] border border-zinc-200 dark:border-zinc-800 p-2 text-slate-900 dark:text-white z-50 animate-in fade-in zoom-in-95 duration-100 shadow-xl shadow-slate-900/10 dark:shadow-black/40">
                                <div className="px-3 py-2 border-b border-zinc-200/80 dark:border-zinc-800 mb-1">
                                    <div className="flex items-center gap-2.5 mb-1.5">
                                        {user?.avatar_url || user?.avatar ? (
                                            <img
                                                src={user.avatar_url || (user.avatar?.startsWith('http') ? user.avatar : `/storage/${user.avatar}`)}
                                                alt={user.name || 'User'}
                                                className="w-8 h-8 rounded-full object-cover border border-[#0AB600]/30 shrink-0"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-[#0AB600]/10 border border-[#0AB600]/30 text-[#0AB600] font-bold text-xs flex items-center justify-center shrink-0">
                                                {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
                                            </div>
                                        )}
                                        <div className="overflow-hidden">
                                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                                {user.name}
                                            </p>
                                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                                                {user.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#0AB600]/10 border border-[#0AB600]/30 text-[10px] font-semibold text-[#0AB600]">
                                        <Shield className="w-3 h-3 text-[#0AB600]" />
                                        <span>{t.admin?.header?.roleBadge || 'Administrator'}</span>
                                    </div>
                                </div>

                                <Link
                                    href="/settings"
                                    onClick={() => setIsDropdownOpen(false)}
                                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                >
                                    <Settings className="w-4 h-4 text-zinc-400" />
                                    <span>{t.admin?.sidebar?.settings || 'Pengaturan & Keamanan'}</span>
                                </Link>

                                <Link
                                    href="/"
                                    onClick={() => setIsDropdownOpen(false)}
                                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                >
                                    <ExternalLink className="w-4 h-4 text-zinc-400" />
                                    <span>{t.admin?.header?.viewLanding || 'Halaman Utama'}</span>
                                </Link>

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer mt-1"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>{t.admin?.header?.logout || 'Keluar Akun'}</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Global Spotlight Search Command Palette */}
            <GlobalSearchModal
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
            />
        </header>
    );
}
