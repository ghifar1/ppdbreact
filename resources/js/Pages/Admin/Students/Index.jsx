import React, {useState} from "react";
import {Link, router} from "@inertiajs/react";
import {SearchIcon} from "lucide-react";
import AdminNav from "../../../Layouts/AdminNav";
import {PageTitle} from "../../../Layouts/PageTitle";
import StatusBadge from "@/components/StatusBadge";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";

const ALL = 'semua'

const Index = ({students, filters, jenjangOptions, statusOptions})=>{

    const [q, setQ] = useState(filters.q)

    const apply = changes => router.get('/admin/siswa', {...filters, q, ...changes}, {preserveState: true, replace: true})

    return (
        <>
            <PageTitle>Data Siswa</PageTitle>

            <Card className="mb-8">
                <CardContent className="grid gap-4">
                    <div className="flex flex-col gap-2 md:flex-row">
                        <form className="flex flex-1 gap-2" onSubmit={e => { e.preventDefault(); apply({}) }}>
                            <Input placeholder="Cari nama atau username" value={q} onChange={e => setQ(e.target.value)}/>
                            <Button type="submit" variant="outline" aria-label="Cari"><SearchIcon/></Button>
                        </form>
                        <Select value={filters.jenjang || ALL} onValueChange={value => apply({jenjang: value === ALL ? '' : value})}>
                            <SelectTrigger className="md:w-48" aria-label="Filter jenjang"><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>Semua jenjang</SelectItem>
                                {jenjangOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.short}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={filters.status || ALL} onValueChange={value => apply({status: value === ALL ? '' : value})}>
                            <SelectTrigger className="md:w-56" aria-label="Filter status"><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>Semua status</SelectItem>
                                {statusOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>No. Pendaftaran</TableHead>
                                <TableHead>Nama</TableHead>
                                <TableHead>Username</TableHead>
                                <TableHead>Jenjang</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Tgl. Daftar</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.data.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                                        Tidak ada siswa yang cocok.
                                    </TableCell>
                                </TableRow>
                            )}
                            {students.data.map(student => (
                                <TableRow key={student.id}>
                                    <TableCell className="font-mono text-xs">{student.nomor_pendaftaran}</TableCell>
                                    <TableCell className="font-medium">{student.name}</TableCell>
                                    <TableCell>@{student.username}</TableCell>
                                    <TableCell>{student.jenjang}</TableCell>
                                    <TableCell><StatusBadge status={student.status} label={student.status_label}/></TableCell>
                                    <TableCell>{student.registered_at}</TableCell>
                                    <TableCell className="text-right">
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/admin/siswa/${student.id}`}>Detail</Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {students.last_page > 1 && (
                        <nav className="flex flex-wrap items-center justify-between gap-2 text-sm">
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
                </CardContent>
            </Card>
        </>
    )
}

Index.layout = page => <AdminNav>{page}</AdminNav>

export default Index
