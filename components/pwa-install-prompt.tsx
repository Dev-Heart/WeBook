'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, X } from 'lucide-react'

export function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
    const [showPrompt, setShowPrompt] = useState(false)

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e)
            setShowPrompt(true)
        }

        window.addEventListener('beforeinstallprompt', handler)

        // Register service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch((error) => {
                console.log('Service Worker registration failed:', error)
            })
        }

        return () => window.removeEventListener('beforeinstallprompt', handler)
    }, [])

    const handleInstall = async () => {
        if (!deferredPrompt) return

        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice

        if (outcome === 'accepted') {
            setShowPrompt(false)
        }

        setDeferredPrompt(null)
    }

    if (!showPrompt) return null

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white border border-slate-200 rounded-lg shadow-lg p-4 z-50 animate-in slide-in-from-bottom">
            <button
                onClick={() => setShowPrompt(false)}
                className="absolute top-2 right-2 p-1 hover:bg-slate-100 rounded"
            >
                <X className="size-4 text-slate-500" />
            </button>
            <div className="flex items-start gap-3">
                <div className="size-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                    W
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-1">Install WeBook</h3>
                    <p className="text-xs text-slate-600 mb-3">
                        Add WeBook to your home screen for quick access and offline support.
                    </p>
                    <Button
                        onClick={handleInstall}
                        size="sm"
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                    >
                        <Download className="size-4 mr-2" />
                        Install App
                    </Button>
                </div>
            </div>
        </div>
    )
}
