@extends('emails.layouts.master')

@section('title', 'Kode OTP Pemulihan Kata Sandi')
@section('header_subtitle', 'Verifikasi Keamanan Akun STAS RG Projects')

@section('content')
    <div class="badge-pill badge-warning" style="margin-bottom: 12px;">
        <span class="badge-dot badge-dot-warning"></span>
        <span>Pemulihan Kata Sandi // OTP</span>
    </div>

    <h1 class="email-title">Kode Verifikasi Anda</h1>
    
    <div class="greeting">
        Halo Peneliti,
    </div>

    <p class="paragraph">
        Kami menerima permintaan pengaturan ulang kata sandi untuk akun STAS RG Projects Anda. Gunakan kode <strong>One-Time Password (OTP)</strong> berikut untuk memverifikasi identitas Anda:
    </p>

    <!-- Prominent OTP Box -->
    <div class="status-box status-box-otp">
        <div style="font-size: 11px; font-weight: 700; color: #0AB600; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 8px;">
            KODE OTP VERIFIKASI (BERLAKU 15 MENIT)
        </div>
        <div class="otp-code">
            {{ $otpCode }}
        </div>
    </div>

    <!-- Security Warning Card -->
    <div class="info-card" style="border-left: 3px solid #F59E0B; margin-top: 20px;">
        <div style="font-size: 12px; font-weight: 700; color: #92400E; margin-bottom: 4px;">
            Pemberitahuan Keamanan
        </div>
        <div style="font-size: 12px; color: #78350F; line-height: 1.55;">
            Jangan berikan kode OTP ini kepada siapa pun, termasuk staf lab. Jika Anda tidak merasa melakukan permintaan pemulihan ini, abaikan email ini dan akun Anda akan tetap aman.
        </div>
    </div>

    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #F1F5F9; font-size: 12px; color: #64748B;">
        Permintaan dikirimkan untuk akun: <strong>{{ $email }}</strong>
    </div>
@endsection
