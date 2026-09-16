import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { useApp } from '../../../Context/AppContext';
import { useAlert } from '../../../Context/AlertContext';
import LayoutPresetSelector from '../../../Components/Admin/LayoutPresetSelector';
import ProjectPreview, { A4Document } from '../../../Components/Admin/ProjectPreview';
import PreviewPanZoomContainer from '../../../Components/Admin/PreviewPanZoomContainer';
import RichTextEditor from '../../../Components/Admin/RichTextEditor';
import CategoryCombobox from '../../../Components/Admin/CategoryCombobox';
import LayoutBlockList from '../../../Components/Admin/LayoutBlockList';
import { getDefaultLayoutSchema } from '../../../Utils/layoutPresets';
import {
    LayoutTemplate,
    ArrowLeft,
    Save,
    Sparkles,
    Eye,
    Check,
    AlertCircle,
    FileText,
    Wand2,
    Sliders,
    Layers,
    Palette,
    ZoomIn,
    ZoomOut,
    Maximize2,
    X,
    FolderKanban,
    History,
} from 'lucide-react';
import VersionHistoryModal from '../../../Components/Admin/VersionHistoryModal';

export default function Form({ template, categories = [] }) {
    const isEditing = Boolean(template?.id);
    const { t } = useApp();
    const { showAlert } = useAlert();
    const [previewZoom, setPreviewZoom] = useState(100);
    const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);
    const [activeTrifoldTab, setActiveTrifoldTab] = useState(0);
    const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);

    const initialDefaultData = template?.default_data || {};

    const { data, setData, post, put, processing, errors } = useForm({
        name: template?.name || '',
        category: template?.category || 'General',
        description: template?.description || '',
        design_style: template?.design_style || 'classic_standard',
        doc_format: template?.doc_format || 'a4_flyer',
        layout_preset: template?.layout_preset || 'balanced',
        color_theme: template?.color_theme || 'stas_official',
        print_mode: template?.print_mode || 'light',
        boilerplate_type: template?.boilerplate_type || 'stas_default',
        layout_schema: template?.layout_schema || getDefaultLayoutSchema(template?.doc_format || 'a4_flyer', template?.design_style || 'classic_standard'),
        default_data: {
            title: initialDefaultData.title || '',
            subtitle: initialDefaultData.subtitle || '',
            description: initialDefaultData.description || '',
            benefits: initialDefaultData.benefits || { title: 'MANFAAT & KEUNGGULAN', content: '' },
            specifications: initialDefaultData.specifications || { title: 'SPESIFIKASI TEKNOLOGI', content: '' },
            problem_solution: initialDefaultData.problem_solution || { title: 'PROBLEM–SOLUTION', problem: '', solution: '' },
            footer_website: initialDefaultData.footer_website || 'www.stas-rg.com',
            footer_instagram: initialDefaultData.footer_instagram || '@stas.rg',
            footer_youtube: initialDefaultData.footer_youtube || '@stas_rg',
            social_links: initialDefaultData.social_links || [],
        },
    });

    const isTrifold = data.doc_format === 'brochure_trifold';

    // Panels normalization for brochure_trifold
    const rawPanels = Array.isArray(data.default_data?.problem_solution?.panels)
        ? data.default_data.problem_solution.panels
        : [];

    const currentPanels = [0, 1, 2].map((idx) => {
        const existing = rawPanels[idx];
        if (existing) {
            return {
                id: idx + 1,
                title: existing.title || (idx === 0 ? (data.default_data?.title || data.name || '') : `Inovasi Kotak ${idx + 1}`),
                subtitle: existing.subtitle || (idx === 0 ? (data.default_data?.subtitle || '') : `Fitur Unggulan ${idx + 1}`),
                category: existing.category || (idx === 0 ? (data.category || 'CoE STAS-RG') : 'CoE STAS-RG'),
                description: existing.description ?? (idx === 0 ? (data.default_data?.description || data.description || '') : ''),
                problem: existing.problem ?? (idx === 0 ? (data.default_data?.problem_solution?.problem || '') : ''),
                solution: existing.solution ?? (idx === 0 ? (data.default_data?.problem_solution?.solution || '') : ''),
                benefits: existing.benefits ?? (idx === 0 ? (data.default_data?.benefits?.content || '') : ''),
                specifications: existing.specifications ?? existing.specs ?? (idx === 0 ? (data.default_data?.specifications?.content || '') : ''),
                project_url: existing.project_url ?? 'https://www.stas-rg.com',
                image_url: existing.image_url ?? null,
            };
        }
        if (idx === 0) {
            return {
                id: 1,
                title: data.default_data?.title || data.name || 'SMART MONITORING & SENSOR',
                subtitle: data.default_data?.subtitle || 'CoE STAS-RG Innovation',
                category: data.category || 'Smart Agriculture',
                description: data.default_data?.description || data.description || '',
                problem: data.default_data?.problem_solution?.problem || '',
                solution: data.default_data?.problem_solution?.solution || '',
                benefits: data.default_data?.benefits?.content || '',
                specifications: data.default_data?.specifications?.content || '',
                project_url: 'https://www.stas-rg.com',
                image_url: null,
            };
        }
        return {
            id: idx + 1,
            title: `Inovasi Kotak ${idx + 1}`,
            subtitle: `Fitur Unggulan ${idx + 1}`,
            category: 'CoE STAS-RG',
            description: '',
            problem: '',
            solution: '',
            benefits: '',
            specifications: '',
            project_url: 'https://www.stas-rg.com',
            image_url: null,
        };
    });

    const activePanel = currentPanels[activeTrifoldTab] || currentPanels[0];

    const handleUpdatePanel = (panelIndex, field, value) => {
        const updatedPanels = currentPanels.map((p, idx) => {
            if (idx === panelIndex) {
                return { ...p, [field]: value };
            }
            return { ...p };
        });

        const newProblemSolution = {
            ...(data.default_data?.problem_solution || {}),
            panels: updatedPanels,
        };

        const extraDefaultUpdates = {};
        if (panelIndex === 0) {
            if (field === 'title') extraDefaultUpdates.title = value;
            if (field === 'subtitle') extraDefaultUpdates.subtitle = value;
            if (field === 'description') extraDefaultUpdates.description = value;
            if (field === 'problem') newProblemSolution.problem = value;
            if (field === 'solution') newProblemSolution.solution = value;
            if (field === 'benefits') {
                extraDefaultUpdates.benefits = {
                    ...(data.default_data?.benefits || {}),
                    content: value,
                };
            }
            if (field === 'specifications') {
                extraDefaultUpdates.specifications = {
                    ...(data.default_data?.specifications || {}),
                    content: value,
                };
            }
        }

        setData('default_data', {
            ...data.default_data,
            ...extraDefaultUpdates,
            problem_solution: newProblemSolution,
        });
    };

    const handleDefaultDataChange = (field, value) => {
        setData('default_data', {
            ...data.default_data,
            [field]: value,
        });
    };

    const handleNestedDefaultDataChange = (section, field, value) => {
        setData('default_data', {
            ...data.default_data,
            [section]: {
                ...(data.default_data[section] || {}),
                [field]: value,
            },
        });
    };

    const handleApplyBoilerplate = (bp) => {
        setData((prev) => ({
            ...prev,
            boilerplate_type: bp.id,
            default_data: {
                ...prev.default_data,
                subtitle: bp.subtitle,
                footer_website: bp.footer_website,
                footer_instagram: bp.footer_instagram,
                footer_youtube: bp.footer_youtube,
            },
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditing) {
            put(`/templates/${template.slug || template.id}`);
        } else {
            post('/templates');
        }
    };

    // Live dummy project object for real-time preview canvas
    const previewProject = {
        title: isTrifold ? activePanel.title : (data.default_data?.title || (data.name ? data.name.toUpperCase() : 'JUDUL CONTOH TEMPLATE')),
        subtitle: isTrifold ? activePanel.subtitle : (data.default_data?.subtitle || 'CoE STAS-RG Template Preview'),
        description: isTrifold ? activePanel.description : (data.default_data?.description || data.description || 'Deskripsi inovasi riset dan teknologi terapan...'),
        category: isTrifold ? activePanel.category : (data.category || 'General'),
        doc_format: data.doc_format,
        layout_preset: data.layout_preset,
        design_style: data.design_style,
        color_theme: data.color_theme,
        print_mode: data.print_mode,
        benefits: isTrifold ? { content: activePanel.benefits } : data.default_data?.benefits,
        specifications: isTrifold ? { content: activePanel.specifications } : data.default_data?.specifications,
        problem_solution: isTrifold ? {
            ...(data.default_data?.problem_solution || {}),
            panels: currentPanels,
        } : data.default_data?.problem_solution,
        footer_website: data.default_data?.footer_website || 'www.stas-rg.com',
        footer_instagram: data.default_data?.footer_instagram || '@stas.rg',
        footer_youtube: data.default_data?.footer_youtube || '@stas_rg',
        project_url: 'https://www.stas-rg.com',
        active_trifold_tab: activeTrifoldTab,
        layout_schema: data.layout_schema,
    };

    return (
        <AdminLayout>
            <Head title={isEditing ? `Edit Template: ${template.name}` : 'Buat Custom Template Baru'} />

            <div className="space-y-6">
                {/* Header Navigation */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/templates"
                            className="p-2 rounded-xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 text-zinc-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                            title="Kembali ke Katalog Template"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-[#0AB600] bg-[#0AB600]/10 px-2 py-0.5 rounded-md">
                                    {isEditing ? 'Mode Edit Template' : 'Template Builder'}
                                </span>
                            </div>
                            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                {isEditing ? `Edit Template: ${template.name}` : 'Buat Custom Template Proyek'}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {isEditing && (
                            <button
                                type="button"
                                onClick={() => setIsVersionModalOpen(true)}
                                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                                title="Lihat Riwayat Versi & Snapshot Template"
                            >
                                <History className="w-4 h-4 text-[#0AB600]" />
                                <span>Riwayat Versi</span>
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={processing}
                            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0AB600] hover:bg-[#099600] text-white text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            <span>{processing ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Simpan Template'}</span>
                        </button>
                    </div>
                </div>

                {/* Main 2-Column Split: Form (Left) & Live Canvas Preview (Right) */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                    {/* LEFT COLUMN: Template Settings Form (7/12) */}
                    <form onSubmit={handleSubmit} className="xl:col-span-7 space-y-6">
                        {/* 1. Basic Metadata Card */}
                        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
                            <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                                <span className="w-2 h-2 rounded-full bg-[#0AB600]" />
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                                    1. Informasi Utama Template
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1">
                                        Nama Template <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Contoh: IoT Hardware & Smart Sensor Showcase"
                                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0AB600]/20 focus:border-[#0AB600]"
                                        required
                                    />
                                    {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1">
                                        Kategori Riset
                                    </label>
                                    <CategoryCombobox
                                        value={data.category}
                                        onChange={(val) => setData('category', val)}
                                        categories={categories}
                                        placeholder="Pilih / ketik kategori..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1">
                                        Subtitle / Badge Header Default
                                    </label>
                                    <input
                                        type="text"
                                        value={data.default_data?.subtitle || ''}
                                        onChange={(e) => handleDefaultDataChange('subtitle', e.target.value)}
                                        placeholder="Contoh: CENTER OF EXCELLENCE STAS-RG"
                                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0AB600]/20 focus:border-[#0AB600]"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1">
                                        Deskripsi Singkat / Rekomendasi Penggunaan
                                    </label>
                                    <textarea
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={2}
                                        placeholder="Jelaskan untuk keperluan apa template ini paling optimal (contoh: expo teknologi, leaflet produk, pitch deck, dsb)..."
                                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0AB600]/20 focus:border-[#0AB600]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2. Format, Preset, Design Style & Theme Selector */}
                        <LayoutPresetSelector
                            formatValue={data.doc_format}
                            presetValue={data.layout_preset}
                            themeValue={data.color_theme}
                            designStyleValue={data.design_style}
                            printModeValue={data.print_mode}
                            onFormatChange={(fmt) => {
                                setData((prev) => ({
                                    ...prev,
                                    doc_format: fmt,
                                    layout_schema: getDefaultLayoutSchema(fmt, prev.design_style || 'classic_standard'),
                                }));
                            }}
                            onPresetChange={(preset) => setData('layout_preset', preset)}
                            onThemeChange={(theme) => setData('color_theme', theme)}
                            onDesignStyleChange={(style) => {
                                setData((prev) => ({
                                    ...prev,
                                    design_style: style,
                                    layout_schema: getDefaultLayoutSchema(prev.doc_format || 'a4_flyer', style),
                                }));
                            }}
                            onPrintModeChange={(pm) => setData('print_mode', pm)}
                            onApplyBoilerplate={handleApplyBoilerplate}
                        />

                        {/* 3. Visual Layout Block Builder */}
                        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
                            <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                                <span className="w-2 h-2 rounded-full bg-[#0AB600]" />
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                                    3. Desain Tata Letak Blok Visual (Studio Canvas)
                                </h3>
                            </div>

                            {isTrifold ? (
                                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
                                    <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                                        <LayoutTemplate className="w-4 h-4 text-[#0AB600]" />
                                        <span>Arsitektur 3 Panel Kolom (Brosur A4 Lipat 3)</span>
                                    </div>
                                    <p className="text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
                                        Format Brosur A4 Lipat 3 menggunakan tata letak presisi 3 panel berjejer <strong>(Kotak 1: Kiri, Kotak 2: Tengah, Kotak 3: Kanan / Cover)</strong>. Struktur konten dan contoh teks diatur khusus per panel pada bagian formulir di bawah ini.
                                    </p>
                                </div>
                            ) : (
                                <LayoutBlockList
                                    schema={data.layout_schema}
                                    onChange={(newSchema) => setData('layout_schema', newSchema)}
                                    docFormat={data.doc_format}
                                    designStyle={data.design_style}
                                />
                            )}
                        </div>

                        {/* 4. Default Content Structure & Placeholders */}
                        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
                            <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                                <span className="w-2 h-2 rounded-full bg-[#0AB600]" />
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                                    4. Struktur Konten &amp; Contoh Teks Default {isTrifold && `— Kotak ${activeTrifoldTab + 1}`}
                                </h3>
                            </div>

                            {isTrifold ? (
                                <div className="space-y-4">
                                    {/* Trifold 3 Panel Tab Switcher */}
                                    <div className="flex items-center p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                                        {[
                                            { id: 0, label: 'Kotak 1 (Panel Kiri)', desc: 'Fitur Utama' },
                                            { id: 1, label: 'Kotak 2 (Panel Tengah)', desc: 'Fitur Tambahan' },
                                            { id: 2, label: 'Kotak 3 (Panel Kanan/Cover)', desc: 'Highlight / Cover' },
                                        ].map((tab) => {
                                            const isActive = activeTrifoldTab === tab.id;
                                            return (
                                                <button
                                                    key={tab.id}
                                                    type="button"
                                                    onClick={() => setActiveTrifoldTab(tab.id)}
                                                    className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                                                        isActive
                                                            ? 'bg-white dark:bg-zinc-900 text-[#0AB600] shadow-xs'
                                                            : 'text-zinc-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                                                    }`}
                                                >
                                                    <span>{tab.label}</span>
                                                    <span className="text-[10px] font-normal opacity-75">{tab.desc}</span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Panel Form Fields */}
                                    <div className="p-4 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800 space-y-3.5">
                                        <div className="flex items-center justify-between pb-2 border-b border-zinc-200/80 dark:border-zinc-800">
                                            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                                                <FolderKanban className="w-3.5 h-3.5 text-[#0AB600]" />
                                                Isian Template Kotak {activeTrifoldTab + 1} ({activeTrifoldTab === 0 ? 'Panel Kiri' : activeTrifoldTab === 1 ? 'Panel Tengah' : 'Panel Kanan / Cover'})
                                            </span>
                                            <span className="text-[10px] text-zinc-500 font-medium">
                                                Tiap kotak dapat memiliki judul dan isi mandiri
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1">
                                                    Judul Kotak {activeTrifoldTab + 1}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={activePanel.title || ''}
                                                    onChange={(e) => handleUpdatePanel(activeTrifoldTab, 'title', e.target.value)}
                                                    placeholder={`Contoh: INOVASI KOTAK ${activeTrifoldTab + 1}...`}
                                                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0AB600]/20 focus:border-[#0AB600]"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1">
                                                    Subtitle / Tagline Kotak {activeTrifoldTab + 1}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={activePanel.subtitle || ''}
                                                    onChange={(e) => handleUpdatePanel(activeTrifoldTab, 'subtitle', e.target.value)}
                                                    placeholder="Contoh: Fitur Unggulan..."
                                                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0AB600]/20 focus:border-[#0AB600]"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1">
                                                Deskripsi Ringkasan Kotak {activeTrifoldTab + 1}
                                            </label>
                                            <RichTextEditor
                                                value={activePanel.description || ''}
                                                onChange={(html) => handleUpdatePanel(activeTrifoldTab, 'description', html)}
                                                placeholder="Uraian singkat inovasi pada kotak ini..."
                                                rows={3}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1">
                                                Manfaat &amp; Keunggulan Kotak {activeTrifoldTab + 1}
                                            </label>
                                            <RichTextEditor
                                                value={activePanel.benefits || ''}
                                                onChange={(html) => handleUpdatePanel(activeTrifoldTab, 'benefits', html)}
                                                placeholder="Poin-poin manfaat pada kotak ini..."
                                                rows={3}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1">
                                                Spesifikasi Teknis Kotak {activeTrifoldTab + 1}
                                            </label>
                                            <RichTextEditor
                                                value={activePanel.specifications || ''}
                                                onChange={(html) => handleUpdatePanel(activeTrifoldTab, 'specifications', html)}
                                                placeholder="Spesifikasi hardware/software teknis..."
                                                rows={3}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1">
                                                    Problem / Masalah Kotak {activeTrifoldTab + 1}
                                                </label>
                                                <RichTextEditor
                                                    value={activePanel.problem || ''}
                                                    onChange={(html) => handleUpdatePanel(activeTrifoldTab, 'problem', html)}
                                                    placeholder="Latar belakang / tantangan..."
                                                    rows={2}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1">
                                                    Solusi Inovasi Kotak {activeTrifoldTab + 1}
                                                </label>
                                                <RichTextEditor
                                                    value={activePanel.solution || ''}
                                                    onChange={(html) => handleUpdatePanel(activeTrifoldTab, 'solution', html)}
                                                    placeholder="Solusi teknologi yang dihadirkan..."
                                                    rows={2}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1">
                                            Judul Proyek Contoh
                                        </label>
                                        <input
                                            type="text"
                                            value={data.default_data?.title || ''}
                                            onChange={(e) => handleDefaultDataChange('title', e.target.value)}
                                            placeholder="Contoh: SMART IoT MONITORING & SENSOR NODE"
                                            className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#0AB600]/20 focus:border-[#0AB600]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1">
                                            Deskripsi / Ringkasan Contoh
                                        </label>
                                        <RichTextEditor
                                            value={data.default_data?.description || ''}
                                            onChange={(html) => handleDefaultDataChange('description', html)}
                                            placeholder="Uraian singkat tentang sistem atau riset..."
                                            rows={3}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1">
                                            Poin Manfaat &amp; Keunggulan Default
                                        </label>
                                        <RichTextEditor
                                            value={data.default_data?.benefits?.content || ''}
                                            onChange={(html) => handleNestedDefaultDataChange('benefits', 'content', html)}
                                            placeholder="Poin-poin manfaat yang dihasilkan..."
                                            rows={3}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 mb-1">
                                            Poin Spesifikasi Teknis Default
                                        </label>
                                        <RichTextEditor
                                            value={data.default_data?.specifications?.content || ''}
                                            onChange={(html) => handleNestedDefaultDataChange('specifications', 'content', html)}
                                            placeholder="Spesifikasi hardware/software teknis..."
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end gap-3 pt-2">
                            <Link
                                href="/templates"
                                className="px-5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2.5 rounded-xl bg-[#0AB600] hover:bg-[#099600] text-white text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
                            >
                                {processing ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Buat Template Sekarang'}
                            </button>
                        </div>
                    </form>

                    {/* RIGHT COLUMN: Real-Time Live Canvas Preview (5/12) */}
                    <div className="xl:col-span-5 sticky top-20 space-y-4">
                        <div className="p-4 rounded-2xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
                            <div className="flex flex-wrap items-center justify-between pb-3 mb-3 border-b border-zinc-100 dark:border-zinc-800 gap-2">
                                <div className="flex items-center gap-2">
                                    <Eye className="w-4 h-4 text-[#0AB600]" />
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                                        Live Real-Time Preview
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* Zoom Controls Toolbar */}
                                    <div className="inline-flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5 border border-zinc-200/80 dark:border-zinc-700/80 shadow-2xs">
                                        <button
                                            type="button"
                                            onClick={() => setPreviewZoom((z) => Math.max(50, z - 15))}
                                            disabled={previewZoom <= 50}
                                            className="p-1 rounded text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700 disabled:opacity-30 transition-colors cursor-pointer"
                                            title="Perkecil Preview (Zoom Out)"
                                        >
                                            <ZoomOut className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPreviewZoom(100)}
                                            className="px-1.5 py-0.5 text-[10px] font-mono font-bold text-zinc-700 dark:text-zinc-200 hover:bg-white dark:hover:bg-zinc-700 rounded transition-colors cursor-pointer"
                                            title="Reset Zoom (100%)"
                                        >
                                            {previewZoom}%
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPreviewZoom((z) => Math.min(200, z + 15))}
                                            disabled={previewZoom >= 200}
                                            className="p-1 rounded text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700 disabled:opacity-30 transition-colors cursor-pointer"
                                            title="Perbesar Preview (Zoom In)"
                                        >
                                            <ZoomIn className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsFullscreenPreview(true)}
                                            className="p-1 rounded text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700 transition-colors cursor-pointer border-l border-zinc-200 dark:border-zinc-700 ml-0.5"
                                            title="Layar Penuh / Preview Besar"
                                        >
                                            <Maximize2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    <span className="text-[10px] bg-[#0AB600]/10 text-[#0AB600] font-mono font-bold px-2 py-0.5 rounded">
                                        {data.doc_format}
                                    </span>
                                </div>
                            </div>

                            <PreviewPanZoomContainer
                                zoom={previewZoom}
                                maxHeight="calc(100vh - 160px)"
                                onResetZoom={() => setPreviewZoom(100)}
                            >
                                <ProjectPreview project={previewProject} isLive={true} id="template-editor-preview" />
                            </PreviewPanZoomContainer>
                        </div>
                    </div>
                </div>

                {/* Fullscreen High-Res Live Preview Modal */}
                {isFullscreenPreview && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-[#182234] border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-6xl h-[94vh] shadow-2xl flex flex-col overflow-hidden">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70 shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-[#0AB600]/10 flex items-center justify-center text-[#0AB600]">
                                        <Maximize2 className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                            {previewProject.title || 'Live Preview Kanvas Template'}
                                        </h3>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                            Pratinjau presisi tinggi kanvas template ({data.doc_format} • {data.design_style} • {data.color_theme})
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {/* Zoom Controls inside Modal */}
                                    <div className="inline-flex items-center bg-white dark:bg-zinc-800 rounded-xl p-1 border border-zinc-200 dark:border-zinc-700 shadow-2xs">
                                        <button
                                            type="button"
                                            onClick={() => setPreviewZoom((z) => Math.max(50, z - 15))}
                                            disabled={previewZoom <= 50}
                                            className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-30 transition-colors cursor-pointer"
                                            title="Zoom Out"
                                        >
                                            <ZoomOut className="w-4 h-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPreviewZoom(100)}
                                            className="px-2.5 py-1 text-xs font-mono font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer"
                                            title="Reset 100%"
                                        >
                                            {previewZoom}%
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPreviewZoom((z) => Math.min(200, z + 15))}
                                            disabled={previewZoom >= 200}
                                            className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-30 transition-colors cursor-pointer"
                                            title="Zoom In"
                                        >
                                            <ZoomIn className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setIsFullscreenPreview(false)}
                                        className="p-2 rounded-xl text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                                        title="Tutup Preview"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Canvas Viewport */}
                            <div className="flex-1 overflow-hidden bg-zinc-950/20 p-4 sm:p-6 flex items-center justify-center">
                                <PreviewPanZoomContainer
                                    zoom={previewZoom}
                                    maxHeight="100%"
                                    onResetZoom={() => setPreviewZoom(100)}
                                >
                                    <ProjectPreview project={previewProject} isLive={true} id="modal-template-live-preview" />
                                </PreviewPanZoomContainer>
                            </div>
                        </div>
                    </div>
                )}

                {/* Version History & Rollback Modal */}
                {isEditing && (
                    <VersionHistoryModal
                        isOpen={isVersionModalOpen}
                        onClose={() => setIsVersionModalOpen(false)}
                        modelType="template"
                        modelId={template?.slug || template?.id}
                        modelName={template?.name}
                        onRollbackSuccess={() => {
                            router.reload();
                        }}
                    />
                )}
            </div>
        </AdminLayout>
    );
}
