<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use App\Services\BackupService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class BackupRestoreTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_access_backup_endpoints(): void
    {
        $this->get('/settings/backup/database')->assertRedirect('/login');
        $this->get('/settings/backup/media')->assertRedirect('/login');
        $this->get('/settings/backup/full')->assertRedirect('/login');
        $this->post('/settings/restore')->assertRedirect('/login');
    }

    public function test_regular_user_cannot_download_backups_or_restore(): void
    {
        $user = User::factory()->create([
            'role' => 'user',
            'status' => User::STATUS_APPROVED,
        ]);

        $this->actingAs($user)->get('/settings/backup/database')->assertRedirect('/login');
        $this->actingAs($user)->get('/settings/backup/media')->assertRedirect('/login');
        $this->actingAs($user)->get('/settings/backup/full')->assertRedirect('/login');
        $this->actingAs($user)->post('/settings/restore')->assertRedirect('/login');
    }

    public function test_admin_can_download_database_backup_sql(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'status' => User::STATUS_APPROVED,
        ]);

        Project::factory()->create(['title' => 'Sample Research Alpha']);

        $response = $this->actingAs($admin)->get('/settings/backup/database');

        $response->assertOk();
        $response->assertHeader('content-type', 'application/sql');
        $this->assertStringContainsString('attachment; filename=stasrg_db_snapshot_', (string) $response->headers->get('content-disposition'));
    }

    public function test_admin_can_download_media_backup_zip(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'status' => User::STATUS_APPROVED,
        ]);

        // Place a test file in public storage
        Storage::disk('public')->put('media_assets/sample.txt', 'test content');

        $response = $this->actingAs($admin)->get('/settings/backup/media');

        $response->assertOk();
        $response->assertHeader('content-type', 'application/zip');
        $this->assertStringContainsString('attachment; filename=stasrg_media_assets_', (string) $response->headers->get('content-disposition'));
    }

    public function test_admin_can_download_full_backup_bundle_zip(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'status' => User::STATUS_APPROVED,
        ]);

        Project::factory()->create(['title' => 'Smart Drying Robot']);

        $response = $this->actingAs($admin)->get('/settings/backup/full');

        $response->assertOk();
        $response->assertHeader('content-type', 'application/zip');
        $this->assertStringContainsString('attachment; filename=stasrg_full_snapshot_', (string) $response->headers->get('content-disposition'));
    }

    public function test_settings_page_contains_backup_summary(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'status' => User::STATUS_APPROVED,
        ]);

        $response = $this->actingAs($admin)->get('/settings');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Settings')
            ->has('backupSummary')
            ->where('backupSummary.tables_count', fn ($val) => is_numeric($val) && $val > 0)
        );
    }

    public function test_admin_can_restore_database_from_sql_file(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'status' => User::STATUS_APPROVED,
        ]);

        // Generate a valid SQL snapshot using service
        $backupService = app(BackupService::class);
        $sqlDump = $backupService->generateSqlDump();

        $tempSql = tempnam(sys_get_temp_dir(), 'test_sql_');
        file_put_contents($tempSql, $sqlDump);

        $uploadedFile = new UploadedFile(
            $tempSql,
            'test_snapshot.sql',
            'application/sql',
            null,
            true
        );

        $response = $this->actingAs($admin)->post('/settings/restore', [
            'backup_file' => $uploadedFile,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        if (file_exists($tempSql)) {
            @unlink($tempSql);
        }
    }

    public function test_admin_can_restore_from_zip_bundle(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'status' => User::STATUS_APPROVED,
        ]);

        $backupService = app(BackupService::class);
        $zipPath = $backupService->createFullBundleFile();

        $uploadedFile = new UploadedFile(
            $zipPath,
            'full_snapshot.zip',
            'application/zip',
            null,
            true
        );

        $response = $this->actingAs($admin)->post('/settings/restore', [
            'backup_file' => $uploadedFile,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        if (file_exists($zipPath)) {
            @unlink($zipPath);
        }
    }
}
