import React from "react";
import {Transition} from "@headlessui/react";
import {MdAddBox} from "react-icons/md";
import {Link} from "@inertiajs/react";
import Menus from "./Menus";

const MobileMenu = ({isOpen, SetIsOpen})=>{

    return (
        <>
            <Transition show={isOpen}>
                <div
                    className="fixed inset-0 z-10 flex items-end bg-black/50 sm:items-center sm:justify-center md:hidden transition ease-in-out duration-500 data-closed:opacity-0"
                    onClick={()=> SetIsOpen(false)}
                ></div>
            </Transition>
            <Transition show={isOpen}>
                <aside
                    className="fixed inset-y-0 z-20 shrink-0 w-64 mt-16 overflow-y-auto bg-white dark:bg-gray-800 md:hidden transition ease-in-out duration-300 data-closed:opacity-0 data-closed:-translate-x-20"
                >
                    <div className="py-4 text-gray-500 dark:text-gray-400"><Link
                        className="ml-6 text-lg font-bold text-gray-800 dark:text-gray-200" href="/dashboard"
                        onClick={()=> SetIsOpen(false)}>
                        PPDB 2022
                    </Link>
                        {Menus.user.map((item,i)=>{
                            return (
                                <ul className="mt-6" key={i}>
                                    <li className="relative px-6 py-3">
                                        <Link className="inline-flex items-center w-full text-sm font-semibold transition-colors duration-150 hover:text-gray-800 dark:hover:text-gray-200"
                                           href={item.url}
                                           onClick={()=> SetIsOpen(false)}>
                                            <MdAddBox className="w-5 h-5"/>
                                            <span className="ml-4">{item.title}</span> </Link>
                                    </li>
                                </ul>
                            )
                        })}
                        {/*<div className="px-6 my-6">
                            <button
                                className="flex items-center justify-between px-4 py-2 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-purple-600 border border-transparent rounded-lg active:bg-purple-600 hover:bg-purple-700 focus:outline-hidden focus:ring-3 focus:ring-purple-300/45"> Create
                                account <span className="ml-2" aria-hidden="true">+</span></button>
                        </div>*/}
                    </div>
                </aside>
            </Transition>
        </>
    )

}

export default MobileMenu
