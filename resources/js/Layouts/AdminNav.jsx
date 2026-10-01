import React from "react";
import {Link} from "@inertiajs/react";
import {
    BanknoteIcon,
    CalendarDaysIcon,
    CalendarRangeIcon,
    GlobeIcon,
    KeyRoundIcon,
    LayoutDashboardIcon,
    ListChecksIcon,
    SlidersHorizontalIcon,
    UsersIcon,
} from "lucide-react";
import AppLayout from "./AppLayout";

const sections = [
    {
        title: 'Utama',
        items: [{title: 'Dashboard', href: '/admin', icon: LayoutDashboardIcon, exact: true}],
    },
    {
        title: 'Pendaftar',
        items: [
            {title: 'Data Siswa', href: '/admin/siswa', icon: UsersIcon},
            {title: 'Pembayaran', href: '/admin/pembayaran', icon: BanknoteIcon},
        ],
    },
    {
        title: 'Seleksi',
        items: [
            {title: 'Jadwal Ujian', href: '/admin/jadwal-ujian', icon: CalendarDaysIcon},
            {title: 'Akun Ujian', href: '/admin/akun-ujian', icon: KeyRoundIcon},
        ],
    },
    {
        title: 'Pengaturan',
        items: [
            {title: 'Gelombang Pendaftaran', href: '/admin/gelombang', icon: CalendarRangeIcon},
            {title: 'Pengaturan Seleksi', href: '/admin/pengaturan', icon: SlidersHorizontalIcon},
            {title: 'Menu & Formulir', href: '/admin/menu', icon: ListChecksIcon},
        ],
    },
]

const footer = (
    <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-white">
        <GlobeIcon className="size-5 text-sidebar-primary"/>
        <span><span className="block font-medium">Halaman publik</span><span className="text-xs opacity-80">Lihat seperti calon siswa</span></span>
    </Link>
)

const AdminNav = ({children})=>(
    <AppLayout sections={sections} homeHref="/admin" subtitle="Panel Panitia PPDB" footer={footer}>
        {children}
    </AppLayout>
)

export default AdminNav
