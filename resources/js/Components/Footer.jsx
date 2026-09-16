import React from 'react';
import { Link } from '@inertiajs/react';
import { 
    MapPin, 
    Mail, 
    Phone, 
    Globe, 
    ExternalLink, 
    ShieldCheck, 
    Compass,
    Building2
} from 'lucide-react';
import { useApp } from '../Context/AppContext';

function GithubIcon({ className = "w-4 h-4" }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
        </svg>
    );
}

function LinkedinIcon({ className = "w-4 h-4" }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
            <rect x="2" y="9" width="4" height="12" />
            <circle cx="4" r="2" />
        </svg>
    );
}

function InstagramIcon({ className = "w-4 h-4" }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
    );
}

export default function Footer() {
    const { t, language, openSupportModal } = useApp();

    const socialLinks = [
        {
            name: 'GitHub',
            icon: GithubIcon,
            href: 'https://github.com',
        },
        {
            name: 'LinkedIn',
            icon: LinkedinIcon,
            href: 'https://linkedin.com',
        },
        {
            name: 'Instagram',
            icon: InstagramIcon,
            href: 'https://instagram.com',
        },
        {
            name: 'Telkom University',
            icon: Globe,
            href: 'https://telkomuniversity.ac.id',
        },
        {
            name: 'Email Lab',
            icon: Mail,
            href: 'mailto:stas.research@telkomuniversity.ac.id',
        },
    ];

    const simpleNavLinks = [
        { name: t.nav.overview, href: '/#overview' },
        { name: language === 'en' ? 'Research Catalog' : 'Katalog Riset', href: '/katalog' },
        { name: 'NARA AI', href: '/nara' },
        { name: t.nav.about, href: '/#about' },
        { name: t.nav.principles, href: '/#principles' },
        { name: t.nav.howItWorks, href: '/#how-it-works' },
        { name: t.nav?.support || 'Bantuan', href: '/support' },
        { name: t.nav.login, href: '/login' },
    ];

    return (
        <footer className="w-full bg-white dark:bg-[#090D16] border-t border-zinc-200/60 dark:border-zinc-800/60 text-zinc-600 dark:text-zinc-400 transition-colors">
            {/* Main Footer Container */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-14 pb-3 sm:pb-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 sm:gap-10 lg:gap-12">
                    
                    {/* Column 1: Brand & Socials (Span 5) */}
                    <div className="lg:col-span-5 space-y-3 sm:space-y-4">
                        {/* Dual Institution Logos */}
                        <div className="flex items-center gap-2.5 sm:gap-3">
                            <img 
                                src="/assets/img/stas.png" 
                                alt="STAS RG Logo" 
                                className="h-7 sm:h-9 w-auto object-contain" 
                                onError={(e) => {
                                    e.currentTarget.src = '/assets/img/STAS RG.png';
                                }}
                            />
                            <div className="h-5 sm:h-6 w-px bg-zinc-200 dark:bg-zinc-700" />
                            <img 
                                src="/assets/img/telu.png" 
                                alt="Telkom University Logo" 
                                className="h-7 sm:h-9 w-auto object-contain dark:brightness-0 dark:invert" 
                            />
                        </div>

                        {/* Brand Name & Identifier */}
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
                                    <span className="font-extrabold">STAS RG</span>{' '}
                                    <span className="font-normal text-zinc-500 dark:text-zinc-400">Projects</span>
                                </span>
                            </div>
                            <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
                                {t.footer.institution}
                            </p>
                        </div>

                        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-sm">
                            {t.footer.desc}
                        </p>

                        {/* Social Media & Contact Links */}
                        <div className="pt-0.5 sm:pt-2">
                            <span className="block text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5 sm:mb-3">
                                {t.footer.connect}
                            </span>
                            <div className="flex items-center gap-2 flex-wrap">
                                {socialLinks.map((item, index) => {
                                    const Icon = item.icon;
                                    return (
                                        <a
                                            key={index}
                                            href={item.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label={item.name}
                                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-[#0AB600] dark:hover:text-[#0AB600] hover:border-[#0AB600]/40 dark:hover:border-[#0AB600]/40 hover:bg-[#0AB600]/10 dark:hover:bg-[#0AB600]/15 transition-all shadow-2xs"
                                        >
                                            <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Navigation (Span 3) */}
                    <div className="lg:col-span-3 space-y-2.5 sm:space-y-4">
                        <div className="flex items-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                            <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0AB600]" />
                            <span>{t.footer.navTitle}</span>
                        </div>
                        <ul className="grid grid-cols-2 sm:grid-cols-1 gap-x-4 gap-y-1.5 sm:space-y-2.5 text-xs sm:text-sm">
                            {simpleNavLinks.map((link, idx) => (
                                <li key={idx}>
                                    {link.href.startsWith('/') && !link.href.startsWith('/#') ? (
                                        <Link
                                            href={link.href}
                                            className="text-zinc-600 dark:text-zinc-400 hover:text-[#0AB600] dark:hover:text-[#0AB600] transition-colors flex items-center gap-1.5 font-medium"
                                        >
                                            <span className="text-zinc-400 dark:text-zinc-600 text-xs">›</span>
                                            <span>{link.name}</span>
                                        </Link>
                                    ) : (
                                        <a
                                            href={link.href}
                                            className="text-zinc-600 dark:text-zinc-400 hover:text-[#0AB600] dark:hover:text-[#0AB600] transition-colors flex items-center gap-1.5 font-medium"
                                        >
                                            <span className="text-zinc-400 dark:text-zinc-600 text-xs">›</span>
                                            <span>{link.name}</span>
                                        </a>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 3: Lab Location & Contact (Span 4) */}
                    <div className="lg:col-span-4 space-y-2.5 sm:space-y-4">
                        <div className="flex items-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                            <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0AB600]" />
                            <span>{t.footer.locationTitle}</span>
                        </div>

                        {/* Location Details Card */}
                        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-zinc-50/70 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800/80 space-y-2 sm:space-y-3">
                            <div className="flex items-start gap-2.5 sm:gap-3">
                                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0AB600] shrink-0 mt-0.5" />
                                <div className="space-y-0.5">
                                    <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                        {t.footer.labName}
                                    </div>
                                    <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 leading-snug">
                                        {t.footer.faculty}
                                    </p>
                                    <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 leading-snug">
                                        {t.footer.address}
                                    </p>
                                </div>
                            </div>

                            {/* Google Maps External Button */}
                            <a
                                href="https://maps.google.com/?q=Telkom+University+Bandung"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-between px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl bg-white dark:bg-zinc-800 hover:bg-[#0AB600]/10 dark:hover:bg-[#0AB600]/15 text-[11px] sm:text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-[#0AB600] dark:hover:text-[#0AB600] border border-zinc-200 dark:border-zinc-700 hover:border-[#0AB600]/40 dark:hover:border-[#0AB600]/40 transition-colors"
                            >
                                <span className="flex items-center gap-1.5">
                                    <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#0AB600]" />
                                    <span>{t.footer.openMaps}</span>
                                </span>
                                <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-zinc-400 dark:text-zinc-500" />
                            </a>
                        </div>

                        {/* Quick Contact Rows */}
                        <div className="space-y-1 pt-0.5 text-xs">
                            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0AB600] shrink-0" />
                                <span className="font-mono text-[11px] sm:text-xs truncate">stas.research@telkomuniversity.ac.id</span>
                            </div>
                            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                                <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0AB600] shrink-0" />
                                <span className="font-mono text-[11px] sm:text-xs">+62 22 7566456</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Bottom Bar: Copyright & Security Badges (Row 1) */}
                <div className="mt-4 sm:mt-12 pt-2.5 sm:pt-6 border-t border-zinc-200/60 dark:border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">
                    <div className="text-center sm:text-left">
                        <span>{t.footer.copyright}</span>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3.5 flex-wrap text-[11px] sm:text-xs justify-center sm:justify-end">
                        <span className="inline-flex items-center gap-1 text-[#0AB600] bg-[#0AB600]/10 dark:bg-[#0AB600]/20 border border-[#0AB600]/30 px-2 py-0.5 rounded-full font-medium">
                            <ShieldCheck className="w-3 h-3 text-[#0AB600]" />
                            <span>{t.footer.sso}</span>
                        </span>
                        <span className="text-zinc-300 dark:text-zinc-700">•</span>
                        <Link href="/privacy" className="hover:text-[#0AB600] dark:hover:text-[#0AB600] transition-colors">
                            {t.footer.privacy}
                        </Link>
                        <span className="text-zinc-300 dark:text-zinc-700">•</span>
                        <Link href="/terms" className="hover:text-[#0AB600] dark:hover:text-[#0AB600] transition-colors">
                            {t.footer.terms}
                        </Link>
                    </div>
                </div>

                {/* Bottom Attribution: Developed By (Row 2 - Paling Bawah) */}
                <div className="mt-1.5 sm:mt-3 pt-1.5 sm:pt-3 border-t border-zinc-100 dark:border-zinc-800/40 text-center text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400">
                    <span>{t.footer?.developedBy || 'Developed by'} </span>
                    <Link href="/team" className="font-bold text-[#0AB600] dark:text-[#0AB600] hover:text-[#089600] dark:hover:text-[#089600] hover:underline transition-colors">
                        {t.footer?.teamTitle || 'Tim Pengembang CoE STAS-RG'}
                    </Link>
                </div>
            </div>
        </footer>
    );
}
