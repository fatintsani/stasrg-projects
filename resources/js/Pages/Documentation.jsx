import React, { useState, useEffect, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import { AppProvider, useApp } from '../Context/AppContext';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import {
    BookOpen,
    FileText,
    Layers,
    Settings,
    Users,
    Image,
    BarChart3,
    Shield,
    ChevronRight,
    Search,
    ArrowUp,
    Sparkles,
    Palette,
    Download,
    QrCode,
    FolderKanban,
    LifeBuoy,
    Zap,
    CheckCircle2,
    Copy,
    Check,
    ExternalLink,
    Hash,
    List,
    Monitor,
    Printer,
    Globe,
    Lock,
    UserCheck,
    Activity,
    HardDrive,
    Paintbrush,
    LayoutTemplate,
    Workflow,
    PenLine,
    Eye,
    Upload,
    FileCheck,
    Brain,
    RefreshCw,
    Mail,
    Send,
    Database,
    Cpu,
    Fingerprint,
    Award,
    GraduationCap,
    Sliders,
    Terminal,
    Code2,
    Clock,
    AlertCircle,
    Info,
    KeyRound,
    FileCode,
    CheckCircle
} from 'lucide-react';

/* ─────────────────── TABLE OF CONTENTS DATA ─────────────────── */
const tocSections = [
    { id: 'getting-started', label: 'Memulai & Ikhtisar', icon: Zap, group: 'Dasar' },
    { id: 'architecture', label: 'Arsitektur & Sistem', icon: Cpu, group: 'Teknis' },
    { id: 'document-formats', label: 'Format Dokumen & Brosur', icon: FileText, group: 'Deliverables' },
    { id: 'design-styles', label: 'Gaya Desain & Visual', icon: Paintbrush, group: 'Deliverables' },
    { id: 'templates', label: 'Template Builder', icon: LayoutTemplate, group: 'Deliverables' },
    { id: 'researchers-hki', label: 'Direktori Peneliti & HKI', icon: GraduationCap, group: 'Riset & Paten' },
    { id: 'ai-engine', label: 'Mesin AI (Gemini & OpenAI)', icon: Brain, group: 'Kecerdasan Buatan' },
    { id: 'media-library', label: 'Media & Sanitasi SVG', icon: Image, group: 'Aset' },
    { id: 'qr-analytics', label: 'Analitik Expo & QR Tracking', icon: BarChart3, group: 'Analisis' },
    { id: 'helpdesk-email', label: 'Helpdesk & Email 2-Arah', icon: Mail, group: 'Layanan' },
    { id: 'security-hardening', label: 'Keamanan & Integritas', icon: Shield, group: 'Keamanan' },
    { id: 'performance-scaling', label: 'Kinerja, Queue & Cache', icon: Database, group: 'Performa' },
    { id: 'api-reference', label: 'Referensi API & Endpoint', icon: Terminal, group: 'Developer' },
    { id: 'faq', label: 'FAQ & Tanya Jawab', icon: LifeBuoy, group: 'Bantuan' },
];

/* ─────────────────── CODE SNIPPET BOX COMPONENT ─────────────────── */
function CodeBlock({ code, language = 'bash', label }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="rounded-2xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800 bg-[#0F172A] text-zinc-100 my-3 font-mono text-xs">
            {label && (
                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-[11px] text-zinc-400">
                    <span className="flex items-center gap-1.5 font-semibold text-[#0AB600]">
                        <Terminal className="w-3.5 h-3.5 text-[#0AB600]" />
                        {label}
                    </span>
                    <button
                        type="button"
                        onClick={handleCopy}
                        className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer text-zinc-400"
                    >
                        {copied ? <Check className="w-3.5 h-3.5 text-[#0AB600]" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Tersalin!' : 'Salin'}</span>
                    </button>
                </div>
            )}
            <div className="p-4 overflow-x-auto text-[12px] leading-relaxed">
                <pre>{code}</pre>
            </div>
        </div>
    );
}

/* ─────────────────── DOC SECTION COMPONENT ─────────────────── */
function DocSection({ id, icon: Icon, title, badge, children }) {
    return (
        <section id={id} className="scroll-mt-28 mb-14 sm:mb-20">
            <div className="flex items-center gap-3.5 mb-6 pb-3 border-b border-zinc-200/70 dark:border-zinc-800">
                <div className="w-11 h-11 rounded-2xl bg-[#0AB600]/10 border border-[#0AB600]/30 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-[#0AB600]" />
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        {title}
                    </h2>
                    {badge && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#0AB600]/10 text-[#0AB600] border border-[#0AB600]/30">
                            {badge}
                        </span>
                    )}
                </div>
            </div>
            <div className="space-y-4">
                {children}
            </div>
        </section>
    );
}

/* ─────────────────── INFO CARD COMPONENT ─────────────────── */
function InfoCard({ icon: Icon, title, children, variant = 'default' }) {
    let cardStyle = 'bg-zinc-50/80 dark:bg-zinc-800/40 border-zinc-200/80 dark:border-zinc-700/60';
    let iconColor = 'text-zinc-600 dark:text-zinc-400';
    let titleColor = 'text-slate-800 dark:text-zinc-200';

    if (variant === 'accent') {
        cardStyle = 'bg-[#0AB600]/5 dark:bg-[#0AB600]/10 border-[#0AB600]/25 dark:border-[#0AB600]/30';
        iconColor = 'text-[#0AB600]';
        titleColor = 'text-[#0D5A34] dark:text-emerald-300';
    } else if (variant === 'warning') {
        cardStyle = 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50';
        iconColor = 'text-amber-600 dark:text-amber-400';
        titleColor = 'text-amber-900 dark:text-amber-300';
    } else if (variant === 'info') {
        cardStyle = 'bg-blue-50/60 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/50';
        iconColor = 'text-blue-600 dark:text-blue-400';
        titleColor = 'text-blue-900 dark:text-blue-300';
    }

    return (
        <div className={`p-5 rounded-2xl border transition-all ${cardStyle}`}>
            {title && (
                <div className="flex items-center gap-2.5 mb-2.5">
                    {Icon && <Icon className={`w-4 h-4 shrink-0 ${iconColor}`} />}
                    <span className={`text-sm font-bold ${titleColor}`}>
                        {title}
                    </span>
                </div>
            )}
            <div className="text-[13px] sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed space-y-2">
                {children}
            </div>
        </div>
    );
}

/* ─────────────────── STEP ITEM COMPONENT ─────────────────── */
function StepItem({ number, title, description }) {
    return (
        <div className="flex gap-3.5 items-start">
            <div className="w-7 h-7 rounded-xl bg-[#0AB600]/10 border border-[#0AB600]/30 flex items-center justify-center text-xs font-extrabold text-[#0AB600] shrink-0 mt-0.5">
                {number}
            </div>
            <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200 mb-1">{title}</h4>
                <div className="text-[13px] text-zinc-600 dark:text-zinc-400 leading-relaxed">{description}</div>
            </div>
        </div>
    );
}

/* ─────────────────── API ENDPOINT ITEM ─────────────────── */
function ApiEndpoint({ method, path, description, params = [], response }) {
    const [open, setOpen] = useState(false);

    const getBadge = (m) => {
        switch (m) {
            case 'GET': return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
            case 'POST': return 'bg-[#0AB600]/10 text-[#0AB600] border-[#0AB600]/30';
            case 'PUT': case 'PATCH': return 'bg-amber-500/10 text-amber-600 border-amber-500/30';
            case 'DELETE': return 'bg-red-500/10 text-red-600 border-red-500/30';
            default: return 'bg-zinc-500/10 text-zinc-600 border-zinc-500/30';
        }
    };

    return (
        <div className="border border-zinc-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900/40 mb-3">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer"
            >
                <div className="flex items-center gap-3 flex-wrap">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-extrabold border ${getBadge(method)}`}>
                        {method}
                    </span>
                    <span className="font-mono text-xs sm:text-sm font-semibold text-slate-800 dark:text-zinc-200">
                        {path}
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:inline">
                        — {description}
                    </span>
                </div>
                <ChevronRight className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-90' : ''}`} />
            </button>

            {open && (
                <div className="px-4 pb-4 pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-3 text-xs">
                    <p className="text-zinc-600 dark:text-zinc-400">{description}</p>
                    {params.length > 0 && (
                        <div>
                            <span className="font-bold text-slate-700 dark:text-zinc-300 block mb-1.5">Parameter Request:</span>
                            <div className="space-y-1">
                                {params.map((p, idx) => (
                                    <div key={idx} className="flex items-center gap-2 font-mono">
                                        <span className="font-bold text-[#0AB600]">{p.name}</span>
                                        <span className="text-zinc-400">({p.type})</span>
                                        <span className="text-zinc-500">— {p.desc}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {response && (
                        <div>
                            <span className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">Contoh Respons JSON:</span>
                            <pre className="p-3 rounded-xl bg-slate-950 text-[#0AB600] font-mono text-[11px] overflow-x-auto">
                                {response}
                            </pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

/* ─────────────────── FAQ ITEM COMPONENT ─────────────────── */
function FaqItem({ question, answer }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="border border-zinc-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden transition-all bg-white dark:bg-zinc-900/40">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-zinc-50/70 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
            >
                <span className="text-sm font-bold text-slate-800 dark:text-zinc-200">{question}</span>
                <ChevronRight className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-90' : ''}`} />
            </button>
            {open && (
                <div className="px-5 pb-5 pt-1 text-[13px] sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/60">
                    {answer}
                </div>
            )}
        </div>
    );
}

/* ─────────────────── TABLE COMPONENT ─────────────────── */
function DocTable({ headers, rows }) {
    return (
        <div className="overflow-x-auto rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 my-3">
            <table className="w-full text-[13px]">
                <thead>
                    <tr className="bg-zinc-50/80 dark:bg-zinc-800/60 border-b border-zinc-200/80 dark:border-zinc-800">
                        {headers.map((h, i) => (
                            <th key={i} className="px-4 py-3 text-left font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider text-[11px]">
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                    {rows.map((row, i) => (
                        <tr key={i} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                            {row.map((cell, j) => (
                                <td key={j} className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

/* ═══════════════════ MAIN DOCUMENTATION CONTENT ═══════════════════ */
function DocsContent() {
    const { t, language } = useApp();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeSection, setActiveSection] = useState('getting-started');
    const [showBackToTop, setShowBackToTop] = useState(false);
    const contentRef = useRef(null);

    // Track active section on scroll
    useEffect(() => {
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 400);

            const sections = tocSections.map(s => document.getElementById(s.id)).filter(Boolean);
            for (let i = sections.length - 1; i >= 0; i--) {
                const rect = sections[i].getBoundingClientRect();
                if (rect.top <= 160) {
                    setActiveSection(tocSections[i].id);
                    break;
                }
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Filtered TOC
    const filteredToc = tocSections.filter(s =>
        s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.group.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    return (
        <>
            <Head title="Dokumentasi Lengkap Platform — STAS RG Projects CoE STAS-RG">
                <meta name="description" content="Dokumentasi teknis dan panduan operasional STAS RG Projects: format dokumen A4/Trifold, AI Engine, Master Peneliti & HKI, Helpdesk Email 2-Arah, dan Arsitektur Sistem." />
            </Head>

            <div className="min-h-screen flex flex-col bg-[#FAFBFD] dark:bg-[#070D18] text-slate-900 dark:text-slate-100 selection:bg-[#0AB600]/20 selection:text-[#0AB600] font-sans antialiased transition-colors">
                <Navbar />

                <main className="flex-grow py-10 sm:py-16 relative overflow-hidden">
                    {/* Ambient Background Glow Effect (Subtle SaaS light) */}
                    <div className="ambient-glow" style={{ filter: 'blur(64px)', WebkitFilter: 'blur(64px)' }} />

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        {/* ═══════ HERO HEADER ═══════ */}
                        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-4">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-semibold tracking-wider uppercase bg-[#0AB600]/10 text-[#0AB600] border border-[#0AB600]/30 shadow-xs">
                                <BookOpen className="w-4 h-4 text-[#0AB600]" />
                                <span>DOKUMENTASI SISTEM RESMI</span>
                            </div>

                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                Dokumentasi STAS RG Projects
                            </h1>

                            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
                                Panduan teknis komprehensif untuk pengembang, peneliti, dan administrator — mencakup seluruh modul dokumen, sinkronisasi trifold, asistensi AI bilingual, analitik QR, hingga integrasi helpdesk email.
                            </p>

                            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 shadow-xs">
                                    <FileCheck className="w-3.5 h-3.5 text-[#0AB600]" />
                                    <span>Laravel 12 + React 19 SPA</span>
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 shadow-xs">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0AB600]" />
                                    <span>119 Automated Tests Passed</span>
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 shadow-xs">
                                    <Shield className="w-3.5 h-3.5 text-[#0AB600]" />
                                    <span>Enterprise Hardened</span>
                                </span>
                            </div>
                        </div>

                        {/* ═══════ LAYOUT: SIDEBAR + CONTENT ═══════ */}
                        <div className="flex flex-col lg:flex-row gap-8">

                            {/* ──── SIDEBAR (Table of Contents) ──── */}
                            <aside className="lg:w-64 xl:w-72 shrink-0">
                                <div className="lg:sticky lg:top-24 space-y-4">
                                    {/* Search Box */}
                                    <div className="relative">
                                        <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Cari dokumentasi..."
                                            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#0AB600]/40 transition-all"
                                        />
                                    </div>

                                    {/* TOC List */}
                                    <nav className="p-3 rounded-2xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
                                        <div className="flex items-center justify-between px-3 py-2 mb-1">
                                            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Topik Panduan</span>
                                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500">14 Seksi</span>
                                        </div>
                                        <div className="space-y-0.5 max-h-[62vh] overflow-y-auto pr-1">
                                            {filteredToc.map((item) => {
                                                const ItemIcon = item.icon;
                                                const isActive = activeSection === item.id;
                                                return (
                                                    <a
                                                        key={item.id}
                                                        href={`#${item.id}`}
                                                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                                                            isActive
                                                                ? 'bg-[#0AB600]/10 text-[#0AB600] font-bold border-l-2 border-[#0AB600]'
                                                                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-100'
                                                        }`}
                                                    >
                                                        <ItemIcon className="w-3.5 h-3.5 shrink-0" />
                                                        <span className="truncate">{item.label}</span>
                                                    </a>
                                                );
                                            })}
                                        </div>
                                    </nav>

                                    {/* Quick Links Card */}
                                    <div className="p-4 rounded-2xl bg-[#0AB600]/5 dark:bg-[#0AB600]/10 border border-[#0AB600]/25 dark:border-[#0AB600]/30">
                                        <h4 className="text-[11px] font-bold text-[#0D5A34] dark:text-[#0AB600] uppercase tracking-wider mb-2.5">
                                            Tautan Teknis
                                        </h4>
                                        <div className="space-y-2 text-xs">
                                            <Link href="/support" className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-[#0AB600] transition-colors">
                                                <LifeBuoy className="w-3.5 h-3.5" />
                                                <span>Pusat Bantuan Publik</span>
                                            </Link>
                                            <Link href="/login" className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-[#0AB600] transition-colors">
                                                <Lock className="w-3.5 h-3.5" />
                                                <span>Portal Masuk Admin</span>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </aside>

                            {/* ──── MAIN CONTENT ──── */}
                            <div ref={contentRef} className="flex-1 min-w-0">
                                <div className="max-w-3xl">

                                    {/* ═══════ 1. GETTING STARTED ═══════ */}
                                    <DocSection id="getting-started" icon={Zap} title="1. Memulai & Ikhtisar Platform" badge="OVERVIEW">
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                            <strong>STAS RG Projects</strong> (*STAS-RG Research & Innovation Deliverables Generator*) adalah sistem otomasi komprehensif pada <strong>Center of Excellence Sustainable Technology and Applied Sciences Research Group (CoE STAS-RG) Telkom University</strong>.
                                        </p>

                                        <InfoCard icon={Workflow} title="Siklus Hidup Publikasi Riset" variant="accent">
                                            <div className="space-y-3.5">
                                                <StepItem number="1" title="Inisiasi Proyek & Metadata Riset" description="Tentukan judul inovasi, kategori riset (IoT, AI/ML, Renewable Energy, Cybersecurity), nomor HKI/Paten, dan tim peneliti (PI, Co-PI, Anggota)." />
                                                <StepItem number="2" title="Asistensi AI & Formula Spesifikasi" description="Gunakan AI Auto-Draft untuk menyusun ringkasan masalah-solusi, spesifikasi hardware/software, dan kalkulasi dampak ekonomi." />
                                                <StepItem number="3" title="Pilihan Format: A4 Flyer atau Trifold" description="Pilih antara Flyer 1-Halaman beresolusi tinggi atau Brosur Lipat Tiga (3-Panel Independen) yang tersinkronisasi atomik." />
                                                <StepItem number="4" title="Penerbitan & Pelacakan Expo QR" description="Publikasikan ke portal showcase dan download lembar cetak ber-QR Code untuk melacak interaksi pengunjung stand pameran." />
                                            </div>
                                        </InfoCard>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                                            <InfoCard icon={Shield} title="Autentikasi Aman">
                                                <p>Login Password, Google SSO OAuth 2.0, dan Passkey Biometrik W3C WebAuthn tanpa password.</p>
                                            </InfoCard>
                                            <InfoCard icon={UserCheck} title="Persetujuan Akun">
                                                <p>Akun baru melewati alur verifikasi admin (Approval Workflow) sebelum mendapatkan akses data internal.</p>
                                            </InfoCard>
                                        </div>
                                    </DocSection>

                                    {/* ═══════ 2. ARCHITECTURE ═══════ */}
                                    <DocSection id="architecture" icon={Cpu} title="2. Arsitektur & Spesifikasi Sistem" badge="TECHNICAL">
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                            Sistem mengombinasikan keandalan backend Laravel 12 dengan kecepatan interaktivitas React 19 SPA via Inertia.js v3 protocol tanpa memerlukan REST API terpisah.
                                        </p>

                                        <DocTable
                                            headers={['Layer', 'Teknologi', 'Peran Utama']}
                                            rows={[
                                                ['Frontend SPA', 'React 19, Inertia.js v3, Tailwind CSS v4', 'Client-side rendering, WYSIWYG canvas sync, print preview'],
                                                ['Backend Core', 'Laravel 12, PHP 8.3/8.5', 'Business logic, authorization, transactional integrity'],
                                                ['Queue & Cache', 'Database / Redis (ShouldQueue)', 'Asynchronous non-blocking mail relay & smart caching'],
                                                ['Database', 'SQLite, MySQL 8+, PostgreSQL', 'Relational data with SoftDeletes and composite indexing'],
                                                ['AI Relay', 'Google Gemini Flash 3.6 / OpenAI GPT-4o', 'Deep academic drafting, section polish, and bilingual translation'],
                                            ]}
                                        />

                                        <CodeBlock
                                            label="Perintah Jalankan Lingkungan Pengembangan Lokal"
                                            code={`# Menjalankan Laravel Backend & Vite HMR Frontend secara bersamaan
composer run dev

# Menjalankan Test Suite Otomatis (119 Tests)
php artisan test

# Menjalankan Queue Worker untuk Email di Latar Belakang
php artisan queue:work`}
                                        />
                                    </DocSection>

                                    {/* ═══════ 3. DOCUMENT FORMATS ═══════ */}
                                    <DocSection id="document-formats" icon={FileText} title="3. Format Dokumen & Brosur Lipat Tiga" badge="CORE ENGINE">
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                            Platform menyediakan mesin penyusun dokumen presisi tinggi yang dikalibrasi sesuai standar cetak percetakan offset dan digital.
                                        </p>

                                        <div className="space-y-3">
                                            <InfoCard icon={Layers} title="Brosur Lipat Tiga (Trifold Brochure) — 3 Panel Independen" variant="accent">
                                                <p>Brosur 3 lipatan standar pameran internasional yang terdiri dari 3 panel:</p>
                                                <ul className="list-disc list-inside space-y-1 text-xs mt-1">
                                                    <li><strong>Panel Luar / Cover Depan:</strong> Headline inovasi, dual branding resmi STAS-RG dan Telkom University, serta ringkasan eksekutif.</li>
                                                    <li><strong>Panel Dalam / Arsitektur:</strong> Diagram skema hardware/software, keunggulan komparatif, dan tabel spesifikasi terperinci.</li>
                                                    <li><strong>Panel Belakang / Kontak & HKI:</strong> Profil peneliti utama, nomor paten resmi Ditjen KI, QR Code expo, dan kontak lab.</li>
                                                </ul>
                                            </InfoCard>

                                            <InfoCard icon={Printer} title="Flyer A4 Standar Industri (210 × 297 mm)">
                                                <p>Lembar promosi satu halaman beresolusi tinggi dengan 4 opsi komposisi visual: <em>Balanced Layout</em>, <em>Visual Heavy</em>, <em>Text Heavy</em>, dan <em>Minimalist Modern</em>.</p>
                                            </InfoCard>
                                        </div>

                                        <DocTable
                                            headers={['Format Deliverable', 'Dimensi / Rasio', 'Target Output']}
                                            rows={[
                                                ['Trifold Brochure', 'A4 Landscape (3 × 99mm Panels)', 'Brosur lipat pameran expo luar negeri & mitra industri'],
                                                ['A4 Research Flyer', '210 × 297 mm (Portrait)', 'Lembar fakta satu halaman, poster dinding, arsip riset'],
                                                ['Factsheet 2-Kolom', 'Executive Brief (A4)', 'Ringkasan eksekutif pendanaan dan investor'],
                                                ['X-Banner Pameran', '60 × 160 cm (Vertikal)', 'Banner fisik booth pameran riset kampus'],
                                                ['Pitch Deck Slide', '16:9 Widescreen (1920×1080)', 'Presentasi investor & digital signage lab'],
                                                ['Social Media Kit', '1:1 Square & 9:16 Story', 'Publikasi LinkedIn, Instagram Feed, dan WhatsApp Status'],
                                            ]}
                                        />
                                    </DocSection>

                                    {/* ═══════ 4. DESIGN STYLES ═══════ */}
                                    <DocSection id="design-styles" icon={Paintbrush} title="4. Gaya Desain Visual & Tema Warna">
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                            Kanvas dokumen menerapkan standar visual <strong>Editorial Research Laboratory</strong> dengan aturan ketat <em>Zero Heavy Shadows</em> demi kemudahan cetak dan keterbacaan tinggi.
                                        </p>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <InfoCard icon={Award} title="1. CoE Classic Standard">
                                                <p>Layout resmi institusi dengan header dual-logo, badge kategori solid, separator bar bersih, dan font Plus Jakarta Sans.</p>
                                            </InfoCard>
                                            <InfoCard icon={Sparkles} title="2. Modern Split Hero">
                                                <p>Aksen border warna tema dinamis, ribbon vertikal, hero frame asimetris, dan pill badges modern.</p>
                                            </InfoCard>
                                            <InfoCard icon={Layers} title="3. Infographic Cards">
                                                <p>Modul kartu berbingkai rounded-2xl, alur masalah-solusi terstruktur, dan poin fitur berbasis ikon visual.</p>
                                            </InfoCard>
                                            <InfoCard icon={Hash} title="4. Minimalist Swiss Grid">
                                                <p>Presisi tinggi dengan border monokromatik tajam, tipografi sans-serif kontras tinggi, dan badge monospace.</p>
                                            </InfoCard>
                                        </div>
                                    </DocSection>

                                    {/* ═══════ 5. TEMPLATES ═══════ */}
                                    <DocSection id="templates" icon={LayoutTemplate} title="5. Reusable Template Builder">
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                            Pengguna dapat menyimpan konfigurasi desain proyek menjadi template terstandarisasi yang dapat dibagikan dan diterapkan ke proyek riset lainnya dalam 1-klik.
                                        </p>
                                        <InfoCard icon={Copy} title="Fitur Template">
                                            <ul className="list-disc list-inside space-y-1">
                                                <li><strong>Simpan dari Proyek Aktif:</strong> Mengonversi format, gaya, warna, dan header boilerplate proyek menjadi template.</li>
                                                <li><strong>Penerapan 1-Klik:</strong> Terapkan template ke proyek baru tanpa mengubah data teks yang sudah ada.</li>
                                                <li><strong>Duplikasi & Variasi:</strong> Gandakan template untuk variasi sub-laboratorium atau grup riset.</li>
                                            </ul>
                                        </InfoCard>
                                    </DocSection>

                                    {/* ═══════ 6. RESEARCHERS & HKI ═══════ */}
                                    <DocSection id="researchers-hki" icon={GraduationCap} title="6. Direktori Peneliti & Manajemen HKI" badge="RESEARCH ASSETS">
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                            Modul terpadu untuk mengelola basis data peneliti universitas, identitas akademik global, dan hak kekayaan intelektual (paten dan hak cipta).
                                        </p>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <InfoCard icon={Users} title="Master Profil Peneliti">
                                                <p>Pencatatan NIDN, NIP, SINTA ID, Scopus Author ID, ORCID iD, LinkedIn, foto formal, dan keahlian riset.</p>
                                            </InfoCard>
                                            <InfoCard icon={Award} title="Paten & Sertifikasi HKI">
                                                <p>Pencatatan Nomor Permohonan Paten resmi Ditjen KI Kemenkumham RI, Hak Cipta, dan DOI Jurnal bereputasi.</p>
                                            </InfoCard>
                                        </div>

                                        <InfoCard icon={Sliders} title="Penugasan Tim pada Proyek">
                                            <p>Peneliti dapat dipilih secara interaktif pada setiap proyek dengan penentuan peran:</p>
                                            <ul className="list-disc list-inside space-y-1 text-xs mt-1">
                                                <li><strong>Principal Investigator (PI):</strong> Ketua tim peneliti yang memimpin riset.</li>
                                                <li><strong>Co-PI:</strong> Wakil ketua peneliti kolaborator.</li>
                                                <li><strong>Member / Peneliti Anggota:</strong> Dosen atau mahasiswa asisten riset.</li>
                                            </ul>
                                        </InfoCard>
                                    </DocSection>

                                    {/* ═══════ 7. AI ENGINE ═══════ */}
                                    <DocSection id="ai-engine" icon={Brain} title="7. Mesin Kecerdasan Buatan (AI Engine)" badge="INTELLIGENCE">
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                            Didukung oleh arsitektur AI modular yang mendukung <strong>Google Gemini Flash 3.6</strong> dan <strong>OpenAI GPT-4o</strong> untuk otomatisasi penulisan konten akademik.
                                        </p>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <InfoCard icon={Sparkles} title="Auto-Draft" variant="accent">
                                                <p className="text-xs">Menyusun draf riset lengkap dari ringkasan ide singkat.</p>
                                            </InfoCard>
                                            <InfoCard icon={PenLine} title="AI Polish" variant="info">
                                                <p className="text-xs">Memperbaiki gaya bahasa ilmiah dan merapikan ringkasan.</p>
                                            </InfoCard>
                                            <InfoCard icon={Globe} title="Bilingual Translation" variant="accent">
                                                <p className="text-xs">Terjemahan akademik akurat dari Bahasa Indonesia ke Inggris.</p>
                                            </InfoCard>
                                        </div>

                                        <CodeBlock
                                            label="Konfigurasi API AI pada File .env"
                                            code={`# Pilihan provider: 'gemini' atau 'openai'
AI_PROVIDER=gemini

# Google Gemini API Key
GEMINI_API_KEY=AIzaSy...your_gemini_api_key
GEMINI_DEFAULT_MODEL=gemini-3.6-flash`}
                                        />
                                    </DocSection>

                                    {/* ═══════ 8. MEDIA & SVG SANITIZATION ═══════ */}
                                    <DocSection id="media-library" icon={Image} title="8. Media Library & Sanitasi SVG XSS">
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                            Perpustakaan aset terpusat untuk menyimpan logo mitra, diagram prototipe, dan sertifikasi. Dilengkapi mesin pembersih berkas vektor otomatis untuk mencegah celah keamanan <em>Stored Cross-Site Scripting (XSS)</em>.
                                        </p>

                                        <InfoCard icon={Shield} title="Mekanisme Sanitasi SVG (HtmlSanitizer::cleanSvg)" variant="warning">
                                            <p>Setiap berkas SVG yang diunggah dipindai dan disterilkan secara otomatis:</p>
                                            <ul className="list-disc list-inside space-y-1 text-xs mt-1">
                                                <li>Menghapus tag berbahaya: <code>&lt;script&gt;</code>, <code>&lt;iframe&gt;</code>, <code>&lt;object&gt;</code>, <code>&lt;embed&gt;</code>, <code>&lt;foreignObject&gt;</code>.</li>
                                                <li>Membersihkan seluruh event handler inline (seperti <code>onload=</code>, <code>onclick=</code>, <code>onerror=</code>).</li>
                                                <li>Menghilangkan skema URL berisiko (<code>javascript:</code>, <code>vbscript:</code>, <code>data:text/html</code>).</li>
                                            </ul>
                                        </InfoCard>
                                    </DocSection>

                                    {/* ═══════ 9. QR ANALYTICS ═══════ */}
                                    <DocSection id="qr-analytics" icon={BarChart3} title="9. Analitik Expo & Pelacakan QR Code" badge="REAL-TIME METRICS">
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                            Setiap materi publikasi dilengkapi QR Code dinamis yang mengarah ke gateway pelacakan <code>/qr/{'{slug}'}</code> untuk mengumpulkan metrik pameran secara transparan.
                                        </p>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <InfoCard icon={QrCode} title="Metrik Interaksi Expo">
                                                <p>Pencatatan jumlah scan, jam-jam puncak kunjungan stand (Peak Hours 00:00-23:00 WIB), dan tren harian pameran.</p>
                                            </InfoCard>
                                            <InfoCard icon={Monitor} title="Demografi Perangkat & Geografis">
                                                <p>Deteksi jenis perangkat (Mobile, Desktop, Tablet), sistem operasi (Android, iOS, Windows), dan kota asal pengunjung.</p>
                                            </InfoCard>
                                        </div>
                                    </DocSection>

                                    {/* ═══════ 10. HELPDESK EMAIL ═══════ */}
                                    <DocSection id="helpdesk-email" icon={Mail} title="10. Sistem Helpdesk & Email Dua Arah" badge="NEW FEATURE">
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                            Pusat layanan bantuan publik yang terintegrasi langsung dengan antrean email asinkron dan modul tanggapan resmi administrator.
                                        </p>

                                        <div className="space-y-3">
                                            <InfoCard icon={Workflow} title="Alur Notifikasi Email 2-Arah" variant="accent">
                                                <div className="space-y-2 text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-5 h-5 rounded-full bg-[#0AB600]/20 text-[#0AB600] flex items-center justify-center font-bold">1</span>
                                                        <span><strong>Inbound Receipt:</strong> Pengirim menerima email tanda terima instan beserta nomor tiket resmi (<code>#STAS-YYYYMMDD-XXXX</code>).</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-600 flex items-center justify-center font-bold">2</span>
                                                        <span><strong>Admin Alert:</strong> Seluruh administrator lab menerima email pemberitahuan tiket baru dengan penanda prioritas.</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-5 h-5 rounded-full bg-[#0AB600]/20 text-[#0AB600] flex items-center justify-center font-bold">3</span>
                                                        <span><strong>Official Reply Composer:</strong> Admin membalas tiket dari web menggunakan 4 quick-template 1-klik, mengirimkan email balasan resmi ke pengirim.</span>
                                                    </div>
                                                </div>
                                            </InfoCard>

                                            <InfoCard icon={Send} title="4 Templat Balasan Cepat (Quick Responses)">
                                                <p className="text-xs">1) Permohonan Informasi Tambahan, 2) Tawaran Kemitraan Riset, 3) Penyelesaian Kendala Teknis, 4) Penutupan Tiket Resmi.</p>
                                            </InfoCard>
                                        </div>
                                    </DocSection>

                                    {/* ═══════ 11. SECURITY HARDENING ═══════ */}
                                    <DocSection id="security-hardening" icon={Shield} title="11. Keamanan & Integritas Data (Enterprise Hardening)">
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                            Sistem telah diaudit dan diperkuat untuk memenuhi standar kesiapan produksi skala institusi:
                                        </p>

                                        <div className="space-y-3">
                                            <InfoCard icon={Database} title="1. Proteksi SoftDeletes pada Model Proyek & Peneliti">
                                                <p>Mencegah data riset terhapus permanen secara tidak sengaja sehingga tautan fisik QR Code pada brosur cetak tidak rusak.</p>
                                            </InfoCard>
                                            <InfoCard icon={Workflow} title="2. Transaksi Atomik Database (DB::transaction)">
                                                <p>Pembuatan 3-panel brosur trifold, kloning proyek, dan pengiriman balasan tiket berjalan dalam transaksi atomik untuk mencegah <em>partial writes</em>.</p>
                                            </InfoCard>
                                            <InfoCard icon={Lock} title="3. Rate Limiting & Proteksi WebAuthn">
                                                <p>Pembatasan frekuensi permintaan pada gateway QR (120 req/menit), pencarian global (60 req/menit), dan pembersihan otomatis sesi challenge biometrik.</p>
                                            </InfoCard>
                                        </div>
                                    </DocSection>

                                    {/* ═══════ 12. PERFORMANCE & SCALING ═══════ */}
                                    <DocSection id="performance-scaling" icon={Database} title="12. Kinerja, Asynchronous Queue & Caching">
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                            Arsitektur performa tinggi dirancang untuk merespons permintaan pengguna dalam waktu &lt;80 milidetik.
                                        </p>

                                        <DocTable
                                            headers={['Komponen Optimasi', 'Metode Implementasi', 'Dampak Performa']}
                                            rows={[
                                                ['Asynchronous Mailables', '10+ kelas mailable mengimplementasikan ShouldQueue', 'Mengeliminasi jeda SMTP (~1.5s menjadi <80ms)'],
                                                ['Kueri Dashboard SQL', 'Agregasi COUNT & groupBy langsung di level database', 'Menghemat alokasi memori server RAM >80%'],
                                                ['Smart Cache Layer', 'Cache::rememberForever pada SystemSetting & TTL pada Landing Page', 'Respons instan pada halaman publik bervolume tinggi'],
                                                ['Indeks Komposit DB', 'Indeks komposit pada tabel projects, researchers, dan qr_scans', 'Eksekusi kueri penyaringan cepat bahkan dengan ribuan data'],
                                            ]}
                                        />
                                    </DocSection>

                                    {/* ═══════ 13. API REFERENCE ═══════ */}
                                    <DocSection id="api-reference" icon={Terminal} title="13. Referensi API & Endpoint Developer" badge="DEV SPEC">
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                            Dokumentasi rute utama dan endpoint data yang tersedia pada platform:
                                        </p>

                                        <div className="space-y-2">
                                            <ApiEndpoint
                                                method="GET"
                                                path="/qr/{slug}"
                                                description="Gateway pelacakan scan QR expo publik yang mencatat metrik dan me-redirect pengunjung ke showcase proyek."
                                                params={[
                                                    { name: 'slug', type: 'string', desc: 'Identifier unik slug proyek riset' }
                                                ]}
                                                response={`HTTP/1.1 302 Found\nLocation: /projects/iot-smart-agriculture`}
                                            />

                                            <ApiEndpoint
                                                method="POST"
                                                path="/support"
                                                description="Mengirimkan tiket permohonan bantuan publik dan memicu antrean email 2-arah."
                                                params={[
                                                    { name: 'name', type: 'string', desc: 'Nama lengkap pengirim' },
                                                    { name: 'email', type: 'string', desc: 'Alamat email valid' },
                                                    { name: 'subject', type: 'string', desc: 'Judul subjek tiket' },
                                                    { name: 'category', type: 'string', desc: 'general | technical | feature | bug' },
                                                    { name: 'message', type: 'string', desc: 'Isi lengkap pesan tiket' },
                                                ]}
                                                response={`{\n  "status": "success",\n  "ticket_number": "STAS-20260915-A1B2",\n  "message": "Tiket Anda berhasil dikirim."\n}`}
                                            />

                                            <ApiEndpoint
                                                method="POST"
                                                path="/admin/support-tickets/{id}/reply"
                                                description="Mengirimkan balasan email resmi dari admin ke pengirim tiket dan memperbarui status tiket."
                                                params={[
                                                    { name: 'message', type: 'string', desc: 'Teks balasan email resmi' },
                                                    { name: 'status', type: 'string', desc: 'open | in_progress | resolved | closed' },
                                                ]}
                                                response={`{\n  "status": "success",\n  "message": "Balasan email berhasil dikirim ke pengirim tiket."\n}`}
                                            />
                                        </div>
                                    </DocSection>

                                    {/* ═══════ 14. FAQ ═══════ */}
                                    <DocSection id="faq" icon={LifeBuoy} title="14. Pertanyaan yang Sering Diajukan (FAQ)">
                                        <div className="space-y-3">
                                            <FaqItem
                                                question="Bagaimana cara membuat Brosur Lipat Tiga (Trifold Brochure)?"
                                                answer="Pilih format 'Trifold Brochure' saat membuat proyek baru. Sistem akan secara otomatis menginisiasi 3 panel terpisah (Cover Luar, Panel Dalam, Panel Belakang) yang tersinkronisasi atomik dalam basis data."
                                            />
                                            <FaqItem
                                                question="Bagaimana cara menambahkan peneliti dan nomor paten HKI ke lembar flyer?"
                                                answer="Buka tab 'Peneliti & HKI' pada formulir proyek. Anda dapat memilih dosen peneliti dari master data direktori dan menetapkan perannya sebagai Ketua (PI) atau Anggota, serta mengisi nomor pendaftaran paten resmi Ditjen KI."
                                            />
                                            <FaqItem
                                                question="Apakah pengiriman email memperlambat waktu respons aplikasi?"
                                                answer="Tidak. Seluruh kelas pengiriman email di STAS RG Projects mengimplementasikan antarmuka ShouldQueue, sehingga pengiriman dieksekusi di latar belakang oleh Queue Worker tanpa membebani browser pengguna."
                                            />
                                            <FaqItem
                                                question="Bagaimana cara mengaktifkan integrasi Google Gemini AI?"
                                                answer="Masukkan API key Gemini Anda pada menu Pengaturan → Konfigurasi AI di panel admin atau definisikan variabel GEMINI_API_KEY pada file .env, kemudian gunakan tombol 'Uji Koneksi AI'."
                                            />
                                            <FaqItem
                                                question="Apa yang terjadi jika proyek riset tidak sengaja terhapus?"
                                                answer="Platform menggunakan mekanisme SoftDeletes. Data proyek tidak dihapus permanen dari basis data, sehingga tautan fisik kode QR pada materi cetak pameran tetap aman dan dapat dipulihkan kapan saja oleh administrator."
                                            />
                                        </div>
                                    </DocSection>

                                    {/* ═══════ END BANNER ═══════ */}
                                    <div className="mt-16 p-8 rounded-3xl bg-gradient-to-br from-[#0AB600]/10 via-[#0AB600]/5 to-transparent border border-[#0AB600]/25 text-center">
                                        <div className="w-14 h-14 rounded-2xl bg-[#0AB600]/10 border border-[#0AB600]/30 flex items-center justify-center mx-auto mb-4">
                                            <BookOpen className="w-7 h-7 text-[#0AB600]" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                            Pusat Dokumentasi Terpadu CoE STAS-RG
                                        </h3>
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6 max-w-md mx-auto">
                                            Hubungi tim teknis laboratorium jika Anda membutuhkan panduan integrasi khusus atau bantuan implementasi.
                                        </p>
                                        <div className="flex flex-wrap items-center justify-center gap-3">
                                            <Link
                                                href="/support"
                                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0AB600] hover:bg-[#089600] text-white text-sm font-semibold transition-all shadow-xs"
                                            >
                                                <LifeBuoy className="w-4 h-4" />
                                                <span>Kirim Tiket Bantuan</span>
                                            </Link>
                                            <Link
                                                href="/login"
                                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-sm font-medium border border-zinc-200 dark:border-zinc-700 shadow-xs transition-all"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                                <span>Masuk ke Dashboard</span>
                                            </Link>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                <Footer />

                {/* Back to Top Button */}
                {showBackToTop && (
                    <button
                        type="button"
                        onClick={scrollToTop}
                        className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full bg-[#0AB600] hover:bg-[#089600] text-white shadow-lg flex items-center justify-center transition-all animate-in fade-in zoom-in-50 duration-200 cursor-pointer"
                        aria-label="Back to top"
                    >
                        <ArrowUp className="w-5 h-5" />
                    </button>
                )}
            </div>
        </>
    );
}

/* ═══════════════════ EXPORTED PAGE COMPONENT ═══════════════════ */
export default function Documentation() {
    return (
        <AppProvider>
            <DocsContent />
        </AppProvider>
    );
}
