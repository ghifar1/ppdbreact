import React from 'react'
import {Link, router, usePage} from "@inertiajs/react";
import {
    ArrowRightIcon,
    ClipboardPenIcon,
    HourglassIcon,
    IdCardIcon,
    PartyPopperIcon,
    SendIcon,
    TriangleAlertIcon,
    HeartHandshakeIcon,
} from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";
import Pattern from "@/components/Pattern";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";

const FinalizeButton = ({disabled})=>(
    <ConfirmDialog
        title="Ajukan finalisasi data?"
        description="Setelah diajukan, data tidak dapat diubah lagi kecuali panitia meminta perbaikan."
        confirmLabel="Ajukan"
        onConfirm={() => router.post('/finalisasi', {}, {preserveScroll: true})}
    >
        <Button variant="gold" size="lg" disabled={disabled}><SendIcon/> Ajukan Finalisasi</Button>
    </ConfirmDialog>
)

/** What the student should do now, based on their status. */
function content(profil, dataLengkap, firstIncomplete)
{
    const fillForms = firstIncomplete && (
        <Button asChild variant="gold" size="lg">
            <Link href={`/formulir/${firstIncomplete.id}`}>Lanjut isi {firstIncomplete.title} <ArrowRightIcon/></Link>
        </Button>
    )

    switch (profil.status) {
        case 'perlu_perbaikan':
            return {
                tone: 'warning',
                icon: TriangleAlertIcon,
                title: 'Panitia meminta perbaikan data',
                text: 'Perbaiki data sesuai catatan panitia, lalu ajukan finalisasi kembali.',
                note: profil.catatan_admin,
                action: dataLengkap ? <FinalizeButton/> : fillForms,
            }
        case 'menunggu_verifikasi':
            return {
                icon: HourglassIcon,
                title: 'Datamu sedang diperiksa panitia',
                text: 'Panitia akan memverifikasi datamu. Kartu ujian bisa diunduh setelah data terverifikasi.',
            }
        case 'terverifikasi':
            return {
                icon: IdCardIcon,
                title: 'Data terverifikasi. Kartu ujian siap!',
                text: 'Cetak kartu ujian dan bawa saat mengikuti seleksi.',
                action: (
                    <Button asChild variant="gold" size="lg">
                        <Link href="/kartu"><IdCardIcon/> Buka Kartu Ujian</Link>
                    </Button>
                ),
            }
        case 'lulus':
            return {
                icon: PartyPopperIcon,
                title: 'Selamat! Kamu dinyatakan LULUS seleksi.',
                text: 'Barakallahu fiik. Ikuti informasi daftar ulang dari panitia PPDB.',
            }
        case 'tidak_lulus':
            return {
                tone: 'muted',
                icon: HeartHandshakeIcon,
                title: 'Mohon maaf, kamu belum lulus seleksi.',
                text: 'Terima kasih telah mendaftar. Tetap semangat dan jangan berhenti belajar.',
            }
        default:
            return dataLengkap ? {
                icon: SendIcon,
                title: 'Semua formulir sudah lengkap',
                text: 'Periksa kembali datamu, lalu ajukan finalisasi agar bisa diverifikasi panitia.',
                action: <FinalizeButton/>,
            } : {
                icon: ClipboardPenIcon,
                title: 'Lengkapi formulir pendaftaran',
                text: 'Isi semua isian wajib (*) di setiap formulir. Formulir yang sudah lengkap ditandai centang.',
                action: fillForms,
            }
    }
}

const tones = {
    brand: {
        box: "bg-brand text-brand-foreground",
        pattern: "text-white/[0.06]",
        icon: "bg-white/10 text-gold",
        eyebrow: "text-gold",
        title: "text-white",
        text: "opacity-85",
    },
    warning: {
        box: "bg-amber-50 text-amber-950 ring-1 ring-amber-200 ring-inset dark:bg-amber-950/50 dark:text-amber-50 dark:ring-amber-900",
        pattern: "text-amber-900/[0.05] dark:text-white/[0.03]",
        icon: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
        eyebrow: "text-amber-700 dark:text-amber-300",
        title: "",
        text: "text-amber-900/80 dark:text-amber-100/80",
    },
    muted: {
        box: "bg-muted text-foreground",
        pattern: "text-foreground/[0.04]",
        icon: "bg-background text-primary",
        eyebrow: "text-primary",
        title: "",
        text: "text-muted-foreground",
    },
}

export const NextStep = ({profil, dataLengkap})=>{

    const {studentMenus} = usePage().props
    const step = content(profil, dataLengkap, studentMenus.find(menu => !menu.complete))
    const tone = tones[step.tone ?? 'brand']
    const Icon = step.icon

    return (
        <section className={cn("relative overflow-hidden rounded-2xl p-6 shadow-sm sm:p-8", tone.box)}>
            <Pattern className={tone.pattern}/>
            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start">
                <div className={cn("flex size-14 shrink-0 items-center justify-center rounded-2xl", tone.icon)}>
                    <Icon className="size-7"/>
                </div>
                <div className="flex-1">
                    <p className={cn("text-xs font-semibold tracking-[0.16em] uppercase", tone.eyebrow)}>Langkah berikutnya</p>
                    <h2 className={cn("mt-1 font-serif text-2xl font-semibold", tone.title)}>{step.title}</h2>
                    <p className={cn("mt-2 max-w-xl", tone.text)}>{step.text}</p>
                    {step.note && (
                        <blockquote className="mt-4 rounded-r-lg border-l-4 border-amber-400 bg-white/80 px-4 py-3 dark:bg-black/20">
                            <p className="text-xs font-semibold tracking-wider text-amber-700 uppercase dark:text-amber-300">Catatan panitia</p>
                            <p className="mt-1 whitespace-pre-line">{step.note}</p>
                        </blockquote>
                    )}
                    {step.action && <div className="mt-5">{step.action}</div>}
                </div>
            </div>
        </section>
    )
}
