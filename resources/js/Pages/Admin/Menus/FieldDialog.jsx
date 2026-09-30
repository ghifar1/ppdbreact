import React, {useEffect} from "react";
import {useForm} from "@inertiajs/react";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Textarea} from "@/components/ui/textarea";

const emptyField = {label: '', type: 'text', options: [], is_required: false, placeholder: '', help_text: ''}

const toFormData = field => ({
    label: field.label,
    type: field.type,
    options: (field.options ?? []).join('\n'),
    is_required: field.is_required,
    placeholder: field.placeholder ?? '',
    help_text: field.help_text ?? '',
})

const FieldError = ({message}) => message ? <p className="text-sm text-red-600 dark:text-red-400">{message}</p> : null

/**
 * Add or edit one form field. `field` is null when adding a new one.
 */
const FieldDialog = ({open, onOpenChange, menuId, field, fieldTypes})=>{

    const form = useForm(toFormData(emptyField))
    const type = fieldTypes.find(option => option.value === form.data.type)
    const supportsPlaceholder = ['text', 'textarea', 'number', 'email', 'tel', 'select'].includes(form.data.type)

    useEffect(() => {
        if (open) {
            form.setData(toFormData(field ?? emptyField))
            form.clearErrors()
        }
    }, [open, field])

    function submit(e)
    {
        e.preventDefault()
        const options = {preserveScroll: true, onSuccess: () => onOpenChange(false)}
        field
            ? form.put(`/admin/isian/${field.id}`, options)
            : form.post(`/admin/menu/${menuId}/isian`, options)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <form onSubmit={submit} className="grid gap-4">
                    <DialogHeader>
                        <DialogTitle>{field ? 'Ubah isian' : 'Tambah isian'}</DialogTitle>
                        <DialogDescription>Pertanyaan yang akan diisi siswa di menu ini.</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-2">
                        <Label htmlFor="field-label">Label / pertanyaan</Label>
                        <Input id="field-label" value={form.data.label} placeholder='mis. "Nama Ayah"'
                               aria-invalid={form.errors.label ? true : undefined}
                               onChange={e => form.setData('label', e.target.value)}/>
                        <FieldError message={form.errors.label}/>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="field-type">Tipe isian</Label>
                        <Select value={form.data.type} onValueChange={value => form.setData('type', value)}>
                            <SelectTrigger id="field-type" className="w-full">
                                <SelectValue/>
                            </SelectTrigger>
                            <SelectContent>
                                {fieldTypes.map(option => (
                                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {field && field.type !== form.data.type && field.answers_count > 0
                            && ['file', 'checkbox'].some(t => t === field.type || t === form.data.type) && (
                            <p className="text-sm text-amber-700 dark:text-amber-400">
                                Mengganti tipe ini akan menghapus {field.answers_count} jawaban siswa yang sudah ada.
                            </p>
                        )}
                        <FieldError message={form.errors.type}/>
                    </div>

                    {type?.hasOptions && (
                        <div className="grid gap-2">
                            <Label htmlFor="field-options">Pilihan jawaban</Label>
                            <Textarea id="field-options" rows={5} value={form.data.options}
                                      placeholder={'Satu pilihan per baris, mis.\nLaki-Laki\nPerempuan'}
                                      aria-invalid={form.errors.options ? true : undefined}
                                      onChange={e => form.setData('options', e.target.value)}/>
                            <p className="text-xs text-muted-foreground">Tulis satu pilihan per baris.</p>
                            <FieldError message={form.errors.options}/>
                        </div>
                    )}

                    {supportsPlaceholder && (
                        <div className="grid gap-2">
                            <Label htmlFor="field-placeholder">Contoh isian (opsional)</Label>
                            <Input id="field-placeholder" value={form.data.placeholder}
                                   placeholder="Teks samar di dalam kotak isian"
                                   onChange={e => form.setData('placeholder', e.target.value)}/>
                            <FieldError message={form.errors.placeholder}/>
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="field-help">Keterangan (opsional)</Label>
                        <Input id="field-help" value={form.data.help_text}
                               placeholder="Petunjuk kecil di bawah isian"
                               onChange={e => form.setData('help_text', e.target.value)}/>
                        <FieldError message={form.errors.help_text}/>
                    </div>

                    <div className="flex items-center gap-2">
                        <Checkbox id="field-required" checked={form.data.is_required}
                                  onCheckedChange={checked => form.setData('is_required', checked === true)}/>
                        <Label htmlFor="field-required" className="font-normal">Wajib diisi (tanda <span className="text-red-500 font-bold">*</span>)</Label>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
                        <Button type="submit" disabled={form.processing}>{field ? 'Simpan' : 'Tambah'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default FieldDialog
