# 🎨 MTG Maui League - Complete Image Requirements & Generation Prompts

## 📋 Document Purpose
This document provides detailed specifications and AI generation prompts for all images needed for the MTG Maui League website. Use these prompts with DALL-E, Midjourney, Stable Diffusion, or similar AI image generators.

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
- All static pages with medieval theme

**Technical Specifications:**
- **Dimensions:** 1920x1080px (Full HD) minimum, 3840x2160px (4K) recommended for high-DPI displays
- **Format:** JPG (optimized, compressed)
- **File Size:** Under 500KB (optimize with TinyPNG or similar)
- **Aspect Ratio:** 16:9
- **Color Profile:** sRGB
- **Background Blend Mode:** Overlay with `rgba(10, 12, 18, 0.85)` dark overlay applied in CSS

**Visual Requirements:**
- Medieval/fantasy theme matching Magic: The Gathering aesthetic
- Dark, dramatic lighting
- Amber/orange/red color tones (to match site's amber accent colors)
- Epic, cinematic composition
- Suitable for text overlay (darker areas for readability)
- No distracting bright spots in center (where text will appear)

**AI Generation Prompts:**

**Option 1 (Castle/Fortress Focus):**
```
Epic medieval castle fortress at twilight, dramatic storm clouds overhead, amber and orange torchlight illuminating stone battlements, dark fantasy atmosphere, cinematic composition, wide angle view, Magic: The Gathering art style, dark dramatic lighting, amber and red color palette, suitable for text overlay, 16:9 aspect ratio, highly detailed, professional digital art
```

**Option 2 (Battlefield/Arena Focus):**
```
Medieval tournament arena battlefield at dusk, knights and warriors in silhouette, dramatic amber and orange firelight, dark fantasy atmosphere, epic cinematic composition, Magic: The Gathering card art style, dark dramatic lighting with amber accents, suitable for hero section background, 16:9 aspect ratio, highly detailed, professional illustration
```

**Option 3 (Mystical/Fantasy Focus):**
```
Mystical medieval fantasy landscape, ancient stone structures, magical amber and orange glowing orbs, dark dramatic sky with storm clouds, epic fantasy atmosphere, Magic: The Gathering art style, cinematic wide shot, dark lighting with warm amber highlights, suitable for website background, 16:9 aspect ratio, highly detailed digital painting
```

**Search Keywords (for stock photos):**
- "medieval castle twilight"
- "fantasy battlefield dusk"
- "medieval fortress storm"
- "dark fantasy landscape"
- "magic the gathering style art"

---

### 2. Open Graph / Social Media Preview Image
**File Path:** `public/images/og-image.jpg`

**Usage:**
- Facebook/LinkedIn link previews
- Twitter/X card previews
- Discord/Slack link embeds
- SEO metadata image

**Technical Specifications:**
- **Dimensions:** 1200x630px (Facebook/LinkedIn standard)
- **Format:** JPG
- **File Size:** Under 300KB
- **Aspect Ratio:** 1.91:1
- **Safe Zone:** Keep important content within 1200x630px (text should be readable at small sizes)

**Visual Requirements:**
- Must include "MTG Maui League" branding/text
- Magic: The Gathering theme
- Medieval/fantasy aesthetic
- Readable at thumbnail size (120x63px)
- High contrast for text readability

**AI Generation Prompts:**

**Option 1 (Logo + Background):**
```
Medieval fantasy banner design, "MTG Maui League" text prominently displayed, Magic: The Gathering card art style, dark background with amber and orange accents, epic fantasy typography, professional logo design, 1200x630px, suitable for social media preview, high contrast, readable text
```

**Option 2 (Card Art Style):**
```
Magic: The Gathering style card art, medieval fantasy scene, "MTG Maui League" text overlay, dark dramatic atmosphere, amber and orange color accents, epic composition, 1200x630px social media preview format, professional digital art, high contrast for text readability
```

**Note:** You may need to add text overlay in post-processing using design software.

---

### 3. Favicon Set (Multiple Sizes)
**File Path:** `public/images/icons/icon-[size].svg` (already exists, but may need updates)

**Current Files:**
- `icon-72x72.svg`
- `icon-96x96.svg`
- `icon-128x128.svg`
- `icon-144x144.svg`
- `icon-152x152.svg`
- `icon-192x192.svg`
- `icon-384x384.svg`
- `icon-512x512.svg`
- `icon.svg` (base icon)

**Usage:**
- Browser favicon
- PWA app icons
- Mobile home screen icons
- Bookmark icons

**Technical Specifications:**
- **Format:** SVG (vector) preferred, PNG fallback
- **Sizes:** 16x16, 32x32, 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512
- **Background:** Transparent or solid color
- **Style:** Simple, recognizable at small sizes

**Visual Requirements:**
- Magic: The Gathering themed icon
- Medieval/fantasy elements
- Simple enough to be recognizable at 16x16px
- High contrast
- Works on both light and dark backgrounds

**AI Generation Prompts:**

**Option 1 (Shield/Emblem):**
```
Simple medieval shield emblem icon, Magic: The Gathering style, amber and orange colors, minimalist design, suitable for favicon, vector style, high contrast, recognizable at small sizes, fantasy heraldry, clean lines
```

**Option 2 (Mana Symbol Style):**
```
Magic: The Gathering mana symbol inspired icon, medieval fantasy design, amber and orange color palette, minimalist vector style, suitable for favicon, high contrast, simple geometric shapes, recognizable at 16x16px
```

**Option 3 (Castle Silhouette):**
```
Simple castle silhouette icon, medieval fantasy style, amber accent color, minimalist design, suitable for favicon, vector style, high contrast, recognizable at small sizes, clean geometric shapes
```

---

## 🎯 Priority 2: Important Images (Enhance User Experience)

### 4. Hero Section Banner (Alternative/Additional)
**File Path:** `public/images/heroes/hero-banner.jpg`

**Usage:**
- Alternative hero section image
- Can be used in page content configuration
- Homepage hero variations

**Technical Specifications:**
- **Dimensions:** 1920x600px (16:5 ratio)
- **Format:** JPG
- **File Size:** Under 400KB
- **Aspect Ratio:** 16:5 (wider than standard background)

**Visual Requirements:**
- Horizontal banner format
- Text overlay area in center
- Medieval/fantasy theme
- Amber/orange color accents
- Epic, cinematic feel

**AI Generation Prompts:**

**Option 1:**
```
Epic medieval fantasy banner, wide horizontal format 1920x600px, Magic: The Gathering art style, dark dramatic atmosphere, amber and orange torchlight, castle battlements in background, cinematic composition, suitable for hero section with text overlay, highly detailed digital art
```

**Option 2:**
```
Medieval tournament arena banner, wide horizontal view, knights and warriors, dramatic amber lighting, dark fantasy atmosphere, Magic: The Gathering style, 1920x600px format, epic cinematic composition, suitable for website hero section
```

---

### 5. Event/Tournament Images (3-5 Different Events)
**File Path:** `public/images/events/[event-name].jpg`

**Usage:**
- Event cards on homepage
- Event detail pages
- Bulletin/news section
- Tournament listings

**Technical Specifications:**
- **Dimensions:** 800x450px (16:9 ratio)
- **Format:** JPG
- **File Size:** Under 200KB each
- **Aspect Ratio:** 16:9
- **Quantity:** 3-5 different event images

**Visual Requirements:**
- Each image should represent different event types:
  - Draft tournament
  - Commander game
  - Standard tournament
  - Sealed event
  - Casual play
- Medieval/fantasy theme
- Action or gathering scenes
- Magic: The Gathering aesthetic

**AI Generation Prompts:**

**Event 1 - Draft Tournament:**
```
Medieval tournament scene, players gathered around tables with Magic: The Gathering cards, draft format, dramatic amber lighting, dark fantasy atmosphere, Magic: The Gathering art style, 800x450px, epic composition, highly detailed digital art
```

**Event 2 - Commander Game:**
```
Epic Commander multiplayer game scene, medieval fantasy setting, players around circular table, dramatic cards and tokens, amber and orange magical glow, dark fantasy atmosphere, Magic: The Gathering style, 800x450px, cinematic composition
```

**Event 3 - Tournament Battle:**
```
Medieval tournament battle scene, two players facing off, dramatic Magic: The Gathering cards in play, epic fantasy atmosphere, amber torchlight, dark dramatic lighting, Magic: The Gathering art style, 800x450px, highly detailed
```

**Event 4 - Sealed Event:**
```
Medieval gathering scene, players opening Magic: The Gathering booster packs, sealed format event, dark fantasy atmosphere, amber lighting, Magic: The Gathering style, 800x450px, epic composition
```

**Event 5 - Casual Play:**
```
Medieval tavern scene, players enjoying casual Magic: The Gathering games, warm amber lighting, friendly atmosphere, dark fantasy setting, Magic: The Gathering art style, 800x450px, detailed digital art
```

**Naming Convention:**
- `event-draft-tournament.jpg`
- `event-commander-game.jpg`
- `event-tournament-battle.jpg`
- `event-sealed-event.jpg`
- `event-casual-play.jpg`

---

### 6. Background Textures/Overlays
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

**Visual Requirements:**
- Subtle textures that don't compete with content
- Medieval/fantasy patterns
- Stone, parchment, or fabric textures
- Dark tones with amber accents

**AI Generation Prompts:**

**Texture 1 - Stone Wall:**
```
Medieval stone wall texture, dark aged stone, subtle amber highlights, seamless tileable pattern, dark fantasy atmosphere, 512x512px, suitable for background overlay, subtle and non-distracting
```

**Texture 2 - Parchment:**
```
Aged medieval parchment texture, dark weathered paper, subtle amber stains, seamless tileable, dark fantasy aesthetic, 512x512px, suitable for background overlay, subtle texture
```

**Texture 3 - Wizards Background:**
```
Mystical medieval wizard's study background, dark stone walls, magical amber glowing runes, books and scrolls, dark fantasy atmosphere, 1920x1080px, suitable for admin panel background, highly detailed
```

**Naming Convention:**
- `background-stone-texture.jpg`
- `background-parchment-texture.jpg`
- `backgrounds/wizards-bg.jpg`

---

## 🎯 Priority 3: Nice to Have Images (Enhancement)

### 7. Player Avatar Placeholder
**File Path:** `public/images/players/default-avatar.jpg` or `default-avatar.png`

**Usage:**
- Default player profile picture
- Fallback when player hasn't uploaded avatar
- Leaderboard default image

**Technical Specifications:**
- **Dimensions:** 300x300px (square)
- **Format:** PNG (with transparency) or JPG
- **File Size:** Under 100KB
- **Aspect Ratio:** 1:1 (square)

**Visual Requirements:**
- Generic medieval/fantasy character silhouette
- Magic: The Gathering theme
- Works on various background colors
- Simple, recognizable

**AI Generation Prompts:**

**Option 1:**
```
Medieval fantasy warrior silhouette, Magic: The Gathering style, amber and orange accents, simple design, suitable for avatar placeholder, 300x300px square format, high contrast, works on any background
```

**Option 2:**
```
Magic: The Gathering mana symbol or card back design, medieval fantasy style, amber colors, simple icon design, suitable for default player avatar, 300x300px square, high contrast
```

---

### 8. Gallery/News Thumbnails
**File Path:** `public/images/gallery/[news-item].jpg`

**Usage:**
- News article thumbnails
- Gallery images
- Community highlights
- Bulletin images

**Technical Specifications:**
- **Dimensions:** 400x225px (16:9 ratio, thumbnail size)
- **Format:** JPG
- **File Size:** Under 150KB each
- **Aspect Ratio:** 16:9
- **Quantity:** 5-10 images for variety

**Visual Requirements:**
- Various Magic: The Gathering related scenes
- Tournament moments
- Community gatherings
- Card art highlights
- Medieval/fantasy theme

**AI Generation Prompts:**

**Gallery Image 1:**
```
Magic: The Gathering tournament moment, players celebrating, medieval fantasy setting, amber lighting, dark atmosphere, 400x225px thumbnail, epic composition
```

**Gallery Image 2:**
```
Medieval fantasy card art showcase, Magic: The Gathering cards displayed, dramatic amber lighting, dark fantasy atmosphere, 400x225px, highly detailed
```

**Gallery Image 3:**
```
Medieval tournament hall, players gathered, Magic: The Gathering event, warm amber lighting, community atmosphere, 400x225px thumbnail format
```

**Naming Convention:**
- `gallery-tournament-moment-1.jpg`
- `gallery-card-showcase.jpg`
- `gallery-community-gathering.jpg`
- `news-2024-03-update.jpg` (with dates for news items)

---

### 9. Magic Card Artwork (Optional)
**File Path:** `public/images/cards/[card-name].jpg`

**Usage:**
- Card art displays
- Deck builder visuals
- Card showcases
- Educational content

**Technical Specifications:**
- **Dimensions:** 680x480px (Magic card art ratio)
- **Format:** JPG
- **File Size:** Under 250KB each
- **Aspect Ratio:** ~1.42:1 (Magic card art ratio)

**Visual Requirements:**
- High-quality Magic: The Gathering card artwork
- Various card types (creatures, spells, lands)
- Medieval/fantasy theme preferred
- Epic, detailed illustrations

**Note:** Use official Magic: The Gathering card art with proper attribution, or create original fantasy artwork in similar style.

**AI Generation Prompts:**

**Card Art 1 - Creature:**
```
Epic medieval fantasy creature, Magic: The Gathering card art style, dragon or knight, dramatic lighting, amber and orange accents, highly detailed digital painting, 680x480px, professional illustration
```

**Card Art 2 - Spell:**
```
Mystical magical spell effect, medieval fantasy, Magic: The Gathering style, amber and orange magical energy, dark dramatic atmosphere, 680x480px, highly detailed digital art
```

**Card Art 3 - Land:**
```
Medieval fantasy landscape, Magic: The Gathering land card style, castle or battlefield, dramatic sky, amber lighting, 680x480px, epic composition
```

---

### 10. Trophy/Achievement Icons
**File Path:** `public/images/icons/trophy.svg` or `trophy.png`

**Usage:**
- Leaderboard rankings
- Achievement displays
- Award indicators
- Stats icons

**Technical Specifications:**
- **Dimensions:** 64x64px to 128x128px
- **Format:** SVG (vector) preferred, PNG fallback
- **File Size:** Under 50KB
- **Style:** Icon/symbol style

**Visual Requirements:**
- Medieval/fantasy trophy or award design
- Magic: The Gathering theme
- Amber/orange color accents
- Simple, recognizable icon

**AI Generation Prompts:**

**Trophy Icon:**
```
Medieval fantasy trophy icon, Magic: The Gathering style, amber and orange colors, simple icon design, suitable for leaderboard, vector style, high contrast, 128x128px, clean lines
```

**Achievement Badge:**
```
Medieval achievement badge icon, shield or medal design, Magic: The Gathering style, amber accents, simple icon, suitable for achievements, vector style, 128x128px
```

---

## 📐 Image Optimization Checklist

### Before Uploading:
- [ ] Compress images (use TinyPNG, ImageOptim, or similar)
- [ ] Verify dimensions match specifications
- [ ] Check file sizes are under limits
- [ ] Test images on both light and dark backgrounds (where applicable)
- [ ] Verify aspect ratios are correct
- [ ] Ensure color profiles are sRGB
- [ ] Test image loading speed

### Optimization Tools:
- **TinyPNG** (https://tinypng.com/) - JPG/PNG compression
- **Squoosh** (https://squoosh.app/) - Advanced image optimization
- **ImageOptim** (Mac) - Batch optimization
- **GIMP/Photoshop** - Manual optimization and editing

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

## 📝 Implementation Notes

### File Naming Convention:
- Use lowercase letters
- Separate words with hyphens: `event-draft-tournament.jpg`
- Include size in filename if multiple sizes: `icon-192x192.svg`
- Include date for news items: `news-2024-03-update.jpg`
- Be descriptive but concise

### Directory Structure:
```
public/images/
├── medieval-background.jpg (Priority 1)
├── og-image.jpg (Priority 1)
├── heroes/
│   └── hero-banner.jpg (Priority 2)
├── events/
│   ├── event-draft-tournament.jpg (Priority 2)
│   ├── event-commander-game.jpg (Priority 2)
│   └── ... (3-5 total)
├── backgrounds/
│   ├── wizards-bg.jpg (Priority 2)
│   └── ... (textures)
├── icons/
│   ├── icon-*.svg (Priority 1 - already exists)
│   └── trophy.svg (Priority 3)
├── players/
│   └── default-avatar.jpg (Priority 3)
├── gallery/
│   └── ... (Priority 3)
└── cards/
    └── ... (Priority 3)
```

### Code Integration:
Images are referenced in code as:
- CSS backgrounds: `url(/images/medieval-background.jpg)`
- Next.js Image: `src="/images/events/event-name.jpg"`
- API/Prisma: `imageUrl: "/images/events/event-name.jpg"`

---

## 🚀 Quick Start Priority Order

1. **Start with Priority 1:**
   - `medieval-background.jpg` (most important - used everywhere)
   - `og-image.jpg` (for social sharing)
   - Verify favicon set exists and is appropriate

2. **Then Priority 2:**
   - `hero-banner.jpg` (alternative hero)
   - 3-5 event images
   - Background textures

3. **Finally Priority 3:**
   - Player avatars
   - Gallery images
   - Card artwork
   - Trophy icons

---

## 💡 Additional Tips

### AI Image Generation Best Practices:
1. **Iterate on prompts** - Refine based on results
2. **Use negative prompts** - Exclude unwanted elements
3. **Specify art style** - "Magic: The Gathering art style" is key
4. **Request specific lighting** - "dramatic amber lighting"
5. **Mention composition** - "suitable for text overlay"
6. **Specify dimensions** - Include in prompt for better results

### Stock Photo Alternatives:
If AI generation doesn't work, consider:
- **Unsplash** - Free high-quality photos (search: "medieval", "fantasy", "castle")
- **Pexels** - Free stock photos
- **Pixabay** - Free images
- **ArtStation** - Professional fantasy art (check licensing)

### Legal Considerations:
- Ensure proper licensing for all images
- Attribute Magic: The Gathering if using official art
- Use royalty-free or create original content
- Check usage rights before commercial use

---

**Last Updated:** 2026-01-27  
**Status:** Ready for image generation and implementation

---

## 📋 See Also

For a **complete and comprehensive** list of ALL images needed (including newly discovered requirements), see:
- **`COMPLETE_IMAGE_REQUIREMENTS.md`** - Full list with all categories, empty states, error states, memes, and more

The complete requirements document includes:
- All Priority 1, 2, and 3 images
- Meme images (newly added feature)
- Empty state images
- Error state images (404, 500)
- Loading state images
- Character sheet backgrounds
- Tournament bracket backgrounds
- Analytics dashboard backgrounds
- Complete directory structure
- Full checklist with ~40+ images
