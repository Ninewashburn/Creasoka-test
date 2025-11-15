# CLAUDE.md - AI Assistant Guide for Crea'Soka

## Project Overview

**Crea'Soka** is a portfolio/showcase website for handmade crafts (primarily Pokemon figurines, jewelry, and other creative works). The site features a public gallery, category filtering, creation detail pages, and a protected admin panel for content management.

**Key Characteristics:**
- Modern Next.js 15 application with App Router
- TypeScript throughout with strict mode
- PostgreSQL database via Supabase with Prisma ORM
- JWT-based authentication with role-based permissions
- Dual-mode authentication (dev auto-auth, prod JWT)
- Server-side and client-side caching layers
- SEO-optimized with dynamic sitemap and structured data
- Fully responsive with dark mode support

## Tech Stack

### Frontend
- **Next.js 15.2.4** - React framework with App Router (Server Components)
- **React 19** - Latest React with server/client component architecture
- **TypeScript 5.8.3** - Strict type checking enabled
- **Tailwind CSS** - Utility-first styling with custom design system
- **Radix UI** - Accessible component primitives
- **shadcn/ui** - Pre-built component library
- **Framer Motion** - Animation library
- **React Hook Form + Zod** - Form validation
- **next-themes** - Dark mode implementation
- **Lucide React** - Icon library

### Backend
- **Next.js API Routes** - Serverless API endpoints (Node.js runtime)
- **Prisma 6.6.0** - Type-safe ORM with PostgreSQL
- **PostgreSQL** - Database hosted on Supabase
- **JWT** - Token-based authentication (jsonwebtoken)
- **bcryptjs** - Password hashing

### Development Tools
- **pnpm** - Package manager (based on pnpm-lock.yaml)
- **ESLint** - Linting (via `npm run lint`)
- **TypeScript** - Type checking

## Directory Structure

```
/
├── app/                          # Next.js 15 App Router
│   ├── layout.tsx               # Root layout with SEO, theme, header/footer
│   ├── page.tsx                 # Homepage with hero, featured creations
│   ├── sitemap.ts               # Dynamic sitemap from database
│   ├── not-found.tsx            # 404 page
│   ├── admin/                   # Protected admin section
│   │   ├── page.tsx            # Admin dashboard (login + creation list)
│   │   ├── logout/page.tsx     # Logout endpoint
│   │   ├── nouvelle-creation/  # Create new creation
│   │   └── edit/[id]/          # Edit existing creation
│   ├── api/                     # API routes
│   │   ├── auth/route.ts       # POST login, GET check, DELETE logout
│   │   ├── creations/          # CRUD operations
│   │   │   ├── route.ts        # GET all, POST create
│   │   │   └── [id]/route.ts   # GET/PUT/DELETE by ID or slug
│   │   └── upload/route.ts     # Image upload handler
│   ├── galerie/                 # Public gallery page
│   ├── creations/[id]/          # Dynamic creation detail pages
│   ├── categories/              # Category-filtered views
│   │   ├── [category]/         # bijoux, minis, halloween, pokemon, divers
│   │   └── toutes/             # All categories
│   ├── contact/                 # Contact page
│   ├── mentions-legales/        # Legal notices
│   └── politique-de-cookies/    # Cookie policy
│
├── components/                   # React components
│   ├── ui/                      # Primitive UI components (shadcn/ui)
│   │   └── *.tsx               # button, card, dialog, form, input, etc.
│   ├── seo/                     # SEO components
│   │   └── schema-org.tsx      # Structured data
│   └── *.tsx                    # Feature components
│       ├── creation-card.tsx    # Creation display card
│       ├── header.tsx           # Site navigation
│       ├── footer.tsx           # Site footer
│       ├── image-modal.tsx      # Image viewer modal
│       ├── upload-*.tsx         # Upload components
│       └── theme-*.tsx          # Theme components
│
├── lib/                          # Utility libraries
│   ├── auth.ts                  # Complete authentication system
│   ├── permissions.ts           # Role-based access control
│   ├── db.ts                    # Database client export
│   ├── prisma.js                # Prisma singleton pattern
│   ├── utils.ts                 # Utilities (cn, slugify, markdown)
│   ├── cache.ts                 # Server-side caching (5min TTL)
│   ├── clientCache.ts           # Client-side localStorage caching
│   ├── cropImage.ts             # Image cropping utilities
│   └── generated/               # Prisma generated client
│
├── prisma/                       # Database
│   ├── schema.prisma            # Database schema (Creation, User models)
│   └── migrations/              # Migration history
│
├── types/                        # TypeScript types
│   ├── creation.ts              # Creation interface
│   └── env.d.ts                 # Environment variable types
│
├── hooks/                        # React hooks
│   ├── use-auth.ts              # Authentication hook
│   ├── use-toast.ts             # Toast notifications
│   ├── use-media-query.ts       # Responsive breakpoints
│   └── use-upload-image.ts      # Image upload logic
│
├── data/                         # Data files
│   └── creations.ts             # Legacy file (now uses database)
│
├── public/                       # Static assets
│   └── images/creations/        # Uploaded creation images
│
├── styles/                       # Global styles
│   └── globals.css              # Tailwind directives, CSS variables
│
├── middleware.ts                 # Route protection middleware
├── next.config.js/.mjs          # Next.js configuration
├── tailwind.config.ts           # Tailwind configuration
├── tsconfig.json                # TypeScript configuration
├── components.json              # shadcn/ui configuration
└── postinstall.js               # Post-install script
```

## Key Patterns and Conventions

### File and Code Naming

- **Components:** PascalCase (e.g., `CreationCard`, `ImageModal`)
- **Files:** kebab-case (e.g., `creation-card.tsx`, `use-auth.ts`)
- **API routes:** RESTful naming (e.g., `/api/creations/[id]`)
- **Database fields:** camelCase (e.g., `createdAt`, `externalLink`)
- **CSS variables:** kebab-case with `--` prefix (e.g., `--creasoka`)
- **Hooks:** Prefix with `use-` (e.g., `use-auth.ts`)

### TypeScript Conventions

- **Strict mode enabled** - All code must pass strict type checking
- **Interfaces** for data shapes (e.g., `Creation` interface in `/types/creation.ts`)
- **Type exports** from files when types are reusable
- **Path alias:** Use `@/` for imports from root (e.g., `import { db } from '@/lib/db'`)
- **Avoid `any`** - Use proper types or `unknown` with type guards

### Component Patterns

**Server Components (default):**
```typescript
// No "use client" directive
export default async function Page() {
  const data = await fetchData(); // Direct DB or API calls
  return <div>{data}</div>;
}
```

**Client Components:**
```typescript
"use client";

export function InteractiveComponent() {
  const [state, setState] = useState();
  // Hooks, event handlers, browser APIs
  return <button onClick={...}>Click</button>;
}
```

**Component Composition:**
- Prefer composition over inheritance
- Extract reusable logic into hooks
- Keep components focused and single-purpose
- Use shadcn/ui components from `/components/ui/` as primitives

### Database Patterns

**Prisma Client Usage:**
```typescript
import { db } from '@/lib/db'; // Always use this export

// Create
const creation = await db.creation.create({
  data: { title, description, ... }
});

// Find by ID or slug
const creation = await db.creation.findUnique({
  where: { id: slugOrId }
});
```

**Important Notes:**
- Prisma client is at custom path: `@/lib/generated/prisma`
- Always use `db` from `/lib/db.ts` (handles singleton pattern)
- Use `slugify()` from `/lib/utils.ts` for generating IDs
- Creation IDs are slugified titles + timestamp (e.g., `pikachu-figurine-1234567890`)

### API Route Patterns

**Standard CRUD Structure:**
```typescript
// app/api/resource/route.ts
export const runtime = 'nodejs'; // Always specify

// GET - List/Read
export async function GET(request: Request) {
  try {
    const data = await db.model.findMany();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Message' }, { status: 500 });
  }
}

// POST - Create (requires auth)
export async function POST(request: Request) {
  const user = await verifyAuth(request);
  if (!user || !hasPermission(user, 'RESOURCE', 'CREATE')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ... create logic
}
```

**Authentication in API Routes:**
```typescript
import { verifyAuth } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

const user = await verifyAuth(request);
if (!user || !hasPermission(user, 'CREATION', 'CREATE')) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### Caching Strategy

**Server-side (lib/cache.ts):**
```typescript
import { getCachedData, setCachedData } from '@/lib/cache';

const cached = getCachedData<T>('key');
if (cached) return cached;

const data = await fetchData();
setCachedData('key', data, 300); // 5min TTL
return data;
```

**Client-side (lib/clientCache.ts):**
```typescript
import { getCachedData, setCachedData } from '@/lib/clientCache';

// Same pattern but uses localStorage
```

**When to Cache:**
- Frequently accessed, rarely changing data (e.g., creation lists)
- Default TTL: 5 minutes (300 seconds)
- Clear cache on mutations (create/update/delete)

## Authentication and Security

### Authentication Flow

**Development Mode:**
- Auto-authenticate as admin user
- No login required (bypassed in `use-auth.ts` hook)
- Enabled when `process.env.NODE_ENV === 'development'`

**Production Mode:**
- JWT-based authentication via httpOnly cookies
- Login at `/admin` page → POST to `/api/auth`
- Token stored in `auth_token` cookie (7-day expiration)
- Logout via DELETE to `/api/auth` or `/admin/logout`

### Middleware Protection

**File:** `/middleware.ts`

**Protected Routes:**
- `/admin/*` (except `/admin` login page itself)
- API write operations: POST, PUT, DELETE to `/api/*`
- GET operations are public by default

**Authentication Sources (in order):**
1. `auth_token` cookie (httpOnly, secure in production)
2. `Authorization: Bearer <token>` header
3. `?token=<token>` query parameter (dev only)

**Referer Checking:**
- Admin pages allow access if referer is from `/admin` (for navigation)
- Prevents redirect loops during admin workflows

### Permission System

**File:** `/lib/permissions.ts`

**Roles:**
- `ADMIN` - Full access to all resources and actions
- `USER` - Read-only access
- `GUEST` - Limited public access

**Resources:**
- `CREATION` - Creation management
- `USER` - User management
- `UPLOAD` - File uploads

**Actions:**
- `CREATE` - Create new resources
- `READ` - View resources
- `UPDATE` - Modify existing resources
- `DELETE` - Remove resources

**Usage:**
```typescript
import { hasPermission } from '@/lib/permissions';

if (!hasPermission(user, 'CREATION', 'UPDATE')) {
  return error403();
}
```

### Security Best Practices

**Password Handling:**
- Hashed with bcryptjs (10 rounds)
- Never log or expose passwords
- Store only hashed versions in database

**JWT Tokens:**
- Signed with `JWT_SECRET` from environment
- 7-day expiration (configurable via `JWT_EXPIRES_IN`)
- HttpOnly cookies prevent XSS theft
- Secure flag in production

**Brute Force Protection:**
- Track login attempts in memory (could be improved with Redis)
- 5 failed attempts = 15-minute lockout
- Implemented in `/lib/auth.ts`

**Input Validation:**
- Use Zod schemas for form validation
- Validate on both client and server
- Sanitize user input before database operations

**Common Vulnerabilities to Avoid:**
- XSS: Never use `dangerouslySetInnerHTML` without sanitization
- SQL Injection: Use Prisma's parameterized queries (automatic)
- CSRF: Token generation available in auth.ts (not fully implemented)
- Path Traversal: Validate file upload paths
- Auth Bypass: Always check permissions in API routes

## Database Schema

**File:** `/prisma/schema.prisma`

### Creation Model

```prisma
model Creation {
  id            String   @id @default(uuid())
  title         String
  description   String   @db.Text
  categories    String[] // Array: ["bijoux", "minis", "halloween", "pokemon", "divers"]
  image         String   // Main image path (relative to /public)
  images        String[] // Additional images array
  details       String[] // Bullet points array
  status        String   @default("normal") // nouveau, vedette, normal, adopté
  externalLink  String?  // Optional (e.g., Vinted link)
  customMessage String?  @db.Text
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

**Key Points:**
- ID is slugified title + timestamp (generated in application code)
- Categories are multi-select (creation can belong to multiple)
- Status "vedette" = featured on homepage
- Status "adopté" = sold/adopted
- Images are relative paths: `/images/creations/filename.jpg`

### User Model

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String   // Bcrypt hashed
  name      String?
  role      String   @default("user") // admin, user
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Database Connection

**Environment Variables Required:**
```env
DATABASE_URL="postgresql://user:pass@host:port/db?pgbouncer=true"
DIRECT_URL="postgresql://user:pass@host:port/db" # For migrations
```

**Prisma Commands:**
```bash
# Generate client (done automatically in postinstall)
npx prisma generate

# Run migrations
npx prisma migrate dev

# Open Prisma Studio (DB GUI)
npx prisma studio

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset
```

## Common Development Tasks

### Adding a New Page

1. Create file in `/app/your-route/page.tsx`
2. Export default async component
3. Add metadata for SEO
4. Update navigation in `/components/header.tsx` if needed

**Example:**
```typescript
// app/about/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About - Crea\'Soka',
  description: 'Learn about our handmade creations',
};

export default function AboutPage() {
  return <div>About content</div>;
}
```

### Adding a New API Route

1. Create file in `/app/api/your-route/route.ts`
2. Export HTTP method functions (GET, POST, etc.)
3. Add authentication checks for write operations
4. Use try-catch for error handling

**Example:**
```typescript
// app/api/your-route/route.ts
import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const data = await db.yourModel.findMany();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const user = await verifyAuth(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = await db.yourModel.create({ data: body });
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating data:', error);
    return NextResponse.json(
      { error: 'Failed to create data' },
      { status: 500 }
    );
  }
}
```

### Adding a New Component

1. Create file in `/components/your-component.tsx`
2. Use `"use client"` if needs interactivity
3. Import and use shadcn/ui components from `/components/ui/`
4. Add TypeScript types for props

**Example:**
```typescript
// components/your-component.tsx
"use client";

import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface YourComponentProps {
  title: string;
  onAction?: () => void;
}

export function YourComponent({ title, onAction }: YourComponentProps) {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h2>{title}</h2>
      <p>Count: {count}</p>
      <Button onClick={() => setCount(count + 1)}>
        Increment
      </Button>
    </div>
  );
}
```

### Modifying the Database Schema

1. Edit `/prisma/schema.prisma`
2. Run `npx prisma migrate dev --name describe_change`
3. Update TypeScript interfaces in `/types/` if needed
4. Update API routes and components that use the model

**Example:**
```bash
# Add new field to Creation model
# 1. Edit schema.prisma, add: purchasePrice Float?
npx prisma migrate dev --name add_purchase_price

# 2. Update /types/creation.ts interface
# 3. Update creation forms and display components
```

### Working with Images

**Upload Location:** `/public/images/creations/`

**Upload Pattern:**
```typescript
// In API route or server action
import { writeFile } from 'fs/promises';
import { join } from 'path';

const buffer = Buffer.from(await file.arrayBuffer());
const filename = `${Date.now()}-${file.name.replace(/\s/g, '-')}`;
const filepath = join(process.cwd(), 'public/images/creations', filename);
await writeFile(filepath, buffer);

// Store in database as: `/images/creations/${filename}`
```

**Display Pattern:**
```typescript
import Image from 'next/image';

<Image
  src={creation.image}
  alt={creation.title}
  width={400}
  height={300}
  className="rounded-lg"
  loading="lazy"
/>
```

### Adding shadcn/ui Components

The project uses shadcn/ui. To add new components:

```bash
# List available components
npx shadcn-ui@latest add

# Add specific component (example: calendar)
npx shadcn-ui@latest add calendar

# Component will be added to /components/ui/calendar.tsx
```

**Configuration:** `/components.json`

### Testing Authentication

**Development:**
```typescript
// Automatically authenticated as admin
// No login needed, just navigate to /admin
```

**Production:**
```bash
# 1. Create admin user via Prisma Studio or script
# 2. Login at /admin with email/password
# 3. Token stored in cookie, valid for 7 days
```

**Manual Testing:**
```bash
# Login
curl -X POST http://localhost:3000/api/auth \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# Check auth status
curl http://localhost:3000/api/auth \
  -H "Cookie: auth_token=YOUR_TOKEN"

# Logout
curl -X DELETE http://localhost:3000/api/auth \
  -H "Cookie: auth_token=YOUR_TOKEN"
```

## Development Workflow

### Initial Setup

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL, JWT_SECRET, etc.

# Run database migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Seed database (if seed script exists)
npx prisma db seed

# Start development server
pnpm dev
```

### Running the Application

```bash
# Development server (auto-auth enabled)
pnpm dev # http://localhost:3000

# Production build
pnpm build

# Start production server
pnpm start

# Linting
pnpm lint
```

### Git Workflow

**Branch Naming:**
- Feature branches: `claude/claude-md-<session-id>` (for Claude Code)
- Other features: `feature/description`
- Bugfixes: `fix/description`
- Hotfixes: `hotfix/description`

**Commit Messages:**
```bash
# Format: type: description
git commit -m "feat: add new category filter"
git commit -m "fix: resolve authentication bug"
git commit -m "refactor: improve caching logic"
git commit -m "docs: update CLAUDE.md"
```

**Common Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring
- `docs:` - Documentation
- `style:` - Formatting, styling
- `test:` - Add/update tests
- `chore:` - Maintenance tasks

### Deployment Considerations

**Environment Variables Required:**
```env
NODE_ENV=production
DATABASE_URL=...
DIRECT_URL=...
JWT_SECRET=... # Must be secure random string
JWT_EXPIRES_IN=7d
```

**Build Process:**
1. `pnpm install` - Install dependencies
2. `npx prisma generate` - Generate Prisma client (automatic via postinstall)
3. `pnpm build` - Build Next.js application
4. `npx prisma migrate deploy` - Run migrations (production)
5. `pnpm start` - Start production server

**Important:**
- Ensure `JWT_SECRET` is different in production
- Set secure database credentials
- Enable HTTPS for secure cookies
- Configure proper CORS if needed
- Set up proper logging and monitoring

## Important Files Reference

### Must-Read Files

1. **`/middleware.ts`** - Route protection, authentication checks
2. **`/lib/auth.ts`** - Complete authentication implementation
3. **`/lib/permissions.ts`** - Authorization and role-based access
4. **`/prisma/schema.prisma`** - Database schema
5. **`/app/layout.tsx`** - Root layout, SEO, global providers
6. **`/lib/utils.ts`** - Utility functions (slugify, cn, markdown)
7. **`/hooks/use-auth.ts`** - Auth hook with dev/prod mode
8. **`/app/api/creations/route.ts`** - Example API route pattern

### Configuration Files

- **`next.config.js`** - Next.js configuration
- **`tailwind.config.ts`** - Tailwind CSS configuration
- **`tsconfig.json`** - TypeScript configuration
- **`components.json`** - shadcn/ui configuration
- **`.env.local`** - Environment variables (not in repo)

### Key Component Files

- **`/components/creation-card.tsx`** - Main creation display component
- **`/components/header.tsx`** - Site navigation with responsive menu
- **`/components/ui/*`** - shadcn/ui primitive components

## Troubleshooting

### Common Issues

**Prisma Client Not Found:**
```bash
# Regenerate Prisma client
npx prisma generate
```

**Authentication Not Working:**
- Check `JWT_SECRET` is set in `.env.local`
- Verify cookie is being set (check browser DevTools)
- In dev mode, should auto-authenticate (check `/hooks/use-auth.ts`)
- Clear browser cookies and try again

**Database Connection Errors:**
- Verify `DATABASE_URL` in `.env.local`
- Check Supabase connection pooler is running
- Use `DIRECT_URL` for migrations
- Test connection: `npx prisma db pull`

**Type Errors:**
```bash
# Check TypeScript errors
npx tsc --noEmit

# Common fixes:
# - Ensure Prisma client is generated
# - Check import paths use @/ alias correctly
# - Verify all required props are passed
```

**Build Errors:**
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Rebuild
pnpm build
```

**Images Not Loading:**
- Verify images are in `/public/images/creations/`
- Check paths in database start with `/images/creations/`
- Ensure file permissions are correct
- Check Next.js Image component configuration

### Development Tips

**Fast Refresh Issues:**
- Save file again to trigger refresh
- Check terminal for errors
- Restart dev server if needed

**Performance Debugging:**
- Use React DevTools Profiler
- Check for unnecessary re-renders
- Verify caching is working (check network tab)
- Consider memoization for expensive components

**Database Debugging:**
```bash
# Open Prisma Studio (visual DB editor)
npx prisma studio

# Check database schema
npx prisma db pull

# View migration status
npx prisma migrate status
```

## SEO Guidelines

When adding new pages or modifying content:

1. **Add Metadata:**
```typescript
export const metadata: Metadata = {
  title: 'Page Title - Crea\'Soka',
  description: 'Clear, concise description (150-160 chars)',
  openGraph: {
    title: 'Page Title',
    description: 'Description for social sharing',
    images: ['/path/to/image.jpg'],
  },
};
```

2. **Use Semantic HTML:**
- `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<footer>`
- Proper heading hierarchy (h1 → h2 → h3)
- Alt text for all images

3. **Update Sitemap:**
- Sitemap is auto-generated from database in `/app/sitemap.ts`
- Static pages may need manual addition

4. **Structured Data:**
- Use Schema.org components from `/components/seo/schema-org.tsx`
- Add for products, breadcrumbs, organization, etc.

## Performance Guidelines

**Server Components:**
- Use by default for better performance
- Fetch data directly in components
- Avoid unnecessary client-side JavaScript

**Client Components:**
- Only use when needed (interactivity, hooks, browser APIs)
- Keep minimal and focused
- Consider lazy loading with `next/dynamic`

**Images:**
- Always use Next.js `<Image>` component
- Provide width and height
- Use `loading="lazy"` for below-fold images
- Consider WebP/AVIF formats

**Caching:**
- Cache frequently accessed, rarely changing data
- Use server-side cache for API responses
- Use client-side cache for user-specific data
- Clear cache after mutations

**Database Queries:**
- Use Prisma's `select` to fetch only needed fields
- Implement pagination for large lists
- Consider database indexes for frequently queried fields
- Use `include` judiciously (avoid N+1 queries)

## Accessibility Guidelines

- Use semantic HTML elements
- Provide alt text for images
- Ensure keyboard navigation works
- Maintain sufficient color contrast
- Use ARIA labels where needed
- Test with screen readers
- Radix UI components are accessible by default

## Getting Help

**Documentation:**
- Next.js 15: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs
- Tailwind CSS: https://tailwindcss.com/docs
- shadcn/ui: https://ui.shadcn.com
- Radix UI: https://www.radix-ui.com

**Debugging:**
1. Check browser console for errors
2. Check terminal for server-side errors
3. Use React DevTools for component debugging
4. Use Prisma Studio for database inspection
5. Review middleware.ts for routing issues

**Code Patterns:**
- Look at existing similar components/routes
- Follow patterns in `/app/api/creations/` for API routes
- Reference `/components/creation-card.tsx` for component structure
- Check `/lib/auth.ts` for authentication patterns

---

## Summary for AI Assistants

When working on this codebase:

1. **Always** use TypeScript with proper types
2. **Prefer** Server Components unless interactivity is needed
3. **Use** the `@/` path alias for imports
4. **Follow** existing patterns for API routes, components, database queries
5. **Check** authentication and permissions for protected operations
6. **Cache** data appropriately to reduce database load
7. **Validate** input with Zod schemas
8. **Handle** errors gracefully with try-catch
9. **Test** in both development (auto-auth) and production modes
10. **Consider** SEO, accessibility, and performance in all changes

**Key Files to Reference:**
- Authentication: `/lib/auth.ts`, `/middleware.ts`
- Database: `/prisma/schema.prisma`, `/lib/db.ts`
- Utilities: `/lib/utils.ts`, `/lib/permissions.ts`
- Components: `/components/creation-card.tsx`, `/components/ui/*`
- API: `/app/api/creations/route.ts`

This codebase follows Next.js 15 best practices with a focus on type safety, security, SEO, and developer experience. Always maintain these standards when making changes.
