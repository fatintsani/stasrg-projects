import React, { useState, useEffect } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    FolderKanban,
    List,
    FilePlus2,
    BarChart3,
    Users,
    Activity,
    FolderHeart,
    GraduationCap,
    LifeBuoy,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    X,
    LayoutTemplate,
    Headphones,
    ExternalLink,
    Bot,
    Sparkles,
} from 'lucide-react';
import { useApp } from '../../Context/AppContext';
import { useAlert } from '../../Context/AlertContext';

export default function AdminSidebar({
    isCollapsed,
    setIsCollapsed,
    isMobileOpen,
    setIsMobileOpen,
    currentPath: propCurrentPath,
}) {
    const { t } = useApp();
    const { showConfirm } = useAlert();
    const { url, props: pageProps } = usePage() || { url: '', props: {} };
    const user = pageProps?.auth?.user || { name: 'Administrator', email: 'admin@stasrg.internal', role: 'admin' };
    
    // Normalize url pathname without search query
    const cleanUrl = url ? url.split('?')[0] : '';
    const currentPath = (propCurrentPath || cleanUrl || '/dashboard').replace(/\/$/, '') || '/dashboard';

    const [isProjectsOpen, setIsProjectsOpen] = useState(
        currentPath.startsWith('/projects')
    );

    useEffect(() => {
        if (currentPath.startsWith('/projects')) {
            setIsProjectsOpen(true);
        }
    }, [currentPath]);

    const navItems = [
        {
            id: 'dashboard',
            name: 'Dashboard',
            href: '/dashboard',
            icon: LayoutDashboard,
            active: currentPath === '/dashboard',
        },
        {
            id: 'ai-assistant',
            name: 'NARA AI Assistant',
            href: '/ai-assistant',
            icon: Bot,
            avatar: '/assets/img/icon/profile_cs.png',
            badge: 'AI',
            active: currentPath.startsWith('/ai-assistant'),
        },
        {
            id: 'projects',
            name: 'Projects',
            icon: FolderKanban,
            active: currentPath.startsWith('/projects'),
            children: [
                {
                    id: 'projects-all',
                    name: 'All Projects',
                    href: '/projects',
                    icon: List,
                    active: currentPath === '/projects',
                },
                {
                    id: 'projects-create',
                    name: 'Create Project',
                    href: '/projects/create',
                    icon: FilePlus2,
                    active: currentPath === '/projects/create',
                },
                {
                    id: 'projects-templates',
                    name: 'Template Hub',
                    href: '/templates',
                    icon: LayoutTemplate,
                    active: currentPath.startsWith('/templates'),
                },
            ],
        },
        {
            id: 'templates',
            name: 'Template Hub',
            href: '/templates',
            icon: LayoutTemplate,
            active: currentPath.startsWith('/templates'),
        },
        {
            id: 'analytics',
            name: 'Analytics & Insights',
            href: '/analytics',
            icon: BarChart3,
            active: currentPath.startsWith('/analytics'),
        },
        {
            id: 'media-library',
            name: 'Asset Library',
            href: '/media-library',
            icon: FolderHeart,
            active: currentPath.startsWith('/media-library'),
        },
        {
            id: 'researchers',
            name: 'Direktori Peneliti',
            href: '/researchers',
            icon: GraduationCap,
            active: currentPath.startsWith('/researchers'),
        },
        {
            id: 'users',
            name: 'User Approval',
            href: '/users',
            icon: Users,
            active: currentPath.startsWith('/users'),
        },
        {
            id: 'support-tickets',
            name: 'Support Tickets',
            href: '/support-tickets',
            icon: LifeBuoy,
            active: currentPath.startsWith('/support-tickets'),
        },
        {
            id: 'activity-logs',
            name: 'Activity Logs',
            href: '/activity-logs',
            icon: Activity,
            active: currentPath.startsWith('/activity-logs'),
        },
        {
            id: 'settings',
            name: 'Settings',
            href: '/settings',
            icon: Settings,
            active: currentPath.startsWith('/settings'),
        },
    ];

    const handleProjectsToggle = () => {
        if (isCollapsed) {
            setIsCollapsed(false);
            setIsProjectsOpen(true);
        } else {
            setIsProjectsOpen(!isProjectsOpen);
        }
    };

    const renderNavItem = (item) => {
        const Icon = item.icon;
        const hasChildren = item.children && item.children.length > 0;

        if (hasChildren) {
            return (
                <div key={item.id}>
                    <button
                        type="button"
                        onClick={handleProjectsToggle}
                        title={isCollapsed ? item.name : undefined}
                        data-tooltip-pos="right"
                        className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-between px-3'} py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                            item.active
                                ? 'bg-[#0AB600]/10 text-[#0AB600] border border-[#0AB600]/30'
                                : 'text-zinc-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-zinc-100/80 dark:hover:bg-zinc-800/60'
                        }`}
                    >
                        <div className="flex items-center gap-3 truncate">
                            <Icon className={`w-4 h-4 shrink-0 ${item.active ? 'text-[#0AB600]' : 'text-zinc-400 dark:text-zinc-500'}`} />
                            {!isCollapsed && <span className="truncate">{item.name}</span>}
                        </div>
                        {!isCollapsed && (
                            <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${isProjectsOpen ? 'rotate-180' : ''} ${item.active ? 'text-[#0AB600]' : 'text-zinc-400'}`} />
                        )}
                    </button>

                    {/* Submenu */}
                    {!isCollapsed && (
                        <AnimatePresence initial={false}>
                            {isProjectsOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                                    className="overflow-hidden"
                                >
                                    <div className="ml-4 pl-3 mt-1 space-y-0.5 border-l border-zinc-200/80 dark:border-zinc-800/80">
                                        {item.children.map((child) => {
                                            const ChildIcon = child.icon;
                                            return (
                                                <Link
                                                    key={child.id}
                                                    href={child.href}
                                                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                                                        child.active
                                                            ? 'text-[#0AB600] bg-[#0AB600]/10 font-semibold'
                                                            : 'text-zinc-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40'
                                                    }`}
                                                >
                                                    <ChildIcon className={`w-3.5 h-3.5 shrink-0 ${child.active ? 'text-[#0AB600]' : 'text-zinc-400 dark:text-zinc-500'}`} />
                                                    <span>{child.name}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    )}
                </div>
            );
        }

        return (
            <Link
                key={item.id}
                href={item.href}
                title={isCollapsed ? item.name : undefined}
                data-tooltip-pos="right"
                className={`flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-between px-3'} py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                    item.active
                        ? 'bg-[#0AB600]/10 text-[#0AB600] border border-[#0AB600]/30'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-zinc-100/80 dark:hover:bg-zinc-800/60'
                }`}
            >
                <div className="flex items-center gap-3 truncate">
                    {item.avatar ? (
                        <div className={`relative w-5 h-5 rounded-full overflow-hidden shrink-0 border ${item.active ? 'border-[#0AB600]' : 'border-zinc-300 dark:border-zinc-700'}`}>
                            <img src={item.avatar} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <Icon className={`w-4 h-4 shrink-0 ${item.active ? 'text-[#0AB600]' : 'text-zinc-400 dark:text-zinc-500'}`} />
                    )}
                    {!isCollapsed && <span className="truncate">{item.name}</span>}
                </div>
                {!isCollapsed && item.badge && (
                    <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-full bg-[#0AB600]/15 text-[#0AB600] border border-[#0AB600]/30 shrink-0">
                        {item.badge}
                    </span>
                )}
            </Link>
        );
    };

    const handleLogout = async () => {
        const confirmed = await showConfirm({
            title: 'Konfirmasi Keluar',
            message: 'Apakah Anda yakin ingin mengakhiri sesi Admin STAS RG Projects?',
            confirmText: 'Keluar Akun',
            cancelText: 'Batal',
            variant: 'danger',
        });
        if (confirmed) {
            router.post('/logout');
        }
    };

    const sidebarContent = (
        <div className="h-full flex flex-col justify-between bg-white dark:bg-[#090D16] border-r border-zinc-200/80 dark:border-zinc-800/80 transition-colors select-none">
            {/* Top: Brand Header */}
            <div>
                <div className={`h-16 px-4 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} border-b border-zinc-200/80 dark:border-zinc-800/80`}>
                    {isCollapsed ? (
                        <button
                            type="button"
                            onClick={() => setIsCollapsed(false)}
                            title="Perluas Sidebar"
                            data-tooltip-pos="right"
                            className="w-9 h-9 flex items-center justify-center shrink-0 transition-transform hover:scale-105 cursor-pointer"
                        >
                            <img
                                src="/assets/img/stas.png"
                                alt="STAS RG"
                                className="w-8 h-8 object-contain"
                            />
                        </button>
                    ) : (
                        <div className="flex items-center justify-between w-full">
                            <Link
                                href="/dashboard"
                                className="flex items-center gap-2.5 overflow-hidden group"
                            >
                                <div className="w-9 h-9 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                                    <img
                                        src="/assets/img/stas.png"
                                        alt="STAS RG"
                                        className="w-8 h-8 object-contain"
                                    />
                                </div>
                                <div className="flex flex-col truncate">
                                    <span className="text-sm sm:text-[15px] font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                                        STAS RG <span className="text-[#0AB600] font-bold">Projects</span>
                                    </span>
                                </div>
                            </Link>

                            {/* Mobile Close Button */}
                            <button
                                type="button"
                                onClick={() => setIsMobileOpen(false)}
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 md:hidden cursor-pointer"
                                aria-label="Close sidebar"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Navigation Items */}
                <div className="px-3 py-4 space-y-1 overflow-y-auto max-h-[calc(100vh-12rem)] custom-scrollbar">
                    {navItems.map(renderNavItem)}
                </div>
            </div>

            {/* Bottom: Developer Support & User Card */}
            <div className="p-3 border-t border-zinc-200/80 dark:border-zinc-800/80 space-y-2">
                {/* Developer Support Quick Contact */}
                {!isCollapsed ? (
                    <a
                        href="https://wa.me/6283133977214?text=Halo%20Developer%20STAS%20RG%2C%20saya%20admin%20membutuhkan%20bantuan%20teknis."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2 rounded-xl bg-[#0AB600]/10 border border-[#0AB600]/30 hover:bg-[#0AB600]/15 hover:border-[#0AB600]/50 transition-all group cursor-pointer shadow-2xs"
                        title="Hubungi Sekarang"
                        data-tooltip-pos="top"
                    >
                        <div className="flex items-center gap-2 truncate">
                            <img
                                src="/assets/img/icon/profile_dev.png"
                                alt="Developer Profile"
                                className="w-7 h-7 rounded-lg object-cover border border-[#0AB600]/40 shrink-0 group-hover:scale-105 transition-transform"
                            />
                            <div className="flex flex-col truncate">
                                <span className="text-[11px] font-bold text-[#0AB600] group-hover:text-[#089600] transition-colors truncate">
                                    Developer Support
                                </span>
                                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono truncate">
                                    0831-3397-7214
                                </span>
                            </div>
                        </div>
                        <ExternalLink className="w-3 h-3 text-[#0AB600] shrink-0 transition-colors mr-1" />
                    </a>
                ) : (
                    <a
                        href="https://wa.me/6283133977214?text=Halo%20Developer%20STAS%20RG%2C%20saya%20admin%20membutuhkan%20bantuan%20teknis."
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Hubungi Sekarang"
                        data-tooltip-pos="right"
                        className="w-full flex items-center justify-center p-2 rounded-xl bg-[#0AB600]/10 border border-[#0AB600]/30 hover:bg-[#0AB600]/15 text-[#0AB600] transition-all"
                    >
                        <img
                            src="/assets/img/icon/profile_dev.png"
                            alt="Developer Profile"
                            className="w-7 h-7 rounded-lg object-cover border border-[#0AB600]/40"
                        />
                    </a>
                )}
                {/* User Pill & Quick Logout (Clean without background) */}
                <div className={`px-2.5 py-1.5 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between gap-2'}`}>
                    <div className="flex items-center gap-2.5 truncate">
                        {user?.avatar_url || user?.avatar ? (
                            <img
                                src={user.avatar_url || `/storage/${user.avatar}`}
                                alt={user.name || 'User'}
                                className="w-8 h-8 rounded-full object-cover shrink-0 border border-zinc-200 dark:border-zinc-700"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-[#0AB600]/10 border border-[#0AB600]/30 text-[#0AB600] font-bold text-xs flex items-center justify-center shrink-0">
                                {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
                            </div>
                        )}
                        {!isCollapsed && (
                            <div className="flex flex-col truncate">
                                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                    {user.name}
                                </span>
                                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                                    {user.email}
                                </span>
                            </div>
                        )}
                    </div>

                    {!isCollapsed && (
                        <button
                            type="button"
                            onClick={handleLogout}
                            title="Keluar Akun"
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer shrink-0"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Fixed Sidebar */}
            <aside
                className={`hidden md:block fixed inset-y-0 left-0 z-30 transition-all duration-300 ease-in-out ${
                    isCollapsed ? 'w-20' : 'w-64'
                }`}
            >
                {sidebarContent}
            </aside>

            {/* Mobile Drawer Overlay */}
            <AnimatePresence>
                {isMobileOpen && (
                    <div className="fixed inset-0 z-50 md:hidden flex">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        />

                        {/* Drawer */}
                        <motion.aside
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                            className="relative w-72 max-w-[85vw] h-full z-10"
                        >
                            {sidebarContent}
                        </motion.aside>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
