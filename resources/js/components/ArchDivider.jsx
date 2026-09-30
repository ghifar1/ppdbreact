import React from "react";
import {cn} from "@/lib/utils";

const WIDTH = 1440
const ARCH = 48

// A row of pointed (mihrab-style) arches rising from the bottom edge.
const path = [
    'M0 40 V24',
    ...Array.from({length: WIDTH / ARCH}, (_, i) => {
        const x = i * ARCH
        const mid = x + ARCH / 2
        return `C${x} 11 ${mid - 7} 5 ${mid} 0 C${mid + 7} 5 ${x + ARCH} 11 ${x + ARCH} 24`
    }),
    `V40 Z`,
].join(' ')

/** Decorative edge between a dark band and the page background. */
const ArchDivider = ({className})=>(
    <svg viewBox={`0 0 ${WIDTH} 40`} preserveAspectRatio="none" aria-hidden="true"
         className={cn("block h-5 w-full fill-background sm:h-7", className)}>
        <path d={path}/>
    </svg>
)

export default ArchDivider
