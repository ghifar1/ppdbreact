import React from "react";
import WelcomeNav from "../../Layouts/WelcomeNav";
import {Link, useForm} from "@inertiajs/react";
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
        <div className="flex items-center mt-16 md:mt-0 min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
            <div
                className="flex-1 h-full max-w-4xl mx-auto overflow-hidden bg-white rounded-lg shadow-xl dark:bg-gray-800"
            >
                <div className="flex flex-col overflow-y-auto md:flex-row">
                    <div className="h-32 md:h-auto md:w-1/2">
                        <img
                            aria-hidden="true"
                            className="object-cover w-full h-full dark:hidden"
                            src="/assets/img/login-office.jpeg"
                            alt="Office"
                        />
                        <img
                            aria-hidden="true"
                            className="hidden object-cover w-full h-full dark:block"
                            src="/assets/img/login-office-dark.jpeg"
                            alt="Office"
                        />
                    </div>
                    <div className="flex items-center justify-center p-6 sm:p-12 md:w-1/2">
                        <form className="w-full" onSubmit={submit}>
                            <h1
                                className="mb-4 text-xl font-semibold text-gray-700 dark:text-gray-200"
                            >
                                Masuk ke Form Pendaftaran
                            </h1>
                            <div className="grid gap-2">
                                <Label htmlFor="username" className="text-gray-700 dark:text-gray-400">Username</Label>
                                <Input
                                    id="username"
                                    type="text"
                                    autoComplete="username"
                                    value={form.data.username}
                                    aria-invalid={form.errors.username ? true : undefined}
                                    onChange={e => form.setData('username', e.target.value)}
                                />
                                {form.errors.username && <p className="text-sm text-red-600 dark:text-red-400">{form.errors.username}</p>}
                            </div>
                            <div className="grid gap-2 mt-4">
                                <Label htmlFor="password" className="text-gray-700 dark:text-gray-400">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    autoComplete="current-password"
                                    value={form.data.password}
                                    aria-invalid={form.errors.password ? true : undefined}
                                    onChange={e => form.setData('password', e.target.value)}
                                />
                                {form.errors.password && <p className="text-sm text-red-600 dark:text-red-400">{form.errors.password}</p>}
                            </div>
                            <div className="flex items-center gap-2 mt-4">
                                <Checkbox id="remember" checked={form.data.remember}
                                          onCheckedChange={checked => form.setData('remember', checked === true)}/>
                                <Label htmlFor="remember" className="font-normal text-gray-700 dark:text-gray-400">Ingat saya</Label>
                            </div>

                            <Button type="submit" disabled={form.processing}
                                    className="w-full mt-4 bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-600">
                                Masuk
                            </Button>
                            <Button asChild variant="ghost" className="w-full mt-4 text-purple-600 hover:text-purple-700 dark:text-purple-400">
                                <Link href="/register">
                                    Daftar PPDB
                                </Link>
                            </Button>

                            <hr className="my-8"/>

                            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                                Lupa password? Hubungi panitia PPDB untuk mengatur ulang password akunmu.
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

Login.layout = page => <WelcomeNav>{page}</WelcomeNav>

export default Login
