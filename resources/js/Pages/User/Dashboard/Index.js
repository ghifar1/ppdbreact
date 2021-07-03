import React, {Fragment, useEffect, useState} from "react";
import UserNav from "../../../Layouts/UserNav";
import {PageTitle} from "../../../Layouts/PageTitle";
import {ProfileCard} from "./ProfileCard";
import {ProgressUser} from "./ProgressUser";

const profil = {
    'nama': 'Muhammad Al Ghifari',
    'status_akun': 'Pengisian Data',
    'no_hp' : '+6281905101057',
    'jenis_pendaftaran': 'Offline',
}

const Index = ()=>{

    return  (
        <>
            <PageTitle>Dashboard Pendaftaran</PageTitle>
            <div className="grid gap-6 mb-8 md:grid-cols-2">
                <div className="w-auto">
                    <ProfileCard profil={profil}></ProfileCard>
                </div>
                <ProgressUser profil={profil}></ProgressUser>
            </div>
        </>
    )
}

Index.layout = body => <UserNav body={body}/>

export default Index

