<?php

namespace App\Services;

use App\Models\SystemSetting;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;
use ZipArchive;

class BackupService
{
    /**
     * List of core application tables in dependency-friendly order.
     *
     * @var array<int, string>
     */
    protected array $coreTables = [
        'users',
        'password_reset_otps',
        'password_reset_tokens',
        'passkey_credentials',
        'projects',
        'project_templates',
        'media_assets',
        'researchers',
        'model_versions',
        'activity_logs',
        'project_analytics',
        'support_tickets',
        'support_ticket_replies',
        'admin_notifications',
        'system_settings',
        'migrations',
    ];

    /**
     * Ensure temp directory exists.
     */
    protected function ensureTempDirectory(): string
    {
        $tempDir = storage_path('app/temp_backups');
        if (! File::exists($tempDir)) {
            File::makeDirectory($tempDir, 0755, true);
        }

        return $tempDir;
    }

    /**
     * Get list of application tables to backup.
     *
     * @return array<int, string>
     */
    public function getTables(): array
    {
        $existingTables = [];

        try {
            $rawTables = Schema::getTableListing();
            $driver = DB::connection()->getDriverName();

            foreach ($rawTables as $rawTable) {
                // If table is returned as "database.table_name"
                $tableName = str_contains($rawTable, '.') ? explode('.', $rawTable)[1] : $rawTable;
                // Exclude system cache and queue operational tables if desired, but keep core data
                if (in_array($tableName, ['cache', 'cache_locks', 'jobs', 'job_batches', 'failed_jobs', 'sessions'])) {
                    continue;
                }
                $existingTables[] = $tableName;
            }
        } catch (\Throwable $e) {
            Log::warning('Failed to list tables automatically: '.$e->getMessage());
        }

        // Merge with core tables list to ensure nothing is missed
        $allTables = array_values(array_unique(array_merge($this->coreTables, $existingTables)));

        // Filter only tables that actually exist in the schema
        return array_values(array_filter($allTables, function ($table) {
            try {
                return Schema::hasTable($table);
            } catch (\Throwable) {
                return false;
            }
        }));
    }

    /**
     * Generate SQL dump content as a string.
     */
    public function generateSqlDump(): string
    {
        $tables = $this->getTables();
        $pdo = DB::getPdo();
        $appName = config('app.name', 'STAS RG Generator');
        $timestamp = now()->toIso8601String();
        $dbDriver = DB::connection()->getDriverName();

        $sql = "-- ========================================================\n";
        $sql .= "-- STAS-RG System Database Snapshot\n";
        $sql .= "-- Application: {$appName}\n";
        $sql .= "-- Generated At: {$timestamp}\n";
        $sql .= "-- Database Driver: {$dbDriver}\n";
        $sql .= '-- Tables: '.implode(', ', $tables)."\n";
        $sql .= "-- ========================================================\n\n";

        if ($dbDriver === 'mysql') {
            $sql .= "SET FOREIGN_KEY_CHECKS=0;\n";
            $sql .= "SET SQL_MODE = \"NO_AUTO_VALUE_ON_ZERO\";\n";
            $sql .= "SET time_zone = \"+00:00\";\n\n";
        } elseif ($dbDriver === 'sqlite') {
            $sql .= "PRAGMA foreign_keys = OFF;\n\n";
        }

        foreach ($tables as $table) {
            $count = DB::table($table)->count();
            $sql .= "-- --------------------------------------------------------\n";
            $sql .= "-- Table structure & data for `{$table}` ({$count} rows)\n";
            $sql .= "-- --------------------------------------------------------\n";
            $sql .= "DELETE FROM `{$table}`;\n";

            if ($count === 0) {
                $sql .= "\n";

                continue;
            }

            DB::table($table)->orderBy(Schema::hasColumn($table, 'id') ? 'id' : DB::raw('1'))->chunk(200, function ($rows) use (&$sql, $table, $pdo) {
                foreach ($rows as $row) {
                    $rowArray = (array) $row;
                    $columns = array_keys($rowArray);
                    $escapedColumns = array_map(fn ($col) => "`{$col}`", $columns);

                    $escapedValues = array_map(function ($val) use ($pdo) {
                        if ($val === null) {
                            return 'NULL';
                        }
                        if (is_bool($val)) {
                            return $val ? '1' : '0';
                        }
                        if (is_numeric($val) && ! is_string($val)) {
                            return (string) $val;
                        }

                        return $pdo->quote((string) $val);
                    }, array_values($rowArray));

                    $sql .= 'INSERT INTO `'.$table.'` ('.implode(', ', $escapedColumns).') VALUES ('.implode(', ', $escapedValues).");\n";
                }
            });

            $sql .= "\n";
        }

        if ($dbDriver === 'mysql') {
            $sql .= "SET FOREIGN_KEY_CHECKS=1;\n";
        } elseif ($dbDriver === 'sqlite') {
            $sql .= "PRAGMA foreign_keys = ON;\n";
        }

        $sql .= "-- Dump completed on {$timestamp}\n";

        return $sql;
    }

    /**
     * Create a database snapshot SQL file.
     *
     * @return string Absolute file path
     */
    public function createDatabaseSnapshotFile(): string
    {
        $tempDir = $this->ensureTempDirectory();
        $filename = 'stasrg_db_snapshot_'.now()->format('Y-m-d_His').'.sql';
        $filePath = $tempDir.DIRECTORY_SEPARATOR.$filename;

        $content = $this->generateSqlDump();
        File::put($filePath, $content);

        SystemSetting::set('last_database_backup_at', now()->toIso8601String());

        return $filePath;
    }

    /**
     * Create a ZIP archive of the public storage directory (media_assets, logos, avatars, etc.).
     *
     * @return string Absolute file path
     */
    public function createMediaArchiveFile(): string
    {
        $tempDir = $this->ensureTempDirectory();
        $filename = 'stasrg_media_assets_'.now()->format('Y-m-d_His').'.zip';
        $filePath = $tempDir.DIRECTORY_SEPARATOR.$filename;

        $storagePath = storage_path('app/public');
        if (! File::exists($storagePath)) {
            File::makeDirectory($storagePath, 0755, true);
        }

        $zip = new ZipArchive;
        if ($zip->open($filePath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            throw new \RuntimeException('Gagal membuat arsip ZIP untuk direktori media.');
        }

        $files = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($storagePath, RecursiveDirectoryIterator::SKIP_DOTS),
            RecursiveIteratorIterator::LEAVES_ONLY
        );

        $fileCount = 0;
        foreach ($files as $file) {
            if (! $file->isDir()) {
                $realPath = $file->getRealPath();
                $relativePath = substr($realPath, strlen($storagePath) + 1);
                // Standardize zip entry path separators
                $relativePath = str_replace('\\', '/', $relativePath);
                $zip->addFile($realPath, $relativePath);
                $fileCount++;
            }
        }

        // Add a manifest if storage was empty so ZIP is valid
        if ($fileCount === 0) {
            $zip->addFromString('.stasrg_media_empty', 'Media directory was empty at backup time.');
        }

        $zip->close();

        SystemSetting::set('last_media_backup_at', now()->toIso8601String());

        return $filePath;
    }

    /**
     * Create a full bundle ZIP containing SQL dump and all media assets.
     *
     * @return string Absolute file path
     */
    public function createFullBundleFile(): string
    {
        $tempDir = $this->ensureTempDirectory();
        $filename = 'stasrg_full_snapshot_'.now()->format('Y-m-d_His').'.zip';
        $filePath = $tempDir.DIRECTORY_SEPARATOR.$filename;

        $zip = new ZipArchive;
        if ($zip->open($filePath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            throw new \RuntimeException('Gagal membuat arsip ZIP bundle lengkap.');
        }

        // 1. Add SQL Dump
        $sqlContent = $this->generateSqlDump();
        $zip->addFromString('database_snapshot.sql', $sqlContent);

        // 2. Add Manifest
        $manifest = [
            'application' => config('app.name', 'STAS RG Generator'),
            'version' => '1.0.0',
            'created_at' => now()->toIso8601String(),
            'database_driver' => DB::connection()->getDriverName(),
            'tables_count' => count($this->getTables()),
            'php_version' => PHP_VERSION,
            'laravel_version' => app()->version(),
        ];
        $zip->addFromString('manifest.json', json_encode($manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

        // 3. Add Media Files under "media/"
        $storagePath = storage_path('app/public');
        if (File::exists($storagePath)) {
            $files = new RecursiveIteratorIterator(
                new RecursiveDirectoryIterator($storagePath, RecursiveDirectoryIterator::SKIP_DOTS),
                RecursiveIteratorIterator::LEAVES_ONLY
            );

            foreach ($files as $file) {
                if (! $file->isDir()) {
                    $realPath = $file->getRealPath();
                    $relativePath = 'media/'.str_replace('\\', '/', substr($realPath, strlen($storagePath) + 1));
                    $zip->addFile($realPath, $relativePath);
                }
            }
        }

        $zip->close();

        SystemSetting::set('last_full_backup_at', now()->toIso8601String());

        return $filePath;
    }

    /**
     * Restore database or media assets from an uploaded file (.sql or .zip).
     *
     * @return array<string, mixed> Result summary
     */
    public function restoreFromUpload(UploadedFile $file): array
    {
        $extension = strtolower($file->getClientOriginalExtension());
        $tempDir = $this->ensureTempDirectory();

        if ($extension === 'sql') {
            $sqlContent = File::get($file->getRealPath());

            return $this->executeSqlRestore($sqlContent);
        }

        if ($extension === 'zip') {
            $extractPath = $tempDir.DIRECTORY_SEPARATOR.'restore_'.uniqid();
            File::makeDirectory($extractPath, 0755, true);

            $zip = new ZipArchive;
            if ($zip->open($file->getRealPath()) !== true) {
                throw new \RuntimeException('File ZIP tidak valid atau rusak.');
            }

            $zip->extractTo($extractPath);
            $zip->close();

            $results = [
                'database_restored' => false,
                'media_files_restored' => 0,
            ];

            // 1. Check for database_snapshot.sql or any .sql
            $sqlFiles = File::glob($extractPath.DIRECTORY_SEPARATOR.'*.sql');
            if (! empty($sqlFiles)) {
                $sqlContent = File::get($sqlFiles[0]);
                $sqlResult = $this->executeSqlRestore($sqlContent);
                $results['database_restored'] = $sqlResult['success'];
            }

            // 2. Check for media assets directory
            $mediaSourcePath = File::exists($extractPath.DIRECTORY_SEPARATOR.'media')
                ? $extractPath.DIRECTORY_SEPARATOR.'media'
                : $extractPath;

            $targetStorage = storage_path('app/public');
            if (! File::exists($targetStorage)) {
                File::makeDirectory($targetStorage, 0755, true);
            }

            $files = new RecursiveIteratorIterator(
                new RecursiveDirectoryIterator($mediaSourcePath, RecursiveDirectoryIterator::SKIP_DOTS),
                RecursiveIteratorIterator::LEAVES_ONLY
            );

            foreach ($files as $mediaFile) {
                if (! $mediaFile->isDir()) {
                    $realPath = $mediaFile->getRealPath();
                    $rel = substr($realPath, strlen($mediaSourcePath) + 1);

                    // Skip root sql or json manifest if we are in extract root
                    if (str_ends_with($rel, '.sql') || $rel === 'manifest.json' || str_starts_with($rel, '.stasrg')) {
                        continue;
                    }

                    $destPath = $targetStorage.DIRECTORY_SEPARATOR.$rel;
                    File::ensureDirectoryExists(dirname($destPath));
                    File::copy($realPath, $destPath);
                    $results['media_files_restored']++;
                }
            }

            // Clean up extraction folder
            File::deleteDirectory($extractPath);

            return [
                'success' => true,
                'message' => 'Restorasi snapshot berhasil diselesaikan.',
                'details' => $results,
            ];
        }

        throw new \InvalidArgumentException('Format file tidak didukung. Harap unggah file .sql atau .zip.');
    }

    /**
     * Execute SQL statements with foreign key toggling.
     *
     * @return array<string, mixed>
     */
    protected function executeSqlRestore(string $sqlContent): array
    {
        $dbDriver = DB::connection()->getDriverName();

        try {
            DB::transaction(function () use ($sqlContent, $dbDriver) {
                if ($dbDriver === 'mysql') {
                    DB::statement('SET FOREIGN_KEY_CHECKS=0;');
                } elseif ($dbDriver === 'sqlite') {
                    DB::statement('PRAGMA foreign_keys = OFF;');
                }

                DB::unprepared($sqlContent);

                if ($dbDriver === 'mysql') {
                    DB::statement('SET FOREIGN_KEY_CHECKS=1;');
                } elseif ($dbDriver === 'sqlite') {
                    DB::statement('PRAGMA foreign_keys = ON;');
                }
            });

            return [
                'success' => true,
                'message' => 'Database berhasil dipulihkan dari snapshot SQL.',
            ];
        } catch (\Throwable $e) {
            Log::error('Restore SQL error: '.$e->getMessage(), ['trace' => $e->getTraceAsString()]);
            throw new \RuntimeException('Gagal mengeksekusi restorasi SQL: '.$e->getMessage());
        }
    }

    /**
     * Get backup and storage diagnostic summary.
     *
     * @return array<string, mixed>
     */
    public function getSummary(): array
    {
        $tables = $this->getTables();
        $totalRows = 0;
        foreach ($tables as $table) {
            try {
                $totalRows += DB::table($table)->count();
            } catch (\Throwable) {
                // Ignore missing table during count
            }
        }

        $storagePath = storage_path('app/public');
        $mediaFilesCount = 0;
        $mediaSizeBytes = 0;

        if (File::exists($storagePath)) {
            $files = new RecursiveIteratorIterator(
                new RecursiveDirectoryIterator($storagePath, RecursiveDirectoryIterator::SKIP_DOTS),
                RecursiveIteratorIterator::LEAVES_ONLY
            );

            foreach ($files as $file) {
                if (! $file->isDir()) {
                    $mediaFilesCount++;
                    $mediaSizeBytes += $file->getSize();
                }
            }
        }

        return [
            'tables_count' => count($tables),
            'total_records' => $totalRows,
            'media_files_count' => $mediaFilesCount,
            'media_size_formatted' => $this->formatBytes($mediaSizeBytes),
            'last_database_backup' => SystemSetting::get('last_database_backup_at'),
            'last_media_backup' => SystemSetting::get('last_media_backup_at'),
            'last_full_backup' => SystemSetting::get('last_full_backup_at'),
        ];
    }

    /**
     * Format bytes into human-readable representation.
     */
    protected function formatBytes(int $bytes): string
    {
        if ($bytes >= 1073741824) {
            return number_format($bytes / 1073741824, 2).' GB';
        } elseif ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2).' MB';
        } elseif ($bytes >= 1024) {
            return number_format($bytes / 1024, 2).' KB';
        }

        return $bytes.' B';
    }
}
