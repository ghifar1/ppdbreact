import React from "react";
import {CalendarRangeIcon, ClockIcon} from "lucide-react";
import JenjangBadge from "@/components/JenjangBadge";
import PeriodStatusBadge from "@/components/PeriodStatusBadge";
import {cn} from "@/lib/utils";

/** Registration periods on the public pages. */
const PeriodList = ({periods, compact = false})=>{

    if (!periods?.length) {
        return null
    }

    return (
        <ul className={cn("grid gap-3", !compact && "sm:grid-cols-2")}>
            {periods.map(period => (
                <li key={period.id}
                    className={cn(
                        "relative overflow-hidden rounded-xl border bg-card p-4 shadow-xs",
                        period.status === 'open' && "border-primary/40 ring-1 ring-primary/20",
                        period.status === 'closed' && "opacity-70",
                    )}>
                    {period.status === 'open' && <span className="absolute inset-y-0 left-0 w-1 bg-primary" aria-hidden="true"/>}
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{period.name}</p>
                        {period.jenjang
                            ? <JenjangBadge jenjang={period.jenjang}>{period.jenjang_label}</JenjangBadge>
                            : <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">Semua jenjang</span>}
                        <PeriodStatusBadge period={period} className="ml-auto"/>
                    </div>
                    <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarRangeIcon className="size-4 shrink-0 text-primary"/>
                        {period.opens_label} – {period.closes_label}
                    </p>
                    {period.status !== 'closed' && (
                        <p className={cn("mt-1 flex items-center gap-2 text-sm font-medium",
                            period.status === 'open' ? "text-primary" : "text-sky-700 dark:text-sky-300")}>
                            <ClockIcon className="size-4 shrink-0"/> {period.relative}
                        </p>
                    )}
                    {period.description && !compact && (
                        <p className="mt-2 text-sm whitespace-pre-line text-muted-foreground">{period.description}</p>
                    )}
                </li>
            ))}
        </ul>
    )
}

export default PeriodList
