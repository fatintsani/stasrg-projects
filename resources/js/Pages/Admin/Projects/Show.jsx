import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { useAlert } from '../../../Context/AlertContext';
import ProjectPreview from '../../../Components/Admin/ProjectPreview';
import {
    ArrowLeft,
    Edit3,
    Copy,
    Trash2,
    Calendar,
    Globe,
    Languages,
    ExternalLink,
    CheckCircle,
    FileText,
    Share2,
    Loader2,
    Printer,
    Image as ImageIcon,
    Eye,
    History
} from 'lucide-react';
import { downloadFlyerAsPng, printFlyer } from '../../../Utils/flyerExport';
import ExportSosmedModal from '../../../Components/Admin/ExportSosmedModal';
import VersionHistoryModal from '../../../Components/Admin/VersionHistoryModal';

export default function Show({ project }) {
    const { showConfirm } = useAlert();
    const [pngLoading, setPngLoading] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
    const [previewLang, setPreviewLang] = useState('id');

    if (!project) return null;

    const handleDuplicate = async () => {
        const confirmed = await showConfirm({
            title: 'Duplikasi Project?',
            message: `Apakah Anda ingin membuat salinan dari project "${project.name}"? Salinan baru akan dibuat dengan status Draft.`,
            confirmText: 'Duplikasi Project',
            cancelText: 'Batal',
            variant: 'primary',
        });
        if (confirmed) {
            router.post(`/projects/${project.slug}/duplicate`);
        }
    };

    const handleDelete = async () => {
        const confirmed = await showConfirm({
            title: 'Hapus Project?',
            message: `Project "${project.name}" akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.`,
            confirmText: 'Hapus Project',
            cancelText: 'Batal',
            variant: 'danger',
        });
        if (confirmed) {
            router.delete(`/projects/${project.slug}`);
        }
    };

    const handleDownloadPng = async () => {
        if (pngLoading) return;
        setPngLoading(true);

        try {
            const canvasId = `flyer-canvas-${project.slug || project.id}`;
            const langSuffix = previewLang === 'en' ? '_EN' : '_ID';
            const filename = `${project.name.replace(/\s+/g, '_').toLowerCase()}${langSuffix}_flyer_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.png`;
            await downloadFlyerAsPng(canvasId, filename);
        } catch (error) {
            console.error('PNG download error:', error);
        } finally {
            setPngLoading(false);
        }
    };

    const handlePrint = () => {
        const canvasId = `flyer-canvas-${project.slug || project.id}`;
        printFlyer(canvasId, `Flyer (${previewLang.toUpperCase()}) - ${project.title || project.name}`);
    };

    const hasEnContent = Boolean(project.content_en?.title || project.content_en?.description);

    return (
        <AdminLayout title={`Preview - ${project.name}`} currentPath="/projects">
            <div className="space-y-6">
                
                {/* Top Action Bar (2 Rows) */}
                <div className="bg-white dark:bg-[#121824] p-4 sm:p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-4">
                    {/* Row 1: Project Information & Navigation */}
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                            <Link
                                href="/projects"
                                className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors shrink-0"
                                title="Kembali ke Semua Project"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white truncate">
                                        {project.name}
                                    </h1>
                                    <span
                                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                                            project.status === 'published'
                                                ? 'bg-[#0AB600]/10 text-[#0AB600] border-[#0AB600]/30'
                                                : 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/30'
                                        }`}
                                    >
                                        {project.status === 'published' ? 'Published' : 'Draft'}
                                    </span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0">
                                        Format: {project.doc_format === 'social_feed' ? 'Instagram / LinkedIn Feed (1:1)' : project.doc_format === 'social_story' ? 'Instagram Story / WA Status (9:16)' : project.doc_format === 'roll_banner' ? 'X-Banner / Roll-up' : project.doc_format === 'factsheet_2col' ? 'Factsheet 2-Kolom' : project.doc_format === 'pitch_poster' ? 'Pitch Poster (16:9)' : 'A4 Flyer'}
                                    </span>
                                    {(!project.doc_format || project.doc_format === 'a4_flyer') && (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0AB600]/10 text-[#0AB600] border border-[#0AB600]/30 shrink-0">
                                            {project.layout_preset === 'visual_heavy' ? 'Mode B (Visual-Heavy)' : project.layout_preset === 'text_heavy' ? 'Mode C (Text/Spec-Heavy)' : 'Mode A (Balanced)'}
                                        </span>
                                    )}
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 shrink-0">
                                        Tema: {project.color_theme === 'ocean_tech' ? 'Ocean Tech' : project.color_theme === 'crimson_innovation' ? 'Crimson Innovation' : project.color_theme === 'slate_monochrome' ? 'Executive Slate' : 'STAS-RG Official'}
                                    </span>
                                </div>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                                    <span>Kategori: <strong className="text-slate-700 dark:text-zinc-300">{project.category || '-'}</strong></span>
                                    <span>•</span>
                                    <span>Terakhir diupdate: {new Date(project.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                </p>
                            </div>
                        </div>

                        {project.status === 'published' && (
                            <Link
                                href={`/showcase/${project.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0AB600]/10 hover:bg-[#0AB600]/15 dark:hover:bg-[#0AB600]/15 text-[#0AB600] text-xs font-semibold border border-[#0AB600]/30 transition-all shrink-0"
                            >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Lihat di Showcase</span>
                            </Link>
                        )}
                    </div>

                    {/* Row 2: Action Buttons Bar */}
                    <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-2.5">
                        {/* Left Group: Manage Actions */}
                        <div className="flex items-center gap-2">
                            <Link
                                href={`/projects/${project.slug}/edit`}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold whitespace-nowrap transition-all"
                            >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit</span>
                            </Link>

                            <button
                                type="button"
                                onClick={() => setIsVersionModalOpen(true)}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer"
                                title="Lihat Riwayat Versi & Rollback"
                            >
                                <History className="w-3.5 h-3.5 text-[#0AB600]" />
                                <span>Riwayat Versi</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleDuplicate}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer"
                            >
                                <Copy className="w-3.5 h-3.5" />
                                <span>Duplicate</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleDelete}
                                className="p-2 rounded-xl text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
                                title="Hapus Project"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Right Group: Language Switcher & Export Actions */}
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Dual-Language Preview Switcher */}
                            <div className="inline-flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 border border-zinc-200/80 dark:border-zinc-700/80 shadow-2xs">
                                <Languages className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 ml-1.5 mr-0.5" />
                                <button
                                    type="button"
                                    onClick={() => setPreviewLang('id')}
                                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                                        previewLang === 'id'
                                            ? 'bg-[#0AB600] text-white shadow-xs'
                                            : 'text-zinc-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                    title="Tampilkan Bahasa Indonesia"
                                >
                                    ID
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPreviewLang('en')}
                                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer relative ${
                                        previewLang === 'en'
                                            ? 'bg-[#0AB600] text-white shadow-xs'
                                            : 'text-zinc-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                    title="Tampilkan Versi English"
                                >
                                    <span>EN</span>
                                    {hasEnContent && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                                    )}
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsExportModalOpen(true)}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0AB600]/10 hover:bg-[#0AB600]/15 dark:hover:bg-[#0AB600]/15 text-[#0AB600] text-xs font-bold border border-[#0AB600]/30 whitespace-nowrap transition-all cursor-pointer shadow-xs"
                                title="Buka Share & Multi-Format Exporter (1:1 Feed, 9:16 Story, PNG, JPG, Salin Gambar)"
                            >
                                <Share2 className="w-3.5 h-3.5 text-[#0AB600]" />
                                <span>Share</span>
                            </button>

                            <button
                                type="button"
                                onClick={handlePrint}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer"
                                title="Cetak langsung atau Simpan sebagai PDF via browser Print dialog (Ctrl+P)"
                            >
                                <Printer className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
                                <span>Print / PDF ({previewLang.toUpperCase()})</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleDownloadPng}
                                disabled={pngLoading}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0AB600] hover:bg-[#089600] text-white text-xs font-semibold shadow-sm whitespace-nowrap transition-all cursor-pointer disabled:cursor-wait"
                                title="Download Gambar PNG Resolusi Tinggi (300 DPI)"
                            >
                                {pngLoading ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        <span>Generating PNG...</span>
                                    </>
                                ) : (
                                    <>
                                        <ImageIcon className="w-3.5 h-3.5" />
                                        <span>PNG ({previewLang.toUpperCase()})</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Preview Container */}
                <div className="max-w-4xl mx-auto w-full">
                    <ProjectPreview project={project} previewLang={previewLang} />
                </div>

                {/* Export Multi-Format & Media Sosial Modal */}
                <ExportSosmedModal
                    project={project}
                    isOpen={isExportModalOpen}
                    onClose={() => setIsExportModalOpen(false)}
                />

                {/* Version History & Rollback Modal */}
                <VersionHistoryModal
                    isOpen={isVersionModalOpen}
                    onClose={() => setIsVersionModalOpen(false)}
                    modelType="project"
                    modelId={project.slug || project.id}
                    modelName={project.name || project.title}
                    onRollbackSuccess={() => {
                        router.reload();
                    }}
                />

            </div>
        </AdminLayout>
    );
}
