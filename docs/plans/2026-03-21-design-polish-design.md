# Design Polish — Moderate Redesign

**Date:** 2026-03-21
**Goal:** Fix 5 design issues to move from "templated shadcn" to "polished and premium."

## 1. Animation & Gold Cleanup

- Delete `@keyframes gold-shimmer`, `icon-gold-shine`, `gold-pulse` from index.css
- Remove `.bg-primary`, `.text-primary`, `.text-gold-shine` animation overrides
- Keep only functional animations: typing dots, fade-in, card hover lift
- Gold used statically on: active nav underline, primary buttons, progress bar fills

## 2. Color Token Unification

Replace all hardcoded colors with design system tokens:
- `text-white` → `text-foreground`
- `text-gray-200/300` → `text-foreground`
- `text-gray-400/500` → `text-muted-foreground`
- `from-amber-500 to-yellow-600` → `bg-primary`
- `border-amber-500/20` → `border-primary/40`
- `bg-amber-500/10` → `bg-primary/10`

No raw color values in components.

## 3. Card Hierarchy & Borders

- **Module cards:** `border-l-2 border-transparent` default, `border-l-2 border-primary` on hover
- **Member cards:** Neutral, no extra accents
- **Admin stat cards:** `border-t-2` matching icon color (blue/green/red). "Needs Attention" gets `border-destructive`
- **About cards:** Neutral, content-focused
- Progress bars: `h-1.5`/`h-2` → `h-2.5`, background `bg-muted` for contrast

## 4. Spacing Standardization

Consistent scale:
- Page padding: `p-6`
- Card gaps: `gap-6` (fix Members from `gap-4`)
- Section spacing: `space-y-8` (fix About from `space-y-20`)
- Card internal padding: `p-5`

Rule: `4` tight/internal, `5` card padding, `6` page/grid gaps, `8` section breaks.

## 5. Mobile Navigation

- Keep icon + text on mobile with `text-xs` (don't hide labels)
- Remove dual-underline overlap — use only TopNav inline underline
- Active tab: gold underline + `text-primary`. Inactive: `text-muted-foreground`
- Use `sm:` breakpoint consistently for all nav changes
