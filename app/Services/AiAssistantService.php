<?php

namespace App\Services;

use App\Models\SystemSetting;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiAssistantService
{
    public const AVAILABLE_MODELS = [
        'gemini' => [
            'gemini-3.6-flash' => 'Gemini 3.6 Flash (Direkomendasikan, Cepat & Cerdas)',
            'gemini-3.6-pro' => 'Gemini 3.6 Pro (Penalaran Kompleks & Detail)',
            'gemini-2.5-flash' => 'Gemini 2.5 Flash',
            'gemini-1.5-flash' => 'Gemini 1.5 Flash (Legacy)',
            'gemini-1.5-pro' => 'Gemini 1.5 Pro (Legacy)',
        ],
        'openai' => [
            'gpt-4o-mini' => 'GPT-4o Mini',
            'gpt-4o' => 'GPT-4o',
            'gpt-3.5-turbo' => 'GPT-3.5 Turbo',
        ],
    ];

    /**
     * A4 1-Page Layout Character Limits per Preset.
     * Content MUST stay strictly below these limits so it never overflows the 1-page A4 canvas.
     */
    public const LAYOUT_LIMITS = [
        'balanced' => [
            'title' => 65,
            'subtitle' => 45,
            'description' => 400,
            'benefits' => 260,
            'specifications' => 260,
            'problem' => 210,
            'solution' => 210,
        ],
        'visual_heavy' => [
            'title' => 65,
            'subtitle' => 45,
            'description' => 270,
            'benefits' => 190,
            'specifications' => 190,
            'problem' => 150,
            'solution' => 150,
        ],
        'text_heavy' => [
            'title' => 65,
            'subtitle' => 45,
            'description' => 520,
            'benefits' => 350,
            'specifications' => 350,
            'problem' => 270,
            'solution' => 270,
        ],
    ];

    /**
     * Calculate plain text length excluding HTML tags and entities.
     */
    public static function getPlainTextLength(?string $htmlOrText): int
    {
        if (empty($htmlOrText)) {
            return 0;
        }

        $text = preg_replace('/<br\s*\/?>/i', ' ', $htmlOrText);
        $text = preg_replace('/<\/(p|li|div|h[1-6])>/i', ' ', $text);
        $text = strip_tags($text);
        $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $text = preg_replace('/\s+/u', ' ', $text);

        return mb_strlen(trim($text));
    }

    /**
     * Fit a paragraph HTML or plain text within max plain text character limit.
     */
    public static function fitParagraph(?string $htmlOrText, int $maxChars, bool $wrapInP = true): string
    {
        if (empty($htmlOrText)) {
            return $wrapInP ? '<p></p>' : '';
        }

        // Clean initial text
        $clean = trim(strip_tags($htmlOrText, '<br>'));
        $clean = html_entity_decode($clean, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $clean = preg_replace('/\s+/u', ' ', $clean);

        if (mb_strlen($clean) <= $maxChars) {
            return $wrapInP ? "<p>{$clean}</p>" : $clean;
        }

        // Split into sentences and keep as many complete sentences as possible
        $sentences = preg_split('/(?<=[.!?])\s+/u', $clean, -1, PREG_SPLIT_NO_EMPTY);
        $result = '';

        foreach ($sentences as $sentence) {
            $candidate = $result === '' ? $sentence : "{$result} {$sentence}";
            if (mb_strlen($candidate) <= $maxChars) {
                $result = $candidate;
            } else {
                break;
            }
        }

        // If no full sentence fit, truncate at word boundary
        if ($result === '') {
            $words = explode(' ', $clean);
            foreach ($words as $word) {
                $candidate = $result === '' ? $word : "{$result} {$word}";
                if (mb_strlen($candidate) <= ($maxChars - 3)) {
                    $result = $candidate;
                } else {
                    break;
                }
            }
            $result = rtrim($result, ',;:- ').'...';
        }

        return $wrapInP ? "<p>{$result}</p>" : $result;
    }

    /**
     * Fit an HTML list (<ul><li>...</li></ul>) within max plain text character limit and item count.
     */
    public static function fitList(?string $htmlList, int $maxChars, int $maxItems = 4): string
    {
        if (empty($htmlList)) {
            return '<ul></ul>';
        }

        preg_match_all('/<li[^>]*>(.*?)<\/li>/is', $htmlList, $matches);
        $rawItems = $matches[1] ?? [];

        if (empty($rawItems)) {
            // Fallback: split by lines or bullets if not inside <li>
            $lines = preg_split('/[\r\n]+|•|-/u', strip_tags($htmlList));
            $rawItems = array_values(array_filter(array_map('trim', $lines)));
        }

        $items = [];
        $currentLength = 0;

        foreach ($rawItems as $rawItem) {
            if (count($items) >= $maxItems) {
                break;
            }

            $trimmedItem = trim($rawItem);
            if (empty($trimmedItem)) {
                continue;
            }

            // Extract plain text length of this item
            $itemPlain = strip_tags(html_entity_decode($trimmedItem, ENT_QUOTES | ENT_HTML5, 'UTF-8'));
            $itemPlainLen = mb_strlen(trim(preg_replace('/\s+/u', ' ', $itemPlain)));

            // If adding this exceeds total limit and we already have at least 2 items, stop
            if (($currentLength + $itemPlainLen) > $maxChars && count($items) >= 2) {
                break;
            }

            // If single item is excessively long (>95 chars), shorten its explanation
            if ($itemPlainLen > 95) {
                if (preg_match('/^(<strong>.*?<\/strong>:?)(.*)$/is', $trimmedItem, $m)) {
                    $prefix = $m[1];
                    $body = trim(strip_tags($m[2]));
                    $bodyWords = explode(' ', $body);
                    $shortBody = '';
                    foreach ($bodyWords as $w) {
                        if (mb_strlen("{$shortBody} {$w}") < 50) {
                            $shortBody = trim("{$shortBody} {$w}");
                        } else {
                            break;
                        }
                    }
                    $trimmedItem = "{$prefix} ".rtrim($shortBody, ',;:- ').'.';
                }
            }

            $currentLength += self::getPlainTextLength($trimmedItem);
            $items[] = $trimmedItem;
        }

        if (empty($items)) {
            $items = ['<strong>Inovasi:</strong> Penerapan sistem riset terintegrasi.'];
        }

        $listHtml = '<ul>';
        foreach ($items as $item) {
            $listHtml .= "<li>{$item}</li>";
        }
        $listHtml .= '</ul>';

        return $listHtml;
    }

    /**
     * Fit plain text within character limit at word boundary.
     */
    public static function fitText(?string $text, int $maxChars): string
    {
        if (empty($text)) {
            return '';
        }

        $text = trim(strip_tags($text));
        $text = html_entity_decode($text, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $text = preg_replace('/\s+/u', ' ', $text);

        if (mb_strlen($text) <= $maxChars) {
            return $text;
        }

        $words = explode(' ', $text);
        $result = '';
        foreach ($words as $word) {
            $candidate = $result === '' ? $word : "{$result} {$word}";
            if (mb_strlen($candidate) <= ($maxChars - 3)) {
                $result = $candidate;
            } else {
                break;
            }
        }

        return rtrim($result, ',;:- ').'...';
    }

    /**
     * Test AI API key connection and calculate response latency.
     *
     * @return array<string, mixed>
     */
    public static function testConnection(
        ?string $apiKey = null,
        ?string $provider = null,
        ?string $model = null
    ): array {
        $provider = $provider ?: SystemSetting::get('ai_provider', 'gemini');
        $model = $model ?: SystemSetting::get('ai_model', 'gemini-3.6-flash');
        $key = $apiKey ?: SystemSetting::get('ai_api_key');

        if (empty($key)) {
            return [
                'success' => false,
                'error' => 'API Key belum diisi. Harap masukkan API Key terlebih dahulu.',
                'hint' => 'Dapatkan API Key Google Gemini gratis di Google AI Studio (aistudio.google.com).',
            ];
        }

        $startTime = microtime(true);

        try {
            if ($provider === 'gemini') {
                $endpoint = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent";

                $response = Http::timeout(30)
                    ->connectTimeout(15)
                    ->retry(2, 500, throw: false)
                    ->withHeaders([
                        'Content-Type' => 'application/json',
                        'x-goog-api-key' => $key,
                    ])
                    ->post($endpoint, [
                        'contents' => [
                            [
                                'parts' => [
                                    ['text' => 'Respond strictly with the single word: "CONNECTED"'],
                                ],
                            ],
                        ],
                        'generationConfig' => [
                            'maxOutputTokens' => 10,
                            'temperature' => 0.1,
                        ],
                    ]);

                $durationMs = round((microtime(true) - $startTime) * 1000);

                if ($response->successful()) {
                    $json = $response->json();
                    $text = $json['candidates'][0]['content']['parts'][0]['text'] ?? '';

                    return [
                        'success' => true,
                        'message' => 'Koneksi ke Google Gemini AI Berhasil!',
                        'provider' => 'Google Gemini AI',
                        'model' => $model,
                        'latency_ms' => $durationMs,
                        'reply' => trim($text),
                    ];
                }

                // Handle Gemini specific errors
                $errorData = $response->json('error') ?: [];
                $errorMessage = $errorData['message'] ?? $response->body();
                $status = $errorData['status'] ?? 'ERROR';

                $hint = 'Periksa kembali API Key dan kuota akun Google AI Studio Anda.';
                if (str_contains(strtolower($errorMessage), 'api_key_invalid') || $response->status() === 400 || $response->status() === 403) {
                    $hint = 'API Key yang dimasukkan tidak valid atau tidak memiliki izin akses.';
                } elseif (str_contains(strtolower($errorMessage), 'quota') || $response->status() === 429) {
                    $hint = 'Batas kuota API (Rate Limit) tercapai pada akun Anda.';
                } elseif (str_contains(strtolower($errorMessage), 'not found') || $response->status() === 404) {
                    $hint = "Model \"{$model}\" tidak ditemukan atau tidak didukung pada API version ini.";
                }

                return [
                    'success' => false,
                    'error' => "Gagal terhubung ({$status}): {$errorMessage}",
                    'hint' => $hint,
                    'status_code' => $response->status(),
                    'latency_ms' => $durationMs,
                ];
            }

            // OpenAI / Custom Endpoint Provider
            $endpoint = SystemSetting::get('ai_custom_endpoint') ?: 'https://api.openai.com/v1/chat/completions';
            $response = Http::timeout(15)
                ->withToken($key)
                ->post($endpoint, [
                    'model' => $model ?: 'gpt-4o-mini',
                    'messages' => [
                        ['role' => 'user', 'content' => 'Respond with: "CONNECTED"'],
                    ],
                    'max_tokens' => 10,
                ]);

            $durationMs = round((microtime(true) - $startTime) * 1000);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'message' => 'Koneksi ke OpenAI / Compatible API Berhasil!',
                    'provider' => 'OpenAI Compatible',
                    'model' => $model,
                    'latency_ms' => $durationMs,
                ];
            }

            return [
                'success' => false,
                'error' => 'API Error: '.$response->body(),
                'hint' => 'Periksa kembali API Key dan endpoint OpenAI Anda.',
                'status_code' => $response->status(),
                'latency_ms' => $durationMs,
            ];
        } catch (\Throwable $e) {
            $durationMs = round((microtime(true) - $startTime) * 1000);

            return [
                'success' => false,
                'error' => 'Koneksi jaringan gagal: '.$e->getMessage(),
                'hint' => 'Pastikan server Anda memiliki akses koneksi internet keluar ke Google API.',
                'latency_ms' => $durationMs,
            ];
        }
    }

    /**
     * Generate full structured project content based on user idea or title.
     *
     * @param  array<string, mixed>  $context
     * @return array<string, mixed>
     */
    public static function generateProjectContent(string $topicPrompt, array $context = []): array
    {
        $provider = SystemSetting::get('ai_provider', 'gemini');
        $model = SystemSetting::get('ai_model', 'gemini-3.6-flash');
        $key = SystemSetting::get('ai_api_key');

        if (empty($key)) {
            throw new \RuntimeException('API Key AI belum dikonfigurasi. Silakan atur di menu Settings terlebih dahulu.');
        }

        $preset = $context['layout_preset'] ?? 'balanced';
        $limits = self::LAYOUT_LIMITS[$preset] ?? self::LAYOUT_LIMITS['balanced'];

        $systemInstruction = <<<INSTRUCTION
Anda adalah Research Content Generator Assistant resmi untuk Center of Excellence Sustainable Technology and Applied Sciences Research Group (CoE STAS-RG) Telkom University.
Tugas Anda adalah menyusun lembar informasi fakta proyek riset inovatif (A4 Factsheet Flyer) lengkap, profesional, berbasis sains terapan terkini, dan siap cetak pada 1 HALAMAN A4.

PENTING - BATASAN PANJANG TEKS (LAYOUT A4 STRICT RULES):
Konten flyer dikunci pada 1 halaman A4 sehingga setiap teks HARUS RINGKAS, PADAT, DAN TIDAK BOLEH BERLEBIHAN:
- name: 2-4 kata menarik (Maksimal 30 karakter).
- title: Judul formal inovasi (Maksimal {$limits['title']} karakter, 2 baris).
- subtitle: Tagline keunggulan 1 kalimat padat (Maksimal {$limits['subtitle']} karakter).
- description: 2-3 kalimat padat merangkum urgensi dan arsitektur sistem (Maksimal {$limits['description']} karakter).
- problem_solution.problem: 1 paragraf singkat 2 kalimat mengenai kendala lapangan (Maksimal {$limits['problem']} karakter) format <p>...</p>.
- problem_solution.solution: 1 paragraf singkat 2 kalimat mengenai solusi terapan (Maksimal {$limits['solution']} karakter) format <p>...</p>.
- benefits: 3-4 poin ringkas dampak penerapan (Maksimal TOTAL {$limits['benefits']} karakter plain text) format <ul><li><strong>Judul:</strong> Penjelasan 5-7 kata.</li></ul>.
- specifications: 4 poin ringkas komponen/sensor/konektivitas (Maksimal TOTAL {$limits['specifications']} karakter plain text) format <ul><li><strong>Komponen:</strong> Spek ringkas.</li></ul>.

Format output HARUS berupa objek JSON valid MURNI tanpa markdown codeblock pembungkus (tanpa ```json ... ```):
{
  "name": "Smart Agro Drone",
  "title": "SISTEM MONITORING PERTANIAN PRESISI BERBASIS IOT DAN AI",
  "subtitle": "Otomasi Pemantauan Tanaman Presisi Real-Time",
  "category": "Smart Agriculture",
  "description": "Platform pemantauan tanaman berbasis IoT dan citra multispektral drone untuk meningkatkan produktivitas pertanian secara efisien dan ramah lingkungan.",
  "problem_solution": {
    "title": "PROBLEM–SOLUTION",
    "problem": "<p>Pemantauan lahan pertanian secara manual membutuhkan waktu lama dan rawan keterlambatan deteksi hama.</p>",
    "solution": "<p>Sistem ini mengintegrasikan drone multispektral dan AI untuk mendeteksi kesehatan tanaman secara presisi.</p>"
  },
  "benefits": {
    "title": "MANFAAT",
    "content": "<ul><li><strong>Efisiensi Waktu:</strong> Mengurangi durasi survei lahan hingga 60%.</li><li><strong>Akurasi Tinggi:</strong> Deteksi dini hama dengan akurasi 94.5%.</li><li><strong>Hemat Biaya:</strong> Optimasi penggunaan pupuk dan pestisida.</li></ul>"
  },
  "specifications": {
    "title": "SPESIFIKASI",
    "content": "<ul><li><strong>MCU/Processor:</strong> Raspberry Pi Compute Module 4</li><li><strong>Sensor:</strong> Multispectral Camera & NDVI Sensor</li><li><strong>Komunikasi:</strong> LoRaWAN & 4G Telemetry Link</li><li><strong>Daya:</strong> LiPo 6S 10000mAh Battery</li></ul>"
  },
  "layout_preset": "{$preset}"
}

Gunakan Bahasa Indonesia formal baku yang elegan, berwawasan ilmiah, meyakinkan, serta ringkas dan padat.
INSTRUCTION;

        $userPrompt = "Topik / Ide Riset Proyek: \"{$topicPrompt}\"";
        if (! empty($context['category'])) {
            $userPrompt .= "\nKategori yang Diinginkan: ".$context['category'];
        }
        if (! empty($context['notes'])) {
            $userPrompt .= "\nCatatan Tambahan: ".$context['notes'];
        }

        $rawResponse = self::executePrompt($systemInstruction, $userPrompt, $key, $provider, $model);
        $cleanJson = self::cleanJsonOutput($rawResponse);

        $decoded = json_decode($cleanJson, true);
        if (! is_array($decoded) || empty($decoded['name'])) {
            Log::warning('AI Generation returned invalid JSON structure: '.$rawResponse);
            throw new \RuntimeException('AI mengembalikan respon yang tidak dapat diurai. Silakan coba kembali.');
        }

        // Apply strict post-processing trimming to guarantee 100% compliance with A4 layout limits
        $decoded['name'] = self::fitText($decoded['name'] ?? '', 40);
        $decoded['title'] = self::fitText($decoded['title'] ?? '', $limits['title']);
        $decoded['subtitle'] = self::fitText($decoded['subtitle'] ?? '', $limits['subtitle']);
        $decoded['description'] = self::fitParagraph($decoded['description'] ?? '', $limits['description'], false);

        if (isset($decoded['problem_solution']) && is_array($decoded['problem_solution'])) {
            $decoded['problem_solution']['problem'] = self::fitParagraph($decoded['problem_solution']['problem'] ?? '', $limits['problem']);
            $decoded['problem_solution']['solution'] = self::fitParagraph($decoded['problem_solution']['solution'] ?? '', $limits['solution']);
        }

        if (isset($decoded['benefits']) && is_array($decoded['benefits'])) {
            $decoded['benefits']['content'] = self::fitList($decoded['benefits']['content'] ?? '', $limits['benefits'], 4);
        }

        if (isset($decoded['specifications']) && is_array($decoded['specifications'])) {
            $decoded['specifications']['content'] = self::fitList($decoded['specifications']['content'] ?? '', $limits['specifications'], 4);
        }

        return $decoded;
    }

    /**
     * Generate or polish a single specific section (benefits, problem_solution, specifications).
     *
     * @param  array<string, mixed>  $currentData
     * @return array<string, mixed>|string
     */
    public static function generateSection(string $sectionType, string $prompt, array $currentData = []): array|string
    {
        $provider = SystemSetting::get('ai_provider', 'gemini');
        $model = SystemSetting::get('ai_model', 'gemini-3.6-flash');
        $key = SystemSetting::get('ai_api_key');

        if (empty($key)) {
            throw new \RuntimeException('API Key AI belum dikonfigurasi.');
        }

        $preset = $currentData['layout_preset'] ?? 'balanced';
        $limits = self::LAYOUT_LIMITS[$preset] ?? self::LAYOUT_LIMITS['balanced'];

        $projectName = $currentData['project_name'] ?? $currentData['name'] ?? $currentData['title'] ?? 'Inovasi STAS-RG';
        $category = $currentData['category'] ?? 'Smart Agriculture';
        $description = trim(strip_tags($currentData['description'] ?? ''));
        $existingPrompt = trim(strip_tags($prompt));

        $contextSummary = "Nama Proyek: {$projectName}\nKategori: {$category}";
        if (! empty($description)) {
            $contextSummary .= "\nDeskripsi Proyek: {$description}";
        }
        if (! empty($existingPrompt) && $existingPrompt !== $description) {
            $contextSummary .= "\nCatatan/Draf Teks Saat Ini: {$existingPrompt}";
        }

        if ($sectionType === 'all_sections') {
            $systemInstruction = <<<INSTRUCTION
Anda adalah Research Assistant CoE STAS-RG Telkom University.
Berdasarkan deskripsi dan informasi proyek riset berikut, susun 4 bagian lembar informasi flyer A4 secara komprehensif, padat, dan ringkas.

ATURAN KETAT PANJANG TEKS (LAYOUT A4 PRESET: {$preset}):
Konten flyer dicetak pada 1 halaman A4, sehingga teks TIDAK BOLEH melebihi batas berikut:
1. Problem: Maksimal {$limits['problem']} karakter plain text (1 paragraf ringkas 2 kalimat latar belakang masalah) dalam format <p>...</p>.
2. Solution: Maksimal {$limits['solution']} karakter plain text (1 paragraf ringkas 2 kalimat solusi terapan) dalam format <p>...</p>.
3. Benefits: Maksimal TOTAL {$limits['benefits']} karakter plain text (3 poin manfaat ringkas: <li><strong>Judul:</strong> 5-7 kata.</li>) dalam format <ul>...</ul>.
4. Specifications: Maksimal TOTAL {$limits['specifications']} karakter plain text (4 poin spesifikasi teknis ringkas: <li><strong>Komponen:</strong> Spek ringkas.</li>) dalam format <ul>...</ul>.

Format output HARUS berupa JSON valid MURNI tanpa markdown codeblock pembungkus:
{
  "problem": "<p>Kendala...</p>",
  "solution": "<p>Solusi...</p>",
  "benefits": "<ul><li><strong>Poin:</strong> Keterangan.</li></ul>",
  "specifications": "<ul><li><strong>Komponen:</strong> Spek.</li></ul>"
}
Gunakan Bahasa Indonesia formal baku yang elegan.
INSTRUCTION;

            $raw = self::executePrompt($systemInstruction, $contextSummary, $key, $provider, $model);
            $clean = self::cleanJsonOutput($raw);
            $decoded = json_decode($clean, true);

            if (! is_array($decoded)) {
                $decoded = [
                    'problem' => "<p>{$clean}</p>",
                    'solution' => '',
                    'benefits' => '',
                    'specifications' => '',
                ];
            }

            return [
                'problem' => self::fitParagraph($decoded['problem'] ?? '', $limits['problem']),
                'solution' => self::fitParagraph($decoded['solution'] ?? '', $limits['solution']),
                'benefits' => self::fitList($decoded['benefits'] ?? '', $limits['benefits'], 4),
                'specifications' => self::fitList($decoded['specifications'] ?? '', $limits['specifications'], 4),
            ];
        }

        if ($sectionType === 'problem') {
            $systemInstruction = "Anda adalah Research Assistant CoE STAS-RG Telkom University. Susun rumusan latar belakang permasalahan nyata di lapangan berdasarkan deskripsi proyek ini dalam 1 paragraf ringkas (Maksimal {$limits['problem']} karakter) format HTML <p>...</p> MURNI. Bahasa Indonesia formal baku.";
            $userPrompt = "{$contextSummary}\nTugas: Susun rumusan Problem yang tajam, ringkas, maksimal {$limits['problem']} karakter.";
            $raw = self::executePrompt($systemInstruction, $userPrompt, $key, $provider, $model);
            $clean = self::cleanHtmlOutput($raw);

            return self::fitParagraph($clean, $limits['problem']);
        }

        if ($sectionType === 'solution') {
            $systemInstruction = "Anda adalah Research Assistant CoE STAS-RG Telkom University. Susun penjelasan solusi inovatif dan teknologi yang ditawarkan dalam 1 paragraf ringkas (Maksimal {$limits['solution']} karakter) format HTML <p>...</p> MURNI. Bahasa Indonesia formal baku.";
            $userPrompt = "{$contextSummary}\nTugas: Susun penjelasan Solution yang menjawab masalah, maksimal {$limits['solution']} karakter.";
            $raw = self::executePrompt($systemInstruction, $userPrompt, $key, $provider, $model);
            $clean = self::cleanHtmlOutput($raw);

            return self::fitParagraph($clean, $limits['solution']);
        }

        if ($sectionType === 'problem_solution') {
            $systemInstruction = "Anda adalah Research Assistant CoE STAS-RG Telkom University. Susun bagian Problem (Maksimal {$limits['problem']} karakter) dan Solution (Maksimal {$limits['solution']} karakter) dalam format JSON MURNI: {\"problem\": \"<p>...</p>\", \"solution\": \"<p>...</p>\"}. Bahasa Indonesia formal.";
            $userPrompt = "{$contextSummary}\nTugas: Susun problem dan solution ringkas.";
            $raw = self::executePrompt($systemInstruction, $userPrompt, $key, $provider, $model);
            $clean = self::cleanJsonOutput($raw);
            $decoded = json_decode($clean, true);

            if (! is_array($decoded)) {
                $decoded = ['problem' => "<p>{$raw}</p>", 'solution' => ''];
            }

            return [
                'problem' => self::fitParagraph($decoded['problem'] ?? '', $limits['problem']),
                'solution' => self::fitParagraph($decoded['solution'] ?? '', $limits['solution']),
            ];
        }

        if ($sectionType === 'benefits') {
            $systemInstruction = "Anda adalah Research Assistant CoE STAS-RG Telkom University. Susun 3 poin manfaat utama dan dampak riset inovasi ini (Maksimal TOTAL {$limits['benefits']} karakter) dalam format HTML <ul><li><strong>Judul:</strong> Keterangan 5-7 kata.</li></ul> MURNI. Bahasa Indonesia formal.";
            $userPrompt = "{$contextSummary}\nTugas: Buat 3 poin manfaat ringkas dan padat, maksimal total {$limits['benefits']} karakter.";
            $raw = self::executePrompt($systemInstruction, $userPrompt, $key, $provider, $model);
            $clean = self::cleanHtmlOutput($raw);

            return self::fitList($clean, $limits['benefits'], 3);
        }

        if ($sectionType === 'specifications') {
            $systemInstruction = "Anda adalah Research Assistant CoE STAS-RG Telkom University. Susun 4 daftar spesifikasi teknis realistis (Maksimal TOTAL {$limits['specifications']} karakter) dalam format HTML <ul><li><strong>Komponen:</strong> Spek ringkas.</li></ul> MURNI. Bahasa Indonesia.";
            $userPrompt = "{$contextSummary}\nTugas: Buat 4 poin spesifikasi teknis ringkas, maksimal total {$limits['specifications']} karakter.";
            $raw = self::executePrompt($systemInstruction, $userPrompt, $key, $provider, $model);
            $clean = self::cleanHtmlOutput($raw);

            return self::fitList($clean, $limits['specifications'], 4);
        }

        // Generic description / text polishing
        $systemInstruction = "Anda adalah Research Assistant CoE STAS-RG Telkom University. Susun deskripsi ilmiah ringkas (2-3 kalimat padat, maksimal {$limits['description']} karakter) untuk proyek riset ini. Bahasa Indonesia formal.";
        $userPrompt = "{$contextSummary}\nTugas: Susun deskripsi proyek yang menarik, padat, dan tidak melebihi {$limits['description']} karakter.";

        $raw = self::executePrompt($systemInstruction, $userPrompt, $key, $provider, $model);

        return self::fitParagraph(trim($raw), $limits['description'], false);
    }

    /**
     * Translate full project content into Academic/Scientific English (or specified target language).
     * Strictly preserves HTML tags and complies with 1-page A4 layout limits.
     *
     * @param  array<string, mixed>  $sourceData
     * @return array<string, mixed>
     */
    public static function translateProjectContent(array $sourceData, string $targetLanguage = 'en', string $preset = 'balanced'): array
    {
        $provider = SystemSetting::get('ai_provider', 'gemini');
        $model = SystemSetting::get('ai_model', 'gemini-3.6-flash');
        $key = SystemSetting::get('ai_api_key');

        if (empty($key)) {
            throw new \RuntimeException('API Key AI belum dikonfigurasi. Silakan atur di menu Settings terlebih dahulu.');
        }

        $limits = self::LAYOUT_LIMITS[$preset] ?? self::LAYOUT_LIMITS['balanced'];

        $title = $sourceData['title'] ?? '';
        $subtitle = $sourceData['subtitle'] ?? '';
        $category = $sourceData['category'] ?? '';
        $description = $sourceData['description'] ?? '';
        $problem = $sourceData['problem_solution']['problem'] ?? ($sourceData['problem'] ?? '');
        $solution = $sourceData['problem_solution']['solution'] ?? ($sourceData['solution'] ?? '');
        $benefitsContent = $sourceData['benefits']['content'] ?? ($sourceData['benefits'] ?? '');
        $specsContent = $sourceData['specifications']['content'] ?? ($sourceData['specifications'] ?? '');
        $panels = $sourceData['problem_solution']['panels'] ?? null;

        $systemInstruction = <<<INSTRUCTION
You are an expert Scientific & Academic Technical Translator for the Center of Excellence Sustainable Technology and Applied Sciences Research Group (CoE STAS-RG) at Telkom University.
Your task is to translate research flyer innovation content from Indonesian into formal, high-impact, professional International Academic English.

STRICT RULES & CONSTRAINTS:
1. Maintain exact HTML markup tags (<p>, <ul>, <li>, <strong>) precisely.
2. Translate technological terms accurately and idiomatically into standard academic English (e.g., "Sistem Monitoring Pertanian Presisi" -> "Precision Agriculture Monitoring System", "Efisiensi Waktu" -> "Time Efficiency", "Daya" -> "Power Supply").
3. DO NOT expand or add verbose fluff. Keep translations concise and punchy to strictly fit the 1-page A4 layout character limits:
   - title: Max {$limits['title']} characters (Formal uppercase/titlecase).
   - subtitle: Max {$limits['subtitle']} characters.
   - description: Max {$limits['description']} characters.
   - problem: Max {$limits['problem']} characters. Format <p>...</p>.
   - solution: Max {$limits['solution']} characters. Format <p>...</p>.
   - benefits: Max TOTAL {$limits['benefits']} characters plain text. Format <ul><li><strong>Key Benefit:</strong> Concise explanation.</li></ul>.
   - specifications: Max TOTAL {$limits['specifications']} characters plain text. Format <ul><li><strong>Component:</strong> Brief spec.</li></ul>.

Return ONLY pure, valid JSON with NO surrounding markdown backticks (no ```json):
{
  "title": "ENGLISH TITLE",
  "subtitle": "English Subtitle",
  "category": "English Category Name",
  "description": "English description...",
  "problem_solution": {
    "title": "PROBLEM & SOLUTION",
    "problem": "<p>English problem statement...</p>",
    "solution": "<p>English innovation solution...</p>"
  },
  "benefits": {
    "title": "KEY BENEFITS",
    "content": "<ul><li><strong>Point:</strong> Explanation.</li></ul>"
  },
  "specifications": {
    "title": "TECHNICAL SPECIFICATIONS",
    "content": "<ul><li><strong>Item:</strong> Spec.</li></ul>"
  }
}
INSTRUCTION;

        $payloadToTranslate = [
            'title' => $title,
            'subtitle' => $subtitle,
            'category' => $category,
            'description' => $description,
            'problem' => $problem,
            'solution' => $solution,
            'benefits' => $benefitsContent,
            'specifications' => $specsContent,
        ];

        if (! empty($panels) && is_array($panels)) {
            $payloadToTranslate['panels'] = $panels;
        }

        $userPrompt = "Please translate the following Indonesian research flyer content into English:\n".json_encode($payloadToTranslate, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

        $rawResponse = self::executePrompt($systemInstruction, $userPrompt, $key, $provider, $model);
        $cleanJson = self::cleanJsonOutput($rawResponse);

        $decoded = json_decode($cleanJson, true);
        if (! is_array($decoded) || empty($decoded['title'])) {
            Log::warning('AI Translation returned invalid JSON structure: '.$rawResponse);
            throw new \RuntimeException('AI mengembalikan hasil terjemahan yang tidak dapat diurai. Silakan coba kembali.');
        }

        // Apply strict post-processing trimming to guarantee 100% compliance with A4 layout limits
        $result = [
            'title' => self::fitText($decoded['title'] ?? $title, $limits['title']),
            'subtitle' => self::fitText($decoded['subtitle'] ?? $subtitle, $limits['subtitle']),
            'category' => self::fitText($decoded['category'] ?? $category, 40),
            'description' => self::fitParagraph($decoded['description'] ?? $description, $limits['description'], false),
            'problem_solution' => [
                'title' => 'PROBLEM & SOLUTION',
                'problem' => self::fitParagraph($decoded['problem_solution']['problem'] ?? ($decoded['problem'] ?? $problem), $limits['problem']),
                'solution' => self::fitParagraph($decoded['problem_solution']['solution'] ?? ($decoded['solution'] ?? $solution), $limits['solution']),
            ],
            'benefits' => [
                'title' => 'KEY BENEFITS',
                'content' => self::fitList($decoded['benefits']['content'] ?? ($decoded['benefits'] ?? $benefitsContent), $limits['benefits'], 4),
            ],
            'specifications' => [
                'title' => 'TECHNICAL SPECIFICATIONS',
                'content' => self::fitList($decoded['specifications']['content'] ?? ($decoded['specifications'] ?? $specsContent), $limits['specifications'], 4),
            ],
        ];

        // Handle trifold panels translation if available
        if (! empty($decoded['problem_solution']['panels']) && is_array($decoded['problem_solution']['panels'])) {
            $result['problem_solution']['panels'] = $decoded['problem_solution']['panels'];
        } elseif (! empty($decoded['panels']) && is_array($decoded['panels'])) {
            $result['problem_solution']['panels'] = $decoded['panels'];
        }

        return $result;
    }

    /**
     * Generate comprehensive Executive Summary and Strategic Value Highlights from project data.
     *
     * @param  array<string, mixed>  $projectData
     * @return array<string, mixed>
     */
    public static function generateExecutiveSummary(array $projectData, string $language = 'id'): array
    {
        $provider = SystemSetting::get('ai_provider', 'gemini');
        $model = SystemSetting::get('ai_model', 'gemini-3.6-flash');
        $key = SystemSetting::get('ai_api_key');

        if (empty($key)) {
            throw new \RuntimeException('API Key AI belum dikonfigurasi. Silakan atur di menu Settings terlebih dahulu.');
        }

        $title = $projectData['title'] ?? ($projectData['name'] ?? 'Inovasi Riset');
        $subtitle = $projectData['subtitle'] ?? '';
        $category = $projectData['category'] ?? 'General';
        $description = $projectData['description'] ?? '';
        $problem = $projectData['problem_solution']['problem'] ?? ($projectData['problem'] ?? '');
        $solution = $projectData['problem_solution']['solution'] ?? ($projectData['solution'] ?? '');
        $benefits = $projectData['benefits']['content'] ?? ($projectData['benefits'] ?? '');
        $specs = $projectData['specifications']['content'] ?? ($projectData['specifications'] ?? '');
        $lab = $projectData['lab_affiliation'] ?? '';

        $isId = strtolower($language) !== 'en';

        $systemInstruction = $isId
            ? <<<'INSTRUCTION'
Anda adalah Executive Research Analyst senior untuk Center of Excellence Sustainable Technology and Applied Sciences Research Group (CoE STAS-RG) Telkom University.
Tugas Anda adalah menyusun Ringkasan Eksekutif (Executive Summary) tingkat tinggi yang tajam, profesional, dan meyakinkan untuk pembuat kebijakan, industri mitra, dan reviewer pendanaan riset.

Format output HARUS berupa JSON valid murni tanpa markdown codeblock pembungkus (tanpa ```json ... ```):
{
  "executive_summary": "1 paragraf padat 3-4 kalimat merangkum urgensi, solusi terapan, dan keunggulan teknologi.",
  "strategic_highlights": [
    "Poin keunggulan strategis 1",
    "Poin keunggulan strategis 2",
    "Poin keunggulan strategis 3"
  ],
  "recommended_short_desc": "Deskripsi ringkas 2 kalimat siap pakai untuk formulir proyek flyer A4 (maksimal 350 karakter).",
  "target_beneficiaries": [
    "Sektor / Industri Sasaran 1",
    "Sektor / Industri Sasaran 2"
  ]
}
Gunakan Bahasa Indonesia formal bisnis & akademik yang berwibawa.
INSTRUCTION
            : <<<'INSTRUCTION'
You are a Senior Executive Research Analyst for the Center of Excellence Sustainable Technology and Applied Sciences Research Group (CoE STAS-RG) at Telkom University.
Your task is to generate a high-impact Executive Summary and Strategic Value Analysis for policymakers, industry partners, and grant reviewers.

Return ONLY pure, valid JSON with NO surrounding codeblocks (no ```json):
{
  "executive_summary": "1 strong paragraph (3-4 sentences) summarizing research urgency, applied solution, and competitive edge.",
  "strategic_highlights": [
    "Strategic highlight 1",
    "Strategic highlight 2",
    "Strategic highlight 3"
  ],
  "recommended_short_desc": "Concise 2-sentence description ready to be used in A4 flyer form (max 350 characters).",
  "target_beneficiaries": [
    "Target Industry / Beneficiary 1",
    "Target Industry / Beneficiary 2"
  ]
}
Use formal, commanding international business & academic English.
INSTRUCTION;

        $userPrompt = "Berikut data inovasi proyek riset:\n"
            ."Judul: {$title}\n"
            ."Subjudul: {$subtitle}\n"
            ."Kategori: {$category}\n"
            ."Afiliasi Lab: {$lab}\n"
            ."Deskripsi Saat Ini: {$description}\n"
            ."Problem: {$problem}\n"
            ."Solution: {$solution}\n"
            ."Manfaat: {$benefits}\n"
            ."Spesifikasi: {$specs}\n\n"
            .'Susun Ringkasan Eksekutif dan Strategic Highlights sekarang.';

        $rawResponse = self::executePrompt($systemInstruction, $userPrompt, $key, $provider, $model);
        $cleanJson = self::cleanJsonOutput($rawResponse);
        $decoded = json_decode($cleanJson, true);

        if (! is_array($decoded) || empty($decoded['executive_summary'])) {
            return [
                'executive_summary' => strip_tags($cleanJson),
                'strategic_highlights' => ['Inovasi riset terapan berkelanjutan CoE STAS-RG.'],
                'recommended_short_desc' => self::fitText(strip_tags($cleanJson), 350),
                'target_beneficiaries' => ['Industri & Akademisi'],
            ];
        }

        return $decoded;
    }

    /**
     * Format raw user notes or rough draft into standard structured academic abstract (ID and/or EN) with keywords.
     *
     * @param  array<string, mixed>  $context
     * @return array<string, mixed>
     */
    public static function formatAcademicAbstract(string $rawText, array $context = [], string $targetLang = 'both'): array
    {
        $provider = SystemSetting::get('ai_provider', 'gemini');
        $model = SystemSetting::get('ai_model', 'gemini-3.6-flash');
        $key = SystemSetting::get('ai_api_key');

        if (empty($key)) {
            throw new \RuntimeException('API Key AI belum dikonfigurasi.');
        }

        $projectTitle = $context['title'] ?? ($context['name'] ?? 'Inovasi Riset STAS-RG');
        $category = $context['category'] ?? 'Smart Agriculture';

        $systemInstruction = <<<'INSTRUCTION'
Anda adalah Editor Jurnal Ilmiah Internasional & Research Advisor CoE STAS-RG Telkom University.
Tugas Anda adalah mengubah draf / catatan kasar dari pengguna menjadi Abstrak Ilmiah Terstruktur Standar (IMRaD: Background, Methods, Results, Conclusion) serta menghasilkan Kata Kunci (Keywords).

Format output HARUS berupa JSON valid murni tanpa markdown codeblock pembungkus:
{
  "abstract_id": {
    "background": "Latar belakang dan urgensi permasalahan riset...",
    "methods": "Metodologi, perancangan sistem, dan arsitektur teknologi...",
    "results": "Hasil pengujian utama, akurasi, atau efisiensi inovasi...",
    "conclusion": "Kesimpulan dan dampak praktis penerapan...",
    "full_paragraph": "Gabungan utuh 1 paragraf abstrak Bahasa Indonesia formal baku (150-250 kata)."
  },
  "abstract_en": {
    "background": "Research background and urgency...",
    "methods": "Methodology, system design, and technological architecture...",
    "results": "Key empirical findings, accuracy, or efficiency metrics...",
    "conclusion": "Conclusion and practical applied significance...",
    "full_paragraph": "Complete 1-paragraph academic English abstract (150-250 words)."
  },
  "keywords_id": ["Kata Kunci 1", "Kata Kunci 2", "Kata Kunci 3", "Kata Kunci 4", "Kata Kunci 5"],
  "keywords_en": ["Keyword 1", "Keyword 2", "Keyword 3", "Keyword 4", "Keyword 5"]
}
INSTRUCTION;

        $userPrompt = "Konteks Proyek: {$projectTitle} (Kategori: {$category})\n\n"
            ."Draf / Catatan / Informasi Riset Kasar dari Peneliti:\n\"{$rawText}\"\n\n"
            .'Format menjadi Abstrak Ilmiah Terstruktur (ID & EN) beserta Keywords.';

        $rawResponse = self::executePrompt($systemInstruction, $userPrompt, $key, $provider, $model);
        $cleanJson = self::cleanJsonOutput($rawResponse);
        $decoded = json_decode($cleanJson, true);

        if (! is_array($decoded) || empty($decoded['abstract_id'])) {
            $fallbackParagraph = strip_tags($cleanJson);

            return [
                'abstract_id' => [
                    'background' => 'Urgensi inovasi teknologi terapan.',
                    'methods' => 'Metodologi perancangan sistem terintegrasi.',
                    'results' => 'Peningkatan efisiensi dan performa operasional.',
                    'conclusion' => 'Solusi tepat guna untuk implementasi nyata.',
                    'full_paragraph' => $fallbackParagraph,
                ],
                'abstract_en' => [
                    'background' => 'Urgency of applied technological innovation.',
                    'methods' => 'Integrated system design methodology.',
                    'results' => 'Operational efficiency and performance enhancement.',
                    'conclusion' => 'Actionable solution for real-world deployment.',
                    'full_paragraph' => $fallbackParagraph,
                ],
                'keywords_id' => ['Teknologi Terapan', 'CoE STAS-RG', 'Inovasi', 'Telkom University'],
                'keywords_en' => ['Applied Technology', 'CoE STAS-RG', 'Innovation', 'Telkom University'],
            ];
        }

        return $decoded;
    }

    /**
     * Bidirectional Translation between Indonesian and English (preserving HTML markup).
     */
    public static function translateBidirectional(string $text, string $sourceLang = 'id', string $targetLang = 'en', string $mode = 'academic'): string
    {
        $provider = SystemSetting::get('ai_provider', 'gemini');
        $model = SystemSetting::get('ai_model', 'gemini-3.6-flash');
        $key = SystemSetting::get('ai_api_key');

        if (empty($key)) {
            throw new \RuntimeException('API Key AI belum dikonfigurasi.');
        }

        $sourceName = strtolower($sourceLang) === 'en' ? 'English' : 'Indonesian (Bahasa Indonesia)';
        $targetName = strtolower($targetLang) === 'id' ? 'Indonesian (Bahasa Indonesia)' : 'Academic English';

        $systemInstruction = <<<INSTRUCTION
You are an expert Scientific & Technical Translator for CoE STAS-RG Telkom University.
Translate the given text from {$sourceName} to {$targetName}.

RULES:
1. Preserve all HTML formatting tags (<p>, <ul>, <li>, <strong>, <br>, <em>) exactly as structured.
2. Use high-impact, standard scientific and technological terminology.
3. Return ONLY the translated text / HTML string. Do NOT add preamble, markdown backticks, or notes.
INSTRUCTION;

        $userPrompt = "Text to translate:\n{$text}";

        $rawResponse = self::executePrompt($systemInstruction, $userPrompt, $key, $provider, $model);

        return self::cleanHtmlOutput($rawResponse);
    }

    /**
     * Auto-summarize and fit text strictly within character limits without cutting words or sentences awkwardly.
     */
    public static function autoSummarizeToLimit(string $text, int $maxChars, string $contentType = 'paragraph'): string
    {
        $provider = SystemSetting::get('ai_provider', 'gemini');
        $model = SystemSetting::get('ai_model', 'gemini-3.6-flash');
        $key = SystemSetting::get('ai_api_key');

        if (empty($key)) {
            return self::fitParagraph($text, $maxChars, false);
        }

        $systemInstruction = <<<INSTRUCTION
Anda adalah AI Summarization Engine khusus dokumen cetak 1 halaman A4 CoE STAS-RG Telkom University.
Tugas Anda adalah meringkas teks berikut agar SANGAT PADAT, ELEGAN, dan TIDAK MELEBIHI {$maxChars} KARAKTER PLAIN TEXT.

ATURAN:
1. Teks hasil ringkasan HARUS memiliki total panjang maksimal {$maxChars} karakter.
2. Pertahankan pesan inti, data penting, dan istilah kunci.
3. Jika input berupa HTML (<p> atau <ul><li>), pertahankan tag tersebut.
4. Kembalikan HANYA teks ringkasan tanpa penjelasan tambahan atau markdown codeblock pembungkus.
INSTRUCTION;

        $userPrompt = 'Teks asli (panjang saat ini: '.mb_strlen(strip_tags($text))." karakter):\n{$text}\n\nRingkas hingga maksimal {$maxChars} karakter:";

        try {
            $rawResponse = self::executePrompt($systemInstruction, $userPrompt, $key, $provider, $model);
            $clean = self::cleanHtmlOutput($rawResponse);

            if ($contentType === 'list') {
                return self::fitList($clean, $maxChars);
            }

            return self::fitParagraph($clean, $maxChars, false);
        } catch (\Throwable $e) {
            return self::fitParagraph($text, $maxChars, false);
        }
    }

    /**
     * Polish and enhance grammar, clarity, and academic tone.
     */
    public static function polishGrammar(string $text, string $language = 'id', string $tone = 'academic'): string
    {
        $provider = SystemSetting::get('ai_provider', 'gemini');
        $model = SystemSetting::get('ai_model', 'gemini-3.6-flash');
        $key = SystemSetting::get('ai_api_key');

        if (empty($key)) {
            throw new \RuntimeException('API Key AI belum dikonfigurasi.');
        }

        $isId = strtolower($language) !== 'en';

        $systemInstruction = $isId
            ? 'Anda adalah Editor Ilmiah CoE STAS-RG Telkom University. Perbaiki tata bahasa, ejaan (EYD V), keterbacaan, dan tingkatkan tone teks berikut menjadi formal, presisi, dan elegan. Pertahankan tag HTML bila ada. Kembalikan HANYA hasil teks yang sudah diperbaiki.'
            : 'You are an Academic Scientific Editor for CoE STAS-RG Telkom University. Enhance the grammar, flow, vocabulary, and scholarly tone of the following text. Preserve any HTML markup tags. Return ONLY the polished text.';

        $userPrompt = "Teks untuk disempurnakan:\n{$text}";

        $rawResponse = self::executePrompt($systemInstruction, $userPrompt, $key, $provider, $model);

        return self::cleanHtmlOutput($rawResponse);
    }

    /**
     * Send prompt to Gemini or OpenAI API and return text response.
     *
     * @param  array{mime_type: string, data: string}|null  $imageAttachment
     */
    private static function executePrompt(
        string $systemInstruction,
        string $userPrompt,
        string $apiKey,
        string $provider,
        string $model,
        ?array $imageAttachment = null
    ): string {
        try {
            if ($provider === 'gemini') {
                $modelsToTry = array_unique(array_filter([
                    $model,
                    'gemini-2.5-flash',
                    'gemini-2.0-flash',
                    'gemini-1.5-flash',
                ]));

                $lastError = null;
                foreach ($modelsToTry as $currentModel) {
                    $endpoint = "https://generativelanguage.googleapis.com/v1beta/models/{$currentModel}:generateContent";

                    $parts = [];
                    if (! empty($imageAttachment) && ! empty($imageAttachment['data'])) {
                        $parts[] = [
                            'inlineData' => [
                                'mimeType' => $imageAttachment['mime_type'] ?? 'image/jpeg',
                                'data' => $imageAttachment['data'],
                            ],
                        ];
                    }
                    $parts[] = ['text' => $userPrompt];

                    $response = Http::timeout(60)
                        ->connectTimeout(20)
                        ->retry(2, 500, throw: false)
                        ->withHeaders([
                            'Content-Type' => 'application/json',
                            'x-goog-api-key' => $apiKey,
                        ])
                        ->post($endpoint, [
                            'systemInstruction' => [
                                'parts' => [
                                    ['text' => $systemInstruction],
                                ],
                            ],
                            'contents' => [
                                [
                                    'parts' => $parts,
                                ],
                            ],
                            'generationConfig' => [
                                'temperature' => 0.4,
                                'topP' => 0.95,
                            ],
                        ]);

                    if ($response->successful()) {
                        $json = $response->json();
                        $text = $json['candidates'][0]['content']['parts'][0]['text'] ?? '';
                        if (! empty(trim($text))) {
                            return $text;
                        }
                    }

                    $errorMsg = $response->json('error.message') ?: $response->body();
                    $lastError = "Google Gemini API Error ({$currentModel}): {$errorMsg}";
                    Log::warning("Gemini model {$currentModel} failed: {$errorMsg}");
                }

                if ($lastError) {
                    throw new \RuntimeException($lastError);
                }
            }

            // OpenAI / Compatible
            $endpoint = SystemSetting::get('ai_custom_endpoint') ?: 'https://api.openai.com/v1/chat/completions';

            $userMessageContent = $userPrompt;
            if (! empty($imageAttachment) && ! empty($imageAttachment['data'])) {
                $mimeType = $imageAttachment['mime_type'] ?? 'image/jpeg';
                $base64Data = $imageAttachment['data'];
                $userMessageContent = [
                    ['type' => 'text', 'text' => $userPrompt],
                    ['type' => 'image_url', 'image_url' => ['url' => "data:{$mimeType};base64,{$base64Data}"]],
                ];
            }

            $response = Http::timeout(60)
                ->connectTimeout(20)
                ->retry(2, 500, throw: false)
                ->withToken($apiKey)
                ->post($endpoint, [
                    'model' => $model ?: 'gpt-4o-mini',
                    'messages' => [
                        ['role' => 'system', 'content' => $systemInstruction],
                        ['role' => 'user', 'content' => $userMessageContent],
                    ],
                    'temperature' => 0.4,
                ]);

            if (! $response->successful()) {
                throw new \RuntimeException('OpenAI API Error: '.$response->body());
            }

            $json = $response->json();

            return $json['choices'][0]['message']['content'] ?? '';
        } catch (ConnectionException $e) {
            throw new \RuntimeException('Koneksi ke server AI mengalami timeout (waktu habis). Silakan periksa koneksi internet Anda atau coba beberapa saat lagi.');
        } catch (\Throwable $e) {
            // Sanitize potential API key from error message to prevent leaking in UI
            $msg = preg_replace('/key=[a-zA-Z0-9_\-\.]+/i', 'key=***', $e->getMessage());
            $msg = preg_replace('/AIzaSy[a-zA-Z0-9_\-]+/i', 'AIzaSy***', $msg);
            throw new \RuntimeException($msg);
        }
    }

    /**
     * Clean raw string containing markdown ```json ... ``` into pure JSON string.
     */
    private static function cleanJsonOutput(string $raw): string
    {
        $raw = trim($raw);
        if (preg_match('/^```(?:json)?\s*([\s\S]*?)\s*```$/i', $raw, $matches)) {
            $raw = trim($matches[1]);
        }

        // Find outer curly brackets if extra text present
        $firstBrace = strpos($raw, '{');
        $lastBrace = strrpos($raw, '}');
        if ($firstBrace !== false && $lastBrace !== false && $lastBrace > $firstBrace) {
            $raw = substr($raw, $firstBrace, $lastBrace - $firstBrace + 1);
        }

        return $raw;
    }

    /**
     * Interactive grounded chat for public landing page visitors with voice, attachments, and specialized modes.
     *
     * @param  list<array{role: string, content: string}>  $history
     * @param  array{mime_type?: string, data?: string, text?: string, filename?: string}|null  $attachment
     */
    public static function chatWithGroundedAssistant(
        string $userMessage,
        array $history = [],
        string $language = 'id',
        ?string $groundingContext = null,
        string $mode = 'general',
        ?array $attachment = null
    ): string {
        $apiKey = SystemSetting::get('ai_api_key') ?: config('services.ai.gemini_key') ?: config('services.ai.openai_key');
        $provider = SystemSetting::get('ai_provider', 'gemini');
        $model = SystemSetting::get('ai_model', 'gemini-3.6-flash');

        $isId = strtolower($language) !== 'en';

        // Graceful fallback if no API key is set
        if (empty($apiKey)) {
            if ($isId) {
                return 'Halo! Saya NARA, Asisten AI CoE STAS-RG Telkom University. Saat ini layanan AI live sedang dalam mode informasi dasar. Center of Excellence STAS-RG berfokus pada riset IoT Pintar, Otomasi Industri, Telekomunikasi, dan Keamanan Siber. Anda dapat menjelajahi proyek terbit di halaman showcase kami atau menghubungi tim kami melalui menu Bantuan (/support).';
            }

            return 'Hello! I am NARA, the CoE STAS-RG Telkom University AI Assistant. The live AI service is currently in basic mode. CoE STAS-RG focuses on Smart IoT, Industrial Automation, Telecommunications, and Cyber Security. You can explore our published projects in the showcase or contact our team via the Support page (/support).';
        }

        // Mode specific custom guidelines
        $modeGuidelinesId = match ($mode) {
            'research' => "MODE AKTIF: KONSULTASI RISET & IOT TERAPAN\n- Berikan analisis mendalam mengenai arsitektur sistem, pemilihan mikrokontroler/sensor, topologi komunikasi jaringan, serta metodologi penelitian terapan.\n- Rujuk proyek riset CoE STAS-RG yang relevan jika ada kecocokan topik.\n",
            'document' => "MODE AKTIF: ANALISIS & STANDARISASI DOKUMEN\n- Bantu pengguna menyusun naskah Flyer A4 (1 halaman padat), Brosur Lipat Tiga (Trifold), atau Factsheet sesuai batasan karakter presisi STAS RG Projects.\n- Berikan saran perbaikan teks agar lebih persuasif, ringkas, dan bebas kata bertele-tele.\n",
            'partner' => "MODE AKTIF: KEMITRAAN & KOLABORASI INDUSTRI\n- Fokus bantu calon mitra industri, instansi pemerintah, dan akademisi memahami skema kerjasama riset, lisensi HKI/paten, pengujian laboratorium, dan pengajuan tiket kerjasama resmi via /support.\n",
            default => "MODE AKTIF: ASISTEN UMUM & EKSPLORASI INOVASI\n- Jawab pertanyaan seputar profil CoE STAS-RG, direktori inovasi, peneliti, dan fitur platform STAS RG Projects secara ramah dan menyeluruh.\n",
        };

        $modeGuidelinesEn = match ($mode) {
            'research' => "ACTIVE MODE: APPLIED RESEARCH & IOT CONSULTATION\n- Provide deep technical analysis on system architecture, sensors/MCU selection, telemetry protocols, and academic methodologies.\n- Reference published CoE STAS-RG research projects whenever relevant.\n",
            'document' => "ACTIVE MODE: DOCUMENT ANALYSIS & STANDARDIZATION\n- Help user refine content for A4 Flyers, Trifold Brochures, or Factsheets conforming strictly to STAS RG Projects 1-page character limits.\n- Provide crisp, punchy, and impactful copywriting suggestions.\n",
            'partner' => "ACTIVE MODE: INDUSTRY PARTNERSHIP & COLLABORATION\n- Guide potential industry partners and institutions on research collaboration schemes, IP/patent licensing, lab validation, and filing formal inquiries via /support.\n",
            default => "ACTIVE MODE: GENERAL ASSISTANT & DISCOVERY\n- Assist visitors in discovering CoE STAS-RG innovations, research directories, faculties, and STAS RG Projects platform capabilities.\n",
        };

        $systemInstruction = $isId
            ? "Nama Anda adalah 'NARA' (Navigation & Research Assistant), asisten AI resmi yang cerdas, solutif, dan ramah untuk Center of Excellence Sustainable Technology and Applied Sciences Research Group (CoE STAS-RG) Telkom University.\n\n"
                ."ATURAN IDENTITAS & GAYA BICARA (SANGAT PENTING):\n"
                ."- Selalu sadari dan gunakan nama Anda: 'NARA'.\n"
                ."- Saat menyapa atau membuka jawaban, perkenalkan diri atau sapa sebagai NARA (misalnya: 'Halo! Saya NARA, siap membantu...', 'Hai! NARA di sini...').\n"
                ."- Saat memberikan opini, analisa, atau saran, sebut diri Anda sebagai 'NARA' (misalnya: 'Menurut NARA...', 'NARA merekomendasikan...', 'Dari data yang NARA telusuri...', 'NARA sarankan...').\n"
                ."- Jangan pernah menyebut 'Saya adalah model bahasa besar yang dikembangkan oleh OpenAI/Google'. Selalu tegaskan identitas Anda sebagai NARA dari CoE STAS-RG Telkom University.\n"
                ."- Di akhir balasan, Anda boleh menawarkan bantuan lebih lanjut (misalnya: 'Ada hal lain seputar riset atau platform yang ingin ditanyakan ke NARA?').\n\n"
                .$modeGuidelinesId
                ."Tugas Utama NARA:\n"
                ."1. Menjelaskan profil, bidang riset unggulan CoE STAS-RG (Smart Agriculture, IoT Sensing, Telekomunikasi & Antena, UAV/Aerospace, Cyber Security).\n"
                ."2. Menginformasikan portofolio proyek riset, paten/HKI, peneliti, dan publikasi yang ada di platform STAS RG Projects berdasarkan data konteks yang tersedia.\n"
                ."3. Memberikan panduan pembuatan dokumen ilmiah & expo (Flyer A4 1-Halaman, Brosur Lipat 3 Trifold, Factsheet, Dynamic QR Expo, Login Passkey WebAuthn).\n"
                ."4. Analisis Multimodal Gambar & Dokumen: Jika pengguna melampirkan gambar (seperti logo instansi BRIN/Badan Riset dan Inovasi Nasional, Telkom University, diagram sistem IoT, foto mikrokontroler, prototipe, dokumen), analisalah gambar tersebut secara cermat, kenali objek/logo/teks di dalamnya, dan jawab pertanyaan pengguna dengan jelas dan akurat.\n\n"
                ."Pedoman Format:\n"
                ."- Berikan jawaban yang terstruktur rapi, elegan, gunakan Markdown (heading bold, bullet points, numbered list) agar mudah dibaca.\n"
                ."- Jika pengguna ingin kerjasama atau butuh bantuan lebih lanjut, arahkan ke menu Bantuan (/support) atau email stas.researchgroup@telkomuniversity.ac.id.\n"
                .($groundingContext ? "\n=== Data Pengetahuan & Riset Terverifikasi ===\n{$groundingContext}\n" : '')
            : "Your name is 'NARA' (Navigation & Research Assistant), the official intelligent, insightful, and friendly AI assistant for the Center of Excellence Sustainable Technology and Applied Sciences Research Group (CoE STAS-RG) at Telkom University.\n\n"
                ."IDENTITY & TONE GUIDELINES (CRITICAL):\n"
                ."- Always embrace and consistently use your name: 'NARA'.\n"
                ."- When greeting or starting answers, refer to yourself as NARA (e.g. 'Hello! I am NARA, happy to help you...', 'Hi there! NARA is here...').\n"
                ."- When offering suggestions, insights, or opinions, refer to yourself as 'NARA' (e.g. 'According to NARA...', 'NARA recommends...', 'From the research data NARA found...', 'NARA suggests...').\n"
                ."- Never state 'I am a large language model trained by OpenAI/Google'. Always affirm your identity as NARA from CoE STAS-RG Telkom University.\n"
                ."- You may close with a warm offer for further assistance (e.g. 'Is there anything else NARA can help you with regarding STAS-RG?').\n\n"
                .$modeGuidelinesEn
                ."Key Responsibilities:\n"
                ."1. Explain CoE STAS-RG core research domains (Smart Agriculture, IoT Sensing, Telecommunications, UAV/Aerospace, Cyber Security).\n"
                ."2. Provide accurate information about research projects, patents, researchers, and publications from STAS RG Projects verified context.\n"
                ."3. Guide users on standardized scientific document generation (1-Page A4 Flyer, 3-Panel Trifold Brochure, Factsheet, Expo QR Codes, Passkey WebAuthn).\n"
                ."4. Multimodal & Vision Analysis: When the user attaches an image (e.g. institutional logo like BRIN - National Research and Innovation Agency, Telkom University, IoT block diagrams, hardware prototypes, charts), inspect the image carefully, recognize the logo/text/content, and address the user's question directly and informatively.\n\n"
                ."Formatting Guidelines:\n"
                ."- Structure answers cleanly with Markdown (bold headings, bullet lists) for clarity.\n"
                ."- For formal collaborations or inquiries, direct users to /support or stas.researchgroup@telkomuniversity.ac.id.\n"
                .($groundingContext ? "\n=== Verified Research & Knowledge Base ===\n{$groundingContext}\n" : '');

        // Format conversational history context (last 6 turns)
        $formattedPrompt = '';
        if (! empty($history)) {
            $formattedPrompt .= "=== Riwayat Percakapan Sebelumnya ===\n";
            $recentHistory = array_slice($history, -6);
            foreach ($recentHistory as $turn) {
                $role = ($turn['role'] ?? 'user') === 'assistant' ? 'NARA' : 'Pengguna';
                $content = trim($turn['content'] ?? '');
                if ($content !== '') {
                    $formattedPrompt .= "{$role}: {$content}\n";
                }
            }
            $formattedPrompt .= "\n";
        }

        // Attach text file content if provided
        $attachmentPrompt = '';
        if (! empty($attachment['text'])) {
            $filename = $attachment['filename'] ?? 'dokumen_terlampir.txt';
            $attachmentPrompt .= "\n[Lampiran Berkas: {$filename}]\nIsi Berkas:\n```\n{$attachment['text']}\n```\n";
        }

        // Image attachment for multimodal models
        $imageAttachment = null;
        if (! empty($attachment['data']) && ! empty($attachment['mime_type']) && str_starts_with($attachment['mime_type'], 'image/')) {
            $imageAttachment = [
                'mime_type' => $attachment['mime_type'],
                'data' => $attachment['data'],
            ];
            $filename = $attachment['filename'] ?? 'gambar_terlampir.png';
            $attachmentPrompt .= "\n[Pengguna melampirkan berkas gambar: {$filename}]\n";
        }

        $formattedPrompt .= '=== Pertanyaan / Permintaan Pengguna ===';
        if ($attachmentPrompt !== '') {
            $formattedPrompt .= $attachmentPrompt;
        }
        $formattedPrompt .= "\nPengguna: {$userMessage}\n\nBerikan tanggapan terbaik sebagai NARA:";

        try {
            return trim(self::executePrompt($systemInstruction, $formattedPrompt, $apiKey, $provider, $model, $imageAttachment));
        } catch (\Throwable $e) {
            Log::warning('Public AI Chat Exception: '.$e->getMessage());

            if ($isId) {
                return 'Terima kasih atas pertanyaan Anda. CoE STAS-RG Telkom University terus berinovasi dalam teknologi terapan berkelanjutan (IoT, AI Terapan, Telekomunikasi). Untuk informasi lebih lengkap atau konsultasi langsung dengan peneliti kami, silakan ajukan pesan melalui formulir Bantuan (/support).';
            }

            return 'Thank you for your question. CoE STAS-RG Telkom University continuously innovates in sustainable applied technologies (IoT, Applied AI, Telecom). For direct inquiries, feel free to reach out via our Support form (/support).';
        }
    }

    /**
     * Dedicated Admin AI Chat with complete operational knowledge (projects, stats, researchers, tickets, logs, settings).
     *
     * @param  list<array{role: string, content: string}>  $history
     * @param  array{mime_type?: string, data?: string, text?: string, filename?: string}|null  $attachment
     */
    public static function chatWithAdminAssistant(
        string $userMessage,
        array $history = [],
        string $language = 'id',
        ?string $adminDataContext = null,
        string $mode = 'all_data',
        ?array $attachment = null,
        ?string $adminUserName = null
    ): string {
        $apiKey = SystemSetting::get('ai_api_key') ?: config('services.ai.gemini_key') ?: config('services.ai.openai_key');
        $provider = SystemSetting::get('ai_provider', 'gemini');
        $model = SystemSetting::get('ai_model', 'gemini-3.6-flash');

        $isId = strtolower($language) !== 'en';
        $adminName = $adminUserName ?: 'Administrator';

        if (empty($apiKey)) {
            return $isId
                ? "Halo {$adminName}! NARA siap membantu dalam mode dasar. Konfigurasikan AI API Key di menu Settings untuk mengaktifkan pemrosesan analitik dan inteligensi mendalam."
                : "Hello {$adminName}! NARA is ready in basic mode. Please configure your AI API Key in Settings to unlock deep intelligence and analytics.";
        }

        $systemInstruction = $isId
            ? "Anda adalah 'NARA Admin Co-Pilot' (Navigation & Research Assistant), asisten AI khusus administrator internal untuk platform STAS RG Projects CoE STAS-RG Telkom University.\n\n"
                ."HAK AKSES & OTORISASI KHUSUS ADMIN (FULL ACCESS):\n"
                ."- Anda memiliki akses penuh terhadap data internal platform STAS RG Projects (semua proyek publik/draf/arsip, statistik analitik, tiket bantuan, direktori peneliti, persetujuan user, log aktivitas, dan konfigurasi sistem).\n"
                ."- Berikan jawaban yang mendalam, taktis, berbasis data riil dari data yang dilampirkan dalam konteks di bawah.\n"
                ."- Jika diminta meringkas atau menganalisis data proyek, tiket, atau peneliti, sajikan dalam format tabel Markdown, bullet point, atau metrik yang rapi dan mudah dieksekusi.\n"
                ."- Anda dapat membantu administrator menyusun draft pengumuman, menganalisis beban helpdesk, mengecek konsistensi data paten/HKI, merekomendasikan tata letak (A4 Flyer / Trifold), hingga mereview berkas dan gambar teknis yang diunggah.\n\n"
                ."IDENTITAS & GAYA KOMUNIKASI:\n"
                ."- Selalu menyapa ramah dan profesional kepada {$adminName}.\n"
                ."- Sebut diri Anda sebagai 'NARA'.\n"
                ."- Berikan respon cepat, solutif, analitis, dan tepat sasaran.\n"
                .($adminDataContext ? "\n=== DATA INTERNAL SISTEM STAS RG PROJECTS (LIVE DATABASE CONTEXT) ===\n{$adminDataContext}\n" : '')
            : "You are 'NARA Admin Co-Pilot' (Navigation & Research Assistant), the dedicated internal intelligence assistant for administrators of STAS RG Projects CoE STAS-RG Telkom University.\n\n"
                ."SPECIAL PRIVILEGED ACCESS (FULL DATA CONTEXT):\n"
                ."- You possess complete visibility into internal platform data (all published/draft/archived projects, system analytics, support tickets, researcher directories, user approvals, activity logs, and settings).\n"
                ."- Provide actionable, precise, data-driven responses based on the live system context provided below.\n"
                ."- Present data summaries using Markdown tables, structured metrics, or bullet points.\n"
                ."- Support administrator tasks including drafting broadcasts, inspecting support bottlenecks, validating character limits, and analyzing multimodal uploaded files/images.\n\n"
                ."TONE & IDENTITY:\n"
                ."- Address {$adminName} professionally and warmly.\n"
                ."- Identify as 'NARA'.\n"
                .($adminDataContext ? "\n=== LIVE INTERNAL SYSTEM CONTEXT ===\n{$adminDataContext}\n" : '');

        $formattedPrompt = '';
        if (! empty($history)) {
            $formattedPrompt .= "=== Riwayat Percakapan Admin Sebelumnya ===\n";
            $recentHistory = array_slice($history, -8);
            foreach ($recentHistory as $turn) {
                $role = ($turn['role'] ?? 'user') === 'assistant' ? 'NARA' : $adminName;
                $content = trim($turn['content'] ?? '');
                if ($content !== '') {
                    $formattedPrompt .= "{$role}: {$content}\n";
                }
            }
            $formattedPrompt .= "\n";
        }

        $attachmentPrompt = '';
        if (! empty($attachment['text'])) {
            $filename = $attachment['filename'] ?? 'berkas_admin.txt';
            $attachmentPrompt .= "\n[Lampiran Berkas Admin: {$filename}]\nIsi Berkas:\n```\n{$attachment['text']}\n```\n";
        }

        $imageAttachment = null;
        if (! empty($attachment['data']) && ! empty($attachment['mime_type']) && str_starts_with($attachment['mime_type'], 'image/')) {
            $imageAttachment = [
                'mime_type' => $attachment['mime_type'],
                'data' => $attachment['data'],
            ];
            $filename = $attachment['filename'] ?? 'gambar_admin.png';
            $attachmentPrompt .= "\n[Admin melampirkan berkas gambar: {$filename}]\n";
        }

        $formattedPrompt .= '=== Permintaan / Instruksi Administrator ===';
        if ($attachmentPrompt !== '') {
            $formattedPrompt .= $attachmentPrompt;
        }
        $formattedPrompt .= "\n{$adminName}: {$userMessage}\n\nBerikan tanggapan komprehensif sebagai NARA Admin Co-Pilot:";

        try {
            return trim(self::executePrompt($systemInstruction, $formattedPrompt, $apiKey, $provider, $model, $imageAttachment));
        } catch (\Throwable $e) {
            Log::warning('Admin AI Chat Exception: '.$e->getMessage());

            return $isId
                ? "Mohon maaf, terjadi kendala saat memproses permintaan: {$e->getMessage()}. Silakan periksa koneksi atau API Key di menu Settings."
                : "Apologies, an error occurred while processing your admin request: {$e->getMessage()}. Please check your connection or API Key in Settings.";
        }
    }

    /**
     * Clean HTML code fence from AI response.
     */
    private static function cleanHtmlOutput(string $raw): string
    {
        $raw = trim($raw);
        if (preg_match('/^```(?:html)?\s*([\s\S]*?)\s*```$/i', $raw, $matches)) {
            $raw = trim($matches[1]);
        }

        return $raw;
    }
}
