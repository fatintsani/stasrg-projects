<?php

namespace App\Models;

use App\Traits\HasVersions;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class ProjectTemplate extends Model
{
    use HasFactory, HasVersions;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'name',
        'slug',
        'category',
        'description',
        'design_style',
        'doc_format',
        'layout_preset',
        'color_theme',
        'print_mode',
        'boilerplate_type',
        'lab_affiliation',
        'patent_number',
        'publication_doi',
        'default_data',
        'layout_schema',
        'content_en',
        'preview_image',
        'is_system',
        'usage_count',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'default_data' => 'array',
            'layout_schema' => 'array',
            'content_en' => 'array',
            'is_system' => 'boolean',
            'usage_count' => 'integer',
        ];
    }

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::creating(function (ProjectTemplate $template) {
            if (empty($template->slug)) {
                $template->slug = static::generateUniqueSlug($template->name ?: 'template');
            }
        });

        static::updating(function (ProjectTemplate $template) {
            if ($template->isDirty('name') && ! $template->isDirty('slug')) {
                $template->slug = static::generateUniqueSlug($template->name ?: 'template', $template->id);
            }
        });

        static::saved(function () {
            Cache::forget('project_templates_available_categories');
        });

        static::deleted(function () {
            Cache::forget('project_templates_available_categories');
        });
    }

    /**
     * Generate a unique slug for the template.
     */
    public static function generateUniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $baseSlug = Str::slug($name) ?: 'template';
        $slug = $baseSlug;
        $counter = 1;

        while (static::where('slug', $slug)->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $counter++;
            $slug = "{$baseSlug}-{$counter}";
        }

        return $slug;
    }

    /**
     * Scope query to only system templates.
     */
    public function scopeSystem(Builder $query): Builder
    {
        return $query->where('is_system', true);
    }

    /**
     * Scope query to accessible templates for a given user.
     */
    public function scopeAccessibleFor(Builder $query, ?int $userId): Builder
    {
        return $query->where(function (Builder $q) use ($userId) {
            $q->where('is_system', true);
            if ($userId) {
                $q->orWhere('user_id', $userId);
            }
        });
    }

    /**
     * Increment usage counter.
     */
    public function incrementUsage(): void
    {
        $this->increment('usage_count');
    }

    /**
     * The user who created this custom template.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
