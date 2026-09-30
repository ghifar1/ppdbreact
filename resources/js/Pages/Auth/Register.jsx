import React from "react";
import WelcomeNav from "../../Layouts/WelcomeNav";
import {Link, useForm} from "@inertiajs/react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

const Field = ({id, label, error, children})=>(
    <div className="grid gap-2 mt-4">
        <Label htmlFor={id} className="text-gray-700 dark:text-gray-400">
            <span>{label}</span><span className="text-red-500 font-bold">*</span>
        </Label>
        {children}
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
)

const Register = ({jenjangOptions, jenjang})=>{

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

    const input = (key, props = {}) => (
        <Input id={key} value={form.data[key]} aria-invalid={form.errors[key] ? true : undefined}
               onChange={e => form.setData(key, e.target.value)} {...props}/>
    )

    return(
        <div className="flex items-center mt-16 md:mt-0 min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
            <div className="flex-1 max-w-lg mx-auto overflow-hidden bg-white rounded-lg shadow-xl dark:bg-gray-800">
                <form className="p-6 sm:p-10" onSubmit={submit}>
                    <h1 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
                        Daftar PPDB
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Buat akun untuk mengisi formulir pendaftaran.
                    </p>

                    <Field id="jenjang" label="Jenjang" error={form.errors.jenjang}>
                        <Select value={form.data.jenjang} onValueChange={value => form.setData('jenjang', value)}>
                            <SelectTrigger id="jenjang" className="w-full" aria-invalid={form.errors.jenjang ? true : undefined}>
                                <SelectValue placeholder="Pilih jenjang"/>
                            </SelectTrigger>
                            <SelectContent>
                                {jenjangOptions.map(option => (
                                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>
                    <Field id="name" label="Nama Lengkap" error={form.errors.name}>
                        {input('name', {autoComplete: 'name'})}
                    </Field>
                    <Field id="username" label="Username" error={form.errors.username}>
                        {input('username', {autoComplete: 'username'})}
                        <p className="text-xs text-muted-foreground">Huruf, angka, - atau _, minimal 4 karakter. Dipakai untuk masuk.</p>
                    </Field>
                    <Field id="no_hp" label="No. HP" error={form.errors.no_hp}>
                        {input('no_hp', {type: 'tel', autoComplete: 'tel'})}
                    </Field>
                    <Field id="password" label="Password" error={form.errors.password}>
                        {input('password', {type: 'password', autoComplete: 'new-password'})}
                    </Field>
                    <Field id="password_confirmation" label="Ulangi Password" error={form.errors.password_confirmation}>
                        {input('password_confirmation', {type: 'password', autoComplete: 'new-password'})}
                    </Field>

                    <Button type="submit" disabled={form.processing}
                            className="w-full mt-6 bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-600">
                        Daftar
                    </Button>
                    <p className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
                        Sudah punya akun? <Link href="/login" className="font-medium text-purple-600 hover:underline dark:text-purple-400">Masuk</Link>
                    </p>
                </form>
            </div>
        </div>
    )

}

Register.layout = page => <WelcomeNav>{page}</WelcomeNav>

export default Register
