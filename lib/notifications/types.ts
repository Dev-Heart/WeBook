export type NotificationChannel = 'email' | 'sms' | 'whatsapp'
export type NotificationType = 'confirmation' | 'reminder' | 'cancellation'

export interface NotificationPayload {
    userId: string
    bookingId?: string
    recipient: string
    type: NotificationType
    customerName: string
    businessName: string
    serviceName: string
    date: string
    time: string
    metadata?: Record<string, any>
}

export interface NotificationProvider {
    send(payload: NotificationPayload): Promise<boolean>
}
