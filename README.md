# book-club

A TypeScript monorepo: **Next.js** frontend + **Convex** backend, authenticated with **WorkOS AuthKit**.
Managed with **pnpm workspaces** + **Turborepo**.

> `book-club` is a working title.

## Layout

```
book-club/
├─ apps/
│  └─ web/              # Next.js 16 (App Router, Tailwind v4, shadcn/ui)
├─ packages/
│  ├─ backend/         # Convex backend (convex/ is created by `convex dev` — see SETUP.md)
│  ├─ eslint-config/   # shared ESLint flat config
│  └─ typescript-config/# shared tsconfig presets
├─ turbo.json          # task pipeline
└─ pnpm-workspace.yaml
```

The backend is its own package (`@book-club/backend`) so the frontend/backend boundary is real and a
second consumer could be added later. The web app imports the typed API from
`@book-club/backend/convex/_generated/api` (available after you run Convex setup).

## Getting started

```bash
pnpm install
```

Then follow **[SETUP.md](./SETUP.md)** to connect your own Convex project and WorkOS AuthKit app
(these steps log into your accounts, so they aren't scripted here). After that:

```bash
pnpm dev          # runs Convex watcher + Next.js together via Turbo
```

## Scripts (root)

| Command          | What it does                                   |
| ---------------- | ---------------------------------------------- |
| `pnpm dev`       | Run all apps/packages in dev (`turbo run dev`) |
| `pnpm build`     | Build everything                               |
| `pnpm lint`      | Lint all workspaces                            |
| `pnpm typecheck` | Typecheck all workspaces                       |
| `pnpm format`    | Format with Prettier                           |

## Stack

- Next.js 16 / React 19
- Convex (database + server functions)
- WorkOS AuthKit (`@workos-inc/authkit-nextjs` + `@convex-dev/workos`)
- Tailwind CSS v4 + shadcn/ui
- pnpm + Turborepo, ESLint + Prettier
