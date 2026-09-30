import React, {useId} from "react";
import {cn} from "@/lib/utils";

/**
 * Islamic geometric (eight-pointed star) lattice. Colored with currentColor,
 * so set the tone with a text-* class, e.g. "text-white/10".
 */
const Pattern = ({className, size = 64})=>{

    const id = 'girih' + useId().replace(/[^a-zA-Z0-9_-]/g, '')

    return (
        <svg aria-hidden="true" className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}>
            <defs>
                <pattern id={id} width={size} height={size} patternUnits="userSpaceOnUse" viewBox="0 0 64 64">
                    <g fill="none" stroke="currentColor" strokeWidth="1">
                        <path d="M18 18H46V46H18Z"/>
                        <path d="M32 12.2 51.8 32 32 51.8 12.2 32Z"/>
                        <path d="M0 0 18 18M64 0 46 18M0 64 18 46M64 64 46 46"/>
                        <path d="M32 0V12.2M64 32H51.8M32 64V51.8M0 32H12.2"/>
                        <circle cx="32" cy="32" r="5"/>
                    </g>
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#${id})`}/>
        </svg>
    )
}

export default Pattern
