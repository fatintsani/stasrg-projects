import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { useApp } from '../../../Context/AppContext';
import { useAlert } from '../../../Context/AlertContext';
import {
    LifeBuoy,
    Search,
    Filter,
    RotateCcw,
    DownloadCloud,
    Trash2,
    CheckCircle2,
    Clock,
    AlertCircle,
    AlertTriangle,
    ShieldAlert,
    ExternalLink,
    Mail,
    Phone,
    Building2,
    User,
    FileText,
    Download,
    MessageSquare,
    Sparkles,
    Bug,
    Handshake,
    HelpCircle,
    Check,
    Copy,
    ChevronRight,
    X,
    Calendar,
    ArrowUpDown,
    CheckCheck,
    Send,
    Headphones,
} from 'lucide-react';

export default function SupportTicketsIndex({ tickets = { data: [], links: [] }, stats = {}, filters = {} }) {
    const { t } = useApp();
    const { showConfirm, showSuccess } = useAlert();

    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || 'all');
    const [priorityFilter, setPriorityFilter] = useState(filters.priority || 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [sort, setSort] = useState(filters.sort || 'created_at');
    const [direction, setDirection] = useState(filters.direction || 'desc');

    const isFilterActive =
        statusFilter !== 'all' ||
        categoryFilter !== 'all' ||
        priorityFilter !== 'all' ||
        search !== '' ||
        dateFrom !== '' ||
        dateTo !== '' ||
        sort !== 'created_at' ||
        direction !== 'desc';

    const applyFilters = (
        newStatus = statusFilter,
        newCategory = categoryFilter,
        newPriority = priorityFilter,
        newSearch = search,
        newDateFrom = dateFrom,
        newDateTo = dateTo,
        newSort = sort,
        newDirection = direction
    ) => {
        router.get(
            '/support-tickets',
            {
                status: newStatus !== 'all' ? newStatus : undefined,
                category: newCategory !== 'all' ? newCategory : undefined,
                priority: newPriority !== 'all' ? newPriority : undefined,
                search: newSearch || undefined,
                date_from: newDateFrom || undefined,
                date_to: newDateTo || undefined,
                sort: newSort,
                direction: newDirection,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    const handleResetFilters = () => {
        setSearch('');
        setStatusFilter('all');
        setCategoryFilter('all');
        setPriorityFilter('all');
        setDateFrom('');
        setDateTo('');
        setSort('created_at');
        setDirection('desc');
        applyFilters('all', 'all', 'all', '', '', '', 'created_at', 'desc');
    };

    const handleSort = (field) => {
        const nextDirection = sort === field && direction === 'desc' ? 'asc' : 'desc';
        setSort(field);
        setDirection(nextDirection);
        applyFilters(statusFilter, categoryFilter, priorityFilter, search, dateFrom, dateTo, field, nextDirection);
    };

    const handleDelete = (ticket) => {
        showConfirm({
            title: 'Hapus Tiket Dukungan?',
            message: `Apakah Anda yakin ingin menghapus tiket #${ticket.ticket_number} dari "${ticket.name}"? Tindakan ini tidak dapat dibatalkan.`,
            confirmText: 'Hapus Tiket',
            cancelText: 'Batal',
            variant: 'danger',
        }).then((confirmed) => {
            if (confirmed) {
                router.delete(`/support-tickets/${ticket.id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        showSuccess('Tiket Dihapus', `Tiket #${ticket.ticket_number} berhasil dihapus.`);
                    },
                });
            }
        });
    };

    const categoryMeta = {
        general: { label: 'Umum', color: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700', icon: HelpCircle },
        technical: { label: 'Teknis', color: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/50', icon: Bug },
        technical_issue: { label: 'Kendala Teknis', color: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/50', icon: Bug },
        partnership: { label: 'Kemitraan', color: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-900/50', icon: Handshake },
        research_collaboration: { label: 'Kolaborasi Riset', color: 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border-teal-200 dark:border-teal-900/50', icon: Sparkles },
        feature_request: { label: 'Fitur', color: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border-sky-200 dark:border-sky-900/50', icon: Sparkles },
        account: { label: 'Akun', color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-900/50', icon: User },
        account_access: { label: 'Akses Akun', color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-900/50', icon: User },
        other: { label: 'Lainnya', color: 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 border-slate-200 dark:border-zinc-700', icon: HelpCircle },
    };

    const priorityBadges = {
        low: { label: 'Rendah', color: 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300 border-slate-200 dark:border-white/10' },
        medium: { label: 'Sedang', color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-900/50' },
        high: { label: 'Tinggi', color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-900/50' },
        urgent: { label: 'Urgent', color: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-900/50 animate-pulse' },
    };

    const statusBadges = {
        pending: { label: 'Menunggu', color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-900/50', icon: Clock },
        in_progress: { label: 'Diproses', color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-900/50', icon: RotateCcw },
        resolved: { label: 'Selesai', color: 'bg-[#0AB600]/10 text-[#0AB600] dark:bg-[#0AB600]/10 dark:text-[#0AB600] border-[#0AB600]/30', icon: CheckCircle2 },
        closed: { label: 'Ditutup', color: 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400 border-slate-200 dark:border-white/10', icon: CheckCheck },
    };

    return (
        <AdminLayout title="Pusat Tiket Dukungan & Kontak" currentPath="/support-tickets">
            <Head title="Pusat Tiket Dukungan & Kontak - STAS RG" />

            <div className="space-y-6 pb-12">
                {/* Top Header Card */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#101622] p-5 sm:p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs">
                    <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-[#0AB600]/10 border border-[#0AB600]/30 flex items-center justify-center text-[#0AB600] shrink-0 mt-0.5 sm:mt-0">
                            <LifeBuoy className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                                    Pusat Tiket Dukungan & Kontak
                                </h1>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#0AB600]/10 text-[#0AB600] border border-[#0AB600]/30 shrink-0">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#0AB600] animate-pulse" />
                                    {stats.total || 0} Tiket
                                </span>
                            </div>
                            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                                Pantau dan kelola aduan masalah, pertanyaan riset, dan permohonan kemitraan dari pengunjung landing page.
                            </p>
                        </div>
                    </div>

                    {/* Header Action Buttons */}
                    <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
                        <a
                            href="https://wa.me/6283133977214?text=Halo%20Developer%20STAS%20RG%2C%20saya%20admin%20membutuhkan%20bantuan%20terkait%20tiket%20dukungan."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#0AB600] bg-[#0AB600]/10 hover:bg-[#0AB600]/20 border border-[#0AB600]/30 transition-all cursor-pointer whitespace-nowrap active:scale-95"
                            title="Hubungi Sekarang"
                        >
                            <img
                                src="/assets/img/icon/profile_dev.png"
                                alt="Developer Profile"
                                className="w-4 h-4 rounded-md object-cover border border-[#0AB600]/40 shrink-0"
                            />
                            <span>Hubungi Sekarang</span>
                        </a>

                        <a
                            href="/support-tickets/export-csv"
                            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-200 bg-white dark:bg-zinc-800/90 border border-zinc-200/80 dark:border-zinc-700/80 hover:bg-zinc-50 dark:hover:bg-zinc-700/70 hover:border-zinc-300 transition-all cursor-pointer whitespace-nowrap active:scale-95"
                        >
                            <DownloadCloud className="w-4 h-4 text-[#0AB600]" />
                            <span>Ekspor CSV</span>
                        </a>
                    </div>
                </div>

                {/* Statistics Overview Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                    {/* Total */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#101622] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Total Tiket</span>
                            <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300">
                                <LifeBuoy className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2 font-mono">
                            {stats.total || 0}
                        </p>
                    </div>

                    {/* Pending */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#101622] border border-amber-200/60 dark:border-amber-900/30 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Menunggu</span>
                            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600">
                                <Clock className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2 font-mono">
                            {stats.pending || 0}
                        </p>
                    </div>

                    {/* In Progress */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#101622] border border-blue-200/60 dark:border-blue-900/30 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Diproses</span>
                            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">
                                <RotateCcw className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2 font-mono">
                            {stats.in_progress || 0}
                        </p>
                    </div>

                    {/* Resolved */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#101622] border border-[#0AB600]/30 dark:border-[#0AB600]/20 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-[#0AB600]">Selesai</span>
                            <div className="w-8 h-8 rounded-xl bg-[#0AB600]/10 flex items-center justify-center text-[#0AB600]">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-[#0AB600] mt-2 font-mono">
                            {stats.resolved || 0}
                        </p>
                    </div>

                    {/* Closed */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#101622] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Ditutup</span>
                            <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
                                <CheckCheck className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-slate-700 dark:text-zinc-300 mt-2 font-mono">
                            {stats.closed || 0}
                        </p>
                    </div>

                    {/* Urgent */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#101622] border border-rose-200/60 dark:border-rose-900/30 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">Prioritas Urgent</span>
                            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-rose-600">
                                <AlertTriangle className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-2 font-mono">
                            {stats.urgent || 0}
                        </p>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#101622] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {/* Search Input */}
                        <div className="relative">
                            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    applyFilters(statusFilter, categoryFilter, priorityFilter, e.target.value, dateFrom, dateTo, sort, direction);
                                }}
                                placeholder="Cari tiket, pengirim, subjek..."
                                className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#0AB600]/20 focus:border-[#0AB600]"
                            />
                        </div>

                        {/* Status Filter */}
                        <div>
                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    applyFilters(e.target.value, categoryFilter, priorityFilter, search, dateFrom, dateTo, sort, direction);
                                }}
                                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0AB600]/20 focus:border-[#0AB600]"
                            >
                                <option value="all">Semua Status</option>
                                <option value="pending">Menunggu (Pending)</option>
                                <option value="in_progress">Sedang Diproses</option>
                                <option value="resolved">Selesai (Resolved)</option>
                                <option value="closed">Ditutup (Closed)</option>
                            </select>
                        </div>

                        {/* Category Filter */}
                        <div>
                            <select
                                value={categoryFilter}
                                onChange={(e) => {
                                    setCategoryFilter(e.target.value);
                                    applyFilters(statusFilter, e.target.value, priorityFilter, search, dateFrom, dateTo, sort, direction);
                                }}
                                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0AB600]/20 focus:border-[#0AB600]"
                            >
                                <option value="all">Semua Kategori</option>
                                <option value="general">Pertanyaan Umum</option>
                                <option value="technical">Kendala Teknis</option>
                                <option value="technical_issue">Kendala Teknis</option>
                                <option value="partnership">Kemitraan / Kerjasama</option>
                                <option value="research_collaboration">Kolaborasi Riset</option>
                                <option value="feature_request">Permintaan Fitur</option>
                                <option value="account">Akses Akun</option>
                                <option value="account_access">Akses Akun</option>
                                <option value="other">Lainnya</option>
                            </select>
                        </div>

                        {/* Priority Filter */}
                        <div>
                            <select
                                value={priorityFilter}
                                onChange={(e) => {
                                    setPriorityFilter(e.target.value);
                                    applyFilters(statusFilter, categoryFilter, e.target.value, search, dateFrom, dateTo, sort, direction);
                                }}
                                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0AB600]/20 focus:border-[#0AB600]"
                            >
                                <option value="all">Semua Prioritas</option>
                                <option value="urgent">Urgent</option>
                                <option value="high">Tinggi</option>
                                <option value="medium">Sedang</option>
                                <option value="low">Rendah</option>
                            </select>
                        </div>
                    </div>

                    {isFilterActive && (
                        <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                            <span className="text-xs text-zinc-500">Filter aktif diterapkan</span>
                            <button
                                type="button"
                                onClick={handleResetFilters}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 cursor-pointer"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Reset Filter</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Tickets Table */}
                <div className="bg-white dark:bg-[#101622] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-zinc-50 dark:bg-zinc-900/80 text-zinc-500 dark:text-zinc-400 text-xs font-semibold border-b border-zinc-200/80 dark:border-zinc-800/80">
                                <tr>
                                    <th className="py-3.5 px-4 sm:px-6 cursor-pointer select-none" onClick={() => handleSort('ticket_number')}>
                                        <div className="flex items-center gap-1.5">
                                            <span>Nomor Tiket & Kategori</span>
                                            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
                                        </div>
                                    </th>
                                    <th className="py-3.5 px-4 cursor-pointer select-none" onClick={() => handleSort('name')}>
                                        <div className="flex items-center gap-1.5">
                                            <span>Pengirim</span>
                                            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
                                        </div>
                                    </th>
                                    <th className="py-3.5 px-4">Subjek & Pesan</th>
                                    <th className="py-3.5 px-3 text-center cursor-pointer select-none" onClick={() => handleSort('priority')}>
                                        <div className="flex items-center justify-center gap-1.5">
                                            <span>Prioritas</span>
                                            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
                                        </div>
                                    </th>
                                    <th className="py-3.5 px-3 text-center cursor-pointer select-none" onClick={() => handleSort('status')}>
                                        <div className="flex items-center justify-center gap-1.5">
                                            <span>Status</span>
                                            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
                                        </div>
                                    </th>
                                    <th className="py-3.5 px-4 cursor-pointer select-none" onClick={() => handleSort('created_at')}>
                                        <div className="flex items-center gap-1.5">
                                            <span>Waktu Masuk</span>
                                            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
                                        </div>
                                    </th>
                                    <th className="py-3.5 px-4 sm:px-6 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                                {tickets.data && tickets.data.length > 0 ? (
                                    tickets.data.map((ticket) => {
                                        const cat = categoryMeta[ticket.category] || categoryMeta.general;
                                        const CatIcon = cat.icon;
                                        const prio = priorityBadges[ticket.priority] || priorityBadges.medium;
                                        const st = statusBadges[ticket.status] || statusBadges.pending;
                                        const StIcon = st.icon;

                                        return (
                                            <tr
                                                key={ticket.id}
                                                className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors group cursor-pointer"
                                                onClick={() => router.visit(`/support-tickets/${ticket.id}`)}
                                            >
                                                {/* Ticket Number & Category */}
                                                <td className="py-3.5 px-4 sm:px-6">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-mono font-bold text-slate-900 dark:text-white tracking-wider text-xs sm:text-sm">
                                                                {ticket.ticket_number}
                                                            </span>
                                                            {ticket.attachment_path && (
                                                                <span title="Memiliki lampiran file" className="p-1 rounded bg-[#0AB600]/10 text-[#0AB600]">
                                                                    <FileText className="w-3 h-3" />
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${cat.color}`}>
                                                            <CatIcon className="w-3 h-3" />
                                                            <span>{cat.label}</span>
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Sender */}
                                                <td className="py-3.5 px-4">
                                                    <div className="space-y-0.5">
                                                        <p className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm truncate max-w-[180px]">
                                                            {ticket.name}
                                                        </p>
                                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-[180px]">
                                                            {ticket.email}
                                                        </p>
                                                        {ticket.institution && (
                                                            <p className="text-[11px] text-[#0AB600] truncate max-w-[180px]">
                                                                {ticket.institution}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Subject & Snippet */}
                                                <td className="py-3.5 px-4 max-w-xs">
                                                    <div className="space-y-0.5">
                                                        <p className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm truncate">
                                                            {ticket.subject}
                                                        </p>
                                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                                                            {ticket.message}
                                                        </p>
                                                    </div>
                                                </td>

                                                {/* Priority */}
                                                <td className="py-3.5 px-3 text-center">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${prio.color}`}>
                                                        {prio.label}
                                                    </span>
                                                </td>

                                                {/* Status */}
                                                <td className="py-3.5 px-3 text-center">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${st.color}`}>
                                                        <StIcon className="w-3 h-3" />
                                                        <span>{st.label}</span>
                                                    </span>
                                                </td>

                                                {/* Date */}
                                                <td className="py-3.5 px-4 text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                                                    <div>{ticket.created_at_human || 'Baru saja'}</div>
                                                    <div className="text-[10px] text-zinc-400 dark:text-zinc-500">{ticket.created_at_formatted}</div>
                                                </td>

                                                {/* Action Buttons */}
                                                <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link
                                                            href={`/support-tickets/${ticket.id}`}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0AB600]/10 hover:bg-[#0AB600] text-[#0AB600] hover:text-white border border-[#0AB600]/30 text-xs font-semibold transition-all shadow-2xs cursor-pointer"
                                                            title="Buka Halaman Balas & Detail Tiket"
                                                        >
                                                            <span>Balas / Detail</span>
                                                            <ChevronRight className="w-3.5 h-3.5" />
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(ticket)}
                                                            className="p-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition-all shadow-2xs cursor-pointer"
                                                            title="Hapus Tiket"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="py-12 text-center text-zinc-500 dark:text-zinc-400">
                                            <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                                                <img
                                                    src="/assets/img/icon/notfound.png"
                                                    alt="Tidak Ada Tiket"
                                                    className="w-24 sm:w-28 h-auto object-contain mx-auto mb-3 drop-shadow-xs"
                                                />
                                                <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-1">
                                                    Tidak Ada Tiket Ditemukan
                                                </h4>
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                                    Tidak ada tiket dukungan yang sesuai dengan kriteria filter saat ini.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {tickets.links && tickets.links.length > 3 && (
                        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between gap-2 flex-wrap">
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                Menampilkan {tickets.from || 0} - {tickets.to || 0} dari {tickets.total || 0} tiket
                            </span>
                            <div className="flex items-center gap-1">
                                {tickets.links.map((link, idx) => {
                                    if (!link.url) {
                                        return (
                                            <span
                                                key={idx}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                                className="px-3 py-1.5 rounded-xl text-xs text-zinc-400 dark:text-zinc-600 border border-transparent"
                                            />
                                        );
                                    }
                                    return (
                                        <Link
                                            key={idx}
                                            href={link.url}
                                            preserveScroll
                                            preserveState
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                                                link.active
                                                    ? 'bg-[#0AB600] text-white shadow-xs'
                                                    : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700'
                                            }`}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
