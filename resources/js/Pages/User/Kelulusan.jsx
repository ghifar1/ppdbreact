import React from "react";
import {usePage} from "@inertiajs/react";
import {PrinterIcon} from "lucide-react";
import UserNav from "../../Layouts/UserNav";
import PageHeader from "@/components/PageHeader";
import SchoolLogo from "@/components/SchoolLogo";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";

const LIST_ITEM = /^\s*(?:\d+[.)]|[-•*])\s+/

/** Plain text where lines starting with "1." or "-" become a list. */
const FormattedText = ({text})=>{

    const blocks = []

    for (const line of text.split('\n').map(line => line.trimEnd()).filter(Boolean)) {
        const item = LIST_ITEM.test(line)
        const last = blocks[blocks.length - 1]

        if (item) {
            const ordered = /^\s*\d/.test(line)
            last?.list && last.ordered === ordered
                ? last.lines.push(line.replace(LIST_ITEM, ''))
                : blocks.push({list: true, ordered, lines: [line.replace(LIST_ITEM, '')]})
        } else {
            blocks.push({list: false, lines: [line]})
        }
    }

    return blocks.map((block, i) => {
        if (!block.list) {
            return <p key={i}>{block.lines[0]}</p>
        }
        const List = block.ordered ? 'ol' : 'ul'
        return (
            <List key={i} className={cn("grid gap-0.5 pl-5", block.ordered ? "list-decimal" : "list-disc")}>
                {block.lines.map((line, j) => <li key={j}>{line}</li>)}
            </List>
        )
    })
}

const Row = ({label, children, mono = false})=>(
    <tr>
        <td className="w-40 py-0.5 pr-2 align-top text-stone-600">{label}</td>
        <td className="py-0.5 pr-2 align-top">:</td>
        <td className={cn("py-0.5 align-top font-semibold", mono && "font-mono")}>{children}</td>
    </tr>
)

/** The printable result letter (surat keterangan hasil seleksi), styled as an official letter. */
const Kelulusan = ({surat})=>{

    const {sekolah} = usePage().props
    const contact = [sekolah.telepon && `Telp. ${sekolah.telepon}`, sekolah.email].filter(Boolean).join(' · ')

    return (
        <>
            <PageHeader
                eyebrow="Hasil seleksi"
                title={surat.lulus ? 'Surat Kelulusan' : 'Surat Hasil Seleksi'}
                description="Cetak surat ini dan bawa saat daftar ulang."
                actions={<Button onClick={() => window.print()} size="lg"><PrinterIcon/> Cetak surat</Button>}
            />

            {/* Fixed light colors: this letter is meant to be printed. */}
            <article className="mx-auto mb-10 max-w-3xl bg-white px-8 py-10 text-[15px] leading-relaxed text-stone-900 shadow-lg ring-1 ring-stone-200 sm:px-14 print:max-w-none print:px-0 print:py-0 print:shadow-none print:ring-0">
                <header className="flex items-center gap-5 border-b-4 border-double border-stone-800 pb-4">
                    <SchoolLogo className="h-20 w-18"/>
                    <div className="flex-1 text-center">
                        {sekolah.yayasan && <p className="text-sm font-semibold tracking-wide uppercase">{sekolah.yayasan}</p>}
                        <p className="font-serif text-2xl font-bold tracking-wide uppercase">{sekolah.nama}</p>
                        {sekolah.alamat && <p className="text-sm text-stone-600">{sekolah.alamat}</p>}
                        {contact && <p className="text-sm text-stone-600">{contact}</p>}
                    </div>
                    <div className="hidden w-18 sm:block" aria-hidden="true"/>
                </header>

                <div className="mt-8 text-center">
                    <h2 className="font-serif text-xl font-bold tracking-wide uppercase underline underline-offset-4">Surat Keterangan Hasil Seleksi</h2>
                    <p className="mt-1 text-sm">Penerimaan Peserta Didik Baru Tahun Ajaran {surat.tahun}</p>
                </div>

                <p className="mt-8">Panitia Penerimaan Peserta Didik Baru {sekolah.nama} menerangkan bahwa:</p>

                <table className="mt-3 ml-4">
                    <tbody>
                        <Row label="Nama">{surat.nama}</Row>
                        {surat.nomor_peserta && <Row label="Nomor peserta" mono>{surat.nomor_peserta}</Row>}
                        <Row label="Nomor pendaftaran" mono>{surat.nomor_pendaftaran}</Row>
                        <Row label="Jenjang">{surat.jenjang}</Row>
                        {surat.asal_sekolah && <Row label="Asal sekolah">{surat.asal_sekolah}</Row>}
                        {surat.gelombang && <Row label="Gelombang">{surat.gelombang}</Row>}
                    </tbody>
                </table>

                <p className="mt-6 text-center">dinyatakan</p>
                <p className={cn(
                    "mx-auto mt-2 w-fit border-2 px-10 py-2 text-center font-serif text-3xl font-bold tracking-[0.2em] print:[print-color-adjust:exact]",
                    surat.lulus ? "border-[#0f5a41] text-[#0f5a41]" : "border-stone-800 text-stone-800",
                )}>
                    {surat.lulus ? 'LULUS' : 'TIDAK LULUS'}
                </p>
                <p className="mt-4 text-center">
                    dalam seleksi Penerimaan Peserta Didik Baru {sekolah.nama} Tahun Ajaran {surat.tahun}
                    {surat.lulus ? ' dan diterima sebagai peserta didik baru.' : '.'}
                </p>
                {!surat.lulus && (
                    <p className="mt-4 text-center">Terima kasih atas kepercayaan dan partisipasi Ananda. Tetap semangat dalam menuntut ilmu.</p>
                )}

                {surat.lulus && surat.daftar_ulang && (
                    <section className="mt-8 break-inside-avoid rounded-md border border-stone-400 px-5 py-4 text-sm">
                        <p className="font-bold">Ketentuan daftar ulang</p>
                        <div className="mt-2 grid gap-2"><FormattedText text={surat.daftar_ulang}/></div>
                        <p className="mt-3 text-xs italic text-stone-600">Calon peserta didik yang tidak melakukan daftar ulang pada waktu yang ditentukan dianggap mengundurkan diri.</p>
                    </section>
                )}

                <div className="mt-10 flex justify-end break-inside-avoid">
                    <div className="min-w-60 text-center">
                        <p>{[sekolah.kota, surat.tanggal].filter(Boolean).join(', ')}</p>
                        <p>{surat.kepala ? `Kepala ${sekolah.nama},` : 'Panitia PPDB,'}</p>
                        <div className="h-20"/>
                        <p className="font-bold underline underline-offset-2">{surat.kepala || sekolah.nama}</p>
                        {surat.nip && <p className="text-sm">NIP. {surat.nip}</p>}
                    </div>
                </div>
            </article>
        </>
    )
}

Kelulusan.layout = page => <UserNav>{page}</UserNav>

export default Kelulusan
