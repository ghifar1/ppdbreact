import React from "react";
import {Link, router, useForm} from "@inertiajs/react";
import {ArrowDownIcon, ArrowUpIcon, ListChecksIcon, PencilIcon, PlusIcon, Trash2Icon} from "lucide-react";
import AdminNav from "../../../Layouts/AdminNav";
import ConfirmDialog from "@/components/ConfirmDialog";
import FieldError from "@/components/FieldError";
import PageHeader from "@/components/PageHeader";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Switch} from "@/components/ui/switch";
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {cn} from "@/lib/utils";
import {jenjangStyle} from "@/lib/jenjang";

const Index = ({jenjang, jenjangOptions, menus})=>{

    const current = jenjangOptions.find(option => option.value === jenjang)
    const style = jenjangStyle(jenjang)
    const form = useForm({jenjang, title: ''})

    function addMenu(e)
    {
        e.preventDefault()
        form.post('/admin/menu')
    }

    const move = (menu, direction) => router.post(`/admin/menu/${menu.id}/move`, {direction}, {preserveScroll: true})
    const toggle = (menu, isActive) => router.put(`/admin/menu/${menu.id}`, {is_active: isActive}, {preserveScroll: true})
    const destroy = menu => router.delete(`/admin/menu/${menu.id}`, {preserveScroll: true})

    return (
        <>
            <PageHeader
                eyebrow="Pengelolaan"
                title="Menu & Formulir"
                description="Setiap menu tampil di sidebar siswa dan berisi satu formulir. Atur menu terpisah untuk tiap jenjang."
            />

            <Tabs value={jenjang} onValueChange={value => router.get('/admin/menu', {jenjang: value})}>
                <TabsList className="h-auto p-1">
                    {jenjangOptions.map(option => (
                        <TabsTrigger key={option.value} value={option.value} className="gap-2 px-4 py-1.5">
                            <span className={cn("size-2 rounded-full", jenjangStyle(option.value).bar)}/>
                            {option.short}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            <section className="mt-4 overflow-hidden rounded-2xl border bg-card shadow-sm">
                <div className="flex items-center gap-4 border-b px-6 py-5">
                    <span className={cn("flex size-12 shrink-0 items-center justify-center rounded-xl font-serif text-lg font-semibold", style.solid)}>
                        {current?.short}
                    </span>
                    <div>
                        <h2 className="font-serif text-lg font-semibold">Menu {current?.label}</h2>
                        <p className="text-sm text-muted-foreground">{menus.length} menu · urutan di bawah sama dengan urutan di sidebar siswa.</p>
                    </div>
                </div>

                {menus.length === 0 && (
                    <div className="px-6 py-12 text-center">
                        <ListChecksIcon className="mx-auto size-10 text-muted-foreground/60"/>
                        <p className="mt-3 text-sm text-muted-foreground">Belum ada menu untuk {current?.short}. Tambahkan menu pertama di bawah.</p>
                    </div>
                )}

                <ul className="divide-y">
                    {menus.map((menu, i) => (
                        <li key={menu.id} className={cn("flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-4 sm:px-6", !menu.is_active && "bg-muted/40")}>
                            <div className="flex flex-col">
                                <Button variant="ghost" size="icon-xs" disabled={i === 0} aria-label="Naikkan"
                                        onClick={() => move(menu, 'up')}><ArrowUpIcon/></Button>
                                <Button variant="ghost" size="icon-xs" disabled={i === menus.length - 1} aria-label="Turunkan"
                                        onClick={() => move(menu, 'down')}><ArrowDownIcon/></Button>
                            </div>
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-primary">{i + 1}</span>
                            <div className="min-w-0 flex-1">
                                <Link href={`/admin/menu/${menu.id}`} className="font-semibold hover:text-primary hover:underline">{menu.title}</Link>
                                <p className="text-sm text-muted-foreground">
                                    {menu.fields_count} isian
                                    {!menu.is_active && <Badge variant="outline" className="ml-2">Disembunyikan</Badge>}
                                </p>
                            </div>
                            <label className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Switch checked={menu.is_active} onCheckedChange={checked => toggle(menu, checked)}
                                        aria-label={`Tampilkan ${menu.title}`}/>
                                <span className="w-12">{menu.is_active ? 'Tampil' : 'Sembunyi'}</span>
                            </label>
                            <div className="flex gap-1">
                                <Button asChild variant="outline" size="sm">
                                    <Link href={`/admin/menu/${menu.id}`}><PencilIcon/> Atur isian</Link>
                                </Button>
                                <ConfirmDialog
                                    title={`Hapus menu "${menu.title}"?`}
                                    description="Semua isian di menu ini dan jawaban siswa untuk isian tersebut akan ikut terhapus. Tindakan ini tidak bisa dibatalkan."
                                    confirmLabel="Hapus menu"
                                    destructive
                                    onConfirm={() => destroy(menu)}
                                >
                                    <Button variant="ghost" size="icon-sm" aria-label={`Hapus ${menu.title}`}>
                                        <Trash2Icon className="text-destructive"/>
                                    </Button>
                                </ConfirmDialog>
                            </div>
                        </li>
                    ))}
                </ul>

                <form onSubmit={addMenu} className="flex flex-col gap-2 border-t bg-muted/40 px-4 py-5 sm:flex-row sm:items-start sm:px-6">
                    <div className="grid flex-1 gap-1">
                        <Input placeholder={`Judul menu baru untuk ${current?.short}, mis. "Data Kesehatan"`} className="bg-background"
                               value={form.data.title} aria-invalid={form.errors.title ? true : undefined}
                               onChange={e => form.setData('title', e.target.value)}/>
                        <FieldError message={form.errors.title}/>
                    </div>
                    <Button type="submit" disabled={form.processing}><PlusIcon/> Tambah menu</Button>
                </form>
            </section>
        </>
    )
}

Index.layout = page => <AdminNav>{page}</AdminNav>

export default Index
