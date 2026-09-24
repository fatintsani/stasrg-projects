import React, { useState, useMemo } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { useApp } from '../../../Context/AppContext';
import {
    BarChart3,
    QrCode,
    Eye,
    Download,
    Users,
    TrendingUp,
    TrendingDown,
    Calendar,
    Filter,
    DownloadCloud,
    RefreshCw,
    Smartphone,
    Monitor,
    Tablet,
    Bot,
    Globe,
    Clock,
    Flame,
    Award,
    Sparkles,
    ExternalLink,
    ChevronRight,
    Search,
    MapPin,
    Layers,
    ArrowUpRight,
    Printer,
    FileText,
    Image,
    RotateCcw,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    X,
    Lightbulb,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AnalyticsIndex({
    metrics = {
        total_scans: 0,
        scans_growth: 0,
        total_views: 0,
        views_growth: 0,
        total_downloads: 0,
        downloads_growth: 0,
        unique_visitors: 0,
        qr_conversion_rate: 0,
    },
    timeline = [],
    hourly = [],
    devices = { types: {}, platforms: {}, browsers: {} },
    locations = [],
    leaderboards = { most_viewed: [], most_scanned: [], most_downloaded: [] },
    projects_qr_breakdown = [],
    day_of_week = [],
    recent_events = [],
    projects_list = [],
    filters = {},
}) {
    const { t } = useApp();
    const a = t?.analytics || {};

    const [period, setPeriod] = useState(filters.period || '30d');
    const [selectedProjectId, setSelectedProjectId] = useState(filters.project_id || 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [activeChartTab, setActiveChartTab] = useState('all'); // 'all', 'scans', 'views', 'downloads'
    const [activeLeaderboardTab, setActiveLeaderboardTab] = useState('most_scanned'); // 'most_scanned', 'most_viewed', 'most_downloaded'
    const [expoTimingTab, setExpoTimingTab] = useState('hourly'); // 'hourly', 'weekly'
    const [qrSearch, setQrSearch] = useState('');
    const [hoveredDataPoint, setHoveredDataPoint] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Live Feed Sort & Filter state
    const [eventFilter, setEventFilter] = useState('all'); // 'all', 'qr_scan', 'showcase_view', 'download'
    const [eventSearch, setEventSearch] = useState('');
    const [eventSort, setEventSort] = useState('time');
    const [eventSortDir, setEventSortDir] = useState('desc');

    const filteredEvents = useMemo(() => {
        let result = [...recent_events];

        if (eventFilter !== 'all') {
            if (eventFilter === 'download') {
                result = result.filter(
                    (ev) =>
                        ev.event_type !== 'qr_scan' &&
                        ev.event_type !== 'showcase_view'
                );
            } else {
                result = result.filter((ev) => ev.event_type === eventFilter);
            }
        }

        if (eventSearch.trim() !== '') {
            const query = eventSearch.toLowerCase().trim();
            result = result.filter(
                (ev) =>
                    (ev.project?.name && ev.project.name.toLowerCase().includes(query)) ||
                    (ev.project?.category && ev.project.category.toLowerCase().includes(query)) ||
                    (ev.device_type && ev.device_type.toLowerCase().includes(query)) ||
                    (ev.platform && ev.platform.toLowerCase().includes(query)) ||
                    (ev.browser && ev.browser.toLowerCase().includes(query)) ||
                    (ev.city && ev.city.toLowerCase().includes(query)) ||
                    (ev.event_type && ev.event_type.toLowerCase().includes(query))
            );
        }

        result.sort((a, b) => {
            let valA, valB;
            if (eventSort === 'time') {
                valA = a.id;
                valB = b.id;
            } else if (eventSort === 'event_type') {
                valA = a.event_type || '';
                valB = b.event_type || '';
            } else if (eventSort === 'project') {
                valA = a.project?.name || '';
                valB = b.project?.name || '';
            } else if (eventSort === 'device') {
                valA = `${a.device_type} ${a.platform}` || '';
                valB = `${b.device_type} ${b.platform}` || '';
            } else if (eventSort === 'location') {
                valA = a.city || '';
                valB = b.city || '';
            }

            if (valA < valB) return eventSortDir === 'asc' ? -1 : 1;
            if (valA > valB) return eventSortDir === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [recent_events, eventFilter, eventSearch, eventSort, eventSortDir]);

    const handleEventSortColumn = (column) => {
        const nextDir = eventSort === column && eventSortDir === 'asc' ? 'desc' : 'asc';
        setEventSort(column);
        setEventSortDir(nextDir);
    };

    const renderEventSortIcon = (column) => {
        if (eventSort !== column) {
            return <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400 opacity-60" />;
        }
        return eventSortDir === 'asc' ? (
            <ArrowUp className="w-3.5 h-3.5 text-[#0AB600]" />
        ) : (
            <ArrowDown className="w-3.5 h-3.5 text-[#0AB600]" />
        );
    };

    // Apply Filter Changes
    const applyFilters = (newPeriod = period, newProject = selectedProjectId, newFrom = dateFrom, newTo = dateTo) => {
        router.get(
            '/analytics',
            {
                period: newPeriod,
                project_id: newProject,
                date_from: newPeriod === 'custom' ? newFrom : undefined,
                date_to: newPeriod === 'custom' ? newTo : undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onStart: () => setIsRefreshing(true),
                onFinish: () => setIsRefreshing(false),
            }
        );
    };

    const handlePeriodChange = (newPeriod) => {
        setPeriod(newPeriod);
        if (newPeriod !== 'custom') {
            applyFilters(newPeriod, selectedProjectId);
        }
    };

    const handleProjectChange = (e) => {
        const pId = e.target.value;
        setSelectedProjectId(pId);
        applyFilters(period, pId, dateFrom, dateTo);
    };

    const handleCustomDateSubmit = (e) => {
        e.preventDefault();
        applyFilters('custom', selectedProjectId, dateFrom, dateTo);
    };

    // Calculate maximums for chart scales
    const maxTimelineValue = useMemo(() => {
        if (!timeline.length) return 10;
        const max = Math.max(
            ...timeline.map((item) => {
                if (activeChartTab === 'scans') return item.qr_scans;
                if (activeChartTab === 'views') return item.showcase_views;
                if (activeChartTab === 'downloads') return item.downloads;
                return Math.max(item.qr_scans, item.showcase_views, item.downloads, 1);
            })
        );
        return Math.ceil(max * 1.25) || 10;
    }, [timeline, activeChartTab]);

    const maxHourlyValue = useMemo(() => {
        if (!hourly.length) return 5;
        const max = Math.max(...hourly.map((h) => h.total || 0));
        return Math.max(max, 5);
    }, [hourly]);

    // Find busiest hour for expo insight
    const busiestHour = useMemo(() => {
        if (!hourly.length) return null;
        let peak = hourly[0];
        hourly.forEach((h) => {
            if ((h.scans + h.views) > (peak.scans + peak.views)) {
                peak = h;
            }
        });
        return peak && peak.total > 0 ? peak : null;
    }, [hourly]);

    // Calculate total device counts for percentage breakdown
    const totalDeviceCount = useMemo(() => {
        const types = devices.types || {};
        return Object.values(types).reduce((acc, val) => acc + Number(val), 0) || 1;
    }, [devices]);

    return (
        <AdminLayout title={a.title || 'Analytics & Insights'} currentPath="/analytics">
            <div className="space-y-6 sm:space-y-8 pb-12">
                {/* 1. TOP HEADER & FILTER TOOLBAR */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 shadow-xs relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-gradient-to-bl from-[#0AB600]/10 via-teal-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="space-y-1 z-10 flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-2 rounded-xl bg-[#0AB600]/10 border border-[#0AB600]/30 text-[#0AB600] shrink-0">
                                <BarChart3 className="w-5 h-5" />
                            </div>
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                                {a.title || 'Analytics & Insights'}
                            </h1>
                        </div>
                        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
                            {a.subtitle || 'Statistik interaksi QR code, trafik showcase riset, dan efektivitas diseminasi expo & publikasi'}
                        </p>
                    </div>

                    {/* Actions Toolbar - 2 Rows & Right-Aligned */}
                    <div className="flex flex-col items-start md:items-end gap-2 z-10 shrink-0">
                        {/* Baris 1: Project Selector */}
                        <div className="relative w-full sm:w-auto min-w-[200px] sm:min-w-[220px]">
                            <select
                                value={selectedProjectId}
                                onChange={handleProjectChange}
                                className="w-full pl-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-50 dark:bg-[#1a2234] border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#0AB600] transition cursor-pointer h-8 truncate shadow-2xs"
                            >
                                <option value="all">{a.allProjects || 'Semua Proyek Riset'}</option>
                                {projects_list.map((proj) => (
                                    <option key={proj.id} value={proj.id}>
                                        {proj.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Baris 2: Buttons (Export CSV + Refresh) */}
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                            {/* Export CSV */}
                            <a
                                href={`/analytics/export-csv?project_id=${selectedProjectId}&date_from=${dateFrom}&date_to=${dateTo}`}
                                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold transition border border-zinc-200/80 dark:border-zinc-700 active:scale-95 shadow-2xs h-8 shrink-0"
                            >
                                <DownloadCloud className="w-3.5 h-3.5 text-[#0AB600]" />
                                <span>{a.exportCsv || 'Export Dataset CSV'}</span>
                            </a>

                            {/* Refresh Button */}
                            <button
                                onClick={() => applyFilters(period, selectedProjectId, dateFrom, dateTo)}
                                disabled={isRefreshing}
                                className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition border border-zinc-200/80 dark:border-zinc-700 active:scale-95 disabled:opacity-50 h-8 w-8 flex items-center justify-center shrink-0 shadow-2xs cursor-pointer"
                                title={a.refresh || 'Segarkan'}
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#0AB600]' : ''}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2. DATE PERIOD FILTER BAR (SINGLE ROW) */}
                <div className="flex items-center justify-between gap-3 p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 shadow-xs overflow-x-auto">
                    <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                        {[
                            { id: '7d', label: a.last7Days || '7 Hari Terakhir' },
                            { id: '30d', label: a.last30Days || '30 Hari Terakhir' },
                            { id: '90d', label: a.last90Days || '90 Hari Terakhir' },
                            { id: 'all', label: a.allTime || 'Semua Waktu' },
                            { id: 'custom', label: a.customRange || 'Rentang Kustom' },
                        ].map((btn) => (
                            <button
                                key={btn.id}
                                onClick={() => handlePeriodChange(btn.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                                    period === btn.id
                                        ? 'bg-[#0AB600] text-white shadow-2xs font-bold'
                                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-zinc-900 dark:hover:text-white'
                                }`}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>

                    {period === 'custom' && (
                        <form onSubmit={handleCustomDateSubmit} className="flex items-center gap-1.5 shrink-0">
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="px-2.5 py-1 text-xs rounded-lg bg-zinc-50 dark:bg-[#1a2234] border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#0AB600] h-8 cursor-pointer"
                            />
                            <span className="text-zinc-400 text-xs font-medium">s/d</span>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="px-2.5 py-1 text-xs rounded-lg bg-zinc-50 dark:bg-[#1a2234] border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#0AB600] h-8 cursor-pointer"
                            />
                            <button
                                type="submit"
                                className="px-3 py-1 rounded-lg bg-[#0AB600] text-white text-xs font-semibold hover:bg-[#089600] transition shadow-2xs h-8 cursor-pointer shrink-0"
                            >
                                Terapkan
                            </button>
                        </form>
                    )}
                </div>

                {/* 3. EXECUTIVE KPI CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                    {/* Card 1: QR Code Scans */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 shadow-sm relative overflow-hidden group hover:border-[#0AB600]/40 transition-all"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                {a.totalScans || 'Scan QR Code'}
                            </span>
                            <div className="w-10 h-10 rounded-2xl bg-[#0AB600]/10 text-[#0AB600] flex items-center justify-center border border-[#0AB600]/20 group-hover:scale-110 transition-transform">
                                <QrCode className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-baseline gap-2">
                            <span className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
                                {metrics.total_scans?.toLocaleString('id-ID') || 0}
                            </span>
                            <span className="text-xs text-zinc-400">scan</span>
                        </div>
                        <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
                            <div className={`flex items-center gap-1 font-semibold ${metrics.scans_growth >= 0 ? 'text-[#0AB600]' : 'text-rose-600 dark:text-rose-400'}`}>
                                {metrics.scans_growth >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                                <span>{metrics.scans_growth > 0 ? `+${metrics.scans_growth}%` : `${metrics.scans_growth}%`}</span>
                            </div>
                            <span className="text-zinc-400 text-[11px]">{a.vsPrevious || 'vs periode lalu'}</span>
                        </div>
                    </motion.div>

                    {/* Card 2: Showcase Views */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.05 }}
                        className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 shadow-sm relative overflow-hidden group hover:border-sky-500/40 transition-all"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                {a.totalViews || 'Showcase Views'}
                            </span>
                            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-500/20 group-hover:scale-110 transition-transform">
                                <Eye className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-baseline gap-2">
                            <span className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
                                {metrics.total_views?.toLocaleString('id-ID') || 0}
                            </span>
                            <span className="text-xs text-zinc-400">views</span>
                        </div>
                        <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
                            <div className={`flex items-center gap-1 font-semibold ${metrics.views_growth >= 0 ? 'text-[#0AB600]' : 'text-rose-600 dark:text-rose-400'}`}>
                                {metrics.views_growth >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                                <span>{metrics.views_growth > 0 ? `+${metrics.views_growth}%` : `${metrics.views_growth}%`}</span>
                            </div>
                            <span className="text-zinc-400 text-[11px]">{a.vsPrevious || 'vs periode lalu'}</span>
                        </div>
                    </motion.div>

                    {/* Card 3: Downloads & Print */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 shadow-sm relative overflow-hidden group hover:border-amber-500/40 transition-all"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                {a.totalDownloads || 'Download & Print'}
                            </span>
                            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20 group-hover:scale-110 transition-transform">
                                <Download className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-baseline gap-2">
                            <span className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
                                {metrics.total_downloads?.toLocaleString('id-ID') || 0}
                            </span>
                            <span className="text-xs text-zinc-400">ekspor</span>
                        </div>
                        <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
                            <div className={`flex items-center gap-1 font-semibold ${metrics.downloads_growth >= 0 ? 'text-[#0AB600]' : 'text-rose-600 dark:text-rose-400'}`}>
                                {metrics.downloads_growth >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                                <span>{metrics.downloads_growth > 0 ? `+${metrics.downloads_growth}%` : `${metrics.downloads_growth}%`}</span>
                            </div>
                            <span className="text-zinc-400 text-[11px]">{a.vsPrevious || 'vs periode lalu'}</span>
                        </div>
                    </motion.div>

                    {/* Card 4: QR Conversion & Unique Visitors */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.15 }}
                        className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 shadow-sm relative overflow-hidden group hover:border-purple-500/40 transition-all"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                {a.conversionRate || 'Konversi QR'}
                            </span>
                            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform">
                                <Flame className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-baseline gap-2">
                            <span className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
                                {metrics.qr_conversion_rate || 0}%
                            </span>
                            <span className="text-xs text-zinc-400">efektivitas</span>
                        </div>
                        <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400">
                                <Users className="w-3.5 h-3.5 text-purple-500" />
                                <span className="font-semibold">{metrics.unique_visitors}</span> {a.uniqueVisitors || 'visitor unik'}
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* 4. INTERACTIVE TIMELINE CHART & EXPO PEAK HOURS GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Trend Line / Area Chart */}
                    <div className="lg:col-span-2 p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                                    {a.trendTitle || 'Tren Aktivitas & Diseminasi Riset'}
                                </h3>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                    {a.trendDesc || 'Dinamika scan QR, tampilan showcase, dan download flyer per hari'}
                                </p>
                            </div>

                            {/* Chart Metric Switcher */}
                            <div className="inline-flex p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold">
                                {[
                                    { id: 'all', label: a.tabAll || 'Semua' },
                                    { id: 'scans', label: a.tabScans || 'QR Scans' },
                                    { id: 'views', label: a.tabViews || 'Views' },
                                    { id: 'downloads', label: a.tabDownloads || 'Downloads' },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveChartTab(tab.id)}
                                        className={`px-3 py-1 rounded-lg transition-all ${
                                            activeChartTab === tab.id
                                                ? 'bg-white dark:bg-[#121824] text-zinc-900 dark:text-white shadow-sm font-bold'
                                                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Interactive SVG Chart Container */}
                        <div className="relative pt-6 pb-2">
                            {timeline.length > 0 ? (
                                <div className="w-full h-64 sm:h-72 relative">
                                    {/* Hover Tooltip display */}
                                    {hoveredDataPoint && (
                                        <div
                                            className="absolute top-0 z-20 pointer-events-none transform -translate-x-1/2 p-2.5 rounded-xl bg-zinc-900/95 dark:bg-zinc-800/95 text-white text-xs shadow-xl border border-zinc-700/60 backdrop-blur-sm space-y-1"
                                            style={{ left: `${hoveredDataPoint.xPercent}%` }}
                                        >
                                            <div className="font-bold text-[#0AB600]">{hoveredDataPoint.date}</div>
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-[#0AB600]" />
                                                <span>Scan QR: <strong>{hoveredDataPoint.qr_scans}</strong></span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-sky-400" />
                                                <span>Showcase: <strong>{hoveredDataPoint.showcase_views}</strong></span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-amber-400" />
                                                <span>Downloads: <strong>{hoveredDataPoint.downloads}</strong></span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Grid Lines */}
                                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 dark:opacity-10">
                                        {[0, 1, 2, 3, 4].map((i) => (
                                            <div key={i} className="border-b border-zinc-500 w-full" />
                                        ))}
                                    </div>

                                    {/* SVG Polylines & Paths */}
                                    <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${Math.max(timeline.length * 20, 100)} 100`} preserveAspectRatio="none">
                                        <defs>
                                            <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#0AB600" stopOpacity="0.35" />
                                                <stop offset="100%" stopColor="#0AB600" stopOpacity="0.0" />
                                            </linearGradient>
                                            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.3" />
                                                <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.0" />
                                            </linearGradient>
                                        </defs>

                                        {/* Generate SVG Path Points */}
                                        {(() => {
                                            const totalPoints = timeline.length;
                                            const width = Math.max(totalPoints * 20, 100);
                                            const step = totalPoints > 1 ? width / (totalPoints - 1) : width;

                                            const getPoints = (key) =>
                                                timeline.map((item, idx) => {
                                                    const x = idx * step;
                                                    const val = item[key] || 0;
                                                    const y = 95 - (val / maxTimelineValue) * 85;
                                                    return `${x},${y}`;
                                                });

                                            const getAreaPath = (key) => {
                                                const pts = getPoints(key);
                                                if (!pts.length) return '';
                                                return `M 0,95 L ${pts.join(' L ')} L ${width},95 Z`;
                                            };

                                            return (
                                                <>
                                                    {/* Views Area & Line */}
                                                    {(activeChartTab === 'all' || activeChartTab === 'views') && (
                                                        <>
                                                            <path d={getAreaPath('showcase_views')} fill="url(#skyGrad)" />
                                                            <polyline
                                                                fill="none"
                                                                stroke="#0ea5e9"
                                                                strokeWidth="2.5"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                points={getPoints('showcase_views').join(' ')}
                                                            />
                                                        </>
                                                    )}

                                                    {/* Scans Area & Line */}
                                                    {(activeChartTab === 'all' || activeChartTab === 'scans') && (
                                                        <>
                                                            <path d={getAreaPath('qr_scans')} fill="url(#emeraldGrad)" />
                                                            <polyline
                                                                fill="none"
                                                                stroke="#0AB600"
                                                                strokeWidth="3"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                points={getPoints('qr_scans').join(' ')}
                                                            />
                                                        </>
                                                    )}

                                                    {/* Downloads Line */}
                                                    {(activeChartTab === 'all' || activeChartTab === 'downloads') && (
                                                        <polyline
                                                            fill="none"
                                                            stroke="#f59e0b"
                                                            strokeWidth="2"
                                                            strokeDasharray="4 2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            points={getPoints('downloads').join(' ')}
                                                        />
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </svg>

                                    {/* Invisible Hover overlay columns */}
                                    <div className="absolute inset-0 flex">
                                        {timeline.map((item, idx) => (
                                            <div
                                                key={idx}
                                                className="flex-1 h-full cursor-crosshair group relative"
                                                onMouseEnter={() =>
                                                    setHoveredDataPoint({
                                                        ...item,
                                                        xPercent: ((idx + 0.5) / timeline.length) * 100,
                                                    })
                                                }
                                                onMouseLeave={() => setHoveredDataPoint(null)}
                                            >
                                                <div className="w-full h-full opacity-0 group-hover:opacity-100 bg-[#0AB600]/10 border-x border-[#0AB600]/20 transition-opacity" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="h-64 flex flex-col items-center justify-center text-zinc-400 text-sm">
                                    <BarChart3 className="w-8 h-8 mb-2 opacity-40" />
                                    <span>Belum ada rekaman data pada rentang waktu ini.</span>
                                </div>
                            )}

                            {/* X-Axis Date Labels */}
                            <div className="flex justify-between items-center mt-3 text-[11px] text-zinc-400 font-mono px-1">
                                {timeline.filter((_, idx) => idx % Math.max(1, Math.floor(timeline.length / 6)) === 0).map((pt, i) => (
                                    <span key={i}>{pt.label}</span>
                                ))}
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="flex flex-wrap items-center justify-center gap-6 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                            <div className="flex items-center gap-2 font-medium text-zinc-600 dark:text-zinc-300">
                                <span className="w-3 h-3 rounded-full bg-[#0AB600]" />
                                <span>Scan QR Code (Expo/Flyer)</span>
                            </div>
                            <div className="flex items-center gap-2 font-medium text-zinc-600 dark:text-zinc-300">
                                <span className="w-3 h-3 rounded-full bg-sky-500" />
                                <span>Showcase Page Views</span>
                            </div>
                            <div className="flex items-center gap-2 font-medium text-zinc-600 dark:text-zinc-300">
                                <span className="w-3 h-3 rounded-full bg-amber-500" />
                                <span>Flyer Downloads & Prints</span>
                            </div>
                        </div>
                    </div>

                    {/* Expo Dissemination Peak Timing & Day-of-Week Distribution */}
                    <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex flex-col justify-between space-y-4">
                        <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1">
                                <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
                                    {expoTimingTab === 'hourly' ? (a.peakHoursTitle || 'Waktu Puncak Scan (24 Jam)') : 'Tren Scan Berdasarkan Hari'}
                                </h3>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                    {expoTimingTab === 'hourly'
                                        ? 'Distribusi jam saat pengunjung expo paling aktif memindai QR code.'
                                        : 'Aktivitas scan dan kunjungan dari Senin hingga Minggu.'}
                                </p>
                            </div>

                            {/* Switcher Hourly vs Weekly */}
                            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setExpoTimingTab('hourly')}
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                        expoTimingTab === 'hourly'
                                            ? 'bg-white dark:bg-zinc-700 text-[#0AB600] shadow-xs'
                                            : 'text-zinc-500 hover:text-slate-900 dark:hover:text-zinc-300'
                                    }`}
                                >
                                    24 Jam
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setExpoTimingTab('weekly')}
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                        expoTimingTab === 'weekly'
                                            ? 'bg-white dark:bg-zinc-700 text-[#0AB600] shadow-xs'
                                            : 'text-zinc-500 hover:text-slate-900 dark:hover:text-zinc-300'
                                    }`}
                                >
                                    Hari (Sen-Min)
                                </button>
                            </div>
                        </div>

                        {/* Busiest Hour / Day Highlight Box */}
                        {expoTimingTab === 'hourly' && busiestHour && (
                            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 to-[#089600]/10 border border-amber-500/20 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                                        <Flame className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{a.peakHourHighlight || 'Jam Paling Ramai'}</div>
                                        <div className="text-sm font-bold text-amber-600 dark:text-amber-400">{busiestHour.label} WIB</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-base font-extrabold text-zinc-900 dark:text-white">{busiestHour.total}</div>
                                    <div className="text-[10px] text-zinc-400">interaksi</div>
                                </div>
                            </div>
                        )}

                        {/* Hourly Chart Display */}
                        {expoTimingTab === 'hourly' ? (
                            <div className="space-y-2">
                                <div className="h-36 flex items-end gap-1 pt-4 pb-1">
                                    {hourly.map((h, i) => {
                                        const heightPercent = maxHourlyValue > 0 ? (h.total / maxHourlyValue) * 100 : 0;
                                        const isPeak = busiestHour && h.hour === busiestHour.hour;
                                        return (
                                            <div
                                                key={i}
                                                className="flex-1 h-full flex flex-col justify-end items-center group relative cursor-pointer"
                                            >
                                                <div
                                                    className={`w-full rounded-t transition-all duration-300 ${
                                                        isPeak
                                                            ? 'bg-amber-500 shadow-sm shadow-amber-500/50'
                                                            : h.total > 0
                                                            ? 'bg-[#0AB600]/70 group-hover:bg-[#0AB600]'
                                                            : 'bg-zinc-200 dark:bg-zinc-800'
                                                    }`}
                                                    style={{ height: `${Math.max(heightPercent, 4)}%` }}
                                                />
                                                <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none p-1.5 rounded-lg bg-zinc-900 text-white text-[10px] font-mono whitespace-nowrap z-30 shadow-lg">
                                                    {h.label}: {h.scans} scan / {h.views} view
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                                    <span>00:00</span>
                                    <span>06:00</span>
                                    <span>12:00</span>
                                    <span>18:00</span>
                                    <span>23:00</span>
                                </div>
                            </div>
                        ) : (
                            /* Day-of-Week Expo Distribution */
                            <div className="space-y-2.5 pt-1">
                                {day_of_week.map((d) => {
                                    const maxDayTotal = Math.max(...day_of_week.map((item) => item.total || 0), 1);
                                    const pct = Math.round((d.total / maxDayTotal) * 100);
                                    return (
                                        <div key={d.day} className="space-y-1">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-semibold text-slate-800 dark:text-zinc-200 w-16">
                                                    {d.label}
                                                </span>
                                                <div className="flex items-center gap-3 text-[11px]">
                                                    <span className="text-[#0AB600] font-bold">{d.scans} scan</span>
                                                    <span className="text-zinc-400">•</span>
                                                    <span className="text-sky-500 font-medium">{d.views} view</span>
                                                </div>
                                            </div>
                                            <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex">
                                                <div
                                                    className="h-full bg-[#0AB600] rounded-full transition-all"
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className="text-[11px] text-zinc-400 italic bg-zinc-50 dark:bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800 flex items-center gap-1.5">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span><strong>Expo Tip:</strong> Optimalkan kehadiran tim lab dan pembagian flyer pada jam & hari puncak pameran.</span>
                        </div>
                    </div>
                </div>

                {/* 5. PERFORMA SCAN QR & KONVERSI PER PROYEK RISET */}
                <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0AB600]/10 text-[#0AB600] text-[11px] font-bold uppercase tracking-wider">
                                <QrCode className="w-3.5 h-3.5" />
                                Analisis Scan QR Interaktif
                            </div>
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                                Performa Scan QR Berdasarkan Proyek Riset
                            </h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                Pantau volume scan QR code flyer, persentase kontribusi (share), dan rasio konversi per proyek riset.
                            </p>
                        </div>

                        {/* Search in projects breakdown */}
                        <div className="relative w-full sm:w-64">
                            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={qrSearch}
                                onChange={(e) => setQrSearch(e.target.value)}
                                placeholder="Cari proyek riset..."
                                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#0AB600]"
                            />
                        </div>
                    </div>

                    {/* QR Performance Table / Cards */}
                    {(() => {
                        const filteredQrList = projects_qr_breakdown.filter((p) => {
                            if (!qrSearch.trim()) return true;
                            const q = qrSearch.toLowerCase();
                            return (
                                (p.name && p.name.toLowerCase().includes(q)) ||
                                (p.title && p.title.toLowerCase().includes(q)) ||
                                (p.category && p.category.toLowerCase().includes(q))
                            );
                        });

                        if (!filteredQrList.length) {
                            return (
                                <div className="py-8 text-center text-xs text-zinc-500">
                                    Tidak ada data scan QR proyek yang cocok dengan pencarian.
                                </div>
                            );
                        }

                        return (
                            <div className="space-y-3">
                                {filteredQrList.map((item, idx) => (
                                    <div
                                        key={item.id}
                                        className="p-4 rounded-2xl bg-zinc-50/70 dark:bg-[#161f30] border border-zinc-200/80 dark:border-zinc-800 hover:border-[#0AB600]/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                                    >
                                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                                            <span className="w-7 h-7 rounded-xl font-bold text-xs bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0">
                                                {idx + 1}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0AB600]/10 text-[#0AB600]">
                                                        {item.category || 'General'}
                                                    </span>
                                                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                                                        {item.name}
                                                    </h4>
                                                </div>
                                                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                                                    {item.title || item.name}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Metrics & Share Progress */}
                                        <div className="flex items-center gap-6 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-200/60 dark:border-zinc-800/80">
                                            {/* Progress Share */}
                                            <div className="w-32 hidden sm:block">
                                                <div className="flex justify-between text-[11px] font-medium text-zinc-500 mb-1">
                                                    <span>Share</span>
                                                    <span className="font-bold text-slate-800 dark:text-zinc-200">{item.share_percent}%</span>
                                                </div>
                                                <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                                                    <div
                                                        className="h-full bg-[#0AB600] rounded-full"
                                                        style={{ width: `${Math.min(item.share_percent, 100)}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Scan Count */}
                                            <div className="text-right">
                                                <span className="text-base font-black text-[#0AB600]">
                                                    {item.scans_count}
                                                </span>
                                                <span className="block text-[10px] text-zinc-400 font-medium">
                                                    QR Scans
                                                </span>
                                            </div>

                                            {/* Conversion Rate */}
                                            <div className="text-right">
                                                <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                                                    {item.conversion_rate}%
                                                </span>
                                                <span className="block text-[10px] text-zinc-400 font-medium">
                                                    Konversi
                                                </span>
                                            </div>

                                            {/* Growth Badge */}
                                            <div className="text-right w-16">
                                                <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                                    item.growth >= 0
                                                        ? 'bg-[#0AB600]/10 text-[#0AB600]'
                                                        : 'bg-rose-500/10 text-rose-600'
                                                }`}>
                                                    {item.growth >= 0 ? '+' : ''}{item.growth}%
                                                </span>
                                            </div>

                                            {/* Quick Action Link */}
                                            <Link
                                                href={`/projects/${item.id}`}
                                                className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-[#0AB600] transition-colors"
                                                title="Lihat Detail Proyek"
                                            >
                                                <ArrowUpRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    })()}
                </div>

                {/* 5. 3-WAY FEATURED RESEARCH LEADERBOARD */}
                <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0AB600]/10 text-[#0AB600] text-[11px] font-bold uppercase tracking-wider">
                                <Award className="w-3.5 h-3.5" />
                                {a.leaderboardTitle || 'Peringkat Proyek Riset Unggulan'}
                            </div>
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                                {a.leaderboardTitle || 'Proyek Riset Paling Populer'}
                            </h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                {a.leaderboardDesc || 'Identifikasi inovasi riset yang paling banyak menarik minat audiens, mitra, dan industri.'}
                            </p>
                        </div>

                        {/* Leaderboard Tabs Switcher */}
                        <div className="inline-flex p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 text-xs font-semibold self-start sm:self-auto shrink-0 shadow-2xs">
                            {[
                                { id: 'most_scanned', label: a.tabMostScanned || 'Scan QR', icon: QrCode },
                                { id: 'most_viewed', label: a.tabMostViewed || 'Dilihat', icon: Eye },
                                { id: 'most_downloaded', label: a.tabMostDownloaded || 'Download', icon: Download },
                            ].map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveLeaderboardTab(tab.id)}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                                            activeLeaderboardTab === tab.id
                                                ? 'bg-[#0AB600] text-white shadow-2xs font-bold'
                                                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                                        }`}
                                    >
                                        <Icon className="w-3.5 h-3.5" />
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Leaderboard Project Cards / Table */}
                    {(() => {
                        const currentList = leaderboards[activeLeaderboardTab] || [];

                        if (!currentList.length) {
                            return (
                                <div className="py-12 text-center flex flex-col items-center justify-center">
                                    <img
                                        src="/assets/img/icon/notfound.png"
                                        alt="Belum Ada Data"
                                        className="w-24 sm:w-28 h-auto object-contain mx-auto mb-3 drop-shadow-xs"
                                    />
                                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                                        {a.noLeaderboardData || 'Belum ada data interaksi proyek pada periode ini.'}
                                    </span>
                                </div>
                            );
                        }

                        return (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {currentList.map((project, idx) => {
                                    const count =
                                        activeLeaderboardTab === 'most_scanned'
                                            ? project.scans_count
                                            : activeLeaderboardTab === 'most_viewed'
                                            ? project.views_count
                                            : project.downloads_count;

                                    const medalColor =
                                        idx === 0
                                            ? 'bg-amber-400 text-amber-950 ring-amber-300'
                                            : idx === 1
                                            ? 'bg-slate-300 text-slate-900 ring-slate-200'
                                            : idx === 2
                                            ? 'bg-amber-700 text-white ring-amber-600'
                                            : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 ring-transparent';

                                    return (
                                        <div
                                            key={project.id}
                                            className="p-5 rounded-2xl bg-zinc-50/70 dark:bg-[#161f30] border border-zinc-200/80 dark:border-zinc-800 flex flex-col justify-between gap-4 hover:border-[#0AB600]/50 hover:shadow-md transition-all group"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                    <span className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center ring-2 shrink-0 ${medalColor}`}>
                                                        #{idx + 1}
                                                    </span>
                                                    <div>
                                                        <span className="inline-block px-2 py-0.5 rounded-md bg-[#0AB600]/10 text-[#0AB600] text-[10px] font-bold uppercase mb-1">
                                                            {project.category || 'General'}
                                                        </span>
                                                        <h4 className="text-sm font-bold text-zinc-900 dark:text-white line-clamp-1 group-hover:text-[#0AB600] transition-colors">
                                                            {project.name}
                                                        </h4>
                                                    </div>
                                                </div>

                                                <div className="text-right shrink-0">
                                                    <span className="text-lg font-black text-[#0AB600]">
                                                        {count || 0}
                                                    </span>
                                                    <span className="block text-[10px] text-zinc-400">
                                                        {activeLeaderboardTab === 'most_scanned' ? 'scans' : activeLeaderboardTab === 'most_viewed' ? 'views' : 'downloads'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-3 border-t border-zinc-200/60 dark:border-zinc-800/80 text-xs">
                                                <span className="text-zinc-500 dark:text-zinc-400 text-[11px] line-clamp-1">
                                                    {project.title || project.name}
                                                </span>
                                                <Link
                                                    href={`/projects/${project.id}`}
                                                    className="inline-flex items-center gap-1 font-semibold text-[#0AB600] hover:underline shrink-0 ml-2"
                                                >
                                                    <span>{a.actionView || 'Detail'}</span>
                                                    <ArrowUpRight className="w-3 h-3" />
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })()}
                </div>

                {/* 6. DEVICES & LOCATION GEOGRAPHY BREAKDOWN */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Device & Platform Breakdown */}
                    <div className="lg:col-span-2 p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-6">
                        <div>
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                                {a.deviceDistributionTitle || 'Perangkat & Platform Pengunjung'}
                            </h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                {a.deviceDistributionDesc || 'Distribusi kategori gadget, browser, dan sistem operasi yang digunakan pengunjung'}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {/* Device Type Bars */}
                            {[
                                { key: 'mobile', label: 'Mobile Smartphone', icon: Smartphone, color: 'bg-[#0AB600]', text: 'text-[#0AB600]' },
                                { key: 'desktop', label: 'Desktop / Laptop', icon: Monitor, color: 'bg-sky-500', text: 'text-sky-500' },
                                { key: 'tablet', label: 'Tablet Pad', icon: Tablet, color: 'bg-purple-500', text: 'text-purple-500' },
                            ].map((dev) => {
                                const Icon = dev.icon;
                                const count = devices.types?.[dev.key] || 0;
                                const percent = Math.round((count / totalDeviceCount) * 100);

                                return (
                                    <div key={dev.key} className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#161f30] border border-zinc-200/70 dark:border-zinc-800 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                                <Icon className={`w-4 h-4 ${dev.text}`} />
                                                <span>{dev.label}</span>
                                            </div>
                                            <span className="text-xs font-bold text-zinc-900 dark:text-white">{percent}%</span>
                                        </div>
                                        <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                                            <div className={`h-full ${dev.color}`} style={{ width: `${percent}%` }} />
                                        </div>
                                        <div className="text-[11px] text-zinc-400">{count} sesi terekam</div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Top Operating Systems & Browsers */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                            {/* Operating Systems */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                    {a.operatingSystem || 'Sistem Operasi (OS)'}
                                </h4>
                                <div className="space-y-2">
                                    {Object.entries(devices.platforms || {}).map(([os, count]) => {
                                        const pct = Math.round((Number(count) / totalDeviceCount) * 100);
                                        return (
                                            <div key={os} className="flex items-center justify-between text-xs">
                                                <span className="font-medium text-zinc-800 dark:text-zinc-200">{os}</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-24 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                                                        <div className="h-full bg-[#0AB600]" style={{ width: `${pct}%` }} />
                                                    </div>
                                                    <span className="text-zinc-400 font-mono w-8 text-right">{pct}%</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Browsers */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                    {a.browserName || 'Browser Populer'}
                                </h4>
                                <div className="space-y-2">
                                    {Object.entries(devices.browsers || {}).map(([browser, count]) => {
                                        const pct = Math.round((Number(count) / totalDeviceCount) * 100);
                                        return (
                                            <div key={browser} className="flex items-center justify-between text-xs">
                                                <span className="font-medium text-zinc-800 dark:text-zinc-200">{browser}</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-24 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                                                        <div className="h-full bg-sky-500" style={{ width: `${pct}%` }} />
                                                    </div>
                                                    <span className="text-zinc-400 font-mono w-8 text-right">{pct}%</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Top Visitor Locations / Cities */}
                    <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4 flex flex-col justify-between">
                        <div className="space-y-1">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[11px] font-bold uppercase tracking-wider">
                                <MapPin className="w-3 h-3" />
                                {a.topLocationsTitle || 'Lokasi Pengunjung'}
                            </div>
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                                {a.topLocationsTitle || 'Wilayah & Kota Teraktif'}
                            </h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                {a.topLocationsDesc || 'Kota asal pemindaian QR & akses showcase riset'}
                            </p>
                        </div>

                        <div className="space-y-3 my-2">
                            {locations.length > 0 ? (
                                locations.map((loc, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-[#161f30] border border-zinc-200/60 dark:border-zinc-800"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-7 h-7 rounded-lg bg-[#0AB600]/10 text-[#0AB600] flex items-center justify-center font-bold text-xs">
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-zinc-900 dark:text-white">{loc.city}</div>
                                                <div className="text-[10px] text-zinc-400">{loc.country || 'Indonesia'}</div>
                                            </div>
                                        </div>
                                        <span className="px-2 py-0.5 rounded-full bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold">
                                            {loc.total}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="py-8 text-center text-xs text-zinc-400">
                                    {a.noLocationData || 'Belum ada data geolokasi'}
                                </div>
                            )}
                        </div>

                        <div className="text-[11px] text-zinc-400 italic bg-sky-50 dark:bg-sky-950/30 p-2.5 rounded-xl border border-sky-200 dark:border-sky-900/50 flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                            <span>Mendeteksi kota & wilayah jaringan IP saat flyer discan di arena expo maupun diakses online.</span>
                        </div>
                    </div>
                </div>

                {/* 7. REAL-TIME RECENT SCAN STREAM (LIVE ACTIVITY FEED) */}
                <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0AB600] opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0AB600]" />
                                </span>
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                                    {a.recentFeedTitle || 'Aktivitas Interaksi Real-Time'}
                                </h3>
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                {a.recentFeedDesc || 'Catatan langsung pemindaian QR code dan kunjungan showcase terkini'}
                            </p>
                        </div>

                        {/* Search and Filter for Feed */}
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Search */}
                            <div className="relative w-full sm:w-56">
                                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={eventSearch}
                                    onChange={(e) => setEventSearch(e.target.value)}
                                    placeholder="Cari proyek, kota, browser..."
                                    className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg bg-zinc-50 dark:bg-[#1a2234] border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#0AB600]"
                                />
                                {eventSearch && (
                                    <button
                                        type="button"
                                        onClick={() => setEventSearch('')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>

                            {/* Reset button if filtered */}
                            {(eventFilter !== 'all' || eventSearch !== '' || eventSort !== 'time' || eventSortDir !== 'desc') && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEventFilter('all');
                                        setEventSearch('');
                                        setEventSort('time');
                                        setEventSortDir('desc');
                                    }}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100 transition-colors cursor-pointer"
                                >
                                    <RotateCcw className="w-3 h-3" />
                                    <span>Reset</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filter Pills for Event Types */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-1.5 overflow-x-auto">
                            {[
                                { id: 'all', label: 'Semua Event' },
                                { id: 'qr_scan', label: 'Scan QR' },
                                { id: 'showcase_view', label: 'Showcase View' },
                                { id: 'download', label: 'Download & Print' },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setEventFilter(tab.id)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                        eventFilter === tab.id
                                            ? 'bg-[#0AB600] text-white shadow-2xs font-bold'
                                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="text-xs text-zinc-500 dark:text-zinc-400">
                            Menampilkan <span className="font-semibold text-slate-900 dark:text-white">{filteredEvents.length}</span> interaksi
                        </div>
                    </div>

                    {/* Feed Table */}
                    <div className="overflow-x-auto rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-zinc-50 dark:bg-[#161f30] text-zinc-500 dark:text-zinc-400 font-semibold border-b border-zinc-200/80 dark:border-zinc-800">
                                <tr>
                                    <th className="py-3 px-4">
                                        <button
                                            type="button"
                                            onClick={() => handleEventSortColumn('time')}
                                            className="inline-flex items-center gap-1.5 hover:text-[#0AB600] dark:hover:text-[#0AB600] transition cursor-pointer"
                                        >
                                            <span>{a.tableTime || 'Waktu'}</span>
                                            {renderEventSortIcon('time')}
                                        </button>
                                    </th>
                                    <th className="py-3 px-4">
                                        <button
                                            type="button"
                                            onClick={() => handleEventSortColumn('event_type')}
                                            className="inline-flex items-center gap-1.5 hover:text-[#0AB600] dark:hover:text-[#0AB600] transition cursor-pointer"
                                        >
                                            <span>{a.tableEvent || 'Tipe Event'}</span>
                                            {renderEventSortIcon('event_type')}
                                        </button>
                                    </th>
                                    <th className="py-3 px-4">
                                        <button
                                            type="button"
                                            onClick={() => handleEventSortColumn('project')}
                                            className="inline-flex items-center gap-1.5 hover:text-[#0AB600] dark:hover:text-[#0AB600] transition cursor-pointer"
                                        >
                                            <span>{a.tableProject || 'Proyek Riset'}</span>
                                            {renderEventSortIcon('project')}
                                        </button>
                                    </th>
                                    <th className="py-3 px-4">
                                        <button
                                            type="button"
                                            onClick={() => handleEventSortColumn('device')}
                                            className="inline-flex items-center gap-1.5 hover:text-[#0AB600] dark:hover:text-[#0AB600] transition cursor-pointer"
                                        >
                                            <span>{a.tableDevice || 'Perangkat / OS'}</span>
                                            {renderEventSortIcon('device')}
                                        </button>
                                    </th>
                                    <th className="py-3 px-4">
                                        <button
                                            type="button"
                                            onClick={() => handleEventSortColumn('location')}
                                            className="inline-flex items-center gap-1.5 hover:text-[#0AB600] dark:hover:text-[#0AB600] transition cursor-pointer"
                                        >
                                            <span>{a.tableLocation || 'Lokasi'}</span>
                                            {renderEventSortIcon('location')}
                                        </button>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                                {filteredEvents.length > 0 ? (
                                    filteredEvents.map((ev) => {
                                        const isQr = ev.event_type === 'qr_scan';
                                        const isView = ev.event_type === 'showcase_view';

                                        const badgeStyle = isQr
                                            ? 'bg-[#0AB600]/10 text-[#0AB600] border-[#0AB600]/20'
                                            : isView
                                            ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20'
                                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';

                                        return (
                                            <tr key={ev.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition">
                                                <td className="py-3 px-4 whitespace-nowrap text-zinc-500 dark:text-zinc-400 font-mono">
                                                    <div>{ev.created_at_relative}</div>
                                                    <div className="text-[10px] text-zinc-400">{ev.created_at}</div>
                                                </td>
                                                <td className="py-3 px-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${badgeStyle}`}>
                                                        {isQr && <QrCode className="w-3 h-3" />}
                                                        {isView && <Eye className="w-3 h-3" />}
                                                        {!isQr && !isView && <Download className="w-3 h-3" />}
                                                        <span>{ev.event_type}</span>
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    {ev.project ? (
                                                        <div>
                                                            <div className="font-bold text-zinc-900 dark:text-white line-clamp-1">{ev.project.name}</div>
                                                            <div className="text-[10px] text-zinc-400">{ev.project.category}</div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-zinc-400">-</span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 whitespace-nowrap text-zinc-600 dark:text-zinc-300">
                                                    <div className="capitalize font-medium">{ev.device_type} · {ev.platform}</div>
                                                    <div className="text-[10px] text-zinc-400">{ev.browser}</div>
                                                </td>
                                                <td className="py-3 px-4 whitespace-nowrap text-zinc-600 dark:text-zinc-300">
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3 text-[#0AB600]" />
                                                        <span>{ev.city}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="py-10 text-center">
                                            <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                                                <img
                                                    src="/assets/img/icon/notfound.png"
                                                    alt="Belum Ada Aktivitas"
                                                    className="w-20 sm:w-24 h-auto object-contain mx-auto mb-2 drop-shadow-xs"
                                                />
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                                    {a.emptyEvents || 'Belum ada catatan aktivitas pada periode ini.'}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
