import React from "react";
import {cn} from "@/lib/utils";
import {jenjangStyle} from "@/lib/jenjang";

/** Small pill in the jenjang's uniform color. `jenjang` is "mts" or "MTs". */
const JenjangBadge = ({jenjang, children, solid = false, className})=>{

    if (!jenjang) {
        return null
    }

    const style = jenjangStyle(jenjang)

    return (
        <span className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
            solid ? style.solid : cn("ring-1 ring-inset", style.soft),
            className,
        )}>
            {children ?? jenjang}
        </span>
    )
}

export default JenjangBadge
