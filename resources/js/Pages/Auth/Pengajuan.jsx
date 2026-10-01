import React, {useState} from "react";
import {Head, Link, useForm} from "@inertiajs/react";
import {
    BadgeCheckIcon,
    CheckIcon,
    CopyIcon,
    HourglassIcon,
    LogInIcon,
    TriangleAlertIcon,
    UploadIcon,
} from "lucide-react";
import AuthLayout from "../../Layouts/AuthLayout";
import BankAccount from "@/components/BankAccount";
import FieldError from "@/components/FieldError";
import FlashMessage from "@/components/FlashMessage";
import JenjangBadge from "@/components/JenjangBadge";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";

const CodeBox = ({code})=>{

    const [copied, setCopied] = useState(false)

    function copy()
    {
        navigator.clipboard?.writeText(code).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        })
    }

    return (
        <div className="rounded-xl border-2 border-dashed border-gold/60 bg-gold-soft/50 px-4 py-3">
            <p className="text-xs font-semibold tracking-wider text-gold-foreground uppercase dark:text-gold">Kode pengajuan</p>
            <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                <p className="font-mono text-2xl font-semibold tracking-widest">{code}</p>
                <Button type="button" variant="outline" size="sm" onClick={copy}>
                    {copied ? <><CheckIcon/> Tersalin</> : <><CopyIcon/> Salin</>}
                </Button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Simpan kode ini atau tandai halaman ini untuk melihat status pendaftaranmu.</p>
        </div>
    )
}

const Status = ({pengajuan})=>{

    if (pengajuan.status === 'diterima') {
        return (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-50">
                <p className="flex items-center gap-2 font-semibold"><BadgeCheckIcon className="size-5 text-emerald-600 dark:text-emerald-400"/> Pembayaran diterima, akunmu sudah dibuat</p>
                {pengajuan.account && (
                    <dl className="mt-3 grid gap-2 rounded-lg bg-white/80 p-3 text-sm dark:bg-black/20">
                        <div className="flex justify-between gap-3"><dt className="opacity-75">Username</dt><dd className="font-mono font-semibold">{pengajuan.account.username}</dd></div>
                        {pengajuan.account.password && (
                            <div className="flex justify-between gap-3"><dt className="opacity-75">Password</dt><dd className="font-mono font-semibold tracking-wider">{pengajuan.account.password}</dd></div>
                        )}
                    </dl>
                )}
                <p className="mt-3 text-sm opacity-85">
                    {pengajuan.account?.password
                        ? 'Catat username dan password ini. Password tidak ditampilkan lagi setelah kamu masuk.'
                        : 'Masuk dengan username di atas dan password dari panitia. Lupa password? Hubungi panitia PPDB.'}
                </p>
                <Button asChild className="mt-3 w-full"><Link href="/login"><LogInIcon/> Masuk dan isi formulir</Link></Button>
            </div>
        )
    }

    if (pengajuan.status === 'ditolak') {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-950 dark:border-red-900 dark:bg-red-950/50 dark:text-red-50">
                <p className="flex items-center gap-2 font-semibold"><TriangleAlertIcon className="size-5 text-red-600 dark:text-red-400"/> Bukti pembayaran ditolak</p>
                {pengajuan.note && <p className="mt-2 text-sm whitespace-pre-line">{pengajuan.note}</p>}
                <p className="mt-2 text-sm opacity-80">Kirim bukti pembayaran yang benar di bawah ini.</p>
            </div>
        )
    }

    return (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-50">
            <p className="flex items-center gap-2 font-semibold"><HourglassIcon className="size-5 text-amber-600 dark:text-amber-400"/> Menunggu pemeriksaan panitia</p>
            <p className="mt-2 text-sm opacity-85">
                Bukti dikirim {pengajuan.submitted_at}. Setelah pembayaran diperiksa, panitia membuat akunmu dan
                username serta password tampil di halaman ini.
            </p>
        </div>
    )
}

/** Send a new proof after a rejection, or replace a wrong file. */
const UploadForm = ({pengajuan, code})=>{

    const form = useForm({sender_name: pengajuan.sender_name ?? '', proof: null})
    const [inputKey, setInputKey] = useState(0)

    function submit(e)
    {
        e.preventDefault()
        form.post(`/pengajuan/${code}`, {
            preserveScroll: true,
            onSuccess: () => { form.reset('proof'); setInputKey(key => key + 1) },
        })
    }

    return (
        <form onSubmit={submit} className="grid gap-4 rounded-xl border p-4">
            <p className="font-semibold">{pengajuan.status === 'ditolak' ? 'Kirim ulang bukti pembayaran' : 'Salah unggah? Ganti bukti pembayaran'}</p>
            <div className="grid gap-2">
                <Label htmlFor="sender_name">Nama pengirim transfer</Label>
                <Input id="sender_name" value={form.data.sender_name} aria-invalid={form.errors.sender_name ? true : undefined}
                       onChange={e => form.setData('sender_name', e.target.value)}/>
                <FieldError message={form.errors.sender_name}/>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="proof">Bukti pembayaran</Label>
                <Input key={inputKey} id="proof" type="file" accept=".jpg,.jpeg,.png,.pdf"
                       aria-invalid={form.errors.proof ? true : undefined}
                       onChange={e => form.setData('proof', e.target.files[0] ?? null)}/>
                <FieldError message={form.errors.proof}/>
            </div>
            <Button type="submit" variant={pengajuan.status === 'ditolak' ? 'default' : 'outline'} disabled={form.processing}>
                <UploadIcon/> Kirim bukti pembayaran
            </Button>
        </form>
    )
}

/** Where an applicant follows their payment until the committee creates their account. */
const Pengajuan = ({pengajuan, rekening})=>{

    const code = pengajuan.code.replace('-', '')

    return (
        <>
            <Head title="Status pendaftaran"/>
            <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">Status pendaftaran</p>
            <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight">{pengajuan.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <JenjangBadge jenjang={pengajuan.jenjang_kode}>{pengajuan.jenjang}</JenjangBadge>
                {pengajuan.gelombang && <span>{pengajuan.gelombang}</span>}
            </div>

            <FlashMessage/>

            <div className="mt-6 grid gap-5">
                <CodeBox code={pengajuan.code}/>
                <Status pengajuan={pengajuan}/>

                <dl className="grid gap-2 text-sm">
                    {pengajuan.amount_label && <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Biaya pendaftaran</dt><dd className="font-semibold">{pengajuan.amount_label}</dd></div>}
                    {pengajuan.sender_name && <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Pengirim</dt><dd>{pengajuan.sender_name}</dd></div>}
                    {pengajuan.proof_name && <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Berkas bukti</dt><dd className="truncate">{pengajuan.proof_name}</dd></div>}
                    <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Dikirim</dt><dd>{pengajuan.submitted_at}</dd></div>
                </dl>

                {pengajuan.status === 'ditolak' && <BankAccount feeLabel={pengajuan.amount_label} rekening={rekening}/>}
                {pengajuan.canUpload && <UploadForm pengajuan={pengajuan} code={code}/>}
            </div>
        </>
    )
}

Pengajuan.layout = page => <AuthLayout>{page}</AuthLayout>

export default Pengajuan
