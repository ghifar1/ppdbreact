import React from "react";
import {Link} from "@inertiajs/react";
import {cn} from "@/lib/utils";

const roles = {
    panitia: {label: 'Panitia', className: 'bg-primary/10 text-primary ring-primary/20'},
    siswa: {label: 'Siswa', className: 'bg-gold-soft text-gold-foreground ring-gold/40 dark:text-gold'},
}

/** Who did it: an admin, a student, or an applicant without an account. */
const Causer = ({causer})=>{

    if (!causer) {
        return <span className="text-muted-foreground">Pendaftar / sistem</span>
    }

    const role = roles[causer.role]

    return (
        <span className="inline-flex items-center gap-1.5">
            <span className="font-semibold">{causer.name}</span>
            <span className={cn("rounded-full px-1.5 py-px text-[10px] font-semibold uppercase ring-1 ring-inset", role.className)}>{role.label}</span>
        </span>
    )
}

/**
 * Activity log entries, newest first.
 * showSubject: link to the student each entry concerns (off on that student's own page).
 */
const ActivityList = ({logs, empty, showSubject = true})=>(
    logs.length === 0 ? (
        <p className="px-6 py-10 text-center text-sm text-muted-foreground">{empty}</p>
    ) : (
        <ol className="divide-y">
            {logs.map(log => (
                <li key={log.id} className="grid gap-1 px-4 py-3 text-sm sm:grid-cols-[11rem_1fr] sm:gap-4 sm:px-6">
                    <time className="text-xs text-muted-foreground sm:pt-0.5" title={log.relative}>{log.time}</time>
                    <div className="min-w-0">
                        <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <Causer causer={log.causer}/>
                            {showSubject && log.subject && log.subject.id !== log.causer?.id && (
                                <Link href={`/admin/siswa/${log.subject.id}`} className="text-xs text-primary hover:underline">→ {log.subject.name}</Link>
                            )}
                        </p>
                        <p className="mt-0.5 break-words">{log.description}</p>
                    </div>
                </li>
            ))}
        </ol>
    )
)

export default ActivityList
