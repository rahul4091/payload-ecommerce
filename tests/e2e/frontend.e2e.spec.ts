import { test, expect, Page } from '@playwright/test'

test.describe('Frontend', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext()
    page = await context.newPage()
  })

  test('homepage loads with store title', async ({ page }) => {
    await page.goto('http://localhost:3000')

    await expect(page).toHaveTitle(/My Store/)

    const heading = page.locator('h1').first()
    await expect(heading).toBeVisible()
  })

  test('products page is accessible', async ({ page }) => {
    await page.goto('http://localhost:3000/products')
    await expect(page).toHaveURL('http://localhost:3000/products')
    await expect(page.locator('main')).toBeVisible()
  })

  test('admin panel redirects to login when unauthenticated', async ({ page }) => {
    await page.goto('http://localhost:3000/admin')
    await expect(page).toHaveURL(/\/admin\/login/)
  })
})
