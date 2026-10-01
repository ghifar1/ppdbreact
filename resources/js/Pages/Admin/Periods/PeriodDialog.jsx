import React, {useEffect} from "react";
import {useForm} from "@inertiajs/react";
import FieldError from "@/components/FieldError";
import RupiahInput from "@/components/RupiahInput";
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Textarea} from "@/components/ui/textarea";

const ALL = 'semua'

const toFormData = period => ({
    name: period?.name ?? '',
    jenjang: period?.jenjang ?? ALL,
    opens_at: period?.opens_at ?? '',
    closes_at: period?.closes_at ?? '',
    fee: period?.fee ?? '',
    description: period?.description ?? '',
})

/**
 * Add or edit a registration period. `period` is null when adding.
 */
const PeriodDialog = ({open, onOpenChange, period, jenjangOptions})=>{

    const form = useForm(toFormData(null))

    useEffect(() => {
        if (open) {
            form.setData(toFormData(period))
            form.clearErrors()
        }
    }, [open, period])

    function submit(e)
    {
        e.preventDefault()
        const options = {preserveScroll: true, onSuccess: () => onOpenChange(false)}
        period
            ? form.put(`/admin/gelombang/${period.id}`, options)
            : form.post('/admin/gelombang', options)
    }

    const input = (key, props = {}) => (
        <Input id={`period-${key}`} value={form.data[key]} aria-invalid={form.errors[key] ? true : undefined}
               onChange={e => form.setData(key, e.target.value)} {...props}/>
    )

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <form onSubmit={submit} className="grid gap-4">
                    <DialogHeader>
                        <DialogTitle className="font-serif text-xl">{period ? 'Ubah gelombang' : 'Tambah gelombang'}</DialogTitle>
                        <DialogDescription>Siswa hanya bisa mendaftar saat ada gelombang yang dibuka untuk jenjangnya.</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-2">
                        <Label htmlFor="period-name">Nama gelombang</Label>
                        {input('name', {placeholder: 'mis. "Gelombang 1"'})}
                        <FieldError message={form.errors.name}/>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="period-jenjang">Jenjang</Label>
                        <Select value={form.data.jenjang} onValueChange={value => form.setData('jenjang', value)}>
                            <SelectTrigger id="period-jenjang" className="w-full"><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>Semua jenjang</SelectItem>
                                {jenjangOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <FieldError message={form.errors.jenjang}/>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid content-start gap-2">
                            <Label htmlFor="period-opens_at">Dibuka</Label>
                            {input('opens_at', {type: 'datetime-local'})}
                            <FieldError message={form.errors.opens_at}/>
                        </div>
                        <div className="grid content-start gap-2">
                            <Label htmlFor="period-closes_at">Ditutup</Label>
                            {input('closes_at', {type: 'datetime-local'})}
                            <FieldError message={form.errors.closes_at}/>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="period-fee">Biaya pendaftaran (opsional)</Label>
                        <RupiahInput id="period-fee" value={form.data.fee} aria-invalid={form.errors.fee ? true : undefined}
                                     onChange={value => form.setData('fee', value)}/>
                        <p className="text-xs text-muted-foreground">Kosongkan untuk memakai biaya jenjang di Pengaturan Seleksi. Isi 0 jika gelombang ini gratis.</p>
                        <FieldError message={form.errors.fee}/>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="period-description">Keterangan (opsional)</Label>
                        <Textarea id="period-description" rows={3} value={form.data.description}
                                  placeholder="mis. syarat khusus gelombang ini"
                                  onChange={e => form.setData('description', e.target.value)}/>
                        <FieldError message={form.errors.description}/>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
                        <Button type="submit" disabled={form.processing}>{period ? 'Simpan' : 'Tambah'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default PeriodDialog
