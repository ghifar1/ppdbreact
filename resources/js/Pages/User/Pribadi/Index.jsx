import React, {useState} from "react";
import UserNav from "../../../Layouts/UserNav";
import {PageTitle} from "../../../Layouts/PageTitle";
import {Card, CardContent} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Button} from "@/components/ui/button";
import {Calendar} from "@/components/ui/calendar";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {BsInfoCircle} from "react-icons/bs";
import {ChevronDownIcon} from "lucide-react";

const today = new Date();
const fromMonth = new Date(today.getFullYear() - 25, 0);
const toMonth = new Date(today.getFullYear(), today.getMonth());

const Index = ()=>{

    const [tanggalLahir, SetTanggalLahir] = useState()
    const [kalenderOpen, SetKalenderOpen] = useState(false)

    return (
        <>
            <PageTitle>Data Pribadi</PageTitle>
            <div className="my-3">
                <Card>
                    <CardContent>
                        {/*Informasi*/}
                        <div className="flex justify-start items-center gap-2">
                            <div className="">
                                <BsInfoCircle/>
                            </div>
                            <div className="text-sm">
                                Silakan isi data pribadi, form wajib diisi jika mempunyai simbol bintang merah
                                (<span className="text-red-500 font-bold">*</span>).
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="my-3">
                <Card>
                    <CardContent>
                        <div className="grid gap-2 my-3">
                            <Label htmlFor="nik">
                                <span>NIK</span><span className="text-red-500 font-bold">*</span>
                            </Label>
                            <Input id="nik" />
                        </div>
                        <div className="grid gap-2 my-3">
                            <Label htmlFor="nama_lengkap">
                                <span>Nama Lengkap</span><span className="text-red-500 font-bold">*</span>
                            </Label>
                            <Input id="nama_lengkap" />
                        </div>
                        <div className="grid gap-2 my-3">
                            <Label htmlFor="jenis_kelamin">
                                <span>Jenis Kelamin</span>
                            </Label>
                            <Select defaultValue="Laki-Laki">
                                <SelectTrigger id="jenis_kelamin" className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Laki-Laki">Laki-Laki</SelectItem>
                                    <SelectItem value="Perempuan">Perempuan</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2 my-3">
                            <Label htmlFor="tempat_lahir">
                                <span>Tempat Lahir</span><span className="text-red-500 font-bold">*</span>
                            </Label>
                            <Input id="tempat_lahir" required/>
                        </div>
                        <div className="grid gap-2 my-3">
                            <Label htmlFor="tanggal_lahir">
                                <span>Tanggal Lahir</span><span className="text-red-500 font-bold">*</span>
                            </Label>
                            <Popover open={kalenderOpen} onOpenChange={SetKalenderOpen}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" id="tanggal_lahir" className="w-full justify-between font-normal">
                                        {tanggalLahir
                                            ? tanggalLahir.toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})
                                            : 'Pilih tanggal'}
                                        <ChevronDownIcon />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={tanggalLahir}
                                        captionLayout="dropdown"
                                        startMonth={fromMonth}
                                        endMonth={toMonth}
                                        defaultMonth={tanggalLahir}
                                        disabled={{after: today}}
                                        onSelect={(date)=>{
                                            SetTanggalLahir(date)
                                            SetKalenderOpen(false)
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}

Index.layout = page => <UserNav>{page}</UserNav>

export default Index
