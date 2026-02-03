"use client"

import { useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function AddServiceDialog({
    onSuccess,
    open: externalOpen,
    onOpenChange: externalOnOpenChange
}: {
    onSuccess?: () => void,
    open?: boolean,
    onOpenChange?: (open: boolean) => void
}) {
    const [internalOpen, setInternalOpen] = useState(false)
    const open = externalOpen ?? internalOpen
    const setOpen = externalOnOpenChange ?? setInternalOpen
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        duration: '',
        category: '',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            toast.error('You must be logged in to add a service')
            setLoading(false)
            return
        }

        try {
            const { error } = await supabase
                .from('services')
                .insert({
                    user_id: user.id,
                    name: formData.name,
                    price: parseFloat(formData.price),
                    duration: parseInt(formData.duration),
                    category: formData.category || 'General',
                    active: true,
                })

            if (error) throw error

            toast.success('Service added successfully!')
            setOpen(false)
            setFormData({ name: '', price: '', duration: '', category: '' })
            if (onSuccess) onSuccess()
        } catch (error: any) {
            console.error('Error adding service:', error)
            toast.error('Failed to add service')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="size-4" />
                    Add Service
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add New Service</DialogTitle>
                        <DialogDescription>
                            Define a new service you offer to your clients.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="service-name">Service Name</Label>
                            <Input
                                id="service-name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Haircut"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="category">Category</Label>
                            <Input
                                id="category"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                placeholder="Hair"
                                required
                            />
                        </div>
                        <div className="grid flex-1 gap-2">
                            <Label htmlFor="price">Price</Label>
                            <Input
                                id="price"
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                placeholder="50"
                                required
                            />
                        </div>
                        <div className="grid flex-1 gap-2">
                            <Label htmlFor="duration">Duration (mins)</Label>
                            <Input
                                id="duration"
                                type="number"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                placeholder="30"
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Service'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
