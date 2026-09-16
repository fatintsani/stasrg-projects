import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { useApp } from '../../../Context/AppContext';
import { useAlert } from '../../../Context/AlertContext';
import {
    Users,
    UserCheck,
    UserX,
    Clock,
    Shield,
    Search,
    CheckCircle2,
    XCircle,
    Trash2,
    Power,
    Mail,
    Calendar,
    AlertCircle,
    UserPlus,
    X,
    Eye,
    EyeOff,
    Loader2,
    KeyRound,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    RotateCcw,
    Filter,
} from 'lucide-react';

export default function UsersIndex({ users, stats, filters = {} }) {
    const { props } = usePage();
    const currentUserId = props.auth?.user?.id;
    const { t, language } = useApp();
    const { showConfirm, showSuccess, showError, showWarning } = useAlert();

    const u = t?.admin?.users || {};

    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [roleFilter, setRoleFilter] = useState(filters.role || 'all');
    const [sortField, setSortField] = useState(filters.sort || 'created_at');
    const [sortDirection, setSortDirection] = useState(filters.direction || 'desc');
    const [rejectingUser, setRejectingUser] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Create User Modal State
    const [isCreatingUser, setIsCreatingUser] = useState(false);
    const [createForm, setCreateForm] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        role: 'admin',
        status: 'approved',
    });
    const [showCreatePassword, setShowCreatePassword] = useState(false);
    const [isSavingUser, setIsSavingUser] = useState(false);

    const applyFilters = (overrides = {}) => {
        const nextSearch = overrides.search !== undefined ? overrides.search : search;
        const nextStatus = overrides.status !== undefined ? overrides.status : statusFilter;
        const nextRole = overrides.role !== undefined ? overrides.role : roleFilter;
        const nextSort = overrides.sort !== undefined ? overrides.sort : sortField;
        const nextDirection = overrides.direction !== undefined ? overrides.direction : sortDirection;

        const params = {};
        if (nextSearch) params.search = nextSearch;
        if (nextStatus && nextStatus !== 'all') params.status = nextStatus;
        if (nextRole && nextRole !== 'all') params.role = nextRole;
        if (nextSort && (nextSort !== 'created_at' || nextDirection !== 'desc')) {
            params.sort = nextSort;
            params.direction = nextDirection;
        }

        router.get('/users', params, { preserveState: true, replace: true });
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

    const handleRoleChange = (role) => {
        setRoleFilter(role);
        applyFilters({ role });
    };

    const handleSortColumn = (field) => {
        let nextDir = 'asc';
        if (sortField === field) {
            nextDir = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            nextDir = field === 'created_at' || field === 'approved_at' ? 'desc' : 'asc';
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
        setRoleFilter('all');
        setSortField('created_at');
        setSortDirection('desc');
        router.get('/users', {}, { preserveState: true, replace: true });
    };

    const isFilterActive = Boolean(
        search ||
        statusFilter !== 'all' ||
        roleFilter !== 'all' ||
        sortField !== 'created_at' ||
        sortDirection !== 'desc'
    );

    const handleApprove = async (user) => {
        const title = u.approveTitle || 'Setujui Akun Pengguna?';
        const message = (u.approveMsg || 'Apakah Anda yakin ingin menyetujui akun "{name}" ({email}) sebagai Admin? Pengguna ini akan dapat mengakses seluruh fitur Admin Panel.')
            .replace('{name}', user.name)
            .replace('{email}', user.email);
        const confirmText = u.approveConfirm || 'Setujui Akun';
        const cancelText = u.approveCancel || 'Batal';

        const confirmed = await showConfirm({
            title,
            message,
            confirmText,
            cancelText,
            variant: 'primary',
        });
        if (confirmed) {
            router.post(`/users/${user.id}/approve`);
        }
    };

    const handleRejectSubmit = (e) => {
        e.preventDefault();
        if (!rejectingUser) return;
        setIsSubmitting(true);
        router.post(`/users/${rejectingUser.id}/reject`, {
            reason: rejectReason || (u.defaultRejectReason || 'Tidak memenuhi kriteria aktivasi.'),
        }, {
            onFinish: () => {
                setIsSubmitting(false);
                setRejectingUser(null);
                setRejectReason('');
            }
        });
    };

    const handleToggleStatus = async (user) => {
        const isDeactivating = user.status === 'approved';
        const title = isDeactivating ? (u.deactivateTitle || 'Menonaktifkan Akun?') : (u.activateTitle || 'Mengaktifkan Kembali Akun?');
        const message = isDeactivating
            ? (u.deactivateMsg || 'Apakah Anda yakin ingin menonaktifkan akses akun "{name}" ({email})?').replace('{name}', user.name).replace('{email}', user.email)
            : (u.activateMsg || 'Apakah Anda yakin ingin mengaktifkan kembali akses akun "{name}" ({email})?').replace('{name}', user.name).replace('{email}', user.email);
        const confirmText = isDeactivating ? (u.deactivateConfirm || 'Nonaktifkan') : (u.activateConfirm || 'Aktifkan');
        const cancelText = u.toggleCancel || 'Batal';

        const confirmed = await showConfirm({
            title,
            message,
            confirmText,
            cancelText,
            variant: isDeactivating ? 'warning' : 'primary',
        });
        if (confirmed) {
            router.post(`/users/${user.id}/toggle-status`);
        }
    };

    const handleDelete = async (user) => {
        const title = u.deleteTitle || 'Hapus Akun Pengguna?';
        const message = (u.deleteMsg || 'Akun "{name}" ({email}) akan dihapus secara permanen dari sistem. Tindakan ini tidak dapat dibatalkan.')
            .replace('{name}', user.name)
            .replace('{email}', user.email);
        const confirmText = u.deleteConfirm || 'Hapus Akun';
        const cancelText = u.deleteCancel || 'Batal';

        const confirmed = await showConfirm({
            title,
            message,
            confirmText,
            cancelText,
            variant: 'danger',
        });
        if (confirmed) {
            router.delete(`/users/${user.id}`);
        }
    };

    // Create User Form Submit
    const handleCreateUserSubmit = (e) => {
        e.preventDefault();

        if (!createForm.name || !createForm.email || !createForm.password) {
            showWarning('Data Belum Lengkap', 'Nama, email, dan kata sandi awal wajib diisi.');
            return;
        }

        if (createForm.password.length < 8) {
            showWarning('Kata Sandi Kurang Panjang', 'Kata sandi minimal harus 8 karakter.');
            return;
        }

        setIsSavingUser(true);
        router.post('/users', createForm, {
            preserveScroll: true,
            onSuccess: () => {
                showSuccess(
                    u.alertUserCreatedTitle || 'Akun Berhasil Dibuat',
                    (u.alertUserCreatedMsg || 'Akun {email} telah berhasil didaftarkan.').replace('{email}', createForm.email)
                );
                setIsCreatingUser(false);
                setCreateForm({
                    name: '',
                    username: '',
                    email: '',
                    password: '',
                    role: 'admin',
                    status: 'approved',
                });
                setIsSavingUser(false);
            },
            onError: (errors) => {
                showError(
                    'Gagal Mendaftarkan Akun',
                    Object.values(errors)[0] || 'Terjadi kesalahan saat menyimpan akun.'
                );
                setIsSavingUser(false);
            },
            onFinish: () => {
                setIsSavingUser(false);
            }
        });
    };

    const userList = users?.data || [];

    return (
        <AdminLayout title={u.pageTitle || 'Manajemen User & Persetujuan'} currentPath="/users">
            <div className="space-y-6">
                
                {/* Header Title & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="p-1.5 rounded-lg bg-[#0AB600]/10 text-[#0AB600] border border-[#0AB600]/30">
                                <Users className="w-5 h-5" />
                            </span>
                            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                                {u.headerTitle || 'Manajemen User & Persetujuan Akun'}
                            </h1>
                        </div>
                        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                            {u.headerSubtitle || 'Tinjau permohonan registrasi, setujui akses Admin, atau kelola status pengguna terdaftar.'}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        {stats.pending > 0 && (
                            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-xs font-bold">
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                                <span>{(u.pendingAlert || '{count} Permohonan Menunggu Persetujuan').replace('{count}', stats.pending)}</span>
                            </div>
                        )}

                        {/* Add User Button */}
                        <button
                            type="button"
                            onClick={() => setIsCreatingUser(true)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0AB600] hover:bg-[#089600] text-white text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer"
                        >
                            <UserPlus className="w-4 h-4" />
                            <span>{u.btnAddUser || '+ Tambah User Baru'}</span>
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                    {/* Total */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800/80">
                        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                            {u.statTotal || 'Total User'}
                        </span>
                        <span className="text-2xl font-black text-slate-900 dark:text-white">
                            {stats.total}
                        </span>
                    </div>

                    {/* Pending */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#121824] border border-amber-200/80 dark:border-amber-900/60 bg-gradient-to-br from-white to-amber-50/30 dark:from-[#121824] dark:to-amber-950/10">
                        <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider block mb-1">
                            {u.statPending || 'Pending Approval'}
                        </span>
                        <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                            {stats.pending}
                        </span>
                    </div>

                    {/* Approved */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#121824] border border-[#0AB600]/30">
                        <span className="text-[11px] font-semibold text-[#0AB600] uppercase tracking-wider block mb-1">
                            {u.statApproved || 'Approved Admin'}
                        </span>
                        <span className="text-2xl font-black text-[#0AB600]">
                            {stats.approved}
                        </span>
                    </div>

                    {/* Inactive / Rejected */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800/80">
                        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                            {u.statInactiveRejected || 'Nonaktif / Ditolak'}
                        </span>
                        <span className="text-2xl font-black text-zinc-600 dark:text-zinc-400">
                            {stats.inactive + stats.rejected}
                        </span>
                    </div>
                </div>

                {/* Filters & Search Toolbar (1 Jajar) */}
                <div className="bg-white dark:bg-[#121824] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-4 shadow-sm space-y-3">
                    <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 overflow-x-auto pb-0.5">
                        {/* Status Tabs */}
                        <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 shrink-0">
                            {[
                                { key: 'all', label: (u.tabAll || 'Semua ({count})').replace('{count}', stats.total) },
                                { key: 'pending', label: (u.tabPending || 'Pending ({count})').replace('{count}', stats.pending) },
                                { key: 'approved', label: (u.tabApproved || 'Approved ({count})').replace('{count}', stats.approved) },
                                { key: 'rejected', label: (u.tabRejected || 'Ditolak ({count})').replace('{count}', stats.rejected) },
                                { key: 'inactive', label: (u.tabInactive || 'Nonaktif ({count})').replace('{count}', stats.inactive) },
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => handleStatusChange(tab.key)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                                        statusFilter === tab.key
                                            ? 'bg-white dark:bg-zinc-800 text-[#0AB600] font-bold shadow-xs'
                                            : 'text-zinc-500 hover:text-slate-900 dark:hover:text-zinc-300'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Controls: Role Filter, Sort Dropdown & Search in 1 Row */}
                        <div className="flex items-center gap-2 shrink-0">
                            {/* Role Filter */}
                            <select
                                value={roleFilter}
                                onChange={(e) => handleRoleChange(e.target.value)}
                                className="px-2.5 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/80 rounded-xl text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-[#0AB600] cursor-pointer shrink-0"
                            >
                                <option value="all">Semua Role</option>
                                <option value="admin">Admin</option>
                                <option value="user">User</option>
                            </select>

                            {/* Sort Dropdown */}
                            <select
                                value={`${sortField}:${sortDirection}`}
                                onChange={(e) => handleQuickSortSelect(e.target.value)}
                                className="px-2.5 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/80 rounded-xl text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-[#0AB600] cursor-pointer shrink-0"
                            >
                                <option value="created_at:desc">Terbaru Terdaftar</option>
                                <option value="created_at:asc">Terlama Terdaftar</option>
                                <option value="name:asc">Nama (A &rarr; Z)</option>
                                <option value="name:desc">Nama (Z &rarr; A)</option>
                                <option value="email:asc">Email (A &rarr; Z)</option>
                                <option value="status:asc">Status</option>
                            </select>

                            {/* Search Bar */}
                            <form onSubmit={handleSearchSubmit} className="relative w-48 sm:w-60 shrink-0">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder={u.searchPlaceholder || 'Cari nama, username, email...'}
                                    className="w-full pl-9 pr-7 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/80 rounded-xl text-slate-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#0AB600] transition-colors"
                                />
                                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5 pointer-events-none" />
                                {search && (
                                    <button
                                        type="button"
                                        onClick={handleClearSearch}
                                        className="p-1 rounded-md text-zinc-400 hover:text-slate-900 dark:hover:text-white absolute right-1.5 top-2 transition-colors cursor-pointer"
                                        title="Hapus pencarian"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </form>

                            {/* Reset Button */}
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
                        </div>
                    </div>

                    {/* Active Counter & Filter Status */}
                    <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400">
                        <div className="flex items-center gap-2">
                            <span>
                                Menampilkan <strong className="text-slate-900 dark:text-white">{users?.from || (userList.length > 0 ? 1 : 0)}</strong> - <strong className="text-slate-900 dark:text-white">{users?.to || userList.length}</strong> dari <strong className="text-[#0AB600]">{users?.total || userList.length}</strong> akun pengguna
                            </span>
                            {isFilterActive && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#0AB600]/10 text-[#0AB600] font-bold border border-[#0AB600]/30">
                                    <Filter className="w-2.5 h-2.5" />
                                    Filter Aktif
                                </span>
                            )}
                        </div>

                        <span className="text-zinc-400">
                            Urutan: <strong className="text-slate-700 dark:text-zinc-300">{sortField === 'name' ? 'Nama' : sortField === 'email' ? 'Email' : sortField === 'status' ? 'Status' : sortField === 'role' ? 'Role' : 'Waktu Daftar'} ({sortDirection.toUpperCase()})</strong>
                        </span>
                    </div>
                </div>

                {/* Users Table */}
                <div className="rounded-3xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-700 dark:text-zinc-300">
                            <thead className="bg-zinc-50/70 dark:bg-zinc-900/70 border-b border-zinc-200/80 dark:border-zinc-800/80 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                <tr>
                                    {/* Sortable: User */}
                                    <th className="px-5 py-3.5">
                                        <button
                                            type="button"
                                            onClick={() => handleSortColumn('name')}
                                            className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                                        >
                                            <span>{u.thUser || 'User'}</span>
                                            {sortField === 'name' ? (
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

                                    {/* Sortable: Email */}
                                    <th className="px-5 py-3.5">
                                        <button
                                            type="button"
                                            onClick={() => handleSortColumn('email')}
                                            className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                                        >
                                            <span>{u.thEmail || 'Email'}</span>
                                            {sortField === 'email' ? (
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

                                    {/* Sortable: Role */}
                                    <th className="px-5 py-3.5">
                                        <button
                                            type="button"
                                            onClick={() => handleSortColumn('role')}
                                            className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                                        >
                                            <span>{u.thRole || 'Role'}</span>
                                            {sortField === 'role' ? (
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

                                    {/* Sortable: Status Akun */}
                                    <th className="px-5 py-3.5">
                                        <button
                                            type="button"
                                            onClick={() => handleSortColumn('status')}
                                            className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                                        >
                                            <span>{u.thStatus || 'Status Akun'}</span>
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

                                    {/* Sortable: Waktu Daftar */}
                                    <th className="px-5 py-3.5 hidden md:table-cell">
                                        <button
                                            type="button"
                                            onClick={() => handleSortColumn('created_at')}
                                            className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                                        >
                                            <span>{u.thRegisteredAt || 'Waktu Daftar'}</span>
                                            {sortField === 'created_at' || sortField === 'approved_at' ? (
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

                                    <th className="px-5 py-3.5 text-right">{u.thAction || 'Aksi Persetujuan'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200/70 dark:divide-zinc-800/70">
                                {userList.length > 0 ? (
                                    userList.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                                        >
                                            {/* User Info */}
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    {user.avatar_url || user.avatar ? (
                                                        <img
                                                             src={user.avatar_url || `/storage/${user.avatar}`}
                                                            alt={user.name || 'User'}
                                                            className="w-9 h-9 rounded-xl object-cover border border-[#0AB600]/30 shrink-0"
                                                        />
                                                    ) : (
                                                        <div className="w-9 h-9 rounded-xl bg-[#0AB600]/15 dark:bg-[#0AB600]/10 border border-[#0AB600]/30 flex items-center justify-center text-[#0AB600] font-bold text-xs shrink-0">
                                                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                                            <span>{user.name}</span>
                                                            {user.id === currentUserId && (
                                                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-normal">
                                                                    {u.youBadge || '(Anda)'}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-[11px] text-zinc-400 font-mono">
                                                            @{user.username || 'user'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Email */}
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5 text-slate-800 dark:text-zinc-200">
                                                    <Mail className="w-3.5 h-3.5 text-zinc-400" />
                                                    <span>{user.email}</span>
                                                </div>
                                            </td>

                                            {/* Role */}
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#0AB600]/10 border border-[#0AB600]/30 text-[#0AB600]">
                                                    <Shield className="w-3 h-3" />
                                                    <span>{user.role === 'admin' ? (u.roleAdmin || 'Admin') : user.role}</span>
                                                </span>
                                            </td>

                                            {/* Status Badge */}
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                {user.status === 'pending' && (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 animate-pulse">
                                                        <Clock className="w-3 h-3" />
                                                        <span>{u.statusPending || 'Menunggu Approval'}</span>
                                                    </span>
                                                )}
                                                {user.status === 'approved' && (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#0AB600]/10 border border-[#0AB600]/30 text-[#0AB600]">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        <span>{u.statusApproved || 'Aktif / Approved'}</span>
                                                    </span>
                                                )}
                                                {user.status === 'rejected' && (
                                                    <div>
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300">
                                                            <XCircle className="w-3 h-3" />
                                                            <span>{u.statusRejected || 'Ditolak'}</span>
                                                        </span>
                                                        {user.rejection_reason && (
                                                            <p className="text-[10px] text-zinc-400 mt-0.5 max-w-xs truncate" title={user.rejection_reason}>
                                                                {user.rejection_reason}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                                {user.status === 'inactive' && (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400">
                                                        <Power className="w-3 h-3" />
                                                        <span>{u.statusInactive || 'Nonaktif'}</span>
                                                    </span>
                                                )}
                                            </td>

                                            {/* Date */}
                                            <td className="px-5 py-4 text-zinc-500 dark:text-zinc-400 text-[11px] hidden md:table-cell whitespace-nowrap">
                                                {new Date(user.created_at).toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-5 py-4 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {user.status === 'pending' && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleApprove(user)}
                                                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0AB600] hover:bg-[#089600] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                                                            >
                                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                                <span>{u.btnApprove || 'Approve'}</span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setRejectingUser(user)}
                                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-semibold transition-all cursor-pointer"
                                                            >
                                                                <XCircle className="w-3.5 h-3.5" />
                                                                <span>{u.btnReject || 'Tolak'}</span>
                                                            </button>
                                                        </>
                                                    )}

                                                    {user.status === 'approved' && user.id !== currentUserId && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleToggleStatus(user)}
                                                            title={u.btnDeactivate || 'Nonaktifkan Akun'}
                                                            className="px-2.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition-all cursor-pointer"
                                                        >
                                                            {u.btnDeactivate || 'Nonaktifkan'}
                                                        </button>
                                                    )}

                                                    {(user.status === 'inactive' || user.status === 'rejected') && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleApprove(user)}
                                                            className="px-2.5 py-1.5 rounded-lg bg-[#0AB600]/10 hover:bg-[#0AB600]/15 dark:bg-[#0AB600]/10 text-[#0AB600] border border-[#0AB600]/30 text-xs font-bold transition-all cursor-pointer"
                                                        >
                                                            {u.btnReactivate || 'Aktifkan Kembali'}
                                                        </button>
                                                    )}

                                                    {user.id !== currentUserId && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(user)}
                                                            title={u.btnDelete || 'Hapus Akun'}
                                                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                                                <img
                                                    src="/assets/img/icon/notfound.png"
                                                    alt="Tidak Ada User"
                                                    className="w-24 sm:w-28 h-auto object-contain mx-auto mb-3 drop-shadow-xs"
                                                />
                                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                                    {u.emptyUsers || 'Belum Ada User Ditemukan'}
                                                </h3>
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                                    {search || roleFilter !== 'all' || statusFilter !== 'all'
                                                        ? 'Tidak ada akun user yang sesuai dengan filter pencarian yang diterapkan.'
                                                        : 'Belum ada pengguna terdaftar pada sistem STAS-RG.'}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {users?.links && users.links.length > 3 && (
                    <div className="flex items-center justify-center gap-1.5 mt-6">
                        {users.links.map((link, idx) => (
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

            {/* Modal Create User */}
            {isCreatingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
                    <div className="bg-white dark:bg-[#121824] rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 max-w-lg w-full shadow-2xl space-y-4 my-8">
                        
                        {/* Modal Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-xl bg-[#0AB600]/10 border border-[#0AB600]/30 text-[#0AB600]">
                                    <UserPlus className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                        {u.createUserModalTitle || 'Tambah Akun Pengguna Baru'}
                                    </h3>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                        {u.createUserModalDesc || 'Daftarkan akun admin atau peneliti baru langsung ke dalam sistem.'}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsCreatingUser(false)}
                                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleCreateUserSubmit} className="space-y-4">
                            
                            {/* Full Name Field */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                                    {u.labelFullName || 'Nama Lengkap'} <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={createForm.name}
                                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                                    placeholder={u.placeholderFullName || 'Masukkan nama lengkap pengguna'}
                                    required
                                    className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#0AB600]"
                                />
                            </div>

                            {/* Username & Email Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                                        {u.labelUsername || 'Username (Opsional)'}
                                    </label>
                                    <input
                                        type="text"
                                        value={createForm.username}
                                        onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                                        placeholder={u.placeholderUsername || 'Masukkan username (opsional)'}
                                        className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#0AB600]"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                                        {u.labelEmail || 'Alamat Email'} <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={createForm.email}
                                        onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                                        placeholder={u.placeholderEmail || 'Masukkan alamat email pengguna'}
                                        required
                                        className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#0AB600]"
                                    />
                                </div>

                            </div>

                            {/* Initial Password Field */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-800 dark:text-zinc-200 flex items-center justify-between">
                                    <span>{u.labelPassword || 'Kata Sandi Awal'} <span className="text-rose-500">*</span></span>
                                    <span className="text-[10px] text-zinc-400">Min. 8 Karakter</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showCreatePassword ? 'text' : 'password'}
                                        value={createForm.password}
                                        onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                                        placeholder={u.placeholderPassword || 'Masukkan kata sandi awal (min. 8 karakter)'}
                                        required
                                        minLength={8}
                                        className="w-full px-3 py-2 pr-10 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#0AB600]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCreatePassword(!showCreatePassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                                    >
                                        {showCreatePassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Role & Status Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                                        {u.labelRole || 'Peran / Role'}
                                    </label>
                                    <select
                                        value={createForm.role}
                                        onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                                        className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#0AB600]"
                                    >
                                        <option value="admin">{u.optRoleAdmin || 'Administrator'}</option>
                                        <option value="researcher">{u.optRoleResearcher || 'Peneliti'}</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                                        {u.labelStatus || 'Status Akun'}
                                    </label>
                                    <select
                                        value={createForm.status}
                                        onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                                        className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#0AB600]"
                                    >
                                        <option value="approved">{u.optStatusApproved || 'Langsung Aktif (Approved)'}</option>
                                        <option value="pending">{u.optStatusPending || 'Menunggu Approval (Pending)'}</option>
                                        <option value="inactive">{u.optStatusInactive || 'Nonaktif (Inactive)'}</option>
                                    </select>
                                </div>

                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                <button
                                    type="button"
                                    onClick={() => setIsCreatingUser(false)}
                                    disabled={isSavingUser}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                                >
                                    {u.rejectCancel || 'Batal'}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSavingUser}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0AB600] hover:bg-[#089600] transition-all shadow-xs cursor-pointer disabled:opacity-50"
                                >
                                    {isSavingUser ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>{u.submittingCreateUser || 'Menyimpan Akun...'}</span>
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="w-4 h-4" />
                                            <span>{u.btnSubmitCreateUser || 'Simpan & Daftarkan Akun'}</span>
                                        </>
                                    )}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}

            {/* Modal Reject Reason */}
            {rejectingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                    <div className="bg-white dark:bg-[#121824] rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 max-w-md w-full shadow-xl">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                            {u.rejectModalTitle || 'Tolak Permohonan Akun'}
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                            {(u.rejectModalDesc || 'Tolak akun {name} ({email}). Masukkan alasan penolakan (opsional):')
                                .replace('{name}', rejectingUser.name)
                                .replace('{email}', rejectingUser.email)}
                        </p>
                        <form onSubmit={handleRejectSubmit} className="space-y-4">
                            <textarea
                                rows={3}
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder={u.rejectPlaceholder || 'Contoh: Informasi akun tidak valid atau tidak memenuhi syarat.'}
                                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#0AB600]"
                            />
                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setRejectingUser(null)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                                >
                                    {u.rejectCancel || 'Batal'}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors"
                                >
                                    {isSubmitting ? (u.rejectingText || 'Menolak...') : (u.rejectConfirm || 'Konfirmasi Tolak')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
