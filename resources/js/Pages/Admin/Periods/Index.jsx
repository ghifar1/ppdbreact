import React, {useState} from "react";
import {Link, router} from "@inertiajs/react";
import {CalendarRangeIcon, ClockIcon, PencilIcon, PlusIcon, Trash2Icon, UsersIcon} from "lucide-react";
import AdminNav from "../../../Layouts/AdminNav";
import ConfirmDialog from "@/components/ConfirmDialog";
import JenjangBadge from "@/components/JenjangBadge";
import PageHeader from "@/components/PageHeader";
import PeriodStatusBadge from "@/components/PeriodStatusBadge";
import PeriodDialog from "./PeriodDialog";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {jenjangStyle} from "@/lib/jenjang";

/** Whether each jenjang can register right now. */
const JenjangStatus = ({option, status})=>{

    const style = jenjangStyle(option.value)
    const [tone, title, detail] = !status.restricted
        ? ['text-muted-foreground', 'Dibuka tanpa batas waktu', 'Belum ada gelombang untuk jenjang ini.']
        : status.open
            ? ['text-primary', `${status.current.name} dibuka`, `Ditutup ${status.current.closes_label}`]
            : ['text-amber-700 dark:text-amber-400', 'Pendaftaran ditutup', status.next ? `${status.next.name} dibuka ${status.next.opens_label}` : 'Tidak ada gelombang berikutnya.']

    return (
        <div className="relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm">
            <span className={cn("absolute inset-y-0 left-0 w-1.5", style.bar)}/>
            <p className="text-sm text-muted-foreground">{option.label}</p>
            <p className={cn("mt-1 font-semibold", tone)}>{title}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{detail}</p>
        </div>
    )
}

const Index = ({periods, summary, jenjangOptions})=>{

    const [dialog, setDialog] = useState({open: false, period: null})
    const destroy = period => router.delete(`/admin/gelombang/${period.id}`, {preserveScroll: true})

    return (
        <>
            <PageHeader
                eyebrow="Pengelolaan"
                title="Gelombang Pendaftaran"
                description="Atur kapan pendaftaran dibuka. Jenjang tanpa gelombang selalu bisa mendaftar; setelah ada gelombang, siswa hanya bisa mendaftar selama gelombangnya dibuka."
                actions={<Button onClick={() => setDialog({open: true, period: null})}><PlusIcon/> Tambah gelombang</Button>}
            />

            <div className="grid gap-4 md:grid-cols-3">
                {jenjangOptions.map(option => <JenjangStatus key={option.value} option={option} status={summary[option.value]}/>)}
            </div>

            <section className="mt-6 overflow-hidden rounded-2xl border bg-card shadow-sm">
                <div className="border-b px-6 py-4">
                    <h2 className="font-serif text-lg font-semibold">Daftar gelombang</h2>
                    <p className="text-sm text-muted-foreground">{periods.length} gelombang, terbaru di atas.</p>
                </div>
                {periods.length === 0 && (
                    <div className="px-6 py-12 text-center">
                        <CalendarRangeIcon className="mx-auto size-10 text-muted-foreground/60"/>
                        <p className="mt-3 text-sm text-muted-foreground">
                            Belum ada gelombang. Klik <b>Tambah gelombang</b> untuk mengatur jadwal pendaftaran.
                        </p>
                    </div>
                )}
                <ul className="divide-y">
                    {periods.map(period => (
                        <li key={period.id} className="flex flex-wrap items-center gap-x-6 gap-y-3 px-4 py-4 sm:px-6">
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className="font-semibold">{period.name}</p>
                                    {period.jenjang
                                        ? <JenjangBadge jenjang={period.jenjang}>{period.jenjang_label}</JenjangBadge>
                                        : <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">Semua jenjang</span>}
                                    <PeriodStatusBadge period={period}/>
                                </div>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {period.opens_label} – {period.closes_label}
                                    {period.fee_label && <> · Biaya <span className="font-medium text-foreground">{period.fee_label}</span></>}
                                </p>
                                {period.description && <p className="mt-1 text-sm whitespace-pre-line text-muted-foreground">{period.description}</p>}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                {period.status !== 'closed' && (
                                    <span className="inline-flex items-center gap-1.5"><ClockIcon className="size-4"/> {period.relative}</span>
                                )}
                                <Link href={`/admin/siswa?gelombang=${period.id}`} className="inline-flex items-center gap-1.5 hover:text-primary hover:underline">
                                    <UsersIcon className="size-4"/> {period.users_count} pendaftar
                                </Link>
                            </div>
                            <div className="flex gap-1">
                                <Button variant="ghost" size="icon-sm" aria-label={`Ubah ${period.name}`}
                                        onClick={() => setDialog({open: true, period})}><PencilIcon/></Button>
                                <ConfirmDialog
                                    title={`Hapus ${period.name}?`}
                                    description={(period.users_count > 0
                                        ? `${period.users_count} siswa yang mendaftar di gelombang ini tetap terdaftar, tetapi tidak lagi tercatat di gelombang mana pun.`
                                        : 'Gelombang ini akan dihapus.') + ' Jadwal ujian khusus gelombang ini ikut terhapus.'}
                                    confirmLabel="Hapus gelombang"
                                    destructive
                                    onConfirm={() => destroy(period)}
                                >
                                    <Button variant="ghost" size="icon-sm" aria-label={`Hapus ${period.name}`}>
                                        <Trash2Icon className="text-destructive"/>
                                    </Button>
                                </ConfirmDialog>
                            </div>
                        </li>
                    ))}
                </ul>
            </section>

            <PeriodDialog
                open={dialog.open}
                onOpenChange={open => setDialog(current => ({...current, open}))}
                period={dialog.period}
                jenjangOptions={jenjangOptions}
            />
        </>
    )
}

Index.layout = page => <AdminNav>{page}</AdminNav>

export default Index
