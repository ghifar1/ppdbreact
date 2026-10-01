import React, {useState} from "react";
import {router} from "@inertiajs/react";
import {CalendarDaysIcon, ClockIcon, CopyPlusIcon, MapPinIcon, PencilIcon, PlusIcon, Trash2Icon, UsersIcon} from "lucide-react";
import AdminNav from "../../../Layouts/AdminNav";
import ConfirmDialog from "@/components/ConfirmDialog";
import JenjangBadge from "@/components/JenjangBadge";
import PageHeader from "@/components/PageHeader";
import ScheduleDialog from "./ScheduleDialog";
import {Button} from "@/components/ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

const ALL = 'semua'

/** The next session: same activity, numbers continuing after this one. */
function nextSession(item)
{
    const size = item.number_from ? item.number_to - item.number_from + 1 : null

    return {
        ...item,
        id: undefined,
        number_from: size ? item.number_to + 1 : '',
        number_to: size ? item.number_to + size : '',
    }
}

const Index = ({items, filters, jenjangOptions, periodOptions})=>{

    const [dialog, setDialog] = useState({open: false, item: null, copy: null})
    const days = Object.entries(items.reduce((groups, item) => {
        (groups[item.date] ??= {label: item.date_label, items: []}).items.push(item)
        return groups
    }, {}))

    return (
        <>
            <PageHeader
                eyebrow="Seleksi"
                title="Jadwal Ujian"
                description="Kegiatan seleksi yang tercetak di kartu ujian. Bagi peserta ke beberapa sesi atau ruang dengan rentang nomor peserta."
                actions={<Button onClick={() => setDialog({open: true, item: null, copy: null})}><PlusIcon/> Tambah jadwal</Button>}
            />

            <div className="mb-4 flex flex-wrap items-center gap-3">
                <Select value={filters.jenjang || ALL}
                        onValueChange={value => router.get('/admin/jadwal-ujian', value === ALL ? {} : {jenjang: value}, {preserveState: true, replace: true})}>
                    <SelectTrigger className="w-52 bg-card" aria-label="Filter jenjang"><SelectValue/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ALL}>Semua jenjang</SelectItem>
                        {jenjangOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                    </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">Nomor peserta dibuat berurutan per jenjang saat siswa diverifikasi.</p>
            </div>

            {days.length === 0 && (
                <div className="rounded-2xl border bg-card px-6 py-14 text-center shadow-sm">
                    <CalendarDaysIcon className="mx-auto size-10 text-muted-foreground/60"/>
                    <p className="mt-3 text-sm text-muted-foreground">
                        Belum ada jadwal ujian. Klik <b>Tambah jadwal</b>; jadwalnya akan tampil di kartu ujian siswa.
                    </p>
                </div>
            )}

            <div className="grid gap-6">
                {days.map(([date, day]) => (
                    <section key={date} className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                        <h2 className="flex items-center gap-2 border-b bg-muted/40 px-6 py-3 font-serif text-lg font-semibold">
                            <CalendarDaysIcon className="size-5 text-primary"/> {day.label}
                        </h2>
                        <ul className="divide-y">
                            {day.items.map(item => (
                                <li key={item.id} className="flex flex-wrap items-start gap-x-6 gap-y-3 px-4 py-4 sm:px-6">
                                    <p className="flex w-32 shrink-0 items-center gap-1.5 pt-0.5 text-sm font-semibold text-primary">
                                        <ClockIcon className="size-4"/> {item.time_label}
                                    </p>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="font-semibold">{item.title}</p>
                                            {item.jenjang
                                                ? <JenjangBadge jenjang={item.jenjang}>{item.jenjang_label}</JenjangBadge>
                                                : <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">Semua jenjang</span>}
                                            {item.period_label && <span className="rounded-full border px-2 py-0.5 text-xs font-medium text-muted-foreground">{item.period_label}</span>}
                                            {item.range_label && <span className="rounded-full bg-gold-soft px-2 py-0.5 text-xs font-semibold text-gold-foreground ring-1 ring-gold/40 ring-inset dark:text-gold">{item.range_label}</span>}
                                        </div>
                                        {item.description && <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>}
                                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                            {item.location && <span className="inline-flex items-center gap-1.5"><MapPinIcon className="size-4"/> {item.location}</span>}
                                            <span className="inline-flex items-center gap-1.5"><UsersIcon className="size-4"/> {item.participants} peserta terverifikasi</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon-sm" aria-label={`Salin ${item.title} untuk sesi berikutnya`} title="Salin untuk sesi berikutnya"
                                                onClick={() => setDialog({open: true, item: null, copy: nextSession(item)})}><CopyPlusIcon/></Button>
                                        <Button variant="ghost" size="icon-sm" aria-label={`Ubah ${item.title}`}
                                                onClick={() => setDialog({open: true, item, copy: null})}><PencilIcon/></Button>
                                        <ConfirmDialog
                                            title={`Hapus ${item.title}?`}
                                            description="Jadwal ini tidak lagi tampil di kartu ujian siswa."
                                            confirmLabel="Hapus jadwal"
                                            destructive
                                            onConfirm={() => router.delete(`/admin/jadwal-ujian/${item.id}`, {preserveScroll: true})}
                                        >
                                            <Button variant="ghost" size="icon-sm" aria-label={`Hapus ${item.title}`}>
                                                <Trash2Icon className="text-destructive"/>
                                            </Button>
                                        </ConfirmDialog>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </section>
                ))}
            </div>

            <ScheduleDialog
                open={dialog.open}
                onOpenChange={open => setDialog(current => ({...current, open}))}
                item={dialog.item}
                copy={dialog.copy}
                jenjangOptions={jenjangOptions}
                periodOptions={periodOptions}
            />
        </>
    )
}

Index.layout = page => <AdminNav>{page}</AdminNav>

export default Index
