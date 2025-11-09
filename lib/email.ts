/**
 * Email utility for sending feedback emails
 * Uses EmailJS for client-side email sending (works with static export)
 */

import emailjs from '@emailjs/browser'

// EmailJS configuration
const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || ''
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || ''
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || ''
const RECIPIENT_EMAIL = 'debiasdaily@gmail.com'

export interface FeedbackEmailData {
  biasId: string
  biasTitle: string
  feedbackType: 'accuracy' | 'clarity' | 'completeness' | 'other'
  rating: 'positive' | 'negative'
  comment?: string
  timestamp: number
}

/**
 * Initialize EmailJS (should be called once, typically in a useEffect)
 */
export function initEmailJS() {
  if (EMAILJS_PUBLIC_KEY) {
    try {
      emailjs.init(EMAILJS_PUBLIC_KEY)
    } catch (error) {
      console.warn('[Email] Failed to initialize EmailJS:', error)
    }
  }
}

/**
 * Send feedback email to debiasdaily@gmail.com
 * Returns true if email was sent successfully, false otherwise
 */
export async function sendFeedbackEmail(data: FeedbackEmailData): Promise<boolean> {
  // Check if EmailJS is configured
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    console.warn('[Email] EmailJS not configured. Skipping email send.')
    return false
  }

  try {
    // Format the feedback data for email template
    const templateParams = {
      to_email: RECIPIENT_EMAIL,
      bias_id: data.biasId,
      bias_title: data.biasTitle,
      feedback_type: data.feedbackType,
      rating: data.rating === 'positive' ? 'Good' : 'Needs Improvement',
      comment: data.comment || 'No additional comments provided',
      timestamp: new Date(data.timestamp).toLocaleString(),
      date: new Date(data.timestamp).toISOString(),
    }

    // Send email via EmailJS
    // Note: publicKey can be passed as 4th parameter or set via init()
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    )

    console.log('[Email] Feedback email sent successfully:', response)
    return true
  } catch (error) {
    console.error('[Email] Failed to send feedback email:', error)
    // Don't throw - we want to continue even if email fails
    return false
  }
}

/**
 * Check if email functionality is available
 */
export function isEmailAvailable(): boolean {
  return !!(
    EMAILJS_SERVICE_ID &&
    EMAILJS_TEMPLATE_ID &&
    EMAILJS_PUBLIC_KEY
  )
}

