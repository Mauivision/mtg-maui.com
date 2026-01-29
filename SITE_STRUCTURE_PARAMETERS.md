# 🏗️ MTG Maui League - Site Structure & Parameters

## 📋 Overview
This document defines the structure, parameters, and guidelines to keep the site clean, smooth, and maintainable.

---

## 🎯 Core Principles

### 1. **Performance First**
- All animations must be GPU-accelerated (use `transform` and `opacity`)
- Images must be optimized (< 500KB for backgrounds, < 200KB for cards)
- Lazy load non-critical content
- Respect `prefers-reduced-motion`

### 2. **Consistency**
- Use design tokens from `globals.css`
- Follow component patterns from `skills.md`
- Maintain consistent spacing (4px grid system)
- Use consistent animation durations (150ms, 300ms, 500ms)

### 3. **Accessibility**
- All interactive elements must be keyboard accessible
- Proper ARIA labels for screen readers
- Color contrast ratios meet WCAG AA standards
- Focus indicators visible and clear

### 4. **Maintainability**
- Components should be reusable and composable
- Use TypeScript for type safety
- Follow naming conventions (PascalCase for components, camelCase for functions)
- Document complex logic

---

## 🎨 Design System Parameters

### Color Palette
```css
/* Primary Accent - Arena Gold */
--arena-400: 251, 191, 36;  /* Primary buttons, highlights */
--arena-500: 245, 158, 11;  /* Hover states */
--arena-600: 217, 119, 6;   /* Active states */

/* Backgrounds */
--background-rgb: 10, 12, 18;      /* Main background */
--surface-rgb: 22, 27, 34;         /* Cards, panels */
--surface-elevated-rgb: 36, 42, 52; /* Elevated cards */

/* Mana Colors */
--mana-blue: 59, 130, 246;   /* Info, stats */
--mana-red: 239, 68, 68;     /* Events, warnings */
--mana-green: 34, 197, 94;   /* Success, achievements */
```

### Typography Scale
- **Hero Headlines**: 4xl (2.25rem) to 7xl (4.5rem)
- **Section Titles**: 2xl (1.5rem) to 3xl (1.875rem)
- **Body Text**: base (1rem) to lg (1.125rem)
- **Small Text**: sm (0.875rem) to xs (0.75rem)

### Spacing System (4px grid)
- **xs**: 0.25rem (4px)
- **sm**: 0.5rem (8px)
- **md**: 1rem (16px)
- **lg**: 1.5rem (24px)
- **xl**: 2rem (32px)
- **2xl**: 3rem (48px)
- **3xl**: 4rem (64px)

### Border Radius
- **sm**: 0.25rem (4px) - Buttons, small elements
- **md**: 0.375rem (6px) - Cards, inputs
- **lg**: 0.5rem (8px) - Large cards
- **xl**: 0.75rem (12px) - Modals, panels
- **2xl**: 1rem (16px) - Hero sections

### Shadows & Elevation
- **Level 0**: No shadow (flat)
- **Level 1**: `shadow-sm` - Subtle elevation
- **Level 2**: `shadow-md` - Cards, buttons
- **Level 3**: `shadow-lg` - Elevated cards, modals
- **Level 4**: `shadow-xl` - Floating panels
- **Glow**: Colored shadows for interactive elements

---

## ⚡ Animation Parameters

### Duration Standards
- **Instant**: 0ms (immediate state changes)
- **Fast**: 150ms (hover states, micro-interactions)
- **Normal**: 300ms (transitions, button clicks)
- **Slow**: 500ms (page transitions, complex animations)

### Easing Functions
- **Ease Out**: `cubic-bezier(0.4, 0, 0.2, 1)` - Default transitions
- **Ease In Out**: `cubic-bezier(0.4, 0, 0.6, 1)` - Smooth animations
- **Spring**: `cubic-bezier(0.68, -0.55, 0.265, 1.55)` - Bouncy effects

### Animation Limits
- **Max Scale**: 1.1x (10% increase) - Hover effects
- **Min Scale**: 0.95x (5% decrease) - Active/pressed states
- **Max Translate**: 8px - Lift effects
- **Max Rotation**: 15deg - Icon animations

### Performance Rules
1. **Use `transform` and `opacity` only** for animations
2. **Avoid animating** `width`, `height`, `top`, `left`
3. **Use `will-change`** sparingly (only for active animations)
4. **Debounce/throttle** scroll and resize handlers
5. **Respect `prefers-reduced-motion`** - disable non-essential animations

---

## 🧩 Component Structure

### Button Component
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'success' | 'warning';
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  ripple?: boolean;      // Default: true
  glow?: boolean;        // Default: false
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}
```

**Animation Requirements:**
- Hover: Scale 1.05x, glow effect (if enabled)
- Active: Scale 0.95x
- Ripple: 600ms duration, fade out
- Shine: On hover, 1s duration

### Card Component
```typescript
interface CardProps {
  variant?: 'default' | 'arena' | 'elevated';
  hover?: boolean;       // Enable hover lift
  glow?: boolean;       // Enable border glow
}
```

**Animation Requirements:**
- Hover lift: Translate -4px, shadow elevation
- Border glow: Amber border on hover (if `card-arena`)
- Transition: 300ms ease-out

### Page Transitions
- **Fade**: 150ms opacity transition
- **Slide**: 300ms transform + opacity
- **Scale**: 300ms transform + opacity
- **Combined**: 300ms all effects

---

## 📱 Responsive Breakpoints

```css
/* Tailwind defaults */
sm: 640px   /* Mobile landscape, small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large desktop */
```

### Mobile-First Approach
1. Design for mobile first (320px+)
2. Enhance for larger screens
3. Test touch targets (minimum 44x44px)
4. Optimize images for mobile (use `srcset`)

---

## 🗂️ File Organization

### Component Structure
```
src/components/
├── ui/              # Base UI components (Button, Card, Input)
├── layout/          # Layout components (Header, Footer)
├── admin/           # Admin-specific components
├── leaderboard/     # Leaderboard components
└── [feature]/       # Feature-specific components
```

### Naming Conventions
- **Components**: PascalCase (`Button.tsx`, `LeaderboardCard.tsx`)
- **Hooks**: camelCase with `use` prefix (`useAuth.ts`, `useLeague.ts`)
- **Utilities**: camelCase (`api-error.ts`, `logger.ts`)
- **Types**: PascalCase (`mtg.ts`, `league.ts`)

### Import Organization
```typescript
// 1. React/Next.js
import React from 'react';
import Link from 'next/link';

// 2. Third-party
import { FaTrophy } from 'react-icons/fa';
import toast from 'react-hot-toast';

// 3. Internal - Components
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

// 4. Internal - Hooks/Contexts
import { useAuth } from '@/hooks/useAuth';
import { useLeague } from '@/contexts/LeagueContext';

// 5. Internal - Utilities
import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/api-error';

// 6. Types
import type { Player } from '@/types/mtg';
```

---

## 🔒 Security Parameters

### Authentication
- **Public Routes**: Homepage, Leaderboard, Rules, Bulletin
- **Protected Routes**: Admin, Wizards (currently open for development)
- **API Routes**: Use `requireAdminOrSimple` helper

### Data Validation
- Use Zod schemas for API validation
- Sanitize user input
- Validate file uploads (type, size)
- Rate limit API endpoints

### Content Security
- Sanitize HTML content (if allowing user-generated content)
- Validate image URLs
- Use CSP headers in production

---

## 📊 Performance Targets

### Load Times
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Largest Contentful Paint**: < 2.5s

### Bundle Sizes
- **Initial JS Bundle**: < 200KB (gzipped)
- **CSS Bundle**: < 50KB (gzipped)
- **Image Optimization**: WebP format when possible

### Animation Performance
- **60 FPS** for all animations
- **No layout shifts** during animations
- **Smooth scrolling** (60 FPS)

---

## 🧪 Testing Parameters

### Component Testing
- Test all interactive states (hover, active, disabled)
- Test keyboard navigation
- Test with screen readers
- Test responsive breakpoints

### Animation Testing
- Test with `prefers-reduced-motion: reduce`
- Test animation performance (60 FPS)
- Test animation cancellation
- Test on low-end devices

---

## 📝 Code Quality Standards

### TypeScript
- **Strict mode**: Enabled
- **No `any` types**: Use proper types or `unknown`
- **Interface over type**: Prefer interfaces for object shapes

### ESLint Rules
- Follow Next.js recommended rules
- No console.log (use logger)
- No unused variables
- Consistent import order

### Git Commit Messages
- Use conventional commits format
- Include scope when relevant
- Keep messages concise but descriptive

---

## 🚀 Deployment Parameters

### Environment Variables
- **Required**: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- **Optional**: `OPENAI_API_KEY` (for MCP image generator)

### Build Optimization
- Enable production optimizations
- Minify CSS and JS
- Optimize images
- Generate source maps for debugging

### Monitoring
- Error tracking (Sentry or similar)
- Performance monitoring
- Analytics (privacy-compliant)

---

## 📚 Documentation Standards

### Component Documentation
- JSDoc comments for props
- Usage examples
- Accessibility notes
- Performance considerations

### API Documentation
- Endpoint descriptions
- Request/response schemas
- Error codes
- Authentication requirements

---

## ✅ Checklist for New Features

Before adding a new feature:

- [ ] Follows design system parameters
- [ ] Uses consistent spacing and typography
- [ ] Animations are performant (60 FPS)
- [ ] Accessible (keyboard, screen reader)
- [ ] Responsive (mobile-first)
- [ ] TypeScript types defined
- [ ] Error handling implemented
- [ ] Loading states included
- [ ] Tested on multiple browsers
- [ ] Documented in relevant files

---

**Last Updated**: 2026-01-27  
**Version**: 1.0.0
