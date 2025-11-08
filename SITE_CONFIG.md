# Site Configuration Guide

This project now uses environment variables to configure the site URL and social handles. This makes it easy to change the domain without modifying code.

## Environment Variables

### Required Variables

#### `NEXT_PUBLIC_SITE_URL`
The full URL of your site (including protocol).

**Examples:**
- Production: `https://debiasdaily.com`
- Staging: `https://staging.debiasdaily.com`
- Development: `http://localhost:3000`

**Usage:**
- Used in metadata (Open Graph, Twitter Cards)
- Used for canonical URLs
- Used in `metadataBase` for Next.js metadata

**Note:** The `NEXT_PUBLIC_` prefix makes this available on both client and server. If you only need it server-side, you can use `SITE_URL` instead.

### Optional Variables

#### `NEXT_PUBLIC_SITE_NAME`
The display name of your site (shown in header, metadata, etc.).

**Examples:**
- `Bias Daily`
- `Daily Bias`
- `Your Custom Name`

**Default:** `Bias Daily`

**Note:** This is the name that appears in the header, page titles, and throughout the UI. It doesn't need to match your domain name.

#### `NEXT_PUBLIC_TWITTER_HANDLE`
Your Twitter handle (with or without @).

**Examples:**
- `@debiasdaily`
- `debiasdaily`

**Default:** `@debiasdaily`

## How to Configure

### For Local Development

Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=Bias Daily
NEXT_PUBLIC_TWITTER_HANDLE=@debiasdaily
```

### For Production (Netlify)

1. Go to your Netlify site settings
2. Navigate to **Environment variables**
3. Add the following variables:
   - `NEXT_PUBLIC_SITE_URL` = `https://debiasdaily.com` (or your new domain)
   - `NEXT_PUBLIC_SITE_NAME` = `Bias Daily` (or your preferred name)
   - `NEXT_PUBLIC_TWITTER_HANDLE` = `@debiasdaily` (or your handle)

### For Other Platforms

Set the environment variables in your deployment platform's settings. The variables will be read at build time.

## What Changed

All hardcoded domain and site name references have been moved to the `lib/site-config.ts` file:

- ✅ `app/layout.tsx` - Now uses `siteConfig.url`, `siteConfig.name`, and `siteConfig.twitterHandle`
- ✅ `components/daily-header.tsx` - Now uses `siteConfig.name` for the header
- ✅ Metadata (Open Graph, Twitter Cards, canonical URLs) - All use configurable values
- ✅ Site name - Centralized in `siteConfig` and configurable via environment variable
- ✅ All pages (about, settings, onboarding) - Use `siteConfig.name` for consistency

## Changing the Domain

To change your domain:

1. Set the `NEXT_PUBLIC_SITE_URL` environment variable to your new domain
2. Rebuild and redeploy your application
3. All metadata, Open Graph tags, and canonical URLs will automatically use the new domain

## Fallback Behavior

If environment variables are not set, the system will fall back to:
- Site URL: `https://debiasdaily.com`
- Site Name: `Bias Daily`
- Twitter Handle: `@debiasdaily`

This ensures the site works even if environment variables are not configured.

## Consistency

All site name references have been standardized to use `siteConfig.name`:
- ✅ Header displays `siteConfig.name`
- ✅ Page titles use `siteConfig.name`
- ✅ Metadata uses `siteConfig.name`
- ✅ All UI text consistently uses `siteConfig.name`

This means you can change the site name everywhere by just updating the `NEXT_PUBLIC_SITE_NAME` environment variable.

