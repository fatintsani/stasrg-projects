import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
    Sun, 
    Moon, 
    LayoutDashboard, 
    LogIn, 
    LifeBuoy, 
    Menu, 
    X, 
    Bot, 
    FolderKanban, 
    Sparkles,
    ChevronRight,
    Home,
    Compass,
    Layers,
    Workflow
} from 'lucide-react';
import { useApp } from '../Context/AppContext';

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
                <clipPath id="uk-clip-nav"><path d="M0,0 v30 h60 v-30 z"/></clipPath>
                <clipPath id="uk-diag-nav"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath>
                <g clipPath="url(#uk-clip-nav)">
                    <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
                    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
                    <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#uk-diag-nav)" stroke="#C8102E" strokeWidth="4"/>
                    <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
                    <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
                </g>
            </svg>
        </span>
    );
}

export default function Navbar() {
    const { theme, toggleTheme, language, toggleLanguage, t } = useApp();
    const { props: pageProps } = usePage() || { props: {} };
    const user = pageProps?.auth?.user;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState(() => {
        if (typeof window !== 'undefined') {
            if (window.location.pathname === '/katalog' || window.location.pathname === '/catalog') return 'katalog';
            if (window.location.pathname === '/support') return 'support';
            if (window.location.pathname === '/nara') return 'nara';
        }
        return 'overview';
    });

    const navItems = [
        { name: t.nav?.overview || 'Overview', href: '/#overview', id: 'overview', icon: Home },
        { name: 'Showcase', href: '/#projects-showcase', id: 'projects-showcase', icon: Layers },
        { name: 'NARA AI', href: '/nara', id: 'nara', icon: Bot, mobileOnly: true },
        { name: t.nav?.about || 'Tentang', href: '/#about', id: 'about', icon: Compass },
        { name: t.nav?.principles || 'Prinsip', href: '/#principles', id: 'principles', icon: Layers },
        { name: t.nav?.howItWorks || 'Cara Kerja', href: '/#how-it-works', id: 'how-it-works', icon: Workflow },
        { name: t.nav?.support || 'Bantuan', href: '/support', id: 'support', icon: LifeBuoy },
    ];

    const desktopNavItems = navItems.filter((item) => !item.mobileOnly);

    const handleNavClick = (e, item) => {
        setIsMobileMenuOpen(false);

        if (item.id === 'katalog' || item.href === '/katalog') {
            if (typeof window !== 'undefined' && (window.location.pathname === '/katalog' || window.location.pathname === '/catalog')) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setActiveSection('katalog');
            }
            return;
        }

        if (item.id === 'support' || item.href === '/support') {
            if (typeof window !== 'undefined' && window.location.pathname === '/support') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setActiveSection('support');
            }
            return;
        }

        if (item.id === 'nara' || item.href === '/nara') {
            if (typeof window !== 'undefined' && window.location.pathname === '/nara') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setActiveSection('nara');
            }
            return;
        }

        const targetId = item.id;
        const element = document.getElementById(targetId);
        if (element) {
            e.preventDefault();
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setActiveSection(targetId);
            window.history.pushState(null, '', `#${targetId}`);
        } else {
            window.location.href = `/#${targetId}`;
        }
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            if (window.location.pathname === '/katalog' || window.location.pathname === '/catalog') {
                setActiveSection('katalog');
                return;
            }
            if (window.location.pathname === '/support') {
                setActiveSection('support');
                return;
            }
            if (window.location.pathname === '/nara') {
                setActiveSection('nara');
                return;
            }
        }

        const handleScroll = () => {
            const sectionIds = ['overview', 'projects-showcase', 'about', 'principles', 'how-it-works'];
            const scrollPosition = window.scrollY + 100;

            for (let i = sectionIds.length - 1; i >= 0; i--) {
                const section = document.getElementById(sectionIds[i]);
                if (section) {
                    const top = section.offsetTop;
                    if (scrollPosition >= top) {
                        setActiveSection(sectionIds[i]);
                        break;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on resize to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsMobileMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <header className="sticky top-0 z-50 w-full bg-white/85 dark:bg-[#090D16]/85 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
                
                {/* Left: Brand Logo & Title */}
                <a 
                    href="/#overview" 
                    onClick={(e) => handleNavClick(e, { id: 'overview' })}
                    className="flex items-center gap-2.5 group shrink-0"
                >
                    <img 
                        src="/assets/img/stas.png" 
                        alt="STAS RG Logo" 
                        className="h-8 w-auto object-contain transition-transform group-hover:scale-105" 
                        onError={(e) => {
                            e.currentTarget.src = '/assets/img/STAS RG.png';
                        }}
                    />
                    <span className="text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
                        <span className="font-extrabold">STAS RG</span>{' '}
                        <span className="font-normal text-zinc-500 dark:text-zinc-400">Projects</span>
                    </span>
                </a>

                {/* Center: Desktop Navigation Menu (Excludes mobileOnly items like NARA AI) */}
                <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-zinc-100/70 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60">
                    {desktopNavItems.map((item) => {
                        const isActive = activeSection === item.id;
                        const isStandalonePage = item.href.startsWith('/') && !item.href.startsWith('/#');
                        
                        if (isStandalonePage) {
                            return (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                                        isActive
                                            ? 'bg-white dark:bg-zinc-800 text-[#0AB600] border border-zinc-200/80 dark:border-zinc-700/80 shadow-xs'
                                            : 'text-zinc-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-zinc-800/50'
                                    }`}
                                >
                                    <span>{item.name}</span>
                                </Link>
                            );
                        }

                        return (
                            <a
                                key={item.id}
                                href={item.href || '#'}
                                onClick={(e) => handleNavClick(e, item)}
                                className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                                    isActive
                                        ? 'bg-white dark:bg-zinc-800 text-[#0AB600] border border-zinc-200/80 dark:border-zinc-700/80 shadow-xs'
                                        : 'text-zinc-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-zinc-800/50'
                                }`}
                            >
                                {item.name}
                            </a>
                        );
                    })}
                </nav>

                {/* Right: Controls & Actions */}
                <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
                    {/* Language Toggle Button */}
                    <button
                        type="button"
                        onClick={toggleLanguage}
                        aria-label="Toggle language"
                        title={language === 'id' ? 'Bahasa Indonesia (Klik untuk beralih ke English)' : 'English (Click to switch to Indonesian)'}
                        className="p-1.5 rounded-lg bg-transparent flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                        {language === 'id' ? (
                            <IndonesiaFlag className="w-5 h-3.5" />
                        ) : (
                            <EnglishFlag className="w-5 h-3.5" />
                        )}
                    </button>

                    {/* Dark/Light Mode Toggle Button */}
                    <button
                        type="button"
                        onClick={toggleTheme}
                        aria-label="Toggle theme mode"
                        title={theme === 'dark' ? 'Beralih ke Light Mode' : 'Beralih ke Dark Mode'}
                        className="p-1.5 rounded-lg bg-transparent flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-[#0AB600] dark:hover:text-[#0AB600] hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                        {theme === 'dark' ? (
                            <Sun className="w-4 h-4 text-amber-400" />
                        ) : (
                            <Moon className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                        )}
                    </button>

                    {/* Desktop Auth Action: Dashboard (if logged in) or Login (if guest) */}
                    <div className="hidden md:block">
                        {user ? (
                            <Link
                                href="/dashboard"
                                className="inline-flex items-center gap-1.5 bg-[#0AB600] hover:bg-[#089600] text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-full border border-[#0AB600] transition-all duration-150 cursor-pointer shadow-xs shadow-black/20"
                            >
                                <LayoutDashboard className="w-3.5 h-3.5" />
                                <span>Dashboard</span>
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-1.5 bg-[#0AB600] hover:bg-[#089600] text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-full border border-[#0AB600] transition-all duration-150 cursor-pointer shadow-xs shadow-black/20"
                            >
                                <LogIn className="w-3.5 h-3.5" />
                                <span>{t.nav?.login || 'Login'}</span>
                            </Link>
                        )}
                    </div>

                    {/* Mobile Hamburger Toggle Button */}
                    <button
                        type="button"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Buka Menu Navigasi"
                        aria-expanded={isMobileMenuOpen}
                        className="md:hidden p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 hover:text-[#0AB600] dark:hover:text-[#0AB600] transition-colors cursor-pointer"
                    >
                        {isMobileMenuOpen ? (
                            <X className="w-5 h-5 text-slate-800 dark:text-zinc-200" />
                        ) : (
                            <Menu className="w-5 h-5 text-slate-800 dark:text-zinc-200" />
                        )}
                    </button>
                </div>

            </div>

            {/* Mobile Navigation Drawer / Dropdown */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-b border-zinc-200/90 dark:border-zinc-800/90 bg-white/95 dark:bg-[#090D16]/95 backdrop-blur-xl shadow-2xl animate-in slide-in-from-top-2 duration-200">
                    <div className="max-w-6xl mx-auto px-4 py-4 space-y-3">
                        {/* Navigation Links Grid */}
                        <div className="grid grid-cols-1 gap-1">
                            {navItems.map((item) => {
                                const isActive = activeSection === item.id;
                                const isStandalonePage = item.href.startsWith('/') && !item.href.startsWith('/#');
                                const IconComponent = item.icon || Compass;

                                if (isStandalonePage) {
                                    return (
                                        <Link
                                            key={item.id}
                                            href={item.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all ${
                                                isActive
                                                    ? 'bg-[#0AB600]/10 text-[#0AB600] border border-[#0AB600]/30 font-bold'
                                                    : 'text-slate-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/70'
                                            }`}
                                        >
                                            <span className="flex items-center gap-2.5">
                                                <span className={`p-1.5 rounded-lg ${isActive ? 'bg-[#0AB600] text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
                                                    <IconComponent className="w-3.5 h-3.5" />
                                                </span>
                                                <span>{item.name}</span>
                                            </span>
                                            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                                        </Link>
                                    );
                                }

                                return (
                                    <a
                                        key={item.id}
                                        href={item.href || '#'}
                                        onClick={(e) => handleNavClick(e, item)}
                                        className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all ${
                                            isActive
                                                ? 'bg-[#0AB600]/10 text-[#0AB600] border border-[#0AB600]/30 font-bold'
                                                : 'text-slate-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/70'
                                        }`}
                                    >
                                        <span className="flex items-center gap-2.5">
                                            <span className={`p-1.5 rounded-lg ${isActive ? 'bg-[#0AB600] text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
                                                <IconComponent className="w-3.5 h-3.5" />
                                            </span>
                                            <span>{item.name}</span>
                                        </span>
                                        <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                                    </a>
                                );
                            })}
                        </div>

                        {/* Mobile Auth Button (Dashboard or Login) */}
                        <div className="pt-2 border-t border-zinc-200/70 dark:border-zinc-800/70">
                            {user ? (
                                <Link
                                    href="/dashboard"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#0AB600] hover:bg-[#089600] text-white text-xs font-bold shadow-md shadow-[#0AB600]/20 transition-all cursor-pointer"
                                >
                                    <LayoutDashboard className="w-4 h-4" />
                                    <span>Buka Dashboard ({user.name || 'Admin'})</span>
                                </Link>
                            ) : (
                                <Link
                                    href="/login"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#0AB600] hover:bg-[#089600] text-white text-xs font-bold shadow-md shadow-[#0AB600]/20 transition-all cursor-pointer"
                                >
                                    <LogIn className="w-4 h-4" />
                                    <span>{t.nav?.login || 'Login ke Platform'}</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
