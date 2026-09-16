<?php

namespace App\Services;

use App\Models\ModelVersion;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class VersionService
{
    /**
     * Fields ignored when computing diffs or saving snapshots.
     *
     * @var list<string>
     */
    protected static array $ignoredAttributes = [
        'id',
        'created_at',
        'updated_at',
        'deleted_at',
        'usage_count',
    ];

    /**
     * Map attribute keys to human-friendly labels (Indonesian).
     */
    public static array $attributeLabels = [
        'name' => 'Nama Proyek / Template',
        'title' => 'Judul Utama',
        'subtitle' => 'Subjudul',
        'category' => 'Kategori',
        'description' => 'Deskripsi / Ringkasan',
        'main_image' => 'Gambar Utama',
        'benefits' => 'Manfaat & Keunggulan',
        'specifications' => 'Spesifikasi & Fitur Teknis',
        'problem_solution' => 'Masalah & Solusi Inovasi',
        'project_url' => 'Tautan / URL Proyek',
        'footer_website' => 'Website Footer',
        'footer_instagram' => 'Instagram Footer',
        'footer_youtube' => 'YouTube Footer',
        'social_links' => 'Media Sosial',
        'partner_logo' => 'Logo Mitra Utama',
        'partner_logos' => 'Daftar Logo Mitra',
        'research_team' => 'Tim Peneliti',
        'lab_affiliation' => 'Afiliasi Laboratorium',
        'patent_number' => 'Nomor Paten',
        'publication_doi' => 'DOI Publikasi',
        'layout_preset' => 'Preset Tata Letak',
        'design_style' => 'Gaya Desain',
        'doc_format' => 'Format Dokumen',
        'color_theme' => 'Tema Warna',
        'print_mode' => 'Mode Cetak',
        'boilerplate_type' => 'Tipe Kop/Boilerplate',
        'layout_schema' => 'Skema Tata Letak Dinamis',
        'content_en' => 'Konten Bahasa Inggris',
        'status' => 'Status Publikasi',
        'default_data' => 'Data Bawaan Template',
        'preview_image' => 'Gambar Pratinjau',
    ];

    /**
     * Record a snapshot version for a given model.
     */
    public function recordVersion(
        Model $model,
        ?User $user = null,
        string $event = ModelVersion::EVENT_UPDATED,
        ?string $summary = null,
        ?array $explicitChanges = null
    ): ModelVersion {
        return DB::transaction(function () use ($model, $user, $event, $summary, $explicitChanges) {
            $latestVersion = ModelVersion::where('versionable_type', get_class($model))
                ->where('versionable_id', $model->getKey())
                ->orderBy('version_number', 'desc')
                ->first();

            $nextVersionNumber = $latestVersion ? ($latestVersion->version_number + 1) : 1;

            $currentSnapshot = $this->extractSnapshot($model);

            $changes = $explicitChanges;
            if ($changes === null && $latestVersion) {
                $changes = $this->calculateDiff($latestVersion->snapshot ?? [], $currentSnapshot);
            }

            if (empty($summary)) {
                if ($event === ModelVersion::EVENT_CREATED) {
                    $summary = 'Versi awal proyek berhasil dibuat';
                } elseif ($event === ModelVersion::EVENT_ROLLBACK) {
                    $summary = 'Rollback ke versi sebelumnya';
                } elseif (! empty($changes)) {
                    $changedFieldNames = array_map(
                        fn ($key) => self::$attributeLabels[$key] ?? ucfirst(str_replace('_', ' ', $key)),
                        array_keys($changes)
                    );
                    $summary = 'Pembaruan: '.implode(', ', array_slice($changedFieldNames, 0, 4));
                    if (count($changedFieldNames) > 4) {
                        $summary .= ' (+'.(count($changedFieldNames) - 4).' lainnya)';
                    }
                } else {
                    $summary = 'Pembaruan data tanpa perubahan konten inti';
                }
            }

            return ModelVersion::create([
                'versionable_type' => get_class($model),
                'versionable_id' => $model->getKey(),
                'user_id' => $user?->id ?? (Auth::id() ?: ($model->user_id ?? null)),
                'version_number' => $nextVersionNumber,
                'event' => $event,
                'summary' => $summary,
                'changes' => $changes ?: null,
                'snapshot' => $currentSnapshot,
            ]);
        });
    }

    /**
     * Rollback a model to a target version.
     */
    public function rollbackTo(Model $model, ModelVersion $targetVersion, ?User $user = null): Model
    {
        if ($targetVersion->versionable_type !== get_class($model) || (int) $targetVersion->versionable_id !== (int) $model->getKey()) {
            throw new \InvalidArgumentException('Target version does not match the model.');
        }

        return DB::transaction(function () use ($model, $targetVersion, $user) {
            $snapshot = $targetVersion->snapshot ?? [];

            // Clean snapshot from internal keys
            $fillableAttributes = array_diff_key($snapshot, array_flip(self::$ignoredAttributes));

            // Apply attributes
            $model->fill($fillableAttributes);
            $model->save();

            // Record this rollback as a new immutable version
            $this->recordVersion(
                model: $model,
                user: $user,
                event: ModelVersion::EVENT_ROLLBACK,
                summary: "Rollback ke Versi v{$targetVersion->version_number}"
            );

            return $model;
        });
    }

    /**
     * Extract attributes from a model into a pure array snapshot.
     *
     * @return array<string, mixed>
     */
    public function extractSnapshot(Model $model): array
    {
        $attributes = $model->attributesToArray();

        foreach (self::$ignoredAttributes as $key) {
            unset($attributes[$key]);
        }

        return $attributes;
    }

    /**
     * Calculate field differences between old and new snapshots.
     *
     * @param  array<string, mixed>  $old
     * @param  array<string, mixed>  $new
     * @return array<string, array{old: mixed, new: mixed, label: string}>
     */
    public function calculateDiff(array $old, array $new): array
    {
        $diff = [];
        $allKeys = array_unique(array_merge(array_keys($old), array_keys($new)));

        foreach ($allKeys as $key) {
            if (in_array($key, self::$ignoredAttributes, true)) {
                continue;
            }

            $oldVal = $old[$key] ?? null;
            $newVal = $new[$key] ?? null;

            if ($this->normalizeForComparison($oldVal) !== $this->normalizeForComparison($newVal)) {
                $diff[$key] = [
                    'label' => self::$attributeLabels[$key] ?? ucfirst(str_replace('_', ' ', $key)),
                    'old' => $oldVal,
                    'new' => $newVal,
                ];
            }
        }

        return $diff;
    }

    /**
     * Normalize values for accurate JSON / array comparison.
     */
    protected function normalizeForComparison(mixed $value): string
    {
        if (is_array($value) || is_object($value)) {
            return json_encode($value);
        }

        return (string) $value;
    }
}
