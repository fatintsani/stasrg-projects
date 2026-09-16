import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { AppProvider, useApp } from '../Context/AppContext';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import AiChatWidget from '../Components/AiChatWidget';
import {
    Bot,
    Sparkles,
    Compass,
    BookOpen,
    FileText,
    Layers,
    ShieldCheck,
    Cpu,
    Zap,
    Send,
    LifeBuoy,
    HelpCircle,
    CheckCircle2,
    ArrowRight,
    MessageSquareQuote,
    Building2,
    GraduationCap,
    Workflow,
    Search,
    QrCode,
    Mic,
    Paperclip
} from 'lucide-react';

function NaraContent() {
    const { t, language } = useApp();
    const isId = language === 'id';

    const handleOpenChat = (prompt = null, mode = 'general') => {
        window.dispatchEvent(new CustomEvent('open-nara-chat', { 
            detail: { prompt, mode } 
        }));
    };

    const philosophyItems = [
        {
            letter: 'N',
            image: '/assets/img/icon/nara/n.png',
            word: 'Navigation',
            desc: isId 
                ? 'Memandu penelusuran katalog inovasi, portofolio riset, dan arsitektur dokumen STAS RG Projects.'
                : 'Guiding discovery across innovation catalogs, research portfolios, and document architectures.',
        },
        {
            letter: 'A',
            image: '/assets/img/icon/nara/a1.png',
            word: 'Academic & Applied',
            desc: isId 
                ? 'Berakar pada tridharma perguruan tinggi dan penerapan teknologi terapan berkelanjutan.'
                : 'Rooted in academic excellence and sustainable applied technology research.',
        },
        {
            letter: 'R',
            image: '/assets/img/icon/nara/r.png',
            word: 'Research',
            desc: isId 
                ? 'Menghubungkan direktori riset, paten, dan luaran inovasi CoE STAS-RG Telkom University.'
                : 'Connecting research directories, patents, and innovation outputs of CoE STAS-RG.',
        },
        {
            letter: 'A',
            image: '/assets/img/icon/nara/a2.png',
            word: 'Assistant',
            desc: isId 
                ? 'Mendampingi peneliti, mahasiswa, dan mitra industri dengan layanan interaktif 24/7.'
                : 'Assisting researchers, students, and industry partners with 24/7 interactive support.',
        },
    ];

    const capabilities = [
        {
            icon: Search,
            title: isId ? 'Pencarian & Grounding Riset Cerdas' : 'Smart RAG Research Grounding',
            desc: isId 
                ? 'Temukan detail proyek unggulan CoE STAS-RG di bidang Smart Agriculture, IoT Sensing, UAV Aerospace, Telekomunikasi, Paten/HKI, dan tim peneliti.'
                : 'Discover key CoE STAS-RG projects in Smart Agriculture, IoT Sensing, UAV Aerospace, Telecommunications, Patents, and researchers.',
            points: isId 
                ? ['Pencarian semantik berbasis topik & kata kunci', 'Spesifikasi, manfaat & publikasi DOI', 'Direktori keahlian peneliti lab']
                : ['Keyword & topic-based semantic retrieval', 'Specs, benefits & publication DOIs', 'Lab researcher expertise directory']
        },
        {
            icon: Mic,
            title: isId ? 'Interaksi Suara (Voice Input & TTS)' : 'Voice Interaction (STT & TTS)',
            desc: isId 
                ? 'Bicara langsung menggunakan mikrofon tanpa perlu mengetik, serta dengarkan suara balasan NARA secara alami dalam Bahasa Indonesia dan Inggris.'
                : 'Talk directly using your microphone without typing, and listen to natural text-to-speech voice responses in Indonesian and English.',
            points: isId 
                ? ['Speech-to-Text cerdas dengan Web Speech API', 'Text-to-Speech audio player alami', 'Dukungan bilingual ID & EN']
                : ['Smart Speech-to-Text via Web Speech API', 'Natural Text-to-Speech audio reader', 'Bilingual ID & EN speech support']
        },
        {
            icon: Paperclip,
            title: isId ? 'Analisis Berkas & Multimodal Vision' : 'File & Multimodal Vision Analysis',
            desc: isId 
                ? 'Lampirkan berkas dokumen (PDF, TXT, CSV, JSON, Markdown) atau gambar diagram arsitektur / prototipe IoT untuk dianalisis dan dibedah langsung oleh NARA.'
                : 'Attach documents (PDF, TXT, CSV, JSON, Markdown) or system architecture images / IoT prototype photos for in-depth AI analysis.',
            points: isId 
                ? ['Analisis naskah dokumen & data CSV', 'Pemahaman visual multimodal Google Gemini', 'Bantuan bedah spesifikasi teknis']
                : ['Document & CSV data parsing', 'Gemini multimodal visual inspection', 'Technical specification breakdown']
        },
        {
            icon: Layers,
            title: isId ? '4 Mode Konsultasi Terarah' : '4 Specialized Consultation Modes',
            desc: isId 
                ? 'Pilih mode konsultasi khusus sesuai kebutuhan: Umum, Riset & IoT Terapan, Analisis & Standarisasi Dokumen Flyer/Brosur, atau Kemitraan Industri.'
                : 'Select specialized consultation modes tailored to your needs: General, Applied IoT Research, Document Standardization, or Industry Partnerships.',
            points: isId 
                ? ['Mode Riset untuk sensor & topologi IoT', 'Mode Dokumen untuk batas karakter layout', 'Mode Kemitraan & alur tiket helpdesk']
                : ['Research mode for IoT sensors & protocols', 'Document mode for layout character limits', 'Partnership mode & helpdesk workflows']
        },
    ];

    const sampleQueries = [
        {
            category: isId ? 'Fokus Riset' : 'Research Focus',
            mode: 'research',
            query: isId ? 'Apa saja bidang fokus riset unggulan di CoE STAS-RG?' : 'What are the main research domains of CoE STAS-RG?'
        },
        {
            category: isId ? 'Proyek IoT' : 'IoT Projects',
            mode: 'research',
            query: isId ? 'Sebutkan contoh proyek riset IoT dan sensor yang sudah terbit di showcase.' : 'Tell me about published IoT and sensor projects in the showcase.'
        },
        {
            category: isId ? 'Standar Dokumen' : 'Document Specs',
            mode: 'document',
            query: isId ? 'Apa saja batas karakter presisi untuk Flyer A4 preset Balanced dan Visual?' : 'What are the strict character limits for Balanced and Visual A4 Flyers?'
        },
        {
            category: isId ? 'Brosur Lipat 3' : 'Trifold Brochure',
            mode: 'document',
            query: isId ? 'Bagaimana susunan 3 panel pada Brosur Lipat Tiga STAS RG Projects?' : 'How are the 3 panels organized in a STAS RG Projects Trifold Brochure?'
        },
        {
            category: isId ? 'Kemitraan' : 'Collaboration',
            mode: 'partner',
            query: isId ? 'Bagaimana cara mengajukan kerjasama riset atau lisensi paten dengan lab?' : 'How do we submit a research collaboration or patent licensing proposal?'
        },
        {
            category: isId ? 'Tim Peneliti' : 'Researchers',
            mode: 'general',
            query: isId ? 'Siapa saja daftar peneliti utama dan apa bidang keahlian mereka?' : 'Who are the lead researchers and what are their expertise areas?'
        },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-[#FAFBFD] dark:bg-[#070D18] text-slate-900 dark:text-slate-100 selection:bg-[#0AB600]/20 selection:text-[#0AB600] font-sans antialiased transition-colors">
            <Head title={isId ? "Kenalan dengan NARA — Navigation & Research Assistant" : "Meet NARA — Navigation & Research Assistant"}>
                <meta 
                    name="description" 
                    content={isId 
                        ? "Kenalan dengan NARA (Navigation & Research Assistant), Asisten AI resmi CoE STAS-RG Telkom University yang siap membantu eksplorasi riset dan dokumen terstandarisasi." 
                        : "Meet NARA (Navigation & Research Assistant), the official AI assistant for CoE STAS-RG Telkom University for research exploration and document standardization."} 
                />
            </Head>

            {/* Top Navigation */}
            <Navbar />

            {/* Main Content */}
            <main className="flex-grow py-8 sm:py-16">
                <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
                    
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 mb-5 sm:mb-8">
                        <Link href="/" className="hover:text-[#0AB600] transition-colors">
                            {isId ? 'Beranda' : 'Home'}
                        </Link>
                        <span>/</span>
                        <span className="text-[#0AB600] font-bold">
                            {isId ? 'Kenalan dengan NARA' : 'Meet NARA'}
                        </span>
                    </div>

                    {/* Hero Header Card */}
                    <div className="relative rounded-2xl sm:rounded-3xl border border-[#0AB600]/30 dark:border-[#0AB600]/30 bg-white dark:bg-[#0A121A] p-4 sm:p-12 overflow-hidden mb-8 sm:mb-12 shadow-xs">
                        <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-[#0AB600]/5 dark:bg-[#0AB600]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" style={{ filter: 'blur(64px)', WebkitFilter: 'blur(64px)' }} />
                        <div className="absolute bottom-0 left-0 w-52 sm:w-80 h-52 sm:h-80 bg-[#0AB600]/5 dark:bg-[#0AB600]/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" style={{ filter: 'blur(64px)', WebkitFilter: 'blur(64px)' }} />

                        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-center">
                            {/* Avatar Column */}
                            <div className="lg:col-span-5 flex flex-col items-center text-center">
                                <div className="group inline-block">
                                    <img
                                        src="/assets/img/icon/profile_cs.png"
                                        alt="NARA Assistant"
                                        className="w-40 h-40 sm:w-72 sm:h-72 lg:w-[400px] lg:h-[400px] max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                                    />
                                </div>
                            </div>

                            {/* Info Column */}
                            <div className="lg:col-span-7 flex flex-col justify-center text-left">
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[#0AB600]/10 dark:bg-[#0AB600]/15 border border-[#0AB600]/30 text-[#0AB600] text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2.5 sm:mb-4 w-fit">
                                    <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                    <span>{isId ? 'Asisten AI Resmi CoE STAS-RG' : 'Official CoE STAS-RG AI Assistant'}</span>
                                </div>

                                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                                    NARA
                                </h1>
                                <p className="text-xs sm:text-lg font-bold text-[#0AB600] mt-0.5 sm:mt-1">
                                    Navigation & Research Assistant
                                </p>

                                <p className="mt-2.5 sm:mt-4 text-xs sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                                    {isId 
                                        ? 'NARA adalah asisten kecerdasan buatan (AI) terintegrasi yang dirancang khusus untuk mendampingi pengunjung, mahasiswa, peneliti, dan mitra industri dalam menjelajahi ekosistem riset terapan di Center of Excellence STAS-RG Telkom University.'
                                        : 'NARA is an integrated artificial intelligence assistant specifically designed to guide visitors, students, researchers, and industry partners in exploring the applied research ecosystem at CoE STAS-RG Telkom University.'}
                                </p>

                                <div className="mt-5 sm:mt-8 flex flex-wrap items-center gap-2.5 sm:gap-3">
                                    <button
                                        type="button"
                                        onClick={() => handleOpenChat()}
                                        className="px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl bg-[#0AB600] hover:bg-[#099600] text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer shadow-xs"
                                    >
                                        <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                        <span>{isId ? 'Mulai Percakapan Sekarang' : 'Start Chatting Now'}</span>
                                    </button>

                                    <Link
                                        href="/#projects-showcase"
                                        className="px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-slate-900 dark:text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 transition-all"
                                    >
                                        <span>{isId ? 'Lihat Showcase Riset' : 'View Research Showcase'}</span>
                                        <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 1: Filosofi Nama NARA */}
                    <div className="mb-8 sm:mb-14">
                        <div className="mb-4 sm:mb-8">
                            <span className="text-[#0AB600] text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                                {isId ? 'FILOSOFI NAMA' : 'NAME PHILOSOPHY'}
                            </span>
                            <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5 sm:mt-1">
                                {isId ? 'Mengapa Dinamakan NARA?' : 'Why is it Named NARA?'}
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 sm:mt-2 max-w-3xl">
                                {isId 
                                    ? 'Nama NARA merupakan akronim dari Navigation & Research Assistant yang mencerminkan peran intinya sebagai pemandu arah dan asisten pengelolaan informasi riset.'
                                    : 'NARA stands for Navigation & Research Assistant, representing its core role as an intelligent navigator and research assistant.'}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                            {philosophyItems.map((item, idx) => (
                                <div 
                                    key={idx}
                                    className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white dark:bg-[#0A121A] border border-zinc-200 dark:border-zinc-800 hover:border-[#0AB600]/50 transition-all flex flex-col justify-between group"
                                >
                                    <div>
                                        <div className="w-11 h-11 sm:w-12 sm:h-12 mb-3 p-1 rounded-xl sm:rounded-2xl overflow-hidden border border-zinc-200/90 dark:border-zinc-700/80 shadow-xs flex items-center justify-center bg-white dark:bg-zinc-900">
                                            <img
                                                src={item.image}
                                                alt={`NARA - ${item.letter} (${item.word})`}
                                                className="w-full h-full object-contain rounded-lg sm:rounded-xl group-hover:scale-105 transition-transform duration-200"
                                                loading="lazy"
                                            />
                                        </div>
                                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mb-1">
                                            {item.word}
                                        </h3>
                                        <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                            {item.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Section 2: 4 Pilar Kemampuan */}
                    <div className="mb-8 sm:mb-14">
                        <div className="mb-4 sm:mb-8">
                            <span className="text-[#0AB600] text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                                {isId ? 'KEMAMPUAN UTAMA' : 'CORE CAPABILITIES'}
                            </span>
                            <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5 sm:mt-1">
                                {isId ? 'Apa Saja yang Bisa Dibantu oleh NARA?' : 'What Can NARA Help You With?'}
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            {capabilities.map((cap, idx) => {
                                const IconComponent = cap.icon;
                                return (
                                    <div
                                        key={idx}
                                        className="p-4 sm:p-7 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0A121A] border border-zinc-200 dark:border-zinc-800 hover:border-[#0AB600]/40 transition-all flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#0AB600]/10 text-[#0AB600] border border-[#0AB600]/20 flex items-center justify-center mb-3 sm:mb-4">
                                                <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                                            </div>

                                            <h3 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white mb-1.5 sm:mb-2">
                                                {cap.title}
                                            </h3>

                                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3 sm:mb-5">
                                                {cap.desc}
                                            </p>
                                        </div>

                                        <div className="pt-3 sm:pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-1.5 sm:space-y-2">
                                            {cap.points.map((pt, pIdx) => (
                                                <div key={pIdx} className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-700 dark:text-slate-300">
                                                    <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#0AB600] shrink-0" />
                                                    <span>{pt}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Section 3: Coba Tanyakan Langsung (Interactive Prompt Launcher) */}
                    <div className="mb-8 sm:mb-14">
                        <div className="rounded-2xl sm:rounded-3xl border border-[#0AB600]/30 bg-white dark:bg-[#0A121A] p-4 sm:p-10 shadow-xs">
                            <div className="flex items-center gap-1.5 text-[#0AB600] text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1.5 sm:mb-2">
                                <MessageSquareQuote className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                <span>{isId ? 'CONTOH PERTANYAAN' : 'SAMPLE PROMPTS'}</span>
                            </div>

                            <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2 sm:mb-3">
                                {isId ? 'Coba Ajukan Pertanyaan ke NARA' : 'Try Asking NARA Directly'}
                            </h2>

                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-4 sm:mb-6">
                                {isId 
                                    ? 'Klik salah satu kartu di bawah ini untuk langsung membuka dialog dan mendapatkan jawaban instan dari NARA:'
                                    : 'Click any prompt below to immediately open the dialog and get an instant answer from NARA:'}
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3.5">
                                {sampleQueries.map((item, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => handleOpenChat(item.query, item.mode || 'general')}
                                        className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 hover:border-[#0AB600] text-left transition-all group cursor-pointer flex flex-col justify-between"
                                    >
                                        <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                                            <span className="text-[9px] sm:text-[10px] font-bold text-[#0AB600] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#0AB600]/10">
                                                {item.category}
                                            </span>
                                            <Send className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 group-hover:text-[#0AB600] group-hover:translate-x-0.5 transition-all" />
                                        </div>
                                        <p className="text-[11px] sm:text-xs font-medium text-slate-800 dark:text-slate-200 group-hover:text-[#0AB600] transition-colors leading-relaxed">
                                            "{item.query}"
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Teknologi & Keamanan */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-14">
                        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0A121A] border border-zinc-200 dark:border-zinc-800 shadow-xs">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2.5 sm:mb-3">
                                <Cpu className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mb-1">
                                {isId ? 'Didukung Google Gemini AI' : 'Powered by Gemini AI'}
                            </h3>
                            <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                {isId 
                                    ? 'Menggunakan model bahasa mutakhir untuk memahami konteks teknis dan menjawab dalam Bahasa Indonesia & Inggris.'
                                    : 'Utilizing state-of-the-art LLMs to understand complex technical context in Indonesian & English.'}
                            </p>
                        </div>

                        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0A121A] border border-zinc-200 dark:border-zinc-800 shadow-xs">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#0AB600]/10 text-[#0AB600] flex items-center justify-center mb-2.5 sm:mb-3">
                                <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mb-1">
                                {isId ? 'Grounded Data Riset Nyata' : 'Grounded on Live Data'}
                            </h3>
                            <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                {isId 
                                    ? 'Jawaban didasarkan pada data proyek terbit, direktori peneliti, dan spesifikasi dokumen di platform STAS RG Projects.'
                                    : 'Answers are grounded in published projects, researcher directories, and verified document specs.'}
                            </p>
                        </div>

                        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0A121A] border border-zinc-200 dark:border-zinc-800 shadow-xs">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2.5 sm:mb-3">
                                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mb-1">
                                {isId ? 'Privasi & Keamanan Ketat' : 'Privacy & Security First'}
                            </h3>
                            <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                {isId 
                                    ? 'Tanpa pelacakan identitas pribadi secara agresif, percakapan bersifat publik dan terlindungi sistem rate-limiting.'
                                    : 'No aggressive personal tracking, stateless public interaction protected by rate limiting.'}
                            </p>
                        </div>
                    </div>

                    {/* Bottom Action CTA with Abstract Floating Profiles (CS & Dev) */}
                    <div className="relative rounded-2xl sm:rounded-3xl bg-[#0AB600] p-6 sm:p-10 lg:py-14 text-white text-center flex flex-col items-center justify-center shadow-xl shadow-[#0AB600]/25 overflow-hidden">
                        {/* Ambient decorative glowing mesh */}
                        <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full bg-black/15 blur-3xl pointer-events-none" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-radial from-white/10 via-transparent to-transparent pointer-events-none" />

                        {/* Abstract Profile CS (Left Side) */}
                        <motion.div
                            initial={{ opacity: 0, x: -40, rotate: -20 }}
                            whileInView={{ opacity: 1, x: 0, rotate: -8 }}
                            viewport={{ once: true }}
                            animate={{
                                y: [-4, 6, -4],
                                rotate: [-8, -3, -8],
                            }}
                            transition={{
                                y: { repeat: Infinity, duration: 4.2, ease: 'easeInOut' },
                                rotate: { repeat: Infinity, duration: 4.2, ease: 'easeInOut' },
                                opacity: { duration: 0.6 },
                            }}
                            className="hidden md:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 flex-col items-center pointer-events-none select-none z-10"
                        >
                            <div className="relative group">
                                {/* Decorative Glow Ring behind Card */}
                                <div className="absolute -inset-2 rounded-3xl bg-white/20 blur-md transform -rotate-6" />
                                
                                <div className="relative w-24 h-24 lg:w-32 lg:h-32 rounded-2xl lg:rounded-3xl bg-white/15 backdrop-blur-md border border-white/35 p-2 lg:p-3 shadow-2xl flex items-center justify-center">
                                    <img
                                        src="/assets/img/icon/profile_cs.png"
                                        alt="CS Support Profile"
                                        className="w-full h-full object-contain drop-shadow-md"
                                    />
                                    {/* Status Badge */}
                                    <div className="absolute -bottom-2.5 -right-2.5 px-2.5 py-0.5 rounded-full bg-white text-[#0AB600] text-[9px] font-extrabold shadow-md flex items-center gap-1 border border-[#0AB600]/20">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#0AB600] animate-pulse"></span>
                                        <span>NARA CS</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Abstract Profile Dev (Right Side) */}
                        <motion.div
                            initial={{ opacity: 0, x: 40, rotate: 20 }}
                            whileInView={{ opacity: 1, x: 0, rotate: 8 }}
                            viewport={{ once: true }}
                            animate={{
                                y: [6, -4, 6],
                                rotate: [8, 3, 8],
                            }}
                            transition={{
                                y: { repeat: Infinity, duration: 4.8, ease: 'easeInOut' },
                                rotate: { repeat: Infinity, duration: 4.8, ease: 'easeInOut' },
                                opacity: { duration: 0.6 },
                            }}
                            className="hidden md:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 flex-col items-center pointer-events-none select-none z-10"
                        >
                            <div className="relative group">
                                {/* Decorative Glow Ring behind Card */}
                                <div className="absolute -inset-2 rounded-3xl bg-black/20 blur-md transform rotate-6" />

                                <div className="relative w-24 h-24 lg:w-32 lg:h-32 rounded-2xl lg:rounded-3xl bg-white/15 backdrop-blur-md border border-white/35 p-2 lg:p-3 shadow-2xl flex items-center justify-center">
                                    <img
                                        src="/assets/img/icon/profile_dev.png"
                                        alt="Dev Team Profile"
                                        className="w-full h-full object-contain drop-shadow-md"
                                    />
                                    {/* Dev Badge */}
                                    <div className="absolute -top-2.5 -left-2.5 px-2.5 py-0.5 rounded-full bg-slate-950 text-white text-[9px] font-mono font-bold shadow-md flex items-center gap-1 border border-white/25">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#0AB600]"></span>
                                        <span>DEV TEAM</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Center Interactive Content */}
                        <div className="relative z-20 max-w-xl mx-auto px-2">
                            <h2 className="text-lg sm:text-2xl md:text-3xl font-black tracking-tight mb-2 leading-tight">
                                {isId ? 'Punya Pertanyaan Spesifik Mengenai Riset STAS-RG?' : 'Have a Specific Question About STAS-RG Research?'}
                            </h2>
                            <p className="text-[11.5px] sm:text-sm text-white/95 max-w-lg mb-5 sm:mb-7 leading-relaxed mx-auto">
                                {isId 
                                    ? 'NARA siap mendampingi Anda sekarang. Jika membutuhkan komunikasi resmi dengan kepala lab atau peneliti, Anda juga dapat mengirimkan pesan via formulir Bantuan.'
                                    : 'NARA is ready to assist you. For official communication with lab heads or researchers, you can also submit a message via Support.'}
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5">
                                <button
                                    type="button"
                                    onClick={() => handleOpenChat()}
                                    className="px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl bg-white text-[#0AB600] hover:bg-slate-100 text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer shadow-md shadow-black/10 active:scale-95"
                                >
                                    <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    <span>{isId ? 'Buka Obrolan NARA' : 'Open NARA Chat'}</span>
                                </button>
                                <Link
                                    href="/support"
                                    className="px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl bg-[#089600] hover:bg-[#078000] border border-white/25 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 transition-all shadow-sm active:scale-95"
                                >
                                    <LifeBuoy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    <span>{isId ? 'Hubungi Tim Lab (/support)' : 'Contact Lab Team (/support)'}</span>
                                </Link>
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            {/* Floating AI Chat Assistant */}
            <AiChatWidget />

            {/* Footer */}
            <Footer />
        </div>
    );
}

export default function Nara() {
    return (
        <AppProvider>
            <NaraContent />
        </AppProvider>
    );
}
