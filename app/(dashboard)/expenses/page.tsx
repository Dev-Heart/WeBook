"use client"

import { useEffect, useState } from "react"
import { Plus, Receipt, Trash2, Pencil, Calendar, ArrowUp, ArrowDown } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { getBusinessProfile, formatCurrency } from "@/lib/business-data"
import { createExpenseAction, getExpensesAction, deleteExpenseAction, updateExpenseAction } from "@/app/actions"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function ExpensesPage() {
    const [loading, setLoading] = useState(true)
    const [expenses, setExpenses] = useState<any[]>([])
    const [profile, setProfile] = useState<any>(null)

    // Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [currentId, setCurrentId] = useState<string | null>(null)

    // Form State
    const [amount, setAmount] = useState("")
    const [category, setCategory] = useState("Other")
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [description, setDescription] = useState("")

    const loadData = async () => {
        setLoading(true)
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
            // Fetch Profile
            const { data: dbProfile } = await supabase
                .from('business_profiles')
                .select('*')
                .eq('user_id', user.id)
                .single()

            if (dbProfile) {
                setProfile({ currency: dbProfile.currency_display })
            } else {
                setProfile(getBusinessProfile())
            }

            // Fetch Expenses
            const result = await getExpensesAction()
            if (result.success && result.data) {
                setExpenses(result.data)
            }
        }
        setLoading(false)
    }

    useEffect(() => {
        loadData()
    }, [])

    const resetForm = () => {
        setAmount("")
        setCategory("Other")
        setDate(new Date().toISOString().split('T')[0])
        setDescription("")
        setIsEditing(false)
        setCurrentId(null)
    }

    const handleOpenAdd = () => {
        resetForm()
        setIsDialogOpen(true)
    }

    const handleOpenEdit = (expense: any) => {
        setAmount(expense.amount.toString())
        setCategory(expense.category)
        setDate(expense.date)
        setDescription(expense.description || "")
        setCurrentId(expense.id)
        setIsEditing(true)
        setIsDialogOpen(true)
    }

    const handleSave = async () => {
        if (!amount || !date || !category) {
            toast.error("Please fill in all required fields")
            return
        }

        setSaving(true)
        const payload = {
            amount: parseFloat(amount),
            category,
            date,
            description
        }

        let result
        if (isEditing && currentId) {
            result = await updateExpenseAction(currentId, payload)
        } else {
            result = await createExpenseAction(payload)
        }

        if (result.success) {
            toast.success(isEditing ? "Expense updated" : "Expense added")
            setIsDialogOpen(false)
            loadData() // Reload to get fresh data sorted correctly
        } else {
            toast.error(result.error || "Failed to save expense")
        }
        setSaving(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this expense?")) return

        const result = await deleteExpenseAction(id)
        if (result.success) {
            toast.success("Expense deleted")
            setExpenses(expenses.filter(e => e.id !== id))
        } else {
            toast.error(result.error || "Failed to delete expense")
        }
    }

    const currencyCode = profile?.currency || 'GHS'
    const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>

    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Expenses</h1>
                    <p className="text-muted-foreground">Track your business costs</p>
                </div>
                <Button onClick={handleOpenAdd}>
                    <Plus className="mr-2 size-4" />
                    Add Expense
                </Button>
            </div>

            {/* Totals Card */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
                        <Receipt className="size-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses, currencyCode)}</div>
                        <p className="text-xs text-muted-foreground mt-1">All time</p>
                    </CardContent>
                </Card>
            </div>

            {/* Expenses List */}
            <Card>
                <CardHeader>
                    <CardTitle>History</CardTitle>
                    <CardDescription>Recent expenses</CardDescription>
                </CardHeader>
                <CardContent>
                    {expenses.length === 0 ? (
                        <div className="text-center py-12">
                            <Receipt className="size-12 mx-auto text-muted-foreground/50" />
                            <h3 className="mt-4 text-lg font-medium">No expenses recorded</h3>
                            <p className="text-sm text-muted-foreground mb-4">Add your first expense to start tracking.</p>
                            <Button variant="outline" onClick={handleOpenAdd}>Add Expense</Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {expenses.map((expense) => (
                                <div key={expense.id} className="flex items-center justify-between py-4 border-b last:border-0 hover:bg-slate-50 px-2 rounded-lg transition-colors group">
                                    <div className="space-y-1">
                                        <p className="font-medium flex items-center gap-2">
                                            {expense.category}
                                            <span className="text-xs text-muted-foreground font-normal">| {expense.date}</span>
                                        </p>
                                        {expense.description && <p className="text-sm text-muted-foreground">{expense.description}</p>}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-semibold text-red-600">
                                            - {formatCurrency(expense.amount, currencyCode)}
                                        </span>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" className="size-8" onClick={() => handleOpenEdit(expense)}>
                                                <Pencil className="size-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="size-8 text-destructive hover:text-destructive" onClick={() => handleDelete(expense.id)}>
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isEditing ? "Edit Expense" : "Add Expense"}</DialogTitle>
                        <DialogDescription>Record a new business cost.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="amount">Amount</Label>
                            <Input
                                id="amount"
                                type="number"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="category">Category</Label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Rent">Rent</SelectItem>
                                    <SelectItem value="Products / Stock">Products / Stock</SelectItem>
                                    <SelectItem value="Transport">Transport</SelectItem>
                                    <SelectItem value="Utilities">Utilities</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="date">Date</Label>
                            <Input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Note (Optional)</Label>
                            <Textarea
                                id="description"
                                placeholder="Details..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
