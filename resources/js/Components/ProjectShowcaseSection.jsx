import React, { useState, useMemo } from 'react';
import { Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FolderKanban,
    Eye,
    ExternalLink,
    Search,
    Calendar,
    CheckCircle2,
    Wrench,
    Lightbulb,
    QrCode,
    Globe,
    ChevronRight,
    Building2,
    Layers,
    ArrowRight
} from 'lucide-react';
import { useApp } from '../Context/AppContext';
import { stripHtml } from '../Utils/text';

export default function ProjectShowcaseSection({ projects = [] }) {
    const { t, language } = useApp();
    const showcaseT = t?.showcase || {};

    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Extract unique categories from published projects
    const categories = useMemo(() => {
        const set = new Set();
        projects.forEach((p) => {
            if (p.category) set.add(p.category);
        });
        return ['all', ...Array.from(set)];
    }, [projects]);

    // Filter projects
    const filteredProjects = useMemo(() => {
        return projects.filter((project) => {
            const matchesCategory =
                selectedCategory === 'all' ||
                (project.category && project.category.toLowerCase() === selectedCategory.toLowerCase());
            
            const matchesSearch =
                !searchQuery ||
                (project.name && project.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (project.title && project.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (project.category && project.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (project.subtitle && project.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (project.description && stripHtml(project.description).toLowerCase().includes(searchQuery.toLowerCase()));

            return matchesCategory && matchesSearch;
        });
    }, [projects, selectedCategory, searchQuery]);

    return (
        <section id="projects-showcase" className="py-10 sm:py-20 md:py-28 relative overflow-hidden bg-white dark:bg-[#090F1B] border-t border-b border-zinc-200/80 dark:border-zinc-800/80">
            {/* Ambient Background Glow Effect (Subtle SaaS light) */}
            <div className="ambient-glow" style={{ filter: 'blur(64px)', WebkitFilter: 'blur(64px)' }} />

            <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 relative z-10">
                
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.5 }}
                    className="text-center max-w-3xl mx-auto mb-8 sm:mb-16"
                >
                    <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                        {showcaseT.titlePart1 || 'Showcase Inovasi & Riset'} <br className="hidden sm:inline" />
                        <span className="text-[#0AB600]">
                            {showcaseT.titlePart2 || 'CoE STAS-RG'}
                        </span>
                    </h2>

                    <p className="mt-2.5 sm:mt-4 text-xs sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                        {showcaseT.subtitle || 'Jelajahi inovasi teknologi, prototipe cerdas, dan publikasi hasil riset terapan unggulan yang dikembangkan oleh tim peneliti STAS-RG.'}
                    </p>
                </motion.div>

                {/* Filter Controls & Search (Only shown when there is published projects data) */}
                {projects.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-30px' }}
                        transition={{ duration: 0.45, delay: 0.1 }}
                        className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-10 pb-4 sm:pb-6 border-b border-zinc-200/70 dark:border-zinc-800/70"
                    >
                        {/* Category Filter Pills */}
                        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1.5 md:pb-0 scrollbar-none">
                            {categories.map((cat) => (
                                <motion.button
                                    key={cat}
                                    type="button"
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                                        selectedCategory === cat
                                            ? 'bg-[#0AB600] text-white shadow-md shadow-black/20'
                                            : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                                    }`}
                                >
                                    {cat === 'all' ? (showcaseT.allCategories || 'Semua Kategori') : cat}
                                </motion.button>
                            ))}
                        </div>

                        {/* Search Input */}
                        <div className="w-full md:w-72 relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={showcaseT.searchPlaceholder || 'Cari riset atau inovasi...'}
                                className="w-full pl-8 sm:pl-9 pr-3.5 sm:pr-4 py-1.5 sm:py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-[#0AB600]"
                            />
                            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-400 absolute left-2.5 sm:left-3 top-2 sm:top-2.5 pointer-events-none" />
                        </div>
                    </motion.div>
                )}

                {/* Projects Card Grid */}
                {filteredProjects.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="rounded-2xl sm:rounded-3xl bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 p-8 sm:p-12 text-center max-w-lg mx-auto"
                    >
                        <img
                            src="/assets/img/icon/notfound.png"
                            alt="Tidak Ditemukan"
                            className="w-20 sm:w-32 h-auto object-contain mx-auto mb-3 sm:mb-4 drop-shadow-xs"
                        />
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-1">
                            {searchQuery || (selectedCategory !== 'all' && projects.length > 0)
                                ? (showcaseT.emptySearchTitle || 'Project Tidak Ditemukan')
                                : (showcaseT.emptyStateTitle || 'Belum Ada Riset Dipublikasikan')}
                        </h3>
                        <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto mb-3">
                            {searchQuery
                                ? (showcaseT.emptySearchDesc
                                    ? showcaseT.emptySearchDesc.replace('{query}', searchQuery)
                                    : `Tidak ada project yang cocok dengan "${searchQuery}". Silakan coba kata kunci lain.`)
                                : (selectedCategory !== 'all' && projects.length > 0)
                                    ? `Tidak ada project pada kategori "${selectedCategory}".`
                                    : (showcaseT.emptyStateDesc || 'Project riset yang telah diverifikasi dan dipublikasikan akan segera ditampilkan di sini.')}
                        </p>
                        {projects.length > 0 && (searchQuery || selectedCategory !== 'all') && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedCategory('all');
                                }}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-200/80 dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-[#0AB600] hover:text-white transition-all cursor-pointer"
                            >
                                <span>{showcaseT.resetFilter || 'Reset Filter & Pencarian'}</span>
                            </button>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        layout
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-7"
                    >
                        <AnimatePresence mode="popLayout">
                            {filteredProjects.map((project, index) => (
                                <motion.div
                                    key={project.slug || project.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    whileHover={{ y: -6 }}
                                    transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.25) }}
                                    className="group bg-white dark:bg-[#121824] rounded-2xl sm:rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden shadow-xs hover:shadow-xl hover:border-[#0AB600]/40 dark:hover:border-[#0AB600]/30 transition-shadow duration-300 flex flex-col justify-between"
                                >
                                    <div>
                                        {/* Thumbnail Banner with direct link */}
                                        <Link
                                            href={`/showcase/${project.slug}`}
                                            className="block h-40 sm:h-52 bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden border-b border-zinc-100 dark:border-zinc-800"
                                        >
                                            {project.main_image ? (
                                                <img
                                                    src={project.main_image}
                                                    alt={project.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400">
                                                    <FolderKanban className="w-8 h-8 sm:w-10 sm:h-10 mb-1.5 sm:mb-2 opacity-50" />
                                                    <span className="text-[11px] sm:text-xs font-medium">{showcaseT.prototypeFallback || 'STAS-RG Prototype'}</span>
                                                </div>
                                            )}

                                            {/* Category & Kotak Badge */}
                                            <div className="absolute top-2.5 sm:top-3.5 left-2.5 sm:left-3.5 right-2.5 sm:right-3.5 flex items-center justify-between pointer-events-none">
                                                {project.category && (
                                                    <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold bg-black/60 text-white backdrop-blur-md border border-white/10 uppercase tracking-wider inline-flex items-center gap-1 sm:gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-[#0AB600]"></span>
                                                        <span>{project.category}</span>
                                                    </span>
                                                )}
                                                {project.problem_solution?.panel_index !== undefined && (
                                                    <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-extrabold bg-[#0AB600]/90 text-white backdrop-blur-md border border-white/20 uppercase tracking-wider">
                                                        Kotak {Number(project.problem_solution.panel_index) + 1}
                                                    </span>
                                                )}
                                            </div>
                                        </Link>

                                        {/* Card Body */}
                                        <div className="p-3.5 sm:p-5 md:p-6 space-y-2 sm:space-y-3">
                                            {/* Partner / Subtitle */}
                                            {project.subtitle && (
                                                <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold text-[#0AB600]">
                                                    <Building2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                                                    <span className="truncate">{project.subtitle}</span>
                                                </div>
                                            )}

                                            {/* Project Title */}
                                            <h3 className="text-sm sm:text-base md:text-lg font-extrabold text-slate-900 dark:text-white uppercase tracking-tight line-clamp-1 group-hover:text-[#0AB600] dark:group-hover:text-[#0AB600] transition-colors">
                                                <Link href={`/showcase/${project.slug}`}>
                                                    {project.title || project.name}
                                                </Link>
                                            </h3>

                                            {/* Description */}
                                            {project.description && stripHtml(project.description) && (
                                                <p className="text-[11px] sm:text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                                                    {stripHtml(project.description)}
                                                </p>
                                            )}

                                            {/* Problem / Solution Snippet Pills */}
                                            {project.problem_solution && (
                                                <div className="pt-1.5 sm:pt-2 flex flex-wrap gap-1 sm:gap-1.5">
                                                    {project.problem_solution.problem && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-[9px] sm:text-[10px] font-medium">
                                                            <Lightbulb className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-rose-500" />
                                                            <span className="truncate max-w-[170px] sm:max-w-[200px]">{showcaseT.challengeResolved || 'Tantangan Teratasi'}</span>
                                                        </span>
                                                    )}
                                                    {project.benefits?.content && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg bg-[#0AB600]/10 text-[#0AB600] text-[9px] sm:text-[10px] font-medium">
                                                            <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#0AB600]" />
                                                            <span className="truncate max-w-[170px] sm:max-w-[200px]">{showcaseT.benefitsProven || 'Manfaat Teruji'}</span>
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Card Footer & Action Button (Detail Riset) */}
                                    <div className="p-3.5 sm:p-5 md:p-6 pt-0 mt-3 sm:mt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2.5 sm:gap-3">
                                        <Link
                                            href={`/showcase/${project.slug}`}
                                            className="inline-flex items-center justify-center gap-1.5 sm:gap-2 flex-1 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-[#0AB600] hover:bg-[#089600] text-white text-[11px] sm:text-xs font-bold shadow-sm shadow-black/20 transition-all cursor-pointer group/btn"
                                        >
                                            <span>{showcaseT.viewDetail || 'Lihat Detail Riset'}</span>
                                            <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                                        </Link>

                                        {project.project_url && (
                                            <a
                                                href={project.project_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                title={showcaseT.externalLinkTitle || 'Tautan Video / Riset Eksternal'}
                                                className="p-2 sm:p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors shrink-0"
                                            >
                                                <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                            </a>
                                        )}
                                    </div>

                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* Explore Full Interactive Catalog CTA */}
                {projects.length > 0 && (
                    <div className="mt-12 text-center">
                        <Link
                            href="/katalog"
                            className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-[#0AB600] hover:from-emerald-500 hover:to-[#089600] text-white text-xs sm:text-sm font-bold transition-all shadow-md hover:shadow-lg shadow-emerald-900/20 active:scale-98 group cursor-pointer"
                        >
                            <FolderKanban className="w-4 h-4 text-white" />
                            <span>{language === 'en' ? 'Explore Complete Interactive Research Catalog' : 'Jelajahi Seluruh Katalog & Filter Riset'}</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                )}

            </div>
        </section>
    );
}

