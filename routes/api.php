<?php

use App\Http\Controllers\Api\PublicApiController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public REST API Routes (Version 1)
|--------------------------------------------------------------------------
|
| These endpoints provide programmatic read-only access to published research
| projects, researchers directory, domain categories, and lab statistics.
|
*/

Route::prefix('v1')->middleware('throttle:60,1')->group(function () {
    // Projects Endpoints
    Route::get('/projects', [PublicApiController::class, 'indexProjects'])->name('api.v1.projects.index');
    Route::get('/projects/{slug}', [PublicApiController::class, 'showProject'])->name('api.v1.projects.show');

    // Categories Endpoints
    Route::get('/categories', [PublicApiController::class, 'indexCategories'])->name('api.v1.categories.index');

    // Researchers Endpoints
    Route::get('/researchers', [PublicApiController::class, 'indexResearchers'])->name('api.v1.researchers.index');
    Route::get('/researchers/{id}', [PublicApiController::class, 'showResearcher'])->whereNumber('id')->name('api.v1.researchers.show');

    // Global Statistics & Metadata
    Route::get('/stats', [PublicApiController::class, 'getStats'])->name('api.v1.stats');
    Route::get('/openapi.json', [PublicApiController::class, 'getOpenApiSpec'])->name('api.v1.openapi');
});

// Default root / unversioned aliases
Route::middleware('throttle:60,1')->group(function () {
    Route::get('/projects', [PublicApiController::class, 'indexProjects']);
    Route::get('/projects/{slug}', [PublicApiController::class, 'showProject']);
    Route::get('/categories', [PublicApiController::class, 'indexCategories']);
    Route::get('/researchers', [PublicApiController::class, 'indexResearchers']);
    Route::get('/stats', [PublicApiController::class, 'getStats']);
});
