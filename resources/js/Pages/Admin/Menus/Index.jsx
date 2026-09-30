import React from "react";
import {Link, router, useForm} from "@inertiajs/react";
import {ArrowDownIcon, ArrowUpIcon, PencilIcon, PlusIcon, Trash2Icon} from "lucide-react";
import AdminNav from "../../../Layouts/AdminNav";
import {PageTitle} from "../../../Layouts/PageTitle";
import ConfirmDialog from "@/components/ConfirmDialog";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Switch} from "@/components/ui/switch";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs";

const Index = ({jenjang, jenjangOptions, menus})=>{

    const current = jenjangOptions.find(option => option.value === jenjang)
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
            <PageTitle>Menu & Formulir</PageTitle>

            <Tabs value={jenjang} onValueChange={value => router.get('/admin/menu', {jenjang: value})}>
                <TabsList>
                    {jenjangOptions.map(option => (
                        <TabsTrigger key={option.value} value={option.value}>{option.short}</TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            <Card className="my-4">
                <CardHeader>
                    <CardTitle>Menu {current?.label}</CardTitle>
                    <CardDescription>
                        Menu di bawah muncul di sidebar siswa {current?.short}, sesuai urutan. Setiap menu berisi satu formulir;
                        klik <b>Atur isian</b> untuk menambah atau mengubah pertanyaannya.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-24">Urutan</TableHead>
                                <TableHead>Judul menu</TableHead>
                                <TableHead className="w-28">Jumlah isian</TableHead>
                                <TableHead className="w-40">Tampil ke siswa</TableHead>
                                <TableHead className="w-56 text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {menus.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                                        Belum ada menu untuk {current?.short}. Tambahkan menu pertama di bawah.
                                    </TableCell>
                                </TableRow>
                            )}
                            {menus.map((menu, i) => (
                                <TableRow key={menu.id}>
                                    <TableCell>
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="icon-sm" disabled={i === 0} aria-label="Naikkan"
                                                    onClick={() => move(menu, 'up')}><ArrowUpIcon/></Button>
                                            <Button variant="ghost" size="icon-sm" disabled={i === menus.length - 1} aria-label="Turunkan"
                                                    onClick={() => move(menu, 'down')}><ArrowDownIcon/></Button>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <Link href={`/admin/menu/${menu.id}`} className="hover:underline">{menu.title}</Link>
                                    </TableCell>
                                    <TableCell>{menu.fields_count}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Switch checked={menu.is_active} onCheckedChange={checked => toggle(menu, checked)}
                                                    aria-label={`Tampilkan ${menu.title}`}/>
                                            {menu.is_active
                                                ? <Badge variant="secondary">Tampil</Badge>
                                                : <Badge variant="outline">Disembunyikan</Badge>}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
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
                                                    <Trash2Icon className="text-red-600"/>
                                                </Button>
                                            </ConfirmDialog>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <form onSubmit={addMenu} className="flex flex-col gap-2 pt-6 mt-2 border-t sm:flex-row sm:items-start">
                        <div className="flex-1 grid gap-1">
                            <Input placeholder={`Judul menu baru untuk ${current?.short}, mis. "Data Kesehatan"`}
                                   value={form.data.title} aria-invalid={form.errors.title ? true : undefined}
                                   onChange={e => form.setData('title', e.target.value)}/>
                            {form.errors.title && <p className="text-sm text-red-600 dark:text-red-400">{form.errors.title}</p>}
                        </div>
                        <Button type="submit" disabled={form.processing}><PlusIcon/> Tambah menu</Button>
                    </form>
                </CardContent>
            </Card>
        </>
    )
}

Index.layout = page => <AdminNav>{page}</AdminNav>

export default Index
