<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\AdminNewUserAlertMail;
use App\Mail\UserRegisteredMail;
use App\Models\AdminNotification;
use App\Models\User;
use App\Services\WebhookNotifier;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => ['nullable', 'string', 'alpha_dash', 'max:50', 'unique:'.User::class.',username'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class.',email'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'agree' => ['accepted'],
        ]);

        $username = $validated['username'] ?? null;
        if (! $username) {
            $baseUsername = Str::slug($validated['name'], '_');
            $username = $baseUsername ?: 'user_'.rand(1000, 9999);

            // Ensure username uniqueness
            $candidate = $username;
            $counter = 1;
            while (User::where('username', $candidate)->exists()) {
                $candidate = $username.'_'.$counter++;
            }
            $username = $candidate;
        }

        $user = User::create([
            'name' => $validated['name'],
            'username' => $username,
            'email' => $validated['email'],
            'role' => 'admin',
            'status' => User::STATUS_PENDING,
            'password' => Hash::make($validated['password']),
            'is_biometric_enabled' => false,
        ]);

        try {
            Mail::to($user->email)->send(new UserRegisteredMail($user));

            // Notify existing active admins
            $adminEmails = User::where('role', 'superadmin')
                ->orWhere(function ($q) {
                    $q->where('role', 'admin')->where('status', User::STATUS_APPROVED);
                })
                ->where('email', '!=', $user->email)
                ->pluck('email')
                ->filter();

            foreach ($adminEmails as $adminEmail) {
                Mail::to($adminEmail)->send(new AdminNewUserAlertMail($user));
            }
        } catch (\Throwable $e) {
            Log::warning('Failed to send registration emails: '.$e->getMessage());
        }

        try {
            AdminNotification::create([
                'user_id' => null,
                'type' => 'user',
                'title' => 'Pendaftaran Akun Baru',
                'message' => "Pengguna {$user->name} ({$user->email}) baru saja mendaftar dan menunggu persetujuan (approval) admin.",
                'action_url' => '/users',
                'icon' => 'UserPlus',
                'level' => 'warning',
                'data' => [
                    'user_id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ],
            ]);
        } catch (\Throwable $e) {
            Log::warning('Failed to create admin notification for new user: '.$e->getMessage());
        }

        // Trigger External Webhook Notification (Discord / Telegram / Generic)
        try {
            WebhookNotifier::notifyUserRegistration($user);
        } catch (\Throwable $e) {
            Log::warning('Failed to dispatch webhook for new user registration: '.$e->getMessage());
        }

        // Do NOT auto-login pending user
        return redirect()->route('login')->with('status', 'Pendaftaran berhasil! Akun Anda masih menunggu persetujuan admin sebelum dapat digunakan untuk login.');
    }
}
