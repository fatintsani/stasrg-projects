@extends('emails.layouts.master')

@section('title', 'Perubahan Status Aktivasi Akun')
@section('header_subtitle', 'Notifikasi Keamanan & Akses Akun STAS RG Projects')

@section('content')
    <h2 class="email-title">Pembaruan Status Akun</h2>
    <p class="email-subtitle">Status keaktifan akun Anda telah diperbarui oleh administrator sistem.</p>

    <div class="greeting">
        Halo {{ $user->name }},
    </div>

    <p class="paragraph">
        Kami menginformasikan bahwa status akun Anda di portal <strong>STAS RG Projects</strong> telah diubah:
    </p>

    <!-- Info Card -->
    <div class="card">
        <table class="card-table">
            <tr>
                <td class="card-label">Nama Akun</td>
                <td class="card-value"><strong>{{ $user->name }}</strong></td>
            </tr>
            <tr>
                <td class="card-label">Email Akun</td>
                <td class="card-value">{{ $user->email }}</td>
            </tr>
            <tr>
                <td class="card-label">Status Baru</td>
                <td class="card-value">
                    @if($status === 'active')
                        <span class="badge badge-success">
                            <span class="badge-dot badge-dot-success"></span>
                            Aktif (Active)
                        </span>
                    @else
                        <span class="badge badge-warning">
                            <span class="badge-dot badge-dot-warning"></span>
                            Dinonaktifkan (Inactive)
                        </span>
                    @endif
                </td>
            </tr>
            <tr>
                <td class="card-label">Waktu Pembaruan</td>
                <td class="card-value">{{ now()->translatedFormat('d F Y, H:i') . ' WIB' }}</td>
            </tr>
        </table>
    </div>

    @if($status === 'active')
        <p class="paragraph">
            Akun Anda sekarang dapat digunakan kembali untuk mengakses seluruh fitur pembuatan dan publikasi spesifikasi riset.
        </p>

        <div class="button-wrapper">
            <a href="{{ url('/login') }}" class="btn-primary" target="_blank">
                Masuk ke Akun
            </a>
        </div>
    @else
        <p class="paragraph">
            Akses masuk ke akun Anda saat ini sedang dinonaktifkan sementara. Untuk informasi pembukaan kembali akun, silakan hubungi tim administrator laboratorium.
        </p>

        <div class="button-wrapper">
            <a href="mailto:stas.research@telkomuniversity.ac.id" class="btn-primary" target="_blank">
                Hubungi Dukungan Laboratorium
            </a>
        </div>
    @endif
@endsection
