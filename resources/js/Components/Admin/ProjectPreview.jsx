import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Image, Check, Settings, Lightbulb, AlertTriangle, Layers, Columns, LayoutTemplate, FileText, BookOpen, Sparkles, Cpu, CheckCircle2, QrCode, AlignLeft, ShieldCheck, Zap, Terminal, Building2, Award, User, Users } from 'lucide-react';
import { getLayoutPreset, getDocumentFormat, getColorTheme, getPrintMode, getDesignStyle, getFlyerFont, getFlyerPattern } from '../../Utils/layoutPresets';
import { SocialIcon, normalizeSocialLinks } from '../../Utils/socialPlatforms';



function tryParseJson(str) {
    if (!str) return null;
    if (typeof str !== 'string') return str;
    try {
        return JSON.parse(str);
    } catch {
        return null;
    }
}

export function resolveMemberAvatar(member) {
    if (!member) return null;
    const url = member.avatar_preview || member.avatar;
    if (!url || typeof url !== 'string') return null;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:') || url.startsWith('/')) {
        return url;
    }
    return `/storage/${url}`;
}

export function resolvePartnerLogos(project) {
    if (!project) return [];

    // 1. Preview URLs (array from local blob / base64 preview during form editing)
    if (Array.isArray(project.partner_logos_preview) && project.partner_logos_preview.length > 0) {
        const valid = [...new Set(project.partner_logos_preview.filter(Boolean))];
        if (valid.length > 0) return valid;
    }

    // 2. Saved partner_logos array
    let logos = project.partner_logos;
    if (typeof logos === 'string') {
        logos = tryParseJson(logos);
    }
    if (Array.isArray(logos) && logos.length > 0) {
        const mapped = [...new Set(logos.filter(Boolean))].map(logo => {
            if (logo.startsWith('http://') || logo.startsWith('https://') || logo.startsWith('blob:') || logo.startsWith('data:') || logo.startsWith('/')) {
                return logo;
            }
            return `/storage/${logo}`;
        });
        if (mapped.length > 0) return mapped;
    }

    // 3. Fallback to single partner_logo_preview or partner_logo
    if (project.partner_logo_preview) {
        return [project.partner_logo_preview];
    }

    if (project.partner_logo) {
        const single = project.partner_logo;
        if (single.startsWith('http://') || single.startsWith('https://') || single.startsWith('blob:') || single.startsWith('data:') || single.startsWith('/')) {
            return [single];
        }
        return [`/storage/${single}`];
    }

    return [];
}

/**
 * Custom Dynamic Block Layout Renderer (Visual Studio Grid)
 */
export function CustomBlockLayoutRenderer({
    project,
    isLive,
    layoutSchema,
    themeConfig,
    printModeConfig,
    styles,
    isDark,
    canvasBg,
    textColor,
    titleColor,
    mutedColor,
    cardBg,
    cardBorder,
    primaryColor,
    accentColor,
    badgeBg,
    badgeTextColor,
    partnerLogoUrls,
    projectUrl,
    website,
    socialLinks,
    benefitsData,
    specsData,
    psData,
    benefitsContent,
    specsContent,
    psProblem,
    psSolution,
    title,
    subtitle,
    description,
    mainImageUrl,
    presetConfig,
    renderResearchMetadataAndTeam,
}) {
    const blocks = (layoutSchema?.blocks || []).filter(b => b.visible !== false);
    const imgPosX = layoutSchema?.image_x !== undefined ? Number(layoutSchema.image_x) : 50;
    const imgPosY = layoutSchema?.image_y !== undefined ? Number(layoutSchema.image_y) : 50;
    const imgObjPosition = `${imgPosX}% ${imgPosY}%`;

    const renderBlock = (block, idx) => {
        switch (block.type) {
            case 'header':
                return (
                    <div key={block.id || `header_${idx}`} className="w-full">
                        {/* Top: Category & Partner Logos */}
                        <table style={{ width: '100%', marginBottom: '8px', borderCollapse: 'collapse' }}>
                            <tbody>
                                <tr>
                                    <td style={{ verticalAlign: 'middle', width: '35%' }}>
                                        {project.category && (
                                            <span style={{ 
                                                fontSize: '8pt', 
                                                fontWeight: 700, 
                                                textTransform: 'uppercase', 
                                                letterSpacing: '0.5px',
                                                color: primaryColor,
                                            }}>
                                                {project.category}
                                            </span>
                                        )}
                                    </td>
                                    <td style={{ verticalAlign: 'middle', width: '65%', textAlign: 'right' }}>
                                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                                            {partnerLogoUrls.map((url, pIdx) => (
                                                <React.Fragment key={pIdx}>
                                                    <img 
                                                        src={url} 
                                                        alt={`Partner Logo ${pIdx + 1}`} 
                                                        style={{ height: '32px', display: 'inline-block', verticalAlign: 'middle', objectFit: 'contain' }}
                                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                    />
                                                    <div style={{ width: '1px', height: '18px', backgroundColor: isDark ? '#475569' : '#cbd5e1', display: 'inline-block', margin: '0 2px' }} />
                                                </React.Fragment>
                                            ))}
                                            <img 
                                                src="/assets/img/stas.png" 
                                                alt="STAS RG" 
                                                style={{ height: '32px', display: 'inline-block', verticalAlign: 'middle', objectFit: 'contain' }}
                                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        {/* Partner / Subtitle Badge */}
                        {subtitle && (
                            <div style={{ marginBottom: '6px' }}>
                                <div style={{
                                    backgroundColor: badgeBg,
                                    color: badgeTextColor,
                                    fontFamily: "'Poppins', sans-serif",
                                    fontSize: '9pt',
                                    fontWeight: 600,
                                    padding: '3px 10px',
                                    borderRadius: '4px',
                                    display: 'inline-block',
                                    letterSpacing: '0.2px',
                                }}>
                                    {subtitle}
                                </div>
                            </div>
                        )}

                        {/* Main Title */}
                        <div style={{
                            fontFamily: "'Poppins', sans-serif",
                            fontSize: styles.titleFontSize || '20pt',
                            fontWeight: 800,
                            color: titleColor,
                            letterSpacing: '0.3px',
                            textTransform: 'uppercase',
                            marginBottom: '4px',
                            lineHeight: 1.15,
                        }}>
                            {title}
                        </div>
                    </div>
                );

            case 'media': {
                const imgHeight = block.variant === 'compact' ? 160 : block.variant === 'large' ? 280 : (styles.imageHeight || 215);
                return (
                    <div 
                        key={block.id || `media_${idx}`}
                        style={{
                            width: '100%',
                            height: `${imgHeight}px`,
                            textAlign: 'center',
                            overflow: 'hidden',
                            borderRadius: '8px',
                            backgroundColor: cardBg,
                            border: `1px solid ${cardBorder}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: isDark ? '0 4px 14px rgba(0,0,0,0.35)' : '0 2px 8px rgba(0,0,0,0.04)',
                        }}
                    >
                        {mainImageUrl ? (
                            <img 
                                src={mainImageUrl} 
                                alt={title} 
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    objectPosition: imgObjPosition,
                                    borderRadius: '8px',
                                }}
                            />
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#9ca3af' }}>
                                <Image style={{ width: '32px', height: '32px', marginBottom: '4px', color: '#9ca3af' }} />
                                <span style={{ fontSize: '8.5pt', fontWeight: 600 }}>Foto Prototype / Gambar Riset</span>
                                <span style={{ fontSize: '7.5pt', color: '#cbd5e1' }}>Ukuran {imgHeight}px</span>
                            </div>
                        )}
                    </div>
                );
            }

            case 'description':
                if (!description && !isLive) return null;
                return (
                    <div 
                        key={block.id || `desc_${idx}`}
                        className={`flyer-rich-content ${block.variant === 'card' ? 'p-3 rounded-lg border' : ''}`}
                        style={{
                            fontFamily: "'Poppins', sans-serif",
                            fontSize: styles.descFontSize || '9.2pt',
                            color: mutedColor,
                            textAlign: 'justify',
                            lineHeight: 1.45,
                            ...(block.variant === 'card' ? {
                                backgroundColor: cardBg,
                                borderColor: cardBorder,
                            } : {})
                        }}
                        dangerouslySetInnerHTML={{ __html: description || (isLive ? 'Deskripsi singkat mengenai inovasi, latar belakang, dan arsitektur sistem yang dikembangkan oleh tim riset CoE STAS-RG.' : '') }}
                    />
                );

            case 'benefits':
                if (!benefitsContent && !isLive) return null;
                return (
                    <div 
                        key={block.id || `benefits_${idx}`}
                        style={{
                            backgroundColor: cardBg,
                            border: `1px solid ${cardBorder}`,
                            borderRadius: '8px',
                            padding: '9px 12px',
                            height: '100%',
                            boxSizing: 'border-box',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                            <div style={{
                                width: '22px',
                                height: '22px',
                                backgroundColor: isDark ? `${primaryColor}33` : themeConfig.bgAccent,
                                border: `1.5px solid ${primaryColor}`,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: primaryColor,
                                flexShrink: 0,
                            }}>
                                <Check style={{ width: '12px', height: '12px', strokeWidth: 3 }} />
                            </div>
                            <div style={{
                                fontFamily: "'Poppins', sans-serif",
                                fontSize: '9.5pt',
                                fontWeight: 700,
                                color: titleColor,
                                textTransform: 'uppercase',
                                letterSpacing: '0.3px',
                            }}>
                                {benefitsData.title || 'MANFAAT'}
                            </div>
                        </div>
                        <div 
                            className="flyer-rich-content"
                            style={{
                                fontFamily: "'Poppins', sans-serif",
                                fontSize: styles.sectionContentFontSize || '8.5pt',
                                color: mutedColor,
                                fontStyle: 'italic',
                                lineHeight: styles.sectionLineHeight || 1.38,
                                textAlign: 'justify',
                            }}
                            dangerouslySetInnerHTML={{ 
                                __html: benefitsContent || (isLive ? 'Daftar manfaat dan keunggulan teknologi riset...' : '') 
                            }}
                        />
                    </div>
                );

            case 'specifications':
                if (!specsContent && !isLive) return null;
                return (
                    <div 
                        key={block.id || `specs_${idx}`}
                        style={{
                            backgroundColor: cardBg,
                            border: `1px solid ${cardBorder}`,
                            borderRadius: '8px',
                            padding: '9px 12px',
                            height: '100%',
                            boxSizing: 'border-box',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                            <div style={{
                                width: '22px',
                                height: '22px',
                                backgroundColor: isDark ? `${primaryColor}33` : themeConfig.bgAccent,
                                border: `1.5px solid ${primaryColor}`,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: primaryColor,
                                flexShrink: 0,
                            }}>
                                <Settings style={{ width: '12px', height: '12px', strokeWidth: 2.5 }} />
                            </div>
                            <div style={{
                                fontFamily: "'Poppins', sans-serif",
                                fontSize: '9.5pt',
                                fontWeight: 700,
                                color: titleColor,
                                textTransform: 'uppercase',
                                letterSpacing: '0.3px',
                            }}>
                                {specsData.title || 'SPESIFIKASI'}
                            </div>
                        </div>
                        <div 
                            className="flyer-rich-content"
                            style={{
                                fontFamily: "'Poppins', sans-serif",
                                fontSize: styles.sectionContentFontSize || '8.5pt',
                                color: mutedColor,
                                fontStyle: 'italic',
                                lineHeight: styles.sectionLineHeight || 1.38,
                                textAlign: 'justify',
                            }}
                            dangerouslySetInnerHTML={{ 
                                __html: specsContent || (isLive ? 'Spesifikasi sensor, mikrokontroler, parameter teknis...' : '') 
                            }}
                        />
                    </div>
                );

            case 'problem_solution':
                if (!psProblem && !psSolution && !isLive) return null;
                return (
                    <div 
                        key={block.id || `ps_${idx}`}
                        style={{
                            backgroundColor: cardBg,
                            border: `1px solid ${cardBorder}`,
                            borderRadius: '8px',
                            padding: '9px 12px',
                            width: '100%',
                            boxSizing: 'border-box',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                            <div style={{
                                width: '22px',
                                height: '22px',
                                backgroundColor: isDark ? `${primaryColor}33` : themeConfig.bgAccent,
                                border: `1.5px solid ${primaryColor}`,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: primaryColor,
                                flexShrink: 0,
                            }}>
                                <Lightbulb style={{ width: '12px', height: '12px', strokeWidth: 2.5 }} />
                            </div>
                            <div style={{
                                fontFamily: "'Poppins', sans-serif",
                                fontSize: '9.5pt',
                                fontWeight: 700,
                                color: titleColor,
                                textTransform: 'uppercase',
                                letterSpacing: '0.3px',
                            }}>
                                {psData.title || 'PROBLEM & SOLUTION'}
                            </div>
                        </div>

                        {block.variant === 'split_cards' ? (
                            <div className="grid grid-cols-2 gap-3" style={{ fontSize: '8.5pt', color: mutedColor }}>
                                <div className="flyer-rich-content">
                                    <strong style={{ color: titleColor, fontWeight: 700 }}>Problem: </strong>
                                    <span dangerouslySetInnerHTML={{ __html: psProblem || (isLive ? 'Tantangan di lapangan...' : '') }} />
                                </div>
                                <div className="flyer-rich-content">
                                    <strong style={{ color: primaryColor, fontWeight: 700 }}>Solution: </strong>
                                    <span dangerouslySetInnerHTML={{ __html: psSolution || (isLive ? 'Solusi inovasi terapan...' : '') }} />
                                </div>
                            </div>
                        ) : (
                            <div style={{
                                fontFamily: "'Poppins', sans-serif",
                                fontSize: styles.sectionContentFontSize || '8.5pt',
                                color: mutedColor,
                                lineHeight: 1.38,
                                textAlign: 'justify',
                            }}>
                                {(psProblem || isLive) && (
                                    <div className="flyer-rich-content" style={{ marginBottom: '3px' }}>
                                        <strong style={{ color: titleColor, fontWeight: 700, fontStyle: 'normal' }}>Problem : </strong>
                                        <span dangerouslySetInnerHTML={{ __html: psProblem || (isLive ? 'Kendala utama yang dihadapi di lapangan...' : '') }} />
                                    </div>
                                )}
                                {(psProblem && psSolution) && (
                                    <div style={{ borderTop: `1px dashed ${isDark ? '#334155' : '#cbd5e1'}`, margin: '4px 0' }} />
                                )}
                                {(psSolution || isLive) && (
                                    <div className="flyer-rich-content">
                                        <strong style={{ color: primaryColor, fontWeight: 700, fontStyle: 'normal' }}>Solution : </strong>
                                        <span dangerouslySetInnerHTML={{ __html: psSolution || (isLive ? 'Solusi inovasi teknologi yang diterapkan...' : '') }} />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );

            case 'footer_qr':
                return (
                    <div 
                        key={block.id || `footer_${idx}`}
                        style={{
                            marginTop: 'auto',
                            width: '100%',
                        }}
                    >
                        {renderResearchMetadataAndTeam && renderResearchMetadataAndTeam(true)}
                        <div style={{
                            borderTop: `1px solid ${cardBorder}`,
                            paddingTop: '8px',
                            marginTop: '4px',
                            width: '100%',
                        }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <tbody>
                                <tr>
                                    <td style={{ verticalAlign: 'middle', width: '65%' }}>
                                        <div style={{ 
                                            fontFamily: "'Poppins', sans-serif",
                                            fontSize: '7.5pt', 
                                            color: mutedColor, 
                                            fontWeight: 600, 
                                            marginBottom: '4px' 
                                        }}>
                                            Kunjungi platform resmi kami untuk informasi lengkap tentang CoE STAS-RG:
                                        </div>
                                        <div style={{ color: titleColor, display: 'flex', flexWrap: 'wrap', gap: '4px 10px', alignItems: 'center' }}>
                                            {socialLinks.map((item, sIdx) => (
                                                <span key={sIdx} style={{ fontSize: '8pt', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                    <SocialIcon platform={item.platform} style={{ width: '12px', height: '12px', color: primaryColor }} />
                                                    <span>{item.value}</span>
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td style={{ verticalAlign: 'middle', width: '35%', textAlign: 'right' }}>
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                                            {projectUrl && (
                                                <div style={{
                                                    backgroundColor: '#ffffff',
                                                    padding: '3px',
                                                    borderRadius: '4px',
                                                    border: '1px solid #e5e7eb',
                                                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                                    display: 'inline-block',
                                                }}>
                                                    <QRCodeSVG 
                                                        value={projectUrl.startsWith('http') ? projectUrl : `https://${projectUrl}`} 
                                                        size={44} 
                                                        level="M" 
                                                    />
                                                </div>
                                            )}
                                            <div style={{ textAlign: 'left' }}>
                                                <div style={{ fontSize: '6.5pt', fontWeight: 700, color: titleColor, textTransform: 'uppercase' }}>Scan Info</div>
                                                <div style={{ fontSize: '6pt', color: mutedColor }}>{website}</div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col justify-between h-full w-full">
            <div className="grid grid-cols-12 gap-x-3 gap-y-2.5 w-full">
                {blocks.filter(b => b.type !== 'footer_qr').map((block, idx) => {
                    const colSpan = block.colSpan || 12;
                    const colClass = colSpan === 6 ? 'col-span-6' : colSpan === 4 ? 'col-span-4' : 'col-span-12';
                    return (
                        <div key={block.id || idx} className={`${colClass} flex flex-col`}>
                            {renderBlock(block, idx)}
                        </div>
                    );
                })}
            </div>

            {/* Footer QR Block (if included in blocks) */}
            {blocks.find(b => b.type === 'footer_qr') && (
                renderBlock(blocks.find(b => b.type === 'footer_qr'), 999)
            )}
        </div>
    );
}

/**
 * Universal Multi-Format Document Canvas (A4 Flyer, Roll-up Banner, Factsheet 2-Kolom, Pitch Poster)
 */
export function A4Document({ project, isLive = false, id, previewLang = 'id' }) {
    if (!project) return null;

    const docFormatId = project.doc_format || 'a4_flyer';
    const colorThemeId = project.color_theme || 'stas_official';
    const printModeId = project.print_mode || 'light';
    const layoutPresetId = project.layout_preset || 'balanced';
    const designStyleId = project.design_style || 'classic_standard';
    const fontId = project.font_family || project.layout_schema?.font_family || 'plus_jakarta';
    const patternId = project.bg_pattern || project.layout_schema?.bg_pattern || 'none';
    const customColors = project.custom_colors || project.layout_schema?.custom_colors || null;

    const formatConfig = getDocumentFormat(docFormatId);
    const themeConfig = getColorTheme(colorThemeId, customColors);
    const printModeConfig = getPrintMode(printModeId);
    const presetConfig = getLayoutPreset(layoutPresetId);
    const designStyleConfig = getDesignStyle(designStyleId);
    const fontConfig = getFlyerFont(fontId);
    const patternConfig = getFlyerPattern(patternId);

    const isDark = printModeId === 'dark';
    const canvasId = id || `flyer-canvas-${project.slug || project.id || 'current'}`;

    // Dual-language normalization
    const activeLang = project.previewLang || previewLang || 'id';
    const isEn = activeLang === 'en';
    const contentEn = typeof project.content_en === 'string' 
        ? (tryParseJson(project.content_en) || {}) 
        : (project.content_en || {});

    // Normalization of JSON / Object data
    const rawBenefits = isEn && contentEn.benefits ? contentEn.benefits : project.benefits;
    const benefitsData = typeof rawBenefits === 'string' 
        ? (tryParseJson(rawBenefits) || { content: rawBenefits })
        : (rawBenefits || {});
    
    const rawSpecs = isEn && contentEn.specifications ? contentEn.specifications : project.specifications;
    const specsData = typeof rawSpecs === 'string'
        ? (tryParseJson(rawSpecs) || { content: rawSpecs })
        : (rawSpecs || {});

    const rawPS = isEn && contentEn.problem_solution ? contentEn.problem_solution : project.problem_solution;
    const psData = typeof rawPS === 'string'
        ? (tryParseJson(rawPS) || { problem: '', solution: rawPS })
        : (rawPS || {});

    const title = (isEn && contentEn.title) ? contentEn.title : (project.title || (isLive ? (isEn ? 'RESEARCH INNOVATION TITLE' : 'JUDUL PROJECT RISET') : ''));
    const subtitle = (isEn && contentEn.subtitle !== undefined && contentEn.subtitle !== '') ? contentEn.subtitle : (project.subtitle || '');
    const description = (isEn && contentEn.description) ? contentEn.description : (project.description || '');
    const category = (isEn && contentEn.category) ? contentEn.category : (project.category || '');
    
    const mainImageUrl = project.main_image_preview || (project.main_image ? (project.main_image.startsWith('http') || project.main_image.startsWith('blob:') || project.main_image.startsWith('data:') ? project.main_image : `/storage/${project.main_image}`) : null);

    const partnerLogoUrls = resolvePartnerLogos(project);
    const partnerLogoUrl = partnerLogoUrls[0] || null;

    const labAffiliation = project.lab_affiliation || '';
    const patentNumber = project.patent_number || '';
    const publicationDoi = project.publication_doi || '';

    const rawTeam = project?.research_team;
    const researchTeam = Array.isArray(rawTeam)
        ? rawTeam.filter(m => m && (m.name || m.role))
        : (typeof rawTeam === 'string' ? (tryParseJson(rawTeam) || []) : []);

    const projectUrl = project.project_url || '';
    const socialLinks = normalizeSocialLinks(project);
    const website = project.footer_website || 'www.stas-rg.com';

    const benefitsContent = benefitsData.content || '';
    const specsContent = specsData.content || '';
    const psProblem = psData.problem || '';
    const psSolution = psData.solution || '';
    
    const { styles } = presetConfig;

    // Theme dynamic style variables
    const primaryColor = themeConfig.primary;
    const accentColor = themeConfig.accent;
    const badgeBg = themeConfig.badgeBg;
    const badgeTextColor = themeConfig.badgeText;
    const canvasBg = isDark ? themeConfig.darkCanvasBg : '#ffffff';
    const textColor = isDark ? '#f3f4f6' : '#1a1a1a';
    const titleColor = isDark ? '#ffffff' : '#111827';
    const mutedColor = isDark ? '#9ca3af' : '#4b5563';
    const cardBg = isDark ? themeConfig.darkCardBg : '#f9fafb';
    const cardBorder = isDark ? '#1f293d' : '#e5e7eb';

    const imgPosX = project?.layout_schema?.image_x !== undefined ? Number(project.layout_schema.image_x) : 50;
    const imgPosY = project?.layout_schema?.image_y !== undefined ? Number(project.layout_schema.image_y) : 50;
    const imgObjPosition = `${imgPosX}% ${imgPosY}%`;

    // Section title overrides based on language
    if (!benefitsData.title || benefitsData.title === 'MANFAAT' || benefitsData.title === 'KEY BENEFITS') {
        benefitsData.title = isEn ? 'KEY BENEFITS' : 'MANFAAT';
    }
    if (!specsData.title || specsData.title === 'SPESIFIKASI' || specsData.title === 'TECHNICAL SPECIFICATIONS') {
        specsData.title = isEn ? 'TECHNICAL SPECIFICATIONS' : 'SPESIFIKASI';
    }
    if (!psData.title || psData.title === 'PROBLEM–SOLUTION' || psData.title === 'PROBLEM & SOLUTION') {
        psData.title = isEn ? 'PROBLEM & SOLUTION' : 'PROBLEM–SOLUTION';
    }

    const renderResearchMetadataAndTeam = (compact = false) => {
        if (!labAffiliation && !patentNumber && !publicationDoi && researchTeam.length === 0) {
            return null;
        }

        return (
            <div style={{
                marginTop: 'auto',
                marginBottom: compact ? '4px' : '6px',
                padding: compact ? '4px 6px' : '5px 8px',
                borderRadius: designStyleId === 'minimal_grid' ? '0px' : '6px',
                backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.015)',
                border: `1px solid ${cardBorder}`,
                width: '100%',
                boxSizing: 'border-box',
            }}>
                {/* Row 1: Afiliasi Lab, Nomor HKI / Paten, Publikasi DOI */}
                {(labAffiliation || patentNumber || publicationDoi) && (
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        gap: compact ? '3px 8px' : '4px 12px',
                        paddingBottom: researchTeam.length > 0 ? (compact ? '3px' : '4px') : '0',
                        borderBottom: researchTeam.length > 0 ? `1px dashed ${cardBorder}` : 'none',
                        marginBottom: researchTeam.length > 0 ? (compact ? '3px' : '4px') : '0',
                    }}>
                        {labAffiliation && (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: compact ? '6pt' : '6.5pt', color: mutedColor }}>
                                <Building2 style={{ width: '10px', height: '10px', color: primaryColor, flexShrink: 0 }} />
                                <span><strong style={{ color: titleColor }}>Lab:</strong> {labAffiliation}</span>
                            </div>
                        )}
                        {patentNumber && (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: compact ? '6pt' : '6.5pt', color: mutedColor }}>
                                <ShieldCheck style={{ width: '10px', height: '10px', color: primaryColor, flexShrink: 0 }} />
                                <span><strong style={{ color: titleColor }}>HKI/Paten:</strong> {patentNumber}</span>
                            </div>
                        )}
                        {publicationDoi && (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: compact ? '6pt' : '6.5pt', color: mutedColor }}>
                                <BookOpen style={{ width: '10px', height: '10px', color: primaryColor, flexShrink: 0 }} />
                                <span><strong style={{ color: titleColor }}>DOI:</strong> {publicationDoi}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Row 2: Tim Peneliti dengan Foto Profil */}
                {researchTeam.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: compact ? '6px' : '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: compact ? '6pt' : '6.5pt', fontWeight: 800, color: titleColor, textTransform: 'uppercase', letterSpacing: '0.3px', flexShrink: 0 }}>
                            {isEn ? 'Tim Peneliti:' : 'Tim Peneliti:'}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: compact ? '4px' : '6px', flexWrap: 'wrap' }}>
                            {researchTeam.map((member, mIdx) => {
                                const avatarUrl = resolveMemberAvatar(member);
                                const initials = member.name ? member.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'P';
                                return (
                                    <div key={mIdx} style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        padding: compact ? '1.5px 4px' : '2px 6px',
                                        borderRadius: designStyleId === 'minimal_grid' ? '0px' : '4px',
                                        backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                                        border: `1px solid ${cardBorder}`,
                                    }}>
                                        {avatarUrl ? (
                                            <img 
                                                src={avatarUrl} 
                                                alt={member.name} 
                                                style={{
                                                    width: compact ? '13px' : '16px',
                                                    height: compact ? '13px' : '16px',
                                                    borderRadius: '50%',
                                                    objectFit: 'cover',
                                                    border: `1px solid ${primaryColor}`,
                                                }}
                                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                            />
                                        ) : (
                                            <div style={{
                                                width: compact ? '13px' : '16px',
                                                height: compact ? '13px' : '16px',
                                                borderRadius: '50%',
                                                backgroundColor: `${primaryColor}22`,
                                                color: primaryColor,
                                                fontSize: compact ? '5pt' : '5.5pt',
                                                fontWeight: 800,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}>
                                                {initials}
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.05 }}>
                                            <span style={{ fontSize: compact ? '6pt' : '6.5pt', fontWeight: 700, color: titleColor }}>{member.name}</span>
                                            {member.role && <span style={{ fontSize: compact ? '4.5pt' : '5pt', color: mutedColor }}>{member.role}</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div 
            id={canvasId}
            className="select-none flex flex-col justify-between transition-colors duration-200"
            style={{
                width: `${formatConfig.canvasWidth}px`,
                height: `${formatConfig.canvasHeight}px`,
                padding: formatConfig.padding,
                fontFamily: fontConfig.fontFamily || "'Plus Jakarta Sans', sans-serif",
                fontSize: styles.descFontSize || '9.5pt',
                lineHeight: 1.45,
                boxSizing: 'border-box',
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: canvasBg,
                color: textColor,
            }}
        >
            {/* Background Texture Pattern Overlay */}
            {patternConfig.cssPattern !== 'none' && (
                <div
                    aria-hidden="true"
                    style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: patternConfig.cssPattern,
                        backgroundSize: patternConfig.bgSize,
                        opacity: patternConfig.opacity,
                        pointerEvents: 'none',
                        zIndex: 0,
                        color: primaryColor,
                    }}
                />
            )}

            <style>{`
                .flyer-rich-content ul { list-style-type: disc !important; margin-left: 14px !important; margin-top: 2px; margin-bottom: 2px; }
                .flyer-rich-content ol { list-style-type: decimal !important; margin-left: 14px !important; margin-top: 2px; margin-bottom: 2px; }
                .flyer-rich-content li { margin-bottom: 2px; }
                .flyer-rich-content p { margin: 0; }
                .flyer-rich-content a { color: ${primaryColor} !important; text-decoration: underline !important; }
            `}</style>

            {/* CUSTOM SCHEMA / BLOCK BUILDER LAYOUT */}
            {Boolean(project?.layout_schema?.blocks && Array.isArray(project.layout_schema.blocks) && project.layout_schema.blocks.length > 0 && docFormatId !== 'brochure_trifold') ? (
                <CustomBlockLayoutRenderer
                    project={project}
                    isLive={isLive}
                    layoutSchema={project.layout_schema}
                    themeConfig={themeConfig}
                    printModeConfig={printModeConfig}
                    styles={styles}
                    isDark={isDark}
                    canvasBg={canvasBg}
                    textColor={textColor}
                    titleColor={titleColor}
                    mutedColor={mutedColor}
                    cardBg={cardBg}
                    cardBorder={cardBorder}
                    primaryColor={primaryColor}
                    accentColor={accentColor}
                    badgeBg={badgeBg}
                    badgeTextColor={badgeTextColor}
                    partnerLogoUrls={partnerLogoUrls}
                    projectUrl={projectUrl}
                    website={website}
                    socialLinks={socialLinks}
                    benefitsData={benefitsData}
                    specsData={specsData}
                    psData={psData}
                    benefitsContent={benefitsContent}
                    specsContent={specsContent}
                    psProblem={psProblem}
                    psSolution={psSolution}
                    title={title}
                    subtitle={subtitle}
                    description={description}
                    mainImageUrl={mainImageUrl}
                    presetConfig={presetConfig}
                    renderResearchMetadataAndTeam={renderResearchMetadataAndTeam}
                />
            ) : (
                <>
            {/* FORMAT 1: A4 FLYER (WITH MULTIPLE DESIGN STYLES) */}
            {docFormatId === 'a4_flyer' && (
                <>
                    {/* DESIGN STYLE 1: CLASSIC STANDARD */}
                    {(!designStyleId || designStyleId === 'classic_standard') && (
                        <>
                            <div>
                                {/* Header with Logos */}
                                <table style={{ width: '100%', marginBottom: styles.headerMarginBottom || '10px', borderCollapse: 'collapse' }}>
                                    <tbody>
                                        <tr>
                                            <td style={{ verticalAlign: 'middle', width: '30%' }}>
                                                {project.category && (
                                                    <span style={{ 
                                                        fontSize: '8pt', 
                                                        fontWeight: 700, 
                                                        textTransform: 'uppercase', 
                                                        letterSpacing: '0.5px',
                                                        color: primaryColor,
                                                    }}>
                                                        {project.category}
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ verticalAlign: 'middle', width: '70%', textAlign: 'right' }}>
                                                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                                                    {partnerLogoUrls.map((url, idx) => (
                                                        <React.Fragment key={idx}>
                                                            <img 
                                                                src={url} 
                                                                alt={`Partner Logo ${idx + 1}`} 
                                                                style={{ height: '34px', display: 'inline-block', verticalAlign: 'middle', objectFit: 'contain' }}
                                                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                            />
                                                            <div style={{ width: '1px', height: '20px', backgroundColor: isDark ? '#475569' : '#d1d5db', display: 'inline-block', margin: '0 2px' }} />
                                                        </React.Fragment>
                                                    ))}
                                                    <img 
                                                        src="/assets/img/stas.png" 
                                                        alt="STAS RG" 
                                                        style={{ height: '34px', display: 'inline-block', verticalAlign: 'middle', objectFit: 'contain' }}
                                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                {/* Partner / Subtitle Badge */}
                                {subtitle && (
                                    <div style={{ marginBottom: '8px' }}>
                                        <div style={{
                                            backgroundColor: badgeBg,
                                            color: badgeTextColor,
                                            fontFamily: "'Poppins', sans-serif",
                                            fontSize: '9.5pt',
                                            fontWeight: 600,
                                            padding: '4px 12px',
                                            borderRadius: '4px',
                                            display: 'inline-block',
                                            letterSpacing: '0.2px',
                                        }}>
                                            {subtitle}
                                        </div>
                                    </div>
                                )}

                                {/* Main Title */}
                                <div style={{
                                    fontFamily: "'Poppins', sans-serif",
                                    fontSize: styles.titleFontSize || '21pt',
                                    fontWeight: 800,
                                    color: titleColor,
                                    letterSpacing: '0.4px',
                                    textTransform: 'uppercase',
                                    marginBottom: '6px',
                                    lineHeight: 1.15,
                                }}>
                                    {title}
                                </div>

                                {/* Description */}
                                {description && (
                                    <div 
                                        className="flyer-rich-content"
                                        style={{
                                            fontFamily: "'Poppins', sans-serif",
                                            fontSize: styles.descFontSize || '9.5pt',
                                            color: mutedColor,
                                            textAlign: 'justify',
                                            marginBottom: styles.descMarginBottom || '14px',
                                            lineHeight: 1.45,
                                        }}
                                        dangerouslySetInnerHTML={{ __html: description }}
                                    />
                                )}

                                {/* Main Image */}
                                <div style={{
                                    width: '100%',
                                    height: `${styles.imageHeight}px`,
                                    textAlign: 'center',
                                    marginBottom: styles.descMarginBottom || '14px',
                                    overflow: 'hidden',
                                    borderRadius: '6px',
                                    backgroundColor: cardBg,
                                    border: `1px solid ${cardBorder}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    {mainImageUrl ? (
                                        <img 
                                            src={mainImageUrl} 
                                            alt={title} 
                                            style={{
                                                width: '100%',
                                                height: `${styles.imageHeight}px`,
                                                objectFit: 'cover',
                                                objectPosition: imgObjPosition,
                                                borderRadius: '6px',
                                            }}
                                        />
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#9ca3af' }}>
                                            <Image style={{ width: styles.imageHeight > 200 ? '34px' : '24px', height: styles.imageHeight > 200 ? '34px' : '24px', marginBottom: '4px', color: '#9ca3af' }} />
                                            <span style={{ fontSize: '9pt', fontWeight: 600 }}>Foto Prototype / Gambar Riset</span>
                                            <span style={{ fontSize: '8pt', color: '#cbd5e1' }}>Ukuran {styles.imageHeight}px ({presetConfig.mode})</span>
                                        </div>
                                    )}
                                </div>

                                {/* Content Sections */}
                                <div style={{ marginBottom: '10px' }}>
                                    {/* MANFAAT */}
                                    {(benefitsContent || isLive) && (
                                        <div style={{ marginBottom: styles.sectionMarginBottom || '9px' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                <tbody>
                                                    <tr>
                                                        <td style={{ verticalAlign: 'top', width: styles.iconSize || '32px', paddingTop: '1px' }}>
                                                            <div style={{
                                                                width: styles.iconSize || '24px',
                                                                height: styles.iconSize || '24px',
                                                                backgroundColor: isDark ? `${primaryColor}33` : themeConfig.bgAccent,
                                                                border: `1.5px solid ${primaryColor}`,
                                                                borderRadius: '50%',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                color: primaryColor,
                                                            }}>
                                                                <Check style={{ width: styles.iconInnerSize || '13px', height: styles.iconInnerSize || '13px', strokeWidth: 3 }} />
                                                            </div>
                                                        </td>
                                                        <td style={{ verticalAlign: 'top', paddingLeft: '6px' }}>
                                                            <div style={{
                                                                fontFamily: "'Poppins', sans-serif",
                                                                fontSize: styles.sectionTitleFontSize || '10.5pt',
                                                                fontWeight: 700,
                                                                color: titleColor,
                                                                textTransform: 'uppercase',
                                                                letterSpacing: '0.3px',
                                                                marginBottom: '2px',
                                                            }}>
                                                                {benefitsData.title || 'MANFAAT'}
                                                            </div>
                                                            <div 
                                                                className="flyer-rich-content"
                                                                style={{
                                                                    fontFamily: "'Poppins', sans-serif",
                                                                    fontSize: styles.sectionContentFontSize || '9pt',
                                                                    color: mutedColor,
                                                                    fontStyle: 'italic',
                                                                    lineHeight: styles.sectionLineHeight || 1.4,
                                                                    textAlign: 'justify',
                                                                }}
                                                                dangerouslySetInnerHTML={{ 
                                                                    __html: benefitsContent || (isLive ? 'Deskripsi manfaat penerapan project ini...' : '') 
                                                                }}
                                                            />
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {/* SPESIFIKASI */}
                                    {(specsContent || isLive) && (
                                        <div style={{ marginBottom: styles.sectionMarginBottom || '9px' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                <tbody>
                                                    <tr>
                                                        <td style={{ verticalAlign: 'top', width: styles.iconSize || '32px', paddingTop: '1px' }}>
                                                            <div style={{
                                                                width: styles.iconSize || '24px',
                                                                height: styles.iconSize || '24px',
                                                                backgroundColor: isDark ? `${primaryColor}33` : themeConfig.bgAccent,
                                                                border: `1.5px solid ${primaryColor}`,
                                                                borderRadius: '50%',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                color: primaryColor,
                                                            }}>
                                                                <Settings style={{ width: styles.iconInnerSize || '13px', height: styles.iconInnerSize || '13px', strokeWidth: 2.5 }} />
                                                            </div>
                                                        </td>
                                                        <td style={{ verticalAlign: 'top', paddingLeft: '6px' }}>
                                                            <div style={{
                                                                fontFamily: "'Poppins', sans-serif",
                                                                fontSize: styles.sectionTitleFontSize || '10.5pt',
                                                                fontWeight: 700,
                                                                color: titleColor,
                                                                textTransform: 'uppercase',
                                                                letterSpacing: '0.3px',
                                                                marginBottom: '2px',
                                                            }}>
                                                                {specsData.title || 'SPESIFIKASI'}
                                                            </div>
                                                            <div 
                                                                className="flyer-rich-content"
                                                                style={{
                                                                    fontFamily: "'Poppins', sans-serif",
                                                                    fontSize: styles.sectionContentFontSize || '9pt',
                                                                    color: mutedColor,
                                                                    fontStyle: 'italic',
                                                                    lineHeight: styles.sectionLineHeight || 1.4,
                                                                    textAlign: 'justify',
                                                                }}
                                                                dangerouslySetInnerHTML={{ 
                                                                    __html: specsContent || (isLive ? 'Spesifikasi sensor, mikrokontroler, dan komponen hardware...' : '') 
                                                                }}
                                                            />
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {/* PROBLEM - SOLUTION */}
                                    {(psProblem || psSolution || isLive) && (
                                        <div style={{ marginBottom: styles.sectionMarginBottom || '9px' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                <tbody>
                                                    <tr>
                                                        <td style={{ verticalAlign: 'top', width: styles.iconSize || '32px', paddingTop: '1px' }}>
                                                            <div style={{
                                                                width: styles.iconSize || '24px',
                                                                height: styles.iconSize || '24px',
                                                                backgroundColor: isDark ? `${primaryColor}33` : themeConfig.bgAccent,
                                                                border: `1.5px solid ${primaryColor}`,
                                                                borderRadius: '50%',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                color: primaryColor,
                                                            }}>
                                                                <Lightbulb style={{ width: styles.iconInnerSize || '13px', height: styles.iconInnerSize || '13px', strokeWidth: 2.5 }} />
                                                            </div>
                                                        </td>
                                                        <td style={{ verticalAlign: 'top', paddingLeft: '6px' }}>
                                                            <div style={{
                                                                fontFamily: "'Poppins', sans-serif",
                                                                fontSize: styles.sectionTitleFontSize || '10.5pt',
                                                                fontWeight: 700,
                                                                color: titleColor,
                                                                textTransform: 'uppercase',
                                                                letterSpacing: '0.3px',
                                                                marginBottom: '2px',
                                                            }}>
                                                                {psData.title || 'PROBLEM–SOLUTION'}
                                                            </div>
                                                            <div style={{
                                                                fontFamily: "'Poppins', sans-serif",
                                                                fontSize: styles.sectionContentFontSize || '9pt',
                                                                color: mutedColor,
                                                                fontStyle: 'italic',
                                                                lineHeight: styles.sectionLineHeight || 1.4,
                                                                textAlign: 'justify',
                                                            }}>
                                                                {(psProblem || isLive) && (
                                                                    <div className="flyer-rich-content">
                                                                        <strong style={{ color: titleColor, fontStyle: 'normal', fontWeight: 600 }}>Problem : </strong>
                                                                        <span dangerouslySetInnerHTML={{ 
                                                                             __html: psProblem || (isLive ? 'Kendala utama yang dihadapi di lapangan...' : '') 
                                                                        }} />
                                                                    </div>
                                                                )}
                                                                {(psSolution || isLive) && (
                                                                    <div className="flyer-rich-content" style={{ marginTop: '3px' }}>
                                                                        <strong style={{ color: titleColor, fontStyle: 'normal', fontWeight: 600 }}>Solution : </strong>
                                                                        <span dangerouslySetInnerHTML={{ 
                                                                            __html: psSolution || (isLive ? 'Solusi inovasi teknologi yang diterapkan...' : '') 
                                                                        }} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {/* DESIGN STYLE 2: MODERN SPLIT HERO */}
                    {designStyleId === 'modern_split' && (
                        <div>
                            {/* Modern Header Ribbon */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'between', marginBottom: '12px', borderBottom: `2px solid ${cardBorder}`, paddingBottom: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {project.category && (
                                        <span style={{ 
                                            fontSize: '8pt', 
                                            fontWeight: 800, 
                                            textTransform: 'uppercase', 
                                            letterSpacing: '0.8px',
                                            backgroundColor: isDark ? `${primaryColor}25` : themeConfig.bgAccent,
                                            color: primaryColor,
                                            border: `1px solid ${primaryColor}44`,
                                            padding: '3px 8px',
                                            borderRadius: '6px',
                                        }}>
                                            {project.category}
                                        </span>
                                    )}
                                    {subtitle && (
                                        <span style={{ fontSize: '8.5pt', fontWeight: 600, color: mutedColor }}>
                                            {subtitle}
                                        </span>
                                    )}
                                </div>
                                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {partnerLogoUrls.map((url, idx) => (
                                        <React.Fragment key={idx}>
                                            <img key={idx} src={url} alt={`Partner ${idx + 1}`} style={{ height: '32px', objectFit: 'contain' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                            <div style={{ width: '1px', height: '18px', backgroundColor: isDark ? '#475569' : '#cbd5e1' }} />
                                        </React.Fragment>
                                    ))}
                                    <img src="/assets/img/stas.png" alt="STAS RG" style={{ height: '32px', objectFit: 'contain' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                </div>
                            </div>

                            {/* Title with left accent bar */}
                            <div style={{ 
                                borderLeft: `4px solid ${primaryColor}`, 
                                paddingLeft: '10px', 
                                marginBottom: '10px',
                            }}>
                                <div style={{
                                    fontFamily: "'Poppins', sans-serif",
                                    fontSize: styles.titleFontSize || '20pt',
                                    fontWeight: 900,
                                    color: titleColor,
                                    letterSpacing: '0.3px',
                                    textTransform: 'uppercase',
                                    lineHeight: 1.15,
                                }}>
                                    {title}
                                </div>
                            </div>

                            {/* Hero Image with Modern Rounded Frame & Shadow */}
                            <div style={{
                                width: '100%',
                                height: `${styles.imageHeight}px`,
                                marginBottom: '12px',
                                overflow: 'hidden',
                                borderRadius: '12px',
                                backgroundColor: cardBg,
                                border: `1.5px solid ${cardBorder}`,
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.4)' : '0 6px 20px rgba(0,0,0,0.06)',
                            }}>
                                {mainImageUrl ? (
                                    <img src={mainImageUrl} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: imgObjPosition }} />
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#9ca3af' }}>
                                        <Image style={{ width: '32px', height: '32px', marginBottom: '4px' }} />
                                        <span style={{ fontSize: '9pt', fontWeight: 600 }}>Foto Riset & Prototipe (Modern Split)</span>
                                    </div>
                                )}
                                <div style={{
                                    position: 'absolute',
                                    bottom: '8px',
                                    left: '8px',
                                    backgroundColor: 'rgba(0,0,0,0.65)',
                                    backdropFilter: 'blur(6px)',
                                    color: '#ffffff',
                                    fontSize: '7.5pt',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    letterSpacing: '0.4px',
                                }}>
                                    CoE STAS-RG Inovasi
                                </div>
                            </div>

                            {/* Executive Abstract */}
                            {description && (
                                <div 
                                    className="flyer-rich-content"
                                    style={{
                                        fontFamily: "'Poppins', sans-serif",
                                        fontSize: styles.descFontSize || '9.5pt',
                                        color: mutedColor,
                                        textAlign: 'justify',
                                        marginBottom: '10px',
                                        lineHeight: 1.45,
                                    }}
                                    dangerouslySetInnerHTML={{ __html: description }}
                                />
                            )}

                            {/* 3 Modern Card Pillars */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
                                {/* Dual Grid for Benefits & Specs */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                    {(benefitsContent || isLive) && (
                                        <div style={{ padding: '8px 10px', borderRadius: '8px', backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px', color: primaryColor, fontWeight: 700, fontSize: '8.5pt', textTransform: 'uppercase' }}>
                                                <Check style={{ width: '12px', height: '12px', strokeWidth: 3 }} />
                                                <span>{benefitsData.title || 'MANFAAT'}</span>
                                            </div>
                                            <div className="flyer-rich-content" style={{ fontSize: '8.2pt', color: mutedColor, lineHeight: 1.35 }} dangerouslySetInnerHTML={{ __html: benefitsContent || (isLive ? 'Poin manfaat riset...' : '') }} />
                                        </div>
                                    )}

                                    {(specsContent || isLive) && (
                                        <div style={{ padding: '8px 10px', borderRadius: '8px', backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px', color: primaryColor, fontWeight: 700, fontSize: '8.5pt', textTransform: 'uppercase' }}>
                                                <Settings style={{ width: '12px', height: '12px' }} />
                                                <span>{specsData.title || 'SPESIFIKASI'}</span>
                                            </div>
                                            <div className="flyer-rich-content" style={{ fontSize: '8.2pt', color: mutedColor, lineHeight: 1.35 }} dangerouslySetInnerHTML={{ __html: specsContent || (isLive ? 'Spesifikasi teknis...' : '') }} />
                                        </div>
                                    )}
                                </div>

                                {/* Problem - Solution Card */}
                                {(psProblem || psSolution || isLive) && (
                                    <div style={{
                                        padding: '9px 12px',
                                        borderRadius: '8px',
                                        backgroundColor: isDark ? `${primaryColor}14` : themeConfig.bgAccent,
                                        border: `1px solid ${primaryColor}33`,
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px', color: primaryColor, fontWeight: 700, fontSize: '9pt', textTransform: 'uppercase' }}>
                                            <Lightbulb style={{ width: '13px', height: '13px' }} />
                                            <span>{psData.title || 'PROBLEM & INOVASI SOLUSI'}</span>
                                        </div>
                                        <div style={{ fontSize: '8.5pt', lineHeight: 1.4, color: mutedColor }}>
                                            {psProblem && <div><strong style={{ color: titleColor }}>Tantangan: </strong><span dangerouslySetInnerHTML={{ __html: psProblem }} /></div>}
                                            {psSolution && <div style={{ marginTop: '2px' }}><strong style={{ color: primaryColor }}>Solusi Unggulan: </strong><span dangerouslySetInnerHTML={{ __html: psSolution }} /></div>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* DESIGN STYLE 3: INFOGRAPHIC CARDS */}
                    {designStyleId === 'infographic_cards' && (
                        <div>
                            {/* Infographic Header */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                        <span style={{ backgroundColor: badgeBg, color: badgeTextColor, fontSize: '7.5pt', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', textTransform: 'uppercase' }}>
                                            {project.category || 'INFOGRAPHIC'}
                                        </span>
                                        {subtitle && (
                                            <span style={{ fontSize: '7.5pt', fontWeight: 600, color: primaryColor }}>
                                                {subtitle}
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: styles.titleFontSize || '19pt', fontWeight: 900, color: titleColor, textTransform: 'uppercase', lineHeight: 1.15 }}>
                                        {title}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginLeft: '12px' }}>
                                    {partnerLogoUrls.map((url, idx) => (
                                        <React.Fragment key={idx}>
                                            <img key={idx} src={url} alt={`Partner ${idx + 1}`} style={{ height: '32px', objectFit: 'contain' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                            <div style={{ width: '1px', height: '18px', backgroundColor: isDark ? '#475569' : '#cbd5e1' }} />
                                        </React.Fragment>
                                    ))}
                                    <img src="/assets/img/stas.png" alt="STAS RG" style={{ height: '32px', objectFit: 'contain' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                </div>
                            </div>

                            {/* Infographic Figure & Abstract Split Card */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '10px',
                                padding: '10px',
                                borderRadius: '12px',
                                backgroundColor: cardBg,
                                border: `1px solid ${cardBorder}`,
                                marginBottom: '10px',
                            }}>
                                <div style={{
                                    height: `${Math.max(130, styles.imageHeight - 30)}px`,
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    border: `1px solid ${cardBorder}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: isDark ? '#080d16' : '#ffffff',
                                }}>
                                    {mainImageUrl ? (
                                        <img src={mainImageUrl} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: imgObjPosition }} />
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#9ca3af' }}>
                                            <Image style={{ width: '28px', height: '28px' }} />
                                            <span style={{ fontSize: '8pt', fontWeight: 600 }}>Infographic Figure</span>
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <div style={{ fontSize: '8pt', fontWeight: 800, color: primaryColor, textTransform: 'uppercase', marginBottom: '3px' }}>
                                        Ringkasan Inovasi
                                    </div>
                                    <div className="flyer-rich-content" style={{ fontSize: '8.5pt', color: mutedColor, lineHeight: 1.4, textAlign: 'justify' }} dangerouslySetInnerHTML={{ __html: description || (isLive ? 'Deskripsi sistem inovasi terintegrasi...' : '') }} />
                                </div>
                            </div>

                            {/* 3 Modular Infographic Cards */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
                                {/* Benefits & Specs Cards */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                    {(benefitsContent || isLive) && (
                                        <div style={{ padding: '8px 10px', borderRadius: '10px', backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: primaryColor, fontWeight: 700, fontSize: '8.5pt', textTransform: 'uppercase', marginBottom: '3px' }}>
                                                <Check style={{ width: '12px', height: '12px', strokeWidth: 3 }} />
                                                <span>{benefitsData.title || 'MANFAAT'}</span>
                                            </div>
                                            <div className="flyer-rich-content" style={{ fontSize: '8.2pt', color: mutedColor, lineHeight: 1.35 }} dangerouslySetInnerHTML={{ __html: benefitsContent }} />
                                        </div>
                                    )}

                                    {(specsContent || isLive) && (
                                        <div style={{ padding: '8px 10px', borderRadius: '10px', backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: primaryColor, fontWeight: 700, fontSize: '8.5pt', textTransform: 'uppercase', marginBottom: '3px' }}>
                                                <Settings style={{ width: '12px', height: '12px' }} />
                                                <span>{specsData.title || 'SPESIFIKASI'}</span>
                                            </div>
                                            <div className="flyer-rich-content" style={{ fontSize: '8.2pt', color: mutedColor, lineHeight: 1.35 }} dangerouslySetInnerHTML={{ __html: specsContent }} />
                                        </div>
                                    )}
                                </div>

                                {/* Problem - Solution Flow */}
                                {(psProblem || psSolution || isLive) && (
                                    <div style={{ padding: '9px 12px', borderRadius: '10px', backgroundColor: isDark ? `${primaryColor}14` : themeConfig.bgAccent, border: `1px solid ${primaryColor}40` }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: primaryColor, fontWeight: 700, fontSize: '8.5pt', textTransform: 'uppercase', marginBottom: '4px' }}>
                                            <Lightbulb style={{ width: '12px', height: '12px' }} />
                                            <span>{psData.title || 'ALUR PROBLEM & SOLUSI'}</span>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '8pt', color: textColor }}>
                                            <div style={{ backgroundColor: isDark ? '#00000030' : '#ffffff80', padding: '6px 8px', borderRadius: '6px' }}>
                                                <strong style={{ color: primaryColor }}>1. Kendala:</strong> {psProblem ? psProblem.replace(/<[^>]*>?/gm, '') : 'Masalah di lapangan'}
                                            </div>
                                            <div style={{ backgroundColor: isDark ? '#00000030' : '#ffffff80', padding: '6px 8px', borderRadius: '6px' }}>
                                                <strong style={{ color: primaryColor }}>2. Solusi:</strong> {psSolution ? psSolution.replace(/<[^>]*>?/gm, '') : 'Solusi sistem STAS-RG'}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* DESIGN STYLE 4: MINIMALIST SWISS GRID */}
                    {designStyleId === 'minimal_grid' && (
                        <div>
                            {/* Minimal Top Header */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: `1.5px solid ${textColor}`, paddingBottom: '8px', marginBottom: '10px' }}>
                                <div>
                                    <div style={{ fontSize: '7.5pt', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: primaryColor }}>
                                        {project.category || 'TECHNICAL SPECIFICATION'} // {subtitle || 'STAS-RG LAB'}
                                    </div>
                                    <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: styles.titleFontSize || '20pt', fontWeight: 900, color: titleColor, textTransform: 'uppercase', letterSpacing: '-0.2px', lineHeight: 1.1, marginTop: '2px' }}>
                                        {title}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '12px' }}>
                                    {partnerLogoUrls.map((url, idx) => (
                                        <React.Fragment key={idx}>
                                            <img key={idx} src={url} alt={`Partner ${idx + 1}`} style={{ height: '30px', objectFit: 'contain' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                            <div style={{ width: '1px', height: '18px', backgroundColor: isDark ? '#475569' : '#cbd5e1' }} />
                                        </React.Fragment>
                                    ))}
                                    <img src="/assets/img/stas.png" alt="STAS RG" style={{ height: '30px', objectFit: 'contain' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                </div>
                            </div>

                            {/* Minimal Technical Layout */}
                            <div style={{
                                width: '100%',
                                height: `${styles.imageHeight}px`,
                                border: `1px solid ${textColor}`,
                                marginBottom: '10px',
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: cardBg,
                            }}>
                                {mainImageUrl ? (
                                    <img src={mainImageUrl} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: imgObjPosition }} />
                                ) : (
                                    <div style={{ fontSize: '8.5pt', fontWeight: 700, color: mutedColor, letterSpacing: '0.5px' }}>
                                        [ FIGURE ARCHITECTURE ]
                                    </div>
                                )}
                            </div>

                            {description && (
                                <div 
                                    className="flyer-rich-content"
                                    style={{
                                        fontFamily: "'Poppins', sans-serif",
                                        fontSize: styles.descFontSize || '9pt',
                                        color: mutedColor,
                                        textAlign: 'justify',
                                        marginBottom: '10px',
                                        lineHeight: 1.4,
                                        borderLeft: `2px solid ${primaryColor}`,
                                        paddingLeft: '8px',
                                    }}
                                    dangerouslySetInnerHTML={{ __html: description }}
                                />
                            )}

                            {/* Clean Grid Sections with Sharp Borders */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', borderTop: `1px solid ${cardBorder}`, paddingTop: '8px', marginBottom: '6px' }}>
                                {(benefitsContent || isLive) && (
                                    <div>
                                        <div style={{ fontSize: '8pt', fontWeight: 800, textTransform: 'uppercase', color: primaryColor, letterSpacing: '0.5px', marginBottom: '2px' }}>
                                            // {benefitsData.title || 'METRICS & BENEFITS'}
                                        </div>
                                        <div className="flyer-rich-content" style={{ fontSize: '8.2pt', color: mutedColor, lineHeight: 1.35 }} dangerouslySetInnerHTML={{ __html: benefitsContent }} />
                                    </div>
                                )}

                                {(specsContent || isLive) && (
                                    <div>
                                        <div style={{ fontSize: '8pt', fontWeight: 800, textTransform: 'uppercase', color: primaryColor, letterSpacing: '0.5px', marginBottom: '2px' }}>
                                            // {specsData.title || 'SPECIFICATIONS'}
                                        </div>
                                        <div className="flyer-rich-content" style={{ fontSize: '8.2pt', color: mutedColor, lineHeight: 1.35 }} dangerouslySetInnerHTML={{ __html: specsContent }} />
                                    </div>
                                )}
                            </div>

                            {(psProblem || psSolution || isLive) && (
                                <div style={{ borderTop: `1px solid ${cardBorder}`, paddingTop: '6px', fontSize: '8pt', color: mutedColor }}>
                                    <div style={{ fontSize: '7.5pt', fontWeight: 800, textTransform: 'uppercase', color: primaryColor, letterSpacing: '0.5px', marginBottom: '1px' }}>
                                        // PROBLEM & SOLUTION STATEMENT
                                    </div>
                                    {psProblem && <div><strong>Problem: </strong>{psProblem.replace(/<[^>]*>?/gm, '')}</div>}
                                    {psSolution && <div><strong>Solution: </strong>{psSolution.replace(/<[^>]*>?/gm, '')}</div>}
                                </div>
                            )}
                        </div>
                    )}

                    {/* DESIGN STYLE 5: ACADEMIC PAPER BRIEF */}
                    {designStyleId === 'academic_brief' && (
                        <div>
                            {/* Academic Top Header */}
                            <div style={{ textAlign: 'center', borderBottom: `2px double ${cardBorder}`, paddingBottom: '8px', marginBottom: '10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '4px' }}>
                                    <img src="/assets/img/stas.png" alt="STAS RG" style={{ height: '24px', objectFit: 'contain' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                    <span style={{ fontSize: '8pt', fontWeight: 700, letterSpacing: '0.5px', color: mutedColor }}>
                                        TELKOM UNIVERSITY RESEARCH PROCEEDINGS
                                    </span>
                                    {partnerLogoUrls.map((url, idx) => (
                                        <img key={idx} src={url} alt={`Partner ${idx + 1}`} style={{ height: '24px', objectFit: 'contain' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                    ))}
                                </div>
                                <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: styles.titleFontSize || '18pt', fontWeight: 800, color: titleColor, textTransform: 'uppercase', lineHeight: 1.2 }}>
                                    {title}
                                </div>
                                {subtitle && (
                                    <div style={{ fontSize: '8pt', fontWeight: 600, color: primaryColor, marginTop: '2px' }}>
                                        {subtitle}
                                    </div>
                                )}
                            </div>

                            {/* 2-Column Academic Paper Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '8px' }}>
                                {/* Left Column: Abstract & Problem/Solution */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {description && (
                                        <div>
                                            <div style={{ fontSize: '8pt', fontWeight: 800, textTransform: 'uppercase', color: titleColor, borderBottom: `1px solid ${cardBorder}`, paddingBottom: '1px', marginBottom: '2px' }}>
                                                Abstract & Background
                                            </div>
                                            <div className="flyer-rich-content" style={{ fontSize: '8pt', color: mutedColor, textAlign: 'justify', lineHeight: 1.35 }} dangerouslySetInnerHTML={{ __html: description }} />
                                        </div>
                                    )}

                                    {(psProblem || psSolution || isLive) && (
                                        <div>
                                            <div style={{ fontSize: '8pt', fontWeight: 800, textTransform: 'uppercase', color: titleColor, borderBottom: `1px solid ${cardBorder}`, paddingBottom: '1px', marginBottom: '2px' }}>
                                                {psData.title || 'Research Problem & Solution'}
                                            </div>
                                            <div style={{ fontSize: '8pt', color: mutedColor, lineHeight: 1.35 }}>
                                                {psProblem && <div><strong>Problem: </strong>{psProblem.replace(/<[^>]*>?/gm, '')}</div>}
                                                {psSolution && <div style={{ marginTop: '2px' }}><strong style={{ color: primaryColor }}>Solution: </strong>{psSolution.replace(/<[^>]*>?/gm, '')}</div>}
                                            </div>
                                        </div>
                                    )}

                                    {(specsContent || isLive) && (
                                        <div>
                                            <div style={{ fontSize: '8pt', fontWeight: 800, textTransform: 'uppercase', color: titleColor, borderBottom: `1px solid ${cardBorder}`, paddingBottom: '1px', marginBottom: '2px' }}>
                                                {specsData.title || 'Technical Specifications'}
                                            </div>
                                            <div className="flyer-rich-content" style={{ fontSize: '8pt', color: mutedColor, lineHeight: 1.35 }} dangerouslySetInnerHTML={{ __html: specsContent }} />
                                        </div>
                                    )}
                                </div>

                                {/* Right Column: Figure, Results/Benefits & QR Target */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{
                                        width: '100%',
                                        height: `${Math.max(140, styles.imageHeight - 20)}px`,
                                        borderRadius: '4px',
                                        overflow: 'hidden',
                                        border: `1px solid ${cardBorder}`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: cardBg,
                                    }}>
                                        {mainImageUrl ? (
                                            <img src={mainImageUrl} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: imgObjPosition }} />
                                        ) : (
                                            <div style={{ fontSize: '8pt', color: '#9ca3af' }}>Fig 1. Research Prototype</div>
                                        )}
                                    </div>
                                    <div style={{ fontSize: '7pt', color: mutedColor, textAlign: 'center', fontStyle: 'italic', marginTop: '-4px' }}>
                                        Fig 1. Experimental setup & verified system architecture.
                                    </div>

                                    {(benefitsContent || isLive) && (
                                        <div>
                                            <div style={{ fontSize: '8pt', fontWeight: 800, textTransform: 'uppercase', color: titleColor, borderBottom: `1px solid ${cardBorder}`, paddingBottom: '1px', marginBottom: '2px' }}>
                                                {benefitsData.title || 'Key Findings & Impact'}
                                            </div>
                                            <div className="flyer-rich-content" style={{ fontSize: '8pt', color: mutedColor, lineHeight: 1.35 }} dangerouslySetInnerHTML={{ __html: benefitsContent }} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* DESIGN STYLE 6: TECH BLUEPRINT MATRIX */}
                    {designStyleId === 'tech_blueprint' && (
                        <div>
                            {/* Blueprint Top Header with Tech Metadata */}
                            <div style={{
                                border: `1.5px solid ${primaryColor}`,
                                borderRadius: '4px',
                                padding: '8px 12px',
                                marginBottom: '10px',
                                backgroundColor: isDark ? `${primaryColor}0d` : `${primaryColor}08`,
                                position: 'relative',
                            }}>
                                {/* Corner Bracket Accent Indicators */}
                                <div style={{ position: 'absolute', top: '-1px', left: '-1px', width: '6px', height: '6px', borderTop: `2px solid ${accentColor}`, borderLeft: `2px solid ${accentColor}` }} />
                                <div style={{ position: 'absolute', top: '-1px', right: '-1px', width: '6px', height: '6px', borderTop: `2px solid ${accentColor}`, borderRight: `2px solid ${accentColor}` }} />
                                <div style={{ position: 'absolute', bottom: '-1px', left: '-1px', width: '6px', height: '6px', borderBottom: `2px solid ${accentColor}`, borderLeft: `2px solid ${accentColor}` }} />
                                <div style={{ position: 'absolute', bottom: '-1px', right: '-1px', width: '6px', height: '6px', borderBottom: `2px solid ${accentColor}`, borderRight: `2px solid ${accentColor}` }} />

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px dashed ${primaryColor}40`, paddingBottom: '4px', marginBottom: '6px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '7pt', fontWeight: 800, fontFamily: 'monospace', color: primaryColor, backgroundColor: isDark ? '#00000040' : '#ffffff80', padding: '1px 6px', borderRadius: '2px', border: `1px solid ${primaryColor}40` }}>
                                            SYS.ID #{project.id || '01'}
                                        </span>
                                        <span style={{ fontSize: '7.5pt', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: mutedColor }}>
                                            {project.category || 'ADVANCED APPLIED SCIENCES'}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {partnerLogoUrls.map((url, idx) => (
                                            <React.Fragment key={idx}>
                                                <img key={idx} src={url} alt={`Partner ${idx + 1}`} style={{ height: '24px', objectFit: 'contain' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                                <div style={{ width: '1px', height: '14px', backgroundColor: primaryColor, opacity: 0.3 }} />
                                            </React.Fragment>
                                        ))}
                                        <img src="/assets/img/stas.png" alt="STAS RG" style={{ height: '24px', objectFit: 'contain' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                    </div>
                                </div>

                                <div style={{ fontSize: styles.titleFontSize || '19pt', fontWeight: 900, color: titleColor, textTransform: 'uppercase', letterSpacing: '-0.3px', lineHeight: 1.15 }}>
                                    {title}
                                </div>
                                {subtitle && (
                                    <div style={{ fontSize: '8pt', fontWeight: 700, color: primaryColor, marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        [ {subtitle} ]
                                    </div>
                                )}
                            </div>

                            {/* Blueprint Main Visual & Abstract Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px', marginBottom: '10px' }}>
                                <div style={{
                                    height: `${styles.imageHeight || 190}px`,
                                    border: `1.5px solid ${cardBorder}`,
                                    borderRadius: '4px',
                                    overflow: 'hidden',
                                    position: 'relative',
                                    backgroundColor: isDark ? '#050a12' : '#ffffff',
                                }}>
                                    {mainImageUrl ? (
                                        <img src={mainImageUrl} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: imgObjPosition }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: mutedColor }}>
                                            <Cpu style={{ width: '32px', height: '32px', color: primaryColor, opacity: 0.6 }} />
                                            <span style={{ fontSize: '7.5pt', fontWeight: 700, marginTop: '4px', fontFamily: 'monospace' }}>[ SYSTEM PROTOTYPE ]</span>
                                        </div>
                                    )}
                                    <div style={{ position: 'absolute', bottom: '4px', left: '6px', fontSize: '6.5pt', fontFamily: 'monospace', fontWeight: 700, color: '#ffffff', backgroundColor: '#00000099', padding: '1px 5px', borderRadius: '2px' }}>
                                        FIG.01-PROTOTYPE
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '8px 10px', borderRadius: '4px', border: `1px solid ${cardBorder}`, backgroundColor: cardBg }}>
                                    <div>
                                        <div style={{ fontSize: '7.5pt', fontWeight: 800, color: primaryColor, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Terminal style={{ width: '11px', height: '11px' }} />
                                            <span>Executive Overview</span>
                                        </div>
                                        <div className="flyer-rich-content" style={{ fontSize: '8.2pt', color: mutedColor, lineHeight: 1.35, textAlign: 'justify' }} dangerouslySetInnerHTML={{ __html: description || (isLive ? 'Arsitektur dan sistem inovasi terintegrasi...' : '') }} />
                                    </div>

                                    {(psProblem || psSolution || isLive) && (
                                        <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: `1px dashed ${cardBorder}`, fontSize: '7.5pt', lineHeight: 1.3 }}>
                                            {psProblem && <div><strong style={{ color: titleColor }}>• Issue: </strong>{psProblem.replace(/<[^>]*>?/gm, '')}</div>}
                                            {psSolution && <div style={{ marginTop: '2px' }}><strong style={{ color: primaryColor }}>• Tech Solution: </strong>{psSolution.replace(/<[^>]*>?/gm, '')}</div>}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Technical Specs & Benefits Dual Matrix Cards */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                                {(benefitsContent || isLive) && (
                                    <div style={{ padding: '8px 10px', borderRadius: '4px', border: `1px solid ${cardBorder}`, backgroundColor: cardBg, position: 'relative' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: primaryColor, fontWeight: 800, fontSize: '8pt', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3px' }}>
                                            <Zap style={{ width: '11px', height: '11px' }} />
                                            <span>{benefitsData.title || 'CORE BENEFITS & METRICS'}</span>
                                        </div>
                                        <div className="flyer-rich-content" style={{ fontSize: '8pt', color: mutedColor, lineHeight: 1.35 }} dangerouslySetInnerHTML={{ __html: benefitsContent }} />
                                    </div>
                                )}

                                {(specsContent || isLive) && (
                                    <div style={{ padding: '8px 10px', borderRadius: '4px', border: `1px solid ${cardBorder}`, backgroundColor: cardBg }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: primaryColor, fontWeight: 800, fontSize: '8pt', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3px' }}>
                                            <Cpu style={{ width: '11px', height: '11px' }} />
                                            <span>{specsData.title || 'TECHNICAL SPECIFICATIONS'}</span>
                                        </div>
                                        <div className="flyer-rich-content" style={{ fontSize: '8pt', color: mutedColor, lineHeight: 1.35 }} dangerouslySetInnerHTML={{ __html: specsContent }} />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* DESIGN STYLE 7: GLASS MINIMALIST */}
                    {designStyleId === 'glass_minimalist' && (
                        <div>
                            {/* Glass Minimalist Header with Soft Gradient Glow */}
                            <div style={{
                                padding: '10px 14px',
                                borderRadius: '12px',
                                background: isDark ? `linear-gradient(135deg, ${primaryColor}20 0%, #0e1624 100%)` : `linear-gradient(135deg, ${primaryColor}10 0%, #ffffff 100%)`,
                                border: `1px solid ${primaryColor}40`,
                                boxShadow: `0 4px 20px -5px ${primaryColor}20`,
                                marginBottom: '10px',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ backgroundColor: primaryColor, color: '#ffffff', fontSize: '7.5pt', fontWeight: 800, padding: '2px 8px', borderRadius: '100px', textTransform: 'uppercase' }}>
                                            {project.category || 'INNOVATION'}
                                        </span>
                                        {subtitle && (
                                            <span style={{ fontSize: '8pt', fontWeight: 600, color: primaryColor }}>
                                                {subtitle}
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {partnerLogoUrls.map((url, idx) => (
                                            <React.Fragment key={idx}>
                                                <img key={idx} src={url} alt={`Partner ${idx + 1}`} style={{ height: '28px', objectFit: 'contain' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                                <div style={{ width: '1px', height: '16px', backgroundColor: cardBorder }} />
                                            </React.Fragment>
                                        ))}
                                        <img src="/assets/img/stas.png" alt="STAS RG" style={{ height: '28px', objectFit: 'contain' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                    </div>
                                </div>

                                <div style={{ fontSize: styles.titleFontSize || '20pt', fontWeight: 900, color: titleColor, textTransform: 'uppercase', lineHeight: 1.15 }}>
                                    {title}
                                </div>
                            </div>

                            {/* Main Visual Frame */}
                            <div style={{
                                width: '100%',
                                height: `${styles.imageHeight || 195}px`,
                                borderRadius: '10px',
                                overflow: 'hidden',
                                border: `1px solid ${cardBorder}`,
                                marginBottom: '10px',
                                position: 'relative',
                                backgroundColor: cardBg,
                            }}>
                                {mainImageUrl ? (
                                    <img src={mainImageUrl} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: imgObjPosition }} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: mutedColor }}>
                                        <Image style={{ width: '32px', height: '32px', opacity: 0.5 }} />
                                    </div>
                                )}
                            </div>

                            {/* Description Pill Box */}
                            {description && (
                                <div style={{
                                    padding: '8px 12px',
                                    borderRadius: '10px',
                                    backgroundColor: isDark ? '#11182780' : '#ffffff99',
                                    border: `1px solid ${cardBorder}`,
                                    backdropFilter: 'blur(8px)',
                                    marginBottom: '8px',
                                }}>
                                    <div className="flyer-rich-content" style={{ fontSize: '8.5pt', color: mutedColor, lineHeight: 1.4, textAlign: 'justify' }} dangerouslySetInnerHTML={{ __html: description }} />
                                </div>
                            )}

                            {/* Translucent Pillars for Benefits & Specs */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                                {(benefitsContent || isLive) && (
                                    <div style={{ padding: '8px 10px', borderRadius: '10px', backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: primaryColor, fontWeight: 700, fontSize: '8.5pt', textTransform: 'uppercase', marginBottom: '3px' }}>
                                            <Sparkles style={{ width: '12px', height: '12px' }} />
                                            <span>{benefitsData.title || 'MANFAAT'}</span>
                                        </div>
                                        <div className="flyer-rich-content" style={{ fontSize: '8pt', color: mutedColor, lineHeight: 1.35 }} dangerouslySetInnerHTML={{ __html: benefitsContent }} />
                                    </div>
                                )}

                                {(specsContent || isLive) && (
                                    <div style={{ padding: '8px 10px', borderRadius: '10px', backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: primaryColor, fontWeight: 700, fontSize: '8.5pt', textTransform: 'uppercase', marginBottom: '3px' }}>
                                            <ShieldCheck style={{ width: '12px', height: '12px' }} />
                                            <span>{specsData.title || 'SPESIFIKASI'}</span>
                                        </div>
                                        <div className="flyer-rich-content" style={{ fontSize: '8pt', color: mutedColor, lineHeight: 1.35 }} dangerouslySetInnerHTML={{ __html: specsContent }} />
                                    </div>
                                )}
                            </div>

                            {(psProblem || psSolution || isLive) && (
                                <div style={{ padding: '8px 12px', borderRadius: '10px', backgroundColor: isDark ? `${primaryColor}14` : `${primaryColor}0a`, border: `1px solid ${primaryColor}30`, fontSize: '8pt', lineHeight: 1.35, color: mutedColor }}>
                                    {psProblem && <div><strong style={{ color: titleColor }}>Tantangan: </strong>{psProblem.replace(/<[^>]*>?/gm, '')}</div>}
                                    {psSolution && <div style={{ marginTop: '2px' }}><strong style={{ color: primaryColor }}>Solusi Unggulan: </strong>{psSolution.replace(/<[^>]*>?/gm, '')}</div>}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Research Metadata & Authorship Attribution (Di atas garis footer) */}
                    {renderResearchMetadataAndTeam()}

                    {/* Universal Standard Footer for A4 */}
                    <div style={{ marginTop: '0px', borderTop: `1px solid ${cardBorder}`, paddingTop: '8px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <tbody>
                                <tr>
                                    <td style={{ verticalAlign: 'middle', width: '60%' }}>
                                        <div style={{ 
                                            fontFamily: "'Poppins', sans-serif",
                                            fontSize: '7.5pt', 
                                            color: mutedColor, 
                                            fontWeight: 600, 
                                            marginBottom: '5px' 
                                        }}>
                                            Kunjungi platform resmi kami untuk informasi lengkap tentang CoE STAS-RG:
                                        </div>
                                        <div style={{ color: titleColor, display: 'flex', flexWrap: 'wrap', gap: '6px 12px', alignItems: 'center' }}>
                                            {socialLinks.map((item, idx) => (
                                                <span key={idx} style={{ fontSize: '8pt', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                    <SocialIcon platform={item.platform} style={{ width: '13px', height: '13px', color: primaryColor }} />
                                                    <span>{item.value}</span>
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td style={{ verticalAlign: 'middle', width: '40%', textAlign: 'right' }}>
                                        <div style={{ display: 'inline-block', textAlign: 'right' }}>
                                            <div style={{
                                                fontFamily: "'Poppins', sans-serif",
                                                fontSize: '7.5pt',
                                                color: mutedColor,
                                                lineHeight: 1.25,
                                                display: 'inline-block',
                                                verticalAlign: 'middle',
                                                textAlign: 'right',
                                                marginRight: '14px',
                                                maxWidth: '105px',
                                                fontWeight: 600,
                                            }}>
                                                Pindai kode QR untuk Video Produk
                                            </div>
                                            <div style={{
                                                width: '54px',
                                                height: '54px',
                                                display: 'inline-block',
                                                verticalAlign: 'middle',
                                                border: `1px solid ${cardBorder}`,
                                                padding: '2px',
                                                background: '#ffffff',
                                                borderRadius: '4px',
                                            }}>
                                                {projectUrl ? (
                                                    <QRCodeSVG 
                                                        value={projectUrl.startsWith('http') ? projectUrl : `https://${projectUrl}`} 
                                                        size={48} 
                                                        level="H" 
                                                        fgColor={primaryColor}
                                                    />
                                                ) : (
                                                    <div style={{ lineHeight: '48px', textAlign: 'center', fontSize: '7pt', color: '#9ca3af' }}>
                                                        [QR Code]
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        {/* Showcase link */}
                        <div style={{
                            marginTop: '6px',
                            paddingTop: '5px',
                            borderTop: `1px dashed ${cardBorder}`,
                            fontFamily: "'Poppins', sans-serif",
                            fontSize: '7pt',
                            color: mutedColor,
                            textAlign: 'center',
                        }}>
                            Untuk informasi riset lebih lengkap & demonstrasi interaktif, kunjungi:{' '}
                            <span style={{ color: primaryColor, fontWeight: 700, textDecoration: 'underline' }}>
                                {typeof window !== 'undefined' ? `${window.location.origin}/showcase/${project.slug || project.id || 'detail'}` : `http://localhost:8000/showcase/${project.slug || project.id || 'detail'}`}
                            </span>
                        </div>
                    </div>
                </>
            )}

            {/* FORMAT 2: ROLL-UP BANNER / X-BANNER (600 × 1600 px) */}
            {docFormatId === 'roll_banner' && (
                <div className="flex flex-col justify-between h-full space-y-4">
                    <div>
                        {/* Top Header - Style Adaptive */}
                        {designStyleId === 'academic_brief' ? (
                            <div className="pb-3 border-b-2 text-center" style={{ borderColor: cardBorder }}>
                                <div className="flex items-center justify-center gap-3 mb-1">
                                    <span className="text-[9px] font-bold tracking-wider uppercase text-zinc-500">TELKOM UNIVERSITY RESEARCH EXHIBITION</span>
                                    <div className="flex items-center gap-2">
                                        {partnerLogoUrls.map((url, idx) => (
                                            <React.Fragment key={idx}>
                                                <img src={url} alt={`Partner ${idx + 1}`} className="h-6 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                                <div className="h-3.5 w-px bg-zinc-300 dark:bg-zinc-700" />
                                            </React.Fragment>
                                        ))}
                                        <img src="/assets/img/stas.png" alt="STAS" className="h-6 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                    </div>
                                </div>
                                <h1 className="text-2xl font-black uppercase tracking-tight mt-1" style={{ color: titleColor }}>{title}</h1>
                                {subtitle && <div className="text-xs font-semibold mt-1" style={{ color: primaryColor }}>{subtitle}</div>}
                            </div>
                        ) : designStyleId === 'minimal_grid' ? (
                            <div className="pb-3 border-b" style={{ borderColor: cardBorder }}>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">COE STAS-RG // {project.category || 'EXHIBITION'}</span>
                                    <div className="flex items-center gap-2">
                                        {partnerLogoUrls.map((url, idx) => (
                                            <React.Fragment key={idx}>
                                                <img src={url} alt={`Partner ${idx + 1}`} className="h-6 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                                <div className="h-3.5 w-px bg-zinc-300 dark:bg-zinc-700" />
                                            </React.Fragment>
                                        ))}
                                        <img src="/assets/img/stas.png" alt="STAS" className="h-6 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                    </div>
                                </div>
                                <h1 className="text-3xl font-extrabold uppercase tracking-tight mt-3" style={{ color: titleColor }}>{title}</h1>
                                {subtitle && <div className="text-xs font-mono text-zinc-500 mt-1 uppercase tracking-wider">{subtitle}</div>}
                            </div>
                        ) : designStyleId === 'modern_split' ? (
                            <div className="pb-3 border-b flex items-center justify-between" style={{ borderColor: cardBorder }}>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full" style={{ backgroundColor: `${primaryColor}20`, color: primaryColor, border: `1px solid ${primaryColor}40` }}>
                                        {project.category || 'INNOVATION EXPO'}
                                    </span>
                                    <h1 className="text-2xl font-black uppercase leading-tight tracking-tight mt-1" style={{ color: titleColor }}>{title}</h1>
                                </div>
                                <div className="flex items-center gap-2">
                                    {partnerLogoUrls.map((url, idx) => (
                                        <React.Fragment key={idx}>
                                            <img src={url} alt={`Partner ${idx + 1}`} className="h-8 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                            <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700" />
                                        </React.Fragment>
                                    ))}
                                    <img src="/assets/img/stas.png" alt="STAS" className="h-8 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: cardBorder }}>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded" style={{ backgroundColor: badgeBg, color: badgeTextColor }}>
                                        {project.category || 'INNOVATION EXPO'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {partnerLogoUrls.map((url, idx) => (
                                        <React.Fragment key={idx}>
                                            <img src={url} alt={`Partner ${idx + 1}`} className="h-8 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                            <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700" />
                                        </React.Fragment>
                                    ))}
                                    <img src="/assets/img/stas.png" alt="STAS" className="h-8 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                </div>
                            </div>
                        )}

                        {/* Classic / Standard Banner Title if not in minimal/academic */}
                        {designStyleId !== 'academic_brief' && designStyleId !== 'minimal_grid' && designStyleId !== 'modern_split' && (
                            <div className="mt-4 space-y-2 text-center">
                                {subtitle && (
                                    <div className="inline-block text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider" style={{ backgroundColor: `${primaryColor}22`, color: primaryColor, border: `1px solid ${primaryColor}44` }}>
                                        {subtitle}
                                    </div>
                                )}
                                <h1 className="text-3xl font-extrabold uppercase leading-tight tracking-tight px-2" style={{ color: titleColor }}>
                                    {title}
                                </h1>
                            </div>
                        )}

                        {/* Hero Prototype Image */}
                        <div className={`mt-5 w-full h-[360px] overflow-hidden flex items-center justify-center border relative ${designStyleId === 'modern_split' ? 'rounded-2xl shadow-md' : designStyleId === 'minimal_grid' ? 'rounded-none' : 'rounded-xl'}`} style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
                            {mainImageUrl ? (
                                <img src={mainImageUrl} alt={title} className="w-full h-full object-cover" style={{ objectPosition: imgObjPosition }} />
                            ) : (
                                <div className="flex flex-col items-center text-zinc-400">
                                    <Image className="w-12 h-12 mb-2 opacity-50" />
                                    <span className="font-bold text-sm">Foto Prototipe Riset</span>
                                </div>
                            )}
                            {designStyleId === 'academic_brief' && (
                                <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/70 text-[8pt] text-white italic">
                                    Fig 1. Experimental Setup & System Prototype
                                </div>
                            )}
                        </div>

                        {/* Brief Summary */}
                        {description && (
                            <div 
                                className={`mt-4 p-3.5 text-xs text-justify leading-relaxed flyer-rich-content border ${designStyleId === 'modern_split' ? 'rounded-xl border-l-4' : designStyleId === 'minimal_grid' ? 'rounded-none' : 'rounded-xl'}`}
                                style={{ backgroundColor: cardBg, borderColor: cardBorder, borderLeftColor: designStyleId === 'modern_split' ? primaryColor : cardBorder, color: mutedColor }}
                                dangerouslySetInnerHTML={{ __html: description }}
                            />
                        )}

                        {/* Banner Highlights Grid */}
                        <div className="mt-4 space-y-3">
                            {/* Key Highlights (Manfaat & Spek) */}
                            <div className="grid grid-cols-1 gap-3">
                                {benefitsContent && (
                                    <div className={`p-3.5 border ${designStyleId === 'infographic_cards' ? 'rounded-2xl' : designStyleId === 'minimal_grid' ? 'rounded-none' : 'rounded-xl'}`} style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
                                        <h5 className="text-[11px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5" style={{ color: primaryColor }}>
                                            <Check className="w-3.5 h-3.5" />
                                            <span>{benefitsData.title || (designStyleId === 'academic_brief' ? 'Key Findings & Impact' : 'MANFAAT & KEUNGGULAN')}</span>
                                        </h5>
                                        <div className="text-[11px] flyer-rich-content" style={{ color: mutedColor }} dangerouslySetInnerHTML={{ __html: benefitsContent }} />
                                    </div>
                                )}
                                {specsContent && (
                                    <div className={`p-3.5 border ${designStyleId === 'infographic_cards' ? 'rounded-2xl' : designStyleId === 'minimal_grid' ? 'rounded-none' : 'rounded-xl'}`} style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
                                        <h5 className="text-[11px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5" style={{ color: primaryColor }}>
                                            <Settings className="w-3.5 h-3.5" />
                                            <span>{specsData.title || (designStyleId === 'academic_brief' ? 'System Specifications' : 'SPESIFIKASI')}</span>
                                        </h5>
                                        <div className="text-[11px] flyer-rich-content" style={{ color: mutedColor }} dangerouslySetInnerHTML={{ __html: specsContent }} />
                                    </div>
                                )}
                            </div>

                            {/* Problem - Solution Box */}
                            {(psProblem || psSolution) && (
                                <div className={`p-4 border ${designStyleId === 'infographic_cards' ? 'rounded-2xl shadow-xs' : designStyleId === 'minimal_grid' ? 'rounded-none' : 'rounded-xl'}`} style={{ backgroundColor: isDark ? `${primaryColor}15` : themeConfig.bgAccent, borderColor: `${primaryColor}44` }}>
                                    <h4 className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: primaryColor }}>
                                        <Lightbulb className="w-4 h-4" />
                                        <span>{psData.title || (designStyleId === 'academic_brief' ? 'Research Problem & Hypothesis' : 'PROBLEM & SOLUTION')}</span>
                                    </h4>
                                    {psProblem && (
                                        <p className="text-[11px] mb-1.5 leading-relaxed" style={{ color: textColor }}>
                                            <strong style={{ color: primaryColor }}>Tantangan:</strong> {psProblem.replace(/<[^>]*>?/gm, '')}
                                        </p>
                                    )}
                                    {psSolution && (
                                        <p className="text-[11px] leading-relaxed" style={{ color: textColor }}>
                                            <strong style={{ color: primaryColor }}>Solusi Unggulan:</strong> {psSolution.replace(/<[^>]*>?/gm, '')}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Research Metadata & Authorship Attribution (Di atas garis footer) */}
                    {renderResearchMetadataAndTeam(true)}

                    {/* Eye-Level Banner Footer */}
                    <div className="pt-3 border-t space-y-3" style={{ borderColor: cardBorder }}>
                        <div className={`flex items-center justify-between p-3.5 bg-white dark:bg-zinc-900 border shadow-xs ${designStyleId === 'minimal_grid' ? 'rounded-none' : 'rounded-xl'}`} style={{ borderColor: cardBorder }}>
                            <div className="space-y-1">
                                <div className="text-xs font-extrabold uppercase" style={{ color: primaryColor }}>
                                    Pindai Video & Live Demo
                                </div>
                                <div className="text-[10px] text-zinc-500">
                                    Arahkan kamera smartphone ke QR code di samping
                                </div>
                                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                                    {socialLinks.slice(0, 3).map((item, idx) => (
                                        <span key={idx} className="inline-flex items-center gap-1 text-[9.5px] font-semibold text-zinc-700 dark:text-zinc-300">
                                            <SocialIcon platform={item.platform} style={{ width: '11px', height: '11px', color: primaryColor }} />
                                            <span>{item.value}</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="p-1.5 bg-white rounded-lg border border-zinc-300 shrink-0">
                                <QRCodeSVG value={projectUrl ? (projectUrl.startsWith('http') ? projectUrl : `https://${projectUrl}`) : 'https://www.stas-rg.com'} size={72} level="H" fgColor={primaryColor} />
                            </div>
                        </div>

                        <div className="text-center text-[10px] text-zinc-500">
                            Center of Excellence STAS-RG • Telkom University
                        </div>
                    </div>
                </div>
            )}

            {/* FORMAT 3: FACTSHEET 2-KOLOM (794 × 1123 px) */}
            {docFormatId === 'factsheet_2col' && (
                <div className="flex flex-col justify-between h-full">
                    <div>
                        {/* Header Bar - Style Adaptive */}
                        <div className="flex items-center justify-between pb-3 border-b mb-4" style={{ borderColor: cardBorder }}>
                            <div>
                                <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 ${designStyleId === 'minimal_grid' ? 'rounded-none font-mono' : 'rounded'}`} style={{ backgroundColor: badgeBg, color: badgeTextColor }}>
                                    {subtitle || (designStyleId === 'academic_brief' ? 'RESEARCH PROCEEDINGS' : 'RESEARCH FACTSHEET')}
                                </span>
                                <h1 className="text-xl font-extrabold uppercase mt-1" style={{ color: titleColor }}>
                                    {title}
                                </h1>
                            </div>
                            <div className="flex items-center gap-2">
                                {partnerLogoUrls.map((url, idx) => (
                                    <React.Fragment key={idx}>
                                        <img key={idx} src={url} alt={`Partner ${idx + 1}`} className="h-8 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                        <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700" />
                                    </React.Fragment>
                                ))}
                                <img src="/assets/img/stas.png" alt="STAS" className="h-8 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                            </div>
                        </div>

                        {/* 2-Column Main Split Grid */}
                        <div className="grid grid-cols-12 gap-5">
                            {/* Left Column (6/12): Problem, Solution & Technical Architecture */}
                            <div className="col-span-6 space-y-4">
                                {description && (
                                    <div className={`p-3.5 border ${designStyleId === 'modern_split' ? 'rounded-xl border-l-4' : designStyleId === 'minimal_grid' ? 'rounded-none' : 'rounded-xl'}`} style={{ backgroundColor: cardBg, borderColor: cardBorder, borderLeftColor: designStyleId === 'modern_split' ? primaryColor : cardBorder }}>
                                        <h4 className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: primaryColor }}>
                                            {designStyleId === 'academic_brief' ? 'Abstract & Background' : 'Executive Summary'}
                                        </h4>
                                        <div className="text-[11px] text-justify leading-relaxed flyer-rich-content" style={{ color: mutedColor }} dangerouslySetInnerHTML={{ __html: description }} />
                                    </div>
                                )}

                                {(psProblem || psSolution) && (
                                    <div className={`p-3.5 border ${designStyleId === 'infographic_cards' ? 'rounded-2xl shadow-xs' : designStyleId === 'minimal_grid' ? 'rounded-none' : 'rounded-xl'}`} style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
                                        <h4 className="text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: primaryColor }}>
                                            <Lightbulb className="w-3.5 h-3.5" />
                                            <span>{psData.title || 'PROBLEM & SOLUTION'}</span>
                                        </h4>
                                        {psProblem && (
                                            <div className="text-[11px] mb-2 flyer-rich-content" style={{ color: mutedColor }}>
                                                <strong style={{ color: titleColor }}>Problem: </strong>
                                                <span dangerouslySetInnerHTML={{ __html: psProblem }} />
                                            </div>
                                        )}
                                        {psSolution && (
                                            <div className="text-[11px] flyer-rich-content" style={{ color: mutedColor }}>
                                                <strong style={{ color: primaryColor }}>Solution: </strong>
                                                <span dangerouslySetInnerHTML={{ __html: psSolution }} />
                                            </div>
                                        )}
                                    </div>
                                )}

                                {specsContent && (
                                    <div className={`p-3.5 border ${designStyleId === 'infographic_cards' ? 'rounded-2xl' : designStyleId === 'minimal_grid' ? 'rounded-none' : 'rounded-xl'}`} style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
                                        <h4 className="text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5" style={{ color: primaryColor }}>
                                            <Settings className="w-3.5 h-3.5" />
                                            <span>{specsData.title || 'TECHNICAL SPECIFICATIONS'}</span>
                                        </h4>
                                        <div className="text-[11px] flyer-rich-content" style={{ color: mutedColor }} dangerouslySetInnerHTML={{ __html: specsContent }} />
                                    </div>
                                )}
                            </div>

                            {/* Right Column (6/12): Figure, Benefits, & Impact Metrics */}
                            <div className="col-span-6 space-y-4">
                                <div className={`w-full h-[220px] overflow-hidden border flex items-center justify-center relative ${designStyleId === 'modern_split' ? 'rounded-2xl shadow-md' : designStyleId === 'minimal_grid' ? 'rounded-none' : 'rounded-xl'}`} style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
                                    {mainImageUrl ? (
                                        <img src={mainImageUrl} alt={title} className="w-full h-full object-cover" style={{ objectPosition: imgObjPosition }} />
                                    ) : (
                                        <div className="flex flex-col items-center text-zinc-400">
                                            <Image className="w-8 h-8 mb-1 opacity-50" />
                                            <span className="text-xs font-semibold">Gambar Prototipe / Arsitektur</span>
                                        </div>
                                    )}
                                </div>

                                {benefitsContent && (
                                    <div className={`p-3.5 border ${designStyleId === 'infographic_cards' ? 'rounded-2xl' : designStyleId === 'minimal_grid' ? 'rounded-none' : 'rounded-xl'}`} style={{ backgroundColor: isDark ? `${primaryColor}15` : themeConfig.bgAccent, borderColor: `${primaryColor}44` }}>
                                        <h4 className="text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: primaryColor }}>
                                            <Check className="w-3.5 h-3.5" />
                                            <span>{benefitsData.title || (designStyleId === 'academic_brief' ? 'Key Findings & Impact' : 'KEY BENEFITS & IMPACT')}</span>
                                        </h4>
                                        <div className="text-[11px] flyer-rich-content" style={{ color: mutedColor }} dangerouslySetInnerHTML={{ __html: benefitsContent }} />
                                    </div>
                                )}

                                <div className={`p-3.5 border bg-white dark:bg-zinc-900 flex items-center justify-between gap-3 ${designStyleId === 'minimal_grid' ? 'rounded-none' : 'rounded-xl'}`} style={{ borderColor: cardBorder }}>
                                    <div className="space-y-0.5">
                                        <div className="text-[10px] font-bold uppercase" style={{ color: primaryColor }}>Pindai QR Showcase</div>
                                        <div className="text-[9px] text-zinc-500">Akses demo interaktif & spesifikasi lengkap riset</div>
                                        <div className="text-[9px] font-mono text-zinc-600 dark:text-zinc-400">{website}</div>
                                    </div>
                                    <div className="p-1 bg-white border rounded shrink-0">
                                        <QRCodeSVG value={projectUrl || 'https://www.stas-rg.com'} size={52} level="H" fgColor={primaryColor} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Research Metadata & Authorship Attribution (Di atas garis footer) */}
                    {renderResearchMetadataAndTeam(true)}

                    {/* Factsheet Footer */}
                    <div className="pt-2 border-t flex flex-wrap items-center justify-between gap-2 text-[8pt]" style={{ borderColor: cardBorder, color: mutedColor }}>
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="font-semibold" style={{ color: primaryColor }}>STAS-RG</span>
                            {socialLinks.map((item, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1">
                                    <SocialIcon platform={item.platform} style={{ width: '11px', height: '11px', color: primaryColor }} />
                                    <span>{item.value}</span>
                                </span>
                            ))}
                        </div>
                        <div>Telkom University • All Rights Reserved</div>
                    </div>
                </div>
            )}

            {/* FORMAT 4: PITCH DECK POSTER 16:9 (1200 × 675 px) */}
            {docFormatId === 'pitch_poster' && (
                <div className="flex flex-col justify-between h-full">
                    {/* Top Widescreen Header - Style Adaptive */}
                    <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: cardBorder }}>
                        <div className="flex items-center gap-2.5">
                            <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 ${designStyleId === 'minimal_grid' ? 'rounded-none font-mono' : 'rounded'}`} style={{ backgroundColor: badgeBg, color: badgeTextColor }}>
                                {subtitle || 'DEMO DAY PITCH'}
                            </span>
                            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: primaryColor }}>
                                {project.category}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            {partnerLogoUrls.map((url, idx) => (
                                <React.Fragment key={idx}>
                                    <img key={idx} src={url} alt={`Partner ${idx + 1}`} className="h-8 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                    <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700" />
                                </React.Fragment>
                            ))}
                            <img src="/assets/img/stas.png" alt="STAS" className="h-8 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        </div>
                    </div>

                    {/* 16:9 Widescreen Content Split */}
                    <div className="grid grid-cols-12 gap-6 my-auto items-center">
                        {/* Left Hero Column (5/12): Title, Abstract & Large Image */}
                        <div className="col-span-5 space-y-3">
                            <h1 className="text-2xl font-black uppercase leading-tight tracking-tight" style={{ color: titleColor }}>
                                {title}
                            </h1>
                            <div className={`w-full h-[230px] overflow-hidden border flex items-center justify-center ${designStyleId === 'modern_split' ? 'rounded-2xl shadow-md' : designStyleId === 'minimal_grid' ? 'rounded-none' : 'rounded-xl'}`} style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
                                {mainImageUrl ? (
                                    <img src={mainImageUrl} alt={title} className="w-full h-full object-cover" style={{ objectPosition: imgObjPosition }} />
                                ) : (
                                    <div className="flex flex-col items-center text-zinc-400">
                                        <Image className="w-10 h-10 mb-1 opacity-50" />
                                        <span className="text-xs font-bold">16:9 Hero Figure</span>
                                    </div>
                                )}
                            </div>
                            {description && (
                                <div className={`text-[11px] text-justify line-clamp-3 flyer-rich-content ${designStyleId === 'minimal_grid' ? 'font-light' : ''}`} style={{ color: mutedColor }} dangerouslySetInnerHTML={{ __html: description }} />
                            )}
                        </div>

                        {/* Right Content Column (7/12): 3 Pillars Grid */}
                        <div className="col-span-7 grid grid-cols-2 gap-3.5">
                            {/* Benefits Box */}
                            <div className={`p-3.5 border ${designStyleId === 'infographic_cards' ? 'rounded-2xl' : designStyleId === 'minimal_grid' ? 'rounded-none' : 'rounded-xl'}`} style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
                                <h5 className="text-[11px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5" style={{ color: primaryColor }}>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Manfaat Utama</span>
                                </h5>
                                <div className="text-[10.5px] flyer-rich-content line-clamp-5" style={{ color: mutedColor }} dangerouslySetInnerHTML={{ __html: benefitsContent || 'Dampak efisiensi dan keunggulan kompetitif' }} />
                            </div>

                            {/* Specs & QR Box */}
                            <div className={`p-3.5 border flex flex-col justify-between ${designStyleId === 'infographic_cards' ? 'rounded-2xl' : designStyleId === 'minimal_grid' ? 'rounded-none' : 'rounded-xl'}`} style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
                                <div>
                                    <h5 className="text-[11px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5" style={{ color: primaryColor }}>
                                        <Settings className="w-3.5 h-3.5" />
                                        <span>Spesifikasi Teknis</span>
                                    </h5>
                                    <div className="text-[10.5px] flyer-rich-content line-clamp-3 mb-2" style={{ color: mutedColor }} dangerouslySetInnerHTML={{ __html: specsContent || 'Spesifikasi sensor & arsitektur' }} />
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: cardBorder }}>
                                    <div className="text-[9px] font-mono" style={{ color: mutedColor }}>Scan for Demo</div>
                                    <div className="p-1 bg-white rounded border">
                                        <QRCodeSVG value={projectUrl || 'https://www.stas-rg.com'} size={36} level="M" fgColor={primaryColor} />
                                    </div>
                                </div>
                            </div>

                            {/* Problem - Solution Box */}
                            <div className={`col-span-2 p-3.5 border ${designStyleId === 'infographic_cards' ? 'rounded-2xl shadow-xs' : designStyleId === 'minimal_grid' ? 'rounded-none' : 'rounded-xl'}`} style={{ backgroundColor: isDark ? `${primaryColor}15` : themeConfig.bgAccent, borderColor: `${primaryColor}44` }}>
                                <h4 className="text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5" style={{ color: primaryColor }}>
                                    <Lightbulb className="w-4 h-4" />
                                    <span>Problem & Market Solution</span>
                                </h4>
                                <div className="grid grid-cols-2 gap-3 text-[11px]" style={{ color: textColor }}>
                                    <div><strong>Problem:</strong> {psProblem ? psProblem.replace(/<[^>]*>?/gm, '') : 'Tantangan efisiensi riset & implementasi.'}</div>
                                    <div><strong>Solution:</strong> {psSolution ? psSolution.replace(/<[^>]*>?/gm, '') : 'Inovasi sistem terintegrasi STAS-RG.'}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Research Metadata & Authorship Attribution (Di atas garis footer) */}
                    {renderResearchMetadataAndTeam(true)}

                    {/* Widescreen Footer */}
                    <div className="pt-2 border-t flex flex-wrap items-center justify-between gap-3 text-[9pt]" style={{ borderColor: cardBorder, color: mutedColor }}>
                        <div className="flex flex-wrap items-center gap-4 font-medium">
                            {socialLinks.map((item, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1.5">
                                    <SocialIcon platform={item.platform} style={{ width: '13px', height: '13px', color: primaryColor }} />
                                    <span>{item.value}</span>
                                </span>
                            ))}
                        </div>
                        <div className="font-bold" style={{ color: primaryColor }}>
                            Telkom University • CoE STAS-RG
                        </div>
                    </div>
                </div>
            )}

            {/* FORMAT 5: INSTAGRAM & LINKEDIN FEED 1:1 SQUARE (1080 × 1080 px) */}
            {docFormatId === 'social_feed' && (
                <div className="flex flex-col justify-between h-full space-y-4 select-none">
                    {/* Top Branding Bar - Style Adaptive */}
                    <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: cardBorder }}>
                        <div className="flex items-center gap-2">
                            {project.category && (
                                <span className={`text-[12px] font-extrabold uppercase px-3 py-1 tracking-wider ${designStyleId === 'minimal_grid' ? 'rounded-none font-mono' : 'rounded-md'}`} style={{ backgroundColor: badgeBg, color: badgeTextColor }}>
                                    {project.category}
                                </span>
                            )}
                            {subtitle && (
                                <span className={`text-[11px] font-semibold px-2.5 py-1 border ${designStyleId === 'minimal_grid' ? 'rounded-none font-mono' : 'rounded-md'}`} style={{ backgroundColor: cardBg, borderColor: cardBorder, color: primaryColor }}>
                                    {subtitle}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {partnerLogoUrls.map((url, idx) => (
                                <React.Fragment key={idx}>
                                    <img key={idx} src={url} alt={`Partner ${idx + 1}`} className="h-9 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                    <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700" />
                                </React.Fragment>
                            ))}
                            <img src="/assets/img/stas.png" alt="STAS" className="h-9 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        </div>
                    </div>

                    {/* Main Title */}
                    <div className="space-y-1">
                        <h1 className="text-2xl sm:text-3xl font-black uppercase leading-tight tracking-tight line-clamp-2" style={{ color: titleColor }}>
                            {title}
                        </h1>
                    </div>

                    {/* Center Hero Image */}
                    <div className={`w-full h-[370px] overflow-hidden border flex items-center justify-center relative ${designStyleId === 'modern_split' ? 'rounded-3xl shadow-lg' : designStyleId === 'minimal_grid' ? 'rounded-none' : 'rounded-2xl'}`} style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
                        {mainImageUrl ? (
                            <img src={mainImageUrl} alt={title} className="w-full h-full object-cover" style={{ objectPosition: imgObjPosition }} />
                        ) : (
                            <div className="flex flex-col items-center text-zinc-400">
                                <Image className="w-14 h-14 mb-2 opacity-50" />
                                <span className="font-bold text-sm">Foto Prototipe Riset (1:1 Feed)</span>
                            </div>
                        )}
                        <div className="absolute bottom-3 left-3 px-3 py-1 rounded-lg backdrop-blur-md bg-black/60 text-white text-[11px] font-bold uppercase tracking-wider">
                            Inovasi CoE STAS-RG
                        </div>
                    </div>

                    {/* Middle Info Highlights (Split 2 Boxes) */}
                    <div className="grid grid-cols-2 gap-3.5">
                        {/* Benefits / Specs Box */}
                        <div className={`p-3.5 border flex flex-col justify-between ${designStyleId === 'infographic_cards' ? 'rounded-2xl' : designStyleId === 'minimal_grid' ? 'rounded-none' : 'rounded-xl'}`} style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
                            <div>
                                <h4 className="text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5" style={{ color: primaryColor }}>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>{benefitsData.title || 'Manfaat & Keunggulan'}</span>
                                </h4>
                                <div className="text-[11px] flyer-rich-content line-clamp-3 leading-relaxed" style={{ color: mutedColor }} dangerouslySetInnerHTML={{ __html: benefitsContent || specsContent || description || 'Penerapan teknologi tepat guna ramah lingkungan.' }} />
                            </div>
                        </div>

                        {/* Problem & Solution Box */}
                        <div className={`p-3.5 border flex flex-col justify-between ${designStyleId === 'infographic_cards' ? 'rounded-2xl' : designStyleId === 'minimal_grid' ? 'rounded-none' : 'rounded-xl'}`} style={{ backgroundColor: isDark ? `${primaryColor}15` : themeConfig.bgAccent, borderColor: `${primaryColor}44` }}>
                            <div>
                                <h4 className="text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5" style={{ color: primaryColor }}>
                                    <Lightbulb className="w-3.5 h-3.5" />
                                    <span>{psData.title || 'Problem & Solusi'}</span>
                                </h4>
                                {psProblem && (
                                    <p className="text-[11px] line-clamp-2 leading-relaxed mb-1" style={{ color: textColor }}>
                                        <strong>Tantangan:</strong> {psProblem.replace(/<[^>]*>?/gm, '')}
                                    </p>
                                )}
                                {psSolution && (
                                    <p className="text-[11px] line-clamp-2 leading-relaxed" style={{ color: textColor }}>
                                        <strong>Solusi:</strong> {psSolution.replace(/<[^>]*>?/gm, '')}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Research Metadata & Authorship Attribution (Di atas garis footer) */}
                    {renderResearchMetadataAndTeam(true)}

                    {/* Bottom Feed Footer with Interactive QR Code */}
                    <div className="pt-2 border-t flex items-center justify-between gap-4" style={{ borderColor: cardBorder }}>
                        <div className="space-y-1">
                            <div className="text-xs font-black uppercase tracking-wider" style={{ color: primaryColor }}>
                                Telkom University • CoE STAS-RG
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-[11px]" style={{ color: mutedColor }}>
                                {socialLinks.map((item, idx) => (
                                    <span key={idx} className="inline-flex items-center gap-1">
                                        <SocialIcon platform={item.platform} style={{ width: '13px', height: '13px', color: primaryColor }} />
                                        <span>{item.value}</span>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className={`flex items-center gap-3 p-2 bg-white dark:bg-zinc-900 border ${designStyleId === 'minimal_grid' ? 'rounded-none' : 'rounded-xl'}`} style={{ borderColor: cardBorder }}>
                            <div className="text-right">
                                <div className="text-[10px] font-bold uppercase" style={{ color: primaryColor }}>Scan Live Demo</div>
                                <div className="text-[9px] text-zinc-500">Video Prototipe</div>
                            </div>
                            <div className="p-1 bg-white rounded border border-zinc-200 shrink-0">
                                <QRCodeSVG value={projectUrl || 'https://www.stas-rg.com'} size={48} level="H" fgColor={primaryColor} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* FORMAT 6: INSTAGRAM STORY & WA STATUS 9:16 VERTICAL (1080 × 1920 px) */}
            {docFormatId === 'social_story' && (
                <div className="flex flex-col justify-between h-full space-y-5 select-none">
                    <div>
                        {/* Top Story Header - Style Adaptive */}
                        <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: cardBorder }}>
                            <div className="flex items-center gap-2">
                                <span className={`text-[12px] font-extrabold uppercase px-3 py-1.5 tracking-wider ${designStyleId === 'minimal_grid' ? 'rounded-none font-mono' : 'rounded-lg'}`} style={{ backgroundColor: badgeBg, color: badgeTextColor }}>
                                    {project.category || 'INNOVATION STORY'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                {partnerLogoUrls.map((url, idx) => (
                                    <React.Fragment key={idx}>
                                        <img key={idx} src={url} alt={`Partner ${idx + 1}`} className="h-9 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                        <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700" />
                                    </React.Fragment>
                                ))}
                                <img src="/assets/img/stas.png" alt="STAS" className="h-9 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                            </div>
                        </div>

                        {/* Story Subtitle & Title */}
                        <div className="mt-6 space-y-2">
                            {subtitle && (
                                <div className={`inline-block text-xs font-bold px-3 py-1 uppercase tracking-wider border ${designStyleId === 'minimal_grid' ? 'rounded-none font-mono' : 'rounded-full'}`} style={{ backgroundColor: `${primaryColor}15`, color: primaryColor, borderColor: `${primaryColor}33` }}>
                                    {subtitle}
                                </div>
                            )}
                            <h1 className="text-3xl sm:text-4xl font-black uppercase leading-tight tracking-tight" style={{ color: titleColor }}>
                                {title}
                            </h1>
                        </div>

                        {/* Tall Hero Prototype Image */}
                        <div className={`mt-6 w-full h-[520px] overflow-hidden border flex items-center justify-center relative ${designStyleId === 'modern_split' ? 'rounded-3xl shadow-xl' : designStyleId === 'minimal_grid' ? 'rounded-none' : 'rounded-3xl'}`} style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
                            {mainImageUrl ? (
                                <img src={mainImageUrl} alt={title} className="w-full h-full object-cover" style={{ objectPosition: imgObjPosition }} />
                            ) : (
                                <div className="flex flex-col items-center text-zinc-400">
                                    <Image className="w-16 h-16 mb-2 opacity-50" />
                                    <span className="font-bold text-base">Foto Prototipe (9:16 Story)</span>
                                </div>
                            )}
                            <div className="absolute top-4 left-4 px-3.5 py-1.5 rounded-full backdrop-blur-md bg-black/60 text-white text-xs font-extrabold uppercase tracking-wider">
                                CoE STAS-RG Research
                            </div>
                        </div>

                        {/* Executive Summary */}
                        {description && (
                            <div 
                                className={`mt-5 p-4 text-xs text-justify leading-relaxed flyer-rich-content border ${designStyleId === 'modern_split' ? 'rounded-2xl border-l-4' : designStyleId === 'minimal_grid' ? 'rounded-none' : 'rounded-2xl'}`}
                                style={{ backgroundColor: cardBg, borderColor: cardBorder, borderLeftColor: designStyleId === 'modern_split' ? primaryColor : cardBorder, color: mutedColor }}
                                dangerouslySetInnerHTML={{ __html: description }}
                            />
                        )}

                        {/* 3 Innovation Pillars */}
                        <div className="mt-5 space-y-3">
                            {/* Benefits */}
                            {benefitsContent && (
                                <div className={`p-4 border ${designStyleId === 'infographic_cards' ? 'rounded-3xl' : designStyleId === 'minimal_grid' ? 'rounded-none' : 'rounded-2xl'}`} style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
                                    <h5 className="text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5" style={{ color: primaryColor }}>
                                        <Check className="w-4 h-4" />
                                        <span>Keunggulan & Manfaat</span>
                                    </h5>
                                    <div className="text-xs flyer-rich-content" style={{ color: mutedColor }} dangerouslySetInnerHTML={{ __html: benefitsContent }} />
                                </div>
                            )}

                            {/* Technical Specs */}
                            {specsContent && (
                                <div className={`p-4 border ${designStyleId === 'infographic_cards' ? 'rounded-3xl' : designStyleId === 'minimal_grid' ? 'rounded-none' : 'rounded-2xl'}`} style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
                                    <h5 className="text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5" style={{ color: primaryColor }}>
                                        <Settings className="w-4 h-4" />
                                        <span>Spesifikasi Sistem</span>
                                    </h5>
                                    <div className="text-xs flyer-rich-content" style={{ color: mutedColor }} dangerouslySetInnerHTML={{ __html: specsContent }} />
                                </div>
                            )}

                            {/* Problem - Solution Box */}
                            {(psProblem || psSolution) && (
                                <div className={`p-4 border ${designStyleId === 'infographic_cards' ? 'rounded-3xl' : designStyleId === 'minimal_grid' ? 'rounded-none' : 'rounded-2xl'}`} style={{ backgroundColor: isDark ? `${primaryColor}15` : themeConfig.bgAccent, borderColor: `${primaryColor}44` }}>
                                    <h4 className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: primaryColor }}>
                                        <Lightbulb className="w-4 h-4" />
                                        <span>Problem & Inovasi Solusi</span>
                                    </h4>
                                    {psProblem && (
                                        <p className="text-xs mb-1 leading-relaxed" style={{ color: textColor }}>
                                            <strong>Tantangan:</strong> {psProblem.replace(/<[^>]*>?/gm, '')}
                                        </p>
                                    )}
                                    {psSolution && (
                                        <p className="text-xs leading-relaxed" style={{ color: textColor }}>
                                            <strong>Solusi:</strong> {psSolution.replace(/<[^>]*>?/gm, '')}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Research Metadata & Team Profile */}
                    {renderResearchMetadataAndTeam(true)}

                    {/* Story Bottom Interactive QR Bar */}
                    <div className="pt-5 border-t space-y-4" style={{ borderColor: cardBorder }}>
                        <div className={`flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border shadow-xs ${designStyleId === 'minimal_grid' ? 'rounded-none' : 'rounded-2xl'}`} style={{ borderColor: cardBorder }}>
                            <div className="space-y-1">
                                <div className="text-xs font-black uppercase" style={{ color: primaryColor }}>
                                    Pindai Video Demo & Riset
                                </div>
                                <div className="text-[11px] text-zinc-500">
                                    Arahkan kamera HP Anda ke QR code berikut:
                                </div>
                                <div className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                                    {website}
                                </div>
                            </div>
                            <div className="p-2 bg-white rounded-xl border border-zinc-300 shrink-0">
                                <QRCodeSVG value={projectUrl || 'https://www.stas-rg.com'} size={76} level="H" fgColor={primaryColor} />
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500 dark:text-zinc-400 font-medium px-2">
                            <div className="flex flex-wrap items-center gap-3">
                                {socialLinks.map((item, idx) => (
                                    <span key={idx} className="inline-flex items-center gap-1">
                                        <SocialIcon platform={item.platform} style={{ width: '12px', height: '12px', color: primaryColor }} />
                                        <span>{item.value}</span>
                                    </span>
                                ))}
                            </div>
                            <span className="font-bold" style={{ color: primaryColor }}>Telkom University</span>
                        </div>
                    </div>
                </div>
            )}

            {/* FORMAT 7: BROSUR / LEAFLET A4 LIPAT 3 (29.7 × 21 CM - 3 KOTAK PANEL @ 9.9 × 21 CM) */}
            {docFormatId === 'brochure_trifold' && (() => {
                // Determine panels array
                const rawPanels = Array.isArray(psData?.panels) && psData.panels.length > 0
                    ? psData.panels
                    : [
                        {
                            id: 1,
                            title: title,
                            subtitle: subtitle,
                            category: project.category || '',
                            description: description,
                            benefits: benefitsContent,
                            specifications: specsContent,
                            project_url: projectUrl,
                            image_url: mainImageUrl,
                        }
                    ];

                // Exactly 3 slots for the 3 panels of the trifold brochure
                const panels = [
                    rawPanels[0] || null,
                    rawPanels[1] || null,
                    rawPanels[2] || null,
                ];

                return (
                    <div className="relative h-full select-none flex flex-col justify-between">
                        <div className="grid grid-cols-3 gap-0 h-full w-full relative">
                            {panels.map((panel, index) => {
                                const boxNum = index + 1;
                                const isFirst = index === 0;
                                const isMiddle = index === 1;
                                const isLast = index === 2;

                                const paddingClasses = isFirst 
                                    ? 'pr-4 pl-1' 
                                    : isMiddle 
                                        ? 'px-4' 
                                        : 'pl-4 pr-1';

                                const borderClasses = !isLast 
                                    ? 'border-r border-dashed' 
                                    : '';

                                if (!panel) {
                                    // Empty / Placeholder Panel
                                    return (
                                        <div 
                                            key={boxNum} 
                                            className={`flex flex-col justify-between ${paddingClasses} ${borderClasses} relative`}
                                            style={{ borderColor: isDark ? '#334155' : '#cbd5e1' }}
                                        >
                                            <div className="flex items-center justify-end pb-1.5 border-b" style={{ borderColor: cardBorder }}>
                                                <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                                                    {partnerLogoUrls.map((url, idx) => (
                                                        <React.Fragment key={idx}>
                                                            <img src={url} alt={`Partner ${idx + 1}`} className="h-4 object-contain opacity-50" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                                            <div className="h-3 w-px bg-zinc-300 dark:bg-zinc-700 opacity-40" />
                                                        </React.Fragment>
                                                    ))}
                                                    <img src="/assets/img/stas.png" alt="STAS" className="h-4 object-contain opacity-40" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                                </div>
                                            </div>

                                            <div className="my-auto flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed text-center opacity-60" style={{ borderColor: cardBorder }}>
                                                <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-2 text-zinc-400">
                                                    <BookOpen className="w-5 h-5" />
                                                </div>
                                                <div className="text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                                                    Panel Inovasi Belum Diisi
                                                </div>
                                                <p className="text-[9.5px] text-zinc-400 max-w-[180px] leading-relaxed">
                                                    Gunakan tombol tab panel pada formulir untuk mengisi inovasi ini.
                                                </p>
                                            </div>

                                            <div className="pt-2 border-t text-[8.5px] font-medium text-zinc-400" style={{ borderColor: cardBorder }}>
                                                <span>STAS-RG</span>
                                            </div>
                                        </div>
                                    );
                                }

                                // Active Panel with Data
                                const pTitle = panel.title || (isFirst ? title : (project.name || ''));
                                const pSubtitle = panel.subtitle || (isFirst ? subtitle : '');
                                const pCategory = panel.category || project.category || 'CoE STAS-RG';
                                const pDesc = panel.description || (isFirst ? description : '');
                                const pProblem = panel.problem || (isFirst ? (psData?.problem || '') : '');
                                const pSolution = panel.solution || (isFirst ? (psData?.solution || '') : '');
                                const pBenefits = panel.benefits || (isFirst ? benefitsContent : '');
                                const pSpecs = panel.specifications || panel.specs || (isFirst ? specsContent : '');
                                const pImage = panel.image_url || (isFirst ? mainImageUrl : null);
                                const pUrl = panel.project_url || (isFirst ? projectUrl : 'https://www.stas-rg.com');

                                const isCurrentEditing = isLive && project?.active_trifold_tab !== undefined && project.active_trifold_tab === (boxNum - 1);

                                return (
                                    <div 
                                        key={boxNum} 
                                        className={`flex flex-col justify-between ${paddingClasses} ${borderClasses} relative transition-all duration-200`}
                                        style={{ borderColor: isDark ? '#334155' : '#cbd5e1' }}
                                    >
                                        <div className="space-y-2">
                                            {/* Panel Header */}
                                            <div className="flex items-center justify-end pb-1.5 border-b" style={{ borderColor: cardBorder }}>
                                                <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                                                    {partnerLogoUrls.map((url, idx) => (
                                                        <React.Fragment key={idx}>
                                                            <img src={url} alt={`Partner ${idx + 1}`} className="h-5 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                                            <div className="h-3 w-px bg-zinc-300 dark:bg-zinc-700" />
                                                        </React.Fragment>
                                                    ))}
                                                    <img src="/assets/img/stas.png" alt="STAS" className="h-5 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                                </div>
                                            </div>

                                            {/* Category Badge, Title, and Subtitle below Title */}
                                            <div className="space-y-0.5">
                                                {pCategory && (
                                                    <div className="inline-block text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-0.5" style={{ backgroundColor: badgeBg, color: badgeTextColor, border: `1px solid ${primaryColor}30` }}>
                                                        {pCategory}
                                                    </div>
                                                )}
                                                <h3 className="text-[12.5px] font-black uppercase leading-snug tracking-tight line-clamp-2" style={{ color: titleColor }}>
                                                    {pTitle}
                                                </h3>
                                                {pSubtitle && (
                                                    <p className="text-[8.5px] font-medium leading-tight line-clamp-1" style={{ color: mutedColor }}>
                                                        {pSubtitle}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Image Photo Slot */}
                                            <div className="w-full h-[125px] rounded-xl overflow-hidden border flex items-center justify-center relative shadow-xs shrink-0" style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
                                                {pImage ? (
                                                    <img src={pImage} alt={pTitle} className="w-full h-full object-cover" style={{ objectPosition: `${panel.image_x ?? 50}% ${panel.image_y ?? 50}%` }} />
                                                ) : (
                                                    <div className="flex flex-col items-center text-zinc-400 p-2 text-center">
                                                        <Image className="w-6 h-6 mb-0.5 opacity-50" />
                                                        <span className="text-[9px] font-bold">Foto Inovasi</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Description */}
                                            {pDesc && (
                                                <div className="text-[9px] text-justify leading-relaxed flyer-rich-content line-clamp-3" style={{ color: mutedColor }} dangerouslySetInnerHTML={{ __html: pDesc }} />
                                            )}

                                            {/* Benefits / Keunggulan Card */}
                                            {pBenefits && (
                                                <div className="p-2 rounded-xl border" style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
                                                    <div className="flex items-center gap-1 mb-1 text-[9.5px] font-bold uppercase" style={{ color: primaryColor }}>
                                                        <Check className="w-3 h-3 shrink-0" />
                                                        <span>Manfaat & Keunggulan</span>
                                                    </div>
                                                    <div className="text-[8.5px] leading-snug flyer-rich-content line-clamp-3" style={{ color: mutedColor }} dangerouslySetInnerHTML={{ __html: pBenefits }} />
                                                </div>
                                            )}

                                            {/* Specs / Spesifikasi Card */}
                                            {pSpecs && (
                                                <div className="p-2 rounded-xl border" style={{ backgroundColor: isDark ? `${primaryColor}10` : themeConfig.bgAccent, borderColor: `${primaryColor}30` }}>
                                                    <div className="flex items-center gap-1 mb-1 text-[9.5px] font-bold uppercase" style={{ color: primaryColor }}>
                                                        <Settings className="w-3 h-3 shrink-0" />
                                                        <span>Spesifikasi Teknis</span>
                                                    </div>
                                                    <div className="text-[8.5px] leading-snug flyer-rich-content line-clamp-3" style={{ color: textColor }} dangerouslySetInnerHTML={{ __html: pSpecs }} />
                                                </div>
                                            )}

                                            {/* Combined Problem - Solution Card */}
                                            {(pProblem || pSolution) && (
                                                <div className="p-2 rounded-xl border space-y-1.5" style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
                                                    {pProblem && (
                                                        <div>
                                                            <div className="flex items-center gap-1 mb-0.5 text-[9px] font-bold uppercase" style={{ color: isDark ? '#f87171' : '#dc2626' }}>
                                                                <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
                                                                <span>Latar Belakang & Masalah</span>
                                                            </div>
                                                            <div className="text-[8px] leading-snug flyer-rich-content line-clamp-3" style={{ color: mutedColor }} dangerouslySetInnerHTML={{ __html: pProblem }} />
                                                        </div>
                                                    )}
                                                    {pProblem && pSolution && (
                                                        <div className="h-px w-full" style={{ backgroundColor: isDark ? '#334155' : '#e2e8f0' }} />
                                                    )}
                                                    {pSolution && (
                                                        <div>
                                                            <div className="flex items-center gap-1 mb-0.5 text-[9px] font-bold uppercase" style={{ color: primaryColor }}>
                                                                <Lightbulb className="w-2.5 h-2.5 shrink-0" />
                                                                <span>Solusi Inovasi</span>
                                                            </div>
                                                            <div className="text-[8px] leading-snug flyer-rich-content line-clamp-3" style={{ color: textColor }} dangerouslySetInnerHTML={{ __html: pSolution }} />
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Research Metadata & Authorship Attribution */}
                                        {renderResearchMetadataAndTeam(true)}

                                        {/* Panel Bottom QR & Footer */}
                                        <div className="pt-2 border-t space-y-1.5" style={{ borderColor: cardBorder }}>
                                            <div className="p-1.5 rounded-lg border flex items-center justify-between gap-1.5 shadow-2xs" style={{ backgroundColor: isDark ? '#121824' : '#ffffff', borderColor: cardBorder }}>
                                                <div className="min-w-0 space-y-0.5">
                                                    <div className="text-[8.5px] font-black uppercase tracking-wider truncate" style={{ color: primaryColor }}>
                                                        Pindai Riset
                                                    </div>
                                                    <div className="text-[7.5px] text-zinc-500 truncate font-mono">
                                                        {website}
                                                    </div>
                                                </div>
                                                <div className="p-0.5 bg-white rounded border border-zinc-200 shrink-0">
                                                    <QRCodeSVG value={pUrl || 'https://www.stas-rg.com'} size={34} level="M" fgColor={primaryColor} />
                                                </div>
                                            </div>

                                            {/* Social Media Links in Brochure Footer */}
                                            <div className="flex items-center justify-between flex-wrap gap-x-1.5 gap-y-0.5 text-[7.5px] pt-0.5" style={{ color: mutedColor }}>
                                                {socialLinks && socialLinks.length > 0 ? (
                                                    socialLinks.slice(0, 3).map((s, idx) => (
                                                        <div key={idx} className="flex items-center gap-1 font-medium">
                                                            <SocialIcon platform={s.platform} className="w-2.5 h-2.5 shrink-0" style={{ color: primaryColor }} />
                                                            <span className="truncate max-w-[80px]">{s.value}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <>
                                                        <div className="flex items-center gap-1 font-medium">
                                                            <SocialIcon platform="website" className="w-2.5 h-2.5 shrink-0" style={{ color: primaryColor }} />
                                                            <span>{website}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 font-medium">
                                                            <SocialIcon platform="instagram" className="w-2.5 h-2.5 shrink-0" style={{ color: primaryColor }} />
                                                            <span>@stas.rg</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 font-medium">
                                                            <SocialIcon platform="youtube" className="w-2.5 h-2.5 shrink-0" style={{ color: primaryColor }} />
                                                            <span>@stas_rg</span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })()}
                </>
            )}
        </div>
    );
}

/**
 * ProjectPreview:
 * Auto-scaled container accommodating all document formats (A4, Banner, Factsheet, 16:9 Pitch)
 */
export default function ProjectPreview({ project, isLive = false, id, previewLang = 'id' }) {
    const containerRef = useRef(null);
    const [containerWidth, setContainerWidth] = useState(0);

    const docFormatId = project?.doc_format || 'a4_flyer';
    const formatConfig = getDocumentFormat(docFormatId);

    // Measure available container width
    useEffect(() => {
        if (!containerRef.current) return;

        const updateWidth = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.clientWidth);
            }
        };

        updateWidth();

        const observer = new ResizeObserver(() => {
            updateWidth();
        });

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    const canvasWidth = formatConfig.canvasWidth;
    const canvasHeight = formatConfig.canvasHeight;

    // Dynamic scale to fit container width nicely
    const scale = containerWidth > 0 ? Math.min(1, (containerWidth - 24) / canvasWidth) : 0.6;
    const scaledHeight = canvasHeight * scale;

    return (
        <div className="w-full flex flex-col items-center">
            <div 
                ref={containerRef} 
                className="w-full flex justify-center items-start overflow-hidden bg-zinc-100/70 dark:bg-zinc-950/70 p-2 sm:p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800"
                style={{ minHeight: `${scaledHeight + 20}px` }}
            >
                <div 
                    style={{
                        width: `${canvasWidth}px`,
                        height: `${canvasHeight}px`,
                        transform: `scale(${scale})`,
                        transformOrigin: 'top center',
                        marginBottom: `-${canvasHeight - scaledHeight}px`,
                        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.08)',
                    }}
                    className="rounded-sm shrink-0"
                >
                    <A4Document project={project} isLive={isLive} id={id} previewLang={previewLang} />
                </div>
            </div>
        </div>
    );
}
