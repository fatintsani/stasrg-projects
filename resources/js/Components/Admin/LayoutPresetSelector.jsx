import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    DOCUMENT_FORMATS,
    COLOR_THEMES,
    PRINT_MODES,
    BOILERPLATES,
    LAYOUT_PRESETS,
    DESIGN_STYLES,
    FLYER_FONTS,
    FLYER_PATTERNS,
} from '../../Utils/layoutPresets';
import LayoutBlockList from './LayoutBlockList';
import {
    CheckCircle2,
    Sliders,
    Image,
    FileText,
    Target,
    Layers,
    Columns,
    LayoutTemplate,
    Palette,
    Sun,
    Moon,
    Sparkles,
    BookmarkCheck,
    Wand2,
    Check,
    Smartphone,
    Grid,
    BookOpen,
    Type,
    Eye,
    Maximize2,
    Pipette,
    ChevronDown,
} from 'lucide-react';

export default function LayoutPresetSelector({
    formatValue = 'a4_flyer',
    presetValue = 'balanced',
    themeValue = 'stas_official',
    designStyleValue = 'classic_standard',
    fontValue = 'plus_jakarta',
    patternValue = 'none',
    customColors = { primary: '#0AB600', accent: '#10b981' },
    printModeValue = 'light',
    schema = null,
    onFormatChange,
    onPresetChange,
    onThemeChange,
    onDesignStyleChange,
    onFontChange,
    onPatternChange,
    onCustomColorsChange,
    onPrintModeChange,
    onSchemaChange,
    onApplyBoilerplate,
    disabled = false,
}) {
    const [activeTab, setActiveTab] = useState('format'); // 'format' | 'style' | 'theme' | 'typography' | 'boilerplate' | 'blocks'
    const [appliedBoilerplateId, setAppliedBoilerplateId] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const tabs = [
        { id: 'format', label: 'Format Dokumen', icon: FileText, desc: 'A4, Trifold, Banner, Feed' },
        { id: 'style', label: 'Gaya Desain', icon: Sparkles, desc: 'Visual card, bold, minimalist' },
        { id: 'theme', label: 'Tema Warna', icon: Palette, desc: 'Palet warna STAS & kustom' },
        { id: 'typography', label: 'Font & Tekstur', icon: Type, desc: 'Tipografi font & motif latar' },
        { id: 'boilerplate', label: 'Boilerplates', icon: BookmarkCheck, desc: 'Template draf siap pakai' },
        ...(onSchemaChange ? [{ id: 'blocks', label: 'Blok Layout', icon: Layers, desc: 'Atur susunan blok flyer' }] : []),
    ];

    const currentTabItem = tabs.find((t) => t.id === activeTab) || tabs[0];
    const CurrentTabIcon = currentTabItem.icon;

    const formatList = Object.values(DOCUMENT_FORMATS);
    const presetsList = Object.values(LAYOUT_PRESETS);
    const designStylesList = Object.values(DESIGN_STYLES);
    const themesList = Object.values(COLOR_THEMES);
    const fontsList = Object.values(FLYER_FONTS);
    const patternsList = Object.values(FLYER_PATTERNS);
    const printModesList = Object.values(PRINT_MODES);
    const boilerplateList = Object.values(BOILERPLATES);

    const currentFormat = DOCUMENT_FORMATS[formatValue] || DOCUMENT_FORMATS.a4_flyer;
    const currentTheme = COLOR_THEMES[themeValue] || COLOR_THEMES.stas_official;
    const currentDesignStyle = DESIGN_STYLES[designStyleValue] || DESIGN_STYLES.classic_standard;
    const currentFont = FLYER_FONTS[fontValue] || FLYER_FONTS.plus_jakarta;
    const currentPattern = FLYER_PATTERNS[patternValue] || FLYER_PATTERNS.none;

    const getFormatIcon = (id) => {
        switch (id) {
            case 'social_feed':
            case 'social_story':
                return <Smartphone className="w-4 h-4" />;
            case 'roll_banner':
                return <Layers className="w-4 h-4" />;
            case 'factsheet_2col':
                return <Columns className="w-4 h-4" />;
            case 'brochure_trifold':
                return <BookOpen className="w-4 h-4" />;
            case 'pitch_poster':
                return <LayoutTemplate className="w-4 h-4" />;
            default:
                return <FileText className="w-4 h-4" />;
        }
    };

    const handleBoilerplateClick = (bp) => {
        if (disabled) return;
        setAppliedBoilerplateId(bp.id);
        if (onApplyBoilerplate) {
            onApplyBoilerplate(bp);
        }
        setTimeout(() => setAppliedBoilerplateId(null), 2500);
    };

    return (
        <div className="space-y-4 rounded-2xl bg-white dark:bg-[#121824] border border-zinc-200/80 dark:border-zinc-800 p-4 sm:p-5 shadow-xs">
            {/* Header with Dropdown Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#0AB600] shrink-0" />
                        <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                            Templates, Format &amp; Preset Styling
                        </label>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                        Pilih template format dokumen, gaya desain visual, palet tema warna, tipografi, dan tekstur background.
                    </p>
                </div>

                {/* Modern Dropdown Navigation Menu */}
                <div className="relative shrink-0 w-full sm:w-auto" ref={dropdownRef}>
                    <button
                        type="button"
                        onClick={() => setIsDropdownOpen((prev) => !prev)}
                        className="w-full sm:w-auto min-w-[210px] px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 shadow-xs flex items-center justify-between gap-3 transition-all cursor-pointer group"
                    >
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-[#0AB600]/10 text-[#0AB600] flex items-center justify-center shrink-0 group-hover:bg-[#0AB600] group-hover:text-white transition-colors">
                                <CurrentTabIcon className="w-4 h-4" />
                            </div>
                            <div className="text-left min-w-0">
                                <span className="block text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider leading-none">
                                    Menu Kategori
                                </span>
                                <span className="block text-xs font-bold text-slate-800 dark:text-white truncate mt-0.5">
                                    {currentTabItem.label}
                                </span>
                            </div>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-200 transition-transform duration-200 shrink-0 ${isDropdownOpen ? 'rotate-180 text-[#0AB600]' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {isDropdownOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                                transition={{ duration: 0.15, ease: 'easeOut' }}
                                className="absolute right-0 top-full mt-2 w-full sm:w-72 z-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-1.5 backdrop-blur-md"
                            >
                                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 border-b border-zinc-100 dark:border-zinc-800 mb-1">
                                    Pilih Pengaturan Styling
                                </div>
                                <div className="space-y-1">
                                    {tabs.map((tab) => {
                                        const TabIcon = tab.icon;
                                        const isSelected = activeTab === tab.id;
                                        return (
                                            <button
                                                key={tab.id}
                                                type="button"
                                                onClick={() => {
                                                    setActiveTab(tab.id);
                                                    setIsDropdownOpen(false);
                                                }}
                                                className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between gap-2.5 transition-all cursor-pointer ${
                                                    isSelected
                                                        ? 'bg-[#0AB600]/10 text-[#0AB600] font-bold'
                                                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/70'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                                        isSelected
                                                            ? 'bg-[#0AB600] text-white'
                                                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                                                    }`}>
                                                        <TabIcon className="w-3.5 h-3.5" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className={`text-xs truncate ${isSelected ? 'font-bold text-[#0AB600]' : 'font-medium text-slate-800 dark:text-zinc-200'}`}>
                                                            {tab.label}
                                                        </p>
                                                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">
                                                            {tab.desc}
                                                        </p>
                                                    </div>
                                                </div>
                                                {isSelected && (
                                                    <Check className="w-4 h-4 text-[#0AB600] shrink-0" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* TAB 1: FORMAT & LAYOUT PRESETS */}
            {activeTab === 'format' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                    {/* Document Format Cards Grid */}
                    <div>
                        <div className="flex items-center justify-between mb-2.5">
                            <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wide">
                                1. Pilih Format Dokumen Publikasi
                            </span>
                            <span className="text-[11px] text-zinc-500 font-medium">
                                Format aktif: <strong className="text-[#0AB600]">{currentFormat.name}</strong>
                            </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {formatList.map((fmt) => {
                                const isSelected = (formatValue || 'a4_flyer') === fmt.id;
                                return (
                                    <button
                                        key={fmt.id}
                                        type="button"
                                        disabled={disabled}
                                        onClick={() => onFormatChange && onFormatChange(fmt.id)}
                                        className={`relative text-left p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between overflow-hidden ${
                                            isSelected
                                                ? 'bg-[#0AB600]/10 border-[#0AB600] ring-2 ring-[#0AB600]/30 shadow-xs'
                                                : 'bg-zinc-50/70 dark:bg-zinc-900/40 border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-white dark:hover:bg-[#161e2e]'
                                        }`}
                                    >
                                        <div className="w-full">
                                            <div className="flex items-center justify-between gap-2 mb-2">
                                                <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 min-w-0">
                                                    <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-[#0AB600] text-white' : 'bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}>
                                                        {getFormatIcon(fmt.id)}
                                                    </div>
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 truncate">
                                                        {fmt.tagline}
                                                    </span>
                                                </div>
                                                <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                                                    isSelected ? 'bg-[#0AB600] text-white' : 'border border-zinc-300 dark:border-zinc-700 text-transparent'
                                                }`}>
                                                    <Check className="w-2.5 h-2.5" />
                                                </div>
                                            </div>

                                            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                                {fmt.name}
                                            </h4>

                                            {/* Mini Visual Silhouette */}
                                            <div className="my-2.5 h-14 bg-zinc-200/60 dark:bg-zinc-800/80 rounded-lg border border-zinc-300/40 dark:border-zinc-700/60 flex items-center justify-center overflow-hidden p-1.5">
                                                {fmt.id === 'a4_flyer' && (
                                                    <div className="w-8 h-11 bg-white dark:bg-zinc-700 rounded-xs border border-zinc-300 dark:border-zinc-600 p-0.5 flex flex-col gap-0.5 shadow-2xs">
                                                        <div className="w-full h-1 bg-[#0AB600]/60 rounded-xs" />
                                                        <div className="w-full h-3 bg-[#0AB600]/20 rounded-xs" />
                                                        <div className="w-full h-0.5 bg-zinc-300 dark:bg-zinc-500 rounded-xs" />
                                                        <div className="w-full h-0.5 bg-zinc-300 dark:bg-zinc-500 rounded-xs" />
                                                    </div>
                                                )}
                                                {fmt.id === 'roll_banner' && (
                                                    <div className="w-5 h-12 bg-white dark:bg-zinc-700 rounded-xs border border-zinc-300 dark:border-zinc-600 p-0.5 flex flex-col justify-between shadow-2xs">
                                                        <div className="w-full h-1.5 bg-[#0AB600]/70 rounded-xs" />
                                                        <div className="w-full h-5 bg-[#0AB600]/20 rounded-xs" />
                                                        <div className="w-2.5 h-2.5 bg-zinc-400 dark:bg-zinc-500 mx-auto rounded-xs" />
                                                    </div>
                                                )}
                                                {fmt.id === 'factsheet_2col' && (
                                                    <div className="w-8 h-11 bg-white dark:bg-zinc-700 rounded-xs border border-zinc-300 dark:border-zinc-600 p-0.5 flex flex-col gap-0.5 shadow-2xs">
                                                        <div className="w-full h-1 bg-[#0AB600]/60 rounded-xs" />
                                                        <div className="grid grid-cols-2 gap-0.5 w-full h-full">
                                                            <div className="bg-zinc-200/80 dark:bg-zinc-600 rounded-xs p-0.5 flex flex-col gap-0.5">
                                                                <div className="w-full h-0.5 bg-zinc-400 rounded-xs" />
                                                                <div className="w-full h-0.5 bg-zinc-400 rounded-xs" />
                                                            </div>
                                                            <div className="bg-[#0AB600]/20 rounded-xs flex items-center justify-center">
                                                                <Image className="w-2.5 h-2.5 text-[#0AB600] opacity-70" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                {fmt.id === 'brochure_trifold' && (
                                                    <div className="w-12 h-8 bg-white dark:bg-zinc-700 rounded-xs border border-zinc-300 dark:border-zinc-600 p-0.5 flex gap-0.5 justify-between shadow-2xs">
                                                        <div className="w-3.5 h-full bg-zinc-200/80 dark:bg-zinc-600 rounded-xs p-0.5 flex flex-col justify-between border-r border-dashed border-zinc-400">
                                                            <div className="w-full h-1 bg-[#0AB600] rounded-xs" />
                                                            <div className="w-full h-1.5 bg-[#0AB600]/20 rounded-xs" />
                                                            <div className="w-1.5 h-1.5 bg-zinc-400 rounded-xs" />
                                                        </div>
                                                        <div className="w-3.5 h-full bg-zinc-200/80 dark:bg-zinc-600 rounded-xs p-0.5 flex flex-col justify-between border-r border-dashed border-zinc-400">
                                                            <div className="w-full h-1 bg-[#0AB600]/60 rounded-xs" />
                                                            <div className="w-full h-1.5 bg-[#0AB600]/20 rounded-xs" />
                                                            <div className="w-1.5 h-1.5 bg-zinc-400 rounded-xs" />
                                                        </div>
                                                        <div className="w-3.5 h-full bg-zinc-200/80 dark:bg-zinc-600 rounded-xs p-0.5 flex flex-col justify-between">
                                                            <div className="w-full h-1 bg-[#0AB600]/40 rounded-xs" />
                                                            <div className="w-full h-1.5 bg-[#0AB600]/20 rounded-xs" />
                                                            <div className="w-1.5 h-1.5 bg-zinc-400 rounded-xs" />
                                                        </div>
                                                    </div>
                                                )}
                                                {fmt.id === 'pitch_poster' && (
                                                    <div className="w-12 h-7 bg-white dark:bg-zinc-700 rounded-xs border border-zinc-300 dark:border-zinc-600 p-0.5 flex flex-col justify-between shadow-2xs">
                                                        <div className="flex justify-between items-center">
                                                            <div className="w-4 h-0.5 bg-[#0AB600] rounded-xs" />
                                                            <div className="w-2 h-0.5 bg-zinc-400 rounded-xs" />
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-0.5 w-full h-3.5">
                                                            <div className="col-span-1 bg-[#0AB600]/20 rounded-xs" />
                                                            <div className="col-span-2 bg-zinc-200/80 dark:bg-zinc-600 rounded-xs" />
                                                        </div>
                                                    </div>
                                                )}
                                                {fmt.id === 'social_feed' && (
                                                    <div className="w-10 h-10 bg-white dark:bg-zinc-700 rounded-xs border border-zinc-300 dark:border-zinc-600 p-0.5 flex flex-col justify-between shadow-2xs">
                                                        <div className="flex justify-between items-center">
                                                            <div className="w-4 h-0.5 bg-[#0AB600] rounded-xs" />
                                                            <div className="w-1.5 h-1.5 rounded-full bg-[#0AB600]/50" />
                                                        </div>
                                                        <div className="w-full h-4.5 bg-[#0AB600]/20 rounded-xs flex items-center justify-center">
                                                            <Image className="w-2 h-2 text-[#0AB600] opacity-70" />
                                                        </div>
                                                        <div className="flex justify-between items-center gap-0.5">
                                                            <div className="w-4 h-0.5 bg-zinc-300 dark:bg-zinc-500 rounded-xs" />
                                                            <div className="w-1.5 h-1.5 bg-[#0AB600]/60 rounded-xs" />
                                                        </div>
                                                    </div>
                                                )}
                                                {fmt.id === 'social_story' && (
                                                    <div className="w-6 h-12 bg-white dark:bg-zinc-700 rounded-xs border border-zinc-300 dark:border-zinc-600 p-0.5 flex flex-col justify-between shadow-2xs">
                                                        <div className="flex justify-between items-center">
                                                            <div className="w-2.5 h-0.5 bg-[#0AB600] rounded-xs" />
                                                            <div className="w-1 h-1 rounded-full bg-[#0AB600]/50" />
                                                        </div>
                                                        <div className="w-full h-4.5 bg-[#0AB600]/20 rounded-xs flex items-center justify-center">
                                                            <Image className="w-2 h-2 text-[#0AB600] opacity-70" />
                                                        </div>
                                                        <div className="space-y-0.5">
                                                            <div className="w-full h-0.5 bg-zinc-300 dark:bg-zinc-500 rounded-xs" />
                                                            <div className="w-full h-0.5 bg-zinc-300 dark:bg-zinc-500 rounded-xs" />
                                                        </div>
                                                        <div className="w-2 h-2 bg-[#0AB600]/60 mx-auto rounded-xs" />
                                                    </div>
                                                )}
                                            </div>

                                            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-snug line-clamp-2">
                                                {fmt.description}
                                            </p>
                                        </div>

                                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium mt-2 pt-2 border-t border-zinc-200/40 dark:border-zinc-800">
                                            <strong>Cocok:</strong> {fmt.bestFor}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* A4 Flyer Preset Selector (Balanced / Visual / Text Heavy) */}
                    {formatValue === 'a4_flyer' && (
                        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                            <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wide mb-2">
                                2. Variasi Proporsi Layout A4
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {presetsList.map((preset) => {
                                    const isSelected = (presetValue || 'balanced') === preset.id;
                                    return (
                                        <button
                                            key={preset.id}
                                            type="button"
                                            disabled={disabled}
                                            onClick={() => onPresetChange && onPresetChange(preset.id)}
                                            className={`relative text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between overflow-hidden ${
                                                isSelected
                                                    ? 'bg-white dark:bg-[#121824] shadow-xs ring-2 ring-[#0AB600] border-[#0AB600]'
                                                    : 'bg-zinc-50/60 dark:bg-zinc-900/40 border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-2 mb-1.5 w-full">
                                                <div className="space-y-0.5 min-w-0 flex-1">
                                                    <span className={`inline-flex items-center text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border ${preset.badgeColor}`}>
                                                        {preset.mode}
                                                    </span>
                                                    <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                                        {preset.name}
                                                    </h5>
                                                </div>
                                                <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                                                    isSelected ? 'bg-[#0AB600] text-white' : 'border border-zinc-300 dark:border-zinc-700 text-transparent'
                                                }`}>
                                                    <Check className="w-2.5 h-2.5" />
                                                </div>
                                            </div>
                                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
                                                {preset.description}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* TAB 2: DESIGN STYLES */}
            {activeTab === 'style' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                    <div>
                        <div className="flex items-center justify-between mb-2.5">
                            <div>
                                <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wide">
                                    Pilih Gaya Desain Visual Kanvas
                                </span>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                    Setiap gaya desain memberikan struktur visual, tata letak kartu, dan hierarki estetika yang unik untuk kanvas flyer Anda.
                                </p>
                            </div>
                            <span className="text-[11px] text-zinc-500 font-medium hidden sm:inline">
                                Gaya aktif: <strong className="text-[#0AB600]">{currentDesignStyle.name}</strong>
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {designStylesList.map((style) => {
                                const isSelected = (designStyleValue || 'classic_standard') === style.id;
                                return (
                                    <button
                                        key={style.id}
                                        type="button"
                                        disabled={disabled}
                                        onClick={() => onDesignStyleChange && onDesignStyleChange(style.id)}
                                        className={`relative text-left p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between overflow-hidden ${
                                            isSelected
                                                ? 'bg-[#0AB600]/10 border-[#0AB600] ring-2 ring-[#0AB600]/30 shadow-xs'
                                                : 'bg-zinc-50/70 dark:bg-zinc-900/40 border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-white dark:hover:bg-[#161e2e]'
                                        }`}
                                    >
                                        <div className="w-full">
                                            <div className="flex items-center justify-between gap-2 mb-2">
                                                <span className={`inline-flex items-center text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border ${style.badgeColor}`}>
                                                    {style.tagline}
                                                </span>
                                                <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                                                    isSelected ? 'bg-[#0AB600] text-white' : 'border border-zinc-300 dark:border-zinc-700 text-transparent'
                                                }`}>
                                                    <Check className="w-2.5 h-2.5" />
                                                </div>
                                            </div>

                                            <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                                                {style.name}
                                            </h4>

                                            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-snug line-clamp-3 mb-2">
                                                {style.description}
                                            </p>
                                        </div>

                                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium mt-2 pt-2 border-t border-zinc-200/40 dark:border-zinc-800">
                                            <strong>Cocok:</strong> {style.bestFor}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: COLOR THEMES & PRINT MODE */}
            {activeTab === 'theme' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                    {/* Color Themes */}
                    <div>
                        <div className="flex items-center justify-between mb-2.5">
                            <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wide">
                                1. Palet Warna Resmi & Tema Visual
                            </span>
                            <span className="text-[11px] text-zinc-500 font-medium">
                                Tema aktif: <strong style={{ color: currentTheme.primary }}>{currentTheme.name}</strong>
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {themesList.map((th) => {
                                const isSelected = (themeValue || 'stas_official') === th.id;
                                const displayPrimary = th.id === 'custom' ? (customColors?.primary || th.primary) : th.primary;
                                const displayAccent = th.id === 'custom' ? (customColors?.accent || th.accent) : th.accent;

                                return (
                                    <button
                                        key={th.id}
                                        type="button"
                                        disabled={disabled}
                                        onClick={() => onThemeChange && onThemeChange(th.id)}
                                        className={`relative text-left p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between overflow-hidden ${
                                            isSelected
                                                ? 'bg-white dark:bg-[#121824] shadow-md ring-2'
                                                : 'bg-zinc-50/70 dark:bg-zinc-900/40 border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                                        }`}
                                        style={{
                                            borderColor: isSelected ? displayPrimary : undefined,
                                            boxShadow: isSelected ? `0 0 0 2px ${displayPrimary}33` : undefined,
                                        }}
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                {/* Color Swatch Dot */}
                                                <div className="flex items-center gap-1.5">
                                                    <span
                                                        className="w-4 h-4 rounded-full border border-white dark:border-zinc-800 shadow-2xs"
                                                        style={{ backgroundColor: displayPrimary }}
                                                    />
                                                    <span
                                                        className="w-3 h-3 rounded-full border border-white dark:border-zinc-800 opacity-80"
                                                        style={{ backgroundColor: displayAccent }}
                                                    />
                                                </div>
                                                <div
                                                    className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-white"
                                                    style={{
                                                        backgroundColor: isSelected ? displayPrimary : 'transparent',
                                                        border: isSelected ? 'none' : '1px solid #d1d5db',
                                                    }}
                                                >
                                                    {isSelected && <Check className="w-2.5 h-2.5" />}
                                                </div>
                                            </div>

                                            <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                                                {th.name}
                                            </h5>
                                            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
                                                {th.tagline}
                                            </p>

                                            {/* Preview Badge representation */}
                                            <div className="mt-2.5 flex items-center gap-1.5">
                                                <span
                                                    className="text-[9px] font-bold px-2 py-0.5 rounded-xs"
                                                    style={{
                                                        backgroundColor: displayPrimary,
                                                        color: '#ffffff',
                                                    }}
                                                >
                                                    BADGE PROYEK
                                                </span>
                                                <span
                                                    className="text-[9px] font-bold underline"
                                                    style={{ color: displayPrimary }}
                                                >
                                                    Link Riset
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Custom Color Palette Picker (Active when 'custom' theme is selected) */}
                        {themeValue === 'custom' && (
                            <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-indigo-50/50 via-purple-50/30 to-pink-50/50 dark:from-indigo-950/20 dark:via-purple-950/20 dark:to-pink-950/20 border border-indigo-200 dark:border-indigo-800/60 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="flex items-center gap-2 mb-3">
                                    <Pipette className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                                        Custom Color Picker (Branding Khusus / Mitra)
                                    </h5>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Primary Color Input */}
                                    <div className="p-3 bg-white dark:bg-zinc-800/90 rounded-lg border border-zinc-200 dark:border-zinc-700 flex items-center justify-between gap-3">
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-800 dark:text-zinc-200">
                                                Warna Utama (Primary)
                                            </label>
                                            <span className="text-[10px] text-zinc-500 font-mono">
                                                {customColors?.primary || '#0AB600'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                disabled={disabled}
                                                value={customColors?.primary || '#0AB600'}
                                                onChange={(e) => onCustomColorsChange && onCustomColorsChange({
                                                    ...customColors,
                                                    primary: e.target.value,
                                                })}
                                                className="w-8 h-8 rounded-lg border border-zinc-300 dark:border-zinc-600 cursor-pointer p-0.5 bg-transparent"
                                            />
                                            <input
                                                type="text"
                                                disabled={disabled}
                                                maxLength={7}
                                                value={customColors?.primary || '#0AB600'}
                                                onChange={(e) => onCustomColorsChange && onCustomColorsChange({
                                                    ...customColors,
                                                    primary: e.target.value,
                                                })}
                                                className="w-20 px-2 py-1 text-xs font-mono font-bold rounded border border-zinc-300 dark:border-zinc-600 dark:bg-zinc-900 dark:text-white uppercase"
                                                placeholder="#0AB600"
                                            />
                                        </div>
                                    </div>

                                    {/* Accent Color Input */}
                                    <div className="p-3 bg-white dark:bg-zinc-800/90 rounded-lg border border-zinc-200 dark:border-zinc-700 flex items-center justify-between gap-3">
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-800 dark:text-zinc-200">
                                                Warna Aksen (Highlight)
                                            </label>
                                            <span className="text-[10px] text-zinc-500 font-mono">
                                                {customColors?.accent || '#10b981'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                disabled={disabled}
                                                value={customColors?.accent || '#10b981'}
                                                onChange={(e) => onCustomColorsChange && onCustomColorsChange({
                                                    ...customColors,
                                                    accent: e.target.value,
                                                })}
                                                className="w-8 h-8 rounded-lg border border-zinc-300 dark:border-zinc-600 cursor-pointer p-0.5 bg-transparent"
                                            />
                                            <input
                                                type="text"
                                                disabled={disabled}
                                                maxLength={7}
                                                value={customColors?.accent || '#10b981'}
                                                onChange={(e) => onCustomColorsChange && onCustomColorsChange({
                                                    ...customColors,
                                                    accent: e.target.value,
                                                })}
                                                className="w-20 px-2 py-1 text-xs font-mono font-bold rounded border border-zinc-300 dark:border-zinc-600 dark:bg-zinc-900 dark:text-white uppercase"
                                                placeholder="#10B981"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Dark / Light Print Mode */}
                    <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                        <label className="block text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wide mb-2">
                            2. Mode Cetak & Tampilan (Print Mode)
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {printModesList.map((pm) => {
                                const isSelected = (printModeValue || 'light') === pm.id;
                                return (
                                    <button
                                        key={pm.id}
                                        type="button"
                                        disabled={disabled}
                                        onClick={() => onPrintModeChange && onPrintModeChange(pm.id)}
                                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                                            isSelected
                                                ? 'bg-white dark:bg-[#121824] shadow-xs border-[#0AB600] ring-2 ring-[#0AB600]/20'
                                                : 'bg-zinc-50/60 dark:bg-zinc-900/40 border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300'
                                        }`}
                                    >
                                        <div className={`p-2 rounded-lg ${pm.id === 'light' ? 'bg-amber-100 text-amber-800' : 'bg-zinc-800 text-zinc-100'}`}>
                                            {pm.id === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                                                    {pm.name}
                                                </h5>
                                                {isSelected && (
                                                    <span className="text-[10px] font-bold text-[#0AB600] bg-[#0AB600]/10 px-1.5 py-0.2 rounded">
                                                        Aktif
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">
                                                {pm.description}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 4: TYPOGRAPHY & BACKGROUND PATTERNS */}
            {activeTab === 'typography' && (
                <div className="space-y-5 animate-in fade-in duration-200">
                    {/* Typography Font Selection */}
                    <div>
                        <div className="flex items-center justify-between mb-2.5">
                            <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wide">
                                1. Pilihan Tipografi & Font Flyer
                            </span>
                            <span className="text-[11px] text-zinc-500 font-medium">
                                Font aktif: <strong className="text-[#0AB600]">{currentFont.name}</strong> ({currentFont.category})
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {fontsList.map((f) => {
                                const isSelected = (fontValue || 'plus_jakarta') === f.id;
                                return (
                                    <button
                                        key={f.id}
                                        type="button"
                                        disabled={disabled}
                                        onClick={() => onFontChange && onFontChange(f.id)}
                                        className={`relative text-left p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between overflow-hidden ${
                                            isSelected
                                                ? 'bg-[#0AB600]/10 border-[#0AB600] ring-2 ring-[#0AB600]/30 shadow-xs'
                                                : 'bg-zinc-50/70 dark:bg-zinc-900/40 border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-white dark:hover:bg-[#161e2e]'
                                        }`}
                                    >
                                        <div>
                                            <div className="flex items-center justify-between gap-2 mb-1.5">
                                                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 bg-zinc-200/60 dark:bg-zinc-800 px-2 py-0.5 rounded">
                                                    {f.category}
                                                </span>
                                                <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                                                    isSelected ? 'bg-[#0AB600] text-white' : 'border border-zinc-300 dark:border-zinc-700 text-transparent'
                                                }`}>
                                                    <Check className="w-2.5 h-2.5" />
                                                </div>
                                            </div>

                                            <h4 className="text-sm font-bold text-slate-900 dark:text-white" style={{ fontFamily: f.fontFamily }}>
                                                {f.name}
                                            </h4>

                                            <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1 leading-snug">
                                                {f.description}
                                            </p>
                                        </div>

                                        {/* Font Sample Text */}
                                        <div className="mt-3 p-2 bg-white dark:bg-zinc-800/80 rounded-lg border border-zinc-200/70 dark:border-zinc-700/80">
                                            <div className="text-xs font-bold text-slate-800 dark:text-zinc-200" style={{ fontFamily: f.fontFamily }}>
                                                Inovasi Teknologi Terapan
                                            </div>
                                            <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">
                                                Aa Bb Cc 1234567890
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Background Texture & Patterns */}
                    <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                        <div className="flex items-center justify-between mb-2.5">
                            <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wide">
                                2. Tekstur & Pola Background Kanvas
                            </span>
                            <span className="text-[11px] text-zinc-500 font-medium">
                                Tekstur: <strong className="text-[#0AB600]">{currentPattern.name}</strong>
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {patternsList.map((p) => {
                                const isSelected = (patternValue || 'none') === p.id;
                                return (
                                    <button
                                        key={p.id}
                                        type="button"
                                        disabled={disabled}
                                        onClick={() => onPatternChange && onPatternChange(p.id)}
                                        className={`relative text-left p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between overflow-hidden ${
                                            isSelected
                                                ? 'bg-[#0AB600]/10 border-[#0AB600] ring-2 ring-[#0AB600]/30 shadow-xs'
                                                : 'bg-zinc-50/70 dark:bg-zinc-900/40 border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-white dark:hover:bg-[#161e2e]'
                                        }`}
                                    >
                                        <div>
                                            <div className="flex items-center justify-between gap-2 mb-1.5">
                                                <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400">
                                                    {p.tagline}
                                                </span>
                                                <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                                                    isSelected ? 'bg-[#0AB600] text-white' : 'border border-zinc-300 dark:border-zinc-700 text-transparent'
                                                }`}>
                                                    <Check className="w-2.5 h-2.5" />
                                                </div>
                                            </div>

                                            <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                                                {p.name}
                                            </h5>

                                            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">
                                                {p.description}
                                            </p>
                                        </div>

                                        {/* Pattern Silhouette Box */}
                                        <div
                                            className="mt-2.5 h-10 rounded-lg border border-zinc-300/60 dark:border-zinc-700/60 bg-white dark:bg-zinc-800 flex items-center justify-center"
                                            style={{
                                                backgroundImage: p.cssPattern !== 'none' ? p.cssPattern : undefined,
                                                backgroundSize: p.bgSize,
                                                color: '#0AB600',
                                            }}
                                        >
                                            <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">
                                                {p.id}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: HEADER & FOOTER BOILERPLATES */}
            {activeTab === 'boilerplate' && (
                <div className="space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wide">
                                Standar Boilerplate Header & Footer Otomatis
                            </span>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                Klik tombol template di bawah untuk mengisi subtitle badge dan kontak footer secara instan tanpa mengetik manual.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {boilerplateList.map((bp) => {
                            const isJustApplied = appliedBoilerplateId === bp.id;
                            return (
                                <div
                                    key={bp.id}
                                    className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 flex flex-col justify-between gap-2.5"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <h5 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                                <BookmarkCheck className="w-3.5 h-3.5 text-[#0AB600]" />
                                                {bp.name}
                                            </h5>
                                            <span className="text-[9px] bg-zinc-200/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold px-1.5 py-0.5 rounded">
                                                Preset
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
                                            {bp.descriptionBadge}
                                        </p>
                                        <div className="text-[10px] text-zinc-600 dark:text-zinc-400 font-mono bg-white dark:bg-zinc-800/80 p-1.5 rounded border border-zinc-200/60 dark:border-zinc-700 space-y-0.5">
                                            <div><strong>Badge:</strong> {bp.subtitle}</div>
                                            <div><strong>Web:</strong> {bp.footer_website}</div>
                                            <div><strong>Social:</strong> {bp.footer_instagram} • {bp.footer_youtube}</div>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        disabled={disabled}
                                        onClick={() => handleBoilerplateClick(bp)}
                                        className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                            isJustApplied
                                                ? 'bg-[#0AB600] text-white shadow-xs'
                                                : 'bg-white dark:bg-zinc-800 hover:bg-[#0AB600]/10 dark:hover:bg-[#0AB600]/15 text-slate-800 dark:text-white border border-zinc-300 dark:border-zinc-700 hover:border-[#0AB600]'
                                        }`}
                                    >
                                        {isJustApplied ? (
                                            <>
                                                <Check className="w-3.5 h-3.5" />
                                                <span>Boilerplate Diterapkan!</span>
                                            </>
                                        ) : (
                                            <>
                                                <Wand2 className="w-3.5 h-3.5 text-[#0AB600]" />
                                                <span>Gunakan Template Ini</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* TAB 5: BLOCK LAYOUT BUILDER */}
            {activeTab === 'blocks' && onSchemaChange && (
                <div className="space-y-4 animate-in fade-in duration-200">
                    <LayoutBlockList
                        schema={schema}
                        onChange={onSchemaChange}
                        docFormat={formatValue}
                        designStyle={designStyleValue}
                        disabled={disabled}
                    />
                </div>
            )}
        </div>
    );
}
