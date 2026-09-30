import React from "react";
import {Head, Link, useForm} from "@inertiajs/react";
import {InfoIcon, LogInIcon} from "lucide-react";
import AuthLayout from "../../Layouts/AuthLayout";
import FieldError from "@/components/FieldError";
import PasswordInput from "@/components/PasswordInput";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";

const Login = ()=>{

    const form = useForm({
        username: '',
        password: '',
        remember: false,
    })

    function submit(e)
    {
        e.preventDefault()
        form.post('/login', {onFinish: () => form.reset('password')})
    }

    return (
        <>
            <Head title="Masuk"/>
            <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">Selamat datang kembali</p>
            <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight">Masuk ke akun PPDB</h1>
            <p className="mt-2 text-sm text-muted-foreground">
                Gunakan username dan password yang kamu buat saat mendaftar.
            </p>

            <form className="mt-8 grid gap-5" onSubmit={submit}>
                <div className="grid gap-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" type="text" autoComplete="username" autoFocus className="h-11"
                           value={form.data.username}
                           aria-invalid={form.errors.username ? true : undefined}
                           onChange={e => form.setData('username', e.target.value)}/>
                    <FieldError message={form.errors.username}/>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <PasswordInput id="password" autoComplete="current-password" className="h-11"
                                   value={form.data.password}
                                   aria-invalid={form.errors.password ? true : undefined}
                                   onChange={e => form.setData('password', e.target.value)}/>
                    <FieldError message={form.errors.password}/>
                </div>
                <div className="flex items-center gap-2">
                    <Checkbox id="remember" checked={form.data.remember}
                              onCheckedChange={checked => form.setData('remember', checked === true)}/>
                    <Label htmlFor="remember" className="font-normal">Ingat saya</Label>
                </div>

                <Button type="submit" size="lg" className="h-11" disabled={form.processing}>
                    <LogInIcon/> {form.processing ? 'Memproses…' : 'Masuk'}
                </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
                Belum punya akun? <Link href="/register" className="font-semibold text-primary hover:underline">Daftar sekarang</Link>
            </p>

            <div className="mt-8 flex gap-3 rounded-xl border border-gold/40 bg-gold-soft p-4 text-sm">
                <InfoIcon className="mt-0.5 size-4 shrink-0 text-gold-foreground dark:text-gold"/>
                <p className="text-foreground/80">
                    <b>Lupa password?</b> Hubungi panitia PPDB untuk mengatur ulang password akunmu.
                </p>
            </div>
        </>
    )
}

Login.layout = page => <AuthLayout>{page}</AuthLayout>

export default Login
