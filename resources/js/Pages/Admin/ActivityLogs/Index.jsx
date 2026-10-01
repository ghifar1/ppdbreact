import React, {useState} from "react";
import {router} from "@inertiajs/react";
import {SearchIcon} from "lucide-react";
import AdminNav from "../../../Layouts/AdminNav";
import ActivityList from "@/components/ActivityList";
import PageHeader from "@/components/PageHeader";
import Pagination from "@/components/Pagination";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

const ALL = 'semua'

const Index = ({logs, filters})=>{

    const [q, setQ] = useState(filters.q)
    const apply = changes => router.get('/admin/log', {...filters, q, ...changes}, {preserveState: true, replace: true})

    return (
        <>
            <PageHeader
                eyebrow="Pendaftar"
                title="Log Aktivitas"
                description="Semua yang dilakukan siswa, pendaftar dan panitia: pendaftaran, pengisian formulir, finalisasi, pembayaran, verifikasi dan perubahan pengaturan."
            />

            <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                <div className="flex flex-col gap-2 border-b bg-muted/40 p-4 md:flex-row">
                    <form className="relative flex-1" onSubmit={e => { e.preventDefault(); apply({}) }}>
                        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"/>
                        <Input placeholder="Cari nama atau aktivitas, lalu tekan Enter" value={q} className="bg-background pl-9"
                               aria-label="Cari aktivitas" onChange={e => setQ(e.target.value)}/>
                    </form>
                    <Select value={filters.oleh || ALL} onValueChange={value => apply({oleh: value === ALL ? '' : value})}>
                        <SelectTrigger className="bg-background md:w-48" aria-label="Dilakukan oleh"><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL}>Semua pelaku</SelectItem>
                            <SelectItem value="panitia">Panitia</SelectItem>
                            <SelectItem value="siswa">Siswa</SelectItem>
                            <SelectItem value="pendaftar">Pendaftar / sistem</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input type="date" value={filters.tanggal} className="bg-background md:w-44" aria-label="Tanggal"
                           onChange={e => apply({tanggal: e.target.value})}/>
                </div>

                <ActivityList logs={logs.data} empty="Tidak ada aktivitas yang cocok."/>
                <Pagination page={logs} noun="aktivitas"/>
            </section>
        </>
    )
}

Index.layout = page => <AdminNav>{page}</AdminNav>

export default Index
