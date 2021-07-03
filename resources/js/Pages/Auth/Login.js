import React, {useState} from "react";
import WelcomeNav from "../../Layouts/WelcomeNav";
import {InertiaLink} from "@inertiajs/inertia-react";


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
                            src="../assets/img/login-office.jpeg"
                            alt="Office"
                        />
                        <img
                            aria-hidden="true"
                            className="hidden object-cover w-full h-full dark:block"
                            src="../assets/img/login-office-dark.jpeg"
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
                            <label className="block text-sm">
                                <span className="text-gray-700 dark:text-gray-400">Username</span>
                                <input
                                    type="text"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    placeholder=""
                                />
                            </label>
                            <label className="block mt-4 text-sm">
                                <span className="text-gray-700 dark:text-gray-400">Password</span>
                                <input
                                    type="password"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    placeholder=""
                                />
                            </label>

                            <InertiaLink
                                className="block w-full px-4 py-2 mt-4 text-sm font-medium leading-5 text-center text-white transition-colors duration-150 bg-purple-600 border border-transparent rounded-lg active:bg-purple-600 hover:bg-purple-700 focus:outline-none focus:shadow-outline-purple"
                                href="/dashboard"
                            >
                                Masuk
                            </InertiaLink>
                            <InertiaLink href="/reg"
                                className="block w-full px-4 py-2 mt-4 text-sm font-medium leading-5 text-center text-purple-600 transition-colors duration-150 border border-transparent rounded-lg active:bg-purple-600 focus:outline-none focus:shadow-outline-purple"
                            >
                                Daftar PPDB
                            </InertiaLink>

                            <hr className="my-8"/>

                            <p className="mt-4">
                                <a
                                    className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:underline"
                                    href="./forgot-password.html"
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

Login.layout = body => <WelcomeNav body={body}/>

export default Login
