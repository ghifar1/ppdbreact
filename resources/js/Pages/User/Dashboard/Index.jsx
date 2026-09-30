import React from "react";
import UserNav from "../../../Layouts/UserNav";
import PageHeader from "@/components/PageHeader";
import {FormChecklist} from "./FormChecklist";
import {NextStep} from "./NextStep";
import {ProfileCard} from "./ProfileCard";
import {ProgressUser} from "./ProgressUser";

const Index = ({profil, dataLengkap, jadwal})=>{

    const firstName = profil.nama.split(' ')[0]

    return (
        <>
            <PageHeader
                headTitle="Dashboard"
                eyebrow="Dashboard pendaftaran"
                title={`Assalamu'alaikum, ${firstName}`}
                description="Pantau kelengkapan data dan status pendaftaranmu di sini."
            />
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="grid content-start gap-6">
                    <ProfileCard profil={profil}/>
                    <FormChecklist/>
                </div>
                <div className="grid content-start gap-6 lg:col-span-2">
                    <NextStep profil={profil} dataLengkap={dataLengkap}/>
                    <ProgressUser profil={profil} dataLengkap={dataLengkap} jadwal={jadwal}/>
                </div>
            </div>
        </>
    )
}

Index.layout = page => <UserNav>{page}</UserNav>

export default Index
