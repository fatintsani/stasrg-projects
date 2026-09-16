@extends('emails.layouts.master')

@section('title', 'Akun Anda Telah Disetujui')
@section('header_subtitle', 'Notifikasi Status Keanggotaan STAS RG Projects')

@section('content')
    <h2 class="email-title">Akun Berhasil Disetujui</h2>
    <p class="email-subtitle">Selamat! Akses akun Anda di sistem STAS RG Projects telah aktif sepenuhnya.</p>

    <div class="greeting">
        Halo {{ $user->name }},
    </div>

    <p class="paragraph">
        Kabar baik! Tim Administrator STAS-RG telah memverifikasi identitas Anda dan <strong>menyetujui permohonan akses akun Anda</strong> di portal STAS RG Projects.
    </p>

    <!-- Info Card -->
    <div class="card">
        <table class="card-table">
            <tr>
                <td class="card-label">Nama Akun</td>
                <td class="card-value"><strong>{{ $user->name }}</strong></td>
            </tr>
            <tr>
                <td class="card-label">Email Terdaftar</td>
                <td class="card-value">{{ $user->email }}</td>
            </tr>
            <tr>
                <td class="card-label">Peran / Role</td>
                <td class="card-value">{{ ucfirst($user->role ?? 'Peneliti / Engineer') }}</td>
            </tr>
            <tr>
                <td class="card-label">Status Akses</td>
                <td class="card-value">
                    <span class="badge badge-success">
                        <span class="badge-dot badge-dot-success"></span>
                        Disetujui (Approved)
                    </span>
                </td>
            </tr>
        </table>
    </div>

    <p class="paragraph">
        Kini Anda dapat langsung masuk untuk mulai menyusun spesifikasi riset, mendokumentasikan skema arsitektur, dan mengenerate laporan CoE STAS-RG berstandar institusi.
    </p>

    <!-- Primary CTA -->
    <div class="button-wrapper">
        <a href="{{ $loginUrl ?? url('/login') }}" class="btn-primary" target="_blank">
            Masuk ke Dashboard STAS RG Projects
        </a>
    </div>

    <div class="info-callout">
        Gunakan kredensial yang telah Anda daftarkan. Jaga kerahasiaan kata sandi Anda dan jangan berikan kepada pihak lain.
    </div>
@endsection
