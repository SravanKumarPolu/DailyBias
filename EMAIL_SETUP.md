# Email Setup Guide for Feedback Form

This project uses **EmailJS** to send feedback emails from the client-side (works with static export).

## Setup Instructions

### 1. Create EmailJS Account

1. Go to [https://www.emailjs.com](https://www.emailjs.com)
2. Sign up for a free account (200 emails/month free)
3. Verify your email address

### 2. Add Email Service

1. In EmailJS dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose your email provider (Gmail recommended)
4. Follow the setup instructions to connect your email
5. Copy the **Service ID** (e.g., `service_xxxxx`)

### 3. Create Email Template

1. Go to **Email Templates** in EmailJS dashboard
2. Click **Create New Template**
3. Use this template structure:

**Subject:**
```
Feedback for Bias: {{bias_title}}
```

**Content:**
```
New feedback received for DailyBias content:

Bias ID: {{bias_id}}
Bias Title: {{bias_title}}
Feedback Type: {{feedback_type}}
Rating: {{rating}}
Comment: {{comment}}

Submitted: {{timestamp}}
Date: {{date}}

---
This email was sent from the DailyBias feedback form.
```

4. Set the **To Email** field to: `debiasdaily@gmail.com`
5. Copy the **Template ID** (e.g., `template_xxxxx`)

### 4. Get Public Key

1. Go to **Account** → **General** in EmailJS dashboard
2. Find your **Public Key** (e.g., `xxxxxxxxxxxxx`)
3. Copy it

### 5. Configure Environment Variables

Create a `.env.local` file in the project root (or add to your existing `.env` file):

```bash
# EmailJS Configuration
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_xxxxx
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_xxxxx
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxx
```

**Important:**
- All variables must start with `NEXT_PUBLIC_` to be available in the browser
- Replace the values with your actual EmailJS credentials
- Never commit `.env.local` to git (it should be in `.gitignore`)

### 6. For Production (Netlify)

1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Add the three environment variables:
   - `NEXT_PUBLIC_EMAILJS_SERVICE_ID`
   - `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID`
   - `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY`
4. Redeploy your site

## How It Works

1. User submits feedback through the feedback form
2. Feedback is stored in IndexedDB (local storage) for backup
3. Email is sent to `debiasdaily@gmail.com` via EmailJS
4. If email fails, feedback is still stored locally (graceful degradation)

## Testing

1. Fill out the feedback form on any bias page
2. Submit feedback
3. Check your email inbox at `debiasdaily@gmail.com`
4. You should receive an email with the feedback details

## Troubleshooting

- **Emails not sending**: Check browser console for errors
- **Configuration errors**: Verify all environment variables are set correctly
- **Rate limits**: Free tier allows 200 emails/month
- **EmailJS not initialized**: Check that `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` is set

## Security Notes

- EmailJS public key is safe to expose (it's designed for client-side use)
- The service ID and template ID are also safe to expose
- EmailJS handles rate limiting and spam protection
- All emails are sent through EmailJS's secure infrastructure

