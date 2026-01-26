import { createClient } from '@/lib/supabase/server'
import { NotificationPayload, NotificationProvider } from './types'

class MockNotificationAdapter implements NotificationProvider {
    async send(payload: NotificationPayload): Promise<boolean> {
        console.log(`[MockNotification] Sending ${payload.type} to ${payload.recipient} via Console:`)
        console.log(`Content: Hi ${payload.customerName}, your booking at ${payload.businessName} for ${payload.serviceName} on ${payload.date} at ${payload.time} is ${payload.type === 'cancellation' ? 'CANCELLED' : 'CONFIRMED'}.`)
        return true
    }
}

export class NotificationService {
    private provider: NotificationProvider

    constructor() {
        // In the future, switch based on env vars
        this.provider = new MockNotificationAdapter()
    }

    async sendNotification(payload: NotificationPayload) {
        try {
            const supabase = await createClient()

            // 1. Send via provider
            const sent = await this.provider.send(payload)

            // 2. Log to Database
            if (sent) {
                await supabase.from('notification_logs').insert({
                    user_id: payload.userId,
                    booking_id: payload.bookingId,
                    channel: 'whatsapp', // Defaulting to commonly wanted one for logs
                    type: payload.type,
                    recipient: payload.recipient,
                    content: `Booking ${payload.type} for ${payload.serviceName}`,
                    status: 'sent'
                })
            }

            return sent
        } catch (error) {
            console.error('Failed to send notification:', error)
            return false
        }
    }
}

export const notificationService = new NotificationService()
