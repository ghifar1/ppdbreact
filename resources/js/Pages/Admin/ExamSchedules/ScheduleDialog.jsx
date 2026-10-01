import React, {useEffect} from "react";
import {useForm} from "@inertiajs/react";
import FieldError from "@/components/FieldError";
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Textarea} from "@/components/ui/textarea";

const ALL = 'semua'

const toFormData = item => ({
    title: item?.title ?? '',
    description: item?.description ?? '',
    jenjang: item?.jenjang ?? ALL,
    registration_period_id: item?.registration_period_id ? String(item.registration_period_id) : ALL,
    date: item?.date ?? '',
    starts_at: item?.starts_at ?? '',
    ends_at: item?.ends_at ?? '',
    location: item?.location ?? '',
    number_from: item?.number_from ?? '',
    number_to: item?.number_to ?? '',
})

/**
 * Add or edit an exam schedule item. `item` is null when adding; `copy`
 * prefills a new item from an existing one (for the next session).
 */
const ScheduleDialog = ({open, onOpenChange, item, copy, jenjangOptions, periodOptions})=>{

    const form = useForm(toFormData(null))

    useEffect(() => {
        if (open) {
            form.setData(toFormData(item ?? copy))
            form.clearErrors()
        }
    }, [open, item, copy])

    function submit(e)
    {
        e.preventDefault()
        const options = {preserveScroll: true, onSuccess: () => onOpenChange(false)}
        item
            ? form.put(`/admin/jadwal-ujian/${item.id}`, options)
            : form.post('/admin/jadwal-ujian', options)
    }

    const field = (key, label, props = {}, hint) => (
        <div className="grid content-start gap-2">
            <Label htmlFor={`exam-${key}`}>{label}</Label>
            <Input id={`exam-${key}`} value={form.data[key]} aria-invalid={form.errors[key] ? true : undefined}
                   onChange={e => form.setData(key, e.target.value)} {...props}/>
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
            <FieldError message={form.errors[key]}/>
        </div>
    )

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-xl">
                <form onSubmit={submit} className="grid gap-4">
                    <DialogHeader>
                        <DialogTitle className="font-serif text-xl">{item ? 'Ubah jadwal ujian' : 'Tambah jadwal ujian'}</DialogTitle>
                        <DialogDescription>Tampil di kartu ujian siswa yang sesuai jenjang, gelombang dan nomor pesertanya.</DialogDescription>
                    </DialogHeader>

                    {field('title', 'Kegiatan', {placeholder: 'mis. Tes Baca Tulis Al-Qur\'an'})}

                    <div className="grid gap-2">
                        <Label htmlFor="exam-description">Keterangan (opsional)</Label>
                        <Textarea id="exam-description" rows={2} value={form.data.description}
                                  placeholder="mis. Matematika, Bahasa Indonesia, Bahasa Inggris, IPA dan IPS"
                                  onChange={e => form.setData('description', e.target.value)}/>
                        <FieldError message={form.errors.description}/>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        {field('date', 'Tanggal', {type: 'date'})}
                        {field('starts_at', 'Mulai', {type: 'time'})}
                        {field('ends_at', 'Selesai', {type: 'time'}, 'Kosongkan jika "sampai selesai".')}
                    </div>

                    {field('location', 'Tempat', {placeholder: 'mis. Ruang 1, Gedung A lt. 2, atau "Online"'})}

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid content-start gap-2">
                            <Label htmlFor="exam-jenjang">Jenjang</Label>
                            <Select value={form.data.jenjang} onValueChange={value => form.setData('jenjang', value)}>
                                <SelectTrigger id="exam-jenjang" className="w-full"><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ALL}>Semua jenjang</SelectItem>
                                    {jenjangOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FieldError message={form.errors.jenjang}/>
                        </div>
                        <div className="grid content-start gap-2">
                            <Label htmlFor="exam-period">Gelombang</Label>
                            <Select value={form.data.registration_period_id} onValueChange={value => form.setData('registration_period_id', value)}>
                                <SelectTrigger id="exam-period" className="w-full"><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ALL}>Semua gelombang</SelectItem>
                                    {periodOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FieldError message={form.errors.registration_period_id}/>
                        </div>
                    </div>

                    <fieldset className="grid gap-3 rounded-xl border border-dashed p-4">
                        <legend className="px-1 text-sm font-medium">Sesi / ruang (opsional)</legend>
                        <p className="-mt-1 text-xs text-muted-foreground">
                            Isi rentang nomor peserta jika kegiatan dibagi per sesi atau ruang, mis. 1–60 untuk Sesi 1.
                            Kosongkan agar berlaku untuk semua peserta.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            {field('number_from', 'Dari nomor', {type: 'number', min: 1, inputMode: 'numeric'})}
                            {field('number_to', 'Sampai nomor', {type: 'number', min: 1, inputMode: 'numeric'})}
                        </div>
                    </fieldset>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
                        <Button type="submit" disabled={form.processing}>{item ? 'Simpan' : 'Tambah'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default ScheduleDialog
