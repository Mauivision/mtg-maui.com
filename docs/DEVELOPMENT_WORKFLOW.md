# 🔧 Development Workflow Guide

**Pages & controls:** [DIRECTION_AND_CONTROLS](DIRECTION_AND_CONTROLS.md). **Offline** = local dev; **online** = Vercel.

## Quick Start

### Initial Setup
```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database (optional)
npm run prisma:seed

# Start development server
npm run dev
```

### Daily Development
```bash
# Start dev server (port 3004)
npm run dev

# If port 3004 is in use: npm run dev:alt  (uses 3003)

# Type check in watch mode
npm run type-check:watch

# Auto-fix linting issues
npm run lint:fix

# Full verification
npm run verify
```

---

## Code Organization

### Import Patterns

**✅ Recommended: Centralized Exports**
```typescript
import { Button, Card } from '@/components';
import { useAuth, useLeagueDecks } from '@/hooks';
import { useLeague } from '@/contexts';
import { logger, prisma, handleApiError } from '@/lib';
import type { Player, League } from '@/types';
```

**✅ Also Valid: Direct Imports**
```typescript
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/lib/logger';
```

**❌ Avoid: Relative Imports**
```typescript
// Don't use relative imports
import { Button } from '../ui/Button';
```

### File Structure
```
src/
├── app/              # Next.js pages & API routes
├── components/       # React components
│   └── index.ts     # Centralized exports
├── contexts/         # React contexts
│   └── index.ts     # Centralized exports
├── hooks/           # Custom hooks
│   └── index.ts     # Centralized exports
├── lib/             # Utilities
│   └── index.ts     # Centralized exports
└── types/           # TypeScript types
    └── index.ts     # Centralized exports
```

---

## API Route Development

### Standard Pattern
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/api-error';
import { logger } from '@/lib/logger';
import { z } from 'zod';

// Validation schema
const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().formErrors[0] },
        { status: 400 }
      );
    }

    const result = await prisma.user.create({
      data: parsed.data,
    });

    return NextResponse.json({ user: result }, { status: 201 });
  } catch (error) {
    logger.error('Error creating user', error);
    return handleApiError(error);
  }
}
```

### Using Middleware (Optional)
```typescript
import { withLogging } from '@/lib/api-middleware';

export const GET = withLogging(async (request: NextRequest) => {
  // Handler automatically logs request/response
  return NextResponse.json({ data: 'result' });
});
```

---

## Logging Best Practices

### Use Logger Instead of Console
```typescript
// ✅ Good
import { logger } from '@/lib/logger';
logger.info('Operation completed');
logger.error('Operation failed', error, { context: 'data' });

// ❌ Avoid
console.log('Operation completed');
console.error('Operation failed', error);
```

### Log Levels
- **debug**: Development-only detailed logs
- **info**: General information
- **warn**: Warnings
- **error**: Errors (with error object)

### Performance Tracking
```typescript
import { measureTime } from '@/lib/api-middleware';

const result = await measureTime('Database query', async () => {
  return await prisma.user.findMany();
});
```

---

## Error Handling

### Always Use handleApiError
```typescript
import { handleApiError } from '@/lib/api-error';

try {
  // Your code
} catch (error) {
  logger.error('Operation failed', error);
  return handleApiError(error);
}
```

### Custom Errors
```typescript
import { ApiError } from '@/lib/api-error';

throw ApiError.badRequest('Invalid input');
throw ApiError.unauthorized('Not authenticated');
throw ApiError.notFound('Resource not found');
```

---

## Database Access

### Always Use Singleton Prisma
```typescript
// ✅ Good
import { prisma } from '@/lib/prisma';
const users = await prisma.user.findMany();

// ❌ Never
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
```

---

## Type Safety

### Use Type Definitions
```typescript
import type { Player, League } from '@/types';

function processPlayer(player: Player) {
  // Type-safe code
}
```

### Avoid `any`
```typescript
// ✅ Good
const players: Player[] = [];

// ❌ Avoid
const players: any[] = [];
```

---

## Testing

### Run Type Check
```bash
npm run type-check
```

### Run Linter
```bash
npm run lint
npm run lint:fix  # Auto-fix issues
```

### Full Verification
```bash
npm run verify  # type-check + lint + build
```

---

## Common Tasks

### Fix Prisma Imports
```bash
npm run fix:prisma
```

### Migrate Console to Logger (API routes)
```bash
npm run logger:migrate
```
Optionally pass a file path: `npm run logger:migrate -- src/app/api/admin/games/route.ts`

### Clean Build Artifacts
```bash
npm run clean      # Remove .next, out, dist
npm run clean:all  # Deep clean including cache
```

### After Restructure / Rebuild
1. `npm install` → `npx prisma generate` → `npm run build`
2. `npm run verify` to type-check, lint, and build
3. For new API routes, use `logger` (not `console`); optionally `npm run logger:migrate` when bulk-migrating.

---

## Best Practices Summary

1. ✅ Use centralized exports from index files
2. ✅ Always use path aliases (`@/`)
3. ✅ Use logger instead of console
4. ✅ Use handleApiError for error handling
5. ✅ Use singleton prisma client
6. ✅ Validate inputs with Zod
7. ✅ Use proper TypeScript types
8. ✅ Follow established patterns

---

**Last Updated**: 2026-01-26  
**Status**: ✅ **COMPREHENSIVE GUIDE**
