<?php

namespace Tests\Feature;

use App\Models\ModelVersion;
use App\Models\Project;
use App\Models\ProjectTemplate;
use App\Models\User;
use App\Services\VersionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VersionHistoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_creating_project_creates_initial_version(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('projects.store'), [
            'name' => 'Inovasi Pertanian Cerdas STAS',
            'title' => 'Smart Precision Agriculture System',
            'category' => 'Smart Agriculture',
            'description' => 'Deskripsi inovasi riset STAS',
            'layout_preset' => 'balanced',
            'color_theme' => 'stas_official',
            'doc_format' => 'a4_flyer',
            'print_mode' => 'light',
        ]);

        $project = Project::where('name', 'Inovasi Pertanian Cerdas STAS')->first();
        $this->assertNotNull($project);
        $response->assertRedirect(route('projects.show', $project));

        $this->assertDatabaseHas('model_versions', [
            'versionable_type' => Project::class,
            'versionable_id' => $project->id,
            'version_number' => 1,
            'event' => ModelVersion::EVENT_CREATED,
        ]);

        $this->assertEquals(1, $project->versions()->count());
    }

    public function test_updating_project_creates_version_with_diff(): void
    {
        $user = User::factory()->create();

        $project = Project::factory()->create([
            'user_id' => $user->id,
            'name' => 'Proyek Awal',
            'title' => 'Judul Awal',
            'color_theme' => 'stas_official',
        ]);

        // Record initial version
        app(VersionService::class)->recordVersion($project, $user, ModelVersion::EVENT_CREATED);

        // Update project via controller
        $response = $this->actingAs($user)->put(route('projects.update', $project), [
            'name' => 'Proyek Diperbarui',
            'title' => 'Judul Diperbarui',
            'category' => 'Internet of Things (IoT)',
            'color_theme' => 'ocean_tech',
            'layout_preset' => 'balanced',
            'doc_format' => 'a4_flyer',
            'print_mode' => 'light',
        ]);

        $project->refresh();
        $response->assertRedirect(route('projects.show', $project));

        $this->assertEquals('Proyek Diperbarui', $project->name);
        $this->assertEquals('Judul Diperbarui', $project->title);

        $this->assertEquals(2, $project->versions()->count());

        $latestVersion = $project->latestVersion();
        $this->assertNotNull($latestVersion);
        $this->assertEquals(2, $latestVersion->version_number);
        $this->assertEquals(ModelVersion::EVENT_UPDATED, $latestVersion->event);
        $this->assertArrayHasKey('title', $latestVersion->changes ?? []);
        $this->assertEquals('Judul Awal', $latestVersion->changes['title']['old']);
        $this->assertEquals('Judul Diperbarui', $latestVersion->changes['title']['new']);
    }

    public function test_project_rollback_restores_data_and_records_new_version(): void
    {
        $user = User::factory()->create();

        $project = Project::factory()->create([
            'user_id' => $user->id,
            'name' => 'Versi Asli',
            'title' => 'Judul Asli v1',
            'color_theme' => 'stas_official',
        ]);

        $version1 = app(VersionService::class)->recordVersion($project, $user, ModelVersion::EVENT_CREATED);

        // Update to v2
        $project->update([
            'name' => 'Versi Kedua',
            'title' => 'Judul Baru v2',
            'color_theme' => 'crimson_innovation',
        ]);
        app(VersionService::class)->recordVersion($project, $user, ModelVersion::EVENT_UPDATED);

        $this->assertEquals('Judul Baru v2', $project->title);
        $this->assertEquals(2, $project->versions()->count());

        // Perform rollback to version 1 via route
        $response = $this->actingAs($user)->post(route('projects.versions.rollback', [
            'project' => $project->slug,
            'version' => $version1->id,
        ]));

        $response->assertRedirect();
        $project->refresh();

        // Project title should be restored to v1 value
        $this->assertEquals('Judul Asli v1', $project->title);
        $this->assertEquals('stas_official', $project->color_theme);

        // Total versions should now be 3 (v1, v2, and v3 which is the rollback event)
        $this->assertEquals(3, $project->versions()->count());

        $rollbackVersion = $project->latestVersion();
        $this->assertEquals(3, $rollbackVersion->version_number);
        $this->assertEquals(ModelVersion::EVENT_ROLLBACK, $rollbackVersion->event);
        $this->assertStringContainsString('Rollback ke Versi v1', $rollbackVersion->summary);
    }

    public function test_project_versions_api_returns_correct_json_list(): void
    {
        $user = User::factory()->create();

        $project = Project::factory()->create([
            'user_id' => $user->id,
            'name' => 'Proyek Test API',
            'title' => 'Judul Test API',
        ]);

        app(VersionService::class)->recordVersion($project, $user, ModelVersion::EVENT_CREATED);

        $response = $this->actingAs($user)->getJson(route('projects.versions.index', $project));

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'current_version',
                'versions' => [
                    '*' => [
                        'id',
                        'version_number',
                        'event',
                        'summary',
                        'snapshot',
                        'created_at_formatted',
                    ],
                ],
            ]);
    }

    public function test_template_version_creation_and_rollback(): void
    {
        $user = User::factory()->create();

        $template = ProjectTemplate::create([
            'user_id' => $user->id,
            'name' => 'Template Riset Awal',
            'category' => 'General',
            'design_style' => 'classic_standard',
            'doc_format' => 'a4_flyer',
            'layout_preset' => 'balanced',
            'color_theme' => 'stas_official',
            'print_mode' => 'light',
            'is_system' => false,
            'default_data' => ['title' => 'Judul Default Template v1'],
        ]);

        $v1 = app(VersionService::class)->recordVersion($template, $user, ModelVersion::EVENT_CREATED);

        // Update template
        $this->actingAs($user)->put(route('templates.update', $template), [
            'name' => 'Template Riset Diperbarui',
            'category' => 'Smart Agriculture',
            'design_style' => 'infographic_cards',
            'doc_format' => 'a4_flyer',
            'layout_preset' => 'visual_heavy',
            'color_theme' => 'ocean_tech',
            'print_mode' => 'light',
            'default_data' => ['title' => 'Judul Default Template v2'],
        ]);

        $template->refresh();
        $this->assertEquals('Template Riset Diperbarui', $template->name);
        $this->assertEquals('ocean_tech', $template->color_theme);
        $this->assertEquals(2, $template->versions()->count());

        // Rollback template to v1
        $this->actingAs($user)->post(route('templates.versions.rollback', [
            'template' => $template->slug,
            'version' => $v1->id,
        ]));

        $template->refresh();
        $this->assertEquals('Template Riset Awal', $template->name);
        $this->assertEquals('stas_official', $template->color_theme);
        $this->assertEquals(3, $template->versions()->count());
    }

    public function test_unauthorized_user_cannot_access_or_rollback_project(): void
    {
        $owner = User::factory()->create();
        $project = Project::factory()->create([
            'user_id' => $owner->id,
            'name' => 'Proyek Rahasia Owner',
        ]);

        $v1 = app(VersionService::class)->recordVersion($project, $owner, ModelVersion::EVENT_CREATED);

        // Guest / unauthenticated request
        $response = $this->getJson(route('projects.versions.index', $project));
        $response->assertUnauthorized();

        $rollbackResponse = $this->post(route('projects.versions.rollback', [
            'project' => $project->slug,
            'version' => $v1->id,
        ]));
        $rollbackResponse->assertRedirect('/login');
    }
}
