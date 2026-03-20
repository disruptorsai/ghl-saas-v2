# Design Polish Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix animation excess, hardcoded colors, card hierarchy, spacing inconsistencies, and mobile nav to create a polished, premium UI.

**Architecture:** Pure CSS + component class changes. No new dependencies, no structural changes. All edits are to existing files.

**Tech Stack:** TailwindCSS v4, React 19, shadcn/ui

---

### Task 1: Strip Animations from index.css

**Files:**
- Modify: `src/index.css:110-194`

**Step 1: Remove gold shimmer keyframes and animation overrides**

Delete lines 110-194 entirely (the gold-shimmer keyframes, icon-gold-shimmer, goldPulse, `.bg-primary` override, `.text-primary` override, `.ring-primary` override, `.border-primary` override). Replace with minimal static styling:

```css
/* Static gold accent — no animations */
.text-gold-shine {
  color: hsl(43 74% 49%);
}

.icon-gold-shine {
  color: hsl(43 74% 49%);
}
```

Keep everything from line 196 onward (::selection, .nav-tab-active, scrollbar, progress-bar-fill, card-hover, typing-dot, fadeIn).

**Step 2: Remove the duplicate nav-tab-active ::after underline**

Delete lines 203-216 (the `.nav-tab-active` and `.nav-tab-active::after` rules). The underline is handled inline in TopNav.tsx already.

**Step 3: Verify build compiles**

Run: `npm run build`
Expected: SUCCESS with no errors

**Step 4: Commit**

```bash
git add src/index.css
git commit -m "fix: remove excessive gold shimmer animations, keep static gold accent"
```

---

### Task 2: Unify Hardcoded Colors in Support Components

**Files:**
- Modify: `src/components/support/ChatMessage.tsx`
- Modify: `src/components/support/ChatInput.tsx`
- Modify: `src/pages/Support.tsx`

**Step 1: Fix ChatMessage.tsx**

Replace hardcoded colors with design tokens:

```tsx
// Line 14: AI avatar — replace gradient with solid primary
<div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary flex items-center justify-center">
  <span className="text-[10px] font-bold text-primary-foreground">AI</span>
</div>

// Line 21-25: AI message bubble — replace hardcoded bg and border
isAi
  ? 'bg-card border border-primary/40 border-l-[3px] border-l-primary'
  : 'bg-secondary border border-border'

// Line 28: AI label — replace text-amber-400
<p className="text-xs font-semibold text-primary mb-1.5">

// Line 32: Message text — replace text-gray-200
<p className="text-sm text-foreground leading-relaxed">{message.content}</p>

// Line 34: Timestamp — replace text-gray-500
<p className={`text-[11px] text-muted-foreground mt-1.5 ${isAi ? '' : 'text-right'}`}>

// Line 40-41: User avatar — replace hardcoded bg
<div className="flex-shrink-0 w-9 h-9 rounded-full bg-secondary flex items-center justify-center border border-border">
  <span className="text-[10px] font-semibold text-muted-foreground">You</span>
</div>
```

**Step 2: Fix ChatInput.tsx**

```tsx
// Line 27: Input container — replace hardcoded bg
<div className="flex items-center gap-2 bg-card border border-border rounded-xl p-2">

// Line 35: Input text — replace text-gray-200 and placeholder:text-gray-500
className="flex-1 h-10 rounded-lg bg-transparent px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed"

// Line 41: Send button — replace gradient with solid primary
className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
```

**Step 3: Fix Support.tsx**

```tsx
// Line 45: heading — replace text-white
<h1 className="text-2xl font-bold tracking-tight text-foreground">Support</h1>

// Line 46: subheading — replace text-gray-400
<p className="text-sm text-muted-foreground mt-1">

// Lines 59-62: Typing indicator — replace hardcoded colors
<div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary flex items-center justify-center">
  <span className="text-[10px] font-bold text-primary-foreground">AI</span>
</div>
<div className="bg-card rounded-xl px-4 py-3 border border-primary/40 border-l-[3px] border-l-primary">
  <div className="flex items-center gap-1.5">
    <span className="w-2 h-2 rounded-full bg-primary typing-dot" />
    <span className="w-2 h-2 rounded-full bg-primary typing-dot" />
    <span className="w-2 h-2 rounded-full bg-primary typing-dot" />
  </div>
</div>
```

**Step 4: Verify build compiles**

Run: `npm run build`
Expected: SUCCESS

**Step 5: Commit**

```bash
git add src/components/support/ChatMessage.tsx src/components/support/ChatInput.tsx src/pages/Support.tsx
git commit -m "fix: replace hardcoded colors with design tokens in support components"
```

---

### Task 3: Unify Hardcoded Colors in Members, About, ModuleCard

**Files:**
- Modify: `src/pages/Members.tsx`
- Modify: `src/pages/About.tsx`
- Modify: `src/components/members/MemberCard.tsx`
- Modify: `src/components/classroom/ModuleCard.tsx`

**Step 1: Fix Members.tsx**

```tsx
// Line 23: heading — replace text-white
<h1 className="text-2xl font-bold text-foreground">Members</h1>

// Line 24: badge — replace bg-gold/15 text-gold
<span className="bg-primary/15 text-primary text-sm font-semibold px-2.5 py-0.5 rounded-full">

// Line 37: input — replace text-white, focus:ring-gold, focus:border-gold
className="w-full sm:w-80 bg-card border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-colors"
```

**Step 2: Fix About.tsx**

Replace all `text-gold` with `text-primary`, `bg-gold` with `bg-primary`, `text-white` with `text-foreground`, `hover:border-gold` with `hover:border-primary`, `shadow-gold` with `shadow-primary`:

```
text-gold-shine → text-primary (line 20, remove font-extrabold → font-bold)
text-white → text-foreground (lines 33, 47, 59, 74, 95, 119)
text-gold → text-primary (lines 45, 116, 120)
bg-gold/15 → bg-primary/15 (line 44)
bg-gold → bg-primary (lines 71, 87)
bg-gold/30 → bg-primary/30 (lines 67, 91)
bg-gold/20 → bg-primary/20 (line 116)
shadow-gold/20 → shadow-primary/20 (lines 71, 87)
shadow-gold/5 → shadow-primary/5 (lines 42, 114)
hover:border-gold/40 → hover:border-primary/40 (line 42)
```

**Step 3: Fix MemberCard.tsx**

```tsx
// Line 19: hover border — replace hover:border-gold/40
className="bg-card border border-border rounded-xl p-5 flex flex-col items-center text-center hover:border-primary/40 card-hover"

// Line 21: avatar bg — replace bg-gold/20
<div className="w-12 h-12 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center">

// Line 34: fallback avatar — replace bg-gold/20 text-gold
className="w-12 h-12 rounded-full bg-primary/20 text-primary font-bold text-sm items-center justify-center absolute inset-0 hidden"

// Line 44: name — replace text-white
<h3 className="font-bold text-foreground text-base leading-tight">{member.name}</h3>
```

**Step 4: Fix ModuleCard.tsx**

```tsx
// Line 46: thumbnail area — replace bg-[hsl(...)]
<div className="relative aspect-video bg-card flex items-center justify-center">

// Line 48: order badge — replace hardcoded #BF953F colors
<span className="absolute top-3 left-3 flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 border border-primary/30 text-xs font-bold text-primary">
```

**Step 5: Verify build**

Run: `npm run build`
Expected: SUCCESS

**Step 6: Commit**

```bash
git add src/pages/Members.tsx src/pages/About.tsx src/components/members/MemberCard.tsx src/components/classroom/ModuleCard.tsx
git commit -m "fix: replace hardcoded colors with design tokens in members, about, module cards"
```

---

### Task 4: Card Hierarchy — Borders and Progress Bars

**Files:**
- Modify: `src/components/classroom/ModuleCard.tsx`
- Modify: `src/components/classroom/OverallProgress.tsx`
- Modify: `src/components/classroom/StepSidebar.tsx`
- Modify: `src/pages/Admin.tsx`

**Step 1: Add left-border accent to ModuleCard on hover**

```tsx
// Line 43: Add border-l-2 transition
className="group block rounded-xl bg-card border border-border border-l-2 border-l-transparent hover:border-l-primary hover:border-primary/50 cursor-pointer overflow-hidden card-hover"
```

**Step 2: Bump progress bars across components**

ModuleCard.tsx (line 62):
```tsx
<div className="h-2.5 rounded-full bg-muted overflow-hidden">
```

OverallProgress.tsx (line 13):
```tsx
<div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
```

StepSidebar.tsx (line 25):
```tsx
<div className="h-2 rounded-full bg-muted overflow-hidden">
```

**Step 3: Add top-border accents to Admin stat cards**

Admin.tsx — add `border-t-2` to each stat card:

```tsx
// Total Clients card (line 33):
<div className="bg-card border border-border border-t-2 border-t-blue-500 rounded-xl p-5 flex items-center gap-4">

// Average Progress card (line 44):
<div className="bg-card border border-border border-t-2 border-t-green-500 rounded-xl p-5 flex items-center gap-4">

// Needs Attention card (line 55):
<div className="bg-card border border-border border-t-2 border-t-destructive rounded-xl p-5 flex items-center gap-4">
```

**Step 4: Verify build**

Run: `npm run build`
Expected: SUCCESS

**Step 5: Commit**

```bash
git add src/components/classroom/ModuleCard.tsx src/components/classroom/OverallProgress.tsx src/components/classroom/StepSidebar.tsx src/pages/Admin.tsx
git commit -m "fix: add card hierarchy borders and bump progress bar sizes"
```

---

### Task 5: Spacing Standardization

**Files:**
- Modify: `src/pages/Members.tsx`
- Modify: `src/pages/About.tsx`
- Modify: `src/pages/Admin.tsx`
- Modify: `src/components/members/MemberCard.tsx`

**Step 1: Fix Members grid gap**

Members.tsx line 43:
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
```

**Step 2: Fix About section spacing**

About.tsx line 17 — change `space-y-20` to `space-y-8`:
```tsx
<div className="p-6 max-w-5xl mx-auto space-y-8">
```

Also increase section heading margins to compensate — change `mb-10` to `mb-6` on section headings (lines 33, 59, 107) for tighter, more proportional spacing.

**Step 3: Fix Admin card padding**

Admin.tsx — change `p-6` to `p-5` on all three stat cards (lines 33, 44, 55).

**Step 4: Fix Admin grid gap**

Admin.tsx line 31 — keep `gap-4` for stat cards (they're side-by-side and tight is fine).

**Step 5: Verify build**

Run: `npm run build`
Expected: SUCCESS

**Step 6: Commit**

```bash
git add src/pages/Members.tsx src/pages/About.tsx src/pages/Admin.tsx src/components/members/MemberCard.tsx
git commit -m "fix: standardize spacing across pages and cards"
```

---

### Task 6: Mobile Navigation Fix

**Files:**
- Modify: `src/components/layout/TopNav.tsx`

**Step 1: Show labels on mobile with smaller text**

Replace the nav link rendering (lines 26-46):

```tsx
{navItems.map(item => (
  <NavLink
    key={item.to}
    to={item.to}
    className={({ isActive }) => cn(
      'flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors relative',
      isActive
        ? 'text-primary'
        : 'text-muted-foreground hover:text-foreground'
    )}
  >
    {({ isActive }) => (
      <>
        <item.icon className="w-4 h-4" />
        <span className="text-xs sm:text-sm">{item.label}</span>
        {isActive && (
          <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full" />
        )}
      </>
    )}
  </NavLink>
))}
```

Key changes:
- Remove `hidden md:inline` from label span — always visible
- Add `text-xs sm:text-sm` for smaller mobile text
- Tighten gap from `gap-2` to `gap-1.5`
- Tighten padding from `px-4` to `px-3 sm:px-4`

**Step 2: Verify build**

Run: `npm run build`
Expected: SUCCESS

**Step 3: Commit**

```bash
git add src/components/layout/TopNav.tsx
git commit -m "fix: show nav labels on mobile with smaller text, remove hidden breakpoint"
```

---

### Task 7: Final Verification

**Step 1: Full build check**

Run: `npm run build`
Expected: SUCCESS with no warnings

**Step 2: Lint check**

Run: `npm run lint`
Expected: No new errors

**Step 3: Visual spot-check**

Run: `npm run dev`
Manually verify:
- No gold shimmer animations anywhere
- All text readable (no transparent fill issues)
- Module cards have gold left border on hover
- Admin stat cards have colored top borders
- Progress bars are visibly larger
- Mobile nav shows text labels
- Consistent spacing across pages
