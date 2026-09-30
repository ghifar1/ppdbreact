import React, {useState} from "react";
import {Link, useForm, usePage} from "@inertiajs/react";
import {ArrowRightIcon, LockIcon} from "lucide-react";
import {BsInfoCircle} from "react-icons/bs";
import UserNav from "../../Layouts/UserNav";
import {PageTitle} from "../../Layouts/PageTitle";
import FormFieldInput from "@/components/FormFieldInput";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";

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
    const next = studentMenus[position + 1]

    return (
        <>
            <PageTitle>{menu.title}</PageTitle>

            {(menu.description || !canEdit) && (
                <div className="my-3">
                    <Card>
                        <CardContent className="grid gap-2">
                            {menu.description && (
                                <div className="flex justify-start items-center gap-2">
                                    <BsInfoCircle className="shrink-0"/>
                                    <div className="text-sm whitespace-pre-line">{menu.description}</div>
                                </div>
                            )}
                            {!canEdit && (
                                <div className="flex justify-start items-center gap-2 text-sm text-amber-700 dark:text-amber-400">
                                    <LockIcon className="w-4 h-4 shrink-0"/>
                                    Data sudah diajukan untuk finalisasi sehingga tidak dapat diubah.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            <form className="my-3 mb-8" onSubmit={submit}>
                <Card>
                    <CardContent>
                        {fields.length === 0 && (
                            <p className="text-sm text-muted-foreground">Belum ada isian di menu ini.</p>
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

                        {(canEdit && fields.length > 0) || next ? (
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-4 mt-4 border-t">
                                {canEdit && fields.length > 0 ? (
                                    <Button type="submit" disabled={form.processing}
                                            className="bg-purple-600 text-white hover:bg-purple-700">
                                        {form.processing ? 'Menyimpan…' : 'Simpan'}
                                    </Button>
                                ) : <span/>}
                                {next && (
                                    <Button asChild variant="ghost" className="text-purple-600 dark:text-purple-400">
                                        <Link href={`/formulir/${next.id}`}>{next.title} <ArrowRightIcon/></Link>
                                    </Button>
                                )}
                            </div>
                        ) : null}
                    </CardContent>
                </Card>
            </form>
        </>
    )
}

Form.layout = page => <UserNav>{page}</UserNav>

export default Form
