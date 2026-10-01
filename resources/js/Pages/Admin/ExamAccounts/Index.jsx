import React, {useState} from "react";
import {Link, router} from "@inertiajs/react";
import {DownloadIcon, KeyRoundIcon, RefreshCwIcon, SearchIcon, SparklesIcon} from "lucide-react";
import AdminNav from "../../../Layouts/AdminNav";
import ConfirmDialog from "@/components/ConfirmDialog";
import JenjangBadge from "@/components/JenjangBadge";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";

const ALL = 'semua'

const Index = ({students, filters, jenjangOptions, missing})=>{

    const [q, setQ] = useState(filters.q)
    const apply = changes => router.get('/admin/akun-ujian', {...filters, q, ...changes}, {preserveState: true, replace: true})
    const exportUrl = '/admin/akun-ujian/unduh' + (filters.jenjang ? `?jenjang=${filters.jenjang}` : '')

    return (
        <>
            <PageHeader
                eyebrow="Pengelolaan"
                title="Akun Ujian"
                description="Akun untuk masuk ke sistem ujian (e-learning/CBT). Dibuat otomatis saat data siswa diverifikasi dan tercetak di kartu ujian. Username memakai NISN jika ada."
                actions={<>
                    {missing > 0 && (
                        <Button variant="gold" onClick={() => router.post('/admin/akun-ujian', {}, {preserveScroll: true})}>
                            <SparklesIcon/> Buat {missing} akun yang belum ada
                        </Button>
                    )}
                    <Button asChild variant="outline">
                        <a href={exportUrl}><DownloadIcon/> Unduh CSV</a>
                    </Button>
                </>}
            />

            <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                <div className="flex flex-col gap-2 border-b bg-muted/40 p-4 md:flex-row">
                    <form className="relative flex-1" onSubmit={e => { e.preventDefault(); apply({}) }}>
                        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"/>
                        <Input placeholder="Cari nama, username, atau username ujian" value={q} className="bg-background pl-9"
                               aria-label="Cari akun ujian" onChange={e => setQ(e.target.value)}/>
                    </form>
                    <Select value={filters.jenjang || ALL} onValueChange={value => apply({jenjang: value === ALL ? '' : value})}>
                        <SelectTrigger className="bg-background md:w-44" aria-label="Filter jenjang"><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL}>Semua jenjang</SelectItem>
                            {jenjangOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.short}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="pl-6">Siswa</TableHead>
                            <TableHead>Jenjang</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Username ujian</TableHead>
                            <TableHead>Password ujian</TableHead>
                            <TableHead className="pr-6 text-right"><span className="sr-only">Aksi</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {students.data.length === 0 && (
                            <TableRow className="hover:bg-transparent">
                                <TableCell colSpan={6} className="py-14 text-center text-muted-foreground">
                                    <KeyRoundIcon className="mx-auto mb-3 size-10 text-muted-foreground/60"/>
                                    Belum ada siswa terverifikasi. Akun ujian dibuat setelah data siswa diverifikasi.
                                </TableCell>
                            </TableRow>
                        )}
                        {students.data.map(student => (
                            <TableRow key={student.id}>
                                <TableCell className="pl-6">
                                    <Link href={`/admin/siswa/${student.id}`} className="font-semibold hover:text-primary hover:underline">{student.name}</Link>
                                    <span className="block font-mono text-xs text-muted-foreground">{student.nomor_pendaftaran}</span>
                                </TableCell>
                                <TableCell><JenjangBadge jenjang={student.jenjang}/></TableCell>
                                <TableCell><StatusBadge status={student.status} label={student.status_label}/></TableCell>
                                <TableCell className="font-mono">{student.exam_username ?? <span className="font-sans text-muted-foreground">Belum dibuat</span>}</TableCell>
                                <TableCell className="font-mono tracking-wider">{student.exam_password ?? '-'}</TableCell>
                                <TableCell className="pr-6 text-right">
                                    <ConfirmDialog
                                        title={student.exam_username ? `Ganti password ujian ${student.name}?` : `Buat akun ujian ${student.name}?`}
                                        description={student.exam_username
                                            ? 'Password lama tidak bisa dipakai lagi. Kartu ujian siswa ikut berubah; minta siswa mencetak ulang.'
                                            : 'Username memakai NISN siswa jika ada, atau nomor pendaftaran.'}
                                        confirmLabel={student.exam_username ? 'Ganti password' : 'Buat akun'}
                                        onConfirm={() => router.post(`/admin/siswa/${student.id}/akun-ujian`, {}, {preserveScroll: true})}
                                    >
                                        <Button variant="outline" size="sm">
                                            <RefreshCwIcon/> {student.exam_username ? 'Password baru' : 'Buat akun'}
                                        </Button>
                                    </ConfirmDialog>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {students.last_page > 1 && (
                    <nav className="flex flex-wrap items-center justify-between gap-2 border-t px-6 py-4 text-sm" aria-label="Halaman">
                        <span className="text-muted-foreground">Menampilkan {students.from}–{students.to} dari {students.total} siswa</span>
                        <div className="flex flex-wrap gap-1">
                            {students.links.map((link, i) => (
                                <Button key={i} asChild={!!link.url} size="sm" disabled={!link.url} variant={link.active ? 'default' : 'outline'}>
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
