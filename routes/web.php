<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\AdminAiAssistantController;
use App\Http\Controllers\AdminNotificationController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\Auth\PasskeyController;
use App\Http\Controllers\Auth\PasswordResetOtpController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MediaAssetController;
use App\Http\Controllers\ModelVersionController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ProjectTemplateController;
use App\Http\Controllers\PublicAiChatController;
use App\Http\Controllers\PublicCatalogController;
use App\Http\Controllers\ResearcherController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\SupportTicketController;
use App\Http\Controllers\UserController;
use App\Models\Project;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

// Landing & Legal Pages
Route::get('/', function () {
    $data = Cache::remember('landing_page_data', 300, function () {
        $publishedProjects = [];

        if (Schema::hasTable('projects')) {
            $publishedProjects = Project::where('status', 'published')
                ->latest()
                ->get()
                ->map(function ($project) {
                    return [
                        'id' => $project->id,
                        'name' => $project->name,
                        'slug' => $project->slug,
                        'category' => $project->category ?? 'General',
                        'title' => $project->title,
                        'subtitle' => $project->subtitle,
                        'description' => $project->description,
                        'main_image' => $project->main_image ? asset('storage/'.$project->main_image) : null,
                        'benefits' => $project->benefits,
                        'specifications' => $project->specifications,
                        'problem_solution' => $project->problem_solution,
                        'project_url' => $project->project_url,
                        'qr_code_path' => $project->qr_code_path ? asset('storage/'.$project->qr_code_path) : null,
                        'partner_logo' => $project->partner_logo ? asset('storage/'.$project->partner_logo) : null,
                        'partner_logos' => ! empty($project->partner_logos) && is_array($project->partner_logos)
                            ? array_map(fn ($p) => str_starts_with($p, 'http') ? $p : asset('storage/'.$p), $project->partner_logos)
                            : ($project->partner_logo ? [asset('storage/'.$project->partner_logo)] : []),
                        'footer_website' => $project->footer_website,
                        'footer_instagram' => $project->footer_instagram,
                        'footer_youtube' => $project->footer_youtube,
                        'layout_preset' => $project->layout_preset ?? 'balanced',
                        'status' => $project->status,
                        'created_at' => $project->created_at->format('d M Y'),
                        'updated_at' => $project->updated_at->format('d M Y'),
                    ];
                })
                ->all();
        }

        $stats = [
            'total_projects' => 0,
            'published_projects' => 0,
            'categories_count' => 0,
            'total_users' => 0,
        ];

        if (Schema::hasTable('projects')) {
            $stats['total_projects'] = Project::count();
            $stats['published_projects'] = Project::where('status', 'published')->count();
            $stats['categories_count'] = Project::distinct('category')->whereNotNull('category')->where('category', '!=', '')->count('category') ?: 1;
        }

        if (Schema::hasTable('users')) {
            $stats['total_users'] = User::count();
        }

        return [
            'publishedProjects' => $publishedProjects,
            'stats' => $stats,
        ];
    });

    return Inertia::render('Welcome', [
        'publishedProjects' => $data['publishedProjects'],
        'stats' => $data['stats'],
    ]);
})->name('home');

// Public Interactive Research Catalog & Explorer
Route::get('/katalog', [PublicCatalogController::class, 'index'])->name('public.catalog');
Route::get('/catalog', [PublicCatalogController::class, 'index']);
Route::get('/showcase', [PublicCatalogController::class, 'index'])->name('public.showcase');
Route::get('/jelajah', [PublicCatalogController::class, 'index']);

// Public Project Detail Page for Published Projects
Route::get('/showcase/{project:slug}', [ProjectController::class, 'publicShow'])->name('projects.showcase.show');
Route::get('/riset/{project:slug}', [ProjectController::class, 'publicShow'])->name('projects.riset.show');

// Public QR Code Scan Tracking Gateway & Redirect
Route::get('/qr/{project:slug}', [AnalyticsController::class, 'trackQr'])
    ->middleware('throttle:120,1')
    ->name('qr.track');

// Public Tracking for Export / Print actions
Route::post('/activity-logs/track-export', [ActivityLogController::class, 'trackExport'])
    ->middleware('throttle:30,1')
    ->name('activity-logs.track-export');

Route::get('/privacy', function () {
    return Inertia::render('Privacy');
})->name('privacy');

Route::get('/terms', function () {
    return Inertia::render('Terms');
})->name('terms');

// Public Support & Helpdesk Page and Submission
Route::get('/support', function () {
    return Inertia::render('Support');
})->name('support');

// Public Documentation Page
Route::get('/documentation', function () {
    return Inertia::render('Documentation');
})->name('documentation');
Route::get('/dokumentasi', function () {
    return Inertia::render('Documentation');
});

// Public Developer & Research Team Page
Route::get('/team', function () {
    return Inertia::render('Team');
})->name('team');
Route::get('/developer-team', function () {
    return Inertia::render('Team');
});

// Public NARA AI Introduction Page
Route::get('/nara', function () {
    return Inertia::render('Nara');
})->name('nara');
Route::get('/kenalan-nara', function () {
    return Inertia::render('Nara');
});

Route::post('/support/submit', [SupportTicketController::class, 'submit'])
    ->middleware('throttle:10,1')
    ->name('support.submit');

Route::post('/support/track/verify', [SupportTicketController::class, 'verifyTicket'])
    ->middleware('throttle:20,1')
    ->name('support.track.verify');

Route::get('/support/ticket/{ticketNumber}', [SupportTicketController::class, 'showPublicTicket'])
    ->name('support.ticket.show');

Route::post('/support/ticket/{ticketNumber}/reply', [SupportTicketController::class, 'publicReply'])
    ->middleware('throttle:20,1')
    ->name('support.ticket.reply');

Route::get('/api/support-tickets/{ticketNumber}/messages', [SupportTicketController::class, 'getMessages'])
    ->middleware('throttle:120,1')
    ->name('api.support-tickets.messages');

// Public AI Chat Assistant
Route::post('/api/ai/public-chat', [PublicAiChatController::class, 'chat'])
    ->middleware('throttle:60,1')
    ->name('api.ai.public-chat');

// Guest Authentication Routes
Route::middleware('guest')->group(function () {
    // Login
    Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('/login', [AuthenticatedSessionController::class, 'store'])
        ->middleware('throttle:6,1')
        ->name('login.store');

    // Register / Create User
    Route::get('/register', [RegisteredUserController::class, 'create'])->name('register');
    Route::post('/register', [RegisteredUserController::class, 'store'])
        ->middleware('throttle:6,1')
        ->name('register.store');

    // Google OAuth
    Route::get('/auth/google/redirect', [GoogleAuthController::class, 'redirect'])->name('auth.google.redirect');
    Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback'])->name('auth.google.callback');

    // Forgot Password & Mailpit OTP
    Route::get('/forgot-password', [PasswordResetOtpController::class, 'create'])->name('password.request');
    Route::post('/forgot-password/send-otp', [PasswordResetOtpController::class, 'sendOtp'])
        ->middleware('throttle:5,1')
        ->name('password.send-otp');
    Route::post('/forgot-password/verify-otp', [PasswordResetOtpController::class, 'verifyOtp'])
        ->middleware('throttle:10,1')
        ->name('password.verify-otp');

    // Reset Password
    Route::get('/reset-password/{token?}', [PasswordResetOtpController::class, 'showReset'])->name('password.reset');
    Route::post('/reset-password', [PasswordResetOtpController::class, 'resetPassword'])
        ->middleware('throttle:5,1')
        ->name('password.update');

    // Passkey / Biometric WebAuthn Authentication
    Route::get('/auth/passkey/challenge', [PasskeyController::class, 'challenge'])->name('auth.passkey.challenge');
    Route::post('/auth/passkey/verify', [PasskeyController::class, 'verify'])
        ->middleware('throttle:10,1')
        ->name('auth.passkey.verify');
});

// Authenticated & Approved Routes
Route::middleware(['auth', 'approved'])->group(function () {
    // Admin Dashboard & Global Search
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/search/global', [DashboardController::class, 'globalSearch'])
        ->middleware('throttle:60,1')
        ->name('admin.global-search');

    // Admin Notifications
    Route::get('/admin/notifications', [AdminNotificationController::class, 'index'])->name('admin.notifications.index');
    Route::post('/admin/notifications/mark-all-read', [AdminNotificationController::class, 'markAllAsRead'])->name('admin.notifications.mark-all-read');
    Route::post('/admin/notifications/{id}/read', [AdminNotificationController::class, 'markAsRead'])->name('admin.notifications.read');
    Route::delete('/admin/notifications/{id}', [AdminNotificationController::class, 'destroy'])->name('admin.notifications.destroy');
    Route::delete('/admin/notifications', [AdminNotificationController::class, 'clearAll'])->name('admin.notifications.clear-all');

    // NARA AI Assistant for Admin
    Route::get('/ai-assistant', [AdminAiAssistantController::class, 'index'])->name('admin.ai-assistant.index');
    Route::post('/ai-assistant/chat', [AdminAiAssistantController::class, 'chat'])
        ->middleware('throttle:60,1')
        ->name('admin.ai-assistant.chat');
    Route::post('/ai-assistant/smart-assist', [AdminAiAssistantController::class, 'smartAssist'])
        ->middleware('throttle:40,1')
        ->name('admin.ai-assistant.smart-assist');

    // Project Management
    Route::resource('projects', ProjectController::class);
    Route::post('/projects/{project}/duplicate', [ProjectController::class, 'duplicate'])->name('projects.duplicate');
    Route::get('/projects/{project}/versions', [ModelVersionController::class, 'projectVersions'])->name('projects.versions.index');
    Route::post('/projects/{project}/versions/{version}/rollback', [ModelVersionController::class, 'projectRollback'])->name('projects.versions.rollback');
    Route::post('/projects/ai-generate', [ProjectController::class, 'aiGenerateProject'])
        ->middleware('throttle:20,1')
        ->name('projects.ai-generate');
    Route::post('/projects/ai-section', [ProjectController::class, 'aiPolishSection'])
        ->middleware('throttle:40,1')
        ->name('projects.ai-section');
    Route::post('/projects/ai-translate', [ProjectController::class, 'aiTranslateProject'])
        ->middleware('throttle:20,1')
        ->name('projects.ai-translate');
    Route::post('/projects/ai-smart-assist', [ProjectController::class, 'aiSmartAssist'])
        ->middleware('throttle:30,1')
        ->name('projects.ai-smart-assist');

    // Project Template Management & Custom Template Builder
    Route::resource('templates', ProjectTemplateController::class);
    Route::post('/templates/{template}/duplicate', [ProjectTemplateController::class, 'duplicate'])->name('templates.duplicate');
    Route::get('/templates/{template}/versions', [ModelVersionController::class, 'templateVersions'])->name('templates.versions.index');
    Route::post('/templates/{template}/versions/{version}/rollback', [ModelVersionController::class, 'templateRollback'])->name('templates.versions.rollback');
    Route::post('/templates/save-from-project', [ProjectTemplateController::class, 'saveFromProject'])->name('templates.save-from-project');
    Route::get('/api/templates', [ProjectTemplateController::class, 'apiList'])->name('api.templates.index');

    // User & Approval Management
    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::post('/users', [UserController::class, 'store'])->name('users.store');
    Route::post('/users/{user}/approve', [UserController::class, 'approve'])->name('users.approve');
    Route::post('/users/{user}/reject', [UserController::class, 'reject'])->name('users.reject');
    Route::post('/users/{user}/toggle-status', [UserController::class, 'toggleStatus'])->name('users.toggle-status');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');

    // Activity & Audit Logs
    Route::get('/activity-logs', [ActivityLogController::class, 'index'])->name('activity-logs.index');
    Route::get('/activity-logs/export-csv', [ActivityLogController::class, 'exportCsv'])->name('activity-logs.export-csv');
    Route::post('/activity-logs/prune', [ActivityLogController::class, 'destroyOld'])->name('activity-logs.prune');

    // Analytics & Insights
    Route::get('/analytics', [AnalyticsController::class, 'index'])->name('analytics.index');
    Route::get('/analytics/export-csv', [AnalyticsController::class, 'exportCsv'])->name('analytics.export-csv');

    // Media & Asset Library (Verified Partner Logos & Icon Bank)
    Route::get('/media-library', [MediaAssetController::class, 'index'])->name('media-assets.index');
    Route::post('/media-library', [MediaAssetController::class, 'store'])->name('media-assets.store');
    Route::match(['put', 'post'], '/media-library/{mediaAsset}', [MediaAssetController::class, 'update'])->name('media-assets.update');
    Route::delete('/media-library/{mediaAsset}', [MediaAssetController::class, 'destroy'])->name('media-assets.destroy');
    Route::get('/api/media-assets', [MediaAssetController::class, 'apiList'])->name('api.media-assets.index');

    // Master Direktori Peneliti & Authors
    Route::get('/researchers', [ResearcherController::class, 'index'])->name('researchers.index');
    Route::post('/researchers', [ResearcherController::class, 'store'])->name('researchers.store');
    Route::match(['put', 'post'], '/researchers/{researcher}', [ResearcherController::class, 'update'])->name('researchers.update');
    Route::delete('/researchers/{researcher}', [ResearcherController::class, 'destroy'])->name('researchers.destroy');
    Route::get('/api/researchers', [ResearcherController::class, 'apiList'])->name('api.researchers.index');
    Route::post('/api/researchers/quick-store', [ResearcherController::class, 'quickStore'])->name('api.researchers.quick-store');

    // Support & Helpdesk Tickets
    Route::get('/support-tickets', [SupportTicketController::class, 'index'])->name('support-tickets.index');
    Route::get('/support-tickets/export-csv', [SupportTicketController::class, 'exportCsv'])->name('support-tickets.export-csv');
    Route::get('/support-tickets/{ticket}', [SupportTicketController::class, 'show'])->name('support-tickets.show');
    Route::put('/support-tickets/{ticket}', [SupportTicketController::class, 'update'])->name('support-tickets.update');
    Route::post('/support-tickets/{ticket}/reply', [SupportTicketController::class, 'reply'])->name('support-tickets.reply');
    Route::delete('/support-tickets/{ticket}', [SupportTicketController::class, 'destroy'])->name('support-tickets.destroy');

    // Settings & Configuration
    Route::get('/settings', [SettingsController::class, 'index'])->name('settings');
    Route::post('/settings/profile', [SettingsController::class, 'updateProfile'])->name('settings.profile.update');
    Route::post('/settings/password', [SettingsController::class, 'updatePassword'])->name('settings.password.update');
    Route::post('/settings/font', [SettingsController::class, 'updateAppFont'])->name('settings.font.update');
    Route::post('/settings/ai', [SettingsController::class, 'updateAiSettings'])->name('settings.ai.update');
    Route::post('/settings/ai/test', [SettingsController::class, 'testAiConnection'])
        ->middleware('throttle:10,1')
        ->name('settings.ai.test');
    Route::post('/settings/maintenance/toggle', [SettingsController::class, 'toggleMaintenance'])->name('settings.maintenance.toggle');
    Route::post('/settings/maintenance/clear-cache', [SettingsController::class, 'clearCache'])->name('settings.maintenance.clear-cache');
    Route::post('/settings/maintenance/optimize', [SettingsController::class, 'optimizeSystem'])->name('settings.maintenance.optimize');
    Route::delete('/settings/avatar', [SettingsController::class, 'removeAvatar'])->name('settings.avatar.destroy');

    // System Backup & Snapshot Center
    Route::get('/settings/backup/database', [SettingsController::class, 'downloadDatabaseBackup'])->name('settings.backup.database');
    Route::get('/settings/backup/media', [SettingsController::class, 'downloadMediaBackup'])->name('settings.backup.media');
    Route::get('/settings/backup/full', [SettingsController::class, 'downloadFullBackup'])->name('settings.backup.full');
    Route::post('/settings/restore', [SettingsController::class, 'restoreBackup'])->name('settings.restore');

    // Account & Passkey
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
    Route::get('/auth/passkey/register-options', [PasskeyController::class, 'registerOptions'])->name('auth.passkey.register-options');
    Route::post('/auth/passkey/register', [PasskeyController::class, 'registerPasskey'])->name('auth.passkey.register');
    Route::delete('/auth/passkey/{passkey}', [PasskeyController::class, 'destroyPasskey'])->name('auth.passkey.destroy');
});
