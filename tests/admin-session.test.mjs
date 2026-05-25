import { readFile } from "node:fs/promises"
import test from "node:test"
import assert from "node:assert/strict"

test("admin sessions last one month and login page redirects authenticated admins", async () => {
  const authSource = await readFile(new URL("../lib/admin-auth.ts", import.meta.url), "utf8")
  const loginRouteSource = await readFile(new URL("../app/api/admin/login/route.ts", import.meta.url), "utf8")
  const sessionRouteSource = await readFile(new URL("../app/api/admin/session/route.ts", import.meta.url), "utf8")
  const adminPageSource = await readFile(new URL("../app/admin/page.tsx", import.meta.url), "utf8")

  assert.match(authSource, /export const adminSessionMaxAge = 60 \* 60 \* 24 \* 30/)
  assert.match(loginRouteSource, /maxAge: adminSessionMaxAge/)
  assert.match(sessionRouteSource, /hasValidAdminSession/)
  assert.match(sessionRouteSource, /NextResponse\.json\(\{ authenticated: true \}\)/)
  assert.match(adminPageSource, /useEffect/)
  assert.match(adminPageSource, /fetch\(withBasePath\("\/api\/admin\/session"\)/)
  assert.match(adminPageSource, /router\.replace\("\/admin\/applications"\)/)
  assert.match(adminPageSource, /router\.push\("\/admin\/applications"\)/)
})
