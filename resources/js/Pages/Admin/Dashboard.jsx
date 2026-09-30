import React from "react";
import {Link, usePage} from "@inertiajs/react";
import {ArrowRightIcon, CalendarRangeIcon, ClipboardCheckIcon, KeyRoundIcon, ListChecksIcon, UsersIcon} from "lucide-react";
import AdminNav from "../../Layouts/AdminNav";
import PageHeader from "@/components/PageHeader";
import Pattern from "@/components/Pattern";
import StatusBadge from "@/components/StatusBadge";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {cn} from "@/lib/utils";
import {jenjangStyle} from "@/lib/jenjang";

const barColors = {
    pengisian_data: 'bg-muted-foreground/50',
    menunggu_verifikasi: 'bg-amber-500',
    perlu_perbaikan: 'bg-orange-500',
    terverifikasi: 'bg-sky-500',
    lulus: 'bg-emerald-500',
    tidak_lulus: 'bg-red-500',
}

const quickLinks = [
    {href: '/admin/siswa?status=menunggu_verifikasi', icon: ClipboardCheckIcon, title: 'Verifikasi pendaftar', text: 'Periksa data yang sudah diajukan'},
    {href: '/admin/gelombang', icon: CalendarRangeIcon, title: 'Gelombang pendaftaran', text: 'Atur kapan pendaftaran dibuka'},
    {href: '/admin/menu', icon: ListChecksIcon, title: 'Menu & formulir', text: 'Atur isian formulir per jenjang'},
    {href: '/admin/siswa', icon: UsersIcon, title: 'Data siswa', text: 'Cari dan kelola pendaftar'},
    {href: '/admin/akun-ujian', icon: KeyRoundIcon, title: 'Akun ujian', text: 'Login ujian siswa terverifikasi'},
]

const Dashboard = ({jenjang, status, total})=>{

    const {sekolah} = usePage().props
    const menunggu = status.find(item => item.value === 'menunggu_verifikasi')?.total ?? 0

    return (
        <>
            <PageHeader
                eyebrow="Panel panitia"
                title="Dashboard PPDB"
                description={`Ringkasan pendaftaran Tahun Ajaran ${sekolah.tahun}.`}
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="relative overflow-hidden rounded-2xl bg-brand p-6 text-brand-foreground shadow-sm">
                    <Pattern className="text-white/[0.06]" size={48}/>
                    <div className="relative">
                        <p className="text-sm text-brand-foreground/80">Total pendaftar</p>
                        <p className="mt-2 font-serif text-4xl font-semibold text-white">{total}</p>
                        <Link href="/admin/siswa?status=menunggu_verifikasi"
                              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-gold hover:underline">
                            {menunggu} menunggu verifikasi <ArrowRightIcon className="size-4"/>
                        </Link>
                    </div>
                </div>
                {jenjang.map(item => {
                    const style = jenjangStyle(item.value)

                    return (
                        <Link key={item.value} href={`/admin/siswa?jenjang=${item.value}`}
                              className="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition hover:shadow-md">
                            <span className={cn("absolute inset-y-0 left-0 w-1.5", style.bar)}/>
                            <p className="text-sm text-muted-foreground">{item.label}</p>
                            <p className="mt-2 font-serif text-4xl font-semibold">{item.total}</p>
                            <p className={cn("mt-3 text-sm font-medium", item.menunggu > 0 ? "text-amber-700 dark:text-amber-400" : "text-muted-foreground")}>
                                {item.menunggu > 0 ? `${item.menunggu} menunggu verifikasi` : 'Tidak ada antrean verifikasi'}
                            </p>
                        </Link>
                    )
                })}
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="font-serif text-lg">Status pendaftaran</CardTitle>
                        <CardDescription>{total} siswa terdaftar di semua jenjang.</CardDescription>
                    </CardHeader>
                    <CardContent className="px-3">
                        <ul className="grid gap-1">
                            {status.map(item => (
                                <li key={item.value}>
                                    <Link href={`/admin/siswa?status=${item.value}`}
                                          className="grid grid-cols-[10.5rem_1fr_2.5rem] items-center gap-4 rounded-lg px-3 py-2.5 hover:bg-accent">
                                        <StatusBadge status={item.value} label={item.label}/>
                                        <span className="h-2 overflow-hidden rounded-full bg-muted">
                                            <span className={cn("block h-full rounded-full", barColors[item.value])}
                                                  style={{width: total ? `${item.total / total * 100}%` : 0}}/>
                                        </span>
                                        <span className="text-right font-semibold tabular-nums">{item.total}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-serif text-lg">Pintasan</CardTitle>
                        <CardDescription>Tugas yang sering dilakukan panitia.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-2 px-3">
                        {quickLinks.map(item => (
                            <Link key={item.href} href={item.href}
                                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-accent">
                                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                                    <item.icon className="size-5"/>
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block text-sm font-semibold">{item.title}</span>
                                    <span className="block text-xs text-muted-foreground">{item.text}</span>
                                </span>
                                <ArrowRightIcon className="size-4 text-muted-foreground"/>
                            </Link>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </>
    )
}

Dashboard.layout = page => <AdminNav>{page}</AdminNav>

export default Dashboard
