import React from 'react'
import {Card, CardBody} from "@windmill/react-ui";


export const ProfileCard = ({profil})=>{
    return (
       <>
           <Card className="mb-2 shadow-md">
               <CardBody>
                   <p className="text-lg">Profil Siswa</p>
                   <div className="grid grid-cols-3 gap-2">
                       <img className="rounded-lg" src="https://st4.depositphotos.com/4778169/20535/v/600/depositphotos_205358872-stock-illustration-cute-indonesian-junior-high-school.jpg"/>
                       <div className="col-span-2">
                           <p className="text-lg font-bold">{profil.nama}</p>
                           <hr className="border my-1"/>
                           <div className="text-sm">
                               <div className="grid grid-cols-3">
                                   <p>Status Akun</p>
                                   <p className="col-span-2">: {profil.status_akun} </p>
                                   <p>No. HP</p>
                                   <p className="col-span-2">: {profil.no_hp} </p>
                                   <p>Pendaftaran</p>
                                   <p className="col-span-2">: {profil.jenis_pendaftaran} </p>

                               </div>
                           </div>
                       </div>
                   </div>
               </CardBody>
           </Card>
       </>
    )
}

