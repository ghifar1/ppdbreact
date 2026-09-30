import React from "react";
import {Transition} from "@headlessui/react";
import {Link} from "@inertiajs/react";
import SidebarItems from "./SidebarItems";

const MobileMenu = ({isOpen, SetIsOpen, items, homeHref, brand})=>{

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
                        className="ml-6 text-lg font-bold text-gray-800 dark:text-gray-200" href={homeHref}
                        onClick={()=> SetIsOpen(false)}>
                        {brand}
                    </Link>
                        <SidebarItems items={items} onNavigate={()=> SetIsOpen(false)}/>
                    </div>
                </aside>
            </Transition>
        </>
    )

}

export default MobileMenu
