import {
    BanknoteIcon,
    ClipboardListIcon,
    FileCheck2Icon,
    IdCardIcon,
    KeyRoundIcon,
    MegaphoneIcon,
    SendIcon,
    UserPlusIcon,
} from "lucide-react";

/** The registration flow, shown on the landing and help pages. */
export const steps = [
    {key: 'akun', icon: UserPlusIcon, title: 'Buat akun', text: 'Pilih jenjang, lalu daftar dengan username dan password.', payment: false},
    {key: 'bayar', icon: BanknoteIcon, title: 'Bayar & kirim bukti', text: 'Pilih jenjang, transfer biaya pendaftaran, lalu kirim bukti transfernya di halaman Daftar.', payment: true},
    {key: 'terima', icon: KeyRoundIcon, title: 'Terima akun', text: 'Panitia memeriksa pembayaran dan membuat akunmu. Pantau dengan kode pengajuan.', payment: true},
    {key: 'formulir', icon: ClipboardListIcon, title: 'Isi formulir', text: 'Lengkapi setiap menu formulir dan unggah berkas yang diminta.'},
    {key: 'finalisasi', icon: SendIcon, title: 'Ajukan finalisasi', text: 'Setelah semua lengkap, ajukan datamu untuk diperiksa panitia.'},
    {key: 'kartu', icon: IdCardIcon, title: 'Kartu ujian', text: 'Data terverifikasi? Cetak kartu ujian berisi jadwal dan akun ujianmu.'},
    {key: 'pengumuman', icon: MegaphoneIcon, title: 'Pengumuman', text: 'Lihat hasil seleksi dan cetak surat kelulusan dari dashboard.'},
]

/**
 * The steps for paying first (some jenjang charges a fee, as in ppdb2020)
 * or for creating an account straight away.
 */
export const stepsFor = withPayment => steps.filter(step => step.payment === undefined || step.payment === !!withPayment)

/** Keys match App\Services\Admission::timeline(). */
export const jadwalItems = [
    {key: 'pengisian', title: 'Pendaftaran & pengisian formulir', icon: ClipboardListIcon},
    {key: 'finalisasi', title: 'Pengajuan finalisasi', icon: SendIcon},
    {key: 'verifikasi', title: 'Verifikasi data oleh panitia', icon: FileCheck2Icon, fallback: 'Setelah data diajukan'},
    {key: 'kartu', title: 'Unduh kartu ujian', icon: IdCardIcon},
    {key: 'seleksi', title: 'Ujian & pengumuman', icon: MegaphoneIcon},
]
