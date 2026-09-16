import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import {
    History,
    X,
    RotateCcw,
    CheckCircle2,
    Calendar,
    User,
    ArrowRight,
    Loader2,
    AlertCircle,
    FileText,
    Layers,
    Palette,
    Sparkles,
    Eye,
    Clock,
    ChevronRight,
    Diff
} from 'lucide-react';
import { useAlert } from '../../Context/AlertContext';

export default function VersionHistoryModal({
    isOpen,
    onClose,
    modelType = 'project', // 'project' | 'template'
    modelId,
    modelName = '',
    onRollbackSuccess,
}) {
    const { showAlert, showConfirm } = useAlert();
    const [loading, setLoading] = useState(false);
    const [rollbackLoading, setRollbackLoading] = useState(false);
    const [versions, setVersions] = useState([]);
    const [currentVersionNumber, setCurrentVersionNumber] = useState(1);
    const [selectedVersion, setSelectedVersion] = useState(null);
    const [viewMode, setViewMode] = useState('diff'); // 'diff' | 'snapshot'

    const fetchVersions = async () => {
        if (!modelId) return;
        setLoading(true);
        try {
            const url = modelType === 'project'
                ? `/projects/${modelId}/versions`
                : `/templates/${modelId}/versions`;

            const res = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                }
            });
            const data = await res.json();
            if (data.success) {
                setVersions(data.versions || []);
                setCurrentVersionNumber(data.current_version || 1);
                if (data.versions && data.versions.length > 0) {
                    setSelectedVersion(data.versions[0]);
                }
            }
        } catch (error) {
            console.error('Failed to load version history:', error);
            showAlert({
                type: 'error',
                title: 'Gagal Memuat Riwayat',
                message: 'Tidak dapat mengambil riwayat versi untuk item ini.',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && modelId) {
            fetchVersions();
        }
    }, [isOpen, modelId, modelType]);

    if (!isOpen) return null;

    const handleRollback = async (version) => {
        if (!version) return;

        const isCurrent = version.version_number === currentVersionNumber;
        if (isCurrent) {
            showAlert({
                type: 'info',
                title: 'Versi Sedang Aktif',
                message: `Versi v${version.version_number} saat ini sudah merupakan versi aktif terbaru.`,
            });
            return;
        }

        const confirmed = await showConfirm({
            title: `Pulihkan ke Versi v${version.version_number}?`,
            message: `Data ${modelType === 'project' ? 'proyek' : 'template'} akan dikembalikan ke kondisi pada versi v${version.version_number}. Riwayat saat ini akan tetap tersimpan secara aman sebagai versi baru.`,
            confirmText: `Ya, Pulihkan ke v${version.version_number}`,
            cancelText: 'Batal',
            variant: 'primary',
        });

        if (confirmed) {
            setRollbackLoading(true);
            const rollbackUrl = modelType === 'project'
                ? `/projects/${modelId}/versions/${version.id}/rollback`
                : `/templates/${modelId}/versions/${version.id}/rollback`;

            router.post(rollbackUrl, {}, {
                preserveScroll: true,
                onSuccess: () => {
                    setRollbackLoading(false);
                    onClose();
                    if (onRollbackSuccess) {
                        onRollbackSuccess();
                    }
                },
                onError: (err) => {
                    setRollbackLoading(false);
                    console.error('Rollback failed:', err);
                }
            });
        }
    };

    const getEventBadge = (event) => {
        switch (event) {
            case 'created':
                return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Dibuat</span>;
            case 'rollback':
                return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">Rollback</span>;
            case 'manual_snapshot':
                return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">Snapshot</span>;
            default:
                return <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">Diperbarui</span>;
        }
    };

    const formatValue = (val) => {
        if (val === null || val === undefined || val === '') {
            return <span className="text-zinc-400 italic font-mono text-xs">(Kosong)</span>;
        }
        if (typeof val === 'boolean') {
            return <span className="font-mono text-xs">{val ? 'True' : 'False'}</span>;
        }
        if (typeof val === 'object') {
            if (Array.isArray(val)) {
                if (val.length === 0) return <span className="text-zinc-400 italic text-xs">(Daftar Kosong)</span>;
                return (
                    <div className="space-y-1">
                        {val.map((item, idx) => (
                            <div key={idx} className="text-xs bg-zinc-50 dark:bg-zinc-800/60 p-1.5 rounded border border-zinc-200/60 dark:border-zinc-700/60">
                                {typeof item === 'object' ? JSON.stringify(item, null, 2) : String(item)}
                            </div>
                        ))}
                    </div>
                );
            }
            return (
                <pre className="text-[11px] bg-zinc-50 dark:bg-zinc-800/80 p-2 rounded border border-zinc-200/60 dark:border-zinc-700/60 overflow-x-auto max-h-48 text-zinc-700 dark:text-zinc-300 font-mono">
                    {JSON.stringify(val, null, 2)}
                </pre>
            );
        }
        return <span className="text-xs break-words">{String(val)}</span>;
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
            <div
                className="bg-white dark:bg-[#121824] border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2.5 rounded-xl bg-[#0AB600]/10 text-[#0AB600] border border-[#0AB600]/20 shrink-0">
                            <History className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                                    Riwayat Versi & Snapshot
                                </h2>
                                <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 shrink-0">
                                    {versions.length} Versi Tersimpan
                                </span>
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                                {modelName || `Item #${modelId}`}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="Tutup Modal"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
                    {/* Left Panel: Version Timeline List */}
                    <div className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 flex flex-col bg-zinc-50/30 dark:bg-zinc-900/20 overflow-hidden shrink-0">
                        <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-800/40 text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                            <span>Garis Waktu Revisi</span>
                            <span className="text-[10px] text-zinc-500 font-normal">Urut Terbaru</span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-3 space-y-2">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
                                    <Loader2 className="w-6 h-6 animate-spin text-[#0AB600] mb-2" />
                                    <p className="text-xs">Memuat riwayat versi...</p>
                                </div>
                            ) : versions.length === 0 ? (
                                <div className="text-center py-12 text-zinc-400 px-4">
                                    <History className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                    <p className="text-xs font-medium">Belum ada riwayat revisi yang tercatat.</p>
                                    <p className="text-[11px] text-zinc-500 mt-1">Setiap kali Anda menyimpan perubahan, snapshot akan otomatis dibuat di sini.</p>
                                </div>
                            ) : (
                                versions.map((ver) => {
                                    const isSelected = selectedVersion?.id === ver.id;
                                    const isCurrent = ver.version_number === currentVersionNumber;

                                    return (
                                        <div
                                            key={ver.id}
                                            onClick={() => setSelectedVersion(ver)}
                                            className={`group relative p-3 rounded-xl border text-left transition-all cursor-pointer ${
                                                isSelected
                                                    ? 'bg-white dark:bg-[#161F30] border-[#0AB600] ring-1 ring-[#0AB600]/40 shadow-sm'
                                                    : 'bg-white/70 dark:bg-[#121824] border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-white dark:hover:bg-[#161f30]/60'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between gap-2 mb-1.5">
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-md ${
                                                        isCurrent
                                                            ? 'bg-[#0AB600] text-white'
                                                            : 'bg-zinc-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200'
                                                    }`}>
                                                        v{ver.version_number}
                                                    </span>
                                                    {getEventBadge(ver.event)}
                                                </div>

                                                {isCurrent && (
                                                    <span className="flex items-center gap-1 text-[10px] font-bold text-[#0AB600] bg-[#0AB600]/10 px-1.5 py-0.5 rounded border border-[#0AB600]/20">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        <span>Aktif Saat Ini</span>
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-xs font-medium text-slate-900 dark:text-white line-clamp-2 mb-2">
                                                {ver.summary || 'Pembaruan data'}
                                            </p>

                                            <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 pt-1.5 border-t border-zinc-100 dark:border-zinc-800/60">
                                                <div className="flex items-center gap-1.5 truncate">
                                                    {ver.user?.avatar ? (
                                                        <img src={ver.user.avatar} alt={ver.user.name} className="w-3.5 h-3.5 rounded-full object-cover shrink-0" />
                                                    ) : (
                                                        <User className="w-3.5 h-3.5 shrink-0" />
                                                    )}
                                                    <span className="truncate">{ver.user?.name || 'Sistem'}</span>
                                                </div>
                                                <span className="shrink-0 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {ver.created_at_formatted}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Right Panel: Version Inspector & Diff Viewer */}
                    <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white dark:bg-[#121824]">
                        {selectedVersion ? (
                            <>
                                {/* Inspector Header Bar */}
                                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 bg-zinc-50/30 dark:bg-zinc-900/30">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold font-mono px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-slate-900 dark:text-white border border-zinc-200 dark:border-zinc-700">
                                                Versi v{selectedVersion.version_number}
                                            </span>
                                            {getEventBadge(selectedVersion.event)}
                                        </div>

                                        <div className="hidden sm:inline-flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-700">
                                            <button
                                                type="button"
                                                onClick={() => setViewMode('diff')}
                                                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                                                    viewMode === 'diff'
                                                        ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs'
                                                        : 'text-zinc-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                                                }`}
                                            >
                                                <Diff className="w-3.5 h-3.5" />
                                                <span>Perubahan (Diff)</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setViewMode('snapshot')}
                                                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                                                    viewMode === 'snapshot'
                                                        ? 'bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs'
                                                        : 'text-zinc-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                                                }`}
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                <span>Snapshot Lengkap</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Action Button: Rollback */}
                                    {selectedVersion.version_number !== currentVersionNumber ? (
                                        <button
                                            type="button"
                                            disabled={rollbackLoading}
                                            onClick={() => handleRollback(selectedVersion)}
                                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0AB600] hover:bg-[#099900] text-white text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                                        >
                                            {rollbackLoading ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <RotateCcw className="w-4 h-4" />
                                            )}
                                            <span>Pulihkan ke Versi v{selectedVersion.version_number}</span>
                                        </button>
                                    ) : (
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                            <span>Versi Aktif Terkini</span>
                                        </div>
                                    )}
                                </div>

                                {/* Inspector Content Area */}
                                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                                    {/* Summary Banner */}
                                    <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                                        <div className="space-y-0.5">
                                            <p className="font-semibold text-slate-800 dark:text-zinc-200">
                                                {selectedVersion.summary}
                                            </p>
                                            <p className="text-zinc-500 text-[11px]">
                                                Dibuat oleh: <strong className="text-zinc-700 dark:text-zinc-300">{selectedVersion.user?.name || 'Sistem'}</strong> pada {selectedVersion.created_at_formatted}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Diff Mode View */}
                                    {viewMode === 'diff' && (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                                                    <Diff className="w-4 h-4 text-[#0AB600]" />
                                                    <span>Bidang yang Berubah pada Versi Ini</span>
                                                </h3>
                                                {selectedVersion.changes && (
                                                    <span className="text-xs text-zinc-500">
                                                        {Object.keys(selectedVersion.changes).length} Bidang Dimodifikasi
                                                    </span>
                                                )}
                                            </div>

                                            {selectedVersion.changes && Object.keys(selectedVersion.changes).length > 0 ? (
                                                <div className="space-y-3">
                                                    {Object.entries(selectedVersion.changes).map(([fieldKey, changeData]) => (
                                                        <div key={fieldKey} className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900/40 shadow-2xs">
                                                            <div className="px-3.5 py-2 bg-zinc-50 dark:bg-zinc-800/70 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                                                                <span className="text-xs font-bold text-slate-900 dark:text-white">
                                                                    {changeData.label || fieldKey}
                                                                </span>
                                                                <span className="text-[10px] font-mono text-zinc-400 uppercase">
                                                                    {fieldKey}
                                                                </span>
                                                            </div>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-200 dark:divide-zinc-800 p-3 gap-3 bg-zinc-50/20 dark:bg-zinc-900/20">
                                                                {/* Old value */}
                                                                <div className="space-y-1">
                                                                    <div className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase flex items-center gap-1">
                                                                        <span>Nilai Sebelumnya</span>
                                                                    </div>
                                                                    <div className="p-2.5 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/40 text-rose-900 dark:text-rose-200 text-xs overflow-x-auto">
                                                                        {formatValue(changeData.old)}
                                                                    </div>
                                                                </div>

                                                                {/* New value */}
                                                                <div className="space-y-1">
                                                                    <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase flex items-center gap-1">
                                                                        <span>Nilai Diperbarui (v{selectedVersion.version_number})</span>
                                                                    </div>
                                                                    <div className="p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200 text-xs overflow-x-auto">
                                                                        {formatValue(changeData.new)}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 text-zinc-400 p-4">
                                                    <AlertCircle className="w-6 h-6 mx-auto mb-1.5 opacity-40 text-[#0AB600]" />
                                                    <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                                                        {selectedVersion.event === 'created' ? 'Versi Inisialisasi Awal' : 'Tidak ada perbedaan bidang yang terdeteksi'}
                                                    </p>
                                                    <p className="text-[11px] text-zinc-500 mt-0.5">
                                                        {selectedVersion.event === 'created'
                                                            ? 'Versi ini adalah titik awal data dibuat. Gunakan tab "Snapshot Lengkap" untuk melihat seluruh konfigurasi.'
                                                            : 'Data disimpan tanpa perubahan nilai pada field utama.'}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Snapshot Mode View */}
                                    {viewMode === 'snapshot' && (
                                        <div className="space-y-4">
                                            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                                                <Eye className="w-4 h-4 text-[#0AB600]" />
                                                <span>Seluruh Snapshot Data Versi v{selectedVersion.version_number}</span>
                                            </h3>

                                            {selectedVersion.snapshot ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {Object.entries(selectedVersion.snapshot).map(([key, val]) => (
                                                        <div key={key} className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/30 space-y-1">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                                                                    {key}
                                                                </span>
                                                            </div>
                                                            <div className="text-xs text-slate-900 dark:text-white">
                                                                {formatValue(val)}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-xs text-zinc-400">Data snapshot tidak tersedia.</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-zinc-400 p-8 text-center">
                                <div>
                                    <History className="w-10 h-10 mx-auto mb-2 opacity-30 text-[#0AB600]" />
                                    <p className="text-sm font-medium">Pilih salah satu versi di sebelah kiri untuk melihat rincian.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between text-xs text-zinc-500">
                    <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#0AB600]" />
                        <span>Sistem kontrol versi otomatis STAS-RG</span>
                    </span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 font-semibold transition-colors cursor-pointer"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}
