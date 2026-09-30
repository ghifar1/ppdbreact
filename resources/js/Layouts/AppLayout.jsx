import React, {useEffect, useState} from "react";
import {Link, usePage} from "@inertiajs/react";
import MobileMenu from "./MobileMenu";
import SidebarItems from "./SidebarItems";
import FlashMessage from "@/components/FlashMessage";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Shell shared by the student and admin areas: sidebar, header and page body.
 * `items` is a list of {title, href, icon, complete?} shown in the sidebar.
 */
const AppLayout = ({items, homeHref, brand, children})=>{

    const {auth} = usePage().props
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

    const initials = (auth.user?.name ?? '?').split(' ').filter(Boolean).slice(0, 2).map(word => word[0]).join('').toUpperCase()

    return  (
        <div>
            <div className="flex h-screen bg-gray-50 dark:bg-gray-900 print:h-auto print:bg-white">
                <aside className="z-20 hidden w-64 overflow-y-auto bg-white dark:bg-gray-800 md:block shrink-0 print:hidden">
                    <div className="py-4 text-gray-500 dark:text-gray-400"><Link
                        className="ml-6 text-lg font-bold text-gray-800 dark:text-gray-200" href={homeHref}>
                        {brand}
                    </Link>
                        <SidebarItems items={items}/>
                    </div>
                </aside>

                <MobileMenu isOpen={isOpen} SetIsOpen={SetIsOpen} items={items} homeHref={homeHref} brand={brand}/>

                <div className="flex flex-col flex-1 min-w-0">
                    <header className="z-10 py-4 bg-white shadow-md dark:bg-gray-800 print:hidden">
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
                            <div className="flex justify-center flex-1 lg:mr-32"></div>
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
                                                className="flex items-center justify-center w-8 h-8 text-sm font-semibold text-white bg-purple-600 rounded-full align-middle focus:outline-hidden focus:ring-3 focus:ring-purple-300/45"
                                                aria-label="Account">
                                                {initials}
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56">
                                            <DropdownMenuLabel>
                                                <p className="font-semibold">{auth.user?.name}</p>
                                                <p className="text-xs font-normal text-muted-foreground">
                                                    @{auth.user?.username}{auth.user?.jenjang ? ` · ${auth.user.jenjang}` : ''}
                                                </p>
                                            </DropdownMenuLabel>
                                            <DropdownMenuSeparator/>
                                            <DropdownMenuItem asChild className="w-full font-semibold">
                                                <Link href="/logout" method="post" as="button">
                                                    <svg className="w-4 h-4 mr-1" aria-hidden="true" fill="none"
                                                         strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                         viewBox="0 0 24 24" stroke="currentColor">
                                                        <path
                                                            d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                                                    </svg>
                                                    <span>Keluar</span> </Link>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </li>
                            </ul>
                        </div>
                    </header>
                    <main className="h-full pb-16 overflow-y-auto print:overflow-visible print:pb-0">
                        <div className="container px-6 mx-auto grid">
                            <FlashMessage/>
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}

export default AppLayout
