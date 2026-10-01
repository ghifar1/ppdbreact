import React, {useState} from "react";
import {Link, router} from "@inertiajs/react";
import {BanknoteIcon, SearchIcon} from "lucide-react";
import AdminNav from "../../../Layouts/AdminNav";
import JenjangBadge from "@/components/JenjangBadge";
import PageHeader from "@/components/PageHeader";
import Pagination from "@/components/Pagination";
import PaymentStatusBadge from "@/components/PaymentStatusBadge";
import {ConfirmPaymentButton, ProofButton, RejectPaymentButton} from "./PaymentActions";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {cn, initials} from "@/lib/utils";

const ALL = 'semua'

const name = payment => payment.student?.name ?? payment.applicant?.name

/** The student, or the applicant who has no account yet. */
const PaymentPerson = ({payment})=>{

    const person = payment.student ?? payment.applicant
    const inner = (
        <>
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-primary">
                {initials(person.name)}
            </span>
            <span className="min-w-0">
                <span className={cn("block truncate font-semibold", payment.student && "hover:text-primary hover:underline")}>{person.name}</span>
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    <JenjangBadge jenjang={person.jenjang}>{person.jenjang_label}</JenjangBadge>
                    {payment.student
                        ? <span className="font-mono">{payment.student.nomor_pendaftaran}</span>
                        : <span>Calon siswa, belum punya akun</span>}
                </span>
            </span>
        </>
    )

    return payment.student
        ? <Link href={`/admin/siswa/${payment.student.id}`} className="flex min-w-0 items-center gap-3">{inner}</Link>
        : <div className="flex min-w-0 items-center gap-3">{inner}</div>
}

const Index = ({payments, filters, counts, statusOptions, jenjangOptions})=>{

    const [q, setQ] = useState(filters.q)
    const apply = changes => router.get('/admin/pembayaran', {...filters, q, ...changes}, {preserveState: true, replace: true})

    const tabs = [
        ...statusOptions.map(option => ({...option, count: counts[option.value] ?? 0})),
        {value: ALL, label: 'Semua', count: Object.values(counts).reduce((sum, count) => sum + count, 0)},
    ]

    return (
        <>
            <PageHeader
                eyebrow="Pengelolaan"
                title="Pembayaran"
                description="Calon siswa mengirim bukti transfer saat mendaftar. Terima pembayarannya untuk membuat akun mereka, atau tolak dengan alasan yang mereka lihat di halaman status pendaftaran."
            />

            <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Status pembayaran">
                {tabs.map(tab => (
                    <button key={tab.value} type="button" role="tab" aria-selected={filters.status === tab.value}
                            onClick={() => apply({status: tab.value, page: undefined})}
                            className={cn(
                                "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                                filters.status === tab.value
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                            )}>
                        {tab.label}
                        <span className={cn("rounded-full px-1.5 text-xs font-semibold",
                            filters.status === tab.value ? "bg-white/20" : "bg-muted")}>{tab.count}</span>
                    </button>
                ))}
            </div>

            <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                <div className="flex flex-col gap-2 border-b bg-muted/40 p-4 md:flex-row">
                    <form className="relative flex-1" onSubmit={e => { e.preventDefault(); apply({}) }}>
                        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"/>
                        <Input placeholder="Cari nama, username atau kode pengajuan, lalu tekan Enter" value={q} className="bg-background pl-9"
                               aria-label="Cari siswa" onChange={e => setQ(e.target.value)}/>
                    </form>
                    <Select value={filters.jenjang || ALL} onValueChange={value => apply({jenjang: value === ALL ? '' : value})}>
                        <SelectTrigger className="bg-background md:w-44" aria-label="Filter jenjang"><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL}>Semua jenjang</SelectItem>
                            {jenjangOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.short}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                {payments.data.length === 0 && (
                    <div className="px-6 py-14 text-center text-muted-foreground">
                        <BanknoteIcon className="mx-auto mb-3 size-10 text-muted-foreground/60"/>
                        {filters.status === 'menunggu' ? 'Tidak ada pembayaran yang menunggu konfirmasi.' : 'Tidak ada pembayaran yang cocok.'}
                    </div>
                )}

                <ul className="divide-y">
                    {payments.data.map(payment => (
                        <li key={payment.id} className="grid gap-3 px-4 py-4 sm:px-6">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <PaymentPerson payment={payment}/>
                                <div className="flex flex-wrap items-center gap-2">
                                    <PaymentStatusBadge status={payment.status} label={payment.status_label}/>
                                    <ProofButton proof={payment.proof} title={name(payment)}/>
                                    {payment.status !== 'diterima' && <ConfirmPaymentButton payment={payment}/>}
                                    {payment.status !== 'ditolak' && payment.method === 'transfer' && (
                                        <RejectPaymentButton payment={payment} studentName={name(payment)}/>
                                    )}
                                </div>
                            </div>
                            <dl className="grid grid-cols-2 gap-x-6 gap-y-2 rounded-lg bg-muted/40 px-4 py-3 text-sm sm:grid-cols-4">
                                <div><dt className="text-xs text-muted-foreground">Jumlah</dt><dd className="font-semibold">{payment.amount_label ?? '-'}</dd></div>
                                <div><dt className="text-xs text-muted-foreground">Cara bayar</dt><dd>{payment.method_label}</dd></div>
                                <div className="min-w-0"><dt className="text-xs text-muted-foreground">Pengirim</dt><dd className="truncate">{payment.sender_name || '-'}</dd></div>
                                <div><dt className="text-xs text-muted-foreground">{payment.status === 'menunggu' ? 'Dikirim' : 'Diperiksa'}</dt>
                                    <dd>{(payment.status === 'menunggu' ? payment.submitted_at : payment.reviewed_at) || '-'}{payment.status !== 'menunggu' && payment.reviewer && ` · ${payment.reviewer}`}</dd></div>
                                {payment.applicant && (
                                    <div className="col-span-full flex flex-wrap gap-x-6 gap-y-1 border-t pt-2">
                                        <span><span className="text-xs text-muted-foreground">WhatsApp </span>{payment.applicant.phone}</span>
                                        {payment.applicant.email && <span><span className="text-xs text-muted-foreground">Email </span>{payment.applicant.email}</span>}
                                        {payment.applicant.gelombang && <span><span className="text-xs text-muted-foreground">Gelombang </span>{payment.applicant.gelombang}</span>}
                                        <span><span className="text-xs text-muted-foreground">Kode </span><span className="font-mono">{payment.code}</span></span>
                                    </div>
                                )}
                                {payment.note && (
                                    <div className="col-span-full"><dt className="text-xs text-muted-foreground">Catatan</dt><dd className="whitespace-pre-line">{payment.note}</dd></div>
                                )}
                            </dl>
                        </li>
                    ))}
                </ul>

                <Pagination page={payments} noun="pembayaran"/>
            </section>
        </>
    )
}

Index.layout = page => <AdminNav>{page}</AdminNav>

export default Index
