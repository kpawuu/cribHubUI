import { test, expect } from '@playwright/test'

test.describe('public auth pages', () => {
  test('signup explains tenant-first and post-sign-in roles', async ({ page }) => {
    await page.goto('/auth/signup')
    await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible()
    await expect(page.getByText(/tenant access first/i)).toBeVisible()
    await expect(page.getByText(/after you verify and sign in/i)).toBeVisible()
  })

  test('login page loads', async ({ page }) => {
    await page.goto('/auth/login')
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible()
  })
})
