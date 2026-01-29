#!/bin/bash

# Setup script for MTG Maui Image Generator MCP Server
# Run this script to install dependencies and build the server

echo "🎨 Setting up MTG Maui Image Generator MCP Server..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Build the server
echo ""
echo "🔨 Building MCP server..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Failed to build server"
    exit 1
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Add your API key to ~/.cursor/mcp.json in the env section"
echo "   - For OpenAI: Set OPENAI_API_KEY"
echo "   - For Together AI: Set TOGETHER_API_KEY"
echo "2. Restart Cursor to load the MCP server"
echo "3. Use the MCP tools to generate images!"
echo ""
echo "💡 See README.md for usage examples"
