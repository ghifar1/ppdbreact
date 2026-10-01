import React from "react";
import {Link, usePage} from "@inertiajs/react";
import {LayoutDashboardIcon, MailIcon, MapPinIcon, MenuIcon, PhoneIcon} from "lucide-react";
import Pattern from "@/components/Pattern";
import SchoolLogo from "@/components/SchoolLogo";
import ThemeToggle from "@/components/ThemeToggle";
import {Button} from "@/components/ui/button";
import {Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger} from "@/components/ui/sheet";

const navigation = [
    {name: 'Beranda', href: '/'},
    {name: 'Jenjang', href: '/#jenjang'},
    {name: 'Alur Pendaftaran', href: '/#alur'},
    {name: 'Jadwal', href: '/#jadwal'},
    {name: 'Panduan', href: '/help'},
]

/** Hash links scroll within the landing page, so they stay plain anchors. */
const NavLink = React.forwardRef(({href, ...props}, ref)=>(
    href.includes('#') ? <a ref={ref} href={href} {...props}/> : <Link ref={ref} href={href} {...props}/>
))

/** Logo, school name and PPDB year, used in the header and on the auth pages. */
export const Brand = ({light = false})=>{

    const {sekolah} = usePage().props

    return (
        <Link href="/" className="flex min-w-0 items-center gap-3">
            <SchoolLogo className="h-11 w-10"/>
            <span className="min-w-0 leading-tight">
                <span className={"block text-[11px] font-semibold tracking-[0.16em] uppercase " + (light ? 'text-gold' : 'text-primary')}>
                    PPDB Online {sekolah.tahun}
                </span>
                <span className={"block truncate font-serif text-lg font-semibold " + (light ? 'text-white' : 'text-foreground')}>
                    {sekolah.nama}
                </span>
            </span>
        </Link>
    )
}

const AccountButtons = ({block = false})=>{

    const {auth} = usePage().props
    const className = block ? 'w-full' : ''

    if (auth.user) {
        return (
            <Button asChild className={className}>
                <Link href="/home"><LayoutDashboardIcon/> Dashboard</Link>
            </Button>
        )
    }

    return (
        <>
            <Button asChild variant="ghost" className={className}>
                <Link href="/login">Masuk</Link>
            </Button>
            <Button asChild className={className}>
                <Link href="/register">Daftar</Link>
            </Button>
        </>
    )
}

const Footer = ()=>{

    const {sekolah} = usePage().props
    const year = new Date().getFullYear()

    return (
        <footer className="relative overflow-hidden bg-brand text-brand-foreground">
            <Pattern className="text-white/[0.04]"/>
            <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3 lg:px-8">
                <div className="grid content-start gap-4">
                    <Brand light/>
                    {sekolah.yayasan && <p className="text-sm text-brand-foreground/70">{sekolah.yayasan}</p>}
                    <p className="max-w-xs text-sm text-brand-foreground/70">
                        Sistem Penerimaan Peserta Didik Baru untuk jenjang MI, MTs, dan MA.
                    </p>
                </div>
                <div>
                    <p className="text-sm font-semibold tracking-wider text-gold uppercase">Tautan</p>
                    <ul className="mt-4 grid gap-2 text-sm">
                        {navigation.map(item => (
                            <li key={item.href}>
                                <NavLink href={item.href} className="text-brand-foreground/80 hover:text-white">{item.name}</NavLink>
                            </li>
                        ))}
                        <li><Link href="/login" className="text-brand-foreground/80 hover:text-white">Masuk</Link></li>
                    </ul>
                </div>
                <div>
                    <p className="text-sm font-semibold tracking-wider text-gold uppercase">Kontak Panitia</p>
                    <ul className="mt-4 grid gap-3 text-sm text-brand-foreground/80">
                        {sekolah.alamat && (
                            <li className="flex gap-2"><MapPinIcon className="mt-0.5 size-4 shrink-0 text-gold"/>{sekolah.alamat}</li>
                        )}
                        {sekolah.telepon && (
                            <li className="flex gap-2"><PhoneIcon className="mt-0.5 size-4 shrink-0 text-gold"/>{sekolah.telepon}</li>
                        )}
                        {sekolah.email && (
                            <li className="flex gap-2">
                                <MailIcon className="mt-0.5 size-4 shrink-0 text-gold"/>
                                <a href={`mailto:${sekolah.email}`} className="hover:text-white">{sekolah.email}</a>
                            </li>
                        )}
                        {!sekolah.alamat && !sekolah.telepon && !sekolah.email && (
                            <li>Hubungi sekretariat PPDB di sekolah untuk informasi lebih lanjut.</li>
                        )}
                    </ul>
                </div>
            </div>
            <div className="relative border-t border-white/10">
                <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-brand-foreground/60 sm:px-6 lg:px-8">
                    © {year} {sekolah.nama}. Seluruh hak dilindungi.
                </p>
            </div>
        </footer>
    )
}

/** One line about registration for the top bar, from the page's `pendaftaran` prop. */
const RegistrationNotice = ()=>{

    const {sekolah, pendaftaran} = usePage().props
    const open = pendaftaran?.periods?.find(period => period.status === 'open')
    const next = pendaftaran?.periods?.find(period => period.status === 'upcoming')

    if (open) {
        return <p><span className="font-semibold text-gold">Pendaftaran dibuka</span><span className="text-brand-foreground/80"> · {open.name} s.d. {open.closes_label}</span></p>
    }

    if (next) {
        return <p><span className="font-semibold text-gold">{next.name}</span><span className="text-brand-foreground/80"> dibuka {next.opens_label}</span></p>
    }

    return (
        <p>
            <span className="font-semibold text-gold">Penerimaan Peserta Didik Baru</span>
            <span className="text-brand-foreground/80"> · Tahun Ajaran {sekolah.tahun}</span>
        </p>
    )
}

const PublicLayout = ({children})=>{

    const {sekolah} = usePage().props

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <div className="bg-brand text-brand-foreground">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2 text-xs sm:px-6 lg:px-8">
                    <RegistrationNotice/>
                    {sekolah.telepon && (
                        <p className="hidden items-center gap-1.5 text-brand-foreground/80 sm:flex">
                            <PhoneIcon className="size-3.5"/> {sekolah.telepon}
                        </p>
                    )}
                </div>
            </div>

            <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
                <div className="mx-auto flex h-18 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                    <Brand/>

                    <nav className="hidden items-center gap-1 lg:flex" aria-label="Utama">
                        {navigation.map(item => (
                            <NavLink key={item.href} href={item.href}
                                     className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                                {item.name}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="flex items-center gap-1 sm:gap-2">
                        <ThemeToggle/>
                        <div className="hidden items-center gap-2 sm:flex">
                            <AccountButtons/>
                        </div>
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Buka menu">
                                    <MenuIcon className="size-5"/>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-72">
                                <SheetHeader>
                                    <SheetTitle className="font-serif text-lg">{sekolah.nama}</SheetTitle>
                                    <SheetDescription>PPDB Online {sekolah.tahun}</SheetDescription>
                                </SheetHeader>
                                <nav className="grid gap-1 px-4" aria-label="Menu">
                                    {navigation.map(item => (
                                        <SheetClose asChild key={item.href}>
                                            <NavLink href={item.href}
                                                     className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent">
                                                {item.name}
                                            </NavLink>
                                        </SheetClose>
                                    ))}
                                </nav>
                                <div className="mt-auto grid gap-2 border-t p-4">
                                    <AccountButtons block/>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                {children}
            </main>

            <Footer/>
        </div>
    )
}

export default PublicLayout
