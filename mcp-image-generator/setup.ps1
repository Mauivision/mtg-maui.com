# Setup script for MTG Maui Image Generator MCP Server
# Run this script to install dependencies and build the server

Write-Host "🎨 Setting up MTG Maui Image Generator MCP Server..." -ForegroundColor Cyan

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Node.js found: $(node --version)" -ForegroundColor Green

# Install dependencies
Write-Host "`n📦 Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Build the server
Write-Host "`n🔨 Building MCP server..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to build server" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Setup complete!" -ForegroundColor Green
Write-Host "`n📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. Add your API key to ~/.cursor/mcp.json in the env section" -ForegroundColor White
Write-Host "   - For OpenAI: Set OPENAI_API_KEY" -ForegroundColor Gray
Write-Host "   - For Together AI: Set TOGETHER_API_KEY" -ForegroundColor Gray
Write-Host "2. Restart Cursor to load the MCP server" -ForegroundColor White
Write-Host "3. Use the MCP tools to generate images!" -ForegroundColor White
Write-Host "`n💡 See README.md for usage examples" -ForegroundColor Yellow
