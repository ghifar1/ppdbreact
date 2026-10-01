import React from "react";
import {Input} from "@/components/ui/input";
import {cn} from "@/lib/utils";

/** Amount in rupiah, shown with thousand separators. `value` and `onChange` use plain digits. */
const RupiahInput = ({value, onChange, className, ...props})=>{

    const digits = String(value ?? '').replace(/\D/g, '')

    return (
        <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-medium text-muted-foreground">Rp</span>
            <Input inputMode="numeric" autoComplete="off" className={cn("pl-9", className)}
                   value={digits === '' ? '' : Number(digits).toLocaleString('id-ID')}
                   onChange={e => onChange(e.target.value.replace(/\D/g, ''))} {...props}/>
        </div>
    )
}

export default RupiahInput
