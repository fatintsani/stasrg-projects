@extends('emails.layouts.master')

@php
    $typeKey = is_string($eventType ?? null) ? $eventType : 'updated';

    $titles = [
        'created' => 'Project Riset Baru Dibuat',
        'updated' => 'Project Riset Berhasil Diperbarui',
        'published' => 'Project Berhasil Dipublikasikan',
        'unpublished' => 'Status Publikasi Project Ditarik',
        'duplicated' => 'Project Berhasil Diduplikasi',
        'deleted' => 'Project Telah Dihapus',
        'pdf_downloaded' => 'Dokumen PDF Berhasil Digenerate',
    ];

    $subtitles = [
        'created' => 'Project spesifikasi riset baru telah berhasil didaftarkan ke sistem STAS RG Projects.',
        'updated' => 'Perubahan data spesifikasi riset Anda telah tersimpan secara aman.',
        'published' => 'Project Anda kini tampil pada showcase publik Landing Page STAS-RG.',
        'unpublished' => 'Project telah diubah statusnya menjadi draft internal laboratorium.',
        'duplicated' => 'Salinan skema project baru telah berhasil dibuat dan siap dimodifikasi.',
        'deleted' => 'Project spesifikasi riset telah dihapus dari repositori akun Anda.',
        'pdf_downloaded' => 'Dokumen laporan resmi standar CoE STAS-RG telah berhasil digenerate dan diunduh.',
    ];

    $eventBadge = match($typeKey) {
        'published' => ['class' => 'badge-success', 'dot' => 'badge-dot-success', 'label' => 'Dipublikasikan (Live)'],
        'unpublished' => ['class' => 'badge-warning', 'dot' => 'badge-dot-warning', 'label' => 'Draft Internal'],
        'deleted' => ['class' => 'badge-error', 'dot' => 'badge-dot-error', 'label' => 'Dihapus'],
        'created', 'duplicated' => ['class' => 'badge-info', 'dot' => 'badge-dot-info', 'label' => 'Project Baru'],
        'pdf_downloaded' => ['class' => 'badge-success', 'dot' => 'badge-dot-success', 'label' => 'Export PDF Selesai'],
        default => ['class' => 'badge-info', 'dot' => 'badge-dot-info', 'label' => 'Diperbarui'],
    };

    $headerTitle = $titles[$typeKey] ?? 'Pemberitahuan Aktivitas Project';
    $headerSubtitle = $subtitles[$typeKey] ?? 'Pembaruan data pada sistem repositori STAS RG Projects.';
@endphp

@section('title', $headerTitle)
@section('header_subtitle', 'Notifikasi Aktivitas Project STAS-RG')

@section('content')
    <h2 class="email-title">{{ $headerTitle }}</h2>
    <p class="email-subtitle">{{ $headerSubtitle }}</p>

    <div class="greeting">
        Halo {{ $user->name }},
    </div>

    <p class="paragraph">
        Kami menginformasikan bahwa aktivitas <strong>{{ str_replace('_', ' ', $eventType) }}</strong> telah berhasil diproses untuk project riset berikut:
    </p>

    <!-- Structured Project Summary Card -->
    <div class="card">
        @if(!empty($project->main_image))
            <div style="margin-bottom: 16px; border-radius: 10px; overflow: hidden; border: 1px solid #E2E8F0; text-align: center; background-color: #FFFFFF;">
                <img src="{{ url('/storage/' . $project->main_image) }}" alt="{{ $project->title }}" style="max-width: 100%; height: auto; display: block; margin: 0 auto; border-radius: 10px;" />
            </div>
        @endif

        <table class="card-table">
            <tr>
                <td class="card-label">Judul Project</td>
                <td class="card-value"><strong>{{ $project->title ?? $project->name }}</strong></td>
            </tr>
            <tr>
                <td class="card-label">Kategori Riset</td>
                <td class="card-value">
                    <span class="badge badge-info">
                        <span class="badge-dot badge-dot-info"></span>
                        {{ $project->category ?? 'Spesifikasi Sistem & IoT' }}
                    </span>
                </td>
            </tr>
            @if(!empty($project->project_leader))
            <tr>
                <td class="card-label">Ketua Tim / Peneliti</td>
                <td class="card-value">{{ $project->project_leader }}</td>
            </tr>
            @endif
            <tr>
                <td class="card-label">Status Terkini</td>
                <td class="card-value">
                    <span class="badge {{ $eventBadge['class'] }}">
                        <span class="badge-dot {{ $eventBadge['dot'] }}"></span>
                        {{ $eventBadge['label'] }}
                    </span>
                </td>
            </tr>
            <tr>
                <td class="card-label">Waktu Pembaruan</td>
                <td class="card-value">{{ now()->translatedFormat('d F Y, H:i') . ' WIB' }}</td>
            </tr>
        </table>
    </div>

    @if($eventType !== 'deleted')
        <div class="button-wrapper">
            @if($eventType === 'published')
                <a href="{{ url('/#projects-showcase') }}" class="btn-primary" target="_blank">
                    Lihat di Showcase Publik
                </a>
            @else
                <a href="{{ url('/projects/' . ($project->slug ?? $project->id)) }}" class="btn-primary" target="_blank">
                    Buka Detail Project
                </a>
            @endif
        </div>
    @else
        <div class="button-wrapper">
            <a href="{{ url('/projects') }}" class="btn-primary" target="_blank">
                Kembali ke Daftar Project
            </a>
        </div>
    @endif

    <div class="info-callout">
        Seluruh histori perubahan dan versi dokumen tersimpan pada repositori audit laboratorium STAS-RG.
    </div>
@endsection
