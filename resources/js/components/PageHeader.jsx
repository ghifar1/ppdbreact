import React from "react";
import {Head, Link} from "@inertiajs/react";
import {ArrowLeftIcon} from "lucide-react";

/**
 * Title block at the top of every app page. Also sets the document title.
 * back: {href, label}
 */
const PageHeader = ({title, headTitle, eyebrow, description, back, actions})=>(
    <>
        <Head title={headTitle ?? (typeof title === 'string' ? title : undefined)}/>
        <div className="flex flex-col gap-4 py-6 sm:flex-row sm:items-end sm:justify-between print:hidden">
            <div className="min-w-0">
                {back && (
                    <Link href={back.href}
                          className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary">
                        <ArrowLeftIcon className="size-4"/> {back.label}
                    </Link>
                )}
                {eyebrow && (
                    <p className="text-xs font-semibold tracking-[0.16em] uppercase text-primary">{eyebrow}</p>
                )}
                <h1 className="mt-1 font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h1>
                {description && <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{description}</p>}
            </div>
            {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
        </div>
    </>
)

export default PageHeader
