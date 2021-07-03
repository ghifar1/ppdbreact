import React from 'react'
import {Card, CardBody} from "@windmill/react-ui";



export const ProgressUser = ({profil})=>{
    return (
        <>
            <Card className="mb-2 shadow-md">
                <CardBody>
                    <p className="text-xl mb-2">Timeline</p>
                    <div className="container w-full h-full">
                        <div className="relative wrap overflow-hidden h-full">
                            <div className="border-2-2 absolute border-dashed border-blue-500 h-full border left-2" ></div>

                            <div className={"ml-5 mb-5 rounded-md p-2 " + (profil.status_akun == 'Pengisian Data' ? 'text-white bg-blue-700' : 'text-gray-400 bg-blue-100 dark:bg-gray-700')}>
                                <p className="text-lg">Pengisian Data</p>
                                <p className="text-xs">3 April - 8 Juli 2022</p>
                                <hr className={"border mr-2 rounded-lg my-1 " +(profil.status_akun == 'Pengisian Data' ? 'border-white' : 'border-gray-400') } />
                                <div className="text-sm">
                                    Halo {profil.nama}, silakan isi data pribadi, data orang tua, data sekolah
                                    dan, data prestasi kamu (jika memiliki) pada menu di samping kiri.
                                </div>
                            </div>

                            <div className={"ml-5 mb-5 rounded-md p-2 " + (profil.status_akun == 'Pengajuan Finalisasi' ? 'text-white bg-blue-700' : 'text-gray-400 bg-blue-100 dark:bg-gray-700')}>
                                <p className="text-lg">Pengajuan Finalisasi Data</p>
                                <p className="text-xs">3 April - 8 Juli 2022</p>
                                <hr className={"border mr-2 rounded-lg my-1 " +(profil.status_akun == 'Pengajuan Finalisasi' ? 'border-white' : 'border-gray-400') } />
                                <div className="text-sm">
                                    Ajukan Finalisasi data, nanti Admin akan mengecek datamu dalam 2x24 jam
                                </div>
                                <div className="flex justify-center">
                                    <button className="text-lg py-1 px-3 bg-blue-800 text-white rounded-lg disabled:opacity-50" disabled={ profil.status_akun == 'Pengajuan Finalisasi' ? false : true }>Finalisasi</button>
                                </div>
                            </div>

                            <div className={"ml-5 mb-5 rounded-md p-2 " + (profil.status_akun == 'Pengajuan Finalisasi' ? 'text-white bg-blue-700' : 'text-gray-400 bg-blue-100 dark:bg-gray-700')}>
                                <p className="text-lg">Hasil Pengajuan Finalisasi</p>
                                <p className="text-xs"></p>
                                <hr className={"border mr-2 rounded-lg my-1 " +(profil.status_akun == 'Pengajuan Finalisasi' ? 'border-white' : 'border-gray-400') } />
                                <div className="text-sm">

                                </div>
                            </div>

                            <div className={"ml-5 mb-5 rounded-md p-2 " + (profil.status_akun == 'Pengajuan Finalisasi' ? 'text-white bg-blue-700' : 'text-gray-400 bg-blue-100 dark:bg-gray-700')}>
                                <p className="text-lg">Unduh Kartu Ujian</p>
                                <p className="text-xs"><p className="text-xs">3 April - 10 Juli 2022</p></p>
                                <hr className={"border mr-2 rounded-lg my-1 " +(profil.status_akun == 'Pengajuan Finalisasi' ? 'border-white' : 'border-gray-400') } />
                                <div className="text-sm">

                                </div>
                            </div>

                            <div className={"ml-5 mb-5 rounded-md p-2 " + (profil.status_akun == 'Pengajuan Finalisasi' ? 'text-white bg-blue-700' : 'text-gray-400 bg-blue-100 dark:bg-gray-700')}>
                                <p className="text-lg">Hasil Seleksi</p>
                                <p className="text-xs">15 Juli 2022</p>
                                <hr className={"border mr-2 rounded-lg my-1 " +(profil.status_akun == 'Pengajuan Finalisasi' ? 'border-white' : 'border-gray-400') } />
                                <div className="text-sm">

                                </div>
                            </div>

                        </div>

                    </div>

                </CardBody>
            </Card>
        </>
    )
}

