@extends('emails.layouts.master')

@section('title', 'Pemberitahuan Pendaftar Baru')
@section('header_subtitle', 'Notifikasi Registrasi Pengguna Baru')

@section('content')
    <h2 class="email-title">Pendaftar Akun Baru</h2>
    <p class="email-subtitle">Ada pengguna baru yang baru saja mendaftar ke sistem STAS RG Projects dan menunggu peninjauan.</p>

    <div class="greeting">
        Halo Tim Administrator STAS-RG,
    </div>

    <p class="paragraph">
        Sistem mendeteksi adanya registrasi akun baru pada portal <strong>STAS RG Projects</strong>. Berikut adalah rincian data pengguna yang baru terdaftar:
    </p>

    <!-- Info Card -->
    <div class="card">
        <table class="card-table">
            <tr>
                <td class="card-label">Nama Lengkap</td>
                <td class="card-value"><strong>{{ $user->name }}</strong></td>
            </tr>
            <tr>
                <td class="card-label">Alamat Email</td>
                <td class="card-value">{{ $user->email }}</td>
            </tr>
            <tr>
                <td class="card-label">Username</td>
                <td class="card-value">{{ '@' . $user->username }}</td>
            </tr>
            <tr>
                <td class="card-label">Status Awal</td>
                <td class="card-value">
                    <span class="badge badge-pending">
                        <span class="badge-dot badge-dot-pending"></span>
                        Menunggu Persetujuan
                    </span>
                </td>
            </tr>
            <tr>
                <td class="card-label">Waktu Registrasi</td>
                <td class="card-value">{{ $user->created_at ? $user->created_at->translatedFormat('d F Y, H:i') . ' WIB' : now()->translatedFormat('d F Y, H:i') . ' WIB' }}</td>
            </tr>
        </table>
    </div>

    <p class="paragraph">
        Silakan lakukan verifikasi dan persetujuan hak akses pengguna melalui Manajemen Pengguna di Admin Panel.
    </p>

    <!-- Primary CTA -->
    <div class="button-wrapper">
        <a href="{{ $actionUrl ?? url('/admin/users') }}" class="btn-primary" target="_blank">
            Buka Manajemen Pengguna
        </a>
    </div>

    <!-- Secondary Help / Disclaimer -->
    <div class="info-callout">
        Pastikan kesesuaian identitas dan hak otorisasi peneliti sebelum menyetujui akun pengguna.
    </div>
@endsection
