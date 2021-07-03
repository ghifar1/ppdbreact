import React, {useEffect} from "react";
import WelcomeNav from "../Layouts/WelcomeNav";
import {InertiaLink} from "@inertiajs/inertia-react";


const Welcome = ()=>{

    return(
        <div className="mx-3 sm:mx-20 mt-20">
            <div className="bg-blue-500 h-52 sm:h-60 flex items-center rounded-md">
                <div className="font-poppins text-3xl sm:text-4xl mx-2" >
                    PPDB Online 2022
                </div>
            </div>
            <div className="font-poppins flex flex-wrap justify-center my-5">
                <div className="w-full sm:w-72 h-60 bg-green-400 rounded-md p-3 m-3">
                        <div className="flex justify-center">
                            <img src="https://ppdb.ma-alkhairiyah.sch.id/img/logoak.png"
                            style={{ width: 100}}
                            ></img>
                        </div>
                        <div className="mt-2 text-center text-xl">
                            Madrasah Ibtidaiyah
                        </div>

                    <div className="mt-2">
                            <InertiaLink href="/login" className="block text-center bg-white rounded-md py-1 my-1">Login</InertiaLink>
                        <a className="block text-center bg-white rounded-md py-1 my-1">Daftar</a>
                    </div>
                </div>
                <div className="w-full sm:w-72 h-60 bg-blue-500 rounded-md p-3 m-3">
                    <div className="flex justify-center">
                        <img src="https://ppdb.ma-alkhairiyah.sch.id/img/logoak.png"
                             style={{ width: 100}}
                        ></img>
                    </div>
                    <div className="mt-2 text-center text-xl">
                        Madrasah Tsanawiyah
                    </div>

                    <div className="mt-2">
                        <a className="block text-center bg-white rounded-md py-1 my-1">Login</a>
                        <a className="block text-center bg-white rounded-md py-1 my-1">Daftar</a>
                    </div>
                </div>
                <div className="w-full sm:w-72 h-60 bg-blue-800 rounded-md p-3 m-3">
                    <div className="flex justify-center">
                        <img src="https://ppdb.ma-alkhairiyah.sch.id/img/logoak.png"
                             style={{ width: 100}}
                        ></img>
                    </div>
                    <div className="mt-2 text-center text-xl text-white">
                        Madrasah Aliyah
                    </div>

                    <div className="mt-2">
                        <a className="block text-center bg-white rounded-md py-1 my-1">Login</a>
                        <a className="block text-center bg-white rounded-md py-1 my-1">Daftar</a>
                    </div>
                </div>
            </div>
        </div>
    )
}
Welcome.layout = body => <WelcomeNav body={body} />

export default Welcome
