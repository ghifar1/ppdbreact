import React, {useState} from "react";
import {CalendarIcon, FileIcon, UploadIcon} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Calendar} from "@/components/ui/calendar";
import {Checkbox} from "@/components/ui/checkbox";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Textarea} from "@/components/ui/textarea";
import {cn} from "@/lib/utils";

/** Field types that take the full row in a two-column form. */
export const wideTypes = ['textarea', 'radio', 'checkbox', 'file']

const optionClass = "cursor-pointer rounded-lg border bg-background px-3 py-2.5 font-normal has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-secondary has-[:disabled]:cursor-not-allowed"

const today = new Date()
const fromMonth = new Date(today.getFullYear() - 80, 0)
const toMonth = new Date(today.getFullYear() + 5, 11)

const pad = number => String(number).padStart(2, '0')

/** "2010-05-17" -> Date in local time (avoids the UTC shift of new Date("2010-05-17")). */
function parseDate(value) {
    const [year, month, day] = (value ?? '').split('-').map(Number)
    return year && month && day ? new Date(year, month - 1, day) : undefined
}

function formatDate(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function DateInput({id, value, onChange, disabled, invalid}) {
    const [open, setOpen] = useState(false)
    const selected = parseDate(value)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" id={id} disabled={disabled} aria-invalid={invalid}
                        className={cn("w-full justify-between font-normal", !selected && "text-muted-foreground")}>
                    {selected
                        ? selected.toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})
                        : 'Pilih tanggal'}
                    <CalendarIcon className="text-muted-foreground"/>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                <Calendar
                    mode="single"
                    selected={selected}
                    captionLayout="dropdown"
                    startMonth={fromMonth}
                    endMonth={toMonth}
                    defaultMonth={selected}
                    onSelect={(date)=>{
                        onChange(date ? formatDate(date) : '')
                        setOpen(false)
                    }}
                />
            </PopoverContent>
        </Popover>
    )
}

/**
 * Renders one admin-defined form field.
 *
 * field: {id, label, type, options, required, placeholder, help}
 * value: string | string[] | File | null
 * storedFile: {name, url} for an already uploaded file
 */
const FormFieldInput = ({field, value, onChange, error, disabled, storedFile, className})=>{

    const id = `field-${field.id}`
    const invalid = error ? true : undefined
    const options = field.options ?? []

    let input
    switch (field.type) {
        case 'textarea':
            input = <Textarea id={id} value={value ?? ''} placeholder={field.placeholder ?? ''} disabled={disabled}
                              aria-invalid={invalid} onChange={e => onChange(e.target.value)}/>
            break
        case 'date':
            input = <DateInput id={id} value={value} onChange={onChange} disabled={disabled} invalid={invalid}/>
            break
        case 'select':
            input = (
                <Select value={value ?? ''} onValueChange={onChange} disabled={disabled}>
                    <SelectTrigger id={id} className="w-full" aria-invalid={invalid}>
                        <SelectValue placeholder={field.placeholder || 'Pilih salah satu'}/>
                    </SelectTrigger>
                    <SelectContent>
                        {options.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                    </SelectContent>
                </Select>
            )
            break
        case 'radio':
            input = (
                <RadioGroup id={id} value={value ?? ''} onValueChange={onChange} disabled={disabled} aria-invalid={invalid}
                            className="grid gap-2 sm:grid-cols-2">
                    {options.map((option, i) => (
                        <Label key={option} htmlFor={`${id}-${i}`} className={optionClass}>
                            <RadioGroupItem value={option} id={`${id}-${i}`}/>
                            {option}
                        </Label>
                    ))}
                </RadioGroup>
            )
            break
        case 'checkbox': {
            const checked = Array.isArray(value) ? value : []
            input = (
                <div id={id} className="grid gap-2 sm:grid-cols-2">
                    {options.map((option, i) => (
                        <Label key={option} htmlFor={`${id}-${i}`} className={optionClass}>
                            <Checkbox id={`${id}-${i}`} checked={checked.includes(option)} disabled={disabled}
                                      aria-invalid={invalid}
                                      onCheckedChange={on => onChange(on
                                          ? [...checked, option]
                                          : checked.filter(item => item !== option))}/>
                            {option}
                        </Label>
                    ))}
                </div>
            )
            break
        }
        case 'file':
            input = (
                <div className="grid gap-2">
                    {storedFile && (
                        <a href={storedFile.url} target="_blank" rel="noreferrer"
                           className="inline-flex w-fit items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground hover:underline">
                            <FileIcon className="size-4 shrink-0"/> {storedFile.name}
                        </a>
                    )}
                    {!disabled && (
                        <label className={cn(
                            "flex cursor-pointer items-center gap-3 rounded-lg border-2 border-dashed bg-background px-4 py-3 text-sm transition-colors hover:border-primary/50 hover:bg-accent has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/50",
                            invalid && "border-destructive",
                        )}>
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                                <UploadIcon className="size-4"/>
                            </span>
                            <span className="min-w-0">
                                <span className="block truncate font-medium">
                                    {value instanceof File ? value.name : storedFile ? 'Ganti berkas' : 'Pilih berkas'}
                                </span>
                                <span className="block text-xs text-muted-foreground">JPG, PNG, atau PDF · maks. 2 MB</span>
                            </span>
                            <input id={id} type="file" accept=".jpg,.jpeg,.png,.pdf" aria-invalid={invalid} className="sr-only"
                                   onChange={e => onChange(e.target.files[0] ?? null)}/>
                        </label>
                    )}
                </div>
            )
            break
        default: {
            const type = {number: 'number', email: 'email', tel: 'tel'}[field.type] ?? 'text'
            input = <Input id={id} type={type} value={value ?? ''} placeholder={field.placeholder ?? ''}
                           disabled={disabled} aria-invalid={invalid}
                           inputMode={type === 'number' ? 'decimal' : undefined}
                           onChange={e => onChange(e.target.value)}/>
        }
    }

    return (
        <div className={cn("grid content-start gap-2", wideTypes.includes(field.type) && "sm:col-span-2", className)}>
            <Label htmlFor={id} className="leading-snug">
                <span>{field.label}{field.required && <span className="ml-0.5 font-bold text-destructive">*</span>}</span>
            </Label>
            {input}
            {field.help && <p className="text-xs text-muted-foreground">{field.help}</p>}
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
        </div>
    )
}

export default FormFieldInput
