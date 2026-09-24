<?php

namespace App\Services;

use App\Models\SupportTicket;
use App\Models\SupportTicketReply;
use App\Models\SystemSetting;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WebhookNotifier
{
    /**
     * Send notification for a newly submitted support ticket.
     */
    public static function notifyNewTicket(SupportTicket $ticket): bool
    {
        if (! self::isEventEnabled('ticket_created')) {
            return false;
        }

        $title = "🎫 Tiket Bantuan Baru [#{$ticket->ticket_number}]";
        $description = 'Pengunjung mengajukan tiket bantuan baru di portal STAS RG Projects.';
        $url = url("/support-tickets/{$ticket->id}");

        $fields = [
            'No. Tiket' => "#{$ticket->ticket_number}",
            'Pengirim' => "{$ticket->name} ({$ticket->email})",
            'Kategori' => ucfirst(str_replace('_', ' ', $ticket->category)),
            'Prioritas' => strtoupper($ticket->priority),
            'Subjek' => $ticket->subject,
            'Pesan' => mb_strimwidth(strip_tags($ticket->message), 0, 200, '...'),
        ];

        return self::dispatch(
            event: 'ticket_created',
            title: $title,
            description: $description,
            color: 0x0AB600, // Emerald green
            url: $url,
            fields: $fields,
            rawPayload: [
                'ticket_id' => $ticket->id,
                'ticket_number' => $ticket->ticket_number,
                'name' => $ticket->name,
                'email' => $ticket->email,
                'subject' => $ticket->subject,
                'category' => $ticket->category,
                'priority' => $ticket->priority,
            ]
        );
    }

    /**
     * Send notification for a new user registration pending approval.
     */
    public static function notifyUserRegistration(User $user): bool
    {
        if (! self::isEventEnabled('user_registered')) {
            return false;
        }

        $title = "👤 Pendaftaran Akun Baru: {$user->name}";
        $description = 'Pengguna baru telah mendaftar dan menunggu persetujuan (approval) administrator.';
        $url = url('/users');

        $fields = [
            'Nama Lengkap' => $user->name,
            'Username' => $user->username ?: '-',
            'Email' => $user->email,
            'Role Diminta' => ucfirst($user->role),
            'Status' => 'Menunggu Approval (Pending)',
        ];

        return self::dispatch(
            event: 'user_registered',
            title: $title,
            description: $description,
            color: 0x3B82F6, // Blue
            url: $url,
            fields: $fields,
            rawPayload: [
                'user_id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role,
            ]
        );
    }

    /**
     * Send notification when a visitor replies to a support ticket.
     */
    public static function notifyTicketReply(SupportTicket $ticket, SupportTicketReply $reply): bool
    {
        if (! self::isEventEnabled('ticket_replied')) {
            return false;
        }

        $senderName = $reply->is_admin ? 'Administrator' : ($ticket->name ?: 'Pengunjung');
        $title = "💬 Balasan Tiket [#{$ticket->ticket_number}] dari {$senderName}";
        $description = "Terdapat pesan balasan baru pada tiket bantuan #{$ticket->ticket_number}.";
        $url = url("/support-tickets/{$ticket->id}");

        $fields = [
            'No. Tiket' => "#{$ticket->ticket_number}",
            'Subjek' => $ticket->subject,
            'Pengirim Balasan' => $senderName,
            'Isi Balasan' => mb_strimwidth(strip_tags($reply->message), 0, 200, '...'),
        ];

        return self::dispatch(
            event: 'ticket_replied',
            title: $title,
            description: $description,
            color: 0xF59E0B, // Amber
            url: $url,
            fields: $fields,
            rawPayload: [
                'ticket_id' => $ticket->id,
                'ticket_number' => $ticket->ticket_number,
                'sender' => $senderName,
                'is_admin' => $reply->is_admin,
                'reply_message' => $reply->message,
            ]
        );
    }

    /**
     * Test webhook connection with sample payload.
     */
    public static function testConnection(
        string $type,
        ?string $url = null,
        ?string $telegramBotToken = null,
        ?string $telegramChatId = null
    ): array {
        $startTime = microtime(true);

        try {
            $title = '🔔 Uji Coba Webhook STAS RG Projects';
            $description = 'Integrasi notifikasi webhook berhasil dikonfigurasi dan aktif.';
            $fields = [
                'Status' => 'Terkoneksi (Active)',
                'Waktu Pengujian' => now()->translatedFormat('d M Y, H:i:s').' WIB',
                'Platform' => strtoupper($type),
                'Environment' => config('app.env', 'production'),
            ];

            $success = match ($type) {
                'discord' => self::sendDiscordWebhook($url, $title, $description, 0x0AB600, url('/settings'), $fields),
                'telegram' => self::sendTelegramMessage($telegramBotToken, $telegramChatId, $title, $description, url('/settings'), $fields),
                'generic' => self::sendGenericWebhook($url, 'webhook_test', $title, $description, $fields, ['test' => true]),
                default => false,
            };

            $latency = round((microtime(true) - $startTime) * 1000, 2);

            return [
                'success' => $success,
                'latency_ms' => $latency,
                'message' => $success ? "Uji coba webhook {$type} berhasil dikirim ({$latency} ms)!" : "Gagal mengirim webhook {$type}. Silakan periksa URL/Kredensial Anda.",
            ];
        } catch (\Throwable $e) {
            $latency = round((microtime(true) - $startTime) * 1000, 2);
            Log::error("Webhook test failed ({$type}): ".$e->getMessage());

            return [
                'success' => false,
                'latency_ms' => $latency,
                'message' => 'Error: '.$e->getMessage(),
            ];
        }
    }

    /**
     * Check if a specific webhook event is enabled.
     */
    private static function isEventEnabled(string $eventName): bool
    {
        if (! SystemSetting::get('webhook_enabled', false)) {
            return false;
        }

        $events = SystemSetting::get('webhook_events', ['ticket_created', 'user_registered', 'ticket_replied']);
        if (! is_array($events)) {
            $events = ['ticket_created', 'user_registered', 'ticket_replied'];
        }

        return in_array($eventName, $events);
    }

    /**
     * Dispatch payload to configured webhook service.
     */
    private static function dispatch(
        string $event,
        string $title,
        string $description,
        int $color,
        string $url,
        array $fields,
        array $rawPayload = []
    ): bool {
        try {
            $type = SystemSetting::get('webhook_type', 'discord');

            if ($type === 'discord') {
                $webhookUrl = SystemSetting::get('webhook_url');
                if (empty($webhookUrl)) {
                    return false;
                }

                return self::sendDiscordWebhook($webhookUrl, $title, $description, $color, $url, $fields);
            } elseif ($type === 'telegram') {
                $botToken = SystemSetting::getSecret('webhook_telegram_bot_token');
                $chatId = SystemSetting::get('webhook_telegram_chat_id');
                if (empty($botToken) || empty($chatId)) {
                    return false;
                }

                return self::sendTelegramMessage($botToken, $chatId, $title, $description, $url, $fields);
            } elseif ($type === 'generic') {
                $webhookUrl = SystemSetting::get('webhook_url');
                if (empty($webhookUrl)) {
                    return false;
                }

                return self::sendGenericWebhook($webhookUrl, $event, $title, $description, $fields, $rawPayload);
            }

            return false;
        } catch (\Throwable $e) {
            Log::warning("Failed to dispatch webhook event [{$event}]: ".$e->getMessage());

            return false;
        }
    }

    /**
     * Send Discord embed webhook.
     */
    private static function sendDiscordWebhook(
        string $webhookUrl,
        string $title,
        string $description,
        int $color,
        string $url,
        array $fields
    ): bool {
        $discordFields = [];
        foreach ($fields as $name => $value) {
            $discordFields[] = [
                'name' => (string) $name,
                'value' => (string) $value,
                'inline' => in_array($name, ['No. Tiket', 'Kategori', 'Prioritas', 'Status', 'Platform']),
            ];
        }

        $payload = [
            'username' => 'STAS-RG Notifier',
            'avatar_url' => asset('assets/img/stas.png'),
            'embeds' => [
                [
                    'title' => $title,
                    'description' => $description,
                    'url' => $url,
                    'color' => $color,
                    'fields' => $discordFields,
                    'footer' => [
                        'text' => 'STAS RG Research Group • Telkom University',
                    ],
                    'timestamp' => now()->toIso8601String(),
                ],
            ],
        ];

        $response = Http::timeout(6)->post($webhookUrl, $payload);

        return $response->successful();
    }

    /**
     * Send Telegram Bot HTML Message.
     */
    private static function sendTelegramMessage(
        string $botToken,
        string $chatId,
        string $title,
        string $description,
        string $url,
        array $fields
    ): bool {
        $text = "<b>{$title}</b>\n\n";
        $text .= "{$description}\n\n";

        foreach ($fields as $name => $value) {
            $text .= '• <b>'.htmlspecialchars((string) $name, ENT_QUOTES).':</b> '.htmlspecialchars((string) $value, ENT_QUOTES)."\n";
        }

        $text .= "\n🔗 <a href=\"{$url}\">Buka di Dashboard STAS RG</a>";

        $apiUrl = "https://api.telegram.org/bot{$botToken}/sendMessage";
        $response = Http::timeout(6)->post($apiUrl, [
            'chat_id' => $chatId,
            'text' => $text,
            'parse_mode' => 'HTML',
            'disable_web_page_preview' => false,
        ]);

        return $response->successful();
    }

    /**
     * Send Generic JSON Webhook.
     */
    private static function sendGenericWebhook(
        string $webhookUrl,
        string $event,
        string $title,
        string $description,
        array $fields,
        array $rawPayload
    ): bool {
        $payload = [
            'event' => $event,
            'title' => $title,
            'description' => $description,
            'fields' => $fields,
            'data' => $rawPayload,
            'timestamp' => now()->toIso8601String(),
        ];

        $response = Http::timeout(6)->post($webhookUrl, $payload);

        return $response->successful();
    }
}
