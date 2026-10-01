import React from "react";
import {Link, usePage} from "@inertiajs/react";
import {ArrowRightIcon, BadgeCheckIcon, ExternalLinkIcon, HandCoinsIcon, TriangleAlertIcon} from "lucide-react";
import UserNav from "../../Layouts/UserNav";
import BankAccount from "@/components/BankAccount";
import PageHeader from "@/components/PageHeader";
import PaymentStatusBadge from "@/components/PaymentStatusBadge";
import {Button} from "@/components/ui/button";

const Paid = ({payment})=>(
    <div className="flex gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-50">
        <BadgeCheckIcon className="size-8 shrink-0 text-emerald-600 dark:text-emerald-400"/>
        <div>
            <p className="font-semibold">Pembayaran lunas</p>
            <p className="mt-1 text-sm opacity-80">
                {payment?.method_label}{payment?.amount_label && ` · ${payment.amount_label}`}{payment?.reviewed_at && ` · dikonfirmasi ${payment.reviewed_at}`}
            </p>
            {payment?.proof && (
                <a href={payment.proof.url} target="_blank" rel="noreferrer"
                   className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline">
                    Bukti pembayaran: {payment.proof.name} <ExternalLinkIcon className="size-4"/>
                </a>
            )}
            <div>
                <Button asChild variant="link" className="mt-1 h-auto p-0 text-emerald-800 dark:text-emerald-300">
                    <Link href="/dashboard">Kembali ke dashboard <ArrowRightIcon/></Link>
                </Button>
            </div>
        </div>
    </div>
)

/** Still unpaid, e.g. registered at the school without paying. Proofs are only uploaded before an account exists. */
const Unpaid = ({summary})=>{

    const {sekolah} = usePage().props

    return (
        <div className="grid gap-4">
            {summary.note && (
                <div className="flex gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-950 dark:border-red-900 dark:bg-red-950/50 dark:text-red-50">
                    <TriangleAlertIcon className="size-7 shrink-0 text-red-600 dark:text-red-400"/>
                    <div>
                        <p className="font-semibold">Pembayaran ditolak panitia</p>
                        <p className="mt-1 text-sm whitespace-pre-line">{summary.note}</p>
                    </div>
                </div>
            )}
            <div className="flex gap-4 rounded-2xl border bg-card p-5 shadow-sm">
                <HandCoinsIcon className="size-7 shrink-0 text-primary"/>
                <div className="text-sm">
                    <p className="font-semibold">Biaya pendaftaran belum lunas</p>
                    <p className="mt-1 text-muted-foreground">
                        Bayar tunai di sekolah, atau transfer ke rekening di samping lalu tunjukkan bukti transfernya kepada
                        panitia PPDB. Panitia mencatat pembayaranmu, dan datamu bisa diajukan untuk finalisasi setelah lunas.
                    </p>
                    {sekolah.telepon && <p className="mt-2">Kontak panitia: <span className="font-semibold">{sekolah.telepon}</span></p>}
                </div>
            </div>
        </div>
    )
}

const Payment = ({summary, payment, rekening})=>(
    <>
        <PageHeader
            eyebrow="Pendaftaran"
            title="Pembayaran"
            description="Biaya pendaftaran dan status pembayaranmu."
            actions={<PaymentStatusBadge status={summary.status} label={summary.status_label} className="px-3 py-1 text-sm"/>}
        />

        <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-2">
                <BankAccount feeLabel={summary.fee_label} rekening={rekening} className="sm:p-8"/>
            </div>
            <div className="grid content-start gap-6 lg:col-span-3">
                {summary.status === 'diterima' ? <Paid payment={payment}/> : <Unpaid summary={summary}/>}
            </div>
        </div>
    </>
)

Payment.layout = page => <UserNav>{page}</UserNav>

export default Payment
