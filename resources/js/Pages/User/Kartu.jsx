import React from "react";
import {usePage} from "@inertiajs/react";
import {MapPinIcon, PrinterIcon} from "lucide-react";
import UserNav from "../../Layouts/UserNav";
import PageHeader from "@/components/PageHeader";
import Pattern from "@/components/Pattern";
import SchoolLogo from "@/components/SchoolLogo";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {jenjangStyle} from "@/lib/jenjang";

const Row = ({label, children, mono = false})=>(
    <div className="grid grid-cols-[9rem_1fr] gap-2 border-b border-dashed border-stone-300 py-2 last:border-0">
        <dt className="text-stone-500">{label}</dt>
        <dd className={cn("font-semibold text-stone-900", mono && "font-mono")}>{children}</dd>
    </div>
)

const Kartu = ({kartu})=>{

    const {sekolah} = usePage().props
    const style = jenjangStyle(kartu.jenjang_kode)

    return (
        <>
            <PageHeader
                eyebrow="Seleksi"
                title="Kartu Ujian"
                description="Cetak kartu ini dan bawa saat mengikuti ujian seleksi."
                actions={<Button onClick={() => window.print()} size="lg"><PrinterIcon/> Cetak kartu</Button>}
            />

            {/* Fixed light colors: this card is meant to be printed. */}
            <article className="mx-auto mb-10 max-w-2xl overflow-hidden rounded-2xl border-2 border-[#0f5a41] bg-[#fffdf6] text-stone-900 shadow-lg print:mt-0 print:shadow-none">
                <header className="relative flex items-center gap-4 overflow-hidden bg-[#0f5a41] px-6 py-5 text-white print:[print-color-adjust:exact]">
                    <Pattern className="text-white/10" size={40}/>
                    <SchoolLogo className="relative h-16 w-14"/>
                    <div className="relative min-w-0 flex-1">
                        {sekolah.yayasan && <p className="text-xs text-white/80">{sekolah.yayasan}</p>}
                        <p className="font-serif text-xl font-semibold">{sekolah.nama}</p>
                        <p className="text-xs text-white/80">Penerimaan Peserta Didik Baru · Tahun Ajaran {kartu.tahun}</p>
                    </div>
                </header>
                <div className="h-1.5 bg-[#d4a72c] print:[print-color-adjust:exact]"/>

                <div className="px-6 pt-5 text-center">
                    <p className="text-xs font-semibold tracking-[0.3em] text-[#0f5a41] uppercase">Kartu Peserta Ujian Seleksi</p>
                </div>

                <div className="grid gap-6 p-6 sm:grid-cols-[1fr_auto]">
                    <dl className="text-sm">
                        {kartu.nomor_peserta && <Row label="No. Peserta" mono>{kartu.nomor_peserta}</Row>}
                        <Row label="No. Pendaftaran" mono>{kartu.nomor_pendaftaran}</Row>
                        <Row label="Nama">{kartu.nama}</Row>
                        {kartu.asal_sekolah && <Row label="Asal Sekolah">{kartu.asal_sekolah}</Row>}
                        {kartu.gelombang && <Row label="Gelombang">{kartu.gelombang}</Row>}
                        <Row label="Jenjang">
                            <span className={cn("inline-flex items-center gap-2", style.text)}>
                                <span className={cn("size-2.5 rounded-full print:[print-color-adjust:exact]", style.bar)}/>
                                <span className="text-stone-900">{kartu.jenjang}</span>
                            </span>
                        </Row>
                    </dl>
                    {kartu.photo_url ? (
                        <img src={kartu.photo_url} alt={`Foto ${kartu.nama}`}
                             className="h-40 w-30 self-start justify-self-center rounded-md border border-stone-300 object-cover"/>
                    ) : (
                        <div className="flex h-40 w-30 items-center justify-center self-start justify-self-center rounded-md border-2 border-dashed border-stone-400 text-center text-xs text-stone-500">
                            Pas foto<br/>3 × 4
                        </div>
                    )}
                </div>

                {kartu.exam_username && (
                    <div className="mx-6 mb-6 rounded-lg border-2 border-dashed border-[#0f5a41]/40 bg-[#0f5a41]/5 px-4 py-3 print:[print-color-adjust:exact]">
                        <p className="text-xs font-semibold tracking-[0.2em] text-[#0f5a41] uppercase">Akun Ujian (E-Learning)</p>
                        <dl className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
                            <div className="flex gap-2"><dt className="text-stone-500">Username:</dt><dd className="font-mono font-semibold text-stone-900">{kartu.exam_username}</dd></div>
                            <div className="flex gap-2"><dt className="text-stone-500">Password:</dt><dd className="font-mono font-semibold tracking-wider text-stone-900">{kartu.exam_password}</dd></div>
                        </dl>
                        <p className="mt-1 text-xs text-stone-500">Jaga kerahasiaan akun ini. Gunakan untuk masuk ke sistem ujian.</p>
                    </div>
                )}

                {kartu.jadwal.length > 0 && (
                    <section className="mx-6 mb-6">
                        <p className="text-xs font-semibold tracking-[0.2em] text-[#0f5a41] uppercase">Jadwal Ujian</p>
                        <ol className="mt-2 grid gap-2 sm:grid-cols-2">
                            {kartu.jadwal.map(item => (
                                <li key={item.id} className="break-inside-avoid rounded-lg border border-stone-300 px-3 py-2 text-sm">
                                    <p className="text-xs font-semibold text-[#0f5a41]">{item.date_label} · {item.time_label}</p>
                                    <p className="mt-0.5 font-semibold text-stone-900">{item.title}</p>
                                    {item.description && <p className="text-xs text-stone-600">{item.description}</p>}
                                    {(item.location || item.range_label) && (
                                        <p className="mt-1 flex flex-wrap gap-x-3 text-xs text-stone-600">
                                            {item.location && <span className="inline-flex items-center gap-1"><MapPinIcon className="size-3"/> {item.location}</span>}
                                            {item.range_label && <span>Khusus {item.range_label.toLowerCase()}</span>}
                                        </p>
                                    )}
                                </li>
                            ))}
                        </ol>
                    </section>
                )}

                <footer className="grid gap-6 border-t border-stone-200 px-6 py-5 text-xs sm:grid-cols-2">
                    <ul className="grid list-disc content-start gap-1 pl-4 text-stone-600">
                        {!kartu.photo_url && <li>Tempel pas foto terbaru ukuran 3 × 4.</li>}
                        <li>Bawa kartu ini saat ujian seleksi.</li>
                        {(kartu.catatan ?? '').split('\n').map(line => line.trim()).filter(Boolean).map(line => <li key={line}>{line}</li>)}
                    </ul>
                    <div className="text-center text-stone-600 sm:text-right">
                        <p>Panitia PPDB</p>
                        <div className="h-14"/>
                        <p className="inline-block min-w-40 border-t border-stone-400 pt-1 font-semibold text-stone-800">{sekolah.nama}</p>
                    </div>
                </footer>
            </article>
        </>
    )
}

Kartu.layout = page => <UserNav>{page}</UserNav>

export default Kartu
