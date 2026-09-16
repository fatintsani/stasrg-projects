<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('code', 'Error') — @yield('title', 'Terjadi Kesalahan') | STAS RG Projects</title>

    <!-- Favicon -->
    <link rel="icon" type="image/png" href="{{ asset('assets/img/stas.png') }}">
    <link rel="shortcut icon" type="image/png" href="{{ asset('assets/img/stas.png') }}">

    <!-- Google Fonts: Plus Jakarta Sans -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">

    <style>
        *, *::before, *::after {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            box-shadow: none !important;
        }

        body {
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #FAFBFD;
            color: #0F172A;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: center;
            padding: 24px 16px;
            position: relative;
            overflow-x: hidden;
        }

        /* Ambient subtle backdrop glows */
        .ambient-glow-1 {
            position: absolute;
            top: -100px;
            left: 50%;
            transform: translateX(-50%);
            width: 650px;
            height: 350px;
            background: radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, rgba(10, 182, 0, 0.03) 60%, transparent 100%);
            border-radius: 9999px;
            pointer-events: none;
            z-index: 0;
        }

        .ambient-glow-2 {
            position: absolute;
            bottom: -50px;
            right: 5%;
            width: 400px;
            height: 300px;
            background: radial-gradient(circle, rgba(10, 182, 0, 0.05) 0%, transparent 70%);
            border-radius: 9999px;
            pointer-events: none;
            z-index: 0;
        }

        /* Top Brand Header */
        .header-brand {
            position: relative;
            z-index: 10;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 14px;
            padding: 12px 0 24px;
            text-decoration: none;
        }

        .header-brand img {
            height: 36px;
            width: auto;
            object-fit: contain;
        }

        .brand-divider {
            width: 1px;
            height: 24px;
            background-color: #CBD5E1;
        }

        /* Center Error Card */
        .error-container {
            position: relative;
            z-index: 10;
            width: 100%;
            max-width: 540px;
            margin: auto 0;
            background: #FFFFFF;
            border: 1px solid #E2E8F0;
            border-radius: 24px;
            padding: 40px 32px;
            text-align: center;
            transition: all 0.3s ease;
        }

        @media (max-width: 640px) {
            .error-container {
                padding: 32px 20px;
                border-radius: 20px;
            }
        }

        /* Status Dot Badge */
        .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 12px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 20px;
        }

        .badge-dot {
            width: 6px;
            height: 6px;
            border-radius: 9999px;
        }

        .badge-404, .badge-400 {
            background-color: #EFF6FF;
            color: #1E40AF;
            border: 1px solid #BFDBFE;
        }
        .badge-404 .badge-dot, .badge-400 .badge-dot {
            background-color: #3B82F6;
        }

        .badge-401, .badge-403, .badge-419 {
            background-color: #FFFBEB;
            color: #92400E;
            border: 1px solid #FDE68A;
        }
        .badge-401 .badge-dot, .badge-403 .badge-dot, .badge-419 .badge-dot {
            background-color: #F59E0B;
        }

        .badge-429 {
            background-color: #FFF7ED;
            color: #9A3412;
            border: 1px solid #FED7AA;
        }
        .badge-429 .badge-dot {
            background-color: #EA580C;
        }

        .badge-500, .badge-503 {
            background-color: #FEF2F2;
            color: #991B1B;
            border: 1px solid #FECACA;
        }
        .badge-500 .badge-dot, .badge-503 .badge-dot {
            background-color: #EF4444;
        }

        /* Error Numeric Display */
        .error-code {
            font-size: 72px;
            font-weight: 800;
            line-height: 1;
            letter-spacing: -2px;
            color: #0F172A;
            margin-bottom: 12px;
            font-family: 'Plus Jakarta Sans', sans-serif;
        }

        .error-title {
            font-size: 20px;
            font-weight: 800;
            color: #0F172A;
            margin-bottom: 10px;
            letter-spacing: -0.3px;
        }

        .error-description {
            font-size: 14px;
            line-height: 1.6;
            color: #64748B;
            margin-bottom: 28px;
            max-width: 440px;
            margin-left: auto;
            margin-right: auto;
        }

        /* Action Buttons */
        .actions-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            flex-wrap: wrap;
        }

        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 11px 22px;
            border-radius: 12px;
            font-size: 13px;
            font-weight: 700;
            text-decoration: none;
            cursor: pointer;
            transition: all 0.2s ease;
            border: 1px solid transparent;
        }

        .btn-primary {
            background-color: #0AB600;
            color: #FFFFFF;
            border-color: #0AB600;
        }

        .btn-primary:hover {
            background-color: #089600;
            border-color: #089600;
            color: #FFFFFF;
        }

        .btn-secondary {
            background-color: #F8FAFC;
            color: #334155;
            border-color: #E2E8F0;
        }

        .btn-secondary:hover {
            background-color: #F1F5F9;
            color: #0F172A;
            border-color: #CBD5E1;
        }

        /* Technical Info Callout (Optional / Safe) */
        .info-pill {
            margin-top: 24px;
            padding: 10px 14px;
            border-radius: 10px;
            background-color: #F8FAFC;
            border: 1px solid #E2E8F0;
            font-size: 12px;
            color: #64748B;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
        }

        /* Footer */
        .error-footer {
            position: relative;
            z-index: 10;
            padding: 20px 0 8px;
            text-align: center;
            font-size: 12px;
            color: #94A3B8;
        }

        .error-footer a {
            color: #0AB600;
            text-decoration: none;
            font-weight: 600;
        }

        .error-footer a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="ambient-glow-1"></div>
    <div class="ambient-glow-2"></div>

    <!-- Header Dual Logos -->
    <a href="{{ url('/') }}" class="header-brand" title="Menuju Beranda STAS-RG Projects">
        <img src="{{ asset('assets/img/telu.png') }}" alt="Telkom University" onerror="this.style.display='none'">
        <div class="brand-divider"></div>
        <img src="{{ asset('assets/img/stas.png') }}" alt="STAS-RG" onerror="this.src='/assets/img/STAS RG.png'">
    </a>

    <!-- Error Card Box -->
    <div class="error-container">
        @yield('content')
    </div>

    <!-- Footer Attribution -->
    <footer class="error-footer">
        © {{ date('Y') }} <strong>CoE STAS-RG</strong> • Fakultas Ilmu Terapan Telkom University.<br>
        <span style="font-size: 11px;">Butuh bantuan? Kunjungi <a href="{{ url('/support') }}" style="color: #0AB600; font-weight: 700; text-decoration: underline;">Pusat Bantuan & Kontak Support</a> atau email <a href="mailto:stas.research@telkomuniversity.ac.id">stas.research@telkomuniversity.ac.id</a></span>
    </footer>
</body>
</html>
