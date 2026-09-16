<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PublicCatalogTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'email' => 'admin@stasrg.com',
            'role' => 'admin',
            'status' => User::STATUS_APPROVED,
        ]);
    }

    public function test_guest_can_access_catalog_page_without_auth(): void
    {
        $response = $this->get('/katalog');
        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Public/Catalog')
            ->has('projects')
            ->has('facets')
            ->has('stats')
            ->has('filters')
        );

        $responseCatalog = $this->get('/catalog');
        $responseCatalog->assertOk();
    }

    public function test_catalog_only_displays_published_projects(): void
    {
        $published1 = Project::factory()->create([
            'user_id' => $this->admin->id,
            'name' => 'Smart Poultry Monitoring IoT',
            'title' => 'SMART POULTRY IOT',
            'status' => 'published',
            'category' => 'Smart Agriculture',
        ]);

        $published2 = Project::factory()->create([
            'user_id' => $this->admin->id,
            'name' => 'Solar Telemetry Harvester',
            'title' => 'SOLAR TELEMETRY HARVESTER',
            'status' => 'published',
            'category' => 'Renewable Energy',
        ]);

        $draft = Project::factory()->create([
            'user_id' => $this->admin->id,
            'name' => 'Secret Defense Drone Project',
            'title' => 'DEFENSE DRONE',
            'status' => 'draft',
            'category' => 'Aviation & AI',
        ]);

        $response = $this->get('/katalog');

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Public/Catalog')
            ->has('projects', 2)
            ->where('projects.0.id', $published2->id) // latest first
            ->where('projects.1.id', $published1->id)
            ->where('stats.total_projects', 2)
        );
    }

    public function test_catalog_extracts_facets_and_stats_accurately(): void
    {
        Project::factory()->create([
            'user_id' => $this->admin->id,
            'name' => 'Aquaculture Telemetry Automation',
            'title' => 'AQUACULTURE IOT',
            'category' => 'Smart Agriculture',
            'patent_number' => 'IDS000012345',
            'publication_doi' => '10.1109/ACCESS.2026.123456',
            'research_team' => [
                ['name' => 'Dr. Fatin Tsani', 'role' => 'Principal Investigator', 'lab_affiliation' => 'STAS-RG'],
                ['name' => 'Ahmad Fauzi, M.T.', 'role' => 'Hardware Specialist', 'lab_affiliation' => 'STAS-RG'],
            ],
            'status' => 'published',
            'created_at' => now()->setYear(2026),
        ]);

        Project::factory()->create([
            'user_id' => $this->admin->id,
            'name' => 'Satellite Mesh LoRaWAN',
            'title' => 'SATELLITE LORAWAN',
            'category' => 'Telecommunication',
            'patent_number' => null,
            'publication_doi' => '10.1109/TELKOM.2025.987654',
            'research_team' => [
                ['name' => 'Dr. Fatin Tsani', 'role' => 'Lead Researcher', 'lab_affiliation' => 'STAS-RG'],
            ],
            'status' => 'published',
            'created_at' => now()->setYear(2025),
        ]);

        $response = $this->get('/katalog');

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Public/Catalog')
            ->has('projects', 2)
            ->where('stats.total_projects', 2)
            ->where('stats.total_patents', 1)
            ->where('stats.total_publications', 2)
            ->where('stats.total_categories', 2)
            ->where('stats.total_researchers', 2)
            ->has('facets.categories', 2)
            ->has('facets.years', 2)
            ->has('facets.researchers', 2)
        );
    }

    public function test_catalog_accepts_and_passes_filter_query_params(): void
    {
        $response = $this->get('/katalog?q=Poultry&category=Smart%20Agriculture&year=2026&researcher=Dr.%20Fatin&has_patent=1&has_doi=1&sort=title_asc&view=list');

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Public/Catalog')
            ->where('filters.q', 'Poultry')
            ->where('filters.category', 'Smart Agriculture')
            ->where('filters.year', '2026')
            ->where('filters.researcher', 'Dr. Fatin')
            ->where('filters.has_patent', true)
            ->where('filters.has_doi', true)
            ->where('filters.sort', 'title_asc')
            ->where('filters.view', 'list')
        );
    }
}
