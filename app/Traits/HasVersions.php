<?php

namespace App\Traits;

use App\Models\ModelVersion;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;

/**
 * @mixin Model
 */
trait HasVersions
{
    /**
     * Get all version snapshots for this model.
     */
    public function versions(): MorphMany
    {
        return $this->morphMany(ModelVersion::class, 'versionable')
            ->orderBy('version_number', 'desc');
    }

    /**
     * Get the latest version record.
     */
    public function latestVersion(): ?ModelVersion
    {
        return $this->versions()->first();
    }
}
