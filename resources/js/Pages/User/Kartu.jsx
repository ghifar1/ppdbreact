import React from "react";
import {PrinterIcon} from "lucide-react";
import UserNav from "../../Layouts/UserNav";
import {PageTitle} from "../../Layouts/PageTitle";
import {Button} from "@/components/ui/button";

const Kartu = ({kartu})=>{

    return (
        <>
            <div className="print:hidden">
                <PageTitle>Kartu Ujian</PageTitle>
            </div>

            <div className="max-w-xl p-6 mb-6 bg-white border-2 border-gray-800 rounded-lg text-gray-900 print:mt-0 print:border-black">
                <div className="pb-3 mb-4 text-center border-b-2 border-gray-800">
                    <p className="text-sm tracking-widest uppercase">Kartu Peserta Ujian</p>
                    <p className="text-xl font-bold">PPDB {kartu.jenjang}</p>
                    <p className="text-sm">Tahun Ajaran {kartu.tahun}</p>
                </div>
                <dl className="grid grid-cols-3 gap-y-2 text-sm">
                    <dt>No. Pendaftaran</dt>
                    <dd className="col-span-2 font-mono font-semibold">: {kartu.nomor_pendaftaran}</dd>
                    <dt>Nama</dt>
                    <dd className="col-span-2 font-semibold">: {kartu.nama}</dd>
                    <dt>Username</dt>
                    <dd className="col-span-2">: {kartu.username}</dd>
                    <dt>Jenjang</dt>
                    <dd className="col-span-2">: {kartu.jenjang}</dd>
                </dl>
                <p className="mt-6 text-xs text-gray-600">
                    Bawa kartu ini saat ujian seleksi.
                </p>
            </div>

            <div className="mb-8 print:hidden">
                <Button onClick={() => window.print()} className="bg-purple-600 text-white hover:bg-purple-700">
                    <PrinterIcon/> Cetak kartu
                </Button>
            </div>
        </>
    )
}

Kartu.layout = page => <UserNav>{page}</UserNav>

export default Kartu
