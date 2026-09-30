import React from "react";
import {useForm} from "@inertiajs/react";
import {CircleCheckIcon, FileIcon, KeyRoundIcon, ShieldCheckIcon} from "lucide-react";
import AdminNav from "../../../Layouts/AdminNav";
import FieldError from "@/components/FieldError";
import JenjangBadge from "@/components/JenjangBadge";
import PageHeader from "@/components/PageHeader";
import PasswordInput from "@/components/PasswordInput";
import StatusBadge from "@/components/StatusBadge";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Textarea} from "@/components/ui/textarea";
import {initials} from "@/lib/utils";

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
        <Card className="border-primary/30">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif text-lg"><ShieldCheckIcon className="size-5 text-primary"/> Verifikasi & hasil</CardTitle>
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
                        <FieldError message={form.errors.status}/>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="catatan">
                            Catatan untuk siswa{form.data.status === 'perlu_perbaikan' && <span className="font-bold text-destructive">*</span>}
                        </Label>
                        <Textarea id="catatan" rows={3} value={form.data.catatan_admin}
                                  placeholder="mis. Foto KK kurang jelas, mohon unggah ulang."
                                  aria-invalid={form.errors.catatan_admin ? true : undefined}
                                  onChange={e => form.setData('catatan_admin', e.target.value)}/>
                        <FieldError message={form.errors.catatan_admin}/>
                    </div>
                    <div>
                        <Button type="submit" className="w-full" disabled={form.processing}>Simpan status</Button>
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
                <CardTitle className="flex items-center gap-2 font-serif text-lg"><KeyRoundIcon className="size-5 text-primary"/> Atur ulang password</CardTitle>
                <CardDescription>Untuk siswa yang lupa password. Beri tahu password baru ke siswa.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={submit} className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="new-password">Password baru</Label>
                        <PasswordInput id="new-password" autoComplete="new-password" value={form.data.password}
                               aria-invalid={form.errors.password ? true : undefined}
                               onChange={e => form.setData('password', e.target.value)}/>
                        <FieldError message={form.errors.password}/>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="new-password-confirmation">Ulangi password baru</Label>
                        <PasswordInput id="new-password-confirmation" autoComplete="new-password"
                               value={form.data.password_confirmation}
                               onChange={e => form.setData('password_confirmation', e.target.value)}/>
                    </div>
                    <div>
                        <Button type="submit" variant="outline" className="w-full" disabled={form.processing}>Ganti password</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}

const Show = ({student, menus, statusOptions})=>{

    const complete = menus.filter(menu => menu.complete).length

    return (
        <>
            <PageHeader
                back={{href: '/admin/siswa', label: 'Data siswa'}}
                eyebrow={student.nomor_pendaftaran}
                title={student.name}
                actions={<StatusBadge status={student.status} label={student.status_label} className="px-3 py-1 text-sm"/>}
            />

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="grid content-start gap-6 lg:col-span-2">
                    <section className="flex flex-col gap-5 rounded-2xl border bg-card p-6 shadow-sm sm:flex-row sm:items-center">
                        <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-secondary font-serif text-2xl font-semibold text-primary ring-2 ring-gold/60">
                            {initials(student.name)}
                        </div>
                        <dl className="grid flex-1 grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
                            <div><dt className="text-muted-foreground">Username</dt><dd className="font-medium">@{student.username}</dd></div>
                            <div><dt className="text-muted-foreground">No. HP</dt><dd className="font-medium">{student.no_hp || '-'}</dd></div>
                            <div><dt className="text-muted-foreground">Jenjang</dt><dd><JenjangBadge jenjang={student.jenjang_kode}>{student.jenjang}</JenjangBadge></dd></div>
                            <div><dt className="text-muted-foreground">Mendaftar</dt><dd className="font-medium">{student.registered_at}</dd></div>
                            <div><dt className="text-muted-foreground">Diajukan</dt><dd className="font-medium">{student.finalized_at || 'Belum diajukan'}</dd></div>
                            <div><dt className="text-muted-foreground">Formulir lengkap</dt><dd className="font-medium">{complete} dari {menus.length}</dd></div>
                            {student.legacy_id && (
                                <div><dt className="text-muted-foreground">Asal data</dt><dd className="font-medium">PPDB lama (ID {student.legacy_id})</dd></div>
                            )}
                        </dl>
                    </section>

                    {menus.length === 0 && (
                        <Card><CardContent className="text-muted-foreground">Belum ada menu untuk jenjang ini.</CardContent></Card>
                    )}
                    {menus.map(menu => (
                        <section key={menu.id} className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                            <div className="flex flex-wrap items-center gap-2 border-b px-6 py-4">
                                <h2 className="mr-auto font-serif text-lg font-semibold">{menu.title}</h2>
                                {!menu.is_active && <Badge variant="outline">Disembunyikan dari siswa</Badge>}
                                {menu.complete
                                    ? <Badge className="bg-secondary text-primary"><CircleCheckIcon/> Lengkap</Badge>
                                    : <Badge variant="outline" className="border-amber-300 text-amber-800 dark:border-amber-800 dark:text-amber-300">Belum lengkap</Badge>}
                            </div>
                            <div className="px-6 py-2">
                                {menu.fields.length === 0 && <p className="py-3 text-sm text-muted-foreground">Tidak ada isian.</p>}
                                <dl className="divide-y text-sm">
                                    {menu.fields.map(field => (
                                        <div key={field.id} className="grid gap-1 py-3 sm:grid-cols-3 sm:gap-4">
                                            <dt className="text-muted-foreground">
                                                {field.label}{field.required && <span className="text-destructive">*</span>}
                                            </dt>
                                            <dd className="font-medium break-words whitespace-pre-line sm:col-span-2">
                                                {field.file ? (
                                                    <a href={field.file.url} target="_blank" rel="noreferrer"
                                                       className="inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-1.5 text-secondary-foreground hover:underline">
                                                        <FileIcon className="size-4"/> {field.file.name}
                                                    </a>
                                                ) : (formatValue(field) || <span className="font-normal text-muted-foreground">-</span>)}
                                            </dd>
                                        </div>
                                    ))}
                                </dl>
                            </div>
                        </section>
                    ))}
                </div>

                <div className="grid content-start gap-6 lg:sticky lg:top-22">
                    <StatusForm key={`${student.id}-${student.status}`} student={student} statusOptions={statusOptions}/>
                    <PasswordForm student={student}/>
                </div>
            </div>
        </>
    )
}

Show.layout = page => <AdminNav>{page}</AdminNav>

export default Show
