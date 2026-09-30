import React, {useEffect, useState} from "react";
import {CloseButton, Disclosure, DisclosureButton, DisclosurePanel} from '@headlessui/react'
import {Bars3Icon, XMarkIcon} from '@heroicons/react/24/outline'
import {Link} from "@inertiajs/react";

const navigation = [
    { name: 'Panduan', href: '/help', current: false },
]

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

const WelcomeNav = ({children})=>{

    const [scrolled, setScrolled] = useState(false)

    useEffect(()=>{
        document.querySelector('.loading')?.classList.add('gone')

        const onScroll = () => setScrolled(window.scrollY > 20)
        onScroll()
        window.addEventListener("scroll", onScroll)
        return () => window.removeEventListener("scroll", onScroll)
    }, [])

    return(
        <div className="bg-white dark:bg-black">
            <div className={classNames(
                'fixed bg-blue-700 shadow-lg sm:shadow-none rounded-b-lg transition duration-500 ease-in-out w-full top-0 z-50',
                scrolled ? 'sm:bg-blue-700' : 'sm:bg-transparent'
            )}>
                <Disclosure as="nav" className="">
                    {({ open }) => (
                        <>
                            <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
                                <div className="relative flex items-center justify-between h-16">
                                    <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                                        {/* Mobile menu button*/}
                                        <DisclosureButton className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-hidden focus:ring-2 focus:ring-inset focus:ring-white">
                                            <span className="sr-only">Open main menu</span>
                                            {open ? (
                                                <XMarkIcon className="block h-6 w-6 text-white" aria-hidden="true" />
                                            ) : (
                                                <Bars3Icon className="block h-6 w-6 text-white" aria-hidden="true" />
                                            )}
                                        </DisclosureButton>
                                    </div>
                                    <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
                                        <Link href="/">
                                            <div className="shrink-0 flex items-center">
                                                <div className="flex lg:hidden justify-center items-center">
                                                    <img
                                                        className="block lg:hidden h-8 w-auto"
                                                        src="https://tailwindui.com/img/logos/workflow-mark-indigo-500.svg"
                                                        alt="Workflow"
                                                    />
                                                </div>
                                                <div className="hidden lg:flex justify-center items-center">
                                                    <img
                                                        className="lg:block h-8 w-auto"
                                                        src="https://tailwindui.com/img/logos/workflow-logo-indigo-500-mark-white-text.svg"
                                                        alt="Workflow"
                                                    />
                                                    <p className="mx-2 font-poppins">PPDB React</p>
                                                </div>
                                            </div>

                                        </Link>
                                    </div>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                                        <div className="hidden sm:block sm:ml-6">
                                            <div className="flex space-x-4">
                                                {navigation.map((item) => (
                                                    <Link
                                                        key={item.name}
                                                        href={item.href}
                                                        className={classNames(
                                                            item.current ? 'bg-gray-900' : 'hover:bg-blue-700 hover:text-white',
                                                            scrolled ? 'text-white border-white' : 'text-blue-700 border-blue-700',
                                                            'font-poppins border-2 px-3 py-1 rounded-md text-lg font-medium'
                                                        )}
                                                        aria-current={item.current ? 'page' : undefined}
                                                    >
                                                        {item.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>


                                    </div>
                                </div>
                            </div>

                            <DisclosurePanel className="sm:hidden">
                                <div className="px-2 pt-2 pb-3 space-y-1">
                                    {navigation.map((item) => (
                                        <CloseButton
                                            as={Link}
                                            key={item.name}
                                            href={item.href}
                                            className={classNames(
                                                item.current ? 'bg-gray-900' : 'text-white font-poppins hover:bg-gray-700 hover:text-white',
                                                'block px-3 py-2 rounded-md text-base font-medium'
                                            )}
                                            aria-current={item.current ? 'page' : undefined}
                                        >
                                            {item.name}
                                        </CloseButton>
                                    ))}
                                </div>
                            </DisclosurePanel>
                        </>
                    )}
                </Disclosure>
            </div>
            <div>
                {children}
            </div>
        </div>
    )
}

export default WelcomeNav
