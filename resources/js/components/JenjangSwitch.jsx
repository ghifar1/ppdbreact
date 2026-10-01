import React, {useState} from "react";
import {cn} from "@/lib/utils";
import {jenjangStyle} from "@/lib/jenjang";

/**
 * The schedule of one jenjang out of `jadwal` ({mi: {...}, mts: {...}, ma: {...}}).
 * `differs` is false when every jenjang has the same dates, so no switch is needed.
 */
export function useJadwal(jadwal, jenjangOptions)
{
    const [selected, setSelected] = useState(jenjangOptions[0]?.value)
    const timelines = jenjangOptions.map(option => JSON.stringify(jadwal?.[option.value] ?? {}))
    const differs = new Set(timelines).size > 1

    return {selected, setSelected, differs, timeline: jadwal?.[selected] ?? {}}
}

/** Pill buttons to pick a jenjang. */
const JenjangSwitch = ({options, value, onChange, className})=>(
    <div className={cn("inline-flex flex-wrap gap-1 rounded-full border bg-card p-1", className)} role="tablist" aria-label="Pilih jenjang">
        {options.map(option => (
            <button key={option.value} type="button" role="tab" aria-selected={value === option.value}
                    onClick={() => onChange(option.value)}
                    className={cn(
                        "rounded-full px-3 py-1 text-sm font-semibold transition-colors",
                        value === option.value ? jenjangStyle(option.value).solid : "text-muted-foreground hover:text-foreground",
                    )}>
                {option.short}
            </button>
        ))}
    </div>
)

export default JenjangSwitch
