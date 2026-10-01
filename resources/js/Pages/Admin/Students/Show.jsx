import React, {useState} from "react";
import {Link, router, useForm} from "@inertiajs/react";
import {
    BanknoteIcon,
    CircleCheckIcon,
    FileIcon,
    HandCoinsIcon,
    HistoryIcon,
    KeyRoundIcon,
    MonitorCheckIcon,
    PrinterIcon,
    RefreshCwIcon,
    ShieldCheckIcon,
} from "lucide-react";
import AdminNav from "../../../Layouts/AdminNav";
import {ConfirmPaymentButton, ProofButton, RejectPaymentButton} from "../Payments/PaymentActions";
import ActivityList from "@/components/ActivityList";
import Avatar from "@/components/Avatar";
import ConfirmDialog from "@/components/ConfirmDialog";
import FieldError from "@/components/FieldError";
import JenjangBadge from "@/components/JenjangBadge";
import PageHeader from "@/components/PageHeader";
import PasswordInput from "@/components/PasswordInput";
import PaymentStatusBadge from "@/components/PaymentStatusBadge";
import RupiahInput from "@/components/RupiahInput";
import StatusBadge from "@/components/StatusBadge";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
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

const ExamAccountCard = ({student})=>{

    const hasAccount = !!student.exam_username
    const submit = () => router.post(`/admin/siswa/${student.id}/akun-ujian`, {}, {preserveScroll: true})

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif text-lg"><MonitorCheckIcon className="size-5 text-primary"/> Akun ujian</CardTitle>
                <CardDescription>Login sistem ujian (e-learning/CBT), tercetak di kartu ujian siswa.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                {!student.exam_eligible && !hasAccount ? (
                    <p className="text-sm text-muted-foreground">Dibuat otomatis saat status siswa diubah menjadi Terverifikasi.</p>
                ) : hasAccount ? (
                    <dl className="grid gap-2 rounded-lg border bg-muted/40 p-3 text-sm">
                        <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Username</dt><dd className="font-mono font-semibold">{student.exam_username}</dd></div>
                        <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Password</dt><dd className="font-mono font-semibold tracking-wider">{student.exam_password}</dd></div>
                    </dl>
                ) : (
                    <p className="text-sm text-muted-foreground">Belum ada akun ujian.</p>
                )}
                {student.exam_eligible && (
                    <ConfirmDialog
                        title={hasAccount ? 'Ganti password ujian?' : 'Buat akun ujian?'}
                        description={hasAccount ? 'Password lama tidak bisa dipakai lagi. Minta siswa mencetak ulang kartu ujian.' : 'Username memakai NISN siswa jika ada.'}
                        confirmLabel={hasAccount ? 'Ganti password' : 'Buat akun'}
                        onConfirm={submit}
                    >
                        <Button variant="outline" className="w-full"><RefreshCwIcon/> {hasAccount ? 'Buat password baru' : 'Buat akun ujian'}</Button>
                    </ConfirmDialog>
                )}
            </CardContent>
        </Card>
    )
}

/** Record a registration fee paid at the school, or a transfer the student showed the committee. */
const RecordPaymentButton = ({student, fee})=>{

    const [open, setOpen] = useState(false)
    const form = useForm({amount: fee ? String(fee) : '', method: 'tunai', note: ''})

    function submit(e)
    {
        e.preventDefault()
        form.post(`/admin/siswa/${student.id}/pembayaran`, {preserveScroll: true, onSuccess: () => setOpen(false)})
    }

    return (
        <>
            <Button variant="outline" className="w-full" onClick={() => setOpen(true)}><HandCoinsIcon/> Catat pembayaran</Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-md">
                    <form onSubmit={submit} className="grid gap-4">
                        <DialogHeader>
                            <DialogTitle className="font-serif text-xl">Catat pembayaran {student.name}</DialogTitle>
                            <DialogDescription>Untuk pembayaran yang sudah diperiksa panitia di luar aplikasi. Pembayaran langsung tercatat lunas.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid content-start gap-2">
                                <Label htmlFor="pay-amount">Jumlah</Label>
                                <RupiahInput id="pay-amount" value={form.data.amount} aria-invalid={form.errors.amount ? true : undefined}
                                             onChange={value => form.setData('amount', value)}/>
                                <FieldError message={form.errors.amount}/>
                            </div>
                            <div className="grid content-start gap-2">
                                <Label htmlFor="pay-method">Cara bayar</Label>
                                <Select value={form.data.method} onValueChange={value => form.setData('method', value)}>
                                    <SelectTrigger id="pay-method" className="w-full"><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="tunai">Tunai di sekolah</SelectItem>
                                        <SelectItem value="transfer">Transfer</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FieldError message={form.errors.method}/>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="pay-note">Catatan (opsional)</Label>
                            <Input id="pay-note" value={form.data.note} placeholder="mis. Kuitansi no. 12, diterima Bu Siti"
                                   onChange={e => form.setData('note', e.target.value)}/>
                            <FieldError message={form.errors.note}/>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={form.processing}>Catat lunas</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}

const PaymentCard = ({student, payment})=>{

    const record = payment.record

    if (!payment.required && !record) {
        return null
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif text-lg"><BanknoteIcon className="size-5 text-primary"/> Pembayaran</CardTitle>
                <CardDescription>
                    {payment.required ? <>Biaya pendaftaran {payment.fee_label}. Siswa bisa diverifikasi setelah lunas.</> : 'Tidak ada biaya pendaftaran untuk siswa ini.'}
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="flex items-center justify-between gap-3">
                    <PaymentStatusBadge status={record?.status ?? 'belum'} label={record?.status_label ?? 'Belum bayar'}/>
                    {record && <ProofButton proof={record.proof} title={student.name}/>}
                </div>
                {record && (
                    <dl className="grid gap-2 rounded-lg border bg-muted/40 p-3 text-sm">
                        {record.amount_label && <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Jumlah</dt><dd className="font-semibold">{record.amount_label}</dd></div>}
                        <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Cara bayar</dt><dd>{record.method_label}</dd></div>
                        {record.sender_name && <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Pengirim</dt><dd className="text-right">{record.sender_name}</dd></div>}
                        {record.submitted_at && <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Dikirim</dt><dd>{record.submitted_at}</dd></div>}
                        {record.reviewed_at && (
                            <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Diperiksa</dt><dd className="text-right">{record.reviewed_at}{record.reviewer && ` oleh ${record.reviewer}`}</dd></div>
                        )}
                        {record.note && <div className="grid gap-0.5"><dt className="text-muted-foreground">Catatan</dt><dd className="whitespace-pre-line">{record.note}</dd></div>}
                    </dl>
                )}
                {record?.proof && record.status !== 'diterima' && (
                    <div className="grid grid-cols-2 gap-2">
                        <ConfirmPaymentButton payment={record} size="default"/>
                        {record.status !== 'ditolak' && <RejectPaymentButton payment={record} studentName={student.name} size="default"/>}
                    </div>
                )}
                {record?.status === 'diterima' && record.method === 'transfer' && (
                    <RejectPaymentButton payment={record} studentName={student.name} size="default"/>
                )}
                {payment.required && record?.status !== 'diterima' && <RecordPaymentButton student={student} fee={payment.fee}/>}
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
                <CardDescription>Untuk siswa yang lupa password, atau mendaftar di sekolah dan perlu kartu login.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5">
                <ConfirmDialog
                    title="Buat password baru dan cetak kartu login?"
                    description="Password lama tidak bisa dipakai lagi. Kartu login berisi username dan password baru siswa."
                    confirmLabel="Buat password baru"
                    onConfirm={() => router.post(`/admin/siswa/${student.id}/kartu-login`)}
                >
                    <Button variant="outline" className="w-full"><PrinterIcon/> Cetak kartu login</Button>
                </ConfirmDialog>
                <p className="flex items-center gap-3 text-xs text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">atau tentukan sendiri</p>
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

const Show = ({student, menus, statusOptions, payment, activity})=>{

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
                        <Avatar name={student.name} src={student.photo_url}
                                className="size-20 rounded-xl bg-secondary font-serif text-2xl text-primary ring-2 ring-gold/60"/>
                        <dl className="grid flex-1 grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
                            <div><dt className="text-muted-foreground">Username</dt><dd className="font-medium">@{student.username}</dd></div>
                            <div><dt className="text-muted-foreground">No. HP</dt><dd className="font-medium">{student.no_hp || '-'}</dd></div>
                            {student.email && <div className="min-w-0"><dt className="text-muted-foreground">Email</dt><dd className="truncate font-medium">{student.email}</dd></div>}
                            <div><dt className="text-muted-foreground">Jenjang</dt><dd><JenjangBadge jenjang={student.jenjang_kode}>{student.jenjang}</JenjangBadge></dd></div>
                            <div><dt className="text-muted-foreground">Mendaftar</dt><dd className="font-medium">{student.registered_at}</dd></div>
                            <div><dt className="text-muted-foreground">Diajukan</dt><dd className="font-medium">{student.finalized_at || 'Belum diajukan'}</dd></div>
                            <div><dt className="text-muted-foreground">Formulir lengkap</dt><dd className="font-medium">{complete} dari {menus.length}</dd></div>
                            <div><dt className="text-muted-foreground">Gelombang</dt><dd className="font-medium">{student.gelombang || '-'}</dd></div>
                            <div><dt className="text-muted-foreground">No. Peserta</dt><dd className="font-mono font-medium">{student.nomor_peserta || '-'}</dd></div>
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

                    <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                        <div className="flex flex-wrap items-center gap-2 border-b px-6 py-4">
                            <h2 className="mr-auto flex items-center gap-2 font-serif text-lg font-semibold"><HistoryIcon className="size-5 text-primary"/> Riwayat aktivitas</h2>
                            <Link href={`/admin/log?q=${encodeURIComponent(student.name)}`} className="text-sm font-medium text-primary hover:underline">Lihat semua</Link>
                        </div>
                        <ActivityList logs={activity} empty="Belum ada aktivitas tercatat." showSubject={false}/>
                    </section>
                </div>

                <div className="grid content-start gap-6 lg:sticky lg:top-22">
                    <StatusForm key={`${student.id}-${student.status}`} student={student} statusOptions={statusOptions}/>
                    <PaymentCard student={student} payment={payment}/>
                    <ExamAccountCard student={student}/>
                    <PasswordForm student={student}/>
                </div>
            </div>
        </>
    )
}

Show.layout = page => <AdminNav>{page}</AdminNav>

export default Show
