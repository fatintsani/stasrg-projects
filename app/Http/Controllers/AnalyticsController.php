<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\ProjectAnalytic;
use App\Models\User;
use App\Services\AnalyticsTracker;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AnalyticsController extends Controller
{
    /**
     * Display the Analytics & Insights dashboard.
     */
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = Auth::user();
        $userProjectIds = $user->projects()->pluck('id')->toArray();

        // Date Range Filtering
        $period = $request->input('period', '30d');
        $now = Carbon::now();

        [$startDate, $endDate] = match ($period) {
            '7d' => [$now->copy()->subDays(6)->startOfDay(), $now->copy()->endOfDay()],
            '90d' => [$now->copy()->subDays(89)->startOfDay(), $now->copy()->endOfDay()],
            'all' => [Carbon::createFromTimestamp(0), $now->copy()->endOfDay()],
            'custom' => [
                $request->filled('date_from') ? Carbon::parse($request->input('date_from'))->startOfDay() : $now->copy()->subDays(29)->startOfDay(),
                $request->filled('date_to') ? Carbon::parse($request->input('date_to'))->endOfDay() : $now->copy()->endOfDay(),
            ],
            default => [$now->copy()->subDays(29)->startOfDay(), $now->copy()->endOfDay()], // 30d default
        };

        // Project filter
        $selectedProjectId = $request->filled('project_id') && $request->input('project_id') !== 'all'
            ? (int) $request->input('project_id')
            : null;

        // Base query scoped to authenticated user's projects or global if user has none
        $baseQuery = ProjectAnalytic::query()
            ->whereBetween('created_at', [$startDate, $endDate]);

        if (! empty($userProjectIds)) {
            $baseQuery->whereIn('project_id', $userProjectIds);
        }

        if ($selectedProjectId) {
            $baseQuery->where('project_id', $selectedProjectId);
        }

        // --- 1. OVERVIEW METRICS ---
        $totalScans = (clone $baseQuery)->where('event_type', ProjectAnalytic::EVENT_QR_SCAN)->count();
        $totalViews = (clone $baseQuery)->where('event_type', ProjectAnalytic::EVENT_SHOWCASE_VIEW)->count();
        $totalDownloads = (clone $baseQuery)->whereIn('event_type', [
            ProjectAnalytic::EVENT_DOWNLOAD_PNG,
            ProjectAnalytic::EVENT_DOWNLOAD_PDF,
            ProjectAnalytic::EVENT_PRINT_FLYER,
        ])->count();
        $uniqueVisitors = (clone $baseQuery)->whereNotNull('ip_address')->distinct('ip_address')->count('ip_address');

        // Calculate comparison with previous period
        $daysDiff = max(1, $startDate->diffInDays($endDate));
        $prevStartDate = $startDate->copy()->subDays($daysDiff);
        $prevEndDate = $startDate->copy()->subSecond();

        $prevQuery = ProjectAnalytic::query()
            ->whereBetween('created_at', [$prevStartDate, $prevEndDate]);

        if (! empty($userProjectIds)) {
            $prevQuery->whereIn('project_id', $userProjectIds);
        }
        if ($selectedProjectId) {
            $prevQuery->where('project_id', $selectedProjectId);
        }

        $prevScans = (clone $prevQuery)->where('event_type', ProjectAnalytic::EVENT_QR_SCAN)->count();
        $prevViews = (clone $prevQuery)->where('event_type', ProjectAnalytic::EVENT_SHOWCASE_VIEW)->count();
        $prevDownloads = (clone $prevQuery)->whereIn('event_type', [
            ProjectAnalytic::EVENT_DOWNLOAD_PNG,
            ProjectAnalytic::EVENT_DOWNLOAD_PDF,
            ProjectAnalytic::EVENT_PRINT_FLYER,
        ])->count();

        $calcGrowth = function (int $current, int $prev): float {
            if ($prev === 0) {
                return $current > 0 ? 100.0 : 0.0;
            }

            return round((($current - $prev) / $prev) * 100, 1);
        };

        // --- 2. TIME-SERIES DAILY CHART ---
        $driver = DB::getDriverName();
        $dateSql = match ($driver) {
            'sqlite' => "strftime('%Y-%m-%d', created_at)",
            'pgsql' => "to_char(created_at, 'YYYY-MM-DD')",
            default => "DATE_FORMAT(created_at, '%Y-%m-%d')",
        };

        $hourSql = match ($driver) {
            'sqlite' => "strftime('%H', created_at)",
            'pgsql' => "to_char(created_at, 'HH24')",
            default => "DATE_FORMAT(created_at, '%H')",
        };

        $dailyRecords = (clone $baseQuery)
            ->select([
                DB::raw("{$dateSql} as date"),
                'event_type',
                DB::raw('COUNT(*) as total'),
            ])
            ->groupBy('date', 'event_type')
            ->orderBy('date')
            ->get();

        $chartTimeline = [];
        $chartPeriod = $period === 'all'
            ? CarbonPeriod::create($startDate->copy()->max(now()->subDays(60)), '1 day', $endDate)
            : CarbonPeriod::create($startDate, '1 day', $endDate);

        foreach ($chartPeriod as $date) {
            $dateStr = $date->format('Y-m-d');
            $displayDate = $date->format('d M');
            $chartTimeline[$dateStr] = [
                'date' => $dateStr,
                'label' => $displayDate,
                'qr_scans' => 0,
                'showcase_views' => 0,
                'downloads' => 0,
                'total' => 0,
            ];
        }

        foreach ($dailyRecords as $record) {
            $d = (string) $record->date;
            if (isset($chartTimeline[$d])) {
                if ($record->event_type === ProjectAnalytic::EVENT_QR_SCAN) {
                    $chartTimeline[$d]['qr_scans'] += (int) $record->total;
                } elseif ($record->event_type === ProjectAnalytic::EVENT_SHOWCASE_VIEW) {
                    $chartTimeline[$d]['showcase_views'] += (int) $record->total;
                } elseif (in_array($record->event_type, [ProjectAnalytic::EVENT_DOWNLOAD_PNG, ProjectAnalytic::EVENT_DOWNLOAD_PDF, ProjectAnalytic::EVENT_PRINT_FLYER])) {
                    $chartTimeline[$d]['downloads'] += (int) $record->total;
                }
                $chartTimeline[$d]['total'] += (int) $record->total;
            }
        }

        // --- 3. EXPO / PEAK HOURS DISTRIBUTION (00:00 - 23:00) ---
        $hourlyRecords = (clone $baseQuery)
            ->select([
                DB::raw("{$hourSql} as hour"),
                'event_type',
                DB::raw('COUNT(*) as total'),
            ])
            ->groupBy('hour', 'event_type')
            ->get();

        $hourlyData = [];
        for ($h = 0; $h < 24; $h++) {
            $hourStr = sprintf('%02d', $h);
            $hourlyData[$hourStr] = [
                'hour' => $hourStr,
                'label' => sprintf('%02d:00', $h),
                'scans' => 0,
                'views' => 0,
                'total' => 0,
            ];
        }

        foreach ($hourlyRecords as $record) {
            $h = sprintf('%02d', (int) $record->hour);
            if (isset($hourlyData[$h])) {
                if ($record->event_type === ProjectAnalytic::EVENT_QR_SCAN) {
                    $hourlyData[$h]['scans'] += (int) $record->total;
                } else {
                    $hourlyData[$h]['views'] += (int) $record->total;
                }
                $hourlyData[$h]['total'] += (int) $record->total;
            }
        }

        // --- 4. DEVICE, PLATFORM & BROWSER BREAKDOWN ---
        $deviceBreakdown = (clone $baseQuery)
            ->select('device_type', DB::raw('COUNT(*) as total'))
            ->groupBy('device_type')
            ->pluck('total', 'device_type')
            ->toArray();

        $platformBreakdown = (clone $baseQuery)
            ->select('platform', DB::raw('COUNT(*) as total'))
            ->groupBy('platform')
            ->orderByDesc('total')
            ->take(5)
            ->pluck('total', 'platform')
            ->toArray();

        $browserBreakdown = (clone $baseQuery)
            ->select('browser', DB::raw('COUNT(*) as total'))
            ->groupBy('browser')
            ->orderByDesc('total')
            ->take(5)
            ->pluck('total', 'browser')
            ->toArray();

        // --- 5. TOP LOCATIONS (CITIES) ---
        $locationBreakdown = (clone $baseQuery)
            ->select('city', 'country', DB::raw('COUNT(*) as total'))
            ->whereNotNull('city')
            ->groupBy('city', 'country')
            ->orderByDesc('total')
            ->take(6)
            ->get()
            ->map(function ($item) {
                return [
                    'city' => $item->city,
                    'country' => $item->country,
                    'total' => $item->total,
                ];
            });

        // --- 6. LEADERBOARDS & PROJECT QR BREAKDOWN ---
        // Project QR Performance Breakdown (All projects with metrics in current period)
        $projectsQrBreakdown = Project::whereIn('id', $userProjectIds ?: [0])
            ->withCount([
                'analytics as scans_count' => function ($q) use ($startDate, $endDate) {
                    $q->where('event_type', ProjectAnalytic::EVENT_QR_SCAN)
                        ->whereBetween('created_at', [$startDate, $endDate]);
                },
                'analytics as prev_scans_count' => function ($q) use ($prevStartDate, $prevEndDate) {
                    $q->where('event_type', ProjectAnalytic::EVENT_QR_SCAN)
                        ->whereBetween('created_at', [$prevStartDate, $prevEndDate]);
                },
                'analytics as views_count' => function ($q) use ($startDate, $endDate) {
                    $q->where('event_type', ProjectAnalytic::EVENT_SHOWCASE_VIEW)
                        ->whereBetween('created_at', [$startDate, $endDate]);
                },
            ])
            ->orderByDesc('scans_count')
            ->get(['id', 'name', 'title', 'category', 'slug', 'status', 'main_image'])
            ->map(function ($proj) use ($totalScans, $calcGrowth) {
                $scans = (int) $proj->scans_count;
                $prevScans = (int) $proj->prev_scans_count;
                $views = (int) $proj->views_count;
                $share = $totalScans > 0 ? round(($scans / $totalScans) * 100, 1) : 0;
                $conversion = $views > 0 ? round(($scans / $views) * 100, 1) : 0;

                return [
                    'id' => $proj->id,
                    'name' => $proj->name,
                    'title' => $proj->title,
                    'category' => $proj->category,
                    'slug' => $proj->slug,
                    'status' => $proj->status,
                    'main_image' => $proj->main_image ? asset('storage/'.$proj->main_image) : null,
                    'scans_count' => $scans,
                    'prev_scans_count' => $prevScans,
                    'views_count' => $views,
                    'share_percent' => $share,
                    'conversion_rate' => $conversion,
                    'growth' => $calcGrowth($scans, $prevScans),
                ];
            });

        // Top Most Viewed
        $topViewedProjects = Project::whereIn('id', $userProjectIds ?: [0])
            ->withCount(['analytics as views_count' => function ($q) use ($startDate, $endDate) {
                $q->where('event_type', ProjectAnalytic::EVENT_SHOWCASE_VIEW)
                    ->whereBetween('created_at', [$startDate, $endDate]);
            }])
            ->orderByDesc('views_count')
            ->take(5)
            ->get(['id', 'name', 'title', 'category', 'slug', 'status', 'main_image']);

        // Top Most Scanned via QR
        $topScannedProjects = Project::whereIn('id', $userProjectIds ?: [0])
            ->withCount(['analytics as scans_count' => function ($q) use ($startDate, $endDate) {
                $q->where('event_type', ProjectAnalytic::EVENT_QR_SCAN)
                    ->whereBetween('created_at', [$startDate, $endDate]);
            }])
            ->orderByDesc('scans_count')
            ->take(5)
            ->get(['id', 'name', 'title', 'category', 'slug', 'status', 'main_image']);

        // Top Most Downloaded / Printed
        $topDownloadedProjects = Project::whereIn('id', $userProjectIds ?: [0])
            ->withCount(['analytics as downloads_count' => function ($q) use ($startDate, $endDate) {
                $q->whereIn('event_type', [
                    ProjectAnalytic::EVENT_DOWNLOAD_PNG,
                    ProjectAnalytic::EVENT_DOWNLOAD_PDF,
                    ProjectAnalytic::EVENT_PRINT_FLYER,
                ])->whereBetween('created_at', [$startDate, $endDate]);
            }])
            ->orderByDesc('downloads_count')
            ->take(5)
            ->get(['id', 'name', 'title', 'category', 'slug', 'status', 'main_image']);

        // --- 7. DAY-OF-WEEK DISTRIBUTION (Senin - Minggu) ---
        $dayOfWeekLabels = [
            1 => 'Senin',
            2 => 'Selasa',
            3 => 'Rabu',
            4 => 'Kamis',
            5 => 'Jumat',
            6 => 'Sabtu',
            7 => 'Minggu',
        ];
        $dayOfWeekData = [];
        foreach ($dayOfWeekLabels as $num => $dayName) {
            $dayOfWeekData[$num] = [
                'day' => $num,
                'label' => $dayName,
                'scans' => 0,
                'views' => 0,
                'total' => 0,
            ];
        }

        $allPeriodRecords = (clone $baseQuery)->get(['event_type', 'created_at']);
        foreach ($allPeriodRecords as $rec) {
            $dayNum = (int) $rec->created_at->dayOfWeekIso; // 1 (Mon) - 7 (Sun)
            if (isset($dayOfWeekData[$dayNum])) {
                if ($rec->event_type === ProjectAnalytic::EVENT_QR_SCAN) {
                    $dayOfWeekData[$dayNum]['scans']++;
                } else {
                    $dayOfWeekData[$dayNum]['views']++;
                }
                $dayOfWeekData[$dayNum]['total']++;
            }
        }

        // --- 7. RECENT LIVE SCAN & VIEW EVENTS FEED ---
        $recentEvents = (clone $baseQuery)
            ->with(['project:id,name,title,slug,category'])
            ->latest('id')
            ->take(15)
            ->get()
            ->map(function ($event) {
                return [
                    'id' => $event->id,
                    'event_type' => $event->event_type,
                    'source' => $event->source,
                    'project' => $event->project ? [
                        'id' => $event->project->id,
                        'name' => $event->project->name,
                        'slug' => $event->project->slug,
                        'category' => $event->project->category,
                    ] : null,
                    'device_type' => $event->device_type,
                    'browser' => $event->browser,
                    'platform' => $event->platform,
                    'city' => $event->city,
                    'country' => $event->country,
                    'created_at' => $event->created_at->translatedFormat('d M Y, H:i:s'),
                    'created_at_relative' => $event->created_at->diffForHumans(),
                ];
            });

        // User's project list for filter dropdown
        $projectsList = Project::whereIn('id', $userProjectIds ?: [0])
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'category']);

        return Inertia::render('Admin/Analytics/Index', [
            'metrics' => [
                'total_scans' => $totalScans,
                'scans_growth' => $calcGrowth($totalScans, $prevScans),
                'total_views' => $totalViews,
                'views_growth' => $calcGrowth($totalViews, $prevViews),
                'total_downloads' => $totalDownloads,
                'downloads_growth' => $calcGrowth($totalDownloads, $prevDownloads),
                'unique_visitors' => $uniqueVisitors,
                'qr_conversion_rate' => $totalViews > 0 ? round(($totalScans / $totalViews) * 100, 1) : 0,
            ],
            'timeline' => array_values($chartTimeline),
            'hourly' => array_values($hourlyData),
            'devices' => [
                'types' => $deviceBreakdown,
                'platforms' => $platformBreakdown,
                'browsers' => $browserBreakdown,
            ],
            'locations' => $locationBreakdown,
            'projects_qr_breakdown' => $projectsQrBreakdown,
            'day_of_week' => array_values($dayOfWeekData),
            'leaderboards' => [
                'most_viewed' => $topViewedProjects,
                'most_scanned' => $topScannedProjects,
                'most_downloaded' => $topDownloadedProjects,
            ],
            'recent_events' => $recentEvents,
            'projects_list' => $projectsList,
            'filters' => [
                'period' => $period,
                'project_id' => $selectedProjectId ? (string) $selectedProjectId : 'all',
                'date_from' => $request->input('date_from', $startDate->format('Y-m-d')),
                'date_to' => $request->input('date_to', $endDate->format('Y-m-d')),
            ],
        ]);
    }

    /**
     * QR Code Scan Gateway & Redirect.
     * Records scan analytics and safely forwards visitor to the research project showcase or destination URL.
     */
    public function trackQr(Project $project, Request $request): RedirectResponse
    {
        // Track QR Scan Event
        AnalyticsTracker::trackQrScan($project, $request, [
            'via' => 'qr_gateway',
            'query_params' => $request->query(),
        ]);

        // If custom project external url exists, redirect to it; otherwise redirect to public showcase
        if (! empty($project->project_url)) {
            $destination = $project->project_url;
            if (! preg_match('#^https?://#i', $destination)) {
                $destination = 'https://'.$destination;
            }

            // Append tracking query parameter if not present
            $separator = str_contains($destination, '?') ? '&' : '?';
            $destination .= $separator.'src=qr_scan';

            return redirect()->away($destination);
        }

        return redirect()->route('projects.showcase.show', [
            'project' => $project->slug,
            'src' => 'qr',
        ]);
    }

    /**
     * Export analytics data as CSV file.
     */
    public function exportCsv(Request $request): StreamedResponse
    {
        /** @var User $user */
        $user = Auth::user();
        $userProjectIds = $user->projects()->pluck('id')->toArray();

        $query = ProjectAnalytic::with(['project:id,name,title,slug,category'])
            ->whereIn('project_id', $userProjectIds)
            ->latest('id');

        if ($request->filled('project_id') && $request->input('project_id') !== 'all') {
            $query->where('project_id', (int) $request->input('project_id'));
        }

        if ($request->filled('event_type') && $request->input('event_type') !== 'all') {
            $query->where('event_type', $request->input('event_type'));
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->input('date_from'));
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->input('date_to'));
        }

        $filename = 'stasrg_analytics_'.now()->format('Y-m-d_His').'.csv';

        return response()->streamDownload(function () use ($query) {
            $handle = fopen('php://output', 'w');

            // UTF-8 BOM for Excel compatibility
            fwrite($handle, "\xEF\xBB\xBF");

            // CSV Header
            fputcsv($handle, [
                'ID',
                'Waktu (UTC+7)',
                'Tipe Event',
                'Nama Proyek',
                'Kategori Proyek',
                'Sumber (Source)',
                'Perangkat (Device)',
                'Sistem Operasi (Platform)',
                'Browser',
                'Kota',
                'Negara',
                'IP Address',
                'User Agent',
            ]);

            $query->chunk(250, function ($records) use ($handle) {
                foreach ($records as $record) {
                    fputcsv($handle, [
                        $record->id,
                        $record->created_at->format('Y-m-d H:i:s'),
                        $record->event_type,
                        $record->project ? $record->project->name : 'N/A',
                        $record->project ? ($record->project->category ?? 'General') : '-',
                        $record->source ?? '-',
                        ucfirst($record->device_type ?? 'unknown'),
                        $record->platform ?? '-',
                        $record->browser ?? '-',
                        $record->city ?? '-',
                        $record->country ?? '-',
                        $record->ip_address ?? '-',
                        $record->user_agent ?? '-',
                    ]);
                }
            });

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
            'Pragma' => 'no-cache',
            'Expires' => '0',
        ]);
    }
}
