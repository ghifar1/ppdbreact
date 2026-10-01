import React from "react";
import {usePage} from "@inertiajs/react";
import {CircleAlertIcon, CircleCheckIcon} from "lucide-react";

const FlashMessage = ()=>{

    const {flash} = usePage().props

    if (!flash?.success && !flash?.error) {
        return null
    }

    return (
        <div className="grid gap-2 pt-6 print:hidden" role="status">
            {flash.success && (
                <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
                    <CircleCheckIcon className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400"/>
                    <p>{flash.success}</p>
                </div>
            )}
            {flash.error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100">
                    <CircleAlertIcon className="mt-0.5 size-4 shrink-0 text-red-600 dark:text-red-400"/>
                    <p>{flash.error}</p>
                </div>
            )}
        </div>
    )
}

export default FlashMessage
