import React, {useState} from "react";
import {Link, router} from "@inertiajs/react";
import {ChevronRightIcon, SearchIcon, UsersIcon} from "lucide-react";
import AdminNav from "../../../Layouts/AdminNav";
import JenjangBadge from "@/components/JenjangBadge";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {initials} from "@/lib/utils";

const ALL = 'semua'

const Index = ({students, filters, jenjangOptions, statusOptions})=>{

    const [q, setQ] = useState(filters.q)

    const apply = changes => router.get('/admin/siswa', {...filters, q, ...changes}, {preserveState: true, replace: true})

    return (
        <>
            <PageHeader
                eyebrow="Pengelolaan"
                title="Data Siswa"
                description={`${students.total} pendaftar sesuai filter. Klik nama siswa untuk melihat data dan memverifikasi.`}
            />

            <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                <div className="flex flex-col gap-2 border-b bg-muted/40 p-4 md:flex-row">
                    <form className="relative flex-1" onSubmit={e => { e.preventDefault(); apply({}) }}>
                        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"/>
                        <Input placeholder="Cari nama atau username, lalu tekan Enter" value={q} className="bg-background pl-9"
                               aria-label="Cari siswa" onChange={e => setQ(e.target.value)}/>
                    </form>
                    <Select value={filters.jenjang || ALL} onValueChange={value => apply({jenjang: value === ALL ? '' : value})}>
                        <SelectTrigger className="bg-background md:w-44" aria-label="Filter jenjang"><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL}>Semua jenjang</SelectItem>
                            {jenjangOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.short}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={filters.status || ALL} onValueChange={value => apply({status: value === ALL ? '' : value})}>
                        <SelectTrigger className="bg-background md:w-56" aria-label="Filter status"><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL}>Semua status</SelectItem>
                            {statusOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="pl-6">Siswa</TableHead>
                            <TableHead>No. Pendaftaran</TableHead>
                            <TableHead>Jenjang</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Tgl. Daftar</TableHead>
                            <TableHead className="pr-6 text-right"><span className="sr-only">Aksi</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {students.data.length === 0 && (
                            <TableRow className="hover:bg-transparent">
                                <TableCell colSpan={6} className="py-14 text-center text-muted-foreground">
                                    <UsersIcon className="mx-auto mb-3 size-10 text-muted-foreground/60"/>
                                    Tidak ada siswa yang cocok.
                                </TableCell>
                            </TableRow>
                        )}
                        {students.data.map(student => (
                            <TableRow key={student.id}>
                                <TableCell className="pl-6">
                                    <Link href={`/admin/siswa/${student.id}`} className="flex items-center gap-3">
                                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-primary">
                                            {initials(student.name)}
                                        </span>
                                        <span>
                                            <span className="block font-semibold hover:text-primary hover:underline">{student.name}</span>
                                            <span className="block text-xs text-muted-foreground">@{student.username}</span>
                                        </span>
                                    </Link>
                                </TableCell>
                                <TableCell className="font-mono text-xs">{student.nomor_pendaftaran}</TableCell>
                                <TableCell><JenjangBadge jenjang={student.jenjang}/></TableCell>
                                <TableCell><StatusBadge status={student.status} label={student.status_label}/></TableCell>
                                <TableCell className="text-muted-foreground">{student.registered_at}</TableCell>
                                <TableCell className="pr-6 text-right">
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={`/admin/siswa/${student.id}`}>Detail <ChevronRightIcon/></Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {students.last_page > 1 && (
                    <nav className="flex flex-wrap items-center justify-between gap-2 border-t px-6 py-4 text-sm" aria-label="Halaman">
                        <span className="text-muted-foreground">
                            Menampilkan {students.from}–{students.to} dari {students.total} siswa
                        </span>
                        <div className="flex flex-wrap gap-1">
                            {students.links.map((link, i) => (
                                <Button key={i} asChild={!!link.url} size="sm" disabled={!link.url}
                                        variant={link.active ? 'default' : 'outline'}>
                                    {link.url
                                        ? <Link href={link.url} preserveState><span dangerouslySetInnerHTML={{__html: link.label}}/></Link>
                                        : <span dangerouslySetInnerHTML={{__html: link.label}}/>}
                                </Button>
                            ))}
                        </div>
                    </nav>
                )}
            </section>
        </>
    )
}

Index.layout = page => <AdminNav>{page}</AdminNav>

export default Index
