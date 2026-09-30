<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#0b4a36" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <script>
        try {
            const theme = localStorage.getItem('theme')
            if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark')
            }
        } catch (e) {}
    </script>
    <style>
        /* Spinner shown only until React renders into #app. */
        .loading { display: none; }
        #app:empty + .loading {
            display: block;
            position: fixed;
            inset: 0;
            margin: auto;
            width: 2.5rem;
            height: 2.5rem;
            border-radius: 9999px;
            border: 3px solid rgb(11 74 54 / 0.15);
            border-top-color: #146c4f;
            animation: spin 800ms linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
    </style>
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    <x-inertia::head />
</head>
<body>
<x-inertia::app />
<div class="loading" role="status" aria-label="Memuat"></div>
</body>
</html>
