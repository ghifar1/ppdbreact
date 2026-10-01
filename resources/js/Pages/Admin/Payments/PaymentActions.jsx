import React, {useState} from "react";
import {router, useForm} from "@inertiajs/react";
import {CheckIcon, ExternalLinkIcon, FileIcon, ImageIcon, UserPlusIcon, XIcon} from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";
import FieldError from "@/components/FieldError";
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";

/** Opens an image proof in a dialog, a PDF in a new tab. */
export const ProofButton = ({proof, title})=>{

    const [open, setOpen] = useState(false)

    if (!proof) {
        return null
    }

    if (!proof.is_image) {
        return (
            <Button asChild variant="outline" size="sm">
                <a href={proof.url} target="_blank" rel="noreferrer"><FileIcon/> Lihat bukti <ExternalLinkIcon/></a>
            </Button>
        )
    }

    return (
        <>
            <Button variant="outline" size="sm" onClick={() => setOpen(true)}><ImageIcon/> Lihat bukti</Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="font-serif text-xl">{title}</DialogTitle>
                        <DialogDescription>{proof.name}</DialogDescription>
                    </DialogHeader>
                    <img src={proof.url} alt={`Bukti pembayaran ${title}`} className="max-h-[70vh] w-full rounded-lg border bg-muted object-contain"/>
                    <DialogFooter>
                        <Button asChild variant="outline"><a href={proof.url} target="_blank" rel="noreferrer">Buka di tab baru <ExternalLinkIcon/></a></Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

/** Accept a payment. For an applicant this creates their account, so it asks first. */
export const ConfirmPaymentButton = ({payment, size = 'sm', className})=>{

    const confirm = () => router.post(`/admin/pembayaran/${payment.id}/terima`, {}, {preserveScroll: true})

    if (!payment.applicant) {
        return <Button size={size} className={className} onClick={confirm}><CheckIcon/> Terima</Button>
    }

    return (
        <ConfirmDialog
            title={`Terima pembayaran ${payment.applicant.name}?`}
            description="Akun siswa dibuat dengan password acak. Setelah ini kartu login tampil untuk dicetak atau dikirim lewat WhatsApp; siswa juga bisa melihatnya dengan kode pengajuan."
            confirmLabel="Terima & buat akun"
            onConfirm={confirm}
        >
            <Button size={size} className={className}><UserPlusIcon/> Terima & buat akun</Button>
        </ConfirmDialog>
    )
}

/** Reject a payment with a reason the student sees. */
export const RejectPaymentButton = ({payment, studentName, size = 'sm', className})=>{

    const [open, setOpen] = useState(false)
    const form = useForm({note: ''})

    function submit(e)
    {
        e.preventDefault()
        form.post(`/admin/pembayaran/${payment.id}/tolak`, {
            preserveScroll: true,
            onSuccess: () => { setOpen(false); form.reset() },
        })
    }

    return (
        <>
            <Button variant="outline" size={size} className={className} onClick={() => setOpen(true)}>
                <XIcon className="text-destructive"/> Tolak
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-md">
                    <form onSubmit={submit} className="grid gap-4">
                        <DialogHeader>
                            <DialogTitle className="font-serif text-xl">Tolak pembayaran {studentName}?</DialogTitle>
                            <DialogDescription>Alasan ini terlihat di halaman status pendaftarannya, tempat bukti baru bisa dikirim.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-2">
                            <Label htmlFor={`reject-note-${payment.id}`}>Alasan</Label>
                            <Textarea id={`reject-note-${payment.id}`} rows={3} value={form.data.note} autoFocus
                                      placeholder="mis. Nominal transfer kurang, atau bukti tidak terbaca."
                                      aria-invalid={form.errors.note ? true : undefined}
                                      onChange={e => form.setData('note', e.target.value)}/>
                            <FieldError message={form.errors.note}/>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                            <Button type="submit" variant="destructive" disabled={form.processing}>Tolak pembayaran</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}
