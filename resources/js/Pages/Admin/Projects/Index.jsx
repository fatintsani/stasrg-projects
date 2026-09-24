import React, { useState, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { useApp } from '../../../Context/AppContext';
import { useAlert } from '../../../Context/AlertContext';
import { stripHtml } from '../../../Utils/text';
import { A4Document } from '../../../Components/Admin/ProjectPreview';
import { captureFlyerToDataUrl, createZipFromFlyerImages } from '../../../Utils/flyerExport';
import ExportSosmedModal from '../../../Components/Admin/ExportSosmedModal';
import {
    FolderKanban,
    Plus,
    Search,
    Filter,
    Eye,
    Edit3,
    Copy,
    Calendar,
    Trash2,
    CheckCircle2,
    Clock,
    FileText,
    ExternalLink,
    AlertCircle,
    Archive,
    CheckSquare,
    Square,
    LayoutGrid,
    Table2,
    Loader2,
    Layers,
    Check,
    X,
    Sparkles,
    Share2,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    RotateCcw,
    SlidersHorizontal,
    Tag,
} from 'lucide-react';

export default function Index({ projects, categories = [], filters = {} }) {
    const { t, language } = useApp();
    const { showConfirm, showAlert } = useAlert();

    const p = t?.admin?.projects || {};

    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || 'all');
    const [sortField, setSortField] = useState(filters.sort || 'updated_at');
    const [sortDirection, setSortDirection] = useState(filters.direction || 'desc');
    const [deletingId, setDeletingId] = useState(null);
    const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

    // Multi-Selection State
    const [selectedIds, setSelectedIds] = useState([]);

    // Export Sosmed Modal State
    const [activeSosmedProject, setActiveSosmedProject] = useState(null);

    // Batch Export State
    const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
    const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0, currentName: '', statusText: '' });
    const [batchComplete, setBatchComplete] = useState(false);
    const [activeBatchProject, setActiveBatchProject] = useState(null);
    const cancelBatchRef = useRef(false);

    const projectList = projects?.data || [];

    const applyFilters = (overrides = {}) => {
        const nextSearch = overrides.search !== undefined ? overrides.search : search;
        const nextStatus = overrides.status !== undefined ? overrides.status : statusFilter;
        const nextCategory = overrides.category !== undefined ? overrides.category : categoryFilter;
        const nextSort = overrides.sort !== undefined ? overrides.sort : sortField;
        const nextDirection = overrides.direction !== undefined ? overrides.direction : sortDirection;

        const params = {};
        if (nextSearch) params.search = nextSearch;
        if (nextStatus && nextStatus !== 'all') params.status = nextStatus;
        if (nextCategory && nextCategory !== 'all') params.category = nextCategory;
        if (nextSort && (nextSort !== 'updated_at' || nextDirection !== 'desc')) {
            params.sort = nextSort;
            params.direction = nextDirection;
        }

        router.get('/projects', params, { preserveState: true, replace: true });
    };

    const handleSearchSubmit = (e) => {
        if (e) e.preventDefault();
        applyFilters({ search });
    };

    const handleClearSearch = () => {
        setSearch('');
        applyFilters({ search: '' });
    };

    const handleStatusChange = (status) => {
        setStatusFilter(status);
        applyFilters({ status });
    };

    const handleCategoryChange = (category) => {
        setCategoryFilter(category);
        applyFilters({ category });
    };

    const handleSortColumn = (field) => {
        let nextDir = 'asc';
        if (sortField === field) {
            nextDir = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            nextDir = (field === 'created_at' || field === 'updated_at') ? 'desc' : 'asc';
        }
        setSortField(field);
        setSortDirection(nextDir);
        applyFilters({ sort: field, direction: nextDir });
    };

    const handleQuickSortSelect = (val) => {
        const [field, dir] = val.split(':');
        setSortField(field);
        setSortDirection(dir);
        applyFilters({ sort: field, direction: dir });
    };

    const handleResetFilters = () => {
        setSearch('');
        setStatusFilter('all');
        setCategoryFilter('all');
        setSortField('updated_at');
        setSortDirection('desc');
        router.get('/projects', {}, { preserveState: true, replace: true });
    };

    const isFilterActive = Boolean(
        search ||
        statusFilter !== 'all' ||
        categoryFilter !== 'all' ||
        sortField !== 'updated_at' ||
        sortDirection !== 'desc'
    );

    const handleDuplicate = async (slug, name = 'Project') => {
        const title = p.duplicateTitle || 'Duplikasi Project?';
        const message = (p.duplicateMsg || 'Apakah Anda ingin membuat salinan dari project "{name}"? Salinan baru akan dibuat dengan status Draft.').replace('{name}', name);
        const confirmText = p.duplicateConfirm || 'Duplikasi Project';
        const cancelText = p.duplicateCancel || 'Batal';

        const confirmed = await showConfirm({
            title,
            message,
            confirmText,
            cancelText,
            variant: 'primary',
        });
        if (confirmed) {
            router.post(`/projects/${slug}/duplicate`);
        }
    };

    const handleDelete = async (slug, name) => {
        const title = p.deleteTitle || 'Hapus Project?';
        const message = (p.deleteMsg || 'Project "{name}" akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.').replace('{name}', name);
        const confirmText = p.deleteConfirm || 'Hapus Project';
        const cancelText = p.deleteCancel || 'Batal';

        const confirmed = await showConfirm({
            title,
            message,
            confirmText,
            cancelText,
            variant: 'danger',
        });
        if (confirmed) {
            setDeletingId(slug);
            router.delete(`/projects/${slug}`, {
                onFinish: () => {
                    setDeletingId(null);
                    setSelectedIds((prev) => prev.filter((id) => id !== slug && id !== projectList.find(pr => pr.slug === slug)?.id));
                },
            });
        }
    };

    // Selection Handlers
    const isAllSelected = projectList.length > 0 && projectList.every((proj) => selectedIds.includes(proj.id));

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedIds([]);
        } else {
            setSelectedIds(projectList.map((proj) => proj.id));
        }
    };

    const toggleSelectOne = (projectId) => {
        setSelectedIds((prev) =>
            prev.includes(projectId) ? prev.filter((id) => id !== projectId) : [...prev, projectId]
        );
    };

    const deselectAll = () => {
        setSelectedIds([]);
    };

    // Batch Export Engine
    const handleStartBatchExport = async () => {
        if (selectedIds.length === 0) return;

        const selectedProjects = projectList.filter((proj) => selectedIds.includes(proj.id));
        if (selectedProjects.length === 0) return;

        cancelBatchRef.current = false;
        setIsBatchModalOpen(true);
        setBatchComplete(false);
        setBatchProgress({
            current: 0,
            total: selectedProjects.length,
            currentName: '',
            statusText: 'Menyiapkan proses rendering flyer...',
        });

        const capturedFiles = [];

        try {
            for (let i = 0; i < selectedProjects.length; i++) {
                if (cancelBatchRef.current) {
                    break;
                }

                const proj = selectedProjects[i];
                setActiveBatchProject(proj);
                setBatchProgress({
                    current: i + 1,
                    total: selectedProjects.length,
                    currentName: proj.title || proj.name,
                    statusText: `Merender flyer (${i + 1}/${selectedProjects.length})...`,
                });

                // Wait for offscreen DOM element, fonts, and images to settle
                await new Promise((r) => setTimeout(r, 350));

                const canvasElement = document.getElementById('batch-flyer-active-canvas');
                if (canvasElement) {
                    const dataUrl = await captureFlyerToDataUrl(canvasElement);
                    const safeSlug = (proj.slug || proj.name || `project_${proj.id}`)
                        .toLowerCase()
                        .replace(/[^a-z0-9_-]/g, '_');
                    
                    capturedFiles.push({
                        filename: `${safeSlug}_flyer.png`,
                        projectName: proj.title || proj.name,
                        dataUrl,
                    });
                }
            }

            if (cancelBatchRef.current) {
                setIsBatchModalOpen(false);
                setActiveBatchProject(null);
                return;
            }

            setBatchProgress((prev) => ({
                ...prev,
                statusText: 'Mengompresi berkas ke arsip .zip...',
            }));

            const dateStr = new Date().toISOString().slice(0, 10);
            const zipFilename = `STAS-RG_Flyers_Batch_${dateStr}.zip`;

            await createZipFromFlyerImages(capturedFiles, zipFilename);

            setBatchComplete(true);
            setBatchProgress((prev) => ({
                ...prev,
                statusText: 'Arsip ZIP berhasil diunduh!',
            }));
        } catch (error) {
            console.error('Batch export failed:', error);
            setIsBatchModalOpen(false);
            if (showAlert) {
                showAlert('Gagal mengekspor flyer ke ZIP: ' + error.message, 'danger');
            }
        } finally {
            setActiveBatchProject(null);
        }
    };

    const handleCancelBatchExport = () => {
        cancelBatchRef.current = true;
        setIsBatchModalOpen(false);
        setActiveBatchProject(null);
    };

    const handleCloseBatchModal = () => {
        setIsBatchModalOpen(false);
        setBatchComplete(false);
        setSelectedIds([]);
    };

    const getLayoutPresetLabel = (preset) => {
        switch (preset) {
            case 'visual_heavy':
                return 'Visual-Heavy';
            case 'text_heavy':
                return 'Text-Heavy';
            default:
                return 'Balanced';
        }
    };

    return (
        <AdminLayout title={p.pageTitle || 'Semua Project'} currentPath="/projects">
            <div className="space-y-6">
                
                {/* Header Title & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="p-1.5 rounded-lg bg-[#0AB600]/10 text-[#0AB600] border border-[#0AB600]/30">
                                <FolderKanban className="w-5 h-5" />
                            </span>
                            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                                {p.headerTitle || 'Manajemen & Visual Project'}
                            </h1>
                        </div>
                        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                            {p.headerSubtitle || 'Kelola, generate flyer visual standar A4, dan ekspor lembar riset STAS RG secara individu atau batch ZIP.'}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href="/projects/annual-digest"
                            className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer shrink-0"
                        >
                            <FileText className="w-4 h-4 text-[#0AB600]" />
                            <span>Katalog Tahunan (PDF)</span>
                        </Link>
                        <Link
                            href="/projects/create"
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0AB600] hover:bg-[#089600] text-white text-xs sm:text-sm font-semibold shadow-md shadow-black/20 hover:shadow-lg transition-all duration-150 cursor-pointer shrink-0"
                        >
                            <Plus className="w-4 h-4" />
                            <span>{p.createButton || 'Buat Project Baru'}</span>
                        </Link>
                    </div>
                </div>

                {/* Filters, Search, Sort & View Toolbar (1 Jajar) */}
                <div className="bg-white dark:bg-[#121824] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-4 shadow-sm space-y-3">
                    <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 overflow-x-auto pb-0.5">
                        
                        {/* Status Filter Tabs */}
                        <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-900/80 p-1 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 shrink-0">
                            {[
                                { key: 'all', label: p.tabAll || 'Semua' },
                                { key: 'published', label: p.tabPublished || 'Published' },
                                { key: 'draft', label: p.tabDraft || 'Draft' },
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => handleStatusChange(tab.key)}
                                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                                        statusFilter === tab.key
                                            ? 'bg-white dark:bg-zinc-800 text-[#0AB600] font-bold shadow-xs'
                                            : 'text-zinc-500 hover:text-slate-900 dark:hover:text-zinc-300'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Search, Category, Sort & View Controls */}
                        <div className="flex items-center gap-2 shrink-0">
                            {/* Category Filter Dropdown */}
                            <div className="relative shrink-0">
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => handleCategoryChange(e.target.value)}
                                    className="pl-3 pr-8 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-[#0AB600] cursor-pointer"
                                >
                                    <option value="all">Semua Kategori</option>
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Sort Dropdown */}
                            <div className="relative shrink-0">
                                <select
                                    value={`${sortField}:${sortDirection}`}
                                    onChange={(e) => handleQuickSortSelect(e.target.value)}
                                    className="pl-3 pr-8 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-[#0AB600] cursor-pointer"
                                >
                                    <option value="updated_at:desc">Terbaru Diperbarui</option>
                                    <option value="updated_at:asc">Terlama Diperbarui</option>
                                    <option value="created_at:desc">Terbaru Dibuat</option>
                                    <option value="name:asc">Nama (A &rarr; Z)</option>
                                    <option value="name:desc">Nama (Z &rarr; A)</option>
                                    <option value="category:asc">Kategori (A &rarr; Z)</option>
                                    <option value="status:asc">Status (Draft &rarr; Pub)</option>
                                </select>
                            </div>

                            {/* Search Bar */}
                            <form onSubmit={handleSearchSubmit} className="relative w-48 sm:w-60 shrink-0">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder={p.searchPlaceholder || 'Cari nama project, kategori...'}
                                    className="w-full pl-9 pr-8 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-[#0AB600]"
                                />
                                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5 pointer-events-none" />
                                {search && (
                                    <button
                                        type="button"
                                        onClick={handleClearSearch}
                                        className="p-1 rounded-md text-zinc-400 hover:text-slate-900 dark:hover:text-white absolute right-2 top-2 transition-colors cursor-pointer"
                                        title="Hapus pencarian"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </form>

                            {/* Reset Filters Button */}
                            {isFilterActive && (
                                <button
                                    type="button"
                                    onClick={handleResetFilters}
                                    title="Reset Semua Filter"
                                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900 transition-colors cursor-pointer shrink-0"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span>Reset</span>
                                </button>
                            )}

                            {/* View Mode Toggle (Table / Grid) */}
                            <div className="flex items-center bg-zinc-100 dark:bg-zinc-900/80 p-1 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setViewMode('table')}
                                    title="Tampilan Tabel Data"
                                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                        viewMode === 'table'
                                            ? 'bg-white dark:bg-zinc-800 text-[#0AB600] shadow-xs'
                                            : 'text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                                    }`}
                                >
                                    <Table2 className="w-4 h-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewMode('grid')}
                                    title="Tampilan Kartu Grid"
                                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                        viewMode === 'grid'
                                            ? 'bg-white dark:bg-zinc-800 text-[#0AB600] shadow-xs'
                                            : 'text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                                    }`}
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Active Filter Badges & Counter */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400">
                        <div className="flex items-center gap-2">
                            <span>
                                Menampilkan <strong className="text-slate-900 dark:text-white">{projects?.from || (projectList.length > 0 ? 1 : 0)}</strong> - <strong className="text-slate-900 dark:text-white">{projects?.to || projectList.length}</strong> dari <strong className="text-[#0AB600]">{projects?.total || projectList.length}</strong> proyek riset
                            </span>
                            {isFilterActive && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#0AB600]/10 text-[#0AB600] text-[10px] font-bold border border-[#0AB600]/30">
                                    <Filter className="w-3 h-3" />
                                    Filter Aktif
                                </span>
                            )}
                        </div>

                        <span className="text-[11px] text-zinc-400">
                            Urutan: <strong className="text-slate-700 dark:text-zinc-300">{sortField === 'name' ? 'Nama' : sortField === 'category' ? 'Kategori' : sortField === 'status' ? 'Status' : sortField === 'created_at' ? 'Tanggal Dibuat' : 'Pembaruan Terakhir'} ({sortDirection === 'asc' ? 'A-Z / Lama-Baru' : 'Z-A / Baru-Lama'})</strong>
                        </span>
                    </div>
                </div>

                {/* Selection Action Toolbar (When 1+ items selected) */}
                {selectedIds.length > 0 && (
                    <div className="bg-white dark:bg-[#121824] text-slate-900 dark:text-white p-4 rounded-2xl shadow-lg border border-[#0AB600]/40 dark:border-[#0AB600]/30 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-[#0AB600]/10 dark:bg-[#0AB600]/20 text-[#0AB600] font-bold text-xs border border-[#0AB600]/30 dark:border-[#0AB600]/40 shrink-0">
                                {selectedIds.length}
                            </span>
                            <div>
                                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                    {selectedIds.length} Proyek Riset Dipilih
                                </p>
                                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                    Siap diekspor ke format dokumen flyer A4 (.zip)
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                            <button
                                type="button"
                                onClick={deselectAll}
                                className="px-3.5 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
                            >
                                Batal Pilih
                            </button>
                            <button
                                type="button"
                                onClick={handleStartBatchExport}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#0AB600] hover:bg-[#089600] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md hover:scale-[1.01] transition-all cursor-pointer"
                            >
                                <Archive className="w-4 h-4 text-white" />
                                <span>Download Selected Flyers (.zip)</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Projects List: Empty State, Table View, or Grid View */}
                {projectList.length === 0 ? (
                    <div className="bg-white dark:bg-[#121824] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-12 text-center shadow-sm">
                        <img
                            src="/assets/img/icon/notfound.png"
                            alt="Tidak Ada Project"
                            className="w-28 sm:w-32 h-auto object-contain mx-auto mb-4 drop-shadow-xs"
                        />
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            {isFilterActive ? 'Tidak Ada Proyek Sesuai Filter' : (p.emptyTitle || 'Belum Ada Project')}
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                            {isFilterActive
                                ? 'Coba ubah kata kunci pencarian, kategori, atau reset filter untuk menampilkan semua data.'
                                : (p.emptyDesc || 'Mulai buat lembar inovasi project STAS RG pertama Anda untuk digenerate menjadi flyer dan dokumen PDF.')}
                        </p>
                        {isFilterActive ? (
                            <button
                                type="button"
                                onClick={handleResetFilters}
                                className="inline-flex items-center gap-2 px-4 py-2 mt-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-900 dark:text-white text-xs font-semibold transition-all cursor-pointer"
                            >
                                <RotateCcw className="w-4 h-4" />
                                <span>Reset Filter</span>
                            </button>
                        ) : (
                            <Link
                                href="/projects/create"
                                className="inline-flex items-center gap-2 px-4 py-2 mt-4 rounded-xl bg-[#0AB600] hover:bg-[#089600] text-white text-xs font-semibold shadow-md transition-all"
                            >
                                <Plus className="w-4 h-4" />
                                <span>{p.emptyCreateButton || 'Buat Project Baru'}</span>
                            </Link>
                        )}
                    </div>
                ) : viewMode === 'table' ? (
                    /* ================= TABEL DATA VIEW ================= */
                    <div className="bg-white dark:bg-[#121824] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="bg-zinc-50 dark:bg-zinc-900/80 border-b border-zinc-200/80 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-bold">
                                        <th className="py-3 px-4 w-12 text-center">
                                            <button
                                                type="button"
                                                onClick={toggleSelectAll}
                                                title={isAllSelected ? 'Batalkan pilih semua' : 'Pilih semua proyek di halaman ini'}
                                                className="cursor-pointer text-zinc-400 hover:text-[#0AB600] dark:hover:text-[#0AB600] transition-colors"
                                            >
                                                {isAllSelected ? (
                                                    <CheckSquare className="w-4 h-4 text-[#0AB600]" />
                                                ) : (
                                                    <Square className="w-4 h-4" />
                                                )}
                                            </button>
                                        </th>
                                        
                                        {/* Sortable: Project & Category */}
                                        <th className="py-3 px-4">
                                            <button
                                                type="button"
                                                onClick={() => handleSortColumn('title')}
                                                className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                                            >
                                                <span>Proyek & Kategori</span>
                                                {sortField === 'title' || sortField === 'name' ? (
                                                    sortDirection === 'asc' ? (
                                                        <ArrowUp className="w-3.5 h-3.5 text-[#0AB600]" />
                                                    ) : (
                                                        <ArrowDown className="w-3.5 h-3.5 text-[#0AB600]" />
                                                    )
                                                ) : (
                                                    <ArrowUpDown className="w-3 h-3 text-zinc-400 opacity-60" />
                                                )}
                                            </button>
                                        </th>

                                        <th className="py-3 px-4 hidden md:table-cell">Layout Preset</th>

                                        {/* Sortable: Status */}
                                        <th className="py-3 px-4">
                                            <button
                                                type="button"
                                                onClick={() => handleSortColumn('status')}
                                                className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                                            >
                                                <span>Status</span>
                                                {sortField === 'status' ? (
                                                    sortDirection === 'asc' ? (
                                                        <ArrowUp className="w-3.5 h-3.5 text-[#0AB600]" />
                                                    ) : (
                                                        <ArrowDown className="w-3.5 h-3.5 text-[#0AB600]" />
                                                    )
                                                ) : (
                                                    <ArrowUpDown className="w-3 h-3 text-zinc-400 opacity-60" />
                                                )}
                                            </button>
                                        </th>

                                        {/* Sortable: Pembaruan */}
                                        <th className="py-3 px-4 hidden lg:table-cell">
                                            <button
                                                type="button"
                                                onClick={() => handleSortColumn('updated_at')}
                                                className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                                            >
                                                <span>Pembaruan</span>
                                                {sortField === 'updated_at' || sortField === 'created_at' ? (
                                                    sortDirection === 'asc' ? (
                                                        <ArrowUp className="w-3.5 h-3.5 text-[#0AB600]" />
                                                    ) : (
                                                        <ArrowDown className="w-3.5 h-3.5 text-[#0AB600]" />
                                                    )
                                                ) : (
                                                    <ArrowUpDown className="w-3 h-3 text-zinc-400 opacity-60" />
                                                )}
                                            </button>
                                        </th>

                                        <th className="py-3 px-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                                    {projectList.map((project) => {
                                        const isSelected = selectedIds.includes(project.id);
                                        return (
                                            <tr
                                                key={project.id || project.slug}
                                                className={`transition-colors ${
                                                    isSelected
                                                        ? 'bg-[#0AB600]/10'
                                                        : 'hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40'
                                                }`}
                                            >
                                                {/* Checkbox Column */}
                                                <td className="py-3.5 px-4 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleSelectOne(project.id)}
                                                        className="cursor-pointer text-zinc-400 hover:text-[#0AB600] dark:hover:text-[#0AB600] transition-colors"
                                                    >
                                                        {isSelected ? (
                                                            <CheckSquare className="w-4 h-4 text-[#0AB600]" />
                                                        ) : (
                                                            <Square className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                </td>

                                                {/* Thumbnail + Title + Category */}
                                                <td className="py-3.5 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-14 h-14 rounded-xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden shrink-0 border border-zinc-200/80 dark:border-zinc-700/80">
                                                            {project.main_image ? (
                                                                <img
                                                                    src={`/storage/${project.main_image}`}
                                                                    alt={project.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                                                    <FolderKanban className="w-5 h-5" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0 max-w-md">
                                                            <Link
                                                                href={`/projects/${project.slug}`}
                                                                className="font-bold text-slate-900 dark:text-white hover:text-[#0AB600] dark:hover:text-[#0AB600] transition-colors truncate block text-xs sm:text-sm uppercase"
                                                            >
                                                                {project.title || project.name}
                                                            </Link>
                                                            {project.subtitle && (
                                                                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                                                                    {project.subtitle}
                                                                </p>
                                                            )}
                                                            <div className="flex items-center gap-1.5 mt-1">
                                                                {project.category && (
                                                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                                                                        {project.category}
                                                                    </span>
                                                                )}
                                                                {project.doc_format === 'brochure_trifold' && (
                                                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#0AB600]/10 text-[#0AB600] border border-[#0AB600]/30">
                                                                        Kotak {(project.problem_solution?.panel_index !== undefined ? Number(project.problem_solution.panel_index) + 1 : 1)} • Lipat 3
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Layout Preset */}
                                                <td className="py-3.5 px-4 hidden md:table-cell">
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                                                        <Layers className="w-3 h-3 text-[#0AB600]" />
                                                        <span>{getLayoutPresetLabel(project.layout_preset)}</span>
                                                    </span>
                                                </td>

                                                {/* Status */}
                                                <td className="py-3.5 px-4">
                                                    <span
                                                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                                            project.status === 'published'
                                                                ? 'bg-[#0AB600]/10 text-[#0AB600] border-[#0AB600]/30'
                                                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                                                        }`}
                                                    >
                                                        <span className={`w-1.5 h-1.5 rounded-full ${project.status === 'published' ? 'bg-[#0AB600]' : 'bg-zinc-400'}`} />
                                                        <span>{project.status === 'published' ? (p.statusPublished || 'Published') : (p.statusDraft || 'Draft')}</span>
                                                    </span>
                                                </td>

                                                {/* Date */}
                                                <td className="py-3.5 px-4 hidden lg:table-cell text-zinc-500 dark:text-zinc-400 text-[11px]">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                                                        <span>{new Date(project.updated_at).toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                    </div>
                                                </td>

                                                {/* Actions */}
                                                <td className="py-3.5 px-4 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => setActiveSosmedProject(project)}
                                                            title="Ekspor Media Sosial & Multi-Format (1:1, 9:16, PNG, JPG)"
                                                            className="p-1.5 rounded-lg text-[#0AB600] hover:bg-[#0AB600]/10 dark:hover:bg-[#0AB600]/15 transition-colors cursor-pointer"
                                                        >
                                                            <Share2 className="w-4 h-4" />
                                                        </button>
                                                        <Link
                                                            href={`/projects/${project.slug}`}
                                                            title={p.actionPreview || 'Lihat Flyer'}
                                                            className="p-1.5 rounded-lg text-zinc-500 hover:text-slate-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Link>
                                                        <Link
                                                            href={`/projects/${project.slug}/edit`}
                                                            title={p.actionEdit || 'Edit Project'}
                                                            className="p-1.5 rounded-lg text-zinc-500 hover:text-[#0AB600] dark:hover:text-[#0AB600] hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDuplicate(project.slug, project.name)}
                                                            title={p.actionDuplicate || 'Duplikasi Project'}
                                                            className="p-1.5 rounded-lg text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                                                        >
                                                            <Copy className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(project.slug, project.name)}
                                                            disabled={deletingId === project.slug}
                                                            title={p.actionDelete || 'Hapus Project'}
                                                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    /* ================= KARTU GRID VIEW ================= */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {projectList.map((project) => {
                            const isSelected = selectedIds.includes(project.id);
                            return (
                                <div
                                    key={project.id || project.slug}
                                    className={`group bg-white dark:bg-[#121824] rounded-2xl border transition-all flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md ${
                                        isSelected
                                            ? 'border-[#0AB600] ring-2 ring-[#0AB600]/30'
                                            : 'border-zinc-200/80 dark:border-zinc-800/80'
                                    }`}
                                >
                                    {/* Thumbnail Top Banner */}
                                    <div className="h-44 bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden border-b border-zinc-100 dark:border-zinc-800">
                                        {/* Top Left Selection Checkbox */}
                                        <button
                                            type="button"
                                            onClick={() => toggleSelectOne(project.id)}
                                            className="absolute top-3 left-3 z-10 p-1.5 rounded-xl bg-black/60 text-white backdrop-blur-md hover:bg-black/80 transition-colors cursor-pointer"
                                            title={isSelected ? 'Batalkan pilihan' : 'Pilih proyek untuk batch export'}
                                        >
                                            {isSelected ? (
                                                <CheckSquare className="w-4 h-4 text-[#0AB600]" />
                                            ) : (
                                                <Square className="w-4 h-4 text-white/80" />
                                            )}
                                        </button>

                                        {(() => {
                                            const displayImg = project.main_image 
                                                ? (project.main_image.startsWith('http') || project.main_image.startsWith('blob:') || project.main_image.startsWith('data:') ? project.main_image : `/storage/${project.main_image}`)
                                                : (project.doc_format === 'brochure_trifold' && Array.isArray(project.problem_solution?.panels) ? project.problem_solution.panels[0]?.image_url : null);

                                            if (displayImg) {
                                                return (
                                                    <img
                                                        src={displayImg}
                                                        alt={project.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                );
                                            }

                                            return (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 bg-gradient-to-b from-zinc-100 to-zinc-200/60 dark:from-zinc-800/80 dark:to-zinc-900/90 p-4 text-center">
                                                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-emerald-600 mb-1.5 shadow-2xs">
                                                        <FolderKanban className="w-5 h-5" />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider line-clamp-1">{project.category || 'CoE STAS-RG'}</span>
                                                    <span className="text-[9px] text-zinc-400 mt-0.5">{project.doc_format || 'a4_flyer'}</span>
                                                </div>
                                            );
                                        })()}

                                        {/* Status Badge */}
                                        <span
                                            className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-md border ${
                                                project.status === 'published'
                                                    ? 'bg-[#0AB600]/90 text-white border-[#0AB600]/40'
                                                    : 'bg-zinc-800/90 text-zinc-300 border-zinc-700'
                                            }`}
                                        >
                                            {project.status === 'published' ? (p.statusPublished || 'Published') : (p.statusDraft || 'Draft')}
                                        </span>
                                    </div>

                                    {/* Body Content */}
                                    <div className="p-4 flex-1 flex flex-col justify-between">
                                        <div>
                                            {/* Category & Preset */}
                                            <div className="flex items-center gap-1.5 mb-2">
                                                {project.category && (
                                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#0AB600]/10 text-[#0AB600] border border-[#0AB600]/30">
                                                        {project.category}
                                                    </span>
                                                )}
                                                {project.doc_format === 'brochure_trifold' && (
                                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#0AB600]/10 text-[#0AB600] border border-[#0AB600]/30">
                                                        Kotak {(project.problem_solution?.panel_index !== undefined ? Number(project.problem_solution.panel_index) + 1 : 1)}
                                                    </span>
                                                )}
                                                <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                                    {getLayoutPresetLabel(project.layout_preset)}
                                                </span>
                                            </div>

                                            {/* Subtitle */}
                                            {project.subtitle && (
                                                <p className="text-[11px] font-semibold text-[#0AB600] line-clamp-1 mb-1">
                                                    {project.subtitle}
                                                </p>
                                            )}

                                            {/* Title */}
                                            <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-[#0AB600] dark:group-hover:text-[#0AB600] transition-colors uppercase">
                                                {project.title || project.name}
                                            </h3>

                                            {/* Description */}
                                            {project.description && stripHtml(project.description) && (
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1.5 leading-relaxed">
                                                    {stripHtml(project.description)}
                                                </p>
                                            )}
                                        </div>

                                        {/* Metadata & Actions */}
                                        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                                            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span>{new Date(project.updated_at).toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                            </div>

                                            {/* Action Buttons Toolbar */}
                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveSosmedProject(project)}
                                                    title="Ekspor Media Sosial & Multi-Format (1:1, 9:16, PNG, JPG)"
                                                    className="p-1.5 rounded-lg text-[#0AB600] hover:bg-[#0AB600]/10 dark:hover:bg-[#0AB600]/15 transition-colors cursor-pointer"
                                                >
                                                    <Share2 className="w-4 h-4" />
                                                </button>
                                                <Link
                                                    href={`/projects/${project.slug}`}
                                                    title={p.actionPreview || 'Lihat Detail'}
                                                    className="p-1.5 rounded-lg text-zinc-500 hover:text-slate-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <Link
                                                    href={`/projects/${project.slug}/edit`}
                                                    title={p.actionEdit || 'Edit Project'}
                                                    className="p-1.5 rounded-lg text-zinc-500 hover:text-[#0AB600] dark:hover:text-[#0AB600] hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDuplicate(project.slug, project.name)}
                                                    title={p.actionDuplicate || 'Duplikasi Project'}
                                                    className="p-1.5 rounded-lg text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(project.slug, project.name)}
                                                    disabled={deletingId === project.slug}
                                                    title={p.actionDelete || 'Hapus Project'}
                                                    className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {projects?.links && projects.links.length > 3 && (
                    <div className="flex items-center justify-center gap-1.5 mt-6">
                        {projects.links.map((link, idx) => (
                            <Link
                                key={idx}
                                href={link.url || '#'}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                    link.active
                                        ? 'bg-[#0AB600] text-white'
                                        : link.url
                                        ? 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50'
                                        : 'text-zinc-400 pointer-events-none'
                                }`}
                            />
                        ))}
                    </div>
                )}

            </div>

            {/* ================= BATCH EXPORT PROGRESS MODAL ================= */}
            {isBatchModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#121824] rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
                        <div className="text-center space-y-2">
                            <div className="w-14 h-14 rounded-2xl bg-[#0AB600]/10 text-[#0AB600] flex items-center justify-center mx-auto border border-[#0AB600]/30">
                                {batchComplete ? (
                                    <CheckCircle2 className="w-8 h-8 text-[#0AB600] animate-in zoom-in-50 duration-300" />
                                ) : (
                                    <Archive className="w-8 h-8 animate-bounce text-[#0AB600]" />
                                )}
                            </div>
                            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                                {batchComplete ? 'Batch Export Selesai!' : 'Mempersiapkan Arsip ZIP Flyer'}
                            </h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                {batchComplete
                                    ? `Berhasil merender dan mengompresi ${batchProgress.total} lembar flyer riset ke format file .zip.`
                                    : `Sistem sedang merender lembar flyer standar A4 ke gambar beresolusi tinggi (${batchProgress.current}/${batchProgress.total})`}
                            </p>
                        </div>

                        {/* Progress Bar & Status */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                                <span>{batchProgress.statusText || 'Memproses...'}</span>
                                <span>{Math.round((batchProgress.current / (batchProgress.total || 1)) * 100)}%</span>
                            </div>
                            <div className="w-full h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-zinc-200 dark:border-zinc-700">
                                <div
                                    className="h-full bg-gradient-to-r from-[#0AB600] to-[#089600] rounded-full transition-all duration-300 ease-out"
                                    style={{
                                        width: `${Math.max(5, (batchProgress.current / (batchProgress.total || 1)) * 100)}%`,
                                    }}
                                />
                            </div>
                            {batchProgress.currentName && !batchComplete && (
                                <p className="text-[11px] text-zinc-400 truncate text-center pt-1">
                                    Memproses: <span className="font-semibold text-slate-800 dark:text-zinc-200">{batchProgress.currentName}</span>
                                </p>
                            )}
                        </div>

                        {/* Modal Action Buttons */}
                        <div className="pt-2 flex justify-end gap-2">
                            {batchComplete ? (
                                <button
                                    type="button"
                                    onClick={handleCloseBatchModal}
                                    className="w-full py-2.5 rounded-xl bg-[#0AB600] hover:bg-[#089600] text-white text-xs font-bold transition-colors cursor-pointer"
                                >
                                    Selesai & Tutup
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleCancelBatchExport}
                                    className="w-full py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
                                >
                                    Batal
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Export Multi-Format & Media Sosial Modal */}
            <ExportSosmedModal
                project={activeSosmedProject}
                isOpen={!!activeSosmedProject}
                onClose={() => setActiveSosmedProject(null)}
            />

            {/* Offscreen A4 Canvas for Batch Rendering & High-Res PNG Capture */}
            <div
                className="fixed -left-[9999px] top-0 pointer-events-none opacity-0 select-none overflow-hidden"
                aria-hidden="true"
                style={{ width: '794px', height: '1123px' }}
            >
                {activeBatchProject && (
                    <A4Document
                        key={`batch-render-${activeBatchProject.id}`}
                        project={activeBatchProject}
                        id="batch-flyer-active-canvas"
                    />
                )}
            </div>
        </AdminLayout>
    );
}
