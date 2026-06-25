import { test, expect } from '@playwright/test'

test('health endpoint returns ok', async ({ request }) => {
  const res = await request.get('/api/health')
  expect(res.status()).toBe(200)
  const body = await res.json()
  expect(body.ok).toBe(true)
})

test('login page loads', async ({ page }) => {
  await page.goto('/login')
  await expect(page).toHaveTitle(/SmartCommission/i)
  await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
})

test('unauthenticated dashboard redirects to login', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page).toHaveURL(/\/login/)
})
