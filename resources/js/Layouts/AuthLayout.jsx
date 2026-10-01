import React from "react";
import {Link, usePage} from "@inertiajs/react";
import {ArrowLeftIcon, CircleCheckIcon} from "lucide-react";
import {Brand} from "./PublicLayout";
import Pattern from "@/components/Pattern";
import SchoolLogo from "@/components/SchoolLogo";
import ThemeToggle from "@/components/ThemeToggle";

const points = [
    'Daftar dan isi formulir dari rumah',
    'Pantau status verifikasi kapan saja',
    'Unduh kartu ujian & lihat pengumuman',
]

/** Split screen for login and registration: school panel left, form right. */
const AuthLayout = ({children})=>{

    const {sekolah} = usePage().props
    const year = new Date().getFullYear()

    return (
        <div className="grid min-h-screen bg-background lg:grid-cols-[1fr_1.1fr]">
            <aside className="relative hidden overflow-hidden bg-brand text-brand-foreground lg:flex lg:flex-col">
                <Pattern className="text-white/[0.06]"/>
                <div className="pointer-events-none absolute -right-32 -bottom-32 size-[26rem] rounded-full bg-gold/10 blur-3xl"/>
                <div className="relative flex flex-1 flex-col justify-between p-12">
                    <Brand light/>
                    <div>
                        <SchoolLogo className="h-28 w-24"/>
                        <p className="mt-8 font-serif text-4xl leading-tight font-semibold text-white">
                            Ahlan wa sahlan,<br/><span className="text-gold">calon peserta didik baru.</span>
                        </p>
                        <ul className="mt-8 grid gap-3">
                            {points.map(point => (
                                <li key={point} className="flex items-center gap-3 text-brand-foreground/85">
                                    <CircleCheckIcon className="size-5 shrink-0 text-gold"/> {point}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <p className="text-xs text-brand-foreground/60">© {year} {sekolah.nama} · PPDB Tahun Ajaran {sekolah.tahun}</p>
                </div>
            </aside>

            <main className="flex flex-col">
                <div className="flex items-center justify-between gap-4 p-4 sm:p-6">
                    <div className="lg:hidden"><Brand/></div>
                    <Link href="/" className="hidden items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary lg:inline-flex">
                        <ArrowLeftIcon className="size-4"/> Kembali ke beranda
                    </Link>
                    <ThemeToggle/>
                </div>
                <div className="flex flex-1 items-center justify-center px-4 pb-12 sm:px-6">
                    <div className="w-full max-w-md">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    )
}

export default AuthLayout
