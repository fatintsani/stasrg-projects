import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    FolderKanban,
    Search,
    SlidersHorizontal,
    Filter,
    Calendar,
    Users,
    FileText,
    ArrowRight,
    Sparkles,
    CheckCircle2,
    Layers,
    Tag,
    ExternalLink
} from 'lucide-react';
import { useApp } from '../Context/AppContext';

export default function CatalogFeatureSection({ stats = {} }) {
    const { language } = useApp();
    const isId = language !== 'en';

    const [activeTab, setActiveTab] = useState('all');

    const sampleCategories = [
        { id: 'Smart Agriculture', name: isId ? 'Smart Agriculture' : 'Smart Agriculture', count: 12, color: 'emerald' },
        { id: 'IoT & Embedded', name: isId ? 'IoT & Embedded Systems' : 'IoT & Embedded Systems', count: 8, color: 'blue' },
        { id: 'AI & Data Science', name: isId ? 'AI & Machine Learning' : 'AI & Machine Learning', count: 6, color: 'purple' },
        { id: 'Green Tech & Energy', name: isId ? 'Green Energy' : 'Green Energy', count: 4, color: 'amber' },
    ];

    const capabilities = [
        {
            icon: SlidersHorizontal,
            title: isId ? 'Faceted Multi-Filter' : 'Faceted Multi-Filter',
            desc: isId ? 'Saring proyek secara instan berdasarkan bidang fokus riset, tahun publikasi, status kesiapan, hingga laboratorium.' : 'Filter research dynamically by field, publication year, maturity status, and laboratory.'
        },
        {
            icon: Users,
            title: isId ? 'Konektivitas Peneliti' : 'Researcher Connectivity',
            desc: isId ? 'Temukan profil dosen, ketua peneliti (PI), dan anggota tim riset yang memimpin setiap inovasi.' : 'Explore profiles of Principal Investigators and research teams behind each innovation.'
        },
        {
            icon: FileText,
            title: isId ? 'Dokumen & Flyer Digital' : 'Digital A4 & Flyers',
            desc: isId ? 'Akses langsung lembar informasi resmi A4, ringkasan eksekutif, dan spesifikasi teknis teruji.' : 'Instant access to official A4 info sheets, executive summaries, and tested technical specifications.'
        }
    ];

    return (
        <section id="katalog-section" className="py-14 sm:py-24 relative overflow-hidden bg-[#FAFBFD] dark:bg-[#070D18] border-b border-zinc-200/80 dark:border-zinc-800/80">
            {/* Ambient Background Lights */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-72 sm:w-96 h-72 sm:h-96 bg-[#0AB600]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-80 sm:w-120 h-80 sm:h-120 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                
                {/* Main Card Container */}
                <div className="rounded-3xl bg-white dark:bg-[#0E1524] border border-zinc-200/80 dark:border-zinc-800/80 p-6 sm:p-10 lg:p-12 shadow-xl shadow-zinc-200/40 dark:shadow-none overflow-hidden relative">
                    
                    {/* Decorative Top Gradient Line */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-emerald-500 via-[#0AB600] to-teal-400" />

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                        
                        {/* LEFT COLUMN: Narrative & Action (Span 7) */}
                        <div className="lg:col-span-7 space-y-6">
                            
                            {/* Section Badge */}
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0AB600]/10 border border-[#0AB600]/25 text-[#0AB600] text-xs font-bold">
                                <FolderKanban className="w-3.5 h-3.5" />
                                <span>{isId ? 'Pusat Direktori & Penjelajah Riset' : 'Public Research Repository'}</span>
                            </div>

                            {/* Headline */}
                            <div className="space-y-3">
                                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                                    {isId ? (
                                        <>
                                            Katalog Riset & Inovasi Publik <br />
                                            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#0AB600] to-teal-500">
                                                Interaktif dengan Faceted Search
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            Interactive Research Catalog <br />
                                            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#0AB600] to-teal-500">
                                                With Dynamic Faceted Filtering
                                            </span>
                                        </>
                                    )}
                                </h2>

                                <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-2xl">
                                    {isId
                                        ? 'Temukan seluruh repositori proyek ilmiah, prototipe teknologi, dan publikasi resmi CoE STAS-RG Telkom University. Telusuri berdasarkan bidang keahlian, status kematangan riset, dan tim peneliti secara terpadu.'
                                        : 'Explore the full repository of scientific research, technology prototypes, and official publications of CoE STAS-RG Telkom University with instant faceted searching.'}
                                </p>
                            </div>

                            {/* Feature Capability Highlights (3 Cards) */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                                {capabilities.map((cap, idx) => {
                                    const Icon = cap.icon;
                                    return (
                                        <div key={idx} className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60 space-y-1.5">
                                            <div className="w-8 h-8 rounded-xl bg-[#0AB600]/10 text-[#0AB600] flex items-center justify-center">
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                                                {cap.title}
                                            </h4>
                                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
                                                {cap.desc}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* CTA Action Buttons */}
                            <div className="flex flex-wrap items-center gap-3 pt-3">
                                <Link
                                    href="/katalog"
                                    className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#0AB600] hover:bg-[#089600] text-white text-xs sm:text-sm font-bold shadow-lg shadow-[#0AB600]/25 hover:shadow-xl hover:shadow-[#0AB600]/30 active:scale-98 transition-all group cursor-pointer"
                                >
                                    <FolderKanban className="w-4 h-4 text-white" />
                                    <span>{isId ? 'Buka Katalog Riset Interaktif' : 'Open Interactive Catalog'}</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>

                                <a
                                    href="#projects-showcase"
                                    className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                                >
                                    <Layers className="w-4 h-4 text-zinc-500" />
                                    <span>{isId ? 'Lihat Showcase Beranda' : 'View Showcase'}</span>
                                </a>
                            </div>

                        </div>

                        {/* RIGHT COLUMN: Interactive Catalog Mockup & Category Pills (Span 5) */}
                        <div className="lg:col-span-5">
                            <div className="p-5 sm:p-6 rounded-2xl bg-linear-to-b from-zinc-50 to-zinc-100/60 dark:from-zinc-900/80 dark:to-zinc-950 border border-zinc-200/80 dark:border-zinc-800 shadow-inner space-y-4">
                                
                                {/* Mock Search Bar Header */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-1.5">
                                            <Search className="w-3.5 h-3.5 text-[#0AB600]" />
                                            <span>Simulasi Filter Cepat</span>
                                        </span>
                                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200/50">
                                            Live Search
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            readOnly
                                            value={isId ? 'Ketik nama peneliti, kategori, atau teknologi...' : 'Search researcher, category, or tech...'}
                                            className="w-full pl-9 pr-4 py-2.5 text-xs bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-400 dark:text-zinc-400 cursor-pointer shadow-2xs"
                                        />
                                        <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                                    </div>
                                </div>

                                {/* Category Badges Interactive Preview */}
                                <div className="space-y-2">
                                    <span className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block">
                                        {isId ? 'Pilih Bidang Fokus Riset:' : 'Choose Research Focus:'}
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {sampleCategories.map((cat) => (
                                            <Link
                                                key={cat.id}
                                                href={`/katalog?category=${encodeURIComponent(cat.id)}`}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-[#0AB600] dark:hover:bg-[#0AB600] text-slate-700 dark:text-zinc-200 hover:text-white dark:hover:text-white border border-zinc-200 dark:border-zinc-700 text-xs font-medium transition-all group shadow-2xs cursor-pointer"
                                            >
                                                <Tag className="w-3 h-3 text-[#0AB600] group-hover:text-white" />
                                                <span>{cat.name}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>

                                {/* Live Mock Project Card Preview */}
                                <Link
                                    href="/katalog"
                                    className="block p-4 rounded-xl bg-white dark:bg-zinc-800/90 border border-zinc-200 dark:border-zinc-700 hover:border-[#0AB600] transition-all group shadow-xs"
                                >
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-[#0AB600] border border-[#0AB600]/20">
                                            Smart Agriculture
                                        </span>
                                        <span className="text-[10px] font-mono text-zinc-400">
                                            TRL 7 • Terverifikasi
                                        </span>
                                    </div>
                                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#0AB600] transition-colors leading-snug">
                                        Autonomous Hydroponic Greenhouse Monitoring with LoRa & AI
                                    </h4>
                                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                                        Sistem kendali iklim mikro presisi dan prediksi nutrisi tanaman secara mandiri berbasis sensor terdistribusi.
                                    </p>
                                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-zinc-100 dark:border-zinc-700/60 text-[11px] font-semibold text-[#0AB600]">
                                        <span>{isId ? 'Buka detail di katalog' : 'View in catalog'}</span>
                                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </Link>

                                {/* Direct Counter Banner */}
                                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
                                    <span className="text-emerald-800 dark:text-emerald-300 font-medium">
                                        {isId ? 'Tersedia di penjelajah katalog lengkap:' : 'Available in the full catalog explorer:'}
                                    </span>
                                    <Link
                                        href="/katalog"
                                        className="font-bold text-[#0AB600] hover:underline flex items-center gap-1"
                                    >
                                        <span>{stats?.published_projects || stats?.total_projects || 'Semua'} Proyek</span>
                                        <ArrowRight className="w-3 h-3" />
                                    </Link>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </section>
    );
}
