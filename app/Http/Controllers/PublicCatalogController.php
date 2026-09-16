<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class PublicCatalogController extends Controller
{
    /**
     * Display the interactive public research catalog page.
     */
    public function index(Request $request): Response
    {
        $publishedProjects = [];
        $categoriesList = [];
        $yearsList = [];
        $researchersList = [];
        $docFormatsList = [];

        $stats = [
            'total_projects' => 0,
            'total_patents' => 0,
            'total_publications' => 0,
            'total_researchers' => 0,
            'total_categories' => 0,
        ];

        if (Schema::hasTable('projects')) {
            $rawProjects = Project::where('status', 'published')
                ->latest('created_at')
                ->get();

            $categoryCounts = [];
            $yearCounts = [];
            $researcherCounts = [];
            $docFormatCounts = [];
            $allResearchersMap = [];

            $totalPatents = 0;
            $totalPublications = 0;

            $publishedProjects = $rawProjects->map(function (Project $project) use (
                &$categoryCounts,
                &$yearCounts,
                &$researcherCounts,
                &$docFormatCounts,
                &$allResearchersMap,
                &$totalPatents,
                &$totalPublications
            ) {
                // Track category counts
                $category = $project->category ? trim($project->category) : 'General';
                $categoryCounts[$category] = ($categoryCounts[$category] ?? 0) + 1;

                // Track year counts
                $year = $project->created_at ? $project->created_at->format('Y') : date('Y');
                $yearCounts[$year] = ($yearCounts[$year] ?? 0) + 1;

                // Track document formats
                $docFormat = $project->doc_format ?? 'a4_flyer';
                $docFormatCounts[$docFormat] = ($docFormatCounts[$docFormat] ?? 0) + 1;

                // Track patents & publications
                if (! empty($project->patent_number)) {
                    $totalPatents++;
                }
                if (! empty($project->publication_doi)) {
                    $totalPublications++;
                }

                // Process research team
                $normalizedTeam = [];
                if (is_array($project->research_team)) {
                    foreach ($project->research_team as $member) {
                        if (is_array($member) && ! empty($member['name'])) {
                            $name = trim($member['name']);
                            $normalizedTeam[] = [
                                'name' => $name,
                                'role' => $member['role'] ?? 'Anggota Peneliti',
                                'identifier' => $member['identifier'] ?? '',
                                'lab_affiliation' => $member['lab_affiliation'] ?? '',
                                'email' => $member['email'] ?? '',
                                'scholar_url' => $member['scholar_url'] ?? '',
                                'scopus_url' => $member['scopus_url'] ?? '',
                                'sinta_url' => $member['sinta_url'] ?? '',
                                'orcid_url' => $member['orcid_url'] ?? '',
                                'linkedin_url' => $member['linkedin_url'] ?? '',
                                'avatar' => ! empty($member['avatar'])
                                    ? (str_starts_with($member['avatar'], 'http') || str_starts_with($member['avatar'], 'data:')
                                        ? $member['avatar']
                                        : asset('storage/'.$member['avatar']))
                                    : null,
                            ];

                            $researcherCounts[$name] = ($researcherCounts[$name] ?? 0) + 1;
                            if (! isset($allResearchersMap[$name])) {
                                $allResearchersMap[$name] = [
                                    'name' => $name,
                                    'lab' => $member['lab_affiliation'] ?? $project->lab_affiliation ?? '',
                                    'avatar' => ! empty($member['avatar']) ? (str_starts_with($member['avatar'], 'http') ? $member['avatar'] : asset('storage/'.$member['avatar'])) : null,
                                ];
                            }
                        }
                    }
                }

                // Normalizing partner logos
                $partnerLogos = [];
                if (! empty($project->partner_logos) && is_array($project->partner_logos)) {
                    $partnerLogos = array_map(function ($p) {
                        return str_starts_with($p, 'http') || str_starts_with($p, 'data:') ? $p : asset('storage/'.$p);
                    }, $project->partner_logos);
                } elseif (! empty($project->partner_logo)) {
                    $partnerLogos = [str_starts_with($project->partner_logo, 'http') ? $project->partner_logo : asset('storage/'.$project->partner_logo)];
                }

                return [
                    'id' => $project->id,
                    'name' => $project->name,
                    'slug' => $project->slug,
                    'title' => $project->title ?: $project->name,
                    'subtitle' => $project->subtitle,
                    'category' => $category,
                    'description' => $project->description,
                    'main_image' => $project->main_image ? asset('storage/'.$project->main_image) : null,
                    'partner_logo' => $project->partner_logo ? asset('storage/'.$project->partner_logo) : null,
                    'partner_logos' => $partnerLogos,
                    'research_team' => $normalizedTeam,
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
                    'layout_preset' => $project->layout_preset ?? 'balanced',
                    'design_style' => $project->design_style ?? 'classic_standard',
                    'doc_format' => $docFormat,
                    'color_theme' => $project->color_theme ?? 'stas_official',
                    'print_mode' => $project->print_mode ?? 'light',
                    'content_en' => $project->content_en,
                    'created_year' => $year,
                    'created_at' => $project->created_at ? $project->created_at->format('d M Y') : '',
                    'created_at_iso' => $project->created_at ? $project->created_at->toIso8601String() : '',
                    'updated_at' => $project->updated_at ? $project->updated_at->format('d M Y') : '',
                ];
            })->all();

            // Format facets
            arsort($categoryCounts);
            foreach ($categoryCounts as $name => $count) {
                $categoriesList[] = ['name' => $name, 'count' => $count];
            }

            krsort($yearCounts);
            foreach ($yearCounts as $y => $count) {
                $yearsList[] = ['year' => (string) $y, 'count' => $count];
            }

            arsort($researcherCounts);
            foreach ($researcherCounts as $name => $count) {
                $researchersList[] = [
                    'name' => $name,
                    'count' => $count,
                    'lab' => $allResearchersMap[$name]['lab'] ?? '',
                    'avatar' => $allResearchersMap[$name]['avatar'] ?? null,
                ];
            }

            foreach ($docFormatCounts as $fmt => $count) {
                $docFormatsList[] = ['format' => $fmt, 'count' => $count];
            }

            $stats['total_projects'] = count($publishedProjects);
            $stats['total_patents'] = $totalPatents;
            $stats['total_publications'] = $totalPublications;
            $stats['total_researchers'] = count($researcherCounts);
            $stats['total_categories'] = count($categoryCounts);
        }

        return Inertia::render('Public/Catalog', [
            'projects' => $publishedProjects,
            'facets' => [
                'categories' => $categoriesList,
                'years' => $yearsList,
                'researchers' => $researchersList,
                'doc_formats' => $docFormatsList,
            ],
            'stats' => $stats,
            'filters' => [
                'q' => (string) $request->input('q', ''),
                'category' => (string) $request->input('category', 'all'),
                'year' => (string) $request->input('year', 'all'),
                'researcher' => (string) $request->input('researcher', 'all'),
                'format' => (string) $request->input('format', 'all'),
                'has_patent' => $request->boolean('has_patent'),
                'has_doi' => $request->boolean('has_doi'),
                'sort' => (string) $request->input('sort', 'newest'),
                'view' => (string) $request->input('view', 'grid'),
            ],
        ]);
    }
}
