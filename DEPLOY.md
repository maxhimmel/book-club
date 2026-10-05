# Deploying book-club

Frontend → **Vercel**, backend → **Convex Cloud (production deployment)**. A single Vercel build
both deploys the Convex functions and builds the Next.js app, wiring the prod Convex URL into the build.

> Local dev uses a local Convex deployment (see [SETUP.md](./SETUP.md)); none of that affects prod.

## How the build works

`apps/web/vercel.json` sets the build command to:

```sh
cd ../../packages/backend \
  && npx convex deploy --cmd 'cd ../../apps/web && pnpm build' \
     --cmd-url-env-var-name NEXT_PUBLIC_CONVEX_URL
```

So on every Vercel build: `convex deploy` runs from `packages/backend` (deploys functions to the prod
deployment, using `CONVEX_DEPLOY_KEY`), sets `NEXT_PUBLIC_CONVEX_URL` to the prod deployment, then runs
`pnpm build` in `apps/web`. `.next` lands in `apps/web`, which is the Vercel **Root Directory**.

## One-time setup

### 1. Create the production Convex deployment + WorkOS prod env

In the [Convex dashboard](https://dashboard.convex.dev) for the `book-club` project:

1. Open the **production** deployment → **Settings → Integrations → WorkOS Authentication** →
   **create an AuthKit environment**. This provisions the prod WorkOS environment and sets
   `WORKOS_CLIENT_ID` + `WORKOS_API_KEY` on the **prod Convex deployment** (so `auth.config.ts` validates
   tokens in prod). Copy those two values — you'll need them for Vercel below.
2. **Settings → Deploy Keys → Generate Production Deploy Key.** Copy it.

> The `prod` block in `packages/backend/convex.json` auto-registers the prod redirect URI / CORS /
> homepage from `${buildEnv.VERCEL_PROJECT_PRODUCTION_URL}` during `convex deploy` — no manual WorkOS
> redirect-URI edits needed for prod.

### 2. Create the Vercel project

1. **Import** the `maxhimmel/book-club` GitHub repo in Vercel.
2. **Root Directory:** `apps/web`.
3. **Framework Preset:** Next.js. Leave Build/Install/Output commands as detected — `vercel.json`
   overrides the build command; Vercel installs the pnpm workspace from the repo root automatically.

### 3. Vercel environment variables (Production scope)

| Variable                          | Value                                                |
| --------------------------------- | ---------------------------------------------------- |
| `CONVEX_DEPLOY_KEY`               | the **Production** deploy key from step 1.2          |
| `WORKOS_CLIENT_ID`                | from the prod AuthKit env (step 1.1)                 |
| `WORKOS_API_KEY`                  | from the prod AuthKit env (step 1.1) — **secret**    |
| `WORKOS_COOKIE_PASSWORD`          | a **new** 32+ char secret: `openssl rand -base64 32` |
| `NEXT_PUBLIC_WORKOS_REDIRECT_URI` | `https://<your-prod-domain>/callback`                |

> Do **not** set `NEXT_PUBLIC_CONVEX_URL` — `convex deploy --cmd-url-env-var-name` injects it at build time.
> Keep these out of git (they live only in Vercel). `.env.local` files are git-ignored.

### 4. Deploy

Push to `main` (or click Deploy). Vercel runs the build command → Convex functions deploy to prod →
Next.js builds against the prod URL. Visit the deployed domain and test the WorkOS sign-in loop.

## Preview deployments (optional)

Convex supports a fresh backend per PR branch:

1. In the Convex dashboard, generate a **Preview** deploy key.
2. In Vercel, add `CONVEX_DEPLOY_KEY` scoped to **Preview** with that key.
3. The `preview` block in `convex.json` configures each preview's WorkOS redirect URI from
   `${buildEnv.VERCEL_BRANCH_URL}` automatically.
4. (optional) seed data per preview with `--preview-run '<function>'` appended to the deploy command.

See the Convex docs: <https://docs.convex.dev/production/hosting/vercel>.
