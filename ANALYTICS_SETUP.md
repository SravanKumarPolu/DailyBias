# Analytics Setup Guide

## Plausible Analytics Integration

This project uses **Plausible Analytics** - a privacy-focused analytics solution that tracks unique visitors without cookies.

### Why Plausible?

✅ **Privacy-first**: No cookies, GDPR compliant, no personal data collected  
✅ **Lightweight**: Only ~1KB script (vs 45KB for Google Analytics)  
✅ **Simple**: Clear dashboard showing unique visitors, page views, referrers  
✅ **Fast**: Doesn't slow down your site  
✅ **Free tier**: 10,000 pageviews/month free, then $9/month for 100k pageviews  

### Setup Instructions

#### 1. Sign up for Plausible

1. Go to [https://plausible.io](https://plausible.io)
2. Click "Start free trial" or "Sign up"
3. Create your account (no credit card required for free tier)

#### 2. Add Your Domain

1. In your Plausible dashboard, click "Add a website"
2. Enter your domain (e.g., `debiasdaily.com`)
3. Copy the domain name exactly as shown

#### 3. Configure Environment Variable

Create a `.env.local` file in the project root (or add to your existing `.env` file):

```bash
# Plausible Analytics Domain
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=debiasdaily.com
```

**Important**: 
- Use your actual domain (without `https://` or `www`)
- The variable must start with `NEXT_PUBLIC_` to be available in the browser
- Analytics will only load in production mode

#### 4. Deploy

After setting the environment variable and deploying, analytics will automatically start tracking.

### What You'll See in Plausible Dashboard

- **Unique Visitors**: Number of unique users per day/week/month
- **Page Views**: Total page views
- **Top Pages**: Most visited pages
- **Referrers**: Where your traffic comes from
- **Countries**: Geographic distribution
- **Devices**: Desktop vs Mobile vs Tablet
- **Browsers**: Browser breakdown

### Testing

- Analytics **only loads in production mode** (not in development)
- To test locally, you can temporarily set `NODE_ENV=production` (not recommended)
- Best to test after deploying to production

### Disabling Analytics

To disable analytics, simply remove or comment out the `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` environment variable.

### Privacy Policy Update

Since Plausible is privacy-focused and doesn't use cookies, you may want to update your privacy policy to mention:

> "We use Plausible Analytics, a privacy-focused analytics tool that doesn't use cookies and doesn't collect personal data. We only see aggregated statistics about page views and unique visitors."

### Cost

- **Free**: Up to 10,000 pageviews/month
- **Starter**: $9/month for 100,000 pageviews
- **Business**: $19/month for 1,000,000 pageviews

For most small to medium sites, the free tier is sufficient.

### Support

- Plausible Docs: [https://plausible.io/docs](https://plausible.io/docs)
- Plausible Support: support@plausible.io

---

**Note**: The analytics component is already integrated in `app/layout.tsx`. You just need to set the environment variable and deploy!

