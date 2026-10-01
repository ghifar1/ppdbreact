import React from "react";
import {Head, Link, useForm} from "@inertiajs/react";
import {SearchIcon} from "lucide-react";
import AuthLayout from "../../Layouts/AuthLayout";
import FieldError from "@/components/FieldError";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";

/** Find a submission by the tracking code given after sending the payment proof. */
const CekPendaftaran = ()=>{

    const form = useForm({code: ''})

    function submit(e)
    {
        e.preventDefault()
        form.post('/cek-pendaftaran')
    }

    return (
        <>
            <Head title="Cek status pendaftaran"/>
            <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">Pendaftaran siswa baru</p>
            <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight">Cek status pendaftaran</h1>
            <p className="mt-2 text-sm text-muted-foreground">
                Masukkan kode pengajuan yang kamu terima setelah mengirim bukti pembayaran. Setelah pembayaran
                diperiksa, username dan password akunmu tampil di sana.
            </p>

            <form onSubmit={submit} className="mt-8 grid gap-5">
                <div className="grid gap-2">
                    <Label htmlFor="code">Kode pengajuan</Label>
                    <Input id="code" value={form.data.code} placeholder="ABCDE-FGHJK" autoComplete="off"
                           className="h-11 font-mono text-lg tracking-widest uppercase"
                           aria-invalid={form.errors.code ? true : undefined}
                           onChange={e => form.setData('code', e.target.value)}/>
                    <FieldError message={form.errors.code}/>
                </div>
                <Button type="submit" size="lg" className="h-11" disabled={form.processing}><SearchIcon/> Cek status</Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
                Belum mendaftar? <Link href="/register" className="font-semibold text-primary hover:underline">Daftar sekarang</Link>
            </p>
        </>
    )
}

CekPendaftaran.layout = page => <AuthLayout>{page}</AuthLayout>

export default CekPendaftaran
