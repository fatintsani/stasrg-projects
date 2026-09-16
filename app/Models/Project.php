<?php

namespace App\Models;

use App\Traits\HasVersions;
use Database\Factories\ProjectFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class Project extends Model
{
    /** @use HasFactory<ProjectFactory> */
    use HasFactory, HasVersions, SoftDeletes;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'name',
        'slug',
        'category',
        'title',
        'description',
        'subtitle',
        'main_image',
        'benefits',
        'specifications',
        'problem_solution',
        'project_url',
        'qr_code_path',
        'footer_website',
        'footer_instagram',
        'footer_youtube',
        'social_links',
        'footer_logo',
        'partner_logo',
        'partner_logos',
        'research_team',
        'lab_affiliation',
        'patent_number',
        'publication_doi',
        'status',
        'layout_preset',
        'design_style',
        'doc_format',
        'color_theme',
        'print_mode',
        'boilerplate_type',
        'layout_schema',
        'content_en',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'benefits' => 'array',
            'specifications' => 'array',
            'problem_solution' => 'array',
            'social_links' => 'array',
            'partner_logos' => 'array',
            'research_team' => 'array',
            'layout_schema' => 'array',
            'content_en' => 'array',
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
        static::creating(function (Project $project) {
            if (empty($project->slug)) {
                $project->slug = static::generateUniqueSlug($project->name ?: 'project');
            }
        });

        static::updating(function (Project $project) {
            if ($project->isDirty('name') && ! $project->isDirty('slug')) {
                $project->slug = static::generateUniqueSlug($project->name ?: 'project', $project->id);
            }
        });

        static::saved(function () {
            Cache::forget('landing_page_data');
            Cache::forget('landing_published_projects');
            Cache::forget('projects_available_categories');
        });

        static::deleted(function () {
            Cache::forget('landing_page_data');
            Cache::forget('landing_published_projects');
            Cache::forget('projects_available_categories');
        });

        static::restored(function () {
            Cache::forget('landing_page_data');
            Cache::forget('landing_published_projects');
            Cache::forget('projects_available_categories');
        });
    }

    /**
     * Generate a unique slug for the project.
     */
    public static function generateUniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $baseSlug = Str::slug($name) ?: 'project';
        $slug = $baseSlug;
        $counter = 1;

        while (static::withTrashed()->where('slug', $slug)->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $counter++;
            $slug = "{$baseSlug}-{$counter}";
        }

        return $slug;
    }

    /**
     * The user who created this project.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The analytics events associated with this project.
     */
    public function analytics(): HasMany
    {
        return $this->hasMany(ProjectAnalytic::class);
    }
}
