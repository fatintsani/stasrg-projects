import React, { useState, useRef, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import { useApp } from '../../Context/AppContext';
import { useAlert } from '../../Context/AlertContext';
import { compressImage } from '../../Utils/imageCompressor';
import {
    Settings as SettingsIcon,
    Plus,
    FolderKanban,
    Fingerprint,
    ShieldCheck,
    CheckCircle2,
    Trash2,
    Sun,
    Moon,
    Globe,
    User,
    Mail,
    Shield,
    ArrowRight,
    KeyRound,
    Laptop,
    Check,
    AlertCircle,
    Calendar,
    Layers,
    FileText,
    ExternalLink,
    Camera,
    Upload,
    X,
    Loader2,
    Lock,
    Eye,
    EyeOff,
    Wrench,
    Server,
    HardDrive,
    RefreshCw,
    Zap,
    Cpu,
    Database,
    Activity,
    Power,
    ShieldAlert,
    Sparkles,
    Bot,
    XCircle,
    FlaskConical,
    Lightbulb,
    Type,
    Headphones,
    Download,
    Archive,
    FolderArchive,
    FileArchive,
    HardDriveDownload,
    UploadCloud,
} from 'lucide-react';

function IndonesiaFlag({ className = "w-4 h-3" }) {
    return (
        <span className={`inline-flex items-center justify-center overflow-hidden rounded-[2px] border border-zinc-300 dark:border-zinc-700 shrink-0 ${className}`}>
            <svg viewBox="0 0 600 400" className="w-full h-full block">
                <rect width="600" height="200" fill="#E11D48" />
                <rect y="200" width="600" height="200" fill="#FFFFFF" />
            </svg>
        </span>
    );
}

function EnglishFlag({ className = "w-4 h-3" }) {
    return (
        <span className={`inline-flex items-center justify-center overflow-hidden rounded-[2px] border border-zinc-300 dark:border-zinc-700 shrink-0 ${className}`}>
            <svg viewBox="0 0 60 30" className="w-full h-full block">
                <clipPath id="uk-clip-settings"><path d="M0,0 v30 h60 v-30 z"/></clipPath>
                <clipPath id="uk-diag-settings"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath>
                <g clipPath="url(#uk-clip-settings)">
                    <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
                    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
                    <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#uk-diag-settings)" stroke="#C8102E" strokeWidth="4"/>
                    <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
                    <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
                </g>
            </svg>
        </span>
    );
}

export default function Settings({ user, passkeys = [], projectStats = {}, systemInfo = {}, aiSettings = {}, backupSummary = {}, appFont: initialAppFont = 'plus-jakarta-sans' }) {
    const { theme, setTheme, language, setLanguage, appFont, setAppFont, t } = useApp();
    const s = t?.admin?.settings || {};
    const aiTrans = t?.aiSettings || {};
    const { showSuccess, showError, showWarning, showConfirm } = useAlert();
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [deletingPasskeyId, setDeletingPasskeyId] = useState(null);

    // Font State & Options (Curated options: Plus Jakarta Sans, Poppins, Outfit)
    const fontOptions = [
        {
            key: 'plus-jakarta-sans',
            name: 'Plus Jakarta Sans',
            badge: 'Default',
            category: 'Geometric Sans',
            description: 'Font bawaan resmi STAS-RG. Bersih, modern, dan sangat profesional untuk publikasi riset.',
            specimenClass: 'font-specimen-plus-jakarta-sans',
            isDefault: true,
        },
        {
            key: 'poppins',
            name: 'Poppins',
            category: 'Geometric Sans',
            description: 'Geometris, hangat, dan kontemporer dengan karakter ramah dan tegas.',
            specimenClass: 'font-specimen-poppins',
            isDefault: false,
        },
        {
            key: 'outfit',
            name: 'Outfit',
            category: 'Modern Sans',
            description: 'Elegan, futuristik, dan tech-forward dengan proporsi modern.',
            specimenClass: 'font-specimen-outfit',
            isDefault: false,
        },
    ];

    const [selectedFont, setSelectedFont] = useState(appFont || initialAppFont || 'plus-jakarta-sans');
    const [isSavingFont, setIsSavingFont] = useState(false);

    useEffect(() => {
        if (appFont) {
            setSelectedFont(appFont);
        }
    }, [appFont]);

    const handleSelectFontPreview = (fontKey) => {
        setSelectedFont(fontKey);
        setAppFont(fontKey);
    };

    const handleSaveFont = (e) => {
        if (e) e.preventDefault();
        setIsSavingFont(true);

        router.post('/settings/font', { app_font: selectedFont }, {
            preserveScroll: true,
            onSuccess: () => {
                const currentFontObj = fontOptions.find((f) => f.key === selectedFont);
                showSuccess(
                    s.fontSaveSuccessTitle || 'Font Berhasil Diperbarui',
                    (s.fontSaveSuccessMsg || 'Font default antarmuka sistem telah diubah ke {font}.').replace(
                        '{font}',
                        currentFontObj?.name || selectedFont
                    )
                );
                setIsSavingFont(false);
            },
            onError: (err) => {
                showError('Gagal Menyimpan Font', Object.values(err)[0] || 'Terjadi kesalahan.');
                setIsSavingFont(false);
            },
            onFinish: () => {
                setIsSavingFont(false);
            },
        });
    };

    const handleResetFontDefault = () => {
        setSelectedFont('plus-jakarta-sans');
        setAppFont('plus-jakarta-sans');
        setIsSavingFont(true);

        router.post('/settings/font', { app_font: 'plus-jakarta-sans' }, {
            preserveScroll: true,
            onSuccess: () => {
                showSuccess(
                    s.fontSaveSuccessTitle || 'Font Berhasil Diperbarui',
                    'Font default dikembalikan ke Plus Jakarta Sans.'
                );
                setIsSavingFont(false);
            },
            onError: (err) => {
                showError('Gagal Mengembalikan Font', Object.values(err)[0] || 'Terjadi kesalahan.');
                setIsSavingFont(false);
            },
            onFinish: () => {
                setIsSavingFont(false);
            },
        });
    };

    // Profile form state
    const [profileName, setProfileName] = useState(user?.name || '');
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isRemovingAvatar, setIsRemovingAvatar] = useState(false);
    const [isCompressingAvatar, setIsCompressingAvatar] = useState(false);
    const [avatarCompressionProgress, setAvatarCompressionProgress] = useState(null);
    const [avatarCompressionStats, setAvatarCompressionStats] = useState(null);
    const fileInputRef = useRef(null);

    // Password form state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    // Maintenance action states
    const [isTogglingMaintenance, setIsTogglingMaintenance] = useState(false);
    const [isClearingCache, setIsClearingCache] = useState(false);
    const [isOptimizing, setIsOptimizing] = useState(false);

    // AI Configuration state
    const [aiProvider, setAiProvider] = useState(aiSettings?.ai_provider || 'gemini');
    const [aiModel, setAiModel] = useState(aiSettings?.ai_model || 'gemini-3.6-flash');
    const [aiApiKey, setAiApiKey] = useState(aiSettings?.masked_api_key || '');
    const [aiCustomEndpoint, setAiCustomEndpoint] = useState(aiSettings?.custom_endpoint || '');
    const [showAiApiKey, setShowAiApiKey] = useState(false);
    const [isSavingAi, setIsSavingAi] = useState(false);
    const [isTestingAi, setIsTestingAi] = useState(false);
    const [aiTestResult, setAiTestResult] = useState(null);

    // Synchronize profileName when user prop updates
    useEffect(() => {
        if (user?.name) {
            setProfileName(user.name);
        }
    }, [user?.name]);

    // Handle saving AI Settings
    const handleSaveAiSettings = (e) => {
        e.preventDefault();
        setIsSavingAi(true);

        const payload = {
            ai_provider: aiProvider,
            ai_model: aiModel,
            custom_endpoint: aiCustomEndpoint,
        };

        // Only send api_key if it's not the masked placeholder
        if (aiApiKey && !aiApiKey.includes('••••')) {
            payload.api_key = aiApiKey;
        }

        router.post('/settings/ai', payload, {
            preserveScroll: true,
            onSuccess: () => {
                showSuccess(
                    aiTrans.saveSuccessTitle || 'Konfigurasi AI Disimpan',
                    aiTrans.saveSuccessMsg || 'Pengaturan model dan API Key AI berhasil disimpan dan dienkripsi.'
                );
                setIsSavingAi(false);
            },
            onError: (err) => {
                showError(
                    aiTrans.saveFailTitle || 'Gagal Menyimpan AI',
                    Object.values(err)[0] || 'Terjadi kesalahan saat menyimpan konfigurasi AI.'
                );
                setIsSavingAi(false);
            },
            onFinish: () => {
                setIsSavingAi(false);
            }
        });
    };

    // Handle Live AI Connection Test
    const handleTestAiConnection = async () => {
        setIsTestingAi(true);
        setAiTestResult(null);

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

        try {
            const res = await fetch('/settings/ai/test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    provider: aiProvider,
                    model: aiModel,
                    api_key: aiApiKey && !aiApiKey.includes('••••') ? aiApiKey : null,
                    custom_endpoint: aiCustomEndpoint || null,
                }),
            });

            const data = await res.json();
            setAiTestResult(data);

            if (data.success) {
                showSuccess(
                    aiTrans.testSuccessTitle || 'Koneksi AI Berhasil!',
                    `${aiTrans.testSuccessMsg || 'Terhubung dengan'} ${data.model} (${data.latency_ms} ms)`
                );
            } else {
                showError(
                    aiTrans.testFailTitle || 'Koneksi AI Gagal',
                    data.error || data.message || 'Tidak dapat terhubung ke server API AI.'
                );
            }
        } catch (err) {
            const fallbackResult = {
                success: false,
                error: err.message || 'Network error saat menghubungi server.',
                hint: 'Periksa koneksi internet Anda atau periksa kembali API Key.',
            };
            setAiTestResult(fallbackResult);
            showError(aiTrans.testFailTitle || 'Koneksi AI Gagal', fallbackResult.error);
        } finally {
            setIsTestingAi(false);
        }
    };

    // Handle avatar file selection with automatic compression
    const handleAvatarSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showError(
                s.alertFormatUnsupportedTitle || 'Format Tidak Didukung',
                s.alertFormatUnsupportedMsg || 'Harap pilih file gambar (JPG, PNG, GIF, WebP, atau SVG).'
            );
            return;
        }

        if (file.type === 'image/svg+xml') {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
            setAvatarCompressionStats(null);
            return;
        }

        try {
            setIsCompressingAvatar(true);
            setAvatarCompressionProgress({ stage: 'Mempersiapkan foto profil...', percent: 10 });

            const result = await compressImage(file, {
                maxSizeMB: 2,
                maxWidth: 1200,
                maxHeight: 1200,
                initialQuality: 0.90,
                onProgress: (p) => setAvatarCompressionProgress(p),
            });

            setAvatarFile(result.file);
            setAvatarPreview(result.previewUrl);
            setAvatarCompressionStats(result);

            if (result.wasCompressed) {
                showSuccess(
                    'Foto Profil Dikompresi',
                    `Ukuran foto diperkecil dari ${result.originalSizeStr} menjadi ${result.compressedSizeStr} (Hemat ${result.savedPercent}%).`
                );
            }
        } catch (err) {
            showError('Gagal Memproses Foto', err.message || 'Terjadi kesalahan saat mengompresi foto profil.');
        } finally {
            setIsCompressingAvatar(false);
            setAvatarCompressionProgress(null);
        }
    };

    // Cancel new selected avatar
    const handleCancelNewAvatar = () => {
        setAvatarFile(null);
        setAvatarPreview(null);
        setAvatarCompressionStats(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Delete current saved avatar
    const handleDeleteCurrentAvatar = async () => {
        const confirmed = await showConfirm({
            title: s.confirmDeleteAvatarTitle || 'Hapus Foto Profil?',
            message: s.confirmDeleteAvatarMsg || 'Apakah Anda yakin ingin menghapus foto profil akun Anda? Foto akan dihapus dan diganti dengan inisial nama.',
            confirmText: s.confirmDeleteAvatarBtn || 'Hapus Foto',
            cancelText: s.confirmDeleteAvatarCancel || 'Batal',
            variant: 'danger',
        });

        if (!confirmed) return;

        setIsRemovingAvatar(true);
        router.delete('/settings/avatar', {
            preserveScroll: true,
            onSuccess: () => {
                showSuccess(
                    s.alertAvatarDeletedTitle || 'Foto Dihapus',
                    s.alertAvatarDeletedMsg || 'Foto profil Anda berhasil dihapus.'
                );
                setAvatarFile(null);
                setAvatarPreview(null);
                setIsRemovingAvatar(false);
            },
            onError: (err) => {
                showError(
                    s.alertDeleteAvatarFailTitle || 'Gagal Menghapus',
                    Object.values(err)[0] || s.alertDeleteAvatarFailMsg || 'Terjadi kesalahan saat menghapus foto profil.'
                );
                setIsRemovingAvatar(false);
            },
            onFinish: () => {
                setIsRemovingAvatar(false);
            }
        });
    };

    // Save profile updates
    const handleSaveProfile = (e) => {
        e.preventDefault();
        if (!profileName.trim()) {
            showWarning(
                s.alertNameRequiredTitle || 'Nama Wajib Diisi',
                s.alertNameRequiredMsg || 'Silakan masukkan nama lengkap akun Anda.'
            );
            return;
        }

        setIsSavingProfile(true);
        const payload = {
            name: profileName.trim(),
        };
        if (avatarFile) {
            payload.avatar = avatarFile;
        }

        router.post('/settings/profile', payload, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                showSuccess(
                    s.alertProfileSavedTitle || 'Profil Disimpan',
                    s.alertProfileSavedMsg || 'Nama dan foto profil Anda berhasil diperbarui.'
                );
                setAvatarFile(null);
                setAvatarPreview(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
                setIsSavingProfile(false);
            },
            onError: (errors) => {
                showError(
                    s.alertSaveProfileFailTitle || 'Gagal Menyimpan',
                    Object.values(errors)[0] || s.alertSaveProfileFailMsg || 'Terjadi kesalahan saat menyimpan profil.'
                );
                setIsSavingProfile(false);
            },
            onFinish: () => {
                setIsSavingProfile(false);
            }
        });
    };

    // Update password handler
    const handleUpdatePassword = (e) => {
        e.preventDefault();
        if (!currentPassword || !newPassword || !confirmPassword) {
            showWarning(
                s.alertPasswordEmptyTitle || 'Formulir Belum Lengkap',
                s.alertPasswordEmptyMsg || 'Harap lengkapi semua isian kata sandi.'
            );
            return;
        }

        if (newPassword.length < 8) {
            showWarning(
                s.alertPasswordMinTitle || 'Kata Sandi Terlalu Pendek',
                s.alertPasswordMinMsg || 'Kata sandi baru minimal harus 8 karakter.'
            );
            return;
        }

        if (newPassword !== confirmPassword) {
            showWarning(
                s.alertPasswordMismatchTitle || 'Konfirmasi Tidak Cocok',
                s.alertPasswordMismatchMsg || 'Kata sandi baru dan konfirmasi kata sandi tidak cocok.'
            );
            return;
        }

        setIsUpdatingPassword(true);
        router.post('/settings/password', {
            current_password: currentPassword,
            password: newPassword,
            password_confirmation: confirmPassword,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                showSuccess(
                    s.alertPasswordUpdatedTitle || 'Kata Sandi Diperbarui',
                    s.alertPasswordUpdatedMsg || 'Kata sandi akun Anda berhasil diperbarui.'
                );
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setIsUpdatingPassword(false);
            },
            onError: (errors) => {
                showError(
                    s.alertPasswordFailTitle || 'Gagal Memperbarui Kata Sandi',
                    Object.values(errors)[0] || 'Terjadi kesalahan saat memperbarui kata sandi.'
                );
                setIsUpdatingPassword(false);
            },
            onFinish: () => {
                setIsUpdatingPassword(false);
            }
        });
    };

    // Passkey enrollment handler
    const handleEnrollPasskey = async () => {
        if (!window.PublicKeyCredential || !navigator.credentials) {
            showWarning(
                s.alertDeviceUnsupportedTitle || 'Perangkat Tidak Mendukung',
                s.alertDeviceUnsupportedMsg || (language === 'id'
                    ? 'Browser atau perangkat Anda tidak mendukung WebAuthn / Passkey biometrik.'
                    : 'Your browser or device does not support WebAuthn / biometric Passkey.')
            );
            return;
        }

        setIsEnrolling(true);
        try {
            const optionsRes = await fetch('/auth/passkey/register-options', {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!optionsRes.ok) throw new Error(s.alertPasskeyOptionsFail || 'Gagal memuat opsi pendaftaran Passkey.');
            const options = await optionsRes.json();

            const rawChallenge = atob(options.challenge.replace(/-/g, '+').replace(/_/g, '/'));
            const challengeBytes = new Uint8Array(rawChallenge.length);
            for (let i = 0; i < rawChallenge.length; i++) challengeBytes[i] = rawChallenge.charCodeAt(i);

            const rawUserId = atob(options.user.id.replace(/-/g, '+').replace(/_/g, '/'));
            const userIdBytes = new Uint8Array(rawUserId.length);
            for (let i = 0; i < rawUserId.length; i++) userIdBytes[i] = rawUserId.charCodeAt(i);

            const credential = await navigator.credentials.create({
                publicKey: {
                    ...options,
                    challenge: challengeBytes,
                    user: {
                        ...options.user,
                        id: userIdBytes,
                    },
                },
            });

            if (!credential) throw new Error(s.alertPasskeyNoResponse || 'Tidak ada respon biometrik dari perangkat.');

            const rawIdBytes = new Uint8Array(credential.rawId);
            let binary = '';
            for (let i = 0; i < rawIdBytes.byteLength; i++) binary += String.fromCharCode(rawIdBytes[i]);
            const rawId = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            const saveRes = await fetch('/auth/passkey/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    credential_id: rawId,
                    device_name: `${navigator.platform || 'Device'} ${s.passkeyTitle || 'Passkey / Biometric'}`,
                }),
            });

            if (saveRes.ok) {
                showSuccess(
                    s.alertPasskeyRegisteredTitle || 'Passkey Berhasil Didaftarkan',
                    s.alertPasskeyRegisteredMsg || 'Perangkat Anda telah terdaftar. Anda kini dapat login ke STAS RG Projects secara instan menggunakan Touch ID, Face ID, atau Windows Hello.'
                );
                router.reload({ only: ['passkeys', 'user'] });
            } else {
                const errData = await saveRes.json();
                throw new Error(errData.message || (s.alertSaveProfileFailMsg || 'Gagal menyimpan kredensial ke server.'));
            }
        } catch (err) {
            if (err.name !== 'NotAllowedError') {
                showError(
                    s.alertPasskeyRegisterFailTitle || 'Pendaftaran Passkey Gagal',
                    err.message || s.alertPasskeyRegisterFailMsg || 'Terjadi kesalahan saat berkomunikasi dengan autentikator biometrik.'
                );
            }
        } finally {
            setIsEnrolling(false);
        }
    };

    // Delete passkey handler
    const handleDeletePasskey = async (passkey) => {
        const deviceLabel = passkey.device_name || s.devicePasskeyFallback || 'Perangkat';
        const confirmMessage = (s.confirmDeletePasskeyMsg || 'Apakah Anda yakin ingin menghapus Passkey untuk "{device}"? Anda tidak akan dapat login biometrik menggunakan kunci ini lagi.').replace('{device}', deviceLabel);

        const confirmed = await showConfirm({
            title: s.confirmDeletePasskeyTitle || 'Hapus Kredensial Passkey?',
            message: confirmMessage,
            confirmText: s.confirmDeletePasskeyBtn || 'Hapus Passkey',
            cancelText: s.confirmDeletePasskeyCancel || 'Batal',
            variant: 'danger',
        });

        if (!confirmed) return;

        setDeletingPasskeyId(passkey.id);
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
        try {
            const res = await fetch(`/auth/passkey/${passkey.id}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            if (res.ok) {
                showSuccess(
                    s.alertPasskeyDeletedTitle || 'Passkey Dihapus',
                    s.alertPasskeyDeletedMsg || 'Kredensial biometrik berhasil dihapus dari akun Anda.'
                );
                router.reload({ only: ['passkeys', 'user'] });
            } else {
                throw new Error(s.alertPasskeyDeleteFailMsg || 'Gagal menghapus kredensial.');
            }
        } catch (err) {
            showError(
                s.alertPasskeyDeleteFailTitle || 'Gagal Menghapus',
                err.message || s.alertPasskeyDeleteFailMsg || 'Terjadi kesalahan saat menghapus passkey.'
            );
        } finally {
            setDeletingPasskeyId(null);
        }
    };

    // Toggle maintenance mode handler
    const handleToggleMaintenance = async () => {
        const isDown = Boolean(systemInfo?.is_maintenance_mode);
        const title = isDown
            ? (s.confirmDisableMaintenanceTitle || 'Kembalikan Sistem Online?')
            : (s.confirmEnableMaintenanceTitle || 'Aktifkan Mode Pemeliharaan?');
        const message = isDown
            ? (s.confirmDisableMaintenanceMsg || 'Apakah Anda yakin ingin mematikan mode pemeliharaan dan membuka kembali akses publik ke seluruh fitur?')
            : (s.confirmEnableMaintenanceMsg || 'Pengunjung publik tidak akan dapat membuka landing page dan showcase selama mode pemeliharaan aktif. Anda tetap dapat mengakses panel ini.');

        const confirmed = await showConfirm({
            title,
            message,
            confirmText: isDown ? (s.btnDisableMaintenance || 'Kembalikan Online') : (s.btnEnableMaintenance || 'Aktifkan Maintenance'),
            cancelText: s.confirmMaintenanceCancel || 'Batal',
            variant: isDown ? 'primary' : 'danger',
        });

        if (!confirmed) return;

        setIsTogglingMaintenance(true);
        router.post('/settings/maintenance/toggle', {}, {
            preserveScroll: true,
            onSuccess: () => {
                showSuccess(
                    s.alertMaintenanceToggledTitle || 'Status Sistem Diperbarui',
                    isDown
                        ? 'Mode pemeliharaan dinonaktifkan. Sistem kini kembali online.'
                        : 'Mode pemeliharaan sistem berhasil diaktifkan.'
                );
                setIsTogglingMaintenance(false);
            },
            onError: (err) => {
                showError('Gagal Mengubah Status', Object.values(err)[0] || 'Terjadi kesalahan.');
                setIsTogglingMaintenance(false);
            },
            onFinish: () => {
                setIsTogglingMaintenance(false);
            }
        });
    };

    // Clear system cache handler
    const handleClearCache = () => {
        setIsClearingCache(true);
        router.post('/settings/maintenance/clear-cache', {}, {
            preserveScroll: true,
            onSuccess: () => {
                showSuccess(
                    s.alertCacheClearedTitle || 'Cache Dibersihkan',
                    s.alertCacheClearedMsg || 'Cache aplikasi, template views, dan rute berhasil dibersihkan.'
                );
                setIsClearingCache(false);
            },
            onError: (err) => {
                showError('Gagal Membersihkan Cache', Object.values(err)[0] || 'Terjadi kesalahan saat membersihkan cache.');
                setIsClearingCache(false);
            },
            onFinish: () => {
                setIsClearingCache(false);
            }
        });
    };

    // Optimize system handler
    const handleOptimize = () => {
        setIsOptimizing(true);
        router.post('/settings/maintenance/optimize', {}, {
            preserveScroll: true,
            onSuccess: () => {
                showSuccess(
                    s.alertOptimizeTitle || 'Optimasi Berhasil',
                    s.alertOptimizeMsg || 'Konfigurasi dan rute sistem berhasil di-cache.'
                );
                setIsOptimizing(false);
            },
            onError: (err) => {
                showError('Gagal Mengoptimasi', Object.values(err)[0] || 'Terjadi kesalahan saat mengoptimasi sistem.');
                setIsOptimizing(false);
            },
            onFinish: () => {
                setIsOptimizing(false);
            }
        });
    };

    // Backup & Restore state
    const [restoreFile, setRestoreFile] = useState(null);
    const [isRestoring, setIsRestoring] = useState(false);
    const [showRestoreModal, setShowRestoreModal] = useState(false);
    const [downloadingBackupType, setDownloadingBackupType] = useState(null);
    const restoreFileInputRef = useRef(null);

    const formatBackupDate = (isoStr) => {
        if (!isoStr) return language === 'en' ? 'Never' : 'Belum pernah';
        try {
            const d = new Date(isoStr);
            return d.toLocaleString(language === 'en' ? 'en-US' : 'id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return isoStr;
        }
    };

    const handleDownloadBackup = (type) => {
        setDownloadingBackupType(type);
        showSuccess(
            language === 'en' ? 'Preparing Download' : 'Menyiapkan Unduhan',
            language === 'en' ? 'Snapshot file is being generated and downloaded...' : 'File snapshot sedang dibuat dan akan segera terunduh...'
        );
        window.location.href = `/settings/backup/${type}`;
        setTimeout(() => {
            setDownloadingBackupType(null);
        }, 3500);
    };

    const handleSelectRestoreFile = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const ext = file.name.split('.').pop()?.toLowerCase();
        if (!['sql', 'zip'].includes(ext)) {
            showError(
                language === 'en' ? 'Invalid File Format' : 'Format File Tidak Didukung',
                language === 'en' ? 'Please select a .sql or .zip snapshot file.' : 'Harap pilih file snapshot berformat .sql atau .zip.'
            );
            return;
        }

        if (file.size > 200 * 1024 * 1024) {
            showError(
                language === 'en' ? 'File Too Large' : 'Ukuran File Terlalu Besar',
                language === 'en' ? 'Maximum allowed backup file size is 200 MB.' : 'Ukuran file snapshot maksimal adalah 200 MB.'
            );
            return;
        }

        setRestoreFile(file);
    };

    const handlePerformRestore = () => {
        if (!restoreFile) {
            showWarning(
                language === 'en' ? 'No File Selected' : 'File Belum Dipilih',
                language === 'en' ? 'Please choose a snapshot file (.sql or .zip) to restore.' : 'Pilih file snapshot (.sql atau .zip) yang ingin dipulihkan.'
            );
            return;
        }

        showConfirm(
            language === 'en' ? 'Confirm System Restore' : 'Konfirmasi Pemulihan Sistem (Restore)',
            language === 'en' 
                ? `Are you sure you want to restore "${restoreFile.name}"? This action will overwrite existing database records and replace matching media assets!`
                : `Apakah Anda yakin ingin memulihkan sistem dari file "${restoreFile.name}"? Tindakan ini akan menimpa data database dan menggantikan aset media yang sesuai!`,
            () => {
                setIsRestoring(true);
                const formData = new FormData();
                formData.append('backup_file', restoreFile);

                router.post('/settings/restore', formData, {
                    forceFormData: true,
                    preserveScroll: true,
                    onSuccess: () => {
                        showSuccess(
                            language === 'en' ? 'Restore Completed' : 'Restorasi Berhasil',
                            language === 'en' ? 'The system snapshot was restored successfully.' : 'Snapshot sistem berhasil dipulihkan dengan lancar.'
                        );
                        setRestoreFile(null);
                        setShowRestoreModal(false);
                        if (restoreFileInputRef.current) restoreFileInputRef.current.value = '';
                        setIsRestoring(false);
                    },
                    onError: (err) => {
                        showError(
                            language === 'en' ? 'Restore Failed' : 'Gagal Memulihkan Snapshot',
                            Object.values(err)[0] || (language === 'en' ? 'An error occurred during restore.' : 'Terjadi kesalahan saat memproses restorasi.')
                        );
                        setIsRestoring(false);
                    },
                    onFinish: () => {
                        setIsRestoring(false);
                    }
                });
            },
            {
                confirmText: language === 'en' ? 'Yes, Restore System' : 'Ya, Pulihkan Sistem',
                cancelText: language === 'en' ? 'Cancel' : 'Batal',
                type: 'danger'
            }
        );
    };

    const isMaintenanceActive = Boolean(systemInfo?.is_maintenance_mode);

    return (
        <AdminLayout title={s.pageTitle || 'Pengaturan & Keamanan'} currentPath="/settings">
            <div className="space-y-6 max-w-5xl mx-auto">
                
                {/* Page Title Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-2 rounded-xl bg-[#0AB600]/10 border border-[#0AB600]/30 text-[#0AB600]">
                                <SettingsIcon className="w-5 h-5" />
                            </div>
                            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                                {s.headerTitle || 'Pengaturan & Keamanan'}
                            </h1>
                        </div>
                        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                            {s.headerSubtitle || 'Kelola pintasan pembuatan proyek visual, konfigurasi Passkey biometrik, kata sandi, dan pemeliharaan sistem.'}
                        </p>
                    </div>
                </div>

                {/* Section 1: Input Proyek Baru (Action Card) */}
                <div className="bg-white dark:bg-[#121824] rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 sm:p-6 shadow-xs relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                        <div className="space-y-2 max-w-2xl">
                            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                                {s.projectSectionTitle || 'Pembuatan & Input Proyek Baru'}
                            </h2>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                {s.projectSectionDesc || 'Buat visual lembar informasi riset resmi: input detail produk, spesifikasi, problem–solution, serta otomatis buat QR Code, cetak/simpan PDF, dan unduh gambar PNG resolusi tinggi.'}
                            </p>
                            
                            {/* Stats badges */}
                            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/60 font-medium">
                                    <Layers className="w-3.5 h-3.5 text-zinc-400" />
                                    {s.statTotal || 'Total'}: <strong className="text-slate-900 dark:text-white">{projectStats.total || 0}</strong>
                                </span>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0AB600]/10 text-[#0AB600] font-medium border border-[#0AB600]/30">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0AB600]" />
                                    {s.statPublished || 'Published'}: <strong>{projectStats.published || 0}</strong>
                                </span>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/60 font-medium">
                                    <FileText className="w-3.5 h-3.5 text-zinc-400" />
                                    {s.statDraft || 'Draft'}: <strong className="text-slate-900 dark:text-white">{projectStats.draft || 0}</strong>
                                </span>
                            </div>
                        </div>

                        <div className="shrink-0 pt-2 sm:pt-0">
                            <Link
                                href="/projects/create"
                                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0AB600] hover:bg-[#089600] text-white text-xs sm:text-sm font-semibold shadow-sm transition-all duration-150 cursor-pointer group"
                            >
                                <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
                                <span>{s.btnNewProject || 'Input Proyek Baru'}</span>
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Main Two-Column Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Column Left (7 cols): Passkey & System Maintenance */}
                    <div className="lg:col-span-7 space-y-6">
                        
                        {/* Section: Autentikasi Passkey & Biometrik */}
                        <div className="bg-white dark:bg-[#121824] p-5 sm:p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs">
                            <div className="flex items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-[#0AB600]/10 border border-[#0AB600]/30 text-[#0AB600]">
                                        <Fingerprint className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                            {s.passkeyTitle || 'Autentikasi Passkey & Biometrik'}
                                        </h3>
                                        <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">
                                            {s.passkeyDesc || 'Masuk cepat tanpa kata sandi menggunakan Touch ID, Face ID, atau Windows Hello.'}
                                        </p>
                                    </div>
                                </div>

                                <span
                                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${
                                        user.is_biometric_enabled || passkeys.length > 0
                                            ? 'bg-[#0AB600]/10 text-[#0AB600] border-[#0AB600]/30'
                                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                                    }`}
                                >
                                    {user.is_biometric_enabled || passkeys.length > 0 ? (s.statusActive || 'Aktif') : (s.statusInactive || 'Nonaktif')}
                                </span>
                            </div>

                            {/* Passkey List */}
                            <div className="mt-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                                        {(s.registeredCredentials || 'Kredensial Terdaftar ({count})').replace('{count}', passkeys.length)}
                                    </h4>
                                </div>

                                {passkeys.length === 0 ? (
                                    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-dashed border-zinc-200 dark:border-zinc-800 text-center">
                                        <KeyRound className="w-5 h-5 text-zinc-400 mx-auto mb-1.5" />
                                        <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                                            {s.emptyPasskeysTitle || 'Belum ada Passkey yang terdaftar'}
                                        </p>
                                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                                            {s.emptyPasskeysDesc || 'Daftarkan sensor biometrik perangkat ini untuk proses login instan.'}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {passkeys.map((pk) => (
                                            <div
                                                key={pk.id}
                                                className="flex items-center justify-between p-3 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800/70"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <div className="p-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[#0AB600]">
                                                        <Laptop className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                                                            {pk.device_name || s.devicePasskeyFallback || 'Device Passkey'}
                                                        </p>
                                                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 mt-0.5">
                                                            <span>
                                                                {(s.addedDate || 'Ditambahkan: {date}').replace(
                                                                    '{date}',
                                                                    new Date(pk.created_at).toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID', {
                                                                        day: 'numeric',
                                                                        month: 'short',
                                                                        year: 'numeric',
                                                                    })
                                                                )}
                                                            </span>
                                                            <span>•</span>
                                                            <span>
                                                                {(s.usedCount || 'Digunakan: {count} kali').replace('{count}', pk.counter || 0)}
                                                            </span>
                                                        </p>
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => handleDeletePasskey(pk)}
                                                    disabled={deletingPasskeyId === pk.id}
                                                    title={s.tooltipDeletePasskey || 'Hapus Kredensial'}
                                                    className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Enroll Button Action */}
                                <div className="pt-2">
                                    <button
                                        type="button"
                                        onClick={handleEnrollPasskey}
                                        disabled={isEnrolling}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#0AB600]/10 hover:bg-[#0AB600]/15/80 dark:bg-[#0AB600]/10 dark:hover:bg-[#0AB600]/15 text-[#0AB600] border border-[#0AB600]/30 text-xs font-bold transition-all cursor-pointer"
                                    >
                                        <Fingerprint className="w-4 h-4" />
                                        <span>
                                            {isEnrolling ? (s.enrollingPasskey || 'Menghubungkan Sensor Biometrik...') : (s.btnEnrollPasskey || '+ Daftarkan Passkey Perangkat Ini')}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Section: Integrasi AI & Konfigurasi API Key (AI Assistant Engine) */}
                        <div className="bg-white dark:bg-[#121824] p-5 sm:p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-5">
                            
                            {/* Card Header */}
                            <div className="flex items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-gradient-to-br from-[#0AB600] to-[#089600] text-white shadow-xs">
                                        <Sparkles className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <span>{aiTrans.cardTitle || 'Integrasi Kecerdasan Buatan'}</span>
                                        </h3>
                                        <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">
                                            {aiTrans.cardDesc || 'Konfigurasikan API Key AI untuk mengaktifkan fitur Magic Assist: generate konten formulir otomatis, problem-solution, manfaat, dan spesifikasi riset.'}
                                        </p>
                                    </div>
                                </div>

                                <span
                                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 flex items-center gap-1.5 ${
                                        aiSettings?.has_api_key
                                            ? 'bg-[#0AB600]/10 text-[#0AB600] border-[#0AB600]/30'
                                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                                    }`}
                                >
                                    <span className={`w-1.5 h-1.5 rounded-full ${aiSettings?.has_api_key ? 'bg-[#0AB600]' : 'bg-amber-500'}`}></span>
                                    {aiSettings?.has_api_key ? (aiTrans.statusConfigured || 'API Key Terpasang') : (aiTrans.statusNotConfigured || 'Belum Dikonfigurasi')}
                                </span>
                            </div>

                            <form onSubmit={handleSaveAiSettings} className="space-y-4">
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* AI Provider */}
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                                            {aiTrans.labelProvider || 'Provider AI'}
                                        </label>
                                        <select
                                            value={aiProvider}
                                            onChange={(e) => {
                                                const prov = e.target.value;
                                                setAiProvider(prov);
                                                if (prov === 'gemini') setAiModel('gemini-3.6-flash');
                                                else if (prov === 'openai') setAiModel('gpt-4o-mini');
                                            }}
                                            className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/80 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#0AB600]"
                                        >
                                            <option value="gemini">Google Gemini AI (Direkomendasikan)</option>
                                            <option value="openai">OpenAI (ChatGPT / Custom Endpoint)</option>
                                        </select>
                                    </div>

                                    {/* AI Model */}
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                                            {aiTrans.labelModel || 'Model AI'}
                                        </label>
                                        <select
                                            value={aiModel}
                                            onChange={(e) => setAiModel(e.target.value)}
                                            className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/80 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-[#0AB600]"
                                        >
                                            {aiProvider === 'gemini' ? (
                                                <>
                                                    <option value="gemini-3.6-flash">Gemini 3.6 Flash (Direkomendasikan, Cepat & Cerdas)</option>
                                                    <option value="gemini-3.6-pro">Gemini 3.6 Pro (Penalaran Kompleks & Riset Mendalam)</option>
                                                    <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                                                    <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                                                    <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                                                </>
                                            ) : (
                                                <>
                                                    <option value="gpt-4o-mini">GPT-4o Mini</option>
                                                    <option value="gpt-4o">GPT-4o</option>
                                                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                                                </>
                                            )}
                                        </select>
                                    </div>
                                </div>

                                {/* API Key Input */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                                            <KeyRound className="w-3.5 h-3.5 text-[#0AB600]" />
                                            <span>{aiTrans.labelApiKey || 'API Key AI'}</span>
                                        </label>
                                        {aiProvider === 'gemini' && (
                                            <a
                                                href="https://aistudio.google.com/app/apikey"
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-[10px] text-[#0AB600] hover:underline flex items-center gap-1 font-semibold"
                                            >
                                                <span>Dapatkan API Key Gemini Gratis</span>
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <input
                                            type={showAiApiKey ? "text" : "password"}
                                            value={aiApiKey}
                                            onChange={(e) => setAiApiKey(e.target.value)}
                                            placeholder={aiSettings?.has_api_key ? "API Key tersimpan (masukkan baru untuk mengganti)" : "Masukkan Google Gemini API Key (AIzaSy...)"}
                                            className="w-full px-3 py-2 pr-10 text-xs font-mono bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/80 rounded-xl text-slate-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#0AB600] transition-colors"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowAiApiKey(!showAiApiKey)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                                        >
                                            {showAiApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                                        {aiTrans.apiKeySecurityNotice || 'API Key disimpan dengan enkripsi AES-256 di database server dan tidak akan pernah dibocorkan ke publik.'}
                                    </p>
                                </div>

                                {/* Custom Endpoint (Only if OpenAI) */}
                                {aiProvider === 'openai' && (
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                                            Custom Base URL Endpoint (Opsional)
                                        </label>
                                        <input
                                            type="url"
                                            value={aiCustomEndpoint}
                                            onChange={(e) => setAiCustomEndpoint(e.target.value)}
                                            placeholder="https://api.openai.com/v1"
                                            className="w-full px-3 py-2 text-xs font-mono bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/80 rounded-xl text-slate-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#0AB600]"
                                        />
                                    </div>
                                )}

                                {/* Action Buttons: Test Connection & Save */}
                                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                                    {/* Test Connection Button */}
                                    <button
                                        type="button"
                                        onClick={handleTestAiConnection}
                                        disabled={isTestingAi || isSavingAi || (!aiSettings?.has_api_key && !aiApiKey)}
                                        className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                                    >
                                        {isTestingAi ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin text-[#0AB600]" />
                                                <span>{aiTrans.testingConnection || 'Menguji Koneksi API...'}</span>
                                            </>
                                        ) : (
                                            <>
                                                <FlaskConical className="w-4 h-4 text-[#0AB600]" />
                                                <span>{aiTrans.btnTestConnection || 'Tes Koneksi API'}</span>
                                            </>
                                        )}
                                    </button>

                                    {/* Save Button */}
                                    <button
                                        type="submit"
                                        disabled={isSavingAi || isTestingAi}
                                        className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0AB600] hover:bg-[#089600] text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                                    >
                                        {isSavingAi ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>{aiTrans.savingSettings || 'Menyimpan...'}</span>
                                            </>
                                        ) : (
                                            <>
                                                <Check className="w-4 h-4" />
                                                <span>{aiTrans.btnSaveSettings || 'Simpan Konfigurasi AI'}</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>

                            {/* Live Test Diagnostic Result Banner */}
                            {aiTestResult && (
                                <div className={`p-4 rounded-xl border text-xs transition-all animate-in fade-in duration-200 ${
                                    aiTestResult.success
                                        ? 'bg-[#0AB600]/10 border-[#0AB600]/30 text-slate-900 dark:text-[#0AB600]'
                                        : 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800/80 text-rose-950 dark:text-rose-200'
                                }`}>
                                    <div className="flex items-start gap-3">
                                        {aiTestResult.success ? (
                                            <CheckCircle2 className="w-5 h-5 text-[#0AB600] shrink-0 mt-0.5" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                                        )}
                                        <div className="space-y-1 flex-1">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <p className="font-bold text-xs">
                                                    {aiTestResult.success ? 'Koneksi AI Terverifikasi & Aktif' : 'Koneksi AI Gagal'}
                                                </p>
                                                {aiTestResult.latency_ms && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/80 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                                                        <Activity className="w-3 h-3 text-[#0AB600]" />
                                                        <span>{aiTestResult.latency_ms} ms</span>
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-[11px] leading-relaxed opacity-90">
                                                {aiTestResult.success
                                                    ? `API Key valid. Model ${aiTestResult.model || aiModel} (${aiTestResult.provider || aiProvider}) siap digunakan untuk pembuatan project otomatis.`
                                                    : (aiTestResult.error || aiTestResult.message || 'Tidak dapat terhubung ke server AI.')}
                                            </p>

                                            {aiTestResult.hint && (
                                                <div className="flex items-start gap-1.5 text-[11px] text-amber-800 dark:text-amber-300 pt-1">
                                                    <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                                    <span><strong className="font-semibold">Solusi:</strong> {aiTestResult.hint}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Section: Pemeliharaan & Kontrol Status Sistem (Maintenance & Diagnostics) */}
                        <div className="bg-white dark:bg-[#121824] p-5 sm:p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-5">
                            
                            {/* Card Header */}
                            <div className="flex items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/80 text-amber-700 dark:text-amber-400">
                                        <Wrench className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                            {s.maintenanceSectionTitle || 'Pemeliharaan & Status Sistem'}
                                        </h3>
                                        <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">
                                            {s.maintenanceSectionDesc || 'Kelola mode pemeliharaan, bersihkan cache aplikasi, dan tinjau status infrastruktur server.'}
                                        </p>
                                    </div>
                                </div>

                                <span
                                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 flex items-center gap-1.5 ${
                                        isMaintenanceActive
                                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                                            : 'bg-[#0AB600]/10 text-[#0AB600] border-[#0AB600]/30'
                                    }`}
                                >
                                    <span className={`w-1.5 h-1.5 rounded-full ${isMaintenanceActive ? 'bg-amber-500 animate-pulse' : 'bg-[#0AB600]'}`}></span>
                                    {isMaintenanceActive ? (s.statusMaintenance || 'Mode Maintenance') : (s.statusOnline || 'Online')}
                                </span>
                            </div>

                            {/* Maintenance Mode Status Banner & Toggle */}
                            <div className={`p-4 rounded-2xl border transition-all ${
                                isMaintenanceActive
                                    ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60'
                                    : 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200/80 dark:border-zinc-800/80'
                            }`}>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                                            isMaintenanceActive
                                                ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                                                : 'bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                                        }`}>
                                            <Power className="w-4 h-4" />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                                                {isMaintenanceActive ? (s.statusMaintenance || 'Mode Pemeliharaan Aktif') : (s.statusOnline || 'Status Sistem Normal (Online)')}
                                            </h4>
                                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                                {isMaintenanceActive ? (s.maintenanceDescActive || 'Aplikasi sedang dalam perbaikan. Akses publik ditutup (503), namun administrator tetap dapat mengelola sistem.') : (s.maintenanceDescLive || 'Sistem saat ini dapat diakses secara publik oleh seluruh pengunjung dan pengguna.')}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="shrink-0 sm:self-center">
                                        <button
                                            type="button"
                                            onClick={handleToggleMaintenance}
                                            disabled={isTogglingMaintenance}
                                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs disabled:opacity-50 ${
                                                isMaintenanceActive
                                                    ? 'bg-[#0AB600] hover:bg-[#089600] text-white'
                                                    : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700'
                                            }`}
                                        >
                                            {isTogglingMaintenance ? (
                                                <>
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    <span>{language === 'en' ? 'Processing...' : 'Memproses...'}</span>
                                                </>
                                            ) : isMaintenanceActive ? (
                                                <>
                                                    <Zap className="w-3.5 h-3.5" />
                                                    <span>{s.btnDisableMaintenance || 'Kembalikan Online'}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Wrench className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                                    <span>{s.btnEnableMaintenance || 'Aktifkan Mode Maintenance'}</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Maintenance Action Tools */}
                            <div className="space-y-2">
                                <h4 className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                                    {s.quickToolsTitle || 'Alat Pemeliharaan Cepat'}
                                </h4>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    
                                    {/* Clear Cache Card */}
                                    <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col justify-between gap-3">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
                                                <RefreshCw className="w-3.5 h-3.5 text-[#0AB600]" />
                                                <span>{s.btnClearCache || 'Bersihkan Cache & Views'}</span>
                                            </div>
                                            <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                                                {s.btnClearCacheDesc || 'Hapus file cache aplikasi, kompilasi view Blade, dan cache konfigurasi.'}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleClearCache}
                                            disabled={isClearingCache}
                                            className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer disabled:opacity-50"
                                        >
                                            {isClearingCache ? (
                                                <>
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    <span>{s.clearingCache || 'Membersihkan...'}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />
                                                    <span>{s.btnClearCache || 'Bersihkan Cache'}</span>
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {/* Optimize System Card */}
                                    <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col justify-between gap-3">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
                                                <Zap className="w-3.5 h-3.5 text-amber-500" />
                                                <span>{s.btnOptimize || 'Optimasi Sistem'}</span>
                                            </div>
                                            <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                                                {s.btnOptimizeDesc || 'Cache konfigurasi dan routing untuk performa respons yang lebih cepat.'}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleOptimize}
                                            disabled={isOptimizing}
                                            className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer disabled:opacity-50"
                                        >
                                            {isOptimizing ? (
                                                <>
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    <span>{s.optimizingSystem || 'Mengoptimasi...'}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Zap className="w-3.5 h-3.5 text-zinc-400" />
                                                    <span>{s.btnOptimize || 'Jalankan Optimasi'}</span>
                                                </>
                                            )}
                                        </button>
                                    </div>

                                </div>
                            </div>

                            {/* Server & System Diagnostics Details */}
                            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2">
                                <h4 className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <Server className="w-3.5 h-3.5" />
                                    <span>{s.diagnosticsTitle || 'Status & Spesifikasi Server'}</span>
                                </h4>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                    
                                    <div className="p-2.5 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60">
                                        <p className="text-[10px] text-zinc-400">{s.labelPhpVersion || 'PHP'}</p>
                                        <p className="font-semibold text-slate-900 dark:text-white font-mono mt-0.5">
                                            v{systemInfo?.php_version || '8.3'}
                                        </p>
                                    </div>

                                    <div className="p-2.5 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60">
                                        <p className="text-[10px] text-zinc-400">{s.labelLaravelVersion || 'Laravel'}</p>
                                        <p className="font-semibold text-slate-900 dark:text-white font-mono mt-0.5">
                                            v{systemInfo?.laravel_version || '13.x'}
                                        </p>
                                    </div>

                                    <div className="p-2.5 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60">
                                        <p className="text-[10px] text-zinc-400">{s.labelDatabase || 'Database'}</p>
                                        <p className="font-semibold text-slate-900 dark:text-white uppercase font-mono mt-0.5">
                                            {systemInfo?.database_driver || 'MySQL'}
                                        </p>
                                    </div>

                                    <div className="p-2.5 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60">
                                        <p className="text-[10px] text-zinc-400">{s.labelStorageUsage || 'Penyimpanan'}</p>
                                        <p className="font-semibold text-[#0AB600] font-mono mt-0.5">
                                            {systemInfo?.storage_size || '0 MB'}
                                        </p>
                                    </div>

                                </div>
                            </div>

                        </div>

                        {/* Section: Pusat Cadangan & Snapshot Sistem (Backup & Restore) */}
                        <div className="bg-white dark:bg-[#121824] p-5 sm:p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-5">
                            
                            {/* Card Header */}
                            <div className="flex items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-[#0AB600]/10 border border-[#0AB600]/30 text-[#0AB600]">
                                        <HardDriveDownload className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <span>{language === 'en' ? 'System Backup & Snapshot Center' : 'Pusat Cadangan & Snapshot Sistem'}</span>
                                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-[#0AB600] border border-emerald-500/20">
                                                {language === 'en' ? 'Automated' : 'Otomatis'}
                                            </span>
                                        </h3>
                                        <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">
                                            {language === 'en'
                                                ? 'Download database snapshots, media assets archive, or restore system state safely.'
                                                : 'Unduh snapshot database, arsip berkas media, atau pulihkan data sistem secara instan dan aman.'}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setShowRestoreModal(true)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
                                >
                                    <UploadCloud className="w-3.5 h-3.5" />
                                    <span>{language === 'en' ? 'Restore Snapshot' : 'Pulihkan Data'}</span>
                                </button>
                            </div>

                            {/* Summary Metrics Chips */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                <div className="p-2.5 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60">
                                    <p className="text-[10px] text-zinc-400">{language === 'en' ? 'Database Tables' : 'Tabel Database'}</p>
                                    <p className="font-semibold text-slate-900 dark:text-white font-mono mt-0.5 flex items-center gap-1.5">
                                        <Database className="w-3 h-3 text-blue-500" />
                                        <span>{backupSummary?.tables_count || 16} Tabel</span>
                                    </p>
                                </div>

                                <div className="p-2.5 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60">
                                    <p className="text-[10px] text-zinc-400">{language === 'en' ? 'Total Records' : 'Total Baris Data'}</p>
                                    <p className="font-semibold text-slate-900 dark:text-white font-mono mt-0.5 flex items-center gap-1.5">
                                        <Layers className="w-3 h-3 text-indigo-500" />
                                        <span>{(backupSummary?.total_records || 0).toLocaleString('id-ID')} Baris</span>
                                    </p>
                                </div>

                                <div className="p-2.5 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60">
                                    <p className="text-[10px] text-zinc-400">{language === 'en' ? 'Media Files' : 'Berkas Media'}</p>
                                    <p className="font-semibold text-slate-900 dark:text-white font-mono mt-0.5 flex items-center gap-1.5">
                                        <FolderArchive className="w-3 h-3 text-amber-500" />
                                        <span>{backupSummary?.media_files_count || 0} File</span>
                                    </p>
                                </div>

                                <div className="p-2.5 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/60">
                                    <p className="text-[10px] text-zinc-400">{language === 'en' ? 'Storage Used' : 'Ukuran Media'}</p>
                                    <p className="font-semibold text-[#0AB600] font-mono mt-0.5 flex items-center gap-1.5">
                                        <HardDrive className="w-3 h-3 text-[#0AB600]" />
                                        <span>{backupSummary?.media_size_formatted || '0 MB'}</span>
                                    </p>
                                </div>
                            </div>

                            {/* 3 Download Action Cards */}
                            <div className="space-y-2">
                                <h4 className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                                    {language === 'en' ? 'Download Backup Archive' : 'Pilihan Unduh Cadangan (Snapshot)'}
                                </h4>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    
                                    {/* 1. Database Snapshot */}
                                    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col justify-between gap-3 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
                                                <Database className="w-4 h-4 text-blue-500" />
                                                <span>Snapshot Database</span>
                                            </div>
                                            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                                Ekspor data SQL seluruh tabel proyek riset, pengguna, template, log, dan preferensi sistem.
                                            </p>
                                            <div className="pt-1 text-[10px] text-zinc-400 flex items-center gap-1">
                                                <span>Terakhir:</span>
                                                <span className="font-medium text-slate-700 dark:text-zinc-300">
                                                    {formatBackupDate(backupSummary?.last_database_backup)}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleDownloadBackup('database')}
                                            disabled={downloadingBackupType === 'database'}
                                            className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all cursor-pointer shadow-2xs disabled:opacity-50 active:scale-95"
                                        >
                                            {downloadingBackupType === 'database' ? (
                                                <>
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                                                    <span>{language === 'en' ? 'Exporting...' : 'Mengekspor...'}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Download className="w-3.5 h-3.5 text-blue-500" />
                                                    <span>Unduh .SQL Dump</span>
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {/* 2. Media Assets Archive */}
                                    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col justify-between gap-3 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
                                                <FolderArchive className="w-4 h-4 text-amber-500" />
                                                <span>Direktori Media Assets</span>
                                            </div>
                                            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                                Arsip ZIP kompresi direktori media publik: foto proyek, flyer, logo mitra, dan foto profil.
                                            </p>
                                            <div className="pt-1 text-[10px] text-zinc-400 flex items-center gap-1">
                                                <span>Terakhir:</span>
                                                <span className="font-medium text-slate-700 dark:text-zinc-300">
                                                    {formatBackupDate(backupSummary?.last_media_backup)}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleDownloadBackup('media')}
                                            disabled={downloadingBackupType === 'media'}
                                            className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all cursor-pointer shadow-2xs disabled:opacity-50 active:scale-95"
                                        >
                                            {downloadingBackupType === 'media' ? (
                                                <>
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
                                                    <span>{language === 'en' ? 'Archiving...' : 'Mengompresi...'}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Download className="w-3.5 h-3.5 text-amber-500" />
                                                    <span>Unduh .ZIP Media</span>
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {/* 3. Full Bundle Snapshot */}
                                    <div className="p-4 rounded-xl bg-gradient-to-br from-[#0AB600]/5 to-emerald-500/10 dark:from-[#0AB600]/10 dark:to-emerald-950/30 border border-[#0AB600]/30 flex flex-col justify-between gap-3 hover:border-[#0AB600]/50 transition-all relative overflow-hidden">
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between gap-1">
                                                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
                                                    <Archive className="w-4 h-4 text-[#0AB600]" />
                                                    <span>Bundle Lengkap (All-in-One)</span>
                                                </div>
                                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#0AB600] text-white">
                                                    Rekomendasi
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                                Paket lengkap: Snapshot SQL + seluruh aset media + manifest metadata untuk migrasi penuh.
                                            </p>
                                            <div className="pt-1 text-[10px] text-zinc-400 flex items-center gap-1">
                                                <span>Terakhir:</span>
                                                <span className="font-medium text-slate-700 dark:text-zinc-300">
                                                    {formatBackupDate(backupSummary?.last_full_backup)}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleDownloadBackup('full')}
                                            disabled={downloadingBackupType === 'full'}
                                            className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold bg-[#0AB600] hover:bg-[#089600] text-white transition-all cursor-pointer shadow-xs disabled:opacity-50 active:scale-95"
                                        >
                                            {downloadingBackupType === 'full' ? (
                                                <>
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    <span>{language === 'en' ? 'Generating Bundle...' : 'Membuat Paket...'}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Download className="w-3.5 h-3.5" />
                                                    <span>Unduh Paket .ZIP Lengkap</span>
                                                </>
                                            )}
                                        </button>
                                    </div>

                                </div>
                            </div>

                        </div>

                        {/* Card: Kontak Support Developer (Main Brand Green Banner Style) */}
                        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#0AB600] to-[#089600] text-white border border-[#0AB600]/40 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-lg shadow-[#0AB600]/20">
                            <div className="flex items-center gap-4 sm:gap-5 z-10 max-w-lg">
                                <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center">
                                    <img
                                        src="/assets/img/icon/profile_dev.png"
                                        alt="Developer Assistant"
                                        className="w-full h-full object-contain drop-shadow-md"
                                        onError={(e) => {
                                            e.currentTarget.src = 'https://github.com/fatintsani.png';
                                        }}
                                    />
                                </div>
                                <div>
                                    <h3 className="text-base sm:text-lg font-extrabold tracking-tight text-white">
                                        Kontak Support Developer
                                    </h3>
                                    <p className="text-xs text-white/90 mt-1 leading-relaxed">
                                        Bantuan teknis langsung, penanganan kendala server, atau konsultasi kustomisasi sistem.
                                    </p>
                                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white/20 text-white font-mono text-[11px] font-semibold">
                                        <span>WA: +62 831-3397-7214</span>
                                    </div>
                                </div>
                            </div>

                            <a
                                href="https://wa.me/6283133977214?text=Halo%20Developer%20STAS%20RG%2C%20saya%20admin%20membutuhkan%20bantuan%20teknis%20sistem."
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl bg-white hover:bg-zinc-100 text-[#0AB600] text-xs sm:text-sm font-bold transition-all shadow-md shrink-0 cursor-pointer z-10 self-start sm:self-center whitespace-nowrap active:scale-95"
                            >
                                <Headphones className="w-4 h-4 text-[#0AB600]" />
                                <span>Hubungi via WhatsApp</span>
                            </a>

                            {/* Background Pattern Ambient Glow */}
                            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                        </div>

                    </div>

                    {/* Column Right (5 cols): Preferensi Tampilan, Profil Akun & Ubah Password */}
                    <div className="lg:col-span-5 space-y-6">
                        
                        {/* Preferensi Tampilan (Theme & Language) */}
                        <div className="bg-white dark:bg-[#121824] p-5 sm:p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-4">
                            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
                                {s.preferencesTitle || 'Preferensi Antarmuka'}
                            </h3>

                            {/* Theme Selector */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                                    {s.themeLabel || 'Tema Sistem'}
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setTheme('light')}
                                        className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                                            theme === 'light'
                                                ? 'bg-[#0AB600]/10 border-[#0AB600] text-[#0AB600] font-semibold shadow-2xs'
                                                : 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Sun className="w-3.5 h-3.5 text-amber-500" />
                                            <span>{s.themeLight || 'Mode Terang'}</span>
                                        </div>
                                        {theme === 'light' && <Check className="w-3.5 h-3.5 text-[#0AB600]" />}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setTheme('dark')}
                                        className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                                            theme === 'dark'
                                                ? 'bg-[#0AB600]/10 border-[#0AB600] text-[#0AB600] font-semibold shadow-2xs'
                                                : 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Moon className="w-3.5 h-3.5 text-indigo-400" />
                                            <span>{s.themeDark || 'Mode Gelap'}</span>
                                        </div>
                                        {theme === 'dark' && <Check className="w-3.5 h-3.5 text-[#0AB600]" />}
                                    </button>
                                </div>
                            </div>

                            {/* Language Selector */}
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                                    {s.languageLabel || 'Bahasa Aplikasi'}
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setLanguage('id')}
                                        className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                                            language === 'id'
                                                ? 'bg-[#0AB600]/10 border-[#0AB600] text-[#0AB600] font-semibold shadow-2xs'
                                                : 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <IndonesiaFlag className="w-4 h-3" />
                                            <span>{s.langId || 'Indonesia'}</span>
                                        </div>
                                        {language === 'id' && <Check className="w-3.5 h-3.5 text-[#0AB600]" />}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setLanguage('en')}
                                        className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                                            language === 'en'
                                                ? 'bg-[#0AB600]/10 border-[#0AB600] text-[#0AB600] font-semibold shadow-2xs'
                                                : 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <EnglishFlag className="w-4 h-3" />
                                            <span>{s.langEn || 'English'}</span>
                                        </div>
                                        {language === 'en' && <Check className="w-3.5 h-3.5 text-[#0AB600]" />}
                                    </button>
                                </div>
                            </div>

                            {/* Typography & Font Family Selector */}
                            <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1 rounded-lg bg-[#0AB600]/10 text-[#0AB600]">
                                            <Type className="w-3.5 h-3.5" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-900 dark:text-white">
                                                {s.fontLabel || 'Font Default Aplikasi'}
                                            </label>
                                            <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                                                {s.fontDesc || 'Pilih font default untuk seluruh antarmuka aplikasi. Default: Plus Jakarta Sans.'}
                                            </p>
                                        </div>
                                    </div>

                                    {selectedFont !== 'plus-jakarta-sans' && (
                                        <button
                                            type="button"
                                            onClick={handleResetFontDefault}
                                            disabled={isSavingFont}
                                            title="Kembalikan ke Plus Jakarta Sans"
                                            className="text-[10px] text-rose-600 dark:text-rose-400 hover:underline font-semibold cursor-pointer shrink-0"
                                        >
                                            {s.btnResetFont || 'Kembalikan ke Default'}
                                        </button>
                                    )}
                                </div>

                                {/* Font Option Chips (Plus Jakarta Sans, Poppins, Outfit) */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2">
                                    {fontOptions.map((font) => {
                                        const isSelected = selectedFont === font.key;
                                        return (
                                            <button
                                                key={font.key}
                                                type="button"
                                                onClick={() => handleSelectFontPreview(font.key)}
                                                className={`flex flex-col text-left p-2.5 rounded-xl border transition-all cursor-pointer ${
                                                    isSelected
                                                        ? 'bg-[#0AB600]/10 border-[#0AB600] ring-1 ring-[#0AB600]/30 dark:ring-[#0AB600]/20'
                                                        : 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between w-full">
                                                    <span className={`text-xs font-bold text-slate-900 dark:text-white ${font.specimenClass}`}>
                                                        {font.name}
                                                    </span>
                                                    <div className="flex items-center gap-1">
                                                        {font.isDefault && (
                                                            <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-[#0AB600]/15 dark:bg-[#0AB600]/15 text-[#0AB600] font-medium">
                                                                Default
                                                            </span>
                                                        )}
                                                        {isSelected && (
                                                            <Check className="w-3.5 h-3.5 text-[#0AB600]" />
                                                        )}
                                                    </div>
                                                </div>
                                                <span className={`text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-1 ${font.specimenClass}`}>
                                                    Aa Bb Cc Gg 1 2 3
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Save Button */}
                                <button
                                    type="button"
                                    onClick={handleSaveFont}
                                    disabled={isSavingFont}
                                    className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-[#0AB600] hover:bg-[#089600] text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                                >
                                    {isSavingFont ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            <span>{s.fontSaving || 'Menyimpan Font...'}</span>
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-3.5 h-3.5" />
                                            <span>{s.btnSaveFont || 'Simpan Font Default'}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Profil Administrator */}
                        <div className="bg-white dark:bg-[#121824] p-5 sm:p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
                                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                    {s.profileTitle || 'Profil Akun'}
                                </h3>
                                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#0AB600]/10 border border-[#0AB600]/30 text-[10px] font-semibold text-[#0AB600]">
                                    <Shield className="w-3 h-3 text-[#0AB600]" />
                                    <span>{s.roleAdmin || 'Administrator'}</span>
                                </div>
                            </div>

                            <form onSubmit={handleSaveProfile} className="space-y-4">
                                {/* Hidden File Input */}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleAvatarSelect}
                                    accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                                    className="hidden"
                                />

                                {/* Avatar Upload & Preview Section */}
                                <div className="flex items-center gap-4">
                                    <div className="relative group shrink-0">
                                        {avatarPreview ? (
                                            <div className="relative">
                                                <img
                                                    src={avatarPreview}
                                                    alt="Preview"
                                                    className="w-14 h-14 rounded-2xl object-cover border-2 border-[#0AB600] shadow-sm"
                                                />
                                                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-[#0AB600] text-white text-[9px] font-bold rounded-full">
                                                    {s.badgeNewAvatar || 'Baru'}
                                                </span>
                                            </div>
                                        ) : user?.avatar_url || user?.avatar ? (
                                            <img
                                                src={user.avatar_url || `/storage/${user.avatar}`}
                                                alt={user.name || 'User'}
                                                className="w-14 h-14 rounded-2xl object-cover border border-zinc-200 dark:border-zinc-700 shadow-xs"
                                            />
                                        ) : (
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0AB600] to-[#147a47] text-white font-bold text-lg flex items-center justify-center shadow-xs">
                                                {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
                                            </div>
                                        )}

                                        {/* Quick trigger button */}
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            title={s.tooltipChangeAvatar || 'Ubah Foto Profil'}
                                            className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 shadow-md border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                                        >
                                            <Camera className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    <div className="flex-1 min-w-0 space-y-2">
                                        {isCompressingAvatar ? (
                                            <div className="p-3 rounded-xl border border-[#0AB600]/30 bg-[#0AB600]/10 space-y-1.5 animate-in fade-in">
                                                <div className="flex items-center justify-between text-xs font-bold text-[#0AB600]">
                                                    <div className="flex items-center gap-2">
                                                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0AB600]" />
                                                        <span className="text-[11px]">{avatarCompressionProgress?.stage || 'Mengompresi foto otomatis...'}</span>
                                                    </div>
                                                    <span className="text-[11px] font-mono">{avatarCompressionProgress?.percent || 0}%</span>
                                                </div>
                                                <div className="w-full bg-[#0AB600]/20 dark:bg-[#0AB600]/15 rounded-full h-1.5 overflow-hidden">
                                                    <div
                                                        className="bg-[#0AB600] h-1.5 rounded-full transition-all duration-300"
                                                        style={{ width: `${avatarCompressionProgress?.percent || 15}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-wrap items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                                                >
                                                    <Upload className="w-3.5 h-3.5" />
                                                    <span>{avatarPreview ? (s.btnChangeChoice || 'Ganti Pilihan') : (s.btnChoosePhoto || 'Pilih Foto')}</span>
                                                </button>

                                                {avatarPreview ? (
                                                    <button
                                                        type="button"
                                                        onClick={handleCancelNewAvatar}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                        <span>{s.btnCancelChoice || 'Batal'}</span>
                                                    </button>
                                                ) : (user?.avatar_url || user?.avatar) ? (
                                                    <button
                                                        type="button"
                                                        onClick={handleDeleteCurrentAvatar}
                                                        disabled={isRemovingAvatar}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer disabled:opacity-50"
                                                    >
                                                        {isRemovingAvatar ? (
                                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        )}
                                                        <span>{s.btnDeletePhoto || 'Hapus Foto'}</span>
                                                    </button>
                                                ) : null}
                                            </div>
                                        )}

                                        {avatarCompressionStats?.wasCompressed && (
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0AB600]/10 border border-[#0AB600]/30 text-[11px] font-semibold text-[#0AB600]">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-[#0AB600] shrink-0" />
                                                <span>Dikompresi: {avatarCompressionStats.originalSizeStr} &rarr; {avatarCompressionStats.compressedSizeStr} (Hemat {avatarCompressionStats.savedPercent}%)</span>
                                            </div>
                                        )}

                                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                                            {s.photoHint || 'Format JPG, PNG, atau WebP. Gambar berukuran besar otomatis dikompresi.'}
                                        </p>
                                    </div>
                                </div>

                                {/* Name Field */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                                        <User className="w-3.5 h-3.5" />
                                        <span>{s.labelFullName || 'Nama Lengkap'}</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={profileName}
                                        onChange={(e) => setProfileName(e.target.value)}
                                        placeholder={s.placeholderFullName || 'Nama Pengguna'}
                                        required
                                        className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/80 rounded-xl text-slate-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#0AB600] transition-colors"
                                    />
                                </div>

                                {/* Read-only Username & Email */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-semibold text-zinc-400">
                                            {s.labelUsername || 'Username'}
                                        </label>
                                        <div className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/80 text-[11px] font-mono text-zinc-600 dark:text-zinc-400">
                                            @{user.username || 'admin'}
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-semibold text-zinc-400">
                                            {s.labelEmail || 'Email'}
                                        </label>
                                        <div className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800/80 text-[11px] text-zinc-600 dark:text-zinc-400 truncate">
                                            {user.email}
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={isSavingProfile}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0AB600] hover:bg-[#089600] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                                    >
                                        {isSavingProfile ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>{s.savingProfile || 'Menyimpan Profil...'}</span>
                                            </>
                                        ) : (
                                            <>
                                                <Check className="w-4 h-4" />
                                                <span>{s.btnSaveProfile || 'Simpan Perubahan Profil'}</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>

                            {/* Additional metadata */}
                            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-[11px] text-zinc-400 space-y-1">
                                <div className="flex justify-between">
                                    <span>{s.labelAccountStatus || 'Status Akun'}:</span>
                                    <span className="font-semibold text-[#0AB600] uppercase">{user.status}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>{s.labelJoinedSince || 'Bergabung Sejak'}:</span>
                                    <span>{user.created_at ? new Date(user.created_at).toLocaleDateString(language === 'en' ? 'en-US' : 'id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Section: Ubah Kata Sandi Akun (Change Password) */}
                        <div className="bg-white dark:bg-[#121824] p-5 sm:p-6 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-1.5 rounded-xl bg-[#0AB600]/10 border border-[#0AB600]/30 text-[#0AB600]">
                                        <Lock className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                            {s.passwordSectionTitle || 'Ubah Kata Sandi Akun'}
                                        </h3>
                                        <p className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400">
                                            {s.passwordSectionDesc || 'Perbarui kata sandi secara berkala untuk menjaga keamanan akun Anda.'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleUpdatePassword} className="space-y-3.5">
                                
                                {/* Current Password Field */}
                                <div className="space-y-1">
                                    <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
                                        <span>{s.labelCurrentPassword || 'Kata Sandi Saat Ini'}</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showCurrentPassword ? "text" : "password"}
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            placeholder={s.placeholderCurrentPassword || 'Masukkan kata sandi saat ini'}
                                            required
                                            className="w-full px-3 py-2 pr-10 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/80 rounded-xl text-slate-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#0AB600] transition-colors"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                                        >
                                            {showCurrentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* New Password Field */}
                                <div className="space-y-1">
                                    <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
                                        <span>{s.labelNewPassword || 'Kata Sandi Baru'}</span>
                                        <span className={`text-[10px] ${newPassword.length >= 8 ? 'text-[#0AB600]' : 'text-zinc-400'}`}>
                                            {s.passwordRuleMin || 'Min. 8 Karakter'}
                                        </span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder={s.placeholderNewPassword || 'Minimal 8 karakter'}
                                            required
                                            minLength={8}
                                            className="w-full px-3 py-2 pr-10 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/80 rounded-xl text-slate-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#0AB600] transition-colors"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                                        >
                                            {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password Field */}
                                <div className="space-y-1">
                                    <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
                                        <span>{s.labelConfirmPassword || 'Konfirmasi Kata Sandi Baru'}</span>
                                        {confirmPassword && (
                                            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${
                                                newPassword === confirmPassword
                                                    ? 'text-[#0AB600]'
                                                    : 'text-rose-500'
                                            }`}>
                                                {newPassword === confirmPassword ? (
                                                    <>
                                                        <Check className="w-3 h-3" />
                                                        <span>Cocok</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <X className="w-3 h-3" />
                                                        <span>Tidak Cocok</span>
                                                    </>
                                                )}
                                            </span>
                                        )}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder={s.placeholderConfirmPassword || 'Ulangi kata sandi baru'}
                                            required
                                            minLength={8}
                                            className="w-full px-3 py-2 pr-10 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/80 rounded-xl text-slate-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#0AB600] transition-colors"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={isUpdatingPassword || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 8}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-zinc-800 hover:bg-slate-800 dark:hover:bg-zinc-700 text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                                    >
                                        {isUpdatingPassword ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>{s.updatingPassword || 'Memproses Kata Sandi...'}</span>
                                            </>
                                        ) : (
                                            <>
                                                <KeyRound className="w-4 h-4" />
                                                <span>{s.btnSavePassword || 'Perbarui Kata Sandi'}</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>

                    </div>
                </div>

            </div>

            {/* Modal: Pulihkan Data dari Snapshot (Restore Modal) */}
            {showRestoreModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="relative w-full max-w-lg bg-white dark:bg-[#121824] rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xl overflow-hidden p-6 space-y-5">
                        
                        {/* Modal Header */}
                        <div className="flex items-start justify-between gap-4 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                    <UploadCloud className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                                        {language === 'en' ? 'Restore System Snapshot' : 'Pulihkan Data dari Snapshot'}
                                    </h3>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                        {language === 'en'
                                            ? 'Upload a .sql snapshot or .zip bundle to restore system data.'
                                            : 'Unggah file snapshot .sql atau bundel .zip untuk memulihkan database & aset media.'}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    if (!isRestoring) {
                                        setShowRestoreModal(false);
                                        setRestoreFile(null);
                                    }
                                }}
                                disabled={isRestoring}
                                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer disabled:opacity-50"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Dropzone File Selector */}
                        <div className="space-y-3">
                            <label className="text-xs font-semibold text-slate-900 dark:text-white block">
                                {language === 'en' ? 'Select Snapshot File (.sql / .zip)' : 'Pilih File Snapshot (.sql / .zip)'}
                            </label>

                            <input
                                ref={restoreFileInputRef}
                                type="file"
                                accept=".sql,.zip"
                                onChange={handleSelectRestoreFile}
                                className="hidden"
                                id="backup-file-upload"
                            />

                            <label
                                htmlFor="backup-file-upload"
                                className={`w-full flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
                                    restoreFile
                                        ? 'border-[#0AB600] bg-[#0AB600]/5 dark:bg-[#0AB600]/10'
                                        : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 bg-zinc-50/50 dark:bg-zinc-900/30'
                                }`}
                            >
                                {restoreFile ? (
                                    <div className="flex flex-col items-center text-center space-y-2">
                                        <div className="p-3 rounded-2xl bg-[#0AB600]/10 text-[#0AB600]">
                                            <FileArchive className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-900 dark:text-white break-all">
                                                {restoreFile.name}
                                            </p>
                                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                                                {(restoreFile.size / 1024 / 1024).toFixed(2)} MB &bull; {language === 'en' ? 'Click to change file' : 'Klik untuk ganti file'}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center text-center space-y-2">
                                        <div className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400">
                                            <Upload className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                                                {language === 'en' ? 'Click or drag file here to upload' : 'Klik atau seret file ke sini'}
                                            </p>
                                            <p className="text-[11px] text-zinc-400 mt-0.5">
                                                Mendukung file <span className="font-mono font-semibold">.sql</span> atau <span className="font-mono font-semibold">.zip</span> (Maks. 200 MB)
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </label>
                        </div>

                        {/* Safety Warning Notice */}
                        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs space-y-1.5 leading-relaxed">
                            <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{language === 'en' ? 'Attention Before Restoring:' : 'Perhatian Sebelum Melakukan Restorasi:'}</span>
                            </div>
                            <p className="text-[11px] pl-6 text-amber-900/90 dark:text-amber-300/90">
                                Proses ini akan menggantikan data database dan berkas media saat ini sesuai isi snapshot yang diunggah. Pastikan Anda telah mengunduh snapshot cadangan terbaru sebelum melanjutkan.
                            </p>
                        </div>

                        {/* Modal Action Buttons */}
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowRestoreModal(false);
                                    setRestoreFile(null);
                                }}
                                disabled={isRestoring}
                                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50"
                            >
                                {language === 'en' ? 'Cancel' : 'Batal'}
                            </button>

                            <button
                                type="button"
                                onClick={handlePerformRestore}
                                disabled={!restoreFile || isRestoring}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0AB600] hover:bg-[#089600] text-white transition-all cursor-pointer shadow-md disabled:opacity-50 active:scale-95"
                            >
                                {isRestoring ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>{language === 'en' ? 'Restoring Snapshot...' : 'Memulihkan Snapshot...'}</span>
                                    </>
                                ) : (
                                    <>
                                        <UploadCloud className="w-4 h-4" />
                                        <span>{language === 'en' ? 'Execute Restore' : 'Mulai Proses Restorasi'}</span>
                                    </>
                                )}
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
