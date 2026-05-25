<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Typography: Modern font imports for enhanced premium aesthetics -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800;900&family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600&display=swap" rel="stylesheet">
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400;500;600&display=swap" rel="stylesheet" />

        <!-- Global Premium Styling -->
        <style>
            /* Smooth Scroll */
            html {
                scroll-behavior: smooth;
            }

            /* Custom Selection Colors */
            ::selection {
                background-color: #2563eb;
                color: #ffffff;
            }
            ::-moz-selection {
                background-color: #2563eb;
                color: #ffffff;
            }

            /* Premium Custom Scrollbars (Webkit/Blink) */
            ::-webkit-scrollbar {
                width: 9px;
                height: 9px;
            }
            ::-webkit-scrollbar-track {
                background: #f8fafc;
            }
            ::-webkit-scrollbar-thumb {
                background: #cbd5e1;
                border-radius: 9999px;
                border: 2px solid #f8fafc;
                transition: background-color 0.2s ease;
            }
            ::-webkit-scrollbar-thumb:hover {
                background: #2563eb; /* Vibrant brand blue on hover */
                border-color: #f8fafc;
            }

            /* Dark-mode custom scrollbars */
            .dark ::-webkit-scrollbar-track {
                background: #0f172a;
            }
            .dark ::-webkit-scrollbar-thumb {
                background: #334155;
                border-color: #0f172a;
            }
            .dark ::-webkit-scrollbar-thumb:hover {
                background: #3b82f6;
                border-color: #0f172a;
            }

            /* Ambient Floating Backdrops */
            .global-ambient-backdrop {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: -10;
                pointer-events: none;
                overflow: hidden;
                background-color: #fcfdfe;
                transition: background-color 0.5s ease;
            }
            .dark .global-ambient-backdrop {
                background-color: #070a13;
            }

            /* Reveal ambient backdrop glows by making top-level layout wrappers transparent */
            #app,
            #app > div,
            #app > div.bg-gray-50,
            #app > div.bg-white,
            #app > div.min-h-screen {
                background-color: transparent !important;
            }


            /* Fine Dot Grid overlay */
            .global-dot-grid {
                position: absolute;
                inset: 0;
                opacity: 0.25;
                background-image: radial-gradient(rgba(37, 99, 235, 0.12) 1.2px, transparent 1.2px);
                background-size: 24px 24px;
                mask-image: radial-gradient(circle at 50% 50%, black 30%, transparent 80%);
                -webkit-mask-image: radial-gradient(circle at 50% 50%, black 30%, transparent 80%);
            }
            .dark .global-dot-grid {
                opacity: 0.12;
                background-image: radial-gradient(rgba(59, 130, 246, 0.2) 1.5px, transparent 1.5px);
            }

            /* Floating animations for neon glow spheres */
            @keyframes float-blob-1 {
                0% { transform: translate(0px, 0px) scale(1); }
                50% { transform: translate(40px, -60px) scale(1.1); }
                100% { transform: translate(0px, 0px) scale(1); }
            }
            @keyframes float-blob-2 {
                0% { transform: translate(0px, 0px) scale(1.1); }
                50% { transform: translate(-50px, 50px) scale(0.9); }
                100% { transform: translate(0px, 0px) scale(1.1); }
            }
            @keyframes float-blob-3 {
                0% { transform: translate(0px, 0px) scale(0.95); }
                50% { transform: translate(50px, 30px) scale(1.05); }
                100% { transform: translate(0px, 0px) scale(0.95); }
            }

            .ambient-glow {
                position: absolute;
                border-radius: 50%;
                filter: blur(140px);
                opacity: 0.06;
                pointer-events: none;
                transition: opacity 0.5s ease;
            }
            .dark .ambient-glow {
                opacity: 0.1;
            }

            .glow-blue {
                width: 500px;
                height: 500px;
                background: radial-gradient(circle, #2563eb 0%, #1d4ed8 100%);
                top: -120px;
                left: -80px;
                animation: float-blob-1 20s infinite alternate ease-in-out;
            }
            .glow-indigo {
                width: 550px;
                height: 550px;
                background: radial-gradient(circle, #6366f1 0%, #4338ca 100%);
                bottom: -180px;
                right: -80px;
                animation: float-blob-2 25s infinite alternate ease-in-out;
            }
            .glow-emerald {
                width: 380px;
                height: 380px;
                background: radial-gradient(circle, #10b981 0%, #059669 100%);
                top: 30%;
                left: 40%;
                animation: float-blob-3 22s infinite alternate ease-in-out;
            }
        </style>

        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased text-slate-800">
        <!-- Ambient Decorative Backdrop -->
        <div class="global-ambient-backdrop">
            <div class="global-dot-grid"></div>
            <div class="ambient-glow glow-blue"></div>
            <div class="ambient-glow glow-indigo"></div>
            <div class="ambient-glow glow-emerald"></div>
        </div>

        <!-- Horizontal Scroll Progress Indicator -->
        <div id="global-scroll-progress" style="
            position: fixed;
            top: 0;
            left: 0;
            height: 3px;
            width: 0%;
            background: linear-gradient(90deg, #2563eb 0%, #6366f1 50%, #10b981 100%);
            z-index: 99999;
            transition: width 0.1s cubic-bezier(0.1, 0.8, 0.3, 1), opacity 0.3s ease;
            opacity: 0;
            pointer-events: none;
            box-shadow: 0 1px 8px rgba(37, 99, 235, 0.3);
        "></div>

        @inertia

        <!-- Scroll Tracker Script -->
        <script>
            (function() {
                function updateScroll() {
                    const docEl = document.documentElement;
                    const body = document.body;
                    
                    // Track standard document/window scroll (Landing/Auth pages)
                    const windowScroll = window.pageYOffset || docEl.scrollTop || body.scrollTop;
                    const windowHeight = docEl.scrollHeight - docEl.clientHeight;
                    let scrolled = 0;
                    
                    if (windowHeight > 0) {
                        scrolled = (windowScroll / windowHeight) * 100;
                    }
                    
                    // Track internal main dashboard layout scroll (if applicable)
                    const mainEl = document.querySelector('main');
                    if (mainEl) {
                        const mainScroll = mainEl.scrollTop;
                        const mainHeight = mainEl.scrollHeight - mainEl.clientHeight;
                        if (mainHeight > 0 && mainScroll > 0) {
                            scrolled = (mainScroll / mainHeight) * 100;
                        }
                    }
                    
                    const progressIndicator = document.getElementById('global-scroll-progress');
                    if (progressIndicator) {
                        progressIndicator.style.width = scrolled + '%';
                        if (scrolled > 1) {
                            progressIndicator.style.opacity = '1';
                        } else {
                            progressIndicator.style.opacity = '0';
                        }
                    }
                }
                
                // Attach listeners
                window.addEventListener('scroll', updateScroll, { passive: true });
                document.addEventListener('scroll', updateScroll, { capture: true, passive: true });
                window.addEventListener('resize', updateScroll, { passive: true });
                
                // Track Inertia.js navigation events
                document.addEventListener('inertia:success', function() {
                    setTimeout(updateScroll, 150);
                });
                
                // Initialize
                setTimeout(updateScroll, 250);
            })();
        </script>
    </body>
</html>