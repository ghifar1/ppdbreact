import React from "react";
import WelcomeNav from "../../Layouts/WelcomeNav";

const Help = ()=>{

    return(
        <div className="flex items-center justify-center mt-16 md:mt-0 min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
            Halaman panduan PPDB
        </div>
    )

}

Help.layout = page => <WelcomeNav>{page}</WelcomeNav>

export default Help
