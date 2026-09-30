import React from "react";
import {Head, Link, usePage} from "@inertiajs/react";
import {CalendarDaysIcon, CircleHelpIcon, FileTextIcon, LifeBuoyIcon} from "lucide-react";
import PublicLayout from "../../Layouts/PublicLayout";
import ArchDivider from "@/components/ArchDivider";
import Pattern from "@/components/Pattern";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import {Button} from "@/components/ui/button";
import {jadwalItems, steps} from "@/lib/ppdb";

const details = [
    [
        'Buka halaman Daftar dan pilih jenjang: MI, MTs, atau MA.',
        'Isi nama lengkap calon siswa, username, nomor HP, dan password.',
        'Simpan username dan password baik-baik, keduanya dipakai untuk masuk.',
    ],
    [
        'Setelah masuk, menu formulir tampil di samping kiri dashboard.',
        'Isian bertanda bintang merah (*) wajib diisi.',
        'Klik Simpan di setiap menu. Menu yang sudah lengkap diberi tanda centang.',
    ],
    [
        'Periksa kembali seluruh data sebelum mengajukan.',
        'Klik Ajukan Finalisasi di dashboard. Setelah diajukan, data tidak dapat diubah.',
        'Jika panitia meminta perbaikan, formulir akan dibuka kembali beserta catatannya.',
    ],
    [
        'Setelah data diverifikasi, tombol Kartu Ujian muncul di dashboard.',
        'Cetak kartu ujian dan bawa saat mengikuti seleksi.',
    ],
    [
        'Hasil seleksi diumumkan di dashboard akunmu.',
        'Ikuti informasi daftar ulang dari panitia jika dinyatakan lulus.',
    ],
]

const faqs = [
    ['Saya lupa password, bagaimana cara masuk?',
        'Hubungi panitia PPDB. Panitia dapat mengatur ulang password akunmu, lalu kamu bisa masuk dengan password baru.'],
    ['Apakah data bisa diubah setelah finalisasi?',
        'Tidak. Setelah diajukan, data terkunci agar bisa diperiksa. Jika ada yang perlu diperbaiki, panitia akan membuka kembali formulirmu dengan status "Perlu Perbaikan" beserta catatannya.'],
    ['Berkas apa saja yang bisa diunggah?',
        'Berkas gambar JPG atau PNG, dan dokumen PDF, dengan ukuran maksimal 2 MB per berkas. Pastikan tulisan pada berkas terbaca jelas.'],
    ['Bisakah satu akun mendaftar di lebih dari satu jenjang?',
        'Tidak. Setiap akun terdaftar di satu jenjang. Buat akun lain dengan username berbeda untuk mendaftar di jenjang lain.'],
    ['Apa itu nomor pendaftaran?',
        'Nomor unik yang dibuat otomatis saat akun dibuat, misalnya MTS-2022-00012. Nomor ini tertera di dashboard dan di kartu ujian.'],
    ['Kapan kartu ujian bisa diunduh?',
        'Setelah panitia memverifikasi datamu. Status di dashboard akan berubah menjadi "Terverifikasi" dan tombol kartu ujian akan muncul.'],
]

const Help = ({jadwal})=>{

    const {sekolah} = usePage().props

    return (
        <>
            <Head title="Panduan"/>
            <section className="relative overflow-hidden bg-brand text-brand-foreground">
                <Pattern className="text-white/[0.05]"/>
                <div className="relative mx-auto max-w-6xl px-4 pt-14 pb-16 sm:px-6 lg:px-8">
                    <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-gold uppercase">
                        <LifeBuoyIcon className="size-4"/> Pusat Bantuan
                    </p>
                    <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-white sm:text-5xl">Panduan Pendaftaran</h1>
                    <p className="mt-4 max-w-2xl text-brand-foreground/80">
                        Ikuti langkah berikut untuk mendaftar di {sekolah.nama}. Jika masih ada kendala,
                        hubungi panitia PPDB.
                    </p>
                </div>
                <ArchDivider className="relative"/>
            </section>

            <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.5fr_1fr] lg:px-8">
                <div>
                    <h2 className="flex items-center gap-2 font-serif text-2xl font-semibold">
                        <FileTextIcon className="size-6 text-primary"/> Langkah-langkah
                    </h2>
                    <ol className="mt-6 grid gap-4">
                        {steps.map((step, i) => (
                            <li key={step.title} className="flex gap-4 rounded-2xl border bg-card p-5 shadow-xs">
                                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary font-serif text-lg font-semibold text-primary-foreground">
                                    {i + 1}
                                </div>
                                <div>
                                    <h3 className="font-semibold">{step.title}</h3>
                                    <ul className="mt-2 grid list-disc gap-1 pl-5 text-sm text-muted-foreground marker:text-gold">
                                        {details[i].map(line => <li key={line}>{line}</li>)}
                                    </ul>
                                </div>
                            </li>
                        ))}
                    </ol>

                    <h2 className="mt-14 flex items-center gap-2 font-serif text-2xl font-semibold">
                        <CircleHelpIcon className="size-6 text-primary"/> Pertanyaan yang sering diajukan
                    </h2>
                    <Accordion type="single" collapsible className="mt-4 rounded-2xl border bg-card px-5">
                        {faqs.map(([question, answer], i) => (
                            <AccordionItem key={question} value={`faq-${i}`}>
                                <AccordionTrigger className="text-base">{question}</AccordionTrigger>
                                <AccordionContent className="text-muted-foreground">{answer}</AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>

                <aside className="grid content-start gap-6 lg:sticky lg:top-24">
                    <div className="rounded-2xl border bg-card p-6 shadow-xs">
                        <h2 className="flex items-center gap-2 font-serif text-xl font-semibold">
                            <CalendarDaysIcon className="size-5 text-primary"/> Jadwal
                        </h2>
                        <ol className="mt-4 grid gap-4 border-l-2 border-gold/50 pl-5">
                            {jadwalItems.map(item => (
                                <li key={item.key} className="relative">
                                    <span className="absolute top-1.5 -left-[27px] size-3 rounded-full border-2 border-card bg-gold"/>
                                    <p className="text-sm font-semibold">{item.title}</p>
                                    <p className="text-sm text-muted-foreground">{jadwal?.[item.key] || 'Menyusul'}</p>
                                </li>
                            ))}
                        </ol>
                    </div>
                    <div className="relative overflow-hidden rounded-2xl bg-panel p-6 text-panel-foreground">
                        <Pattern className="text-white/[0.07]" size={48}/>
                        <div className="relative">
                            <h2 className="font-serif text-xl font-semibold">Siap mendaftar?</h2>
                            <p className="mt-1 text-sm text-panel-foreground/80">Buat akun dan mulai isi formulir sekarang.</p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <Button asChild variant="gold"><Link href="/register">Daftar</Link></Button>
                                <Button asChild variant="outline-light"><Link href="/login">Masuk</Link></Button>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </>
    )
}

Help.layout = page => <PublicLayout>{page}</PublicLayout>

export default Help
