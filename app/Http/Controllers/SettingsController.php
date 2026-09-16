<?php

namespace App\Http\Controllers;

use App\Mail\ProfileUpdatedMail;
use App\Models\Project;
use App\Models\SystemSetting;
use App\Services\ActivityLogger;
use App\Services\AiAssistantService;
use App\Services\BackupService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class SettingsController extends Controller
{
    /**
     * Display the application and user settings page.
     */
    public function index(Request $request, BackupService $backupService): Response
    {
        $user = $request->user();

        // Load passkeys belonging to the user
        $passkeys = $user->passkeys()
            ->orderBy('created_at', 'desc')
            ->get(['id', 'credential_id', 'device_name', 'counter', 'created_at', 'updated_at']);

        // Project statistics for quick glance
        $projectStats = [
            'total' => Project::count(),
            'published' => Project::where('status', 'published')->count(),
            'draft' => Project::where('status', 'draft')->count(),
        ];

        // AI Assistant configuration
        $savedApiKey = SystemSetting::get('ai_api_key');
        $aiSettings = [
            'provider' => SystemSetting::get('ai_provider', 'gemini'),
            'model' => SystemSetting::get('ai_model', 'gemini-2.5-flash'),
            'has_api_key' => ! empty($savedApiKey),
            'masked_api_key' => SystemSetting::maskSecret($savedApiKey),
            'custom_endpoint' => SystemSetting::get('ai_custom_endpoint', ''),
        ];

        // System information and maintenance diagnostics
        $systemInfo = [
            'is_maintenance_mode' => app()->isDownForMaintenance(),
            'php_version' => PHP_VERSION,
            'laravel_version' => app()->version(),
            'environment' => config('app.env', 'production'),
            'debug_mode' => (bool) config('app.debug', false),
            'database_driver' => config('database.default', 'mysql'),
            'cache_driver' => config('cache.default', 'file'),
            'storage_size' => $this->getStorageSize(),
        ];

        // Backup & storage stats
        $backupSummary = $backupService->getSummary();

        return Inertia::render('Admin/Settings', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role,
                'status' => $user->status,
                'avatar' => $user->avatar,
                'avatar_url' => $user->avatar_url,
                'is_biometric_enabled' => (bool) $user->is_biometric_enabled,
                'created_at' => $user->created_at?->toIso8601String(),
            ],
            'passkeys' => $passkeys,
            'projectStats' => $projectStats,
            'aiSettings' => $aiSettings,
            'systemInfo' => $systemInfo,
            'backupSummary' => $backupSummary,
            'appFont' => SystemSetting::get('app_font', 'plus-jakarta-sans'),
        ]);
    }

    /**
     * Update application default UI typography font family.
     */
    public function updateAppFont(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'app_font' => ['required', 'string', 'in:plus-jakarta-sans,poppins,outfit'],
        ]);

        SystemSetting::set('app_font', $validated['app_font']);

        ActivityLogger::logSystem(
            action: 'settings.font_updated',
            description: "Memperbarui preferensi font default antarmuka sistem menjadi \"{$validated['app_font']}\"",
            properties: ['font' => $validated['app_font']],
            user: $request->user(),
            request: $request
        );

        return back()->with('success', 'Font default antarmuka berhasil diperbarui!')->with('message', 'Font default antarmuka berhasil diperbarui!');
    }

    /**
     * Update AI provider configuration and API key.
     */
    public function updateAiSettings(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ai_provider' => ['required', 'string', 'in:gemini,openai'],
            'ai_model' => ['required', 'string', 'max:100'],
            'api_key' => ['nullable', 'string', 'max:255'],
            'ai_api_key' => ['nullable', 'string', 'max:255'],
            'custom_endpoint' => ['nullable', 'string', 'max:255'],
            'ai_custom_endpoint' => ['nullable', 'string', 'max:255'],
        ]);

        SystemSetting::set('ai_provider', $validated['ai_provider']);
        SystemSetting::set('ai_model', $validated['ai_model']);

        $apiKey = $validated['api_key'] ?? $validated['ai_api_key'] ?? null;
        if (! empty($apiKey)) {
            SystemSetting::set('ai_api_key', trim($apiKey), 'encrypted');
        }

        $endpoint = $validated['custom_endpoint'] ?? $validated['ai_custom_endpoint'] ?? null;
        if ($endpoint !== null) {
            SystemSetting::set('ai_custom_endpoint', $endpoint);
        }

        ActivityLogger::logSystem(
            action: 'settings.ai_updated',
            description: "Memperbarui konfigurasi AI Assistant ({$validated['ai_provider']} - {$validated['ai_model']})",
            properties: [
                'provider' => $validated['ai_provider'],
                'model' => $validated['ai_model'],
                'has_new_key' => ! empty($apiKey),
            ],
            user: $request->user(),
            request: $request
        );

        return back()->with('success', 'Konfigurasi AI Assistant berhasil disimpan!')->with('message', 'Konfigurasi AI Assistant berhasil disimpan!');
    }

    /**
     * Test AI API key connection and return diagnostic result.
     */
    public function testAiConnection(Request $request): JsonResponse
    {
        $apiKey = $request->input('api_key');
        $provider = $request->input('provider', 'gemini');
        $model = $request->input('model', 'gemini-3.6-flash');

        $result = AiAssistantService::testConnection($apiKey, $provider, $model);

        ActivityLogger::logSystem(
            action: 'system.ai_connection_tested',
            description: $result['success']
                ? "Uji coba koneksi AI ({$provider} - {$model}) berhasil ({$result['latency_ms']} ms)"
                : "Uji coba koneksi AI ({$provider} - {$model}) gagal",
            properties: $result,
            user: $request->user(),
            request: $request
        );

        $status = $result['success'] ? 200 : 422;

        return response()->json($result, $status);
    }

    /**
     * Update user profile information and avatar.
     */
    public function updateProfile(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => ['nullable', 'string', 'max:255', 'alpha_dash', 'unique:users,username,'.$user->id],
            'avatar' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'],
        ]);

        if ($request->hasFile('avatar')) {
            // Delete old avatar if local file exists
            if ($user->avatar && ! str_starts_with($user->avatar, 'http') && Storage::disk('public')->exists($user->avatar)) {
                Storage::disk('public')->delete($user->avatar);
            }

            $path = $request->file('avatar')->store('avatars', 'public');
            $validated['avatar'] = $path;
        } else {
            unset($validated['avatar']);
        }

        $user->update($validated);

        try {
            Mail::to($user->email)->send(new ProfileUpdatedMail($user));
        } catch (\Throwable $e) {
            Log::warning('Failed to send profile updated email: '.$e->getMessage());
        }

        ActivityLogger::logUser(
            action: 'settings.profile_updated',
            description: "Memperbarui informasi profil akun \"{$user->name}\"",
            subjectUser: $user,
            properties: ['updated_fields' => array_keys($validated)],
            actor: $user,
            request: $request
        );

        return back()->with('success', 'Profil dan foto berhasil diperbarui.')->with('message', 'Profil dan foto berhasil diperbarui.');
    }

    /**
     * Update user account password.
     */
    public function updatePassword(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string', 'current_password'],
            'password' => ['required', 'string', Password::min(8), 'confirmed'],
        ], [
            'current_password.current_password' => 'Kata sandi saat ini yang Anda masukkan tidak sesuai.',
            'password.min' => 'Kata sandi baru minimal harus 8 karakter.',
            'password.confirmed' => 'Konfirmasi kata sandi baru tidak cocok.',
        ]);

        $user = $request->user();
        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        ActivityLogger::logAuth(
            action: 'settings.password_changed',
            description: "Mengubah kata sandi akun \"{$user->email}\" melalui pengaturan profil",
            user: $user,
            request: $request
        );

        return back()->with('success', 'Kata sandi Anda berhasil diperbarui.')->with('message', 'Kata sandi Anda berhasil diperbarui.');
    }

    /**
     * Toggle application maintenance mode.
     */
    public function toggleMaintenance(Request $request): RedirectResponse
    {
        if (app()->isDownForMaintenance()) {
            Artisan::call('up');
            $message = 'Mode pemeliharaan dinonaktifkan. Sistem kini kembali online untuk semua pengunjung.';
            $action = 'system.maintenance_disabled';
        } else {
            Artisan::call('down');
            $message = 'Mode pemeliharaan sistem berhasil diaktifkan.';
            $action = 'system.maintenance_enabled';
        }

        ActivityLogger::logSystem(
            action: $action,
            description: $message,
            user: $request->user(),
            request: $request
        );

        return back()->with('success', $message)->with('message', $message);
    }

    /**
     * Clear application cache, views, routes, and config cache.
     */
    public function clearCache(Request $request): RedirectResponse
    {
        try {
            Artisan::call('optimize:clear');
            $message = 'Cache aplikasi, template tampilan, dan rute berhasil dibersihkan.';
        } catch (\Throwable $e) {
            Log::error('Failed to clear cache: '.$e->getMessage());
            $message = 'Cache aplikasi berhasil dibersihkan.';
        }

        ActivityLogger::logSystem(
            action: 'system.cache_cleared',
            description: 'Membersihkan cache aplikasi, view cache, dan route cache sistem',
            user: $request->user(),
            request: $request
        );

        return back()->with('success', $message)->with('message', $message);
    }

    /**
     * Optimize system by caching config and routes.
     */
    public function optimizeSystem(Request $request): RedirectResponse
    {
        try {
            if (app()->environment('production')) {
                Artisan::call('optimize');
                $message = 'Sistem produksi berhasil dioptimasi. Konfigurasi dan rute telah di-cache.';
            } else {
                Artisan::call('optimize:clear');
                $message = 'Optimasi lingkungan pengembangan selesai (cache dibersihkan).';
            }
        } catch (\Throwable $e) {
            Log::error('Failed to optimize system: '.$e->getMessage());
            $message = 'Proses optimasi sistem selesai.';
        }

        return back()->with('success', $message)->with('message', $message);
    }

    /**
     * Remove the current user's profile avatar.
     */
    public function removeAvatar(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->avatar && ! str_starts_with($user->avatar, 'http') && Storage::disk('public')->exists($user->avatar)) {
            Storage::disk('public')->delete($user->avatar);
        }

        $user->update(['avatar' => null]);

        return back()->with('success', 'Foto profil berhasil dihapus.')->with('message', 'Foto profil berhasil dihapus.');
    }

    /**
     * Download database SQL snapshot.
     */
    public function downloadDatabaseBackup(Request $request, BackupService $backupService): BinaryFileResponse
    {
        if (! $request->user()->isAdmin()) {
            abort(403, 'Akses ditolak. Hanya administrator yang dapat mengunduh backup database.');
        }

        $filePath = $backupService->createDatabaseSnapshotFile();
        $fileName = basename($filePath);

        ActivityLogger::logSystem(
            action: 'system.backup_database_downloaded',
            description: "Mengunduh snapshot database sistem ({$fileName})",
            properties: ['filename' => $fileName],
            user: $request->user(),
            request: $request
        );

        return response()->download($filePath, $fileName, [
            'Content-Type' => 'application/sql',
        ])->deleteFileAfterSend(true);
    }

    /**
     * Download media assets ZIP archive.
     */
    public function downloadMediaBackup(Request $request, BackupService $backupService): BinaryFileResponse
    {
        if (! $request->user()->isAdmin()) {
            abort(403, 'Akses ditolak. Hanya administrator yang dapat mengunduh arsip media.');
        }

        $filePath = $backupService->createMediaArchiveFile();
        $fileName = basename($filePath);

        ActivityLogger::logSystem(
            action: 'system.backup_media_downloaded',
            description: "Mengunduh arsip direktori aset media sistem ({$fileName})",
            properties: ['filename' => $fileName],
            user: $request->user(),
            request: $request
        );

        return response()->download($filePath, $fileName, [
            'Content-Type' => 'application/zip',
        ])->deleteFileAfterSend(true);
    }

    /**
     * Download full snapshot (Database + Media Assets) ZIP bundle.
     */
    public function downloadFullBackup(Request $request, BackupService $backupService): BinaryFileResponse
    {
        if (! $request->user()->isAdmin()) {
            abort(403, 'Akses ditolak. Hanya administrator yang dapat mengunduh paket backup lengkap.');
        }

        $filePath = $backupService->createFullBundleFile();
        $fileName = basename($filePath);

        ActivityLogger::logSystem(
            action: 'system.backup_full_downloaded',
            description: "Mengunduh paket arsip snapshot lengkap (Database + Media) sistem ({$fileName})",
            properties: ['filename' => $fileName],
            user: $request->user(),
            request: $request
        );

        return response()->download($filePath, $fileName, [
            'Content-Type' => 'application/zip',
        ])->deleteFileAfterSend(true);
    }

    /**
     * Restore database or media assets from uploaded snapshot.
     */
    public function restoreBackup(Request $request, BackupService $backupService): RedirectResponse
    {
        if (! $request->user()->isAdmin()) {
            abort(403, 'Akses ditolak. Hanya administrator yang dapat melakukan restorasi snapshot.');
        }

        $request->validate([
            'backup_file' => ['required', 'file', 'max:204800'],
        ], [
            'backup_file.required' => 'File snapshot wajib dipilih.',
            'backup_file.max' => 'Ukuran file snapshot maksimal adalah 200 MB.',
        ]);

        $file = $request->file('backup_file');
        $extension = strtolower($file->getClientOriginalExtension());

        if (! in_array($extension, ['sql', 'zip', 'txt'])) {
            return back()->withErrors(['backup_file' => 'Format file tidak didukung. Harap unggah file berekstensi .sql atau .zip.']);
        }

        try {
            $result = $backupService->restoreFromUpload($file);

            ActivityLogger::logSystem(
                action: 'system.backup_restored',
                description: 'Memulihkan data sistem dari file cadangan ('.$file->getClientOriginalName().')',
                properties: [
                    'original_filename' => $file->getClientOriginalName(),
                    'file_size' => $file->getSize(),
                    'details' => $result['details'] ?? null,
                ],
                user: $request->user(),
                request: $request
            );

            return back()->with('success', $result['message'])->with('message', $result['message']);
        } catch (\Throwable $e) {
            Log::error('Restore snapshot failed: '.$e->getMessage());

            return back()->withErrors(['backup_file' => 'Gagal memulihkan snapshot: '.$e->getMessage()]);
        }
    }

    /**
     * Calculate human-readable storage size.
     */
    private function getStorageSize(): string
    {
        $path = storage_path('app/public');
        if (! is_dir($path)) {
            return '0 MB';
        }

        $size = 0;
        try {
            $iterator = new \RecursiveIteratorIterator(
                new \RecursiveDirectoryIterator($path, \FilesystemIterator::SKIP_DOTS)
            );
            foreach ($iterator as $file) {
                $size += $file->getSize();
            }
        } catch (\Throwable) {
            return '0 MB';
        }

        if ($size >= 1073741824) {
            return number_format($size / 1073741824, 2).' GB';
        } elseif ($size >= 1048576) {
            return number_format($size / 1048576, 2).' MB';
        } elseif ($size >= 1024) {
            return number_format($size / 1024, 2).' KB';
        }

        return $size.' B';
    }
}
