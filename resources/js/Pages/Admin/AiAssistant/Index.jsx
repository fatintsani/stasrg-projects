import React, { useState, useRef, useEffect } from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import AdminLayout from '../../../Layouts/AdminLayout';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bot,
    Send,
    Sparkles,
    Trash2,
    Paperclip,
    Image as ImageIcon,
    FileText,
    X,
    Copy,
    Check,
    RefreshCw,
    Database,
    Cpu,
    FolderKanban,
    LifeBuoy,
    Users,
    Activity,
    Layers,
    ShieldCheck,
    ChevronRight,
    ArrowUpRight,
    Terminal,
    ExternalLink,
    HelpCircle,
    Mic,
    MicOff,
    Volume2,
    VolumeX,
    Square,
    Radio,
    Wand2,
    BookOpen,
    Languages,
    Scissors
} from 'lucide-react';
import { useAlert } from '../../../Context/AlertContext';
import AiSmartAssistModal from '../../../Components/Admin/AiSmartAssistModal';

/**
 * Clean markdown for smooth text-to-speech output
 */
function cleanMarkdownForSpeech(text) {
    if (!text || typeof text !== 'string') return '';
    return text
        .replace(/```[\s\S]*?```/g, ' cuplikan kode terlampir. ')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
        .replace(/[*_~#>]/g, '')
        .replace(/^[•\-\*\+]\s+/gm, '')
        .replace(/^\d+\.\s+/gm, '')
        .replace(/\|.*?\|/g, '')
        .replace(/\n+/g, ' ')
        .trim();
}

// Simple markdown formatter helper for structured responses
function FormattedMessage({ content }) {
    if (!content) return null;

    const lines = content.split('\n');
    const elements = [];
    let inCodeBlock = false;
    let codeContent = [];
    let inTable = false;
    let tableRows = [];

    const flushCodeBlock = (key) => {
        if (codeContent.length > 0) {
            elements.push(
                <pre key={`code-${key}`} className="my-2 p-3 rounded-xl bg-zinc-900 text-zinc-100 font-mono text-xs overflow-x-auto border border-zinc-800">
                    <code>{codeContent.join('\n')}</code>
                </pre>
            );
            codeContent = [];
        }
    };

    const flushTable = (key) => {
        if (tableRows.length > 0) {
            elements.push(
                <div key={`table-wrapper-${key}`} className="my-3 overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <table className="min-w-full divide-y divide-zinc-200 dark:border-zinc-800 text-xs">
                        {tableRows.map((row, rIdx) => {
                            const cells = row.split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
                            if (cells.length === 0 || row.includes('---')) return null;
                            if (rIdx === 0) {
                                return (
                                    <thead key={`th-${rIdx}`} className="bg-zinc-100 dark:bg-zinc-800/80">
                                        <tr>
                                            {cells.map((cell, cIdx) => (
                                                <th key={`th-c-${cIdx}`} className="px-3 py-2 text-left font-bold text-slate-800 dark:text-zinc-200">
                                                    {cell.trim()}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                );
                            }
                            return (
                                <tbody key={`tb-${rIdx}`} className="divide-y divide-zinc-100 dark:divide-zinc-800/60 bg-white dark:bg-zinc-900/50">
                                    <tr>
                                        {cells.map((cell, cIdx) => (
                                            <td key={`tb-c-${cIdx}`} className="px-3 py-2 text-zinc-600 dark:text-zinc-300">
                                                {cell.trim()}
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            );
                        })}
                    </table>
                </div>
            );
            tableRows = [];
        }
    };

    lines.forEach((line, idx) => {
        if (line.trim().startsWith('```')) {
            if (inCodeBlock) {
                flushCodeBlock(idx);
                inCodeBlock = false;
            } else {
                inCodeBlock = true;
            }
            return;
        }

        if (inCodeBlock) {
            codeContent.push(line);
            return;
        }

        if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
            inTable = true;
            tableRows.push(line.trim());
            return;
        } else if (inTable) {
            flushTable(idx);
            inTable = false;
        }

        const trimmed = line.trim();
        if (trimmed === '') {
            elements.push(<div key={`empty-${idx}`} className="h-2" />);
            return;
        }

        // Headings
        if (trimmed.startsWith('### ')) {
            elements.push(
                <h4 key={`h4-${idx}`} className="text-sm font-bold text-slate-900 dark:text-white mt-3 mb-1">
                    {trimmed.replace('### ', '')}
                </h4>
            );
            return;
        }
        if (trimmed.startsWith('## ')) {
            elements.push(
                <h3 key={`h3-${idx}`} className="text-base font-extrabold text-slate-900 dark:text-white mt-4 mb-1.5 text-[#0AB600] dark:text-emerald-400">
                    {trimmed.replace('## ', '')}
                </h3>
            );
            return;
        }
        if (trimmed.startsWith('# ')) {
            elements.push(
                <h2 key={`h2-${idx}`} className="text-lg font-extrabold text-slate-900 dark:text-white mt-4 mb-2">
                    {trimmed.replace('# ', '')}
                </h2>
            );
            return;
        }

        // List item
        if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const rawItem = trimmed.replace(/^[•\-\*]\s+/, '');
            elements.push(
                <div key={`li-${idx}`} className="flex items-start gap-2 my-0.5 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    <span className="text-[#0AB600] font-bold mt-1 text-xs">•</span>
                    <span dangerouslySetInnerHTML={{ __html: formatInline(rawItem) }} />
                </div>
            );
            return;
        }

        // Regular paragraph
        elements.push(
            <p key={`p-${idx}`} className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed my-1" dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }} />
        );
    });

    if (inCodeBlock) flushCodeBlock('end');
    if (inTable) flushTable('end');

    return <div className="space-y-1">{elements}</div>;
}

function formatInline(str) {
    if (!str) return '';
    return str
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900 dark:text-white">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
        .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[#0AB600] dark:text-emerald-400 font-mono text-[11px]">$1</code>');
}

export default function AiAssistantIndex({
    stats = {},
    aiConfig = {},
    categories = [],
    researchersCount = 0,
    projectsList = [],
}) {
    const { props: pageProps } = usePage() || { props: {} };
    const user = pageProps?.auth?.user || { name: 'Administrator' };
    const { showError, showSuccess, showWarning } = useAlert();

    // AI Smart Assist Studio State
    const [isSmartAssistOpen, setIsSmartAssistOpen] = useState(false);
    const [smartAssistTab, setSmartAssistTab] = useState('executive_summary');
    const [smartAssistInitialProject, setSmartAssistInitialProject] = useState(null);

    const openSmartAssistStudio = (tab = 'executive_summary', project = null) => {
        setSmartAssistTab(tab);
        setSmartAssistInitialProject(project);
        setIsSmartAssistOpen(true);
    };

    const [messages, setMessages] = useState(() => [
        {
            id: 'welcome',
            role: 'assistant',
            content: `Halo **${user.name || 'Administrator'}**! Saya **NARA**, Asisten AI CoE STAS-RG Telkom University dengan akses menyeluruh ke database platform STAS RG Projects.\n\nSaya dapat membantu Anda mengolah data inovasi riset, meninjau tiket bantuan, menganalisis profil peneliti, memverifikasi batasan dokumen A4/Trifold, menyusun pengumuman, hingga menganalisis gambar/diagram teknis.\n\nAnda juga dapat menggunakan fitur **Input Suara (Voice)** melalui mikrofon atau mendengarkan jawaban saya.\n\nApa yang ingin Anda tinjau atau diskusikan hari ini?`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
    ]);

    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [activeMode, setActiveMode] = useState('all_data');
    const [selectedLanguage, setSelectedLanguage] = useState('id');
    const [copiedIndex, setCopiedIndex] = useState(null);

    // Voice / Audio States
    const [isListening, setIsListening] = useState(false);
    const [speakingMessageId, setSpeakingMessageId] = useState(null);
    const [isAutoVoice, setIsAutoVoice] = useState(false);
    const recognitionRef = useRef(null);

    // Attachment state
    const [attachment, setAttachment] = useState(null); // { file, preview, name, type, size }
    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    // Handle auto-resizing textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
        }
    }, [inputText]);

    // Web Speech API: Voice Input Recognition Setup
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = selectedLanguage === 'id' ? 'id-ID' : 'en-US';

            recognition.onstart = () => {
                setIsListening(true);
            };

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                if (transcript) {
                    setInputText(prev => (prev ? `${prev} ${transcript}` : transcript));
                }
            };

            recognition.onerror = (event) => {
                console.warn('Speech recognition error:', event.error);
                setIsListening(false);
                if (event.error === 'not-allowed') {
                    showError('Izin Ditolak', 'Akses mikrofon ditolak oleh browser.');
                }
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        }

        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.abort();
                } catch {
                    // ignore
                }
            }
            if (typeof window !== 'undefined' && window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, [selectedLanguage]);

    // Toggle Microphone Voice Input
    const handleToggleVoice = () => {
        if (!recognitionRef.current) {
            showWarning({
                title: 'Input Suara Tidak Didukung',
                message: 'Browser Anda tidak mendukung Web Speech Recognition API. Silakan gunakan Google Chrome, Edge, atau browser modern lainnya.',
                confirmText: 'Mengerti',
            });
            return;
        }

        if (isListening) {
            try {
                recognitionRef.current.stop();
            } catch {
                // ignore
            }
            setIsListening(false);
        } else {
            try {
                recognitionRef.current.lang = selectedLanguage === 'id' ? 'id-ID' : 'en-US';
                recognitionRef.current.start();
            } catch (err) {
                console.error('Failed to start speech recognition:', err);
                setIsListening(false);
            }
        }
    };

    // Text-to-Speech (TTS) Voice Readout
    const handleToggleTTS = (messageId, rawContent) => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
            showWarning({
                title: 'Audio Tidak Didukung',
                message: 'Browser Anda tidak mendukung Text-to-Speech Web Speech API.',
                confirmText: 'Mengerti',
            });
            return;
        }

        if (speakingMessageId === messageId) {
            window.speechSynthesis.cancel();
            setSpeakingMessageId(null);
            return;
        }

        window.speechSynthesis.cancel();
        const cleanText = cleanMarkdownForSpeech(rawContent);
        if (!cleanText) return;

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = selectedLanguage === 'id' ? 'id-ID' : 'en-US';
        utterance.rate = 1.05;
        utterance.pitch = 1.0;

        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => selectedLanguage === 'id' ? v.lang.startsWith('id') : v.lang.startsWith('en'));
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        utterance.onstart = () => {
            setSpeakingMessageId(messageId);
        };

        utterance.onend = () => {
            setSpeakingMessageId(null);
        };

        utterance.onerror = () => {
            setSpeakingMessageId(null);
        };

        window.speechSynthesis.speak(utterance);
    };

    const modes = [
        { id: 'all_data', name: 'Semua Data & Analitik', desc: 'Akses penuh metrik, proyek, dan tiket live', icon: Database },
        { id: 'research', name: 'Riset & Metodologi', desc: 'Analisis spesifikasi IoT, paten & keahlian lab', icon: Cpu },
        { id: 'tickets', name: 'Helpdesk & Tiket', desc: 'Evaluasi tiket dukungan & isu pengguna', icon: LifeBuoy },
        { id: 'documents', name: 'Validator Dokumen', desc: 'Cek batasan karakter A4 Flyer & Trifold', icon: Layers },
        { id: 'system', name: 'Operasional Sistem', desc: 'Audit log aktivitas & status pengguna', icon: Activity },
    ];

    const quickPrompts = [
        {
            title: 'Ringkasan Eksekutif Proyek',
            prompt: 'Berikan ringkasan eksekutif seluruh portofolio proyek riset CoE STAS-RG yang terdaftar di database saat ini beserta statusnya.',
            icon: FolderKanban,
        },
        {
            title: 'Tinjau Tiket Bantuan Terbuka',
            prompt: 'Tolong analisis tiket bantuan helpdesk yang masih terbuka atau berstatus mendesak (urgent), dan berikan rekomendasi tindak lanjutnya.',
            icon: LifeBuoy,
        },
        {
            title: 'Pemetaan Keahlian Peneliti',
            prompt: 'Tampilkan daftar peneliti dan dosen CoE STAS-RG beserta afiliasi laboratorium dan fokus keahlian masing-masing.',
            icon: Users,
        },
        {
            title: 'Draf Siaran Berita Inovasi',
            prompt: 'Buatkan draf teks pengumuman resmi (press release singkat) mengenai kesiapan produk riset unggulan CoE STAS-RG untuk dipamerkan ke mitra industri.',
            icon: Sparkles,
        },
    ];

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            showError('Ukuran Terlalu Besar', 'Batas maksimal berkas lampiran adalah 10MB.');
            return;
        }

        const isImage = file.type.startsWith('image/');
        const reader = new FileReader();

        reader.onload = (event) => {
            setAttachment({
                file,
                name: file.name,
                type: file.type,
                size: (file.size / 1024).toFixed(1) + ' KB',
                isImage,
                preview: isImage ? event.target.result : null,
                rawBase64: isImage ? event.target.result : null,
            });
        };

        if (isImage) {
            reader.readAsDataURL(file);
        } else {
            reader.readAsText(file);
        }
    };

    const handleRemoveAttachment = () => {
        setAttachment(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleCopyMessage = (text, idx) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(idx);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const handleClearChat = () => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        setSpeakingMessageId(null);
        setMessages([
            {
                id: 'welcome-reset',
                role: 'assistant',
                content: `Percakapan telah direset. Halo **${user.name || 'Administrator'}**, NARA siap membantu Anda kembali menganalisis sistem STAS RG Projects. Silakan ajukan pertanyaan atau instruksi Anda.`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
        ]);
        handleRemoveAttachment();
    };

    const handleSendMessage = async (customPrompt = null) => {
        const queryText = (typeof customPrompt === 'string' ? customPrompt : inputText).trim();
        if (!queryText && !attachment) return;

        if (isListening && recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }

        const userMsgId = 'user-' + Date.now();
        const newUserMessage = {
            id: userMsgId,
            role: 'user',
            content: queryText,
            attachment: attachment ? { ...attachment } : null,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        const updatedHistory = [...messages, newUserMessage];
        setMessages(updatedHistory);
        setInputText('');
        const currentAttachment = attachment;
        handleRemoveAttachment();
        setIsLoading(true);

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

            const formData = new FormData();
            formData.append('message', queryText);
            formData.append('language', selectedLanguage);
            formData.append('mode', activeMode);

            const historyPayload = messages.slice(-10).map(m => ({
                role: m.role === 'assistant' ? 'assistant' : 'user',
                content: m.content,
            }));
            formData.append('history', JSON.stringify(historyPayload));

            if (currentAttachment?.file) {
                formData.append('attachment', currentAttachment.file);
            }

            const response = await fetch('/ai-assistant/chat', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                body: formData,
            });

            const data = await response.json();

            if (response.ok && data.status === 'success') {
                const newAssistantMsgId = 'assistant-' + Date.now();
                const assistantMessage = {
                    id: newAssistantMsgId,
                    role: 'assistant',
                    content: data.reply || 'Tidak ada balasan dari model AI.',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                };
                setMessages(prev => [...prev, assistantMessage]);

                // Auto-read voice if enabled
                if (isAutoVoice) {
                    setTimeout(() => {
                        handleToggleTTS(newAssistantMsgId, assistantMessage.content);
                    }, 300);
                }
            } else {
                const errorText = data.message || 'Gagal memproses permintaan AI. Pastikan konfigurasi API Key sudah benar.';
                showError('Kendala AI', errorText);
                setMessages(prev => [
                    ...prev,
                    {
                        id: 'error-' + Date.now(),
                        role: 'assistant',
                        content: `**Gagal Mendapatkan Respon:** ${errorText}\n\nSilakan periksa pengaturan koneksi AI di menu [Settings](/settings).`,
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    }
                ]);
            }
        } catch (error) {
            console.error('Chat error:', error);
            showError('Kesalahan Jaringan', 'Terjadi gangguan jaringan saat menghubungi asisten AI.');
            setMessages(prev => [
                ...prev,
                {
                    id: 'error-' + Date.now(),
                    role: 'assistant',
                    content: `**Terjadi Kesalahan Koneksi:** Gagal menghubungi server asisten AI. Silakan coba kembali.`,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <AdminLayout title="NARA AI Assistant">
            <Head title="NARA AI Assistant — Admin Workspace" />

            <div className="space-y-5">
                {/* ═══════ TOP HEADER & SYSTEM STATUS ═══════ */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
                    {/* Left: Avatar & Info */}
                    <div className="flex items-center gap-3.5 min-w-0">
                        <div className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-[#0AB600]/40 bg-zinc-100 dark:bg-zinc-800 shrink-0 shadow-xs">
                            <img
                                src="/assets/img/icon/profile_cs.png"
                                alt="NARA AI"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.src = '/assets/img/icon/profile_cs.png';
                                }}
                            />
                            <span className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-[#0AB600] ring-2 ring-white dark:ring-[#121824]" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                                    NARA AI Assistant
                                </h1>
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-[#0AB600]/10 text-[#0AB600] border border-[#0AB600]/25">
                                    <ShieldCheck className="w-3 h-3 text-[#0AB600]" />
                                    <span>Admin Co-Pilot</span>
                                </span>
                                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800/90 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/80">
                                    <Sparkles className="w-2.5 h-2.5 text-[#0AB600]" />
                                    <span>{aiConfig.provider === 'gemini' ? 'Google Gemini AI' : 'OpenAI'} ({aiConfig.model})</span>
                                </span>
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                Akses Penuh Basis Data STAS RG Projects CoE STAS-RG
                            </p>
                        </div>
                    </div>

                    {/* Right: Top Action Controls */}
                    <div className="flex items-center gap-2 self-stretch md:self-auto justify-end flex-wrap">
                        {/* Open Smart Assist Studio Button */}
                        <button
                            type="button"
                            onClick={() => openSmartAssistStudio('executive_summary')}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-linear-to-r from-emerald-600 to-[#0AB600] hover:from-emerald-700 hover:to-[#099600] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                        >
                            <Wand2 className="w-3.5 h-3.5" />
                            <span>Smart Assist Studio</span>
                        </button>

                        {/* Auto-read voice toggle */}
                        <button
                            type="button"
                            onClick={() => {
                                setIsAutoVoice(!isAutoVoice);
                                if (isAutoVoice && typeof window !== 'undefined' && window.speechSynthesis) {
                                    window.speechSynthesis.cancel();
                                    setSpeakingMessageId(null);
                                }
                            }}
                            title={isAutoVoice ? 'Matikan pembacaan suara otomatis' : 'Aktifkan pembacaan suara otomatis untuk jawaban AI'}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                                isAutoVoice
                                    ? 'bg-[#0AB600]/10 text-[#0AB600] border-[#0AB600]/40 shadow-xs'
                                    : 'bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/80 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200/80 dark:border-zinc-700/70 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            {isAutoVoice ? (
                                <>
                                    <Volume2 className="w-3.5 h-3.5 text-[#0AB600] animate-pulse" />
                                    <span>Suara Otomatis: On</span>
                                </>
                            ) : (
                                <>
                                    <VolumeX className="w-3.5 h-3.5" />
                                    <span>Suara Otomatis: Off</span>
                                </>
                            )}
                        </button>

                        {/* Reset Chat Button */}
                        <button
                            type="button"
                            onClick={handleClearChat}
                            title="Reset percakapan"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-50 hover:bg-rose-50 dark:bg-zinc-800/80 dark:hover:bg-rose-950/30 text-xs font-semibold text-zinc-600 hover:text-rose-600 dark:text-zinc-300 dark:hover:text-rose-400 border border-zinc-200/80 dark:border-zinc-700/70 transition-colors cursor-pointer"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Bersihkan Chat</span>
                        </button>

                        {/* Language Selector */}
                        <div className="inline-flex p-1 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/70 text-xs font-semibold">
                            <button
                                type="button"
                                onClick={() => setSelectedLanguage('id')}
                                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                                    selectedLanguage === 'id'
                                        ? 'bg-white dark:bg-zinc-700 text-[#0AB600] shadow-xs'
                                        : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                                }`}
                            >
                                Indonesia
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedLanguage('en')}
                                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                                    selectedLanguage === 'en'
                                        ? 'bg-white dark:bg-zinc-700 text-[#0AB600] shadow-xs'
                                        : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                                }`}
                            >
                                English
                            </button>
                        </div>
                    </div>
                </div>

                {/* ═══════ MAIN WORKSPACE GRID ═══════ */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                    
                    {/* LEFT SIDEBAR: Mode & Quick Intelligence (Span 4) */}
                    <div className="lg:col-span-4 space-y-4">
                        
                        {/* Mode Switcher Card */}
                        <div className="p-4 rounded-2xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-400">
                                    Mode Analisis AI
                                </span>
                                <span className="text-[10px] font-semibold text-[#0AB600] bg-[#0AB600]/10 px-2 py-0.5 rounded-full">
                                    Live Query
                                </span>
                            </div>

                            <div className="space-y-1.5">
                                {modes.map((mode) => {
                                    const Icon = mode.icon;
                                    const isSelected = activeMode === mode.id;
                                    return (
                                        <button
                                            key={mode.id}
                                            type="button"
                                            onClick={() => setActiveMode(mode.id)}
                                            className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                                                isSelected
                                                    ? 'bg-[#0AB600]/10 border border-[#0AB600]/35 text-[#0AB600] shadow-2xs'
                                                    : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border border-transparent'
                                            }`}
                                        >
                                            <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                                                isSelected ? 'bg-[#0AB600] text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                                            }`}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs font-bold truncate">
                                                    {mode.name}
                                                </div>
                                                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug mt-0.5">
                                                    {mode.desc}
                                                </p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* NARA Smart Assist Studio Tools Card */}
                        <div className="p-4 rounded-2xl bg-linear-to-br from-emerald-500/5 via-transparent to-transparent border border-emerald-500/20 dark:border-emerald-500/10 bg-white dark:bg-[#121824] shadow-xs space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold font-mono uppercase tracking-wider text-[#0AB600] flex items-center gap-1.5">
                                    <Wand2 className="w-3.5 h-3.5" />
                                    <span>Smart Assist Studio</span>
                                </span>
                                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                                    4 Alat Riset
                                </span>
                            </div>

                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                Transformasi dokumen, pembuatan ringkasan eksekutif, formatting abstrak IMRaD, terjemahan dua arah, serta summarizer A4 otomatis.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => openSmartAssistStudio('executive_summary')}
                                    className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-zinc-200/60 dark:border-zinc-800 hover:border-emerald-400 text-left transition-all group cursor-pointer"
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <FileText className="w-3.5 h-3.5 text-[#0AB600]" />
                                        <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 group-hover:text-[#0AB600]">
                                            Ringkasan
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-zinc-500 line-clamp-1">Eksekutif & Strategis</p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => openSmartAssistStudio('abstract')}
                                    className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-zinc-200/60 dark:border-zinc-800 hover:border-emerald-400 text-left transition-all group cursor-pointer"
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <BookOpen className="w-3.5 h-3.5 text-[#0AB600]" />
                                        <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 group-hover:text-[#0AB600]">
                                            Format Abstrak
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-zinc-500 line-clamp-1">Standar IMRaD</p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => openSmartAssistStudio('translate')}
                                    className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-zinc-200/60 dark:border-zinc-800 hover:border-emerald-400 text-left transition-all group cursor-pointer"
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <Languages className="w-3.5 h-3.5 text-[#0AB600]" />
                                        <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 group-hover:text-[#0AB600]">
                                            Terjemahan
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-zinc-500 line-clamp-1">Akademik ID ⟷ EN</p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => openSmartAssistStudio('summarize')}
                                    className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-zinc-200/60 dark:border-zinc-800 hover:border-emerald-400 text-left transition-all group cursor-pointer"
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <Scissors className="w-3.5 h-3.5 text-[#0AB600]" />
                                        <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 group-hover:text-[#0AB600]">
                                            Auto-Summarize
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-zinc-500 line-clamp-1">Fit Batas Layout A4</p>
                                </button>
                            </div>
                        </div>

                        {/* Live Context Quick Metrics */}
                        <div className="p-4 rounded-2xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-3">
                            <span className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-400">
                                Ringkasan Database Aktif
                            </span>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
                                    <span className="text-[10px] text-zinc-500 block">Total Proyek</span>
                                    <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                                        {stats.total_projects || 0}
                                    </span>
                                    <span className="text-[9px] text-emerald-600 block mt-0.5">
                                        {stats.published_projects || 0} Terpublikasi
                                    </span>
                                </div>
                                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
                                    <span className="text-[10px] text-zinc-500 block">Tiket Bantuan</span>
                                    <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                                        {stats.open_tickets || 0}
                                    </span>
                                    <span className="text-[9px] text-amber-600 block mt-0.5">Perlu Tindakan</span>
                                </div>
                                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
                                    <span className="text-[10px] text-zinc-500 block">Peneliti & Dosen</span>
                                    <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                                        {researchersCount || 0}
                                    </span>
                                    <span className="text-[9px] text-zinc-400 block mt-0.5">Terdaftar</span>
                                </div>
                                <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
                                    <span className="text-[10px] text-zinc-500 block">Pending User</span>
                                    <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                                        {stats.pending_users || 0}
                                    </span>
                                    <span className="text-[9px] text-blue-600 block mt-0.5">Verifikasi Admin</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Prompts Hub */}
                        <div className="p-4 rounded-2xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-2.5">
                            <span className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-400">
                                Pintasan Perintah Cepat
                            </span>

                            <div className="space-y-1.5">
                                {quickPrompts.map((qp, idx) => {
                                    const Icon = qp.icon;
                                    return (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => handleSendMessage(qp.prompt)}
                                            disabled={isLoading}
                                            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 hover:bg-[#0AB600]/10 dark:hover:bg-[#0AB600]/15 border border-zinc-200/60 dark:border-zinc-800 hover:border-[#0AB600]/30 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-[#0AB600] dark:hover:text-[#0AB600] transition-all group cursor-pointer disabled:opacity-50"
                                        >
                                            <span className="flex items-center gap-2 truncate">
                                                <Icon className="w-3.5 h-3.5 text-[#0AB600] shrink-0" />
                                                <span className="truncate">{qp.title}</span>
                                            </span>
                                            <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                    </div>

                    {/* RIGHT MAIN PANEL: Interactive Chat Stream & Composer (Span 8) */}
                    <div className="lg:col-span-8 flex flex-col h-[700px] rounded-2xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 shadow-xs overflow-hidden">
                        
                        {/* Messages Stream Area */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                            {messages.map((msg, index) => {
                                const isAssistant = msg.role === 'assistant';
                                const isSpeaking = speakingMessageId === msg.id;

                                return (
                                    <motion.div
                                        key={msg.id || index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className={`flex gap-3 ${isAssistant ? 'items-start' : 'items-start flex-row-reverse'}`}
                                    >
                                        {/* Avatar */}
                                        <div className="shrink-0">
                                            {isAssistant ? (
                                                <div className={`relative w-9 h-9 rounded-xl overflow-hidden border ${isSpeaking ? 'border-[#0AB600] ring-2 ring-[#0AB600]/30' : 'border-[#0AB600]/30'} bg-zinc-100 dark:bg-zinc-800 shadow-xs transition-all`}>
                                                    <img
                                                        src="/assets/img/icon/profile_cs.png"
                                                        alt="NARA"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-zinc-700 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                                                    {user.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}
                                                </div>
                                            )}
                                        </div>

                                        {/* Message Bubble Body */}
                                        <div className={`max-w-[85%] space-y-1.5 ${isAssistant ? 'text-left' : 'text-right'}`}>
                                            <div className="flex items-center gap-2 text-[10px] text-zinc-400 px-1">
                                                <span className="font-bold text-slate-700 dark:text-zinc-300">
                                                    {isAssistant ? 'NARA Admin Co-Pilot' : (user.name || 'Admin')}
                                                </span>
                                                <span>•</span>
                                                <span>{msg.timestamp}</span>
                                            </div>

                                            <div className={`p-4 rounded-2xl text-xs sm:text-sm ${
                                                isAssistant
                                                    ? 'bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 text-zinc-800 dark:text-zinc-200 shadow-2xs'
                                                    : 'bg-[#0AB600] text-white font-normal shadow-sm text-left'
                                            }`}>
                                                {/* Attached Image/File preview in user message */}
                                                {msg.attachment && (
                                                    <div className="mb-2.5 p-2 rounded-xl bg-black/10 border border-white/10 flex items-center gap-2 text-xs">
                                                        {msg.attachment.isImage ? (
                                                            <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-white/20">
                                                                <img src={msg.attachment.preview} alt="Attached" className="w-full h-full object-cover" />
                                                            </div>
                                                        ) : (
                                                            <FileText className="w-5 h-5 text-white/80 shrink-0" />
                                                        )}
                                                        <div className="truncate text-left">
                                                            <span className="block font-semibold truncate text-[11px]">{msg.attachment.name}</span>
                                                            <span className="block text-[9px] text-white/70">{msg.attachment.size}</span>
                                                        </div>
                                                    </div>
                                                )}

                                                <FormattedMessage content={msg.content} />
                                            </div>

                                            {/* Assistant Action Footers (Voice Playback & Copy button) */}
                                            {isAssistant && (
                                                <div className="flex items-center gap-3 px-1 pt-0.5">
                                                    {/* Text-to-Speech Play Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleTTS(msg.id, msg.content)}
                                                        className={`inline-flex items-center gap-1.5 text-[11px] font-medium transition-colors cursor-pointer ${
                                                            isSpeaking
                                                                ? 'text-[#0AB600] font-bold'
                                                                : 'text-zinc-400 hover:text-[#0AB600]'
                                                        }`}
                                                    >
                                                        {isSpeaking ? (
                                                            <>
                                                                <Square className="w-3 h-3 text-red-500 fill-red-500" />
                                                                <span className="text-[#0AB600]">Hentikan Suara</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Volume2 className="w-3.5 h-3.5" />
                                                                <span>Dengarkan Suara NARA</span>
                                                            </>
                                                        )}
                                                    </button>

                                                    <span className="text-zinc-300 dark:text-zinc-700">•</span>

                                                    {/* Copy Text Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopyMessage(msg.content, index)}
                                                        className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-[#0AB600] transition-colors cursor-pointer"
                                                    >
                                                        {copiedIndex === index ? (
                                                            <>
                                                                <Check className="w-3 h-3 text-[#0AB600]" />
                                                                <span className="text-[#0AB600]">Tersalin</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Copy className="w-3 h-3" />
                                                                <span>Salin respon</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}

                            {/* Live Typing Indicator */}
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-3"
                                >
                                    <div className="w-9 h-9 rounded-xl overflow-hidden border border-[#0AB600]/30 bg-zinc-100 dark:bg-zinc-800 shrink-0">
                                        <img src="/assets/img/icon/profile_cs.png" alt="NARA" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-[#0AB600] animate-pulse" />
                                        <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                                            NARA sedang menganalisis data sistem...
                                        </span>
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Voice Listening Active Wave Banner */}
                        <AnimatePresence>
                            {isListening && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="px-4 py-2.5 bg-red-500/10 border-t border-red-500/25 flex items-center justify-between gap-3 text-xs text-red-600 dark:text-red-400"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <span className="relative flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                                        </span>
                                        <span className="font-semibold">
                                            Mendengarkan suara Anda ({selectedLanguage === 'id' ? 'Bahasa Indonesia' : 'English'})... Silakan berbicara langsung ke mikrofon.
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleToggleVoice}
                                        className="px-2.5 py-1 rounded-lg bg-red-500 hover:bg-red-600 text-white text-[11px] font-bold transition-colors cursor-pointer"
                                    >
                                        Selesai Bicara
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Attachment Preview in Composer */}
                        {attachment && (
                            <div className="px-4 py-2 border-t border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50 dark:bg-zinc-900/80 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5 truncate">
                                    {attachment.isImage ? (
                                        <div className="w-8 h-8 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 shrink-0">
                                            <img src={attachment.preview} alt="Lampiran" className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <FileText className="w-5 h-5 text-[#0AB600] shrink-0" />
                                    )}
                                    <div className="truncate">
                                        <span className="block text-xs font-semibold text-slate-800 dark:text-zinc-200 truncate">
                                            {attachment.name}
                                        </span>
                                        <span className="block text-[10px] text-zinc-400">
                                            {attachment.size}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleRemoveAttachment}
                                    className="p-1 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {/* Bottom Input Composer */}
                        <div className="p-3 sm:p-4 border-t border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-[#121824]">
                            <div className="relative flex flex-col p-2.5 sm:p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 focus-within:border-[#0AB600] focus-within:ring-2 focus-within:ring-[#0AB600]/20 transition-all shadow-xs">
                                
                                {/* Hidden File Input */}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    accept="image/*,.pdf,.txt,.csv,.json,.md"
                                    className="hidden"
                                />

                                {/* Auto-resizing Textarea */}
                                <textarea
                                    ref={textareaRef}
                                    rows={1}
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={isListening ? 'Mendengarkan suara Anda...' : 'Tanyakan analisis proyek, tiket, peneliti, draf siaran, atau bicara via mikrofon...'}
                                    className="w-full bg-transparent border-0 resize-none px-1 py-1 text-xs sm:text-sm text-slate-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-0 focus:outline-none min-h-[38px] max-h-40 overflow-y-auto leading-relaxed"
                                />

                                {/* Bottom Toolbar inside Box */}
                                <div className="flex items-center justify-between pt-2 mt-1 border-t border-zinc-200/40 dark:border-zinc-800/60">
                                    {/* Left Tools: Attachment & Mic */}
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            title="Lampirkan gambar/dokumen (Maks 10MB)"
                                            className="p-2 rounded-xl text-zinc-500 hover:text-[#0AB600] hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                                        >
                                            <Paperclip className="w-4 h-4" />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleToggleVoice}
                                            title={isListening ? 'Hentikan rekaman suara' : 'Mulai bicara dengan mikrofon (Voice Input)'}
                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                                isListening
                                                    ? 'bg-red-500 text-white animate-pulse shadow-xs shadow-red-500/30'
                                                    : 'text-zinc-500 hover:text-[#0AB600] hover:bg-zinc-200/60 dark:hover:bg-zinc-800'
                                            }`}
                                        >
                                            {isListening ? (
                                                <>
                                                    <MicOff className="w-4 h-4" />
                                                    <span className="text-[11px] font-bold">Merekam...</span>
                                                </>
                                            ) : (
                                                <Mic className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>

                                    {/* Right: Send Button */}
                                    <button
                                        type="button"
                                        onClick={() => handleSendMessage()}
                                        disabled={isLoading || (!inputText.trim() && !attachment)}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0AB600] hover:bg-[#089600] disabled:bg-zinc-200 dark:disabled:bg-zinc-800 text-white disabled:text-zinc-400 dark:disabled:text-zinc-600 font-bold text-xs transition-all shadow-xs cursor-pointer disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? (
                                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                            <>
                                                <Send className="w-3.5 h-3.5" />
                                                <span>Kirim</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Shortcut helper footer */}
                            <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-2 px-1">
                                <span className="flex items-center gap-1.5">
                                    <span>Tekan <kbd className="font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300">Enter ↵</kbd> untuk kirim, atau <kbd className="font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300">Shift + Enter</kbd> untuk baris baru</span>
                                </span>
                                <span className="hidden sm:inline font-medium text-zinc-400">CoE STAS-RG Internal Assistant</span>
                            </div>
                        </div>

                    </div>

                </div>
            </div>

            {/* NARA AI Smart Assist Studio Modal */}
            <AiSmartAssistModal
                isOpen={isSmartAssistOpen}
                onClose={() => setIsSmartAssistOpen(false)}
                projectsList={projectsList}
                projectData={smartAssistInitialProject || {}}
                initialTab={smartAssistTab}
                onSendToChat={(text) => {
                    setInputText(text);
                    if (textareaRef.current) {
                        textareaRef.current.focus();
                    }
                }}
            />
        </AdminLayout>
    );
}
