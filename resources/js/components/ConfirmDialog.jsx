import React from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

/**
 * Wraps a trigger element and asks for confirmation before running onConfirm.
 */
const ConfirmDialog = ({title, description, confirmLabel = 'Ya, lanjutkan', destructive = false, onConfirm, children})=>(
    <AlertDialog>
        <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>{title}</AlertDialogTitle>
                {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction variant={destructive ? 'destructive' : 'default'} onClick={onConfirm}>
                    {confirmLabel}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
)

export default ConfirmDialog
