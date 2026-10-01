import React, {useState} from "react";
import {EyeIcon, EyeOffIcon} from "lucide-react";
import {Input} from "@/components/ui/input";
import {cn} from "@/lib/utils";

/** Password input with a show/hide button. */
const PasswordInput = ({className, ...props})=>{

    const [visible, setVisible] = useState(false)

    return (
        <div className="relative">
            <Input type={visible ? 'text' : 'password'} className={cn("pr-10", className)} {...props}/>
            <button type="button" onClick={() => setVisible(!visible)}
                    className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-md text-muted-foreground hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                    aria-label={visible ? 'Sembunyikan password' : 'Tampilkan password'}>
                {visible ? <EyeOffIcon className="size-4"/> : <EyeIcon className="size-4"/>}
            </button>
        </div>
    )
}

export default PasswordInput
