import React, {Fragment, useEffect, useState} from "react";
import {Transition} from "@headlessui/react";
import {MdAddBox, MdCloudCircle} from "react-icons/md";
import Menus from "./Menus";

const MobileMenu = ({isOpen, SetIsOpen})=>{

    return (
        <div className={isOpen? 'relative': 'hidden'}>
            <Transition
                show={isOpen}
                enter="transition ease-in-out duration-500"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition ease-in-out duration-500"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
                className="fixed inset-0 z-10 flex items-end bg-black bg-opacity-50 sm:items-center sm:justify-center"
                onClick={()=> SetIsOpen(!isOpen)}
            ></Transition>
            <Transition
                show={isOpen}
                enter="transition ease-in-out duration-300"
                enterFrom="opacity-0 transform -translate-x-20"
                enterTo="opacity-100"
                leave="transition ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0 transform -translate-x-20"
                className="fixed inset-y-0 z-20 flex-shrink-0 w-64 mt-16 overflow-y-auto bg-white dark:bg-gray-800 md:hidden"
            >
                <aside>
                    <div className="py-4 text-gray-500 dark:text-gray-400"><a
                        className="ml-6 text-lg font-bold text-gray-800 dark:text-gray-200" href="#">
                        PPDB 2022
                    </a>
                        {Menus.user.map((item,i)=>{
                            return (
                                <ul className="mt-6" key={i}>
                                    <li className="relative px-6 py-3">
                                        <a className="inline-flex items-center w-full text-sm font-semibold transition-colors duration-150 hover:text-gray-800 dark:hover:text-gray-200"
                                           href="../index.html">
                                            <MdAddBox className="w-5 h-5"/>
                                            <span className="ml-4">{item.title}</span> </a>
                                    </li>
                                </ul>
                            )
                        })}
                        {/*<div className="px-6 my-6">
                            <button
                                className="flex items-center justify-between px-4 py-2 text-sm font-medium leading-5 text-white transition-colors duration-150 bg-purple-600 border border-transparent rounded-lg active:bg-purple-600 hover:bg-purple-700 focus:outline-none focus:shadow-outline-purple"> Create
                                account <span className="ml-2" aria-hidden="true">+</span></button>
                        </div>*/}
                    </div>
                </aside>
            </Transition>
        </div>
    )

}

export default MobileMenu
