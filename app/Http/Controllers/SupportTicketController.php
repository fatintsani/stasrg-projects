<?php

namespace App\Http\Controllers;

use App\Mail\AdminSupportTicketAlertMail;
use App\Mail\SupportTicketReceivedMail;
use App\Mail\SupportTicketReplyMail;
use App\Models\AdminNotification;
use App\Models\SupportTicket;
use App\Models\SupportTicketReply;
use App\Models\User;
use App\Services\ActivityLogger;
use App\Services\WebhookNotifier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SupportTicketController extends Controller
{
    /**
     * Submit public support ticket from Landing Page.
     */
    public function submit(Request $request): RedirectResponse|JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'email' => ['required', 'email', 'max:150'],
            'institution' => ['nullable', 'string', 'max:150'],
            'affiliation' => ['nullable', 'string', 'max:150'],
            'phone' => ['nullable', 'string', 'max:30'],
            'category' => ['required', 'string', 'in:general,technical,technical_issue,partnership,research_collaboration,feature_request,account,account_access,other'],
            'priority' => ['nullable', 'string', 'in:low,medium,high,urgent'],
            'subject' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string', 'max:15000'],
            'attachment' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf,zip,doc,docx', 'max:5120'],
        ]);

        $attachmentPath = null;
        $attachmentName = null;
        $attachmentSize = null;

        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $attachmentPath = $file->store('support_attachments', 'public');
            $attachmentName = $file->getClientOriginalName();
            $attachmentSize = $file->getSize();
        }

        $ticket = SupportTicket::create([
            'ticket_number' => SupportTicket::generateTicketNumber(),
            'name' => $validated['name'],
            'email' => $validated['email'],
            'affiliation' => $validated['institution'] ?? $validated['affiliation'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'category' => $validated['category'],
            'priority' => $validated['priority'] ?? SupportTicket::PRIORITY_MEDIUM,
            'subject' => $validated['subject'],
            'message' => $validated['message'],
            'attachment_path' => $attachmentPath,
            'attachment_original_name' => $attachmentName,
            'attachment_size' => $attachmentSize,
            'status' => SupportTicket::STATUS_PENDING,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        // Auto-verify submitter session for immediate access to their ticket live chat
        session(["verified_ticket_{$ticket->ticket_number}" => $ticket->email]);

        // Send Email Confirmation to Submitter and Alert to Admins
        try {
            Mail::to($ticket->email)->send(new SupportTicketReceivedMail($ticket));

            $adminEmails = User::whereIn('role', ['admin', 'superadmin'])
                ->where('status', User::STATUS_APPROVED)
                ->pluck('email')
                ->filter()
                ->unique()
                ->values()
                ->all();

            if (! empty($adminEmails)) {
                foreach ($adminEmails as $adminEmail) {
                    Mail::to($adminEmail)->send(new AdminSupportTicketAlertMail($ticket));
                }
            }
        } catch (\Throwable $e) {
            Log::warning('Failed to send support ticket email notifications: '.$e->getMessage());
        }

        ActivityLogger::log(
            'support.created',
            'support',
            "Tiket dukungan baru #{$ticket->ticket_number} dibuat oleh {$ticket->name} ({$ticket->email})",
            $ticket,
            [
                'ticket_id' => $ticket->id,
                'ticket_number' => $ticket->ticket_number,
                'category' => $ticket->category,
                'priority' => $ticket->priority,
            ]
        );

        try {
            $level = $ticket->priority === 'urgent' ? 'urgent' : ($ticket->priority === 'high' ? 'warning' : 'info');
            AdminNotification::create([
                'user_id' => null,
                'type' => 'ticket',
                'title' => "Tiket Baru #{$ticket->ticket_number}",
                'message' => "Tiket '{$ticket->subject}' dari {$ticket->name} ({$ticket->category}) menunggu penanganan admin.",
                'action_url' => "/support-tickets/{$ticket->id}",
                'icon' => 'LifeBuoy',
                'level' => $level,
                'data' => [
                    'ticket_id' => $ticket->id,
                    'ticket_number' => $ticket->ticket_number,
                    'priority' => $ticket->priority,
                ],
            ]);
        } catch (\Throwable $e) {
            Log::warning('Failed to create admin notification for ticket: '.$e->getMessage());
        }

        // Trigger External Webhook Notification (Discord / Telegram / Generic)
        try {
            WebhookNotifier::notifyNewTicket($ticket);
        } catch (\Throwable $e) {
            Log::warning('Failed to dispatch webhook for new support ticket: '.$e->getMessage());
        }

        if ($request->wantsJson() || $request->is('api/*')) {
            return response()->json([
                'success' => true,
                'ticket_number' => $ticket->ticket_number,
                'track_url' => route('support.ticket.show', ['ticketNumber' => $ticket->ticket_number]),
                'message' => 'Tiket bantuan dan pesan Anda berhasil dikirim ke tim laboratorium CoE STAS-RG.',
            ], 201);
        }

        return redirect()->back()->with([
            'success' => 'Tiket bantuan dan pesan Anda berhasil dikirim ke tim laboratorium CoE STAS-RG.',
            'ticket_number' => $ticket->ticket_number,
            'track_url' => route('support.ticket.show', ['ticketNumber' => $ticket->ticket_number]),
        ]);
    }

    /**
     * Verify ticket code and email to enter public live chat / tracker.
     */
    public function verifyTicket(Request $request): RedirectResponse|JsonResponse
    {
        $validated = $request->validate([
            'ticket_number' => ['required', 'string', 'max:50'],
            'email' => ['required', 'email', 'max:150'],
        ]);

        $ticketNumber = trim($validated['ticket_number']);
        $email = strtolower(trim($validated['email']));

        $ticket = SupportTicket::where('ticket_number', $ticketNumber)
            ->whereRaw('LOWER(email) = ?', [$email])
            ->first();

        if (! $ticket) {
            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Nomor tiket atau email verifikasi tidak cocok dengan data tiket kami.',
                ], 404);
            }

            return redirect()->back()
                ->withInput()
                ->withErrors([
                    'ticket_number' => 'Nomor tiket atau email verifikasi tidak cocok dengan data tiket kami. Harap pastikan nomor tiket dan email sudah tepat.',
                ]);
        }

        // Store verification in session
        session(["verified_ticket_{$ticket->ticket_number}" => $ticket->email]);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'redirect_url' => route('support.ticket.show', ['ticketNumber' => $ticket->ticket_number]),
            ]);
        }

        return redirect()->route('support.ticket.show', ['ticketNumber' => $ticket->ticket_number]);
    }

    /**
     * Public interactive live chat / tracker page for a verified ticket.
     */
    public function showPublicTicket(Request $request, string $ticketNumber): Response|RedirectResponse
    {
        $ticket = SupportTicket::where('ticket_number', $ticketNumber)->first();

        if (! $ticket) {
            return redirect()->route('support', ['track' => 1])
                ->with('error', 'Tiket bantuan dengan nomor referensi tersebut tidak ditemukan di sistem.');
        }

        $isAdmin = Auth::check() && in_array(Auth::user()->role, ['admin', 'superadmin'], true);
        $emailParam = $request->query('email') ?? $request->input('email');
        $sessionVerified = session("verified_ticket_{$ticketNumber}");

        if (! $isAdmin) {
            if ($emailParam && strtolower(trim($emailParam)) === strtolower(trim($ticket->email))) {
                session(["verified_ticket_{$ticketNumber}" => $ticket->email]);
            } elseif ($sessionVerified !== $ticket->email) {
                return redirect()->route('support', ['track' => 1, 'ticket' => $ticketNumber])
                    ->with('error', 'Silakan masukkan email terdaftar Anda untuk memverifikasi dan membuka ruang chat tiket ini.');
            }
        }

        $ticket->load([
            'resolver:id,name,email',
            'replies.user:id,name,email,avatar',
        ]);

        $formattedTicket = [
            'id' => $ticket->id,
            'ticket_number' => $ticket->ticket_number,
            'name' => $ticket->name,
            'email' => $ticket->email,
            'affiliation' => $ticket->affiliation,
            'phone' => $ticket->phone,
            'category' => $ticket->category,
            'priority' => $ticket->priority,
            'subject' => $ticket->subject,
            'message' => $ticket->message,
            'attachment_path' => $ticket->attachment_path,
            'attachment_original_name' => $ticket->attachment_original_name ?? ($ticket->attachment_path ? basename($ticket->attachment_path) : null),
            'attachment_size' => $ticket->attachment_size,
            'attachment_url' => $ticket->attachment_path ? asset('storage/'.$ticket->attachment_path) : null,
            'status' => $ticket->status,
            'created_at' => $ticket->created_at->format('d M Y H:i'),
            'created_at_human' => $ticket->created_at->diffForHumans(),
            'resolved_at' => $ticket->resolved_at ? $ticket->resolved_at->format('d M Y H:i') : null,
            'replies' => $ticket->replies->sortBy('created_at')->values()->map(function (SupportTicketReply $reply) {
                $isAdminReply = ($reply->sender_type === 'admin') || ($reply->user_id !== null && $reply->sender_type !== 'user');

                return [
                    'id' => $reply->id,
                    'sender_type' => $isAdminReply ? 'admin' : 'user',
                    'sender_name' => $isAdminReply
                        ? ($reply->user ? $reply->user->name : 'Tim Layanan STAS-RG')
                        : ($reply->sender_name ?? 'Pengguna'),
                    'message' => $reply->message,
                    'attachment_url' => $reply->attachment_path ? asset('storage/'.$reply->attachment_path) : null,
                    'attachment_original_name' => $reply->attachment_original_name,
                    'attachment_size' => $reply->attachment_size,
                    'status_at_reply' => $reply->status_at_reply,
                    'created_at' => $reply->created_at->format('d M Y H:i'),
                    'created_at_human' => $reply->created_at->diffForHumans(),
                    'user' => $reply->user ? [
                        'id' => $reply->user->id,
                        'name' => $reply->user->name,
                        'avatar' => $reply->user->avatar ? asset('storage/'.$reply->user->avatar) : null,
                    ] : null,
                ];
            })->values()->all(),
        ];

        return Inertia::render('Support/TrackTicket', [
            'ticket' => $formattedTicket,
            'verifiedEmail' => $ticket->email,
        ]);
    }

    /**
     * Submit a reply from the public user side inside the live chat room.
     */
    public function publicReply(Request $request, string $ticketNumber): RedirectResponse|JsonResponse
    {
        $ticket = SupportTicket::where('ticket_number', $ticketNumber)->firstOrFail();

        $isAdmin = Auth::check() && in_array(Auth::user()->role, ['admin', 'superadmin'], true);
        $emailParam = $request->input('email');
        $sessionVerified = session("verified_ticket_{$ticketNumber}");

        if (! $isAdmin) {
            $isAuthorized = ($sessionVerified === $ticket->email) ||
                ($emailParam && strtolower(trim($emailParam)) === strtolower(trim($ticket->email)));

            if (! $isAuthorized) {
                if ($request->wantsJson()) {
                    return response()->json(['error' => 'Akses tidak sah'], 403);
                }

                return redirect()->route('support', ['track' => 1, 'ticket' => $ticketNumber])
                    ->with('error', 'Sesi verifikasi Anda telah berakhir. Silakan verifikasi ulang.');
            }
        }

        $validated = $request->validate([
            'message' => ['required', 'string', 'max:10000'],
            'attachment' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf,zip,doc,docx', 'max:5120'],
        ]);

        $attachmentPath = null;
        $attachmentName = null;
        $attachmentSize = null;

        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $attachmentPath = $file->store('support_attachments', 'public');
            $attachmentName = $file->getClientOriginalName();
            $attachmentSize = $file->getSize();
        }

        $reply = DB::transaction(function () use ($validated, $ticket, $attachmentPath, $attachmentName, $attachmentSize) {
            // If the ticket was resolved/closed, auto-reopen to in_progress so admin can follow up
            if (in_array($ticket->status, [SupportTicket::STATUS_RESOLVED, SupportTicket::STATUS_CLOSED], true)) {
                $ticket->status = SupportTicket::STATUS_IN_PROGRESS;
                $ticket->save();
            }

            /** @var SupportTicketReply $createdReply */
            $createdReply = $ticket->replies()->create([
                'user_id' => Auth::id(),
                'sender_type' => 'user',
                'sender_name' => $ticket->name,
                'message' => $validated['message'],
                'attachment_path' => $attachmentPath,
                'attachment_original_name' => $attachmentName,
                'attachment_size' => $attachmentSize,
                'status_at_reply' => $ticket->status,
                'is_sent_to_user' => false,
            ]);

            return $createdReply;
        });

        // Notify Admins
        try {
            AdminNotification::create([
                'user_id' => null,
                'type' => 'ticket',
                'title' => "Pesan Balasan Tiket #{$ticket->ticket_number}",
                'message' => "Pengguna {$ticket->name} mengirimkan pesan baru pada tiket '{$ticket->subject}'.",
                'action_url' => "/support-tickets/{$ticket->id}",
                'icon' => 'MessageSquare',
                'level' => 'info',
                'data' => [
                    'ticket_id' => $ticket->id,
                    'ticket_number' => $ticket->ticket_number,
                    'reply_id' => $reply->id,
                ],
            ]);
        } catch (\Throwable $e) {
            Log::warning('Failed to create admin notification for user reply: '.$e->getMessage());
        }

        ActivityLogger::log(
            'support.user_replied',
            'support',
            "Pengguna {$ticket->name} membalas tiket #{$ticket->ticket_number}",
            $ticket,
            [
                'ticket_id' => $ticket->id,
                'ticket_number' => $ticket->ticket_number,
                'reply_id' => $reply->id,
            ]
        );

        // Trigger External Webhook Notification
        try {
            WebhookNotifier::notifyTicketReply($ticket, $reply);
        } catch (\Throwable $e) {
            Log::warning('Failed to dispatch webhook for ticket reply: '.$e->getMessage());
        }

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Pesan Anda berhasil dikirimkan ke tim admin.',
            ]);
        }

        return back()->with('success', 'Pesan Anda berhasil terkirim ke tim CoE STAS-RG.');
    }

    /**
     * JSON polling endpoint for live messages sync in real-time.
     */
    public function getMessages(Request $request, string $ticketNumber): JsonResponse
    {
        $ticket = SupportTicket::where('ticket_number', $ticketNumber)->first();

        if (! $ticket) {
            return response()->json(['error' => 'Not found'], 404);
        }

        $isAdmin = Auth::check() && in_array(Auth::user()->role, ['admin', 'superadmin'], true);
        $emailParam = $request->query('email') ?? $request->input('email');
        $sessionVerified = session("verified_ticket_{$ticketNumber}");

        if (! $isAdmin) {
            $isAuthorized = ($sessionVerified === $ticket->email) ||
                ($emailParam && strtolower(trim($emailParam)) === strtolower(trim($ticket->email)));

            if (! $isAuthorized) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }
        }

        $ticket->load(['replies.user:id,name,email,avatar']);

        $replies = $ticket->replies->sortBy('created_at')->values()->map(function (SupportTicketReply $reply) {
            $isAdminReply = ($reply->sender_type === 'admin') || ($reply->user_id !== null && $reply->sender_type !== 'user');

            return [
                'id' => $reply->id,
                'sender_type' => $isAdminReply ? 'admin' : 'user',
                'sender_name' => $isAdminReply
                    ? ($reply->user ? $reply->user->name : 'Tim Layanan STAS-RG')
                    : ($reply->sender_name ?? 'Pengguna'),
                'message' => $reply->message,
                'attachment_url' => $reply->attachment_path ? asset('storage/'.$reply->attachment_path) : null,
                'attachment_original_name' => $reply->attachment_original_name,
                'attachment_size' => $reply->attachment_size,
                'status_at_reply' => $reply->status_at_reply,
                'created_at' => $reply->created_at->format('d M Y H:i'),
                'created_at_human' => $reply->created_at->diffForHumans(),
                'user' => $reply->user ? [
                    'id' => $reply->user->id,
                    'name' => $reply->user->name,
                    'avatar' => $reply->user->avatar ? asset('storage/'.$reply->user->avatar) : null,
                ] : null,
            ];
        });

        return response()->json([
            'success' => true,
            'status' => $ticket->status,
            'priority' => $ticket->priority,
            'resolved_at' => $ticket->resolved_at ? $ticket->resolved_at->format('d M Y H:i') : null,
            'replies' => $replies,
        ]);
    }

    /**
     * Admin support ticket management page.
     */
    public function index(Request $request): Response
    {
        $query = SupportTicket::query()->with('resolver:id,name,email');

        // Search Filter
        if ($request->filled('search')) {
            $search = trim($request->input('search'));
            $query->where(function ($q) use ($search) {
                $q->where('ticket_number', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('affiliation', 'like', "%{$search}%")
                    ->orWhere('subject', 'like', "%{$search}%");
            });
        }

        // Status Filter
        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        // Category Filter
        if ($request->filled('category') && $request->input('category') !== 'all') {
            $query->where('category', $request->input('category'));
        }

        // Priority Filter
        if ($request->filled('priority') && $request->input('priority') !== 'all') {
            $query->where('priority', $request->input('priority'));
        }

        // Sorting
        $sort = $request->input('sort', 'created_at');
        $direction = strtolower($request->input('direction', 'desc')) === 'asc' ? 'asc' : 'desc';
        $allowedSorts = ['ticket_number', 'name', 'category', 'priority', 'status', 'created_at'];

        if (in_array($sort, $allowedSorts, true)) {
            $query->orderBy($sort, $direction);
        } else {
            $query->latest('created_at');
        }

        $tickets = $query->paginate(12)->withQueryString();

        // Transform collection to format attachment URL
        $tickets->through(function ($t) {
            return [
                'id' => $t->id,
                'ticket_number' => $t->ticket_number,
                'name' => $t->name,
                'email' => $t->email,
                'affiliation' => $t->affiliation,
                'phone' => $t->phone,
                'category' => $t->category,
                'priority' => $t->priority,
                'subject' => $t->subject,
                'message' => $t->message,
                'attachment_url' => $t->attachment_path ? asset('storage/'.$t->attachment_path) : null,
                'attachment_filename' => $t->attachment_path ? basename($t->attachment_path) : null,
                'status' => $t->status,
                'admin_notes' => $t->admin_notes,
                'resolver' => $t->resolver ? [
                    'id' => $t->resolver->id,
                    'name' => $t->resolver->name,
                    'email' => $t->resolver->email,
                ] : null,
                'resolved_at' => $t->resolved_at ? $t->resolved_at->format('d M Y H:i') : null,
                'created_at' => $t->created_at->format('d M Y H:i'),
                'created_at_human' => $t->created_at->diffForHumans(),
            ];
        });

        $stats = [
            'total' => SupportTicket::count(),
            'pending' => SupportTicket::where('status', SupportTicket::STATUS_PENDING)->count(),
            'in_progress' => SupportTicket::where('status', SupportTicket::STATUS_IN_PROGRESS)->count(),
            'resolved' => SupportTicket::where('status', SupportTicket::STATUS_RESOLVED)->count(),
            'closed' => SupportTicket::where('status', SupportTicket::STATUS_CLOSED)->count(),
            'urgent' => SupportTicket::where('priority', SupportTicket::PRIORITY_URGENT)->whereNotIn('status', [SupportTicket::STATUS_CLOSED])->count(),
        ];

        return Inertia::render('Admin/SupportTickets/Index', [
            'tickets' => $tickets,
            'stats' => $stats,
            'filters' => [
                'search' => $request->input('search', ''),
                'status' => $request->input('status', 'all'),
                'category' => $request->input('category', 'all'),
                'priority' => $request->input('priority', 'all'),
                'sort' => $sort,
                'direction' => $direction,
            ],
        ]);
    }

    /**
     * Display the specified support ticket on its own dedicated page.
     */
    public function show(SupportTicket $ticket): Response
    {
        $ticket->load([
            'resolver:id,name,email',
            'replies.user:id,name,email,avatar',
        ]);

        $formattedTicket = [
            'id' => $ticket->id,
            'ticket_number' => $ticket->ticket_number,
            'name' => $ticket->name,
            'email' => $ticket->email,
            'affiliation' => $ticket->affiliation,
            'institution' => $ticket->affiliation,
            'phone' => $ticket->phone,
            'category' => $ticket->category,
            'priority' => $ticket->priority,
            'subject' => $ticket->subject,
            'message' => $ticket->message,
            'attachment_path' => $ticket->attachment_path,
            'attachment_original_name' => $ticket->attachment_original_name ?? ($ticket->attachment_path ? basename($ticket->attachment_path) : null),
            'attachment_size' => $ticket->attachment_size,
            'attachment_url' => $ticket->attachment_path ? asset('storage/'.$ticket->attachment_path) : null,
            'status' => $ticket->status,
            'admin_notes' => $ticket->admin_notes,
            'ip_address' => $ticket->ip_address,
            'user_agent' => $ticket->user_agent,
            'resolver' => $ticket->resolver ? [
                'id' => $ticket->resolver->id,
                'name' => $ticket->resolver->name,
                'email' => $ticket->resolver->email,
            ] : null,
            'resolved_at' => $ticket->resolved_at ? $ticket->resolved_at->format('d M Y H:i') : null,
            'created_at' => $ticket->created_at->format('d M Y H:i'),
            'created_at_human' => $ticket->created_at->diffForHumans(),
            'replies' => $ticket->replies->sortBy('created_at')->values()->map(function (SupportTicketReply $reply) {
                $isAdminReply = ($reply->sender_type === 'admin') || ($reply->user_id !== null && $reply->sender_type !== 'user');

                return [
                    'id' => $reply->id,
                    'sender_type' => $isAdminReply ? 'admin' : 'user',
                    'sender_name' => $isAdminReply
                        ? ($reply->user ? $reply->user->name : 'Tim Layanan STAS-RG')
                        : ($reply->sender_name ?? 'Pengguna'),
                    'message' => $reply->message,
                    'attachment_url' => $reply->attachment_path ? asset('storage/'.$reply->attachment_path) : null,
                    'attachment_original_name' => $reply->attachment_original_name,
                    'attachment_size' => $reply->attachment_size,
                    'status_at_reply' => $reply->status_at_reply,
                    'created_at' => $reply->created_at->format('d M Y H:i'),
                    'created_at_human' => $reply->created_at->diffForHumans(),
                    'user' => $reply->user ? [
                        'id' => $reply->user->id,
                        'name' => $reply->user->name,
                        'email' => $reply->user->email,
                        'avatar' => $reply->user->avatar ? asset('storage/'.$reply->user->avatar) : null,
                    ] : null,
                ];
            })->values()->all(),
        ];

        return Inertia::render('Admin/SupportTickets/Show', [
            'ticket' => $formattedTicket,
        ]);
    }

    /**
     * Send an official admin reply email to the ticket author.
     */
    public function reply(Request $request, SupportTicket $ticket): RedirectResponse
    {
        $validated = $request->validate([
            'message' => ['required', 'string', 'max:10000'],
            'status' => ['nullable', 'string', 'in:pending,in_progress,resolved,closed'],
            'attachment' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf,zip,doc,docx', 'max:5120'],
        ]);

        /** @var User $currentUser */
        $currentUser = Auth::user();

        $attachmentPath = null;
        $attachmentName = null;
        $attachmentSize = null;

        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $attachmentPath = $file->store('support_attachments', 'public');
            $attachmentName = $file->getClientOriginalName();
            $attachmentSize = $file->getSize();
        }

        $reply = DB::transaction(function () use ($validated, $ticket, $currentUser, $attachmentPath, $attachmentName, $attachmentSize) {
            $newStatus = $validated['status'] ?? $ticket->status;
            $isResolving = in_array($newStatus, [SupportTicket::STATUS_RESOLVED, SupportTicket::STATUS_CLOSED], true);

            if ($newStatus !== $ticket->status) {
                $ticket->status = $newStatus;
                if ($isResolving) {
                    $ticket->resolved_by = $currentUser->id;
                    $ticket->resolved_at = now();
                }
                $ticket->save();
            }

            /** @var SupportTicketReply $createdReply */
            $createdReply = $ticket->replies()->create([
                'user_id' => $currentUser->id,
                'sender_type' => 'admin',
                'sender_name' => $currentUser->name,
                'message' => $validated['message'],
                'attachment_path' => $attachmentPath,
                'attachment_original_name' => $attachmentName,
                'attachment_size' => $attachmentSize,
                'status_at_reply' => $ticket->status,
                'is_sent_to_user' => true,
            ]);

            return $createdReply;
        });

        try {
            Mail::to($ticket->email)->send(new SupportTicketReplyMail($ticket, $reply, $currentUser));
        } catch (\Throwable $e) {
            Log::warning('Failed to dispatch support ticket reply email: '.$e->getMessage());
        }

        ActivityLogger::log(
            'support.replied',
            'support',
            "Admin {$currentUser->name} membalas tiket #{$ticket->ticket_number} ke {$ticket->email}",
            $ticket,
            [
                'ticket_id' => $ticket->id,
                'ticket_number' => $ticket->ticket_number,
                'reply_id' => $reply->id,
                'status' => $ticket->status,
            ]
        );

        return back()->with('success', "Balasan resmi dan notifikasi email berhasil dikirimkan ke {$ticket->email}.");
    }

    /**
     * Update support ticket status and admin notes.
     */
    public function update(Request $request, SupportTicket $ticket): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:pending,in_progress,resolved,closed,new,in_review'],
            'priority' => ['required', 'string', 'in:low,medium,high,urgent'],
            'admin_notes' => ['nullable', 'string', 'max:5000'],
        ]);

        $prevStatus = $ticket->status;
        $isResolving = in_array($validated['status'], [SupportTicket::STATUS_RESOLVED, SupportTicket::STATUS_CLOSED], true);

        $ticket->status = $validated['status'];
        $ticket->priority = $validated['priority'];
        $ticket->admin_notes = $validated['admin_notes'] ?? null;

        if ($isResolving) {
            $ticket->resolved_by = Auth::id();
            $ticket->resolved_at = now();
        } elseif (in_array($prevStatus, [SupportTicket::STATUS_RESOLVED, SupportTicket::STATUS_CLOSED], true)) {
            $ticket->resolved_at = null;
        }

        $ticket->save();

        $userName = Auth::user()?->name ?? 'Admin';

        ActivityLogger::log(
            'support.updated',
            'support',
            "Status tiket #{$ticket->ticket_number} diperbarui menjadi '{$ticket->status}' oleh {$userName}",
            $ticket,
            [
                'ticket_id' => $ticket->id,
                'ticket_number' => $ticket->ticket_number,
                'previous_status' => $prevStatus,
                'new_status' => $ticket->status,
            ]
        );

        return back()->with('success', "Tiket #{$ticket->ticket_number} berhasil diperbarui.");
    }

    /**
     * Delete a support ticket.
     */
    public function destroy(SupportTicket $ticket): RedirectResponse
    {
        $ticketNumber = $ticket->ticket_number;

        if ($ticket->attachment_path && Storage::disk('public')->exists($ticket->attachment_path)) {
            Storage::disk('public')->delete($ticket->attachment_path);
        }

        $ticket->delete();

        $userName = Auth::user()?->name ?? 'Admin';

        ActivityLogger::log(
            'support.deleted',
            'support',
            "Tiket bantuan #{$ticketNumber} telah dihapus oleh {$userName}",
            null,
            ['ticket_number' => $ticketNumber]
        );

        return back()->with('success', "Tiket #{$ticketNumber} berhasil dihapus dari sistem.");
    }

    /**
     * Export support tickets to CSV.
     */
    public function exportCsv(Request $request): StreamedResponse
    {
        $query = SupportTicket::query()->with('resolver:id,name');

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('category') && $request->input('category') !== 'all') {
            $query->where('category', $request->input('category'));
        }

        if ($request->filled('priority') && $request->input('priority') !== 'all') {
            $query->where('priority', $request->input('priority'));
        }

        $tickets = $query->latest('created_at')->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="stas_support_tickets_'.date('Ymd_His').'.csv"',
        ];

        return response()->stream(function () use ($tickets) {
            $file = fopen('php://output', 'w');

            fputcsv($file, [
                'ID Tiket',
                'Nama Pengirim',
                'Email',
                'Institusi/Afiliasi',
                'Telepon',
                'Kategori',
                'Prioritas',
                'Subjek',
                'Pesan',
                'Status',
                'Catatan Admin',
                'Ditangani Oleh',
                'Tanggal Dibuat',
                'Tanggal Selesai',
            ]);

            foreach ($tickets as $ticket) {
                fputcsv($file, [
                    $ticket->ticket_number,
                    $ticket->name,
                    $ticket->email,
                    $ticket->affiliation ?? '-',
                    $ticket->phone ?? '-',
                    $ticket->category,
                    $ticket->priority,
                    $ticket->subject,
                    $ticket->message,
                    $ticket->status,
                    $ticket->admin_notes ?? '-',
                    $ticket->resolver ? $ticket->resolver->name : '-',
                    $ticket->created_at->format('Y-m-d H:i:s'),
                    $ticket->resolved_at ? $ticket->resolved_at->format('Y-m-d H:i:s') : '-',
                ]);
            }

            fclose($file);
        }, 200, $headers);
    }
}
