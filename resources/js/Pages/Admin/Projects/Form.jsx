import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { QRCodeSVG } from 'qrcode.react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { useApp } from '../../../Context/AppContext';
import { useAlert } from '../../../Context/AlertContext';
import ProjectPreview from '../../../Components/Admin/ProjectPreview';
import PreviewPanZoomContainer from '../../../Components/Admin/PreviewPanZoomContainer';
import RichTextEditor from '../../../Components/Admin/RichTextEditor';
import TextLimitMeter from '../../../Components/Admin/TextLimitMeter';
import LayoutPresetSelector from '../../../Components/Admin/LayoutPresetSelector';
import CategoryCombobox from '../../../Components/Admin/CategoryCombobox';
import AssetPickerModal from '../../../Components/Admin/AssetPickerModal';
import TemplatePickerModal from '../../../Components/Admin/TemplatePickerModal';
import ResearcherPickerModal from '../../../Components/Admin/ResearcherPickerModal';
import { evaluateProjectLayoutLimits } from '../../../Utils/textLimits';
import {
    ArrowLeft,
    ArrowRight,
    Save,
    Upload,
    Image as ImageIcon,
    FolderHeart,
    Layers,
    Check,
    CheckCircle2,
    Wrench,
    Lightbulb,
    QrCode,
    Globe,
    Languages,
    Building2,
    Trash2,
    Printer,
    Download,
    Loader2,
    AlertTriangle,
    RefreshCw,
    FolderKanban,
    Sliders,
    Sparkles,
    Wand2,
    Link2,
    ExternalLink,
    Plus,
    Share2,
    GripVertical,
    ChevronUp,
    ChevronDown,
    RotateCcw,
    BookmarkCheck,
    LayoutTemplate,
    BookOpen,
    ZoomIn,
    ZoomOut,
    Maximize2,
    Minimize2,
    X,
    Users,
    GraduationCap,
    UserCheck,
    Mail,
    Award,
    ShieldCheck,
    History,
    Scissors,
    MoveVertical,
    MoveHorizontal,
    Crosshair,
    ArrowUp,
    ArrowDown,
} from 'lucide-react';
import { downloadFlyerAsPng, printFlyer } from '../../../Utils/flyerExport';
import { compressImage, formatFileSize } from '../../../Utils/imageCompressor';
import ExportSosmedModal from '../../../Components/Admin/ExportSosmedModal';
import VersionHistoryModal from '../../../Components/Admin/VersionHistoryModal';
import {
    AVAILABLE_SOCIAL_PLATFORMS,
    normalizeSocialLinks,
    SocialIcon,
    getSocialPlatformConfig,
    DEFAULT_STAS_SOCIAL_LINKS
} from '../../../Utils/socialPlatforms';
import { DOCUMENT_FORMATS } from '../../../Utils/layoutPresets';

const DEFAULT_CATEGORIES = [
    'Smart Agriculture',
    'Internet of Things (IoT)',
    'Aviation & AI',
    'Cybersecurity',
    'Telecommunication',
    'Renewable Energy',
    'Healthcare Tech',
    'Robotics & Automation',
    'Aquaculture / IoT',
];

export default function Form({ project = null, categories = [] }) {
    const isEditing = !!project;
    const { t, language } = useApp();
    const pf = t?.projectForm || {};
    const { showError, showSuccess } = useAlert();
    const availableCategories = Array.from(new Set([...(categories || []), ...DEFAULT_CATEGORIES]));

    // Normalizing initial values from project if editing
    const initialBenefits = project?.benefits
        ? (typeof project.benefits === 'string' ? JSON.parse(project.benefits) : project.benefits)
        : { title: 'MANFAAT', content: '' };

    const initialSpecs = project?.specifications
        ? (typeof project.specifications === 'string' ? JSON.parse(project.specifications) : project.specifications)
        : { title: 'SPESIFIKASI', content: '' };

    const initialPS = project?.problem_solution
        ? (typeof project.problem_solution === 'string' ? JSON.parse(project.problem_solution) : project.problem_solution)
        : { title: 'PROBLEM–SOLUTION', problem: '', solution: '' };

    const initialPartnerLogos = [...new Set(((Array.isArray(project?.partner_logos) && project.partner_logos.length > 0)
        ? project.partner_logos
        : (project?.partner_logo ? [project.partner_logo] : [])).filter(Boolean))];

    const initialPartnerLogosPreview = [...new Set(initialPartnerLogos.map(logo => {
        if (logo.startsWith('http://') || logo.startsWith('https://') || logo.startsWith('blob:') || logo.startsWith('data:') || logo.startsWith('/')) {
            return logo;
        }
        return `/storage/${logo}`;
    }))];

    const initialResearchTeam = Array.isArray(project?.research_team)
        ? project.research_team.map(member => ({
            name: member.name || '',
            role: member.role || 'Anggota Peneliti',
            identifier: member.identifier || '',
            lab_affiliation: member.lab_affiliation || '',
            email: member.email || '',
            scholar_url: member.scholar_url || '',
            scopus_url: member.scopus_url || '',
            sinta_url: member.sinta_url || '',
            orcid_url: member.orcid_url || '',
            linkedin_url: member.linkedin_url || '',
            avatar: member.avatar || null,
            avatar_preview: member.avatar
                ? (member.avatar.startsWith('http') || member.avatar.startsWith('blob:') || member.avatar.startsWith('data:') ? member.avatar : `/storage/${member.avatar}`)
                : null,
        }))
        : [];

    const initialLayoutSchema = project?.layout_schema
        ? (typeof project.layout_schema === 'string' ? JSON.parse(project.layout_schema) : project.layout_schema)
        : {};

    const { data, setData, post, processing, errors, progress } = useForm({
        name: project?.name || '',
        category: project?.category || 'Smart Agriculture',
        title: project?.title || '',
        subtitle: project?.subtitle || '',
        description: project?.description || '',
        main_image: null,
        partner_logo: null,
        partner_logos: initialPartnerLogos,
        partner_logos_preview: initialPartnerLogosPreview,
        remove_partner_logo: false,
        research_team: initialResearchTeam,
        lab_affiliation: project?.lab_affiliation || '',
        patent_number: project?.patent_number || '',
        publication_doi: project?.publication_doi || '',
        benefits: initialBenefits,
        specifications: initialSpecs,
        problem_solution: initialPS,
        project_url: project?.project_url || '',
        footer_website: project?.footer_website || 'www.stas-rg.com',
        footer_instagram: project?.footer_instagram || '@stas.rg',
        footer_youtube: project?.footer_youtube || '@stas_rg',
        social_links: normalizeSocialLinks(project),
        layout_preset: project?.layout_preset || 'balanced',
        design_style: project?.design_style || 'classic_standard',
        doc_format: project?.doc_format || 'a4_flyer',
        color_theme: project?.color_theme || 'stas_official',
        print_mode: project?.print_mode || 'light',
        font_family: initialLayoutSchema?.font_family || project?.font_family || 'plus_jakarta',
        bg_pattern: initialLayoutSchema?.bg_pattern || project?.bg_pattern || 'none',
        custom_colors: initialLayoutSchema?.custom_colors || project?.custom_colors || {
            primary: '#0B2046',
            secondary: '#0AB600',
            accent: '#0AB600',
            background: '#F8FAFC',
        },
        boilerplate_type: project?.boilerplate_type || null,
        layout_schema: initialLayoutSchema,
        content_en: project?.content_en || {
            title: '',
            subtitle: '',
            category: '',
            description: '',
            benefits: { title: 'KEY BENEFITS', content: '' },
            specifications: { title: 'TECHNICAL SPECIFICATIONS', content: '' },
            problem_solution: { title: 'PROBLEM & SOLUTION', problem: '', solution: '' },
        },
        status: project?.status || 'published',
        _method: isEditing ? 'PUT' : 'POST',
    });

    // Dual-Language States (Form Editing & Live Preview)
    const [activeFormLang, setActiveFormLang] = useState('id'); // 'id' | 'en'
    const [previewLang, setPreviewLang] = useState('id'); // 'id' | 'en'
    const [isTranslatingAi, setIsTranslatingAi] = useState(false);

    // Preview state for uploaded main image
    const [imagePreviewUrl, setImagePreviewUrl] = useState(
        project?.main_image ? `/storage/${project.main_image}` : null
    );

    // Preview state for partner logos
    const [partnerLogoPreviewUrls, setPartnerLogoPreviewUrls] = useState(initialPartnerLogosPreview);
    const [partnerLogoPreviewUrl, setPartnerLogoPreviewUrl] = useState(
        initialPartnerLogosPreview[0] || null
    );

    // Template Picker & Save as Template States
    const [isTemplatePickerOpen, setIsTemplatePickerOpen] = useState(false);
    const [isSaveAsTemplateOpen, setIsSaveAsTemplateOpen] = useState(false);
    const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
    const [templateName, setTemplateName] = useState('');
    const [templateDesc, setTemplateDesc] = useState('');
    const [savingTemplate, setSavingTemplate] = useState(false);

    // Automatic Image Compression States & Feedback
    const [isCompressingImage, setIsCompressingImage] = useState(false);
    const [compressionProgress, setCompressionProgress] = useState(null);
    const [imageCompressionStats, setImageCompressionStats] = useState(null);

    const [isCompressingLogo, setIsCompressingLogo] = useState(false);
    const [logoCompressionProgress, setLogoCompressionProgress] = useState(null);
    const [logoCompressionStats, setLogoCompressionStats] = useState(null);

    const [livePngLoading, setLivePngLoading] = useState(false);
    const [isExportSosmedModalOpen, setIsExportSosmedModalOpen] = useState(false);
    const [isAssetPickerOpen, setIsAssetPickerOpen] = useState(false);
    const [isResearcherPickerOpen, setIsResearcherPickerOpen] = useState(false);
    const [assetTargetPanelIndex, setAssetTargetPanelIndex] = useState(null);
    const initialTrifoldTab = (project?.doc_format === 'brochure_trifold' && project?.problem_solution?.panel_index !== undefined)
        ? Math.min(2, Math.max(0, Number(project.problem_solution.panel_index)))
        : 0;
    const [activeTrifoldTab, setActiveTrifoldTab] = useState(initialTrifoldTab);
    const [previewZoom, setPreviewZoom] = useState(100);
    const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);
    const [polishingSection, setPolishingSection] = useState(null);
    const [draggedSocialIndex, setDraggedSocialIndex] = useState(null);
    const [dragOverSocialIndex, setDragOverSocialIndex] = useState(null);

    // Browser Local Storage Auto-Save & Draft Cache
    const draftStorageKey = isEditing
        ? `stasrg_draft_edit_${project?.id || project?.slug}`
        : 'stasrg_draft_create';
    const legacyDraftStorageKey = isEditing
        ? `stasikator_draft_edit_${project?.id || project?.slug}`
        : 'stasikator_draft_create';

    const [lastSavedDraftTime, setLastSavedDraftTime] = useState(null);
    const [draftRestoredNotice, setDraftRestoredNotice] = useState(false);
    const [isAutoSaving, setIsAutoSaving] = useState(false);

    // 1. Restore cached draft from localStorage on initial page load
    useEffect(() => {
        try {
            const raw = localStorage.getItem(draftStorageKey) || localStorage.getItem(legacyDraftStorageKey);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && parsed.data) {
                    const d = parsed.data;
                    const hasSubstantialData = Boolean(
                        d.name || d.title || d.description ||
                        (d.benefits && d.benefits.content) ||
                        (d.specifications && d.specifications.content) ||
                        (d.problem_solution && (d.problem_solution.problem || d.problem_solution.solution))
                    );

                    if (hasSubstantialData) {
                        const restoredLogos = Array.isArray(d.partner_logos) ? [...new Set(d.partner_logos.filter(Boolean))] : prev.partner_logos;
                        const restoredPreviews = Array.isArray(d.partner_logos_preview) ? [...new Set(d.partner_logos_preview.filter(Boolean))] : prev.partner_logos_preview;
                        const restoredTeam = Array.isArray(d.research_team) ? d.research_team : prev.research_team;
                        setData((prev) => ({
                            ...prev,
                            ...d,
                            main_image: prev.main_image,
                            partner_logo: prev.partner_logo,
                            partner_logos: restoredLogos,
                            partner_logos_preview: restoredPreviews,
                            research_team: restoredTeam,
                            _method: isEditing ? 'PUT' : 'POST',
                        }));
                        if (restoredPreviews && restoredPreviews.length > 0) {
                            setPartnerLogoPreviewUrls(restoredPreviews);
                        }
                        setDraftRestoredNotice(true);
                        setLastSavedDraftTime(parsed.updatedAt ? new Date(parsed.updatedAt) : new Date());
                    }
                }
            }
        } catch (e) {
            console.error('Failed to load local draft from localStorage', e);
        }
    }, [draftStorageKey]);

    // 2. Debounced auto-save form changes to localStorage
    useEffect(() => {
        const isCleanEmpty = !data.name && !data.title && !data.description && !data.benefits?.content && !data.specifications?.content;
        if (isCleanEmpty && !isEditing) {
            return;
        }

        setIsAutoSaving(true);
        const timer = setTimeout(() => {
            try {
                const { main_image, partner_logo, _method, ...serializableData } = data;
                if (Array.isArray(serializableData.partner_logos)) {
                    serializableData.partner_logos = serializableData.partner_logos.filter(l => typeof l === 'string');
                }
                if (Array.isArray(serializableData.research_team)) {
                    serializableData.research_team = serializableData.research_team.map(m => ({
                        ...m,
                        avatar: typeof m.avatar === 'string' ? m.avatar : (m.avatar_preview || null),
                    }));
                }
                const now = new Date();
                const payload = {
                    data: serializableData,
                    updatedAt: now.toISOString(),
                };
                localStorage.setItem(draftStorageKey, JSON.stringify(payload));
                setLastSavedDraftTime(now);
                setIsAutoSaving(false);
            } catch (e) {
                console.error('Failed to auto-save draft to localStorage', e);
                setIsAutoSaving(false);
            }
        }, 600);

        return () => clearTimeout(timer);
    }, [data, draftStorageKey, isEditing]);

    const handleClearDraft = () => {
        try {
            localStorage.removeItem(draftStorageKey);
            setLastSavedDraftTime(null);
            setDraftRestoredNotice(false);
            setData({
                name: project?.name || '',
                category: project?.category || 'Smart Agriculture',
                title: project?.title || '',
                subtitle: project?.subtitle || '',
                description: project?.description || '',
                main_image: null,
                partner_logo: null,
                partner_logos: initialPartnerLogos,
                partner_logos_preview: initialPartnerLogosPreview,
                remove_partner_logo: false,
                benefits: initialBenefits,
                specifications: initialSpecs,
                problem_solution: initialPS,
                project_url: project?.project_url || '',
                footer_website: project?.footer_website || 'www.stas-rg.com',
                footer_instagram: project?.footer_instagram || '@stas.rg',
                footer_youtube: project?.footer_youtube || '@stas_rg',
                social_links: normalizeSocialLinks(project),
                layout_preset: project?.layout_preset || 'balanced',
                design_style: project?.design_style || 'classic_standard',
                doc_format: project?.doc_format || 'a4_flyer',
                color_theme: project?.color_theme || 'stas_official',
                print_mode: project?.print_mode || 'light',
                font_family: initialLayoutSchema?.font_family || project?.font_family || 'plus_jakarta',
                bg_pattern: initialLayoutSchema?.bg_pattern || project?.bg_pattern || 'none',
                custom_colors: initialLayoutSchema?.custom_colors || project?.custom_colors || {
                    primary: '#0B2046',
                    secondary: '#0AB600',
                    accent: '#0AB600',
                    background: '#F8FAFC',
                },
                boilerplate_type: project?.boilerplate_type || null,
                layout_schema: initialLayoutSchema,
                status: project?.status || 'published',
                _method: isEditing ? 'PUT' : 'POST',
            });
            showSuccess('Draf Direset', 'Draf penyimpanan lokal browser telah dibersihkan.');
        } catch (e) {
            console.error(e);
        }
    };

    const handleApplyBoilerplate = (boilerplate) => {
        setData((prev) => ({
            ...prev,
            subtitle: boilerplate.subtitle || prev.subtitle,
            footer_website: boilerplate.footer_website || prev.footer_website,
            footer_instagram: boilerplate.footer_instagram || prev.footer_instagram,
            footer_youtube: boilerplate.footer_youtube || prev.footer_youtube,
            boilerplate_type: boilerplate.id,
        }));
        showSuccess('Boilerplate Diterapkan', `Template "${boilerplate.name}" berhasil diterapkan pada badge dan footer.`);
    };

    const handleGenerateOrPolishSection = async (section, text = '', context = {}) => {
        const isTrifold = data.doc_format === 'brochure_trifold';
        const activePanelForAI = isTrifold ? currentPanels[activeTrifoldTab] : null;
        const baseTitle = isTrifold ? (activePanelForAI?.title || data.name) : data.title || data.name;
        const baseDesc = isTrifold ? (activePanelForAI?.description || data.description) : data.description;
        const hasBaseContext = Boolean(data.name || baseDesc || baseTitle || text);
        if (!hasBaseContext) {
            showWarning('Informasi Belum Cukup', 'Silakan isi Judul atau Deskripsi terlebih dahulu agar AI dapat menyusun bagian ini.');
            return;
        }

        setPolishingSection(section);
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

        try {
            const res = await fetch('/projects/ai-section', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    section,
                    text: text || '',
                    context: {
                        project_name: data.name || baseTitle,
                        title: baseTitle,
                        category: isTrifold ? (activePanelForAI?.category || data.category) : data.category,
                        description: baseDesc,
                        layout_preset: data.layout_preset || 'balanced',
                        active_panel: isTrifold ? activeTrifoldTab + 1 : undefined,
                        ...context,
                    },
                }),
            });

            const resData = await res.json();
            if (res.ok && resData.success) {
                if (isTrifold) {
                    if (section === 'all_sections' && resData.data) {
                        if (resData.data.problem) handleUpdatePanel(activeTrifoldTab, 'problem', resData.data.problem);
                        if (resData.data.solution) handleUpdatePanel(activeTrifoldTab, 'solution', resData.data.solution);
                        if (resData.data.benefits) handleUpdatePanel(activeTrifoldTab, 'benefits', resData.data.benefits);
                        if (resData.data.specifications) handleUpdatePanel(activeTrifoldTab, 'specifications', resData.data.specifications);
                        showSuccess('Generate AI Berhasil', `Seluruh bagian Kotak ${activeTrifoldTab + 1} berhasil disusun otomatis.`);
                    } else if (section === 'description') {
                        handleUpdatePanel(activeTrifoldTab, 'description', resData.polished_text);
                        showSuccess('AI Berhasil', `Deskripsi Kotak ${activeTrifoldTab + 1} berhasil dipoles.`);
                    } else if (section === 'benefits') {
                        handleUpdatePanel(activeTrifoldTab, 'benefits', resData.polished_text);
                        showSuccess('AI Berhasil', `Poin manfaat Kotak ${activeTrifoldTab + 1} berhasil disusun.`);
                    } else if (section === 'specifications') {
                        handleUpdatePanel(activeTrifoldTab, 'specifications', resData.polished_text);
                        showSuccess('AI Berhasil', `Spesifikasi Kotak ${activeTrifoldTab + 1} berhasil disusun.`);
                    } else if (section === 'problem') {
                        handleUpdatePanel(activeTrifoldTab, 'problem', resData.polished_text);
                        showSuccess('AI Berhasil', `Latar belakang problem Kotak ${activeTrifoldTab + 1} berhasil disusun.`);
                    } else if (section === 'solution') {
                        handleUpdatePanel(activeTrifoldTab, 'solution', resData.polished_text);
                        showSuccess('AI Berhasil', `Solusi Kotak ${activeTrifoldTab + 1} berhasil disusun.`);
                    }
                    return;
                }

                if (section === 'all_sections' && resData.data) {
                    setData((prev) => ({
                        ...prev,
                        problem_solution: {
                            ...prev.problem_solution,
                            title: 'PROBLEM–SOLUTION',
                            problem: resData.data.problem || prev.problem_solution?.problem || '',
                            solution: resData.data.solution || prev.problem_solution?.solution || '',
                        },
                        benefits: {
                            ...prev.benefits,
                            title: 'MANFAAT',
                            content: resData.data.benefits || prev.benefits?.content || '',
                        },
                        specifications: {
                            ...prev.specifications,
                            title: 'SPESIFIKASI',
                            content: resData.data.specifications || prev.specifications?.content || '',
                        },
                    }));
                    showSuccess('Generate AI Berhasil', 'Seluruh bagian (Problem, Solution, Manfaat, dan Spesifikasi) berhasil disusun otomatis dari deskripsi proyek.');
                } else if (section === 'description') {
                    setData('description', resData.polished_text);
                    showSuccess('AI Berhasil', 'Deskripsi proyek berhasil dipoles/dibuat.');
                } else if (section === 'benefits') {
                    setData('benefits', { ...data.benefits, title: 'MANFAAT', content: resData.polished_text });
                    showSuccess('AI Berhasil', 'Poin manfaat berhasil disusun dari deskripsi.');
                } else if (section === 'specifications') {
                    setData('specifications', { ...data.specifications, title: 'SPESIFIKASI', content: resData.polished_text });
                    showSuccess('AI Berhasil', 'Spesifikasi teknis berhasil disusun dari deskripsi.');
                } else if (section === 'problem') {
                    setData('problem_solution', { ...data.problem_solution, title: 'PROBLEM–SOLUTION', problem: resData.polished_text });
                    showSuccess('AI Berhasil', 'Latar belakang problem berhasil disusun dari deskripsi.');
                } else if (section === 'solution') {
                    setData('problem_solution', { ...data.problem_solution, title: 'PROBLEM–SOLUTION', solution: resData.polished_text });
                    showSuccess('AI Berhasil', 'Solusi teknologi berhasil disusun dari deskripsi.');
                }
            } else {
                showError('AI Gagal', resData.error || resData.message || 'Gagal memproses AI.');
            }
        } catch (err) {
            showError('Koneksi AI Gagal', err.message || 'Terjadi kesalahan saat memproses.');
        } finally {
            setPolishingSection(null);
        }
    };

    const handleAiTranslate = async () => {
        if (!data.title && !data.name && !data.description) {
            showError('Data Belum Lengkap', 'Silakan isi Judul atau Deskripsi proyek dalam Bahasa Indonesia terlebih dahulu.');
            return;
        }

        setIsTranslatingAi(true);
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            const res = await fetch('/projects/ai-translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    project: {
                        ...data,
                        layout_preset: data.layout_preset,
                    },
                    layout_preset: data.layout_preset,
                    target_lang: 'en',
                }),
            });

            const resData = await res.json();
            if (resData.success && resData.data) {
                setData((prev) => ({
                    ...prev,
                    content_en: resData.data,
                }));
                setActiveFormLang('en');
                setPreviewLang('en');
                showSuccess('AI Translate Berhasil', 'Seluruh konten proyek berhasil diterjemahkan ke Bahasa Inggris dan diterapkan ke tab English!');
            } else {
                showError('AI Translate Gagal', resData.error || resData.message || 'Gagal menerjemahkan konten.');
            }
        } catch (err) {
            showError('Koneksi AI Gagal', err.message || 'Terjadi kesalahan saat berkomunikasi dengan server AI.');
        } finally {
            setIsTranslatingAi(false);
        }
    };

    const handleUpdateContentEn = (field, value) => {
        setData((prev) => ({
            ...prev,
            content_en: {
                ...(prev.content_en || {}),
                [field]: value,
            },
        }));
    };

    const handleUpdateContentEnNested = (section, subField, value) => {
        setData((prev) => ({
            ...prev,
            content_en: {
                ...(prev.content_en || {}),
                [section]: {
                    ...(prev.content_en?.[section] || {}),
                    [subField]: value,
                },
            },
        }));
    };

    const handleLiveDownloadPng = async () => {
        if (livePngLoading) return;
        setLivePngLoading(true);
        try {
            const canvasId = 'live-preview-canvas';
            const filename = `${(data.name || 'project').replace(/\s+/g, '_').toLowerCase()}_flyer_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.png`;
            await downloadFlyerAsPng(canvasId, filename);
        } catch (err) {
            console.error('Live PNG export error:', err);
        } finally {
            setLivePngLoading(false);
        }
    };

    const handleLivePrint = () => {
        const canvasId = 'live-preview-canvas';
        printFlyer(canvasId, `Preview Flyer - ${data.title || data.name || 'STAS RG'}`);
    };

    const handleImageChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showError('Format Tidak Sesuai', 'Harap pilih file gambar (JPG, PNG, atau JPEG).');
            return;
        }

        try {
            setIsCompressingImage(true);
            setCompressionProgress({ stage: 'Mempersiapkan gambar...', percent: 10 });

            const result = await compressImage(file, {
                maxSizeMB: 4,
                maxWidth: 2560,
                maxHeight: 2560,
                initialQuality: 0.88,
                onProgress: (p) => setCompressionProgress(p),
            });

            setData('main_image', result.file);
            setImagePreviewUrl(result.previewUrl);
            setImageCompressionStats(result);

            if (result.wasCompressed) {
                showSuccess(
                    'Kompresi Otomatis Berhasil',
                    `Ukuran foto diperkecil dari ${result.originalSizeStr} menjadi ${result.compressedSizeStr} (Hemat ${result.savedPercent}%). Kualitas tetap tajam.`
                );
            }
        } catch (err) {
            showError('Gagal Memproses Gambar', err.message || 'Terjadi kesalahan saat mengompresi gambar.');
        } finally {
            setIsCompressingImage(false);
            setCompressionProgress(null);
        }
    };

    const handlePartnerLogoChange = async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        for (const file of files) {
            if (!file.type.startsWith('image/')) {
                showError('Format Tidak Sesuai', `File "${file.name}" bukan format gambar (PNG, JPG, SVG, atau WebP).`);
                continue;
            }

            if (file.type === 'image/svg+xml') {
                const previewUrl = URL.createObjectURL(file);
                setData((prev) => {
                    const nextLogos = Array.isArray(prev.partner_logos) ? [...prev.partner_logos, file] : [file];
                    const nextPreviews = Array.isArray(prev.partner_logos_preview) ? [...prev.partner_logos_preview, previewUrl] : [previewUrl];
                    return {
                        ...prev,
                        partner_logo: nextLogos[0] || null,
                        partner_logos: nextLogos,
                        partner_logos_preview: nextPreviews,
                        remove_partner_logo: false,
                    };
                });
                setPartnerLogoPreviewUrls((prev) => [...prev, previewUrl]);
                setLogoCompressionStats(null);
                continue;
            }

            try {
                setIsCompressingLogo(true);
                setLogoCompressionProgress({ stage: `Memproses ${file.name}...`, percent: 20 });

                const result = await compressImage(file, {
                    maxSizeMB: 2,
                    maxWidth: 1600,
                    maxHeight: 1600,
                    initialQuality: 0.92,
                    onProgress: (p) => setLogoCompressionProgress(p),
                });

                setData((prev) => {
                    const nextLogos = Array.isArray(prev.partner_logos) ? [...prev.partner_logos, result.file] : [result.file];
                    const nextPreviews = Array.isArray(prev.partner_logos_preview) ? [...prev.partner_logos_preview, result.previewUrl] : [result.previewUrl];
                    return {
                        ...prev,
                        partner_logo: nextLogos[0] || null,
                        partner_logos: nextLogos,
                        partner_logos_preview: nextPreviews,
                        remove_partner_logo: false,
                    };
                });
                setPartnerLogoPreviewUrls((prev) => [...prev, result.previewUrl]);
                setLogoCompressionStats(result);
            } catch (err) {
                showError('Gagal Memproses Logo', err.message || 'Terjadi kesalahan saat memproses logo.');
            } finally {
                setIsCompressingLogo(false);
                setLogoCompressionProgress(null);
            }
        }
        showSuccess('Logo Mitra Ditambahkan', `${files.length} logo mitra berhasil ditambahkan.`);
        e.target.value = '';
    };

    const handleSelectFromAssetLibrary = async (asset) => {
        try {
            if (assetTargetPanelIndex !== null) {
                const url = asset.resolved_url || (asset.svg_content ? `data:image/svg+xml;utf8,${encodeURIComponent(asset.svg_content)}` : '');
                handleUpdatePanel(assetTargetPanelIndex, 'image_url', url);
                setAssetTargetPanelIndex(null);
                showSuccess('Gambar Kotak Terpasang', `Gambar "${asset.name}" berhasil dipasang pada Kotak ${assetTargetPanelIndex + 1}.`);
                return;
            }

            let fileToAdd = null;
            let previewToAdd = '';

            if (asset.svg_content) {
                const blob = new Blob([asset.svg_content], { type: 'image/svg+xml' });
                fileToAdd = new File([blob], `${asset.name.toLowerCase().replace(/\s+/g, '-')}.svg`, { type: 'image/svg+xml' });
                previewToAdd = `data:image/svg+xml;utf8,${encodeURIComponent(asset.svg_content)}`;
            } else if (asset.resolved_url) {
                const response = await fetch(asset.resolved_url);
                const blob = await response.blob();
                fileToAdd = new File([blob], `${asset.name.toLowerCase().replace(/\s+/g, '-')}.png`, { type: blob.type || 'image/png' });
                previewToAdd = asset.resolved_url;
            }

            if (fileToAdd && previewToAdd) {
                if (partnerLogoPreviewUrls.includes(previewToAdd)) {
                    showError('Logo Sudah Ada', `Logo "${asset.name}" sudah ada dalam daftar mitra.`);
                    return;
                }
                setData((prev) => {
                    const nextLogos = Array.isArray(prev.partner_logos) ? [...prev.partner_logos, fileToAdd] : [fileToAdd];
                    const nextPreviews = Array.isArray(prev.partner_logos_preview) ? [...prev.partner_logos_preview, previewToAdd] : [previewToAdd];
                    return {
                        ...prev,
                        partner_logo: nextLogos[0] || null,
                        partner_logos: nextLogos,
                        partner_logos_preview: nextPreviews,
                        remove_partner_logo: false,
                    };
                });
                setPartnerLogoPreviewUrls((prev) => [...prev, previewToAdd]);
                showSuccess('Logo Mitra Ditambahkan', `Logo "${asset.name}" berhasil ditambahkan ke daftar mitra.`);
            }
        } catch (err) {
            console.error('Error selecting asset:', err);
            if (asset.resolved_url) {
                if (partnerLogoPreviewUrls.includes(asset.resolved_url)) {
                    showError('Logo Sudah Ada', `Logo "${asset.name}" sudah ada dalam daftar mitra.`);
                    return;
                }
                setData((prev) => {
                    const nextLogos = Array.isArray(prev.partner_logos) ? [...prev.partner_logos, asset.resolved_url] : [asset.resolved_url];
                    const nextPreviews = Array.isArray(prev.partner_logos_preview) ? [...prev.partner_logos_preview, asset.resolved_url] : [asset.resolved_url];
                    return {
                        ...prev,
                        partner_logo: nextLogos[0] || null,
                        partner_logos: nextLogos,
                        partner_logos_preview: nextPreviews,
                        remove_partner_logo: false,
                    };
                });
                setPartnerLogoPreviewUrls((prev) => [...prev, asset.resolved_url]);
                showSuccess('Logo Mitra Ditambahkan', `Logo "${asset.name}" berhasil ditambahkan.`);
            }
        }
    };

    // Dynamic 3-Panel Manager for A4 Trifold Brochure (Brosur Lipat 3)
    const currentPanels = [0, 1, 2].map((idx) => {
        const existing = data.problem_solution?.panels?.[idx];
        if (existing) {
            return {
                id: existing.id || idx + 1,
                title: existing.title ?? (idx === 0 ? (data.title || data.name || '') : `Inovasi Kotak ${idx + 1}`),
                subtitle: existing.subtitle ?? (idx === 0 ? (data.subtitle || '') : ''),
                category: existing.category ?? (idx === 0 ? (data.category || 'Smart Agriculture') : 'CoE STAS-RG'),
                description: existing.description ?? (idx === 0 ? (data.description || '') : ''),
                problem: existing.problem ?? (idx === 0 ? (data.problem_solution?.problem || '') : ''),
                solution: existing.solution ?? (idx === 0 ? (data.problem_solution?.solution || '') : ''),
                benefits: existing.benefits ?? (idx === 0 ? (data.benefits?.content || '') : ''),
                specifications: existing.specifications ?? existing.specs ?? (idx === 0 ? (data.specifications?.content || '') : ''),
                project_url: existing.project_url ?? (idx === 0 ? (data.project_url || '') : 'https://www.stas-rg.com'),
                image_url: existing.image_url ?? (idx === 0 ? (imagePreviewUrl || null) : null),
            };
        }
        if (idx === 0) {
            return {
                id: 1,
                title: data.title || data.name || '',
                subtitle: data.subtitle || '',
                category: data.category || 'Smart Agriculture',
                description: data.description || '',
                problem: data.problem_solution?.problem || '',
                solution: data.problem_solution?.solution || '',
                benefits: data.benefits?.content || '',
                specifications: data.specifications?.content || '',
                project_url: data.project_url || '',
                image_url: imagePreviewUrl || null,
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
            project_url: data.project_url || 'https://www.stas-rg.com',
            image_url: null,
        };
    });

    const activePanel = currentPanels[activeTrifoldTab] || currentPanels[0];

    const handleUpdatePanel = (index, field, value) => {
        const updatedPanels = currentPanels.map((p, idx) => {
            if (idx === index) {
                return { ...p, [field]: value };
            }
            return { ...p };
        });

        const newProblemSolution = {
            ...data.problem_solution,
            panels: updatedPanels,
        };

        const extraUpdates = {};
        if (index === 0) {
            if (field === 'title') {
                extraUpdates.title = value;
                if (!data.name || data.name === data.title) extraUpdates.name = value;
            }
            if (field === 'subtitle') extraUpdates.subtitle = value;
            if (field === 'category') extraUpdates.category = value;
            if (field === 'description') extraUpdates.description = value;
            if (field === 'problem') newProblemSolution.problem = value;
            if (field === 'solution') newProblemSolution.solution = value;
            if (field === 'benefits') extraUpdates.benefits = { ...data.benefits, content: value };
            if (field === 'specifications') extraUpdates.specifications = { ...data.specifications, content: value };
            if (field === 'project_url') extraUpdates.project_url = value;
        }

        setData((prev) => ({
            ...prev,
            ...extraUpdates,
            problem_solution: newProblemSolution,
        }));
    };

    const handlePanelImageFileChange = async (panelIdx, e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const compressed = await compressImage(file, { maxWidth: 1200, maxHeight: 1200, quality: 0.85 });
            const reader = new FileReader();
            reader.onloadend = () => {
                handleUpdatePanel(panelIdx, 'image_url', reader.result);
                showSuccess(`Foto Kotak ${panelIdx + 1} Terpasang`, `Foto inovasi untuk Kotak ${panelIdx + 1} berhasil diunggah.`);
            };
            reader.readAsDataURL(compressed.file || file);
        } catch (err) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleUpdatePanel(panelIdx, 'image_url', reader.result);
                showSuccess(`Foto Kotak ${panelIdx + 1} Terpasang`, `Foto inovasi untuk Kotak ${panelIdx + 1} berhasil diunggah.`);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemovePartnerLogo = (indexToRemove) => {
        setData((prev) => {
            const currentLogos = Array.isArray(prev.partner_logos) ? [...prev.partner_logos] : [];
            const currentPreviews = Array.isArray(prev.partner_logos_preview) ? [...prev.partner_logos_preview] : [];
            const nextLogos = currentLogos.filter((_, i) => i !== indexToRemove);
            const nextPreviews = currentPreviews.filter((_, i) => i !== indexToRemove);
            return {
                ...prev,
                partner_logo: nextLogos[0] || null,
                partner_logos: nextLogos,
                partner_logos_preview: nextPreviews,
                remove_partner_logo: nextLogos.length === 0,
            };
        });
        setPartnerLogoPreviewUrls((prev) => prev.filter((_, i) => i !== indexToRemove));
    };

    const handleMovePartnerLogo = (index, direction) => {
        const targetIndex = direction === 'left' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= partnerLogoPreviewUrls.length) return;

        setData((prev) => {
            const nextLogos = Array.isArray(prev.partner_logos) ? [...prev.partner_logos] : [];
            const nextPreviews = Array.isArray(prev.partner_logos_preview) ? [...prev.partner_logos_preview] : [];

            if (nextLogos[index] !== undefined && nextLogos[targetIndex] !== undefined) {
                const tempL = nextLogos[index];
                nextLogos[index] = nextLogos[targetIndex];
                nextLogos[targetIndex] = tempL;
            }

            if (nextPreviews[index] !== undefined && nextPreviews[targetIndex] !== undefined) {
                const tempP = nextPreviews[index];
                nextPreviews[index] = nextPreviews[targetIndex];
                nextPreviews[targetIndex] = tempP;
            }

            return {
                ...prev,
                partner_logo: nextLogos[0] || null,
                partner_logos: nextLogos,
                partner_logos_preview: nextPreviews,
            };
        });

        setPartnerLogoPreviewUrls((prev) => {
            const next = [...prev];
            const temp = next[index];
            next[index] = next[targetIndex];
            next[targetIndex] = temp;
            return next;
        });
    };

    const handleResetPartnerLogos = () => {
        setData((prev) => ({
            ...prev,
            partner_logo: null,
            partner_logos: [],
            partner_logos_preview: [],
            remove_partner_logo: true,
        }));
        setPartnerLogoPreviewUrls([]);
        setPartnerLogoPreviewUrl(null);
    };

    // Research Team Handlers
    const handleUpdateTeamMember = (index, field, value) => {
        setData((prev) => {
            const current = Array.isArray(prev.research_team) ? [...prev.research_team] : [];
            if (!current[index]) return prev;
            current[index] = {
                ...current[index],
                [field]: value,
            };
            return {
                ...prev,
                research_team: current,
            };
        });
    };

    const handleRemoveTeamMember = (index) => {
        setData((prev) => {
            const current = Array.isArray(prev.research_team) ? [...prev.research_team] : [];
            return {
                ...prev,
                research_team: current.filter((_, i) => i !== index),
            };
        });
    };

    const handleMoveTeamMember = (index, direction) => {
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        setData((prev) => {
            const current = Array.isArray(prev.research_team) ? [...prev.research_team] : [];
            if (targetIndex < 0 || targetIndex >= current.length) return prev;
            const temp = current[index];
            current[index] = current[targetIndex];
            current[targetIndex] = temp;
            return {
                ...prev,
                research_team: current,
            };
        });
    };

    const handleImportResearchers = (selectedResearchers) => {
        if (!Array.isArray(selectedResearchers) || selectedResearchers.length === 0) return;

        setData((prev) => {
            const currentTeam = Array.isArray(prev.research_team) ? [...prev.research_team] : [];
            const newMembers = [];

            selectedResearchers.forEach((r) => {
                const exists = currentTeam.some(
                    (m) =>
                        (m.name && m.name.toLowerCase() === r.name.toLowerCase()) ||
                        (m.identifier && r.identifier && m.identifier === r.identifier)
                );

                if (!exists) {
                    const avatarUrl = r.avatar_url || (r.avatar?.startsWith('http') ? r.avatar : (r.avatar ? `/storage/${r.avatar}` : null));
                    newMembers.push({
                        researcher_id: r.id || null,
                        name: r.name || '',
                        role: r.role || 'Anggota Peneliti',
                        identifier: r.identifier || '',
                        lab_affiliation: r.lab_affiliation || '',
                        email: r.email || '',
                        scholar_url: r.scholar_url || '',
                        scopus_url: r.scopus_url || '',
                        sinta_url: r.sinta_url || '',
                        orcid_url: r.orcid_url || '',
                        linkedin_url: r.linkedin_url || '',
                        avatar: r.avatar || null,
                        avatar_preview: avatarUrl,
                    });
                }
            });

            return {
                ...prev,
                research_team: [...currentTeam, ...newMembers],
            };
        });

        showSuccess('Peneliti Ditambahkan', `${selectedResearchers.length} data peneliti berhasil ditarik ke tim proyek.`);
    };

    const handleSubmit = (e, explicitStatus = null) => {
        if (e && e.preventDefault) e.preventDefault();
        
        const finalStatus = explicitStatus || data.status || 'published';
        data.status = finalStatus;

        if (data.doc_format === 'brochure_trifold') {
            data.problem_solution = {
                ...data.problem_solution,
                panels: currentPanels,
            };
            const firstPanel = currentPanels[0];
            if (firstPanel?.category) {
                data.category = firstPanel.category;
            }
            if (!data.name || data.name.trim() === '') {
                data.name = firstPanel?.title || 'Brosur Inovasi STAS-RG';
            }
            if (!data.title || data.title.trim() === '') {
                data.title = firstPanel?.title || data.name || 'Brosur Inovasi STAS-RG';
            }
            if (!data.description || data.description.trim() === '') {
                data.description = firstPanel?.description || data.name || '';
            }
        }

        data.layout_schema = {
            ...(typeof data.layout_schema === 'object' && data.layout_schema !== null ? data.layout_schema : {}),
            font_family: data.font_family,
            bg_pattern: data.bg_pattern,
            custom_colors: data.custom_colors,
        };

        const endpoint = isEditing ? `/projects/${project.slug || project.id}` : '/projects';

        post(endpoint, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                try {
                    localStorage.removeItem(draftStorageKey);
                } catch (e) {
                    console.error('Failed to clean draft after submit', e);
                }
            },
            onError: (err) => {
                const firstError = Object.values(err)[0];
                showError('Gagal Menyimpan Project', firstError || 'Silakan periksa kembali isian formulir.');
            },
        });
    };

    // Construct preview project object
    const previewProject = {
        name: data.name || 'Sample Project Name',
        category: data.category,
        title: data.title || 'CAGE MONITORING',
        subtitle: data.subtitle,
        description: data.description,
        main_image_preview: imagePreviewUrl,
        main_image: project?.main_image,
        partner_logos_preview: data.partner_logos_preview || partnerLogoPreviewUrls,
        partner_logos: data.remove_partner_logo ? [] : data.partner_logos,
        partner_logo_preview: (data.partner_logos_preview && data.partner_logos_preview[0]) || partnerLogoPreviewUrls[0] || null,
        partner_logo: data.remove_partner_logo ? null : (Array.isArray(data.partner_logos) ? data.partner_logos[0] : project?.partner_logo),
        research_team: data.research_team || [],
        lab_affiliation: data.lab_affiliation,
        patent_number: data.patent_number,
        publication_doi: data.publication_doi,
        benefits: data.benefits,
        specifications: data.specifications,
        problem_solution: {
            ...data.problem_solution,
            panels: currentPanels,
        },
        project_url: data.project_url,
        footer_website: data.footer_website,
        footer_instagram: data.footer_instagram,
        footer_youtube: data.footer_youtube,
        social_links: data.social_links,
        layout_preset: data.layout_preset || 'balanced',
        design_style: data.design_style || 'classic_standard',
        doc_format: data.doc_format || 'a4_flyer',
        color_theme: data.color_theme || 'stas_official',
        print_mode: data.print_mode || 'light',
        font_family: data.font_family || data.layout_schema?.font_family || 'plus_jakarta',
        bg_pattern: data.bg_pattern || data.layout_schema?.bg_pattern || 'none',
        custom_colors: data.custom_colors || data.layout_schema?.custom_colors,
        boilerplate_type: data.boilerplate_type,
        layout_schema: {
            ...(typeof data.layout_schema === 'object' && data.layout_schema !== null ? data.layout_schema : {}),
            font_family: data.font_family,
            bg_pattern: data.bg_pattern,
            custom_colors: data.custom_colors,
        },
        content_en: data.content_en || null,
        previewLang: previewLang,
        active_trifold_tab: activeTrifoldTab,
    };

    // Apply template to current form
    const handleApplyTemplate = (tpl) => {
        setData((prev) => {
            const next = { ...prev };
            if (tpl.category) next.category = tpl.category;
            if (tpl.doc_format) next.doc_format = tpl.doc_format;
            if (tpl.layout_preset) next.layout_preset = tpl.layout_preset;
            if (tpl.design_style) next.design_style = tpl.design_style;
            if (tpl.color_theme) next.color_theme = tpl.color_theme;
            if (tpl.print_mode) next.print_mode = tpl.print_mode;
            if (tpl.boilerplate_type) next.boilerplate_type = tpl.boilerplate_type;
            if (tpl.layout_schema) {
                next.layout_schema = tpl.layout_schema;
                if (tpl.layout_schema.font_family) next.font_family = tpl.layout_schema.font_family;
                if (tpl.layout_schema.bg_pattern) next.bg_pattern = tpl.layout_schema.bg_pattern;
                if (tpl.layout_schema.custom_colors) next.custom_colors = tpl.layout_schema.custom_colors;
            }

            if (tpl.default_data) {
                const dd = tpl.default_data;
                if (!prev.title && dd.title) next.title = dd.title;
                if (!prev.subtitle && dd.subtitle) next.subtitle = dd.subtitle;
                if (!prev.description && dd.description) next.description = dd.description;
                if ((!prev.benefits || !prev.benefits.content) && dd.benefits) next.benefits = dd.benefits;
                if ((!prev.specifications || !prev.specifications.content) && dd.specifications) next.specifications = dd.specifications;
                if ((!prev.problem_solution || (!prev.problem_solution.problem && !prev.problem_solution.solution)) && dd.problem_solution) next.problem_solution = dd.problem_solution;
                if (dd.footer_website) next.footer_website = dd.footer_website;
                if (dd.footer_instagram) next.footer_instagram = dd.footer_instagram;
                if (dd.footer_youtube) next.footer_youtube = dd.footer_youtube;
            }
            return next;
        });
        showAlert('Template Diterapkan', `Template "${tpl.name}" berhasil diterapkan ke proyek.`, 'success');
    };

    // Save project as custom template
    const handleSaveAsTemplate = async (e) => {
        e?.preventDefault();
        if (!templateName.trim()) {
            showAlert('Nama Template Wajib Diisi', 'Silakan masukkan nama untuk template kustom ini.', 'warning');
            return;
        }

        setSavingTemplate(true);
        try {
            const res = await fetch('/templates/save-from-project', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    name: templateName,
                    description: templateDesc,
                    project_id: project?.id || null,
                    project_data: data,
                }),
            });
            const result = await res.json();
            if (result.success) {
                showAlert('Berhasil!', result.message, 'success');
                setIsSaveAsTemplateOpen(false);
                setTemplateName('');
                setTemplateDesc('');
            } else {
                showAlert('Gagal', result.message || 'Gagal menyimpan template.', 'error');
            }
        } catch (err) {
            console.error(err);
            showAlert('Error', 'Terjadi kesalahan saat menyimpan template.', 'error');
        } finally {
            setSavingTemplate(false);
        }
    };

    // Social media links management handlers
    const handleAddSocialLink = (platformId = 'facebook') => {
        const platformConfig = getSocialPlatformConfig(platformId);
        const currentLinks = Array.isArray(data.social_links) ? [...data.social_links] : [];
        const newLinks = [
            ...currentLinks,
            { platform: platformId, value: platformConfig.defaultHandle || '' }
        ];
        setData('social_links', newLinks);
    };

    const handleUpdateSocialLink = (index, field, value) => {
        const currentLinks = Array.isArray(data.social_links) ? [...data.social_links] : [];
        if (!currentLinks[index]) return;

        const updatedItem = { ...currentLinks[index] };

        if (field === 'platform') {
            const oldPlatform = updatedItem.platform;
            const oldConfig = getSocialPlatformConfig(oldPlatform);
            const newConfig = getSocialPlatformConfig(value);

            if (!updatedItem.value || updatedItem.value === oldConfig.defaultHandle) {
                updatedItem.value = newConfig.defaultHandle;
            }
            updatedItem.platform = value;
        } else {
            updatedItem[field] = value;
        }

        currentLinks[index] = updatedItem;
        setData('social_links', currentLinks);

        // Keep legacy fields in sync
        const webItem = currentLinks.find((l) => l.platform === 'website');
        const igItem = currentLinks.find((l) => l.platform === 'instagram');
        const ytItem = currentLinks.find((l) => l.platform === 'youtube');
        if (webItem) setData('footer_website', webItem.value);
        if (igItem) setData('footer_instagram', igItem.value);
        if (ytItem) setData('footer_youtube', ytItem.value);
    };

    const handleRemoveSocialLink = (index) => {
        const currentLinks = Array.isArray(data.social_links) ? [...data.social_links] : [];
        const newLinks = currentLinks.filter((_, idx) => idx !== index);
        setData('social_links', newLinks);
    };

    const handleResetSocialLinks = () => {
        setData('social_links', [...DEFAULT_STAS_SOCIAL_LINKS]);
        showSuccess('Reset Media Sosial', 'Media sosial footer dikembalikan ke standar STAS-RG.');
    };

    const handleMoveSocialLink = (fromIndex, toIndex) => {
        const currentLinks = Array.isArray(data.social_links) ? [...data.social_links] : [];
        if (toIndex < 0 || toIndex >= currentLinks.length || fromIndex === toIndex) return;

        const [movedItem] = currentLinks.splice(fromIndex, 1);
        currentLinks.splice(toIndex, 0, movedItem);
        setData('social_links', currentLinks);

        // Keep legacy fields in sync
        const webItem = currentLinks.find((l) => l.platform === 'website');
        const igItem = currentLinks.find((l) => l.platform === 'instagram');
        const ytItem = currentLinks.find((l) => l.platform === 'youtube');
        if (webItem) setData('footer_website', webItem.value);
        if (igItem) setData('footer_instagram', igItem.value);
        if (ytItem) setData('footer_youtube', ytItem.value);
    };

    const handleDragStartSocial = (e, index) => {
        setDraggedSocialIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', String(index));
    };

    const handleDragOverSocial = (e, index) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (dragOverSocialIndex !== index) {
            setDragOverSocialIndex(index);
        }
    };

    const handleDragLeaveSocial = (e, index) => {
        if (dragOverSocialIndex === index) {
            setDragOverSocialIndex(null);
        }
    };

    const handleDropSocial = (e, targetIndex) => {
        e.preventDefault();
        if (draggedSocialIndex !== null && draggedSocialIndex !== targetIndex) {
            handleMoveSocialLink(draggedSocialIndex, targetIndex);
        }
        setDraggedSocialIndex(null);
        setDragOverSocialIndex(null);
    };

    const handleDragEndSocial = () => {
        setDraggedSocialIndex(null);
        setDragOverSocialIndex(null);
    };

    const handleLoadFullSocialPreset = () => {
        setData('social_links', [
            { platform: 'website', value: 'www.stas-rg.com' },
            { platform: 'instagram', value: '@stas.rg' },
            { platform: 'youtube', value: '@stas_rg' },
            { platform: 'linkedin', value: 'linkedin.com/company/stas-rg' },
            { platform: 'email', value: 'stasrg@telkomuniversity.ac.id' },
        ]);
        showSuccess('Preset Lengkap Terpasang', '5 Saluran media sosial & kontak resmi telah ditambahkan.');
    };

    const hasCustomPartnerLogo = partnerLogoPreviewUrls.length > 0;
    const layoutEvaluation = evaluateProjectLayoutLimits(data, data.layout_preset, data.doc_format);

    return (
        <AdminLayout 
            title={isEditing ? (pf.editTitle ? `${pf.editTitle}: ${project.name}` : `Edit Project: ${project.name}`) : (pf.createTitle || 'Create New Visual Project')} 
            currentPath="/projects/create"
        >
            <div className="space-y-6">
                
                {/* Top Nav Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/projects"
                            className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                                {isEditing 
                                    ? (pf.editTitle ? `${pf.editTitle}: ${project.name}` : `Edit Project: ${project.name}`) 
                                    : (pf.createTitle || 'Create New Visual Project')}
                            </h1>
                            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                                {pf.pageSubtitle || 'Isi informasi, unggah foto, dan lihat live preview flyer secara realtime di sisi kanan.'}
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons & Auto-save Status (2 Baris Rapi Rata Kanan) */}
                    <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
                        {/* Baris 1: Template & Auto-save Status (Rata Kanan) */}
                        <div className="flex flex-wrap items-center justify-start sm:justify-end gap-2">
                            {/* Auto-save & Local Draft Status Pill */}
                            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-100/90 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 text-zinc-600 dark:text-zinc-300 text-[11px]">
                                {isAutoSaving ? (
                                    <>
                                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                        <span className="font-medium text-amber-600 dark:text-amber-400">{pf.autoSaveSaving || 'Menyimpan draf...'}</span>
                                    </>
                                ) : lastSavedDraftTime ? (
                                    <>
                                        <span className="w-2 h-2 rounded-full bg-[#0AB600]" />
                                        <span className="font-medium text-[#0AB600]">
                                            {pf.autoSaveBrowserActive || 'Draf Browser'} ({lastSavedDraftTime.toLocaleTimeString(language === 'en' ? 'en-US' : 'id-ID', { hour: '2-digit', minute: '2-digit' })})
                                        </span>
                                        <button
                                            type="button"
                                            onClick={handleClearDraft}
                                            title={pf.resetDraftTooltip || 'Hapus draf lokal dan mulai ulang formulir'}
                                            className="ml-0.5 p-0.5 rounded text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                                        >
                                            <RotateCcw className="w-3 h-3" />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <span className="w-2 h-2 rounded-full bg-zinc-400" />
                                        <span>{pf.autoSaveReady || 'Auto-save Aktif'}</span>
                                    </>
                                )}
                            </div>

                            {/* Template Actions */}
                            <button
                                type="button"
                                onClick={() => setIsTemplatePickerOpen(true)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                                title="Pilih Desain & Layout dari Katalog Template"
                            >
                                <LayoutTemplate className="w-3.5 h-3.5" />
                                <span>Pilih Template</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setTemplateName(data.title ? `Template: ${data.title}` : 'Template Proyek');
                                    setIsSaveAsTemplateOpen(true);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition-all cursor-pointer"
                                title="Simpan konfigurasi proyek ini sebagai template reusable"
                            >
                                <BookmarkCheck className="w-3.5 h-3.5 text-[#0AB600]" />
                                <span>Simpan Template</span>
                            </button>

                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={() => setIsVersionModalOpen(true)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition-all cursor-pointer"
                                    title="Lihat Riwayat Versi & Rollback"
                                >
                                    <History className="w-3.5 h-3.5 text-[#0AB600]" />
                                    <span>Riwayat Versi</span>
                                </button>
                            )}
                        </div>

                        {/* Baris 2: Primary Actions (Rata Kanan) */}
                        <div className="flex items-center justify-start sm:justify-end gap-2 w-full">
                            {data.status === 'published' ? (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        setData('status', 'draft');
                                        handleSubmit(e, 'draft');
                                    }}
                                    disabled={processing}
                                    className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs sm:text-sm font-semibold transition-all cursor-pointer disabled:opacity-50"
                                >
                                    {pf.saveDraft || 'Draft'}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        setData('status', 'published');
                                        handleSubmit(e, 'published');
                                    }}
                                    disabled={processing}
                                    className="px-4 py-2 rounded-xl bg-[#0AB600]/10 border border-[#0AB600]/30 dark:border-[#0AB600]/40 hover:bg-[#0AB600]/15 text-[#0AB600] text-xs sm:text-sm font-semibold transition-all cursor-pointer disabled:opacity-50"
                                >
                                    {pf.publishToShowcase || 'Publikasikan ke Showcase'}
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={(e) => handleSubmit(e, data.status)}
                                disabled={processing}
                                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#0AB600] hover:bg-[#089600] text-white text-xs sm:text-sm font-semibold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                <span>{isEditing ? (pf.updateFlyer || 'Update Flyer') : (pf.saveAndGenerate || 'Generate & Simpan')}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Local Storage Draft Restored Notification Banner */}
                {draftRestoredNotice && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#0AB600]/10 border border-[#0AB600]/30 text-slate-900 dark:text-[#0AB600] shadow-xs animate-in fade-in duration-300">
                        <div className="flex items-start sm:items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-[#0AB600]/15 dark:bg-[#0AB600]/15 flex items-center justify-center shrink-0 text-[#0AB600]">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-xs font-bold">{pf.draftRestoredTitle || 'Draf Isian Berhasil Dipulihkan Otomatis'}</p>
                                <p className="text-[11px] text-[#0AB600]/90 dark:text-[#0AB600]/90 mt-0.5">
                                    {pf.draftRestoredDesc || 'Data formulir Anda sebelum halaman dimuat ulang berhasil dipulihkan dari cache penyimpanan browser lokal. Data Anda tidak akan hilang saat refresh.'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                            <button
                                type="button"
                                onClick={handleClearDraft}
                                className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 text-[11px] font-semibold transition-colors cursor-pointer shadow-2xs"
                            >
                                {pf.resetDraftBtn || 'Reset / Hapus Draf'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setDraftRestoredNotice(false)}
                                className="px-2.5 py-1 rounded-lg bg-[#0AB600] hover:bg-[#089600] text-white text-[11px] font-bold transition-colors cursor-pointer shadow-2xs"
                            >
                                {pf.closeNotification || 'Tutup Notifikasi'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Main Split Layout: Form on Left (60%) vs Live Preview on Right (40%) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                                 {/* LEFT PANEL: Form Sections (lg:col-span-7) */}
                    <div className="lg:col-span-7 space-y-5">

                        {/* DUAL-LANGUAGE (ID / EN) SELECTOR & AI AUTO-TRANSLATE BAR */}
                        <div className="p-4 rounded-2xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                                    <Languages className="w-4 h-4 text-[#0AB600]" />
                                    {language === 'en' ? 'Flyer Language:' : 'Bahasa Konten Flyer:'}
                                </span>
                                <div className="inline-flex p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl border border-zinc-200 dark:border-zinc-700">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActiveFormLang('id');
                                            setPreviewLang('id');
                                        }}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                            activeFormLang === 'id'
                                                ? 'bg-[#0AB600] text-white shadow-xs'
                                                : 'text-zinc-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                    >
                                        <span className="font-mono text-[10px] font-black uppercase px-1 py-0.5 rounded bg-black/10 dark:bg-white/10">ID</span>
                                        <span>Indonesia</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActiveFormLang('en');
                                            setPreviewLang('en');
                                        }}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                            activeFormLang === 'en'
                                                ? 'bg-[#0AB600] text-white shadow-xs'
                                                : 'text-zinc-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                    >
                                        <span className="font-mono text-[10px] font-black uppercase px-1 py-0.5 rounded bg-black/10 dark:bg-white/10">EN</span>
                                        <span>English</span>
                                        {Boolean(data.content_en?.title) && (
                                            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" title="English content available" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleAiTranslate}
                                disabled={isTranslatingAi || (!data.title && !data.name && !data.description)}
                                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#0AB600] to-emerald-600 hover:from-[#089600] hover:to-emerald-700 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-40 shadow-xs active:scale-95 shrink-0"
                                title="Otomatis terjemahkan seluruh konten flyer ke Bahasa Inggris Akademis menggunakan AI"
                            >
                                {isTranslatingAi ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>{language === 'en' ? 'Translating...' : 'Menerjemahkan AI...'}</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4" />
                                        <span>{language === 'en' ? 'Translate to English' : 'Terjemahkan ke English'}</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {activeFormLang === 'en' ? (
                            /* ENGLISH VERSION FORM CONTENT */
                            <div className="space-y-5 animate-in fade-in duration-200">
                                {/* English Main Info */}
                                <div className="bg-white dark:bg-[#121824] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 sm:p-6 shadow-sm space-y-4">
                                    <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                                        <div className="flex items-center gap-2">
                                            <span className="p-1 rounded-md bg-[#0AB600]/10 text-[#0AB600]">
                                                <FolderKanban className="w-4 h-4" />
                                            </span>
                                            <div>
                                                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                                    1. English Research Identity (EN)
                                                </h2>
                                                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                                    Research title and summary in English for international expos and partners.
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleAiTranslate}
                                            disabled={isTranslatingAi}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0AB600]/10 hover:bg-[#0AB600]/15 text-[#0AB600] border border-[#0AB600]/30 text-xs font-bold transition-all cursor-pointer disabled:opacity-40"
                                        >
                                            {isTranslatingAi ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                                            <span>Re-Translate</span>
                                        </button>
                                    </div>

                                    {/* English Title & Subtitle */}
                                    <div className="space-y-3.5">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                                                Innovation Title in English <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={data.content_en?.title || ''}
                                                onChange={(e) => handleUpdateContentEn('title', e.target.value)}
                                                placeholder="e.g. SMART WATER QUALITY MONITORING & TELEMETRY SYSTEM"
                                                className="w-full px-3 py-2 text-xs font-bold uppercase bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:border-[#0AB600] focus:outline-none"
                                            />
                                            <TextLimitMeter value={data.content_en?.title} limitKey="title" preset={data.layout_preset} docFormat={data.doc_format} />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                                                    English Subtitle / Tagline
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.content_en?.subtitle || ''}
                                                    onChange={(e) => handleUpdateContentEn('subtitle', e.target.value)}
                                                    placeholder="e.g. Real-Time Aquaculture Telemetry Automation"
                                                    className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:border-[#0AB600] focus:outline-none"
                                                />
                                                <TextLimitMeter value={data.content_en?.subtitle} limitKey="subtitle" preset={data.layout_preset} docFormat={data.doc_format} />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                                                    English Category Name
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.content_en?.category || ''}
                                                    onChange={(e) => handleUpdateContentEn('category', e.target.value)}
                                                    placeholder="e.g. Smart Agriculture / IoT"
                                                    className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:border-[#0AB600] focus:outline-none"
                                                />
                                            </div>
                                        </div>

                                        {/* English Description */}
                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                                                    Research Summary / Description in English
                                                </label>
                                            </div>
                                            <RichTextEditor
                                                value={data.content_en?.description || ''}
                                                onChange={(val) => handleUpdateContentEn('description', val)}
                                                placeholder="Concise English summary explaining research urgency and system architecture..."
                                                minHeight="80px"
                                            />
                                            <TextLimitMeter value={data.content_en?.description} limitKey="description" preset={data.layout_preset} docFormat={data.doc_format} />
                                        </div>
                                    </div>
                                </div>

                                {/* Problem - Solution in English */}
                                <div className="bg-white dark:bg-[#121824] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 sm:p-6 shadow-sm space-y-4">
                                    <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                                        <span className="p-1 rounded-md bg-[#0AB600]/10 text-[#0AB600]">
                                            <Lightbulb className="w-4 h-4" />
                                        </span>
                                        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                            2. Problem &amp; Solution (English)
                                        </h2>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                                                Problem Statement (English):
                                            </label>
                                            <RichTextEditor
                                                value={data.content_en?.problem_solution?.problem || ''}
                                                onChange={(val) => handleUpdateContentEnNested('problem_solution', 'problem', val)}
                                                placeholder="Short problem statement in English..."
                                                minHeight="70px"
                                            />
                                            <TextLimitMeter value={data.content_en?.problem_solution?.problem} limitKey="problem" preset={data.layout_preset} docFormat={data.doc_format} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                                                Applied Solution (English):
                                            </label>
                                            <RichTextEditor
                                                value={data.content_en?.problem_solution?.solution || ''}
                                                onChange={(val) => handleUpdateContentEnNested('problem_solution', 'solution', val)}
                                                placeholder="Applied innovation solution in English..."
                                                minHeight="70px"
                                            />
                                            <TextLimitMeter value={data.content_en?.problem_solution?.solution} limitKey="solution" preset={data.layout_preset} docFormat={data.doc_format} />
                                        </div>
                                    </div>
                                </div>

                                {/* Benefits & Specifications in English */}
                                <div className="bg-white dark:bg-[#121824] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 sm:p-6 shadow-sm space-y-4">
                                    <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                                        <span className="p-1 rounded-md bg-[#0AB600]/10 text-[#0AB600]">
                                            <Layers className="w-4 h-4" />
                                        </span>
                                        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                            3. Key Benefits &amp; Technical Specifications (English)
                                        </h2>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                                                Key Benefits (Bullet points in English):
                                            </label>
                                            <RichTextEditor
                                                value={data.content_en?.benefits?.content || ''}
                                                onChange={(val) => handleUpdateContentEnNested('benefits', 'content', val)}
                                                placeholder="<ul><li><strong>Efficiency:</strong> Saves 60% operational time.</li></ul>"
                                                minHeight="70px"
                                            />
                                            <TextLimitMeter value={data.content_en?.benefits?.content} limitKey="benefits" preset={data.layout_preset} docFormat={data.doc_format} />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                                                Technical Specifications (Bullet points in English):
                                            </label>
                                            <RichTextEditor
                                                value={data.content_en?.specifications?.content || ''}
                                                onChange={(val) => handleUpdateContentEnNested('specifications', 'content', val)}
                                                placeholder="<ul><li><strong>MCU:</strong> STM32 ARM Cortex-M4</li></ul>"
                                                minHeight="70px"
                                            />
                                            <TextLimitMeter value={data.content_en?.specifications?.content} limitKey="specifications" preset={data.layout_preset} docFormat={data.doc_format} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* INDONESIAN FORM SECTIONS */
                            <>
                        {/* STEP NAVIGATION WIZARD (KHUSUS BROSUR A4 LIPAT 3) */}
                        {data.doc_format === 'brochure_trifold' && (
                            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121824] border-2 border-[#0AB600]/40 dark:border-[#0AB600]/30 shadow-sm space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                        <BookOpen className="w-4 h-4 text-[#0AB600]" />
                                        <span>Tahap Pengisian Brosur Lipat 3</span>
                                    </div>
                                    <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#0AB600]/15 text-[#0AB600] self-start sm:self-auto">
                                        Kotak {activeTrifoldTab + 1} dari 3 Aktif
                                    </span>
                                </div>

                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                    Setiap panel lipatan (Kotak 1, 2, 3) mewakili 1 proyek/modul inovasi yang berbeda. Isi formulir biasa di bawah untuk kotak yang aktif, lalu klik tombol lanjut untuk berpindah ke kotak berikutnya.
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                                    {[
                                        { idx: 0, label: 'Kotak 1', pos: 'Panel Kiri (Utama)' },
                                        { idx: 1, label: 'Kotak 2', pos: 'Panel Tengah' },
                                        { idx: 2, label: 'Kotak 3', pos: 'Panel Kanan / Cover' },
                                    ].map((step) => {
                                        const p = currentPanels[step.idx] || {};
                                        const isActive = activeTrifoldTab === step.idx;
                                        const isFilled = Boolean(p.title && (p.description || p.problem));

                                        return (
                                            <button
                                                key={step.idx}
                                                type="button"
                                                onClick={() => {
                                                    setActiveTrifoldTab(step.idx);
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                }}
                                                className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col gap-1 relative ${
                                                    isActive
                                                        ? 'bg-[#0AB600]/10 border-[#0AB600] shadow-xs ring-1 ring-[#0AB600]'
                                                        : isFilled
                                                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 hover:border-[#0AB600]/50'
                                                        : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className={`text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                                        isActive ? 'bg-[#0AB600] text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                                                    }`}>
                                                        {step.label}
                                                    </span>
                                                    {isFilled ? (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0AB600]">
                                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                                            <span>Terisi</span>
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] text-zinc-400 font-medium">Belum diisi</span>
                                                    )}
                                                </div>
                                                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                                    {p.title || `Inovasi Kotak ${step.idx + 1}`}
                                                </span>
                                                <div className="flex items-center justify-between gap-1 text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                                                    <span className="truncate">{step.pos}</span>
                                                    {p.category && (
                                                        <span className="truncate text-[#0AB600] font-semibold font-sans px-1 py-0.2 rounded bg-[#0AB600]/10 max-w-[100px]">
                                                            {p.category}
                                                        </span>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                        
                        {/* 1. Informasi Project Card */}
                        <div className="bg-white dark:bg-[#121824] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 sm:p-6 shadow-sm space-y-4">
                            <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                                <span className="p-1 rounded-md bg-[#0AB600]/10 text-[#0AB600]">
                                    <FolderKanban className="w-4 h-4" />
                                </span>
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                    {data.doc_format === 'brochure_trifold'
                                        ? `1. Identitas Riset Kotak ${activeTrifoldTab + 1} (${activeTrifoldTab === 0 ? 'Panel Kiri' : activeTrifoldTab === 1 ? 'Panel Tengah' : 'Panel Kanan'})`
                                        : (pf.sectionInfoTitle || '1. Informasi Utama Project')}
                                </h2>
                            </div>

                            {data.doc_format === 'brochure_trifold' ? (
                                <div className="space-y-4">
                                    {/* Global Project Name / Brochure Folder */}
                                    <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200">
                                                Nama Induk Proyek / Folder Brosur <span className="text-rose-500">*</span>
                                            </label>
                                            <span className="text-[10px] text-zinc-400">
                                                (Folder utama untuk 3 kotak inovasi ini)
                                            </span>
                                        </div>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="Contoh: Seri Inovasi Smart Agriculture & IoT CoE STAS-RG..."
                                            className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:border-[#0AB600] focus:outline-none"
                                            required
                                        />
                                        {errors.name && <p className="text-rose-500 text-[11px] mt-1">{errors.name}</p>}
                                    </div>

                                    {/* Active Box Identity Header */}
                                    <div className="p-4 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800 space-y-3.5">
                                        <div className="flex items-center justify-between pb-2 border-b border-zinc-200/80 dark:border-zinc-800">
                                            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                                                <FolderKanban className="w-3.5 h-3.5 text-[#0AB600]" />
                                                Identitas Khusus Kotak {activeTrifoldTab + 1} ({activeTrifoldTab === 0 ? 'Panel Kiri' : activeTrifoldTab === 1 ? 'Panel Tengah' : 'Panel Kanan / Cover'})
                                            </span>
                                            <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
                                                Data tiap kotak independen &amp; terpisah
                                            </span>
                                        </div>

                                        {/* Title & Category for Active Box */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                                                    Judul Utama Kotak {activeTrifoldTab + 1} <span className="text-rose-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={activePanel.title || ''}
                                                    onChange={(e) => handleUpdatePanel(activeTrifoldTab, 'title', e.target.value)}
                                                    placeholder={`Contoh: INOVASI MODUL ${activeTrifoldTab + 1}...`}
                                                    className="w-full px-3 py-2 text-xs font-bold uppercase bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:border-[#0AB600] focus:outline-none"
                                                    required
                                                />
                                                <TextLimitMeter value={activePanel.title} limitKey="title" preset={data.layout_preset} docFormat={data.doc_format} />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                                                    Kategori Riset Kotak {activeTrifoldTab + 1} <span className="text-rose-500">*</span>
                                                </label>
                                                <CategoryCombobox
                                                    value={activePanel.category || ''}
                                                    onChange={(val) => handleUpdatePanel(activeTrifoldTab, 'category', val)}
                                                    categories={availableCategories}
                                                    placeholder="Pilih atau ketik kategori untuk kotak ini..."
                                                    error={errors.category}
                                                />
                                            </div>
                                        </div>

                                        {/* Subtitle / Kemitraan */}
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                                                Subtitle / Kemitraan Kotak {activeTrifoldTab + 1}
                                            </label>
                                            <input
                                                type="text"
                                                value={activePanel.subtitle || ''}
                                                onChange={(e) => handleUpdatePanel(activeTrifoldTab, 'subtitle', e.target.value)}
                                                placeholder="Contoh: CoE STAS-RG x Mitra Industri..."
                                                className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:border-[#0AB600] focus:outline-none"
                                            />
                                            <TextLimitMeter value={activePanel.subtitle} limitKey="subtitle" preset={data.layout_preset} docFormat={data.doc_format} />
                                        </div>

                                        {/* Description for Active Box */}
                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                                                    Deskripsi Singkat Inovasi Kotak {activeTrifoldTab + 1}
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => handleGenerateOrPolishSection('description', activePanel.description)}
                                                    disabled={polishingSection === 'description' || (!activePanel.title && !activePanel.description)}
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0AB600]/10 hover:bg-[#0AB600]/15 dark:bg-[#0AB600]/10 dark:hover:bg-[#0AB600]/15 text-[#0AB600] border border-[#0AB600]/30 text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-40"
                                                    title="Generate atau poles deskripsi kotak ini dengan AI"
                                                >
                                                    {polishingSection === 'description' ? (
                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                    ) : (
                                                        <Sparkles className="w-3 h-3 text-[#0AB600]" />
                                                    )}
                                                    <span>{activePanel.description ? (pf.aiPolishWithAI || 'Poles AI') : (pf.aiWriteWithAI || 'Susun dengan AI')}</span>
                                                </button>
                                            </div>
                                            <RichTextEditor
                                                value={activePanel.description || ''}
                                                onChange={(val) => handleUpdatePanel(activeTrifoldTab, 'description', val)}
                                                placeholder={`Tuliskan ringkasan deskripsi sistem / inovasi untuk Kotak ${activeTrifoldTab + 1}...`}
                                                minHeight="80px"
                                            />
                                            <TextLimitMeter value={activePanel.description} limitKey="description" preset={data.layout_preset} docFormat={data.doc_format} />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Project Internal Name */}
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                                                {pf.projectNameLabel || 'Nama Project'} <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder={pf.projectNamePlaceholder || 'Masukkan nama project...'}
                                                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:border-[#0AB600] focus:outline-none"
                                                required
                                            />
                                            {errors.name && <p className="text-rose-500 text-[11px] mt-1">{errors.name}</p>}
                                        </div>

                                        {/* Category */}
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                                                {pf.categoryLabel || 'Kategori Riset'}
                                            </label>
                                            <CategoryCombobox
                                                value={data.category}
                                                onChange={(val) => setData('category', val)}
                                                categories={availableCategories}
                                                placeholder={pf.categoryPlaceholder || 'Pilih atau ketik kategori riset...'}
                                                error={errors.category}
                                            />
                                        </div>
                                    </div>

                                    {/* Subtitle / Partner Badge */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                                            {pf.subtitleLabel || 'Subtitle Banner'}
                                        </label>
                                        <input
                                            type="text"
                                            value={data.subtitle}
                                            onChange={(e) => setData('subtitle', e.target.value)}
                                            placeholder={pf.subtitlePlaceholder || 'Masukkan subtitle atau nama mitra kerjasama...'}
                                            className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:border-[#0AB600] focus:outline-none"
                                        />
                                        <TextLimitMeter value={data.subtitle} limitKey="subtitle" preset={data.layout_preset} docFormat={data.doc_format} />
                                    </div>

                                    {/* Main Title (Headline) */}
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                                            {pf.flyerTitleLabel || 'Judul Flyer'} <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            placeholder={pf.flyerTitlePlaceholder || 'Masukkan judul utama flyer...'}
                                            className="w-full px-3 py-2 text-xs font-bold uppercase bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:border-[#0AB600] focus:outline-none"
                                            required
                                        />
                                        <TextLimitMeter value={data.title} limitKey="title" preset={data.layout_preset} docFormat={data.doc_format} />
                                        {errors.title && <p className="text-rose-500 text-[11px] mt-1">{errors.title}</p>}
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                                                {pf.descriptionLabel || 'Deskripsi Singkat Sistem / Riset'}
                                            </label>
                                            <div className="flex items-center gap-1.5 flex-wrap justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => handleGenerateOrPolishSection('description', data.description)}
                                                    disabled={polishingSection === 'description' || (!data.name && !data.description)}
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0AB600]/10 hover:bg-[#0AB600]/15 dark:bg-[#0AB600]/10 dark:hover:bg-[#0AB600]/15 text-[#0AB600] border border-[#0AB600]/30 text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-40"
                                                    title={data.description ? (language === 'en' ? 'Polish description with AI' : 'Poles deskripsi agar lebih akademis dan ringkas') : (language === 'en' ? 'Generate draft description from Project Name & Category' : 'Generate draf deskripsi dari Nama Proyek & Kategori')}
                                                >
                                                    {polishingSection === 'description' ? (
                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                    ) : (
                                                        <Sparkles className="w-3 h-3 text-[#0AB600]" />
                                                    )}
                                                    <span>{data.description ? (pf.aiPolishWithAI || 'Poles Deskripsi') : (pf.aiWriteWithAI || 'Generate Deskripsi')}</span>
                                                </button>
                                            </div>
                                        </div>
                                        <RichTextEditor
                                            value={data.description}
                                            onChange={(val) => setData('description', val)}
                                            placeholder={pf.descriptionPlaceholder || 'Tuliskan ringkasan deskripsi sistem atau inovasi riset yang dikembangkan...'}
                                            minHeight="85px"
                                        />
                                        <TextLimitMeter value={data.description} limitKey="description" preset={data.layout_preset} docFormat={data.doc_format} />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Templates, Formats & Preset Styling */}
                        <LayoutPresetSelector
                            formatValue={data.doc_format}
                            presetValue={data.layout_preset}
                            designStyleValue={data.design_style}
                            themeValue={data.color_theme}
                            printModeValue={data.print_mode}
                            fontValue={data.font_family}
                            patternValue={data.bg_pattern}
                            customColors={data.custom_colors}
                            onFormatChange={(fmt) => setData('doc_format', fmt)}
                            onPresetChange={(preset) => setData('layout_preset', preset)}
                            onDesignStyleChange={(style) => setData('design_style', style)}
                            onThemeChange={(th) => setData('color_theme', th)}
                            onPrintModeChange={(pm) => setData('print_mode', pm)}
                            onFontChange={(font) => {
                                setData(prev => ({
                                    ...prev,
                                    font_family: font,
                                    layout_schema: { ...(prev.layout_schema || {}), font_family: font }
                                }));
                            }}
                            onPatternChange={(pattern) => {
                                setData(prev => ({
                                    ...prev,
                                    bg_pattern: pattern,
                                    layout_schema: { ...(prev.layout_schema || {}), bg_pattern: pattern }
                                }));
                            }}
                            onCustomColorsChange={(colors) => {
                                setData(prev => ({
                                    ...prev,
                                    custom_colors: colors,
                                    layout_schema: { ...(prev.layout_schema || {}), custom_colors: colors }
                                }));
                            }}
                            onApplyBoilerplate={handleApplyBoilerplate}
                        />

                        {/* 2. Logo Mitra / Kerjasama Header */}
                        <div className="bg-white dark:bg-[#121824] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 sm:p-6 shadow-sm space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                                <div className="flex items-center gap-2">
                                    <span className="p-1 rounded-md bg-[#0AB600]/10 text-[#0AB600]">
                                        <Building2 className="w-4 h-4" />
                                    </span>
                                    <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                        {pf.sectionVisualTitle || '2. Logo Mitra / Institusi Kerjasama'}
                                    </h2>
                                </div>
                                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${hasCustomPartnerLogo ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-[#0AB600]/15 text-[#0AB600] dark:bg-[#0AB600]/10 dark:text-[#0AB600]'}`}>
                                    {hasCustomPartnerLogo 
                                        ? `${partnerLogoPreviewUrls.length} Logo Mitra Aktif` 
                                        : 'Default (Telkom University)'}
                                </span>
                            </div>

                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                {language === 'en' 
                                    ? 'The STAS-RG logo is fixed on the right. You can add one or multiple partner logos (industry, universities, funding bodies) to appear on the left header.' 
                                    : 'Logo STAS-RG bersifat tetap di sebelah kanan. Anda dapat menambahkan satu atau beberapa logo mitra (industri, universitas mitra, lembaga hibah) yang akan tampil berdampingan di sebelah kiri header.'}
                            </p>

                            {/* Active Partner Logos Grid / Chips */}
                            <div className="space-y-3 pt-1">
                                {partnerLogoPreviewUrls.length > 0 ? (
                                    <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                                        {partnerLogoPreviewUrls.map((url, idx) => (
                                            <div 
                                                key={idx}
                                                className="relative group flex flex-col items-center justify-center p-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-xs min-w-[90px] h-[76px] transition-all hover:border-[#0AB600]"
                                            >
                                                <span className="absolute top-1 left-1.5 text-[9px] font-bold text-zinc-400 font-mono">
                                                    #{idx + 1}
                                                </span>
                                                <img 
                                                    src={url} 
                                                    alt={`Logo Mitra ${idx + 1}`} 
                                                    className="max-h-9 max-w-[80px] object-contain"
                                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                />
                                                {/* Reorder and Delete Toolbar on Hover */}
                                                <div className="absolute -top-2 -right-2 flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                                                    {idx > 0 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleMovePartnerLogo(idx, 'left')}
                                                            title="Geser ke kiri"
                                                            className="w-5 h-5 rounded-full bg-zinc-700 text-white flex items-center justify-center text-[10px] hover:bg-zinc-900 shadow-xs"
                                                        >
                                                            &larr;
                                                        </button>
                                                    )}
                                                    {idx < partnerLogoPreviewUrls.length - 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleMovePartnerLogo(idx, 'right')}
                                                            title="Geser ke kanan"
                                                            className="w-5 h-5 rounded-full bg-zinc-700 text-white flex items-center justify-center text-[10px] hover:bg-zinc-900 shadow-xs"
                                                        >
                                                            &rarr;
                                                        </button>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemovePartnerLogo(idx)}
                                                        title="Hapus logo ini"
                                                        className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center hover:bg-rose-600 shadow-xs cursor-pointer"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3.5 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                                        <div className="w-20 h-14 shrink-0 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-1.5 flex items-center justify-center">
                                            <img
                                                src="/assets/img/stas.png"
                                                alt="CoE STAS-RG"
                                                className="max-h-10 max-w-full object-contain"
                                            />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                                                Logo Default STAS-RG Aktif
                                            </div>
                                            <div className="text-[11px] text-zinc-400">
                                                Flyer akan menampilkan logo resmi CoE STAS-RG. Klik tombol di bawah jika ingin menambahkan logo mitra / institusi kolaborasi.
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="space-y-2">
                                    {isCompressingLogo ? (
                                        <div className="p-3.5 rounded-xl border border-[#0AB600]/30 bg-[#0AB600]/10 space-y-2 animate-in fade-in">
                                            <div className="flex items-center justify-between text-xs font-bold text-[#0AB600]">
                                                <div className="flex items-center gap-2">
                                                    <Loader2 className="w-4 h-4 animate-spin text-[#0AB600]" />
                                                    <span>{logoCompressionProgress?.stage || (language === 'en' ? 'Optimizing logo...' : 'Mengompresi logo otomatis...')}</span>
                                                </div>
                                                <span>{logoCompressionProgress?.percent || 0}%</span>
                                            </div>
                                            <div className="w-full bg-[#0AB600]/20 dark:bg-[#0AB600]/15 rounded-full h-1.5 overflow-hidden">
                                                <div
                                                    className="bg-[#0AB600] h-1.5 rounded-full transition-all duration-300"
                                                    style={{ width: `${logoCompressionProgress?.percent || 15}%` }}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-wrap items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setIsAssetPickerOpen(true)}
                                                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0AB600]/10 hover:bg-[#0AB600]/15 dark:hover:bg-[#0AB600]/15 text-[#0AB600] text-xs font-bold transition-colors cursor-pointer border border-[#0AB600]/30 active:scale-95 shadow-2xs"
                                            >
                                                <FolderHeart className="w-4 h-4 text-[#0AB600]" />
                                                <span>{language === 'en' ? 'Choose from Asset Library' : 'Pilih dari Asset Library'}</span>
                                            </button>

                                            <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-semibold transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-700">
                                                <Plus className="w-4 h-4 text-[#0AB600]" />
                                                <span>{language === 'en' ? 'Add Partner Logo (+)' : 'Tambah Logo Mitra (+)'}</span>
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    onChange={handlePartnerLogoChange}
                                                    className="hidden"
                                                />
                                            </label>

                                            {hasCustomPartnerLogo && (
                                                <button
                                                    type="button"
                                                    onClick={handleResetPartnerLogos}
                                                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                                >
                                                    <RefreshCw className="w-3.5 h-3.5" />
                                                    <span>{language === 'en' ? 'Reset to Default (STAS-RG)' : 'Reset ke Default (STAS-RG)'}</span>
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {logoCompressionStats?.wasCompressed && (
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0AB600]/10 border border-[#0AB600]/30 text-[11px] font-semibold text-[#0AB600]">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-[#0AB600] shrink-0" />
                                            <span>{language === 'en' ? 'Optimally converted:' : 'Terkonversi optimal:'} {logoCompressionStats.originalSizeStr} &rarr; {logoCompressionStats.compressedSizeStr} ({language === 'en' ? 'Saved' : 'Hemat'} {logoCompressionStats.savedPercent}%)</span>
                                        </div>
                                    )}

                                    <p className="text-[11px] text-zinc-400">
                                        {pf.partnerLogoHint || (language === 'en' ? 'Supports PNG/SVG/WebP. Multiple logos can be uploaded and reordered.' : 'Mendukung PNG/SVG/WebP. Anda dapat menambahkan banyak logo sekaligus dan mengatur urutannya.')}
                                    </p>
                                    {errors.partner_logos && <p className="text-rose-500 text-[11px] mt-1">{errors.partner_logos}</p>}
                                    {errors.partner_logo && <p className="text-rose-500 text-[11px] mt-1">{errors.partner_logo}</p>}
                                </div>
                            </div>
                        </div>

                        {/* 3. Foto Prototype / Gambar Utama / Gambar Kotak */}
                        <div className="bg-white dark:bg-[#121824] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 sm:p-6 shadow-sm space-y-4">
                            <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                                <span className="p-1 rounded-md bg-[#0AB600]/10 text-[#0AB600]">
                                    <ImageIcon className="w-4 h-4" />
                                </span>
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                    {data.doc_format === 'brochure_trifold'
                                        ? `3. Foto Prototype / Gambar Inovasi Kotak ${activeTrifoldTab + 1}`
                                        : (language === 'en' ? '3. Prototype Photo / Main Image' : '3. Foto Prototype / Gambar Utama')}
                                </h2>
                            </div>

                            {data.doc_format === 'brochure_trifold' ? (
                                <div className="space-y-3">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                                        {activePanel.image_url ? (
                                            <div className="w-32 h-24 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 relative shrink-0 group bg-zinc-100 dark:bg-zinc-800">
                                                <img 
                                                    src={activePanel.image_url} 
                                                    alt={`Kotak ${activeTrifoldTab + 1}`} 
                                                    className="w-full h-full object-cover transition-all" 
                                                    style={{ objectPosition: `${activePanel.image_x ?? 50}% ${activePanel.image_y ?? 50}%` }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleUpdatePanel(activeTrifoldTab, 'image_url', null)}
                                                    className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-bold cursor-pointer"
                                                    title="Hapus foto kotak ini"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-1" /> Hapus
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="w-32 h-24 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex flex-col items-center justify-center text-zinc-400 bg-zinc-50 dark:bg-zinc-900 shrink-0">
                                                <ImageIcon className="w-6 h-6 mb-1 opacity-50" />
                                                <span className="text-[10px]">No photo</span>
                                            </div>
                                        )}

                                        <div className="flex-1 w-full space-y-2.5">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-semibold transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-700">
                                                    <Upload className="w-4 h-4 text-[#0AB600]" />
                                                    <span>Upload File Foto</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => handlePanelImageFileChange(activeTrifoldTab, e)}
                                                        className="hidden"
                                                    />
                                                </label>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setAssetTargetPanelIndex(activeTrifoldTab);
                                                        setIsAssetPickerOpen(true);
                                                    }}
                                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0AB600]/10 hover:bg-[#0AB600]/15 text-[#0AB600] text-xs font-bold transition-colors cursor-pointer border border-[#0AB600]/30 shadow-2xs"
                                                >
                                                    <FolderHeart className="w-4 h-4" />
                                                    <span>Pilih dari Asset Library</span>
                                                </button>
                                            </div>

                                            <input
                                                type="text"
                                                value={activePanel.image_url || ''}
                                                onChange={(e) => handleUpdatePanel(activeTrifoldTab, 'image_url', e.target.value)}
                                                placeholder="Atau tempel URL gambar (https://...)"
                                                className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:border-[#0AB600] focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex flex-col sm:flex-row items-center gap-4">
                                        {imagePreviewUrl ? (
                                            <div className="w-36 h-28 shrink-0 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 relative group bg-zinc-100">
                                                <img
                                                    src={imagePreviewUrl}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover transition-all"
                                                    style={{ objectPosition: `${data.layout_schema?.image_x ?? 50}% ${data.layout_schema?.image_y ?? 50}%` }}
                                                />
                                                <label className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-semibold cursor-pointer">
                                                    {pf.changeImage || (language === 'en' ? 'Change Photo' : 'Ganti Foto')}
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleImageChange}
                                                        className="hidden"
                                                    />
                                                </label>
                                            </div>
                                        ) : (
                                            <div className="w-36 h-28 shrink-0 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 flex flex-col items-center justify-center text-zinc-400 bg-zinc-50 dark:bg-zinc-900">
                                                <ImageIcon className="w-6 h-6 mb-1" />
                                                <span className="text-[10px]">No image</span>
                                            </div>
                                        )}

                                        <div className="flex-1 w-full space-y-2">
                                            {isCompressingImage ? (
                                                <div className="p-4 rounded-xl border border-[#0AB600]/30 bg-[#0AB600]/10 space-y-2.5 animate-in fade-in">
                                                    <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-[#0AB600]">
                                                        <div className="flex items-center gap-2">
                                                            <Loader2 className="w-4 h-4 animate-spin text-[#0AB600]" />
                                                            <span>{compressionProgress?.stage || (language === 'en' ? 'Compressing image automatically...' : 'Mengompresi gambar otomatis...')}</span>
                                                        </div>
                                                        <span className="font-mono text-[11px]">{compressionProgress?.percent || 0}%</span>
                                                    </div>
                                                    <div className="w-full bg-[#0AB600]/20 dark:bg-[#0AB600]/15 rounded-full h-2 overflow-hidden">
                                                        <div
                                                            className="bg-[#0AB600] h-2 rounded-full transition-all duration-300"
                                                            style={{ width: `${compressionProgress?.percent || 15}%` }}
                                                        />
                                                    </div>
                                                    <p className="text-[11px] text-[#0AB600]/80 dark:text-[#0AB600]/80">
                                                        {language === 'en' ? 'Adjusting resolution and quality for optimal print & download.' : 'Menyesuaikan resolusi dan kualitas gambar agar optimal untuk dicetak & diunduh.'}
                                                    </p>
                                                </div>
                                            ) : (
                                                <label className="flex flex-col items-center justify-center p-4 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer text-center">
                                                    <Upload className="w-5 h-5 text-[#0AB600] mb-1" />
                                                    <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                                                        {pf.uploadImage || (language === 'en' ? 'Click to upload prototype photo' : 'Klik untuk upload foto prototype')}
                                                    </span>
                                                    <span className="text-[11px] text-zinc-400 mt-0.5">
                                                        {pf.mainImageUploadHint || (language === 'en' ? 'Supports all image formats (Automatically compressed to stay lightweight & sharp)' : 'Mendukung semua ukuran gambar (Otomatis dikompresi agar ringan & tajam)')}
                                                    </span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleImageChange}
                                                        className="hidden"
                                                    />
                                                </label>
                                            )}

                                            {imageCompressionStats?.wasCompressed && (
                                                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0AB600]/10 border border-[#0AB600]/30 text-xs font-semibold text-[#0AB600]">
                                                    <CheckCircle2 className="w-4 h-4 text-[#0AB600] shrink-0" />
                                                    <span>{language === 'en' ? 'Optimally compressed:' : 'Otomatis terkompresi:'} {imageCompressionStats.originalSizeStr} &rarr; {imageCompressionStats.compressedSizeStr} ({language === 'en' ? 'Saved' : 'Hemat'} {imageCompressionStats.savedPercent}%)</span>
                                                </div>
                                            )}

                                            {errors.main_image && <p className="text-rose-500 text-[11px] mt-1">{errors.main_image}</p>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Reposition & Focal Point Controller (Posisi Ke Atas / Ke Bawah / Kiri / Kanan) */}
                            {((data.doc_format === 'brochure_trifold' && activePanel.image_url) || (data.doc_format !== 'brochure_trifold' && imagePreviewUrl)) && (() => {
                                const isTrifold = data.doc_format === 'brochure_trifold';
                                const activeImgSrc = isTrifold ? activePanel.image_url : imagePreviewUrl;
                                const curX = isTrifold ? (activePanel.image_x !== undefined ? Number(activePanel.image_x) : 50) : (data.layout_schema?.image_x !== undefined ? Number(data.layout_schema.image_x) : 50);
                                const curY = isTrifold ? (activePanel.image_y !== undefined ? Number(activePanel.image_y) : 50) : (data.layout_schema?.image_y !== undefined ? Number(data.layout_schema.image_y) : 50);

                                const updatePos = (newX, newY) => {
                                    const clampedX = Math.max(0, Math.min(100, Math.round(Number(newX))));
                                    const clampedY = Math.max(0, Math.min(100, Math.round(Number(newY))));
                                    if (isTrifold) {
                                        const updatedPanels = currentPanels.map((p, idx) => {
                                            if (idx === activeTrifoldTab) {
                                                return { ...p, image_x: clampedX, image_y: clampedY };
                                            }
                                            return { ...p };
                                        });
                                        setData((prev) => ({
                                            ...prev,
                                            problem_solution: {
                                                ...prev.problem_solution,
                                                panels: updatedPanels,
                                            },
                                        }));
                                    } else {
                                        setData((prev) => ({
                                            ...prev,
                                            layout_schema: {
                                                ...(prev.layout_schema || {}),
                                                image_x: clampedX,
                                                image_y: clampedY,
                                            },
                                        }));
                                    }
                                };

                                return (
                                    <div className="mt-3 p-3.5 sm:p-4 rounded-xl bg-zinc-50/90 dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 space-y-3.5">
                                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-zinc-200/60 dark:border-zinc-800">
                                            <div className="flex items-center gap-2">
                                                <Sliders className="w-3.5 h-3.5 text-[#0AB600]" />
                                                <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wide">
                                                    Posisi &amp; Fokus Gambar
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[11px] font-mono font-semibold text-[#0AB600] px-2 py-0.5 rounded-md bg-[#0AB600]/10 border border-[#0AB600]/20">
                                                    X: {curX}% &bull; Y: {curY}%
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => updatePos(50, 50)}
                                                    className="px-2 py-1 rounded-lg text-[10px] font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                                                    title="Reset posisi foto ke tengah"
                                                >
                                                    <RotateCcw className="w-2.5 h-2.5" />
                                                    <span>Reset</span>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                                            {/* Interactive Visual Box */}
                                            <div className="md:col-span-4 flex flex-col items-center">
                                                <div 
                                                    className="w-full h-32 rounded-xl overflow-hidden border border-dashed border-[#0AB600]/50 relative bg-zinc-950 select-none cursor-crosshair group shadow-inner"
                                                    onClick={(e) => {
                                                        const rect = e.currentTarget.getBoundingClientRect();
                                                        const xPercent = Math.round(Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)));
                                                        const yPercent = Math.round(Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100)));
                                                        updatePos(xPercent, yPercent);
                                                    }}
                                                >
                                                    <img 
                                                        src={activeImgSrc} 
                                                        alt="Reposition Preview" 
                                                        className="w-full h-full object-cover transition-all pointer-events-none" 
                                                        style={{ objectPosition: `${curX}% ${curY}%` }}
                                                    />
                                                    <div 
                                                        className="absolute w-5 h-5 -ml-2.5 -mt-2.5 rounded-full border-2 border-white shadow-lg pointer-events-none flex items-center justify-center bg-[#0AB600]/90 ring-2 ring-black/40"
                                                        style={{ left: `${curX}%`, top: `${curY}%` }}
                                                    >
                                                        <div className="w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
                                                    </div>
                                                    <div className="absolute bottom-1 right-1.5 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-xs text-[9px] font-medium text-white pointer-events-none flex items-center gap-1">
                                                        <Crosshair className="w-2.5 h-2.5 text-[#0AB600]" />
                                                        <span>Klik / Geser</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Sliders & Preset Buttons */}
                                            <div className="md:col-span-8 space-y-3">
                                                {/* Vertical Slider */}
                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between text-xs">
                                                        <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-zinc-300">
                                                            <MoveVertical className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                                                            <span>Posisi Vertikal (Y)</span>
                                                        </div>
                                                        <span className="text-[11px] font-mono font-bold text-zinc-600 dark:text-zinc-400">{curY}%</span>
                                                    </div>
                                                    <input 
                                                        type="range" 
                                                        min="0" 
                                                        max="100" 
                                                        step="1"
                                                        value={curY}
                                                        onChange={(e) => updatePos(curX, Number(e.target.value))}
                                                        className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[#0AB600]"
                                                    />
                                                    <div className="flex justify-between text-[10px] text-zinc-400 font-medium">
                                                        <span>0% (Atas)</span>
                                                        <span>50% (Tengah)</span>
                                                        <span>100% (Bawah)</span>
                                                    </div>
                                                </div>

                                                {/* Horizontal Slider */}
                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between text-xs">
                                                        <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-zinc-300">
                                                            <MoveHorizontal className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                                                            <span>Posisi Horizontal (X)</span>
                                                        </div>
                                                        <span className="text-[11px] font-mono font-bold text-zinc-600 dark:text-zinc-400">{curX}%</span>
                                                    </div>
                                                    <input 
                                                        type="range" 
                                                        min="0" 
                                                        max="100" 
                                                        step="1"
                                                        value={curX}
                                                        onChange={(e) => updatePos(Number(e.target.value), curY)}
                                                        className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[#0AB600]"
                                                    />
                                                    <div className="flex justify-between text-[10px] text-zinc-400 font-medium">
                                                        <span>0% (Kiri)</span>
                                                        <span>50% (Tengah)</span>
                                                        <span>100% (Kanan)</span>
                                                    </div>
                                                </div>

                                                {/* Presets */}
                                                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                                    <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider mr-1">
                                                        Preset:
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => updatePos(curX, 15)}
                                                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                                                            curY <= 25 ? 'bg-[#0AB600] text-white border-[#0AB600] shadow-xs' : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-750'
                                                        }`}
                                                    >
                                                        <ArrowUp className="w-3 h-3" />
                                                        <span>Atas</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => updatePos(50, 50)}
                                                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                                                            curX === 50 && curY === 50 ? 'bg-[#0AB600] text-white border-[#0AB600] shadow-xs' : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-750'
                                                        }`}
                                                    >
                                                        <Crosshair className="w-3 h-3" />
                                                        <span>Tengah</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => updatePos(curX, 85)}
                                                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                                                            curY >= 75 ? 'bg-[#0AB600] text-white border-[#0AB600] shadow-xs' : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-750'
                                                        }`}
                                                    >
                                                        <ArrowDown className="w-3 h-3" />
                                                        <span>Bawah</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => updatePos(15, curY)}
                                                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                                                            curX <= 25 ? 'bg-[#0AB600] text-white border-[#0AB600] shadow-xs' : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-750'
                                                        }`}
                                                    >
                                                        <ArrowLeft className="w-3 h-3" />
                                                        <span>Kiri</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => updatePos(85, curY)}
                                                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                                                            curX >= 75 ? 'bg-[#0AB600] text-white border-[#0AB600] shadow-xs' : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-750'
                                                        }`}
                                                    >
                                                        <ArrowRight className="w-3 h-3" />
                                                        <span>Kanan</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>

                        {/* 4. Content Sections (Manfaat, Spesifikasi, Problem-Solution) */}
                        <div className="bg-white dark:bg-[#121824] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 sm:p-6 shadow-sm space-y-5">
                            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                                <div className="flex items-center gap-2">
                                    <span className="p-1 rounded-md bg-[#0AB600]/10 text-[#0AB600]">
                                        <Layers className="w-4 h-4" />
                                    </span>
                                    <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                        {data.doc_format === 'brochure_trifold'
                                            ? `4. Poin Riset & Konten Inovasi Kotak ${activeTrifoldTab + 1}`
                                            : (language === 'en' ? '4. Content Sections' : '4. Bagian Konten & Poin Riset')}
                                    </h2>
                                </div>

                                {/* Quick Action: Generate all 4 sections from description */}
                                <button
                                    type="button"
                                    onClick={() => handleGenerateOrPolishSection('all_sections', '')}
                                    disabled={polishingSection !== null || (data.doc_format === 'brochure_trifold' ? (!activePanel.description && !activePanel.title) : (!data.description && !data.name))}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0AB600]/10 hover:bg-[#0AB600]/15 dark:bg-[#0AB600]/10 dark:hover:bg-[#0AB600]/15 text-[#0AB600] border border-[#0AB600]/30 text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-40"
                                    title={data.doc_format === 'brochure_trifold' ? `Generate Problem, Solution, Manfaat, dan Spesifikasi Kotak ${activeTrifoldTab + 1} dari Deskripsi` : 'Generate Problem, Solution, Manfaat, dan Spesifikasi otomatis dari Deskripsi Proyek'}
                                >
                                    {polishingSection === 'all_sections' ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            <span>{language === 'en' ? 'Drafting All Sections...' : 'Menyusun Semua Bagian...'}</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-3.5 h-3.5 text-[#0AB600]" />
                                            <span>{language === 'en' ? 'Generate All Sections from Description' : (data.doc_format === 'brochure_trifold' ? `Generate Semua Bagian Kotak ${activeTrifoldTab + 1}` : 'Generate Semua Bagian dari Deskripsi')}</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Content Fields for Active Panel or Regular Flyer */}
                            {data.doc_format === 'brochure_trifold' ? (
                                <div className="space-y-4">
                                    {/* Problem - Solution Cards */}
                                    <div className="p-4 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800 space-y-3">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                                            <Lightbulb className="w-4 h-4 text-[#0AB600]" />
                                            <span>PROBLEM–SOLUTION KOTAK {activeTrifoldTab + 1}</span>
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                                                    Latar Belakang &amp; Rumusan Masalah :
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => handleGenerateOrPolishSection('problem', activePanel.problem)}
                                                    disabled={polishingSection === 'problem' || (!activePanel.description && !activePanel.title && !activePanel.problem)}
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0AB600]/10 hover:bg-[#0AB600]/15 text-[#0AB600] border border-[#0AB600]/30 text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-40"
                                                >
                                                    {polishingSection === 'problem' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-[#0AB600]" />}
                                                    <span>{activePanel.problem ? 'Poles AI' : 'Generate dari Deskripsi'}</span>
                                                </button>
                                            </div>
                                            <RichTextEditor
                                                value={activePanel.problem || ''}
                                                onChange={(val) => handleUpdatePanel(activeTrifoldTab, 'problem', val)}
                                                placeholder={`Jelaskan permasalahan atau latar belakang untuk Kotak ${activeTrifoldTab + 1}...`}
                                                minHeight="60px"
                                            />
                                            <TextLimitMeter value={activePanel.problem} limitKey="problem" preset={data.layout_preset} docFormat={data.doc_format} />
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                                                    Solusi Inovasi :
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => handleGenerateOrPolishSection('solution', activePanel.solution)}
                                                    disabled={polishingSection === 'solution' || (!activePanel.description && !activePanel.title && !activePanel.solution)}
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0AB600]/10 hover:bg-[#0AB600]/15 text-[#0AB600] border border-[#0AB600]/30 text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-40"
                                                >
                                                    {polishingSection === 'solution' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-[#0AB600]" />}
                                                    <span>{activePanel.solution ? 'Poles AI' : 'Generate dari Deskripsi'}</span>
                                                </button>
                                            </div>
                                            <RichTextEditor
                                                value={activePanel.solution || ''}
                                                onChange={(val) => handleUpdatePanel(activeTrifoldTab, 'solution', val)}
                                                placeholder={`Jelaskan solusi teknologi yang diterapkan pada Kotak ${activeTrifoldTab + 1}...`}
                                                minHeight="60px"
                                            />
                                            <TextLimitMeter value={activePanel.solution} limitKey="solution" preset={data.layout_preset} docFormat={data.doc_format} />
                                        </div>
                                    </div>

                                    {/* Benefits */}
                                    <div className="p-4 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                                                <CheckCircle2 className="w-4 h-4 text-[#0AB600]" />
                                                <span>MANFAAT &amp; KEUNGGULAN KOTAK {activeTrifoldTab + 1}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleGenerateOrPolishSection('benefits', activePanel.benefits)}
                                                disabled={polishingSection === 'benefits' || (!activePanel.description && !activePanel.title && !activePanel.benefits)}
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0AB600]/10 hover:bg-[#0AB600]/15 text-[#0AB600] border border-[#0AB600]/30 text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-40"
                                            >
                                                {polishingSection === 'benefits' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-[#0AB600]" />}
                                                <span>{activePanel.benefits ? 'Poles AI' : 'Generate dari Deskripsi'}</span>
                                            </button>
                                        </div>
                                        <RichTextEditor
                                            value={activePanel.benefits || ''}
                                            onChange={(val) => handleUpdatePanel(activeTrifoldTab, 'benefits', val)}
                                            placeholder={`Poin-poin manfaat / keunggulan Kotak ${activeTrifoldTab + 1}...`}
                                            minHeight="70px"
                                        />
                                        <TextLimitMeter value={activePanel.benefits} limitKey="benefits" preset={data.layout_preset} docFormat={data.doc_format} />
                                    </div>

                                    {/* Specifications */}
                                    <div className="p-4 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                                                <Wrench className="w-4 h-4 text-[#0AB600]" />
                                                <span>SPESIFIKASI TEKNIS KOTAK {activeTrifoldTab + 1}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleGenerateOrPolishSection('specifications', activePanel.specifications)}
                                                disabled={polishingSection === 'specifications' || (!activePanel.description && !activePanel.title && !activePanel.specifications)}
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0AB600]/10 hover:bg-[#0AB600]/15 text-[#0AB600] border border-[#0AB600]/30 text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-40"
                                            >
                                                {polishingSection === 'specifications' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-[#0AB600]" />}
                                                <span>{activePanel.specifications ? 'Poles AI' : 'Generate dari Deskripsi'}</span>
                                            </button>
                                        </div>
                                        <RichTextEditor
                                            value={activePanel.specifications || activePanel.specs || ''}
                                            onChange={(val) => handleUpdatePanel(activeTrifoldTab, 'specifications', val)}
                                            placeholder={`Daftar spesifikasi hardware / sensor / modul Kotak ${activeTrifoldTab + 1}...`}
                                            minHeight="70px"
                                        />
                                        <TextLimitMeter value={activePanel.specifications} limitKey="specifications" preset={data.layout_preset} docFormat={data.doc_format} />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Section A: Manfaat */}
                                    <div className="p-4 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                                                <CheckCircle2 className="w-4 h-4 text-[#0AB600]" />
                                                <span>{language === 'en' ? 'BENEFITS' : 'MANFAAT'}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleGenerateOrPolishSection('benefits', data.benefits?.content)}
                                                disabled={polishingSection === 'benefits' || (!data.description && !data.name && !data.benefits?.content)}
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0AB600]/10 hover:bg-[#0AB600]/15 dark:bg-[#0AB600]/10 dark:hover:bg-[#0AB600]/15 text-[#0AB600] border border-[#0AB600]/30 text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-40"
                                                title={data.benefits?.content ? (language === 'en' ? 'Polish benefits with AI' : 'Poles poin manfaat dengan AI') : (language === 'en' ? 'Generate benefits from description' : 'Generate poin manfaat otomatis dari deskripsi proyek')}
                                            >
                                                {polishingSection === 'benefits' ? (
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                ) : (
                                                    <Sparkles className="w-3 h-3 text-[#0AB600]" />
                                                )}
                                                <span>{data.benefits?.content ? (pf.aiPolishWithAI || 'Poles AI') : (language === 'en' ? 'Draft from Description' : 'Generate dari Deskripsi')}</span>
                                            </button>
                                        </div>
                                        <RichTextEditor
                                            value={data.benefits?.content || ''}
                                            onChange={(val) =>
                                                setData('benefits', {
                                                    ...data.benefits,
                                                    title: 'MANFAAT',
                                                    content: val,
                                                })
                                            }
                                            placeholder={pf.benefitsPlaceholder || (language === 'en' ? 'Write value proposition and applied impact points...' : 'Tuliskan poin-poin manfaat penerapan dan dampak riset inovasi...')}
                                            minHeight="70px"
                                        />
                                        <TextLimitMeter value={data.benefits?.content} limitKey="benefits" preset={data.layout_preset} docFormat={data.doc_format} />
                                    </div>

                                    {/* Section B: Spesifikasi */}
                                    <div className="p-4 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                                                <Wrench className="w-4 h-4 text-[#0AB600]" />
                                                <span>{language === 'en' ? 'SPECIFICATIONS' : 'SPESIFIKASI'}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleGenerateOrPolishSection('specifications', data.specifications?.content)}
                                                disabled={polishingSection === 'specifications' || (!data.description && !data.name && !data.specifications?.content)}
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0AB600]/10 hover:bg-[#0AB600]/15 dark:bg-[#0AB600]/10 dark:hover:bg-[#0AB600]/15 text-[#0AB600] border border-[#0AB600]/30 text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-40"
                                                title={data.specifications?.content ? (language === 'en' ? 'Polish specs with AI' : 'Poles spesifikasi teknis dengan AI') : (language === 'en' ? 'Generate specs from description' : 'Generate spesifikasi teknis otomatis dari deskripsi proyek')}
                                            >
                                                {polishingSection === 'specifications' ? (
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                ) : (
                                                    <Sparkles className="w-3 h-3 text-[#0AB600]" />
                                                )}
                                                <span>{data.specifications?.content ? (pf.aiPolishWithAI || 'Poles AI') : (language === 'en' ? 'Draft from Description' : 'Generate dari Deskripsi')}</span>
                                            </button>
                                        </div>
                                        <RichTextEditor
                                            value={data.specifications?.content || ''}
                                            onChange={(val) =>
                                                setData('specifications', {
                                                    ...data.specifications,
                                                    title: 'SPESIFIKASI',
                                                    content: val,
                                                })
                                            }
                                            placeholder={pf.specsPlaceholder || (language === 'en' ? 'List hardware specs, sensors, modules, or system components...' : 'Tuliskan spesifikasi teknologi, sensor, modul hardware, atau komponen sistem...')}
                                            minHeight="70px"
                                        />
                                        <TextLimitMeter value={data.specifications?.content} limitKey="specifications" preset={data.layout_preset} docFormat={data.doc_format} />
                                    </div>

                                    {/* Section C: Problem - Solution */}
                                    <div className="p-4 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800 space-y-3">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                                            <Lightbulb className="w-4 h-4 text-[#0AB600]" />
                                            <span>PROBLEM–SOLUTION</span>
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                                                    {language === 'en' ? 'Problem :' : 'Problem :'}
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => handleGenerateOrPolishSection('problem', data.problem_solution?.problem)}
                                                    disabled={polishingSection === 'problem' || (!data.description && !data.name && !data.problem_solution?.problem)}
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0AB600]/10 hover:bg-[#0AB600]/15 dark:bg-[#0AB600]/10 dark:hover:bg-[#0AB600]/15 text-[#0AB600] border border-[#0AB600]/30 text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-40"
                                                    title={data.problem_solution?.problem ? (language === 'en' ? 'Polish problem statement with AI' : 'Poles rumusan masalah dengan AI') : (language === 'en' ? 'Generate problem statement from description' : 'Generate rumusan problem otomatis dari deskripsi proyek')}
                                                >
                                                    {polishingSection === 'problem' ? (
                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                    ) : (
                                                        <Sparkles className="w-3 h-3 text-[#0AB600]" />
                                                    )}
                                                    <span>{data.problem_solution?.problem ? (pf.aiPolishWithAI || 'Poles AI') : (language === 'en' ? 'Draft from Description' : 'Generate dari Deskripsi')}</span>
                                                </button>
                                            </div>
                                            <RichTextEditor
                                                value={data.problem_solution?.problem || ''}
                                                onChange={(val) =>
                                                    setData('problem_solution', {
                                                        ...data.problem_solution,
                                                        title: 'PROBLEM–SOLUTION',
                                                        problem: val,
                                                    })
                                                }
                                                placeholder={pf.problemPlaceholder || (language === 'en' ? 'Describe the real-world pain point or baseline challenge faced in the field...' : 'Jelaskan permasalahan, tantangan, atau kendala utama yang dihadapi di lapangan...')}
                                                minHeight="60px"
                                            />
                                            <TextLimitMeter value={data.problem_solution?.problem} limitKey="problem" preset={data.layout_preset} docFormat={data.doc_format} />
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                                                    {language === 'en' ? 'Solution :' : 'Solution :'}
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={() => handleGenerateOrPolishSection('solution', data.problem_solution?.solution)}
                                                    disabled={polishingSection === 'solution' || (!data.description && !data.name && !data.problem_solution?.solution)}
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0AB600]/10 hover:bg-[#0AB600]/15 dark:bg-[#0AB600]/10 dark:hover:bg-[#0AB600]/15 text-[#0AB600] border border-[#0AB600]/30 text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-40"
                                                    title={data.problem_solution?.solution ? (language === 'en' ? 'Polish solution with AI' : 'Poles solusi inovatif dengan AI') : (language === 'en' ? 'Generate solution description from project' : 'Generate penjelasan solusi otomatis dari deskripsi proyek')}
                                                >
                                                    {polishingSection === 'solution' ? (
                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                    ) : (
                                                        <Sparkles className="w-3 h-3 text-[#0AB600]" />
                                                    )}
                                                    <span>{data.problem_solution?.solution ? (pf.aiPolishWithAI || 'Poles AI') : (language === 'en' ? 'Draft from Description' : 'Generate dari Deskripsi')}</span>
                                                </button>
                                            </div>
                                            <RichTextEditor
                                                value={data.problem_solution?.solution || ''}
                                                onChange={(val) =>
                                                    setData('problem_solution', {
                                                        ...data.problem_solution,
                                                        title: 'PROBLEM–SOLUTION',
                                                        solution: val,
                                                    })
                                                }
                                                placeholder={pf.solutionPlaceholder || (language === 'en' ? 'Describe the engineered solution and innovative methods applied...' : 'Jelaskan solusi teknologi dan metode inovatif yang diterapkan untuk menyelesaikan masalah...')}
                                                minHeight="60px"
                                            />
                                            <TextLimitMeter value={data.problem_solution?.solution} limitKey="solution" preset={data.layout_preset} docFormat={data.doc_format} />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* 5. Tim Peneliti, Authorship & Publikasi Ilmiah */}
                        <div className="bg-white dark:bg-[#121824] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 sm:p-6 shadow-sm space-y-5">
                            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                                <div className="flex items-center gap-2">
                                    <span className="p-1 rounded-md bg-[#0AB600]/10 text-[#0AB600]">
                                        <Users className="w-4 h-4" />
                                    </span>
                                    <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                        {language === 'en' ? '5. Research Team, Authorship & IP' : '5. Tim Peneliti, Atribusi & HKI Riset'}
                                    </h2>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#0AB600]/15 text-[#0AB600] dark:bg-[#0AB600]/10">
                                        {Array.isArray(data.research_team) ? data.research_team.length : 0} {language === 'en' ? 'Members' : 'Peneliti Terpilih'}
                                    </span>
                                    <a
                                        href="/researchers"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#0AB600] bg-[#0AB600]/10 hover:bg-[#0AB600]/20 border border-[#0AB600]/30 transition-colors"
                                        title="Buka menu direktori di tab baru untuk menambah atau memperbarui profil peneliti master"
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                        <span>Kelola Direktori</span>
                                    </a>
                                </div>
                            </div>

                            {/* Notice / Guidance Banner */}
                            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/60 text-xs">
                                <GraduationCap className="w-4 h-4 text-[#0AB600] shrink-0 mt-0.5" />
                                <div className="space-y-1 text-slate-700 dark:text-zinc-300">
                                    <p className="font-semibold text-slate-900 dark:text-white">
                                        {language === 'en'
                                            ? 'Centralized Master Researcher Directory'
                                            : 'Master Data Peneliti & Authors Terpusat'}
                                    </p>
                                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                        {language === 'en'
                                            ? 'Profiles (Name, NIDN, Lab, SINTA/Scholar/Scopus links, and Photo) are managed in the Master Directory to maintain data standardization. In this project form, please pull and select researchers from the Directory.'
                                            : 'Profil peneliti (Nama, NIDN/NIP, Afiliasi Lab, Sitasi SINTA/Scholar/Scopus, dan Foto) dikelola terpusat di menu Direktori Peneliti & Authors. Pada form proyek ini, silakan tarik data peneliti langsung dari direktori master.'}
                                    </p>
                                </div>
                            </div>

                            {/* Project-Level IP & Lab Affiliation Card */}
                            <div className="p-4 rounded-xl border border-zinc-200/90 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60 space-y-3.5">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-zinc-100">
                                    <Award className="w-4 h-4 text-[#0AB600]" />
                                    <span>{language === 'en' ? 'Project Affiliation & Intellectual Property (HKI)' : 'Afiliasi Laboratorium & Hak Kekayaan Intelektual (HKI) Proyek'}</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {/* Lab Affiliation */}
                                    <div>
                                        <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1 flex items-center gap-1.5">
                                            <Building2 className="w-3.5 h-3.5 text-[#0AB600]" />
                                            <span>{language === 'en' ? 'Lab / Research Center Affiliation' : 'Afiliasi Laboratorium Riset'}</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.lab_affiliation || ''}
                                            onChange={(e) => setData('lab_affiliation', e.target.value)}
                                            placeholder="contoh: Center of Excellence STAS-RG"
                                            className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-slate-800 dark:text-zinc-100 focus:ring-1 focus:ring-[#0AB600] focus:border-[#0AB600]"
                                        />
                                    </div>

                                    {/* Patent / HKI Number */}
                                    <div>
                                        <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1 flex items-center gap-1.5">
                                            <ShieldCheck className="w-3.5 h-3.5 text-[#0AB600]" />
                                            <span>{language === 'en' ? 'Patent / HKI Registration No.' : 'Nomor / Sertifikat HKI'}</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.patent_number || ''}
                                            onChange={(e) => setData('patent_number', e.target.value)}
                                            placeholder="contoh: IDS000001234 atau EC002024..."
                                            className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-slate-800 dark:text-zinc-100 focus:ring-1 focus:ring-[#0AB600] focus:border-[#0AB600]"
                                        />
                                    </div>

                                    {/* Scientific Publication / DOI */}
                                    <div>
                                        <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1 flex items-center gap-1.5">
                                            <BookOpen className="w-3.5 h-3.5 text-[#0AB600]" />
                                            <span>{language === 'en' ? 'Publication / DOI Link' : 'Publikasi / DOI Riset'}</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.publication_doi || ''}
                                            onChange={(e) => setData('publication_doi', e.target.value)}
                                            placeholder="contoh: 10.1109/ACCESS.2024... atau https://doi.org/..."
                                            className="w-full px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-slate-800 dark:text-zinc-100 focus:ring-1 focus:ring-[#0AB600] focus:border-[#0AB600]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Team Member Cards */}
                            <div className="space-y-3 pt-1">
                                {Array.isArray(data.research_team) && data.research_team.length > 0 ? (
                                    <div className="space-y-3">
                                        {data.research_team.map((member, idx) => (
                                            <div
                                                key={idx}
                                                className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-xs hover:border-[#0AB600]/40 transition-all space-y-3.5"
                                            >
                                                {/* Header: Avatar, Name, Role in Project, Actions */}
                                                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <span className="w-6 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-bold flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-700">
                                                            #{idx + 1}
                                                        </span>
                                                        <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 border-2 border-[#0AB600]/30 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                                            {member.avatar_preview || member.avatar ? (
                                                                <img
                                                                    src={member.avatar_preview || (typeof member.avatar === 'string' && member.avatar.startsWith('http') ? member.avatar : `/storage/${member.avatar}`)}
                                                                    alt={member.name || 'Avatar'}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                                />
                                                            ) : (
                                                                <span className="text-xs font-bold text-zinc-400 uppercase">
                                                                    {member.name ? member.name.substring(0, 2) : 'ST'}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                                                {member.name || (language === 'en' ? `Researcher #${idx + 1}` : `Peneliti #${idx + 1}`)}
                                                            </h4>
                                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">
                                                                    <CheckCircle2 className="w-2.5 h-2.5" />
                                                                    <span>Terhubung dari Direktori</span>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Project Role Selector & Action Buttons */}
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex items-center gap-1.5">
                                                            <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 hidden sm:block">
                                                                Peran di Proyek:
                                                            </label>
                                                            <select
                                                                value={member.role || 'Anggota Peneliti'}
                                                                onChange={(e) => handleUpdateTeamMember(idx, 'role', e.target.value)}
                                                                className="px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-medium text-slate-800 dark:text-zinc-100 focus:ring-1 focus:ring-[#0AB600] focus:border-[#0AB600] cursor-pointer"
                                                            >
                                                                <option value="Principal Investigator / Ketua Peneliti">Ketua Peneliti (PI)</option>
                                                                <option value="Dosen Peneliti / Pembimbing">Dosen / Pembimbing</option>
                                                                <option value="Anggota Peneliti">Anggota Peneliti</option>
                                                                <option value="Mahasiswa Peneliti / Asisten Riset">Mahasiswa / Asisten</option>
                                                                <option value="Teknisi / Engineer Riset">Teknisi / Engineer</option>
                                                                <option value="Mitra Kolaborator Eksternal">Mitra Kolaborator</option>
                                                            </select>
                                                        </div>

                                                        <div className="flex items-center gap-1 pl-2 border-l border-zinc-200 dark:border-zinc-800">
                                                            {idx > 0 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleMoveTeamMember(idx, 'up')}
                                                                    title="Geser ke atas"
                                                                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                                                >
                                                                    <ChevronUp className="w-3.5 h-3.5" />
                                                                </button>
                                                            )}
                                                            {idx < data.research_team.length - 1 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleMoveTeamMember(idx, 'down')}
                                                                    title="Geser ke bawah"
                                                                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                                                >
                                                                    <ChevronDown className="w-3.5 h-3.5" />
                                                                </button>
                                                            )}
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveTeamMember(idx)}
                                                                title="Hapus dari tim proyek"
                                                                className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Read-Only Details Grid */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
                                                    {member.identifier && (
                                                        <div className="flex items-center gap-1.5 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300">
                                                            <span className="font-bold text-[10px] text-zinc-400 uppercase">ID:</span>
                                                            <span className="font-mono text-[11px] truncate">{member.identifier}</span>
                                                        </div>
                                                    )}

                                                    {member.lab_affiliation && (
                                                        <div className="flex items-center gap-1.5 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 truncate">
                                                            <Building2 className="w-3.5 h-3.5 text-[#0AB600] shrink-0" />
                                                            <span className="text-[11px] truncate">{member.lab_affiliation}</span>
                                                        </div>
                                                    )}

                                                    {member.email && (
                                                        <div className="flex items-center gap-1.5 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 truncate">
                                                            <Mail className="w-3.5 h-3.5 text-[#0AB600] shrink-0" />
                                                            <span className="text-[11px] truncate">{member.email}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Academic Citation Links Badges */}
                                                {(member.scholar_url || member.scopus_url || member.sinta_url || member.orcid_url || member.linkedin_url) && (
                                                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                                        {member.scholar_url && (
                                                            <a
                                                                href={member.scholar_url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 text-[10px] font-semibold hover:bg-blue-100 transition-colors"
                                                            >
                                                                <span>Google Scholar</span>
                                                                <ExternalLink className="w-2.5 h-2.5" />
                                                            </a>
                                                        )}
                                                        {member.scopus_url && (
                                                            <a
                                                                href={member.scopus_url.startsWith('http') ? member.scopus_url : `https://www.scopus.com/authid/detail.uri?authorId=${member.scopus_url}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 text-[10px] font-semibold hover:bg-amber-100 transition-colors"
                                                            >
                                                                <span>Scopus</span>
                                                                <ExternalLink className="w-2.5 h-2.5" />
                                                            </a>
                                                        )}
                                                        {member.sinta_url && (
                                                            <a
                                                                href={member.sinta_url.startsWith('http') ? member.sinta_url : `https://sinta.kemdikbud.go.id/authors/profile/${member.sinta_url}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-[10px] font-semibold hover:bg-emerald-100 transition-colors"
                                                            >
                                                                <span>SINTA</span>
                                                                <ExternalLink className="w-2.5 h-2.5" />
                                                            </a>
                                                        )}
                                                        {member.orcid_url && (
                                                            <a
                                                                href={member.orcid_url.startsWith('http') ? member.orcid_url : `https://orcid.org/${member.orcid_url}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-lime-50 dark:bg-lime-950/50 text-lime-700 dark:text-lime-400 text-[10px] font-semibold hover:bg-lime-100 transition-colors"
                                                            >
                                                                <span>ORCID</span>
                                                                <ExternalLink className="w-2.5 h-2.5" />
                                                            </a>
                                                        )}
                                                        {member.linkedin_url && (
                                                            <a
                                                                href={member.linkedin_url.startsWith('http') ? member.linkedin_url : `https://linkedin.com/in/${member.linkedin_url}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-400 text-[10px] font-semibold hover:bg-sky-100 transition-colors"
                                                            >
                                                                <span>LinkedIn</span>
                                                                <ExternalLink className="w-2.5 h-2.5" />
                                                            </a>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-dashed border-zinc-300 dark:border-zinc-800 text-center justify-center flex-col py-8">
                                        <img
                                            src="/assets/img/icon/notfound.png"
                                            alt="Belum Ada Peneliti Dipilih"
                                            className="w-24 sm:w-28 h-auto object-contain mx-auto mb-1 drop-shadow-xs"
                                        />
                                        <div className="space-y-1 max-w-md">
                                            <div className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                                                {language === 'en' ? 'No Team Members Selected' : 'Belum Ada Peneliti Dipilih'}
                                            </div>
                                            <div className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                                {language === 'en'
                                                    ? 'Select researchers directly from the master directory to include their profiles on this flyer.'
                                                    : 'Tarik data peneliti langsung dari master Direktori Peneliti & Authors untuk ditampilkan pada flyer riset ini.'}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setIsResearcherPickerOpen(true)}
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0AB600] hover:bg-[#089600] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                                        >
                                            <Plus className="w-4 h-4" />
                                            <span>{language === 'en' ? 'Pick from Researcher Directory' : 'Pilih dari Direktori Peneliti'}</span>
                                        </button>
                                    </div>
                                )}

                                {/* Action Buttons: Pick from Directory & Manage Master Directory */}
                                <div className="flex flex-wrap items-center gap-2.5 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsResearcherPickerOpen(true)}
                                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0AB600] hover:bg-[#089600] text-white text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-sm"
                                    >
                                        <GraduationCap className="w-4 h-4" />
                                        <span>{language === 'en' ? 'Pick from Researcher Directory' : 'Pilih dari Direktori Peneliti'}</span>
                                    </button>

                                    <a
                                        href="/researchers"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-semibold transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-700"
                                    >
                                        <ExternalLink className="w-3.5 h-3.5 text-[#0AB600]" />
                                        <span>{language === 'en' ? 'Manage Master Directory' : 'Kelola Direktori Peneliti'}</span>
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* 6. URL & QR Code + Footer Info */}
                        <div className="bg-white dark:bg-[#121824] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 sm:p-6 shadow-sm space-y-4">
                            <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                                <span className="p-1 rounded-md bg-[#0AB600]/10 text-[#0AB600]">
                                    <QrCode className="w-4 h-4" />
                                </span>
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                    {data.doc_format === 'brochure_trifold'
                                        ? `6. QR Code Kotak ${activeTrifoldTab + 1} & Footer Brosur`
                                        : (language === 'en' ? '6. QR Code & External Links' : '6. QR Code & Tautan Eksternal')}
                                </h2>
                            </div>

                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                {data.doc_format === 'brochure_trifold'
                                    ? `Tautan QR code khusus untuk Kotak ${activeTrifoldTab + 1} (${activeTrifoldTab === 0 ? 'Panel Kiri' : activeTrifoldTab === 1 ? 'Panel Tengah' : 'Panel Kanan'}). Pembaca dapat memindai langsung pada lipatan ini.`
                                    : (language === 'en' 
                                        ? 'A dynamic QR code is generated on the bottom-right of the flyer to direct readers directly to demo videos, research publications, or landing pages.' 
                                        : 'QR code akan dibuat secara otomatis di bagian pojok kanan bawah flyer untuk mengarahkan pembaca langsung ke video demo YouTube, publikasi paper riset, atau URL web landing.')}
                            </p>

                            <div className="space-y-4 pt-1">
                                {data.doc_format === 'brochure_trifold' ? (
                                    (() => {
                                        const calculatedSlug = project?.slug || (data.name ? data.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : 'proyek-riset');
                                        const originUrl = typeof window !== 'undefined' ? window.location.origin : '';
                                        const showcaseUrl = `${originUrl}/showcase/${calculatedSlug}`;
                                        const panelUrl = activePanel.project_url || '';
                                        const isShowcaseUrl = panelUrl === showcaseUrl;
                                        const isAutoDefault = !panelUrl;
                                        const effectiveQrUrl = panelUrl || showcaseUrl;

                                        return (
                                            <div className="space-y-3">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                                                        Tautan QR Code Kotak {activeTrifoldTab + 1} ({activeTrifoldTab === 0 ? 'Panel Kiri' : activeTrifoldTab === 1 ? 'Panel Tengah' : 'Panel Kanan'})
                                                    </label>

                                                    {/* Quick Presets for Trifold Active Box */}
                                                    <div className="flex flex-wrap items-center gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                handleUpdatePanel(activeTrifoldTab, 'project_url', showcaseUrl);
                                                                showSuccess(
                                                                    language === 'en' ? 'Showcase Link Applied' : 'Link Showcase Terpasang', 
                                                                    `QR Code Kotak ${activeTrifoldTab + 1} diarahkan ke halaman showcase riset.`
                                                                );
                                                            }}
                                                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                                                                isShowcaseUrl
                                                                    ? 'bg-[#0AB600] text-white border-[#0AB600] shadow-xs'
                                                                    : 'bg-[#0AB600]/10 hover:bg-[#0AB600]/15 text-[#0AB600] border-[#0AB600]/30'
                                                            }`}
                                                            title={`Otomatis hubungkan QR Kotak ${activeTrifoldTab + 1} ke halaman showcase: ${showcaseUrl}`}
                                                        >
                                                            <Link2 className="w-3.5 h-3.5" />
                                                            <span>Link Showcase</span>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => handleUpdatePanel(activeTrifoldTab, 'project_url', 'https://www.stas-rg.com')}
                                                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[10.5px] font-medium border border-zinc-200 dark:border-zinc-700 cursor-pointer transition-all"
                                                        >
                                                            <Globe className="w-3 h-3 text-[#0AB600]" />
                                                            <span>Web STAS-RG</span>
                                                        </button>

                                                        {panelUrl && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleUpdatePanel(activeTrifoldTab, 'project_url', '')}
                                                                className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-all"
                                                                title="Kosongkan tautan (kembali ke default showcase)"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Input Bar */}
                                                <div className="relative">
                                                    <input
                                                        type="url"
                                                        value={panelUrl}
                                                        onChange={(e) => handleUpdatePanel(activeTrifoldTab, 'project_url', e.target.value)}
                                                        placeholder={`Contoh: ${showcaseUrl} atau tautan YouTube demo riset Kotak ${activeTrifoldTab + 1}`}
                                                        className="w-full px-3 py-2 text-xs font-mono bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:border-[#0AB600] focus:outline-none pr-8"
                                                    />
                                                    <QrCode className="w-4 h-4 text-zinc-400 absolute right-3 top-2.5" />
                                                </div>

                                                {/* Contextual Status Card with QR Preview */}
                                                <div className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 transition-all ${
                                                    isAutoDefault || isShowcaseUrl
                                                        ? 'bg-[#0AB600]/10 border-[#0AB600]/30 text-[#0AB600] dark:text-emerald-300'
                                                        : 'bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
                                                }`}>
                                                    <div className="space-y-1 min-w-0 flex-1">
                                                        <div className="flex flex-wrap items-center gap-1.5 font-bold">
                                                            <span>Status QR Code Kotak {activeTrifoldTab + 1}:</span>
                                                            {isAutoDefault ? (
                                                                <span className="px-2 py-0.2 rounded-md bg-[#0AB600]/15 dark:bg-[#0AB600]/15 text-[#0AB600] text-[10px] font-extrabold uppercase">
                                                                    Otomatis ke Showcase Riset
                                                                </span>
                                                            ) : isShowcaseUrl ? (
                                                                <span className="px-2 py-0.2 rounded-md bg-[#0AB600] text-white text-[10px] font-extrabold uppercase">
                                                                    Terhubung ke Showcase
                                                                </span>
                                                            ) : (
                                                                <span className="px-2 py-0.2 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[10px] font-extrabold uppercase">
                                                                    Tautan Eksternal Kustom
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-[11px] leading-relaxed break-all">
                                                            QR code pada lipatan Kotak {activeTrifoldTab + 1} akan memindai ke:{' '}
                                                            <strong className="font-mono text-[#0AB600] underline">{effectiveQrUrl}</strong>
                                                        </p>
                                                    </div>

                                                    <div className="p-1 bg-white rounded-lg border border-zinc-200 shadow-2xs shrink-0">
                                                        <QRCodeSVG value={effectiveQrUrl} size={42} level="M" fgColor="#0AB600" />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()
                                ) : (
                                    <div>
                                        {/* Calculated Slug & Showcase URL */}
                                        {(() => {
                                            const calculatedSlug = project?.slug || (data.name ? data.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : 'proyek-riset');
                                            const originUrl = typeof window !== 'undefined' ? window.location.origin : '';
                                            const showcaseUrl = `${originUrl}/showcase/${calculatedSlug}`;
                                            const isShowcaseUrl = data.project_url === showcaseUrl;
                                            const isAutoDefault = !data.project_url;

                                            return (
                                                <div className="space-y-2">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                        <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                                                            {pf.qrUrlLabel || (language === 'en' ? 'QR Code Link' : 'Tautan QR Code')}
                                                        </label>

                                                        {/* Quick Auto-fill Presets */}
                                                        <div className="flex flex-wrap items-center gap-1.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setData('project_url', showcaseUrl);
                                                                    showSuccess(language === 'en' ? 'Showcase Link Applied' : 'Link Showcase Terpasang', `${language === 'en' ? 'QR Code now set to:' : 'QR Code sekarang diatur ke:'} ${showcaseUrl}`);
                                                                }}
                                                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                                                                    isShowcaseUrl
                                                                        ? 'bg-[#0AB600] text-white border-[#0AB600] shadow-xs'
                                                                        : 'bg-[#0AB600]/10 hover:bg-[#0AB600]/15 dark:hover:bg-[#0AB600]/15 text-[#0AB600] border-[#0AB600]/30'
                                                                }`}
                                                                title={`${language === 'en' ? 'Auto-fill link to project showcase page:' : 'Otomatis isi link ke halaman showcase:'} ${showcaseUrl}`}
                                                            >
                                                                <Link2 className="w-3.5 h-3.5" />
                                                                <span>{pf.useShowcaseLink || 'Link Showcase'}</span>
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() => setData('project_url', 'https://www.stas-rg.com')}
                                                                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[10.5px] font-medium border border-zinc-200 dark:border-zinc-700 transition-all cursor-pointer"
                                                                title={language === 'en' ? 'Fill link with official CoE STAS-RG website' : 'Isi link ke website resmi CoE STAS-RG'}
                                                            >
                                                                <Globe className="w-3 h-3 text-[#0AB600]" />
                                                                <span>{language === 'en' ? 'STAS-RG Web' : 'Web STAS-RG'}</span>
                                                            </button>

                                                            {data.project_url && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setData('project_url', '')}
                                                                    className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-900 transition-all cursor-pointer"
                                                                    title={language === 'en' ? 'Clear link (revert to automatic showcase mode)' : 'Kosongkan tautan (kembali ke mode otomatis showcase)'}
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Input Bar */}
                                                    <div className="relative">
                                                        <input
                                                            type="url"
                                                            value={data.project_url}
                                                            onChange={(e) => setData('project_url', e.target.value)}
                                                            placeholder={pf.qrUrlPlaceholder || 'https://youtu.be/... atau https://telkomuniversity.ac.id'}
                                                            className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:border-[#0AB600] focus:outline-none pr-8 font-mono"
                                                        />
                                                        <QrCode className="w-4 h-4 text-zinc-400 absolute right-3 top-2.5" />
                                                    </div>

                                                    {/* Dynamic Contextual Helper Card */}
                                                    <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 transition-all ${
                                                        isAutoDefault
                                                            ? 'bg-[#0AB600]/10 border-[#0AB600]/30 text-[#0AB600]'
                                                            : isShowcaseUrl
                                                            ? 'bg-[#0AB600]/10 border-[#0AB600]/30 dark:border-[#0AB600]/40 text-[#0AB600] dark:text-white'
                                                            : 'bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
                                                    }`}>
                                                        <QrCode className={`w-4 h-4 shrink-0 mt-0.5 ${
                                                            isAutoDefault || isShowcaseUrl ? 'text-[#0AB600]' : 'text-zinc-500'
                                                        }`} />
                                                        <div className="space-y-1 min-w-0 flex-1">
                                                            <div className="flex flex-wrap items-center gap-1.5 font-bold">
                                                                <span>{language === 'en' ? 'QR Code Target Status:' : 'Status Target QR Code:'}</span>
                                                                {isAutoDefault ? (
                                                                    <span className="px-2 py-0.2 rounded-md bg-[#0AB600]/15 dark:bg-[#0AB600]/15 text-[#0AB600] text-[10px] font-extrabold uppercase">
                                                                        {language === 'en' ? 'Automatic to Showcase Page' : 'Otomatis ke Halaman Showcase'}
                                                                    </span>
                                                                ) : isShowcaseUrl ? (
                                                                    <span className="px-2 py-0.2 rounded-md bg-[#0AB600] text-white text-[10px] font-extrabold uppercase">
                                                                        {language === 'en' ? 'Connected to Showcase' : 'Terhubung ke Showcase'}
                                                                    </span>
                                                                ) : (
                                                                    <span className="px-2 py-0.2 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[10px] font-extrabold uppercase">
                                                                        {language === 'en' ? 'Custom External Link' : 'Tautan Eksternal Kustom'}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <p className="text-[11px] leading-relaxed break-all">
                                                                {isAutoDefault ? (
                                                                    <span>
                                                                        {language === 'en' 
                                                                            ? 'The QR code on the flyer will automatically direct readers to this public showcase page: ' 
                                                                            : 'QR code pada flyer akan otomatis mengarah ke halaman showcase publik riset ini: '}
                                                                        <strong className="font-mono text-[#0AB600] underline">{showcaseUrl}</strong>
                                                                    </span>
                                                                ) : (
                                                                    <span>
                                                                        {language === 'en' 
                                                                            ? 'The QR code on the flyer is currently locked to: ' 
                                                                            : 'QR code pada flyer saat ini dikunci mengarah ke: '}
                                                                        <strong className="font-mono text-[#0AB600] underline">{data.project_url}</strong>
                                                                    </span>
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {errors.project_url && <p className="text-rose-500 text-[11px] mt-1">{errors.project_url}</p>}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                )}

                                {/* Footer Social & Contact Channels Manager */}
                                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-start lg:items-center justify-between gap-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <label className="block text-xs font-bold text-slate-900 dark:text-white">
                                                    {pf.footerSocialTitle || 'Informasi Footer & Saluran Media Sosial'}
                                                </label>
                                            </div>
                                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                                                {pf.footerSocialDesc || 'Pilih platform media sosial / kontak resmi lab. Ikon akan muncul secara otomatis pada footer flyer tanpa perlu upload icon.'}
                                            </p>
                                        </div>

                                        {/* Presets & Actions (Rata Kanan) */}
                                        <div className="flex flex-wrap items-center justify-end gap-1.5 shrink-0 self-end sm:self-auto">
                                            <button
                                                type="button"
                                                onClick={handleResetSocialLinks}
                                                className="px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[10.5px] font-medium border border-zinc-200 dark:border-zinc-700 transition-all cursor-pointer"
                                                title={language === 'en' ? 'Revert to 3 standard social channels (Web, IG, YT)' : 'Kembalikan ke 3 media sosial standar (Web, IG, YT)'}
                                            >
                                                {pf.presetStandard || 'Standar'}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={handleLoadFullSocialPreset}
                                                className="px-2 py-1 rounded-lg bg-[#0AB600]/10 hover:bg-[#0AB600]/15 dark:hover:bg-[#0AB600]/15 text-[#0AB600] text-[10.5px] font-medium border border-[#0AB600]/30 transition-all cursor-pointer"
                                                title={language === 'en' ? 'Load full preset: Web, IG, YT, LinkedIn, and Email' : 'Muat preset lengkap: Web, IG, YT, LinkedIn, dan Email'}
                                            >
                                                {pf.presetFull || 'Lengkap'}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleAddSocialLink('facebook')}
                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0AB600] hover:bg-[#089600] text-white text-[11px] font-bold shadow-xs transition-all cursor-pointer"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                                <span>{pf.addChannel || 'Tambah Saluran'}</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Social Items List */}
                                    <div className="space-y-2 pt-1">
                                        {Array.isArray(data.social_links) && data.social_links.length > 0 ? (
                                            data.social_links.map((item, index) => {
                                                const currentPlatformConfig = getSocialPlatformConfig(item.platform);
                                                const isDragging = draggedSocialIndex === index;
                                                const isDragOver = dragOverSocialIndex === index && draggedSocialIndex !== index;

                                                return (
                                                    <div
                                                        key={index}
                                                        draggable
                                                        onDragStart={(e) => handleDragStartSocial(e, index)}
                                                        onDragOver={(e) => handleDragOverSocial(e, index)}
                                                        onDragLeave={(e) => handleDragLeaveSocial(e, index)}
                                                        onDrop={(e) => handleDropSocial(e, index)}
                                                        onDragEnd={handleDragEndSocial}
                                                        className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 p-2 sm:p-2.5 rounded-xl border transition-all ${
                                                            isDragging
                                                                ? 'opacity-40 border-dashed border-[#0AB600] bg-[#0AB600]/10 shadow-inner'
                                                                : isDragOver
                                                                ? 'ring-2 ring-[#0AB600] border-[#0AB600] bg-[#0AB600]/10 shadow-md scale-[1.01]'
                                                                : 'bg-zinc-50/90 dark:bg-zinc-900/60 border-zinc-200/80 dark:border-zinc-800 hover:border-[#0AB600]/30 dark:hover:border-[#0AB600]/40'
                                                        }`}
                                                    >
                                                        {/* Reorder / Drag Grip Handle & Fast Move Buttons */}
                                                        <div className="flex items-center gap-0.5 shrink-0 self-start sm:self-center">
                                                            <div
                                                                className="p-1 rounded-md text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-grab active:cursor-grabbing hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors"
                                                                title={pf.dragToReorder || 'Tahan dan geser untuk mengatur urutan saluran'}
                                                            >
                                                                <GripVertical className="w-4 h-4" />
                                                            </div>
                                                            <div className="flex sm:flex-col gap-0.5">
                                                                <button
                                                                    type="button"
                                                                    disabled={index === 0}
                                                                    onClick={() => handleMoveSocialLink(index, index - 1)}
                                                                    className="p-0.5 rounded text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-colors"
                                                                    title={pf.moveUp || 'Geser ke atas'}
                                                                >
                                                                    <ChevronUp className="w-3.5 h-3.5" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    disabled={index === data.social_links.length - 1}
                                                                    onClick={() => handleMoveSocialLink(index, index + 1)}
                                                                    className="p-0.5 rounded text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer transition-colors"
                                                                    title={pf.moveDown || 'Geser ke bawah'}
                                                                >
                                                                    <ChevronDown className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Platform Selector with Auto-Icon */}
                                                        <div className="flex items-center gap-2 w-full sm:w-48 shrink-0">
                                                            <div
                                                                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-2xs"
                                                                style={{ color: currentPlatformConfig.color || '#0AB600' }}
                                                            >
                                                                <SocialIcon
                                                                    platform={item.platform}
                                                                    style={{ width: '15px', height: '15px' }}
                                                                />
                                                            </div>
                                                            <select
                                                                value={item.platform || 'website'}
                                                                onChange={(e) => handleUpdateSocialLink(index, 'platform', e.target.value)}
                                                                className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-white font-semibold focus:border-[#0AB600] focus:outline-none cursor-pointer"
                                                            >
                                                                {AVAILABLE_SOCIAL_PLATFORMS.map((plat) => (
                                                                    <option key={plat.id} value={plat.id}>
                                                                        {plat.name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>

                                                        {/* Account Handle / URL Input */}
                                                        <div className="flex-1 relative">
                                                            <input
                                                                type="text"
                                                                value={item.value || ''}
                                                                onChange={(e) => handleUpdateSocialLink(index, 'value', e.target.value)}
                                                                placeholder={currentPlatformConfig.placeholder}
                                                                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-white font-mono focus:border-[#0AB600] focus:outline-none"
                                                            />
                                                        </div>

                                                        {/* Quick Delete Button */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveSocialLink(index)}
                                                            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer self-end sm:self-center"
                                                            title={pf.deleteChannel || 'Hapus saluran ini'}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="p-4 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/30 text-center space-y-2">
                                                <p className="text-xs text-zinc-500">{pf.noChannels || 'Belum ada media sosial / kontak yang ditambahkan.'}</p>
                                                <button
                                                    type="button"
                                                    onClick={handleResetSocialLinks}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0AB600]/10 text-[#0AB600] text-xs font-bold border border-[#0AB600]/30 cursor-pointer"
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                    <span>{pf.applyStandardChannels || 'Pasang Standar STAS-RG (Web, IG, YT)'}</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 6. Status & Publikasi ke Landing Page / Navigasi Step */}
                        <div className="bg-white dark:bg-[#121824] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 sm:p-6 shadow-sm space-y-4">
                            <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                                <span className="p-1 rounded-md bg-[#0AB600]/10 text-[#0AB600]">
                                    <Globe className="w-4 h-4" />
                                </span>
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                    {language === 'en' ? '6. Publication Status to Landing Page' : '6. Status Publikasi ke Landing Page'}
                                </h2>
                            </div>

                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                {language === 'en' 
                                    ? 'Determine whether this project should be immediately published to the public landing page or stored as an internal draft.' 
                                    : 'Tentukan apakah project ini ingin langsung dipublikasikan dan ditampilkan pada Landing Page STAS RG atau disimpan sebagai Draft internal.'}
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                {/* Option 1: Published */}
                                <label
                                    onClick={() => setData('status', 'published')}
                                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                                        data.status === 'published'
                                            ? 'border-[#0AB600] bg-[#0AB600]/10 shadow-xs'
                                            : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/40 dark:bg-zinc-900/40'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="project_status"
                                        checked={data.status === 'published'}
                                        onChange={() => setData('status', 'published')}
                                        className="mt-0.5 text-[#0AB600] focus:ring-[#0AB600]"
                                    />
                                    <div>
                                        <span className="block text-xs font-bold text-slate-900 dark:text-white">
                                            {language === 'en' ? 'Publish to Landing Page' : 'Publikasikan ke Landing Page'}
                                        </span>
                                        <span className="block text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                                            {language === 'en' 
                                                ? 'Project will appear on the public showcase on the main landing page, allowing readers to view full research details.' 
                                                : 'Project akan tampil pada showcase publik di halaman utama dan pembaca dapat melihat detail riset lengkap.'}
                                        </span>
                                    </div>
                                </label>

                                {/* Option 2: Draft */}
                                <label
                                    onClick={() => setData('status', 'draft')}
                                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                                        data.status === 'draft'
                                            ? 'border-zinc-600 bg-zinc-100/70 dark:bg-zinc-800/40 shadow-xs'
                                            : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/40 dark:bg-zinc-900/40'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="project_status"
                                        checked={data.status === 'draft'}
                                        onChange={() => setData('status', 'draft')}
                                        className="mt-0.5 text-zinc-600 focus:ring-zinc-500"
                                    />
                                    <div>
                                        <span className="block text-xs font-bold text-slate-900 dark:text-white">
                                            {language === 'en' ? 'Draft' : 'Draft'}
                                        </span>
                                        <span className="block text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                                            {language === 'en' 
                                                ? 'Only visible and editable within the Admin Panel. Hidden from public showcase.' 
                                                : 'Hanya dapat dilihat dan diedit oleh Anda di Admin Panel. Belum ditampilkan di halaman showcase publik.'}
                                        </span>
                                    </div>
                                </label>
                            </div>

                            {/* BROSUR LIPAT 3 STEP-BY-STEP ACTION BAR */}
                            {data.doc_format === 'brochure_trifold' ? (
                                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                                    {activeTrifoldTab === 0 && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={(e) => handleSubmit(e, 'draft')}
                                                disabled={processing}
                                                className="px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold cursor-pointer disabled:opacity-50"
                                            >
                                                Simpan Draf Kotak 1
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setActiveTrifoldTab(1);
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                }}
                                                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#0AB600] hover:bg-[#089600] text-white text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer"
                                            >
                                                <span>Lanjut ke Kotak 2 (Panel Tengah)</span>
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}

                                    {activeTrifoldTab === 1 && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setActiveTrifoldTab(0);
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                }}
                                                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold cursor-pointer"
                                            >
                                                <ArrowLeft className="w-4 h-4" />
                                                <span>Kembali ke Kotak 1</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setActiveTrifoldTab(2);
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                }}
                                                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#0AB600] hover:bg-[#089600] text-white text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer"
                                            >
                                                <span>Lanjut ke Kotak 3 (Panel Kanan)</span>
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}

                                    {activeTrifoldTab === 2 && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setActiveTrifoldTab(1);
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                }}
                                                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold cursor-pointer"
                                            >
                                                <ArrowLeft className="w-4 h-4" />
                                                <span>Kembali ke Kotak 2</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={(e) => handleSubmit(e, data.status)}
                                                disabled={processing}
                                                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#0AB600] hover:bg-[#089600] text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
                                            >
                                                <CheckCircle2 className="w-4 h-4" />
                                                <span>Simpan &amp; Selesaikan Brosur (Siap Download / Print)</span>
                                            </button>
                                        </>
                                    )}
                                </div>
                            ) : null}
                        </div>
                        </>
                        )}

                    </div>

                    {/* RIGHT PANEL: Live Output Preview (lg:col-span-5) */}
                    <div className="lg:col-span-5 sticky top-6 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 px-2">
                            <div className="flex items-center gap-2">
                                <span className="flex h-2.5 w-2.5 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0AB600] opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0AB600]"></span>
                                </span>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                                    {pf.livePreviewTitle || 'Live Output Preview'}
                                </h3>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-1.5">
                                {/* Language Preview Switcher (ID / EN) */}
                                <div className="inline-flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5 border border-zinc-200/80 dark:border-zinc-700/80 shadow-2xs">
                                    <button
                                        type="button"
                                        onClick={() => setPreviewLang('id')}
                                        className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors cursor-pointer ${
                                            previewLang === 'id'
                                                ? 'bg-[#0AB600] text-white shadow-2xs'
                                                : 'text-zinc-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                        title="Preview Bahasa Indonesia"
                                    >
                                        ID
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPreviewLang('en')}
                                        className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors cursor-pointer ${
                                            previewLang === 'en'
                                                ? 'bg-[#0AB600] text-white shadow-2xs'
                                                : 'text-zinc-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                        title="Preview English Version"
                                    >
                                        EN
                                    </button>
                                </div>

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

                                {/* Share & Multi-Format Action */}
                                <button
                                    type="button"
                                    onClick={() => setIsExportSosmedModalOpen(true)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0AB600]/10 hover:bg-[#0AB600]/15 dark:hover:bg-[#0AB600]/15 text-[#0AB600] text-[11px] font-bold border border-[#0AB600]/30 transition-colors cursor-pointer shadow-xs"
                                    title={language === 'en' ? 'Share & Export Social Media (Feed 1:1, Story 9:16, PNG, JPG, Copy Image)' : 'Bagikan & Ekspor Media Sosial (Feed 1:1, Story 9:16, PNG, JPG, Salin Gambar)'}
                                >
                                    <Share2 className="w-3.5 h-3.5 text-[#0AB600]" />
                                    <span>{pf.shareBtn || pf.multiFormatBtn || 'Share'}</span>
                                </button>

                                {/* Print Quick Action */}
                                <button
                                    type="button"
                                    onClick={handleLivePrint}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-[11px] font-semibold transition-colors cursor-pointer"
                                    title={language === 'en' ? 'Print Flyer A4 Preview' : 'Print Flyer A4 Preview'}
                                >
                                    <Printer className="w-3 h-3" />
                                    <span>{pf.printBtn || 'Print'}</span>
                                </button>

                                {/* Download PNG Quick Action */}
                                <button
                                    type="button"
                                    onClick={handleLiveDownloadPng}
                                    disabled={livePngLoading}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0AB600] hover:bg-[#089600] text-white text-[11px] font-semibold transition-colors cursor-pointer disabled:cursor-wait"
                                    title={language === 'en' ? 'Download High-Resolution PNG (300 DPI)' : 'Download Gambar PNG Resolusi Tinggi (300 DPI)'}
                                >
                                    {livePngLoading ? (
                                        <>
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                            <span>PNG...</span>
                                        </>
                                    ) : (
                                        <>
                                            <ImageIcon className="w-3 h-3" />
                                            <span>{pf.downloadPngBtn || 'PNG'}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Layout Health / Text Overflow Warning Banner */}
                        {layoutEvaluation.hasErrors ? (
                            <div className="p-3.5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border-2 border-amber-400/80 dark:border-amber-600/70 text-amber-950 dark:text-amber-100 shadow-xs transition-all animate-in fade-in duration-200">
                                <div className="flex items-start gap-2.5">
                                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                    <div className="space-y-1 text-xs">
                                        <p className="font-bold text-amber-950 dark:text-amber-100 flex items-center gap-1.5">
                                            <span>{language === 'en' ? `Warning: Text Exceeds Ideal ${DOCUMENT_FORMATS[data.doc_format]?.name || 'Layout'} Limits` : `Peringatan: Teks Melebihi Batas Ideal ${DOCUMENT_FORMATS[data.doc_format]?.name || 'Layout'}`}</span>
                                        </p>
                                        <p className="text-[11px] text-amber-900/90 dark:text-amber-300/90 leading-relaxed">
                                            {language === 'en' 
                                                ? `The flyer is locked to 1 single ${DOCUMENT_FORMATS[data.doc_format]?.name || 'page'}. The following text fields are too long and may clip when printed or downloaded:` 
                                                : `Flyer dikunci pada 1 halaman ${DOCUMENT_FORMATS[data.doc_format]?.name || 'dokumen'}. Bagian teks berikut terlalu panjang dan berisiko terpotong saat dicetak atau diunduh:`}
                                        </p>
                                        <div className="flex flex-wrap gap-1.5 pt-1">
                                            {layoutEvaluation.errorWarnings.map((w) => (
                                                <span
                                                    key={w.key}
                                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100/90 dark:bg-amber-900/70 border border-amber-300 dark:border-amber-700 text-[11px] font-semibold text-amber-950 dark:text-amber-100"
                                                >
                                                    <span>{w.field}:</span>
                                                    <strong className="text-rose-700 dark:text-rose-300">{w.current}/{w.max}</strong>
                                                    <span className="text-[10px] text-rose-600 dark:text-rose-400">(+{w.excess})</span>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : layoutEvaluation.hasWarnings ? (
                            <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-[11px] text-amber-800 dark:text-amber-300 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 font-medium">
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                    <span>{language === 'en' ? `Some text fields are nearing the 1-page ${DOCUMENT_FORMATS[data.doc_format]?.name || 'layout'} limit.` : `Beberapa kolom teks mendekati batas maksimum 1 halaman ${DOCUMENT_FORMATS[data.doc_format]?.name || 'dokumen'}.`}</span>
                                </div>
                                <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold shrink-0">
                                    {language === 'en' ? 'Review' : 'Periksa kembali'}
                                </span>
                            </div>
                        ) : (
                            <div className="px-3 py-1.5 rounded-xl bg-[#0AB600]/10 border border-[#0AB600]/30 text-[11px] text-[#0AB600] flex items-center justify-between">
                                <span className="flex items-center gap-1.5 font-medium">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0AB600]" />
                                    <span>{language === 'en' ? `Optimal ${DOCUMENT_FORMATS[data.doc_format]?.name || 'Layout'} (Fits Exactly 1 Page)` : `Layout ${DOCUMENT_FORMATS[data.doc_format]?.name || 'Dokumen'} Optimal (Teks Pas 1 Halaman)`}</span>
                                </span>
                                <span className="inline-flex items-center gap-1 text-[10px] text-[#0AB600]/90 dark:text-[#0AB600]/90 font-semibold">
                                    <Check className="w-3 h-3 text-[#0AB600]" />
                                    <span>{language === 'en' ? `100% Fits ${DOCUMENT_FORMATS[data.doc_format]?.name || 'Layout'}` : `100% Pas ${DOCUMENT_FORMATS[data.doc_format]?.name || 'Dokumen'}`}</span>
                                </span>
                            </div>
                        )}

                        {/* Document Render Canvas Viewport with Zoom and Pan Support */}
                        <PreviewPanZoomContainer
                            zoom={previewZoom}
                            maxHeight="calc(100vh - 140px)"
                            onResetZoom={() => setPreviewZoom(100)}
                        >
                            <ProjectPreview project={previewProject} isLive={true} id="live-preview-canvas" />
                        </PreviewPanZoomContainer>
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
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <span>Pratinjau Resolusi Tinggi (Layar Penuh)</span>
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0AB600]/10 text-[#0AB600]">
                                                {DOCUMENT_FORMATS[data.doc_format]?.name || 'Dokumen Riset'}
                                            </span>
                                        </h3>
                                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                            Periksa ketepatan tata letak, teks, foto, dan QR code dalam resolusi penuh.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* Zoom controls inside modal */}
                                    <div className="inline-flex items-center bg-zinc-200/70 dark:bg-zinc-800 rounded-xl p-1 border border-zinc-300 dark:border-zinc-700 shadow-2xs">
                                        <button
                                            type="button"
                                            onClick={() => setPreviewZoom((z) => Math.max(50, z - 15))}
                                            disabled={previewZoom <= 50}
                                            className="p-1.5 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700 disabled:opacity-30 transition-colors cursor-pointer"
                                            title="Zoom Out"
                                        >
                                            <ZoomOut className="w-4 h-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPreviewZoom(100)}
                                            className="px-2 py-0.5 text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 hover:bg-white dark:hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer"
                                            title="Reset 100%"
                                        >
                                            {previewZoom}%
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPreviewZoom((z) => Math.min(200, z + 15))}
                                            disabled={previewZoom >= 200}
                                            className="p-1.5 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700 disabled:opacity-30 transition-colors cursor-pointer"
                                            title="Zoom In"
                                        >
                                            <ZoomIn className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Print Button */}
                                    <button
                                        type="button"
                                        onClick={handleLivePrint}
                                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
                                    >
                                        <Printer className="w-3.5 h-3.5" />
                                        <span>Print</span>
                                    </button>

                                    {/* Download PNG Button */}
                                    <button
                                        type="button"
                                        onClick={handleLiveDownloadPng}
                                        disabled={livePngLoading}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0AB600] hover:bg-[#089600] text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm"
                                    >
                                        {livePngLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5" />}
                                        <span>{pf.downloadPngBtn || 'PNG'}</span>
                                    </button>

                                    {/* Close Button */}
                                    <button
                                        type="button"
                                        onClick={() => setIsFullscreenPreview(false)}
                                        className="p-2 rounded-xl text-zinc-500 hover:text-zinc-800 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer ml-2"
                                        title="Tutup (Esc)"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Canvas Body with Zoom and Pan Support */}
                            <div className="flex-1 overflow-hidden p-3 sm:p-6 bg-zinc-100/70 dark:bg-zinc-950/70 flex flex-col justify-center">
                                <PreviewPanZoomContainer
                                    zoom={previewZoom}
                                    maxHeight="calc(94vh - 100px)"
                                    className="h-full"
                                    onResetZoom={() => setPreviewZoom(100)}
                                >
                                    <ProjectPreview project={previewProject} isLive={true} id="modal-preview-canvas" />
                                </PreviewPanZoomContainer>
                            </div>
                        </div>
                    </div>
                )}

                {/* Export Multi-Format & Media Sosial Modal */}
                <ExportSosmedModal
                    project={previewProject}
                    isOpen={isExportSosmedModalOpen}
                    onClose={() => setIsExportSosmedModalOpen(false)}
                />

                {/* Media & Asset Library Picker Modal */}
                <AssetPickerModal
                    isOpen={isAssetPickerOpen}
                    onClose={() => setIsAssetPickerOpen(false)}
                    onSelectAsset={handleSelectFromAssetLibrary}
                    type="all"
                    title={language === 'en' ? 'Verified Partner Logos & Badges Library' : 'Pustaka Logo Mitra & Badge Terverifikasi'}
                />

                {/* Researcher Directory Picker Modal */}
                <ResearcherPickerModal
                    isOpen={isResearcherPickerOpen}
                    onClose={() => setIsResearcherPickerOpen(false)}
                    onSelectResearchers={handleImportResearchers}
                    existingMembers={data.research_team || []}
                    title={language === 'en' ? 'Pick from Researcher Directory & Authors' : 'Pilih dari Direktori Peneliti & Authors'}
                />

                {/* Template Catalog Picker Modal */}
                <TemplatePickerModal
                    isOpen={isTemplatePickerOpen}
                    onClose={() => setIsTemplatePickerOpen(false)}
                    onSelectTemplate={(tpl) => {
                        handleApplyTemplate(tpl);
                        setIsTemplatePickerOpen(false);
                    }}
                />

                {/* Save Project as Template Dialog */}
                {isSaveAsTemplateOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-[#182234] border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#0AB600]/10 flex items-center justify-center text-[#0AB600]">
                                    <BookmarkCheck className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                        Simpan Sebagai Template
                                    </h3>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                        Simpan gaya visual, layout, dan konten saat ini sebagai template reusable.
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleSaveAsTemplate} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                        Nama Template <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={templateName}
                                        onChange={(e) => setTemplateName(e.target.value)}
                                        placeholder="Contoh: Template Pitch Deck STAS 2026"
                                        required
                                        className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden focus:border-[#0AB600] text-slate-900 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                                        Deskripsi Singkat (Opsional)
                                    </label>
                                    <textarea
                                        value={templateDesc}
                                        onChange={(e) => setTemplateDesc(e.target.value)}
                                        placeholder="Deskripsi peruntukan template ini..."
                                        rows={3}
                                        className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden focus:border-[#0AB600] text-slate-900 dark:text-white resize-none"
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                    <button
                                        type="button"
                                        onClick={() => setIsSaveAsTemplateOpen(false)}
                                        disabled={savingTemplate}
                                        className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={savingTemplate || !templateName.trim()}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0AB600] hover:bg-[#089600] text-white text-xs font-semibold transition-all disabled:opacity-50"
                                    >
                                        {savingTemplate && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                        <span>Simpan Template</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Version History & Rollback Modal */}
                {isEditing && (
                    <VersionHistoryModal
                        isOpen={isVersionModalOpen}
                        onClose={() => setIsVersionModalOpen(false)}
                        modelType="project"
                        modelId={project?.slug || project?.id}
                        modelName={project?.name || project?.title}
                        onRollbackSuccess={() => {
                            router.reload();
                        }}
                    />
                )}

            </div>
        </AdminLayout>
    );
}
