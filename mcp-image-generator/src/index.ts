#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import OpenAI from 'openai';
import axios from 'axios';
import * as fs from 'fs/promises';
import * as path from 'path';
import sharp from 'sharp';

// Get project root (parent directory of mcp-image-generator)
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const IMAGES_DIR = path.join(PROJECT_ROOT, 'public', 'images');

// Initialize OpenAI client (supports both OpenAI and Together AI)
const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY || process.env.TOGETHER_API_KEY;
  const baseURL = process.env.TOGETHER_API_KEY
    ? 'https://api.together.xyz/v1'
    : undefined;

  if (!apiKey) {
    throw new Error(
      'API key required. Set OPENAI_API_KEY or TOGETHER_API_KEY environment variable.'
    );
  }

  return new OpenAI({
    apiKey,
    baseURL,
  });
};

// Image specifications from COMPLETE_IMAGE_REQUIREMENTS.md
const IMAGE_SPECS = {
  'medieval-background': {
    path: 'medieval-background.jpg',
    width: 1920,
    height: 1080,
    format: 'jpeg',
    category: 'background',
  },
  'og-image': {
    path: 'og-image.jpg',
    width: 1200,
    height: 630,
    format: 'jpeg',
    category: 'social',
  },
  'hero-banner': {
    path: 'heroes/hero-banner.jpg',
    width: 1920,
    height: 600,
    format: 'jpeg',
    category: 'hero',
  },
  'event-draft': {
    path: 'events/event-draft-tournament.jpg',
    width: 800,
    height: 450,
    format: 'jpeg',
    category: 'event',
  },
  'event-commander': {
    path: 'events/event-commander-game.jpg',
    width: 800,
    height: 450,
    format: 'jpeg',
    category: 'event',
  },
  'event-tournament': {
    path: 'events/event-tournament-battle.jpg',
    width: 800,
    height: 450,
    format: 'jpeg',
    category: 'event',
  },
  'event-sealed': {
    path: 'events/event-sealed-event.jpg',
    width: 800,
    height: 450,
    format: 'jpeg',
    category: 'event',
  },
  'event-casual': {
    path: 'events/event-casual-play.jpg',
    width: 800,
    height: 450,
    format: 'jpeg',
    category: 'event',
  },
  'default-avatar': {
    path: 'players/default-avatar.png',
    width: 300,
    height: 300,
    format: 'png',
    category: 'player',
  },
  'wizards-bg': {
    path: 'backgrounds/wizards-bg.jpg',
    width: 1920,
    height: 1080,
    format: 'jpeg',
    category: 'background',
  },
  'stone-texture': {
    path: 'backgrounds/background-stone-texture.jpg',
    width: 512,
    height: 512,
    format: 'jpeg',
    category: 'texture',
  },
  'parchment-texture': {
    path: 'backgrounds/background-parchment-texture.jpg',
    width: 512,
    height: 512,
    format: 'jpeg',
    category: 'texture',
  },
  'character-sheet-bg': {
    path: 'backgrounds/character-sheet-bg.jpg',
    width: 1920,
    height: 1080,
    format: 'jpeg',
    category: 'background',
  },
  'bracket-bg': {
    path: 'backgrounds/bracket-bg.jpg',
    width: 1920,
    height: 1080,
    format: 'jpeg',
    category: 'background',
  },
  'analytics-bg': {
    path: 'backgrounds/analytics-bg.jpg',
    width: 1920,
    height: 1080,
    format: 'jpeg',
    category: 'background',
  },
  'meme-tournament-fail': {
    path: 'gallery/memes/tournament-fail-1.jpg',
    width: 800,
    height: 450,
    format: 'jpeg',
    category: 'meme',
  },
  'meme-deck-building': {
    path: 'gallery/memes/deck-building-struggle.jpg',
    width: 800,
    height: 450,
    format: 'jpeg',
    category: 'meme',
  },
  'meme-commander-chaos': {
    path: 'gallery/memes/commander-chaos.jpg',
    width: 800,
    height: 450,
    format: 'jpeg',
    category: 'meme',
  },
};

// Predefined prompts from IMAGE_REQUIREMENTS_AND_PROMPTS.md
const PREDEFINED_PROMPTS = {
  'medieval-background': {
    option1:
      'Epic medieval castle fortress at twilight, dramatic storm clouds overhead, amber and orange torchlight illuminating stone battlements, dark fantasy atmosphere, cinematic composition, wide angle view, Magic: The Gathering art style, dark dramatic lighting, amber and red color palette, suitable for text overlay, 16:9 aspect ratio, highly detailed, professional digital art',
    option2:
      'Medieval tournament arena battlefield at dusk, knights and warriors in silhouette, dramatic amber and orange firelight, dark fantasy atmosphere, epic cinematic composition, Magic: The Gathering card art style, dark dramatic lighting with amber accents, suitable for hero section background, 16:9 aspect ratio, highly detailed, professional illustration',
    option3:
      'Mystical medieval fantasy landscape, ancient stone structures, magical amber and orange glowing orbs, dark dramatic sky with storm clouds, epic fantasy atmosphere, Magic: The Gathering art style, cinematic wide shot, dark lighting with warm amber highlights, suitable for website background, 16:9 aspect ratio, highly detailed digital painting',
  },
  'og-image': {
    option1:
      'Medieval fantasy banner design, "MTG Maui League" text prominently displayed, Magic: The Gathering card art style, dark background with amber and orange accents, epic fantasy typography, professional logo design, 1200x630px, suitable for social media preview, high contrast, readable text',
    option2:
      'Magic: The Gathering style card art, medieval fantasy scene, "MTG Maui League" text overlay, dark dramatic atmosphere, amber and orange color accents, epic composition, 1200x630px social media preview format, professional digital art, high contrast for text readability',
  },
  'hero-banner':
    'Epic medieval fantasy banner, wide horizontal format 1920x600px, Magic: The Gathering art style, dark dramatic atmosphere, amber and orange torchlight, castle battlements in background, cinematic composition, suitable for hero section with text overlay, highly detailed digital art',
  'event-draft':
    'Medieval tournament scene, players gathered around tables with Magic: The Gathering cards, draft format, dramatic amber lighting, dark fantasy atmosphere, Magic: The Gathering art style, 800x450px, epic composition, highly detailed digital art',
  'event-commander':
    'Epic Commander multiplayer game scene, medieval fantasy setting, players around circular table, dramatic cards and tokens, amber and orange magical glow, dark fantasy atmosphere, Magic: The Gathering style, 800x450px, cinematic composition',
  'event-tournament':
    'Medieval tournament battle scene, two players facing off, dramatic Magic: The Gathering cards in play, epic fantasy atmosphere, amber torchlight, dark dramatic lighting, Magic: The Gathering art style, 800x450px, highly detailed',
  'event-sealed':
    'Medieval gathering scene, players opening Magic: The Gathering booster packs, sealed format event, dark fantasy atmosphere, amber lighting, Magic: The Gathering style, 800x450px, epic composition',
  'event-casual':
    'Medieval tavern scene, players enjoying casual Magic: The Gathering games, warm amber lighting, friendly atmosphere, dark fantasy setting, Magic: The Gathering art style, 800x450px, detailed digital art',
  'default-avatar':
    'Medieval fantasy warrior silhouette, Magic: The Gathering style, amber and orange accents, simple design, suitable for avatar placeholder, 300x300px square format, high contrast, works on any background',
  'wizards-bg':
    'Mystical medieval wizard\'s study background, dark stone walls, magical amber glowing runes, books and scrolls, dark fantasy atmosphere, 1920x1080px, suitable for admin panel background, highly detailed',
  'stone-texture':
    'Medieval stone wall texture, dark aged stone, subtle amber highlights, seamless tileable pattern, dark fantasy atmosphere, 512x512px, suitable for background overlay, subtle and non-distracting',
  'parchment-texture':
    'Aged medieval parchment texture, dark weathered paper, subtle amber stains, seamless tileable, dark fantasy aesthetic, 512x512px, suitable for background overlay, subtle texture',
  'character-sheet-bg':
    'Medieval fantasy character sheet background, parchment texture, magical runes, amber and orange accents, suitable for D&D-style character progression, 1920x1080px, dark fantasy atmosphere',
  'bracket-bg':
    'Medieval tournament bracket background, tournament tree structure subtly visible, dark fantasy atmosphere, amber lighting, Magic: The Gathering style, 1920x1080px, suitable for bracket overlay',
  'analytics-bg':
    'Medieval fantasy data visualization background, magical charts and graphs subtly visible, dark fantasy atmosphere, amber and blue accents, Magic: The Gathering style, 1920x1080px, suitable for analytics overlay',
  'meme-tournament-fail':
    'Funny Magic: The Gathering tournament moment, player with shocked expression, cards scattered, medieval fantasy setting, humorous atmosphere, 800x450px, meme style, dark fantasy aesthetic',
  'meme-deck-building':
    'Humorous scene of player struggling with deck building, too many cards, medieval fantasy setting, comedic Magic: The Gathering moment, 800x450px, meme style',
  'meme-commander-chaos':
    'Funny Commander game moment, four players with dramatic expressions, cards everywhere, chaotic medieval fantasy scene, humorous, 800x450px, meme style',
};

async function downloadImage(url: string): Promise<Buffer> {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  return Buffer.from(response.data);
}

async function saveImage(
  imageBuffer: Buffer,
  filePath: string,
  width: number,
  height: number,
  format: 'jpeg' | 'png'
): Promise<string> {
  const fullPath = path.join(IMAGES_DIR, filePath);
  const dir = path.dirname(fullPath);

  // Ensure directory exists
  await fs.mkdir(dir, { recursive: true });

  // Resize and optimize image
  const processedImage = await sharp(imageBuffer)
    .resize(width, height, {
      fit: 'cover',
      position: 'center',
    })
    .toFormat(format, {
      quality: format === 'jpeg' ? 85 : 90,
      mozjpeg: format === 'jpeg',
    })
    .toBuffer();

  // Save to file
  await fs.writeFile(fullPath, processedImage);

  return fullPath;
}

async function generateImage(
  prompt: string,
  width: number,
  height: number,
  model: string = 'dall-e-3'
): Promise<string> {
  const client = getOpenAIClient();

  try {
    // Use DALL-E 3 for high quality, or DALL-E 2 for Together AI compatibility
    const useDalle3 = model === 'dall-e-3' && !process.env.TOGETHER_API_KEY;

    if (useDalle3) {
      const response = await client.images.generate({
        model: 'dall-e-3',
        prompt,
        size: `${width}x${height}` as '1024x1024' | '1792x1024' | '1024x1792',
        quality: 'hd',
        n: 1,
      });

      const imageUrl = response.data[0]?.url;
      if (!imageUrl) {
        throw new Error('No image URL returned from API');
      }

      return imageUrl;
    } else {
      // DALL-E 2 or Together AI
      const response = await client.images.generate({
        model: model === 'dall-e-3' ? 'dall-e-2' : model,
        prompt,
        size: `${width}x${height}`,
        n: 1,
      });

      const imageUrl = response.data[0]?.url;
      if (!imageUrl) {
        throw new Error('No image URL returned from API');
      }

      return imageUrl;
    }
  } catch (error: any) {
    throw new Error(`Image generation failed: ${error.message}`);
  }
}

const server = new Server(
  {
    name: 'mtg-maui-image-generator',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'generate_image',
        description:
          'Generate an image using AI and save it to the project. Supports custom prompts or predefined image types.',
        inputSchema: {
          type: 'object',
          properties: {
            imageType: {
              type: 'string',
              enum: Object.keys(IMAGE_SPECS),
              description:
                'Predefined image type from IMAGE_REQUIREMENTS_AND_PROMPTS.md. If provided, uses predefined prompt and dimensions.',
            },
            prompt: {
              type: 'string',
              description:
                'Custom prompt for image generation. Required if imageType is not provided.',
            },
            width: {
              type: 'number',
              description: 'Image width in pixels. Required if imageType is not provided.',
            },
            height: {
              type: 'number',
              description: 'Image height in pixels. Required if imageType is not provided.',
            },
            promptOption: {
              type: 'string',
              enum: ['option1', 'option2', 'option3'],
              description:
                'For predefined images with multiple prompt options, select which option to use (default: option1).',
            },
            model: {
              type: 'string',
              enum: ['dall-e-3', 'dall-e-2', 'stable-diffusion-xl-1024-v1-0'],
              description:
                'Image generation model to use. Default: dall-e-3 (or dall-e-2 if using Together AI).',
              default: 'dall-e-3',
            },
            outputPath: {
              type: 'string',
              description:
                'Custom output path relative to public/images/. Only used with custom prompts.',
            },
          },
          required: [],
        },
      },
      {
        name: 'list_image_specs',
        description:
          'List all predefined image specifications and their prompts from IMAGE_REQUIREMENTS_AND_PROMPTS.md',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'generate_all_priority_images',
        description:
          'Generate all Priority 1 (essential) images for the MTG Maui League website',
        inputSchema: {
          type: 'object',
          properties: {
            model: {
              type: 'string',
              enum: ['dall-e-3', 'dall-e-2', 'stable-diffusion-xl-1024-v1-0'],
              description: 'Image generation model to use',
              default: 'dall-e-3',
            },
          },
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === 'generate_image') {
      const {
        imageType,
        prompt: customPrompt,
        width: customWidth,
        height: customHeight,
        promptOption = 'option1',
        model = 'dall-e-3',
        outputPath: customOutputPath,
      } = args as any;

      let prompt: string;
      let width: number;
      let height: number;
      let filePath: string;
      let format: 'jpeg' | 'png';

      if (imageType) {
        // Use predefined spec
        const spec = IMAGE_SPECS[imageType as keyof typeof IMAGE_SPECS];
        if (!spec) {
          throw new McpError(
            ErrorCode.InvalidParams,
            `Unknown image type: ${imageType}. Available types: ${Object.keys(IMAGE_SPECS).join(', ')}`
          );
        }

        width = spec.width;
        height = spec.height;
        format = spec.format;
        filePath = spec.path;

        // Get prompt
        const predefinedPrompts =
          PREDEFINED_PROMPTS[imageType as keyof typeof PREDEFINED_PROMPTS];
        if (typeof predefinedPrompts === 'string') {
          prompt = predefinedPrompts;
        } else if (predefinedPrompts && promptOption in predefinedPrompts) {
          prompt = predefinedPrompts[promptOption as keyof typeof predefinedPrompts] as string;
        } else {
          prompt = predefinedPrompts?.option1 || '';
        }
      } else {
        // Custom prompt
        if (!customPrompt || !customWidth || !customHeight) {
          throw new McpError(
            ErrorCode.InvalidParams,
            'Custom prompt requires: prompt, width, and height'
          );
        }

        prompt = customPrompt;
        width = customWidth;
        height = customHeight;
        format = 'jpeg';

        if (customOutputPath) {
          filePath = customOutputPath;
        } else {
          // Generate filename from prompt
          const sanitized = prompt
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .substring(0, 50);
          filePath = `custom/${sanitized}.jpg`;
        }
      }

      // Generate image
      const imageUrl = await generateImage(prompt, width, height, model);

      // Download and save
      const imageBuffer = await downloadImage(imageUrl);
      const savedPath = await saveImage(imageBuffer, filePath, width, height, format);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                message: `Image generated and saved successfully`,
                filePath: savedPath,
                relativePath: `/images/${filePath}`,
                prompt,
                dimensions: { width, height },
                format,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    if (name === 'list_image_specs') {
      const specs = Object.entries(IMAGE_SPECS).map(([type, spec]) => {
        const prompts = PREDEFINED_PROMPTS[type as keyof typeof PREDEFINED_PROMPTS];
        return {
          type,
          path: spec.path,
          dimensions: { width: spec.width, height: spec.height },
          format: spec.format,
          category: spec.category,
          prompts: typeof prompts === 'string' ? [prompts] : Object.values(prompts || {}),
        };
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(specs, null, 2),
          },
        ],
      };
    }

    if (name === 'generate_all_priority_images') {
      const { model = 'dall-e-3' } = args as any;
      const priorityImages = ['medieval-background', 'og-image'];

      const results = [];

      for (const imageType of priorityImages) {
        try {
          const spec = IMAGE_SPECS[imageType as keyof typeof IMAGE_SPECS];
          const prompts =
            PREDEFINED_PROMPTS[imageType as keyof typeof PREDEFINED_PROMPTS];
          const prompt =
            typeof prompts === 'string'
              ? prompts
              : prompts?.option1 || '';

          const imageUrl = await generateImage(
            prompt,
            spec.width,
            spec.height,
            model
          );
          const imageBuffer = await downloadImage(imageUrl);
          const savedPath = await saveImage(
            imageBuffer,
            spec.path,
            spec.width,
            spec.height,
            spec.format
          );

          results.push({
            type: imageType,
            success: true,
            path: savedPath,
            relativePath: `/images/${spec.path}`,
          });
        } catch (error: any) {
          results.push({
            type: imageType,
            success: false,
            error: error.message,
          });
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                message: 'Priority 1 images generation complete',
                results,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
  } catch (error: any) {
    if (error instanceof McpError) {
      throw error;
    }
    throw new McpError(ErrorCode.InternalError, error.message);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MTG Maui Image Generator MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
