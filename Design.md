# Nimbus — React Native E-Commerce Design System

## 1. Purpose

Refactor the existing React Native e-commerce frontend into a distinct **Nimbus** visual identity.

Nimbus should feel:

* Calm
* Airy
* Modern
* Premium
* Friendly
* Product-focused
* Lightweight
* Trustworthy

The application is an Etsy-style marketplace rather than a luxury fashion storefront. The design should work equally well for:

* Handmade goods
* Clothing
* Accessories
* Art
* Home decor
* Jewelry
* Stationery
* Vintage items
* Independent sellers
* Small brands

The redesign must preserve the application's existing functionality, navigation, business logic, data flow, and user journeys unless a UI change requires a minor presentational adjustment.

---

# 2. Core Design Direction

Nimbus is based on **soft cool neutrals with restrained blue tones**.

The visual experience should resemble a modern editorial marketplace rather than a generic SaaS dashboard or AI-generated mobile app.

The interface should feel spacious without becoming empty.

Products, photography, seller identity, and marketplace discovery should remain visually dominant.

### Brand Personality

Nimbus is:

> Calm discovery for thoughtfully chosen things.

Personality keywords:

**Airy · Curated · Human · Modern · Soft · Reliable · Independent**

Avoid making Nimbus feel:

* Corporate
* Futuristic
* Cyberpunk
* Luxury-fashion-exclusive
* Childish
* Overly playful
* Sterile
* AI-generated

---

# 3. Color System

## Primary Palette

```ts
export const colors = {
  // Brand
  primary: "#0F172A",
  primarySoft: "#1E293B",

  // Nimbus Blue
  nimbus100: "#F2F4F8",
  nimbus200: "#DDE6F7",
  nimbus300: "#C7D2FE",
  nimbus400: "#AEBEEA",
  nimbus500: "#8298C8",

  // Backgrounds
  background: "#F8FAFC",
  surface: "#FFFFFF",
  surfaceSoft: "#F2F4F8",
  surfaceMuted: "#E9EEF6",

  // Text
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#64748B",
  textDisabled: "#94A3B8",

  // Borders
  border: "#E2E8F0",
  borderStrong: "#CBD5E1",

  // States
  success: "#3F7663",
  warning: "#B7791F",
  error: "#B84C4C",

  // Pure
  white: "#FFFFFF",
  black: "#000000",
};
```

---

# 4. Color Usage

The application should remain predominantly light.

Recommended visual ratio:

* **70%** white / very light cool backgrounds
* **20%** soft Nimbus blue-gray surfaces
* **10%** dark navy typography and emphasis

Do not flood screens with blue.

Nimbus blue should appear primarily in:

* Selected states
* Chips
* Active navigation
* Soft product highlights
* Wishlist states
* Subtle promotional backgrounds
* Search focus states
* Secondary actions

Dark navy should be used for:

* Primary text
* Important CTAs
* Icons
* Active controls

---

# 5. Backgrounds

Primary application background:

```txt
#F8FAFC
```

Cards:

```txt
#FFFFFF
```

Secondary sections:

```txt
#F2F4F8
```

Highlighted areas:

```txt
#DDE6F7
```

Avoid placing every section inside a card.

Large portions of the interface should use the page background naturally.

---

# 6. Gradients

Gradients are allowed only when extremely subtle.

Example:

```ts
["#F8FAFC", "#EEF3FB"]
```

Never use:

* Neon gradients
* Purple/blue AI gradients
* Rainbow gradients
* Highly saturated gradients
* Gradient borders
* Glowing gradient buttons

Gradients should be almost imperceptible and primarily used for editorial or campaign backgrounds.

---

# 7. Typography

Use a clean modern sans-serif system.

Recommended:

### Primary

**Manrope**

Alternative:

**Inter**

Typography hierarchy should come primarily from:

* Font size
* Weight
* Spacing
* Composition

rather than excessive color changes.

Example React Native typography tokens:

```ts
export const typography = {
  display: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "600",
  },

  h1: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "600",
  },

  h2: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "600",
  },

  h3: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "600",
  },

  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400",
  },

  bodySmall: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400",
  },

  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
  },
};
```

Avoid excessive bold typography.

Use `600` for most emphasized text instead of making everything `700` or `800`.

---

# 8. Spacing System

Use an 4px-based spacing system.

```ts
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
};
```

Nimbus should feel breathable.

Prefer:

```txt
16–24px
```

for normal container padding.

Avoid squeezing excessive information into a single section.

---

# 9. Border Radius

Nimbus uses soft but controlled geometry.

```ts
export const radius = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};
```

Recommended:

* Buttons: `12`
* Inputs: `12`
* Cards: `12–16`
* Product images: `12`
* Chips: `999`

Do not make every component extremely rounded.

Avoid giant 24–32px radii unless the component genuinely benefits from it.

---

# 10. Shadows

Shadows should be extremely subtle.

Nimbus should rely primarily on:

* Background contrast
* Borders
* Spacing
* Hierarchy

instead of floating cards.

Example:

```ts
shadowColor: "#0F172A",
shadowOpacity: 0.06,
shadowRadius: 8,
shadowOffset: {
  width: 0,
  height: 2,
},
elevation: 2,
```

Never use heavy floating shadows.

---

# 11. Cards

Product cards should feel light and product-first.

They may contain:

* Product image
* Product name
* Price
* Seller/shop name
* Rating
* Wishlist control
* Optional badge

Avoid surrounding every product card with a visible border.

Preferred:

```txt
Image
↓
Product title
Seller
Price
```

The photograph should remain the strongest visual element.

---

# 12. Product Imagery

Product photography should dominate marketplace browsing.

Use:

* Large imagery
* Natural aspect ratios
* Minimal overlays
* Neutral backgrounds
* Consistent image treatment

Avoid:

* Heavy image gradients
* Text permanently covering products
* Decorative effects over photographs
* Excessive badges

Product images should feel editorial but authentic.

---

# 13. Seller Identity

Because this is a marketplace, Nimbus should make sellers feel important.

Seller UI may include:

* Avatar
* Shop name
* Verified status
* Rating
* Number of sales
* Location
* Follow button
* Shop story

Seller information should feel personal rather than corporate.

Example:

```txt
Made by
Luna Ceramics

4.9 ★ · 1.2k sales
```

---

# 14. Buttons

## Primary Button

```txt
Background: #0F172A
Text: #FFFFFF
Radius: 12
```

The primary CTA should feel solid and confident.

Examples:

* Add to cart
* Buy now
* Checkout
* Place order

## Secondary Button

```txt
Background: #DDE6F7
Text: #0F172A
```

## Tertiary Button

Text-only or minimal bordered button.

Avoid:

* Glow
* Gradients
* Oversized pill buttons
* Excessive icons inside buttons

---

# 15. Inputs

Inputs should use light cool surfaces.

```txt
Background: #F2F4F8
Border: transparent
Focused border: #8298C8
Text: #0F172A
Placeholder: #94A3B8
```

Search fields should feel especially light.

Recommended search styling:

```txt
[ Search products, shops, and collections ]
```

Avoid oversized SaaS-style input components.

---

# 16. Search Experience

Search is a central marketplace feature.

Search should feel:

* Fast
* Minimal
* Discoverable
* Category-aware

Possible search suggestions:

```txt
Popular searches

Ceramic mugs
Silver rings
Wall prints
Handmade bags
Vintage jackets
```

Use subtle section backgrounds instead of card stacks.

---

# 17. Categories

Categories should be represented using:

* Product photography
* Small illustrations
* Simple icons

Avoid generic colored circular icons unless appropriate.

Category names should remain understandable.

Examples:

* Home
* Clothing
* Jewelry
* Art
* Accessories
* Vintage
* Gifts
* Stationery

Do not invent unnecessary futuristic category names.

---

# 18. Badges

Badges should be compact.

Examples:

```txt
Bestseller
New
Handmade
Vintage
Only 2 left
Free shipping
```

Recommended styles:

### Neutral

```txt
Background: #F2F4F8
Text: #475569
```

### Highlight

```txt
Background: #DDE6F7
Text: #0F172A
```

Avoid bright red/yellow badges everywhere.

---

# 19. Icons

Use a consistent outline icon library.

Recommended:

```txt
Lucide React Native
```

Icons should generally use:

```txt
1.75px – 2px stroke
```

Default icon color:

```txt
#475569
```

Active icon:

```txt
#0F172A
```

Avoid mixing icon libraries.

Avoid decorative icons when text is enough.

---

# 20. Navigation

Preserve the existing navigation architecture.

Do not reorganize navigation purely for visual reasons.

Visually, navigation should use:

* White or very light surfaces
* Simple icons
* Clear active state
* Minimal labels
* Thin separators if necessary

Avoid floating navigation bars unless the existing product already uses them.

---

# 21. Product Detail Experience

Product screens should visually prioritize:

1. Product
2. Price
3. Seller
4. Variant selection
5. Purchase action
6. Shipping
7. Product description
8. Reviews
9. Related items

Marketplace-specific information should be visible:

```txt
Made by Luna Studio
Ships from Ramallah
Ready to ship in 2–4 days
```

Avoid making the page resemble a luxury fashion editorial.

---

# 22. Marketplace Discovery

Nimbus should encourage exploration.

Useful content patterns include:

* Recommended for you
* Recently viewed
* Shops you may like
* Based on your favorites
* Handmade picks
* Trending now
* Gifts under $30
* New shops
* Local makers
* Editor's picks

These labels should be simple and human.

Avoid marketing phrases generated solely to sound clever.

---

# 23. Wishlist / Favorites

Wishlist interactions should feel lightweight.

Inactive:

```txt
outline heart
```

Active:

```txt
filled #8298C8
```

Do not use glowing or animated hearts.

A subtle scale animation is acceptable.

---

# 24. Motion

Animations should communicate state rather than decorate the interface.

Recommended durations:

```ts
fast: 120ms
normal: 180ms
slow: 260ms
```

Acceptable:

* Button press scale
* Wishlist micro-animation
* Bottom-sheet entrance
* Image fade
* Skeleton loading
* Tab transitions
* Accordion expansion

Avoid:

* Constant floating animation
* Pulsing CTAs
* Animated gradients
* Springy everything
* Large parallax effects
* Decorative motion

---

# 25. Haptics

Use haptics selectively for:

* Add to favorites
* Add to cart
* Successful checkout
* Important selections

Do not trigger haptics for every tap.

---

# 26. Loading States

Prefer skeleton loaders.

Skeleton color:

```txt
Base: #E9EEF6
Highlight: #F8FAFC
```

Skeletons should mirror the real component proportions.

Avoid generic full-screen spinners wherever possible.

---

# 27. Empty States

Empty states should feel friendly and useful.

Example:

```txt
Your favorites are waiting.

Save products you love and they'll appear here.
```

Provide one useful action.

Avoid large AI-generated illustrations.

---

# 28. Error States

Errors should be calm and direct.

Example:

```txt
We couldn't load these products.

Check your connection and try again.
```

Never use alarming visual treatment for recoverable errors.

---

# 29. Bottom Sheets

Use bottom sheets where appropriate for:

* Filters
* Sorting
* Product variants
* Shipping details
* Quick actions

Sheets should have:

```txt
Background: #FFFFFF
Radius top corners: 20
```

Avoid turning every action into a modal.

---

# 30. Filters

Filters should remain compact and shopping-oriented.

Examples:

```txt
Category
Price
Color
Shipping
Location
Rating
Availability
```

Selected filters:

```txt
Background: #DDE6F7
Text: #0F172A
```

---

# 31. Reviews

Reviews should prioritize authenticity.

Display:

* Rating
* Buyer name
* Date
* Review text
* Product variant
* Review images

Avoid oversized rating visualizations.

---

# 32. Accessibility

Every screen must respect:

* WCAG contrast
* Dynamic font sizing where practical
* Minimum 44×44 touch targets
* Screen reader labels
* Logical focus order
* Reduced motion settings

Never rely on color alone to communicate state.

---

# 33. React Native Implementation Rules

Prefer reusable primitives rather than screen-specific styles.

Recommended structure:

```txt
src/
  theme/
    colors.ts
    spacing.ts
    typography.ts
    radius.ts
    shadows.ts
    index.ts

  components/
    Button/
    Input/
    ProductCard/
    ShopCard/
    Badge/
    Avatar/
    SearchBar/
    Price/
    Rating/
    EmptyState/
    SectionHeader/
```

Avoid hardcoded values scattered across screens.

Use theme tokens.

Example:

```tsx
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
});
```

---

# 34. Component API Quality

Components should expose semantic variants.

Good:

```tsx
<Button variant="primary" />
<Button variant="secondary" />
<Button variant="ghost" />
```

Bad:

```tsx
<Button blue />
<Button lightBlue />
<Button slightlyDark />
```

Design APIs around intent rather than appearance.

---

# 35. Responsive Behavior

The interface must adapt correctly across:

* Small Android phones
* Large Android phones
* iPhones
* Devices with notches
* Different font scales

Use:

```txt
SafeAreaView
useWindowDimensions
flex layouts
```

Avoid assuming fixed screen dimensions.

---

# 36. Dark Mode

Nimbus is primarily a **light-first design system**.

Do not automatically introduce dark mode during this refactor unless the project already supports it.

If dark mode already exists, preserve it but derive it from the same design tokens.

---

# 37. Anti-AI-Slop Rules

The following are explicitly prohibited:

* Glassmorphism
* Frosted glass cards
* Neon glow
* Glowing borders
* Purple AI gradients
* Giant rounded cards everywhere
* Floating blob backgrounds
* Decorative orbital graphics
* Fake AI sparkles
* Excessive pills
* Excessive shadows
* Excessive gradients
* Gradient text
* Random dashboard widgets
* Oversized hero cards on every screen
* Generic "Elevate your experience" copy
* Decorative animations with no UX purpose
* Random abstract 3D assets
* Excessively centered interfaces

The interface should appear designed by a professional product designer, not generated from a generic AI UI prompt.

---

# 38. Avoid Generic Marketplace UI

Do not simply recreate:

* Amazon
* Etsy
* Temu
* Shein
* Shopify templates

Nimbus should establish its own identity through:

* Typography
* Photography
* Composition
* Spacing
* Seller visibility
* Soft blue-neutral palette
* Calm interaction design
* Editorial marketplace discovery

---

# 39. Content Tone

Copy should be:

* Short
* Natural
* Human
* Helpful

Preferred:

```txt
Made for your space.
```

Instead of:

```txt
Discover products crafted to elevate your lifestyle.
```

Preferred:

```txt
From independent makers.
```

Instead of:

```txt
Explore our curated collection of extraordinary artisan creations.
```

Avoid generic AI marketing copy.

---

# 40. Design Principle

When choosing between adding another visual element and removing one:

> Remove it.

When choosing between decoration and better spacing:

> Improve the spacing.

When choosing between emphasizing the interface and emphasizing the product:

> Emphasize the product.

When choosing between trendy UI and understandable UI:

> Choose understandable UI.

---

# 41. Refactor Instructions for the AI Agent

Analyze the existing React Native frontend before modifying it.

Do **not** rebuild screens blindly.

Preserve:

* Existing features
* Routing
* Navigation
* API integrations
* State management
* Validation
* Business logic
* Authentication flows
* Cart behavior
* Checkout behavior
* Marketplace logic

Refactor the visual layer systematically.

Replace inconsistent existing styles with shared Nimbus design tokens and reusable components.

Before introducing a new component, check whether an equivalent component already exists and can be refactored.

Remove:

* Duplicate styles
* Inline magic numbers
* Inconsistent spacing
* Inconsistent colors
* Duplicate component variants
* Unnecessary visual wrappers

Do not change layout or information architecture unnecessarily.

The goal is a **design-system-level transformation of the existing application**, not a rewrite of the product.

---

# 42. Final Quality Bar

The final frontend should feel like:

> A calm, modern marketplace where independent products and makers are the visual focus.

It should communicate quality through restraint, hierarchy, typography, photography, and spacing rather than visual effects.

The finished product should be recognizable as **Nimbus** even if the logo is removed.
