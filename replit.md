# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: MongoDB Atlas via Mongoose (`MONGO_URI` secret, db: `linkery-notes`), falls back to in-memory store
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Applications

### Linkery Notes (Mobile App — `artifacts/pulse-memo-pro`)
A professional dark-mode mobile app for saving URLs with personal context/notes.

**Features:**
- Save links with URL validation and auto-fetched page titles
- Context/notes field ("Why I saved this")
- Delete memos with confirmation dialog
- Settings screen with Pro upgrade card placeholder
- Ad placement divs for future Google AdMob integration
- MongoDB Atlas persistence (falls back to in-memory)
- Full iOS/Android/Web responsive layout
- NativeTabs with liquid glass on iOS 26+

**Routes:**
- `(tabs)/index.tsx` — Memos list screen
- `(tabs)/settings.tsx` — Settings / Pro upgrade screen

**Components:**
- `components/MemoCard.tsx` — Card with favicon, title, context, delete
- `components/AddMemoSheet.tsx` — Bottom sheet form for adding memos

**Hooks:**
- `hooks/useMemos.ts` — React Query hooks for GET/POST/DELETE memos

### API Server (`artifacts/api-server`)
Express 5 server with MongoDB Atlas integration.

**API Routes (`/api`):**
- `GET /memos` — List all memos (sorted newest first)
- `POST /memos` — Create memo (auto-fetches page title + favicon)
- `DELETE /memos/:id` — Delete memo by MongoDB ObjectID

**Files:**
- `src/lib/mongo.ts` — Mongoose connection + MemoModel + in-memory fallback
- `src/routes/memos.ts` — Memo CRUD route handlers

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server
│   └── pulse-memo-pro/     # Expo React Native mobile app
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection (unused)
├── scripts/
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Environment Variables / Secrets

- `MONGO_URI` — MongoDB Atlas connection string (required for persistence)
- `SESSION_SECRET` — (placeholder, not yet used)

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

- **Always typecheck from the root** — run `pnpm run typecheck`
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references`

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Codegen

Run: `pnpm --filter @workspace/api-spec run codegen`

Generates:
- `lib/api-client-react/src/generated/` — React Query hooks
- `lib/api-zod/src/generated/` — Zod schemas
