import React from "react";
import {MdDashboard, MdPeople, MdViewList} from "react-icons/md";
import AppLayout from "./AppLayout";

const items = [
    {title: 'Dashboard', href: '/admin', icon: MdDashboard, exact: true},
    {title: 'Menu & Formulir', href: '/admin/menu', icon: MdViewList},
    {title: 'Data Siswa', href: '/admin/siswa', icon: MdPeople},
]

const AdminNav = ({children})=>{

    return (
        <AppLayout items={items} homeHref="/admin" brand="Admin PPDB">
            {children}
        </AppLayout>
    )
}

export default AdminNav
