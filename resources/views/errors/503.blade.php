@extends('errors.layout')

@section('code', '503')
@section('title', 'Layanan Sedang Pemeliharaan')

@section('content')
    <img src="{{ asset('assets/img/icon/pemeliharaan.png') }}" alt="Layanan Sedang dalam Pemeliharaan" style="width: 120px; height: auto; margin: 0 auto 16px; display: block; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.04));">
    <h1 class="error-title">Layanan Sedang dalam Pemeliharaan</h1>
    
    <p class="error-description">
        Sistem STAS RG Projects saat ini sedang menjalani proses pemeliharaan rutin atau peningkatan infrastruktur server. Kami akan segera kembali aktif dalam beberapa saat.
    </p>

    <div class="actions-wrapper">
        <button type="button" onclick="window.location.reload()" class="btn btn-primary">
            Coba Muat Ulang
        </button>
        
        <a href="https://www.stas-rg.com" target="_blank" class="btn btn-secondary">
            Kunjungi Website STAS-RG
        </a>
    </div>

    <div class="info-pill">
        Laboratorium CoE STAS-RG • Fakultas Ilmu Terapan Telkom University.
    </div>
@endsection
