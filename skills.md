# 🎨 Visual Enhancement Skills & Patterns

## Overview
This document outlines the visual enhancement patterns, animations, and interactive elements used throughout the MTG Maui League application.

---

## ✨ Reimagined Design System — Arena / Tavern

*The app has been **reimagined** around an **Arena / Tavern** aesthetic: darker, more immersive, mana-inspired.*

### Visual Identity
- **Hero**: “Enter the Arena” — bold headline, gradient accent, two clear CTAs (Leaderboard, Character Sheets)
- **Stats**: Mana-style **stat orbs** (blue / amber / emerald) with hover scale
- **Chaos Draft**: Prominent **event card** — card-like frame, red/amber accents, inline badges
- **Features**: **Card-arena** blocks — dark glass, amber border glow, hover lift
- **Header**: Darker (`slate-950`), minimal logo (M), pill nav with amber active state
- **CastleGate**: “Entering the arena…” loading copy, subtle pulse dots

### Design Tokens
- **Background**: Near-black (`rgb(10,12,18)`), subtle vertical gradient
- **Surfaces**: `slate-900/80`–`slate-950`, glass-style with `backdrop-blur`
- **Primary accent**: **Arena gold** (amber `400`–`700`), gradients, borders
- **Mana accents**: Blue (info), Red (events), Emerald (success)
- **Cards**: `.card`, `.card-elevated`, `.card-arena` (hover border/glow)
- **Stat orbs**: `.stat-orb`, `.stat-orb-blue`, `.stat-orb-amber`, `.stat-orb-emerald`

### Key Classes
| Class | Use |
|-------|-----|
| `text-gradient-arena` | Amber gradient text |
| `card-arena` | Feature/event cards with hover glow |
| `stat-orb` + variant | Mana-style stat badges (blue, amber, emerald) |

### Usage
- **Homepage**: Hero + orbs + Chaos Draft event card + Explore cards
- **Buttons**: Prefer `ripple` + `glow` on primary CTAs; outline for secondary
- **Nav**: Amber active state, slate hover; “Join League” uses gradient button

---

## 🎯 Button Enhancements

### Visual Effects
- **Ripple Effect**: Click ripple animation for tactile feedback
- **Glow Effects**: Hover glow with shadow elevation
- **Gradient Animations**: Animated gradient backgrounds
- **Scale Transforms**: Smooth scale on hover/active states
- **Icon Animations**: Rotating, pulsing, or sliding icons
- **Loading States**: Animated spinners with progress indicators

### Button Variants
1. **Primary**: Purple gradient with glow effect
2. **Secondary**: Slate with subtle elevation
3. **Danger**: Red with pulse warning effect
4. **Success**: Green with checkmark animation
5. **Warning**: Yellow with caution pulse
6. **Ghost**: Transparent with border highlight
7. **Outline**: Border-only with fill on hover

### Interactive States
- **Hover**: Scale (1.05x), glow, shadow elevation
- **Active**: Scale (0.95x), pressed shadow
- **Focus**: Ring outline with color match
- **Disabled**: Opacity reduction, no interactions
- **Loading**: Spinner overlay, text fade

---

## 🚀 Page Transitions

### Transition Types
1. **Fade**: Smooth opacity transition (150ms)
2. **Slide**: Horizontal slide with direction detection
3. **Scale**: Zoom in/out effect
4. **Blur**: Focus blur during transition
5. **Combined**: Multiple effects for premium feel

### Direction Detection
- **Forward Navigation**: Slide left, fade in
- **Back Navigation**: Slide right, fade in
- **Same Level**: Fade only
- **Deep Navigation**: Scale + fade

### Loading States
- **Progress Bar**: Top-of-page loading indicator
- **Skeleton Screens**: Content placeholders
- **Spinner Overlay**: Full-page loading state
- **Staggered Reveal**: Sequential content appearance

---

## ✨ Animation Patterns

### Entrance Animations
- **Fade In Up**: Content slides up while fading in
- **Fade In Down**: Content slides down while fading in
- **Scale In**: Content zooms in from center
- **Slide In**: Content slides from side
- **Stagger**: Sequential appearance with delay

### Hover Animations
- **Lift**: Elevation increase on hover
- **Glow**: Shadow/glow intensification
- **Rotate**: Subtle rotation (icons, cards)
- **Scale**: Size increase (1.05x typical)
- **Color Shift**: Background color transition

### Micro-interactions
- **Ripple**: Click/tap ripple effect
- **Bounce**: Subtle bounce on action
- **Pulse**: Attention-grabbing pulse
- **Shake**: Error/warning shake
- **Spin**: Loading/processing spin

---

## 🎭 Component-Specific Enhancements

### Cards
- **Hover Lift**: Shadow elevation + scale
- **Border Glow**: Colored border on focus
- **Flip Animation**: 3D flip on interaction
- **Stagger Reveal**: Sequential card appearance

### Forms
- **Input Focus**: Border color + glow
- **Label Float**: Label animation on focus
- **Error Shake**: Shake on validation error
- **Success Check**: Checkmark animation

### Navigation
- **Active Indicator**: Underline/badge for active route
- **Hover Preview**: Subtle background highlight
- **Smooth Scroll**: Animated scroll to sections
- **Breadcrumb Trail**: Visual path indicator

### Modals/Dialogs
- **Backdrop Blur**: Blurred background
- **Scale Entrance**: Modal scales in from center
- **Fade Exit**: Smooth fade out
- **Focus Trap**: Keyboard navigation focus

---

## 🎨 Color & Theme Enhancements

### Gradients
- **Primary Gradient**: Purple to blue
- **Accent Gradient**: Amber to orange
- **Success Gradient**: Green shades
- **Danger Gradient**: Red shades
- **Animated Gradients**: Moving gradient backgrounds

### Shadows
- **Elevation Levels**: 0-5 shadow depths
- **Colored Shadows**: Theme-matched shadows
- **Glow Shadows**: Soft glow effects
- **Hover Shadows**: Dynamic shadow on hover

### Glass Morphism
- **Frosted Glass**: Backdrop blur + transparency
- **Glass Cards**: Elevated glass effect
- **Glass Buttons**: Translucent button style

---

## 📱 Responsive Enhancements

### Mobile Optimizations
- **Touch Targets**: Minimum 44x44px
- **Swipe Gestures**: Swipe navigation support
- **Haptic Feedback**: Vibration on interactions
- **Reduced Motion**: Respect prefers-reduced-motion

### Tablet/Desktop
- **Hover States**: Full hover effects
- **Keyboard Navigation**: Full keyboard support
- **Mouse Tracking**: Cursor effects (optional)
- **Multi-touch**: Gesture support

---

## ⚡ Performance Considerations

### Animation Best Practices
- **GPU Acceleration**: Use transform/opacity
- **Will-change**: Hint browser optimization
- **Reduce Motion**: Respect user preferences
- **Debounce/Throttle**: Limit animation triggers
- **Lazy Load**: Load animations on demand

### Optimization Techniques
- **CSS Transitions**: Prefer over JS animations
- **RequestAnimationFrame**: For JS animations
- **Transform Over Position**: Better performance
- **Opacity Over Visibility**: Smoother transitions
- **Layer Promotion**: Use will-change sparingly

---

## 🛠️ Implementation Examples

### Enhanced Button with Ripple & Glow
```tsx
import { Button } from '@/components/ui/Button';

// Primary button with all enhancements
<Button 
  variant="primary"
  size="lg"
  ripple={true}
  glow={true}
  loading={isSubmitting}
>
  <FaTrophy className="w-5 h-5 mr-2" />
  Submit Score
</Button>

// Success button with glow
<Button 
  variant="success"
  glow={true}
  onClick={handleSave}
>
  Save Changes
</Button>

// Outline button with ripple
<Button 
  variant="outline"
  ripple={true}
  fullWidth
>
  Cancel
</Button>
```

### Page Transition with Direction Detection
```tsx
import { PageTransition } from '@/components/layout/PageTransition';

// In layout.tsx - automatic direction detection
<PageTransition type="combined" duration={300}>
  {children}
</PageTransition>

// Fade only (lightweight)
<PageTransition type="fade" duration={150}>
  {children}
</PageTransition>

// Slide with direction
<PageTransition type="slide" duration={300}>
  {children}
</PageTransition>
```

### Staggered Reveal Animation
```tsx
import { StaggeredReveal } from '@/components/ui/StaggeredReveal';

<StaggeredReveal delay={100} direction="up">
  {leaderboardEntries.map((entry) => (
    <Card key={entry.id}>
      <PlayerCard entry={entry} />
    </Card>
  ))}
</StaggeredReveal>

// With custom delay
<StaggeredReveal delay={150} direction="left" className="space-y-4">
  <FeatureCard />
  <FeatureCard />
  <FeatureCard />
</StaggeredReveal>
```

### Page Progress Indicator
```tsx
// Automatically included in layout.tsx
// Shows top progress bar on route changes
import { PageProgress } from '@/components/ui/PageProgress';

// In layout
<PageProgress />
```

### CSS Animation Utilities
```tsx
// Fade in with delay
<div className="animate-fade-in-delayed">
  Content appears after 200ms
</div>

// Gradient animation
<div className="bg-gradient-to-r from-purple-600 to-pink-600 animate-gradient-x">
  Animated gradient background
</div>

// Lift effect on hover
<div className="animate-lift">
  <Card>Hover to lift</Card>
</div>

// Pulse glow
<Button className="animate-pulse-glow">
  Attention button
</Button>

// Shake on error
<div className={hasError ? 'animate-shake' : ''}>
  Form input
</div>
```

### Card with Hover Effects
```tsx
<div className="group cursor-pointer">
  <Card className="transition-all duration-300 hover:shadow-elevation-3 hover:-translate-y-1">
    <CardHeader>
      <CardTitle className="group-hover:text-purple-400 transition-colors">
        Player Name
      </CardTitle>
    </CardHeader>
    <CardContent>
      Content that appears on hover
    </CardContent>
  </Card>
</div>
```

---

## 📚 Resources

### Animation Libraries
- **Framer Motion**: React animation library
- **CSS Animations**: Native CSS keyframes
- **GSAP**: Advanced animation library
- **React Spring**: Physics-based animations

### Design Principles
- **Consistency**: Same patterns across app
- **Purpose**: Animations should have meaning
- **Performance**: Smooth 60fps animations
- **Accessibility**: Respect reduced motion
- **Feedback**: Clear user feedback on actions

---

## 🎯 Current Implementation Status

### ✅ Implemented Features
- [x] Enhanced Button component with ripple effects
- [x] Button glow effects on hover
- [x] Gradient button backgrounds
- [x] Scale transforms on hover/active
- [x] Page transition with direction detection
- [x] Multiple transition types (fade, slide, scale, blur, combined)
- [x] Page progress indicator
- [x] Staggered reveal animations
- [x] CSS animation utilities (ripple, shine, pulse, shake)
- [x] Elevation shadow system
- [x] Reduced motion support

### 🚧 Planned Features
- [ ] 3D card flip animations
- [ ] Particle effects on actions
- [ ] Gesture-based navigation
- [ ] Theme-aware animations
- [ ] Custom cursor effects
- [ ] Scroll-triggered animations
- [ ] Parallax effects
- [ ] Loading skeleton screens
- [ ] Toast notification animations

---

## 📖 Quick Reference

### Button Props
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'success' | 'warning';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  ripple?: boolean;      // Enable ripple effect
  glow?: boolean;         // Enable glow on hover
  children: React.ReactNode;
}
```

### PageTransition Props
```typescript
interface PageTransitionProps {
  children: React.ReactNode;
  type?: 'fade' | 'slide' | 'scale' | 'blur' | 'combined';
  duration?: number;      // Milliseconds (default: 300)
}
```

### StaggeredReveal Props
```typescript
interface StaggeredRevealProps {
  children: React.ReactNode;
  delay?: number;         // Delay between items in ms (default: 100)
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
}
```

---

**Last Updated**: 2026-01-27
**Version**: 2.0.0
