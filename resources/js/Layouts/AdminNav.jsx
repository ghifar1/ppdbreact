import React from "react";
import {Link} from "@inertiajs/react";
import {CalendarRangeIcon, GlobeIcon, KeyRoundIcon, LayoutDashboardIcon, ListChecksIcon, UsersIcon} from "lucide-react";
import AppLayout from "./AppLayout";

const sections = [
    {
        title: 'Utama',
        items: [{title: 'Dashboard', href: '/admin', icon: LayoutDashboardIcon, exact: true}],
    },
    {
        title: 'Pengelolaan',
        items: [
            {title: 'Gelombang Pendaftaran', href: '/admin/gelombang', icon: CalendarRangeIcon},
            {title: 'Menu & Formulir', href: '/admin/menu', icon: ListChecksIcon},
            {title: 'Data Siswa', href: '/admin/siswa', icon: UsersIcon},
            {title: 'Akun Ujian', href: '/admin/akun-ujian', icon: KeyRoundIcon},
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
