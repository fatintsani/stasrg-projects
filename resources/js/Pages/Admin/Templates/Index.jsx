import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { useApp } from '../../../Context/AppContext';
import { useAlert } from '../../../Context/AlertContext';
import { A4Document } from '../../../Components/Admin/ProjectPreview';
import PreviewPanZoomContainer from '../../../Components/Admin/PreviewPanZoomContainer';
import { getDocumentFormat, getColorTheme, getDesignStyle } from '../../../Utils/layoutPresets';
import {
    LayoutTemplate,
    Plus,
    Search,
    Sparkles,
    Copy,
    Edit3,
    Trash2,
    CheckCircle2,
    FilePlus2,
    Layers,
    Filter,
    FileText,
    Eye,
    Tag,
    SlidersHorizontal,
    RotateCcw,
    BookmarkCheck,
    Palette,
    Check,
    X,
    ZoomIn,
    ZoomOut,
    Maximize2,
    History,
} from 'lucide-react';
import VersionHistoryModal from '../../../Components/Admin/VersionHistoryModal';

export default function Index({ templates = [], categories = [], filters = {} }) {
    const { t } = useApp();
    const { showConfirm, showAlert } = useAlert();

    const [search, setSearch] = useState(filters.search || '');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || 'all');
    const [typeFilter, setTypeFilter] = useState(filters.type || 'all');
    const [previewModalTemplate, setPreviewModalTemplate] = useState(null);
    const [versionModalTemplate, setVersionModalTemplate] = useState(null);
    const [previewZoom, setPreviewZoom] = useState(100);

    const applyFilters = (overrides = {}) => {
        const nextSearch = overrides.search !== undefined ? overrides.search : search;
        const nextCategory = overrides.category !== undefined ? overrides.category : categoryFilter;
        const nextType = overrides.type !== undefined ? overrides.type : typeFilter;

        const params = {};
        if (nextSearch) params.search = nextSearch;
        if (nextCategory && nextCategory !== 'all') params.category = nextCategory;
        if (nextType && nextType !== 'all') params.type = nextType;

        router.get('/templates', params, { preserveState: true, replace: true });
    };

    const handleSearchSubmit = (e) => {
        if (e) e.preventDefault();
        applyFilters({ search });
    };

    const handleResetFilters = () => {
        setSearch('');
        setCategoryFilter('all');
        setTypeFilter('all');
        router.get('/templates', {}, { preserveState: true, replace: true });
    };

    const handleDuplicate = async (template) => {
        const confirmed = await showConfirm(
            'Duplikasi Template?',
            `Apakah Anda ingin menduplikasi template "${template.name}" menjadi template kustom baru?`
        );
        if (confirmed) {
            router.post(`/templates/${template.slug || template.id}/duplicate`);
        }
    };

    const handleDelete = async (template) => {
        const confirmed = await showConfirm(
            'Hapus Template?',
            `Apakah Anda yakin ingin menghapus template "${template.name}"? Tindakan ini tidak dapat dibatalkan.`
        );
        if (confirmed) {
            router.delete(`/templates/${template.slug || template.id}`);
        }
    };

    const isFilterActive = Boolean(search || categoryFilter !== 'all' || typeFilter !== 'all');

    return (
        <AdminLayout>
            <Head title="Katalog Template Project - CoE STAS-RG" />

            <div className="space-y-6">
                {/* Header Banner */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 shadow-xs relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-gradient-to-bl from-[#0AB600]/10 via-teal-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

                    <div className="space-y-1 z-10 flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 mb-1">
                            <div className="p-2 rounded-xl bg-[#0AB600]/10 border border-[#0AB600]/30 text-[#0AB600] shrink-0">
                                <LayoutTemplate className="w-5 h-5" />
                            </div>
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                                Katalog & Pembuat Template Project
                            </h1>
                        </div>
                        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
                            Pilih template desain siap pakai atau buat custom template sendiri dengan format, tema warna, dan gaya tata letak visual kanvas sesuai kebutuhan publikasi riset Anda.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 shrink-0 z-10">
                        <Link
                            href="/templates/create"
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0AB600] hover:bg-[#099600] text-white text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Buat Template Baru</span>
                        </Link>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="p-4 rounded-2xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-3">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
                        {/* Search Input */}
                        <form onSubmit={handleSearchSubmit} className="relative w-full lg:w-96">
                            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari template, gaya, kategori..."
                                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#0AB600]/20 focus:border-[#0AB600]"
                            />
                        </form>

                        {/* Filter Pills */}
                        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-start lg:justify-end">
                            {/* Type Filter */}
                            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200/60 dark:border-zinc-800 text-xs">
                                <button
                                    type="button"
                                    onClick={() => { setTypeFilter('all'); applyFilters({ type: 'all' }); }}
                                    className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                                        typeFilter === 'all'
                                            ? 'bg-white dark:bg-zinc-800 text-[#0AB600] font-bold shadow-2xs'
                                            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                                    }`}
                                >
                                    Semua ({templates.length})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setTypeFilter('system'); applyFilters({ type: 'system' }); }}
                                    className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                                        typeFilter === 'system'
                                            ? 'bg-white dark:bg-zinc-800 text-[#0AB600] font-bold shadow-2xs'
                                            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                                    }`}
                                >
                                    Official System
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setTypeFilter('custom'); applyFilters({ type: 'custom' }); }}
                                    className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                                        typeFilter === 'custom'
                                            ? 'bg-white dark:bg-zinc-800 text-[#0AB600] font-bold shadow-2xs'
                                            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                                    }`}
                                >
                                    Custom Saya
                                </button>
                            </div>

                            {/* Category Dropdown */}
                            {categories.length > 0 && (
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => { setCategoryFilter(e.target.value); applyFilters({ category: e.target.value }); }}
                                    className="px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-[#0AB600]/20"
                                >
                                    <option value="all">Semua Kategori</option>
                                    {categories.map((cat, idx) => (
                                        <option key={idx} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            )}

                            {isFilterActive && (
                                <button
                                    type="button"
                                    onClick={handleResetFilters}
                                    className="p-2 rounded-xl text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 border border-zinc-200 dark:border-zinc-800 transition-colors cursor-pointer"
                                    title="Reset Filter"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Templates Grid */}
                {templates.length === 0 ? (
                    <div className="text-center py-12 px-4 bg-white dark:bg-[#121824] rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 space-y-3">
                        <img
                            src="/assets/img/icon/notfound.png"
                            alt="Tidak Ada Template"
                            className="w-28 sm:w-32 h-auto object-contain mx-auto mb-2 drop-shadow-xs"
                        />
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            Tidak ada template yang ditemukan
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                            Coba ubah kata kunci pencarian atau buat template kustom baru pertama Anda.
                        </p>
                        {isFilterActive ? (
                            <button
                                type="button"
                                onClick={handleResetFilters}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-900 dark:text-white text-xs font-semibold transition-all cursor-pointer"
                            >
                                <RotateCcw className="w-4 h-4" />
                                <span>Reset Filter</span>
                            </button>
                        ) : (
                            <Link
                                href="/templates/create"
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0AB600] text-white text-xs font-bold shadow-xs hover:bg-[#099600] transition-all cursor-pointer"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Buat Template Baru</span>
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {templates.map((tpl) => {
                            const formatCfg = getDocumentFormat(tpl.doc_format);
                            const themeCfg = getColorTheme(tpl.color_theme);
                            const styleCfg = getDesignStyle(tpl.design_style);

                            // Construct a dummy project preview object
                            const previewProject = {
                                id: tpl.id,
                                slug: tpl.slug,
                                name: tpl.name,
                                title: tpl.default_data?.title || tpl.name,
                                subtitle: tpl.default_data?.subtitle || 'CoE STAS-RG Template',
                                description: tpl.default_data?.description || tpl.description || '',
                                category: tpl.category || 'General',
                                doc_format: tpl.doc_format || 'a4_flyer',
                                layout_preset: tpl.layout_preset || 'balanced',
                                design_style: tpl.design_style || 'classic_standard',
                                color_theme: tpl.color_theme || 'stas_official',
                                print_mode: tpl.print_mode || 'light',
                                benefits: tpl.default_data?.benefits,
                                specifications: tpl.default_data?.specifications,
                                problem_solution: tpl.default_data?.problem_solution,
                                footer_website: tpl.default_data?.footer_website || 'www.stas-rg.com',
                                footer_instagram: tpl.default_data?.footer_instagram || '@stas.rg',
                                footer_youtube: tpl.default_data?.footer_youtube || '@stas_rg',
                                social_links: tpl.default_data?.social_links || [
                                    { platform: 'website', value: tpl.default_data?.footer_website || 'www.stas-rg.com' },
                                    { platform: 'instagram', value: tpl.default_data?.footer_instagram || '@stas.rg' },
                                    { platform: 'youtube', value: tpl.default_data?.footer_youtube || '@stas_rg' },
                                ],
                                project_url: 'https://www.stas-rg.com',
                                layout_schema: tpl.layout_schema || null,
                            };

                            return (
                                <div
                                    key={tpl.id}
                                    className="group rounded-2xl bg-white dark:bg-[#121824] border border-zinc-200/90 dark:border-zinc-800 hover:border-[#0AB600]/60 dark:hover:border-[#0AB600]/60 hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden"
                                >
                                    {/* Card Top Preview Box */}
                                    <div className="relative p-3 bg-gradient-to-b from-zinc-100 to-zinc-200/80 dark:from-zinc-900 dark:to-zinc-950 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-center overflow-hidden h-64">
                                        {/* Scaled Canvas Preview with exact calculated container */}
                                        {(() => {
                                            const availableHeight = 220;
                                            const availableWidth = 340;
                                            const s = Math.min(availableHeight / formatCfg.canvasHeight, availableWidth / formatCfg.canvasWidth);
                                            const scaledW = formatCfg.canvasWidth * s;
                                            const scaledH = formatCfg.canvasHeight * s;

                                            return (
                                                <div 
                                                    className="relative rounded-sm shadow-md transition-transform duration-300 group-hover:scale-105 border border-black/10 dark:border-white/10 shrink-0"
                                                    style={{
                                                        width: `${scaledW}px`,
                                                        height: `${scaledH}px`,
                                                        overflow: 'hidden',
                                                    }}
                                                >
                                                    <div
                                                        className="pointer-events-none select-none"
                                                        style={{
                                                            width: `${formatCfg.canvasWidth}px`,
                                                            height: `${formatCfg.canvasHeight}px`,
                                                            transform: `scale(${s})`,
                                                            transformOrigin: 'top left',
                                                        }}
                                                    >
                                                        <A4Document project={previewProject} isLive={true} id={`tpl-mini-${tpl.id}`} />
                                                    </div>
                                                </div>
                                            );
                                        })()}

                                        {/* Floating Format Badge */}
                                        <div className="absolute top-3 left-3 z-10">
                                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xs text-slate-800 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700 shadow-2xs">
                                                {formatCfg.name}
                                            </span>
                                        </div>

                                        {/* System / Custom Badge */}
                                        <div className="absolute top-3 right-3 z-10">
                                            {tpl.is_system ? (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#0AB600] text-white shadow-xs">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    <span>Official</span>
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-600 text-white shadow-xs">
                                                    <span>Custom</span>
                                                </span>
                                            )}
                                        </div>

                                        {/* Quick Preview Hover Trigger */}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setPreviewZoom(100);
                                                    setPreviewModalTemplate(previewProject);
                                                }}
                                                className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-900 text-slate-900 dark:text-white text-xs font-bold shadow-md hover:scale-105 transition-all flex items-center gap-1.5 cursor-pointer"
                                            >
                                                <Eye className="w-3.5 h-3.5 text-[#0AB600]" />
                                                <span>Preview Penuh</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Card Content & Details */}
                                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between text-[11px] text-zinc-500">
                                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                                    {tpl.category || 'General'}
                                                </span>
                                                {tpl.usage_count > 0 && (
                                                    <span>Digunakan {tpl.usage_count}x</span>
                                                )}
                                            </div>

                                            <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-[#0AB600] transition-colors">
                                                {tpl.name}
                                            </h3>

                                            <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                                                {tpl.description || 'Template proyek siap pakai dengan struktur dan tata letak optimal.'}
                                            </p>
                                        </div>

                                        {/* Tags & Palette Indicators */}
                                        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
                                            <div className="flex items-center gap-1.5">
                                                <span 
                                                    className="w-3 h-3 rounded-full border border-white dark:border-zinc-800 shadow-2xs" 
                                                    style={{ backgroundColor: themeCfg.primary }}
                                                    title={themeCfg.name}
                                                />
                                                <span className="text-[11px] font-medium">{themeCfg.name}</span>
                                            </div>

                                            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                                {tpl.layout_preset}
                                            </span>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="pt-2 flex items-center gap-2">
                                            <Link
                                                href={`/projects/create?template=${tpl.slug || tpl.id}`}
                                                className="flex-1 py-2 px-3 rounded-xl bg-[#0AB600] hover:bg-[#099600] text-white text-xs font-bold text-center shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                            >
                                                <FilePlus2 className="w-3.5 h-3.5" />
                                                <span>Gunakan Template</span>
                                            </Link>

                                            <button
                                                type="button"
                                                onClick={() => handleDuplicate(tpl)}
                                                className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
                                                title="Duplikasi Template"
                                            >
                                                <Copy className="w-3.5 h-3.5" />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setVersionModalTemplate(tpl)}
                                                className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
                                                title="Lihat Riwayat Versi Template"
                                            >
                                                <History className="w-3.5 h-3.5 text-[#0AB600]" />
                                            </button>

                                            <Link
                                                href={`/templates/${tpl.slug || tpl.id}/edit`}
                                                className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
                                                title="Edit Template"
                                            >
                                                <Edit3 className="w-3.5 h-3.5" />
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(tpl)}
                                                className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 transition-colors cursor-pointer"
                                                title="Hapus Template"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Full Canvas Preview Modal with Zoom & Pan Controls */}
            {previewModalTemplate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#121824] rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 shrink-0">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-xl bg-[#0AB600]/10 flex items-center justify-center text-[#0AB600] shrink-0">
                                    <LayoutTemplate className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                            {previewModalTemplate.title || previewModalTemplate.name}
                                        </h3>
                                        <span className="text-[10px] bg-[#0AB600]/10 text-[#0AB600] font-mono font-bold px-2 py-0.5 rounded shrink-0">
                                            {previewModalTemplate.doc_format}
                                        </span>
                                    </div>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                                        Pratinjau presisi tinggi ({previewModalTemplate.doc_format} • {previewModalTemplate.design_style} • {previewModalTemplate.color_theme})
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                                {/* Zoom Controls inside Modal */}
                                <div className="inline-flex items-center bg-white dark:bg-zinc-800 rounded-xl p-1 border border-zinc-200 dark:border-zinc-700 shadow-2xs">
                                    <button
                                        type="button"
                                        onClick={() => setPreviewZoom((z) => Math.max(40, z - 15))}
                                        disabled={previewZoom <= 40}
                                        className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-30 transition-colors cursor-pointer"
                                        title="Zoom Out (Perkecil)"
                                    >
                                        <ZoomOut className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPreviewZoom(100)}
                                        className="px-2.5 py-1 text-xs font-mono font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer"
                                        title="Reset Zoom 100%"
                                    >
                                        {previewZoom}%
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPreviewZoom((z) => Math.min(200, z + 15))}
                                        disabled={previewZoom >= 200}
                                        className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-30 transition-colors cursor-pointer"
                                        title="Zoom In (Perbesar)"
                                    >
                                        <ZoomIn className="w-4 h-4" />
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setPreviewModalTemplate(null)}
                                    className="p-2 rounded-xl text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                                    title="Tutup Preview"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Canvas Viewport with Pan & Zoom */}
                        <div className="flex-1 overflow-hidden bg-zinc-950/20 dark:bg-zinc-950/70 p-2 sm:p-4 flex items-center justify-center relative">
                            <PreviewPanZoomContainer
                                zoom={previewZoom}
                                maxHeight="100%"
                                onResetZoom={() => setPreviewZoom(100)}
                            >
                                <A4Document project={previewModalTemplate} isLive={true} id="tpl-modal-preview" />
                            </PreviewPanZoomContainer>
                        </div>

                        {/* Modal Footer Actions */}
                        <div className="px-5 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 flex items-center justify-between gap-3 shrink-0">
                            <span className="text-xs text-zinc-500 hidden sm:inline">
                                Gunakan scroll atau drag untuk menggeser tampilan saat diperbesar.
                            </span>
                            <div className="flex items-center gap-2 ml-auto">
                                <button
                                    type="button"
                                    onClick={() => setPreviewModalTemplate(null)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-slate-700 dark:text-zinc-300"
                                >
                                    Tutup
                                </button>
                                <Link
                                    href={`/projects/create?template=${previewModalTemplate.slug || previewModalTemplate.id}`}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0AB600] hover:bg-[#099600] text-white text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
                                >
                                    <FilePlus2 className="w-4 h-4" />
                                    <span>Gunakan Template Ini</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Template Version History Modal */}
            {versionModalTemplate && (
                <VersionHistoryModal
                    isOpen={Boolean(versionModalTemplate)}
                    onClose={() => setVersionModalTemplate(null)}
                    modelType="template"
                    modelId={versionModalTemplate.slug || versionModalTemplate.id}
                    modelName={versionModalTemplate.name}
                    onRollbackSuccess={() => {
                        setVersionModalTemplate(null);
                        router.reload();
                    }}
                />
            )}
        </AdminLayout>
    );
}
