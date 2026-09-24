import React, { useState, useMemo, useEffect } from 'react';
import { Link, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
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
    ExternalLink,
    X,
    CornerDownLeft
} from 'lucide-react';
import { useApp } from '../Context/AppContext';
import { stripHtml } from '../Utils/text';

export default function CatalogFeatureSection({ stats = {}, projects = [] }) {
    const { language } = useApp();
    const isId = language !== 'en';

    const [searchQuery, setSearchQuery] = useState('');

    // Dynamically derive ONLY existing categories from actual published projects
    const availableCategories = useMemo(() => {
        if (projects && projects.length > 0) {
            const counts = {};
            projects.forEach((p) => {
                const cat = (p.category || '').trim();
                if (cat) {
                    counts[cat] = (counts[cat] || 0) + 1;
                }
            });

            const list = Object.entries(counts).map(([name, count]) => ({
                id: name,
                name: name,
                count: count,
            }));

            if (list.length > 0) {
                return list;
            }
        }

        return [{ id: 'Smart Agriculture', name: 'Smart Agriculture', count: 1 }];
    }, [projects]);

    const [selectedCategory, setSelectedCategory] = useState(() => {
        if (projects && projects.length > 0 && projects[0].category) {
            return projects[0].category;
        }
        return 'Smart Agriculture';
    });

    useEffect(() => {
        if (availableCategories.length > 0) {
            const exists = availableCategories.some((c) => c.id === selectedCategory);
            if (!exists) {
                setSelectedCategory(availableCategories[0].id);
            }
        }
    }, [availableCategories, selectedCategory]);

    // Fallback sample catalog entries for rich live demonstration
    const fallbackProjects = [
        {
            id: 101,
            name: 'Autonomous Hydroponic Greenhouse Monitoring with LoRa & AI',
            slug: 'autonomous-hydroponic-greenhouse-monitoring',
            category: 'Smart Agriculture',
            trl: 'TRL 7 • Terverifikasi',
            desc: isId
                ? 'Sistem kendali iklim mikro presisi dan prediksi nutrisi tanaman secara mandiri berbasis sensor terdistribusi.'
                : 'Precision microclimate control system with automated nutrient prediction based on distributed IoT sensors.'
        },
        {
            id: 102,
            name: 'Industrial LoRaWAN Gateway & SCADA Sensor Mesh Node',
            slug: 'industrial-lorawan-gateway-scada',
            category: 'IoT & Embedded Systems',
            trl: 'TRL 8 • Siap Industri',
            desc: isId
                ? 'Gateway multi-kanal untuk telemetri industri dengan enkripsi AES-128 dan efisiensi konsumsi daya ultra rendah.'
                : 'Multi-channel gateway for industrial telemetry with AES-128 encryption and ultra-low power consumption.'
        },
        {
            id: 103,
            name: 'Computer Vision Defect Detection & Smart Sorter for Manufacturing',
            slug: 'cv-defect-detection-smart-sorter',
            category: 'AI & Machine Learning',
            trl: 'TRL 6 • Uji Coba Lapangan',
            desc: isId
                ? 'Deteksi anomali cacat permukaan produk manufaktur real-time berbasis Deep Convolutional Neural Network.'
                : 'Real-time manufacturing surface defect anomaly detection powered by Deep Convolutional Neural Networks.'
        },
        {
            id: 104,
            name: 'Hybrid Micro-Hydro & Solar MPPT Energy Harvester',
            slug: 'hybrid-micro-hydro-solar-mppt',
            category: 'Green Energy',
            trl: 'TRL 7 • Teruji di Lapangan',
            desc: isId
                ? 'Konverter energi hibrida terbarukan dengan algoritma Maximum Power Point Tracking adaptif untuk kawasan 3T.'
                : 'Renewable hybrid energy converter with adaptive MPPT algorithms designed for remote rural monitoring.'
        }
    ];

    // Combine real projects with fallbacks
    const allAvailableProjects = useMemo(() => {
        if (projects && projects.length > 0) {
            return projects.map((p) => ({
                id: p.id,
                name: p.name || p.title,
                slug: p.slug,
                category: p.category || 'Smart Agriculture',
                trl: 'TRL 7 • Terverifikasi',
                desc: stripHtml(p.description || p.subtitle) || (isId ? 'Dokumentasi riset & inovasi CoE STAS-RG.' : 'CoE STAS-RG research & innovation documentation.')
            }));
        }
        return fallbackProjects;
    }, [projects, isId]);

    // Live filtered project preview based on active state
    const currentPreviewProject = useMemo(() => {
        let filtered = allAvailableProjects;

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (p) =>
                    p.name.toLowerCase().includes(q) ||
                    p.category.toLowerCase().includes(q) ||
                    p.desc.toLowerCase().includes(q)
            );
        } else if (selectedCategory && selectedCategory !== 'all') {
            const catMatches = filtered.filter(
                (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
            );
            if (catMatches.length > 0) {
                filtered = catMatches;
            }
        }

        return filtered[0] || (fallbackProjects.find(p => p.category.toLowerCase() === selectedCategory.toLowerCase()) || fallbackProjects[0]);
    }, [allAvailableProjects, searchQuery, selectedCategory]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const queryParams = new URLSearchParams();
        if (searchQuery.trim()) {
            queryParams.set('search', searchQuery.trim());
        }
        if (selectedCategory && selectedCategory !== 'all') {
            queryParams.set('category', selectedCategory);
        }
        router.visit(`/katalog?${queryParams.toString()}`);
    };

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
            <div className="absolute bottom-0 right-0 w-80 sm:w-120 h-80 sm:h-120 bg-[#0AB600]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                
                {/* Main Card Container */}
                <div className="rounded-3xl bg-white dark:bg-[#0E1524] border border-zinc-200/80 dark:border-zinc-800/80 p-6 sm:p-10 lg:p-12 shadow-xl shadow-zinc-200/40 dark:shadow-none overflow-hidden relative">
                    
                    {/* Decorative Top Accent Line */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#0AB600]" />

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
                                            <span className="text-[#0AB600]">
                                                Interaktif dengan Faceted Search
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            Interactive Research Catalog <br />
                                            <span className="text-[#0AB600]">
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
                                
                                {/* Interactive Live Search Input Form */}
                                <form onSubmit={handleSearchSubmit} className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-mono flex items-center gap-1.5">
                                            <span>Filter Cepat</span>
                                        </span>
                                        <span className="text-[10px] font-bold text-[#0AB600] bg-[#0AB600]/10 px-2 py-0.5 rounded-md border border-[#0AB600]/20 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#0AB600] animate-pulse" />
                                            <span>Live Search</span>
                                        </span>
                                    </div>
                                    <div className="relative flex items-center">
                                        <Search className="w-4 h-4 text-zinc-400 absolute left-3 pointer-events-none" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder={isId ? 'Ketik nama peneliti, kategori, atau teknologi...' : 'Search researcher, category, or tech...'}
                                            className="w-full pl-9 pr-10 py-2.5 text-xs bg-white dark:bg-zinc-800/90 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0AB600]/40 focus:border-[#0AB600] shadow-2xs transition-all"
                                        />
                                        {searchQuery ? (
                                            <button
                                                type="button"
                                                onClick={() => setSearchQuery('')}
                                                className="absolute right-2.5 p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer"
                                                title="Hapus pencarian"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        ) : (
                                            <button
                                                type="submit"
                                                className="absolute right-2 p-1.5 rounded-lg bg-[#0AB600] text-white hover:bg-[#089600] transition-colors cursor-pointer shadow-xs"
                                                title="Cari di katalog"
                                            >
                                                <ArrowRight className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                </form>

                                {/* Category Badges Interactive Preview */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block">
                                            {isId ? 'Pilih Bidang Fokus Riset:' : 'Choose Research Focus:'}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {availableCategories.map((cat) => {
                                            const isSelected = selectedCategory === cat.id && !searchQuery;
                                            return (
                                                <button
                                                    type="button"
                                                    key={cat.id}
                                                    onClick={() => {
                                                        setSelectedCategory(cat.id);
                                                        setSearchQuery('');
                                                    }}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all group shadow-2xs cursor-pointer ${
                                                        isSelected
                                                            ? 'bg-[#0AB600] text-white border border-[#0AB600] shadow-md shadow-[#0AB600]/25'
                                                            : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:text-[#0AB600] dark:hover:text-white border border-zinc-200 dark:border-zinc-700 hover:border-[#0AB600]/40'
                                                    }`}
                                                >
                                                    <Tag className={`w-3 h-3 ${isSelected ? 'text-white' : 'text-[#0AB600] group-hover:scale-110 transition-transform'}`} />
                                                    <span>{cat.name}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Live Reactive Project Card Preview */}
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentPreviewProject.id || currentPreviewProject.slug}
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -6 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Link
                                            href={`/katalog?search=${encodeURIComponent(currentPreviewProject.name)}`}
                                            className="block p-4 rounded-xl bg-white dark:bg-zinc-800/90 border border-zinc-200 dark:border-zinc-700 hover:border-[#0AB600] dark:hover:border-[#0AB600] transition-all group shadow-xs"
                                        >
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#0AB600]/10 text-[#0AB600] border border-[#0AB600]/20">
                                                    {currentPreviewProject.category}
                                                </span>
                                                <span className="text-[10px] font-mono text-zinc-400">
                                                    {currentPreviewProject.trl}
                                                </span>
                                            </div>
                                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#0AB600] transition-colors leading-snug">
                                                {currentPreviewProject.name}
                                            </h4>
                                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                                                {currentPreviewProject.desc}
                                            </p>
                                            <div className="flex items-center justify-between pt-3 mt-3 border-t border-zinc-100 dark:border-zinc-700/60 text-[11px] font-semibold text-[#0AB600]">
                                                <span>{isId ? 'Buka pencarian ini di katalog' : 'Search this in catalog'}</span>
                                                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </Link>
                                    </motion.div>
                                </AnimatePresence>

                                {/* Direct Counter Banner */}
                                <div className="p-3 rounded-xl bg-[#0AB600]/10 border border-[#0AB600]/20 flex items-center justify-between text-xs">
                                    <span className="text-slate-800 dark:text-zinc-200 font-medium">
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
