<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\Researcher;
use App\Models\SupportTicket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAiAssistantTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'role' => 'admin',
            'status' => User::STATUS_APPROVED,
        ]);
    }

    public function test_guest_cannot_access_admin_ai_assistant(): void
    {
        $response = $this->get('/ai-assistant');
        $response->assertRedirect('/login');
    }

    public function test_admin_can_access_ai_assistant_page(): void
    {
        Project::factory()->create(['status' => 'published']);
        Researcher::create([
            'name' => 'Dr. Jane Doe',
            'role' => 'Principal Investigator',
            'identifier' => '0412345678',
            'created_by' => $this->admin->id,
        ]);
        SupportTicket::create([
            'ticket_number' => 'STAS-2026-TEST01',
            'name' => 'Budi Santoso',
            'email' => 'budi@example.com',
            'category' => 'general',
            'priority' => 'urgent',
            'subject' => 'Kendala Sistem',
            'message' => 'Pesan bantuan dari pengguna.',
            'status' => 'open',
        ]);

        $response = $this->actingAs($this->admin)->get('/ai-assistant');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/AiAssistant/Index')
            ->has('stats')
            ->has('aiConfig')
            ->has('categories')
            ->has('researchersCount')
        );
    }

    public function test_admin_can_send_chat_message(): void
    {
        $response = $this->actingAs($this->admin)->postJson('/ai-assistant/chat', [
            'message' => 'Halo NARA, berikan ringkasan data proyek.',
            'language' => 'id',
            'mode' => 'all_data',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'status',
            'reply',
            'mode',
            'has_attachment',
            'timestamp',
        ]);
        $this->assertEquals('success', $response->json('status'));
    }

    public function test_chat_requires_message_or_attachment(): void
    {
        $response = $this->actingAs($this->admin)->postJson('/ai-assistant/chat', [
            'message' => '',
        ]);

        $response->assertStatus(422);
    }

    public function test_admin_can_send_chat_with_stringified_history(): void
    {
        $historyJson = json_encode([
            ['role' => 'user', 'content' => 'Halo'],
            ['role' => 'assistant', 'content' => 'Halo! Ada yang bisa saya bantu?'],
        ]);

        $response = $this->actingAs($this->admin)->post('/ai-assistant/chat', [
            'message' => 'Lanjutkan penjelasan sebelumnya.',
            'history' => $historyJson,
            'language' => 'id',
            'mode' => 'all_data',
        ], ['Accept' => 'application/json']);

        $response->assertStatus(200);
        $this->assertEquals('success', $response->json('status'));
    }

    public function test_admin_can_use_smart_assist_executive_summary(): void
    {
        \App\Models\SystemSetting::setSecret('ai_api_key', 'AIzaSyFakeValidKey123');
        \App\Models\SystemSetting::set('ai_provider', 'gemini');
        \App\Models\SystemSetting::set('ai_model', 'gemini-3.6-flash');

        $fakeResponse = [
            'executive_summary' => 'Ringkasan eksekutif riset terpadu IoT cerdas.',
            'strategic_highlights' => ['Efisiensi energi tinggi', 'Konektivitas LoRaWAN jarak jauh'],
            'recommended_short_desc' => 'Sistem IoT pemantauan tanah real-time.',
            'target_beneficiaries' => ['Kelompok Tani', 'Pemerintah Daerah'],
        ];

        \Illuminate\Support\Facades\Http::fake([
            'https://generativelanguage.googleapis.com/*' => \Illuminate\Support\Facades\Http::response([
                'candidates' => [
                    [
                        'content' => [
                            'parts' => [
                                ['text' => json_encode($fakeResponse)],
                            ],
                        ],
                    ],
                ],
            ], 200),
        ]);

        $project = Project::factory()->create([
            'title' => 'Sistem IoT Pertanian Cerdas',
            'description' => 'Sistem pemantauan kelembapan tanah berbasis IoT dan LoRaWAN.',
        ]);

        $response = $this->actingAs($this->admin)->postJson('/ai-assistant/smart-assist', [
            'action' => 'executive_summary',
            'project_id' => $project->id,
            'language' => 'id',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'status',
            'result' => [
                'executive_summary',
                'strategic_highlights',
                'recommended_short_desc',
            ],
        ]);
        $this->assertEquals('success', $response->json('status'));
    }

    public function test_admin_can_use_smart_assist_format_abstract(): void
    {
        \App\Models\SystemSetting::setSecret('ai_api_key', 'AIzaSyFakeValidKey123');
        \App\Models\SystemSetting::set('ai_provider', 'gemini');
        \App\Models\SystemSetting::set('ai_model', 'gemini-3.6-flash');

        $fakeResponse = [
            'abstract_id' => [
                'background' => 'Latar belakang deteksi kebakaran dini.',
                'methods' => 'Metode sensor nirkabel terdistribusi.',
                'results' => 'Akurasi deteksi mencapai 98%.',
                'conclusion' => 'Sistem terbukti andal.',
                'full_paragraph' => 'Penelitian ini mengembangkan deteksi dini kebakaran menggunakan sensor nirkabel terdistribusi dengan akurasi 98%.',
            ],
            'abstract_en' => [
                'background' => 'Background on early wildfire detection.',
                'methods' => 'Distributed wireless sensor network methodology.',
                'results' => 'Detection accuracy reached 98%.',
                'conclusion' => 'The system demonstrated robust reliability.',
                'full_paragraph' => 'This study presents an early wildfire detection system utilizing distributed wireless sensor networks with 98% accuracy.',
            ],
            'keywords_id' => ['Deteksi Dini', 'Kebakaran Hutan', 'Sensor Nirkabel'],
            'keywords_en' => ['Early Detection', 'Wildfire', 'Wireless Sensors'],
        ];

        \Illuminate\Support\Facades\Http::fake([
            'https://generativelanguage.googleapis.com/*' => \Illuminate\Support\Facades\Http::response([
                'candidates' => [
                    [
                        'content' => [
                            'parts' => [
                                ['text' => json_encode($fakeResponse)],
                            ],
                        ],
                    ],
                ],
            ], 200),
        ]);

        $response = $this->actingAs($this->admin)->postJson('/ai-assistant/smart-assist', [
            'action' => 'format_abstract',
            'text' => 'Penelitian ini mengembangkan alat pendeteksi kebakaran hutan menggunakan sensor suhu dan transmisi data nirkabel.',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'status',
            'result' => [
                'abstract_id' => ['background', 'methods', 'results', 'conclusion', 'full_paragraph'],
                'abstract_en' => ['background', 'methods', 'results', 'conclusion', 'full_paragraph'],
                'keywords_id',
                'keywords_en',
            ],
        ]);
        $this->assertEquals('success', $response->json('status'));
    }

    public function test_admin_can_use_smart_assist_translation(): void
    {
        \App\Models\SystemSetting::setSecret('ai_api_key', 'AIzaSyFakeValidKey123');
        \App\Models\SystemSetting::set('ai_provider', 'gemini');
        \App\Models\SystemSetting::set('ai_model', 'gemini-3.6-flash');

        \Illuminate\Support\Facades\Http::fake([
            'https://generativelanguage.googleapis.com/*' => \Illuminate\Support\Facades\Http::response([
                'candidates' => [
                    [
                        'content' => [
                            'parts' => [
                                ['text' => '<p>Intelligent control system for industrial robotics.</p>'],
                            ],
                        ],
                    ],
                ],
            ], 200),
        ]);

        $response = $this->actingAs($this->admin)->postJson('/ai-assistant/smart-assist', [
            'action' => 'translate',
            'text' => 'Sistem kendali cerdas untuk robotika industri.',
            'from_lang' => 'id',
            'to_lang' => 'en',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'status',
            'translated_text',
            'from_lang',
            'to_lang',
        ]);
        $this->assertEquals('success', $response->json('status'));
    }

    public function test_admin_can_use_smart_assist_auto_summarize(): void
    {
        $response = $this->actingAs($this->admin)->postJson('/ai-assistant/smart-assist', [
            'action' => 'auto_summarize',
            'text' => 'Deskripsi panjang proyek riset yang memuat berbagai aspek teknis mengenai arsitektur perangkat keras dan integrasi sistem telekomunikasi berkecepatan tinggi.',
            'max_chars' => 200,
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'status',
            'summary',
            'char_count',
            'max_chars',
        ]);
        $this->assertEquals('success', $response->json('status'));
    }
}
