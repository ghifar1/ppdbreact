import React from 'react'
import {CheckIcon} from "lucide-react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {cn} from "@/lib/utils";

/** Index of the step the student is currently on. */
function currentStep(status, dataLengkap)
{
    switch (status) {
        case 'menunggu_verifikasi': return 2
        case 'terverifikasi': return 3
        case 'lulus':
        case 'tidak_lulus': return 4
        default: return dataLengkap ? 1 : 0
    }
}

const steps = [
    {key: 'pengisian', title: 'Pengisian data', text: 'Isi semua formulir di menu samping.'},
    {key: 'finalisasi', title: 'Pengajuan finalisasi', text: 'Ajukan data untuk diperiksa panitia.'},
    {key: 'verifikasi', title: 'Verifikasi panitia', text: 'Panitia memeriksa kelengkapan dan keabsahan data.'},
    {key: 'kartu', title: 'Unduh kartu ujian', text: 'Cetak kartu peserta untuk mengikuti seleksi.'},
    {key: 'seleksi', title: 'Hasil seleksi', text: 'Pengumuman hasil seleksi di dashboard.'},
]

/** Timeline of the admission steps with the schedule from config/ppdb.php. */
export const ProgressUser = ({profil, dataLengkap, jadwal})=>{

    const current = currentStep(profil.status, dataLengkap)
    const finished = ['lulus', 'tidak_lulus'].includes(profil.status)

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-serif text-lg">Tahapan PPDB</CardTitle>
                <CardDescription>Posisimu saat ini dalam proses penerimaan.</CardDescription>
            </CardHeader>
            <CardContent>
                <ol className="relative">
                    {steps.map((step, i) => {
                        const state = i < current || (finished && i === current) ? 'done' : i === current ? 'current' : 'upcoming'

                        return (
                            <li key={step.key} className="relative flex gap-4 pb-7 last:pb-0">
                                {i < steps.length - 1 && (
                                    <span className={cn("absolute top-9 bottom-1 left-[17px] w-0.5 rounded-full",
                                        state === 'done' ? "bg-primary" : "bg-border")} aria-hidden="true"/>
                                )}
                                <span className={cn(
                                    "relative flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                                    state === 'done' && "bg-primary text-primary-foreground",
                                    state === 'current' && "bg-gold text-gold-foreground ring-4 ring-gold/25",
                                    state === 'upcoming' && "border-2 border-border bg-card text-muted-foreground",
                                )}>
                                    {state === 'done' ? <CheckIcon className="size-4" strokeWidth={3}/> : i + 1}
                                </span>
                                <div className="min-w-0 flex-1 pt-1.5">
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                        <p className={cn("font-semibold", state === 'upcoming' && "text-muted-foreground")}>{step.title}</p>
                                        {state === 'current' && (
                                            <span className="rounded-full bg-gold-soft px-2 py-0.5 text-[11px] font-semibold text-gold-foreground ring-1 ring-gold/40 ring-inset dark:text-gold">
                                                Sedang berjalan
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-0.5 text-sm text-muted-foreground">{step.text}</p>
                                    {jadwal?.[step.key] && (
                                        <p className="mt-1 text-xs font-medium text-primary">{jadwal[step.key]}</p>
                                    )}
                                </div>
                            </li>
                        )
                    })}
                </ol>
            </CardContent>
        </Card>
    )
}
