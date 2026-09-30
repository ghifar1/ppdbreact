import React from "react";
import {Link, usePage} from "@inertiajs/react";
import {MdCheckCircle} from "react-icons/md";

/**
 * Sidebar links. The current page gets a purple marker; items with
 * `complete: true` get a green check (used for the student's menus).
 */
const SidebarItems = ({items, onNavigate})=>{

    const {url} = usePage()
    const path = url.split('?')[0]

    return (
        <ul className="mt-6">
            {items.map((item)=>{
                const Icon = item.icon
                const active = item.exact ? path === item.href : path === item.href || path.startsWith(item.href + '/')

                return (
                    <li className="relative px-6 py-3" key={item.href}>
                        {active && (
                            <span className="absolute inset-y-0 left-0 w-1 bg-purple-600 rounded-tr-lg rounded-br-lg" aria-hidden="true"></span>
                        )}
                        <Link className={"inline-flex items-center w-full text-sm font-semibold transition-colors duration-150 hover:text-gray-800 dark:hover:text-gray-200 " + (active ? 'text-gray-800 dark:text-gray-100' : '')}
                              href={item.href}
                              onClick={onNavigate}>
                            {Icon && <Icon className="w-5 h-5 shrink-0"/>}
                            <span className="ml-4 flex-1">{item.title}</span>
                            {item.complete && <MdCheckCircle className="w-4 h-4 text-green-600" title="Lengkap"/>}
                        </Link>
                    </li>
                )
            })}
        </ul>
    )
}

export default SidebarItems
