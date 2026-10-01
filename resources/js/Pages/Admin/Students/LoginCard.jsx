import React from "react";
import {router, usePage} from "@inertiajs/react";
import {KeyRoundIcon, PrinterIcon} from "lucide-react";
import AdminNav from "../../../Layouts/AdminNav";
import ConfirmDialog from "@/components/ConfirmDialog";
import PageHeader from "@/components/PageHeader";
import Pattern from "@/components/Pattern";
import SchoolLogo from "@/components/SchoolLogo";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";

const Row = ({label, children, mono = false, large = false})=>(
    <div className="grid grid-cols-[8rem_1fr] items-baseline gap-2 border-b border-dashed border-stone-300 py-2 last:border-0">
        <dt className="text-stone-500">{label}</dt>
        <dd className={cn("font-semibold text-stone-900", mono && "font-mono", large && "text-xl tracking-wider")}>{children}</dd>
    </div>
)

const NewPasswordButton = ({student, label = 'Buat password baru'})=>(
    <ConfirmDialog
        title="Buat password baru?"
        description="Password lama siswa tidak bisa dipakai lagi. Kartu login baru langsung ditampilkan."
        confirmLabel="Buat password baru"
        onConfirm={() => router.post(`/admin/siswa/${student.id}/kartu-login`)}
    >
        <Button variant="outline"><KeyRoundIcon/> {label}</Button>
    </ConfirmDialog>
)

/** Printable username and password for a student, shown once after the password is made. */
const LoginCard = ({student, password})=>{

    const {sekolah} = usePage().props

    return (
        <>
            <PageHeader
                back={{href: `/admin/siswa/${student.id}`, label: student.name}}
                eyebrow="Akun siswa"
                title="Kartu Login"
                description={password
                    ? 'Cetak sekarang: password hanya ditampilkan sekali dan tidak tersimpan dalam bentuk yang bisa dibaca.'
                    : 'Password siswa tidak tersimpan dalam bentuk yang bisa dibaca, jadi kartu login hanya bisa dicetak bersama password baru.'}
                actions={password && <Button onClick={() => window.print()} size="lg"><PrinterIcon/> Cetak kartu</Button>}
            />

            {!password ? (
                <div className="max-w-xl rounded-2xl border bg-card p-6 shadow-sm">
                    <p className="text-sm text-muted-foreground">
                        Membuat password baru untuk <b className="text-foreground">{student.name}</b> (@{student.username}) akan
                        menampilkan kartu login yang bisa dicetak.
                    </p>
                    <div className="mt-4"><NewPasswordButton student={student}/></div>
                </div>
            ) : (
                <>
                    {/* Fixed light colors: this card is meant to be printed. */}
                    <article className="mx-auto mb-6 max-w-xl overflow-hidden rounded-2xl border-2 border-[#0f5a41] bg-[#fffdf6] text-stone-900 shadow-lg print:mt-0 print:shadow-none">
                        <header className="relative flex items-center gap-4 overflow-hidden bg-[#0f5a41] px-6 py-5 text-white print:[print-color-adjust:exact]">
                            <Pattern className="text-white/10" size={40}/>
                            <SchoolLogo className="relative h-14 w-12"/>
                            <div className="relative min-w-0 flex-1">
                                <p className="font-serif text-xl font-semibold">{sekolah.nama}</p>
                                <p className="text-xs text-white/80">Penerimaan Peserta Didik Baru · Tahun Ajaran {sekolah.tahun}</p>
                            </div>
                        </header>
                        <div className="h-1.5 bg-[#d4a72c] print:[print-color-adjust:exact]"/>

                        <div className="px-6 pt-5 text-center">
                            <p className="text-xs font-semibold tracking-[0.3em] text-[#0f5a41] uppercase">Kartu Login PPDB Online</p>
                        </div>

                        <dl className="px-6 pt-3 pb-2 text-sm">
                            <Row label="Nama">{student.name}</Row>
                            <Row label="Jenjang">{student.jenjang}</Row>
                            <Row label="No. Pendaftaran" mono>{student.nomor_pendaftaran}</Row>
                            {student.gelombang && <Row label="Gelombang">{student.gelombang}</Row>}
                        </dl>

                        <div className="mx-6 mb-5 rounded-lg border-2 border-dashed border-[#0f5a41]/40 bg-[#0f5a41]/5 px-4 py-2 print:[print-color-adjust:exact]">
                            <dl className="text-sm">
                                <Row label="Username" mono large>{student.username}</Row>
                                <Row label="Password" mono large>{password}</Row>
                            </dl>
                        </div>

                        <footer className="border-t border-stone-200 px-6 py-4 text-xs text-stone-600">
                            <ol className="grid list-decimal gap-1 pl-4">
                                <li>Buka <span className="font-semibold text-stone-800">{sekolah.login_url}</span></li>
                                <li>Masuk dengan username dan password di atas.</li>
                                <li>Lengkapi semua formulir, lalu ajukan finalisasi dari dashboard.</li>
                            </ol>
                            <p className="mt-3">Simpan kartu ini dan jangan berikan password kepada orang lain.</p>
                        </footer>
                    </article>

                    <div className="mx-auto max-w-xl text-center print:hidden">
                        <NewPasswordButton student={student} label="Buat ulang password"/>
                    </div>
                </>
            )}
        </>
    )
}

LoginCard.layout = page => <AdminNav>{page}</AdminNav>

export default LoginCard
