<?php

namespace App\Http\Controllers;

use App\Mail\ProjectNotificationMail;
use App\Models\ModelVersion;
use App\Models\Project;
use App\Models\ProjectTemplate;
use App\Services\ActivityLogger;
use App\Services\AiAssistantService;
use App\Services\AnalyticsTracker;
use App\Services\HtmlSanitizer;
use App\Services\VersionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class ProjectController extends Controller
{
    /**
     * Display listing of all projects with search, status/category filters, and sorting.
     */
    public function index(Request $request): Response
    {
        $query = $request->user()->projects();

        if ($request->filled('search')) {
            $search = trim($request->input('search'));
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('title', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%")
                    ->orWhere('subtitle', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('category') && $request->input('category') !== 'all') {
            $query->where('category', $request->input('category'));
        }

        $sort = $request->input('sort', 'updated_at');
        $direction = strtolower($request->input('direction', 'desc')) === 'asc' ? 'asc' : 'desc';

        $allowedSorts = ['name', 'title', 'category', 'status', 'created_at', 'updated_at'];
        if (in_array($sort, $allowedSorts, true)) {
            $query->orderBy($sort, $direction);
        } else {
            $query->latest('updated_at');
        }

        $perPage = (int) $request->input('per_page', 12);
        if ($perPage < 1 || $perPage > 100) {
            $perPage = 12;
        }

        $projects = $query->paginate($perPage)->withQueryString();

        return Inertia::render('Admin/Projects/Index', [
            'projects' => $projects,
            'categories' => $this->getAvailableCategories(),
            'filters' => [
                'search' => $request->input('search', ''),
                'status' => $request->input('status', 'all'),
                'category' => $request->input('category', 'all'),
                'sort' => $sort,
                'direction' => $direction,
                'per_page' => $perPage,
            ],
        ]);
    }

    /**
     * Show form for creating a new project.
     */
    public function create(Request $request): Response
    {
        $templateData = null;
        $appliedTemplate = null;

        if ($request->filled('template')) {
            $templateIdentifier = $request->input('template');
            $appliedTemplate = ProjectTemplate::where('slug', $templateIdentifier)
                ->orWhere('id', $templateIdentifier)
                ->first();

            if ($appliedTemplate) {
                $appliedTemplate->incrementUsage();
                $defaultData = $appliedTemplate->default_data ?? [];
                $templateData = [
                    'name' => "Proyek Baru ({$appliedTemplate->name})",
                    'category' => $appliedTemplate->category,
                    'title' => $defaultData['title'] ?? '',
                    'subtitle' => $defaultData['subtitle'] ?? '',
                    'description' => $defaultData['description'] ?? '',
                    'benefits' => $defaultData['benefits'] ?? [],
                    'specifications' => $defaultData['specifications'] ?? [],
                    'problem_solution' => $defaultData['problem_solution'] ?? [],
                    'footer_website' => $defaultData['footer_website'] ?? 'www.stas-rg.com',
                    'footer_instagram' => $defaultData['footer_instagram'] ?? '@stas.rg',
                    'footer_youtube' => $defaultData['footer_youtube'] ?? '@stas_rg',
                    'social_links' => $defaultData['social_links'] ?? [],
                    'design_style' => $appliedTemplate->design_style ?? 'classic_standard',
                    'doc_format' => $appliedTemplate->doc_format ?? 'a4_flyer',
                    'layout_preset' => $appliedTemplate->layout_preset ?? 'balanced',
                    'color_theme' => $appliedTemplate->color_theme ?? 'stas_official',
                    'print_mode' => $appliedTemplate->print_mode ?? 'light',
                    'boilerplate_type' => $appliedTemplate->boilerplate_type ?? 'stas_default',
                    'lab_affiliation' => $appliedTemplate->lab_affiliation ?? ($defaultData['lab_affiliation'] ?? ''),
                    'patent_number' => $appliedTemplate->patent_number ?? ($defaultData['patent_number'] ?? ''),
                    'publication_doi' => $appliedTemplate->publication_doi ?? ($defaultData['publication_doi'] ?? ''),
                    'layout_schema' => $appliedTemplate->layout_schema ?? null,
                    'status' => 'draft',
                ];
            }
        }

        return Inertia::render('Admin/Projects/Form', [
            'project' => $templateData,
            'categories' => $this->getAvailableCategories(),
            'appliedTemplate' => $appliedTemplate,
        ]);
    }

    /**
     * Store a newly created project.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:255'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'main_image' => ['nullable', 'image', 'max:10240'],
            'benefits' => ['nullable', 'array'],
            'specifications' => ['nullable', 'array'],
            'problem_solution' => ['nullable', 'array'],
            'project_url' => ['nullable', 'string', 'max:255'],
            'footer_website' => ['nullable', 'string', 'max:255'],
            'footer_instagram' => ['nullable', 'string', 'max:255'],
            'footer_youtube' => ['nullable', 'string', 'max:255'],
            'social_links' => ['nullable', 'array'],
            'partner_logo' => ['nullable'],
            'partner_logos' => ['nullable'],
            'research_team' => ['nullable'],
            'lab_affiliation' => ['nullable', 'string', 'max:255'],
            'patent_number' => ['nullable', 'string', 'max:255'],
            'publication_doi' => ['nullable', 'string', 'max:255'],
            'footer_logo' => ['nullable', 'file', 'mimes:jpeg,png,jpg,svg,webp', 'max:5120'],
            'layout_preset' => ['nullable', 'string', 'in:balanced,visual_heavy,text_heavy'],
            'design_style' => ['nullable', 'string', 'in:classic_standard,modern_split,infographic_cards,minimal_grid,academic_brief,tech_blueprint,glass_minimalist'],
            'doc_format' => ['nullable', 'string', 'in:a4_flyer,brochure_trifold,roll_banner,factsheet_2col,pitch_poster,social_feed,social_story'],
            'color_theme' => ['nullable', 'string', 'in:stas_official,ocean_tech,crimson_innovation,slate_monochrome,cyber_teal,solar_amber,royal_purple,electric_azure,custom'],
            'print_mode' => ['nullable', 'string', 'in:light,dark'],
            'boilerplate_type' => ['nullable', 'string', 'max:255'],
            'layout_schema' => ['nullable', 'array'],
            'content_en' => ['nullable', 'array'],
            'status' => ['nullable', 'in:draft,published'],
        ]);

        if ($request->hasFile('main_image')) {
            $validated['main_image'] = $request->file('main_image')->store('projects/images', 'public');
        } else {
            unset($validated['main_image']);
        }

        $processedLogos = $this->processPartnerLogos($request);
        $validated['partner_logos'] = $processedLogos;
        $validated['partner_logo'] = $processedLogos[0] ?? null;
        $validated['research_team'] = $this->processResearchTeam($request);

        if ($request->hasFile('footer_logo')) {
            $validated['footer_logo'] = $request->file('footer_logo')->store('projects/logos', 'public');
        } else {
            unset($validated['footer_logo']);
        }

        // Generate QR code if URL is provided
        if (! empty($validated['project_url'])) {
            $url = $validated['project_url'];
            if (! preg_match('#^https?://#i', $url)) {
                $url = 'https://'.$url;
            }
            $validated['qr_code_path'] = $this->generateQrCode($url);
        }

        $validated['status'] = $validated['status'] ?? 'draft';
        $validated = $this->sanitizeProjectData($validated);

        // Handle A4 Trifold Brochure with 3 Independent Projects per Kotak
        if (($validated['doc_format'] ?? '') === 'brochure_trifold' && ! empty($validated['problem_solution']['panels']) && is_array($validated['problem_solution']['panels'])) {
            $panels = $validated['problem_solution']['panels'];
            $trifoldGroupId = uniqid('trifold_');

            $primaryProject = DB::transaction(function () use ($request, $validated, $panels, $trifoldGroupId) {
                $createdProjects = [];

                foreach ($panels as $idx => $p) {
                    $pTitle = ! empty($p['title']) ? trim($p['title']) : ($idx === 0 ? ($validated['title'] ?? 'Inovasi Riset Kotak 1') : 'Inovasi Kotak '.($idx + 1));
                    $pName = $pTitle;
                    $pSubtitle = $p['subtitle'] ?? '';
                    $pCategory = ! empty($p['category']) ? trim($p['category']) : ($idx === 0 ? ($validated['category'] ?? 'Smart Agriculture') : 'CoE STAS-RG');
                    $pDesc = $p['description'] ?? '';
                    $pProblem = $p['problem'] ?? '';
                    $pSolution = $p['solution'] ?? '';
                    $pBenefits = $p['benefits'] ?? '';
                    $pSpecs = $p['specifications'] ?? ($p['specs'] ?? '');
                    $pProjectUrl = $p['project_url'] ?? '';
                    $pImage = null;

                    if ($idx === 0 && isset($validated['main_image'])) {
                        $pImage = $validated['main_image'];
                    } elseif (! empty($p['image_url'])) {
                        if (str_starts_with($p['image_url'], 'data:image/')) {
                            $pImage = $this->storeBase64Image($p['image_url']);
                        } elseif (! str_starts_with($p['image_url'], 'http') && ! str_starts_with($p['image_url'], 'blob:')) {
                            $pImage = str_replace('/storage/', '', $p['image_url']);
                        }
                    }

                    $panelProjectData = [
                        'name' => $pName,
                        'title' => $pTitle,
                        'subtitle' => $pSubtitle,
                        'category' => $pCategory,
                        'description' => $pDesc,
                        'main_image' => $pImage,
                        'partner_logo' => $validated['partner_logo'] ?? null,
                        'partner_logos' => $validated['partner_logos'] ?? null,
                        'footer_logo' => $validated['footer_logo'] ?? null,
                        'benefits' => ['content' => $pBenefits],
                        'specifications' => ['content' => $pSpecs],
                        'problem_solution' => [
                            'problem' => $pProblem,
                            'solution' => $pSolution,
                            'trifold_group' => $trifoldGroupId,
                            'panel_index' => $idx,
                            'panels' => $panels,
                        ],
                        'project_url' => $pProjectUrl,
                        'footer_website' => $validated['footer_website'] ?? 'www.stas-rg.com',
                        'footer_instagram' => $validated['footer_instagram'] ?? '@stas.rg',
                        'footer_youtube' => $validated['footer_youtube'] ?? '@stas_rg',
                        'social_links' => $validated['social_links'] ?? [],
                        'layout_preset' => $validated['layout_preset'] ?? 'balanced',
                        'design_style' => $validated['design_style'] ?? 'classic_standard',
                        'doc_format' => 'brochure_trifold',
                        'color_theme' => $validated['color_theme'] ?? 'stas_official',
                        'print_mode' => $validated['print_mode'] ?? 'light',
                        'boilerplate_type' => $validated['boilerplate_type'] ?? null,
                        'status' => $validated['status'] ?? 'published',
                    ];

                    if (! empty($pProjectUrl)) {
                        $url = $pProjectUrl;
                        if (! preg_match('#^https?://#i', $url)) {
                            $url = 'https://'.$url;
                        }
                        $panelProjectData['qr_code_path'] = $this->generateQrCode($url);
                    }

                    $panelProjectData = $this->sanitizeProjectData($panelProjectData);
                    $newProj = $request->user()->projects()->create($panelProjectData);
                    $createdProjects[] = $newProj;

                    app(VersionService::class)->recordVersion(
                        model: $newProj,
                        user: $request->user(),
                        event: ModelVersion::EVENT_CREATED,
                        summary: 'Versi awal proyek brosur lipat dibuat'
                    );
                }

                return $createdProjects[0] ?? null;
            });

            ActivityLogger::logProject(
                action: 'project.created',
                description: "Membuat 3 proyek riset dari brosur lipat 3 (\"{$primaryProject->name}\")",
                project: $primaryProject,
                properties: [
                    'name' => $primaryProject->name,
                    'doc_format' => 'brochure_trifold',
                ],
                user: $request->user(),
                request: $request
            );

            return redirect()
                ->route('projects.show', $primaryProject)
                ->with('success', '3 Data Project Inovasi Brosur Lipat (Kotak 1, 2, dan 3) berhasil disimpan!');
        }

        $project = $request->user()->projects()->create($validated);

        app(VersionService::class)->recordVersion(
            model: $project,
            user: $request->user(),
            event: ModelVersion::EVENT_CREATED,
            summary: 'Versi awal proyek berhasil dibuat'
        );

        try {
            Mail::to($request->user()->email)->send(
                new ProjectNotificationMail($request->user(), $project, 'created')
            );
        } catch (\Throwable $e) {
            Log::warning('Failed to send project created email: '.$e->getMessage());
        }

        ActivityLogger::logProject(
            action: 'project.created',
            description: "Membuat proyek riset baru \"{$project->name}\"",
            project: $project,
            properties: [
                'name' => $project->name,
                'title' => $project->title,
                'category' => $project->category,
                'status' => $project->status,
                'layout_preset' => $project->layout_preset,
                'doc_format' => $project->doc_format,
                'color_theme' => $project->color_theme,
                'print_mode' => $project->print_mode,
            ],
            user: $request->user(),
            request: $request
        );

        return redirect()
            ->route('projects.show', $project)
            ->with('success', 'Project berhasil dibuat!');
    }

    /**
     * Display project preview.
     */
    public function show(Project $project): Response
    {
        $this->authorizeUserOwnsProject($project);

        return Inertia::render('Admin/Projects/Show', [
            'project' => $project,
        ]);
    }

    /**
     * Show form for editing an existing project.
     */
    public function edit(Project $project): Response
    {
        $this->authorizeUserOwnsProject($project);

        return Inertia::render('Admin/Projects/Form', [
            'project' => $project,
            'categories' => $this->getAvailableCategories(),
        ]);
    }

    /**
     * Update the specified project.
     */
    public function update(Request $request, Project $project): RedirectResponse
    {
        $this->authorizeUserOwnsProject($project);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:255'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'main_image' => ['nullable'],
            'benefits' => ['nullable', 'array'],
            'specifications' => ['nullable', 'array'],
            'problem_solution' => ['nullable', 'array'],
            'project_url' => ['nullable', 'string', 'max:255'],
            'footer_website' => ['nullable', 'string', 'max:255'],
            'footer_instagram' => ['nullable', 'string', 'max:255'],
            'footer_youtube' => ['nullable', 'string', 'max:255'],
            'social_links' => ['nullable', 'array'],
            'partner_logo' => ['nullable'],
            'partner_logos' => ['nullable'],
            'research_team' => ['nullable'],
            'lab_affiliation' => ['nullable', 'string', 'max:255'],
            'patent_number' => ['nullable', 'string', 'max:255'],
            'publication_doi' => ['nullable', 'string', 'max:255'],
            'footer_logo' => ['nullable'],
            'layout_preset' => ['nullable', 'string', 'in:balanced,visual_heavy,text_heavy'],
            'design_style' => ['nullable', 'string', 'in:classic_standard,modern_split,infographic_cards,minimal_grid,academic_brief,tech_blueprint,glass_minimalist'],
            'doc_format' => ['nullable', 'string', 'in:a4_flyer,brochure_trifold,roll_banner,factsheet_2col,pitch_poster,social_feed,social_story'],
            'color_theme' => ['nullable', 'string', 'in:stas_official,ocean_tech,crimson_innovation,slate_monochrome,cyber_teal,solar_amber,royal_purple,electric_azure,custom'],
            'print_mode' => ['nullable', 'string', 'in:light,dark'],
            'boilerplate_type' => ['nullable', 'string', 'max:255'],
            'layout_schema' => ['nullable', 'array'],
            'content_en' => ['nullable', 'array'],
            'status' => ['nullable', 'in:draft,published'],
        ]);

        if ($request->hasFile('main_image')) {
            $request->validate([
                'main_image' => ['image', 'max:10240'],
            ]);
            // Delete old image
            if ($project->main_image) {
                Storage::disk('public')->delete($project->main_image);
            }
            $validated['main_image'] = $request->file('main_image')->store('projects/images', 'public');
        } else {
            // Keep existing image if no new file is provided
            unset($validated['main_image']);
        }

        $existingLogos = $project->partner_logos ?: ($project->partner_logo ? [$project->partner_logo] : []);
        if ($request->boolean('remove_partner_logo')) {
            $validated['partner_logos'] = [];
            $validated['partner_logo'] = null;
        } else {
            $processedLogos = $this->processPartnerLogos($request, $existingLogos);
            $validated['partner_logos'] = $processedLogos;
            $validated['partner_logo'] = $processedLogos[0] ?? null;
        }

        $validated['research_team'] = $this->processResearchTeam($request, $project->research_team ?? []);

        if ($request->hasFile('footer_logo')) {
            $request->validate([
                'footer_logo' => ['image', 'max:2048'],
            ]);
            if ($project->footer_logo) {
                Storage::disk('public')->delete($project->footer_logo);
            }
            $validated['footer_logo'] = $request->file('footer_logo')->store('projects/logos', 'public');
        } else {
            // Keep existing footer logo if no new file is provided
            unset($validated['footer_logo']);
        }

        // Regenerate QR code if URL changed
        $newUrl = $validated['project_url'] ?? null;
        if (! empty($newUrl) && $newUrl !== $project->project_url) {
            if ($project->qr_code_path) {
                Storage::disk('public')->delete($project->qr_code_path);
            }
            $urlToEncode = ! preg_match('#^https?://#i', $newUrl) ? 'https://'.$newUrl : $newUrl;
            $validated['qr_code_path'] = $this->generateQrCode($urlToEncode);
        } elseif (empty($newUrl) && $project->qr_code_path) {
            Storage::disk('public')->delete($project->qr_code_path);
            $validated['qr_code_path'] = null;
        }

        $oldStatus = $project->status;
        $newStatus = $validated['status'] ?? $project->status;

        // Handle A4 Trifold Brochure with 3 Independent Projects per Kotak
        if (($validated['doc_format'] ?? '') === 'brochure_trifold' && ! empty($validated['problem_solution']['panels']) && is_array($validated['problem_solution']['panels'])) {
            $panels = $validated['problem_solution']['panels'];
            $trifoldGroupId = $project->problem_solution['trifold_group'] ?? uniqid('trifold_');

            DB::transaction(function () use ($request, $project, $validated, $panels, $trifoldGroupId) {
                // 1. Update Kotak 1 (Primary Project)
                $p0 = $panels[0] ?? [];
                $validated['name'] = ! empty($p0['title']) ? trim($p0['title']) : $validated['name'];
                $validated['title'] = ! empty($p0['title']) ? trim($p0['title']) : $validated['title'];
                $validated['subtitle'] = $p0['subtitle'] ?? ($validated['subtitle'] ?? '');
                $validated['category'] = ! empty($p0['category']) ? $p0['category'] : ($validated['category'] ?? 'Smart Agriculture');
                $validated['description'] = $p0['description'] ?? ($validated['description'] ?? '');
                $validated['benefits'] = ['content' => $p0['benefits'] ?? ($validated['benefits']['content'] ?? '')];
                $validated['specifications'] = ['content' => $p0['specifications'] ?? ($p0['specs'] ?? ($validated['specifications']['content'] ?? ''))];
                $validated['problem_solution'] = [
                    'problem' => $p0['problem'] ?? '',
                    'solution' => $p0['solution'] ?? '',
                    'trifold_group' => $trifoldGroupId,
                    'panel_index' => 0,
                    'panels' => $panels,
                ];

                if (! empty($p0['project_url'])) {
                    $validated['project_url'] = $p0['project_url'];
                    if ($p0['project_url'] !== $project->project_url) {
                        if ($project->qr_code_path) {
                            Storage::disk('public')->delete($project->qr_code_path);
                        }
                        $urlToEncode = ! preg_match('#^https?://#i', $p0['project_url']) ? 'https://'.$p0['project_url'] : $p0['project_url'];
                        $validated['qr_code_path'] = $this->generateQrCode($urlToEncode);
                    }
                }

                if (! empty($p0['image_url']) && ! $request->hasFile('main_image')) {
                    if (str_starts_with($p0['image_url'], 'data:image/')) {
                        $storedImg = $this->storeBase64Image($p0['image_url']);
                        if ($storedImg) {
                            if ($project->main_image) {
                                Storage::disk('public')->delete($project->main_image);
                            }
                            $validated['main_image'] = $storedImg;
                        }
                    }
                }

                $validated = $this->sanitizeProjectData($validated);
                $project->update($validated);

                // 2. Synchronize Companion Projects for Kotak 2 (panel 1) & Kotak 3 (panel 2)
                $existingCompanions = $request->user()->projects()
                    ->where('id', '!=', $project->id)
                    ->whereJsonContains('problem_solution->trifold_group', $trifoldGroupId)
                    ->get();

                foreach ([1, 2] as $idx) {
                    if (! isset($panels[$idx])) {
                        continue;
                    }

                    $p = $panels[$idx];
                    $pTitle = ! empty($p['title']) ? trim($p['title']) : 'Inovasi Kotak '.($idx + 1);
                    $pName = $pTitle;
                    $pSubtitle = $p['subtitle'] ?? '';
                    $pCategory = ! empty($p['category']) ? trim($p['category']) : ($companion ? $companion->category : 'CoE STAS-RG');
                    $pDesc = $p['description'] ?? '';
                    $pProblem = $p['problem'] ?? '';
                    $pSolution = $p['solution'] ?? '';
                    $pBenefits = $p['benefits'] ?? '';
                    $pSpecs = $p['specifications'] ?? ($p['specs'] ?? '');
                    $pProjectUrl = $p['project_url'] ?? '';

                    $companion = $existingCompanions->first(function ($item) use ($idx) {
                        return ($item->problem_solution['panel_index'] ?? null) == $idx;
                    });

                    $pImage = $companion ? $companion->main_image : null;
                    if (! empty($p['image_url'])) {
                        if (str_starts_with($p['image_url'], 'data:image/')) {
                            $storedImg = $this->storeBase64Image($p['image_url']);
                            if ($storedImg) {
                                if ($companion && $companion->main_image) {
                                    Storage::disk('public')->delete($companion->main_image);
                                }
                                $pImage = $storedImg;
                            }
                        } elseif (! str_starts_with($p['image_url'], 'http') && ! str_starts_with($p['image_url'], 'blob:')) {
                            $pImage = str_replace('/storage/', '', $p['image_url']);
                        }
                    }

                    $companionData = [
                        'name' => $pName,
                        'title' => $pTitle,
                        'subtitle' => $pSubtitle,
                        'category' => $pCategory,
                        'description' => $pDesc,
                        'main_image' => $pImage,
                        'partner_logo' => $project->partner_logo,
                        'partner_logos' => $project->partner_logos,
                        'footer_logo' => $project->footer_logo,
                        'benefits' => ['content' => $pBenefits],
                        'specifications' => ['content' => $pSpecs],
                        'problem_solution' => [
                            'problem' => $pProblem,
                            'solution' => $pSolution,
                            'trifold_group' => $trifoldGroupId,
                            'panel_index' => $idx,
                            'panels' => $panels,
                        ],
                        'project_url' => $pProjectUrl,
                        'footer_website' => $validated['footer_website'] ?? $project->footer_website,
                        'footer_instagram' => $validated['footer_instagram'] ?? $project->footer_instagram,
                        'footer_youtube' => $validated['footer_youtube'] ?? $project->footer_youtube,
                        'social_links' => $validated['social_links'] ?? $project->social_links,
                        'layout_preset' => $validated['layout_preset'] ?? $project->layout_preset,
                        'design_style' => $validated['design_style'] ?? $project->design_style,
                        'doc_format' => 'brochure_trifold',
                        'color_theme' => $validated['color_theme'] ?? $project->color_theme,
                        'print_mode' => $validated['print_mode'] ?? $project->print_mode,
                        'boilerplate_type' => $validated['boilerplate_type'] ?? $project->boilerplate_type,
                        'status' => $validated['status'] ?? $project->status,
                    ];

                    if (! empty($pProjectUrl)) {
                        $url = $pProjectUrl;
                        if (! preg_match('#^https?://#i', $url)) {
                            $url = 'https://'.$url;
                        }
                        if (! $companion || $companion->project_url !== $pProjectUrl) {
                            if ($companion && $companion->qr_code_path) {
                                Storage::disk('public')->delete($companion->qr_code_path);
                            }
                            $companionData['qr_code_path'] = $this->generateQrCode($url);
                        }
                    } elseif ($companion && $companion->qr_code_path) {
                        Storage::disk('public')->delete($companion->qr_code_path);
                        $companionData['qr_code_path'] = null;
                    }

                    $companionData = $this->sanitizeProjectData($companionData);

                    if ($companion) {
                        $companion->update($companionData);
                    } else {
                        $request->user()->projects()->create($companionData);
                    }
                }
            });

            return redirect()
                ->route('projects.show', $project)
                ->with('success', '3 Data Project Inovasi Brosur Lipat (Kotak 1, 2, dan 3) berhasil diperbarui!');
        }

        $project->update($validated);

        app(VersionService::class)->recordVersion(
            model: $project,
            user: $request->user(),
            event: ModelVersion::EVENT_UPDATED
        );

        try {
            $eventType = 'updated';
            if ($oldStatus !== 'published' && $newStatus === 'published') {
                $eventType = 'published';
            } elseif ($oldStatus === 'published' && $newStatus === 'draft') {
                $eventType = 'unpublished';
            }

            Mail::to($request->user()->email)->send(
                new ProjectNotificationMail($request->user(), $project, $eventType)
            );
        } catch (\Throwable $e) {
            Log::warning('Failed to send project update email: '.$e->getMessage());
        }

        ActivityLogger::logProject(
            action: $oldStatus !== $newStatus ? 'project.status_changed' : 'project.updated',
            description: "Memperbarui informasi proyek riset \"{$project->name}\"",
            project: $project,
            properties: [
                'name' => $project->name,
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'updated_fields' => array_keys($validated),
            ],
            user: $request->user(),
            request: $request
        );

        return redirect()
            ->route('projects.show', $project)
            ->with('success', 'Project berhasil diperbarui!');
    }

    /**
     * Sanitize rich text inputs in project data.
     */
    private function sanitizeProjectData(array $validated): array
    {
        if (isset($validated['description'])) {
            $validated['description'] = HtmlSanitizer::clean($validated['description']);
        }

        if (isset($validated['benefits']) && is_array($validated['benefits'])) {
            if (isset($validated['benefits']['content'])) {
                $validated['benefits']['content'] = HtmlSanitizer::clean($validated['benefits']['content']);
            }
        }

        if (isset($validated['specifications']) && is_array($validated['specifications'])) {
            if (isset($validated['specifications']['content'])) {
                $validated['specifications']['content'] = HtmlSanitizer::clean($validated['specifications']['content']);
            }
        }

        if (isset($validated['problem_solution']) && is_array($validated['problem_solution'])) {
            if (isset($validated['problem_solution']['problem'])) {
                $validated['problem_solution']['problem'] = HtmlSanitizer::clean($validated['problem_solution']['problem']);
            }
            if (isset($validated['problem_solution']['solution'])) {
                $validated['problem_solution']['solution'] = HtmlSanitizer::clean($validated['problem_solution']['solution']);
            }
            if (isset($validated['problem_solution']['panels']) && is_array($validated['problem_solution']['panels'])) {
                foreach ($validated['problem_solution']['panels'] as $idx => $panel) {
                    if (isset($panel['description'])) {
                        $validated['problem_solution']['panels'][$idx]['description'] = HtmlSanitizer::clean($panel['description']);
                    }
                    if (isset($panel['problem'])) {
                        $validated['problem_solution']['panels'][$idx]['problem'] = HtmlSanitizer::clean($panel['problem']);
                    }
                    if (isset($panel['solution'])) {
                        $validated['problem_solution']['panels'][$idx]['solution'] = HtmlSanitizer::clean($panel['solution']);
                    }
                    if (isset($panel['benefits'])) {
                        $validated['problem_solution']['panels'][$idx]['benefits'] = HtmlSanitizer::clean($panel['benefits']);
                    }
                    if (isset($panel['specifications'])) {
                        $validated['problem_solution']['panels'][$idx]['specifications'] = HtmlSanitizer::clean($panel['specifications']);
                    }
                    if (isset($panel['specs'])) {
                        $validated['problem_solution']['panels'][$idx]['specs'] = HtmlSanitizer::clean($panel['specs']);
                    }
                }
            }
        }

        if (isset($validated['content_en']) && is_array($validated['content_en'])) {
            if (isset($validated['content_en']['description'])) {
                $validated['content_en']['description'] = HtmlSanitizer::clean($validated['content_en']['description']);
            }
            if (isset($validated['content_en']['problem_solution']) && is_array($validated['content_en']['problem_solution'])) {
                if (isset($validated['content_en']['problem_solution']['problem'])) {
                    $validated['content_en']['problem_solution']['problem'] = HtmlSanitizer::clean($validated['content_en']['problem_solution']['problem']);
                }
                if (isset($validated['content_en']['problem_solution']['solution'])) {
                    $validated['content_en']['problem_solution']['solution'] = HtmlSanitizer::clean($validated['content_en']['problem_solution']['solution']);
                }
            }
            if (isset($validated['content_en']['benefits']) && is_array($validated['content_en']['benefits'])) {
                if (isset($validated['content_en']['benefits']['content'])) {
                    $validated['content_en']['benefits']['content'] = HtmlSanitizer::clean($validated['content_en']['benefits']['content']);
                }
            }
            if (isset($validated['content_en']['specifications']) && is_array($validated['content_en']['specifications'])) {
                if (isset($validated['content_en']['specifications']['content'])) {
                    $validated['content_en']['specifications']['content'] = HtmlSanitizer::clean($validated['content_en']['specifications']['content']);
                }
            }
        }

        return $validated;
    }

    /**
     * Remove the specified project.
     */
    public function destroy(Project $project): RedirectResponse
    {
        $this->authorizeUserOwnsProject($project);
        $user = Auth::user();

        // Clean up uploaded files
        if ($project->main_image) {
            Storage::disk('public')->delete($project->main_image);
        }
        if ($project->partner_logo) {
            Storage::disk('public')->delete($project->partner_logo);
        }
        if ($project->footer_logo) {
            Storage::disk('public')->delete($project->footer_logo);
        }
        if ($project->qr_code_path) {
            Storage::disk('public')->delete($project->qr_code_path);
        }

        try {
            Mail::to($user->email)->send(
                new ProjectNotificationMail($user, $project, 'deleted')
            );
        } catch (\Throwable $e) {
            Log::warning('Failed to send project deleted email: '.$e->getMessage());
        }

        $projectName = $project->name;
        $projectId = $project->id;

        $project->delete();

        ActivityLogger::logProject(
            action: 'project.deleted',
            description: "Menghapus proyek riset \"{$projectName}\"",
            project: null,
            properties: [
                'deleted_id' => $projectId,
                'name' => $projectName,
            ],
            user: $user,
            request: request()
        );

        return redirect()
            ->route('projects.index')
            ->with('success', 'Project berhasil dihapus!');
    }

    /**
     * Duplicate an existing project.
     */
    public function duplicate(Project $project): RedirectResponse
    {
        $this->authorizeUserOwnsProject($project);
        $user = Auth::user();

        $newProject = DB::transaction(function () use ($project) {
            $newProject = $project->replicate(['qr_code_path']);
            $newProject->name = $project->name.' (Copy)';
            $newProject->slug = Project::generateUniqueSlug($newProject->name);
            $newProject->status = 'draft';
            $newProject->created_at = now();
            $newProject->updated_at = now();

            // Duplicate main image file
            if ($project->main_image && Storage::disk('public')->exists($project->main_image)) {
                $extension = pathinfo($project->main_image, PATHINFO_EXTENSION);
                $newPath = 'projects/images/'.uniqid().'.'.$extension;
                Storage::disk('public')->copy($project->main_image, $newPath);
                $newProject->main_image = $newPath;
            }

            // Duplicate partner logo file
            if ($project->partner_logo && Storage::disk('public')->exists($project->partner_logo)) {
                $extension = pathinfo($project->partner_logo, PATHINFO_EXTENSION);
                $newPath = 'projects/logos/'.uniqid().'.'.$extension;
                Storage::disk('public')->copy($project->partner_logo, $newPath);
                $newProject->partner_logo = $newPath;
            }

            // Regenerate QR code for the duplicate
            if ($project->project_url) {
                $newProject->qr_code_path = $this->generateQrCode($project->project_url);
            }

            $newProject->save();

            return $newProject;
        });

        try {
            Mail::to($user->email)->send(
                new ProjectNotificationMail($user, $newProject, 'duplicated')
            );
        } catch (\Throwable $e) {
            Log::warning('Failed to send project duplicate email: '.$e->getMessage());
        }

        ActivityLogger::logProject(
            action: 'project.duplicated',
            description: "Menduplikasi proyek riset \"{$project->name}\" menjadi \"{$newProject->name}\"",
            project: $newProject,
            properties: [
                'original_id' => $project->id,
                'original_name' => $project->name,
                'new_id' => $newProject->id,
                'new_name' => $newProject->name,
            ],
            user: $user,
            request: request()
        );

        return redirect()
            ->route('projects.edit', $newProject)
            ->with('success', 'Project berhasil diduplikasi!');
    }

    /**
     * AI Assistant: Generate complete structured project content based on prompt.
     */
    public function aiGenerateProject(Request $request): JsonResponse
    {
        $prompt = $request->input('topic') ?: $request->input('prompt');
        $category = $request->input('category');
        $notes = $request->input('notes') ?: $request->input('custom_instructions');

        if (empty($prompt) || strlen(trim($prompt)) < 3) {
            return response()->json([
                'success' => false,
                'error' => 'Silakan masukkan topik riset atau ide proyek (minimal 3 karakter).',
            ], 422);
        }

        try {
            $layoutPreset = $request->input('layout_preset') ?: 'balanced';
            $generated = AiAssistantService::generateProjectContent(trim($prompt), [
                'category' => $category,
                'notes' => $notes,
                'layout_preset' => $layoutPreset,
            ]);

            ActivityLogger::logProject(
                action: 'project.ai_generated',
                description: "Menghasilkan draf konten riset menggunakan AI Assistant (\"{$generated['name']}\")",
                project: null,
                properties: [
                    'prompt' => $prompt,
                    'generated_name' => $generated['name'] ?? null,
                    'generated_category' => $generated['category'] ?? null,
                ],
                user: $request->user(),
                request: $request
            );

            return response()->json([
                'success' => true,
                'message' => 'Konten proyek berhasil dihasilkan oleh AI Assistant!',
                'data' => $generated,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * AI Assistant: Polish or generate specific project section.
     */
    public function aiPolishSection(Request $request): JsonResponse
    {
        $section = $request->input('section');
        $context = $request->input('context', []);
        if ($request->has('current_data') && is_array($request->input('current_data'))) {
            $context = array_merge($context, $request->input('current_data'));
        }

        $text = (string) ($request->input('text') ?: $request->input('prompt') ?: '');
        $hasDescription = ! empty($context['description']) || ! empty($context['project_name']) || ! empty($context['name']) || ! empty($context['title']);

        if (empty($section) || (empty($text) && ! $hasDescription)) {
            return response()->json([
                'success' => false,
                'error' => 'Silakan isi Nama Proyek atau Deskripsi Singkat terlebih dahulu agar AI memiliki informasi untuk menyusun konten.',
            ], 422);
        }

        try {
            $result = AiAssistantService::generateSection(
                $section,
                $text,
                $context
            );

            $polishedText = is_string($result) ? $result : ($result['content'] ?? ($result['solution'] ?? json_encode($result)));

            return response()->json([
                'success' => true,
                'section' => $section,
                'polished_text' => $polishedText,
                'data' => $result,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * AI Assistant: Translate project content into Academic/Scientific English.
     */
    public function aiTranslateProject(Request $request): JsonResponse
    {
        $projectData = $request->input('project') ?: $request->all();

        if (empty($projectData['title']) && empty($projectData['name'])) {
            return response()->json([
                'success' => false,
                'error' => 'Silakan isi Judul atau Nama Proyek terlebih dahulu sebelum melakukan penerjemahan.',
            ], 422);
        }

        try {
            $layoutPreset = $request->input('layout_preset') ?: ($projectData['layout_preset'] ?? 'balanced');
            $targetLang = $request->input('target_lang', 'en');

            $translated = AiAssistantService::translateProjectContent($projectData, $targetLang, $layoutPreset);

            ActivityLogger::logProject(
                action: 'project.ai_translated',
                description: 'Menerjemahkan konten proyek riset "'.($projectData['name'] ?? 'Proyek').'" ke Bahasa Inggris',
                project: null,
                properties: [
                    'project_name' => $projectData['name'] ?? null,
                    'target_lang' => $targetLang,
                    'layout_preset' => $layoutPreset,
                ],
                user: $request->user(),
                request: $request
            );

            return response()->json([
                'success' => true,
                'message' => 'Konten proyek berhasil diterjemahkan ke Bahasa Inggris!',
                'data' => $translated,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * AI Assistant: Smart Form Assist Multi-Action Engine.
     */
    public function aiSmartAssist(Request $request): JsonResponse
    {
        $action = (string) $request->input('action', '');
        $payload = $request->input('payload', []);
        $context = $request->input('context', []);
        $text = (string) ($request->input('text') ?: ($payload['text'] ?? ''));

        try {
            switch ($action) {
                case 'executive_summary':
                    $projectData = ! empty($payload) && is_array($payload) ? $payload : $context;
                    $language = (string) $request->input('language', 'id');
                    $result = AiAssistantService::generateExecutiveSummary($projectData, $language);

                    ActivityLogger::logProject(
                        action: 'project.ai_smart_assist',
                        description: 'Menghasilkan Ringkasan Eksekutif proyek menggunakan AI Smart Assist',
                        project: null,
                        properties: ['action' => 'executive_summary', 'language' => $language],
                        user: $request->user(),
                        request: $request
                    );

                    return response()->json([
                        'success' => true,
                        'action' => 'executive_summary',
                        'data' => $result,
                    ]);

                case 'format_abstract':
                    if (empty(trim($text))) {
                        return response()->json([
                            'success' => false,
                            'error' => 'Silakan masukkan draf, catatan, atau rincian inovasi yang ingin disusun menjadi abstrak.',
                        ], 422);
                    }

                    $targetLang = (string) $request->input('target_lang', 'both');
                    $result = AiAssistantService::formatAcademicAbstract($text, $context, $targetLang);

                    ActivityLogger::logProject(
                        action: 'project.ai_smart_assist',
                        description: 'Memformat draf catatan menjadi Abstrak Akademik IMRaD menggunakan AI Smart Assist',
                        project: null,
                        properties: ['action' => 'format_abstract'],
                        user: $request->user(),
                        request: $request
                    );

                    return response()->json([
                        'success' => true,
                        'action' => 'format_abstract',
                        'data' => $result,
                    ]);

                case 'translate':
                    if (empty(trim($text))) {
                        return response()->json([
                            'success' => false,
                            'error' => 'Silakan masukkan teks yang ingin diterjemahkan.',
                        ], 422);
                    }

                    $fromLang = (string) $request->input('from_lang', 'id');
                    $toLang = (string) $request->input('to_lang', 'en');
                    $mode = (string) $request->input('mode', 'academic');

                    $translatedText = AiAssistantService::translateBidirectional($text, $fromLang, $toLang, $mode);

                    return response()->json([
                        'success' => true,
                        'action' => 'translate',
                        'translated_text' => $translatedText,
                        'from_lang' => $fromLang,
                        'to_lang' => $toLang,
                    ]);

                case 'auto_summarize':
                    if (empty(trim($text))) {
                        return response()->json([
                            'success' => false,
                            'error' => 'Silakan masukkan teks yang ingin diringkas.',
                        ], 422);
                    }

                    $maxChars = (int) $request->input('max_chars', 350);
                    $contentType = (string) $request->input('content_type', 'paragraph');

                    $summarized = AiAssistantService::autoSummarizeToLimit($text, $maxChars, $contentType);

                    return response()->json([
                        'success' => true,
                        'action' => 'auto_summarize',
                        'summarized_text' => $summarized,
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
                        'error' => 'Aksi AI Smart Assist tidak dikenali.',
                    ], 422);
            }
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Display public detail view of a published project.
     */
    public function publicShow(Project $project): Response
    {
        abort_unless($project->status === 'published', 404);

        // Track showcase view analytics
        AnalyticsTracker::trackShowcaseView($project, request());

        $relatedProjects = Project::where('status', 'published')
            ->where('id', '!=', $project->id)
            ->latest()
            ->take(3)
            ->get()
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'name' => $p->name,
                    'slug' => $p->slug,
                    'title' => $p->title,
                    'category' => $p->category ?? 'General',
                    'subtitle' => $p->subtitle,
                    'description' => $p->description,
                    'main_image' => $p->main_image ? asset('storage/'.$p->main_image) : null,
                    'content_en' => $p->content_en,
                    'updated_at' => $p->updated_at->format('d M Y'),
                ];
            });

        return Inertia::render('Public/ProjectDetail', [
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
                'slug' => $project->slug,
                'category' => $project->category ?? 'General',
                'title' => $project->title,
                'subtitle' => $project->subtitle,
                'description' => $project->description,
                'main_image' => $project->main_image ? asset('storage/'.$project->main_image) : null,
                'partner_logo' => $project->partner_logo ? asset('storage/'.$project->partner_logo) : null,
                'partner_logos' => ! empty($project->partner_logos) && is_array($project->partner_logos)
                    ? array_map(fn ($p) => str_starts_with($p, 'http') ? $p : asset('storage/'.$p), $project->partner_logos)
                    : ($project->partner_logo ? [asset('storage/'.$project->partner_logo)] : []),
                'research_team' => $this->formatResearchTeamForPublic($project->research_team),
                'lab_affiliation' => $project->lab_affiliation,
                'patent_number' => $project->patent_number,
                'publication_doi' => $project->publication_doi,
                'benefits' => $project->benefits,
                'specifications' => $project->specifications,
                'problem_solution' => $project->problem_solution,
                'project_url' => $project->project_url,
                'qr_code_path' => $project->qr_code_path ? asset('storage/'.$project->qr_code_path) : null,
                'footer_website' => $project->footer_website,
                'footer_instagram' => $project->footer_instagram,
                'footer_youtube' => $project->footer_youtube,
                'social_links' => $project->social_links,
                'layout_preset' => $project->layout_preset ?? 'balanced',
                'content_en' => $project->content_en,
                'status' => $project->status,
                'created_at' => $project->created_at->translatedFormat('d M Y'),
                'updated_at' => $project->updated_at->translatedFormat('d M Y'),
            ],
            'relatedProjects' => $relatedProjects,
        ]);
    }

    /**
     * Generate QR code image and return the storage path.
     */
    private function generateQrCode(string $url): string
    {
        $filename = 'projects/qrcodes/'.uniqid('qr_').'.svg';
        $fullPath = storage_path('app/public/'.$filename);

        // Ensure directory exists
        $directory = dirname($fullPath);
        if (! is_dir($directory)) {
            mkdir($directory, 0755, true);
        }

        QrCode::format('svg')
            ->size(200)
            ->errorCorrection('H')
            ->margin(1)
            ->color(10, 182, 0)
            ->generate($url, $fullPath);

        return $filename;
    }

    /**
     * Store base64 data image URL to storage disk or return null.
     */
    private function storeBase64Image(?string $dataUrl): ?string
    {
        if (empty($dataUrl) || ! str_starts_with($dataUrl, 'data:image/')) {
            return null;
        }

        if (preg_match('/^data:image\/(\w+);base64,/', $dataUrl, $matches)) {
            $ext = strtolower($matches[1]);
            if ($ext === 'jpeg') {
                $ext = 'jpg';
            }
            if ($ext === 'svg+xml') {
                $ext = 'svg';
            }

            $data = substr($dataUrl, strpos($dataUrl, ',') + 1);
            $decoded = base64_decode($data);

            if ($decoded !== false) {
                $filename = 'projects/images/'.uniqid('img_').'.'.$ext;
                $fullPath = storage_path('app/public/'.$filename);
                $directory = dirname($fullPath);
                if (! is_dir($directory)) {
                    mkdir($directory, 0755, true);
                }
                file_put_contents($fullPath, $decoded);

                return $filename;
            }
        }

        return null;
    }

    /**
     * Process and store an array of partner logos (files, base64 strings, or asset storage paths).
     *
     * @param  list<string>  $existingLogos
     * @return list<string>
     */
    private function processPartnerLogos(Request $request, array $existingLogos = []): array
    {
        $logos = [];

        // 1. If uploaded files in partner_logos array:
        if ($request->hasFile('partner_logos')) {
            $files = $request->file('partner_logos');
            if (is_array($files)) {
                foreach ($files as $file) {
                    if ($file && $file->isValid()) {
                        $logos[] = $file->store('projects/logos', 'public');
                    }
                }
            } elseif ($files && $files->isValid()) {
                $logos[] = $files->store('projects/logos', 'public');
            }
        }

        // 2. If single file partner_logo was uploaded:
        if ($request->hasFile('partner_logo')) {
            $logos[] = $request->file('partner_logo')->store('projects/logos', 'public');
        }

        // 3. If array of string/data URLs is sent in request input 'partner_logos':
        $rawLogos = $request->input('partner_logos');
        if (is_array($rawLogos)) {
            foreach ($rawLogos as $item) {
                if (empty($item) || ! is_string($item)) {
                    continue;
                }
                if (str_starts_with($item, 'data:image/')) {
                    $stored = $this->storeBase64Logo($item);
                    if ($stored) {
                        $logos[] = $stored;
                    }
                } elseif (str_starts_with($item, '/storage/')) {
                    $logos[] = str_replace('/storage/', '', $item);
                } elseif (! str_starts_with($item, 'http') && ! str_starts_with($item, 'blob:')) {
                    $logos[] = $item;
                }
            }
        } elseif (is_string($rawLogos) && ! empty($rawLogos)) {
            $decoded = json_decode($rawLogos, true);
            if (is_array($decoded)) {
                foreach ($decoded as $item) {
                    if (empty($item) || ! is_string($item)) {
                        continue;
                    }
                    if (str_starts_with($item, 'data:image/')) {
                        $stored = $this->storeBase64Logo($item);
                        if ($stored) {
                            $logos[] = $stored;
                        }
                    } elseif (str_starts_with($item, '/storage/')) {
                        $logos[] = str_replace('/storage/', '', $item);
                    } elseif (! str_starts_with($item, 'http') && ! str_starts_with($item, 'blob:')) {
                        $logos[] = $item;
                    }
                }
            }
        }

        // 4. Single partner_logo string input
        $singleRaw = $request->input('partner_logo');
        if (is_string($singleRaw) && ! empty($singleRaw) && ! in_array($singleRaw, $logos, true)) {
            if (str_starts_with($singleRaw, 'data:image/')) {
                $stored = $this->storeBase64Logo($singleRaw);
                if ($stored) {
                    $logos[] = $stored;
                }
            } elseif (str_starts_with($singleRaw, '/storage/')) {
                $logos[] = str_replace('/storage/', '', $singleRaw);
            } elseif (! str_starts_with($singleRaw, 'http') && ! str_starts_with($singleRaw, 'blob:')) {
                $logos[] = $singleRaw;
            }
        }

        // If no new logos were processed and remove_partner_logo wasn't requested, retain existing
        if (empty($logos) && ! $request->boolean('remove_partner_logo') && ! empty($existingLogos)) {
            $logos = $existingLogos;
        }

        // Deduplicate and filter non-empty
        return array_values(array_unique(array_filter($logos)));
    }

    /**
     * Store base64 data image URL specifically for logo into projects/logos
     */
    private function storeBase64Logo(?string $dataUrl): ?string
    {
        if (empty($dataUrl) || ! str_starts_with($dataUrl, 'data:image/')) {
            return null;
        }

        if (preg_match('/^data:image\/(\w+);base64,/', $dataUrl, $matches)) {
            $ext = strtolower($matches[1]);
            if ($ext === 'jpeg') {
                $ext = 'jpg';
            }
            if ($ext === 'svg+xml') {
                $ext = 'svg';
            }

            $data = substr($dataUrl, strpos($dataUrl, ',') + 1);
            $decoded = base64_decode($data);

            if ($decoded !== false) {
                $filename = 'projects/logos/'.uniqid('logo_').'.'.$ext;
                $fullPath = storage_path('app/public/'.$filename);
                $directory = dirname($fullPath);
                if (! is_dir($directory)) {
                    mkdir($directory, 0755, true);
                }
                file_put_contents($fullPath, $decoded);

                return $filename;
            }
        }

        return null;
    }

    /**
     * Ensure the authenticated user owns the project.
     */
    private function authorizeUserOwnsProject(Project $project): void
    {
        abort_unless($project->user_id === Auth::id(), 403);
    }

    /**
     * Get list of unique categories (defaults + existing project categories).
     *
     * @return list<string>
     */
    private function getAvailableCategories(): array
    {
        return Cache::remember('projects_available_categories', 3600, function () {
            $defaultCategories = [
                'Smart Agriculture',
                'Internet of Things (IoT)',
                'Aviation & AI',
                'Cybersecurity',
                'Telecommunication',
                'Renewable Energy',
                'Healthcare Tech',
                'Robotics & Automation',
                'Aquaculture / IoT',
            ];

            $dbCategories = Project::whereNotNull('category')
                ->where('category', '!=', '')
                ->distinct()
                ->pluck('category')
                ->toArray();

            return array_values(array_unique(array_filter(array_merge($defaultCategories, $dbCategories))));
        });
    }

    /**
     * Process and store research team members (handling avatar uploads/base64).
     *
     * @param  array<int, mixed>  $existingTeam
     * @return array<int, array<string, mixed>>
     */
    private function processResearchTeam(Request $request, array $existingTeam = []): array
    {
        $rawTeam = $request->input('research_team');
        if (is_string($rawTeam)) {
            $rawTeam = json_decode($rawTeam, true);
        }

        if (! is_array($rawTeam)) {
            return [];
        }

        $processed = [];
        foreach ($rawTeam as $idx => $member) {
            if (! is_array($member) || empty($member['name'])) {
                continue;
            }

            $name = trim((string) ($member['name'] ?? ''));
            $role = trim((string) ($member['role'] ?? 'Anggota Peneliti'));
            $identifier = trim((string) ($member['identifier'] ?? ''));
            $labAffiliation = trim((string) ($member['lab_affiliation'] ?? ''));
            $email = trim((string) ($member['email'] ?? ''));
            $scholarUrl = trim((string) ($member['scholar_url'] ?? ''));
            $scopusUrl = trim((string) ($member['scopus_url'] ?? ''));
            $sintaUrl = trim((string) ($member['sinta_url'] ?? ''));
            $orcidUrl = trim((string) ($member['orcid_url'] ?? ''));
            $linkedinUrl = trim((string) ($member['linkedin_url'] ?? ''));
            $avatar = $member['avatar'] ?? null;

            // Check if there is an uploaded file for this index in request
            if ($request->hasFile("research_team_avatars.{$idx}")) {
                $file = $request->file("research_team_avatars.{$idx}");
                if ($file && $file->isValid()) {
                    $avatar = $file->store('projects/avatars', 'public');
                }
            } elseif (is_string($avatar)) {
                if (str_starts_with($avatar, 'data:image/')) {
                    $stored = $this->storeBase64Avatar($avatar);
                    if ($stored) {
                        $avatar = $stored;
                    }
                } elseif (str_starts_with($avatar, '/storage/')) {
                    $avatar = str_replace('/storage/', '', $avatar);
                }
            }

            $processed[] = [
                'name' => $name,
                'role' => $role,
                'identifier' => $identifier,
                'lab_affiliation' => $labAffiliation,
                'email' => $email,
                'scholar_url' => $scholarUrl,
                'scopus_url' => $scopusUrl,
                'sinta_url' => $sintaUrl,
                'orcid_url' => $orcidUrl,
                'linkedin_url' => $linkedinUrl,
                'avatar' => $avatar,
            ];
        }

        return $processed;
    }

    /**
     * Store base64 data image URL specifically for author avatar.
     */
    private function storeBase64Avatar(?string $dataUrl): ?string
    {
        if (empty($dataUrl) || ! str_starts_with($dataUrl, 'data:image/')) {
            return null;
        }

        try {
            preg_match('#^data:image/(\w+);base64,#i', $dataUrl, $matches);
            $extension = strtolower($matches[1] ?? 'png');
            if ($extension === 'jpeg') {
                $extension = 'jpg';
            }

            $data = substr($dataUrl, strpos($dataUrl, ',') + 1);
            $decoded = base64_decode($data);

            if ($decoded === false) {
                return null;
            }

            $filename = 'projects/avatars/'.uniqid('avatar_').'.'.$extension;
            Storage::disk('public')->put($filename, $decoded);

            return $filename;
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Format research team data for public display with resolved avatar URLs.
     *
     * @param  array<int, mixed>|null  $team
     * @return array<int, array<string, mixed>>
     */
    private function formatResearchTeamForPublic(?array $team): array
    {
        if (empty($team) || ! is_array($team)) {
            return [];
        }

        return array_values(array_map(function ($member) {
            if (! is_array($member)) {
                return $member;
            }

            $avatar = $member['avatar'] ?? null;
            if ($avatar && is_string($avatar)) {
                if (! str_starts_with($avatar, 'http') && ! str_starts_with($avatar, 'blob:') && ! str_starts_with($avatar, 'data:')) {
                    $member['avatar'] = asset('storage/'.ltrim($avatar, '/'));
                }
            }

            return $member;
        }, $team));
    }
}
