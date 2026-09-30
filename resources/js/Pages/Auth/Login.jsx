import React, {useState} from "react";
import WelcomeNav from "../../Layouts/WelcomeNav";
import {Link} from "@inertiajs/react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";


const Login = ()=>{

    const [username, SetUsername] = useState('')
    const [password, SetPassword] = useState('')

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
                        <div className="w-full">
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
                                    value={username}
                                    onChange={e => SetUsername(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2 mt-4">
                                <Label htmlFor="password" className="text-gray-700 dark:text-gray-400">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={e => SetPassword(e.target.value)}
                                />
                            </div>

                            <Button asChild className="w-full mt-4 bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-600">
                                <Link href="/dashboard">
                                    Masuk
                                </Link>
                            </Button>
                            <Button asChild variant="ghost" className="w-full mt-4 text-purple-600 hover:text-purple-700 dark:text-purple-400">
                                <Link href="/reg">
                                    Daftar PPDB
                                </Link>
                            </Button>

                            <hr className="my-8"/>

                            <p className="mt-4">
                                <a
                                    className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline"
                                    href="/password/reset"
                                >
                                    Saya lupa password
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

Login.layout = page => <WelcomeNav>{page}</WelcomeNav>

export default Login
