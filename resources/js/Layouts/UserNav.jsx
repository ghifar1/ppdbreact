import React from "react";
import {Link, usePage} from "@inertiajs/react";
import {AwardIcon, BanknoteIcon, IdCardIcon, LayoutDashboardIcon, LifeBuoyIcon, UserRoundCogIcon} from "lucide-react";
import AppLayout from "./AppLayout";

const paymentBadges = {
    belum: {label: 'Belum', tone: 'todo'},
    menunggu: {label: 'Belum', tone: 'todo'},
    ditolak: {label: 'Belum', tone: 'todo'},
    diterima: {label: 'Lunas', tone: 'done'},
}

/** How many form menus are complete, shown at the top of the student sidebar. */
const Progress = ({menus})=>{

    const done = menus.filter(menu => menu.complete).length
    const percent = menus.length ? Math.round(done / menus.length * 100) : 0

    return (
        <div className="rounded-xl bg-white/[0.06] p-4 ring-1 ring-white/10">
            <div className="flex items-baseline justify-between text-sm">
                <span className="font-medium text-white">Kelengkapan data</span>
                <span className="font-semibold text-sidebar-primary">{percent}%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10" role="progressbar"
                 aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Kelengkapan data">
                <div className="h-full rounded-full bg-sidebar-primary transition-all" style={{width: `${percent}%`}}/>
            </div>
            <p className="mt-2 text-xs text-sidebar-foreground/80">{done} dari {menus.length} formulir lengkap</p>
        </div>
    )
}

const UserNav = ({children})=>{

    const {studentMenus, studentNav} = usePage().props

    const sections = [
        {
            title: 'Utama',
            items: [
                {title: 'Dashboard', href: '/dashboard', icon: LayoutDashboardIcon, exact: true},
                ...(studentNav?.payment ? [{title: 'Pembayaran', href: '/pembayaran', icon: BanknoteIcon, badge: paymentBadges[studentNav.payment]}] : []),
                ...(studentNav?.card ? [{title: 'Kartu Ujian', href: '/kartu', icon: IdCardIcon}] : []),
                ...(studentNav?.letter ? [{title: 'Hasil Seleksi', href: '/kelulusan', icon: AwardIcon}] : []),
                {title: 'Akun Saya', href: '/akun', icon: UserRoundCogIcon},
            ],
        },
        {
            title: 'Formulir Pendaftaran',
            items: studentMenus.map((menu, i) => ({
                title: menu.title,
                href: `/formulir/${menu.id}`,
                number: i + 1,
                complete: menu.complete,
            })),
        },
    ]

    const footer = (
        <Link href="/help" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-white">
            <LifeBuoyIcon className="size-5 text-sidebar-primary"/>
            <span><span className="block font-medium">Butuh bantuan?</span><span className="text-xs opacity-80">Baca panduan pendaftaran</span></span>
        </Link>
    )

    return (
        <AppLayout sections={sections} homeHref="/dashboard" subtitle="Portal Calon Siswa"
                   summary={studentMenus.length > 0 && <Progress menus={studentMenus}/>} footer={footer}>
            {children}
        </AppLayout>
    )
}

export default UserNav
