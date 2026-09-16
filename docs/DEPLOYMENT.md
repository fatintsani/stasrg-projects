# STAS RG Projects — Panduan Deployment & Operasional Produksi (Production Guide)

Dokumen ini memandu proses instalasi, deployment ke server produksi (VPS / Dedicated Server / Cloud), konfigurasi Nginx, PHP-FPM, Supervisor Queue Worker, Crontab Scheduler, SSL, dan optimasi performa tingkat lanjut.

---

## 🖥️ 1. Prasyarat Server Produksi

- **Sistem Operasi**: Ubuntu 22.04 LTS / 24.04 LTS (atau Debian 12)
- **Web Server**: Nginx
- **PHP**: PHP 8.3 atau 8.5 (dengan ekstensi: `php8.3-fpm`, `php8.3-cli`, `php8.3-mysql`, `php8.3-sqlite3`, `php8.3-mbstring`, `php8.3-xml`, `php8.3-bcmath`, `php8.3-curl`, `php8.3-gd`, `php8.3-zip`, `php8.3-redis`)
- **Database**: MySQL 8.0+ / MariaDB 10.11+ / PostgreSQL 16+ (atau SQLite 3)
- **Queue / Cache Store**: Redis (Sangat direkomendasikan untuk beban tinggi) atau Database driver
- **Process Manager**: Supervisor
- **Node.js**: Node.js v20.x + npm

---

## ⚙️ 2. Langkah-Langkah Deployment

### 2.1. Kloning Repositori & Instal Dependensi
```bash
cd /var/www
git clone https://github.com/fatintsani/stasrg-generator.git stasikator
cd /var/www/stasikator

# Set izin direktori kepemilikan web server
sudo chown -R www-data:www-data /var/www/stasikator
sudo chmod -R 775 /var/www/stasikator/storage /var/www/stasikator/bootstrap/cache

# Instal dependensi backend (tanpa dev packages)
composer install --no-dev --optimize-autoloader

# Instal dependensi frontend & build bundle aset produksi
npm ci
npm run build
```

### 2.2. Konfigurasi Environment (`.env`)
```bash
cp .env.example .env
php artisan key:generate
```

Sesuaikan parameter `.env` berikut untuk produksi:
```ini
APP_NAME="STAS-RG Generator"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://stasikator.telkomuniversity.ac.id

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=stasrg_production
DB_USERNAME=stasrg_user
DB_PASSWORD=SecureProductionPassword123!

# Cache & Queue Driver
CACHE_STORE=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis

# Redis Configuration
REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# SMTP Email Server
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=stas.researchgroup@telkomuniversity.ac.id
MAIL_PASSWORD=your-app-specific-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="stas.researchgroup@telkomuniversity.ac.id"
MAIL_FROM_NAME="CoE STAS-RG Telkom University"

# AI Integration
AI_PROVIDER=gemini
GEMINI_API_KEY=AIzaSy...your_gemini_production_key
GEMINI_DEFAULT_MODEL=gemini-3.6-flash
```

### 2.3. Migrasi Database & Storage Symlink
```bash
php artisan migrate --force
php artisan storage:link
```

### 2.4. Cache Optimasi Laravel
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
```

---

## 🌐 3. Konfigurasi Web Server (Nginx)

Buat file konfigurasi `/etc/nginx/sites-available/stasikator.conf`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name stasikator.telkomuniversity.ac.id;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name stasikator.telkomuniversity.ac.id;
    root /var/www/stasikator/public;

    # SSL Certificates (Let's Encrypt / Certbot)
    ssl_certificate /etc/letsencrypt/live/stasikator.telkomuniversity.ac.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/stasikator.telkomuniversity.ac.id/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    index index.php index.html;
    charset utf-8;

    # Client Max Body Size (Untuk Unggahan Gambar & Media Beresolusi Tinggi)
    client_max_body_size 25M;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    # Static Assets Caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff|woff2|ttf|svg)$ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

Aktifkan konfigurasi Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/stasikator.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔄 4. Konfigurasi Queue Worker (Supervisor)

Untuk memastikan email asinkron dan tugas latar belakang diproses secara andal, pasang dan konfigurasikan Supervisor:

Buat file `/etc/supervisor/conf.d/stasikator-worker.conf`:

```ini
[program:stasikator-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/stasikator/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600 --timeout=90
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/stasikator/storage/logs/worker.log
stopwaitsecs=3600
```

Aktifkan worker:
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start stasikator-worker:*
```

---

## ⏰ 5. Konfigurasi Cron Scheduler

Buka crontab pengguna `www-data`:
```bash
sudo crontab -u www-data -e
```

Tambahkan baris berikut:
```cron
* * * * * cd /var/www/stasikator && php artisan schedule:run >> /dev/null 2>&1
```

---

## 🔒 6. Sertifikat SSL Gratis (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d stasikator.telkomuniversity.ac.id
```

---

## 🚀 7. Zero-Downtime Deployment Script (`deploy.sh`)

Buat skrip `deploy.sh` pada root direktori:

```bash
#!/bin/bash
set -e

echo "🚀 Memulai Deployment STAS RG Projects..."

# Masuk ke Maintenance Mode
php artisan down --retry=60 || true

# Tarik kode terbaru
git pull origin main

# Instal dependensi
composer install --no-dev --optimize-autoloader
npm ci
npm run build

# Migrasi Basis Data
php artisan migrate --force

# Refresh Cache
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Restart Queue Worker
php artisan queue:restart

# Keluar dari Maintenance Mode
php artisan up

echo "✅ Deployment Berhasil Selesai!"
```

Berikan hak akses eksekusi:
```bash
chmod +x deploy.sh
```
