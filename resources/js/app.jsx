import '@fontsource-variable/plus-jakarta-sans'
import '@fontsource-variable/lora'
import { createInertiaApp } from '@inertiajs/react'
import { createRoot } from 'react-dom/client'

createInertiaApp({
    title: (title, page) => {
        const brand = `PPDB ${page?.props?.sekolah?.nama ?? 'Online'}`
        return title ? `${title} · ${brand}` : brand
    },
    resolve: name => {
        const pages = import.meta.glob('./Pages/**/*.jsx')
        return pages[`./Pages/${name}.jsx`]()
    },
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />)
    },
    progress: {
        color: '#d4a72c',
    },
})
