import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Printer,
    ArrowLeft,
    Calendar,
    FolderKanban,
    FileText,
    Users,
    QrCode,
    Sparkles,
    CheckCircle2,
    Layers,
    Share2,
    Download,
    ExternalLink,
    Building2,
    BookOpen,
    BarChart3
} from 'lucide-react';
import { stripHtml } from '../../../Utils/text';

export default function AnnualDigest({
    projects = [],
    selectedYear = '2026',
    availableYears = ['2026'],
    stats = {
        total_projects: 0,
        categories_count: 0,
        categories_breakdown: {},
        generated_at: ''
    }
}) {
    const [currentYear, setCurrentYear] = useState(selectedYear);

    const handleYearChange = (year) => {
        setCurrentYear(year);
        router.get('/projects/annual-digest', { year }, { preserveState: true, replace: true });
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900 print:bg-white print:text-black">
            <Head title={`Katalog Riset Tahunan ${currentYear === 'all' ? 'Lengkap' : currentYear} — STAS RG Projects`} />

            {/* Non-Printable Top Navigation & Control Toolbar */}
            <div className="print:hidden sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-zinc-200/80 px-4 sm:px-8 py-3.5 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link
                        href="/projects"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-zinc-600 hover:text-slate-900 bg-zinc-100 hover:bg-zinc-200 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Kembali ke Projects</span>
                    </Link>
                    <div className="h-5 w-px bg-zinc-300 hidden sm:block" />
                    <span className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-[#0AB600]" />
                        Katalog Kompilasi Riset Tahunan
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    {/* Year Selector */}
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-medium text-zinc-500">Tahun:</label>
                        <select
                            value={currentYear}
                            onChange={(e) => handleYearChange(e.target.value)}
                            className="text-xs sm:text-sm font-semibold bg-zinc-50 border border-zinc-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-[#0AB600] focus:border-[#0AB600] outline-none"
                        >
                            <option value="all">Semua Tahun</option>
                            {availableYears.map((yr) => (
                                <option key={yr} value={yr}>
                                    Tahun {yr}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Print / Save PDF Button */}
                    <button
                        type="button"
                        onClick={handlePrint}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0AB600] hover:bg-[#089600] text-white text-xs sm:text-sm font-bold shadow-sm shadow-[#0AB600]/20 hover:shadow transition-all cursor-pointer"
                    >
                        <Printer className="w-4 h-4" />
                        <span>Cetak / Simpan PDF</span>
                    </button>
                </div>
            </div>

            {/* Document Printable Wrapper */}
            <div className="max-w-5xl mx-auto p-4 sm:p-8 space-y-12 print:p-0 print:m-0 print:max-w-none">
                
                {/* 1. COVER PAGE / EXECUTIVE SUMMARY */}
                <div className="bg-white rounded-2xl p-8 sm:p-12 border border-zinc-200 shadow-sm print:border-none print:shadow-none print:p-8 print:break-after-page min-h-[90vh] flex flex-col justify-between">
                    <div>
                        {/* Institutional Header */}
                        <div className="flex items-center justify-between border-b border-zinc-200 pb-6 mb-8">
                            <div className="flex items-center gap-3">
                                <img
                                    src="/assets/img/stas.png"
                                    alt="STAS RG Logo"
                                    className="w-12 h-12 object-contain"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                                <div>
                                    <h2 className="text-lg font-black tracking-tight text-slate-900">
                                        CENTER OF EXCELLENCE STAS-RG
                                    </h2>
                                    <p className="text-xs font-semibold text-zinc-500">
                                        Smart Telecom, Agriculture & Sensor Research Group • Telkom University
                                    </p>
                                </div>
                            </div>
                            <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-[#0AB600]/10 text-[#0AB600] border border-[#0AB600]/30">
                                DOKUMEN RESMI
                            </span>
                        </div>

                        {/* Document Title Banner */}
                        <div className="my-12">
                            <span className="text-xs font-bold uppercase tracking-widest text-[#0AB600] bg-[#0AB600]/10 px-3 py-1 rounded-md">
                                ANNUAL RESEARCH DIGEST
                            </span>
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-4 leading-tight">
                                Katalog Kompilasi Riset & Inovasi Ilmiah {currentYear === 'all' ? 'Lengkap' : currentYear}
                            </h1>
                            <p className="text-sm text-zinc-600 mt-3 max-w-2xl leading-relaxed">
                                Dokumen rekapitulasi luaran riset, spesifikasi teknologi, manfaat terapan, serta portofolio inovasi yang dipublikasikan oleh laboratorium CoE STAS Research Group.
                            </p>
                        </div>

                        {/* Executive Summary Metrics Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-8">
                            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200">
                                <span className="text-xs font-semibold text-zinc-500">Total Riset Terbit</span>
                                <p className="text-2xl font-black text-slate-900 mt-1">{stats.total_projects}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200">
                                <span className="text-xs font-semibold text-zinc-500">Kategori Domain</span>
                                <p className="text-2xl font-black text-[#0AB600] mt-1">{stats.categories_count}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200">
                                <span className="text-xs font-semibold text-zinc-500">Tahun Periode</span>
                                <p className="text-2xl font-black text-slate-900 mt-1">{currentYear === 'all' ? 'Semua' : currentYear}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200">
                                <span className="text-xs font-semibold text-zinc-500">Format Publikasi</span>
                                <p className="text-2xl font-black text-blue-600 mt-1">A4 Standard</p>
                            </div>
                        </div>

                        {/* Table of Contents Summary */}
                        <div className="mt-8 border border-zinc-200 rounded-xl p-6 bg-white">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Layers className="w-4 h-4 text-[#0AB600]" />
                                Daftar Proyek Riset Terkompilasi ({projects.length})
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                {projects.map((proj, idx) => (
                                    <div key={proj.id} className="flex items-center justify-between py-1 border-b border-zinc-100">
                                        <span className="font-semibold text-slate-800 truncate max-w-[280px]">
                                            {idx + 1}. {proj.name}
                                        </span>
                                        <span className="text-zinc-500 text-[11px] shrink-0 font-medium">
                                            {proj.category}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer Info of Cover */}
                    <div className="pt-6 border-t border-zinc-200 flex items-center justify-between text-xs text-zinc-500">
                        <span>Dihasilkan secara otomatis oleh sistem STAS RG Projects</span>
                        <span>{stats.generated_at}</span>
                    </div>
                </div>

                {/* 2. PROJECT DETAIL SHEETS */}
                {projects.map((project, index) => (
                    <div
                        key={project.id}
                        id={`project-${project.id}`}
                        className="bg-white rounded-2xl p-8 sm:p-10 border border-zinc-200 shadow-sm print:border-none print:shadow-none print:p-6 print:break-after-page space-y-6"
                    >
                        {/* Project Header Banner */}
                        <div className="flex items-start justify-between gap-4 border-b border-zinc-200 pb-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-[#0AB600] text-white">
                                        #{index + 1}
                                    </span>
                                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-zinc-100 text-zinc-700 border border-zinc-200">
                                        {project.category}
                                    </span>
                                    <span className="text-xs text-zinc-400 font-medium">
                                        {project.created_at}
                                    </span>
                                </div>
                                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
                                    {project.title || project.name}
                                </h2>
                                {project.subtitle && (
                                    <p className="text-sm font-semibold text-[#0AB600]">
                                        {project.subtitle}
                                    </p>
                                )}
                            </div>

                            {/* QR Code */}
                            {project.qr_code_path && (
                                <div className="text-center shrink-0">
                                    <img
                                        src={project.qr_code_path}
                                        alt="QR Code"
                                        className="w-16 h-16 sm:w-20 sm:h-20 object-contain border border-zinc-200 rounded-lg p-1 bg-white"
                                    />
                                    <span className="text-[10px] font-semibold text-zinc-500 mt-1 block">
                                        Pindai Dokumen
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Main Image & Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                            {project.main_image && (
                                <div className="md:col-span-1 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-50">
                                    <img
                                        src={project.main_image}
                                        alt={project.name}
                                        className="w-full h-48 sm:h-56 object-cover"
                                    />
                                </div>
                            )}
                            <div className={project.main_image ? 'md:col-span-2 space-y-4' : 'md:col-span-3 space-y-4'}>
                                <div>
                                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">
                                        Deskripsi & Abstrak
                                    </h3>
                                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed text-justify">
                                        {stripHtml(project.description) || 'Tidak ada deskripsi rinci.'}
                                    </p>
                                </div>

                                {project.problem_solution && (
                                    <div className="p-3.5 rounded-xl bg-[#0AB600]/5 border border-[#0AB600]/20">
                                        <h4 className="text-xs font-bold text-[#0AB600] uppercase tracking-wider mb-1">
                                            Solusi & Nilai Kebaruan
                                        </h4>
                                        <p className="text-xs text-slate-800 leading-relaxed">
                                            {stripHtml(project.problem_solution)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Benefits & Specifications Columns */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            {project.benefits && (
                                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
                                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0AB600]" />
                                        Manfaat & Dampak Terapan
                                    </h4>
                                    <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                                        {stripHtml(project.benefits)}
                                    </div>
                                </div>
                            )}

                            {project.specifications && (
                                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
                                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                                        <Layers className="w-3.5 h-3.5 text-blue-600" />
                                        Spesifikasi Teknis
                                    </h4>
                                    <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                                        {stripHtml(project.specifications)}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Research Authors & Partners Footer */}
                        <div className="border-t border-zinc-200 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            {/* Research Team */}
                            <div className="space-y-1">
                                <span className="text-[11px] font-bold uppercase text-zinc-500 tracking-wider flex items-center gap-1">
                                    <Users className="w-3 h-3 text-[#0AB600]" />
                                    Tim Peneliti
                                </span>
                                {project.research_team && project.research_team.length > 0 ? (
                                    <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-800">
                                        {project.research_team.map((member, idx) => (
                                            <span key={idx} className="bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200 text-[11px]">
                                                {typeof member === 'object' ? member.name : member}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="text-xs text-zinc-500 italic">STAS Research Group Authors</span>
                                )}
                            </div>

                            {/* Partner Logos */}
                            {project.partner_logos && project.partner_logos.length > 0 && (
                                <div className="space-y-1">
                                    <span className="text-[11px] font-bold uppercase text-zinc-500 tracking-wider">
                                        Mitra & Kolaborator
                                    </span>
                                    <div className="flex items-center gap-2">
                                        {project.partner_logos.map((logoUrl, lIdx) => (
                                            <img
                                                key={lIdx}
                                                src={logoUrl}
                                                alt="Partner"
                                                className="h-6 max-w-[60px] object-contain"
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
