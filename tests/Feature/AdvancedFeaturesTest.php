<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\ProjectAnalytic;
use App\Models\SystemSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class AdvancedFeaturesTest extends TestCase
{
    use RefreshDatabase;

    private User $adminUser;

    protected function setUp(): void
    {
        parent::setUp();

        $this->adminUser = User::factory()->create([
            'role' => 'admin',
            'status' => User::STATUS_APPROVED,
        ]);
    }

    public function test_admin_can_update_webhook_settings(): void
    {
        $response = $this->actingAs($this->adminUser)
            ->post(route('settings.webhook.update'), [
                'enabled' => true,
                'type' => 'discord',
                'url' => 'https://discord.com/api/webhooks/test/sample',
                'events' => ['ticket_created', 'user_registered'],
            ]);

        $response->assertRedirect();
        $this->assertTrue(SystemSetting::get('webhook_enabled'));
        $this->assertEquals('discord', SystemSetting::get('webhook_type'));
        $this->assertEquals('https://discord.com/api/webhooks/test/sample', SystemSetting::get('webhook_url'));
    }

    public function test_admin_can_test_webhook_connection(): void
    {
        Http::fake([
            'discord.com/*' => Http::response(['status' => 'ok'], 200),
        ]);

        $response = $this->actingAs($this->adminUser)
            ->postJson(route('settings.webhook.test'), [
                'type' => 'discord',
                'url' => 'https://discord.com/api/webhooks/test/sample',
            ]);

        $response->assertOk()
            ->assertJsonPath('success', true);
    }

    public function test_webhook_notifies_on_new_support_ticket_submission(): void
    {
        Http::fake([
            '*' => Http::response(['status' => 'ok'], 200),
        ]);

        SystemSetting::set('webhook_enabled', true, 'boolean');
        SystemSetting::set('webhook_type', 'discord');
        SystemSetting::set('webhook_url', 'https://discord.com/api/webhooks/test/ticket');
        SystemSetting::set('webhook_events', ['ticket_created'], 'json');

        $response = $this->post(route('support.submit'), [
            'name' => 'Dr. Bambang',
            'email' => 'bambang@research.id',
            'category' => 'partnership',
            'priority' => 'high',
            'subject' => 'Kolaborasi Riset IoT Sensor',
            'message' => 'Kami berminat menjalin kemitraan riset smart agriculture dengan STAS RG.',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('support_tickets', [
            'email' => 'bambang@research.id',
        ]);

        Http::assertSent(function ($request) {
            return str_contains($request->url(), 'discord.com');
        });
    }

    public function test_admin_can_view_annual_research_digest(): void
    {
        Project::factory()->create([
            'user_id' => $this->adminUser->id,
            'name' => 'Smart IoT Greenhouse',
            'title' => 'Sistem Pemantauan Greenhouse Cerdas Berbasis IoT',
            'status' => 'published',
            'created_at' => now(),
        ]);

        $response = $this->actingAs($this->adminUser)
            ->get(route('projects.annual-digest', ['year' => now()->year]));

        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Projects/AnnualDigest')
                ->has('projects', 1)
                ->has('stats')
            );
    }

    public function test_analytics_returns_project_qr_breakdown_and_day_of_week(): void
    {
        $project = Project::factory()->create([
            'user_id' => $this->adminUser->id,
            'name' => 'Smart Farm AI',
            'status' => 'published',
        ]);

        ProjectAnalytic::create([
            'project_id' => $project->id,
            'event_type' => ProjectAnalytic::EVENT_QR_SCAN,
            'source' => 'qr',
            'ip_address' => '127.0.0.1',
            'device_type' => 'mobile',
            'created_at' => now(),
        ]);

        $response = $this->actingAs($this->adminUser)
            ->get(route('analytics.index'));

        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Analytics/Index')
                ->has('projects_qr_breakdown')
                ->has('day_of_week', 7)
            );
    }
}
