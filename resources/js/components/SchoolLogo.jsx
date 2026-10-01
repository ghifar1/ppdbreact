import React from "react";
import {usePage} from "@inertiajs/react";
import {cn} from "@/lib/utils";

/**
 * Default crest: a green shield with a gold eight-pointed star over an open book.
 */
export const Crest = ({className})=>(
    <svg viewBox="0 0 64 72" className={cn("shrink-0", className)} aria-hidden="true">
        <path d="M32 2.5 59.5 10.5V34C59.5 51.5 47 63.5 32 69.5 17 63.5 4.5 51.5 4.5 34V10.5Z"
              fill="#0f5a41" stroke="#d4a72c" strokeWidth="3" strokeLinejoin="round"/>
        <path d="M32 8.5 54 15V34C54 48 44 58 32 63.5 20 58 10 48 10 34V15Z"
              fill="none" stroke="#d4a72c" strokeOpacity=".45" strokeWidth="1"/>
        <path d="M24.9 18.9H39.1V33.1H24.9Z" fill="#e3b341"/>
        <path d="M32 16 42 26 32 36 22 26Z" fill="#e3b341"/>
        <circle cx="32" cy="26" r="3.2" fill="#0f5a41"/>
        <path d="M15.5 44.5C21 41.8 27 42 32 45V57.5C27 54.5 21 54.3 15.5 57Z" fill="#faf6ea"/>
        <path d="M48.5 44.5C43 41.8 37 42 32 45V57.5C37 54.5 43 54.3 48.5 57Z" fill="#f1ead4"/>
        <path d="M32 45V57.5" stroke="#0f5a41" strokeWidth="1.2"/>
    </svg>
)

/**
 * The school's logo (PPDB_LOGO) when configured, otherwise the crest.
 */
const SchoolLogo = ({className})=>{

    const {sekolah} = usePage().props

    if (sekolah?.logo) {
        return <img src={sekolah.logo} alt={`Logo ${sekolah.nama}`} className={cn("shrink-0 object-contain", className)}/>
    }

    return <Crest className={className}/>
}

export default SchoolLogo
