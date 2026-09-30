import {ClipboardListIcon, FileCheck2Icon, IdCardIcon, MegaphoneIcon, SendIcon, UserPlusIcon} from "lucide-react";

/** The registration flow, shown on the landing and help pages. */
export const steps = [
    {icon: UserPlusIcon, title: 'Buat akun', text: 'Pilih jenjang, lalu daftar dengan username dan password.'},
    {icon: ClipboardListIcon, title: 'Isi formulir', text: 'Lengkapi setiap menu formulir dan unggah berkas yang diminta.'},
    {icon: SendIcon, title: 'Ajukan finalisasi', text: 'Setelah semua lengkap, ajukan datamu untuk diperiksa panitia.'},
    {icon: IdCardIcon, title: 'Kartu ujian', text: 'Data terverifikasi? Unduh dan cetak kartu peserta ujian.'},
    {icon: MegaphoneIcon, title: 'Pengumuman', text: 'Lihat hasil seleksi langsung di dashboard akunmu.'},
]

/** Keys match config/ppdb.php `jadwal`. */
export const jadwalItems = [
    {key: 'pengisian', title: 'Pengisian formulir', icon: ClipboardListIcon},
    {key: 'finalisasi', title: 'Pengajuan finalisasi', icon: SendIcon},
    {key: 'verifikasi', title: 'Verifikasi data oleh panitia', icon: FileCheck2Icon},
    {key: 'kartu', title: 'Unduh kartu ujian', icon: IdCardIcon},
    {key: 'seleksi', title: 'Seleksi & pengumuman', icon: MegaphoneIcon},
]
