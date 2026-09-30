import React from 'react'
import {usePage} from "@inertiajs/react";
import JenjangBadge from "@/components/JenjangBadge";
import Pattern from "@/components/Pattern";
import SchoolLogo from "@/components/SchoolLogo";
import StatusBadge from "@/components/StatusBadge";
import {initials} from "@/lib/utils";

/** The student's details, styled after a school ID card. */
export const ProfileCard = ({profil})=>{

    const {sekolah} = usePage().props

    return (
        <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
            <div className="relative overflow-hidden bg-panel px-5 py-4 text-panel-foreground">
                <Pattern className="text-white/10" size={40}/>
                <div className="relative flex items-center gap-3">
                    <SchoolLogo className="h-10 w-9"/>
                    <div className="min-w-0 leading-tight">
                        <p className="text-[10px] font-semibold tracking-[0.2em] text-gold uppercase">Kartu Pendaftar</p>
                        <p className="truncate font-serif font-semibold">{sekolah.nama}</p>
                    </div>
                </div>
            </div>
            <div className="p-5">
                <div className="flex items-center gap-4">
                    <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-secondary font-serif text-2xl font-semibold text-primary ring-2 ring-gold/60">
                        {initials(profil.nama)}
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-lg font-semibold">{profil.nama}</p>
                        <p className="text-sm text-muted-foreground">@{profil.username}</p>
                        <JenjangBadge jenjang={profil.jenjang_kode} className="mt-1">{profil.jenjang}</JenjangBadge>
                    </div>
                </div>
                <dl className="mt-5 grid gap-3 border-t border-dashed pt-4 text-sm">
                    <div className="flex items-center justify-between gap-3">
                        <dt className="text-muted-foreground">No. Pendaftaran</dt>
                        <dd className="font-mono font-semibold">{profil.nomor_pendaftaran}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                        <dt className="text-muted-foreground">Status</dt>
                        <dd><StatusBadge status={profil.status} label={profil.status_label}/></dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                        <dt className="text-muted-foreground">No. HP</dt>
                        <dd>{profil.no_hp || '-'}</dd>
                    </div>
                </dl>
            </div>
        </div>
    )
}
