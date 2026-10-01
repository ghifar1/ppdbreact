import React, {useState} from "react";
import {Link, useForm} from "@inertiajs/react";
import {
    ArrowRightIcon,
    BadgeCheckIcon,
    CheckIcon,
    CopyIcon,
    ExternalLinkIcon,
    HourglassIcon,
    LandmarkIcon,
    TriangleAlertIcon,
    UploadIcon,
} from "lucide-react";
import UserNav from "../../Layouts/UserNav";
import FieldError from "@/components/FieldError";
import PageHeader from "@/components/PageHeader";
import Pattern from "@/components/Pattern";
import PaymentStatusBadge from "@/components/PaymentStatusBadge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";

const CopyButton = ({text})=>{

    const [copied, setCopied] = useState(false)

    function copy()
    {
        navigator.clipboard?.writeText(text).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        })
    }

    return (
        <Button type="button" variant="outline-light" size="sm" onClick={copy} aria-label="Salin nomor rekening">
            {copied ? <><CheckIcon/> Tersalin</> : <><CopyIcon/> Salin</>}
        </Button>
    )
}

/** Where to pay: amount and bank account. */
const Instructions = ({summary, rekening})=>(
    <section className="relative overflow-hidden rounded-2xl bg-panel p-6 text-panel-foreground shadow-sm sm:p-8">
        <Pattern className="text-white/[0.06]"/>
        <div className="relative">
            <p className="text-xs font-semibold tracking-[0.16em] text-gold uppercase">Biaya pendaftaran</p>
            <p className="mt-1 font-serif text-4xl font-semibold text-white">{summary.fee_label}</p>

            {rekening.nomor ? (
                <div className="mt-6 rounded-xl bg-white/[0.07] p-4 ring-1 ring-white/15">
                    <p className="flex items-center gap-2 text-sm text-panel-foreground/80"><LandmarkIcon className="size-4"/> Transfer ke rekening</p>
                    {rekening.bank && <p className="mt-2 font-semibold text-white">{rekening.bank}</p>}
                    <div className="mt-1 flex flex-wrap items-center gap-3">
                        <p className="font-mono text-2xl font-semibold tracking-wider text-white">{rekening.nomor}</p>
                        <CopyButton text={rekening.nomor}/>
                    </div>
                    {rekening.nama && <p className="mt-1 text-sm text-panel-foreground/80">a.n. {rekening.nama}</p>}
                </div>
            ) : (
                <p className="mt-4 text-sm text-panel-foreground/80">Hubungi panitia PPDB untuk cara pembayaran.</p>
            )}

            {rekening.catatan && <p className="mt-4 text-sm whitespace-pre-line text-panel-foreground/85">{rekening.catatan}</p>}
        </div>
    </section>
)

const Status = ({summary, payment})=>{

    if (summary.status === 'diterima') {
        return (
            <div className="flex gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-50">
                <BadgeCheckIcon className="size-8 shrink-0 text-emerald-600 dark:text-emerald-400"/>
                <div>
                    <p className="font-semibold">Pembayaran lunas</p>
                    <p className="mt-1 text-sm opacity-80">
                        {payment?.method_label}{payment?.amount_label && ` · ${payment.amount_label}`}{payment?.reviewed_at && ` · dikonfirmasi ${payment.reviewed_at}`}
                    </p>
                    <Button asChild variant="link" className="mt-1 h-auto p-0 text-emerald-800 dark:text-emerald-300">
                        <Link href="/dashboard">Kembali ke dashboard <ArrowRightIcon/></Link>
                    </Button>
                </div>
            </div>
        )
    }

    if (summary.status === 'ditolak') {
        return (
            <div className="flex gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-950 dark:border-red-900 dark:bg-red-950/50 dark:text-red-50">
                <TriangleAlertIcon className="size-7 shrink-0 text-red-600 dark:text-red-400"/>
                <div>
                    <p className="font-semibold">Bukti pembayaran ditolak panitia</p>
                    {summary.note && <p className="mt-1 text-sm whitespace-pre-line">{summary.note}</p>}
                    <p className="mt-2 text-sm opacity-80">Unggah bukti pembayaran yang benar di bawah ini.</p>
                </div>
            </div>
        )
    }

    if (summary.status === 'menunggu') {
        return (
            <div className="flex gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-50">
                <HourglassIcon className="size-7 shrink-0 text-amber-600 dark:text-amber-400"/>
                <div>
                    <p className="font-semibold">Bukti terkirim, menunggu konfirmasi panitia</p>
                    <p className="mt-1 text-sm opacity-80">
                        Dikirim {payment?.submitted_at}. Sambil menunggu, kamu bisa melanjutkan mengisi formulir.
                    </p>
                </div>
            </div>
        )
    }

    return null
}

const UploadForm = ({summary, payment})=>{

    const form = useForm({sender_name: payment?.sender_name ?? '', proof: null})
    const [inputKey, setInputKey] = useState(0)

    function submit(e)
    {
        e.preventDefault()
        form.post('/pembayaran', {
            preserveScroll: true,
            onSuccess: () => { form.reset('proof'); setInputKey(key => key + 1) },
        })
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif text-lg">
                    <UploadIcon className="size-5 text-primary"/> {summary.status === 'belum' ? 'Unggah bukti pembayaran' : 'Ganti bukti pembayaran'}
                </CardTitle>
                <CardDescription>Foto atau tangkapan layar bukti transfer (JPG, PNG atau PDF, maksimal 2 MB).</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={submit} className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="sender_name">Nama pengirim</Label>
                        <Input id="sender_name" value={form.data.sender_name} autoComplete="name"
                               placeholder="Nama pemilik rekening yang mentransfer"
                               aria-invalid={form.errors.sender_name ? true : undefined}
                               onChange={e => form.setData('sender_name', e.target.value)}/>
                        <FieldError message={form.errors.sender_name}/>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="proof">Bukti pembayaran</Label>
                        <Input key={inputKey} id="proof" type="file" accept=".jpg,.jpeg,.png,.pdf"
                               aria-invalid={form.errors.proof ? true : undefined}
                               onChange={e => form.setData('proof', e.target.files[0] ?? null)}/>
                        {form.progress && (
                            <progress value={form.progress.percentage} max="100" className="h-1.5 w-full overflow-hidden rounded-full accent-primary">
                                {form.progress.percentage}%
                            </progress>
                        )}
                        <FieldError message={form.errors.proof}/>
                    </div>
                    <div>
                        <Button type="submit" variant="gold" size="lg" disabled={form.processing}><UploadIcon/> Kirim bukti pembayaran</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}

const Payment = ({summary, payment, rekening, canUpload})=>(
    <>
        <PageHeader
            eyebrow="Pendaftaran"
            title="Pembayaran"
            description="Bayar biaya pendaftaran, lalu unggah bukti transfernya. Panitia akan memeriksa dan mengonfirmasi pembayaranmu."
            actions={<PaymentStatusBadge status={summary.status} label={summary.status_label} className="px-3 py-1 text-sm"/>}
        />

        <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-2">
                <Instructions summary={summary} rekening={rekening}/>
            </div>
            <div className="grid content-start gap-6 lg:col-span-3">
                <Status summary={summary} payment={payment}/>
                {payment?.proof && (
                    <a href={payment.proof.url} target="_blank" rel="noreferrer"
                       className="inline-flex items-center gap-2 self-start text-sm font-medium text-primary underline-offset-4 hover:underline">
                        Bukti yang terkirim: {payment.proof.name} <ExternalLinkIcon className="size-4"/>
                    </a>
                )}
                {canUpload && <UploadForm summary={summary} payment={payment}/>}
            </div>
        </div>
    </>
)

Payment.layout = page => <UserNav>{page}</UserNav>

export default Payment
