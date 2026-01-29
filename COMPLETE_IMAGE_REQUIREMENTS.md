# 🎨 MTG Maui League - Complete Image Requirements

## 📋 Document Purpose
This is the **complete and comprehensive** list of ALL images needed for the MTG Maui League website, organized by priority and category. Use this document with the MCP Image Generator or any AI image generation tool.

---

## 🎯 Priority 1: Essential Images (Required for Launch)

### 1. Main Medieval Background
**File Path:** `public/images/medieval-background.jpg`

**Usage:**
- Homepage hero section background
- Commander page background
- Rules page background
- Wizards control panel background
- Tournament bracket page background
- Player profile page background
- Analytics page background
- Coming soon page background
- Authentication pages (signin/signup) background
- Character sheets page background
- All static pages with medieval theme

**Technical Specifications:**
- **Dimensions:** 1920x1080px (Full HD) minimum, 3840x2160px (4K) recommended
- **Format:** JPG (optimized, compressed)
- **File Size:** Under 500KB
- **Aspect Ratio:** 16:9
- **Color Profile:** sRGB

**AI Generation Prompt:**
```
Epic medieval castle fortress at twilight, dramatic storm clouds overhead, amber and orange torchlight illuminating stone battlements, dark fantasy atmosphere, cinematic composition, wide angle view, Magic: The Gathering art style, dark dramatic lighting, amber and red color palette, suitable for text overlay, 16:9 aspect ratio, highly detailed, professional digital art
```

---

### 2. Open Graph / Social Media Preview Image
**File Path:** `public/images/og-image.jpg`

**Usage:**
- Facebook/LinkedIn link previews
- Twitter/X card previews
- Discord/Slack link embeds
- SEO metadata image
- Referenced in `src/app/layout.tsx`

**Technical Specifications:**
- **Dimensions:** 1200x630px (Facebook/LinkedIn standard)
- **Format:** JPG
- **File Size:** Under 300KB
- **Aspect Ratio:** 1.91:1

**AI Generation Prompt:**
```
Medieval fantasy banner design, "MTG Maui League" text prominently displayed, Magic: The Gathering card art style, dark background with amber and orange accents, epic fantasy typography, professional logo design, 1200x630px, suitable for social media preview, high contrast, readable text
```

---

### 3. Favicon Set (Complete)
**File Path:** `public/images/icons/icon-[size].svg` and `public/favicon.ico`

**Current Files (Verify/Update):**
- `icon.svg` (base icon)
- `icon-72x72.svg`
- `icon-96x96.svg`
- `icon-128x128.svg`
- `icon-144x144.svg`
- `icon-152x152.svg`
- `icon-192x192.svg`
- `icon-384x384.svg`
- `icon-512x512.svg`
- `favicon.ico` (16x16, 32x32)

**Usage:**
- Browser favicon
- PWA app icons (referenced in `public/manifest.json`)
- Mobile home screen icons
- Bookmark icons
- Referenced in `src/app/layout.tsx` and `src/components/seo/StructuredData.tsx`

**Technical Specifications:**
- **Format:** SVG (vector) preferred, PNG fallback, ICO for favicon
- **Sizes:** 16x16, 32x32, 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512
- **Background:** Transparent or solid color
- **Style:** Simple, recognizable at small sizes

**AI Generation Prompt:**
```
Simple medieval shield emblem icon, Magic: The Gathering style, amber and orange colors, minimalist design, suitable for favicon, vector style, high contrast, recognizable at small sizes, fantasy heraldry, clean lines
```

---

### 4. Browser Configuration XML
**File Path:** `public/images/icons/browserconfig.xml`

**Usage:**
- Windows tile configuration
- Referenced in `src/app/layout.tsx`

**Note:** This is an XML file, not an image, but needs to be created.

---

## 🎯 Priority 2: Important Images (Enhance User Experience)

### 5. Hero Section Banner (Alternative)
**File Path:** `public/images/heroes/hero-banner.jpg`

**Usage:**
- Alternative hero section image
- Can be used in page content configuration
- Homepage hero variations

**Technical Specifications:**
- **Dimensions:** 1920x600px (16:5 ratio)
- **Format:** JPG
- **File Size:** Under 400KB

**AI Generation Prompt:**
```
Epic medieval fantasy banner, wide horizontal format 1920x600px, Magic: The Gathering art style, dark dramatic atmosphere, amber and orange torchlight, castle battlements in background, cinematic composition, suitable for hero section with text overlay, highly detailed digital art
```

---

### 6. Event/Tournament Images (5 Different Types)
**File Path:** `public/images/events/[event-name].jpg`

**Usage:**
- Event cards on homepage
- Event detail pages
- Bulletin/news section
- Tournament listings
- Referenced in Event model `imageUrl` field

**Technical Specifications:**
- **Dimensions:** 800x450px (16:9 ratio)
- **Format:** JPG
- **File Size:** Under 200KB each
- **Quantity:** 5 different event images

**AI Generation Prompts:**

**Event 1 - Draft Tournament:**
```
Medieval tournament scene, players gathered around tables with Magic: The Gathering cards, draft format, dramatic amber lighting, dark fantasy atmosphere, Magic: The Gathering art style, 800x450px, epic composition, highly detailed digital art
```
**File:** `event-draft-tournament.jpg`

**Event 2 - Commander Game:**
```
Epic Commander multiplayer game scene, medieval fantasy setting, players around circular table, dramatic cards and tokens, amber and orange magical glow, dark fantasy atmosphere, Magic: The Gathering style, 800x450px, cinematic composition
```
**File:** `event-commander-game.jpg`

**Event 3 - Tournament Battle:**
```
Medieval tournament battle scene, two players facing off, dramatic Magic: The Gathering cards in play, epic fantasy atmosphere, amber torchlight, dark dramatic lighting, Magic: The Gathering art style, 800x450px, highly detailed
```
**File:** `event-tournament-battle.jpg`

**Event 4 - Sealed Event:**
```
Medieval gathering scene, players opening Magic: The Gathering booster packs, sealed format event, dark fantasy atmosphere, amber lighting, Magic: The Gathering style, 800x450px, epic composition
```
**File:** `event-sealed-event.jpg`

**Event 5 - Casual Play:**
```
Medieval tavern scene, players enjoying casual Magic: The Gathering games, warm amber lighting, friendly atmosphere, dark fantasy setting, Magic: The Gathering art style, 800x450px, detailed digital art
```
**File:** `event-casual-play.jpg`

---

### 7. Background Textures/Overlays
**File Path:** `public/images/backgrounds/[texture-name].jpg`

**Usage:**
- Page background variations
- Texture overlays
- Wizards control panel backgrounds
- Additional page backgrounds

**Technical Specifications:**
- **Dimensions:** 1920x1080px (or 512x512px for tileable textures)
- **Format:** JPG or PNG (if transparency needed)
- **File Size:** Under 300KB
- **Tileable:** Some textures should be seamless/tileable

**AI Generation Prompts:**

**Texture 1 - Stone Wall:**
```
Medieval stone wall texture, dark aged stone, subtle amber highlights, seamless tileable pattern, dark fantasy atmosphere, 512x512px, suitable for background overlay, subtle and non-distracting
```
**File:** `background-stone-texture.jpg`

**Texture 2 - Parchment:**
```
Aged medieval parchment texture, dark weathered paper, subtle amber stains, seamless tileable, dark fantasy aesthetic, 512x512px, suitable for background overlay, subtle texture
```
**File:** `background-parchment-texture.jpg`

**Texture 3 - Wizards Background:**
```
Mystical medieval wizard's study background, dark stone walls, magical amber glowing runes, books and scrolls, dark fantasy atmosphere, 1920x1080px, suitable for admin panel background, highly detailed
```
**File:** `backgrounds/wizards-bg.jpg`

---

### 8. Logo Variations
**File Path:** `public/images/icons/logo.png` and `logo-dark.png`

**Usage:**
- Site header/header
- Email templates
- Documentation
- Branding materials

**Technical Specifications:**
- **Dimensions:** 200x200px to 400x400px (square or rectangular)
- **Format:** PNG (with transparency)
- **File Size:** Under 150KB each
- **Variations:** Light version (for dark backgrounds) and dark version (for light backgrounds)

**AI Generation Prompt:**
```
Medieval fantasy logo design, "MTG Maui League" text, Magic: The Gathering style, shield or castle emblem, amber and orange colors, professional branding, high resolution, transparent background, 400x400px
```

---

## 🎯 Priority 3: Enhancement Images (Nice to Have)

### 9. Player Avatar Placeholder
**File Path:** `public/images/players/default-avatar.png`

**Usage:**
- Default player profile picture
- Fallback when player hasn't uploaded avatar
- Leaderboard default image
- Player profile pages

**Technical Specifications:**
- **Dimensions:** 300x300px (square)
- **Format:** PNG (with transparency)
- **File Size:** Under 100KB
- **Aspect Ratio:** 1:1 (square)

**AI Generation Prompt:**
```
Medieval fantasy warrior silhouette, Magic: The Gathering style, amber and orange accents, simple design, suitable for avatar placeholder, 300x300px square format, high contrast, works on any background, transparent background
```

---

### 10. Gallery/News Thumbnails
**File Path:** `public/images/gallery/[news-item].jpg`

**Usage:**
- News article thumbnails
- Gallery images
- Community highlights
- Bulletin images
- Homepage news section

**Technical Specifications:**
- **Dimensions:** 400x225px (16:9 ratio, thumbnail size)
- **Format:** JPG
- **File Size:** Under 150KB each
- **Quantity:** 5-10 images for variety

**AI Generation Prompts:**

**Gallery Image 1:**
```
Magic: The Gathering tournament moment, players celebrating, medieval fantasy setting, amber lighting, dark atmosphere, 400x225px thumbnail, epic composition
```
**File:** `gallery-tournament-moment-1.jpg`

**Gallery Image 2:**
```
Medieval fantasy card art showcase, Magic: The Gathering cards displayed, dramatic amber lighting, dark fantasy atmosphere, 400x225px, highly detailed
```
**File:** `gallery-card-showcase.jpg`

**Gallery Image 3:**
```
Medieval tournament hall, players gathered, Magic: The Gathering event, warm amber lighting, community atmosphere, 400x225px thumbnail format
```
**File:** `gallery-community-gathering.jpg`

---

### 11. Meme Images (NEW - For Homepage Memes Section)
**File Path:** `public/images/gallery/memes/[meme-name].jpg` or via News `imageUrl`

**Usage:**
- Homepage memes section (newly added)
- Community fun content
- Bulletin board memes
- Referenced in News model with `category: 'Meme'` and `imageUrl` field

**Technical Specifications:**
- **Dimensions:** 800x450px (16:9 ratio) or 600x600px (square for memes)
- **Format:** JPG or PNG
- **File Size:** Under 200KB each
- **Quantity:** 5-10 meme images

**AI Generation Prompts:**

**Meme 1 - Tournament Fail:**
```
Funny Magic: The Gathering tournament moment, player with shocked expression, cards scattered, medieval fantasy setting, humorous atmosphere, 800x450px, meme style, dark fantasy aesthetic
```
**File:** `memes/tournament-fail-1.jpg`

**Meme 2 - Deck Building:**
```
Humorous scene of player struggling with deck building, too many cards, medieval fantasy setting, comedic Magic: The Gathering moment, 800x450px, meme style
```
**File:** `memes/deck-building-struggle.jpg`

**Meme 3 - Commander Chaos:**
```
Funny Commander game moment, four players with dramatic expressions, cards everywhere, chaotic medieval fantasy scene, humorous, 800x450px, meme style
```
**File:** `memes/commander-chaos.jpg`

**Note:** Memes can also be user-uploaded images stored via the News API with `category: 'Meme'`.

---

### 12. Magic Card Artwork
**File Path:** `public/images/cards/[card-name].jpg`

**Usage:**
- Card art displays
- Deck builder visuals
- Card showcases
- Educational content
- Referenced in Deck components

**Technical Specifications:**
- **Dimensions:** 680x480px (Magic card art ratio)
- **Format:** JPG
- **File Size:** Under 250KB each
- **Aspect Ratio:** ~1.42:1 (Magic card art ratio)

**AI Generation Prompts:**

**Card Art 1 - Creature:**
```
Epic medieval fantasy creature, Magic: The Gathering card art style, dragon or knight, dramatic lighting, amber and orange accents, highly detailed digital painting, 680x480px, professional illustration
```
**File:** `cards/creature-example.jpg`

**Card Art 2 - Spell:**
```
Mystical magical spell effect, medieval fantasy, Magic: The Gathering style, amber and orange magical energy, dark dramatic atmosphere, 680x480px, highly detailed digital art
```
**File:** `cards/spell-example.jpg`

**Card Art 3 - Land:**
```
Medieval fantasy landscape, Magic: The Gathering land card style, castle or battlefield, dramatic sky, amber lighting, 680x480px, epic composition
```
**File:** `cards/land-example.jpg`

**Note:** Consider using official Magic: The Gathering card art from Scryfall API (already integrated) with proper attribution.

---

### 13. Trophy/Achievement Icons
**File Path:** `public/images/icons/trophy.svg` or `trophy.png`

**Usage:**
- Leaderboard rankings
- Achievement displays
- Award indicators
- Stats icons
- Referenced in leaderboard components

**Technical Specifications:**
- **Dimensions:** 64x64px to 128x128px
- **Format:** SVG (vector) preferred, PNG fallback
- **File Size:** Under 50KB
- **Style:** Icon/symbol style

**AI Generation Prompt:**
```
Medieval fantasy trophy icon, Magic: The Gathering style, amber and orange colors, simple icon design, suitable for leaderboard, vector style, high contrast, 128x128px, clean lines
```

---

### 14. Empty State Images
**File Path:** `public/images/empty/[state-name].svg` or `.png`

**Usage:**
- Empty leaderboard states
- No events found
- No news found
- No players found
- Empty search results

**Technical Specifications:**
- **Dimensions:** 200x200px to 400x400px
- **Format:** SVG (vector) preferred
- **File Size:** Under 100KB each

**AI Generation Prompts:**

**Empty Leaderboard:**
```
Simple illustration, empty medieval tournament hall, no players, Magic: The Gathering style, amber accents, minimalist, 300x300px, vector style
```
**File:** `empty/empty-leaderboard.svg`

**Empty Events:**
```
Simple illustration, empty calendar or event board, medieval fantasy style, amber accents, minimalist, 300x300px, vector style
```
**File:** `empty/empty-events.svg`

**Empty News:**
```
Simple illustration, empty scroll or parchment, medieval fantasy style, amber accents, minimalist, 300x300px, vector style
```
**File:** `empty/empty-news.svg`

---

### 15. Loading State Images
**File Path:** `public/images/loading/[loader-name].svg` or `.gif`

**Usage:**
- Loading spinners (alternative to CSS)
- Page loading states
- Data fetching indicators

**Technical Specifications:**
- **Dimensions:** 64x64px to 128x128px
- **Format:** SVG (animated) or GIF
- **File Size:** Under 50KB

**Note:** Currently using CSS-based LoadingSpinner component, but image-based loaders can be added.

---

### 16. Error State Images
**File Path:** `public/images/error/[error-name].svg` or `.png`

**Usage:**
- 404 error pages
- 500 error pages
- API error states
- Network error states

**Technical Specifications:**
- **Dimensions:** 300x300px to 400x400px
- **Format:** SVG (vector) preferred
- **File Size:** Under 100KB each

**AI Generation Prompts:**

**404 Error:**
```
Medieval fantasy illustration, lost knight or wizard, "404" text subtly integrated, Magic: The Gathering style, amber accents, humorous but appropriate, 400x400px, vector style
```
**File:** `error/404-error.svg`

**500 Error:**
```
Medieval fantasy illustration, broken spell or portal, "500" text subtly integrated, Magic: The Gathering style, amber accents, 400x400px, vector style
```
**File:** `error/500-error.svg`

---

### 17. Character Sheet Backgrounds
**File Path:** `public/images/backgrounds/character-sheet-bg.jpg`

**Usage:**
- Character sheets page background
- D&D-style character progression pages

**Technical Specifications:**
- **Dimensions:** 1920x1080px
- **Format:** JPG
- **File Size:** Under 400KB

**AI Generation Prompt:**
```
Medieval fantasy character sheet background, parchment texture, magical runes, amber and orange accents, suitable for D&D-style character progression, 1920x1080px, dark fantasy atmosphere
```

---

### 18. Tournament Bracket Background
**File Path:** `public/images/backgrounds/bracket-bg.jpg`

**Usage:**
- Tournament bracket page background
- Referenced in `src/app/tournaments/[tournamentId]/bracket/page.tsx`

**Technical Specifications:**
- **Dimensions:** 1920x1080px
- **Format:** JPG
- **File Size:** Under 400KB

**AI Generation Prompt:**
```
Medieval tournament bracket background, tournament tree structure subtly visible, dark fantasy atmosphere, amber lighting, Magic: The Gathering style, 1920x1080px, suitable for bracket overlay
```

---

### 19. Analytics Dashboard Background
**File Path:** `public/images/backgrounds/analytics-bg.jpg`

**Usage:**
- Analytics page background
- Referenced in `src/app/analytics/page.tsx`

**Technical Specifications:**
- **Dimensions:** 1920x1080px
- **Format:** JPG
- **File Size:** Under 400KB

**AI Generation Prompt:**
```
Medieval fantasy data visualization background, magical charts and graphs subtly visible, dark fantasy atmosphere, amber and blue accents, Magic: The Gathering style, 1920x1080px, suitable for analytics overlay
```

---

## 📊 Complete Image Checklist

### Priority 1 (Essential - Launch Required)
- [ ] `medieval-background.jpg` (1920x1080)
- [ ] `og-image.jpg` (1200x630)
- [ ] Favicon set (all sizes: 16x16 to 512x512)
- [ ] `favicon.ico` (16x16, 32x32)
- [ ] `browserconfig.xml` (not an image, but needed)

### Priority 2 (Important - Enhanced UX)
- [ ] `heroes/hero-banner.jpg` (1920x600)
- [ ] `events/event-draft-tournament.jpg` (800x450)
- [ ] `events/event-commander-game.jpg` (800x450)
- [ ] `events/event-tournament-battle.jpg` (800x450)
- [ ] `events/event-sealed-event.jpg` (800x450)
- [ ] `events/event-casual-play.jpg` (800x450)
- [ ] `backgrounds/wizards-bg.jpg` (1920x1080)
- [ ] `backgrounds/background-stone-texture.jpg` (512x512, tileable)
- [ ] `backgrounds/background-parchment-texture.jpg` (512x512, tileable)
- [ ] `icons/logo.png` (200-400px)
- [ ] `icons/logo-dark.png` (200-400px)

### Priority 3 (Enhancement - Nice to Have)
- [ ] `players/default-avatar.png` (300x300)
- [ ] `gallery/tournament-moment-1.jpg` (400x225)
- [ ] `gallery/card-showcase.jpg` (400x225)
- [ ] `gallery/community-gathering.jpg` (400x225)
- [ ] `gallery/memes/tournament-fail-1.jpg` (800x450)
- [ ] `gallery/memes/deck-building-struggle.jpg` (800x450)
- [ ] `gallery/memes/commander-chaos.jpg` (800x450)
- [ ] `cards/creature-example.jpg` (680x480)
- [ ] `cards/spell-example.jpg` (680x480)
- [ ] `cards/land-example.jpg` (680x480)
- [ ] `icons/trophy.svg` (128x128)
- [ ] `empty/empty-leaderboard.svg` (300x300)
- [ ] `empty/empty-events.svg` (300x300)
- [ ] `empty/empty-news.svg` (300x300)
- [ ] `error/404-error.svg` (400x400)
- [ ] `error/500-error.svg` (400x400)
- [ ] `backgrounds/character-sheet-bg.jpg` (1920x1080)
- [ ] `backgrounds/bracket-bg.jpg` (1920x1080)
- [ ] `backgrounds/analytics-bg.jpg` (1920x1080)

---

## 📁 Complete Directory Structure

```
public/images/
├── medieval-background.jpg          # Priority 1
├── og-image.jpg                     # Priority 1
├── favicon.ico                      # Priority 1
├── heroes/
│   └── hero-banner.jpg             # Priority 2
├── events/
│   ├── event-draft-tournament.jpg  # Priority 2
│   ├── event-commander-game.jpg    # Priority 2
│   ├── event-tournament-battle.jpg # Priority 2
│   ├── event-sealed-event.jpg      # Priority 2
│   └── event-casual-play.jpg       # Priority 2
├── backgrounds/
│   ├── wizards-bg.jpg              # Priority 2
│   ├── background-stone-texture.jpg # Priority 2
│   ├── background-parchment-texture.jpg # Priority 2
│   ├── character-sheet-bg.jpg     # Priority 3
│   ├── bracket-bg.jpg              # Priority 3
│   └── analytics-bg.jpg            # Priority 3
├── icons/
│   ├── icon.svg                    # Priority 1 (exists)
│   ├── icon-72x72.svg             # Priority 1 (exists)
│   ├── icon-96x96.svg             # Priority 1 (exists)
│   ├── icon-128x128.svg           # Priority 1 (exists)
│   ├── icon-144x144.svg           # Priority 1 (exists)
│   ├── icon-152x152.svg           # Priority 1 (exists)
│   ├── icon-192x192.svg           # Priority 1 (exists)
│   ├── icon-384x384.svg           # Priority 1 (exists)
│   ├── icon-512x512.svg           # Priority 1 (exists)
│   ├── logo.png                   # Priority 2
│   ├── logo-dark.png              # Priority 2
│   ├── trophy.svg                 # Priority 3
│   └── browserconfig.xml           # Priority 1 (XML file)
├── players/
│   └── default-avatar.png          # Priority 3
├── gallery/
│   ├── tournament-moment-1.jpg     # Priority 3
│   ├── card-showcase.jpg           # Priority 3
│   ├── community-gathering.jpg     # Priority 3
│   └── memes/
│       ├── tournament-fail-1.jpg   # Priority 3
│       ├── deck-building-struggle.jpg # Priority 3
│       └── commander-chaos.jpg    # Priority 3
├── cards/
│   ├── creature-example.jpg        # Priority 3
│   ├── spell-example.jpg           # Priority 3
│   └── land-example.jpg            # Priority 3
├── empty/
│   ├── empty-leaderboard.svg       # Priority 3
│   ├── empty-events.svg            # Priority 3
│   └── empty-news.svg              # Priority 3
├── error/
│   ├── 404-error.svg               # Priority 3
│   └── 500-error.svg               # Priority 3
└── thumbnails/
    └── (auto-generated or manual)
```

---

## 🎨 Style Guide Summary

### Color Palette:
- **Primary Dark:** `rgba(10, 12, 18, 0.85)` - Dark overlay
- **Accent Colors:** Amber (#F59E0B), Orange (#EA580C)
- **Background:** Dark slate/black tones
- **Text Overlay Areas:** Darker regions for readability

### Theme Elements:
- Medieval/fantasy aesthetic
- Magic: The Gathering art style
- Dark, dramatic lighting
- Amber and orange warm accents
- Epic, cinematic compositions
- Professional digital art quality

### Consistency:
- All images should share similar color palette
- Maintain medieval/fantasy theme throughout
- Use consistent lighting style (dramatic, amber-accented)
- Ensure images work well with dark UI theme

---

## 🚀 Quick Start Priority Order

1. **Start with Priority 1:**
   - `medieval-background.jpg` (most important - used everywhere)
   - `og-image.jpg` (for social sharing)
   - Verify/update favicon set
   - Create `browserconfig.xml`

2. **Then Priority 2:**
   - `hero-banner.jpg` (alternative hero)
   - 5 event images
   - Background textures
   - Logo variations

3. **Finally Priority 3:**
   - Player avatars
   - Gallery images (including memes)
   - Card artwork
   - Trophy icons
   - Empty/error states
   - Additional backgrounds

---

## 📝 Implementation Notes

### File Naming Convention:
- Use lowercase letters
- Separate words with hyphens: `event-draft-tournament.jpg`
- Include size in filename if multiple sizes: `icon-192x192.svg`
- Include date for news items: `news-2024-03-update.jpg`
- Be descriptive but concise

### Code Integration:
Images are referenced in code as:
- CSS backgrounds: `url(/images/medieval-background.jpg)`
- Next.js Image: `src="/images/events/event-name.jpg"`
- API/Prisma: `imageUrl: "/images/events/event-name.jpg"`
- Memes: News items with `category: 'Meme'` and `imageUrl` field

### MCP Image Generator:
Use the MCP Image Generator server to generate images:
- Predefined types: `medieval-background`, `og-image`, `hero-banner`, etc.
- Custom images with prompts
- Batch generation for priority images

---

**Last Updated:** 2026-01-27  
**Total Images Required:** ~40+ images across all priorities  
**Status:** Complete comprehensive list ready for generation
