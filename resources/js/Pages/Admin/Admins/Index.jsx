import React, {useState} from "react";
import {router, useForm} from "@inertiajs/react";
import {KeyRoundIcon, PlusIcon, Trash2Icon} from "lucide-react";
import AdminNav from "../../../Layouts/AdminNav";
import Avatar from "@/components/Avatar";
import ConfirmDialog from "@/components/ConfirmDialog";
import FieldError from "@/components/FieldError";
import PageHeader from "@/components/PageHeader";
import PasswordInput from "@/components/PasswordInput";
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";

const Field = ({id, label, hint, error, children})=>(
    <div className="grid content-start gap-2">
        <Label htmlFor={id}>{label}</Label>
        {children}
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        <FieldError message={error}/>
    </div>
)

const PasswordFields = ({form})=>(
    <div className="grid gap-4 sm:grid-cols-2">
        <Field id="admin-password" label="Password" error={form.errors.password} hint="Minimal 8 karakter.">
            <PasswordInput id="admin-password" autoComplete="new-password" value={form.data.password}
                           aria-invalid={form.errors.password ? true : undefined}
                           onChange={e => form.setData('password', e.target.value)}/>
        </Field>
        <Field id="admin-password_confirmation" label="Ulangi password">
            <PasswordInput id="admin-password_confirmation" autoComplete="new-password" value={form.data.password_confirmation}
                           onChange={e => form.setData('password_confirmation', e.target.value)}/>
        </Field>
    </div>
)

const CreateDialog = ({open, onOpenChange})=>{

    const form = useForm({name: '', username: '', email: '', password: '', password_confirmation: ''})

    function submit(e)
    {
        e.preventDefault()
        form.post('/admin/panitia', {preserveScroll: true, onSuccess: () => { form.reset(); onOpenChange(false) }})
    }

    const input = (key, props = {}) => (
        <Input id={`admin-${key}`} value={form.data[key]} aria-invalid={form.errors[key] ? true : undefined}
               onChange={e => form.setData(key, e.target.value)} {...props}/>
    )

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <form onSubmit={submit} className="grid gap-4">
                    <DialogHeader>
                        <DialogTitle className="font-serif text-xl">Tambah akun panitia</DialogTitle>
                        <DialogDescription>Akun panitia bisa mengelola semua data pendaftaran dan pengaturan.</DialogDescription>
                    </DialogHeader>
                    <Field id="admin-name" label="Nama" error={form.errors.name}>{input('name', {autoComplete: 'off'})}</Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field id="admin-username" label="Username" error={form.errors.username} hint="Huruf, angka, - atau _.">
                            {input('username', {autoComplete: 'off'})}
                        </Field>
                        <Field id="admin-email" label="Email (opsional)" error={form.errors.email}>
                            {input('email', {type: 'email', autoComplete: 'off'})}
                        </Field>
                    </div>
                    <PasswordFields form={form}/>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
                        <Button type="submit" disabled={form.processing}>Tambah</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

const PasswordDialog = ({admin, onOpenChange})=>{

    const form = useForm({password: '', password_confirmation: ''})

    function submit(e)
    {
        e.preventDefault()
        form.post(`/admin/panitia/${admin.id}/password`, {preserveScroll: true, onSuccess: () => { form.reset(); onOpenChange(false) }})
    }

    return (
        <Dialog open={!!admin} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <form onSubmit={submit} className="grid gap-4">
                    <DialogHeader>
                        <DialogTitle className="font-serif text-xl">Atur ulang password {admin?.name}</DialogTitle>
                        <DialogDescription>Beri tahu password baru ke yang bersangkutan.</DialogDescription>
                    </DialogHeader>
                    <PasswordFields form={form}/>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
                        <Button type="submit" disabled={form.processing}>Ganti password</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

/** The committee's accounts. */
const Index = ({admins})=>{

    const [creating, setCreating] = useState(false)
    const [resetting, setResetting] = useState(null)

    return (
        <>
            <PageHeader
                eyebrow="Pengaturan"
                title="Akun Panitia"
                description="Semua akun panitia punya akses penuh ke panel ini. Ganti password akunmu sendiri di menu Akun saya."
                actions={<Button onClick={() => setCreating(true)}><PlusIcon/> Tambah panitia</Button>}
            />

            <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                <ul className="divide-y">
                    {admins.map(admin => (
                        <li key={admin.id} className="flex flex-wrap items-center gap-x-6 gap-y-3 px-4 py-4 sm:px-6">
                            <div className="flex min-w-0 flex-1 items-center gap-3">
                                <Avatar name={admin.name} src={admin.photo_url} className="size-10 rounded-full bg-primary text-sm text-primary-foreground"/>
                                <div className="min-w-0">
                                    <p className="flex flex-wrap items-center gap-2 font-semibold">
                                        {admin.name}
                                        {admin.is_me && <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">Kamu</span>}
                                    </p>
                                    <p className="truncate text-sm text-muted-foreground">@{admin.username}{admin.email && ` · ${admin.email}`}</p>
                                </div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                                <p>Dibuat {admin.created_at}</p>
                                <p>{admin.last_active ? `Aktif ${admin.last_active}` : 'Belum ada aktivitas'}</p>
                            </div>
                            <div className="flex gap-1">
                                {!admin.is_me && (
                                    <>
                                        <Button variant="ghost" size="sm" onClick={() => setResetting(admin)}><KeyRoundIcon/> Password</Button>
                                        <ConfirmDialog
                                            title={`Hapus akun ${admin.name}?`}
                                            description="Akun ini tidak bisa masuk lagi. Riwayat aktivitasnya tetap tersimpan tanpa nama."
                                            confirmLabel="Hapus akun"
                                            destructive
                                            onConfirm={() => router.delete(`/admin/panitia/${admin.id}`, {preserveScroll: true})}
                                        >
                                            <Button variant="ghost" size="icon-sm" aria-label={`Hapus ${admin.name}`}><Trash2Icon className="text-destructive"/></Button>
                                        </ConfirmDialog>
                                    </>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </section>

            <CreateDialog open={creating} onOpenChange={setCreating}/>
            <PasswordDialog admin={resetting} onOpenChange={open => !open && setResetting(null)}/>
        </>
    )
}

Index.layout = page => <AdminNav>{page}</AdminNav>

export default Index
