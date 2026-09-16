@extends('emails.layouts.master')

@section('title', 'Pemberitahuan Status Permohonan Akun')
@section('header_subtitle', 'Notifikasi Peninjauan Akun STAS RG Projects')

@section('content')
    <h2 class="email-title">Status Permohonan Akun</h2>
    <p class="email-subtitle">Pembaruan mengenai status pendaftaran akun Anda di sistem STAS RG Projects.</p>

    <div class="greeting">
        Halo {{ $user->name }},
    </div>

    <p class="paragraph">
        Terima kasih atas ketertarikan Anda untuk bergabung dengan platform manajemen proyek riset <strong>STAS RG Projects</strong>.
    </p>

    <p class="paragraph">
        Setelah dilakukan peninjauan oleh Tim Administrator STAS-RG, mohon maaf permohonan akses akun Anda saat ini <strong>belum dapat disetujui</strong>.
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
                <td class="card-label">Status Peninjauan</td>
                <td class="card-value">
                    <span class="badge badge-error">
                        <span class="badge-dot badge-dot-error"></span>
                        Ditolak / Belum Memenuhi Syarat
                    </span>
                </td>
            </tr>
            @if(!empty($reason))
            <tr>
                <td class="card-label">Catatan Admin</td>
                <td class="card-value" style="color: #EF4444;">{{ $reason }}</td>
            </tr>
            @endif
        </table>
    </div>

    <p class="paragraph">
        Jika Anda merasa ini adalah sebuah kekeliruan atau ingin mengajukan konfirmasi lebih lanjut terkait afiliasi riset, silakan hubungi tim lab kami melalui email resmi.
    </p>

    <!-- Primary CTA -->
    <div class="button-wrapper">
        <a href="mailto:stas.research@telkomuniversity.ac.id" class="btn-primary" target="_blank">
            Hubungi Tim Riset STAS-RG
        </a>
    </div>
@endsection
