import React, {useState} from "react";
import {Link, router, useForm} from "@inertiajs/react";
import {ArrowDownIcon, ArrowLeftIcon, ArrowUpIcon, PencilIcon, PlusIcon, Trash2Icon} from "lucide-react";
import AdminNav from "../../../Layouts/AdminNav";
import {PageTitle} from "../../../Layouts/PageTitle";
import ConfirmDialog from "@/components/ConfirmDialog";
import FormFieldInput from "@/components/FormFieldInput";
import FieldDialog from "./FieldDialog";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Switch} from "@/components/ui/switch";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Textarea} from "@/components/ui/textarea";

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
                <CardTitle>Pengaturan menu</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={submit} className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="menu-title">Judul menu</Label>
                        <Input id="menu-title" value={form.data.title}
                               aria-invalid={form.errors.title ? true : undefined}
                               onChange={e => form.setData('title', e.target.value)}/>
                        {form.errors.title && <p className="text-sm text-red-600 dark:text-red-400">{form.errors.title}</p>}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="menu-description">Keterangan untuk siswa (opsional)</Label>
                        <Textarea id="menu-description" rows={3} value={form.data.description}
                                  placeholder="Ditampilkan di atas formulir"
                                  onChange={e => form.setData('description', e.target.value)}/>
                        {form.errors.description && <p className="text-sm text-red-600 dark:text-red-400">{form.errors.description}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                        <Switch id="menu-active" checked={form.data.is_active}
                                onCheckedChange={checked => form.setData('is_active', checked)}/>
                        <Label htmlFor="menu-active" className="font-normal">Tampilkan menu ini ke siswa</Label>
                    </div>
                    <div>
                        <Button type="submit" disabled={form.processing}>Simpan pengaturan</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}

const Preview = ({menu, fields})=>{

    const [values, setValues] = useState({})

    return (
        <Card>
            <CardHeader>
                <CardTitle>Pratinjau</CardTitle>
                <CardDescription>Tampilan formulir ini di halaman siswa. Isian di sini tidak disimpan.</CardDescription>
            </CardHeader>
            <CardContent>
                {menu.description && <p className="mb-2 text-sm">{menu.description}</p>}
                {fields.length === 0 && <p className="text-sm text-muted-foreground">Belum ada isian.</p>}
                {fields.map(field => (
                    <FormFieldInput
                        key={field.id}
                        field={{...field, required: field.is_required, help: field.help_text}}
                        value={values[field.id]}
                        onChange={value => setValues(current => ({...current, [field.id]: value}))}
                    />
                ))}
            </CardContent>
        </Card>
    )
}

const Edit = ({menu, fields, fieldTypes})=>{

    const [dialog, setDialog] = useState({open: false, field: null})

    const move = (field, direction) => router.post(`/admin/isian/${field.id}/move`, {direction}, {preserveScroll: true})
    const destroy = field => router.delete(`/admin/isian/${field.id}`, {preserveScroll: true})

    return (
        <>
            <div className="mt-6">
                <Link href={`/admin/menu?jenjang=${menu.jenjang}`}
                      className="inline-flex items-center gap-1 text-sm text-purple-600 hover:underline dark:text-purple-400">
                    <ArrowLeftIcon className="w-4 h-4"/> Daftar menu {menu.jenjang_label}
                </Link>
            </div>
            <PageTitle>
                {menu.title} {!menu.is_active && <Badge variant="outline" className="align-middle">Disembunyikan</Badge>}
            </PageTitle>

            <div className="grid gap-6 mb-8 lg:grid-cols-3">
                <div className="grid gap-6 lg:col-span-2 content-start">
                    <Card>
                        <CardHeader className="flex flex-row items-start justify-between gap-4">
                            <div className="grid gap-2">
                                <CardTitle>Isian formulir</CardTitle>
                                <CardDescription>Pertanyaan yang diisi siswa, sesuai urutan di bawah.</CardDescription>
                            </div>
                            <Button onClick={() => setDialog({open: true, field: null})}><PlusIcon/> Tambah isian</Button>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-24">Urutan</TableHead>
                                        <TableHead>Label</TableHead>
                                        <TableHead>Tipe</TableHead>
                                        <TableHead className="w-24">Jawaban</TableHead>
                                        <TableHead className="w-28 text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fields.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                                                Belum ada isian. Klik <b>Tambah isian</b> untuk membuat pertanyaan pertama.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {fields.map((field, i) => (
                                        <TableRow key={field.id}>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    <Button variant="ghost" size="icon-sm" disabled={i === 0} aria-label="Naikkan"
                                                            onClick={() => move(field, 'up')}><ArrowUpIcon/></Button>
                                                    <Button variant="ghost" size="icon-sm" disabled={i === fields.length - 1} aria-label="Turunkan"
                                                            onClick={() => move(field, 'down')}><ArrowDownIcon/></Button>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium whitespace-normal">
                                                {field.label}
                                                {field.is_required && <span className="ml-1 text-red-500 font-bold">*</span>}
                                                {field.options.length > 0 && (
                                                    <p className="text-xs font-normal text-muted-foreground">{field.options.join(' · ')}</p>
                                                )}
                                            </TableCell>
                                            <TableCell className="whitespace-normal">{field.type_label}</TableCell>
                                            <TableCell>{field.answers_count}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
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
                                                            <Trash2Icon className="text-red-600"/>
                                                        </Button>
                                                    </ConfirmDialog>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Preview menu={menu} fields={fields}/>
                </div>

                <div className="content-start">
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
