'use client'

import { useState, useEffect } from 'react'
import { DollarSign, Loader2, Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { getServices, Service } from '@/lib/business-data'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function AddIncomeDialog({
    open,
    onOpenChange,
    onSuccess
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}) {
    const [loading, setLoading] = useState(false)
    const [services, setServices] = useState<Service[]>([])
    const [formData, setFormData] = useState({
        client_name: '',
        service_id: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
    })

    useEffect(() => {
        setServices(getServices())
    }, [open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                toast.error('You must be logged in to record income')
                return
            }

            const selectedService = services.find(s => s.id === formData.service_id)

            const { error } = await supabase
                .from('bookings')
                .insert({
                    user_id: user.id,
                    client_name: formData.client_name || 'Walk-in Client',
                    service_name: selectedService?.name || 'Manual Entry',
                    service_id: formData.service_id || null,
                    amount: parseFloat(formData.amount),
                    date: formData.date,
                    time: '12:00', // Default for manual income
                    status: 'completed',
                    notes: `Manually recorded income. Price: ${formData.amount}`
                })

            if (error) throw error

            toast.success('Income recorded successfully!')
            onOpenChange(false)
            setFormData({
                client_name: '',
                service_id: '',
                amount: '',
                date: new Date().toISOString().split('T')[0],
            })
            if (onSuccess) onSuccess()
        } catch (error: any) {
            console.error('Failed to record income:', error)
            toast.error(`Failed to record income: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Record Income</DialogTitle>
                        <DialogDescription>
                            Manually record a payment received from a client.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="client_name">Client Name (Optional)</Label>
                            <Input
                                id="client_name"
                                value={formData.client_name}
                                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                                placeholder="e.g. Walk-in or Client Name"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="service">Service</Label>
                            <Select
                                value={formData.service_id}
                                onValueChange={(val) => {
                                    const s = services.find(s => s.id === val)
                                    setFormData({
                                        ...formData,
                                        service_id: val,
                                        amount: s ? s.price.toString() : formData.amount
                                    })
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a service" />
                                </SelectTrigger>
                                <SelectContent>
                                    {services.map(s => (
                                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                    ))}
                                    <SelectItem value="other">Other / Manual</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="amount">Amount Received</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    id="amount"
                                    type="number"
                                    className="pl-9"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="date">Date</Label>
                            <Input
                                id="date"
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Record Payment'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
