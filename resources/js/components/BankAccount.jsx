import React, {useState} from "react";
import {CheckIcon, CopyIcon, LandmarkIcon} from "lucide-react";
import Pattern from "@/components/Pattern";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";

const CopyButton = ({text})=>{

    const [copied, setCopied] = useState(false)

    function copy()
    {
        navigator.clipboard?.writeText(text).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        })
    }

    return (
        <Button type="button" variant="outline-light" size="sm" onClick={copy} aria-label="Salin nomor rekening">
            {copied ? <><CheckIcon/> Tersalin</> : <><CopyIcon/> Salin</>}
        </Button>
    )
}

/**
 * The registration fee and where to transfer it.
 * rekening: {bank, nomor, nama, catatan} from the jenjang's admission settings.
 */
const BankAccount = ({feeLabel, rekening, className})=>(
    <section className={cn("relative overflow-hidden rounded-2xl bg-panel p-6 text-panel-foreground shadow-sm", className)}>
        <Pattern className="text-white/[0.06]"/>
        <div className="relative">
            <p className="text-xs font-semibold tracking-[0.16em] text-gold uppercase">Biaya pendaftaran</p>
            <p className="mt-1 font-serif text-4xl font-semibold text-white">{feeLabel}</p>

            {rekening?.nomor ? (
                <div className="mt-5 rounded-xl bg-white/[0.07] p-4 ring-1 ring-white/15">
                    <p className="flex items-center gap-2 text-sm text-panel-foreground/80"><LandmarkIcon className="size-4"/> Transfer ke rekening</p>
                    {rekening.bank && <p className="mt-2 font-semibold text-white">{rekening.bank}</p>}
                    <div className="mt-1 flex flex-wrap items-center gap-3">
                        <p className="font-mono text-2xl font-semibold tracking-wider text-white">{rekening.nomor}</p>
                        <CopyButton text={rekening.nomor}/>
                    </div>
                    {rekening.nama && <p className="mt-1 text-sm text-panel-foreground/80">a.n. {rekening.nama}</p>}
                </div>
            ) : (
                <p className="mt-4 text-sm text-panel-foreground/80">Hubungi panitia PPDB untuk cara pembayaran.</p>
            )}

            {rekening?.catatan && <p className="mt-4 text-sm whitespace-pre-line text-panel-foreground/85">{rekening.catatan}</p>}
        </div>
    </section>
)

export default BankAccount
