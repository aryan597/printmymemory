# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server at http://localhost:5173
npm run build      # Production build to dist/
npm run preview    # Preview production build locally
npm run lint       # ESLint check
```

There are no tests configured.

## Architecture Overview

**PrintMyMemory** is a 3D printing e-commerce storefront for an Indian market (Bangalore). It's a React SPA deployed to Vercel, with Supabase as the backend (PostgreSQL + Auth + Storage).

### Stack
- **React 19** + **Vite** + **Tailwind CSS 3** (dark theme, custom palette)
- **Supabase JS SDK v2** — database, auth, file storage (no custom API layer; Supabase is called directly from components/pages)
- **Razorpay** — payment gateway (UPI, cards, wallets)
- **EmailJS** — transactional emails (order confirmations, status updates)
- **Framer Motion** — animations
- **jsPDF + html2canvas** — invoice PDF generation

### Key Flows

**Guest-first checkout**: No login required. Cart persists in `localStorage` (`printmymemory_cart`). Phone + order ID used for order tracking post-checkout.

**Payment flow**: Cart → Razorpay modal → success callback → save order to Supabase `orders` table → send EmailJS confirmation → clear cart.

**Customised products flow** (e.g., 3D face miniatures): User uploads photo on `/customize` → photo stored in Supabase Storage → `custom_image` URL on cart item → on checkout, creates `order_customizations` record → status: `pending_photo` → admin approves design → `printing` → `shipped` → `delivered`.

**Uncustomised products**: `order_placed` → `packed` → `shipped` → `delivered`.

**Admin authentication**: Separate `admins` table with bcrypt-hashed passwords. Not using Supabase Auth for admins. Admin CRM lives on the `admin` git branch, deployed as a separate Vercel project.

### Directory Structure

```
src/
├── components/       # Reusable UI (Navbar, Footer, ProductCard, CustomizationForm, AMSColorPicker, UPIPayment, etc.)
├── contexts/
│   ├── AuthContext.jsx   # Supabase auth state (currently minimal)
│   └── CartContext.jsx   # Cart state backed by localStorage
├── hooks/            # useAuth, useCart, useNewsletter
├── lib/
│   ├── supabaseClient.js  # Supabase client init + table name constants
│   ├── razorpay.js        # Razorpay SDK wrapper + openRazorpayCheckout()
│   ├── notifications.js   # EmailJS helpers + WhatsApp link generators
│   ├── pdfGenerator.js    # Invoice PDF (jsPDF)
│   └── utils.js           # formatPrice, formatDate, validators, debounce
├── pages/            # Route components (~25 pages)
├── App.jsx           # React Router route definitions
├── main.jsx          # Entry point
└── index.css         # Global Tailwind + custom component classes
```

### Database Schema

Key tables in Supabase PostgreSQL (see `supabase_schema.sql` for full schema):

| Table | Purpose |
|-------|---------|
| `products` | Catalog; `product_type` is `customised` or `uncustomised`; `price` in INR (integer) |
| `categories` | Product categories |
| `orders` | Orders; `user_id` nullable (guest orders); shipping address as JSONB |
| `order_items` | Line items; `custom_image` URL for customised products |
| `order_status_history` | Full audit trail of status changes |
| `order_customizations` | Photo/design pipeline for customised products |
| `product_customization_configs` | Dynamic form field definitions per product |
| `order_customization_values` | Saved customer answers to customization form fields |
| `cart_items` | DB-backed cart for authenticated users |
| `vouchers` | Promo codes with discount rules |
| `reviews`, `community_posts` | UGC features |
| `admins` | Admin users (bcrypt passwords, separate from Supabase Auth) |

**RLS**: All tables have RLS enabled. Admin access is via `is_admin()` SECURITY DEFINER function. Guest order lookup via `get_guest_order(order_id, phone)` DB function.

### Pricing & Shipping
- All prices stored as integers (paise/rupees, Indian locale)
- `formatPrice(price)` → "₹X,XXX"
- Free shipping on orders ≥ ₹999; otherwise ₹50 flat

### Environment Variables
All prefixed with `VITE_` (required for Vite to expose to client):
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- `VITE_RAZORPAY_KEY_ID`
- `VITE_EMAILJS_PUBLIC_KEY`, `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_ORDER_TEMPLATE_ID`, `VITE_EMAILJS_STATUS_TEMPLATE_ID`

### Deployment
- **Storefront**: `main` branch → Vercel project 1
- **Admin CRM**: `admin` branch → Vercel project 2
- `vercel.json` configures SPA fallback (all routes → `index.html`)

### AMS Color System
Products marked `is_ams_compatible` support multi-filament color selection. `AMSColorPicker` component lets users pick colors stored as JSONB in `products.ams_colors`. These flow through cart items and order customizations.
