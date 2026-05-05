import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('game loads with bills and salary', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.getByText(/You earn|Voc\xea ganha/)).toBeVisible()
  await expect(page.locator('button').filter({ hasText: /Netflix|Aluguel|Rent/ })).toBeVisible()
})

test('bill selection updates running total', async ({ page }) => {
  const firstBill = page.locator('[class*="BillCard"]').first()
  await firstBill.click()
  await expect(page.getByText(/Total selected|Total selecionado/)).toBeVisible()
})

test('submit disabled when no bills selected', async ({ page }) => {
  const submitBtn = page.getByRole('button', { name: /Pay Bills|Pagar Contas/ })
  await expect(submitBtn).toBeDisabled()
})

test('language switching works', async ({ page }) => {
  const enBtn = page.getByRole('button', { name: 'EN' })
  await enBtn.click()
  await expect(page.getByText(/You earn/)).toBeVisible()

  const ptBtn = page.getByRole('button', { name: 'PT' })
  await ptBtn.click()
  await expect(page.getByText(/Voc\xea ganha/)).toBeVisible()
})