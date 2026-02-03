import { redirect } from 'next/navigation'

export default function DemoPage() {
    // For now, just redirect to welcome
    // In the future, this could show a static demo dashboard
    redirect('/welcome')
}
