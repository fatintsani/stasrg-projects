<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\LoginNotificationMail;
use App\Models\User;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'hasGoogleAuth' => ! empty(config('services.google.client_id')) && ! empty(config('services.google.client_secret')),
            'hasTeluSso' => ! empty(env('TELU_SSO_CLIENT_ID')) && ! empty(env('TELU_SSO_CLIENT_SECRET')),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $loginInput = trim($credentials['email']);
        $password = $credentials['password'];
        $remember = $request->boolean('remember');

        // Look up user by email or username
        $user = User::where('email', $loginInput)
            ->orWhere('username', $loginInput)
            ->first();

        if (! $user) {
            ActivityLogger::logAuth(
                action: 'auth.login_failed',
                description: "Percobaan login gagal: Identitas \"{$loginInput}\" tidak terdaftar",
                user: null,
                properties: ['input' => $loginInput, 'reason' => 'user_not_found'],
                request: $request
            );

            throw ValidationException::withMessages([
                'email' => 'Email atau Username tidak terdaftar dalam sistem.',
            ]);
        }

        if (! $user->password) {
            ActivityLogger::logAuth(
                action: 'auth.login_failed',
                description: "Percobaan login gagal untuk \"{$user->email}\": Belum membuat kata sandi",
                user: $user,
                properties: ['input' => $loginInput, 'reason' => 'no_password_set'],
                request: $request
            );

            throw ValidationException::withMessages([
                'email' => 'Akun ini terdaftar melalui Google Sign-In atau Passkey dan belum memiliki kata sandi. Silakan gunakan Google Sign-In atau fitur Lupa Kata Sandi.',
            ]);
        }

        if (! Hash::check($password, $user->password)) {
            ActivityLogger::logAuth(
                action: 'auth.login_failed',
                description: "Percobaan login gagal untuk identitas \"{$loginInput}\": Kata sandi salah",
                user: $user,
                properties: ['input' => $loginInput, 'reason' => 'invalid_password'],
                request: $request
            );

            throw ValidationException::withMessages([
                'password' => 'Kata sandi yang Anda masukkan salah. Silakan periksa kembali atau gunakan Lupa Kata Sandi.',
            ]);
        }

        // Check account approval and active status
        if ($user->isPending()) {
            throw ValidationException::withMessages([
                'email' => 'Akun Anda masih menunggu persetujuan admin.',
            ]);
        }

        if ($user->isRejected()) {
            $reason = $user->rejection_reason ? ' Alasan: '.$user->rejection_reason : '';
            throw ValidationException::withMessages([
                'email' => 'Akun Anda telah ditolak oleh admin.'.$reason,
            ]);
        }

        if ($user->isInactive()) {
            throw ValidationException::withMessages([
                'email' => 'Akun Anda telah dinonaktifkan oleh admin.',
            ]);
        }

        if (! $user->isAdmin()) {
            throw ValidationException::withMessages([
                'email' => 'Hanya akun Admin yang diizinkan mengakses Admin Panel.',
            ]);
        }

        Auth::login($user, $remember);

        $request->session()->regenerate();

        ActivityLogger::logAuth(
            action: 'auth.login',
            description: "Login berhasil sebagai \"{$user->name}\" via Email/Password",
            user: $user,
            properties: [
                'auth_method' => 'password',
                'role' => $user->role,
            ],
            request: $request
        );

        try {
            Mail::to($user->email)->send(
                new LoginNotificationMail($user, $request->ip(), $request->userAgent())
            );
        } catch (\Throwable $e) {
            Log::warning('Failed to send login notification: '.$e->getMessage());
        }

        return redirect()->intended(route('dashboard'));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $user = Auth::user();

        if ($user) {
            ActivityLogger::logAuth(
                action: 'auth.logout',
                description: "Pengguna \"{$user->name}\" berhasil logout",
                user: $user,
                request: $request
            );
        }

        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
