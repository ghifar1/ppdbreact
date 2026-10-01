import React, {useState} from "react";
import {Link, useForm, usePage} from "@inertiajs/react";
import {ArrowLeftIcon, ArrowRightIcon, CheckIcon, InfoIcon, LockIcon, SaveIcon} from "lucide-react";
import UserNav from "../../Layouts/UserNav";
import FormFieldInput from "@/components/FormFieldInput";
import PageHeader from "@/components/PageHeader";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";

/** Pills for every form menu, so the student sees where they are. */
const Steps = ({menus, currentId})=>(
    <nav className="-mx-1 mb-6 flex gap-2 overflow-x-auto px-1 pb-1" aria-label="Formulir">
        {menus.map((menu, i) => {
            const current = menu.id === currentId

            return (
                <Link key={menu.id} href={`/formulir/${menu.id}`} aria-current={current ? 'step' : undefined}
                      className={cn(
                          "flex shrink-0 items-center gap-2 rounded-full border py-1.5 pr-4 pl-1.5 text-sm font-medium transition-colors",
                          current ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-accent",
                      )}>
                    <span className={cn(
                        "flex size-6 items-center justify-center rounded-full text-xs font-bold",
                        current ? "bg-gold text-gold-foreground"
                            : menu.complete ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                    )}>
                        {menu.complete && !current ? <CheckIcon className="size-3.5" strokeWidth={3}/> : i + 1}
                    </span>
                    {menu.title}
                </Link>
            )
        })}
    </nav>
)

const Form = ({menu, fields, values, canEdit})=>{

    const {studentMenus} = usePage().props
    // Bumped after each save so file inputs are cleared once their upload is stored.
    const [fileInputKey, setFileInputKey] = useState(0)

    const form = useForm({
        answers: Object.fromEntries(fields.map(field => [field.id, field.type === 'file' ? null : values[field.id]])),
    })

    const setAnswer = (id, value) => form.setData(data => ({...data, answers: {...data.answers, [id]: value}}))

    function submit(e)
    {
        e.preventDefault()
        form.post(`/formulir/${menu.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                form.setData(data => ({
                    ...data,
                    answers: Object.fromEntries(Object.entries(data.answers).map(([id, value]) => [id, value instanceof File ? null : value])),
                }))
                setFileInputKey(key => key + 1)
            },
        })
    }

    const position = studentMenus.findIndex(item => item.id === menu.id)
    const previous = studentMenus[position - 1]
    const next = studentMenus[position + 1]
    const complete = studentMenus[position]?.complete

    return (
        <>
            <PageHeader
                eyebrow={position >= 0 ? `Formulir ${position + 1} dari ${studentMenus.length}` : 'Formulir'}
                title={menu.title}
                actions={complete
                    ? <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-sm font-semibold text-primary"><CheckIcon className="size-4"/> Lengkap</span>
                    : <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">Belum lengkap</span>}
            />

            <Steps menus={studentMenus} currentId={menu.id}/>

            {!canEdit && (
                <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
                    <LockIcon className="mt-0.5 size-4 shrink-0"/>
                    Data sudah diajukan untuk finalisasi sehingga tidak dapat diubah.
                </div>
            )}

            <form onSubmit={submit} className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                {menu.description && (
                    <div className="flex items-start gap-3 border-b bg-secondary/60 px-6 py-4 text-sm text-secondary-foreground">
                        <InfoIcon className="mt-0.5 size-4 shrink-0"/>
                        <p className="whitespace-pre-line">{menu.description}</p>
                    </div>
                )}

                <div className="grid gap-x-6 gap-y-5 p-6 sm:grid-cols-2 sm:p-8">
                    {fields.length === 0 && (
                        <p className="text-sm text-muted-foreground sm:col-span-2">Belum ada isian di formulir ini.</p>
                    )}
                    {fields.map(field => (
                        <FormFieldInput
                            key={field.type === 'file' ? `${field.id}-${fileInputKey}` : field.id}
                            field={field}
                            value={form.data.answers[field.id]}
                            onChange={value => setAnswer(field.id, value)}
                            error={form.errors[`answers.${field.id}`]}
                            disabled={!canEdit}
                            storedFile={field.type === 'file' ? values[field.id] : null}
                        />
                    ))}
                </div>

                <div className="flex flex-col-reverse gap-3 border-t bg-muted/40 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                    <div className="flex gap-2">
                        {previous && (
                            <Button asChild variant="ghost">
                                <Link href={`/formulir/${previous.id}`}><ArrowLeftIcon/> Sebelumnya</Link>
                            </Button>
                        )}
                        {next && (
                            <Button asChild variant="ghost">
                                <Link href={`/formulir/${next.id}`}>{next.title} <ArrowRightIcon/></Link>
                            </Button>
                        )}
                    </div>
                    {canEdit && fields.length > 0 && (
                        <div className="flex items-center gap-4">
                            <p className="hidden text-xs text-muted-foreground md:block">
                                Tanda <span className="font-bold text-destructive">*</span> wajib diisi
                            </p>
                            <Button type="submit" size="lg" disabled={form.processing}>
                                <SaveIcon/> {form.processing ? 'Menyimpan…' : 'Simpan'}
                            </Button>
                        </div>
                    )}
                </div>
            </form>
        </>
    )
}

Form.layout = page => <UserNav>{page}</UserNav>

export default Form
