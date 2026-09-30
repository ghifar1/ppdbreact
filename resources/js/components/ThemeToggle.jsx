import React, {useState} from "react";
import {MoonIcon, SunIcon} from "lucide-react";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";

/** Switches between light and dark mode and remembers the choice. */
const ThemeToggle = ({className})=>{

    const root = document.documentElement
    const [dark, setDark] = useState(() => root.classList.contains('dark'))

    function toggle()
    {
        const next = !dark
        root.classList.toggle('dark', next)
        try {
            localStorage.setItem('theme', next ? 'dark' : 'light')
        } catch (e) {
            // Storage can be unavailable (private mode); the toggle still works for this visit.
        }
        setDark(next)
    }

    return (
        <Button variant="ghost" size="icon" onClick={toggle} className={cn("rounded-full", className)}
                aria-label={dark ? 'Mode terang' : 'Mode gelap'} title={dark ? 'Mode terang' : 'Mode gelap'}>
            {dark ? <SunIcon/> : <MoonIcon/>}
        </Button>
    )
}

export default ThemeToggle
