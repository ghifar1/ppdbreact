import React from "react";
import {useForm} from "@inertiajs/react";
import {HandCoinsIcon, PrinterIcon, UserPlusIcon} from "lucide-react";
import AdminNav from "../../../Layouts/AdminNav";
import FieldError from "@/components/FieldError";
import PageHeader from "@/components/PageHeader";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Checkbox} from "@/components/ui/checkbox";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {cn} from "@/lib/utils";
import {jenjangStyle} from "@/lib/jenjang";

const AUTO = 'otomatis'

const Field = ({id, label, hint, error, children, className})=>(
    <div className={cn("grid content-start gap-2", className)}>
        <Label htmlFor={id}>{label}</Label>
        {children}
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        <FieldError message={error}/>
    </div>
)

const rupiah = amount => `Rp ${Number(amount).toLocaleString('id-ID')}`

/**
 * Register a student who comes to the school office. The account gets a
 * generated password, printed on a login card on the next page.
 */
const Create = ({jenjangOptions, periodOptions, fees})=>{

    const form = useForm({
        jenjang: '',
        name: '',
        username: '',
        no_hp: '',
        registration_period_id: AUTO,
        paid_cash: false,
    })

    const fee = form.data.jenjang ? fees[form.data.jenjang] : null
    const periods = periodOptions.filter(option => !option.jenjang || option.jenjang === form.data.jenjang)

    function submit(e)
    {
        e.preventDefault()
        form.transform(data => ({
            ...data,
            registration_period_id: data.registration_period_id === AUTO ? null : data.registration_period_id,
            paid_cash: fee?.amount > 0 && data.paid_cash,
        }))
        form.post('/admin/siswa')
    }

    const input = (key, props = {}) => (
        <Input id={key} value={form.data[key]} aria-invalid={form.errors[key] ? true : undefined}
               onChange={e => form.setData(key, e.target.value)} {...props}/>
    )

    return (
        <>
            <PageHeader
                back={{href: '/admin/siswa', label: 'Data siswa'}}
                eyebrow="Pendaftaran di sekolah"
                title="Daftarkan siswa"
                description="Untuk calon siswa yang mendaftar langsung di sekolah. Password dibuat otomatis dan dicetak di kartu login untuk diberikan kepada siswa."
            />

            <form onSubmit={submit} className="grid max-w-3xl gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-serif text-lg">Data akun</CardTitle>
                        <CardDescription>Siswa melengkapi formulir sendiri setelah masuk dengan akun ini.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-5">
                        <fieldset className="grid gap-2">
                            <legend className="mb-2 text-sm font-medium">Jenjang</legend>
                            <RadioGroup value={form.data.jenjang} onValueChange={value => form.setData(data => ({...data, jenjang: value, registration_period_id: AUTO}))}
                                        className="grid grid-cols-3 gap-2" aria-invalid={form.errors.jenjang ? true : undefined}>
                                {jenjangOptions.map(option => {
                                    const style = jenjangStyle(option.value)

                                    return (
                                        <Label key={option.value} htmlFor={`jenjang-${option.value}`}
                                               className={cn(
                                                   "relative flex cursor-pointer flex-col items-start gap-1 overflow-hidden rounded-xl border-2 bg-card p-3 pt-4 font-normal transition hover:bg-accent",
                                                   form.data.jenjang === option.value ? style.border : 'border-border',
                                               )}>
                                            <span className={cn("absolute inset-x-0 top-0 h-1.5", style.bar)}/>
                                            <RadioGroupItem value={option.value} id={`jenjang-${option.value}`} className="absolute top-4 right-3"/>
                                            <span className={cn("font-serif text-2xl font-semibold", style.text)}>{option.short}</span>
                                            <span className="text-xs leading-snug text-muted-foreground">{option.label}</span>
                                        </Label>
                                    )
                                })}
                            </RadioGroup>
                            <FieldError message={form.errors.jenjang}/>
                        </fieldset>

                        <Field id="name" label="Nama lengkap calon siswa" error={form.errors.name}>{input('name')}</Field>
                        <div className="grid gap-5 sm:grid-cols-2">
                            <Field id="username" label="Username (opsional)" error={form.errors.username}
                                   hint="Kosongkan untuk dibuat dari nama siswa.">
                                {input('username', {autoComplete: 'off'})}
                            </Field>
                            <Field id="no_hp" label="No. HP / WhatsApp (opsional)" error={form.errors.no_hp}>
                                {input('no_hp', {type: 'tel', placeholder: '08xxxxxxxxxx'})}
                            </Field>
                        </div>
                        <Field id="registration_period_id" label="Gelombang" error={form.errors.registration_period_id}
                               hint={fee?.period ? `Otomatis: ${fee.period}, gelombang yang sedang dibuka.` : 'Otomatis: gelombang yang sedang dibuka, jika ada.'}>
                            <Select value={form.data.registration_period_id} onValueChange={value => form.setData('registration_period_id', value)}>
                                <SelectTrigger id="registration_period_id" className="w-full"><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={AUTO}>Otomatis</SelectItem>
                                    {periods.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </Field>
                    </CardContent>
                </Card>

                {fee?.amount > 0 && (
                    <label htmlFor="paid_cash" className="flex cursor-pointer items-start gap-3 rounded-2xl border bg-card p-5 shadow-sm">
                        <Checkbox id="paid_cash" checked={form.data.paid_cash} className="mt-0.5"
                                  onCheckedChange={checked => form.setData('paid_cash', checked === true)}/>
                        <span>
                            <span className="flex items-center gap-2 font-medium"><HandCoinsIcon className="size-4 text-primary"/> Sudah membayar tunai {rupiah(fee.amount)}</span>
                            <span className="mt-0.5 block text-sm text-muted-foreground">
                                Pembayaran langsung tercatat lunas. Jika belum, siswa membayar dan mengunggah bukti transfer dari dashboard.
                            </span>
                        </span>
                    </label>
                )}

                <div className="flex flex-wrap gap-2">
                    <Button type="submit" size="lg" disabled={form.processing}><UserPlusIcon/> Buat akun</Button>
                    <p className="flex items-center gap-2 text-sm text-muted-foreground"><PrinterIcon className="size-4"/> Kartu login ditampilkan setelah akun dibuat.</p>
                </div>
            </form>
        </>
    )
}

Create.layout = page => <AdminNav>{page}</AdminNav>

export default Create
