import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { AppProvider, useApp } from '../Context/AppContext';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import {
    Users,
    Code2,
    Cpu,
    Sparkles,
    GraduationCap,
    ExternalLink,
    Mail,
    Globe,
    Building2,
    Shield,
    ShieldCheck,
    Heart,
    Zap,
    Layers,
    FileText,
    Terminal,
    Award,
    Workflow,
    BookOpen,
    CheckCircle2,
    Bot,
    BarChart3
} from 'lucide-react';

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
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
    );
}

function TeamContent() {
    const { t, language } = useApp();
    const isId = language === 'id';

    const techStack = [
        { name: 'Laravel 12.x', desc: 'Enterprise Backend & Security Core', color: 'border-red-500/30 bg-red-500/10 text-red-600' },
        { name: 'React 19.x', desc: 'Interactive Canvas & State UI', color: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-600' },
        { name: 'Inertia.js v3', desc: 'Seamless Modern Monolith SPA Bridge', color: 'border-purple-500/30 bg-purple-500/10 text-purple-600' },
        { name: 'Tailwind CSS v4', desc: 'Modern High-Performance Utility Styling', color: 'border-teal-500/30 bg-teal-500/10 text-teal-600' },
        { name: 'Google Gemini AI', desc: 'Generative Intelligence & Academic Relay', color: 'border-blue-500/30 bg-blue-500/10 text-blue-600' },
        { name: 'W3C WebAuthn', desc: 'Passwordless Biometric Passkeys', color: 'border-amber-500/30 bg-amber-500/10 text-amber-600' },
    ];

    return (
        <>
            <Head title="Tim Pengembang & Peneliti — STAS RG Projects CoE STAS-RG">
                <meta name="description" content="Mengenal tim perancang, pengembang perangkat lunak, dan peneliti di balik platform STAS RG Projects Center of Excellence STAS-RG Telkom University." />
            </Head>

            <div className="min-h-screen flex flex-col bg-[#FAFBFD] dark:bg-[#070D18] text-slate-900 dark:text-slate-100 selection:bg-[#0AB600]/20 selection:text-[#0AB600] font-sans antialiased transition-colors">
                <Navbar />

                <main className="flex-grow py-12 sm:py-20 relative overflow-hidden">
                    {/* Ambient Background Glow Effect (Subtle SaaS light) */}
                    <div className="ambient-glow" style={{ filter: 'blur(64px)', WebkitFilter: 'blur(64px)' }} />

                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

                        {/* ═══════ HERO SECTION ═══════ */}
                        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20 space-y-4">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold tracking-wider uppercase bg-[#0AB600]/10 text-[#0AB600] border border-[#0AB600]/30 shadow-xs">
                                <Users className="w-4 h-4 text-[#0AB600]" />
                                <span>{isId ? 'TIM PENGEMBANG & RISET' : 'DEVELOPMENT & RESEARCH TEAM'}</span>
                            </div>

                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                {isId ? 'Di Balik Layar STAS RG Projects' : 'Behind STAS RG Projects'}
                            </h1>

                            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
                                {isId 
                                    ? 'Platform STAS RG Projects dirancang dan dikembangkan secara berkesinambungan untuk memajukan standardisasi publikasi, otomasi penyusunan luaran riset, dan digitalisasi portofolio inovasi CoE STAS-RG Telkom University.'
                                    : 'STAS RG Projects is designed and developed to advance publication standardization, research deliverables automation, and innovation digitization for CoE STAS-RG Telkom University.'}
                            </p>
                        </div>

                        {/* ═══════ LEAD DEVELOPER SPOTLIGHT ═══════ */}
                        <div className="mb-16">
                            <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 shadow-xs relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-80 h-80 bg-[#0AB600]/5 dark:bg-[#0AB600]/10 rounded-full blur-3xl pointer-events-none -z-0" style={{ filter: 'blur(64px)', WebkitFilter: 'blur(64px)' }} />

                                <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-12">
                                    {/* Avatar / Photo */}
                                    <div className="flex flex-col items-center shrink-0">
                                        <div className="relative w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 flex items-center justify-center">
                                            <img
                                                src="/assets/img/icon/profile_dev.png"
                                                alt="Fatin Muflihuts Tsani"
                                                className="w-full h-full object-contain"
                                                onError={(e) => {
                                                    e.currentTarget.src = 'https://github.com/fatintsani.png';
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 text-center lg:text-left space-y-4">
                                        <div>
                                            <span className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-400">
                                                Software Architect & Full-Stack Engineer
                                            </span>
                                            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                                                Fatin Muflihuts Tsani
                                            </h2>
                                            <p className="text-xs sm:text-sm text-[#0D5A34] dark:text-emerald-400 font-medium mt-0.5">
                                                Center of Excellence Sustainable Technology and Applied Sciences (CoE STAS-RG)
                                            </p>
                                        </div>

                                        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
                                            {isId
                                                ? 'Merancang dan mengimplementasikan seluruh arsitektur sistem STAS RG Projects — mulai dari engine layout presisi Flyer A4 & Brosur Lipat Tiga 3-panel, direktori master peneliti & HKI paten, sistem antrean email dua arah helpdesk, integrasi kecerdasan buatan Google Gemini & OpenAI bilingual, WebAuthn Passkeys biometrik, analitik interaksi QR expo, hingga pengerasan keamanan SVG XSS dan optimasi performa enterprise.'
                                                : 'Architected and developed the complete STAS RG Projects ecosystem — encompassing precision A4 Flyer & 3-panel Trifold Brochure layout engines, master researcher & patent HKI registry, asynchronous 2-way email ticketing helpdesk, Google Gemini & OpenAI bilingual AI relay, WebAuthn biometric passkeys, real-time QR expo analytics, deep SVG XSS sanitization, and enterprise database scaling.'}
                                        </p>

                                        {/* Key Contributions Pills */}
                                        <div className="flex flex-wrap gap-2 pt-1 justify-center lg:justify-start">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60 text-xs font-medium text-zinc-700 dark:text-zinc-300 shadow-2xs">
                                                <Zap className="w-3.5 h-3.5 text-[#0AB600] shrink-0" />
                                                <span>Laravel 12 & React 19 SPA Architecture</span>
                                            </span>
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60 text-xs font-medium text-zinc-700 dark:text-zinc-300 shadow-2xs">
                                                <FileText className="w-3.5 h-3.5 text-[#0AB600] shrink-0" />
                                                <span>3-Panel Trifold & A4 Document Engine</span>
                                            </span>
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60 text-xs font-medium text-zinc-700 dark:text-zinc-300 shadow-2xs">
                                                <Users className="w-3.5 h-3.5 text-[#0AB600] shrink-0" />
                                                <span>Master Peneliti & Registrasi Paten HKI</span>
                                            </span>
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60 text-xs font-medium text-zinc-700 dark:text-zinc-300 shadow-2xs">
                                                <Bot className="w-3.5 h-3.5 text-[#0AB600] shrink-0" />
                                                <span>Bilingual AI Drafting Relay (Gemini / OpenAI)</span>
                                            </span>
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60 text-xs font-medium text-zinc-700 dark:text-zinc-300 shadow-2xs">
                                                <Mail className="w-3.5 h-3.5 text-[#0AB600] shrink-0" />
                                                <span>Helpdesk Email 2-Arah & Antrean Asinkron</span>
                                            </span>
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60 text-xs font-medium text-zinc-700 dark:text-zinc-300 shadow-2xs">
                                                <BarChart3 className="w-3.5 h-3.5 text-[#0AB600] shrink-0" />
                                                <span>Analitik Interaksi QR Code Stand Expo</span>
                                            </span>
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60 text-xs font-medium text-zinc-700 dark:text-zinc-300 shadow-2xs">
                                                <ShieldCheck className="w-3.5 h-3.5 text-[#0AB600] shrink-0" />
                                                <span>Enterprise Security, SoftDeletes & SVG Sanitizer</span>
                                            </span>
                                        </div>

                                        {/* Social Contact Links */}
                                        <div className="pt-2 flex items-center justify-center lg:justify-start gap-3 flex-wrap">
                                            <a
                                                href="https://github.com/fatintsani"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-[#0AB600]/10 dark:hover:bg-[#0AB600]/20 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-[#0AB600] dark:hover:text-[#0AB600] border border-zinc-200 dark:border-zinc-700 transition-colors"
                                            >
                                                <GithubIcon className="w-4 h-4" />
                                                <span>GitHub Profile</span>
                                            </a>
                                            <a
                                                href="https://linkedin.com/in/fatintsani"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-[#0AB600]/10 dark:hover:bg-[#0AB600]/20 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-[#0AB600] dark:hover:text-[#0AB600] border border-zinc-200 dark:border-zinc-700 transition-colors"
                                            >
                                                <LinkedinIcon className="w-4 h-4" />
                                                <span>LinkedIn</span>
                                            </a>
                                            <a
                                                href="https://instagram.com/fatintsani"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-[#0AB600]/10 dark:hover:bg-[#0AB600]/20 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-[#0AB600] dark:hover:text-[#0AB600] border border-zinc-200 dark:border-zinc-700 transition-colors"
                                            >
                                                <InstagramIcon className="w-4 h-4 text-black dark:text-white" />
                                                <span>Instagram</span>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ═══════ RESEARCH GROUP & INSTITUTION ═══════ */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                            {/* Card 1: CoE STAS-RG */}
                            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
                                <div className="w-12 h-12 rounded-2xl bg-[#0AB600]/10 border border-[#0AB600]/30 flex items-center justify-center">
                                    <Building2 className="w-6 h-6 text-[#0AB600]" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                        Center of Excellence STAS-RG
                                    </h3>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                        Sustainable Technology and Applied Sciences Research Group
                                    </p>
                                </div>
                                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    {isId
                                        ? 'Kelompok riset unggulan di Telkom University yang berfokus pada pengembangan teknologi terapan berkelanjutan, IoT pintar, sistem otomasi industri, AI terapan, dan keamanan siber.'
                                        : 'A flagship research center at Telkom University focusing on sustainable applied technologies, smart IoT, industrial automation systems, applied AI, and cyber security.'}
                                </p>
                                <div className="pt-2">
                                    <a
                                        href="https://telkomuniversity.ac.id"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0AB600] hover:underline"
                                    >
                                        <span>Kunjungi Portal Telkom University</span>
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                </div>
                            </div>

                            {/* Card 2: Mission & Purpose */}
                            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
                                <div className="w-12 h-12 rounded-2xl bg-[#0AB600]/10 border border-[#0AB600]/30 flex items-center justify-center">
                                    <Award className="w-6 h-6 text-[#0AB600]" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                        {isId ? 'Misi & Visi Platform' : 'Platform Mission & Vision'}
                                    </h3>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                        Deliverables & Research Publication Standardization
                                    </p>
                                </div>
                                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    {isId
                                        ? 'Menjembatani hasil inovasi laboratorium dengan kebutuhan industri, pameran internasional, dan pengarsipan akademik melalui otomasi deliverable berkualitas tinggi tanpa pergeseran tata letak.'
                                        : 'Bridging laboratory innovations with industrial needs, global exhibitions, and academic archiving through automated high-quality zero-layout-shift deliverables.'}
                                </p>
                                <div className="pt-2">
                                    <Link
                                        href="/documentation"
                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0AB600] hover:underline"
                                    >
                                        <span>{isId ? 'Pelajari Dokumentasi Teknis' : 'Explore Technical Docs'}</span>
                                        <BookOpen className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* ═══════ TECH STACK TILES ═══════ */}
                        <div className="mb-16">
                            <div className="text-center max-w-xl mx-auto mb-8">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                    {isId ? 'Teknologi Utama yang Digunakan' : 'Core Technologies Used'}
                                </h3>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                    {isId ? 'Dibangun dengan fondasi stack teknologi modern berstandar enterprise' : 'Built on a modern enterprise-grade technology stack'}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {techStack.map((tech, idx) => (
                                    <div
                                        key={idx}
                                        className="p-4 rounded-2xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex items-start gap-3.5"
                                    >
                                        <div className="w-8 h-8 rounded-xl bg-[#0AB600]/10 border border-[#0AB600]/30 flex items-center justify-center shrink-0 mt-0.5">
                                            <Cpu className="w-4 h-4 text-[#0AB600]" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                                {tech.name}
                                            </h4>
                                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                                {tech.desc}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ═══════ BOTTOM CTA BANNER ═══════ */}
                        <div className="relative p-6 sm:p-10 lg:p-12 rounded-3xl bg-gradient-to-br from-[#0AB600]/10 via-[#0AB600]/5 to-transparent border border-[#0AB600]/25 overflow-hidden shadow-xs">
                            {/* Ambient Glows */}
                            <div className="absolute -top-16 -left-16 w-48 sm:w-64 h-48 sm:h-64 bg-[#0AB600]/10 rounded-full blur-3xl pointer-events-none" style={{ filter: 'blur(64px)', WebkitFilter: 'blur(64px)' }} />
                            <div className="absolute -bottom-16 -right-16 w-48 sm:w-64 h-48 sm:h-64 bg-[#0AB600]/10 rounded-full blur-3xl pointer-events-none" style={{ filter: 'blur(64px)', WebkitFilter: 'blur(64px)' }} />

                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-8">
                                
                                {/* Left Avatar: Profile CS (Transparent & Tilted) */}
                                <div className="hidden md:flex shrink-0 items-center justify-center">
                                    <img
                                        src="/assets/img/icon/profile_cs.png"
                                        alt="Customer Support"
                                        className="w-28 h-28 lg:w-36 lg:h-36 xl:w-40 xl:h-40 object-contain -rotate-6 hover:rotate-0 transition-transform duration-300 pointer-events-none select-none"
                                        onError={(e) => {
                                            e.currentTarget.src = '/assets/img/icon/profile_cs.png';
                                        }}
                                    />
                                </div>

                                {/* Center Content */}
                                <div className="flex-1 text-center max-w-xl mx-auto space-y-3 sm:space-y-4">
                                    {/* Mobile-only avatar pair */}
                                    <div className="flex md:hidden items-center justify-center gap-4 mb-1">
                                        <img
                                            src="/assets/img/icon/profile_cs.png"
                                            alt="Customer Support"
                                            className="w-16 h-16 object-contain -rotate-6 pointer-events-none"
                                        />
                                        <div className="w-10 h-10 rounded-2xl bg-[#0AB600]/10 border border-[#0AB600]/30 flex items-center justify-center">
                                            <GraduationCap className="w-5 h-5 text-[#0AB600]" />
                                        </div>
                                        <img
                                            src="/assets/img/icon/profile_dev.png"
                                            alt="Developer"
                                            className="w-16 h-16 object-contain rotate-6 pointer-events-none"
                                        />
                                    </div>

                                    {/* Desktop Center Icon */}
                                    <div className="hidden md:flex w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-[#0AB600]/10 border border-[#0AB600]/30 items-center justify-center mx-auto">
                                        <GraduationCap className="w-6 h-6 lg:w-7 lg:h-7 text-[#0AB600]" />
                                    </div>

                                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">
                                        {isId ? 'Tertarik Berkolaborasi dengan Lab Kami?' : 'Interested in Research Collaboration?'}
                                    </h3>

                                    <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
                                        {isId
                                            ? 'Kami membuka kesempatan kemitraan riset terapan, pengujian teknologi, dan kolaborasi industri bersama CoE STAS-RG Telkom University.'
                                            : 'We welcome applied research partnerships, technology trials, and industrial collaborations with CoE STAS-RG Telkom University.'}
                                    </p>

                                    <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 pt-1 sm:pt-2">
                                        <Link
                                            href="/support"
                                            className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-[#0AB600] hover:bg-[#089600] text-white text-xs sm:text-sm font-semibold transition-all shadow-xs hover:shadow-md hover:shadow-[#0AB600]/20"
                                        >
                                            <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                            <span>{isId ? 'Hubungi Tim Riset' : 'Contact Research Team'}</span>
                                        </Link>
                                        <Link
                                            href="/documentation"
                                            className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs sm:text-sm font-medium border border-zinc-200 dark:border-zinc-700 shadow-xs transition-all"
                                        >
                                            <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                            <span>{isId ? 'Buka Dokumentasi' : 'Open Documentation'}</span>
                                        </Link>
                                    </div>
                                </div>

                                {/* Right Avatar: Profile Dev (Transparent & Tilted) */}
                                <div className="hidden md:flex shrink-0 items-center justify-center">
                                    <img
                                        src="/assets/img/icon/profile_dev.png"
                                        alt="Lead Developer"
                                        className="w-28 h-28 lg:w-36 lg:h-36 xl:w-40 xl:h-40 object-contain rotate-6 hover:rotate-0 transition-transform duration-300 pointer-events-none select-none"
                                        onError={(e) => {
                                            e.currentTarget.src = '/assets/img/icon/profile_dev.png';
                                        }}
                                    />
                                </div>

                            </div>
                        </div>

                    </div>
                </main>

                <Footer />
            </div>
        </>
    );
}

export default function Team() {
    return (
        <AppProvider>
            <TeamContent />
        </AppProvider>
    );
}
