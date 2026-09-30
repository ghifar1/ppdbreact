import React from "react";
import {usePage} from "@inertiajs/react";
import {MdAssignment, MdDashboard} from "react-icons/md";
import AppLayout from "./AppLayout";

const UserNav = ({children})=>{

    const {studentMenus} = usePage().props

    const items = [
        {title: 'Dashboard', href: '/dashboard', icon: MdDashboard, exact: true},
        ...studentMenus.map(menu => ({
            title: menu.title,
            href: `/formulir/${menu.id}`,
            icon: MdAssignment,
            complete: menu.complete,
        })),
    ]

    return (
        <AppLayout items={items} homeHref="/dashboard" brand="PPDB 2022">
            {children}
        </AppLayout>
    )
}

export default UserNav
