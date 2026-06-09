# Gifted with Love

> **Crafted by us. Gifted by you.**

A boutique 3D printing studio turning your digital memories into tangible art. Custom lithophane lamps, painted miniatures, and personalized gifts — printed on demand in Bangalore, shipped pan-India.

[**giftedwithlove.in**](https://giftedwithlove.in)

---

## What We Build

| Product | Description | Starting Price |
|---------|-------------|----------------|
| **3D Face Miniatures** | Hand-painted 3D bust from your photo | ₹2,499 |
| **Lithophane Lamps** | Photos that illuminate when backlit | ₹1,999 |
| **Personalized Bookmarks** | Custom photo & text bookmarks | ₹299 |
| **Custom Keychains** | Carry memories everywhere | ₹499 |
| **Couple Gifts** | Heart-shaped lamps & pair busts | ₹3,499 |
| **Corporate Gifts** | Premium bulk 3D printed items | Custom quote |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + Vite |
| **Styling** | Tailwind CSS 3 |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Routing** | React Router v7 |
| **Auth & DB** | Supabase |
| **Payments** | Razorpay |
| **Hosting** | Vercel |

---

## Features

- **Authentication** — Email/password + Google OAuth via Supabase Auth
- **Shopping Cart** — Guest & authenticated cart with Supabase sync
- **Razorpay Checkout** — Secure UPI, card & wallet payments
- **Order Tracking** — Real-time status updates with photo upload & design approval
- **User Profiles** — Editable addresses, order history, saved preferences
- **Community** — Share your 3D printed creations
- **Responsive Design** — Mobile-first dark theme with orange accents

---

## Quick Start

### Prerequisites

- Node.js 18+
- A Supabase project ([create free](https://supabase.com))
- A Razorpay account ([create here](https://razorpay.com)) — test mode works for development

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/giftedwithlove.git
cd giftedwithlove
npm install
```

### 2. Environment Variables

Create `.env` in the root (see `.env.example` for all variables):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

### 3. Database Setup

1. Go to your Supabase project → SQL Editor
2. Run [`supabase_schema.sql`](supabase_schema.sql) to create tables, RLS policies, and seed data

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 5. Build for Production

```bash
npm run build
```

---

## Deploy to Vercel

This repo uses a **two-branch, two-project** setup on Vercel:

| Project | Branch | Root Directory | URL |
|---------|--------|---------------|-----|
| Storefront | `main` | `/` | `giftedwithlove.vercel.app` |
| Admin CRM | `admin` | `/admin` | `admin-giftedwithlove.vercel.app` |

### Storefront

```bash
npm i -g vercel
vercel --prod
```

- Connect to the `main` branch
- Framework preset: **Vite**
- Root Directory: `/`
- Add env vars in Vercel dashboard → Project Settings → Environment Variables

### Admin Dashboard

Create a **second Vercel project** for the admin panel:

1. Import the same GitHub repo
2. Connect to the **`admin`** branch
3. Framework preset: **Vite**
4. Root Directory: **`/admin`** (Vercel will find `admin/package.json` here)
5. Add the same environment variables

The admin branch contains everything on `main` **plus** the `admin/` folder.

---

## Project Structure

```
giftedwithlove/
├── public/
│   └── images/products/       # Product photos
├── src/
│   ├── components/            # Reusable UI components
│   ├── contexts/              # Auth & Cart providers
│   ├── hooks/                 # Custom hooks
│   ├── lib/                   # Supabase client, Razorpay, utilities
│   ├── pages/                 # Route pages
│   ├── App.jsx                # Routes
│   └── main.jsx               # Entry point
├── supabase_schema.sql        # Database setup
├── tailwind.config.js
└── vercel.json                # SPA routing
```

---

## Database Schema

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles (auto-created on signup) |
| `products` | Product catalog with categories |
| `cart_items` | Shopping cart with custom image support |
| `orders` | Order records with status tracking |
| `order_items` | Line items per order |
| `order_history` | Audit log of status changes |
| `reviews` | Product reviews |
| `community_posts` | Community sharing |
| `contact_submissions` | Customer enquiries |

All tables have **Row Level Security (RLS)** enabled.

---

## Payment Flow

1. User adds items to cart → proceeds to checkout
2. Razorpay checkout modal opens
3. User completes payment (UPI / Card / Wallet)
4. Order is saved to Supabase with payment ID
5. Cart is cleared → order confirmation shown

> For production, verify Razorpay signatures via a Supabase Edge Function.

---

## License

MIT — feel free to use this for your own projects.

---

<p align="center">
  <sub>Made with love in India 🇮🇳</sub>
</p>
