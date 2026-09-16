@extends('errors.layout')

@section('code', '500')
@section('title', 'Terjadi Kesalahan Server')

@section('content')
    <img src="{{ asset('assets/img/icon/kesalahanserver.png') }}" alt="Terjadi Kesalahan pada Server" style="width: 120px; height: auto; margin: 0 auto 16px; display: block; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.04));">
    <h1 class="error-title">Terjadi Kesalahan pada Server</h1>
    
    <p class="error-description">
        Sistem STAS RG Projects mengalami kendala teknis saat memproses permintaan ini. Tim administrator dan engineer laboratorium telah mencatat aktivitas ini untuk segera ditangani.
    </p>

    <div class="actions-wrapper">
        <button type="button" onclick="window.location.reload()" class="btn btn-primary">
            Coba Muat Ulang
        </button>
        
        <a href="{{ url('/') }}" class="btn btn-secondary">
            Kembali ke Beranda
        </a>
    </div>

    <div class="info-pill">
        Jika masalah berlanjut, hubungi <a href="{{ url('/support') }}" style="color: inherit; font-weight: 700; text-decoration: underline;">Pusat Bantuan & Kontak Support</a> atau email stas.research@telkomuniversity.ac.id
    </div>
@endsection
