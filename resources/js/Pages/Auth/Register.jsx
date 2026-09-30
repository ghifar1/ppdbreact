import React from "react";
import {Head, Link, useForm} from "@inertiajs/react";
import {CalendarClockIcon, CalendarX2Icon, UserPlusIcon} from "lucide-react";
import AuthLayout from "../../Layouts/AuthLayout";
import FieldError from "@/components/FieldError";
import PasswordInput from "@/components/PasswordInput";
import PeriodList from "@/components/PeriodList";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {cn} from "@/lib/utils";
import {jenjangStyle} from "@/lib/jenjang";

const Field = ({id, label, error, hint, className, children})=>(
    <div className={cn("grid content-start gap-2", className)}>
        <Label htmlFor={id}>
            <span>{label}<span className="ml-0.5 font-bold text-destructive">*</span></span>
        </Label>
        {children}
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        <FieldError message={error}/>
    </div>
)

/** Short availability text under each jenjang choice. */
function availability(status)
{
    if (!status?.restricted) {
        return null
    }
    if (status.open) {
        return {closed: false, text: `s.d. ${status.current.closes_label.split(',')[0]}`}
    }

    return {closed: true, text: status.next ? `Dibuka ${status.next.opens_label.split(',')[0]}` : 'Ditutup'}
}

/** Shown instead of the form when no jenjang is open. */
const Closed = ({pendaftaran})=>{

    const upcoming = pendaftaran.periods.filter(period => period.status === 'upcoming')

    return (
        <>
            <Head title="Pendaftaran ditutup"/>
            <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary">
                <CalendarX2Icon className="size-7"/>
            </div>
            <h1 className="mt-5 font-serif text-3xl font-semibold tracking-tight">Pendaftaran sedang ditutup</h1>
            <p className="mt-2 text-sm text-muted-foreground">
                {upcoming.length > 0
                    ? 'Pendaftaran akan dibuka kembali pada gelombang berikut.'
                    : 'Belum ada gelombang pendaftaran berikutnya. Pantau informasi dari panitia PPDB.'}
            </p>
            {upcoming.length > 0 && <div className="mt-6"><PeriodList periods={upcoming} compact/></div>}
            <p className="mt-8 text-sm text-muted-foreground">
                Sudah punya akun? <Link href="/login" className="font-semibold text-primary hover:underline">Masuk</Link>
            </p>
        </>
    )
}

const Register = ({jenjangOptions, jenjang, pendaftaran})=>{

    if (!jenjangOptions.some(option => pendaftaran.jenjang[option.value].open)) {
        return <Closed pendaftaran={pendaftaran}/>
    }

    return <RegisterForm jenjangOptions={jenjangOptions} jenjang={jenjang} pendaftaran={pendaftaran}/>
}

const RegisterForm = ({jenjangOptions, jenjang, pendaftaran})=>{

    const form = useForm({
        jenjang: jenjang,
        name: '',
        username: '',
        no_hp: '',
        password: '',
        password_confirmation: '',
    })

    function submit(e)
    {
        e.preventDefault()
        form.post('/register', {onFinish: () => form.reset('password', 'password_confirmation')})
    }

    const selected = form.data.jenjang ? pendaftaran.jenjang[form.data.jenjang] : null

    const input = (key, props = {}) => (
        <Input id={key} value={form.data[key]} aria-invalid={form.errors[key] ? true : undefined} className="h-10"
               onChange={e => form.setData(key, e.target.value)} {...props}/>
    )

    return (
        <>
            <Head title="Daftar"/>
            <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">Pendaftaran siswa baru</p>
            <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight">Buat akun pendaftaran</h1>
            <p className="mt-2 text-sm text-muted-foreground">
                Akun ini dipakai untuk mengisi formulir dan memantau hasil seleksi.
            </p>

            <form className="mt-8 grid gap-5" onSubmit={submit}>
                <fieldset className="grid gap-2">
                    <legend className="mb-2 text-sm font-medium">
                        Jenjang yang dituju<span className="ml-0.5 font-bold text-destructive">*</span>
                    </legend>
                    <RadioGroup id="jenjang" value={form.data.jenjang ?? ''} onValueChange={value => form.setData('jenjang', value)}
                                className="grid grid-cols-3 gap-2" aria-invalid={form.errors.jenjang ? true : undefined}>
                        {jenjangOptions.map(option => {
                            const style = jenjangStyle(option.value)
                            const state = availability(pendaftaran.jenjang[option.value])

                            return (
                                <Label key={option.value} htmlFor={`jenjang-${option.value}`}
                                       className={cn(
                                           "relative flex cursor-pointer flex-col items-start gap-1 overflow-hidden rounded-xl border-2 bg-card p-3 pt-4 font-normal transition hover:bg-accent",
                                           form.data.jenjang === option.value ? style.border : 'border-border',
                                           state?.closed && "cursor-not-allowed opacity-60 hover:bg-card",
                                       )}>
                                    <span className={cn("absolute inset-x-0 top-0 h-1.5", style.bar)}/>
                                    <RadioGroupItem value={option.value} id={`jenjang-${option.value}`} disabled={state?.closed}
                                                    className="absolute top-4 right-3"/>
                                    <span className={cn("font-serif text-2xl font-semibold", style.text)}>{option.short}</span>
                                    <span className="text-xs leading-snug text-muted-foreground">{option.label}</span>
                                    {state && (
                                        <span className={cn("mt-1 text-[11px] font-semibold leading-tight",
                                            state.closed ? "text-muted-foreground" : "text-primary")}>
                                            {state.text}
                                        </span>
                                    )}
                                </Label>
                            )
                        })}
                    </RadioGroup>
                    <FieldError message={form.errors.jenjang}/>
                </fieldset>

                <Field id="name" label="Nama lengkap calon siswa" error={form.errors.name}>
                    {input('name', {autoComplete: 'name'})}
                </Field>
                <div className="grid gap-5 sm:grid-cols-2">
                    <Field id="username" label="Username" error={form.errors.username}
                           hint="Huruf, angka, - atau _, minimal 4 karakter.">
                        {input('username', {autoComplete: 'username'})}
                    </Field>
                    <Field id="no_hp" label="No. HP / WhatsApp" error={form.errors.no_hp}>
                        {input('no_hp', {type: 'tel', autoComplete: 'tel', placeholder: '08xxxxxxxxxx'})}
                    </Field>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                    <Field id="password" label="Password" error={form.errors.password} hint="Minimal 8 karakter.">
                        <PasswordInput id="password" autoComplete="new-password" className="h-10" value={form.data.password}
                                       aria-invalid={form.errors.password ? true : undefined}
                                       onChange={e => form.setData('password', e.target.value)}/>
                    </Field>
                    <Field id="password_confirmation" label="Ulangi password" error={form.errors.password_confirmation}>
                        <PasswordInput id="password_confirmation" autoComplete="new-password" className="h-10"
                                       value={form.data.password_confirmation}
                                       onChange={e => form.setData('password_confirmation', e.target.value)}/>
                    </Field>
                </div>

                {selected?.restricted && (
                    <div className={cn("flex items-start gap-3 rounded-xl border px-4 py-3 text-sm",
                        selected.open ? "border-primary/30 bg-secondary/60 text-secondary-foreground" : "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100")}>
                        <CalendarClockIcon className="mt-0.5 size-4 shrink-0"/>
                        <p>
                            {selected.open
                                ? <>Kamu mendaftar di <b>{selected.current.name}</b>, ditutup {selected.current.closes_label}.</>
                                : selected.next
                                    ? <>Pendaftaran jenjang ini belum dibuka. <b>{selected.next.name}</b> dibuka {selected.next.opens_label}.</>
                                    : <>Pendaftaran jenjang ini sudah ditutup.</>}
                        </p>
                    </div>
                )}

                <Button type="submit" size="lg" className="mt-1 h-11" disabled={form.processing || (selected && !selected.open)}>
                    <UserPlusIcon/> {form.processing ? 'Memproses…' : 'Buat akun'}
                </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
                Sudah punya akun? <Link href="/login" className="font-semibold text-primary hover:underline">Masuk</Link>
            </p>
        </>
    )
}

Register.layout = page => <AuthLayout>{page}</AuthLayout>

export default Register
