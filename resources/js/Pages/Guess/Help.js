import React, {useState} from "react";
import WelcomeNav from "../../Layouts/WelcomeNav";

const Help = ()=>{

    return(
        <div className="flex items-center justify-center mt-16 md:mt-0 min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
            Halaman pendaftaran PPDB
        </div>
    )

}

Help.layout = body => <WelcomeNav body={body}/>

export default Help
