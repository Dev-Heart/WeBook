"use client"

import { useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, Download, MessageSquare, Printer, Share2, Check } from "lucide-react"
import { toast } from "sonner"

export function ShareBookingDialog({ userId, businessName }: { userId: string, businessName: string }) {
    const [copied, setCopied] = useState(false)
    const bookingUrl = typeof window !== "undefined"
        ? `${window.location.origin}/book?u=${userId}`
        : `/book?u=${userId}`

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
        `Hi! You can book an appointment with ${businessName} here: ${bookingUrl}`
    )}`

    const copyToClipboard = () => {
        navigator.clipboard.writeText(bookingUrl)
        setCopied(true)
        toast.success("Booking link copied to clipboard!")
        setTimeout(() => setCopied(false), 2000)
    }

    const downloadQRCode = () => {
        const svg = document.getElementById("booking-qr")
        if (!svg) return

        const svgData = new XMLSerializer().serializeToString(svg)
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        const img = new Image()

        img.onload = () => {
            canvas.width = img.width
            canvas.height = img.height
            ctx?.drawImage(img, 0, 0)
            const pngFile = canvas.toDataURL("image/png")
            const downloadLink = document.createElement("a")
            downloadLink.download = `${businessName.replace(/\s+/g, '-').toLowerCase()}-booking-qr.png`
            downloadLink.href = `${pngFile}`
            downloadLink.click()
            toast.success("QR Code downloaded!")
        }

        img.src = "data:image/svg+xml;base64," + btoa(svgData)
    }

    const printQRCode = () => {
        const windowUrl = 'about:blank';
        const uniqueName = new Date().getTime();
        const windowName = 'Print' + uniqueName;
        const printWindow = window.open(windowUrl, windowName, 'left=50000,top=50000,width=0,height=0');

        const svg = document.getElementById("booking-qr")
        if (!svg || !printWindow) return

        const svgData = new XMLSerializer().serializeToString(svg)

        printWindow.document.write(`
            <html>
                <head>
                    <title>Print QR Code - ${businessName}</title>
                    <style>
                        body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; }
                        h1 { margin-bottom: 20px; }
                        .qr-container { width: 300px; height: 300px; }
                    </style>
                </head>
                <body>
                    <h1>Book with ${businessName}</h1>
                    <div class="qr-container">${svgData}</div>
                    <p>${bookingUrl}</p>
                    <script>
                        window.onload = function() {
                            window.print();
                            window.close();
                        }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Share2 className="size-4" />
                    Share Booking Link
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Share Your Booking Link</DialogTitle>
                    <DialogDescription>
                        Give your customers an easy way to book with you.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center justify-center py-6 space-y-6">
                    {/* QR Code */}
                    <div className="bg-white p-4 rounded-xl border-4 border-primary/10 shadow-sm">
                        <QRCodeSVG
                            id="booking-qr"
                            value={bookingUrl}
                            size={200}
                            level="H"
                            includeMargin={false}
                        />
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3 w-full">
                        <Button variant="outline" className="gap-2" onClick={downloadQRCode}>
                            <Download className="size-4" />
                            Download
                        </Button>
                        <Button variant="outline" className="gap-2" onClick={printQRCode}>
                            <Printer className="size-4" />
                            Print
                        </Button>
                    </div>

                    <div className="w-full space-y-4">
                        <div className="space-y-2">
                            <Label>Manual Link</Label>
                            <div className="flex gap-2">
                                <Input value={bookingUrl} readOnly className="bg-muted" />
                                <Button size="icon" variant="outline" onClick={copyToClipboard}>
                                    {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
                                </Button>
                            </div>
                        </div>

                        <Button className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white gap-2" asChild>
                            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                                <MessageSquare className="size-4" />
                                Share to WhatsApp
                            </a>
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
