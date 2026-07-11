import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/** Serves `api/*.ts` (Vercel serverless functions) under `vite dev`, so the
 *  same functions Vercel would deploy can be hit at http://localhost:5173/api/…
 *  without the Vercel CLI/account. Dev-only — `configureServer` never runs
 *  during `vite build`, and Vercel ignores this file in production anyway. */
function apiDevServer(): Plugin {
  return {
    name: 'api-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next()

        const url = new URL(req.url, 'http://localhost')
        const route = url.pathname.slice('/api/'.length).replace(/\/$/, '')
        const file = resolve(process.cwd(), 'api', `${route}.ts`)
        if (!route || !existsSync(file)) return next()

        const query: Record<string, string | string[]> = {}
        for (const key of url.searchParams.keys()) {
          const all = url.searchParams.getAll(key)
          query[key] = all.length > 1 ? all : all[0]
        }

        const chunks: Buffer[] = []
        for await (const chunk of req) chunks.push(chunk as Buffer)
        const raw = Buffer.concat(chunks).toString('utf8')
        let body: unknown = raw
        if (raw && (req.headers['content-type']?.includes('json') ?? false)) {
          try {
            body = JSON.parse(raw)
          } catch {
            /* leave as raw text — matches Vercel's behaviour on bad JSON */
          }
        }

        const vercelReq = Object.assign(req, { query, body, cookies: {} })
        const vercelRes = Object.assign(res, {
          status(code: number) {
            res.statusCode = code
            return vercelRes
          },
          json(payload: unknown) {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(payload))
          },
          send(payload: unknown) {
            res.end(payload)
          },
        })

        try {
          const mod = await server.ssrLoadModule(file)
          await mod.default(vercelReq, vercelRes)
        } catch (e) {
          console.error(`[api-dev-server] ${route}:`, e)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Loads *all* .env vars (not just VITE_-prefixed) into process.env, so
  // apiDevServer's dynamically-imported handlers see PDAX_/VAPID_ server keys.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))

  return {
    plugins: [react(), tailwindcss(), apiDevServer()],
  }
})
