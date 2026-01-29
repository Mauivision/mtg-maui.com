# MTG Maui Image Generator MCP Server

MCP (Model Context Protocol) server for generating images for the MTG Maui League website using AI image generation APIs.

## Features

- Generate images using OpenAI DALL-E or Together AI
- Predefined image types with specifications from `IMAGE_REQUIREMENTS_AND_PROMPTS.md`
- Automatic image optimization and resizing
- Saves images directly to the correct project directories
- Batch generation of priority images

## Setup

### 1. Install Dependencies

```bash
cd mcp-image-generator
npm install
```

### 2. Build the Server

```bash
npm run build
```

### 3. Set API Key

Choose one:

**Option A: OpenAI DALL-E (Recommended)**
```bash
export OPENAI_API_KEY="your-openai-api-key"
```

**Option B: Together AI**
```bash
export TOGETHER_API_KEY="your-together-api-key"
```

### 4. Configure Cursor

Add to your `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "mtg-maui-image-generator": {
      "command": "node",
      "args": [
        "C:/Users/Aaron/All-Cursor-projects/mtg-maui.com/mcp-image-generator/dist/index.js"
      ],
      "env": {
        "OPENAI_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

**Note:** Update the path to match your project location.

### 5. Restart Cursor

Restart Cursor for the MCP server to be available.

## Usage

### Available Tools

1. **generate_image** - Generate a single image
   - Use predefined image types (e.g., `medieval-background`, `og-image`)
   - Or provide custom prompt, width, height

2. **list_image_specs** - List all predefined image specifications

3. **generate_all_priority_images** - Generate all Priority 1 images at once

### Example: Generate Medieval Background

```json
{
  "imageType": "medieval-background",
  "promptOption": "option1",
  "model": "dall-e-3"
}
```

### Example: Custom Image

```json
{
  "prompt": "Medieval fantasy scene with dragons",
  "width": 1920,
  "height": 1080,
  "outputPath": "custom/dragon-scene.jpg"
}
```

## Predefined Image Types

- `medieval-background` - Main background (1920x1080)
- `og-image` - Social media preview (1200x630)
- `hero-banner` - Hero section banner (1920x600)
- `event-draft` - Draft tournament image (800x450)
- `event-commander` - Commander game image (800x450)
- `event-tournament` - Tournament battle image (800x450)
- `event-sealed` - Sealed event image (800x450)
- `event-casual` - Casual play image (800x450)
- `default-avatar` - Player avatar placeholder (300x300)
- `wizards-bg` - Wizards control panel background (1920x1080)

## Image Specifications

All image specifications are defined in `IMAGE_REQUIREMENTS_AND_PROMPTS.md` in the project root.

## Development

### Watch Mode

```bash
npm run dev
```

### Test with MCP Inspector

```bash
npm run inspector
```

### Build

```bash
npm run build
```

## Troubleshooting

1. **API Key Not Found**: Ensure `OPENAI_API_KEY` or `TOGETHER_API_KEY` is set in environment or mcp.json
2. **Path Errors**: Verify the path in mcp.json matches your project location
3. **Image Generation Fails**: Check API key validity and account credits
4. **Permission Errors**: Ensure write permissions to `public/images/` directory

## Notes

- Images are automatically optimized using Sharp
- JPEG quality is set to 85% for good balance of quality and file size
- Images are resized to exact specifications
- Generated images are saved to `public/images/` with correct directory structure
