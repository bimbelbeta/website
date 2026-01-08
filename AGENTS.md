# Agent Guidelines for bimbelbeta

## Build Commands

```bash
# Linting and formatting
bun lint           # Check code with Biome
bun lint:fix       # Auto-fix issues

# Type checking
bun check-types    # Type check all packages

# Building
bun build          # Build all packages
bun build:packages # Build only packages (not apps)

# Development
bun dev            # Start all packages in dev mode
bun dev:web        # Start web app on port 3000
bun dev:server     # Start server on port 3001

# Database operations
bun db:push        # Push schema changes to DB
bun db:migrate     # Apply migrations
bun db:generate    # Generate migration files
bun db:studio      # Open Drizzle Studio
bun db:reset       # Reset database and seed
bun db:seed        # Seed database

# Run specific package command
turbo -F @bimbelbeta/db <command>
```

## Code Style Guidelines

### Formatting
- **Indentation**: Tabs (configured in biome.json)
- **Line width**: 120 characters
- **Quotes**: Double quotes for JavaScript/TypeScript
- **Formatting tool**: Biome (run `bun lint:fix` before committing)

### TypeScript
- **Strict mode**: Always enabled, use `@typescript/native-preview` for type checking
- **Type inference**: No explicit types when inferrable (enforced by biome)
- **As const**: Use `as const` assertions for literal types where needed
- **Imports**: Use `type` keyword for type-only imports when beneficial

### Import Organization
- Workspace packages: `@bimbelbeta/package-name`
- Catalog dependencies: Use `"catalog:"` in package.json
- Relative imports: Use `@/` alias for app internal paths
- Organize: External → Workspace → Relative

### React Components
- Functional components only, no class components
- TypeScript props interfaces, destructure props
- Use Radix UI primitives as base for UI components
- Styling: Tailwind CSS with `cn()` utility (clsx + tailwind-merge)
- Variants: Use class-variance-authority (cva) for component variants
- Patterns: Separate component and container logic when complex

### Naming Conventions
- Components: PascalCase (`FlashcardCard`)
- Functions/variables: camelCase (`getUserProgress`)
- Types/interfaces: PascalCase (`UserProgress`)
- Constants: UPPER_SNAKE_CASE (`FLASHCARD_SESSION_DURATION`)
- Files: kebab-case for folders (`flashcard-card/`), `index.ts` for exports

### Database (Drizzle ORM)
- Schema files in `packages/db/src/schema/`
- Tables: camelCase with underscored columns (`user`, `email_verified`)
- Relations: Define with explicit types
- Migrations: Generate with `bun db:generate`, apply with `bun db:migrate`
- Queries: Use Drizzle query builder, prefer type-safe operations

### API Routes (ORPC)
- Router files in `packages/api/src/routers/`
- Define routes with explicit path, method, tags
- Use Arktype for input/output validation (`type({...})`)
- Auth middleware: `pub`, `authed`, `admin` from `packages/api/src/index.ts`
- Error handling: Use `errors.NOT_FOUND()`, `errors.UNAUTHORIZED()`, or `ORPCError`
- Transactions: Use `db.transaction(async (tx) => {...})` for multi-step ops

### Error Handling
- Client errors: Use toast from sonner (`toast.error("message")`)
- Server errors: Use ORPCError helpers in routes
- Validation: Arktype types in route definitions catch schema errors early
- Never log secrets or sensitive data

### File Structure
```
packages/api/src/routers/
  feature-name.ts    # Individual router
  index.ts           # Exports appRouter with all routes
packages/db/src/schema/
  feature-name.ts    # Schema definitions
apps/web/src/components/ui/
  component-name.tsx # Base UI component
apps/web/src/routes/
  _auth/             # Auth layout routes
  _authenticated/    # Protected routes
  -components/       # Shared route components
```

### Best Practices
- Keep functions focused and under 50 lines when possible
- Use custom hooks for reusable logic in `hooks/` directories
- Avoid prop drilling - use context or state management (zustand)
- Server state: TanStack Query, client state: zustand
- Forms: TanStack Form with Arktype validators
- Minimize comments - code should be self-documenting
- Run `bun lint:fix` and `bun check-types` before pushing

### Testing
- Use Vitest/Jest for unit and integration tests
- Test files should be co-located with source files: `Component.test.tsx`
- Mock external dependencies in `__mocks__` folders
- Test user behavior, not implementation details
- Keep tests fast and isolated

### Environment Variables
- Local dev: Use `.env` files in `apps/server/`
- CI/CD: Set secrets in GitHub Actions or Coolify
- Never commit `.env` files or secrets
- Use environment-specific configs for staging/production

### Deployment
- Apps containerized with Docker (see Dockerfiles in each app)
- Built images pushed to GitHub Container Registry (ghcr.io)
- Deployed via Coolify webhooks on push to main
- Turbo remote caching enabled via TURBO_TOKEN and TURBO_TEAM

### CI/CD Workflows
- `.github/workflows/migrate.yml` - Database migrations on main push
- `.github/workflows/build-server.yml` - Build and deploy server image
- `.github/workflows/build-web.yml` - Build and deploy web image (if exists)
- Secrets managed in GitHub repository settings

### Git Workflow
- Feature branches: `feature/description` or `fix/description`
- Commit messages: Conventional Commits (feat, fix, refactor, etc.)
- Pull requests required before merging to main
- All CI checks must pass before merge approval
