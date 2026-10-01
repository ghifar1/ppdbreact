import React, {useState} from "react";
import {Link, useForm} from "@inertiajs/react";
import {
    BanknoteIcon,
    CalendarClockIcon,
    CopyIcon,
    IdCardIcon,
    MegaphoneIcon,
    ScrollTextIcon,
} from "lucide-react";
import AdminNav from "../../../Layouts/AdminNav";
import FieldError from "@/components/FieldError";
import PageHeader from "@/components/PageHeader";
import RupiahInput from "@/components/RupiahInput";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Textarea} from "@/components/ui/textarea";
import {cn} from "@/lib/utils";
import {jenjangStyle} from "@/lib/jenjang";

const Section = ({icon: Icon, title, description, children})=>(
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2 font-serif text-lg"><Icon className="size-5 text-primary"/> {title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className="grid gap-4">{children}</CardContent>
    </Card>
)

const Field = ({id, label, hint, error, children, className})=>(
    <div className={cn("grid content-start gap-2", className)}>
        <Label htmlFor={id}>{label}</Label>
        {children}
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        <FieldError message={error}/>
    </div>
)

/** The settings of one jenjang. Remounted (key) when switching tabs. */
const SettingsForm = ({jenjang, initial, others, periodFees})=>{

    const form = useForm(initial)
    const id = key => `${jenjang.value}-${key}`

    const text = (key, props = {}) => (
        <Input id={id(key)} value={form.data[key]} aria-invalid={form.errors[key] ? true : undefined}
               onChange={e => form.setData(key, e.target.value)} {...props}/>
    )
    const area = (key, props = {}) => (
        <Textarea id={id(key)} value={form.data[key]} aria-invalid={form.errors[key] ? true : undefined}
                  onChange={e => form.setData(key, e.target.value)} {...props}/>
    )
    const date = key => text(key, {type: 'datetime-local'})

    function submit(e)
    {
        e.preventDefault()
        form.put(`/admin/pengaturan/${jenjang.value}`, {preserveScroll: true, preserveState: true, onSuccess: () => form.setDefaults()})
    }

    return (
        <form onSubmit={submit} className="grid gap-6">
            <div className="grid gap-6 xl:grid-cols-2">
                <Section icon={BanknoteIcon} title="Biaya pendaftaran"
                         description="Siswa mengunggah bukti transfer, lalu panitia mengonfirmasi. Kosongkan biaya jika pendaftaran gratis.">
                    <Field id={id('fee')} label="Biaya pendaftaran" error={form.errors.fee}
                           hint={periodFees.length > 0
                               ? `Gelombang dengan biaya sendiri: ${periodFees.map(period => `${period.name} (${period.fee_label})`).join(', ')}.`
                               : 'Gelombang pendaftaran bisa punya biaya sendiri yang menggantikan biaya ini.'}>
                        <RupiahInput id={id('fee')} value={form.data.fee} placeholder="0"
                                     aria-invalid={form.errors.fee ? true : undefined}
                                     onChange={value => form.setData('fee', value)}/>
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field id={id('bank_name')} label="Bank" error={form.errors.bank_name}>
                            {text('bank_name', {placeholder: 'mis. Bank Syariah Indonesia'})}
                        </Field>
                        <Field id={id('account_number')} label="Nomor rekening" error={form.errors.account_number}>
                            {text('account_number', {inputMode: 'numeric', className: 'font-mono'})}
                        </Field>
                    </div>
                    <Field id={id('account_name')} label="Atas nama" error={form.errors.account_name}>
                        {text('account_name', {placeholder: 'mis. MA Al-Hikmah'})}
                    </Field>
                    <Field id={id('payment_notes')} label="Keterangan pembayaran" error={form.errors.payment_notes}
                           hint="Tampil di halaman pembayaran siswa, mis. berita transfer atau pembayaran tunai di sekolah.">
                        {area('payment_notes', {rows: 3, placeholder: 'Cantumkan nama calon siswa di berita transfer. Bisa juga membayar tunai di ruang TU, Senin–Jumat 08.00–15.00.'})}
                    </Field>
                </Section>

                <Section icon={CalendarClockIcon} title="Jadwal"
                         description="Kosongkan jika tidak dibatasi. Siswa yang diminta memperbaiki data tetap bisa mengajukan ulang setelah finalisasi ditutup.">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field id={id('finalization_opens_at')} label="Finalisasi dibuka" error={form.errors.finalization_opens_at}>
                            {date('finalization_opens_at')}
                        </Field>
                        <Field id={id('finalization_closes_at')} label="Finalisasi ditutup" error={form.errors.finalization_closes_at}>
                            {date('finalization_closes_at')}
                        </Field>
                        <Field id={id('card_opens_at')} label="Kartu ujian bisa diunduh mulai" error={form.errors.card_opens_at}>
                            {date('card_opens_at')}
                        </Field>
                        <Field id={id('card_closes_at')} label="Kartu ujian bisa diunduh sampai" error={form.errors.card_closes_at}>
                            {date('card_closes_at')}
                        </Field>
                    </div>
                    <Field id={id('announcement_at')} label="Pengumuman hasil seleksi" error={form.errors.announcement_at}
                           hint="Sebelum waktu ini, hasil Lulus/Tidak Lulus yang sudah diisi panitia belum terlihat oleh siswa.">
                        {date('announcement_at')}
                    </Field>
                </Section>

                <Section icon={IdCardIcon} title="Kartu ujian"
                         description={<>Jadwal ujian, sesi dan ruang diatur di <Link href="/admin/jadwal-ujian" className="font-medium text-primary underline-offset-4 hover:underline">Jadwal Ujian</Link>.</>}>
                    <Field id={id('exam_notes')} label="Catatan di kartu ujian" error={form.errors.exam_notes}
                           hint="Satu catatan per baris.">
                        {area('exam_notes', {rows: 4, placeholder: 'Hadir 15 menit sebelum ujian dimulai.\nMembawa alat tulis.\nBerpakaian seragam sekolah asal.'})}
                    </Field>
                </Section>

                <Section icon={ScrollTextIcon} title="Surat hasil seleksi"
                         description="Surat yang bisa dicetak siswa setelah hasil diumumkan.">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field id={id('headmaster_name')} label="Kepala madrasah" error={form.errors.headmaster_name}>
                            {text('headmaster_name', {placeholder: 'Nama dan gelar'})}
                        </Field>
                        <Field id={id('headmaster_nip')} label="NIP" error={form.errors.headmaster_nip}>
                            {text('headmaster_nip', {className: 'font-mono'})}
                        </Field>
                    </div>
                    <Field id={id('reregistration_info')} label="Informasi daftar ulang" error={form.errors.reregistration_info}
                           hint="Dicetak di surat siswa yang lulus. Baris yang diawali angka atau tanda - tampil sebagai daftar.">
                        {area('reregistration_info', {rows: 6, placeholder: 'Daftar ulang: Jumat, 5 Juli 2027, pukul 08.30–11.30 di ruang TU.\nMembawa:\n1. Surat ini\n2. Fotokopi ijazah atau SKL\n3. Fotokopi KK dan akta kelahiran'})}
                    </Field>
                </Section>
            </div>

            <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center justify-end gap-2 border-t bg-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                {form.isDirty && <p className="mr-auto text-sm text-muted-foreground">Ada perubahan yang belum disimpan.</p>}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button type="button" variant="outline"><CopyIcon/> Salin dari jenjang lain</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Isi formulir dengan pengaturan</DropdownMenuLabel>
                        {others.map(other => (
                            <DropdownMenuItem key={other.value} onSelect={() => form.setData(other.settings)}>{other.label}</DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
                <Button type="submit" disabled={form.processing}>Simpan pengaturan {jenjang.short}</Button>
            </div>
        </form>
    )
}

const Index = ({tab, jenjangOptions, settings, periodFees})=>{

    const [active, setActive] = useState(tab)
    const jenjang = jenjangOptions.find(option => option.value === active)

    return (
        <>
            <PageHeader
                eyebrow="Pengelolaan"
                title="Pengaturan Seleksi"
                description="Biaya pendaftaran, batas waktu finalisasi dan kartu ujian, waktu pengumuman, serta isi surat hasil seleksi untuk setiap jenjang."
            />

            <Tabs value={active} onValueChange={setActive} className="gap-6">
                <TabsList className="h-auto w-full justify-start overflow-x-auto sm:w-fit">
                    {jenjangOptions.map(option => (
                        <TabsTrigger key={option.value} value={option.value} className="gap-2 px-4 py-1.5">
                            <span className={cn("size-2 rounded-full", jenjangStyle(option.value).bar)}/>
                            {option.label}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            <div className="mt-6 flex items-center gap-3 rounded-xl border border-dashed px-4 py-3 text-sm text-muted-foreground">
                <MegaphoneIcon className="size-4 shrink-0 text-primary"/>
                Pengaturan ini hanya berlaku untuk siswa {jenjang.label}.
            </div>

            <div className="mt-6">
                <SettingsForm key={active} jenjang={jenjang} initial={settings[active]} periodFees={periodFees[active]}
                              others={jenjangOptions.filter(option => option.value !== active)
                                  .map(option => ({...option, settings: settings[option.value]}))}/>
            </div>
        </>
    )
}

Index.layout = page => <AdminNav>{page}</AdminNav>

export default Index
