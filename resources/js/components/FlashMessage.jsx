import React from "react";
import {usePage} from "@inertiajs/react";
import {CircleAlertIcon, CircleCheckIcon} from "lucide-react";
import {Alert, AlertDescription} from "@/components/ui/alert";

const FlashMessage = ()=>{

    const {flash} = usePage().props

    if (!flash?.success && !flash?.error) {
        return null
    }

    return (
        <div className="mt-6 print:hidden">
            {flash.success && (
                <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200">
                    <CircleCheckIcon/>
                    <AlertDescription className="text-inherit">{flash.success}</AlertDescription>
                </Alert>
            )}
            {flash.error && (
                <Alert variant="destructive">
                    <CircleAlertIcon/>
                    <AlertDescription>{flash.error}</AlertDescription>
                </Alert>
            )}
        </div>
    )
}

export default FlashMessage
