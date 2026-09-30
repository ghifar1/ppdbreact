import React, {useState} from "react";
import {router, useForm} from "@inertiajs/react";
import {
    AlignLeftIcon,
    ArrowDownIcon,
    ArrowUpIcon,
    AtSignIcon,
    CalendarIcon,
    CircleDotIcon,
    EyeIcon,
    HashIcon,
    ListIcon,
    PaperclipIcon,
    PencilIcon,
    PhoneIcon,
    PlusIcon,
    SquareCheckIcon,
    Trash2Icon,
    TypeIcon,
} from "lucide-react";
import AdminNav from "../../../Layouts/AdminNav";
import ConfirmDialog from "@/components/ConfirmDialog";
import FieldError from "@/components/FieldError";
import FormFieldInput from "@/components/FormFieldInput";
import JenjangBadge from "@/components/JenjangBadge";
import PageHeader from "@/components/PageHeader";
import FieldDialog from "./FieldDialog";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Switch} from "@/components/ui/switch";
import {Textarea} from "@/components/ui/textarea";

const typeIcons = {
    text: TypeIcon,
    textarea: AlignLeftIcon,
    number: HashIcon,
    email: AtSignIcon,
    tel: PhoneIcon,
    date: CalendarIcon,
    select: ListIcon,
    radio: CircleDotIcon,
    checkbox: SquareCheckIcon,
    file: PaperclipIcon,
}

const MenuSettings = ({menu})=>{

    const form = useForm({
        title: menu.title,
        description: menu.description ?? '',
        is_active: menu.is_active,
    })

    function submit(e)
    {
        e.preventDefault()
        form.put(`/admin/menu/${menu.id}`, {preserveScroll: true})
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-serif text-lg">Pengaturan menu</CardTitle>
                <CardDescription>Judul dan keterangan yang dilihat siswa.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={submit} className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="menu-title">Judul menu</Label>
                        <Input id="menu-title" value={form.data.title}
                               aria-invalid={form.errors.title ? true : undefined}
                               onChange={e => form.setData('title', e.target.value)}/>
                        <FieldError message={form.errors.title}/>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="menu-description">Keterangan untuk siswa (opsional)</Label>
                        <Textarea id="menu-description" rows={3} value={form.data.description}
                                  placeholder="Ditampilkan di atas formulir"
                                  onChange={e => form.setData('description', e.target.value)}/>
                        <FieldError message={form.errors.description}/>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2.5">
                        <Switch id="menu-active" checked={form.data.is_active}
                                onCheckedChange={checked => form.setData('is_active', checked)}/>
                        <Label htmlFor="menu-active" className="font-normal">Tampilkan menu ini ke siswa</Label>
                    </div>
                    <div>
                        <Button type="submit" className="w-full" disabled={form.processing}>Simpan pengaturan</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}

const Preview = ({menu, fields})=>{

    const [values, setValues] = useState({})

    return (
        <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
            <div className="flex items-center gap-3 border-b px-6 py-4">
                <EyeIcon className="size-5 text-primary"/>
                <div>
                    <h2 className="font-serif text-lg font-semibold">Pratinjau</h2>
                    <p className="text-sm text-muted-foreground">Tampilan formulir ini di halaman siswa. Isian di sini tidak disimpan.</p>
                </div>
            </div>
            {menu.description && (
                <p className="border-b bg-secondary/60 px-6 py-3 text-sm whitespace-pre-line text-secondary-foreground">{menu.description}</p>
            )}
            <div className="grid gap-x-6 gap-y-5 p-6 sm:grid-cols-2">
                {fields.length === 0 && <p className="text-sm text-muted-foreground">Belum ada isian.</p>}
                {fields.map(field => (
                    <FormFieldInput
                        key={field.id}
                        field={{...field, required: field.is_required, help: field.help_text}}
                        value={values[field.id]}
                        onChange={value => setValues(current => ({...current, [field.id]: value}))}
                    />
                ))}
            </div>
        </section>
    )
}

const Edit = ({menu, fields, fieldTypes})=>{

    const [dialog, setDialog] = useState({open: false, field: null})

    const move = (field, direction) => router.post(`/admin/isian/${field.id}/move`, {direction}, {preserveScroll: true})
    const destroy = field => router.delete(`/admin/isian/${field.id}`, {preserveScroll: true})

    return (
        <>
            <PageHeader
                back={{href: `/admin/menu?jenjang=${menu.jenjang}`, label: `Daftar menu ${menu.jenjang_label}`}}
                headTitle={menu.title}
                title={<span className="flex flex-wrap items-center gap-3">
                    {menu.title}
                    {!menu.is_active && <Badge variant="outline" className="font-sans">Disembunyikan</Badge>}
                </span>}
                description={<JenjangBadge jenjang={menu.jenjang}>{menu.jenjang_label}</JenjangBadge>}
                actions={<Button onClick={() => setDialog({open: true, field: null})}><PlusIcon/> Tambah isian</Button>}
            />

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="grid content-start gap-6 lg:col-span-2">
                    <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                        <div className="border-b px-6 py-4">
                            <h2 className="font-serif text-lg font-semibold">Isian formulir</h2>
                            <p className="text-sm text-muted-foreground">{fields.length} pertanyaan, diisi siswa sesuai urutan di bawah.</p>
                        </div>
                        {fields.length === 0 && (
                            <p className="px-6 py-10 text-center text-sm text-muted-foreground">
                                Belum ada isian. Klik <b>Tambah isian</b> untuk membuat pertanyaan pertama.
                            </p>
                        )}
                        <ul className="divide-y">
                            {fields.map((field, i) => {
                                const Icon = typeIcons[field.type] ?? TypeIcon

                                return (
                                    <li key={field.id} className="flex items-center gap-3 px-4 py-3 sm:px-6">
                                        <div className="flex flex-col">
                                            <Button variant="ghost" size="icon-xs" disabled={i === 0} aria-label="Naikkan"
                                                    onClick={() => move(field, 'up')}><ArrowUpIcon/></Button>
                                            <Button variant="ghost" size="icon-xs" disabled={i === fields.length - 1} aria-label="Turunkan"
                                                    onClick={() => move(field, 'down')}><ArrowDownIcon/></Button>
                                        </div>
                                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary" title={field.type_label}>
                                            <Icon className="size-4"/>
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium">
                                                {field.label}
                                                {field.is_required && <span className="ml-1 font-bold text-destructive">*</span>}
                                            </p>
                                            <p className="truncate text-xs text-muted-foreground">
                                                {field.type_label}
                                                {field.options.length > 0 && ` · ${field.options.join(', ')}`}
                                                {' · '}{field.answers_count} jawaban
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 gap-1">
                                            <Button variant="ghost" size="icon-sm" aria-label={`Ubah ${field.label}`}
                                                    onClick={() => setDialog({open: true, field})}><PencilIcon/></Button>
                                            <ConfirmDialog
                                                title={`Hapus isian "${field.label}"?`}
                                                description={field.answers_count > 0
                                                    ? `${field.answers_count} jawaban siswa untuk isian ini akan ikut terhapus.`
                                                    : 'Isian ini akan dihapus dari formulir.'}
                                                confirmLabel="Hapus isian"
                                                destructive
                                                onConfirm={() => destroy(field)}
                                            >
                                                <Button variant="ghost" size="icon-sm" aria-label={`Hapus ${field.label}`}>
                                                    <Trash2Icon className="text-destructive"/>
                                                </Button>
                                            </ConfirmDialog>
                                        </div>
                                    </li>
                                )
                            })}
                        </ul>
                        <div className="border-t bg-muted/40 px-6 py-3">
                            <Button variant="ghost" size="sm" onClick={() => setDialog({open: true, field: null})}>
                                <PlusIcon/> Tambah isian
                            </Button>
                        </div>
                    </section>

                    <Preview menu={menu} fields={fields}/>
                </div>

                <div className="content-start lg:sticky lg:top-22">
                    <MenuSettings key={menu.id} menu={menu}/>
                </div>
            </div>

            <FieldDialog
                open={dialog.open}
                onOpenChange={open => setDialog(current => ({...current, open}))}
                menuId={menu.id}
                field={dialog.field}
                fieldTypes={fieldTypes}
            />
        </>
    )
}

Edit.layout = page => <AdminNav>{page}</AdminNav>

export default Edit
