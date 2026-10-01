import React from "react";
import {Head, Link, usePage} from "@inertiajs/react";
import {ArrowRightIcon, BadgeCheckIcon, CalendarDaysIcon, CalendarRangeIcon, GraduationCapIcon} from "lucide-react";
import PublicLayout from "../Layouts/PublicLayout";
import ArchDivider from "@/components/ArchDivider";
import JenjangSwitch, {useJadwal} from "@/components/JenjangSwitch";
import PeriodList from "@/components/PeriodList";
import Pattern from "@/components/Pattern";
import {Crest} from "@/components/SchoolLogo";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {jenjangStyle} from "@/lib/jenjang";
import {jadwalItems, stepsFor} from "@/lib/ppdb";

const SectionHeading = ({eyebrow, title, children, center = false})=>(
    <div className={cn("max-w-2xl", center && "mx-auto text-center")}>
        <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">{eyebrow}</p>
        <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{title}</h2>
        {children && <p className="mt-3 text-muted-foreground">{children}</p>}
    </div>
)

/** Decorative preview of the registration card shown in the hero. */
const HeroCard = ({sekolah})=>(
    <div className="relative mx-auto w-full max-w-sm pr-4 pb-4 lg:mr-0" aria-hidden="true">
        <div className="absolute inset-0 top-4 left-4 rotate-3 rounded-2xl bg-gold/90"/>
        <div className="relative -rotate-2 overflow-hidden rounded-2xl bg-card text-card-foreground shadow-2xl ring-1 ring-black/5">
            <div className="relative flex items-center gap-3 overflow-hidden bg-panel px-5 py-4 text-panel-foreground">
                <Pattern className="text-white/10" size={40}/>
                <Crest className="relative h-11 w-10"/>
                <div className="relative leading-tight">
                    <p className="text-[10px] font-semibold tracking-[0.2em] text-gold uppercase">Kartu Pendaftaran</p>
                    <p className="font-serif text-base font-semibold">{sekolah.nama}</p>
                </div>
            </div>
            <div className="grid gap-4 p-5">
                <div className="flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-full bg-secondary font-serif text-lg font-semibold text-primary">AF</div>
                    <div>
                        <p className="font-semibold">Ahmad Fauzan</p>
                        <p className="font-mono text-xs text-muted-foreground">MTS-2022-00128</p>
                    </div>
                    <span className="ml-auto rounded-full bg-mts/10 px-2 py-0.5 text-xs font-semibold text-mts ring-1 ring-mts/25 ring-inset">MTs</span>
                </div>
                <div className="grid gap-2">
                    {['Data Pribadi', 'Data Orang Tua', 'Data Sekolah'].map(item => (
                        <div key={item} className="flex items-center justify-between rounded-lg bg-muted px-3 py-2 text-sm">
                            <span>{item}</span>
                            <BadgeCheckIcon className="size-4 text-primary"/>
                        </div>
                    ))}
                </div>
                <div className="flex items-center justify-between rounded-lg border border-dashed border-primary/30 px-3 py-2 text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-800 ring-1 ring-sky-200 ring-inset dark:bg-sky-950 dark:text-sky-200 dark:ring-sky-900">
                        <i className="size-1.5 rounded-full bg-sky-500"/> Terverifikasi
                    </span>
                </div>
            </div>
        </div>
    </div>
)

/** Registration status under the hero text. */
const HeroStatus = ({pendaftaran})=>{

    const open = pendaftaran?.periods?.find(period => period.status === 'open')
    const next = pendaftaran?.periods?.find(period => period.status === 'upcoming')

    if (open) {
        return (
            <p className="mt-6 inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl bg-white/10 px-4 py-2 text-sm ring-1 ring-white/15">
                <span className="size-2 animate-pulse rounded-full bg-emerald-400"/>
                <b className="text-white">{open.name} dibuka</b>
                <span className="text-brand-foreground/80">· {open.relative.toLowerCase()}</span>
            </p>
        )
    }

    if (next) {
        return (
            <p className="mt-6 inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl bg-white/10 px-4 py-2 text-sm ring-1 ring-white/15">
                <CalendarRangeIcon className="size-4 text-gold"/>
                <b className="text-white">{next.name}</b>
                <span className="text-brand-foreground/80">dibuka {next.opens_label}</span>
            </p>
        )
    }

    if (pendaftaran?.restricted && !Object.values(pendaftaran.jenjang).some(status => status.open)) {
        return (
            <p className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm text-brand-foreground/90 ring-1 ring-white/15">
                Pendaftaran sudah ditutup. Nantikan gelombang berikutnya.
            </p>
        )
    }

    return null
}

const Hero = ({pendaftaran})=>{

    const {sekolah} = usePage().props

    return (
        <section className="relative overflow-hidden bg-brand text-brand-foreground">
            <Pattern className="text-white/[0.05]"/>
            <div className="pointer-events-none absolute -top-40 -right-40 size-[32rem] rounded-full bg-gold/15 blur-3xl dark:bg-gold/10"/>
            <div className="pointer-events-none absolute -bottom-48 -left-32 size-[28rem] rounded-full bg-emerald-400/10 blur-3xl"/>

            <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 pt-16 pb-20 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:px-8 lg:pt-24 lg:pb-28">
                <div>
                    <p className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">
                        <GraduationCapIcon className="size-4"/> Tahun Ajaran {sekolah.tahun}
                    </p>
                    <h1 className="mt-6 font-serif text-4xl leading-[1.1] font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                        Penerimaan <span className="text-gold">Peserta Didik Baru</span>
                    </h1>
                    <p className="mt-5 max-w-xl text-base text-brand-foreground/80 sm:text-lg">
                        {sekolah.nama} membuka pendaftaran untuk jenjang MI, MTs, dan MA. Daftar dari rumah,
                        lengkapi formulir secara online, dan pantau hasil seleksi dalam satu tempat.
                    </p>
                    <HeroStatus pendaftaran={pendaftaran}/>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <Button asChild size="xl" variant="gold">
                            <Link href="/register">Daftar Sekarang <ArrowRightIcon/></Link>
                        </Button>
                        <Button asChild size="xl" variant="outline-light">
                            <Link href="/login">Sudah punya akun? Masuk</Link>
                        </Button>
                    </div>
                    <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-white/10 pt-6">
                        {[['3', 'Jenjang pendidikan'], ['5', 'Langkah mudah'], ['24 jam', 'Akses online']].map(([value, label]) => (
                            <div key={label}>
                                <dt className="sr-only">{label}</dt>
                                <dd className="font-serif text-2xl font-semibold text-white sm:text-3xl">{value}</dd>
                                <dd className="mt-1 text-xs text-brand-foreground/70 sm:text-sm">{label}</dd>
                            </div>
                        ))}
                    </dl>
                </div>
                <HeroCard sekolah={sekolah}/>
            </div>
            <ArchDivider className="relative"/>
        </section>
    )
}

/** "Dibuka s.d. …" / "Dibuka …" / "Ditutup" for one jenjang, or nothing without periods. */
const JenjangAvailability = ({status})=>{

    if (!status?.restricted) {
        return null
    }

    const [dot, text] = status.open
        ? ['bg-emerald-500', `Dibuka s.d. ${status.current.closes_label}`]
        : status.next
            ? ['bg-sky-500', `${status.next.name} dibuka ${status.next.opens_label}`]
            : ['bg-muted-foreground', 'Pendaftaran ditutup']

    return (
        <p className="mt-3 flex items-center gap-2 text-sm font-medium">
            <span className={cn("size-2 shrink-0 rounded-full", dot)}/> {text}
        </p>
    )
}

const JenjangSection = ({jenjangOptions, pendaftaran})=>(
    <section id="jenjang" className="scroll-mt-20 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <SectionHeading eyebrow="Pilih Jenjang" title="Tiga jenjang, satu pintu pendaftaran" center>
                Setiap jenjang punya formulir sendiri. Pilih jenjang yang sesuai, lalu buat akun untuk mulai mendaftar.
            </SectionHeading>

            <div className="mt-14 grid gap-6 md:grid-cols-3">
                {jenjangOptions.map(option => {
                    const style = jenjangStyle(option.value)
                    const status = pendaftaran?.jenjang?.[option.value]
                    const canRegister = status?.open ?? true

                    return (
                        <article key={option.value}
                                 className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                            <div className={cn("relative flex h-36 items-end overflow-hidden p-6 text-white", style.bar)}>
                                <Pattern className="text-white/15" size={48}/>
                                <span className="relative font-serif text-6xl leading-none font-semibold">{option.short}</span>
                                <GraduationCapIcon className="absolute top-5 right-5 size-8 text-white/70"/>
                            </div>
                            <div className="flex flex-1 flex-col p-6">
                                <h3 className="font-serif text-xl font-semibold">{option.label}</h3>
                                <p className="mt-1 text-sm text-muted-foreground">{style.tagline}</p>
                                <JenjangAvailability status={status}/>
                                {status?.fee_label && (
                                    <p className="mt-1 text-sm text-muted-foreground">Biaya pendaftaran <span className="font-semibold text-foreground">{status.fee_label}</span></p>
                                )}
                                <ul className="mt-5 grid gap-2 text-sm">
                                    {['Formulir khusus jenjang ' + option.short, 'Unggah berkas pendukung', 'Kartu ujian & pengumuman online'].map(item => (
                                        <li key={item} className="flex items-center gap-2">
                                            <BadgeCheckIcon className={cn("size-4 shrink-0", style.text)}/> {item}
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-6 grid grid-cols-2 gap-2 pt-2">
                                    {canRegister ? (
                                        <Button asChild className={cn(style.solid, "hover:opacity-90")}>
                                            <Link href={`/register?jenjang=${option.value}`}>Daftar {option.short}</Link>
                                        </Button>
                                    ) : (
                                        <Button disabled variant="secondary">{status?.next ? 'Belum dibuka' : 'Ditutup'}</Button>
                                    )}
                                    <Button asChild variant="outline">
                                        <Link href="/login">Masuk</Link>
                                    </Button>
                                </div>
                            </div>
                        </article>
                    )
                })}
            </div>
        </div>
    </section>
)

const stepCount = {5: 'Lima', 6: 'Enam'}

const AlurSection = ({withPayment})=>{

    const steps = stepsFor(withPayment)

    return (
        <section id="alur" className="scroll-mt-20 border-y bg-card py-20 sm:py-24">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <SectionHeading eyebrow="Alur Pendaftaran" title={`${stepCount[steps.length]} langkah menuju madrasah impian`} center>
                    Semua langkah dilakukan secara online. Status pendaftaranmu selalu terlihat di dashboard.
                </SectionHeading>

                <ol className={cn("relative mt-14 grid gap-8 lg:gap-6", steps.length === 6 ? "lg:grid-cols-6" : "lg:grid-cols-5")}>
                    <div className="absolute top-7 right-[10%] left-[10%] hidden h-px border-t-2 border-dashed border-gold/60 lg:block" aria-hidden="true"/>
                    {steps.map((step, i) => (
                        <li key={step.title} className="relative flex gap-4 lg:flex-col lg:items-center lg:text-center">
                            <div className="relative flex size-14 shrink-0 items-center justify-center rounded-2xl bg-panel text-panel-foreground shadow-md ring-4 ring-card">
                                <step.icon className="size-6"/>
                                <span className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-gold text-xs font-bold text-gold-foreground ring-2 ring-card">
                                    {i + 1}
                                </span>
                            </div>
                            <div>
                                <h3 className="font-semibold">{step.title}</h3>
                                <p className="mt-1 text-sm text-muted-foreground">{step.text}</p>
                            </div>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    )
}

const JadwalSection = ({jadwal, periods, jenjangOptions})=>{

    const {selected, setSelected, differs, timeline} = useJadwal(jadwal, jenjangOptions)

    return (
        <section id="jadwal" className="scroll-mt-20 py-20 sm:py-24">
            {periods?.length > 0 && (
                <div className="mx-auto mb-14 max-w-6xl px-4 sm:px-6 lg:px-8">
                    <SectionHeading eyebrow="Gelombang Pendaftaran" title="Daftar di gelombang yang sedang dibuka">
                        Pendaftaran hanya bisa dilakukan selama gelombang untuk jenjangmu dibuka.
                    </SectionHeading>
                    <div className="mt-8"><PeriodList periods={periods}/></div>
                </div>
            )}
            <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.3fr] lg:px-8">
                <div>
                    <SectionHeading eyebrow="Jadwal" title="Catat tanggal pentingnya">
                        Pastikan seluruh data sudah lengkap dan diajukan sebelum batas waktu. Jadwal dapat berubah
                        sesuai kebijakan panitia.
                    </SectionHeading>
                    {differs && (
                        <div className="mt-6">
                            <p className="mb-2 text-sm text-muted-foreground">Jadwal tiap jenjang berbeda. Pilih jenjang:</p>
                            <JenjangSwitch options={jenjangOptions} value={selected} onChange={setSelected}/>
                        </div>
                    )}
                    <Button asChild variant="outline" className="mt-6">
                        <Link href="/help">Baca panduan lengkap <ArrowRightIcon/></Link>
                    </Button>
                </div>
                <ol className="grid content-start gap-3">
                    {jadwalItems.map((item, i) => (
                        <li key={item.key} className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-xs">
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                                <item.icon className="size-5"/>
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-muted-foreground">Tahap {i + 1}</p>
                                <p className="font-semibold">{item.title}</p>
                            </div>
                            <p className={cn("flex max-w-[45%] shrink-0 items-center gap-1.5 text-right text-sm font-medium",
                                timeline[item.key] ? 'text-primary' : 'text-muted-foreground italic')}>
                                <CalendarDaysIcon className="hidden size-4 shrink-0 sm:block"/>
                                {timeline[item.key] || item.fallback || 'Menyusul'}
                            </p>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    )
}

const CtaSection = ()=>(
    <section className="pb-20 sm:pb-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-panel px-6 py-12 text-panel-foreground sm:px-12">
                <Pattern className="text-white/[0.07]"/>
                <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
                    <div className="flex items-center gap-5">
                        <Crest className="hidden h-20 w-18 sm:block"/>
                        <div>
                            <h2 className="font-serif text-2xl font-semibold sm:text-3xl">Siap bergabung bersama kami?</h2>
                            <p className="mt-2 text-panel-foreground/80">Buat akun sekarang dan mulai isi formulir pendaftaran.</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Button asChild size="lg" variant="gold">
                            <Link href="/register">Daftar Sekarang</Link>
                        </Button>
                        <Button asChild size="lg" variant="outline-light">
                            <Link href="/help">Panduan</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    </section>
)

const Welcome = ({jenjangOptions, jadwal, pendaftaran})=>(
    <>
        <Head title="Beranda"/>
        <Hero pendaftaran={pendaftaran}/>
        <JenjangSection jenjangOptions={jenjangOptions} pendaftaran={pendaftaran}/>
        <AlurSection withPayment={pendaftaran?.anyFee}/>
        <JadwalSection jadwal={jadwal} periods={pendaftaran?.periods} jenjangOptions={jenjangOptions}/>
        <CtaSection/>
    </>
)

Welcome.layout = page => <PublicLayout>{page}</PublicLayout>

export default Welcome
