# Arena Theme Guide 🏟️⚔️

## Overview
The MTG Maui League has been redesigned with an **Arena/Tavern** aesthetic, featuring darker backgrounds, gold/amber accents, and mana-inspired color schemes.

## Color Palette

### Background Colors
- **Primary**: `bg-slate-950` - Deep dark background (main app background)
- **Secondary**: `bg-slate-900` - Slightly lighter for cards/surfaces
- **Surface**: `bg-slate-800` - Card backgrounds
- **Elevated**: `bg-slate-700` - Hover states, elevated surfaces

### Text Colors
- **Primary**: `text-gray-100` - Main text
- **Secondary**: `text-gray-300` - Secondary text
- **Muted**: `text-gray-400` - Muted/disabled text
- **Accent**: `text-amber-400` - Arena gold accent text

### Arena Gold (Primary Accent)
- **50-900**: Full amber scale from lightest to darkest
- **Primary Use**: `bg-amber-500`, `text-amber-400`, `border-amber-500`
- **Gradients**: `from-amber-600 to-orange-600`

### Mana Colors
- **Blue**: `bg-blue-600` - For blue mana/water elements
- **Red**: `bg-red-600` - For red mana/fire elements
- **Green**: `bg-green-600` - For green mana/nature elements
- **Black**: `bg-slate-800` - For black mana/shadow elements
- **White**: `bg-gray-100` - For white mana/light elements

## CSS Classes

### Arena Card
```tsx
<div className="card-arena">
  {/* Card content */}
</div>
```

**Features:**
- Dark slate background with transparency
- Subtle border
- Rounded corners
- Hover effects with amber glow

### Mana Orbs
```tsx
<div className="mana-orb">...</div>
<div className="stat-orb stat-orb-amber">...</div>
<div className="stat-orb stat-orb-blue">...</div>
<div className="stat-orb stat-orb-emerald">...</div>
```

**Features:**
- Circular badges with gradient backgrounds
- Border glow effects
- Hover scale animation
- Mana color variants

### Text Gradients
```tsx
<h1 className="text-gradient">Arena Title</h1>
<h2 className="text-gradient-arena">Subtitle</h2>
```

## Theme Utilities

### Using the Theme Utility (`src/lib/theme.ts`)

```typescript
import { arenaTheme, getArenaCardClasses, getManaOrbClasses } from '@/lib/theme';

// Get card classes
<div className={getArenaCardClasses()}>...</div>

// Get mana orb classes
<div className={getManaOrbClasses('amber')}>...</div>
<div className={getManaOrbClasses('blue')}>...</div>
```

## Component Updates

### Updated Components
1. **CastleGate** - Enhanced loading screen with arena theme
2. **PageProgress** - Amber/orange gradient progress bar
3. **Layout** - Darker slate-950 background
4. **Global CSS** - New arena-themed utility classes

### Components to Update
- Cards should use `card-arena` or `getArenaCardClasses()`
- Buttons should use amber accents where appropriate
- Backgrounds should use slate-950/900/800 hierarchy

## Design Principles

1. **Dark & Immersive**: Deep slate backgrounds create arena atmosphere
2. **Gold Accents**: Amber/gold highlights important elements
3. **Mana Colors**: Use MTG mana colors for variety
4. **Smooth Transitions**: All interactions have smooth animations
5. **Glow Effects**: Subtle shadows and glows for depth

## Migration Guide

### Before (Old Theme)
```tsx
<div className="bg-slate-900 border-slate-700">
  <h1 className="text-blue-400">Title</h1>
</div>
```

### After (Arena Theme)
```tsx
<div className="card-arena">
  <h1 className="text-gradient-arena">Title</h1>
</div>
```

## Examples

### Arena Card
```tsx
<Card className="card-arena">
  <CardHeader>
    <CardTitle className="text-gradient-arena">Arena Champion</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="flex gap-2">
      <div className={getManaOrbClasses('amber')}>🏆</div>
      <div className={getManaOrbClasses('blue')}>💎</div>
    </div>
  </CardContent>
</Card>
```

### Loading State
```tsx
<div className="bg-slate-950/95 backdrop-blur-md">
  <div className="text-amber-400">
    <span>Entering the arena…</span>
  </div>
</div>
```

## Best Practices

1. **Consistency**: Use theme utilities for consistent styling
2. **Hierarchy**: Use background color hierarchy (950 → 900 → 800 → 700)
3. **Accents**: Use amber/gold sparingly for emphasis
4. **Contrast**: Ensure text is readable on dark backgrounds
5. **Animations**: Keep transitions smooth and subtle

---

**Theme Version**: 2.0 (Arena/Tavern)
**Last Updated**: 2026-01-21
