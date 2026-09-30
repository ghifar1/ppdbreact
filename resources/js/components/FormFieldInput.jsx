import React, {useState} from "react";
import {ChevronDownIcon, FileIcon} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Calendar} from "@/components/ui/calendar";
import {Checkbox} from "@/components/ui/checkbox";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Textarea} from "@/components/ui/textarea";

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
                        className="w-full justify-between font-normal">
                    {selected
                        ? selected.toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})
                        : 'Pilih tanggal'}
                    <ChevronDownIcon/>
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
const FormFieldInput = ({field, value, onChange, error, disabled, storedFile})=>{

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
                <RadioGroup id={id} value={value ?? ''} onValueChange={onChange} disabled={disabled} aria-invalid={invalid}>
                    {options.map((option, i) => (
                        <div className="flex items-center gap-2" key={option}>
                            <RadioGroupItem value={option} id={`${id}-${i}`}/>
                            <Label htmlFor={`${id}-${i}`} className="font-normal">{option}</Label>
                        </div>
                    ))}
                </RadioGroup>
            )
            break
        case 'checkbox': {
            const checked = Array.isArray(value) ? value : []
            input = (
                <div id={id} className="grid gap-2">
                    {options.map((option, i) => (
                        <div className="flex items-center gap-2" key={option}>
                            <Checkbox id={`${id}-${i}`} checked={checked.includes(option)} disabled={disabled}
                                      aria-invalid={invalid}
                                      onCheckedChange={on => onChange(on
                                          ? [...checked, option]
                                          : checked.filter(item => item !== option))}/>
                            <Label htmlFor={`${id}-${i}`} className="font-normal">{option}</Label>
                        </div>
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
                           className="inline-flex items-center gap-2 text-sm text-purple-600 hover:underline dark:text-purple-400">
                            <FileIcon className="w-4 h-4"/> {storedFile.name}
                        </a>
                    )}
                    {!disabled && (
                        <Input id={id} type="file" accept=".jpg,.jpeg,.png,.pdf" aria-invalid={invalid}
                               onChange={e => onChange(e.target.files[0] ?? null)}/>
                    )}
                    {!disabled && storedFile && (
                        <p className="text-xs text-muted-foreground">Pilih berkas baru hanya jika ingin mengganti berkas di atas.</p>
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
        <div className="grid gap-2 my-3">
            <Label htmlFor={id}>
                <span>{field.label}</span>
                {field.required && <span className="text-red-500 font-bold">*</span>}
            </Label>
            {input}
            {field.help && <p className="text-xs text-muted-foreground">{field.help}</p>}
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        </div>
    )
}

export default FormFieldInput
