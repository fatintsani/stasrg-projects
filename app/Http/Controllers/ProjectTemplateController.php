<?php

namespace App\Http\Controllers;

use App\Models\ModelVersion;
use App\Models\Project;
use App\Models\ProjectTemplate;
use App\Services\ActivityLogger;
use App\Services\HtmlSanitizer;
use App\Services\VersionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class ProjectTemplateController extends Controller
{
    /**
     * Display a listing of templates (system + user's custom templates).
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $query = ProjectTemplate::query()->accessibleFor($user?->id);

        if ($request->filled('search')) {
            $search = trim($request->input('search'));
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category') && $request->input('category') !== 'all') {
            $query->where('category', $request->input('category'));
        }

        if ($request->filled('type')) {
            if ($request->input('type') === 'system') {
                $query->where('is_system', true);
            } elseif ($request->input('type') === 'custom') {
                $query->where('is_system', false);
            }
        }

        $templates = $query->latest('usage_count')->latest('updated_at')->get();

        $categories = ProjectTemplate::distinct('category')
            ->whereNotNull('category')
            ->where('category', '!=', '')
            ->pluck('category')
            ->values();

        return Inertia::render('Admin/Templates/Index', [
            'templates' => $templates,
            'categories' => $categories,
            'filters' => [
                'search' => $request->input('search', ''),
                'category' => $request->input('category', 'all'),
                'type' => $request->input('type', 'all'),
            ],
        ]);
    }

    /**
     * Return JSON list of accessible templates for the Template Picker Modal.
     */
    public function apiList(Request $request): JsonResponse
    {
        $user = $request->user();
        $templates = ProjectTemplate::query()
            ->accessibleFor($user?->id)
            ->latest('usage_count')
            ->get();

        return response()->json([
            'success' => true,
            'templates' => $templates,
        ]);
    }

    /**
     * Show form for creating a new custom template.
     */
    public function create(): Response
    {
        return Inertia::render('Admin/Templates/Form', [
            'template' => null,
            'categories' => $this->getAvailableCategories(),
        ]);
    }

    /**
     * Store a newly created custom template.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'design_style' => ['nullable', 'string', 'in:classic_standard,modern_split,infographic_cards,minimal_grid,academic_brief,tech_blueprint,glass_minimalist'],
            'doc_format' => ['nullable', 'string', 'in:a4_flyer,brochure_trifold,roll_banner,factsheet_2col,pitch_poster,social_feed,social_story'],
            'layout_preset' => ['nullable', 'string', 'in:balanced,visual_heavy,text_heavy'],
            'color_theme' => ['nullable', 'string', 'in:stas_official,ocean_tech,crimson_innovation,slate_monochrome,cyber_teal,solar_amber,royal_purple,electric_azure,custom'],
            'print_mode' => ['nullable', 'string', 'in:light,dark'],
            'boilerplate_type' => ['nullable', 'string', 'max:255'],
            'default_data' => ['nullable', 'array'],
            'layout_schema' => ['nullable', 'array'],
        ]);

        $defaultData = $validated['default_data'] ?? [];

        // Sanitize rich text inside default data
        if (! empty($defaultData['description'])) {
            $defaultData['description'] = HtmlSanitizer::clean($defaultData['description']);
        }
        if (! empty($defaultData['benefits']['content'])) {
            $defaultData['benefits']['content'] = HtmlSanitizer::clean($defaultData['benefits']['content']);
        }
        if (! empty($defaultData['specifications']['content'])) {
            $defaultData['specifications']['content'] = HtmlSanitizer::clean($defaultData['specifications']['content']);
        }
        if (! empty($defaultData['problem_solution']['problem'])) {
            $defaultData['problem_solution']['problem'] = HtmlSanitizer::clean($defaultData['problem_solution']['problem']);
        }
        if (! empty($defaultData['problem_solution']['solution'])) {
            $defaultData['problem_solution']['solution'] = HtmlSanitizer::clean($defaultData['problem_solution']['solution']);
        }
        if (! empty($defaultData['problem_solution']['panels']) && is_array($defaultData['problem_solution']['panels'])) {
            foreach ($defaultData['problem_solution']['panels'] as &$panel) {
                if (is_array($panel)) {
                    if (! empty($panel['description'])) {
                        $panel['description'] = HtmlSanitizer::clean($panel['description']);
                    }
                    if (! empty($panel['benefits'])) {
                        $panel['benefits'] = HtmlSanitizer::clean($panel['benefits']);
                    }
                    if (! empty($panel['specifications'])) {
                        $panel['specifications'] = HtmlSanitizer::clean($panel['specifications']);
                    }
                    if (! empty($panel['problem'])) {
                        $panel['problem'] = HtmlSanitizer::clean($panel['problem']);
                    }
                    if (! empty($panel['solution'])) {
                        $panel['solution'] = HtmlSanitizer::clean($panel['solution']);
                    }
                }
            }
            unset($panel);
        }

        $template = ProjectTemplate::create([
            'user_id' => Auth::id(),
            'name' => $validated['name'],
            'category' => $validated['category'] ?? 'General',
            'description' => $validated['description'] ?? null,
            'design_style' => $validated['design_style'] ?? 'classic_standard',
            'doc_format' => $validated['doc_format'] ?? 'a4_flyer',
            'layout_preset' => $validated['layout_preset'] ?? 'balanced',
            'color_theme' => $validated['color_theme'] ?? 'stas_official',
            'print_mode' => $validated['print_mode'] ?? 'light',
            'boilerplate_type' => $validated['boilerplate_type'] ?? 'stas_default',
            'default_data' => $defaultData,
            'layout_schema' => $validated['layout_schema'] ?? null,
            'is_system' => false,
        ]);

        app(VersionService::class)->recordVersion(
            model: $template,
            user: Auth::user(),
            event: ModelVersion::EVENT_CREATED,
            summary: 'Versi awal template berhasil dibuat'
        );

        ActivityLogger::log('create', 'template', "Membuat custom template baru: '{$template->name}'", $template);

        return redirect()->route('templates.index')
            ->with('success', 'Custom template berhasil dibuat dan siap digunakan.');
    }

    /**
     * Show form for editing an existing custom template.
     */
    public function edit(ProjectTemplate $template): Response|RedirectResponse
    {
        if ($template->is_system && Auth::user()?->role !== 'admin') {
            return redirect()->route('templates.index')
                ->with('error', 'Template resmi sistem tidak dapat diedit secara langsung.');
        }

        return Inertia::render('Admin/Templates/Form', [
            'template' => $template,
            'categories' => $this->getAvailableCategories(),
        ]);
    }

    /**
     * Update an existing custom template.
     */
    public function update(Request $request, ProjectTemplate $template): RedirectResponse
    {
        if ($template->is_system && Auth::user()?->role !== 'admin') {
            return redirect()->route('templates.index')
                ->with('error', 'Anda tidak memiliki akses untuk mengubah template sistem.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'design_style' => ['nullable', 'string', 'in:classic_standard,modern_split,infographic_cards,minimal_grid,academic_brief,tech_blueprint,glass_minimalist'],
            'doc_format' => ['nullable', 'string', 'in:a4_flyer,roll_banner,factsheet_2col,pitch_poster,social_feed,social_story,brochure_trifold'],
            'layout_preset' => ['nullable', 'string', 'in:balanced,visual_heavy,text_heavy'],
            'color_theme' => ['nullable', 'string', 'in:stas_official,ocean_tech,crimson_innovation,slate_monochrome,cyber_teal,solar_amber,royal_purple,electric_azure,custom'],
            'print_mode' => ['nullable', 'string', 'in:light,dark'],
            'boilerplate_type' => ['nullable', 'string', 'max:255'],
            'default_data' => ['nullable', 'array'],
            'layout_schema' => ['nullable', 'array'],
        ]);

        $defaultData = $validated['default_data'] ?? [];

        if (! empty($defaultData['description'])) {
            $defaultData['description'] = HtmlSanitizer::clean($defaultData['description']);
        }
        if (! empty($defaultData['benefits']['content'])) {
            $defaultData['benefits']['content'] = HtmlSanitizer::clean($defaultData['benefits']['content']);
        }
        if (! empty($defaultData['specifications']['content'])) {
            $defaultData['specifications']['content'] = HtmlSanitizer::clean($defaultData['specifications']['content']);
        }
        if (! empty($defaultData['problem_solution']['problem'])) {
            $defaultData['problem_solution']['problem'] = HtmlSanitizer::clean($defaultData['problem_solution']['problem']);
        }
        if (! empty($defaultData['problem_solution']['solution'])) {
            $defaultData['problem_solution']['solution'] = HtmlSanitizer::clean($defaultData['problem_solution']['solution']);
        }
        if (! empty($defaultData['problem_solution']['panels']) && is_array($defaultData['problem_solution']['panels'])) {
            foreach ($defaultData['problem_solution']['panels'] as &$panel) {
                if (is_array($panel)) {
                    if (! empty($panel['description'])) {
                        $panel['description'] = HtmlSanitizer::clean($panel['description']);
                    }
                    if (! empty($panel['benefits'])) {
                        $panel['benefits'] = HtmlSanitizer::clean($panel['benefits']);
                    }
                    if (! empty($panel['specifications'])) {
                        $panel['specifications'] = HtmlSanitizer::clean($panel['specifications']);
                    }
                    if (! empty($panel['problem'])) {
                        $panel['problem'] = HtmlSanitizer::clean($panel['problem']);
                    }
                    if (! empty($panel['solution'])) {
                        $panel['solution'] = HtmlSanitizer::clean($panel['solution']);
                    }
                }
            }
            unset($panel);
        }

        $template->update([
            'name' => $validated['name'],
            'category' => $validated['category'] ?? 'General',
            'description' => $validated['description'] ?? null,
            'design_style' => $validated['design_style'] ?? 'classic_standard',
            'doc_format' => $validated['doc_format'] ?? 'a4_flyer',
            'layout_preset' => $validated['layout_preset'] ?? 'balanced',
            'color_theme' => $validated['color_theme'] ?? 'stas_official',
            'print_mode' => $validated['print_mode'] ?? 'light',
            'boilerplate_type' => $validated['boilerplate_type'] ?? 'stas_default',
            'default_data' => $defaultData,
            'layout_schema' => $validated['layout_schema'] ?? $template->layout_schema,
        ]);

        app(VersionService::class)->recordVersion(
            model: $template,
            user: Auth::user(),
            event: ModelVersion::EVENT_UPDATED
        );

        ActivityLogger::log('update', 'template', "Memperbarui template: '{$template->name}'", $template);

        return redirect()->route('templates.index')
            ->with('success', 'Template berhasil diperbarui.');
    }

    /**
     * Delete a custom template.
     */
    public function destroy(ProjectTemplate $template): RedirectResponse
    {
        $user = Auth::user();
        if ($template->is_system && $user?->role !== 'admin') {
            return redirect()->route('templates.index')
                ->with('error', 'Template resmi sistem tidak dapat dihapus.');
        }

        $name = $template->name;
        $template->delete();

        ActivityLogger::log('delete', 'template', "Menghapus template: '{$name}'");

        return redirect()->route('templates.index')
            ->with('success', "Template '{$name}' berhasil dihapus.");
    }

    /**
     * Duplicate a template.
     */
    public function duplicate(ProjectTemplate $template): RedirectResponse
    {
        $newTemplate = ProjectTemplate::create([
            'user_id' => Auth::id(),
            'name' => "{$template->name} (Salinan)",
            'category' => $template->category,
            'description' => $template->description,
            'design_style' => $template->design_style,
            'doc_format' => $template->doc_format,
            'layout_preset' => $template->layout_preset,
            'color_theme' => $template->color_theme,
            'print_mode' => $template->print_mode,
            'boilerplate_type' => $template->boilerplate_type,
            'default_data' => $template->default_data,
            'layout_schema' => $template->layout_schema,
            'is_system' => false,
            'usage_count' => 0,
        ]);

        app(VersionService::class)->recordVersion(
            model: $newTemplate,
            user: Auth::user(),
            event: ModelVersion::EVENT_CREATED,
            summary: "Duplikasi dari template '{$template->name}'"
        );

        ActivityLogger::log('duplicate', 'template', "Menduplikasi template '{$template->name}' menjadi '{$newTemplate->name}'", $newTemplate);

        return redirect()->route('templates.index')
            ->with('success', "Template berhasil diduplikasi sebagai '{$newTemplate->name}'.");
    }

    /**
     * Save an existing project as a new custom template.
     */
    public function saveFromProject(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'project_id' => ['nullable', 'integer'],
            'project_data' => ['nullable', 'array'],
        ]);

        $projectData = $validated['project_data'] ?? [];

        if (empty($projectData) && ! empty($validated['project_id'])) {
            $project = Project::findOrFail($validated['project_id']);
            $projectData = $project->toArray();
        }

        $defaultData = [
            'title' => $projectData['title'] ?? '',
            'subtitle' => $projectData['subtitle'] ?? '',
            'description' => $projectData['description'] ?? '',
            'benefits' => $projectData['benefits'] ?? [],
            'specifications' => $projectData['specifications'] ?? [],
            'problem_solution' => $projectData['problem_solution'] ?? [],
            'footer_website' => $projectData['footer_website'] ?? 'www.stas-rg.com',
            'footer_instagram' => $projectData['footer_instagram'] ?? '@stas.rg',
            'footer_youtube' => $projectData['footer_youtube'] ?? '@stas_rg',
            'social_links' => $projectData['social_links'] ?? [],
        ];

        $template = ProjectTemplate::create([
            'user_id' => Auth::id(),
            'name' => $validated['name'],
            'category' => $projectData['category'] ?? 'General',
            'description' => $validated['description'] ?? 'Template kustom disimpan dari project.',
            'design_style' => $projectData['design_style'] ?? 'classic_standard',
            'doc_format' => $projectData['doc_format'] ?? 'a4_flyer',
            'layout_preset' => $projectData['layout_preset'] ?? 'balanced',
            'color_theme' => $projectData['color_theme'] ?? 'stas_official',
            'print_mode' => $projectData['print_mode'] ?? 'light',
            'boilerplate_type' => $projectData['boilerplate_type'] ?? 'stas_default',
            'default_data' => $defaultData,
            'layout_schema' => $projectData['layout_schema'] ?? null,
            'is_system' => false,
        ]);

        app(VersionService::class)->recordVersion(
            model: $template,
            user: Auth::user(),
            event: ModelVersion::EVENT_CREATED,
            summary: 'Disimpan dari proyek riset'
        );

        ActivityLogger::log('create', 'template', "Menyimpan project sebagai custom template: '{$template->name}'", $template);

        return response()->json([
            'success' => true,
            'message' => "Project berhasil disimpan sebagai template '{$template->name}'.",
            'template' => $template,
        ]);
    }

    /**
     * Get available categories list.
     */
    protected function getAvailableCategories(): array
    {
        return Cache::remember('project_templates_available_categories', 3600, function () {
            return ProjectTemplate::distinct('category')
                ->whereNotNull('category')
                ->where('category', '!=', '')
                ->pluck('category')
                ->values()
                ->toArray();
        });
    }
}
