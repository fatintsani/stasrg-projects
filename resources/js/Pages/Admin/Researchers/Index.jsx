import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { useApp } from '../../../Context/AppContext';
import { useAlert } from '../../../Context/AlertContext';
import {
    GraduationCap,
    Users,
    Building2,
    BookOpen,
    Search,
    Plus,
    Copy,
    Check,
    Download,
    Trash2,
    ExternalLink,
    Layers,
    Sparkles,
    Shield,
    Upload,
    X,
    Loader2,
    CheckCircle2,
    RotateCcw,
    ArrowUpDown,
    Filter,
    Pencil,
    Award,
    Mail,
    UserCheck,
    Globe,
    Share2,
    ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ResearchersIndex({
    researchers = { data: [], links: [] },
    stats = {},
    filters = {},
}) {
    const { t } = useApp();
    const { showSuccess, showError, showConfirm } = useAlert();

    const [search, setSearch] = useState(filters.search || '');
    const [selectedRole, setSelectedRole] = useState(filters.role || 'all');
    const [sort, setSort] = useState(filters.sort || 'created_at');
    const [direction, setDirection] = useState(filters.direction || 'desc');

    // Create Modal State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [createData, setCreateData] = useState({
        name: '',
        role: 'Anggota Peneliti',
        identifier: '',
        lab_affiliation: 'Center of Excellence STAS-RG',
        email: '',
        scholar_url: '',
        scopus_url: '',
        sinta_url: '',
        orcid_url: '',
        linkedin_url: '',
        expertise: '',
        bio: '',
        avatar: null,
        avatar_preview: null,
    });
    const [isCreating, setIsCreating] = useState(false);

    // Edit Modal State
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingResearcher, setEditingResearcher] = useState(null);
    const [editData, setEditData] = useState({
        id: null,
        name: '',
        role: 'Anggota Peneliti',
        identifier: '',
        lab_affiliation: '',
        email: '',
        scholar_url: '',
        scopus_url: '',
        sinta_url: '',
        orcid_url: '',
        linkedin_url: '',
        expertise: '',
        bio: '',
        avatar: null,
        avatar_preview: null,
    });
    const [isUpdating, setIsUpdating] = useState(false);

    const rolesList = [
        { id: 'all', label: 'Semua Peran' },
        { id: 'Principal Investigator / Ketua Peneliti', label: 'Ketua Peneliti (PI)' },
        { id: 'Dosen Peneliti / Pembimbing', label: 'Dosen / Pembimbing' },
        { id: 'Anggota Peneliti', label: 'Anggota Peneliti' },
        { id: 'Mahasiswa Peneliti / Asisten Riset', label: 'Mahasiswa / Asisten' },
        { id: 'Teknisi / Engineer Riset', label: 'Teknisi / Engineer' },
        { id: 'Mitra Kolaborator Eksternal', label: 'Mitra Kolaborator' },
    ];

    const isFilterActive = selectedRole !== 'all' || search !== '' || sort !== 'created_at' || direction !== 'desc';

    // Apply Filters Helper
    const applyFilters = (r = selectedRole, s = search, newSort = sort, newDirection = direction) => {
        router.get(
            '/researchers',
            {
                role: r === 'all' ? undefined : r,
                search: s || undefined,
                sort: newSort,
                direction: newDirection,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleRoleChange = (newRole) => {
        setSelectedRole(newRole);
        applyFilters(newRole, search, sort, direction);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        applyFilters(selectedRole, search, sort, direction);
    };

    const handleResetFilters = () => {
        setSelectedRole('all');
        setSearch('');
        setSort('created_at');
        setDirection('desc');
        router.get('/researchers');
    };

    // Create Avatar File Change
    const handleCreateAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setCreateData((prev) => ({
                ...prev,
                avatar: reader.result,
                avatar_preview: reader.result,
            }));
        };
        reader.readAsDataURL(file);
    };

    // Edit Avatar File Change
    const handleEditAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setEditData((prev) => ({
                ...prev,
                avatar: reader.result,
                avatar_preview: reader.result,
            }));
        };
        reader.readAsDataURL(file);
    };

    // Submit Create
    const handleCreateSubmit = (e) => {
        e.preventDefault();
        if (!createData.name.trim()) {
            showError('Nama Wajib Diisi', 'Silakan masukkan nama lengkap peneliti.');
            return;
        }

        setIsCreating(true);
        router.post('/researchers', createData, {
            onSuccess: () => {
                showSuccess('Peneliti Ditambahkan', 'Data peneliti berhasil disimpan ke direktori master.');
                setIsCreateOpen(false);
                setCreateData({
                    name: '',
                    role: 'Anggota Peneliti',
                    identifier: '',
                    lab_affiliation: 'Center of Excellence STAS-RG',
                    email: '',
                    scholar_url: '',
                    scopus_url: '',
                    sinta_url: '',
                    orcid_url: '',
                    linkedin_url: '',
                    expertise: '',
                    bio: '',
                    avatar: null,
                    avatar_preview: null,
                });
            },
            onError: (errs) => {
                const msg = Object.values(errs)[0] || 'Terjadi kesalahan saat menyimpan data peneliti.';
                showError('Gagal Menyimpan', String(msg));
            },
            onFinish: () => setIsCreating(false),
        });
    };

    // Open Edit Modal
    const openEditModal = (researcher) => {
        setEditingResearcher(researcher);
        setEditData({
            id: researcher.id,
            name: researcher.name || '',
            role: researcher.role || 'Anggota Peneliti',
            identifier: researcher.identifier || '',
            lab_affiliation: researcher.lab_affiliation || '',
            email: researcher.email || '',
            scholar_url: researcher.scholar_url || '',
            scopus_url: researcher.scopus_url || '',
            sinta_url: researcher.sinta_url || '',
            orcid_url: researcher.orcid_url || '',
            linkedin_url: researcher.linkedin_url || '',
            expertise: Array.isArray(researcher.expertise)
                ? researcher.expertise.join(', ')
                : (typeof researcher.expertise === 'string' ? researcher.expertise : ''),
            bio: researcher.bio || '',
            avatar: null,
            avatar_preview: researcher.avatar_url || (researcher.avatar ? (researcher.avatar.startsWith('http') ? researcher.avatar : `/storage/${researcher.avatar}`) : null),
        });
        setIsEditOpen(true);
    };

    // Submit Update
    const handleUpdateSubmit = (e) => {
        e.preventDefault();
        if (!editData.name.trim()) {
            showError('Nama Wajib Diisi', 'Silakan masukkan nama lengkap peneliti.');
            return;
        }

        setIsUpdating(true);
        router.post(`/researchers/${editData.id}`, {
            ...editData,
            _method: 'PUT',
        }, {
            onSuccess: () => {
                showSuccess('Data Diperbarui', 'Informasi peneliti berhasil diperbarui.');
                setIsEditOpen(false);
                setEditingResearcher(null);
            },
            onError: (errs) => {
                const msg = Object.values(errs)[0] || 'Gagal memperbarui data peneliti.';
                showError('Gagal Update', String(msg));
            },
            onFinish: () => setIsUpdating(false),
        });
    };

    // Delete Researcher
    const handleDeleteResearcher = (researcher) => {
        showConfirm({
            title: 'Hapus Peneliti dari Direktori?',
            message: `Apakah Anda yakin ingin menghapus data "${researcher.name}"? Data proyek yang sudah menggunakan profil ini tidak akan terhapus.`,
            confirmText: 'Ya, Hapus Peneliti',
            cancelText: 'Batal',
            type: 'danger',
            onConfirm: () => {
                router.delete(`/researchers/${researcher.id}`, {
                    onSuccess: () => {
                        showSuccess('Berhasil Dihapus', `Data ${researcher.name} telah dihapus dari direktori.`);
                    },
                    onError: (errs) => {
                        const msg = Object.values(errs)[0] || 'Gagal menghapus data peneliti.';
                        showError('Gagal Hapus', String(msg));
                    },
                });
            },
        });
    };

    return (
        <AdminLayout
            title="Direktori Peneliti & Authors"
            currentPath="/researchers"
        >
            <Head title="Direktori Peneliti & Authors - STAS RG" />

            <div className="space-y-6">
                {/* Header Page */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-[#0AB600]/10 border border-[#0AB600]/30 text-[#0AB600]">
                                <GraduationCap className="w-6 h-6" />
                            </div>
                            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                                Direktori Peneliti &amp; Authors
                            </h1>
                        </div>
                        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                            Master data tim peneliti, dosen, mahasiswa, profil Google Scholar, Scopus, SINTA, &amp; ORCID yang dapat ditarik langsung ke form flyer proyek.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            type="button"
                            onClick={() => setIsCreateOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0AB600] hover:bg-[#089600] text-white text-xs sm:text-sm font-semibold transition-all shadow-sm cursor-pointer active:scale-95"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Tambah Peneliti Baru</span>
                        </button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-[#0AB600]/10 text-[#0AB600]">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-slate-900 dark:text-white">
                                {stats.total || 0}
                            </div>
                            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                                Total Peneliti Terdaftar
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
                            <Award className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-slate-900 dark:text-white">
                                {stats.pi_count || 0}
                            </div>
                            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                                Principal Investigator (PI)
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
                            <GraduationCap className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-slate-900 dark:text-white">
                                {stats.dosen_count || 0}
                            </div>
                            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                                Dosen &amp; Pembimbing
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-500">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-slate-900 dark:text-white">
                                {stats.mahasiswa_count || 0}
                            </div>
                            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                                Mahasiswa &amp; Asisten Riset
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter, Search & Tab Controls */}
                <div className="bg-white dark:bg-[#121824] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-4 space-y-3.5 shadow-xs">
                    {/* Role Filter Tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                        {rolesList.map((r) => (
                            <button
                                key={r.id}
                                type="button"
                                onClick={() => handleRoleChange(r.id)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                                    selectedRole === r.id
                                        ? 'bg-[#0AB600] text-white shadow-xs'
                                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                                }`}
                            >
                                <span>{r.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Search and Sort Toolbar */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
                            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nama, NIDN, lab, keahlian, atau email..."
                                className="w-full pl-10 pr-9 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-slate-900 dark:text-white placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-[#0AB600]/30 focus:border-[#0AB600]"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearch('');
                                        applyFilters(selectedRole, '', sort, direction);
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </form>

                        <div className="flex items-center gap-2">
                            {/* Sort Dropdown */}
                            <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-2.5 py-1.5">
                                <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                <select
                                    value={`${sort}_${direction}`}
                                    onChange={(e) => {
                                        const [s, d] = e.target.value.split('_');
                                        setSort(s);
                                        setDirection(d);
                                        applyFilters(selectedRole, search, s, d);
                                    }}
                                    className="bg-transparent text-xs text-slate-700 dark:text-zinc-300 font-medium focus:outline-hidden cursor-pointer"
                                >
                                    <option value="created_at_desc">Terbaru Ditambahkan</option>
                                    <option value="created_at_asc">Paling Lama</option>
                                    <option value="name_asc">Nama (A - Z)</option>
                                    <option value="name_desc">Nama (Z - A)</option>
                                    <option value="usage_count_desc">Paling Sering Digunakan</option>
                                </select>
                            </div>

                            {/* Reset Button */}
                            {isFilterActive && (
                                <button
                                    type="button"
                                    onClick={handleResetFilters}
                                    title="Reset Semua Filter"
                                    className="p-2 rounded-xl text-rose-500 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 transition-colors cursor-pointer"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Researcher Cards Grid */}
                {researchers.data.length === 0 ? (
                    <div className="bg-white dark:bg-[#121824] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-12 text-center space-y-4 shadow-xs">
                        <img
                            src="/assets/img/icon/notfound.png"
                            alt="Belum Ada Data Peneliti"
                            className="w-28 sm:w-32 h-auto object-contain mx-auto mb-2 drop-shadow-xs"
                        />
                        <div className="space-y-1">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                Belum Ada Data Peneliti
                            </h3>
                            <p className="text-xs text-zinc-500 max-w-md mx-auto">
                                Belum ada peneliti yang sesuai dengan pencarian atau filter Anda. Tambahkan profil peneliti baru untuk memudahkan pengisian data flyer di kemudian hari.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsCreateOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0AB600] hover:bg-[#089600] text-white text-xs font-semibold transition-all shadow-sm cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Tambah Peneliti Pertama</span>
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {researchers.data.map((r) => (
                            <div
                                key={r.id}
                                className="bg-white dark:bg-[#121824] rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-4 shadow-xs hover:border-[#0AB600]/40 transition-all flex flex-col justify-between gap-4 group"
                            >
                                <div className="space-y-3">
                                    {/* Card Header: Avatar, Name, Role & Action Menu */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                                {r.avatar_url || r.avatar ? (
                                                    <img
                                                        src={r.avatar_url || (r.avatar.startsWith('http') ? r.avatar : `/storage/${r.avatar}`)}
                                                        alt={r.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                    />
                                                ) : (
                                                    <span className="text-sm font-extrabold text-zinc-400 uppercase">
                                                        {r.name ? r.name.substring(0, 2) : 'ST'}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate" title={r.name}>
                                                    {r.name}
                                                </h3>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <span
                                                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                                            r.role.includes('Principal') || r.role.includes('Ketua')
                                                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                                                                : r.role.includes('Dosen') || r.role.includes('Pembimbing')
                                                                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                                                                : r.role.includes('Mahasiswa')
                                                                ? 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300'
                                                                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                                        }`}
                                                    >
                                                        {r.role}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions: Edit & Delete */}
                                        <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                                            <button
                                                type="button"
                                                onClick={() => openEditModal(r)}
                                                title="Edit Data Peneliti"
                                                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteResearcher(r)}
                                                title="Hapus Peneliti"
                                                className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Body Details: Identifier, Lab, Email */}
                                    <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300 pt-1">
                                        {r.identifier && (
                                            <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                                                <span className="font-semibold text-zinc-400">ID:</span>
                                                <span>{r.identifier}</span>
                                            </div>
                                        )}

                                        {r.lab_affiliation && (
                                            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                                                <Building2 className="w-3.5 h-3.5 text-[#0AB600] shrink-0" />
                                                <span className="truncate">{r.lab_affiliation}</span>
                                            </div>
                                        )}

                                        {r.email && (
                                            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                                                <Mail className="w-3.5 h-3.5 text-[#0AB600] shrink-0" />
                                                <a href={`mailto:${r.email}`} className="hover:underline truncate">{r.email}</a>
                                            </div>
                                        )}

                                        {r.expertise && (
                                            <div className="pt-1">
                                                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                                                    Keahlian / Riset:
                                                </span>
                                                <div className="flex flex-wrap gap-1">
                                                    {(Array.isArray(r.expertise) ? r.expertise : (typeof r.expertise === 'string' ? r.expertise.split(',') : [])).map((exp, i) => (
                                                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                                            {typeof exp === 'string' ? exp.trim() : exp}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Academic Badges & Profile Links */}
                                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center gap-1.5">
                                        {r.scholar_url && (
                                            <a
                                                href={r.scholar_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                title="Google Scholar"
                                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 text-[10px] font-semibold hover:bg-blue-100 transition-colors"
                                            >
                                                <span>Scholar</span>
                                                <ExternalLink className="w-2.5 h-2.5" />
                                            </a>
                                        )}
                                        {r.scopus_url && (
                                            <a
                                                href={r.scopus_url.startsWith('http') ? r.scopus_url : `https://www.scopus.com/authid/detail.uri?authorId=${r.scopus_url}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                title="Scopus Author Profile"
                                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 text-[10px] font-semibold hover:bg-orange-100 transition-colors"
                                            >
                                                <span>Scopus</span>
                                                <ExternalLink className="w-2.5 h-2.5" />
                                            </a>
                                        )}
                                        {r.sinta_url && (
                                            <a
                                                href={r.sinta_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                title="SINTA Profile"
                                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold hover:bg-emerald-100 transition-colors"
                                            >
                                                <span>SINTA</span>
                                                <ExternalLink className="w-2.5 h-2.5" />
                                            </a>
                                        )}
                                        {r.orcid_url && (
                                            <a
                                                href={r.orcid_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                title="ORCID Record"
                                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-lime-50 dark:bg-lime-950/50 text-lime-700 dark:text-lime-400 text-[10px] font-semibold hover:bg-lime-100 transition-colors"
                                            >
                                                <span>ORCID</span>
                                                <ExternalLink className="w-2.5 h-2.5" />
                                            </a>
                                        )}
                                        {r.linkedin_url && (
                                            <a
                                                href={r.linkedin_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                title="LinkedIn Profile"
                                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 text-[10px] font-semibold hover:bg-sky-100 transition-colors"
                                            >
                                                <span>LinkedIn</span>
                                                <ExternalLink className="w-2.5 h-2.5" />
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {/* Card Footer: Usage Count & Quick Status */}
                                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
                                    <span>
                                        {r.usage_count > 0 ? `Digunakan di ${r.usage_count} proyek` : 'Belum digunakan'}
                                    </span>
                                    <span className="text-[10px] font-medium text-zinc-400">
                                        ID #{r.id}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {researchers.links && researchers.links.length > 3 && (
                    <div className="flex items-center justify-center gap-1.5 pt-4">
                        {researchers.links.map((link, idx) => (
                            <button
                                key={idx}
                                disabled={!link.url || link.active}
                                onClick={() => link.url && router.get(link.url, {}, { preserveState: true, preserveScroll: true })}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`px-3 py-1.5 text-xs rounded-xl font-semibold transition-colors cursor-pointer ${
                                    link.active
                                        ? 'bg-[#0AB600] text-white'
                                        : link.url
                                        ? 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                                        : 'opacity-40 cursor-not-allowed bg-zinc-100 dark:bg-zinc-900 text-zinc-400'
                                }`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Modal Tambah Peneliti Baru */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#101726] rounded-3xl border border-zinc-200/80 dark:border-zinc-800 w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between gap-4 bg-zinc-50/70 dark:bg-zinc-900/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-[#0AB600]/10 border border-[#0AB600]/30 text-[#0AB600]">
                                    <GraduationCap className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                        Tambah Peneliti Baru
                                    </h3>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                        Masukkan informasi lengkap peneliti untuk disimpan ke direktori master.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsCreateOpen(false)}
                                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form Body */}
                        <form onSubmit={handleCreateSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                            {/* Avatar Upload */}
                            <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                                <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 border-2 border-[#0AB600]/40 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                    {createData.avatar_preview ? (
                                        <img
                                            src={createData.avatar_preview}
                                            alt="Avatar Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <GraduationCap className="w-7 h-7 text-zinc-400" />
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0AB600]/10 hover:bg-[#0AB600]/20 text-[#0AB600] text-xs font-semibold cursor-pointer transition-colors border border-[#0AB600]/30">
                                        <Upload className="w-3.5 h-3.5" />
                                        <span>Unggah Foto Profil</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleCreateAvatarChange}
                                            className="hidden"
                                        />
                                    </label>
                                    <p className="text-[11px] text-zinc-400">
                                        Format PNG, JPG, atau WEBP. Otomatis dikompresi.
                                    </p>
                                </div>
                            </div>

                            {/* Row 1: Name, Role */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-800 dark:text-zinc-200 mb-1">
                                        Nama Lengkap &amp; Gelar <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={createData.name}
                                        onChange={(e) => setCreateData({ ...createData, name: e.target.value })}
                                        placeholder="Masukkan nama lengkap beserta gelar"
                                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0AB600]/30 focus:border-[#0AB600]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-800 dark:text-zinc-200 mb-1">
                                        Peran / Posisi Default
                                    </label>
                                    <select
                                        value={createData.role}
                                        onChange={(e) => setCreateData({ ...createData, role: e.target.value })}
                                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0AB600]/30 focus:border-[#0AB600]"
                                    >
                                        <option value="Principal Investigator / Ketua Peneliti">Principal Investigator (Ketua Peneliti / PI)</option>
                                        <option value="Dosen Peneliti / Pembimbing">Dosen Peneliti / Pembimbing</option>
                                        <option value="Anggota Peneliti">Anggota Peneliti (Researcher)</option>
                                        <option value="Mahasiswa Peneliti / Asisten Riset">Mahasiswa Peneliti / Asisten Riset</option>
                                        <option value="Teknisi / Engineer Riset">Teknisi / Engineer Riset</option>
                                        <option value="Mitra Kolaborator Eksternal">Mitra Kolaborator Eksternal</option>
                                    </select>
                                </div>
                            </div>

                            {/* Row 2: Identifier, Lab, Email */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-800 dark:text-zinc-200 mb-1">
                                        NIM / NIP / NIDN
                                    </label>
                                    <input
                                        type="text"
                                        value={createData.identifier}
                                        onChange={(e) => setCreateData({ ...createData, identifier: e.target.value })}
                                        placeholder="Masukkan NIM, NIP, atau NIDN"
                                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0AB600]/30 focus:border-[#0AB600]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-800 dark:text-zinc-200 mb-1">
                                        Afiliasi Lab / Prodi
                                    </label>
                                    <input
                                        type="text"
                                        value={createData.lab_affiliation}
                                        onChange={(e) => setCreateData({ ...createData, lab_affiliation: e.target.value })}
                                        placeholder="Masukkan afiliasi lab atau institusi"
                                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0AB600]/30 focus:border-[#0AB600]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-800 dark:text-zinc-200 mb-1">
                                        Email Institusi
                                    </label>
                                    <input
                                        type="email"
                                        value={createData.email}
                                        onChange={(e) => setCreateData({ ...createData, email: e.target.value })}
                                        placeholder="Masukkan alamat email institusi"
                                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0AB600]/30 focus:border-[#0AB600]"
                                    />
                                </div>
                            </div>

                            {/* Expertise & Bio */}
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-800 dark:text-zinc-200 mb-1">
                                        Bidang Keahlian / Keywords (Pisahkan dengan koma)
                                    </label>
                                    <input
                                        type="text"
                                        value={createData.expertise}
                                        onChange={(e) => setCreateData({ ...createData, expertise: e.target.value })}
                                        placeholder="Masukkan bidang keahlian (pisahkan dengan koma)"
                                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0AB600]/30 focus:border-[#0AB600]"
                                    />
                                </div>
                            </div>

                            {/* External Academic Links */}
                            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                    Profil Akademik &amp; Sitasi Eksternal
                                </h4>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                                            Google Scholar URL
                                        </label>
                                        <input
                                            type="url"
                                            value={createData.scholar_url}
                                            onChange={(e) => setCreateData({ ...createData, scholar_url: e.target.value })}
                                            placeholder="Masukkan URL Google Scholar"
                                            className="w-full px-3 py-1.5 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-1 focus:ring-[#0AB600] focus:border-[#0AB600]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                                            Scopus Author ID / URL
                                        </label>
                                        <input
                                            type="text"
                                            value={createData.scopus_url}
                                            onChange={(e) => setCreateData({ ...createData, scopus_url: e.target.value })}
                                            placeholder="Masukkan Scopus Author ID atau URL"
                                            className="w-full px-3 py-1.5 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-1 focus:ring-[#0AB600] focus:border-[#0AB600]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                                            SINTA URL
                                        </label>
                                        <input
                                            type="text"
                                            value={createData.sinta_url}
                                            onChange={(e) => setCreateData({ ...createData, sinta_url: e.target.value })}
                                            placeholder="Masukkan URL profil SINTA"
                                            className="w-full px-3 py-1.5 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-1 focus:ring-[#0AB600] focus:border-[#0AB600]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                                            ORCID URL
                                        </label>
                                        <input
                                            type="text"
                                            value={createData.orcid_url}
                                            onChange={(e) => setCreateData({ ...createData, orcid_url: e.target.value })}
                                            placeholder="Masukkan URL ORCID"
                                            className="w-full px-3 py-1.5 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-1 focus:ring-[#0AB600] focus:border-[#0AB600]"
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                                            LinkedIn Profile URL
                                        </label>
                                        <input
                                            type="url"
                                            value={createData.linkedin_url}
                                            onChange={(e) => setCreateData({ ...createData, linkedin_url: e.target.value })}
                                            placeholder="Masukkan URL profil LinkedIn"
                                            className="w-full px-3 py-1.5 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-1 focus:ring-[#0AB600] focus:border-[#0AB600]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateOpen(false)}
                                    className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#0AB600] hover:bg-[#089600] text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50"
                                >
                                    {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    <span>Simpan Peneliti</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Edit Peneliti */}
            {isEditOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-[#101726] rounded-3xl border border-zinc-200/80 dark:border-zinc-800 w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between gap-4 bg-zinc-50/70 dark:bg-zinc-900/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-[#0AB600]/10 border border-[#0AB600]/30 text-[#0AB600]">
                                    <Pencil className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                        Edit Data Peneliti: {editingResearcher?.name}
                                    </h3>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                        Perbarui data profil akademik peneliti.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsEditOpen(false)}
                                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form Body */}
                        <form onSubmit={handleUpdateSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                            {/* Avatar Upload */}
                            <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                                <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 border-2 border-[#0AB600]/40 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                    {editData.avatar_preview ? (
                                        <img
                                            src={editData.avatar_preview}
                                            alt="Avatar Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <GraduationCap className="w-7 h-7 text-zinc-400" />
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0AB600]/10 hover:bg-[#0AB600]/20 text-[#0AB600] text-xs font-semibold cursor-pointer transition-colors border border-[#0AB600]/30">
                                        <Upload className="w-3.5 h-3.5" />
                                        <span>Ganti Foto Profil</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleEditAvatarChange}
                                            className="hidden"
                                        />
                                    </label>
                                    <p className="text-[11px] text-zinc-400">
                                        Format PNG, JPG, atau WEBP. Otomatis dikompresi.
                                    </p>
                                </div>
                            </div>

                            {/* Row 1: Name, Role */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-800 dark:text-zinc-200 mb-1">
                                        Nama Lengkap &amp; Gelar <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={editData.name}
                                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0AB600]/30 focus:border-[#0AB600]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-800 dark:text-zinc-200 mb-1">
                                        Peran / Posisi Default
                                    </label>
                                    <select
                                        value={editData.role}
                                        onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0AB600]/30 focus:border-[#0AB600]"
                                    >
                                        <option value="Principal Investigator / Ketua Peneliti">Principal Investigator (Ketua Peneliti / PI)</option>
                                        <option value="Dosen Peneliti / Pembimbing">Dosen Peneliti / Pembimbing</option>
                                        <option value="Anggota Peneliti">Anggota Peneliti (Researcher)</option>
                                        <option value="Mahasiswa Peneliti / Asisten Riset">Mahasiswa Peneliti / Asisten Riset</option>
                                        <option value="Teknisi / Engineer Riset">Teknisi / Engineer Riset</option>
                                        <option value="Mitra Kolaborator Eksternal">Mitra Kolaborator Eksternal</option>
                                    </select>
                                </div>
                            </div>

                            {/* Row 2: Identifier, Lab, Email */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-800 dark:text-zinc-200 mb-1">
                                        NIM / NIP / NIDN
                                    </label>
                                    <input
                                        type="text"
                                        value={editData.identifier}
                                        onChange={(e) => setEditData({ ...editData, identifier: e.target.value })}
                                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0AB600]/30 focus:border-[#0AB600]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-800 dark:text-zinc-200 mb-1">
                                        Afiliasi Lab / Prodi
                                    </label>
                                    <input
                                        type="text"
                                        value={editData.lab_affiliation}
                                        onChange={(e) => setEditData({ ...editData, lab_affiliation: e.target.value })}
                                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0AB600]/30 focus:border-[#0AB600]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-800 dark:text-zinc-200 mb-1">
                                        Email Institusi
                                    </label>
                                    <input
                                        type="email"
                                        value={editData.email}
                                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0AB600]/30 focus:border-[#0AB600]"
                                    />
                                </div>
                            </div>

                            {/* Expertise */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-800 dark:text-zinc-200 mb-1">
                                    Bidang Keahlian / Keywords
                                </label>
                                <input
                                    type="text"
                                    value={editData.expertise}
                                    onChange={(e) => setEditData({ ...editData, expertise: e.target.value })}
                                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0AB600]/30 focus:border-[#0AB600]"
                                />
                            </div>

                            {/* External Academic Links */}
                            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                    Profil Akademik &amp; Sitasi Eksternal
                                </h4>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                                            Google Scholar URL
                                        </label>
                                        <input
                                            type="url"
                                            value={editData.scholar_url}
                                            onChange={(e) => setEditData({ ...editData, scholar_url: e.target.value })}
                                            className="w-full px-3 py-1.5 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-1 focus:ring-[#0AB600] focus:border-[#0AB600]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                                            Scopus Author ID / URL
                                        </label>
                                        <input
                                            type="text"
                                            value={editData.scopus_url}
                                            onChange={(e) => setEditData({ ...editData, scopus_url: e.target.value })}
                                            className="w-full px-3 py-1.5 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-1 focus:ring-[#0AB600] focus:border-[#0AB600]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                                            SINTA URL
                                        </label>
                                        <input
                                            type="text"
                                            value={editData.sinta_url}
                                            onChange={(e) => setEditData({ ...editData, sinta_url: e.target.value })}
                                            className="w-full px-3 py-1.5 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-1 focus:ring-[#0AB600] focus:border-[#0AB600]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                                            ORCID URL
                                        </label>
                                        <input
                                            type="text"
                                            value={editData.orcid_url}
                                            onChange={(e) => setEditData({ ...editData, orcid_url: e.target.value })}
                                            className="w-full px-3 py-1.5 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-1 focus:ring-[#0AB600] focus:border-[#0AB600]"
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                                            LinkedIn Profile URL
                                        </label>
                                        <input
                                            type="url"
                                            value={editData.linkedin_url}
                                            onChange={(e) => setEditData({ ...editData, linkedin_url: e.target.value })}
                                            className="w-full px-3 py-1.5 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-1 focus:ring-[#0AB600] focus:border-[#0AB600]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsEditOpen(false)}
                                    className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUpdating}
                                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#0AB600] hover:bg-[#089600] text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50"
                                >
                                    {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    <span>Simpan Perubahan</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
