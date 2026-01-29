# 🎨 MCP Image Generator - Setup Complete

## ✅ What Was Created

A complete MCP (Model Context Protocol) server for generating images for your MTG Maui League website.

### 📁 Files Created

```
mcp-image-generator/
├── src/
│   └── index.ts              # Main MCP server implementation
├── package.json              # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── .gitignore               # Git ignore rules
├── README.md                # Detailed documentation
├── QUICK_START.md           # Quick reference
├── setup.ps1                # Windows setup script
└── setup.sh                 # Linux/Mac setup script
```

### 📄 Documentation

- **MCP_SETUP_GUIDE.md** - Complete setup and usage guide
- **mcp-image-generator/README.md** - Technical documentation
- **mcp-image-generator/QUICK_START.md** - Quick reference

### ⚙️ Configuration

- **~/.cursor/mcp.json** - Updated with MCP server configuration (needs API key)

## 🚀 Next Steps

### 1. Install Dependencies

```powershell
cd mcp-image-generator
npm install
npm run build
```

Or use the setup script:
```powershell
.\setup.ps1
```

### 2. Get an API Key

**Option A: OpenAI DALL-E** (Recommended)
- Sign up: https://platform.openai.com/
- Create API key
- Add credits

**Option B: Together AI** (More affordable)
- Sign up: https://together.ai/
- Create API key

### 3. Add API Key to Configuration

Edit `C:\Users\Aaron\.cursor\mcp.json`:

```json
{
  "mcpServers": {
    "mtg-maui-image-generator": {
      "env": {
        "OPENAI_API_KEY": "sk-your-actual-key-here"
      }
    }
  }
}
```

### 4. Restart Cursor

Fully close and restart Cursor to load the MCP server.

## 🎯 How to Use

Once set up, the MCP tools will be available in Cursor. You can:

1. **Generate predefined images** using image types from `IMAGE_REQUIREMENTS_AND_PROMPTS.md`
2. **Generate custom images** with your own prompts
3. **Batch generate** all Priority 1 images at once

### Example: Generate Medieval Background

Use the `generate_image` tool with:
```json
{
  "imageType": "medieval-background",
  "promptOption": "option1",
  "model": "dall-e-3"
}
```

## 📋 Available Image Types

All image types from `IMAGE_REQUIREMENTS_AND_PROMPTS.md` are available:

| Type | Dimensions | Path |
|------|------------|------|
| `medieval-background` | 1920x1080 | `medieval-background.jpg` |
| `og-image` | 1200x630 | `og-image.jpg` |
| `hero-banner` | 1920x600 | `heroes/hero-banner.jpg` |
| `event-draft` | 800x450 | `events/event-draft-tournament.jpg` |
| `event-commander` | 800x450 | `events/event-commander-game.jpg` |
| `event-tournament` | 800x450 | `events/event-tournament-battle.jpg` |
| `event-sealed` | 800x450 | `events/event-sealed-event.jpg` |
| `event-casual` | 800x450 | `events/event-casual-play.jpg` |
| `default-avatar` | 300x300 | `players/default-avatar.png` |
| `wizards-bg` | 1920x1080 | `backgrounds/wizards-bg.jpg` |

## 🔧 Features

- ✅ **Predefined prompts** - All prompts from IMAGE_REQUIREMENTS_AND_PROMPTS.md
- ✅ **Automatic optimization** - Images are resized and optimized automatically
- ✅ **Correct file paths** - Images saved to correct directories automatically
- ✅ **Multiple models** - Supports DALL-E 2, DALL-E 3, and Together AI
- ✅ **Batch generation** - Generate all priority images at once
- ✅ **Custom images** - Generate images with custom prompts

## 📚 Documentation

- **Full Setup Guide**: `MCP_SETUP_GUIDE.md`
- **Quick Start**: `mcp-image-generator/QUICK_START.md`
- **Technical Docs**: `mcp-image-generator/README.md`
- **Image Specs**: `IMAGE_REQUIREMENTS_AND_PROMPTS.md`

## 💡 Tips

1. Start with Priority 1 images (`medieval-background` and `og-image`)
2. Use predefined types for best results (they have optimized prompts)
3. Test with one image first to verify setup
4. Check API credits before batch generation
5. Images are automatically optimized to meet file size requirements

## 🎉 Ready to Generate!

Once you've:
1. ✅ Installed dependencies (`npm install`)
2. ✅ Built the server (`npm run build`)
3. ✅ Added your API key to `mcp.json`
4. ✅ Restarted Cursor

You can start generating images directly from Cursor using the MCP tools!

---

**Need help?** See `MCP_SETUP_GUIDE.md` for detailed troubleshooting and examples.
