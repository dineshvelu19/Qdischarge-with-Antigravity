## Directives

### Folder Structure
- /app              → Next.js App Router pages & layouts
- /app/api          → API Route Handlers (server-side)
- /components       → Shared React components
- /components/ui    → Primitive UI components (Button, Input, Modal, etc.)
- /lib              → Utility functions, helpers, constants
- /lib/supabase     → Supabase client initializers (browser + server)
- /hooks            → Custom React hooks
- /types            → Global TypeScript interfaces & enums
- /styles           → Global CSS, Tailwind config overrides
- /public           → Static assets
- /tests            → Unit & integration tests (Vitest)
- /supabase         → DB migrations, seed files, RLS policies

### Naming Conventions
- Components: PascalCase (UserProfile.tsx)
- Hooks: camelCase prefixed with "use" (useSession.ts)
- API routes: kebab-case route segments (/app/api/auth/callback/route.ts)
- DB tables: snake_case (user_profiles, project_items)
- ENV vars: SCREAMING_SNAKE prefixed with NEXT_PUBLIC_ for client-safe vars

### Orchestration
- Always generate TypeScript — no plain JS files
- Always add JSDoc comments to exported functions
- Always add Zod validation schemas for all API inputs
- Use Server Components by default; add "use client" only when needed
- Use server-side Supabase client in Route Handlers and Server Components
- Use browser-side Supabase client only in Client Components

### Execution Commands
- dev:   npm run dev
- build: npm run build
- test:  npm run test
- lint:  npm run lint
- db:push: npx supabase db push
- db:migrate: npx supabase migration new <name>
