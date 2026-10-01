import React from "react";
import {cn, initials} from "@/lib/utils";

/** The profile photo, or the person's initials without one. Size and shape come from className. */
const Avatar = ({name, src, className})=> src ? (
    <img src={src} alt={`Foto ${name}`} className={cn("shrink-0 object-cover", className)}/>
) : (
    <span className={cn("flex shrink-0 items-center justify-center font-semibold", className)} aria-hidden="true">
        {initials(name)}
    </span>
)

export default Avatar
