<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Project;
use App\Models\Researcher;
use App\Models\SupportTicket;
use App\Models\SystemSetting;
use App\Models\User;
use App\Services\AiAssistantService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class AdminAiAssistantController extends Controller
{
    /**
     * Display the Admin AI Assistant full-page workspace.
     */
    public function index(Request $request): Response
    {
        $stats = [
            'total_projects' => Project::count(),
            'published_projects' => Project::where('status', 'published')->count(),
            'draft_projects' => Project::where('status', 'draft')->count(),
            'total_researchers' => Researcher::count(),
            'open_tickets' => SupportTicket::whereIn('status', ['open', 'in_progress'])->count(),
            'total_users' => User::count(),
            'pending_users' => User::where('status', User::STATUS_PENDING)->count(),
        ];

        $aiProvider = SystemSetting::get('ai_provider', 'gemini');
        $aiModel = SystemSetting::get('ai_model', 'gemini-3.6-flash');
        $hasApiKey = ! empty(SystemSetting::get('ai_api_key'));

        $projectsList = Project::orderBy('title')->get([
            'id', 'title', 'name', 'category', 'description', 'problem_solution', 'benefits', 'specifications', 'content_en',
        ]);

        return Inertia::render('Admin/AiAssistant/Index', [
            'stats' => $stats,
            'aiConfig' => [
                'provider' => $aiProvider,
                'model' => $aiModel,
                'hasApiKey' => $hasApiKey,
            ],
            'categories' => Project::distinct('category')->whereNotNull('category')->pluck('category'),
            'researchersCount' => $stats['total_researchers'],
            'projectsList' => $projectsList,
        ]);
    }

    /**
     * Handle dedicated AI Smart Assist actions: executive summary, abstract formatting, translation, auto-summarizing.
     */
    public function smartAssist(Request $request): JsonResponse
    {
        $action = (string) $request->input('action', '');
        $payload = $request->input('payload', []);
        $context = $request->input('context', []);
        $text = (string) ($request->input('text') ?: ($payload['text'] ?? ''));

        if ($request->filled('project_id') && empty($payload)) {
            $project = Project::find($request->input('project_id'));
            if ($project) {
                $payload = $project->toArray();
            }
        }

        try {
            switch ($action) {
                case 'executive_summary':
                    $projectData = ! empty($payload) && is_array($payload) ? $payload : $context;
                    $language = (string) $request->input('language', 'id');
                    $result = AiAssistantService::generateExecutiveSummary($projectData, $language);

                    return response()->json([
                        'status' => 'success',
                        'success' => true,
                        'action' => 'executive_summary',
                        'result' => $result,
                        'data' => $result,
                    ]);

                case 'format_abstract':
                    if (empty(trim($text))) {
                        return response()->json([
                            'status' => 'error',
                            'success' => false,
                            'error' => 'Silakan masukkan draf, catatan, atau rincian inovasi yang ingin disusun menjadi abstrak.',
                        ], 422);
                    }

                    $targetLang = (string) $request->input('target_lang', 'both');
                    $result = AiAssistantService::formatAcademicAbstract($text, $context, $targetLang);

                    return response()->json([
                        'status' => 'success',
                        'success' => true,
                        'action' => 'format_abstract',
                        'result' => $result,
                        'data' => $result,
                    ]);

                case 'translate':
                    if (empty(trim($text))) {
                        return response()->json([
                            'status' => 'error',
                            'success' => false,
                            'error' => 'Silakan masukkan teks yang ingin diterjemahkan.',
                        ], 422);
                    }

                    $fromLang = (string) $request->input('from_lang', 'id');
                    $toLang = (string) $request->input('to_lang', 'en');
                    $mode = (string) $request->input('mode', 'academic');

                    $translatedText = AiAssistantService::translateBidirectional($text, $fromLang, $toLang, $mode);

                    return response()->json([
                        'status' => 'success',
                        'success' => true,
                        'action' => 'translate',
                        'translated_text' => $translatedText,
                        'result' => $translatedText,
                        'from_lang' => $fromLang,
                        'to_lang' => $toLang,
                    ]);

                case 'auto_summarize':
                    if (empty(trim($text))) {
                        return response()->json([
                            'status' => 'error',
                            'success' => false,
                            'error' => 'Silakan masukkan teks yang ingin diringkas.',
                        ], 422);
                    }

                    $maxChars = (int) $request->input('max_chars', 350);
                    $contentType = (string) $request->input('content_type', 'paragraph');

                    $summarized = AiAssistantService::autoSummarizeToLimit($text, $maxChars, $contentType);

                    return response()->json([
                        'status' => 'success',
                        'success' => true,
                        'action' => 'auto_summarize',
                        'summary' => $summarized,
                        'summarized_text' => $summarized,
                        'result' => $summarized,
                        'char_count' => mb_strlen(strip_tags($summarized)),
                        'max_chars' => $maxChars,
                    ]);

                case 'polish_grammar':
                    if (empty(trim($text))) {
                        return response()->json([
                            'success' => false,
                            'error' => 'Silakan masukkan teks yang ingin diperbaiki tata bahasanya.',
                        ], 422);
                    }

                    $lang = (string) $request->input('language', 'id');
                    $tone = (string) $request->input('tone', 'academic');

                    $polished = AiAssistantService::polishGrammar($text, $lang, $tone);

                    return response()->json([
                        'success' => true,
                        'action' => 'polish_grammar',
                        'polished_text' => $polished,
                    ]);

                default:
                    return response()->json([
                        'success' => false,
                        'error' => 'Aksi smart assist tidak dikenali.',
                    ], 400);
            }
        } catch (\Throwable $e) {
            Log::error('Admin NARA Smart Assist Error: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'error' => 'Gagal memproses permintaan AI Smart Assist: '.$e->getMessage(),
            ], 500);
        }
    }

    /**
     * Handle Admin AI interactive queries with full system data access and multimodal file support.
     */
    public function chat(Request $request): JsonResponse
    {
        // Auto-decode stringified history JSON when sent via FormData/multipart
        if ($request->has('history') && is_string($request->input('history'))) {
            $decoded = json_decode($request->input('history'), true);
            if (is_array($decoded)) {
                $request->merge(['history' => $decoded]);
            } elseif (empty($request->input('history'))) {
                $request->merge(['history' => []]);
            }
        }

        $validated = $request->validate([
            'message' => ['nullable', 'string', 'max:10000'],
            'history' => ['nullable', 'array', 'max:25'],
            'history.*.role' => ['nullable', 'string'],
            'history.*.content' => ['nullable', 'string', 'max:25000'],
            'language' => ['nullable', 'string', 'in:id,en'],
            'mode' => ['nullable', 'string', 'in:all_data,research,tickets,documents,system'],
            'attachment' => ['nullable', 'file', 'max:10240'], // max 10MB
            'attachment_base64' => ['nullable', 'string'],
            'attachment_mime' => ['nullable', 'string'],
            'attachment_name' => ['nullable', 'string', 'max:255'],
            'attachment_text' => ['nullable', 'string', 'max:30000'],
        ]);

        $message = trim((string) ($validated['message'] ?? ''));
        $language = $validated['language'] ?? 'id';
        $mode = $validated['mode'] ?? 'all_data';
        $user = $request->user();

        // Process attachments (Images or text documents)
        $attachmentData = null;

        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $mime = $file->getMimeType();
            $filename = $file->getClientOriginalName();

            if (str_starts_with($mime, 'image/')) {
                $attachmentData = [
                    'mime_type' => $mime,
                    'data' => base64_encode(file_get_contents($file->getRealPath())),
                    'filename' => $filename,
                ];
            } else {
                $content = @file_get_contents($file->getRealPath()) ?: '';
                $cleanText = mb_convert_encoding($content, 'UTF-8', 'UTF-8');
                $attachmentData = [
                    'text' => mb_substr($cleanText, 0, 25000),
                    'filename' => $filename,
                    'mime_type' => $mime,
                ];
            }
        } elseif (! empty($validated['attachment_base64']) && ! empty($validated['attachment_mime'])) {
            $mime = $validated['attachment_mime'];
            $filename = $validated['attachment_name'] ?? 'lampiran_admin';

            if (str_starts_with($mime, 'image/')) {
                $rawBase64 = preg_replace('#^data:[^;]+;base64,#i', '', $validated['attachment_base64']);
                $attachmentData = [
                    'mime_type' => $mime,
                    'data' => trim($rawBase64),
                    'filename' => $filename,
                ];
            }
        } elseif (! empty($validated['attachment_text'])) {
            $attachmentData = [
                'text' => mb_substr(trim($validated['attachment_text']), 0, 25000),
                'filename' => $validated['attachment_name'] ?? 'dokumen_admin.txt',
                'mime_type' => 'text/plain',
            ];
        }

        if ($message === '' && ! empty($attachmentData)) {
            $message = $language === 'en'
                ? 'Please analyze and inspect the attached internal administrative file/image.'
                : 'Mohon telaah dan analisis isi berkas/gambar internal yang dilampirkan ini.';
        } elseif ($message === '') {
            return response()->json([
                'message' => 'The message field is required when no attachment is provided.',
                'errors' => ['message' => ['Pesan tidak boleh kosong.']],
            ], 422);
        }

        $rawHistory = $validated['history'] ?? [];
        $history = [];
        foreach ($rawHistory as $item) {
            if (is_array($item) && ! empty($item['content'])) {
                $history[] = [
                    'role' => ($item['role'] ?? '') === 'assistant' ? 'assistant' : 'user',
                    'content' => mb_substr(trim($item['content']), 0, 3000),
                ];
            }
        }

        // Build comprehensive privileged system context
        $adminDataContext = $this->buildAdminPrivilegedContext($message, $mode);

        $reply = AiAssistantService::chatWithAdminAssistant(
            userMessage: $message,
            history: $history,
            language: $language,
            adminDataContext: $adminDataContext,
            mode: $mode,
            attachment: $attachmentData,
            adminUserName: $user ? $user->name : 'Administrator'
        );

        return response()->json([
            'status' => 'success',
            'reply' => $reply,
            'mode' => $mode,
            'has_attachment' => ! empty($attachmentData),
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    /**
     * Aggregate real-time database context for admin intelligence.
     */
    private function buildAdminPrivilegedContext(string $query, string $mode): string
    {
        $context = '';

        try {
            // 1. STATS OVERVIEW
            $totalProjects = Project::count();
            $published = Project::where('status', 'published')->count();
            $drafts = Project::where('status', 'draft')->count();
            $archived = Project::where('status', 'archived')->count();
            $totalResearchers = Researcher::count();
            $totalTickets = SupportTicket::count();
            $openTickets = SupportTicket::whereIn('status', ['open', 'in_progress'])->count();
            $urgentTickets = SupportTicket::where('priority', 'urgent')->whereIn('status', ['open', 'in_progress'])->count();
            $totalUsers = User::count();
            $pendingApprovals = User::where('status', User::STATUS_PENDING)->count();

            $context .= "=== METRIK & STATISTIK SISTEM REAL-TIME ===\n"
                ."• Total Proyek Riset: {$totalProjects} (Terbit: {$published}, Draf: {$drafts}, Arsip: {$archived})\n"
                ."• Total Peneliti & Dosen: {$totalResearchers}\n"
                ."• Helpdesk Tiket: {$totalTickets} Total ({$openTickets} Terbuka / Sedang Diproses, {$urgentTickets} Prioritas Mendesak)\n"
                ."• Pengguna Terdaftar: {$totalUsers} ({$pendingApprovals} Menunggu Persetujuan Admin)\n"
                .'• Status Maintenance: '.(SystemSetting::get('maintenance_mode') ? 'AKTIF (Sistem Terkunci)' : 'NORMAL')."\n\n";

            // 2. RECENT / RELEVANT PROJECTS
            $projects = Project::latest()->take(10)->get();
            if ($projects->isNotEmpty()) {
                $context .= "=== DAFTAR PROYEK TERAKHIR & PATEN / HKI ===\n";
                foreach ($projects as $p) {
                    $team = is_array($p->research_team) ? implode(', ', array_filter(array_map(fn ($m) => is_array($m) ? ($m['name'] ?? '') : (string) $m, $p->research_team))) : (string) $p->research_team;
                    $patent = $p->patent_number ? " [HKI: {$p->patent_number}]" : '';
                    $views = $p->views_count ?? 0;
                    $qrScans = $p->qr_scans_count ?? 0;
                    $context .= "• [ID: {$p->id}] [{$p->status}] [{$p->category}] {$p->title}{$patent}\n"
                        ."  Nama Singkat: {$p->name} | Peneliti: {$team} | Preset Layout: {$p->layout_preset} | Views: {$views}, QR Scans: {$qrScans}\n";
                }
                $context .= "\n";
            }

            // 3. RESEARCHERS DIRECTORY
            $researchers = Researcher::latest()->take(8)->get();
            if ($researchers->isNotEmpty()) {
                $context .= "=== DIREKTORI PENELITI COE STAS-RG ===\n";
                foreach ($researchers as $r) {
                    $exp = is_array($r->expertise) ? implode(', ', $r->expertise) : (string) $r->expertise;
                    $context .= "• {$r->name} (Lab: {$r->lab_affiliation}) - Keahlian: {$exp} | Email: {$r->email}\n";
                }
                $context .= "\n";
            }

            // 4. OPEN & URGENT SUPPORT TICKETS
            $tickets = SupportTicket::whereIn('status', ['open', 'in_progress'])
                ->orderByRaw("CASE WHEN priority = 'urgent' THEN 1 WHEN priority = 'high' THEN 2 ELSE 3 END")
                ->latest()
                ->take(6)
                ->get();

            if ($tickets->isNotEmpty()) {
                $context .= "=== TIKET BANTUAN AKTIF YANG MEMBUTUHKAN PERHATIAN ===\n";
                foreach ($tickets as $t) {
                    $context .= "• [Tiket #{$t->ticket_number}] [Prioritas: {$t->priority}] [Kategori: {$t->category}] Subjek: {$t->subject} (Dari: {$t->name} <{$t->email}>) - Status: {$t->status}\n";
                }
                $context .= "\n";
            }

            // 5. RECENT ACTIVITY LOGS
            $logs = ActivityLog::latest()->take(6)->get();
            if ($logs->isNotEmpty()) {
                $context .= "=== LOG AKTIVITAS TERAKHIR ===\n";
                foreach ($logs as $l) {
                    $userName = $l->user ? $l->user->name : 'Sistem';
                    $time = $l->created_at ? $l->created_at->format('d/m/Y H:i') : '';
                    $context .= "• [{$time}] [{$l->action}] {$l->description} (Oleh: {$userName})\n";
                }
                $context .= "\n";
            }

        } catch (\Throwable) {
            // Graceful fallback
        }

        return $context;
    }
}
