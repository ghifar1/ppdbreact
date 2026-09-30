import React from 'react'
import {Link, router} from "@inertiajs/react";
import {CheckIcon} from "lucide-react";
import {Card, CardContent} from "@/components/ui/card";
import ConfirmDialog from "@/components/ConfirmDialog";

const editable = ['pengisian_data', 'perlu_perbaikan']

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

const Step = ({state, title, date, children})=>{

    const box = {
        current: 'text-white bg-blue-700',
        done: 'text-gray-700 bg-blue-100 dark:bg-gray-700 dark:text-gray-200',
        upcoming: 'text-gray-400 bg-blue-100 dark:bg-gray-700',
    }[state]

    return (
        <div className={"ml-5 mb-5 rounded-md p-2 " + box}>
            <p className="flex items-center gap-1 text-lg">
                {state === 'done' && <CheckIcon className="w-4 h-4 text-green-600 dark:text-green-400"/>}
                {title}
            </p>
            {date && <p className="text-xs">{date}</p>}
            <hr className={"border mr-2 rounded-lg my-1 " + (state === 'current' ? 'border-white' : 'border-gray-400')}/>
            <div className="text-sm">
                {children}
            </div>
        </div>
    )
}

export const ProgressUser = ({profil, dataLengkap, jadwal})=>{

    const current = currentStep(profil.status, dataLengkap)
    const state = index => index < current ? 'done' : index === current ? 'current' : 'upcoming'
    const canFinalize = editable.includes(profil.status) && dataLengkap

    return (
        <>
            <Card className="mb-2 shadow-md">
                <CardContent>
                    <p className="text-xl mb-2">Timeline</p>
                    <div className="container w-full h-full">
                        <div className="relative wrap overflow-hidden h-full">
                            <div className="absolute border-dashed border-blue-500 h-full border left-2" ></div>

                            <Step state={state(0)} title="Pengisian Data" date={jadwal.pengisian}>
                                Halo {profil.nama}, silakan isi semua menu di samping kiri. Menu yang sudah lengkap
                                ditandai centang hijau.
                                {profil.status === 'perlu_perbaikan' && (
                                    <p className="p-2 mt-2 rounded-md bg-orange-100 text-orange-900">
                                        <b>Admin meminta perbaikan:</b> {profil.catatan_admin}
                                    </p>
                                )}
                            </Step>

                            <Step state={state(1)} title="Pengajuan Finalisasi Data" date={jadwal.finalisasi}>
                                Ajukan Finalisasi data, nanti Admin akan mengecek datamu dalam 2x24 jam.
                                {editable.includes(profil.status) && !dataLengkap && (
                                    <p className="mt-1 text-xs">Lengkapi dulu semua isian wajib (*) di setiap menu.</p>
                                )}
                                {editable.includes(profil.status) && (
                                    <div className="flex justify-center mt-2">
                                        <ConfirmDialog
                                            title="Ajukan finalisasi data?"
                                            description="Setelah diajukan, data tidak dapat diubah lagi kecuali admin meminta perbaikan."
                                            confirmLabel="Ajukan"
                                            onConfirm={() => router.post('/finalisasi', {}, {preserveScroll: true})}
                                        >
                                            <button className="text-lg py-1 px-3 bg-blue-800 text-white rounded-lg disabled:opacity-50"
                                                    disabled={!canFinalize}>Finalisasi</button>
                                        </ConfirmDialog>
                                    </div>
                                )}
                            </Step>

                            <Step state={state(2)} title="Hasil Pengajuan Finalisasi" date={jadwal.verifikasi}>
                                {profil.status === 'menunggu_verifikasi' && 'Datamu sedang diperiksa admin.'}
                                {current > 2 && 'Data kamu sudah diverifikasi admin.'}
                            </Step>

                            <Step state={state(3)} title="Unduh Kartu Ujian" date={jadwal.kartu}>
                                {current >= 3 && (
                                    <Link href="/kartu" className="font-semibold underline">Buka kartu ujian</Link>
                                )}
                            </Step>

                            <Step state={state(4)} title="Hasil Seleksi" date={jadwal.seleksi}>
                                {profil.status === 'lulus' && <b>Selamat! Kamu dinyatakan LULUS seleksi.</b>}
                                {profil.status === 'tidak_lulus' && 'Mohon maaf, kamu dinyatakan tidak lulus seleksi.'}
                            </Step>

                        </div>

                    </div>

                </CardContent>
            </Card>
        </>
    )
}
