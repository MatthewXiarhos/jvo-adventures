# JVO Adventures — GitHub Pages Website

A static website for JVO Adventures with mobile-friendly event management.

## Features
- Event listing with photos, details, difficulty badges
- Mobile admin panel to add/edit/delete events
- Photo uploads via Cloudinary (free tier)
- Event sign-up forms via Tally (free tier, sends email to Johnnie)
- No server required — runs entirely on GitHub Pages

---

## Setup Guide (Step by Step)

### Step 1 — Create GitHub Repo

1. Go to [github.com](https://github.com) and sign in (or create a free account)
2. Click **New repository**
3. Name it exactly: `jvo-adventures`
4. Set to **Public**
5. Click **Create repository**
6. Upload all these files into the repo (drag and drop them in)

### Step 2 — Enable GitHub Pages

1. In the repo, click **Settings** → **Pages** (left sidebar)
2. Under "Source", select **Deploy from a branch**
3. Branch: `main`, folder: `/ (root)`
4. Click **Save**
5. Your site will be live at: `https://YOUR_USERNAME.github.io/jvo-adventures`

### Step 3 — Get a GitHub Personal Access Token

This lets the admin page save events directly to the site.

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click **Generate new token (classic)**
3. Name: `JVO Adventures Admin`
4. Expiration: No expiration (or 1 year)
5. Scopes: Check **repo** (just the top-level one)
6. Click **Generate token** — **copy it immediately**, you won't see it again

### Step 4 — Set Up Cloudinary (Free Photo Uploads)

1. Go to [cloudinary.com](https://cloudinary.com) and create a free account
2. Your **Cloud Name** is shown on the dashboard
3. Go to **Settings → Upload → Upload presets**
4. Click **Add upload preset**
   - Preset name: `jvo_adventures`
   - Signing mode: **Unsigned**
   - Folder: `jvo-adventures`
   - Save
5. Note your cloud name (e.g. `dxyz12345`)

### Step 5 — Set Up Tally Forms

Tally is free and sends Johnnie an email every time someone signs up.

#### Sign-Up Form
1. Go to [tally.so](https://tally.so) and create a free account
2. Create a **New Form** — call it "JVO Adventures Event Sign-Up"
3. Add these fields:
   - **Name** (required)
   - **Email** (required)  
   - **Phone** (optional)
   - **Hidden field**: `event_name`
   - **Hidden field**: `event_date`
   - **Notes / questions** (optional, long text)
4. In **Form settings → Notifications**: add Johnnie's email
5. **Publish** the form — copy the form ID from the URL
   - URL looks like: `tally.so/r/ABC123` → ID is `ABC123`

#### Contact Form (optional)
1. Create a second form called "JVO Contact"
2. Fields: Name, Email, Message
3. Add Johnnie's email to notifications
4. Copy the form ID

#### Tally Styling (to match the site)
1. In Tally form settings → **Design**
2. Background color: `#1e3a2f` (dark forest green)
3. Button color: `#4a8c67`
4. Font: DM Sans (or similar clean sans-serif)
5. This makes the Tally form feel part of the brand

### Step 6 — Update the Config Values

Edit these two files with your real values:

**`js/events.js`** — find `const CONFIG = {` and update:
```js
GITHUB_USER: 'your_actual_github_username',
GITHUB_REPO: 'jvo-adventures',
TALLY_SIGNUP_BASE: 'https://tally.so/r/YOUR_SIGNUP_FORM_ID',
CLOUDINARY_CLOUD: 'your_cloudinary_cloud_name',
```

**`admin/index.html`** — find `const ADMIN_CONFIG = {` and update:
```js
PASSWORD: 'choose_a_strong_password',
GITHUB_TOKEN: 'ghp_xxxxxxxxxxxxxxxxxxxx',  // from Step 3
GITHUB_USER: 'your_actual_github_username',
GITHUB_REPO: 'jvo-adventures',
CLOUDINARY_CLOUD: 'your_cloudinary_cloud_name',
CLOUDINARY_PRESET: 'jvo_adventures',
```

**`index.html`** — find `CONTACT_FORM_ID` and replace with your contact Tally form ID.

### Step 7 — Custom Domain (Optional)

If Johnnie gets `jvoadventures.com`:
1. In the GitHub Pages settings, enter the custom domain
2. In your domain registrar's DNS settings, add a CNAME record pointing to `YOUR_USERNAME.github.io`

---

## How Johnnie Adds Events (From Phone)

1. Go to `https://YOUR_USERNAME.github.io/jvo-adventures/admin/` on mobile
2. Enter the password
3. Fill in the event details
4. Tap **Upload Photo from Phone** → takes a photo or picks from gallery (via Cloudinary)
5. Tap **Save Event to Site**
6. The site updates within ~1 minute (GitHub Pages rebuilds automatically)

## How Sign-Ups Work

When someone taps "Sign Up for This Trip":
1. They're taken to the Tally form (pre-filled with event name + date)
2. They fill in their name, email, phone
3. Tally sends Johnnie an email with all their details
4. The submitter sees a confirmation page

---

## File Structure

```
jvo-adventures/
├── index.html          ← Home page
├── events.html         ← All events listing
├── events.json         ← Event data (updated by admin panel)
├── css/
│   └── style.css       ← All styles
├── js/
│   └── events.js       ← Event loading + rendering + config
└── admin/
    └── index.html      ← Mobile admin panel
```

---

## Notes

- **Password security**: The admin password in the HTML is visible to anyone who views source. This is fine for casual use — the worst case is someone adds a fake event (which Johnnie can delete). For better security, change the password periodically.
- **GitHub token**: Keep it private. Don't share the admin URL publicly.
- **Tally free tier**: Unlimited forms, unlimited submissions on the free plan.
- **Cloudinary free tier**: 25GB storage, 25GB bandwidth/month — more than enough for event photos.
