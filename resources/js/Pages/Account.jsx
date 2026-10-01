import React, {useRef} from "react";
import {router, useForm, usePage} from "@inertiajs/react";
import {CameraIcon, KeyRoundIcon, LockIcon, Trash2Icon, UserRoundIcon} from "lucide-react";
import AdminNav from "../Layouts/AdminNav";
import UserNav from "../Layouts/UserNav";
import Avatar from "@/components/Avatar";
import ConfirmDialog from "@/components/ConfirmDialog";
import FieldError from "@/components/FieldError";
import PageHeader from "@/components/PageHeader";
import PasswordInput from "@/components/PasswordInput";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
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

const PhotoCard = ({account})=>{

    const input = useRef(null)
    const form = useForm({photo: null})

    function upload(file)
    {
        if (!file) {
            return
        }
        form.transform(() => ({photo: file}))
        form.post('/akun/foto', {preserveScroll: true, onFinish: () => { input.current.value = '' }})
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif text-lg"><CameraIcon className="size-5 text-primary"/> Foto profil</CardTitle>
                <CardDescription>
                    {account.is_admin
                        ? 'Tampil di menu akun.'
                        : 'Tampil di dashboard dan di kartu ujian sebagai pas foto. Gunakan foto formal terbaru dengan latar polos.'}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
                <Avatar name={account.name} src={account.photo_url}
                        className="size-28 rounded-2xl bg-secondary font-serif text-4xl text-primary ring-2 ring-gold/60"/>
                <div className="grid gap-2 text-center sm:text-left">
                    {account.can_change_photo ? (
                        <>
                            <input ref={input} id="photo" type="file" accept=".jpg,.jpeg,.png" className="sr-only"
                                   onChange={e => upload(e.target.files[0])}/>
                            <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                                <Button type="button" variant="outline" disabled={form.processing} onClick={() => input.current.click()}>
                                    <CameraIcon/> {account.photo_url ? 'Ganti foto' : 'Unggah foto'}
                                </Button>
                                {account.photo_url && (
                                    <ConfirmDialog title="Hapus foto profil?" confirmLabel="Hapus foto" destructive
                                                   onConfirm={() => router.delete('/akun/foto', {preserveScroll: true})}>
                                        <Button type="button" variant="ghost" className="text-destructive hover:text-destructive"><Trash2Icon/> Hapus</Button>
                                    </ConfirmDialog>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">JPG atau PNG, maksimal 2 MB.</p>
                        </>
                    ) : (
                        <p className="flex items-center gap-2 text-sm text-muted-foreground">
                            <LockIcon className="size-4 shrink-0"/> Foto tidak bisa diganti setelah data diajukan. Hubungi panitia jika perlu.
                        </p>
                    )}
                    <FieldError message={form.errors.photo}/>
                </div>
            </CardContent>
        </Card>
    )
}

const ProfileCard = ({account})=>{

    const form = useForm({name: account.name, email: account.email, no_hp: account.no_hp})

    function submit(e)
    {
        e.preventDefault()
        form.put('/akun', {preserveScroll: true})
    }

    const input = (key, props = {}) => (
        <Input id={key} value={form.data[key]} aria-invalid={form.errors[key] ? true : undefined}
               onChange={e => form.setData(key, e.target.value)} {...props}/>
    )

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif text-lg"><UserRoundIcon className="size-5 text-primary"/> Data akun</CardTitle>
                <CardDescription>Username dipakai untuk masuk dan tidak bisa diubah: <span className="font-mono font-semibold text-foreground">@{account.username}</span></CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={submit} className="grid gap-5">
                    <Field id="name" label={account.is_admin ? 'Nama' : 'Nama lengkap calon siswa'} error={form.errors.name}
                           hint={account.can_change_name ? null : 'Nama tercetak di kartu ujian dan tidak bisa diubah setelah data diajukan. Hubungi panitia jika ada kesalahan.'}>
                        {input('name', {autoComplete: 'name', disabled: !account.can_change_name})}
                    </Field>
                    <div className="grid gap-5 sm:grid-cols-2">
                        {!account.is_admin && (
                            <Field id="no_hp" label="No. HP / WhatsApp" error={form.errors.no_hp}>
                                {input('no_hp', {type: 'tel', autoComplete: 'tel'})}
                            </Field>
                        )}
                        <Field id="email" label="Email (opsional)" error={form.errors.email} hint="Bisa dipakai untuk masuk selain username.">
                            {input('email', {type: 'email', autoComplete: 'email'})}
                        </Field>
                    </div>
                    <div>
                        <Button type="submit" disabled={form.processing || !form.isDirty}>Simpan</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}

const PasswordCard = ()=>{

    const form = useForm({current_password: '', password: '', password_confirmation: ''})

    function submit(e)
    {
        e.preventDefault()
        form.put('/akun/password', {preserveScroll: true, onSuccess: () => form.reset()})
    }

    const password = (key, autoComplete) => (
        <PasswordInput id={key} autoComplete={autoComplete} value={form.data[key]}
                       aria-invalid={form.errors[key] ? true : undefined}
                       onChange={e => form.setData(key, e.target.value)}/>
    )

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif text-lg"><KeyRoundIcon className="size-5 text-primary"/> Ganti password</CardTitle>
                <CardDescription>Minimal 8 karakter. Simpan baik-baik; lupa password hanya bisa diatur ulang oleh panitia.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={submit} className="grid gap-5">
                    <Field id="current_password" label="Password lama" error={form.errors.current_password}>
                        {password('current_password', 'current-password')}
                    </Field>
                    <div className="grid gap-5 sm:grid-cols-2">
                        <Field id="password" label="Password baru" error={form.errors.password}>
                            {password('password', 'new-password')}
                        </Field>
                        <Field id="password_confirmation" label="Ulangi password baru">
                            {password('password_confirmation', 'new-password')}
                        </Field>
                    </div>
                    <div>
                        <Button type="submit" variant="outline" disabled={form.processing}>Ganti password</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}

/** Account settings for students and admins. */
const Account = ({account})=>(
    <>
        <PageHeader eyebrow="Akun" title="Akun Saya" description="Data akun, foto profil, dan password untuk masuk."/>
        <div className="grid max-w-4xl gap-6">
            <PhotoCard account={account}/>
            <ProfileCard key={account.name + account.email + account.no_hp} account={account}/>
            <PasswordCard/>
        </div>
    </>
)

/** Admins and students share this page, each inside their own navigation. */
const RoleNav = ({children})=> usePage().props.auth.user?.isAdmin
    ? <AdminNav>{children}</AdminNav>
    : <UserNav>{children}</UserNav>

Account.layout = page => <RoleNav>{page}</RoleNav>

export default Account
