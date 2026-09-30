import React from 'react'
import {Card, CardContent} from "@/components/ui/card";
import StatusBadge from "@/components/StatusBadge";


export const ProfileCard = ({profil})=>{

    const initials = profil.nama.split(' ').filter(Boolean).slice(0, 2).map(word => word[0]).join('').toUpperCase()

    return (
       <>
           <Card className="mb-2 shadow-md">
               <CardContent>
                   <p className="text-lg">Profil Siswa</p>
                   <div className="grid grid-cols-3 gap-2">
                       <div className="flex items-center justify-center text-3xl font-semibold text-white bg-purple-600 rounded-lg aspect-square">
                           {initials}
                       </div>
                       <div className="col-span-2">
                           <p className="text-lg font-bold">{profil.nama}</p>
                           <hr className="border my-1"/>
                           <div className="text-sm">
                               <div className="grid grid-cols-3 gap-y-1">
                                   <p>No. Daftar</p>
                                   <p className="col-span-2 font-mono">: {profil.nomor_pendaftaran}</p>
                                   <p>Status Akun</p>
                                   <p className="col-span-2">: <StatusBadge status={profil.status} label={profil.status_label}/></p>
                                   <p>Username</p>
                                   <p className="col-span-2">: @{profil.username}</p>
                                   <p>No. HP</p>
                                   <p className="col-span-2">: {profil.no_hp} </p>
                                   <p>Jenjang</p>
                                   <p className="col-span-2">: {profil.jenjang} </p>
                               </div>
                           </div>
                       </div>
                   </div>
               </CardContent>
           </Card>
       </>
    )
}
