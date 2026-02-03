"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { getAdminStatusAction, adminUpdateSubscriptionAction, getAdminAllDataAction } from "@/app/actions"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Loader2, ShieldAlert, CheckCircle, Clock } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function AdminPage() {
    const [loading, setLoading] = useState(true)
    const [verifying, setVerifying] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)
    const [businesses, setBusinesses] = useState<any[]>([])
    const router = useRouter()

    useEffect(() => {
        async function checkAccess() {
            setVerifying(true)
            const { isAdmin } = await getAdminStatusAction()
            if (!isAdmin) {
                router.push('/') // Redirect unauthorized users
                return
            }
            setIsAdmin(true)
            setVerifying(false)
            loadBusinesses()
        }

        checkAccess()
    }, [])

    async function loadBusinesses() {
        setLoading(true)

        const result = await getAdminAllDataAction()
        if (result.success) {
            setBusinesses(result.data)
        } else {
            toast.error(result.error)
        }

        setLoading(false)
    }

    // Helper for updating status
    const updateStatus = async (userId: string, status: string, plan: string, daysToAdd: number = 0) => {
        const confirmMsg = `Set status to ${status}?`
        if (!confirm(confirmMsg)) return

        const now = new Date()
        let end = new Date()

        if (daysToAdd > 0) {
            end.setDate(now.getDate() + daysToAdd)
        } else if (status === 'expired') {
            end = new Date(now.getTime() - 1000) // Expire immediately
        } else {
            end.setDate(now.getDate() + 30) // Default 30 days for active
        }

        const updates = {
            status,
            plan,
            current_period_end: end.toISOString()
        }

        const result = await adminUpdateSubscriptionAction(userId, updates)
        if (result.success) {
            toast.success("Updated successfully")
            loadBusinesses()
        } else {
            toast.error(result.error)
        }
    }

    if (verifying) return <div className="p-8 flex items-center justify-center h-screen"><Loader2 className="animate-spin mr-2" /> Verifying Admin Access...</div>

    if (!isAdmin) return null // Should have redirected

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <ShieldAlert className="text-red-600" />
                        Admin Dashboard
                    </h1>
                    <p className="text-muted-foreground">Manage subscriptions and businesses.</p>
                </div>
                <Button onClick={loadBusinesses} variant="outline" size="sm">
                    Refresh
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>
            ) : (
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Business Name</TableHead>
                                <TableHead>Owner Email</TableHead>
                                <TableHead>City</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Plan</TableHead>
                                <TableHead>Exipres</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {businesses.map((biz) => (
                                <TableRow key={biz.user_id}>
                                    <TableCell className="font-medium">{biz.business_name}</TableCell>
                                    <TableCell>{biz.email}</TableCell>
                                    <TableCell>{biz.city}</TableCell>
                                    <TableCell>
                                        <Badge variant={biz.sub_status === 'active' ? 'default' : biz.sub_status === 'trial' ? 'outline' : 'destructive'}>
                                            {biz.sub_status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="capitalize">{biz.sub_plan?.replace('_', ' ')}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-xs">
                                            <span>{biz.sub_end ? format(new Date(biz.sub_end), 'PP') : '-'}</span>
                                            <span className="text-muted-foreground">
                                                {biz.days_remaining} days left
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-8 border-green-200 hover:bg-green-50 text-green-700"
                                            onClick={() => updateStatus(biz.user_id, 'active', 'monthly')}
                                        >
                                            <CheckCircle className="size-3 mr-1" />
                                            Activate
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-8"
                                            onClick={() => updateStatus(biz.user_id, 'trial', 'free_trial', 30)}
                                        >
                                            <Clock className="size-3 mr-1" />
                                            Reset Trial
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            className="h-8"
                                            onClick={() => updateStatus(biz.user_id, 'expired', 'free_trial')}
                                        >
                                            Expire
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    )
}
