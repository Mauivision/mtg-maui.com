# 🎨 MCP Image Generator Setup Guide

This guide will help you set up the MCP (Model Context Protocol) server for generating images for the MTG Maui League website.

## 📋 Overview

The MCP Image Generator server provides tools to:
- Generate images using AI (OpenAI DALL-E or Together AI)
- Use predefined image types from `IMAGE_REQUIREMENTS_AND_PROMPTS.md`
- Automatically save images to the correct project directories
- Optimize and resize images automatically

## 🚀 Quick Setup

### Step 1: Install Dependencies

Navigate to the MCP server directory and install:

```powershell
cd mcp-image-generator
npm install
```

Or use the setup script:

```powershell
.\setup.ps1
```

### Step 2: Build the Server

```powershell
npm run build
```

### Step 3: Get an API Key

Choose one of these options:

**Option A: OpenAI DALL-E (Recommended for best quality)**
- Sign up at https://platform.openai.com/
- Create an API key
- Add credits to your account

**Option B: Together AI (More affordable)**
- Sign up at https://together.ai/
- Create an API key
- Often includes free credits

### Step 4: Configure Cursor

The MCP server is already configured in `~/.cursor/mcp.json`, but you need to add your API key:

1. Open `C:\Users\Aaron\.cursor\mcp.json`
2. Find the `mtg-maui-image-generator` section
3. Add your API key to the `env` section:

```json
{
  "mcpServers": {
    "mtg-maui-image-generator": {
      "command": "node",
      "args": [
        "C:/Users/Aaron/All-Cursor-projects/mtg-maui.com/mcp-image-generator/dist/index.js"
      ],
      "env": {
        "OPENAI_API_KEY": "sk-your-actual-api-key-here"
      }
    }
  }
}
```

**For Together AI**, use:
```json
"env": {
  "TOGETHER_API_KEY": "your-together-api-key-here"
}
```

### Step 5: Restart Cursor

Close and restart Cursor completely for the MCP server to load.

## 🎯 Using the MCP Tools

Once set up, you can use the MCP tools directly in Cursor. The tools will appear in the MCP tools list.

### Available Tools

#### 1. `generate_image`
Generate a single image with predefined or custom settings.

**Example: Generate Medieval Background**
```json
{
  "imageType": "medieval-background",
  "promptOption": "option1",
  "model": "dall-e-3"
}
```

**Example: Custom Image**
```json
{
  "prompt": "Medieval fantasy scene with dragons and castles",
  "width": 1920,
  "height": 1080,
  "outputPath": "custom/my-image.jpg"
}
```

#### 2. `list_image_specs`
List all predefined image types and their specifications.

#### 3. `generate_all_priority_images`
Generate all Priority 1 (essential) images at once:
- `medieval-background.jpg`
- `og-image.jpg`

## 📝 Predefined Image Types

All image types from `IMAGE_REQUIREMENTS_AND_PROMPTS.md` are available:

| Image Type | Dimensions | File Path |
|------------|------------|-----------|
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

## 🔧 Troubleshooting

### MCP Server Not Appearing

1. **Check the path in mcp.json** - Ensure it matches your actual project location
2. **Verify the server is built** - Run `npm run build` in `mcp-image-generator/`
3. **Check Cursor logs** - Look for MCP server errors in Cursor's output
4. **Restart Cursor** - Fully close and reopen Cursor

### API Key Issues

1. **Key not set** - Ensure the API key is in `mcp.json` env section
2. **Invalid key** - Verify the key is correct and has credits
3. **Wrong service** - Make sure you're using the right env variable (OPENAI_API_KEY vs TOGETHER_API_KEY)

### Image Generation Fails

1. **Check API credits** - Ensure your account has available credits
2. **Verify model** - DALL-E 3 requires OpenAI API, not Together AI
3. **Check prompts** - Very long prompts may fail, try shorter ones
4. **Rate limits** - Wait a moment if you hit rate limits

### Path Errors

1. **Windows paths** - Use forward slashes in mcp.json: `C:/Users/...`
2. **Relative paths** - The server uses absolute paths, ensure they're correct
3. **Permissions** - Ensure write permissions to `public/images/` directory

## 📚 Additional Resources

- **Image Specifications**: See `IMAGE_REQUIREMENTS_AND_PROMPTS.md` for detailed image requirements
- **MCP Documentation**: https://modelcontextprotocol.io/
- **OpenAI API Docs**: https://platform.openai.com/docs/api-reference/images
- **Together AI Docs**: https://docs.together.ai/

## 💡 Tips

1. **Start with Priority 1 images** - Generate `medieval-background` and `og-image` first
2. **Use predefined types** - They have optimized prompts and dimensions
3. **Test with one image** - Generate a single image first to verify setup
4. **Check file sizes** - Generated images are optimized, but verify they're under limits
5. **Review prompts** - Customize prompts in the code if needed for better results

## 🎉 Next Steps

Once set up:
1. Generate Priority 1 images (medieval-background, og-image)
2. Generate Priority 2 images (hero-banner, event images)
3. Generate Priority 3 images as needed (avatars, gallery images)

All images will be automatically saved to the correct directories in `public/images/`!
