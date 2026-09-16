<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Researcher;
use App\Services\AiAssistantService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicAiChatController extends Controller
{
    /**
     * Handle public AI chat queries from landing page with smart retrieval, attachments, and specialized modes.
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
            'message' => ['nullable', 'string', 'max:5000'],
            'history' => ['nullable', 'array', 'max:15'],
            'history.*.role' => ['nullable', 'string'],
            'history.*.content' => ['nullable', 'string', 'max:15000'],
            'language' => ['nullable', 'string', 'in:id,en'],
            'mode' => ['nullable', 'string', 'in:general,research,document,partner'],
            'attachment' => ['nullable', 'file', 'max:5120'], // max 5MB
            'attachment_base64' => ['nullable', 'string'],
            'attachment_mime' => ['nullable', 'string'],
            'attachment_name' => ['nullable', 'string', 'max:255'],
            'attachment_text' => ['nullable', 'string', 'max:20000'],
        ]);

        $message = trim((string) ($validated['message'] ?? ''));
        $language = $validated['language'] ?? 'id';
        $mode = $validated['mode'] ?? 'general';

        // Process file attachment if provided
        $attachmentData = null;

        // 1. Direct file upload via multipart/form-data
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
                // Text, JSON, CSV, MD, or PDF
                $content = @file_get_contents($file->getRealPath()) ?: '';
                // Basic text cleaning
                $cleanText = mb_convert_encoding($content, 'UTF-8', 'UTF-8');
                $attachmentData = [
                    'text' => mb_substr($cleanText, 0, 15000),
                    'filename' => $filename,
                    'mime_type' => $mime,
                ];
            }
        } elseif (! empty($validated['attachment_base64']) && ! empty($validated['attachment_mime'])) {
            // 2. Base64 encoded file from JSON payload
            $mime = $validated['attachment_mime'];
            $filename = $validated['attachment_name'] ?? 'lampiran_file';

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
                'text' => mb_substr(trim($validated['attachment_text']), 0, 15000),
                'filename' => $validated['attachment_name'] ?? 'dokumen_terlampir.txt',
                'mime_type' => 'text/plain',
            ];
        }

        // If message is empty but attachment is present, provide a default instruction
        if ($message === '' && ! empty($attachmentData)) {
            $message = $language === 'en'
                ? 'Please analyze and explain the attached document/image.'
                : 'Mohon analisis dan jelaskan isi berkas/gambar yang dilampirkan ini.';
        } elseif ($message === '') {
            return response()->json([
                'message' => 'The message field is required when no attachment is provided.',
                'errors' => ['message' => ['The message field is required.']],
            ], 422);
        }

        $rawHistory = $validated['history'] ?? [];
        $history = [];

        foreach ($rawHistory as $item) {
            if (is_array($item) && ! empty($item['content'])) {
                $history[] = [
                    'role' => ($item['role'] ?? '') === 'assistant' ? 'assistant' : 'user',
                    'content' => mb_substr(trim($item['content']), 0, 1500),
                ];
            }
        }

        // Generate intelligent grounded context based on user query and active mode
        $groundingContext = $this->buildSmartGroundingContext($message, $mode, $language);

        $reply = AiAssistantService::chatWithGroundedAssistant(
            userMessage: $message,
            history: $history,
            language: $language,
            groundingContext: $groundingContext,
            mode: $mode,
            attachment: $attachmentData
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
     * Build dynamic grounded context based on semantic keyword matching across projects, researchers, and guidelines.
     */
    private function buildSmartGroundingContext(string $query, string $mode, string $language): string
    {
        $context = '';

        try {
            // Extract meaningful query keywords (length >= 3)
            $rawWords = preg_split('/[\s,\.\?\!\;\:\-\(\)]+/u', mb_strtolower($query), -1, PREG_SPLIT_NO_EMPTY);
            $stopwords = [
                'apa', 'siapa', 'bagaimana', 'kenapa', 'dimana', 'kapan', 'yang', 'dan', 'atau', 'untuk',
                'dengan', 'pada', 'dari', 'dalam', 'adalah', 'saya', 'kami', 'anda', 'tolong', 'bisa',
                'ada', 'ini', 'itu', 'apakah', 'tentang', 'terkait', 'mau', 'ingin', 'tanya', 'jelaskan',
                'what', 'how', 'who', 'where', 'when', 'why', 'which', 'about', 'with', 'from', 'into',
                'the', 'and', 'for', 'you', 'can', 'please', 'tell', 'show', 'explain', 'give', 'stas',
            ];

            $keywords = array_values(array_filter($rawWords, fn ($w) => mb_strlen($w) >= 3 && ! in_array($w, $stopwords, true)));

            // 1. SMART RETRIEVAL FOR PROJECTS
            $projectQuery = Project::where('status', 'published');

            if (! empty($keywords)) {
                $projectQuery->where(function ($q) use ($keywords) {
                    foreach ($keywords as $kw) {
                        $q->orWhere('title', 'like', "%{$kw}%")
                            ->orWhere('category', 'like', "%{$kw}%")
                            ->orWhere('description', 'like', "%{$kw}%")
                            ->orWhere('patent_number', 'like', "%{$kw}%")
                            ->orWhere('research_team', 'like', "%{$kw}%");
                    }
                });
            }

            $matchedProjects = $projectQuery->latest()->take(6)->get();

            // If no direct keyword matches, fallback to latest published projects
            if ($matchedProjects->isEmpty()) {
                $matchedProjects = Project::where('status', 'published')->latest()->take(5)->get();
            }

            if ($matchedProjects->isNotEmpty()) {
                $context .= "--- Direktori Portofolio Inovasi & Proyek Riset Unggulan ---\n";
                foreach ($matchedProjects as $proj) {
                    $desc = strip_tags($proj->description ?? '');
                    $desc = mb_substr(preg_replace('/\s+/', ' ', $desc), 0, 160);

                    $team = '';
                    if (! empty($proj->research_team)) {
                        $members = is_array($proj->research_team) ? implode(', ', array_filter(array_map(fn ($m) => is_array($m) ? ($m['name'] ?? '') : (string) $m, $proj->research_team))) : (string) $proj->research_team;
                        if (! empty($members)) {
                            $team = " | Tim: {$members}";
                        }
                    }

                    $patent = $proj->patent_number ? " | HKI/Paten: {$proj->patent_number}" : '';
                    $context .= "• [{$proj->category}] {$proj->title}{$patent}{$team}\n  Ringkasan: {$desc}...\n";
                }
            }

            // 2. SMART RETRIEVAL FOR RESEARCHERS
            $researcherQuery = Researcher::query();
            if (! empty($keywords)) {
                $researcherQuery->where(function ($q) use ($keywords) {
                    foreach ($keywords as $kw) {
                        $q->orWhere('name', 'like', "%{$kw}%")
                            ->orWhere('lab_affiliation', 'like', "%{$kw}%")
                            ->orWhere('bio', 'like', "%{$kw}%");
                    }
                });
            }

            $matchedResearchers = $researcherQuery->latest()->take(5)->get();
            if ($matchedResearchers->isEmpty()) {
                $matchedResearchers = Researcher::latest()->take(4)->get();
            }

            if ($matchedResearchers->isNotEmpty()) {
                $context .= "\n--- Peneliti & Ahli Laboratorium CoE STAS-RG ---\n";
                foreach ($matchedResearchers as $r) {
                    $expList = '';
                    if (! empty($r->expertise)) {
                        $expList = is_array($r->expertise) ? implode(', ', $r->expertise) : (string) $r->expertise;
                    }
                    $expertise = $expList ? " (Bidang: {$expList})" : '';
                    $affiliation = $r->lab_affiliation ? " - Lab: {$r->lab_affiliation}" : '';
                    $context .= "• {$r->name}{$affiliation}{$expertise}\n";
                }
            }

            // 3. DOCUMENT STANDARDIZATION LIMITS (A4 Flyer, Trifold, Factsheet)
            $context .= "\n--- Standarisasi Dokumen STAS RG Projects ---\n"
                ."• Format Flyer A4 1-Halaman: Presisi tanpa overflow. Preset Balanced (Deskripsi: maks 400 char, Manfaat: 260 char, Spesifikasi: 260 char, Problem: 210 char, Solusi: 210 char). Preset Visual (gambar besar) & Text-Heavy (penjelasan detail).\n"
                ."• Format Brosur Lipat Tiga (Trifold 3-Panel): Terdiri dari Cover Depan, Panel Solusi, Manfaat, Spesifikasi, dan Kontak Belakang.\n"
                ."• Fitur Ekstra: Dynamic QR Code Expo, Login Biometrik Passkey (WebAuthn), Helpdesk Tiket Bantuan (/support).\n";

        } catch (\Throwable) {
            // Fallback gracefully
        }

        return $context;
    }
}
