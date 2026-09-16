@extends('emails.layouts.master')

@section('title', 'Notifikasi Masuk Akun')
@section('header_subtitle', 'Laporan Keamanan Aktivitas Sesi STAS RG Projects')

@section('content')
    <h2 class="email-title">Aktivitas Masuk Akun Terdeteksi</h2>
    <p class="email-subtitle">Sistem mencatat adanya aktivitas masuk (login) baru pada akun Anda.</p>

    <div class="greeting">
        Halo {{ $user->name }},
    </div>

    <p class="paragraph">
        Akun STAS RG Projects Anda baru saja digunakan untuk masuk ke portal proyek riset STAS RG. Berikut adalah detail sesi akses:
    </p>

    <!-- Info Card -->
    <div class="card">
        <table class="card-table">
            <tr>
                <td class="card-label">Akun Pengguna</td>
                <td class="card-value"><strong>{{ $user->email }}</strong></td>
            </tr>
            <tr>
                <td class="card-label">Waktu Masuk</td>
                <td class="card-value">{{ now()->translatedFormat('d F Y, H:i') . ' WIB' }}</td>
            </tr>
            <tr>
                <td class="card-label">Alamat IP</td>
                <td class="card-value">{{ $ipAddress ?? '127.0.0.1' }}</td>
            </tr>
            <tr>
                <td class="card-label">Perangkat / Browser</td>
                <td class="card-value">{{ $userAgent ?? 'Browser Web' }}</td>
            </tr>
            <tr>
                <td class="card-label">Status Sesi</td>
                <td class="card-value">
                    <span class="badge badge-info">
                        <span class="badge-dot badge-dot-info"></span>
                        Sesi Aktif
                    </span>
                </td>
            </tr>
        </table>
    </div>

    <p class="paragraph">
        Jika aktivitas ini adalah Anda, tidak ada tindakan lebih lanjut yang perlu dilakukan.
    </p>

    <div class="info-callout" style="border-left-color: #F59E0B; background-color: #FFFBEB; color: #92400E;">
        Jika Anda tidak mengenali aktivitas login ini, kami menyarankan untuk segera mengganti kata sandi demi menjaga keamanan dokumen riset Anda.
    </div>

    <div class="button-wrapper">
        <a href="{{ url('/dashboard') }}" class="btn-primary" target="_blank">
            Menuju Dashboard
        </a>
    </div>
@endsection
