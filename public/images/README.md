# 🎨 Image Assets Guide - MTG Maui League

## 📁 Directory Structure

Place your images in the following directories for optimal organization:

```
public/images/
├── heroes/          # Hero section backgrounds and banners
├── events/          # Event/tournament images
├── players/         # Player avatars and photos
├── cards/           # Magic card artwork and illustrations
├── backgrounds/     # Page backgrounds and textures
├── icons/           # Custom icons and logos
├── gallery/         # Community photos and highlights
└── thumbnails/      # Small preview images
```

## 🖼️ Recommended Image Sizes

### Hero Images

- **Hero Banner**: 1920x600px (16:5 ratio)
- **Background**: 1920x1080px (Full HD)

### Event Cards

- **Event Image**: 800x450px (16:9 ratio)
- **Thumbnail**: 400x225px

### Player Avatars

- **Profile Photo**: 300x300px (Square)
- **Thumbnail**: 100x100px

### Card Artwork

- **Full Card Art**: 680x480px (Magic card ratio)
- **Thumbnail**: 200x150px

### Backgrounds

- **Page Background**: 1920x1080px (or larger for parallax)
- **Texture Overlay**: 512x512px (tileable)

## 🎨 Image Guidelines

### Format Recommendations

- **Photos**: Use JPG format (smaller file size)
- **Logos/Icons**: Use PNG format (transparency support)
- **Illustrations**: Use PNG or WebP (better compression)
- **Animations**: Use GIF or MP4

### Optimization

- Compress images before uploading (use tools like TinyPNG, ImageOptim)
- Keep file sizes under 500KB for web performance
- Use WebP format when possible for better compression

### Naming Convention

- Use lowercase with hyphens: `hero-banner-shadowmoor.jpg`
- Include size in filename: `event-draft-thumb-400x225.jpg`
- Include date for news: `news-2024-03-scoring-update.jpg`

## 📋 Image Checklist

### Priority 1 (Essential)

- [ ] Hero section background/banner
- [ ] Logo (light and dark versions)
- [ ] Favicon (16x16, 32x32, 192x192, 512x512)
- [ ] Default player avatar

### Priority 2 (Important)

- [ ] Event card images (3-5 different events)
- [ ] Background textures/overlays
- [ ] Social media preview image (1200x630px)

### Priority 3 (Nice to Have)

- [ ] Player photos
- [ ] Tournament action shots
- [ ] Magic card artwork
- [ ] Gallery images

## 🔗 Where Images Are Used

### Homepage (`src/app/page.tsx`)

- Hero section: `images/heroes/hero-banner.jpg`
- Event cards: `images/events/[event-id].jpg`
- Stats icons: `images/icons/stats-*.svg`

### Leaderboard (`src/app/leaderboard/page.tsx`)

- Player avatars: `images/players/[player-id].jpg`
- Trophy icons: `images/icons/trophy.svg`

### Events/Bulletin (`src/app/bulletin/page.tsx`)

- Event images: `images/events/[event-id].jpg`
- News thumbnails: `images/gallery/news-*.jpg`

### Wizards Control (`src/app/wizards/page.tsx`)

- Background textures: `images/backgrounds/wizards-bg.jpg`

## 🎯 Quick Start

1. **Add your hero image**:

   ```bash
   # Place in: public/images/heroes/hero-banner.jpg
   ```

2. **Add your logo**:

   ```bash
   # Place in: public/images/icons/logo.png
   # Also create: public/images/icons/logo-dark.png
   ```

3. **Update references**:
   - Search for `mtg-background.jpg` in your code
   - Replace with your new image paths
   - Images will automatically be served from `/images/...`

## 💡 Tips

- Use royalty-free images from Unsplash, Pexels, or create your own
- Consider using MTG card artwork (with proper attribution)
- Maintain consistent style/theme across all images
- Test images on both light and dark backgrounds

## 🚀 Image Component Usage

Once images are added, use them like this:

```tsx
import Image from 'next/image';

<Image
  src="/images/heroes/hero-banner.jpg"
  alt="MTG Maui League Hero"
  width={1920}
  height={600}
  priority
/>;
```
