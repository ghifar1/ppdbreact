import React from "react";
import {cn} from "@/lib/utils";

const styles = {
    belum: 'bg-muted text-muted-foreground ring-border [&>i]:bg-muted-foreground',
    menunggu: 'bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:ring-amber-900 [&>i]:bg-amber-500',
    diterima: 'bg-emerald-50 text-emerald-800 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:ring-emerald-900 [&>i]:bg-emerald-500',
    ditolak: 'bg-red-50 text-red-800 ring-red-200 dark:bg-red-950 dark:text-red-200 dark:ring-red-900 [&>i]:bg-red-500',
}

/** Registration fee status: belum, menunggu, diterima (lunas) or ditolak. */
const PaymentStatusBadge = ({status, label, className})=>(
    <span className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ring-1 ring-inset",
        styles[status] ?? styles.belum,
        className,
    )}>
        <i className="size-1.5 rounded-full" aria-hidden="true"/>
        {label}
    </span>
)

export default PaymentStatusBadge
