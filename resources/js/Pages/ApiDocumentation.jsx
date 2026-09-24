import React, { useState, useEffect, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Terminal, 
    Code2, 
    Zap, 
    Shield, 
    Layers, 
    BookOpen, 
    FolderKanban, 
    Users, 
    BarChart3, 
    Search, 
    Check, 
    Copy, 
    Play, 
    RefreshCw, 
    ArrowRight, 
    ExternalLink, 
    Download, 
    Sliders, 
    Sparkles, 
    Info, 
    AlertCircle, 
    CheckCircle2, 
    FileCode, 
    Cpu, 
    Globe, 
    Clock, 
    Server, 
    Database, 
    ChevronRight, 
    ChevronDown, 
    Maximize2, 
    Filter,
    ChevronLeft,
    CornerDownRight
} from 'lucide-react';
import { AppProvider, useApp } from '../Context/AppContext';
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';

/* ─────────────────── CODE SNIPPET GENERATOR ─────────────────── */
function generateSnippets(endpoint, params = {}) {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://stasrg.telkomuniversity.ac.id';
    const queryString = new URLSearchParams(
        Object.entries(params).filter(([_, v]) => v !== undefined && v !== '' && v !== null)
    ).toString();

    const fullUrl = `${origin}${endpoint.path}${queryString ? `?${queryString}` : ''}`;

    return {
        curl: `curl -X ${endpoint.method} "${fullUrl}" \\
  -H "Accept: application/json"`,

        javascript: `// JavaScript (Fetch API)
const response = await fetch("${fullUrl}", {
  method: "${endpoint.method}",
  headers: {
    "Accept": "application/json"
  }
});

const data = await response.json();
console.log(data);`,

        python: `# Python (requests)
import requests

url = "${fullUrl}"
headers = {"Accept": "application/json"}

response = requests.${endpoint.method.toLowerCase()}(url, headers=headers)
data = response.json()
print(data)`,

        php: `<?php
// PHP (cURL)
$curl = curl_init();

curl_setopt_array($curl, [
  CURLOPT_URL => "${fullUrl}",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CUSTOMREQUEST => "${endpoint.method}",
  CURLOPT_HTTPHEADER => [
    "Accept: application/json"
  ],
]);

$response = curl_exec($curl);
$err = curl_error($curl);
curl_close($curl);

if (!$err) {
  $data = json_decode($response, true);
  print_r($data);
}`,

        go: `// Go (net/http)
package main

import (
	"fmt"
	"io"
	"net/http"
)

func main() {
	req, _ := http.NewRequest("${endpoint.method}", "${fullUrl}", nil)
	req.Header.Add("Accept", "application/json")

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		fmt.Println(err)
		return
	}
	defer res.Body.Close()

	body, _ := io.ReadAll(res.Body)
	fmt.Println(string(body))
}`
    };
}

/* ─────────────────── ENDPOINTS SPECIFICATION ─────────────────── */
const API_ENDPOINTS = [
    {
        id: 'get-projects',
        group: 'Katalog Riset & Proyek',
        method: 'GET',
        path: '/api/v1/projects',
        title: 'Daftar Proyek Riset Terpublikasi',
        description: 'Mengambil daftar proyek ilmiah dan prototipe riset yang telah diverifikasi dan dipublikasikan. Mendukung pencarian teks global, filter bidang fokus (kategori), format dokumen, serta penomoran halaman (pagination).',
        params: [
            { name: 'search', type: 'string', required: false, default: '-', desc: 'Kata kunci pencarian pada nama proyek, deskripsi, abstrak, atau nama lab.' },
            { name: 'category', type: 'string', required: false, default: '-', desc: 'Filter berdasarkan bidang fokus riset spesifik (contoh: Smart Agriculture, IoT, AI).' },
            { name: 'format', type: 'string', required: false, default: '-', desc: 'Format layout dokumen (a4_flyer atau trifold_brochure).' },
            { name: 'sort', type: 'string', required: false, default: 'latest', desc: 'Urutan hasil: latest (terbaru), oldest (terlama), alphabetical (A-Z).' },
            { name: 'page', type: 'integer', required: false, default: '1', desc: 'Nomor halaman yang diminta.' },
            { name: 'per_page', type: 'integer', required: false, default: '10', desc: 'Jumlah data per halaman (Maksimal 50).' },
        ],
        sampleResponse: {
            success: true,
            message: "Published research projects retrieved successfully.",
            data: [
                {
                    id: 1,
                    name: "Autonomous Hydroponic Greenhouse Monitoring with LoRa & AI",
                    slug: "autonomous-hydroponic-greenhouse-monitoring",
                    title: "Sistem Presisi Nutrisi & Iklim Mikro Pertanian Berbasis LoRa & AI",
                    subtitle: "Monitoring Tanaman Cerdas Terdistribusi untuk Greenhouse Presisi",
                    category: "Smart Agriculture",
                    doc_format: "a4_flyer",
                    layout_preset: "balanced",
                    main_image_url: "https://stasrg.telkomuniversity.ac.id/storage/projects/hydroponic.jpg",
                    lab_affiliation: "Smart Sensing & Automation Lab",
                    patent_number: "P00202401928",
                    publication_doi: "10.1109/STAS.2024.981240",
                    showcase_url: "https://stasrg.telkomuniversity.ac.id/showcase/autonomous-hydroponic-greenhouse-monitoring",
                    api_detail_url: "https://stasrg.telkomuniversity.ac.id/api/v1/projects/autonomous-hydroponic-greenhouse-monitoring",
                    created_at: "2026-03-15T08:30:00.000000Z",
                    updated_at: "2026-09-20T14:15:00.000000Z"
                }
            ],
            meta: {
                current_page: 1,
                from: 1,
                last_page: 3,
                per_page: 10,
                to: 10,
                total: 28
            },
            links: {
                first: "https://stasrg.telkomuniversity.ac.id/api/v1/projects?page=1",
                last: "https://stasrg.telkomuniversity.ac.id/api/v1/projects?page=3",
                prev: null,
                next: "https://stasrg.telkomuniversity.ac.id/api/v1/projects?page=2"
            }
        }
    },
    {
        id: 'get-project-detail',
        group: 'Katalog Riset & Proyek',
        method: 'GET',
        path: '/api/v1/projects/{slug}',
        title: 'Detail Lengkap Proyek Riset',
        description: 'Mengambil seluruh rincian atribut inovasi berdasarkan slug unik, mencakup spesifikasi teknis, daftar keunggulan, solusi masalah, logo mitra industri, tautan QR tracking, dan proyek terkait.',
        params: [
            { name: 'slug', type: 'string', in: 'path', required: true, default: 'autonomous-hydroponic-greenhouse-monitoring', desc: 'Slug URL unik dari proyek riset yang ingin diakses.' }
        ],
        sampleResponse: {
            success: true,
            message: "Project detail retrieved successfully.",
            data: {
                id: 1,
                name: "Autonomous Hydroponic Greenhouse",
                slug: "autonomous-hydroponic-greenhouse-monitoring",
                title: "Sistem Presisi Nutrisi & Iklim Mikro Pertanian Berbasis LoRa & AI",
                subtitle: "Monitoring Tanaman Cerdas Terdistribusi untuk Greenhouse Presisi",
                category: "Smart Agriculture",
                description: "Sistem pemantauan presisi iklim mikro dan konsentrasi larutan nutrisi otomatis secara real-time.",
                doc_format: "a4_flyer",
                layout_preset: "balanced",
                design_style: "academic",
                color_theme: "default",
                main_image_url: "https://stasrg.telkomuniversity.ac.id/storage/projects/hydro.jpg",
                benefits: [
                    "Efisiensi penggunaan air hingga 40%",
                    "Prediksi defisiensi hara real-time melalui kamera AI",
                    "Transmisi data nirkabel jarak jauh hingga 5 KM dengan LoRaWAN"
                ],
                specifications: [
                    "Sensor: pH, EC, Suhu, Kelembaban Tanah, Lux Meter",
                    "Mikrokontroler: ESP32 + STM32 Low Power",
                    "Daya: Panel Surya 50W dengan Baterai LiFePO4"
                ],
                problem_solution: [
                    "Masalah: Fluktuasi pH nutrisi menyebabkan gagal panen",
                    "Solusi: Dosing pump otomatis berbasis PID controller"
                ],
                research_team: [
                    { name: "Dr. Eng. Fatin Tsani, S.T., M.T.", role: "Principal Investigator" },
                    { name: "Rian Hidayat, M.Kom.", role: "Co-PI (AI Engineer)" }
                ],
                lab_affiliation: "Smart Sensing & Automation Lab",
                patent_number: "P00202401928",
                publication_doi: "10.1109/STAS.2024.981240",
                project_url: "https://github.com/stasrg/hydroponic-iot",
                qr_code_url: "https://stasrg.telkomuniversity.ac.id/storage/qr_codes/hydro.png",
                qr_tracking_url: "https://stasrg.telkomuniversity.ac.id/qr/autonomous-hydroponic-greenhouse-monitoring",
                partner_logos: [
                    "https://stasrg.telkomuniversity.ac.id/storage/partners/telkom.png"
                ],
                social_links: {
                    website: "https://stasrg.telkomuniversity.ac.id",
                    instagram: "https://instagram.com/stas.rg",
                    youtube: "https://youtube.com/@stasrg"
                },
                showcase_url: "https://stasrg.telkomuniversity.ac.id/showcase/autonomous-hydroponic-greenhouse-monitoring"
            },
            related: []
        }
    },
    {
        id: 'get-categories',
        group: 'Kategori Riset & Taksonomi',
        method: 'GET',
        path: '/api/v1/categories',
        title: 'Daftar Kategori & Bidang Fokus Riset',
        description: 'Mengambil seluruh taksonomi kategori riset yang tersedia beserta jumlah proyek aktif terpublikasi pada masing-masing bidang keahlian.',
        params: [],
        sampleResponse: {
            success: true,
            message: "Research categories retrieved successfully.",
            total: 5,
            data: [
                { name: "Smart Agriculture", projects_count: 12, last_updated_at: "2026-09-22T10:00:00.000000Z" },
                { name: "IoT & Embedded Systems", projects_count: 8, last_updated_at: "2026-09-20T08:30:00.000000Z" },
                { name: "AI & Machine Learning", projects_count: 6, last_updated_at: "2026-09-18T16:45:00.000000Z" },
                { name: "Green Tech & Energy", projects_count: 4, last_updated_at: "2026-09-15T11:20:00.000000Z" }
            ]
        }
    },
    {
        id: 'get-researchers',
        group: 'Direktori Peneliti & Tim',
        method: 'GET',
        path: '/api/v1/researchers',
        title: 'Daftar Peneliti Aktif & Principal Investigator',
        description: 'Mengambil daftar profil peneliti aktif, dosen pembimbing, dan asisten riset CoE STAS-RG beserta afiliasi lab dan tautan indeks akademik resmi.',
        params: [
            { name: 'search', type: 'string', required: false, default: '-', desc: 'Cari berdasarkan nama, NIP/NIDN, keahlian, atau bio singkat.' },
            { name: 'lab', type: 'string', required: false, default: '-', desc: 'Filter berdasarkan laboratorium afiliasi.' },
            { name: 'page', type: 'integer', required: false, default: '1', desc: 'Nomor halaman.' },
            { name: 'per_page', type: 'integer', required: false, default: '12', desc: 'Jumlah peneliti per halaman.' }
        ],
        sampleResponse: {
            success: true,
            message: "Active researchers retrieved successfully.",
            data: [
                {
                    id: 1,
                    name: "Dr. Fatin Tsani, S.T., M.T.",
                    role: "Head of Research Lab / PI",
                    identifier: "NIP: 198504122010121002",
                    lab_affiliation: "Smart Sensing & Automation Lab",
                    email: "fatin.tsani@telkomuniversity.ac.id",
                    avatar_url: "https://stasrg.telkomuniversity.ac.id/storage/avatars/fatin.jpg",
                    expertise: ["IoT Systems", "Embedded AI", "Agricultural Automation"],
                    api_detail_url: "https://stasrg.telkomuniversity.ac.id/api/v1/researchers/1"
                }
            ],
            meta: {
                current_page: 1,
                from: 1,
                last_page: 1,
                per_page: 12,
                to: 1,
                total: 1
            }
        }
    },
    {
        id: 'get-researcher-detail',
        group: 'Direktori Peneliti & Tim',
        method: 'GET',
        path: '/api/v1/researchers/{id}',
        title: 'Detail Profil Peneliti & Tautan Akademik',
        description: 'Mengambil profil komprehensif peneliti spesifik, mencakup tautan profil Google Scholar, Scopus ID, SINTA, ORCID, dan riwayat proyek riset.',
        params: [
            { name: 'id', type: 'integer', in: 'path', required: true, default: '1', desc: 'ID numerik peneliti yang terdaftar.' }
        ],
        sampleResponse: {
            success: true,
            message: "Researcher profile retrieved successfully.",
            data: {
                id: 1,
                name: "Dr. Fatin Tsani, S.T., M.T.",
                role: "Head of Research Lab / PI",
                identifier: "NIP: 198504122010121002",
                lab_affiliation: "Smart Sensing & Automation Lab",
                email: "fatin.tsani@telkomuniversity.ac.id",
                bio: "Peneliti utama di bidang sistem telekomunikasi cerdas dan otomasi pertanian presisi.",
                avatar_url: "https://stasrg.telkomuniversity.ac.id/storage/avatars/fatin.jpg",
                expertise: ["IoT Systems", "Embedded AI", "Agricultural Automation"],
                academic_profiles: {
                    google_scholar: "https://scholar.google.com/citations?user=xyz123",
                    scopus: "https://www.scopus.com/authid/detail.uri?authorId=57200000000",
                    sinta: "https://sinta.kemdikbud.go.id/authors/profile/6000000",
                    orcid: "https://orcid.org/0000-0002-1234-5678",
                    linkedin: "https://linkedin.com/in/fatintsani"
                },
                usage_count: 8
            }
        }
    },
    {
        id: 'get-stats',
        group: 'Statistik & Metrik Repositori',
        method: 'GET',
        path: '/api/v1/stats',
        title: 'Ringkasan Statistik Global Riset',
        description: 'Menyediakan ringkasan metrik publik CoE STAS-RG, meliputi total inovasi terpublikasi, jumlah kategori aktif, distribusi format dokumen, dan statistik peneliti.',
        params: [],
        sampleResponse: {
            success: true,
            message: "Global research repository statistics retrieved successfully.",
            data: {
                total_published_projects: 28,
                total_draft_projects: 4,
                total_active_researchers: 14,
                total_categories: 5,
                format_distribution: {
                    a4_flyer: 20,
                    trifold_brochure: 8
                },
                top_categories: {
                    "Smart Agriculture": 12,
                    "IoT & Embedded Systems": 8,
                    "AI & Machine Learning": 6
                },
                lab: "Center of Excellence STAS-RG Telkom University",
                server_time: "2026-09-24T09:45:00+07:00"
            }
        }
    },
    {
        id: 'get-openapi',
        group: 'Metadata & Spesifikasi',
        method: 'GET',
        path: '/api/v1/openapi.json',
        title: 'Spesifikasi OpenAPI 3.0 (Swagger JSON)',
        description: 'Mengunduh atau membaca skema lengkap OpenAPI 3.0 dalam format JSON standar yang dapat diimpor langsung ke Postman, Swagger UI, Insomnia, atau RapidAPI.',
        params: [],
        sampleResponse: {
            openapi: "3.0.0",
            info: {
                title: "CoE STAS-RG Public Research REST API",
                version: "1.0.0",
                description: "Open programmatic API for accessing published research projects..."
            },
            paths: {
                "/projects": { "...": "..." }
            }
        }
    }
];

/* ─────────────────── INTERACTIVE API PLAYGROUND COMPONENT ─────────────────── */
function ApiPlayground({ endpoint, baseUrl }) {
    const [selectedLang, setSelectedLang] = useState('curl');
    const [paramValues, setParamValues] = useState(() => {
        const initial = {};
        endpoint.params.forEach((p) => {
            if (p.default && p.default !== '-') {
                initial[p.name] = p.default;
            }
        });
        return initial;
    });

    const [isLoading, setIsLoading] = useState(false);
    const [responseStatus, setResponseStatus] = useState(null);
    const [responseTime, setResponseTime] = useState(null);
    const [responseData, setResponseData] = useState(null);
    const [copiedSnippet, setCopiedSnippet] = useState(false);
    const [copiedJson, setCopiedJson] = useState(false);

    // Compute active path & snippets
    const resolvedPath = useMemo(() => {
        let path = endpoint.path;
        endpoint.params
            .filter((p) => p.in === 'path')
            .forEach((p) => {
                const val = paramValues[p.name] || `{${p.name}}`;
                path = path.replace(`{${p.name}}`, encodeURIComponent(val));
            });
        return path;
    }, [endpoint, paramValues]);

    const queryParams = useMemo(() => {
        const queryObj = {};
        endpoint.params
            .filter((p) => !p.in || p.in === 'query')
            .forEach((p) => {
                if (paramValues[p.name] !== undefined && paramValues[p.name] !== '') {
                    queryObj[p.name] = paramValues[p.name];
                }
            });
        return queryObj;
    }, [endpoint, paramValues]);

    const snippets = useMemo(() => {
        return generateSnippets({ method: endpoint.method, path: resolvedPath }, queryParams);
    }, [endpoint, resolvedPath, queryParams]);

    const handleParamChange = (name, value) => {
        setParamValues((prev) => ({ ...prev, [name]: value }));
    };

    const handleExecute = async () => {
        setIsLoading(true);
        setResponseData(null);
        setResponseStatus(null);
        setResponseTime(null);

        const startTime = performance.now();
        const queryString = new URLSearchParams(queryParams).toString();
        const requestUrl = `${resolvedPath}${queryString ? `?${queryString}` : ''}`;

        try {
            const res = await fetch(requestUrl, {
                method: endpoint.method,
                headers: {
                    Accept: 'application/json',
                },
            });

            const endTime = performance.now();
            setResponseTime(Math.round(endTime - startTime));
            setResponseStatus(res.status);

            const json = await res.json();
            setResponseData(json);
        } catch (err) {
            const endTime = performance.now();
            setResponseTime(Math.round(endTime - startTime));
            setResponseStatus(500);
            setResponseData({
                success: false,
                error: 'Network Error',
                message: err.message || 'Gagal terhubung ke API endpoint.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const copyCode = (text, type = 'snippet') => {
        navigator.clipboard.writeText(typeof text === 'string' ? text : JSON.stringify(text, null, 2));
        if (type === 'snippet') {
            setCopiedSnippet(true);
            setTimeout(() => setCopiedSnippet(false), 2000);
        } else {
            setCopiedJson(true);
            setTimeout(() => setCopiedJson(false), 2000);
        }
    };

    return (
        <div className="space-y-4">
            {/* Query / Path Parameters Form */}
            {endpoint.params.length > 0 && (
                <div className="p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                            <Sliders className="w-3.5 h-3.5 text-[#0AB600]" />
                            <span>Parameter Permintaan (Live Request Builder)</span>
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono">
                            {endpoint.params.length} Parameter Tersedia
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {endpoint.params.map((p) => (
                            <div key={p.name} className="space-y-1">
                                <label className="text-xs font-semibold text-slate-800 dark:text-zinc-200 flex items-center justify-between">
                                    <span className="font-mono text-[#0AB600]">{p.name}</span>
                                    <span className="text-[10px] text-zinc-400 font-normal">
                                        {p.required ? <span className="text-rose-500 font-bold">Wajib</span> : 'Opsional'} ({p.type})
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    value={paramValues[p.name] !== undefined ? paramValues[p.name] : ''}
                                    onChange={(e) => handleParamChange(p.name, e.target.value)}
                                    placeholder={p.desc || `Masukkan ${p.name}...`}
                                    className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#0AB600]/40 font-mono shadow-2xs"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Code Snippet Tabs & Live Run Bar */}
            <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 overflow-hidden bg-[#0A0F1D] text-zinc-100 shadow-lg">
                {/* Header Bar */}
                <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-[#0D1527] border-b border-zinc-800 gap-2">
                    {/* Language Switcher */}
                    <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
                        {[
                            { id: 'curl', label: 'cURL' },
                            { id: 'javascript', label: 'JavaScript' },
                            { id: 'python', label: 'Python' },
                            { id: 'php', label: 'PHP' },
                            { id: 'go', label: 'Go' },
                        ].map((lang) => (
                            <button
                                key={lang.id}
                                onClick={() => setSelectedLang(lang.id)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                    selectedLang === lang.id
                                        ? 'bg-[#0AB600] text-white shadow-xs'
                                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                                }`}
                            >
                                {lang.label}
                            </button>
                        ))}
                    </div>

                    {/* Action Buttons: Copy Code & Send Request */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => copyCode(snippets[selectedLang], 'snippet')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                        >
                            {copiedSnippet ? <Check className="w-3.5 h-3.5 text-[#0AB600]" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedSnippet ? 'Tersalin!' : 'Salin Snippet'}</span>
                        </button>

                        <button
                            onClick={handleExecute}
                            disabled={isLoading}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#0AB600] hover:bg-[#089600] text-white text-xs font-bold transition-all shadow-md shadow-[#0AB600]/25 active:scale-95 disabled:opacity-50 cursor-pointer"
                        >
                            {isLoading ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <Play className="w-3.5 h-3.5 fill-current" />
                            )}
                            <span>{isLoading ? 'Mengirim...' : 'Kirim Permintaan'}</span>
                        </button>
                    </div>
                </div>

                {/* Code Body */}
                <div className="p-4 font-mono text-xs overflow-x-auto text-emerald-400/90 leading-relaxed max-h-64">
                    <pre>{snippets[selectedLang]}</pre>
                </div>
            </div>

            {/* Live Response Panel */}
            <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 overflow-hidden bg-white dark:bg-[#0E1524] shadow-md">
                <div className="flex items-center justify-between px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200/80 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                            <Server className="w-3.5 h-3.5 text-[#0AB600]" />
                            <span>Respons API Live</span>
                        </span>
                        {responseStatus !== null && (
                            <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${
                                    responseStatus >= 200 && responseStatus < 300
                                        ? 'bg-emerald-500/15 text-[#0AB600] border border-[#0AB600]/30'
                                        : 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
                                }`}
                            >
                                {responseStatus} {responseStatus === 200 ? 'OK' : responseStatus === 404 ? 'NOT FOUND' : 'ERROR'}
                            </span>
                        )}
                        {responseTime !== null && (
                            <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{responseTime}ms</span>
                            </span>
                        )}
                    </div>

                    <button
                        onClick={() => copyCode(responseData || endpoint.sampleResponse, 'json')}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-[11px] font-semibold transition-all cursor-pointer"
                    >
                        {copiedJson ? <Check className="w-3 h-3 text-[#0AB600]" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedJson ? 'Tersalin' : 'Salin JSON'}</span>
                    </button>
                </div>

                <div className="p-4 font-mono text-xs overflow-x-auto bg-[#070D18] text-zinc-200 max-h-80 leading-relaxed">
                    <pre>{JSON.stringify(responseData || endpoint.sampleResponse, null, 2)}</pre>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────── MAIN PAGE COMPONENT ─────────────────── */
export default function ApiDocumentation({ stats = {}, baseUrl = '' }) {
    const { language, t } = useApp();
    const isId = language !== 'en';

    const [activeEndpointId, setActiveEndpointId] = useState('get-projects');
    const [searchFilter, setSearchFilter] = useState('');
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    const activeEndpoint = useMemo(() => {
        return API_ENDPOINTS.find((e) => e.id === activeEndpointId) || API_ENDPOINTS[0];
    }, [activeEndpointId]);

    const filteredEndpoints = useMemo(() => {
        if (!searchFilter.trim()) return API_ENDPOINTS;
        const q = searchFilter.toLowerCase();
        return API_ENDPOINTS.filter(
            (e) =>
                e.title.toLowerCase().includes(q) ||
                e.path.toLowerCase().includes(q) ||
                e.group.toLowerCase().includes(q)
        );
    }, [searchFilter]);

    // Group endpoints by category
    const groupedEndpoints = useMemo(() => {
        const groups = {};
        filteredEndpoints.forEach((e) => {
            if (!groups[e.group]) groups[e.group] = [];
            groups[e.group].push(e);
        });
        return groups;
    }, [filteredEndpoints]);

    return (
        <div className="min-h-screen flex flex-col bg-[#FAFBFD] dark:bg-[#070D18] text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors selection:bg-[#0AB600]/20 selection:text-[#0AB600]">
            <Head title="STAS RG Public REST API v1 - Dokumentasi & Developer Portal">
                <meta
                    name="description"
                    content="Dokumentasi resmi REST API publik CoE STAS-RG Telkom University. Akses terprogram ke repositori proyek inovasi, direktori peneliti, dan data riset terbuka."
                />
            </Head>

            {/* Top Navigation */}
            <Navbar />

            {/* Sub-Header Hero Banner */}
            <div className="pt-20 sm:pt-24 pb-8 sm:pb-12 bg-white dark:bg-[#0B111F] border-b border-zinc-200/80 dark:border-zinc-800/80 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#0AB600]/10 rounded-full blur-3xl pointer-events-none" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="space-y-3">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0AB600]/10 border border-[#0AB600]/25 text-[#0AB600] text-xs font-bold">
                                <Terminal className="w-3.5 h-3.5" />
                                <span>CoE STAS-RG Open REST API v1</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-[#0AB600]"></span>
                                <span className="font-mono">v1.0.0 Stable</span>
                            </div>

                            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                Dokumentasi API Publik & Developer Portal
                            </h1>

                            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed">
                                Akses seluruh repositori karya riset ilmiah, lembar spesifikasi prototipe, dan direktori peneliti CoE STAS-RG secara terprogram melalui antarmuka REST API JSON standar industri.
                            </p>
                        </div>

                        {/* Top Action Pills */}
                        <div className="flex flex-wrap items-center gap-2.5">
                            <a
                                href="/api/v1/openapi.json"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                            >
                                <Download className="w-4 h-4 text-[#0AB600]" />
                                <span>OpenAPI / Swagger JSON</span>
                            </a>

                            <a
                                href="/api/v1/projects"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0AB600] hover:bg-[#089600] text-white text-xs font-bold transition-all shadow-md shadow-[#0AB600]/25 cursor-pointer"
                            >
                                <ExternalLink className="w-4 h-4" />
                                <span>Coba Endpoint Root</span>
                            </a>
                        </div>
                    </div>

                    {/* Key Architecture Badges */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-zinc-100 dark:border-zinc-800/80">
                        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60">
                            <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Protokol & Format</div>
                            <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-0.5">HTTPS JSON REST</div>
                        </div>
                        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60">
                            <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Batas Kecepatan (Rate Limit)</div>
                            <div className="text-xs sm:text-sm font-bold text-[#0AB600] mt-0.5">60 Req / Menit (Open)</div>
                        </div>
                        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60">
                            <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Autentikasi</div>
                            <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-0.5">Tidak Perlu API Key</div>
                        </div>
                        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60">
                            <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Cross-Origin (CORS)</div>
                            <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-0.5">Enabled (* All Origins)</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Interactive Docs Workspace (Sidebar + Content Panel) */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-grow w-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* LEFT COLUMN: Sticky Endpoints Navigation Sidebar (Span 4) */}
                    <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
                        
                        {/* Search Filter in Sidebar */}
                        <div className="p-3 rounded-2xl bg-white dark:bg-[#0E1524] border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-2">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchFilter}
                                    onChange={(e) => setSearchFilter(e.target.value)}
                                    placeholder="Cari rute endpoint (misal: projects, stats)..."
                                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#0AB600]/40 font-mono shadow-2xs"
                                />
                                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
                            </div>
                        </div>

                        {/* Endpoints List Accordion */}
                        <div className="p-3 rounded-2xl bg-white dark:bg-[#0E1524] border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-4 max-h-[calc(100vh-220px)] overflow-y-auto">
                            
                            {/* General Guides Section */}
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-2">
                                    Panduan Pengembang
                                </span>
                                <a
                                    href="#overview-guide"
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-all cursor-pointer"
                                >
                                    <BookOpen className="w-3.5 h-3.5 text-[#0AB600]" />
                                    <span>Ikhtisar & Standar Respons</span>
                                </a>
                                <a
                                    href="#rate-limit-guide"
                                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-all cursor-pointer"
                                >
                                    <Shield className="w-3.5 h-3.5 text-[#0AB600]" />
                                    <span>Rate Limiting & Error Codes</span>
                                </a>
                            </div>

                            {/* Grouped Endpoints */}
                            {Object.entries(groupedEndpoints).map(([groupName, endpoints]) => (
                                <div key={groupName} className="space-y-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-2">
                                        {groupName}
                                    </span>
                                    <div className="space-y-1">
                                        {endpoints.map((ep) => {
                                            const isActive = activeEndpointId === ep.id;
                                            return (
                                                <button
                                                    key={ep.id}
                                                    onClick={() => setActiveEndpointId(ep.id)}
                                                    className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-start justify-between gap-2 cursor-pointer ${
                                                        isActive
                                                            ? 'bg-[#0AB600]/10 border border-[#0AB600]/30 text-slate-900 dark:text-white font-bold shadow-2xs'
                                                            : 'text-zinc-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-zinc-100/70 dark:hover:bg-zinc-800/50'
                                                    }`}
                                                >
                                                    <div className="space-y-0.5 min-w-0">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold font-mono bg-[#0AB600] text-white">
                                                                {ep.method}
                                                            </span>
                                                            <span className="font-mono text-[11px] truncate text-slate-800 dark:text-zinc-200">
                                                                {ep.path}
                                                            </span>
                                                        </div>
                                                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate font-normal">
                                                            {ep.title}
                                                        </p>
                                                    </div>
                                                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#0AB600] shrink-0 mt-1" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}

                        </div>

                    </div>

                    {/* RIGHT COLUMN: Endpoint Detail, Interactive Console & Live Output (Span 8) */}
                    <div className="lg:col-span-8 space-y-8">
                        
                        {/* ACTIVE ENDPOINT CARD */}
                        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0E1524] border border-zinc-200/80 dark:border-zinc-800 shadow-xl shadow-zinc-200/40 dark:shadow-none space-y-6">
                            
                            {/* Endpoint Header */}
                            <div className="space-y-3">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-[#0AB600] text-white shadow-2xs">
                                        {activeEndpoint.method}
                                    </span>
                                    <span className="text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-white px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                                        {activeEndpoint.path}
                                    </span>
                                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                        • {activeEndpoint.group}
                                    </span>
                                </div>

                                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                    {activeEndpoint.title}
                                </h2>

                                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                                    {activeEndpoint.description}
                                </p>
                            </div>

                            {/* Parameter Reference Table */}
                            {activeEndpoint.params.length > 0 && (
                                <div className="space-y-3 pt-2">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                                        <Code2 className="w-3.5 h-3.5 text-[#0AB600]" />
                                        <span>Spesifikasi Parameter Permintaan</span>
                                    </h3>
                                    <div className="overflow-x-auto rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
                                        <table className="w-full text-left text-xs border-collapse font-sans">
                                            <thead>
                                                <tr className="bg-zinc-50 dark:bg-zinc-900/80 border-b border-zinc-200/80 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-mono text-[11px]">
                                                    <th className="p-3">Nama Parameter</th>
                                                    <th className="p-3">Tipe</th>
                                                    <th className="p-3">Lokasi</th>
                                                    <th className="p-3">Status</th>
                                                    <th className="p-3">Keterangan</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60">
                                                {activeEndpoint.params.map((param) => (
                                                    <tr key={param.name} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                                                        <td className="p-3 font-mono font-bold text-[#0AB600]">{param.name}</td>
                                                        <td className="p-3 font-mono text-zinc-500 dark:text-zinc-400">{param.type}</td>
                                                        <td className="p-3 font-mono text-zinc-500 dark:text-zinc-400">{param.in || 'query'}</td>
                                                        <td className="p-3">
                                                            {param.required ? (
                                                                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded border border-rose-200/60">
                                                                    Required
                                                                </span>
                                                            ) : (
                                                                <span className="text-[10px] font-semibold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                                                                    Optional
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="p-3 text-zinc-600 dark:text-zinc-300 leading-snug">{param.desc}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Live Playground & Code Generator */}
                            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                                <ApiPlayground endpoint={activeEndpoint} baseUrl={baseUrl} />
                            </div>

                        </div>

                        {/* GENERAL DEVELOPER GUIDELINES & ARCHITECTURE */}
                        <div id="overview-guide" className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0E1524] border border-zinc-200/80 dark:border-zinc-800 shadow-md space-y-6">
                            <div className="space-y-2">
                                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0AB600]">
                                    <BookOpen className="w-3.5 h-3.5" />
                                    <span>STANDAR TEKNIS INTEGRASI</span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                    Struktur Respons & Format Envelope
                                </h3>
                                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    Seluruh endpoint publik mengembalikan format JSON seragam dengan skema amplop (envelope standard):
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60 space-y-1">
                                    <span className="font-mono text-xs font-bold text-[#0AB600]">success (boolean)</span>
                                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Menandakan keberhasilan pemrosesan permintaan (true / false).</p>
                                </div>
                                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60 space-y-1">
                                    <span className="font-mono text-xs font-bold text-[#0AB600]">message (string)</span>
                                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Pesan deskriptif status eksekusi atau notifikasi kesalahan.</p>
                                </div>
                                <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/60 space-y-1">
                                    <span className="font-mono text-xs font-bold text-[#0AB600]">data (object | array)</span>
                                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Payload utama berisikan entitas riset, metadata, atau statistik.</p>
                                </div>
                            </div>
                        </div>

                        {/* RATE LIMITING & ERROR CODES */}
                        <div id="rate-limit-guide" className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0E1524] border border-zinc-200/80 dark:border-zinc-800 shadow-md space-y-6">
                            <div className="space-y-2">
                                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0AB600]">
                                    <Shield className="w-3.5 h-3.5" />
                                    <span>KEBIJAKAN KONEKSI & THROTTLING</span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                    Rate Limiting & Kode Status HTTP
                                </h3>
                                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    Untuk menjamin ketersediaan server bagi seluruh peneliti dan publik, API menerapkan pembatasan frekuensi akses sebesar <strong>60 permintaan per menit</strong> per alamat IP.
                                </p>
                            </div>

                            <div className="overflow-x-auto rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
                                <table className="w-full text-left text-xs border-collapse font-sans">
                                    <thead>
                                        <tr className="bg-zinc-50 dark:bg-zinc-900/80 border-b border-zinc-200/80 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-mono text-[11px]">
                                            <th className="p-3">HTTP Code</th>
                                            <th className="p-3">Status</th>
                                            <th className="p-3">Kondisi Pemicu</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60">
                                        <tr>
                                            <td className="p-3 font-mono font-bold text-[#0AB600]">200 OK</td>
                                            <td className="p-3 font-semibold text-slate-800 dark:text-zinc-200">Permintaan Berhasil</td>
                                            <td className="p-3 text-zinc-600 dark:text-zinc-300">Data riset ditemukan dan dikembalikan secara valid.</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3 font-mono font-bold text-amber-500">404 NOT FOUND</td>
                                            <td className="p-3 font-semibold text-slate-800 dark:text-zinc-200">Tidak Ditemukan</td>
                                            <td className="p-3 text-zinc-600 dark:text-zinc-300">Slug proyek atau ID peneliti tidak terdaftar atau berstatus draft.</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3 font-mono font-bold text-rose-500">429 TOO MANY REQUESTS</td>
                                            <td className="p-3 font-semibold text-slate-800 dark:text-zinc-200">Batas Kuota Terlampaui</td>
                                            <td className="p-3 text-zinc-600 dark:text-zinc-300">Permintaan melebihi kuota 60 req/menit. Silakan tunggu jeda `Retry-After`.</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>

                </div>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    );
}
