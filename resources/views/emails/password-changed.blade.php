@extends('emails.layouts.master')

@section('title', 'Kata Sandi Berhasil Diubah')
@section('header_subtitle', 'Peringatan Keamanan Akun STAS RG Projects')

@section('content')
    <h2 class="email-title">Kata Sandi Berhasil Diperbarui</h2>
    <p class="email-subtitle">Kata sandi akun STAS RG Projects Anda baru saja diperbarui.</p>

    <div class="greeting">
        Halo {{ $user->name }},
    </div>

    <p class="paragraph">
        Kami mengonfirmasi bahwa kata sandi untuk akun <strong>{{ $user->email }}</strong> telah berhasil diubah pada sistem kami.
    </p>

    <!-- Info Card -->
    <div class="card">
        <table class="card-table">
            <tr>
                <td class="card-label">Aktivitas</td>
                <td class="card-value">
                    <span class="badge badge-success">
                        <span class="badge-dot badge-dot-success"></span>
                        Pengubahan Kata Sandi Sukses
                    </span>
                </td>
            </tr>
            <tr>
                <td class="card-label">Waktu Perubahan</td>
                <td class="card-value">{{ now()->translatedFormat('d F Y, H:i') . ' WIB' }}</td>
            </tr>
            <tr>
                <td class="card-label">Alamat IP / Lokasi</td>
                <td class="card-value">{{ $ipAddress ?? 'Aktivitas Terenkripsi' }}</td>
            </tr>
        </table>
    </div>

    <div class="info-callout" style="border-left-color: #EF4444; background-color: #FEF2F2; color: #991B1B;">
        <strong>Perhatian Keamanan:</strong> Jika Anda tidak melakukan perubahan ini, akun Anda mungkin telah diakses oleh pihak tidak berwenang. Segera lakukan reset kata sandi atau hubungi administrator sistem.
    </div>

    <div class="button-wrapper">
        <a href="{{ url('/forgot-password') }}" class="btn-primary" style="background-color: #DC2626;" target="_blank">
            Amankan Akun Saya
        </a>
    </div>
@endsection
