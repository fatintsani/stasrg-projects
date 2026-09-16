<?php

namespace App\Http\Controllers;

use App\Models\ModelVersion;
use App\Models\Project;
use App\Models\ProjectTemplate;
use App\Services\ActivityLogger;
use App\Services\VersionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ModelVersionController extends Controller
{
    /**
     * Get version history for a project.
     */
    public function projectVersions(Project $project): JsonResponse
    {
        $this->authorizeProjectAccess($project);

        $versions = $project->versions()
            ->with(['user:id,name,email,avatar'])
            ->get()
            ->map(function (ModelVersion $version) {
                return [
                    'id' => $version->id,
                    'version_number' => $version->version_number,
                    'event' => $version->event,
                    'summary' => $version->summary,
                    'changes' => $version->changes,
                    'snapshot' => $version->snapshot,
                    'created_at' => $version->created_at->toISOString(),
                    'created_at_formatted' => $version->created_at->translatedFormat('d M Y, H:i'),
                    'user' => $version->user ? [
                        'id' => $version->user->id,
                        'name' => $version->user->name,
                        'email' => $version->user->email,
                        'avatar' => $version->user->avatar ? asset('storage/'.$version->user->avatar) : null,
                    ] : null,
                ];
            });

        return response()->json([
            'success' => true,
            'current_version' => $versions->first()?->version_number ?? 1,
            'versions' => $versions,
        ]);
    }

    /**
     * Rollback a project to a specific version.
     */
    public function projectRollback(
        Request $request,
        Project $project,
        ModelVersion $version,
        VersionService $versionService
    ): RedirectResponse|JsonResponse {
        $this->authorizeProjectAccess($project);

        if ($version->versionable_type !== Project::class || (int) $version->versionable_id !== (int) $project->id) {
            abort(404, 'Versi yang diminta tidak sesuai dengan project ini.');
        }

        $versionService->rollbackTo($project, $version, $request->user());

        ActivityLogger::logProject(
            action: 'project.rollback',
            description: "Memulihkan proyek \"{$project->name}\" ke versi v{$version->version_number}",
            project: $project,
            properties: [
                'target_version_number' => $version->version_number,
                'target_version_id' => $version->id,
            ],
            user: $request->user(),
            request: $request
        );

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => "Proyek berhasil dipulihkan ke versi v{$version->version_number}.",
            ]);
        }

        return redirect()->back()->with('success', "Proyek berhasil dipulihkan ke versi v{$version->version_number}.");
    }

    /**
     * Get version history for a template.
     */
    public function templateVersions(ProjectTemplate $template): JsonResponse
    {
        $this->authorizeTemplateAccess($template);

        $versions = $template->versions()
            ->with(['user:id,name,email,avatar'])
            ->get()
            ->map(function (ModelVersion $version) {
                return [
                    'id' => $version->id,
                    'version_number' => $version->version_number,
                    'event' => $version->event,
                    'summary' => $version->summary,
                    'changes' => $version->changes,
                    'snapshot' => $version->snapshot,
                    'created_at' => $version->created_at->toISOString(),
                    'created_at_formatted' => $version->created_at->translatedFormat('d M Y, H:i'),
                    'user' => $version->user ? [
                        'id' => $version->user->id,
                        'name' => $version->user->name,
                        'email' => $version->user->email,
                        'avatar' => $version->user->avatar ? asset('storage/'.$version->user->avatar) : null,
                    ] : null,
                ];
            });

        return response()->json([
            'success' => true,
            'current_version' => $versions->first()?->version_number ?? 1,
            'versions' => $versions,
        ]);
    }

    /**
     * Rollback a template to a specific version.
     */
    public function templateRollback(
        Request $request,
        ProjectTemplate $template,
        ModelVersion $version,
        VersionService $versionService
    ): RedirectResponse|JsonResponse {
        $this->authorizeTemplateAccess($template, requireEdit: true);

        if ($version->versionable_type !== ProjectTemplate::class || (int) $version->versionable_id !== (int) $template->id) {
            abort(404, 'Versi yang diminta tidak sesuai dengan template ini.');
        }

        $versionService->rollbackTo($template, $version, $request->user());

        ActivityLogger::log(
            action: 'rollback',
            type: 'template',
            description: "Memulihkan template \"{$template->name}\" ke versi v{$version->version_number}",
            subject: $template
        );

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => "Template berhasil dipulihkan ke versi v{$version->version_number}.",
            ]);
        }

        return redirect()->back()->with('success', "Template berhasil dipulihkan ke versi v{$version->version_number}.");
    }

    /**
     * Authorize project access.
     */
    protected function authorizeProjectAccess(Project $project): void
    {
        $user = Auth::user();
        if (! $user) {
            abort(401);
        }

        if ($user->role !== 'admin' && (int) $project->user_id !== (int) $user->id) {
            abort(403, 'Anda tidak memiliki akses ke riwayat versi proyek ini.');
        }
    }

    /**
     * Authorize template access.
     */
    protected function authorizeTemplateAccess(ProjectTemplate $template, bool $requireEdit = false): void
    {
        $user = Auth::user();
        if (! $user) {
            abort(401);
        }

        if ($requireEdit) {
            if ($template->is_system && $user->role !== 'admin') {
                abort(403, 'Anda tidak memiliki hak untuk mengubah template sistem.');
            }
            if (! $template->is_system && $user->role !== 'admin' && (int) $template->user_id !== (int) $user->id) {
                abort(403, 'Anda tidak memiliki akses untuk mengubah template ini.');
            }
        }
    }
}
