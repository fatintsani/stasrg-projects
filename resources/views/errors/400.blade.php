@extends('errors.layout')

@section('code', '400')
@section('title', 'Permintaan Tidak Valid')

@section('content')
    <img src="{{ asset('assets/img/icon/tidakvalid.png') }}" alt="Permintaan Tidak Valid" style="width: 120px; height: auto; margin: 0 auto 16px; display: block; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.04));">
    <h1 class="error-title">Permintaan Tidak Valid</h1>
    
    <p class="error-description">
        Format permintaan data atau parameter yang dikirimkan tidak dapat diproses oleh server sistem STAS RG Projects.
    </p>

    <div class="actions-wrapper">
        <button type="button" onclick="window.location.reload()" class="btn btn-primary">
            Coba Muat Ulang
        </button>
        
        <a href="{{ url('/') }}" class="btn btn-secondary">
            Kembali ke Beranda
        </a>
    </div>
@endsection
