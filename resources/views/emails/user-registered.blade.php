@extends('emails.layouts.master')

@section('title', 'Pendaftaran Akun Berhasil')
@section('header_subtitle', 'Notifikasi Registrasi Pengguna STAS RG Projects')

@section('content')
    <div class="badge-pill badge-pending" style="margin-bottom: 12px;">
        <span class="badge-dot badge-dot-pending"></span>
        <span>Menunggu Persetujuan Admin</span>
    </div>

    <h1 class="email-title">Pendaftaran Akun Berhasil</h1>

    <div class="greeting">
        Halo {{ $user->name }},
    </div>

    <p class="paragraph">
        Terima kasih telah mendaftar di <strong>STAS RG Projects Platform</strong>. Akun Anda telah berhasil dibuat dan saat ini sedang dalam proses review verifikasi oleh Tim Administrator Lab CoE STAS-RG.
    </p>

    <!-- Account Details Card -->
    <div class="card">
        <div style="font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 12px;">
            Rincian Akun Peneliti
        </div>
        <table class="card-table">
            <tr>
                <td class="card-label">Nama Lengkap</td>
                <td class="card-value"><strong>{{ $user->name }}</strong></td>
            </tr>
            <tr>
                <td class="card-label">Username</td>
                <td class="card-value">{{ '@' . ($user->username ?? 'peneliti') }}</td>
            </tr>
            <tr>
                <td class="card-label">Email Terdaftar</td>
                <td class="card-value">{{ $user->email }}</td>
            </tr>
            <tr>
                <td class="card-label">Status Akun</td>
                <td class="card-value">
                    <span class="badge badge-pending">
                        <span class="badge-dot badge-dot-pending"></span>
                        Menunggu Persetujuan
                    </span>
                </td>
            </tr>
        </table>
    </div>

    <p class="paragraph" style="color: #64748B;">
        Anda akan menerima email pemberitahuan otomatis segera setelah Administrator menyetujui akun Anda. Setelah disetujui, Anda dapat langsung masuk ke Admin Panel untuk mulai membuat dan mengelola dokumen riset.
    </p>

    <div class="button-wrapper">
        <a href="{{ config('app.url') }}/login" class="btn-primary" target="_blank">
            Kunjungi Halaman Login
        </a>
    </div>
@endsection
