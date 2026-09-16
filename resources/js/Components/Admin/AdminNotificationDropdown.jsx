import React, { useState, useEffect, useRef, useCallback } from 'react';
import { router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell,
    BellOff,
    BellRing,
    Check,
    CheckCheck,
    Trash2,
    X,
    ExternalLink,
    RefreshCw,
    LifeBuoy,
    UserPlus,
    FolderKanban,
    Sparkles,
    ShieldAlert,
    Info,
    Volume2,
    VolumeX,
    Inbox,
    Layers,
    Clock
} from 'lucide-react';
import { useAlert } from '../../Context/AlertContext';

/**
 * Play a gentle Web Audio API chime for new notification alerts
 */
function playNotificationChime() {
    try {
        if (typeof window === 'undefined') return;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
        
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.36);
    } catch {
        // AudioContext may be blocked before first user gesture
    }
}

/**
 * Map icon name string to Lucide icon component
 */
function getNotificationIcon(iconName, type) {
    switch (iconName?.toLowerCase()) {
        case 'userplus':
        case 'user':
            return UserPlus;
        case 'lifebuoy':
        case 'ticket':
            return LifeBuoy;
        case 'folderkanban':
        case 'project':
            return FolderKanban;
        case 'sparkles':
        case 'ai':
            return Sparkles;
        case 'shieldalert':
        case 'alert':
            return ShieldAlert;
        default:
            if (type === 'ticket') return LifeBuoy;
            if (type === 'user') return UserPlus;
            if (type === 'project') return FolderKanban;
            if (type === 'ai') return Sparkles;
            return Bell;
    }
}

/**
 * Map notification level to styling classes
 */
function getLevelBadge(level) {
    switch (level) {
        case 'urgent':
            return {
                bg: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
                iconColor: 'text-red-500',
                dot: 'bg-red-500',
                label: 'Mendesak'
            };
        case 'warning':
            return {
                bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
                iconColor: 'text-amber-500',
                dot: 'bg-amber-500',
                label: 'Perhatian'
            };
        case 'success':
            return {
                bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
                iconColor: 'text-emerald-500',
                dot: 'bg-emerald-500',
                label: 'Selesai'
            };
        default:
            return {
                bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
                iconColor: 'text-[#0AB600]',
                dot: 'bg-[#0AB600]',
                label: 'Info'
            };
    }
}

export default function AdminNotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [counts, setCounts] = useState({ total: 0, unread: 0, ticket: 0, user: 0, system: 0 });
    const [activeTab, setActiveTab] = useState('all');
    const [isLoading, setIsLoading] = useState(false);
    const [isSoundEnabled, setIsSoundEnabled] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('stas_notif_sound') !== 'disabled';
        }
        return true;
    });

    const { showSuccess, showError, showConfirm } = useAlert();
    const dropdownRef = useRef(null);
    const prevUnreadCountRef = useRef(0);

    // Fetch Notifications from API
    const fetchNotifications = useCallback(async (isPolling = false) => {
        if (!isPolling) setIsLoading(true);
        try {
            const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch(`/admin/notifications?filter=${activeTab}&limit=25`, {
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrf || '',
                }
            });
            if (res.ok) {
                const json = await res.json();
                if (json.success) {
                    setNotifications(json.data || []);
                    const newCounts = json.counts || { total: 0, unread: 0 };
                    
                    // Trigger sound chime if unread count increased and sound is enabled
                    if (isPolling && isSoundEnabled && newCounts.unread > prevUnreadCountRef.current) {
                        playNotificationChime();
                    }
                    prevUnreadCountRef.current = newCounts.unread;
                    setCounts(newCounts);
                }
            }
        } catch (err) {
            if (!isPolling) {
                console.error('Failed to fetch notifications:', err);
            }
        } finally {
            if (!isPolling) setIsLoading(false);
        }
    }, [activeTab, isSoundEnabled]);

    // Initial load and refetch on tab change or dropdown open
    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications, activeTab]);

    // Background Polling every 25 seconds for real-time live events
    useEffect(() => {
        const interval = setInterval(() => {
            fetchNotifications(true);
        }, 25000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Toggle Sound Notification
    const toggleSound = () => {
        const next = !isSoundEnabled;
        setIsSoundEnabled(next);
        if (typeof window !== 'undefined') {
            localStorage.setItem('stas_notif_sound', next ? 'enabled' : 'disabled');
        }
        if (next) playNotificationChime();
    };

    // Mark single notification as read
    const handleMarkAsRead = async (id, e) => {
        if (e) e.stopPropagation();
        try {
            const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch(`/admin/notifications/${id}/read`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrf || '',
                }
            });
            if (res.ok) {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n));
                setCounts(prev => ({
                    ...prev,
                    unread: Math.max(0, prev.unread - 1)
                }));
            }
        } catch (err) {
            console.error('Error marking as read:', err);
        }
    };

    // Mark all notifications as read
    const handleMarkAllAsRead = async () => {
        if (counts.unread === 0) return;
        try {
            const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch('/admin/notifications/mark-all-read', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrf || '',
                }
            });
            if (res.ok) {
                setNotifications(prev => prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() })));
                setCounts(prev => ({ ...prev, unread: 0 }));
                showSuccess('Berhasil', 'Semua notifikasi telah ditandai telah dibaca.');
            }
        } catch (err) {
            showError('Gagal', 'Terjadi kesalahan saat menandai notifikasi.');
        }
    };

    // Delete single notification
    const handleDeleteNotification = async (id, e) => {
        if (e) e.stopPropagation();
        try {
            const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch(`/admin/notifications/${id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrf || '',
                }
            });
            if (res.ok) {
                const target = notifications.find(n => n.id === id);
                setNotifications(prev => prev.filter(n => n.id !== id));
                setCounts(prev => ({
                    ...prev,
                    total: Math.max(0, prev.total - 1),
                    unread: target && !target.is_read ? Math.max(0, prev.unread - 1) : prev.unread
                }));
            }
        } catch (err) {
            console.error('Error deleting notification:', err);
        }
    };

    // Clear all notifications
    const handleClearAll = async () => {
        if (notifications.length === 0) return;
        const confirmed = await showConfirm({
            title: 'Hapus Semua Notifikasi?',
            message: 'Tindakan ini akan menghapus seluruh daftar riwayat notifikasi admin.',
            confirmText: 'Hapus Semua',
            cancelText: 'Batal',
            variant: 'danger',
        });
        if (!confirmed) return;

        try {
            const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch('/admin/notifications', {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrf || '',
                }
            });
            if (res.ok) {
                setNotifications([]);
                setCounts({ total: 0, unread: 0, ticket: 0, user: 0, system: 0 });
                showSuccess('Dibersihkan', 'Semua notifikasi telah berhasil dihapus.');
            }
        } catch (err) {
            showError('Gagal', 'Gagal membersihkan daftar notifikasi.');
        }
    };

    // Click on notification to navigate
    const handleItemClick = (notif) => {
        if (!notif.is_read) {
            handleMarkAsRead(notif.id);
        }
        setIsOpen(false);
        if (notif.action_url) {
            router.visit(notif.action_url);
        }
    };

    const tabs = [
        { id: 'all', label: 'Semua', count: counts.total },
        { id: 'unread', label: 'Belum Dibaca', count: counts.unread },
        { id: 'ticket', label: 'Tiket', count: counts.ticket },
        { id: 'user', label: 'Pengguna', count: counts.user },
        { id: 'system', label: 'Sistem', count: counts.system },
    ];

    const hasUnread = counts.unread > 0;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Buka Notifikasi Admin"
                title={hasUnread ? `${counts.unread} notifikasi belum dibaca` : 'Pusat Notifikasi Admin'}
                className={`relative p-2 rounded-xl transition-all cursor-pointer ${
                    isOpen
                        ? 'bg-zinc-200/80 dark:bg-zinc-800 text-slate-900 dark:text-white'
                        : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
            >
                {hasUnread ? (
                    <BellRing className="w-4 h-4 text-[#0AB600] animate-bounce-short" />
                ) : (
                    <Bell className="w-4 h-4" />
                )}

                {/* Pulsing Badge for Unread */}
                {hasUnread && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-red-500 text-white font-mono text-[9px] font-extrabold ring-2 ring-white dark:ring-[#090D16]">
                        {counts.unread > 99 ? '99+' : counts.unread}
                    </span>
                )}
            </button>

            {/* Notification Dropdown Popover */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="fixed sm:absolute right-2 sm:right-0 top-16 sm:top-full mt-2 w-[calc(100vw-1rem)] sm:w-[420px] max-w-[440px] bg-white dark:bg-[#121824] rounded-2xl shadow-2xl border border-zinc-200/80 dark:border-zinc-800 z-50 overflow-hidden flex flex-col max-h-[85vh] sm:max-h-[580px]"
                    >
                        {/* Dropdown Header */}
                        <div className="p-4 pb-3 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg bg-[#0AB600]/10 text-[#0AB600]">
                                        <Bell className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                            <span>Notifikasi Admin</span>
                                            {hasUnread && (
                                                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                                                    {counts.unread} Baru
                                                </span>
                                            )}
                                        </h3>
                                    </div>
                                </div>

                                {/* Header Action Tools */}
                                <div className="flex items-center gap-1">
                                    {/* Audio chime toggle */}
                                    <button
                                        type="button"
                                        onClick={toggleSound}
                                        title={isSoundEnabled ? 'Suara notifikasi aktif (Klik untuk matikan)' : 'Suara notifikasi dibisukan (Klik untuk aktifkan)'}
                                        className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                                            isSoundEnabled
                                                ? 'text-[#0AB600] hover:bg-[#0AB600]/10'
                                                : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                        }`}
                                    >
                                        {isSoundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                                    </button>

                                    {/* Refresh button */}
                                    <button
                                        type="button"
                                        onClick={() => fetchNotifications(false)}
                                        disabled={isLoading}
                                        title="Muat ulang notifikasi"
                                        className="p-1.5 rounded-lg text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50"
                                    >
                                        <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#0AB600]' : ''}`} />
                                    </button>

                                    {/* Mark All Read */}
                                    {hasUnread && (
                                        <button
                                            type="button"
                                            onClick={handleMarkAllAsRead}
                                            title="Tandai semua telah dibaca"
                                            className="p-1.5 rounded-lg text-zinc-400 hover:text-[#0AB600] hover:bg-[#0AB600]/10 transition-colors cursor-pointer"
                                        >
                                            <CheckCheck className="w-3.5 h-3.5" />
                                        </button>
                                    )}

                                    {/* Close Button */}
                                    <button
                                        type="button"
                                        onClick={() => setIsOpen(false)}
                                        className="p-1.5 rounded-lg text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            {/* Filter Tabs */}
                            <div className="flex items-center gap-1 mt-3 overflow-x-auto no-scrollbar pb-0.5">
                                {tabs.map((tab) => {
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            type="button"
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                                                isActive
                                                    ? 'bg-[#0AB600] text-white shadow-xs'
                                                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                                            }`}
                                        >
                                            <span>{tab.label}</span>
                                            {typeof tab.count === 'number' && tab.count > 0 && (
                                                <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono ${
                                                    isActive ? 'bg-white/20 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
                                                }`}>
                                                    {tab.count}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Notification Items List */}
                        <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60 p-1">
                            {isLoading && notifications.length === 0 ? (
                                <div className="py-12 text-center text-zinc-400 space-y-2">
                                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#0AB600]" />
                                    <p className="text-xs">Memuat notifikasi...</p>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="py-10 px-6 text-center space-y-2">
                                    <img
                                        src="/assets/img/icon/notfound.png"
                                        alt="Tidak Ada Notifikasi"
                                        className="w-16 sm:w-20 h-auto object-contain mx-auto mb-1 drop-shadow-xs"
                                    />
                                    <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                                        Tidak Ada Notifikasi
                                    </h4>
                                    <p className="text-[11px] text-zinc-400 max-w-xs mx-auto leading-relaxed">
                                        {activeTab === 'unread'
                                            ? 'Bagus! Semua notifikasi telah selesai Anda tinjau.'
                                            : 'Belum ada notifikasi baru untuk kategori ini saat ini.'}
                                    </p>
                                </div>
                            ) : (
                                notifications.map((notif) => {
                                    const IconComponent = getNotificationIcon(notif.icon, notif.type);
                                    const badge = getLevelBadge(notif.level);
                                    
                                    return (
                                        <div
                                            key={notif.id}
                                            onClick={() => handleItemClick(notif)}
                                            className={`p-3 rounded-xl transition-all cursor-pointer group flex items-start gap-3 relative ${
                                                notif.is_read
                                                    ? 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40 opacity-75 hover:opacity-100'
                                                    : 'bg-[#0AB600]/5 dark:bg-[#0AB600]/10 hover:bg-[#0AB600]/10 border-l-2 border-[#0AB600]'
                                            }`}
                                        >
                                            {/* Icon with status circle */}
                                            <div className={`p-2 rounded-xl shrink-0 mt-0.5 border ${badge.bg}`}>
                                                <IconComponent className="w-4 h-4" />
                                            </div>

                                            {/* Text Content */}
                                            <div className="flex-1 min-w-0 pr-6">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                                        {notif.title}
                                                    </span>
                                                    {!notif.is_read && (
                                                        <span className="w-1.5 h-1.5 rounded-full bg-[#0AB600]" />
                                                    )}
                                                </div>

                                                <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1 leading-relaxed line-clamp-2">
                                                    {notif.message}
                                                </p>

                                                <div className="flex items-center gap-3 mt-2 text-[10px] text-zinc-400">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {notif.time_ago}
                                                    </span>
                                                    {notif.action_url && (
                                                        <span className="text-[#0AB600] font-semibold flex items-center gap-0.5 group-hover:underline">
                                                            Buka Tautan
                                                            <ExternalLink className="w-2.5 h-2.5" />
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Quick Actions (Hover) */}
                                            <div className="absolute right-2 top-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {!notif.is_read && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => handleMarkAsRead(notif.id, e)}
                                                        title="Tandai dibaca"
                                                        className="p-1 rounded-md bg-white dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-zinc-400 hover:text-[#0AB600] shadow-xs transition-colors cursor-pointer"
                                                    >
                                                        <Check className="w-3 h-3" />
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleDeleteNotification(notif.id, e)}
                                                    title="Hapus notifikasi"
                                                    className="p-1 rounded-md bg-white dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-zinc-400 hover:text-red-500 shadow-xs transition-colors cursor-pointer"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Dropdown Footer */}
                        {notifications.length > 0 && (
                            <div className="p-2.5 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center justify-between text-xs">
                                <button
                                    type="button"
                                    onClick={handleMarkAllAsRead}
                                    disabled={!hasUnread}
                                    className="text-[11px] font-semibold text-[#0AB600] hover:underline disabled:text-zinc-400 disabled:no-underline cursor-pointer disabled:cursor-default"
                                >
                                    Tandai Semua Dibaca
                                </button>
                                <button
                                    type="button"
                                    onClick={handleClearAll}
                                    className="text-[11px] font-semibold text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                                >
                                    Hapus Semua
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
