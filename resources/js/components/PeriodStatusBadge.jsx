import React from "react";
import {cn} from "@/lib/utils";

const styles = {
    open: 'bg-emerald-50 text-emerald-800 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:ring-emerald-900 [&>i]:bg-emerald-500 [&>i]:animate-pulse',
    upcoming: 'bg-sky-50 text-sky-800 ring-sky-200 dark:bg-sky-950 dark:text-sky-200 dark:ring-sky-900 [&>i]:bg-sky-500',
    closed: 'bg-muted text-muted-foreground ring-border [&>i]:bg-muted-foreground',
}

/** Status pill of a registration period: open, upcoming or closed. */
const PeriodStatusBadge = ({period, className})=>(
    <span className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ring-1 ring-inset",
        styles[period.status],
        className,
    )}>
        <i className="size-1.5 rounded-full" aria-hidden="true"/>
        {period.status_label}
    </span>
)

export default PeriodStatusBadge
