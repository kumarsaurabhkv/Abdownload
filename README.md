# Ableton Downloader - Deployment Guide for Cloudflare Pages + Workers KV

This guide explains how to deploy the **Ableton Downloader** site (direct installer links for all Ableton Live versions) on **Cloudflare Pages** with persistent auto-updating version list using **Workers KV**.

Live demo: https://abdownload.pages.dev/

## Features
- Direct download links from Ableton’s official CDN
- Supports Suite, Standard, Intro, Lite
- Windows / macOS (Intel & Apple Silicon) detection
- Collapsible accordion for major versions (12.x, 11.x, etc.)
- Auto-detects and adds new versions (e.g., 12.3.1 as of December 16, 2025)
- Custom version input
- Auto-starts download on button click

## Prerequisites
- A Cloudflare account (free plan is sufficient)
- GitHub account (or GitLab/Bitbucket) for repository
- Basic knowledge of Git

## Step 1: Create the Repository

1. Create a new GitHub repository (e.g., `ableton-downloader`)
2. Clone it locally
3. Add the following files (use the latest versions from our conversation):

```
/
├── index.html
├── app.js
├── fetch-latest.js
├── styles.css
└── functions/
    └── api/
        ├── get-versions.js
        └── update-versions.js
```

> Use the final versions we refined:
> - `index.html` with custom classes for non-collapsible Custom Version
> - `styles.css` with accordion and fixed custom section
> - `app.js` with accordion logic and auto-download trigger
> - `fetch-latest.js` with robust notice insertion

## Step 2: Create KV Namespace

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select **Workers & Pages** → **KV**
3. Click **Create namespace**
4. Name: `ABLETON_VERSIONS` (or any name)
5. Copy the **Namespace ID** (needed for initial seeding)

## Step 3: Seed Initial Version List

Use Wrangler CLI (recommended):

```bash
npm install -g wrangler
wrangler login
```

Then run:

```bash
wrangler kv:key put --namespace-id=YOUR_NAMESPACE_ID "versions_list" '["12.3.1","12.3","12.2.7","12.2.6","12.2.5","12.2.2","12.2.1","12.2","12.1.11","12.1.10","12.1.9","12.1.8","12.1.7","12.1.6","12.1.5","12.1.4","12.1.3","12.1.2","12.1.1","12.1","12.0.25","12.0.20","12.0.12","12.0.11","12.0.10","12.0.9","12.0.8","12.0.7","12.0.6","12.0.5","12.0.4","12.0.3","12.0.2","12.0.1","12.0","11.3.43","11.3.42","11.3.35","11.3.30","11.3.20","11.3.13","11.3.12","11.3.11","11.3.10","11.3.4","11.3.3","11.3.2","11.2.11","11.2.10","11.2.7","11.2.6","11.2.5","11.2","11.1.5","11.1.1","11.1","11.0.12","11.0.11","11.0.10","11.0.6","11.0.5","11.0.2","11.0.1","11.0","10.1.43","10.1.30","10.1.25","10.1.18","10.1.17","10.1.15","10.1.14","10.1.13","10.1.9","10.1.7","10.1.6","10.1.5","10.1.4","10.1.3","10.1.2","10.1.1","10.1","10.0.6","10.0.5","10.0.4","10.0.3","10.0.2","10.0.1","10.0","9.7.7","9.7.6","9.7.5","9.7.4","9.7.3","9.7.2","9.7.1","9.7","9.6.2","9.6.1","9.6","9.5","9.2.3","9.2.2","9.2.1","9.2","9.1.10","9.1.9","9.1.8","9.1.7","9.1.6","9.1.5","9.1.4","9.1.3","9.1.2","9.1","9.0.6","9.0.5","9.0.4","9.0.3","9.0.2","9.0.1"]'
```

## Step 4: Deploy to Cloudflare Pages

1. Go to **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
2. Select your repository
3. Configure build settings:
   - Framework preset: **None**
   - Build command: (leave empty)
   - Build output directory: `/`
4. Click **Save and Deploy**

## Step 5: Bind KV Namespace to Pages Functions

1. After first deploy, go to your Pages project → **Settings** → **Functions**
2. Under **KV namespace bindings**, click **Add binding**
   - Variable name: `VERSIONS_KV`
   - Namespace: Select your `ABLETON_VERSIONS` namespace
3. Save → Redeploy

## Step 6: Add Proxy Worker (Optional but Recommended)

You already have `https://abproxy.cmpxor.workers.dev` — keep using it for fetching release notes (bypasses CORS).

If you want to create your own:

```js
// proxy worker
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const target = url.searchParams.get('url')
  if (!target) return new Response('Missing url param', {status: 400})
  
  const response = await fetch(target)
  return new Response(response.body, response)
}
```

## Final Result

Your site is now live and will:
- Auto-detect new Ableton versions
- Permanently save them in KV
- Auto-select latest
- Auto-start downloads
- Look clean with collapsible sections

**No maintenance required** — new versions appear automatically!

## Credits & Disclaimer

This tool uses official Ableton CDN links. It is not affiliated with Ableton AG. Use responsibly.

Built with ❤️ using Cloudflare Pages + Workers KV

Enjoy making music! 🎹
