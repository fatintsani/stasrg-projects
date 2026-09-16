<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class ErrorPagesTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Register test routes for verifying error responses
        Route::get('/test-error-400', fn () => abort(400, 'Bad Request'));
        Route::get('/test-error-401', fn () => abort(401, 'Unauthorized'));
        Route::get('/test-error-403', fn () => abort(403, 'Forbidden'));
        Route::get('/test-error-419', fn () => abort(419, 'Page Expired'));
        Route::get('/test-error-429', fn () => abort(429, 'Too Many Requests'));
        Route::get('/test-error-500', fn () => abort(500, 'Internal Server Error'));
        Route::get('/test-error-503', fn () => abort(503, 'Service Unavailable'));
    }

    public function test_404_not_found_renders_custom_error_page(): void
    {
        $response = $this->get('/non-existent-random-route-'.uniqid());

        $response->assertStatus(404);
        $response->assertSee('404');
        $response->assertSee('Halaman Tidak Ditemukan');
        $response->assertSee('STAS-RG', false);
    }

    public function test_403_forbidden_renders_custom_error_page(): void
    {
        $response = $this->get('/test-error-403');

        $response->assertStatus(403);
        $response->assertSee('403');
        $response->assertSee('Akses Ditolak');
    }

    public function test_401_unauthorized_renders_custom_error_page(): void
    {
        $response = $this->get('/test-error-401');

        $response->assertStatus(401);
        $response->assertSee('401');
        $response->assertSee('Autentikasi Diperlukan');
    }

    public function test_400_bad_request_renders_custom_error_page(): void
    {
        $response = $this->get('/test-error-400');

        $response->assertStatus(400);
        $response->assertSee('400');
        $response->assertSee('Permintaan Tidak Valid');
    }

    public function test_419_page_expired_renders_custom_error_page(): void
    {
        $response = $this->get('/test-error-419');

        $response->assertStatus(419);
        $response->assertSee('419');
        $response->assertSee('Sesi Halaman Telah Kedaluwarsa');
    }

    public function test_429_too_many_requests_renders_custom_error_page(): void
    {
        $response = $this->get('/test-error-429');

        $response->assertStatus(429);
        $response->assertSee('429');
        $response->assertSee('Terlalu Banyak Permintaan');
    }

    public function test_500_internal_server_error_renders_clean_page_without_stack_traces(): void
    {
        $response = $this->get('/test-error-500');

        $response->assertStatus(500);
        $response->assertSee('500');
        $response->assertSee('Terjadi Kesalahan pada Server');
        $response->assertDontSee('Stack trace');
        $response->assertDontSee('SQLSTATE');
    }

    public function test_503_service_unavailable_renders_custom_error_page(): void
    {
        $response = $this->get('/test-error-503');

        $response->assertStatus(503);
        $response->assertSee('503');
        $response->assertSee('Layanan Sedang dalam Pemeliharaan');
    }

    public function test_inertia_request_on_error_returns_inertia_error_component(): void
    {
        $response = $this->withHeaders([
            'X-Inertia' => 'true',
            'X-Inertia-Version' => '1.0.0',
        ])->get('/non-existent-page-'.uniqid());

        $response->assertStatus(404);
        $response->assertHeader('X-Inertia', 'true');
        $this->assertEquals('Error', $response->json('component'));
        $this->assertEquals(404, $response->json('props.status'));
    }
}
