import React, {useEffect, useState} from "react";
import MobileMenu from "./MobileMenu";
import Menus from "./Menus";
import {MdAddBox} from "react-icons/md";
import {Link} from "@inertiajs/react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const UserNav = ({children})=>{

    const root = window.document.documentElement
    const [isOpen, SetIsOpen] = useState(false)
    const [darkMode, SetDarkMode] = useState(()=> root.classList.contains('dark'))

    function darkToggle(darkMode)
    {
        darkMode ? root.classList.add('dark') : root.classList.remove('dark')
        SetDarkMode(darkMode)
    }

    useEffect(()=>{
        document.querySelector('.loading')?.classList.add('gone')
    }, [])

    return  (
        <div>
            <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
                <aside className="z-20 hidden w-64 overflow-y-auto bg-white dark:bg-gray-800 md:block shrink-0">
                    <div className="py-4 text-gray-500 dark:text-gray-400"><Link
                        className="ml-6 text-lg font-bold text-gray-800 dark:text-gray-200" href="/dashboard">
                        PPDB 2022
                    </Link>
                        {Menus.user.map((item,i)=>{
                            return (
                                <ul className="mt-6" key={i}>
                                    <li className="relative px-6 py-3">
                                        <Link className="inline-flex items-center w-full text-sm font-semibold transition-colors duration-150 hover:text-gray-800 dark:hover:text-gray-200"
                                           href={item.url}>
                                            <MdAddBox className="w-5 h-5"/>
                                            <span className="ml-4">{item.title}</span> </Link>
                                    </li>
                                </ul>
                            )
                        })}
                        <div className="px-6 my-6">
                            <button
                                className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-purple-600 border border-transparent rounded-lg active:bg-purple-600 hover:bg-purple-700 focus:outline-hidden focus:ring-3 focus:ring-purple-300/45"> Create
                                account <span className="ml-2" aria-hidden="true">+</span></button>
                        </div>
                    </div>
                </aside>

                <MobileMenu isOpen={isOpen} SetIsOpen={SetIsOpen}/>

                <div className="flex flex-col flex-1">
                    <header className="z-10 py-4 bg-white shadow-md dark:bg-gray-800">
                        <div
                            className="container flex items-center justify-between h-full px-6 mx-auto text-purple-600 dark:text-purple-300">
                            <button onClick={()=> SetIsOpen(!isOpen)}
                                className="p-1 -ml-1 mr-5 rounded-md md:hidden focus:outline-hidden focus:ring-3 focus:ring-purple-300/45"
                                aria-label="Menu">
                                <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd"
                                          d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                                          clipRule="evenodd"></path>
                                </svg>
                            </button>
                            <div className="flex justify-center flex-1 lg:mr-32">
                                <div className="relative w-full max-w-xl mr-6 focus-within:text-purple-500"></div>

                            </div>
                            <ul className="flex items-center shrink-0 space-x-6">
                                <li className="flex">
                                    <button
                                        onClick={()=> darkToggle(!darkMode)}
                                        className="rounded-md focus:outline-hidden focus:ring-3 focus:ring-purple-300/45"
                                        aria-label="Toggle color mode"
                                    >
                                        {darkMode ? (<svg
                                                className="w-5 h-5"
                                                aria-hidden="true"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                                                    clipRule="evenodd"
                                                ></path>
                                            </svg>) :
                                            (<svg
                                                className="w-5 h-5"
                                                aria-hidden="true"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"
                                                ></path>
                                            </svg>)}
                                    </button>
                                </li>
                                <li className="relative">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button
                                                className="relative align-middle rounded-md focus:outline-hidden focus:ring-3 focus:ring-purple-300/45"
                                                aria-label="Notifications">
                                                <svg className="w-5 h-5" aria-hidden="true" fill="currentColor"
                                                     viewBox="0 0 20 20">
                                                    <path
                                                        d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path>
                                                </svg>
                                                <span aria-hidden="true"
                                                      className="absolute top-0 right-0 inline-block w-3 h-3 translate-x-1 -translate-y-1 bg-red-600 border-2 border-white rounded-full dark:border-gray-800"></span>
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56">
                                            <DropdownMenuItem asChild className="justify-between font-semibold">
                                                <a href="#"> <span>Messages</span> <span
                                                    className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-600 bg-red-100 rounded-full dark:text-red-100 dark:bg-red-600">
                          13
                        </span> </a>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild className="justify-between font-semibold">
                                                <a href="#"> <span>Sales</span> <span
                                                    className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-600 bg-red-100 rounded-full dark:text-red-100 dark:bg-red-600">
                          2
                        </span> </a>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild className="font-semibold">
                                                <a href="#"> <span>Alerts</span> </a>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </li>
                                <li className="relative">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button
                                                className="align-middle rounded-full focus:outline-hidden focus:ring-3 focus:ring-purple-300/45"
                                                aria-label="Account"><img
                                                className="object-cover w-8 h-8 rounded-full"
                                                src="https://images.unsplash.com/photo-1502378735452-bc7d86632805?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&fit=max&s=aa3a807e1bbdfd4364d1f449eaa96d82"
                                                alt="" aria-hidden="true"/></button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56">
                                            <DropdownMenuItem asChild className="font-semibold">
                                                <a href="#">
                                                    <svg className="w-4 h-4 mr-1" aria-hidden="true" fill="none"
                                                         strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                         viewBox="0 0 24 24" stroke="currentColor">
                                                        <path
                                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                                    </svg>
                                                    <span>Profile</span> </a>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild className="font-semibold">
                                                <a href="#">
                                                    <svg className="w-4 h-4 mr-1" aria-hidden="true" fill="none"
                                                         strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                         viewBox="0 0 24 24" stroke="currentColor">
                                                        <path
                                                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                                                        <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                                    </svg>
                                                    <span>Settings</span> </a>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild className="w-full font-semibold">
                                                <Link href="/logout" method="post" as="button">
                                                    <svg className="w-4 h-4 mr-1" aria-hidden="true" fill="none"
                                                         strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                         viewBox="0 0 24 24" stroke="currentColor">
                                                        <path
                                                            d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                                                    </svg>
                                                    <span>Log out</span> </Link>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </li>
                            </ul>
                        </div>
                    </header>
                    <main className="h-full pb-16 overflow-y-auto">
                        <div className="container px-6 mx-auto grid">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}

export default UserNav
