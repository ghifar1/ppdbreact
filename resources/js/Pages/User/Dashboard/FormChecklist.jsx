import React from 'react'
import {Link, usePage} from "@inertiajs/react";
import {CheckIcon, ChevronRightIcon} from "lucide-react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Progress} from "@/components/ui/progress";
import {cn} from "@/lib/utils";

/** Every form menu with its completion state. */
export const FormChecklist = ()=>{

    const {studentMenus} = usePage().props
    const done = studentMenus.filter(menu => menu.complete).length

    return (
        <Card className="gap-4">
            <CardHeader>
                <CardTitle className="font-serif text-lg">Formulir pendaftaran</CardTitle>
                <CardDescription>{done} dari {studentMenus.length} formulir lengkap</CardDescription>
                {studentMenus.length > 0 && (
                    <Progress value={done / studentMenus.length * 100} className="mt-1 h-1.5" aria-label="Kelengkapan formulir"/>
                )}
            </CardHeader>
            <CardContent className="px-3">
                {studentMenus.length === 0 && (
                    <p className="px-3 text-sm text-muted-foreground">Formulir belum tersedia. Silakan cek kembali nanti.</p>
                )}
                <ul className="grid gap-1">
                    {studentMenus.map((menu, i) => (
                        <li key={menu.id}>
                            <Link href={`/formulir/${menu.id}`}
                                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-accent">
                                <span className={cn(
                                    "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                                    menu.complete ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                                )}>
                                    {menu.complete ? <CheckIcon className="size-4" strokeWidth={3}/> : i + 1}
                                </span>
                                <span className="flex-1 font-medium">{menu.title}</span>
                                <span className={cn("text-xs", menu.complete ? "text-primary" : "text-muted-foreground")}>
                                    {menu.complete ? 'Lengkap' : 'Belum lengkap'}
                                </span>
                                <ChevronRightIcon className="size-4 text-muted-foreground"/>
                            </Link>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    )
}
