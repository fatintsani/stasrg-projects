@extends('emails.layouts.master')

@section('title', 'Pembaruan Profil Akun')
@section('header_subtitle', 'Notifikasi Pengaturan Akun STAS RG Projects')

@section('content')
    <h2 class="email-title">Profil Akun Telah Diperbarui</h2>
    <p class="email-subtitle">Data profil atau foto avatar akun STAS RG Projects Anda baru saja diperbarui.</p>

    <div class="greeting">
        Halo {{ $user->name }},
    </div>

    <p class="paragraph">
        Kami mengonfirmasi bahwa perubahan data profil pada akun <strong>{{ $user->email }}</strong> telah berhasil disimpan:
    </p>

    <!-- Info Card -->
    <div class="card">
        <table class="card-table">
            <tr>
                <td class="card-label">Nama Lengkap</td>
                <td class="card-value"><strong>{{ $user->name }}</strong></td>
            </tr>
            <tr>
                <td class="card-label">Username</td>
                <td class="card-value">{{ '@' . $user->username }}</td>
            </tr>
            <tr>
                <td class="card-label">Alamat Email</td>
                <td class="card-value">{{ $user->email }}</td>
            </tr>
            <tr>
                <td class="card-label">Waktu Pembaruan</td>
                <td class="card-value">{{ now()->translatedFormat('d F Y, H:i') . ' WIB' }}</td>
            </tr>
            <tr>
                <td class="card-label">Status Profil</td>
                <td class="card-value">
                    <span class="badge badge-success">
                        <span class="badge-dot badge-dot-success"></span>
                        Tersinkronisasi
                    </span>
                </td>
            </tr>
        </table>
    </div>

    <p class="paragraph">
        Jika Anda tidak merasa melakukan perubahan data ini, segera amankan akun Anda melalui menu pengaturan kata sandi.
    </p>

    <div class="button-wrapper">
        <a href="{{ url('/admin/settings') }}" class="btn-primary" target="_blank">
            Buka Pengaturan Akun
        </a>
    </div>
@endsection
