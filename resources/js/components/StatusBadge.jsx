import React from "react";
import {cn} from "@/lib/utils";

const styles = {
    pengisian_data: 'bg-muted text-muted-foreground ring-border [&>i]:bg-muted-foreground',
    menunggu_verifikasi: 'bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:ring-amber-900 [&>i]:bg-amber-500',
    perlu_perbaikan: 'bg-orange-50 text-orange-800 ring-orange-200 dark:bg-orange-950 dark:text-orange-200 dark:ring-orange-900 [&>i]:bg-orange-500',
    terverifikasi: 'bg-sky-50 text-sky-800 ring-sky-200 dark:bg-sky-950 dark:text-sky-200 dark:ring-sky-900 [&>i]:bg-sky-500',
    lulus: 'bg-emerald-50 text-emerald-800 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:ring-emerald-900 [&>i]:bg-emerald-500',
    tidak_lulus: 'bg-red-50 text-red-800 ring-red-200 dark:bg-red-950 dark:text-red-200 dark:ring-red-900 [&>i]:bg-red-500',
}

const StatusBadge = ({status, label, className})=>(
    <span className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ring-1 ring-inset",
        styles[status] ?? styles.pengisian_data,
        className,
    )}>
        <i className="size-1.5 rounded-full" aria-hidden="true"/>
        {label}
    </span>
)

export default StatusBadge
