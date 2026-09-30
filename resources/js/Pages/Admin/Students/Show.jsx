import React from "react";
import {Link, useForm} from "@inertiajs/react";
import {ArrowLeftIcon, CircleCheckIcon, FileIcon} from "lucide-react";
import AdminNav from "../../../Layouts/AdminNav";
import {PageTitle} from "../../../Layouts/PageTitle";
import StatusBadge from "@/components/StatusBadge";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Textarea} from "@/components/ui/textarea";

function formatValue(field)
{
    if (field.value && field.type === 'date') {
        const [year, month, day] = field.value.split('-').map(Number)
        return new Date(year, month - 1, day).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})
    }
    return field.value
}

const StatusForm = ({student, statusOptions})=>{

    const form = useForm({status: student.status, catatan_admin: student.catatan_admin ?? ''})

    function submit(e)
    {
        e.preventDefault()
        form.post(`/admin/siswa/${student.id}/status`, {preserveScroll: true})
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Verifikasi & hasil</CardTitle>
                <CardDescription>
                    Pilih <b>Perlu Perbaikan</b> untuk membuka kembali formulir siswa, <b>Terverifikasi</b> agar siswa bisa
                    mengunduh kartu ujian, lalu <b>Lulus</b>/<b>Tidak Lulus</b> sebagai hasil seleksi.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={submit} className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="status">Status</Label>
                        <Select value={form.data.status} onValueChange={value => form.setData('status', value)}>
                            <SelectTrigger id="status" className="w-full"><SelectValue/></SelectTrigger>
                            <SelectContent>
                                {statusOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        {form.errors.status && <p className="text-sm text-red-600 dark:text-red-400">{form.errors.status}</p>}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="catatan">
                            Catatan untuk siswa{form.data.status === 'perlu_perbaikan' && <span className="text-red-500 font-bold">*</span>}
                        </Label>
                        <Textarea id="catatan" rows={3} value={form.data.catatan_admin}
                                  placeholder="mis. Foto KK kurang jelas, mohon unggah ulang."
                                  aria-invalid={form.errors.catatan_admin ? true : undefined}
                                  onChange={e => form.setData('catatan_admin', e.target.value)}/>
                        {form.errors.catatan_admin && <p className="text-sm text-red-600 dark:text-red-400">{form.errors.catatan_admin}</p>}
                    </div>
                    <div>
                        <Button type="submit" disabled={form.processing}>Simpan status</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}

const PasswordForm = ({student})=>{

    const form = useForm({password: '', password_confirmation: ''})

    function submit(e)
    {
        e.preventDefault()
        form.post(`/admin/siswa/${student.id}/password`, {preserveScroll: true, onSuccess: () => form.reset()})
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Atur ulang password</CardTitle>
                <CardDescription>Untuk siswa yang lupa password. Beri tahu password baru ke siswa.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={submit} className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="new-password">Password baru</Label>
                        <Input id="new-password" type="password" autoComplete="new-password" value={form.data.password}
                               aria-invalid={form.errors.password ? true : undefined}
                               onChange={e => form.setData('password', e.target.value)}/>
                        {form.errors.password && <p className="text-sm text-red-600 dark:text-red-400">{form.errors.password}</p>}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="new-password-confirmation">Ulangi password baru</Label>
                        <Input id="new-password-confirmation" type="password" autoComplete="new-password"
                               value={form.data.password_confirmation}
                               onChange={e => form.setData('password_confirmation', e.target.value)}/>
                    </div>
                    <div>
                        <Button type="submit" variant="outline" disabled={form.processing}>Ganti password</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}

const Show = ({student, menus, statusOptions})=>{

    return (
        <>
            <div className="mt-6">
                <Link href="/admin/siswa" className="inline-flex items-center gap-1 text-sm text-purple-600 hover:underline dark:text-purple-400">
                    <ArrowLeftIcon className="w-4 h-4"/> Data siswa
                </Link>
            </div>
            <PageTitle>{student.name}</PageTitle>

            <div className="grid gap-6 mb-8 lg:grid-cols-3">
                <div className="grid gap-6 lg:col-span-2 content-start">
                    <Card>
                        <CardContent>
                            <dl className="grid grid-cols-3 gap-y-2 text-sm">
                                <dt className="text-muted-foreground">No. Pendaftaran</dt>
                                <dd className="col-span-2 font-mono">{student.nomor_pendaftaran}</dd>
                                <dt className="text-muted-foreground">Username</dt>
                                <dd className="col-span-2">@{student.username}</dd>
                                <dt className="text-muted-foreground">No. HP</dt>
                                <dd className="col-span-2">{student.no_hp || '-'}</dd>
                                <dt className="text-muted-foreground">Jenjang</dt>
                                <dd className="col-span-2">{student.jenjang}</dd>
                                <dt className="text-muted-foreground">Status</dt>
                                <dd className="col-span-2"><StatusBadge status={student.status} label={student.status_label}/></dd>
                                <dt className="text-muted-foreground">Mendaftar</dt>
                                <dd className="col-span-2">{student.registered_at}</dd>
                                <dt className="text-muted-foreground">Diajukan</dt>
                                <dd className="col-span-2">{student.finalized_at || 'Belum diajukan'}</dd>
                            </dl>
                        </CardContent>
                    </Card>

                    {menus.length === 0 && (
                        <Card><CardContent className="text-muted-foreground">Belum ada menu untuk jenjang ini.</CardContent></Card>
                    )}
                    {menus.map(menu => (
                        <Card key={menu.id}>
                            <CardHeader>
                                <CardTitle className="flex flex-wrap items-center gap-2">
                                    {menu.title}
                                    {menu.complete
                                        ? <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"><CircleCheckIcon/> Lengkap</Badge>
                                        : <Badge variant="outline">Belum lengkap</Badge>}
                                    {!menu.is_active && <Badge variant="outline">Disembunyikan dari siswa</Badge>}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {menu.fields.length === 0 && <p className="text-sm text-muted-foreground">Tidak ada isian.</p>}
                                <dl className="grid gap-y-3 text-sm sm:grid-cols-3">
                                    {menu.fields.map(field => (
                                        <React.Fragment key={field.id}>
                                            <dt className="text-muted-foreground">
                                                {field.label}{field.required && <span className="text-red-500">*</span>}
                                            </dt>
                                            <dd className="sm:col-span-2 whitespace-pre-line break-words">
                                                {field.file ? (
                                                    <a href={field.file.url} target="_blank" rel="noreferrer"
                                                       className="inline-flex items-center gap-1 text-purple-600 hover:underline dark:text-purple-400">
                                                        <FileIcon className="w-4 h-4"/> {field.file.name}
                                                    </a>
                                                ) : (formatValue(field) || <span className="text-muted-foreground">-</span>)}
                                            </dd>
                                        </React.Fragment>
                                    ))}
                                </dl>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-6 content-start">
                    <StatusForm key={`${student.id}-${student.status}`} student={student} statusOptions={statusOptions}/>
                    <PasswordForm student={student}/>
                </div>
            </div>
        </>
    )
}

Show.layout = page => <AdminNav>{page}</AdminNav>

export default Show
