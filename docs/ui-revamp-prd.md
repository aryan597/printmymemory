# PrintMyMemory — UI Revamp PRD
### "Tactile Brutalist Minimalism" + Customisation Continuity

**Owner:** Aryan · **Status:** Draft v1 · **Date:** 2026-07-07
**Scope:** Storefront (`main` branch) visual system + purchase journey. Admin CRM (`admin` branch) touched only where it must feed the storefront.

---

## 1. Why we're doing this

PrintMyMemory sells physical, handcrafted, 3D‑printed objects — but the site looks like a generic dark SaaS template. Two problems, one of them structural:

**A. The visual language is generic and inconsistent.**
- Every page leans on the same 2023 dark‑startup kit: glassmorphism (`.glass`, `backdrop-blur`), orange glows (`shadow-glow-orange`), gradient text (`.gradient-text`), noise overlays, blur blobs, `rounded-full` everywhere. It's soft, low‑contrast (`text-muted #6B6B78` on `#08080A`), and says nothing about a *tactile, physical* product.
- Design debt is visible in the funnel. `Cart.jsx` uses raw `neutral-*` classes and its own `formatPrice` → `"Rs. 1,299"`, while the rest of the app uses design tokens and `formatPrice` → `"₹1,299"`. Two Button implementations coexist (`.btn-primary` CSS class vs `components/ui/Button`). The system isn't a system.

**B. The admin ↔ storefront customisation pipeline is broken.** *(Root cause of "no continuity.")*
- `components/CustomizationForm.jsx` is a complete, well‑built dynamic form: it reads admin‑authored `product_customization_configs` (photo upload, text, textarea, select, radio, checkbox, color picker, AMS color — each with `price_adjustment` and `is_required`), computes a live price, and emits structured `values` via `onSubmit`.
- **It is imported by nothing.** Verified: zero references in `src/` outside its own file. `product_customization_configs` and `order_customization_values` are read/written nowhere in the live buying flow.
- The PDP's "Customize This Gift" button links to `/customize?productId=X`. **`/customize` ignores the param** and renders an unrelated AI chat that hands off to WhatsApp.
- `order_items` only carries a single `custom_image` URL. The structured "what to print" (size, color, engraving text, uploaded photo, add‑ons) **never reaches the backend on a real order.**

Net effect: the admin can define a rich customisable product, and the customer can never actually configure and buy it. That's the headline fix.

---

## 2. Goals, non‑goals, success metrics

### Goals
1. Replace the visual system with one coherent, distinctive **tactile‑brutalist‑minimal** language that reflects a physical‑product brand.
2. **Close the customisation loop:** admin‑defined options render on the product page → get configured → added to cart with structured values + adjusted price → persisted as `order_customization_values` on checkout so the backend knows exactly what to print.
3. Tighten the buy journey for **mobile‑first Indian D2C** (78% of D2C traffic is mobile): fewer steps, upfront trust, UPI‑first.
4. Kill the inconsistency debt: one token layer, one Button, one price formatter, one card.

### Non‑goals (this phase)
- Rebuilding the admin CRM UI (only add fields it must expose to storefront).
- The `/shop3d` walkable 3D shop (stays beta; restyle only if cheap).
- Re‑platforming. Stay on React 19 + Vite + Tailwind + Supabase.
- Auth overhaul. Guest‑first checkout stays.

### Success metrics
| Metric | Baseline (India D2C avg) | Target |
|---|---|---|
| Storefront conversion | ~1.8% | 3%+ (top‑quartile D2C) |
| Mobile checkout completion | — | one‑page, <6–8 fields, <2s on 4G |
| Customisable products actually orderable end‑to‑end | 0% (broken) | 100% |
| "What to print" data captured per custom order | image only | full structured spec |
| Design‑token adoption (no raw `neutral-*`/ad‑hoc hex in pages) | partial | 100% |

---

## 3. Design direction — "Tactile Brutalist Minimalism"

The synthesis of the three requested moods:
- **Brutalism** → structure is honest and visible: hard edges, thick borders, exposed grid, bold type, flat solid color blocks, hard‑offset shadows (no blur).
- **Minimalism** → restraint: limited palette, generous whitespace, one idea per screen, few type sizes.
- **Tactile** → objects feel *pressable and physical*, echoing the 3D‑printed product: buttons that visibly depress, sticker/label motifs, material texture, chunky controls.

> Design principle: **the interface should feel like the product** — something you could pick up, press, and put on a shelf.

### 3.1 Tokens (target)

**Kill:** `.glass` / glassmorphism, `shadow-glow-orange*`, `.gradient-text*`, `.noise`, blur blobs, `rounded-full` as default, `text-muted` low‑contrast greys.

**Introduce:**
- **Radius:** default `0` (or `2px` max). Reserve pills only for status chips.
- **Borders:** `2px` structural, `3px` on primary/interactive, always solid, high‑contrast (near‑black on light, near‑white on dark).
- **Shadows:** hard offset only — `box-shadow: 4px 4px 0 var(--ink)`. No blur, no glow. Press state collapses it: `translate(2px,2px)` + `2px 2px 0`. This *is* the tactile feel.
- **Type:** keep Space Grotesk for body, but promote a heavier display treatment — big, tight, `font-black`, uppercase for section labels. Consider a mono accent (e.g. for prices, spec chips, order IDs) to reinforce the "engineered" brutalist read.
- **Color:** anchor on the existing orange `#F05500` as the primary action color, but treat it as a *solid ink block*, not a glow. Add 1–2 high‑saturation supports (the research points to punchy secondaries; candidates: a lime/acid or an electric blue) used sparingly as accent stickers. Everything else is ink + paper.

### 3.2 Old → New component map
| Element | Now | Target |
|---|---|---|
| Primary button | orange pill, glow, `scale` hover | solid orange block, `3px` ink border, `4px 4px 0` hard shadow, press = collapse shadow |
| Card | `rounded-2xl`, soft shadow, subtle border | square, `2px` ink border, hard offset shadow, flat fill |
| Input | `rounded-xl`, faint border | square, `2px` border, thick focus ring (no glow) |
| Product image frame | rounded, gradient overlay on hover | hard bordered "specimen" frame, label sticker top‑left |
| Price | gradient text | solid ink, mono, oversized |
| Badges (Custom / Multi‑Color) | translucent blur chips | flat sticker labels, hard border |
| Section label | orange translucent pill | uppercase mono tag, boxed |

### 3.3 Aesthetic decisions — LOCKED (2026-07-07)
- **Theme:** ✅ **Both** — build tokens for light/paper *and* dark, with a user toggle. Light/paper is the default recommendation for hero/product surfaces; dark is a first-class alternative. Tokens must be theme-agnostic (CSS variables switched by a `data-theme` root attribute).
- **Intensity:** ✅ **Refined tactile-brutalist** — mostly ink + paper, orange `#F05500` as the single loud note. No acid secondaries by default. Protects conversion + AA contrast.

---

## 4. Customer journey redesign (page by page)

### 4.1 Home / Landing — REBUILT (2026-07-07)
New landing structure (replaces the old multi-CTA hero + bestseller grid, which read as generic):
1. **`FeaturedHero`** — the landing leads with **one featured product** (picks `is_featured` → `is_bestseller` → newest). Big brutalist name, mono price, hard specimen frame, CTAs: Personalise/View + Add to Cart + WhatsApp.
2. **`PromptDiscovery`** — "Describe it. We'll print it." A prompt input + starter chips drive a **consolidated feed of print-ready recommendations** (`CGTraderModelsSection`, ported from the import-pipeline worktree). Each card → in-site quick-view + one-tap **"Print this"** WhatsApp handoff. This is the "recommendations to print, all in one place" the owner asked for. Links out to the AI concierge (`/customize`) for the unsure.
3. **`HowItWorks` → `Testimonials` → `CTABanner`** below for trust.
- Infra ported to `main`: `api/cgtrader.js` (Vercel fn), `src/lib/cgtrader.js`, Vite dev proxy (`followRedirects: true` — see [[cgtrader-integration-facts]]).

### 4.2 Shop (`Shop.jsx`)
- Grid of hard‑bordered specimen cards; category filter as boxed toggle tags (not translucent pills).
- Keep add‑to‑cart on card, but **route customisable products differently** (see §5): custom items show **"Personalise"** (→ configurator) instead of a silent "Add," since a bare add would capture no print spec.
- Add the trust/photo‑review signal early (research: 68% of Indian shoppers cite trust signals; photo reviews >> text).

### 4.3 Product Detail (`ProductDetail.jsx`) — most important page
- **Unified media carousel (specimen viewer).** Today the 3D model (`Model3DViewer`) sits in a *separate section below* the image gallery. Merge everything into **one carousel**: product photos **+** an interactive 3D‑model slide **+** multicolor/AMS variant views, all navigable in the same bordered frame. Thumbnail rail shows a distinct icon for the 3D slide (`Box`) and swatch thumbnails for each color variant.
  - **Multicolor:** for AMS/multi‑filament products, let the user flip between color renders/photos of the *same* product from the same carousel (driven by `ams_colors` / per‑variant images the admin uploads — see admin‑driven principle §5).
  - **Tactile + light skeuomorphism where it earns its keep:** the frame reads like a physical specimen card/display case; the 3D slide can use a subtle inset/"display case" treatment (soft floor shadow under the model, tactile drag affordance) — skeuomorphic touches are allowed *only* when they reinforce physicality, never decorative gloss.
- Restyle gallery as a bordered specimen viewer; specs as mono chips in a bordered "spec sheet" block (material, weight, print time — leans into the brutalist/engineered feel).
- **Branch on `product_type`:**
  - **Customised** → primary CTA is **"Personalise & Add"**, which opens the configurator (`CustomizationForm`, finally wired in — inline panel or step, not a detour to `/customize`). Live price updates as options change. "Add to Cart" is disabled until required fields are satisfied.
  - **Uncustomised** → **"Add to Cart"** works directly. Keep **"Order on WhatsApp"** as the human‑touch fallback for people who'd rather chat (this is the "just give a WhatsApp chat feature" path).
- Reviews: promote photo reviews with a verified‑purchase sticker.

### 4.4 Customise (`/customize`)
- Today it's an AI chat → WhatsApp. **Decision needed:** keep it as a top‑of‑funnel "not sure what you want?" concierge, but it should **route into the real configurator / PDP**, not dead‑end at WhatsApp. When `?productId=` is present it must load that product's configurator, not ignore it.

### 4.5 Cart & Checkout (`Cart.jsx`) — highest‑leverage funnel fix
- Rebuild on tokens; delete local `formatPrice` ("Rs.") and `neutral-*`; unify on `₹` + design system.
- **Show customisation summary per line item** (photo thumbnail, size, color swatch, engraving text, add‑ons) so buyers confirm exactly what they're ordering — and so the data is obviously being captured.
- Keep it **one page** (research: one‑page checkout ~ −20% abandonment). Minimise fields (6–8). Address, payment, review on one screen.
- **UPI‑first** (research: +34% conversion when UPI is primary). Razorpay stays; make UPI the visually primary method.
- Consider **COD** as an explicit decision (research: ~42–45% of India D2C orders; high RTO risk). *Recommendation: prepaid‑first, evaluate COD later with RTO controls.*
- Fix "Buy Now": today it just adds to cart and navigates — make it a genuine express path or rename it.

### 4.6 Orders / tracking (`Orders.jsx`, `OrderDetail.jsx`, `Receipt.jsx`)
- Restyle to the new system; show the full customisation spec + a clear status timeline (the two status ladders already exist: `order_placed→packed→shipped→delivered` and `pending_photo→printing→shipped→delivered`).

---

## 5. Workstream: Admin ↔ Storefront customisation continuity *(the "continuity" fix)*

**Objective:** whatever the admin configures for a product is exactly what the customer configures and what the backend receives.

> **Guiding principle — admin-driven & editable.** The storefront is a faithful, data-driven reflection of admin-authored content. Customisation options, product media (incl. per-color/AMS variant images and the 3D model), spec chips, and even the **WhatsApp prefill message** must be driven by admin fields and editable *without code changes*. No hardcoded product copy or options in the storefront.

### Data flow (target)
```
Admin (admin branch)                 Storefront (main)                     Backend / fulfilment
────────────────────                 ─────────────────                     ────────────────────
product_customization_configs  ──►   PDP renders CustomizationForm   ──►   order_customization_values
(fields, options, price_adj,          (live price, validation)              (one row per answer,
 is_required, sort_order)             cart item carries values +            linked to order_item)
                                      custom_image + adjusted price         + order_customizations
                                                                            (photo/design pipeline,
                                                                             status: pending_photo…)
```

### Product decision (needs your confirmation)
Your note: *"if it is customizable, give those options → add to cart → so backend knows what to print; if not, just give a WhatsApp chat feature."*
Proposed routing:
- **`product_type = 'customised'`** → inline **configurator on the PDP** (render `CustomizationForm`), Add‑to‑Cart carries the structured spec, checkout writes `order_customization_values`. WhatsApp stays as optional fallback.
- **`product_type = 'uncustomised'`** → direct Add‑to‑Cart **and** a prominent "Order / Ask on WhatsApp" button. No configurator.

> ❓ **Confirm:** for uncustomised items, do we still take full on‑site prepaid checkout (current behaviour), or do you want those to be **WhatsApp‑only** ("just give a chat on WhatsApp feature")? This changes the cart scope.

### Required build
1. **Wire `CustomizationForm` into the PDP** for customised products (inline panel/step). Remove the `/customize?productId=` dead‑end.
2. **Cart item schema** (client): extend the cart line to carry `customization_values` (the `onSubmit` payload) + resolved `custom_image` + `adjusted_price`. Show them in cart & order summary.
3. **Checkout persistence** (`Cart.handlePlaceOrder`): after inserting `order_items`, insert matching `order_customization_values` (and create `order_customizations` for the photo/design pipeline where a photo is involved). Today only `custom_image` is saved — extend it.
4. **Price integrity:** the server/order total must include per‑option `price_adjustment`, not just base `price` (today `order_items.price` = base product price).
5. **Admin exposure check:** confirm the admin actually authors `product_customization_configs` per product and can preview them; if not, that's a small admin‑branch task.

---

## 6. Design‑system / tech tasks (foundation)
- New Tailwind token set + `index.css` component layer: `--ink`, `--paper`, hard‑shadow utilities, square radius, thick borders. Retire glow/glass/gradient/noise utilities.
- **One** `<Button>` with variants (primary/secondary/ghost/whatsapp) using the tactile press interaction; delete `.btn-*` duplication + `components/ui/Button` divergence.
- **One** price formatter (`lib/utils.formatPrice`, `₹`) used everywhere; delete `Cart`'s local one.
- Standard `<SpecimenCard>`, `<StickerBadge>`, `<SpecChip>`, `<Field>` primitives.
- Keep Framer Motion but swap soft fades for snappier, physical motion; respect `prefers-reduced-motion` (already handled in `index.css`).

## 7. Guardrails
- **Accessibility:** brutalism's high contrast is a net win; verify AA on the orange‑on‑paper and any acid secondary. Keep focus rings thick and visible. Maintain skip‑link + reduced‑motion.
- **Performance:** mobile‑first, <2s on 4G; lazy‑load 3D viewers (already lazy); don't ship heavy textures.
- **Don't regress SEO:** preserve `PageHead`/structured data.

## 8. Phased rollout
- **Phase 0 — Decisions:** theme (light vs dark), intensity, uncustomised routing (§5). *Blocks token work.*
- **Phase 1 — Design system:** tokens, Button, card/badge/field primitives, price formatter unify. Ship a living style guide.
- **Phase 2 — Customisation continuity:** wire `CustomizationForm` into PDP, cart spec capture, checkout persistence, price integrity. *(Highest business value.)*
- **Phase 3 — Journey restyle:** Home → Shop → PDP → Cart on the new system; one‑page UPI‑first checkout.
- **Phase 4 — Orders/tracking + polish**, then remove dead styles/components.

## 9. Decisions
1. **Theme:** ✅ Both — light/paper + dark with a toggle (tokens via `data-theme`).
2. **Intensity:** ✅ Refined tactile‑brutalist (ink + paper, orange the one loud note).
3. **Uncustomised checkout:** ✅ On‑site prepaid checkout **+** WhatsApp fallback button.
4. **Admin-editability:** ✅ Storefront is data-driven from admin config (options, media, WhatsApp prefill) — editable without code (§5 principle).
5. **PDP media:** ✅ Single unified carousel — photos + 3D model + multicolor variants; light skeuomorphism allowed where it reinforces physicality (§4.3).

**Still open:**
- **COD:** now vs later. *Recommendation: later, prepaid‑first.*
- **AI `/customize` chat:** keep as a concierge that routes into the real configurator/PDP, or retire? *Recommendation: keep but re-wire so it never dead-ends at WhatsApp.*

---

### Research basis
- Neo‑brutalism 2026: hard pitch‑black offset shadows, 2–5px borders, high‑saturation secondaries, 0px geometry, "honest feel + smooth micro‑interactions"; strong contrast aids accessibility. [Fireart](https://fireart.studio/blog/the-best-web-design-trends/), [Setproduct](https://www.setproduct.com/blog/retro-brutalist-ui-design-2026), [Pixso](https://pixso.net/articles/neo-brutalism-design/)
- India D2C UX: ~1.8% avg conversion (top brands 3–3.5%); 78% mobile; UPI primary → +34% conversion; trust signals cited by 68%, photo reviews >> text; one‑page checkout ~ −20% abandonment; COD ~42–45% of orders with 24–38% RTO. [Snapmint](https://www.snapmintbusiness.com/blogs/ecommerce-conversion-rate-growth), [Troopod](https://blog.troopod.io/mastering-checkout-optimization-the-complete-guide-for-indian-d2c-brands/), [Razorpay](https://razorpay.com/learn/mastering-checkout-complete-guide/), [Salesforce](https://www.salesforce.com/commerce/online-payment-solution/checkout-guide/)
