# Setup — connecting Convex + WorkOS AuthKit

The repo is scaffolded and `pnpm install` has run. These files are **already created**:

- `packages/backend/convex.json` — `authKit` section that drives Convex's auto-provisioning
- `packages/backend/convex/auth.config.ts` — server-side JWT validation (reads `WORKOS_CLIENT_ID`)
- `packages/backend/convex/{schema.ts,books.ts}` — a starter `books` table + query/mutation

What's left is **account-bound** (it touches your Convex + WorkOS accounts), so it's yours to run.

There are two paths. **Path A (Managed)** lets Convex create and configure the WorkOS environment for
you — recommended, and what the `convex.json` above is set up for. **Path B (Standard)** uses an
existing WorkOS team you manage yourself.

> Order matters: `convex.json` + `auth.config.ts` must exist **before** you run `convex dev`, because the
> first `dev` run is what triggers WorkOS provisioning. (They exist now — your earlier `convex dev` ran
> before `convex.json` did, which is why no WorkOS environment appeared.)

---

## Path A — Managed WorkOS team (recommended, auto-provisioned)

### 1. Provision + configure WorkOS via Convex

```bash
pnpm backend:setup        # = npx convex dev --until-success, in packages/backend
```

On this run Convex will (because `convex.json` has an `authKit.dev` section):

- prompt you to **create or link a Convex-managed WorkOS team** (opens a browser; needs team admin),
- **provision a dev WorkOS AuthKit environment** for this deployment,
- **configure** that environment from `convex.json → configure` (redirect URI
  `http://localhost:3000/callback`, CORS origin, homepage URL),
- **set `WORKOS_CLIENT_ID` + `WORKOS_API_KEY` on the dev deployment** so `auth.config.ts` can validate tokens,
- **write** `WORKOS_CLIENT_ID`, `WORKOS_API_KEY`, `NEXT_PUBLIC_WORKOS_REDIRECT_URI` into
  `packages/backend/.env.local` (from `convex.json → localEnvVars`).

Leave it running. You can see the provisioned environment in the Convex dashboard under the WorkOS
integration (and a link out to the WorkOS dashboard).

### 2. Point the web app at those values (monorepo seam)

Convex writes the provisioned values to **`packages/backend/.env.local`**, but Next.js reads
**`apps/web/.env.local`** — separate packages, separate env files. Copy them across. Create
`apps/web/.env.local` (template in `apps/web/.env.example`) with:

| var                               | value                                            |
| --------------------------------- | ------------------------------------------------ |
| `NEXT_PUBLIC_CONVEX_URL`          | `CONVEX_URL` from `packages/backend/.env.local`  |
| `WORKOS_CLIENT_ID`                | from `packages/backend/.env.local`               |
| `WORKOS_API_KEY`                  | from `packages/backend/.env.local`               |
| `NEXT_PUBLIC_WORKOS_REDIRECT_URI` | `http://localhost:3000/callback`                 |
| `WORKOS_COOKIE_PASSWORD`          | **generate yourself:** `openssl rand -base64 32` |

`WORKOS_COOKIE_PASSWORD` is the one secret Convex does **not** provision — it encrypts the session
cookie and is independent of WorkOS. (Want this copy step automated? Ask and I'll add a
`pnpm sync-web-env` script that reads the backend `.env.local` and fills `apps/web/.env.local` locally
without printing any secret.)

### 3. Run everything

```bash
pnpm dev
```

Turbo runs the Convex watcher + `next dev`. Visit http://localhost:3000 → **Sign in** → complete AuthKit
→ you return authenticated, and `ctx.auth.getUserIdentity()` in a Convex function returns your WorkOS identity.

---

## Path B — Standard (your existing WorkOS team, manual)

Choose this only if keeping an existing WorkOS team matters more than auto-provisioning. Convex will
**not** manage the team or auto-configure environments.

1. Remove the `authKit` block from `packages/backend/convex.json` (or delete the file) so `convex dev`
   doesn't try to provision a managed team.
2. In the [WorkOS dashboard](https://dashboard.workos.com/get-started), copy your `WORKOS_CLIENT_ID`
   (`client_…`) and `WORKOS_API_KEY` (`sk_…`), and add `http://localhost:3000/callback` as a redirect URI
   (set the homepage/return URL to `http://localhost:3000`).
3. Set them on the Convex deployment (for `auth.config.ts`):
   ```bash
   cd packages/backend
   npx convex env set WORKOS_CLIENT_ID "$YOUR_CLIENT_ID"
   npx convex env set WORKOS_API_KEY "$YOUR_API_KEY"
   npx convex dev            # sync config
   ```
4. Fill `apps/web/.env.local` with all five vars from the Path A table (same values, sourced manually).
5. `pnpm dev`.

---

## How the auth wiring fits together (already written for you)

- `packages/backend/convex.json` — `authKit` provisioning/config for dev/preview/prod.
- `packages/backend/convex/auth.config.ts` — validates WorkOS JWTs on the Convex deployment.
- `apps/web/src/proxy.ts` — `authkitProxy` (Next 16's proxy convention); `/`, `/sign-in`, `/sign-up`, `/callback` are public.
- `apps/web/src/app/{sign-in,sign-up,callback}/route.ts` — AuthKit redirect + callback handlers.
- `apps/web/src/components/ConvexClientProvider.tsx` — `AuthKitProvider` + `ConvexProviderWithAuthKit`,
  feeding WorkOS access tokens to Convex.
- `apps/web/src/app/layout.tsx` mounts the provider; `page.tsx` shows signed-in/out state via `withAuth()`.
