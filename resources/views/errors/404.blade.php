@extends('errors.layout')

@section('code', '404')
@section('title', 'Halaman Tidak Ditemukan')

@section('content')
<img src="{{ asset('assets/img/icon/notfound.png') }}" alt="Halaman Tidak Ditemukan" style="width: 120px; height: auto; margin: 0 auto 16px; display: block; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.04));">
<h1 class="error-title">Halaman Tidak Ditemukan</h1>

<p class="error-description">
    Halaman atau dokumen spesifikasi riset yang Anda tuju tidak ditemukan pada sistem repositori STAS RG Projects atau mungkin telah dipindahkan.
</p>

<div class="actions-wrapper">
    @auth
    <a href="{{ route('dashboard') }}" class="btn btn-primary">
        Kembali ke Dashboard
    </a>
    @else
    <a href="{{ url('/') }}" class="btn btn-primary">
        Kembali ke Beranda
    </a>
    @endauth

    <button type="button" onclick="window.history.length > 1 ? window.history.back() : window.location.href='/'" class="btn btn-secondary">
        Kembali ke Halaman Sebelumnya
    </button>
</div>
@endsection