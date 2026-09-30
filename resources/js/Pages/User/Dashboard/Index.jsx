import React from "react";
import UserNav from "../../../Layouts/UserNav";
import {PageTitle} from "../../../Layouts/PageTitle";
import {ProfileCard} from "./ProfileCard";
import {ProgressUser} from "./ProgressUser";

const Index = ({profil, dataLengkap, jadwal})=>{

    return  (
        <>
            <PageTitle>Dashboard Pendaftaran</PageTitle>
            <div className="grid gap-6 mb-8 md:grid-cols-2">
                <div className="w-auto">
                    <ProfileCard profil={profil}></ProfileCard>
                </div>
                <ProgressUser profil={profil} dataLengkap={dataLengkap} jadwal={jadwal}></ProgressUser>
            </div>
        </>
    )
}

Index.layout = page => <UserNav>{page}</UserNav>

export default Index
