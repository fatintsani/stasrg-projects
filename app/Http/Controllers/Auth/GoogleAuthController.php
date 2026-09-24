<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;
use Throwable;

class GoogleAuthController extends Controller
{
    /**
     * Redirect to Google OAuth provider.
     */
    public function redirect(): RedirectResponse
    {
        $clientId = config('services.google.client_id');
        $clientSecret = config('services.google.client_secret');

        if (empty($clientId) || empty($clientSecret)) {
            return redirect()->route('login')->with('warning', 'Login dengan Google sedang dalam tahap konfigurasi / pengembangan API.');
        }

        try {
            return Socialite::driver('google')->redirect();
        } catch (Throwable $e) {
            Log::warning('Google OAuth redirect error: '.$e->getMessage());

            return redirect()->route('login')->with('warning', 'Layanan Login Google sedang dalam pengembangan atau belum dapat diakses.');
        }
    }

    /**
     * Redirect to Telkom University SSO gateway.
     */
    public function teluSsoRedirect(): RedirectResponse
    {
        $ssoClientId = env('TELU_SSO_CLIENT_ID');

        if (empty($ssoClientId)) {
            return redirect()->route('login')->with('warning', 'Login dengan SSO Telkom University sedang dalam tahap integrasi & pengembangan.');
        }

        return redirect()->route('login')->with('warning', 'Integrasi SSO Telkom University sedang dalam tahap pengembangan.');
    }

    /**
     * Handle callback from Google OAuth.
     */
    public function callback(): RedirectResponse
    {
        try {
            $googleUser = Socialite::driver('google')->user();

            // Find existing user by google_id or email
            $user = User::where('google_id', $googleUser->getId())
                ->orWhere('email', $googleUser->getEmail())
                ->first();

            if ($user) {
                // Update Google profile details if needed
                $user->update([
                    'google_id' => $googleUser->getId(),
                    'avatar' => $googleUser->getAvatar() ?? $user->avatar,
                ]);

                if ($user->isPending()) {
                    ActivityLogger::logAuth(
                        action: 'auth.google_login_pending',
                        description: "Percobaan login Google untuk akun belum disetujui: \"{$user->email}\"",
                        user: $user,
                        properties: ['google_id' => $googleUser->getId()]
                    );

                    return redirect()->route('login')->withErrors([
                        'email' => 'Akun Google Anda masih menunggu persetujuan admin.',
                    ]);
                }

                if ($user->isRejected()) {
                    $reason = $user->rejection_reason ? ' Alasan: '.$user->rejection_reason : '';

                    return redirect()->route('login')->withErrors([
                        'email' => 'Akun Anda telah ditolak oleh admin.'.$reason,
                    ]);
                }

                if ($user->isInactive()) {
                    return redirect()->route('login')->withErrors([
                        'email' => 'Akun Anda telah dinonaktifkan oleh admin.',
                    ]);
                }

                Auth::login($user, true);

                ActivityLogger::logAuth(
                    action: 'auth.google_login',
                    description: "Login berhasil sebagai \"{$user->name}\" via Google OAuth",
                    user: $user,
                    properties: [
                        'auth_method' => 'google_oauth',
                        'google_id' => $googleUser->getId(),
                    ]
                );

                return redirect()->intended(route('dashboard'));
            }

            // Register new pending user from Google profile
            $newUser = User::create([
                'name' => $googleUser->getName() ?? 'User STAS-RG',
                'username' => 'google_'.substr(md5($googleUser->getId()), 0, 8),
                'email' => $googleUser->getEmail(),
                'google_id' => $googleUser->getId(),
                'avatar' => $googleUser->getAvatar(),
                'role' => 'admin',
                'status' => User::STATUS_PENDING,
                'password' => null,
                'is_biometric_enabled' => false,
            ]);

            ActivityLogger::logUser(
                action: 'user.registered_google',
                description: "Pendaftaran akun baru dari Google OAuth: \"{$newUser->name}\" ({$newUser->email})",
                subjectUser: $newUser,
                properties: ['google_id' => $googleUser->getId()]
            );

            return redirect()->route('login')->with('status', 'Pendaftaran melalui Google berhasil! Akun Anda sedang menunggu persetujuan admin sebelum dapat digunakan.');
        } catch (Throwable $e) {
            Log::error('Google OAuth Authentication failed: '.$e->getMessage(), [
                'exception' => $e,
            ]);

            return redirect()->route('login')->withErrors([
                'email' => 'Gagal melakukan autentikasi melalui akun Google. Silakan coba kembali atau gunakan email dan kata sandi.',
            ]);
        }
    }
}
