<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ModelVersion extends Model
{
    use HasFactory;

    public const EVENT_CREATED = 'created';

    public const EVENT_UPDATED = 'updated';

    public const EVENT_ROLLBACK = 'rollback';

    public const EVENT_MANUAL_SNAPSHOT = 'manual_snapshot';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'versionable_type',
        'versionable_id',
        'user_id',
        'version_number',
        'event',
        'summary',
        'changes',
        'snapshot',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'changes' => 'array',
            'snapshot' => 'array',
            'version_number' => 'integer',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * The user who made the change.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Polymorphic parent model (Project or ProjectTemplate).
     */
    public function versionable(): MorphTo
    {
        return $this->morphTo();
    }
}
