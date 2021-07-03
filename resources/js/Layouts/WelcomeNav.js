import React, {Fragment, useEffect, useState} from "react";
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { BellIcon, MenuIcon, XIcon } from '@heroicons/react/outline'
import {InertiaLink} from "@inertiajs/inertia-react";

const loader = document.querySelector('.loading')

const onScroll = () => {
    if(window.innerWidth > 720)
    {
        const textNav = document.getElementById("text-nav")
        if(window.scrollY > 20)
        {
            document.querySelector('.fixed').classList.remove('sm:bg-transparent')
            document.querySelector('.fixed').classList.add('sm:bg-blue-700')
            textNav.classList.remove('text-blue-700')
            textNav.classList.remove('border-blue-700')
            textNav.classList.add('text-white')
            textNav.classList.add('border-white')

        } else {
            document.querySelector('.fixed').classList.remove('sm:bg-blue-700')
            document.querySelector('.fixed').classList.add('sm:bg-transparent')
            textNav.classList.remove('text-white')
            textNav.classList.remove('border-white')
            textNav.classList.add('text-blue-700')
            textNav.classList.add('border-blue-700')
        }
    } else {
        document.querySelector('.fixed').classList.add('bg-blue-400')
    }
}

const navigation = [
    { name: 'Panduan', href: '/help', current: false },
]

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

const WelcomeNav = ({body})=>{

    useEffect(()=>{
        loader.classList.add('gone')
        window.addEventListener("scroll", onScroll)
        window.addEventListener("resize", onScroll)
    }, [])

    return(
        <div className="bg-white dark:bg-black">
            <div className="fixed bg-blue-700 sm:bg-transparent shadow-lg sm:shadow-none rounded-b-lg transition duration-500 ease-in-out  w-full top-0 z-50">
                <Disclosure as="nav" className="">
                    {({ open }) => (
                        <>
                            <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
                                <div className="relative flex items-center justify-between h-16">
                                    <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                                        {/* Mobile menu button*/}
                                        <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                                            <span className="sr-only">Open main menu</span>
                                            {open ? (
                                                <XIcon className="block h-6 w-6 text-white" aria-hidden="true" />
                                            ) : (
                                                <MenuIcon className="block h-6 w-6 text-white" aria-hidden="true" />
                                            )}
                                        </Disclosure.Button>
                                    </div>
                                    <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
                                        <InertiaLink href="/">
                                            <div className="flex-shrink-0 flex items-center">
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

                                        </InertiaLink>
                                    </div>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                                        <div className="hidden sm:block sm:ml-6">
                                            <div className="flex space-x-4">
                                                {navigation.map((item) => (
                                                    <InertiaLink
                                                        key={item.name}
                                                        href={item.href}
                                                        style={{fontStyle: 'Poppins'}}
                                                        id="text-nav"
                                                        className={classNames(
                                                            item.current ? 'bg-gray-900' : 'text-blue-700 hover:bg-blue-700 hover:text-white',
                                                            'font-poppins border-2 border-blue-700 px-3 py-1 rounded-md text-lg font-medium'
                                                        )}
                                                        aria-current={item.current ? 'page' : undefined}
                                                    >
                                                        {item.name}
                                                    </InertiaLink>
                                                ))}
                                            </div>
                                        </div>


                                    </div>
                                </div>
                            </div>

                            <Disclosure.Panel className="sm:hidden">
                                <div className="px-2 pt-2 pb-3 space-y-1">
                                    {navigation.map((item) => (
                                        <Disclosure.Button>
                                        <InertiaLink
                                            key={item.name}
                                            href={item.href}
                                            className={classNames(
                                                item.current ? 'bg-gray-900' : 'text-white font-poppins hover:bg-gray-700 hover:text-white',
                                                'block px-3 py-2 rounded-md text-base font-medium'
                                            )}
                                            aria-current={item.current ? 'page' : undefined}
                                        >
                                            {item.name}
                                        </InertiaLink>
                                        </Disclosure.Button>
                                    ))}
                                </div>
                            </Disclosure.Panel>
                        </>
                    )}
                </Disclosure>
            </div>
            <div>
                {body}
            </div>
        </div>
    )
}

export default WelcomeNav
