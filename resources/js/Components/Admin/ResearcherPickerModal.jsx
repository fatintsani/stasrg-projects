import React, { useState, useEffect } from 'react';
import {
    X,
    Search,
    Check,
    GraduationCap,
    Users,
    Building2,
    BookOpen,
    ExternalLink,
    Plus,
    Loader2,
    Filter,
    Award,
    Mail,
    UserCheck,
    Layers,
    Sparkles,
    CheckCircle2,
    RotateCw,
} from 'lucide-react';
import axios from 'axios';

export default function ResearcherPickerModal({
    isOpen,
    onClose,
    onSelectResearchers, // accepts array of researchers
    existingMembers = [],
    title = 'Pilih dari Direktori Peneliti & Authors',
}) {
    if (!isOpen) return null;

    const [researchers, setResearchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedRole, setSelectedRole] = useState('all');
    const [selectedIds, setSelectedIds] = useState([]);

    const roles = [
        { id: 'all', label: 'Semua Peran' },
        { id: 'Principal Investigator / Ketua Peneliti', label: 'Ketua Peneliti (PI)' },
        { id: 'Dosen Peneliti / Pembimbing', label: 'Dosen / Pembimbing' },
        { id: 'Anggota Peneliti', label: 'Anggota Peneliti' },
        { id: 'Mahasiswa Peneliti / Asisten Riset', label: 'Mahasiswa / Asisten' },
        { id: 'Teknisi / Engineer Riset', label: 'Teknisi / Engineer' },
        { id: 'Mitra Kolaborator Eksternal', label: 'Mitra Kolaborator' },
    ];

    const fetchResearchers = async () => {
        setLoading(true);
        try {
            const params = {};
            if (selectedRole !== 'all') params.role = selectedRole;
            if (search) params.search = search;

            const res = await axios.get('/api/researchers', { params });
            if (res.data?.success) {
                setResearchers(res.data.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch researchers:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResearchers();
    }, [selectedRole]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchResearchers();
    };

    const toggleSelect = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const handleApplySelected = () => {
        if (!onSelectResearchers) return;
        const selectedObjects = researchers.filter((r) => selectedIds.includes(r.id));
        onSelectResearchers(selectedObjects);
        onClose();
    };

    const handleSingleSelect = (researcher) => {
        if (onSelectResearchers) {
            onSelectResearchers([researcher]);
        }
        onClose();
    };

    // Helper to check if already in project
    const isAlreadyInProject = (r) => {
        return existingMembers.some(
            (m) =>
                (m.name && m.name.toLowerCase() === r.name.toLowerCase()) ||
                (m.identifier && r.identifier && m.identifier === r.identifier)
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#101726] rounded-3xl border border-zinc-200/80 dark:border-zinc-800 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between gap-4 bg-zinc-50/70 dark:bg-zinc-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-[#0AB600]/10 border border-[#0AB600]/30 text-[#0AB600]">
                            <GraduationCap className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                {title}
                            </h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                Pilih profil peneliti dari database master untuk dimasukkan langsung ke lembar flyer.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <a
                            href="/researchers"
                            target="_blank"
                            rel="noreferrer"
                            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#0AB600] bg-[#0AB600]/10 hover:bg-[#0AB600]/20 border border-[#0AB600]/30 transition-colors"
                            title="Buka menu direktori di tab baru untuk tambah/edit data master"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Kelola Direktori</span>
                        </a>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="p-4 sm:p-6 border-b border-zinc-200/80 dark:border-zinc-800 space-y-3 bg-zinc-50/40 dark:bg-zinc-900/30">
                    <div className="flex items-center gap-2">
                        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
                            <div className="relative flex-1">
                                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari nama peneliti, NIDN, NIP, NIM, lab, atau keahlian..."
                                    className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-slate-900 dark:text-white placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-[#0AB600]/30 focus:border-[#0AB600]"
                                />
                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearch('');
                                            fetchResearchers();
                                        }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-[#0AB600] hover:bg-[#089600] text-white text-xs font-semibold rounded-xl transition-colors shrink-0 flex items-center gap-1.5"
                            >
                                <Search className="w-3.5 h-3.5" />
                                <span>Cari</span>
                            </button>
                        </form>
                        <button
                            type="button"
                            onClick={() => fetchResearchers()}
                            title="Segarkan daftar peneliti dari master database"
                            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-[#0AB600] hover:border-[#0AB600]/40 transition-colors shrink-0"
                        >
                            <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#0AB600]' : ''}`} />
                        </button>
                    </div>

                    {/* Role Tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                        {roles.map((r) => (
                            <button
                                key={r.id}
                                type="button"
                                onClick={() => setSelectedRole(r.id)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                                    selectedRole === r.id
                                        ? 'bg-[#0AB600] text-white shadow-xs'
                                        : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                                }`}
                            >
                                <span>{r.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3 text-zinc-400">
                            <Loader2 className="w-8 h-8 animate-spin text-[#0AB600]" />
                            <p className="text-xs font-medium">Memuat data direktori peneliti...</p>
                        </div>
                    ) : researchers.length === 0 ? (
                        <div className="text-center py-12 space-y-3">
                            <img
                                src="/assets/img/icon/notfound.png"
                                alt="Tidak Ada Peneliti Ditemukan"
                                className="w-24 sm:w-28 h-auto object-contain mx-auto mb-1 drop-shadow-xs"
                            />
                            <div className="space-y-1">
                                <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                                    Tidak Ada Peneliti Ditemukan
                                </h4>
                                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                                    Tidak ada data peneliti yang cocok dengan filter atau kata kunci pencarian Anda.
                                </p>
                            </div>
                            <a
                                href="/researchers"
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0AB600]/10 text-[#0AB600] hover:bg-[#0AB600]/20 text-xs font-semibold transition-colors"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Buka Master Direktori Peneliti</span>
                            </a>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                            {researchers.map((r) => {
                                const isSelected = selectedIds.includes(r.id);
                                const inProject = isAlreadyInProject(r);

                                return (
                                    <div
                                        key={r.id}
                                        onClick={() => toggleSelect(r.id)}
                                        className={`relative p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                                            isSelected
                                                ? 'bg-[#0AB600]/5 border-[#0AB600] ring-2 ring-[#0AB600]/20'
                                                : 'bg-white dark:bg-zinc-800/70 border-zinc-200/80 dark:border-zinc-700/80 hover:border-[#0AB600]/50 hover:bg-zinc-50/80 dark:hover:bg-zinc-800'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Avatar */}
                                            <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center">
                                                {r.avatar_url || r.avatar ? (
                                                    <img
                                                        src={r.avatar_url || (r.avatar.startsWith('http') ? r.avatar : `/storage/${r.avatar}`)}
                                                        alt={r.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                    />
                                                ) : (
                                                    <span className="text-sm font-bold text-zinc-400 uppercase">
                                                        {r.name ? r.name.substring(0, 2) : 'ST'}
                                                    </span>
                                                )}
                                                {isSelected && (
                                                    <div className="absolute inset-0 bg-[#0AB600]/70 flex items-center justify-center text-white">
                                                        <Check className="w-5 h-5 stroke-[3]" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Detail Info */}
                                            <div className="flex-1 min-w-0 space-y-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                                        {r.name}
                                                    </h4>
                                                    {inProject && (
                                                        <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                                                            Sudah Ditambahkan
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex flex-wrap items-center gap-1.5">
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

                                                    {r.identifier && (
                                                        <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
                                                            {r.identifier}
                                                        </span>
                                                    )}
                                                </div>

                                                {r.lab_affiliation && (
                                                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate flex items-center gap-1">
                                                        <Building2 className="w-3 h-3 text-[#0AB600] shrink-0" />
                                                        <span className="truncate">{r.lab_affiliation}</span>
                                                    </p>
                                                )}

                                                {/* Academic Badges */}
                                                <div className="flex items-center gap-2 pt-1">
                                                    {r.scholar_url && (
                                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 font-semibold">
                                                            Scholar
                                                        </span>
                                                    )}
                                                    {r.scopus_url && (
                                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400 font-semibold">
                                                            Scopus
                                                        </span>
                                                    )}
                                                    {r.sinta_url && (
                                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 font-semibold">
                                                            SINTA
                                                        </span>
                                                    )}
                                                    {r.orcid_url && (
                                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-lime-50 text-lime-700 dark:bg-lime-950/50 dark:text-lime-400 font-semibold">
                                                            ORCID
                                                        </span>
                                                    )}
                                                    {r.linkedin_url && (
                                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400 font-semibold">
                                                            LinkedIn
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card Footer Quick Button */}
                                        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-700/60 flex items-center justify-between">
                                            <span className="text-[10px] text-zinc-400">
                                                {r.usage_count > 0 ? `Digunakan di ${r.usage_count} proyek` : 'Belum digunakan'}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSingleSelect(r);
                                                }}
                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0AB600]/10 hover:bg-[#0AB600] hover:text-white text-[#0AB600] text-[11px] font-bold transition-all cursor-pointer"
                                            >
                                                <Plus className="w-3 h-3" />
                                                <span>Tarik ke Proyek</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="px-6 py-4 border-t border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/50 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                            {selectedIds.length > 0
                                ? `${selectedIds.length} peneliti dipilih`
                                : 'Klik pada kartu untuk memilih beberapa peneliti sekaligus'}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            disabled={selectedIds.length === 0}
                            onClick={handleApplySelected}
                            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#0AB600] hover:bg-[#089600] text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Tambahkan Terpilih ({selectedIds.length})</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
