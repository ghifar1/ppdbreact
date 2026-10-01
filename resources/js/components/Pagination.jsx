import React from "react";
import {Link} from "@inertiajs/react";
import {Button} from "@/components/ui/button";

/** Page links under a paginated list. `page` is a Laravel paginator; `noun` names the items. */
const Pagination = ({page, noun})=> page.last_page > 1 && (
    <nav className="flex flex-wrap items-center justify-between gap-2 border-t px-6 py-4 text-sm" aria-label="Halaman">
        <span className="text-muted-foreground">
            Menampilkan {page.from}–{page.to} dari {page.total} {noun}
        </span>
        <div className="flex flex-wrap gap-1">
            {page.links.map((link, i) => (
                <Button key={i} asChild={!!link.url} size="sm" disabled={!link.url}
                        variant={link.active ? 'default' : 'outline'}>
                    {link.url
                        ? <Link href={link.url} preserveState><span dangerouslySetInnerHTML={{__html: link.label}}/></Link>
                        : <span dangerouslySetInnerHTML={{__html: link.label}}/>}
                </Button>
            ))}
        </div>
    </nav>
)

export default Pagination
