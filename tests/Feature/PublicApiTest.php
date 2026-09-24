<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\Researcher;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PublicApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create([
            'status' => User::STATUS_APPROVED,
        ]);
    }

    public function test_guest_can_access_api_documentation_page(): void
    {
        $response = $this->get('/api-docs');
        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('ApiDocumentation')
            ->has('stats')
            ->has('baseUrl')
        );
    }

    public function test_api_v1_projects_returns_paginated_published_projects(): void
    {
        Project::factory()->create([
            'user_id' => $this->user->id,
            'name' => 'Published Project 1',
            'slug' => 'published-project-1',
            'status' => 'published',
            'category' => 'Smart Agriculture',
        ]);

        Project::factory()->create([
            'user_id' => $this->user->id,
            'name' => 'Draft Project Private',
            'slug' => 'draft-project-private',
            'status' => 'draft',
        ]);

        $response = $this->getJson('/api/v1/projects');

        $response->assertOk()
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', 'published-project-1');
    }

    public function test_api_v1_project_detail_returns_correct_data_or_404(): void
    {
        $project = Project::factory()->create([
            'user_id' => $this->user->id,
            'name' => 'AI Precision Drone',
            'slug' => 'ai-precision-drone',
            'status' => 'published',
            'category' => 'Aerospace',
            'benefits' => ['Long battery life', 'Realtime AI inference'],
        ]);

        $response = $this->getJson('/api/v1/projects/ai-precision-drone');

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'data' => [
                    'slug' => 'ai-precision-drone',
                    'category' => 'Aerospace',
                ],
            ]);

        $notFoundResponse = $this->getJson('/api/v1/projects/non-existent-slug');
        $notFoundResponse->assertNotFound()
            ->assertJson([
                'success' => false,
                'error_code' => 'PROJECT_NOT_FOUND',
            ]);
    }

    public function test_api_v1_categories_returns_categories_with_count(): void
    {
        Project::factory()->create([
            'user_id' => $this->user->id,
            'status' => 'published',
            'category' => 'IoT Systems',
        ]);

        Project::factory()->create([
            'user_id' => $this->user->id,
            'status' => 'published',
            'category' => 'IoT Systems',
        ]);

        $response = $this->getJson('/api/v1/categories');

        $response->assertOk()
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonFragment([
                'name' => 'IoT Systems',
                'projects_count' => 2,
            ]);
    }

    public function test_api_v1_researchers_returns_active_researchers(): void
    {
        $researcher = Researcher::create([
            'name' => 'Prof. Ir. Hendra',
            'role' => 'Principal Investigator',
            'identifier' => '0412345678',
            'is_active' => true,
            'lab_affiliation' => 'Robotics Lab',
            'created_by' => $this->user->id,
        ]);

        Researcher::create([
            'name' => 'Inactive Researcher',
            'role' => 'Member',
            'identifier' => '0487654321',
            'is_active' => false,
            'created_by' => $this->user->id,
        ]);

        $response = $this->getJson('/api/v1/researchers');

        $response->assertOk()
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Prof. Ir. Hendra');

        $detailResponse = $this->getJson("/api/v1/researchers/{$researcher->id}");
        $detailResponse->assertOk()
            ->assertJsonPath('data.name', 'Prof. Ir. Hendra');
    }

    public function test_api_v1_stats_and_openapi_endpoints_work(): void
    {
        $statsResponse = $this->getJson('/api/v1/stats');
        $statsResponse->assertOk()
            ->assertJsonStructure([
                'success',
                'data' => [
                    'total_published_projects',
                    'total_draft_projects',
                    'total_active_researchers',
                    'total_categories',
                ],
            ]);

        $openapiResponse = $this->getJson('/api/v1/openapi.json');
        $openapiResponse->assertOk()
            ->assertJsonPath('openapi', '3.0.0');
    }
}
