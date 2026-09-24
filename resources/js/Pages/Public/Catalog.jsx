import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
    Search,
    Filter,
    FolderKanban,
    Calendar,
    Users,
    Award,
    BookOpen,
    ExternalLink,
    QrCode,
    Maximize2,
    Eye,
    LayoutGrid,
    List,
    RotateCcw,
    Sparkles,
    ArrowRight,
    Building2,
    CheckCircle2,
    Lightbulb,
    FileText,
    Share2,
    Check,
    X,
    SlidersHorizontal,
    ChevronDown,
    Layers,
    Globe,
    Zap,
    Download,
    Printer,
    FileCheck,
    Hash
} from 'lucide-react';
import { AppProvider, useApp } from '../../Context/AppContext';
import Navbar from '../../Components/Navbar';
import Footer from '../../Components/Footer';
import AiChatWidget from '../../Components/AiChatWidget';
import ProjectPreview from '../../Components/Admin/ProjectPreview';
import PreviewPanZoomContainer from '../../Components/Admin/PreviewPanZoomContainer';
import { DOCUMENT_FORMATS } from '../../Utils/layoutPresets';
import { stripHtml } from '../../Utils/text';

function CatalogContent({ projects = [], facets = {}, stats = {}, filters = {} }) {
    const { t, language } = useApp();
    const searchInputRef = useRef(null);

    // Filter States initialized from server props or defaults
    const [searchQuery, setSearchQuery] = useState(filters.q || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || 'all');
    const [selectedYear, setSelectedYear] = useState(filters.year || 'all');
    const [selectedResearcher, setSelectedResearcher] = useState(filters.researcher || 'all');
    const [selectedFormat, setSelectedFormat] = useState(filters.format || 'all');
    const [filterHasPatent, setFilterHasPatent] = useState(filters.has_patent || false);
    const [filterHasDoi, setFilterHasDoi] = useState(filters.has_doi || false);
    const [sortBy, setSortBy] = useState(filters.sort || 'newest');
    const [viewMode, setViewMode] = useState(filters.view || 'grid'); // 'grid' | 'list'

    // UI state for mobile filter drawer & quick modals
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const [quickQrProject, setQuickQrProject] = useState(null);
    const [quickPreviewProject, setQuickPreviewProject] = useState(null);
    const [previewZoom, setPreviewZoom] = useState(100);
    const [copiedShareLink, setCopiedShareLink] = useState(false);

    // Keyboard shortcut to focus search input with '/'
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === '/' && document.activeElement !== searchInputRef.current && !['input', 'textarea', 'select'].includes(document.activeElement?.tagName?.toLowerCase())) {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Filter and Sort Engine (Instant Client-Side Filtering)
    const filteredProjects = useMemo(() => {
        return projects.filter((project) => {
            // 1. Text Search Filter
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const titleMatch = (project.title || '').toLowerCase().includes(q);
                const nameMatch = (project.name || '').toLowerCase().includes(q);
                const subtitleMatch = (project.subtitle || '').toLowerCase().includes(q);
                const categoryMatch = (project.category || '').toLowerCase().includes(q);
                const descMatch = (stripHtml(project.description || '')).toLowerCase().includes(q);
                const labMatch = (project.lab_affiliation || '').toLowerCase().includes(q);
                const patentMatch = (project.patent_number || '').toLowerCase().includes(q);
                const doiMatch = (project.publication_doi || '').toLowerCase().includes(q);

                const teamMatch = Array.isArray(project.research_team) && project.research_team.some(
                    (m) => (m.name || '').toLowerCase().includes(q) || (m.role || '').toLowerCase().includes(q)
                );

                const problemMatch = project.problem_solution && (
                    (project.problem_solution.problem && stripHtml(project.problem_solution.problem).toLowerCase().includes(q)) ||
                    (project.problem_solution.solution && stripHtml(project.problem_solution.solution).toLowerCase().includes(q))
                );

                if (!titleMatch && !nameMatch && !subtitleMatch && !categoryMatch && !descMatch && !labMatch && !patentMatch && !doiMatch && !teamMatch && !problemMatch) {
                    return false;
                }
            }

            // 2. Category Filter
            if (selectedCategory !== 'all') {
                if (!project.category || project.category.toLowerCase() !== selectedCategory.toLowerCase()) {
                    return false;
                }
            }

            // 3. Year Filter
            if (selectedYear !== 'all') {
                if (String(project.created_year) !== String(selectedYear)) {
                    return false;
                }
            }

            // 4. Researcher Filter
            if (selectedResearcher !== 'all') {
                const isMember = Array.isArray(project.research_team) && project.research_team.some(
                    (m) => (m.name || '').toLowerCase() === selectedResearcher.toLowerCase()
                );
                if (!isMember) return false;
            }

            // 5. Document Format Filter
            if (selectedFormat !== 'all') {
                if (project.doc_format !== selectedFormat) {
                    return false;
                }
            }

            // 6. Special Flag: Has Patent
            if (filterHasPatent && (!project.patent_number || project.patent_number.trim() === '')) {
                return false;
            }

            // 7. Special Flag: Has DOI / Publication
            if (filterHasDoi && (!project.publication_doi || project.publication_doi.trim() === '')) {
                return false;
            }

            return true;
        }).sort((a, b) => {
            if (sortBy === 'newest') {
                return new Date(b.created_at_iso || 0) - new Date(a.created_at_iso || 0);
            }
            if (sortBy === 'oldest') {
                return new Date(a.created_at_iso || 0) - new Date(b.created_at_iso || 0);
            }
            if (sortBy === 'title_asc') {
                return (a.title || a.name || '').localeCompare(b.title || b.name || '');
            }
            if (sortBy === 'title_desc') {
                return (b.title || b.name || '').localeCompare(a.title || a.name || '');
            }
            if (sortBy === 'most_complete') {
                const scoreA = (a.patent_number ? 3 : 0) + (a.publication_doi ? 3 : 0) + (a.project_url ? 2 : 0) + (a.main_image ? 2 : 0);
                const scoreB = (b.patent_number ? 3 : 0) + (b.publication_doi ? 3 : 0) + (b.project_url ? 2 : 0) + (b.main_image ? 2 : 0);
                return scoreB - scoreA;
            }
            return 0;
        });
    }, [projects, searchQuery, selectedCategory, selectedYear, selectedResearcher, selectedFormat, filterHasPatent, filterHasDoi, sortBy]);

    // Check if any filter is active
    const hasActiveFilters = searchQuery.trim() !== '' ||
        selectedCategory !== 'all' ||
        selectedYear !== 'all' ||
        selectedResearcher !== 'all' ||
        selectedFormat !== 'all' ||
        filterHasPatent ||
        filterHasDoi;

    const handleResetFilters = () => {
        setSearchQuery('');
        setSelectedCategory('all');
        setSelectedYear('all');
        setSelectedResearcher('all');
        setSelectedFormat('all');
        setFilterHasPatent(false);
        setFilterHasDoi(false);
        setSortBy('newest');
    };

    const handleShareCatalogLink = () => {
        if (typeof window === 'undefined') return;
        const url = new URL(window.location.origin + '/katalog');
        if (searchQuery) url.searchParams.set('q', searchQuery);
        if (selectedCategory !== 'all') url.searchParams.set('category', selectedCategory);
        if (selectedYear !== 'all') url.searchParams.set('year', selectedYear);
        if (selectedResearcher !== 'all') url.searchParams.set('researcher', selectedResearcher);
        if (selectedFormat !== 'all') url.searchParams.set('format', selectedFormat);
        if (filterHasPatent) url.searchParams.set('has_patent', '1');
        if (filterHasDoi) url.searchParams.set('has_doi', '1');
        if (sortBy !== 'newest') url.searchParams.set('sort', sortBy);
        if (viewMode !== 'grid') url.searchParams.set('view', viewMode);

        navigator.clipboard.writeText(url.toString());
        setCopiedShareLink(true);
        setTimeout(() => setCopiedShareLink(false), 2500);
    };

    return (
        <>
            <Head title={language === 'en' ? 'Interactive Research Catalog - STAS-RG' : 'Katalog Riset Publik & Penjelajah Inovasi - STAS-RG'}>
                <meta
                    name="description"
                    content="Jelajahi repositori katalog riset terpadu, prototipe teknologi cerdas, publikasi ilmiah terindeks, dan paten terdaftar Center of Excellence STAS-RG."
                />
            </Head>

            <div className="min-h-screen flex flex-col bg-[#FAFBFD] dark:bg-[#070D18] text-slate-900 dark:text-slate-100 selection:bg-[#0AB600]/20 selection:text-[#0AB600] font-sans antialiased transition-colors">
                <Navbar />

                <main className="flex-grow">
                    {/* Hero & Search Header */}
                    <div className="relative bg-white dark:bg-[#0B1220] border-b border-zinc-200/80 dark:border-zinc-800/80 py-10 sm:py-14 overflow-hidden">
                        {/* Ambient Background Light */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden">
                            <div className="absolute -top-32 left-1/4 w-96 h-96 bg-[#0AB600]/10 rounded-full blur-3xl" />
                            <div className="absolute -top-32 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
                        </div>

                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
                            {/* Top Badge & Action Bar */}
                            <div className="flex items-center justify-between flex-wrap gap-3">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0AB600]/10 border border-[#0AB600]/25 text-[#0AB600] text-xs font-bold">
                                    <FolderKanban className="w-3.5 h-3.5" />
                                    <span>{language === 'en' ? 'Public Research Repository' : 'Direktori & Penjelajah Riset'}</span>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleShareCatalogLink}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer border border-zinc-200/80 dark:border-zinc-700/80 shadow-2xs ml-auto"
                                    title="Salin tautan katalog beserta filter aktif"
                                >
                                    {copiedShareLink ? <Check className="w-3.5 h-3.5 text-[#0AB600]" /> : <Share2 className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />}
                                    <span>{copiedShareLink ? 'Tautan Tersalin!' : 'Bagikan Filter'}</span>
                                </button>
                            </div>

                            {/* Hero Headline */}
                            <div className="max-w-3xl space-y-2">
                                <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                                    Katalog Riset Publik{' '}
                                    <span className="text-[#0AB600]">STAS-RG</span>
                                </h1>
                                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    Jelajahi inovasi teknologi, prototipe IoT, paten HKI, publikasi terindeks, dan flyer riset terstandarisasi yang dikembangkan oleh civitas peneliti Center of Excellence STAS-RG.
                                </p>
                            </div>

                            {/* Search Bar Input */}
                            <div className="pt-2 max-w-3xl">
                                <div className="relative flex items-center">
                                    <Search className="w-5 h-5 text-zinc-400 absolute left-4 pointer-events-none" />
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Cari judul proyek, topik inovasi, nomor paten, DOI, atau nama peneliti... (Tekan '/' untuk fokus)"
                                        className="w-full pl-12 pr-12 py-3.5 sm:py-4 text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-700/80 rounded-2xl text-slate-900 dark:text-white placeholder-zinc-400 shadow-sm focus:outline-hidden focus:border-[#0AB600] focus:ring-2 focus:ring-[#0AB600]/20 transition-all"
                                    />
                                    {searchQuery ? (
                                        <button
                                            type="button"
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-4 p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer"
                                            title="Hapus pencarian"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    ) : (
                                        <kbd className="hidden sm:inline-block absolute right-4 px-2 py-0.5 text-[10px] font-mono font-bold text-zinc-400 bg-zinc-200 dark:bg-zinc-800 rounded border border-zinc-300 dark:border-zinc-700">
                                            /
                                        </kbd>
                                    )}
                                </div>
                            </div>

                            {/* Metrics Summary Strip */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 pt-2">
                                <div className="p-3 sm:p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-900/40 border border-zinc-200/70 dark:border-zinc-800 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#0AB600]/10 flex items-center justify-center text-[#0AB600] shrink-0">
                                        <FolderKanban className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                                            {stats.total_projects || projects.length}
                                        </div>
                                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400">Total Proyek Publik</div>
                                    </div>
                                </div>

                                <div className="p-3 sm:p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-900/40 border border-zinc-200/70 dark:border-zinc-800 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                                        <Award className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                                            {stats.total_patents || 0}
                                        </div>
                                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400">Paten &amp; HKI Terdaftar</div>
                                    </div>
                                </div>

                                <div className="p-3 sm:p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-900/40 border border-zinc-200/70 dark:border-zinc-800 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                                        <BookOpen className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                                            {stats.total_publications || 0}
                                        </div>
                                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400">Publikasi DOI</div>
                                    </div>
                                </div>

                                <div className="p-3 sm:p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-900/40 border border-zinc-200/70 dark:border-zinc-800 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                                            {stats.total_researchers || facets.researchers?.length || 0}
                                        </div>
                                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400">Peneliti Terlibat</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Explorer Body: Facets Filter Sidebar + Catalog Grid/List */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                            
                            {/* Desktop Faceted Search Sidebar */}
                            <aside className="hidden lg:block lg:col-span-1 space-y-6">
                                <div className="sticky top-24 bg-white dark:bg-[#121824] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-5 shadow-sm space-y-6">
                                    {/* Sidebar Header */}
                                    <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                                        <div className="flex items-center gap-2">
                                            <SlidersHorizontal className="w-4 h-4 text-[#0AB600]" />
                                            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                                Filter Dinamis
                                            </h3>
                                        </div>
                                        {hasActiveFilters && (
                                            <button
                                                type="button"
                                                onClick={handleResetFilters}
                                                className="text-[11px] font-semibold text-rose-500 hover:underline cursor-pointer flex items-center gap-1"
                                            >
                                                <RotateCcw className="w-3 h-3" />
                                                <span>Reset</span>
                                            </button>
                                        )}
                                    </div>

                                    {/* 1. Bidang Riset / Kategori */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider">
                                            Bidang Riset
                                        </label>
                                        <div className="space-y-1 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedCategory('all')}
                                                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition-colors cursor-pointer ${
                                                    selectedCategory === 'all'
                                                        ? 'bg-[#0AB600] text-white font-bold'
                                                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                                }`}
                                            >
                                                <span>Semua Bidang</span>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${selectedCategory === 'all' ? 'bg-black/20 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'}`}>
                                                    {projects.length}
                                                </span>
                                            </button>

                                            {(facets.categories || []).map((cat) => (
                                                <button
                                                    key={cat.name}
                                                    type="button"
                                                    onClick={() => setSelectedCategory(cat.name)}
                                                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition-colors cursor-pointer ${
                                                        selectedCategory === cat.name
                                                            ? 'bg-[#0AB600] text-white font-bold'
                                                            : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                                    }`}
                                                >
                                                    <span className="truncate pr-2">{cat.name}</span>
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${selectedCategory === cat.name ? 'bg-black/20 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'}`}>
                                                        {cat.count}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 2. Tahun Riset */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider">
                                            Tahun Publikasi
                                        </label>
                                        <select
                                            value={selectedYear}
                                            onChange={(e) => setSelectedYear(e.target.value)}
                                            className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-[#0AB600]"
                                        >
                                            <option value="all">Semua Tahun</option>
                                            {(facets.years || []).map((y) => (
                                                <option key={y.year} value={y.year}>
                                                    Tahun {y.year} ({y.count} proyek)
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* 3. Peneliti / Authors */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider">
                                            Peneliti / Tim
                                        </label>
                                        <select
                                            value={selectedResearcher}
                                            onChange={(e) => setSelectedResearcher(e.target.value)}
                                            className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-[#0AB600]"
                                        >
                                            <option value="all">Semua Peneliti</option>
                                            {(facets.researchers || []).map((r) => (
                                                <option key={r.name} value={r.name}>
                                                    {r.name} ({r.count} riset)
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* 4. Format Dokumen */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider">
                                            Format Dokumen
                                        </label>
                                        <select
                                            value={selectedFormat}
                                            onChange={(e) => setSelectedFormat(e.target.value)}
                                            className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-[#0AB600]"
                                        >
                                            <option value="all">Semua Format Layout</option>
                                            {(facets.doc_formats || []).map((f) => (
                                                <option key={f.format} value={f.format}>
                                                    {DOCUMENT_FORMATS[f.format]?.name || f.format} ({f.count})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* 5. Filter Khusus (HKI / Publikasi) */}
                                    <div className="space-y-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                        <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider">
                                            Kriteria Khusus
                                        </label>

                                        <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-zinc-300 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={filterHasPatent}
                                                onChange={(e) => setFilterHasPatent(e.target.checked)}
                                                className="w-4 h-4 rounded text-[#0AB600] focus:ring-[#0AB600] border-zinc-300 dark:border-zinc-700 cursor-pointer"
                                            />
                                            <span className="flex items-center gap-1.5">
                                                <Award className="w-3.5 h-3.5 text-amber-500" />
                                                <span>Paten / HKI Terdaftar</span>
                                            </span>
                                        </label>

                                        <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-zinc-300 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={filterHasDoi}
                                                onChange={(e) => setFilterHasDoi(e.target.checked)}
                                                className="w-4 h-4 rounded text-[#0AB600] focus:ring-[#0AB600] border-zinc-300 dark:border-zinc-700 cursor-pointer"
                                            />
                                            <span className="flex items-center gap-1.5">
                                                <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                                                <span>Publikasi Terindeks (DOI)</span>
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            </aside>

                            {/* Catalog Results Column */}
                            <div className="lg:col-span-3 space-y-6">
                                
                                {/* Top Controls Bar: Result Count, Active Chips, Sort, & View Toggle */}
                                <div className="bg-white dark:bg-[#121824] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    {/* Left: Result Counter & Mobile Filter Button */}
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setIsMobileFilterOpen(true)}
                                            className="lg:hidden inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-slate-800 dark:text-white cursor-pointer"
                                        >
                                            <Filter className="w-4 h-4 text-[#0AB600]" />
                                            <span>Filter ({hasActiveFilters ? 'Aktif' : 'Semua'})</span>
                                        </button>

                                        <div className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-zinc-300">
                                            Menampilkan <strong className="text-[#0AB600] font-extrabold">{filteredProjects.length}</strong> dari {projects.length} riset
                                        </div>
                                    </div>

                                    {/* Right: Sort Select & View Mode Toggle */}
                                    <div className="flex items-center gap-3 justify-between sm:justify-end">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:inline">Urutan:</span>
                                            <select
                                                value={sortBy}
                                                onChange={(e) => setSortBy(e.target.value)}
                                                className="px-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-[#0AB600] cursor-pointer"
                                            >
                                                <option value="newest">Terbaru (Default)</option>
                                                <option value="oldest">Terlama</option>
                                                <option value="title_asc">Judul (A–Z)</option>
                                                <option value="title_desc">Judul (Z–A)</option>
                                                <option value="most_complete">Kelengkapan Metadata</option>
                                            </select>
                                        </div>

                                        {/* View Mode Toggle Buttons (Grid vs List) */}
                                        <div className="inline-flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                                            <button
                                                type="button"
                                                onClick={() => setViewMode('grid')}
                                                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                                    viewMode === 'grid' ? 'bg-white dark:bg-zinc-700 text-[#0AB600] shadow-xs' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-white'
                                                }`}
                                                title="Tampilan Grid (Kartu Visual)"
                                            >
                                                <LayoutGrid className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setViewMode('list')}
                                                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                                    viewMode === 'list' ? 'bg-white dark:bg-zinc-700 text-[#0AB600] shadow-xs' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-white'
                                                }`}
                                                title="Tampilan List (Tabel / Rinci)"
                                            >
                                                <List className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Active Filters Chip Bar (if any) */}
                                {hasActiveFilters && (
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-xs font-semibold text-zinc-500">Filter Aktif:</span>
                                        {searchQuery && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-[#0AB600]/10 text-[#0AB600] border border-[#0AB600]/20 font-medium">
                                                <span>Cari: "{searchQuery}"</span>
                                                <button type="button" onClick={() => setSearchQuery('')} className="hover:text-rose-500 cursor-pointer"><X className="w-3 h-3" /></button>
                                            </span>
                                        )}
                                        {selectedCategory !== 'all' && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-[#0AB600]/10 text-[#0AB600] border border-[#0AB600]/20 font-medium">
                                                <span>Bidang: {selectedCategory}</span>
                                                <button type="button" onClick={() => setSelectedCategory('all')} className="hover:text-rose-500 cursor-pointer"><X className="w-3 h-3" /></button>
                                            </span>
                                        )}
                                        {selectedYear !== 'all' && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-zinc-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 font-medium">
                                                <span>Tahun: {selectedYear}</span>
                                                <button type="button" onClick={() => setSelectedYear('all')} className="hover:text-rose-500 cursor-pointer"><X className="w-3 h-3" /></button>
                                            </span>
                                        )}
                                        {selectedResearcher !== 'all' && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 font-medium">
                                                <span>Peneliti: {selectedResearcher}</span>
                                                <button type="button" onClick={() => setSelectedResearcher('all')} className="hover:text-rose-500 cursor-pointer"><X className="w-3 h-3" /></button>
                                            </span>
                                        )}
                                        {selectedFormat !== 'all' && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-zinc-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 font-medium">
                                                <span>Format: {DOCUMENT_FORMATS[selectedFormat]?.name || selectedFormat}</span>
                                                <button type="button" onClick={() => setSelectedFormat('all')} className="hover:text-rose-500 cursor-pointer"><X className="w-3 h-3" /></button>
                                            </span>
                                        )}
                                        {filterHasPatent && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 font-medium">
                                                <span>Paten HKI</span>
                                                <button type="button" onClick={() => setFilterHasPatent(false)} className="hover:text-rose-500 cursor-pointer"><X className="w-3 h-3" /></button>
                                            </span>
                                        )}
                                        {filterHasDoi && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 font-medium">
                                                <span>Publikasi DOI</span>
                                                <button type="button" onClick={() => setFilterHasDoi(false)} className="hover:text-rose-500 cursor-pointer"><X className="w-3 h-3" /></button>
                                            </span>
                                        )}

                                        <button
                                            type="button"
                                            onClick={handleResetFilters}
                                            className="text-xs font-bold text-rose-500 hover:underline px-2 py-1 cursor-pointer"
                                        >
                                            Reset Semua
                                        </button>
                                    </div>
                                )}

                                {/* Zero State (No Results) */}
                                {filteredProjects.length === 0 ? (
                                    <div className="bg-white dark:bg-[#121824] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-12 text-center max-w-lg mx-auto space-y-4">
                                        <img
                                            src="/assets/img/icon/notfound.png"
                                            alt="Tidak Ditemukan"
                                            className="w-28 h-auto object-contain mx-auto opacity-80 drop-shadow-xs"
                                        />
                                        <div className="space-y-1">
                                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                                Tidak Ada Riset yang Cocok
                                            </h3>
                                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                                Kombinasi pencarian atau filter yang Anda pilih tidak menghasilkan proyek riset. Silakan sesuaikan atau bersihkan filter.
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleResetFilters}
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0AB600] hover:bg-[#089600] text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
                                        >
                                            <RotateCcw className="w-3.5 h-3.5" />
                                            <span>Reset Semua Filter &amp; Pencarian</span>
                                        </button>
                                    </div>
                                ) : viewMode === 'grid' ? (
                                    /* GRID VIEW (3 Columns) */
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {filteredProjects.map((project, index) => (
                                            <motion.div
                                                key={project.slug || project.id}
                                                initial={{ opacity: 0, y: 15 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.2) }}
                                                className="group bg-white dark:bg-[#121824] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 overflow-hidden shadow-xs hover:shadow-xl hover:border-[#0AB600]/40 transition-all flex flex-col justify-between"
                                            >
                                                <div>
                                                    {/* Thumbnail Banner */}
                                                    <div className="relative h-48 bg-zinc-100 dark:bg-zinc-800 overflow-hidden border-b border-zinc-100 dark:border-zinc-800">
                                                        <Link href={`/showcase/${project.slug}`} className="block w-full h-full">
                                                            {project.main_image ? (
                                                                <img
                                                                    src={project.main_image}
                                                                    alt={project.name}
                                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400">
                                                                    <FolderKanban className="w-10 h-10 mb-2 opacity-40" />
                                                                    <span className="text-xs font-semibold">STAS-RG Research</span>
                                                                </div>
                                                            )}
                                                        </Link>

                                                        {/* Top Category Badge & Year */}
                                                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                                                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/70 text-white backdrop-blur-md border border-white/10 uppercase tracking-wider inline-flex items-center gap-1.5">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-[#0AB600]" />
                                                                <span>{project.category}</span>
                                                            </span>

                                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-black/60 text-zinc-300 backdrop-blur-md">
                                                                {project.created_year}
                                                            </span>
                                                        </div>

                                                        {/* Floating Quick Action Buttons on Image */}
                                                        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                type="button"
                                                                onClick={() => setQuickQrProject(project)}
                                                                className="p-1.5 rounded-lg bg-white/90 dark:bg-zinc-900/90 hover:bg-white dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 backdrop-blur-md shadow-xs transition-colors cursor-pointer"
                                                                title="Scan QR Code Flyer"
                                                            >
                                                                <QrCode className="w-3.5 h-3.5 text-[#0AB600]" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setQuickPreviewProject(project)}
                                                                className="p-1.5 rounded-lg bg-white/90 dark:bg-zinc-900/90 hover:bg-white dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 backdrop-blur-md shadow-xs transition-colors cursor-pointer"
                                                                title="Pratinjau Flyer Instan"
                                                            >
                                                                <Maximize2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Card Body */}
                                                    <div className="p-4 sm:p-5 space-y-3">
                                                        {/* Partner / Subtitle */}
                                                        {project.subtitle && (
                                                            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#0AB600]">
                                                                <Building2 className="w-3.5 h-3.5 shrink-0" />
                                                                <span className="truncate">{project.subtitle}</span>
                                                            </div>
                                                        )}

                                                        {/* Title */}
                                                        <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white uppercase tracking-tight line-clamp-2 group-hover:text-[#0AB600] transition-colors">
                                                            <Link href={`/showcase/${project.slug}`}>
                                                                {project.title || project.name}
                                                            </Link>
                                                        </h3>

                                                        {/* Description */}
                                                        {project.description && stripHtml(project.description) && (
                                                            <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                                                                {stripHtml(project.description)}
                                                            </p>
                                                        )}

                                                        {/* Patent & DOI Badges */}
                                                        {(project.patent_number || project.publication_doi || project.lab_affiliation) && (
                                                            <div className="flex items-center gap-1.5 flex-wrap pt-1">
                                                                {project.patent_number && (
                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                                                                        <Award className="w-3 h-3 text-amber-500" />
                                                                        <span className="truncate max-w-[120px]">Paten: {project.patent_number}</span>
                                                                    </span>
                                                                )}
                                                                {project.publication_doi && (
                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                                                                        <BookOpen className="w-3 h-3 text-blue-500" />
                                                                        <span className="truncate max-w-[120px]">DOI: {project.publication_doi}</span>
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Research Team Mini Avatars */}
                                                        {Array.isArray(project.research_team) && project.research_team.length > 0 && (
                                                            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                                                                <div className="flex items-center gap-1.5 truncate">
                                                                    <Users className="w-3.5 h-3.5 text-[#0AB600] shrink-0" />
                                                                    <span className="truncate">
                                                                        {project.research_team.map(m => m.name).slice(0, 2).join(', ')}
                                                                        {project.research_team.length > 2 ? ` +${project.research_team.length - 2}` : ''}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Card Footer Actions */}
                                                <div className="p-4 sm:p-5 pt-0 mt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2">
                                                    <Link
                                                        href={`/showcase/${project.slug}`}
                                                        className="inline-flex items-center justify-center gap-1.5 flex-1 px-3.5 py-2 rounded-xl bg-[#0AB600] hover:bg-[#089600] text-white text-xs font-bold shadow-xs transition-all cursor-pointer group/btn"
                                                    >
                                                        <span>Lihat Detail Riset</span>
                                                        <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                                                    </Link>

                                                    {project.project_url && (
                                                        <a
                                                            href={project.project_url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            title="Tautan Video / Eksternal Riset"
                                                            className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors shrink-0"
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    /* LIST / TABLE VIEW */
                                    <div className="space-y-3">
                                        {filteredProjects.map((project, index) => (
                                            <motion.div
                                                key={project.slug || project.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.2, delay: Math.min(index * 0.03, 0.15) }}
                                                className="bg-white dark:bg-[#121824] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-[#0AB600]/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                                            >
                                                <div className="flex items-start gap-4 flex-1">
                                                    {/* Thumbnail */}
                                                    <Link
                                                        href={`/showcase/${project.slug}`}
                                                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-700"
                                                    >
                                                        {project.main_image ? (
                                                            <img src={project.main_image} alt={project.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                                                <FolderKanban className="w-6 h-6 opacity-40" />
                                                            </div>
                                                        )}
                                                    </Link>

                                                    {/* Details */}
                                                    <div className="space-y-1.5 flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0AB600]/10 text-[#0AB600] border border-[#0AB600]/20 uppercase">
                                                                {project.category}
                                                            </span>
                                                            <span className="text-[11px] font-mono text-zinc-400">
                                                                Tahun {project.created_year}
                                                            </span>
                                                            {project.patent_number && (
                                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                                                                    <Award className="w-3 h-3 text-amber-500" />
                                                                    <span>Paten: {project.patent_number}</span>
                                                                </span>
                                                            )}
                                                            {project.publication_doi && (
                                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md">
                                                                    <BookOpen className="w-3 h-3 text-blue-500" />
                                                                    <span>DOI: {project.publication_doi}</span>
                                                                </span>
                                                            )}
                                                        </div>

                                                        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white uppercase truncate">
                                                            <Link href={`/showcase/${project.slug}`} className="hover:text-[#0AB600] transition-colors">
                                                                {project.title || project.name}
                                                            </Link>
                                                        </h3>

                                                        {project.description && (
                                                            <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-1">
                                                                {stripHtml(project.description)}
                                                            </p>
                                                        )}

                                                        {Array.isArray(project.research_team) && project.research_team.length > 0 && (
                                                            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                                                                <Users className="w-3 h-3 text-[#0AB600]" />
                                                                <span>{project.research_team.map(m => m.name).join(', ')}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* List Actions */}
                                                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => setQuickQrProject(project)}
                                                        className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                                                        title="Scan QR Code"
                                                    >
                                                        <QrCode className="w-4 h-4 text-[#0AB600]" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setQuickPreviewProject(project)}
                                                        className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                                                        title="Pratinjau Flyer"
                                                    >
                                                        <Maximize2 className="w-4 h-4" />
                                                    </button>
                                                    <Link
                                                        href={`/showcase/${project.slug}`}
                                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0AB600] hover:bg-[#089600] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                                                    >
                                                        <span>Buka Riset</span>
                                                        <ArrowRight className="w-3.5 h-3.5" />
                                                    </Link>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>

                {/* Quick QR Code Scan Modal */}
                {quickQrProject && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-[#182234] border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-sm shadow-2xl p-6 text-center space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#0AB600]/10 text-[#0AB600]">
                                    <QrCode className="w-3.5 h-3.5" />
                                    <span>Pindai Akses Cepat</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setQuickQrProject(null)}
                                    className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-white cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-4 rounded-2xl bg-white dark:bg-white inline-block shadow-md mx-auto">
                                <QRCodeSVG
                                    value={window.location.origin + `/showcase/${quickQrProject.slug}`}
                                    size={180}
                                    level="H"
                                    includeMargin={false}
                                />
                            </div>

                            <div className="space-y-1">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase line-clamp-1">
                                    {quickQrProject.title || quickQrProject.name}
                                </h4>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                    Pindai menggunakan kamera ponsel untuk membuka halaman showcase interaktif atau membaca flyer riset.
                                </p>
                            </div>

                            <div className="pt-2 flex items-center justify-center gap-2">
                                <Link
                                    href={`/showcase/${quickQrProject.slug}`}
                                    className="w-full py-2.5 px-4 rounded-xl bg-[#0AB600] hover:bg-[#089600] text-white text-xs font-bold transition-all"
                                >
                                    Buka Halaman Riset
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Interactive Flyer Preview Modal */}
                {quickPreviewProject && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-[#182234] border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
                            {/* Preview Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-[#0AB600]/10 flex items-center justify-center text-[#0AB600]">
                                        <Maximize2 className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase truncate max-w-md">
                                            {quickPreviewProject.title || quickPreviewProject.name}
                                        </h3>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                            Format: {DOCUMENT_FORMATS[quickPreviewProject.doc_format]?.name || 'Flyer Riset A4'} ({quickPreviewProject.category})
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/showcase/${quickPreviewProject.slug}`}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0AB600] hover:bg-[#089600] text-white text-xs font-bold transition-all cursor-pointer"
                                    >
                                        <span>Buka Halaman Lengkap</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => setQuickPreviewProject(null)}
                                        className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-white cursor-pointer"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Preview Canvas */}
                            <div className="flex-1 overflow-hidden p-4 sm:p-6 bg-zinc-100/80 dark:bg-zinc-950/80 flex flex-col justify-center">
                                <PreviewPanZoomContainer
                                    zoom={previewZoom}
                                    maxHeight="calc(90vh - 120px)"
                                    className="h-full"
                                    onResetZoom={() => setPreviewZoom(100)}
                                >
                                    <ProjectPreview project={quickPreviewProject} isLive={false} id="catalog-preview-canvas" />
                                </PreviewPanZoomContainer>
                            </div>
                        </div>
                    </div>
                )}

                {/* Mobile Filter Drawer */}
                {isMobileFilterOpen && (
                    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-[#121824] w-full max-w-xs h-full p-5 overflow-y-auto space-y-6 shadow-2xl flex flex-col justify-between">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                                    <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
                                        <SlidersHorizontal className="w-4 h-4 text-[#0AB600]" />
                                        <span>Filter Riset</span>
                                    </div>
                                    <button type="button" onClick={() => setIsMobileFilterOpen(false)} className="p-1 rounded-lg text-zinc-400 hover:text-white cursor-pointer">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Category */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase">Bidang Riset</label>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl"
                                    >
                                        <option value="all">Semua Bidang ({projects.length})</option>
                                        {(facets.categories || []).map(cat => (
                                            <option key={cat.name} value={cat.name}>{cat.name} ({cat.count})</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Year */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase">Tahun</label>
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(e.target.value)}
                                        className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl"
                                    >
                                        <option value="all">Semua Tahun</option>
                                        {(facets.years || []).map(y => (
                                            <option key={y.year} value={y.year}>{y.year} ({y.count})</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Researcher */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase">Peneliti</label>
                                    <select
                                        value={selectedResearcher}
                                        onChange={(e) => setSelectedResearcher(e.target.value)}
                                        className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl"
                                    >
                                        <option value="all">Semua Peneliti</option>
                                        {(facets.researchers || []).map(r => (
                                            <option key={r.name} value={r.name}>{r.name} ({r.count})</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Special Criteria */}
                                <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                                        <input type="checkbox" checked={filterHasPatent} onChange={(e) => setFilterHasPatent(e.target.checked)} className="rounded text-[#0AB600]" />
                                        <span>Paten HKI Terdaftar</span>
                                    </label>
                                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                                        <input type="checkbox" checked={filterHasDoi} onChange={(e) => setFilterHasDoi(e.target.checked)} className="rounded text-[#0AB600]" />
                                        <span>Publikasi Ilmiah (DOI)</span>
                                    </label>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
                                <button
                                    type="button"
                                    onClick={() => setIsMobileFilterOpen(false)}
                                    className="w-full py-2.5 rounded-xl bg-[#0AB600] text-white text-xs font-bold cursor-pointer"
                                >
                                    Terapkan Filter ({filteredProjects.length} Hasil)
                                </button>
                                {hasActiveFilters && (
                                    <button
                                        type="button"
                                        onClick={handleResetFilters}
                                        className="w-full py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                                    >
                                        Reset Filter
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <AiChatWidget />
                <Footer />
            </div>
        </>
    );
}

export default function Catalog({ projects = [], facets = {}, stats = {}, filters = {} }) {
    return (
        <AppProvider>
            <CatalogContent projects={projects} facets={facets} stats={stats} filters={filters} />
        </AppProvider>
    );
}
