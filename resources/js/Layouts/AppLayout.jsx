import React, {useState} from "react";
import {Link, usePage} from "@inertiajs/react";
import {BookOpenIcon, CheckIcon, ChevronDownIcon, LogOutIcon, MenuIcon, XIcon} from "lucide-react";
import FlashMessage from "@/components/FlashMessage";
import Pattern from "@/components/Pattern";
import SchoolLogo from "@/components/SchoolLogo";
import ThemeToggle from "@/components/ThemeToggle";
import {Button} from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Sheet, SheetContent, SheetDescription, SheetTitle} from "@/components/ui/sheet";
import {cn, initials} from "@/lib/utils";

function isActive(path, item)
{
    return item.exact ? path === item.href : path === item.href || path.startsWith(item.href + '/')
}

const NavItem = ({item, active, onNavigate})=>{

    const Icon = item.icon

    return (
        <Link href={item.href} onClick={onNavigate} aria-current={active ? 'page' : undefined}
              className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}>
            {active && <span className="absolute inset-y-1.5 -left-3 w-1 rounded-r-full bg-sidebar-primary" aria-hidden="true"/>}
            {item.number !== undefined ? (
                <span className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    item.complete
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "ring-1 ring-sidebar-foreground/40 ring-inset",
                )}>
                    {item.complete ? <CheckIcon className="size-3.5" strokeWidth={3}/> : item.number}
                </span>
            ) : Icon && (
                <Icon className={cn("size-5 shrink-0", active ? "text-sidebar-primary" : "opacity-80")}/>
            )}
            <span className="flex-1 truncate">{item.title}</span>
            {item.complete && <span className="sr-only">(lengkap)</span>}
        </Link>
    )
}

/**
 * Green school sidebar: crest, optional summary block, grouped navigation and a footer link.
 */
const Sidebar = ({sections, homeHref, subtitle, summary, footer, onNavigate})=>{

    const {url, props} = usePage()
    const path = url.split('?')[0].split('#')[0]

    return (
        <div className="relative flex h-full flex-col overflow-hidden bg-sidebar text-sidebar-foreground">
            <Pattern className="text-white/[0.035]"/>
            <div className="relative px-6 pt-6 pb-5">
                <Link href={homeHref} onClick={onNavigate} className={cn("flex items-center gap-3", onNavigate && "pr-6")}>
                    <SchoolLogo className="h-12 w-11"/>
                    <span className="min-w-0 leading-tight">
                        <span className="block text-[11px] font-semibold tracking-[0.16em] text-sidebar-primary uppercase">{subtitle}</span>
                        <span className="line-clamp-2 font-serif text-lg font-semibold text-white">{props.sekolah.nama}</span>
                    </span>
                </Link>
                {onNavigate && (
                    <button type="button" onClick={onNavigate} aria-label="Tutup menu"
                            className="absolute top-4 right-3 rounded-md p-1.5 text-sidebar-foreground hover:bg-sidebar-accent hover:text-white focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none">
                        <XIcon className="size-5"/>
                    </button>
                )}
            </div>

            {summary && <div className="relative px-4 pb-2">{summary}</div>}

            <nav className="relative flex-1 overflow-y-auto px-6 py-4" aria-label="Navigasi">
                {sections.filter(section => section.items.length > 0).map(section => (
                    <div key={section.title} className="mb-6">
                        <p className="mb-2 px-3 text-[11px] font-semibold tracking-[0.14em] text-sidebar-foreground/60 uppercase">{section.title}</p>
                        <ul className="grid gap-1">
                            {section.items.map(item => (
                                <li key={item.href}>
                                    <NavItem item={item} active={isActive(path, item)} onNavigate={onNavigate}/>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </nav>

            {footer && <div className="relative border-t border-sidebar-border p-4">{footer}</div>}
        </div>
    )
}

const AccountMenu = ({homeHref})=>{

    const {auth} = usePage().props

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full p-0.5 pr-2 outline-none hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/50"
                        aria-label="Akun">
                    <span className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground ring-2 ring-gold">
                        {initials(auth.user?.name)}
                    </span>
                    <span className="hidden max-w-40 text-left leading-tight md:block">
                        <span className="block truncate text-sm font-semibold">{auth.user?.name}</span>
                        <span className="block text-xs text-muted-foreground">{auth.user?.isAdmin ? 'Panitia PPDB' : `Calon siswa ${auth.user?.jenjang ?? ''}`}</span>
                    </span>
                    <ChevronDownIcon className="hidden size-4 text-muted-foreground md:block"/>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel>
                    <p className="font-semibold">{auth.user?.name}</p>
                    <p className="text-xs font-normal text-muted-foreground">
                        @{auth.user?.username}{auth.user?.jenjang ? ` · ${auth.user.jenjang}` : ''}
                    </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator/>
                <DropdownMenuItem asChild>
                    <Link href={homeHref}>Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/help"><BookOpenIcon/> Panduan</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator/>
                <DropdownMenuItem asChild variant="destructive" className="w-full">
                    <Link href="/logout" method="post" as="button"><LogOutIcon/> Keluar</Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

/**
 * Shell shared by the student and admin areas.
 * sections: [{title, items: [{title, href, icon?, exact?, number?, complete?}]}]
 */
const AppLayout = ({sections, homeHref, subtitle, summary, footer, children})=>{

    const {sekolah} = usePage().props
    const [open, setOpen] = useState(false)
    const today = new Date().toLocaleDateString('id-ID', {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'})
    const sidebar = {sections, homeHref, subtitle, summary, footer}

    return (
        <div className="min-h-screen bg-background print:bg-white">
            <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 lg:block print:hidden">
                <Sidebar {...sidebar}/>
            </aside>

            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent side="left" showCloseButton={false} className="w-72 gap-0 border-0 p-0">
                    <SheetTitle className="sr-only">Menu navigasi</SheetTitle>
                    <SheetDescription className="sr-only">{sekolah.nama}</SheetDescription>
                    <Sidebar {...sidebar} onNavigate={() => setOpen(false)}/>
                </SheetContent>
            </Sheet>

            <div className="flex min-h-screen flex-col lg:pl-72 print:pl-0">
                <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur print:hidden">
                    <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6 lg:px-8">
                        <Button variant="ghost" size="icon" className="-ml-2 lg:hidden" onClick={() => setOpen(true)} aria-label="Menu">
                            <MenuIcon className="size-5"/>
                        </Button>
                        <Link href={homeHref} className="flex min-w-0 items-center gap-2 lg:hidden">
                            <SchoolLogo className="h-8 w-7"/>
                            <span className="truncate font-serif font-semibold">{sekolah.nama}</span>
                        </Link>
                        <div className="hidden items-center gap-2 text-sm lg:flex">
                            <span className="rounded-full bg-gold-soft px-2.5 py-0.5 text-xs font-semibold text-gold-foreground ring-1 ring-gold/40 ring-inset dark:text-gold">
                                TA {sekolah.tahun}
                            </span>
                            <span className="text-muted-foreground">{today}</span>
                        </div>
                        <div className="ml-auto flex items-center gap-1 sm:gap-2">
                            <ThemeToggle/>
                            <AccountMenu homeHref={homeHref}/>
                        </div>
                    </div>
                </header>

                <main className="flex-1 px-4 pb-16 sm:px-6 lg:px-8 print:p-0">
                    <div className="mx-auto max-w-6xl">
                        <FlashMessage/>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}

export default AppLayout
