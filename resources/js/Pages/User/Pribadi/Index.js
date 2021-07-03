import React, {useState} from "react";
import UserNav from "../../../Layouts/UserNav";
import {PageTitle} from "../../../Layouts/PageTitle";
import {Card, CardBody, Label, Input, Select} from "@windmill/react-ui";
import DayPickerInput from "react-day-picker/DayPickerInput";
import 'react-day-picker/lib/style.css';
import {BsInfoCircle, Inf} from "react-icons/bs";

const currentYear = new Date().getFullYear();
const fromMonth = new Date(currentYear, 0);
const toMonth = new Date(currentYear + 10, 11);

const Index = ()=>{
    return (
        <>
            <PageTitle>Data Pribadi</PageTitle>
            <div className="my-3">
                <Card>
                    <CardBody>
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
                    </CardBody>
                </Card>
            </div>

            <div className="my-3">
                <Card>
                    <CardBody>
                        <Label className="my-3">
                            <span>NIK</span><span className="text-red-500 font-bold"> *</span>
                            <Input className="mt-1" />
                        </Label>
                        <Label className="my-3">
                            <span>Nama Lengkap</span><span className="text-red-500 font-bold"> *</span>
                            <Input className="mt-1" />
                        </Label>
                        <Label className="my-3">
                            <span>Jenis Kelamin</span>
                            <Select className="mt-1">
                                <option>Laki-Laki</option>
                                <option>Perempuan</option>
                            </Select>
                        </Label>
                        <Label className="my-3">
                            <span>Tempat Lahir</span><span className="text-red-500 font-bold"> *</span>
                            <Input className="mt-1" required/>
                        </Label>
                        <Label className="my-3">
                            <span>Tanggal Lahir</span><span className="text-red-500 font-bold"> *</span>
                            <br className="mb-2"/>
                            
                        </Label>
                    </CardBody>
                </Card>
            </div>
        </>
    )
}

Index.layout = body => <UserNav body={body}/>

export default Index
