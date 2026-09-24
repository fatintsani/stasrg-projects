<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Researcher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class PublicApiController extends Controller
{
    /**
     * Render the Interactive Public API Documentation Page.
     */
    public function documentation(): InertiaResponse
    {
        $stats = Cache::remember('public_api_docs_stats', 300, function () {
            $totalProjects = Schema::hasTable('projects') ? Project::where('status', 'published')->count() : 0;
            $totalResearchers = Schema::hasTable('researchers') ? Researcher::where('is_active', true)->count() : 0;
            $categoriesCount = Schema::hasTable('projects')
                ? Project::where('status', 'published')->distinct('category')->whereNotNull('category')->where('category', '!=', '')->count('category')
                : 0;

            return [
                'total_projects' => $totalProjects,
                'total_researchers' => $totalResearchers,
                'categories_count' => $categoriesCount,
                'api_version' => 'v1.0.0',
            ];
        });

        return Inertia::render('ApiDocumentation', [
            'stats' => $stats,
            'baseUrl' => url('/api/v1'),
        ]);
    }

    /**
     * List all published research projects with search, filter, sorting, and pagination.
     */
    public function indexProjects(Request $request): JsonResponse
    {
        $search = trim((string) $request->query('search', ''));
        $category = trim((string) $request->query('category', ''));
        $sort = (string) $request->query('sort', 'latest');
        $format = (string) $request->query('format', '');
        $perPage = min(max((int) $request->query('per_page', 10), 1), 50);

        $query = Project::query()->where('status', 'published');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('title', 'like', "%{$search}%")
                    ->orWhere('subtitle', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%")
                    ->orWhere('lab_affiliation', 'like', "%{$search}%")
                    ->orWhere('patent_number', 'like', "%{$search}%");
            });
        }

        if ($category !== '' && strtolower($category) !== 'all' && strtolower($category) !== 'semua') {
            $query->where('category', $category);
        }

        if ($format !== '') {
            $query->where('doc_format', $format);
        }

        switch ($sort) {
            case 'oldest':
                $query->oldest();
                break;
            case 'alphabetical':
            case 'title_asc':
                $query->orderBy('name', 'asc');
                break;
            case 'title_desc':
                $query->orderBy('name', 'desc');
                break;
            case 'latest':
            default:
                $query->latest();
                break;
        }

        $paginator = $query->paginate($perPage);

        $projects = collect($paginator->items())->map(function (Project $project) {
            return $this->formatProjectSummary($project);
        });

        return response()->json([
            'success' => true,
            'message' => 'Published research projects retrieved successfully.',
            'data' => $projects,
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'from' => $paginator->firstItem(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'to' => $paginator->lastItem(),
                'total' => $paginator->total(),
            ],
            'links' => [
                'first' => $paginator->url(1),
                'last' => $paginator->url($paginator->lastPage()),
                'prev' => $paginator->previousPageUrl(),
                'next' => $paginator->nextPageUrl(),
            ],
        ], 200, [], JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    }

    /**
     * Retrieve full details of a specific published project by slug.
     */
    public function showProject(string $slug): JsonResponse
    {
        $project = Project::where('slug', $slug)
            ->where('status', 'published')
            ->first();

        if (! $project) {
            return response()->json([
                'success' => false,
                'message' => "Published research project with slug '{$slug}' not found.",
                'error_code' => 'PROJECT_NOT_FOUND',
            ], 404, [], JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
        }

        // Fetch related projects in the same category
        $related = Project::where('category', $project->category)
            ->where('id', '!=', $project->id)
            ->where('status', 'published')
            ->latest()
            ->take(3)
            ->get()
            ->map(fn (Project $p) => $this->formatProjectSummary($p));

        return response()->json([
            'success' => true,
            'message' => 'Project detail retrieved successfully.',
            'data' => $this->formatProjectDetail($project),
            'related' => $related,
        ], 200, [], JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    }

    /**
     * Retrieve list of all research domain categories with count of published projects.
     */
    public function indexCategories(): JsonResponse
    {
        $categories = Cache::remember('public_api_categories', 180, function () {
            return Project::where('status', 'published')
                ->whereNotNull('category')
                ->where('category', '!=', '')
                ->selectRaw('category, COUNT(*) as projects_count, MAX(updated_at) as last_updated_at')
                ->groupBy('category')
                ->orderByDesc('projects_count')
                ->get()
                ->map(function ($row) {
                    return [
                        'name' => $row->category,
                        'projects_count' => (int) $row->projects_count,
                        'last_updated_at' => $row->last_updated_at,
                    ];
                });
        });

        return response()->json([
            'success' => true,
            'message' => 'Research categories retrieved successfully.',
            'total' => $categories->count(),
            'data' => $categories,
        ], 200, [], JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    }

    /**
     * Retrieve active researchers list.
     */
    public function indexResearchers(Request $request): JsonResponse
    {
        $search = trim((string) $request->query('search', ''));
        $lab = trim((string) $request->query('lab', ''));
        $perPage = min(max((int) $request->query('per_page', 12), 1), 50);

        $query = Researcher::query()->where('is_active', true);

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('role', 'like', "%{$search}%")
                    ->orWhere('identifier', 'like', "%{$search}%")
                    ->orWhere('lab_affiliation', 'like', "%{$search}%")
                    ->orWhere('bio', 'like', "%{$search}%");
            });
        }

        if ($lab !== '') {
            $query->where('lab_affiliation', $lab);
        }

        $paginator = $query->orderBy('name')->paginate($perPage);

        $researchers = collect($paginator->items())->map(function (Researcher $researcher) {
            return $this->formatResearcherSummary($researcher);
        });

        return response()->json([
            'success' => true,
            'message' => 'Active researchers retrieved successfully.',
            'data' => $researchers,
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'from' => $paginator->firstItem(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'to' => $paginator->lastItem(),
                'total' => $paginator->total(),
            ],
            'links' => [
                'first' => $paginator->url(1),
                'last' => $paginator->url($paginator->lastPage()),
                'prev' => $paginator->previousPageUrl(),
                'next' => $paginator->nextPageUrl(),
            ],
        ], 200, [], JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    }

    /**
     * Retrieve single researcher profile.
     */
    public function showResearcher(int $id): JsonResponse
    {
        $researcher = Researcher::where('id', $id)
            ->where('is_active', true)
            ->first();

        if (! $researcher) {
            return response()->json([
                'success' => false,
                'message' => "Researcher with ID '{$id}' not found.",
                'error_code' => 'RESEARCHER_NOT_FOUND',
            ], 404, [], JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
        }

        return response()->json([
            'success' => true,
            'message' => 'Researcher profile retrieved successfully.',
            'data' => $this->formatResearcherDetail($researcher),
        ], 200, [], JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    }

    /**
     * Public high-level research statistics.
     */
    public function getStats(): JsonResponse
    {
        $stats = Cache::remember('public_api_global_stats', 300, function () {
            $totalPublished = Project::where('status', 'published')->count();
            $totalDraft = Project::where('status', 'draft')->count();
            $totalResearchers = Researcher::where('is_active', true)->count();
            $categoriesCount = Project::where('status', 'published')
                ->distinct('category')
                ->whereNotNull('category')
                ->where('category', '!=', '')
                ->count('category');

            $formatDistribution = Project::where('status', 'published')
                ->selectRaw('doc_format, COUNT(*) as count')
                ->groupBy('doc_format')
                ->pluck('count', 'doc_format')
                ->all();

            $topCategories = Project::where('status', 'published')
                ->whereNotNull('category')
                ->where('category', '!=', '')
                ->selectRaw('category, COUNT(*) as count')
                ->groupBy('category')
                ->orderByDesc('count')
                ->take(5)
                ->pluck('count', 'category')
                ->all();

            return [
                'total_published_projects' => $totalPublished,
                'total_draft_projects' => $totalDraft,
                'total_active_researchers' => $totalResearchers,
                'total_categories' => $categoriesCount,
                'format_distribution' => $formatDistribution,
                'top_categories' => $topCategories,
                'lab' => 'Center of Excellence STAS-RG Telkom University',
                'server_time' => now()->toIso8601String(),
            ];
        });

        return response()->json([
            'success' => true,
            'message' => 'Global research repository statistics retrieved successfully.',
            'data' => $stats,
        ], 200, [], JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    }

    /**
     * OpenAPI 3.0.0 Specification for STAS RG Public REST API.
     */
    public function getOpenApiSpec(): JsonResponse
    {
        $spec = [
            'openapi' => '3.0.0',
            'info' => [
                'title' => 'CoE STAS-RG Public Research REST API',
                'description' => 'Open programmatic API for accessing published research projects, innovation repositories, academic documents, and researcher directories of CoE STAS-RG Telkom University.',
                'version' => '1.0.0',
                'contact' => [
                    'name' => 'CoE STAS-RG Technical Support',
                    'email' => 'stas.research@telkomuniversity.ac.id',
                    'url' => url('/'),
                ],
            ],
            'servers' => [
                [
                    'url' => url('/api/v1'),
                    'description' => 'Production API Endpoint',
                ],
            ],
            'paths' => [
                '/projects' => [
                    'get' => [
                        'summary' => 'List Published Research Projects',
                        'description' => 'Retrieves a paginated list of published innovations with optional keyword search and category filtering.',
                        'parameters' => [
                            ['name' => 'search', 'in' => 'query', 'required' => false, 'schema' => ['type' => 'string'], 'description' => 'Keyword search across titles, descriptions, and categories.'],
                            ['name' => 'category', 'in' => 'query', 'required' => false, 'schema' => ['type' => 'string'], 'description' => 'Filter by specific domain category.'],
                            ['name' => 'sort', 'in' => 'query', 'required' => false, 'schema' => ['type' => 'string', 'enum' => ['latest', 'oldest', 'alphabetical']], 'description' => 'Sort order.'],
                            ['name' => 'page', 'in' => 'query', 'required' => false, 'schema' => ['type' => 'integer', 'default' => 1], 'description' => 'Page number.'],
                            ['name' => 'per_page', 'in' => 'query', 'required' => false, 'schema' => ['type' => 'integer', 'default' => 10, 'maximum' => 50], 'description' => 'Number of items per page.'],
                        ],
                        'responses' => [
                            '200' => ['description' => 'Projects list returned successfully.'],
                        ],
                    ],
                ],
                '/projects/{slug}' => [
                    'get' => [
                        'summary' => 'Get Published Project Detail',
                        'description' => 'Retrieve full project attributes, technical specifications, benefits, partner logos, and related research.',
                        'parameters' => [
                            ['name' => 'slug', 'in' => 'path', 'required' => true, 'schema' => ['type' => 'string'], 'description' => 'Unique project slug identifier.'],
                        ],
                        'responses' => [
                            '200' => ['description' => 'Project detail returned successfully.'],
                            '404' => ['description' => 'Project not found.'],
                        ],
                    ],
                ],
                '/categories' => [
                    'get' => [
                        'summary' => 'List Research Categories',
                        'description' => 'List all domain categories along with count of published projects.',
                        'responses' => [
                            '200' => ['description' => 'Categories returned successfully.'],
                        ],
                    ],
                ],
                '/researchers' => [
                    'get' => [
                        'summary' => 'List Active Researchers',
                        'description' => 'List public researchers, PIs, lab affiliations, and academic profile links.',
                        'parameters' => [
                            ['name' => 'search', 'in' => 'query', 'required' => false, 'schema' => ['type' => 'string']],
                            ['name' => 'lab', 'in' => 'query', 'required' => false, 'schema' => ['type' => 'string']],
                            ['name' => 'page', 'in' => 'query', 'required' => false, 'schema' => ['type' => 'integer']],
                            ['name' => 'per_page', 'in' => 'query', 'required' => false, 'schema' => ['type' => 'integer']],
                        ],
                        'responses' => [
                            '200' => ['description' => 'Researchers returned successfully.'],
                        ],
                    ],
                ],
                '/researchers/{id}' => [
                    'get' => [
                        'summary' => 'Get Researcher Detail',
                        'description' => 'Retrieve researcher biography, identifier, academic profiles, and expertise.',
                        'parameters' => [
                            ['name' => 'id', 'in' => 'path', 'required' => true, 'schema' => ['type' => 'integer']],
                        ],
                        'responses' => [
                            '200' => ['description' => 'Researcher profile returned successfully.'],
                            '404' => ['description' => 'Researcher not found.'],
                        ],
                    ],
                ],
                '/stats' => [
                    'get' => [
                        'summary' => 'Global Research Statistics',
                        'description' => 'Retrieve aggregate counts of published projects, active researchers, and domain categories.',
                        'responses' => [
                            '200' => ['description' => 'Statistics returned successfully.'],
                        ],
                    ],
                ],
            ],
        ];

        return response()->json($spec, 200, [], JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    }

    /**
     * Format a project for summary listing.
     *
     * @return array<string, mixed>
     */
    private function formatProjectSummary(Project $project): array
    {
        return [
            'id' => $project->id,
            'name' => $project->name,
            'slug' => $project->slug,
            'title' => $project->title,
            'subtitle' => $project->subtitle,
            'category' => $project->category ?? 'General',
            'doc_format' => $project->doc_format ?? 'a4_flyer',
            'layout_preset' => $project->layout_preset ?? 'balanced',
            'main_image_url' => $project->main_image ? asset('storage/'.$project->main_image) : null,
            'lab_affiliation' => $project->lab_affiliation,
            'patent_number' => $project->patent_number,
            'publication_doi' => $project->publication_doi,
            'showcase_url' => url('/showcase/'.$project->slug),
            'api_detail_url' => url('/api/v1/projects/'.$project->slug),
            'created_at' => $project->created_at?->toIso8601String(),
            'updated_at' => $project->updated_at?->toIso8601String(),
        ];
    }

    /**
     * Format a project for full detailed payload.
     *
     * @return array<string, mixed>
     */
    private function formatProjectDetail(Project $project): array
    {
        $partnerLogos = ! empty($project->partner_logos) && is_array($project->partner_logos)
            ? array_map(fn ($p) => str_starts_with($p, 'http') ? $p : asset('storage/'.$p), $project->partner_logos)
            : ($project->partner_logo ? [asset('storage/'.$project->partner_logo)] : []);

        return [
            'id' => $project->id,
            'name' => $project->name,
            'slug' => $project->slug,
            'title' => $project->title,
            'subtitle' => $project->subtitle,
            'category' => $project->category ?? 'General',
            'description' => $project->description,
            'doc_format' => $project->doc_format ?? 'a4_flyer',
            'layout_preset' => $project->layout_preset ?? 'balanced',
            'design_style' => $project->design_style ?? 'academic',
            'color_theme' => $project->color_theme ?? 'default',
            'main_image_url' => $project->main_image ? asset('storage/'.$project->main_image) : null,
            'benefits' => $project->benefits ?? [],
            'specifications' => $project->specifications ?? [],
            'problem_solution' => $project->problem_solution ?? [],
            'research_team' => $project->research_team ?? [],
            'lab_affiliation' => $project->lab_affiliation,
            'patent_number' => $project->patent_number,
            'publication_doi' => $project->publication_doi,
            'project_url' => $project->project_url,
            'qr_code_url' => $project->qr_code_path ? asset('storage/'.$project->qr_code_path) : null,
            'qr_tracking_url' => url('/qr/'.$project->slug),
            'partner_logos' => $partnerLogos,
            'social_links' => [
                'website' => $project->footer_website,
                'instagram' => $project->footer_instagram,
                'youtube' => $project->footer_youtube,
            ],
            'content_en' => $project->content_en ?? null,
            'showcase_url' => url('/showcase/'.$project->slug),
            'created_at' => $project->created_at?->toIso8601String(),
            'updated_at' => $project->updated_at?->toIso8601String(),
        ];
    }

    /**
     * Format researcher summary.
     *
     * @return array<string, mixed>
     */
    private function formatResearcherSummary(Researcher $researcher): array
    {
        return [
            'id' => $researcher->id,
            'name' => $researcher->name,
            'role' => $researcher->role,
            'identifier' => $researcher->identifier,
            'lab_affiliation' => $researcher->lab_affiliation,
            'email' => $researcher->email,
            'avatar_url' => $researcher->avatar_url,
            'expertise' => $researcher->expertise ?? [],
            'api_detail_url' => url('/api/v1/researchers/'.$researcher->id),
        ];
    }

    /**
     * Format researcher detail payload.
     *
     * @return array<string, mixed>
     */
    private function formatResearcherDetail(Researcher $researcher): array
    {
        return [
            'id' => $researcher->id,
            'name' => $researcher->name,
            'role' => $researcher->role,
            'identifier' => $researcher->identifier,
            'lab_affiliation' => $researcher->lab_affiliation,
            'email' => $researcher->email,
            'bio' => $researcher->bio,
            'avatar_url' => $researcher->avatar_url,
            'expertise' => $researcher->expertise ?? [],
            'academic_profiles' => [
                'google_scholar' => $researcher->scholar_url,
                'scopus' => $researcher->scopus_url,
                'sinta' => $researcher->sinta_url,
                'orcid' => $researcher->orcid_url,
                'linkedin' => $researcher->linkedin_url,
            ],
            'usage_count' => $researcher->usage_count,
            'created_at' => $researcher->created_at?->toIso8601String(),
            'updated_at' => $researcher->updated_at?->toIso8601String(),
        ];
    }
}
