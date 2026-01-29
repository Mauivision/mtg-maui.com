# ⚡ Quick Start - MCP Image Generator

## 🚀 Setup in 3 Steps

### 1. Install & Build
```powershell
cd mcp-image-generator
npm install
npm run build
```

### 2. Add API Key to `~/.cursor/mcp.json`
```json
{
  "mcpServers": {
    "mtg-maui-image-generator": {
      "env": {
        "OPENAI_API_KEY": "sk-your-key-here"
      }
    }
  }
}
```

### 3. Restart Cursor

## 🎯 Generate Your First Image

Use the MCP tool `generate_image` with:

```json
{
  "imageType": "medieval-background",
  "promptOption": "option1"
}
```

## 📋 Priority Images Checklist

- [ ] `medieval-background` (Priority 1)
- [ ] `og-image` (Priority 1)
- [ ] `hero-banner` (Priority 2)
- [ ] Event images (Priority 2)
- [ ] Other images as needed (Priority 3)

## 🔗 Full Documentation

See `MCP_SETUP_GUIDE.md` in project root for complete instructions.
