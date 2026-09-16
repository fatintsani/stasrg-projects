import React, { useState, useEffect } from 'react';
import {
    Sparkles,
    X,
    FileText,
    Languages,
    Scissors,
    BookOpen,
    Check,
    Copy,
    Loader2,
    ArrowRightLeft,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    Wand2,
    Layers,
    Sliders,
    Building2,
    Users,
    Zap,
    Download,
    CornerDownRight,
    Send,
    FolderKanban
} from 'lucide-react';
import { useAlert } from '../../Context/AlertContext';

export default function AiSmartAssistModal({
    isOpen,
    onClose,
    projectsList = [],
    projectData = {},
    initialTab = 'executive_summary', // 'executive_summary' | 'abstract' | 'translate' | 'summarize'
    initialText = '',
    onSendToChat, // callback to send text into NARA chat
    onApplyContent, // optional callback ({ field, value, extraData })
}) {
    const { showAlert, showSuccess } = useAlert();
    const [activeTab, setActiveTab] = useState(initialTab);
    const [loading, setLoading] = useState(false);
    const [copiedField, setCopiedField] = useState(null);

    // Selected project state
    const [selectedProjectId, setSelectedProjectId] = useState(projectData?.id || '');
    const [activeProjectData, setActiveProjectData] = useState(projectData || {});

    // Tab 1: Executive Summary State
    const [execLang, setExecLang] = useState('id');
    const [execResult, setExecResult] = useState(null);

    // Tab 2: Abstract Formatter State
    const [abstractInput, setAbstractInput] = useState(initialText || projectData.description || '');
    const [abstractResult, setAbstractResult] = useState(null);
    const [abstractViewLang, setAbstractViewLang] = useState('id');

    // Tab 3: Translation State
    const [translateSourceText, setTranslateSourceText] = useState(initialText || projectData.description || '');
    const [fromLang, setFromLang] = useState('id');
    const [toLang, setToLang] = useState('en');
    const [translatedResult, setTranslatedResult] = useState('');

    // Tab 4: Auto-Summarize State
    const [summarizeText, setSummarizeText] = useState(initialText || projectData.description || '');
    const [maxChars, setMaxChars] = useState(350);
    const [summarizeResult, setSummarizeResult] = useState('');

    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab);
            const initialProj = projectData?.id
                ? projectData
                : (projectsList.length > 0 ? projectsList[0] : {});
            setActiveProjectData(initialProj);
            setSelectedProjectId(initialProj?.id || '');

            const defaultDesc = initialText || initialProj?.description || '';
            setAbstractInput(defaultDesc);
            setTranslateSourceText(defaultDesc);
            setSummarizeText(defaultDesc);
        }
    }, [isOpen, initialTab, initialText, projectData, projectsList]);

    const handleSelectProject = (projectId) => {
        setSelectedProjectId(projectId);
        if (projectId === 'custom' || !projectId) {
            setActiveProjectData({ title: 'Kustom / Draf Bebas', description: '' });
            return;
        }
        const found = projectsList.find((p) => String(p.id) === String(projectId));
        if (found) {
            setActiveProjectData(found);
            if (found.description) {
                setAbstractInput(found.description);
                setTranslateSourceText(found.description);
                setSummarizeText(found.description);
            }
            setExecResult(null);
            setAbstractResult(null);
            setTranslatedResult('');
            setSummarizeResult('');
        }
    };

    if (!isOpen) return null;

    const copyToClipboard = (text, fieldKey) => {
        if (!text) return;
        const plainText = typeof text === 'string' ? text.replace(/<[^>]+>/g, '') : JSON.stringify(text);
        navigator.clipboard.writeText(plainText);
        setCopiedField(fieldKey);
        setTimeout(() => setCopiedField(null), 2000);
    };

    // 1. Generate Executive Summary
    const handleGenerateExecutiveSummary = async () => {
        setLoading(true);
        try {
            const res = await fetch('/ai-assistant/smart-assist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    action: 'executive_summary',
                    payload: activeProjectData,
                    language: execLang,
                }),
            });
            const data = await res.json();
            if (data.success && data.data) {
                setExecResult(data.data);
            } else {
                showAlert({
                    type: 'error',
                    title: 'Gagal Menghasilkan Ringkasan',
                    message: data.error || 'Terjadi kesalahan saat menghubungi layanan AI.',
                });
            }
        } catch (error) {
            console.error('Executive Summary Error:', error);
            showAlert({
                type: 'error',
                title: 'Koneksi AI Terputus',
                message: 'Tidak dapat terhubung ke layanan AI.',
            });
        } finally {
            setLoading(false);
        }
    };

    // 2. Format Academic Abstract
    const handleFormatAbstract = async () => {
        if (!abstractInput.trim()) {
            showAlert({
                type: 'warning',
                title: 'Teks Masukan Kosong',
                message: 'Silakan masukkan draf, poin catatan, atau rincian inovasi terlebih dahulu.',
            });
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/ai-assistant/smart-assist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    action: 'format_abstract',
                    text: abstractInput,
                    context: {
                        title: activeProjectData.title || activeProjectData.name,
                        category: activeProjectData.category,
                    },
                }),
            });
            const data = await res.json();
            if (data.success && data.data) {
                setAbstractResult(data.data);
            } else {
                showAlert({
                    type: 'error',
                    title: 'Gagal Memformat Abstrak',
                    message: data.error || 'Terjadi kesalahan saat memproses abstrak.',
                });
            }
        } catch (error) {
            console.error('Abstract Format Error:', error);
            showAlert({
                type: 'error',
                title: 'Koneksi AI Terputus',
                message: 'Tidak dapat terhubung ke layanan AI.',
            });
        } finally {
            setLoading(false);
        }
    };

    // 3. Bidirectional Translation
    const handleTranslate = async () => {
        if (!translateSourceText.trim()) {
            showAlert({
                type: 'warning',
                title: 'Teks Masukan Kosong',
                message: 'Silakan masukkan teks yang ingin diterjemahkan.',
            });
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/ai-assistant/smart-assist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    action: 'translate',
                    text: translateSourceText,
                    from_lang: fromLang,
                    to_lang: toLang,
                    mode: 'academic',
                }),
            });
            const data = await res.json();
            if (data.success && data.translated_text) {
                setTranslatedResult(data.translated_text);
            } else {
                showAlert({
                    type: 'error',
                    title: 'Gagal Menerjemahkan',
                    message: data.error || 'Terjadi kesalahan saat menerjemahkan teks.',
                });
            }
        } catch (error) {
            console.error('Translate Error:', error);
            showAlert({
                type: 'error',
                title: 'Koneksi AI Terputus',
                message: 'Tidak dapat terhubung ke layanan AI.',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSwapTranslateLangs = () => {
        const tempFrom = fromLang;
        setFromLang(toLang);
        setToLang(tempFrom);
        if (translatedResult) {
            setTranslateSourceText(translatedResult);
            setTranslatedResult('');
        }
    };

    // 4. Auto-Summarize to Character Limit
    const handleSummarize = async () => {
        if (!summarizeText.trim()) {
            showAlert({
                type: 'warning',
                title: 'Teks Masukan Kosong',
                message: 'Silakan masukkan teks yang ingin diringkas.',
            });
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/ai-assistant/smart-assist', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    action: 'auto_summarize',
                    text: summarizeText,
                    max_chars: maxChars,
                    content_type: 'paragraph',
                }),
            });
            const data = await res.json();
            if (data.success && data.summarized_text) {
                setSummarizeResult(data.summarized_text);
            } else {
                showAlert({
                    type: 'error',
                    title: 'Gagal Meringkas Teks',
                    message: data.error || 'Terjadi kesalahan saat meringkas teks.',
                });
            }
        } catch (error) {
            console.error('Summarize Error:', error);
            showAlert({
                type: 'error',
                title: 'Koneksi AI Terputus',
                message: 'Tidak dapat terhubung ke layanan AI.',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSendToChatAndClose = (content, customPrompt = '') => {
        if (onSendToChat) {
            const plainText = typeof content === 'string' ? content.replace(/<[^>]+>/g, '') : JSON.stringify(content);
            const fullMessage = customPrompt ? `${customPrompt}\n\n${plainText}` : plainText;
            onSendToChat(fullMessage);
            showSuccess('Dimasukkan ke Chat NARA', 'Teks hasil telah disematkan ke kotak chat NARA AI.');
            onClose();
        }
    };

    const handleApplyToForm = (fieldName, content) => {
        if (onApplyContent) {
            onApplyContent({
                field: fieldName,
                value: content,
                extraData: {
                    project: activeProjectData,
                    tab: activeTab,
                }
            });
            showSuccess('Berhasil Diterapkan', `Konten berhasil disalin ke formulir input (${fieldName}).`);
            onClose();
        } else {
            copyToClipboard(content, fieldName);
            showSuccess('Tersalin ke Clipboard', 'Teks telah disalin ke clipboard Anda.');
        }
    };

    const handleSendResultToChat = (text) => {
        if (onSendToChat) {
            onSendToChat(text);
            showSuccess('Teks Dikirim ke Chat', 'Hasil Smart Assist telah diteruskan ke percakapan NARA AI.');
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
            <div
                className="bg-white dark:bg-[#121824] border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 bg-linear-to-r from-emerald-500/10 via-transparent to-purple-500/10 dark:from-emerald-500/5 dark:to-purple-500/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-[#0AB600] text-white shadow-xs">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                                    NARA AI Smart Assist Studio
                                </h2>
                                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#0AB600]/10 text-[#0AB600] border border-[#0AB600]/20">
                                    NARA Copilot
                                </span>
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                Studio AI terpadu untuk menyusun ringkasan eksekutif, memformat abstrak ilmiah, terjemahan dua arah, dan auto-summarize.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Project Selector Bar (When opened from NARA AI or with projects list) */}
                {projectsList && projectsList.length > 0 && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-4 sm:px-5 py-2.5 bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 text-xs">
                        <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-zinc-300">
                            <FolderKanban className="w-4 h-4 text-[#0AB600]" />
                            <span>Pilih Sumber Proyek Riset:</span>
                        </div>
                        <select
                            value={selectedProjectId}
                            onChange={(e) => handleSelectProject(e.target.value)}
                            className="px-3 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl font-medium text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-[#0AB600] max-w-md truncate cursor-pointer"
                        >
                            <option value="custom">✏️ Masukkan Teks / Catatan Kustom Bebas</option>
                            {projectsList.map((p) => (
                                <option key={p.id} value={p.id}>
                                    📁 {p.title || p.name} ({p.category || 'Riset'})
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Tab Navigation */}
                <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 px-4 overflow-x-auto gap-1">
                    <button
                        type="button"
                        onClick={() => setActiveTab('executive_summary')}
                        className={`flex items-center gap-2 py-3 px-3.5 border-b-2 text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                            activeTab === 'executive_summary'
                                ? 'border-[#0AB600] text-[#0AB600] bg-white/60 dark:bg-zinc-800/40'
                                : 'border-transparent text-zinc-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <FileText className="w-4 h-4" />
                        <span>1. Ringkasan Eksekutif</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('abstract')}
                        className={`flex items-center gap-2 py-3 px-3.5 border-b-2 text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                            activeTab === 'abstract'
                                ? 'border-[#0AB600] text-[#0AB600] bg-white/60 dark:bg-zinc-800/40'
                                : 'border-transparent text-zinc-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <BookOpen className="w-4 h-4" />
                        <span>2. Format Abstrak Akademik</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('translate')}
                        className={`flex items-center gap-2 py-3 px-3.5 border-b-2 text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                            activeTab === 'translate'
                                ? 'border-[#0AB600] text-[#0AB600] bg-white/60 dark:bg-zinc-800/40'
                                : 'border-transparent text-zinc-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <Languages className="w-4 h-4" />
                        <span>3. Terjemahan Dua Arah (ID ⟷ EN)</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('summarize')}
                        className={`flex items-center gap-2 py-3 px-3.5 border-b-2 text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                            activeTab === 'summarize'
                                ? 'border-[#0AB600] text-[#0AB600] bg-white/60 dark:bg-zinc-800/40'
                                : 'border-transparent text-zinc-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <Scissors className="w-4 h-4" />
                        <span>4. Auto-Summarize Layout A4</span>
                    </button>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

                    {/* TAB 1: EXECUTIVE SUMMARY */}
                    {activeTab === 'executive_summary' && (
                        <div className="space-y-6">
                            <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                                        Analisis & Ringkasan Eksekutif Terpadu
                                    </h3>
                                    <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                                        AI akan menganalisis data proyek (Judul: <strong>{activeProjectData.title || activeProjectData.name || 'Proyek Riset'}</strong>) dan menyusun ringkasan berwawasan strategis.
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <select
                                        value={execLang}
                                        onChange={(e) => setExecLang(e.target.value)}
                                        className="px-3 py-2 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-semibold text-slate-800 dark:text-white"
                                    >
                                        <option value="id">Bahasa Indonesia</option>
                                        <option value="en">Academic English</option>
                                    </select>

                                    <button
                                        type="button"
                                        onClick={handleGenerateExecutiveSummary}
                                        disabled={loading}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#0AB600] hover:bg-[#099600] text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                                        <span>Buat Ringkasan Eksekutif</span>
                                    </button>
                                </div>
                            </div>

                            {execResult ? (
                                <div className="space-y-4 animate-in fade-in">
                                    {/* Main Executive Summary Box */}
                                    <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                                                <FileText className="w-4 h-4 text-[#0AB600]" />
                                                <span>Ringkasan Eksekutif</span>
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => copyToClipboard(execResult.executive_summary, 'exec_sum')}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer"
                                                >
                                                    {copiedField === 'exec_sum' ? <Check className="w-3.5 h-3.5 text-[#0AB600]" /> : <Copy className="w-3.5 h-3.5" />}
                                                    <span>{copiedField === 'exec_sum' ? 'Tersalin' : 'Salin'}</span>
                                                </button>
                                                {onSendToChat && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSendToChatAndClose(execResult.executive_summary, `Berikut ringkasan eksekutif proyek riset "${activeProjectData.title || ''}":`)}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded-lg text-emerald-700 dark:text-emerald-300 font-semibold hover:bg-emerald-100 cursor-pointer"
                                                    >
                                                        <Send className="w-3.5 h-3.5 text-[#0AB600]" />
                                                        <span>Kirim ke Chat NARA</span>
                                                    </button>
                                                )}
                                                {onApplyContent && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleApplyToForm('description', execResult.recommended_short_desc || execResult.executive_summary)}
                                                        className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-[#0AB600] text-white rounded-lg font-bold hover:bg-[#099600] cursor-pointer"
                                                    >
                                                        <CornerDownRight className="w-3.5 h-3.5" />
                                                        <span>Terapkan ke Deskripsi</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-sm leading-relaxed text-slate-800 dark:text-zinc-200">
                                            {execResult.executive_summary}
                                        </p>
                                    </div>

                                    {/* 2-Column Grid: Strategic Highlights & Target Beneficiaries */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Strategic Highlights */}
                                        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/20 space-y-2">
                                            <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                                                <Zap className="w-4 h-4 text-amber-500" />
                                                <span>Poin Keunggulan Strategis</span>
                                            </span>
                                            <ul className="space-y-1.5 text-xs text-slate-700 dark:text-zinc-300">
                                                {(execResult.strategic_highlights || []).map((h, i) => (
                                                    <li key={i} className="flex items-start gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-[#0AB600] mt-1.5 shrink-0" />
                                                        <span>{h}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Recommended Short Desc & Beneficiaries */}
                                        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/20 space-y-3">
                                            <div>
                                                <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
                                                    <Scissors className="w-4 h-4 text-purple-500" />
                                                    <span>Rekomendasi Deskripsi Padat (A4 Fit)</span>
                                                </span>
                                                <p className="text-xs text-slate-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/60 p-2.5 rounded-lg border border-zinc-200/60 dark:border-zinc-700/60">
                                                    {execResult.recommended_short_desc || execResult.executive_summary}
                                                </p>
                                            </div>

                                            {execResult.target_beneficiaries && (
                                                <div>
                                                    <span className="text-[11px] font-bold text-zinc-500 uppercase">Sektor Target:</span>
                                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                                        {execResult.target_beneficiaries.map((b, i) => (
                                                            <span key={i} className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-zinc-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                                                                {b}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-12 px-4 text-center flex flex-col items-center justify-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/40 dark:bg-zinc-900/30">
                                    <img
                                        src="/assets/img/icon/notfound.png"
                                        alt="Belum Ada Ringkasan"
                                        className="w-28 sm:w-32 h-auto object-contain mx-auto mb-3 drop-shadow-xs"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                                        Belum Ada Ringkasan yang Dihasilkan
                                    </h4>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                                        Klik tombol "Buat Ringkasan Eksekutif" di atas untuk memulai analisis cerdas AI.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 2: ACADEMIC ABSTRACT */}
                    {activeTab === 'abstract' && (
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                                    Catatan / Draf Kasar Penelitian
                                </label>
                                <textarea
                                    value={abstractInput}
                                    onChange={(e) => setAbstractInput(e.target.value)}
                                    rows={4}
                                    placeholder="Tuliskan poin-poin ide, metodologi pengujian, sensor yang digunakan, atau draf abstrak kasar..."
                                    className="w-full p-3 text-xs bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-[#0AB600]"
                                />
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={handleFormatAbstract}
                                        disabled={loading || !abstractInput.trim()}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#0AB600] hover:bg-[#099600] text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                                        <span>Format Menjadi Abstrak IMRaD (ID & EN)</span>
                                    </button>
                                </div>
                            </div>

                            {abstractResult && (
                                <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 animate-in fade-in">
                                    {/* Lang Switcher */}
                                    <div className="flex items-center justify-between">
                                        <div className="inline-flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
                                            <button
                                                type="button"
                                                onClick={() => setAbstractViewLang('id')}
                                                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                                                    abstractViewLang === 'id' ? 'bg-[#0AB600] text-white shadow-xs' : 'text-zinc-600 dark:text-zinc-300'
                                                }`}
                                            >
                                                Bahasa Indonesia
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setAbstractViewLang('en')}
                                                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                                                    abstractViewLang === 'en' ? 'bg-[#0AB600] text-white shadow-xs' : 'text-zinc-600 dark:text-zinc-300'
                                                }`}
                                            >
                                                Academic English
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => copyToClipboard(
                                                    abstractViewLang === 'en'
                                                        ? abstractResult.abstract_en?.full_paragraph
                                                        : abstractResult.abstract_id?.full_paragraph,
                                                    'abstract_full'
                                                )}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg font-semibold text-slate-700 dark:text-zinc-300 cursor-pointer"
                                            >
                                                {copiedField === 'abstract_full' ? <Check className="w-3.5 h-3.5 text-[#0AB600]" /> : <Copy className="w-3.5 h-3.5" />}
                                                <span>Salin Abstrak</span>
                                            </button>

                                            {onSendToChat && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const textToSend = abstractViewLang === 'en'
                                                            ? abstractResult.abstract_en?.full_paragraph
                                                            : abstractResult.abstract_id?.full_paragraph;
                                                        handleSendToChatAndClose(textToSend, `Berikut hasil format abstrak (${abstractViewLang.toUpperCase()}) untuk dianalisis:`);
                                                    }}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded-lg text-emerald-700 dark:text-emerald-300 font-semibold hover:bg-emerald-100 cursor-pointer"
                                                >
                                                    <Send className="w-3.5 h-3.5 text-[#0AB600]" />
                                                    <span>Kirim ke Chat NARA</span>
                                                </button>
                                            )}

                                            {onApplyContent && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const textToApply = abstractViewLang === 'en'
                                                            ? abstractResult.abstract_en?.full_paragraph
                                                            : abstractResult.abstract_id?.full_paragraph;
                                                        const fieldName = abstractViewLang === 'en' ? 'content_en.description' : 'description';
                                                        handleApplyToForm(fieldName, textToApply);
                                                    }}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-[#0AB600] text-white rounded-lg font-bold hover:bg-[#099600] cursor-pointer"
                                                >
                                                    <CornerDownRight className="w-3.5 h-3.5" />
                                                    <span>Terapkan ke {abstractViewLang === 'en' ? 'Konten EN' : 'Deskripsi'}</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Structured Sections */}
                                    {(() => {
                                        const absData = abstractViewLang === 'en' ? abstractResult.abstract_en : abstractResult.abstract_id;
                                        const keywords = abstractViewLang === 'en' ? abstractResult.keywords_en : abstractResult.keywords_id;

                                        return (
                                            <div className="space-y-3">
                                                {/* Full Paragraph */}
                                                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
                                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white block mb-1.5">
                                                        Paragraf Abstrak Lengkap ({abstractViewLang.toUpperCase()})
                                                    </span>
                                                    <p className="text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-zinc-200">
                                                        {absData?.full_paragraph}
                                                    </p>
                                                </div>

                                                {/* IMRaD breakdown */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                                    <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/20">
                                                        <span className="font-bold text-[#0AB600]">1. Background & Objective:</span>
                                                        <p className="text-zinc-700 dark:text-zinc-300 mt-1">{absData?.background}</p>
                                                    </div>
                                                    <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/20">
                                                        <span className="font-bold text-[#0AB600]">2. Methods & System Design:</span>
                                                        <p className="text-zinc-700 dark:text-zinc-300 mt-1">{absData?.methods}</p>
                                                    </div>
                                                    <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/20">
                                                        <span className="font-bold text-[#0AB600]">3. Key Results & Innovation:</span>
                                                        <p className="text-zinc-700 dark:text-zinc-300 mt-1">{absData?.results}</p>
                                                    </div>
                                                    <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/20">
                                                        <span className="font-bold text-[#0AB600]">4. Conclusion & Impact:</span>
                                                        <p className="text-zinc-700 dark:text-zinc-300 mt-1">{absData?.conclusion}</p>
                                                    </div>
                                                </div>

                                                {/* Keywords */}
                                                {keywords && (
                                                    <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 flex items-center gap-2 flex-wrap text-xs">
                                                        <span className="font-bold text-slate-800 dark:text-zinc-200">Keywords:</span>
                                                        {keywords.map((kw, i) => (
                                                            <span key={i} className="px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-semibold text-[11px]">
                                                                {kw}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 3: BIDIRECTIONAL TRANSLATION */}
                    {activeTab === 'translate' && (
                        <div className="space-y-6">
                            {/* Direction Selector Bar */}
                            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                                    <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                                        {fromLang === 'id' ? 'Bahasa Indonesia' : 'English'}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleSwapTranslateLangs}
                                        className="p-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors cursor-pointer"
                                        title="Tukar Arah Bahasa"
                                    >
                                        <ArrowRightLeft className="w-4 h-4 text-slate-800 dark:text-white" />
                                    </button>
                                    <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                                        {toLang === 'en' ? 'Academic English' : 'Bahasa Indonesia'}
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleTranslate}
                                    disabled={loading || !translateSourceText.trim()}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#0AB600] hover:bg-[#099600] text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Languages className="w-4 h-4" />}
                                    <span>Terjemahkan Sekarang</span>
                                </button>
                            </div>

                            {/* Two-Column Editor: Source & Target */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                        Teks Sumber ({fromLang.toUpperCase()})
                                    </span>
                                    <textarea
                                        value={translateSourceText}
                                        onChange={(e) => setTranslateSourceText(e.target.value)}
                                        rows={8}
                                        placeholder="Masukkan teks yang ingin diterjemahkan..."
                                        className="w-full p-3 text-xs bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-[#0AB600]"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                            Hasil Terjemahan ({toLang.toUpperCase()})
                                        </span>
                                        {translatedResult && (
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => copyToClipboard(translatedResult, 'trans_res')}
                                                    className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-zinc-600 dark:text-zinc-300 cursor-pointer"
                                                >
                                                    {copiedField === 'trans_res' ? <Check className="w-3 h-3 text-[#0AB600]" /> : <Copy className="w-3 h-3" />}
                                                    <span>Salin</span>
                                                </button>
                                                {onSendToChat && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSendToChatAndClose(translatedResult, `Berikut hasil terjemahan (${toLang.toUpperCase()}):`)}
                                                        className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded text-emerald-700 dark:text-emerald-300 font-semibold cursor-pointer"
                                                    >
                                                        <Send className="w-3 h-3 text-[#0AB600]" />
                                                        <span>Kirim ke Chat</span>
                                                    </button>
                                                )}
                                                {onApplyContent && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const targetField = toLang === 'en' ? 'content_en.description' : 'description';
                                                            handleApplyToForm(targetField, translatedResult);
                                                        }}
                                                        className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-[#0AB600] text-white rounded font-bold cursor-pointer"
                                                    >
                                                        <span>Terapkan</span>
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="w-full h-44 sm:h-52 p-3 text-xs bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white overflow-y-auto">
                                        {translatedResult ? (
                                            <div dangerouslySetInnerHTML={{ __html: translatedResult }} />
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-center p-2">
                                                <img
                                                    src="/assets/img/icon/notfound.png"
                                                    alt="Belum Ada Terjemahan"
                                                    className="w-16 h-auto object-contain mx-auto mb-1.5 opacity-80"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                    }}
                                                />
                                                <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Belum ada hasil terjemahan</span>
                                                <span className="text-[10px] text-zinc-400 mt-0.5">Tulis teks dan klik "Terjemahkan Sekarang".</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 4: AUTO-SUMMARIZE LAYOUT A4 */}
                    {activeTab === 'summarize' && (
                        <div className="space-y-6">
                            <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-800/40 flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-sm font-bold text-purple-900 dark:text-purple-200">
                                        Auto-Summarize & Fit Batas Karakter A4
                                    </h3>
                                    <p className="text-xs text-purple-700 dark:text-purple-400 mt-0.5">
                                        Ringkas paragraf panjang agar pas dan tidak terpotong pada lembar informasi A4.
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-zinc-300">
                                        <span>Target Maksimal:</span>
                                        <input
                                            type="number"
                                            value={maxChars}
                                            onChange={(e) => setMaxChars(Math.max(50, Number(e.target.value)))}
                                            className="w-20 px-2 py-1 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-center font-bold"
                                        />
                                        <span>karakter</span>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleSummarize}
                                        disabled={loading || !summarizeText.trim()}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#0AB600] hover:bg-[#099600] text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scissors className="w-4 h-4" />}
                                        <span>Ringkas Sekarang</span>
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between text-xs text-zinc-500">
                                        <span className="font-bold uppercase tracking-wider">Teks Asli</span>
                                        <span className="font-mono">{summarizeText.replace(/<[^>]+>/g, '').length} karakter</span>
                                    </div>
                                    <textarea
                                        value={summarizeText}
                                        onChange={(e) => setSummarizeText(e.target.value)}
                                        rows={8}
                                        placeholder="Tempel teks panjang yang ingin diringkas di sini..."
                                        className="w-full p-3 text-xs bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden focus:border-[#0AB600]"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between text-xs text-zinc-500">
                                        <span className="font-bold uppercase tracking-wider">Hasil Ringkasan Padat</span>
                                        {summarizeResult && (
                                            <span className="font-mono font-bold text-[#0AB600]">
                                                {summarizeResult.replace(/<[^>]+>/g, '').length} / {maxChars} karakter
                                            </span>
                                        )}
                                    </div>
                                    <div className="w-full h-44 sm:h-52 p-3 text-xs bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-white overflow-y-auto flex flex-col justify-between">
                                        {summarizeResult ? (
                                            <>
                                                <div className="text-slate-800 dark:text-zinc-200 leading-relaxed" dangerouslySetInnerHTML={{ __html: summarizeResult }} />
                                                <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                                                    <button
                                                        type="button"
                                                        onClick={() => copyToClipboard(summarizeResult, 'sum_res')}
                                                        className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-slate-700 dark:text-zinc-300 font-semibold cursor-pointer"
                                                    >
                                                        {copiedField === 'sum_res' ? <Check className="w-3.5 h-3.5 text-[#0AB600]" /> : <Copy className="w-3.5 h-3.5" />}
                                                        <span>Salin</span>
                                                    </button>
                                                    {onSendToChat && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleSendToChatAndClose(summarizeResult, `Berikut teks padat (A4 fit - ${maxChars} char):`)}
                                                            className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded-lg text-emerald-700 dark:text-emerald-300 font-semibold hover:bg-emerald-100 cursor-pointer"
                                                        >
                                                            <Send className="w-3.5 h-3.5 text-[#0AB600]" />
                                                            <span>Kirim ke Chat NARA</span>
                                                        </button>
                                                    )}
                                                    {onApplyContent && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleApplyToForm('description', summarizeResult)}
                                                            className="inline-flex items-center gap-1 px-3.5 py-1 text-xs bg-[#0AB600] text-white rounded-lg font-bold hover:bg-[#099600] cursor-pointer"
                                                        >
                                                            <CornerDownRight className="w-3.5 h-3.5" />
                                                            <span>Terapkan ke Deskripsi</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-center p-2">
                                                <img
                                                    src="/assets/img/icon/notfound.png"
                                                    alt="Belum Ada Ringkasan"
                                                    className="w-16 h-auto object-contain mx-auto mb-1.5 opacity-80"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                    }}
                                                />
                                                <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Belum ada ringkasan padat</span>
                                                <span className="text-[10px] text-zinc-400 mt-0.5">Tempel teks asli dan klik "Ringkas Sekarang".</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between text-xs text-zinc-500">
                    <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#0AB600]" />
                        <span>Ditenagai oleh AI NARA CoE STAS-RG Telkom University</span>
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
